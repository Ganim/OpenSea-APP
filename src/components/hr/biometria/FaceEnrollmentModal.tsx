'use client';

/**
 * OpenSea OS - Face Enrollment Modal
 *
 * Admin-assisted enrollment flow (D-05, D-07). Walks through:
 *   1. LGPD consent — checkbox must be marked before capture starts.
 *   2. 3–5 guided captures: frontal → direita → esquerda → cima → baixo.
 *   3. Submit → POST embeddings + consentTextHash to plan 05-03 endpoint.
 *
 * No raw image bytes are sent to the server; only the 128-d embedding
 * per photo. The modal also never renders the raw video frame after a
 * photo is captured — only a silhouette tile (EnrollmentPhotoSlot).
 *
 * Capture loop:
 *   - face-api.js pipeline runs on each requestAnimationFrame tick.
 *   - Face must remain stable (single face detected with score ≥ 0.5)
 *     for {@link STABLE_MS} continuous ms before auto-capture fires.
 *   - Multi-face and no-face states render inline Alerts and block capture.
 */

import {
  computeFaceDescriptor,
  type DescriptorResult,
} from '@/lib/face-api/compute-descriptor';
import { ensureModelsLoaded } from '@/lib/face-api/load-models';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useCreateFaceEnrollments } from '@/hooks/hr/use-face-enrollments';
import { cn } from '@/lib/utils';
import { AlertTriangle, Camera, Loader2, ShieldCheck, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EnrollmentPhotoSlot } from './EnrollmentPhotoSlot';

/* -------------------------------------------------------------------------- */
/* Copy — locked by UI-SPEC §Copywriting §Biometria tab                       */
/* -------------------------------------------------------------------------- */

const STEP_INSTRUCTIONS: readonly string[] = [
  'Olhe para frente',
  'Gire levemente para a direita',
  'Gire levemente para a esquerda',
  'Incline levemente para cima',
  'Incline levemente para baixo',
];

const MIN_PHOTOS = 3;
const MAX_PHOTOS = STEP_INSTRUCTIONS.length; // 5

/** Consecutive ms with exactly one stable face before we auto-capture. */
const STABLE_MS = 500;
/** Target frame cadence for the capture loop. */
const FRAME_INTERVAL_MS = 200;

/**
 * Locked consent text — MUST match the text the backend hashes for the
 * consentTextHash check (plan 05-03 §Consent). `{tenantContactEmail}` is
 * a LITERAL placeholder; the backend does the same substitution before
 * recomputing the hash. Any change here requires a coordinated backend
 * change to Plan 05-03's consent term constant.
 */
const CONSENT_TEXT_TEMPLATE =
  'Declaro que autorizo o OpenSea a capturar, processar e armazenar dados biométricos faciais (vetor matemático extraído da imagem) exclusivamente para fins de registro de ponto. Os dados permanecem criptografados no banco, não são compartilhados com terceiros, e podem ser revogados a qualquer momento mediante solicitação a {tenantContactEmail}.';

/* -------------------------------------------------------------------------- */

export interface FaceEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  /**
   * Optional tenant-provided contact email used to personalize the consent
   * text shown to the admin. The hashed string is the raw template with
   * `{tenantContactEmail}` left as a literal placeholder — both sides of
   * the consent contract agree on that.
   */
  tenantContactEmail?: string;
}

/**
 * Compute SHA-256 of a UTF-8 string using Web Crypto, returning a
 * lowercase hex digest (64 chars).
 */
async function sha256Hex(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

type CaptureStatus =
  | { kind: 'idle' }
  | { kind: 'searching' } // no face yet
  | { kind: 'stabilizing'; since: number } // single face, accumulating ms
  | { kind: 'captured' } // just captured this step
  | { kind: 'multiple' } // > 1 face
  | { kind: 'error'; message: string };

export function FaceEnrollmentModal({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  tenantContactEmail,
}: FaceEnrollmentModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const loopRunningRef = useRef(false);

  const [consentChecked, setConsentChecked] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [captureStarted, setCaptureStarted] = useState(false);
  const [embeddings, setEmbeddings] = useState<number[][]>([]);
  const [captureStatus, setCaptureStatus] = useState<CaptureStatus>({
    kind: 'idle',
  });

  const createMutation = useCreateFaceEnrollments(employeeId);

  const currentStep = embeddings.length; // 0..4 while capturing; 5 when done
  const canSubmitShortcut =
    currentStep >= MIN_PHOTOS && currentStep < MAX_PHOTOS;
  const allPhotosCaptured = currentStep >= MAX_PHOTOS;

  /* ---------- Resolve displayed consent text ---------- */

  const displayedConsentText = useMemo(() => {
    // Display-only substitution. Hash always uses the literal template.
    if (!tenantContactEmail) return CONSENT_TEXT_TEMPLATE;
    return CONSENT_TEXT_TEMPLATE.replace(
      '{tenantContactEmail}',
      tenantContactEmail
    );
  }, [tenantContactEmail]);

  /* ---------- Lifecycle: load models on mount (modal open) ---------- */

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setModelsReady(false);
    ensureModelsLoaded()
      .then(() => {
        if (!cancelled) setModelsReady(true);
      })
      .catch(err => {
        if (!cancelled) {
          setCameraError(
            err instanceof Error
              ? `Falha ao carregar os modelos: ${err.message}`
              : 'Falha ao carregar os modelos de reconhecimento facial.'
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  /* ---------- Reset state when modal closes ---------- */

  const hardReset = useCallback(() => {
    setConsentChecked(false);
    setCaptureStarted(false);
    setEmbeddings([]);
    setCaptureStatus({ kind: 'idle' });
    setCameraError(null);
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      hardReset();
    }
  }, [isOpen, hardReset]);

  /* ---------- Camera start / stop ---------- */

  const stopCamera = useCallback(() => {
    loopRunningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      if (
        message.includes('NotAllowedError') ||
        message.includes('Permission')
      ) {
        setCameraError(
          'Permissão de câmera negada. Habilite a câmera nas configurações do navegador e tente novamente.'
        );
      } else {
        setCameraError('Não foi possível acessar a câmera.');
      }
    }
  }, []);

  /* ---------- Capture loop ---------- */

  const runCaptureLoop = useCallback(() => {
    if (loopRunningRef.current) return;
    loopRunningRef.current = true;

    let lastTickAt = 0;
    let busy = false;

    const tick = async (now: number) => {
      if (!loopRunningRef.current) return;
      if (now - lastTickAt < FRAME_INTERVAL_MS || busy) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastTickAt = now;
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      busy = true;
      try {
        const result = await computeFaceDescriptor(video);

        if (!loopRunningRef.current) return;

        if (result === null) {
          setCaptureStatus({ kind: 'searching' });
        } else if ('multipleFaces' in result) {
          setCaptureStatus({ kind: 'multiple' });
        } else {
          // Single face detected. Accumulate stability time.
          setCaptureStatus(prev => {
            if (prev.kind === 'stabilizing') {
              const elapsed = Date.now() - prev.since;
              if (elapsed >= STABLE_MS) {
                // Capture this embedding.
                commitEmbedding(result);
                return { kind: 'captured' };
              }
              return prev;
            }
            return { kind: 'stabilizing', since: Date.now() };
          });
        }
      } catch {
        // Swallow per-frame transient errors; the loop keeps running.
      } finally {
        busy = false;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const commitEmbedding = (result: DescriptorResult) => {
      setEmbeddings(prev => {
        if (prev.length >= MAX_PHOTOS) return prev;
        return [...prev, result.embedding];
      });
      // After committing, force a brief pause before the next stabilizing
      // window so the user can change pose. We transition out of captured
      // back to searching after a short delay via useEffect below.
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // After a successful capture, wait a moment then re-enter searching.
  useEffect(() => {
    if (captureStatus.kind !== 'captured') return;
    const id = setTimeout(() => {
      setCaptureStatus({ kind: 'searching' });
    }, 700);
    return () => clearTimeout(id);
  }, [captureStatus.kind]);

  /* ---------- Start capture: triggered by user after consent ---------- */

  const handleStartCapture = useCallback(async () => {
    if (!consentChecked) return;
    setCaptureStarted(true);
    await startCamera();
    runCaptureLoop();
  }, [consentChecked, startCamera, runCaptureLoop]);

  /* ---------- Submit ---------- */

  const handleSubmit = useCallback(async () => {
    if (embeddings.length < MIN_PHOTOS) return;
    try {
      const consentTextHash = await sha256Hex(CONSENT_TEXT_TEMPLATE);
      await createMutation.mutateAsync({
        embeddings,
        consentTextHash,
      });
      stopCamera();
      onClose();
    } catch {
      // Toast handled by hook onError — leave modal open so admin can retry.
    }
  }, [embeddings, createMutation, stopCamera, onClose]);

  /* ---------- Retry current shot ---------- */

  const handleRetryShot = useCallback(() => {
    setEmbeddings(prev => prev.slice(0, -1));
    setCaptureStatus({ kind: 'searching' });
  }, []);

  /* ---------- Dialog close (abort) ---------- */

  const handleCancel = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // Always stop camera when component unmounts or modal closes.
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, stopCamera]);

  /* ---------- Render ---------- */

  const progressValue =
    (Math.min(embeddings.length, MAX_PHOTOS) / MAX_PHOTOS) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cadastrar biometria facial</DialogTitle>
          <DialogDescription>
            Cadastrando biometria de <strong>{employeeName}</strong>. Entre 3 e
            5 fotos serão capturadas em ângulos leves.
          </DialogDescription>
        </DialogHeader>

        {!captureStarted ? (
          /* ---------- Step 1: Consent ---------- */
          <div className="space-y-4" data-testid="enrollment-consent-step">
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-4">
              <ShieldCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  Termo de consentimento (LGPD)
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {displayedConsentText}
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/40 cursor-pointer">
              <Checkbox
                checked={consentChecked}
                onCheckedChange={checked => setConsentChecked(checked === true)}
                aria-label="Li e concordo com o Termo de Uso de Biometria"
                data-testid="enrollment-consent-checkbox"
              />
              <span className="text-sm">
                Li e concordo com o Termo de Uso de Biometria
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                onClick={handleStartCapture}
                disabled={!consentChecked || !modelsReady}
                data-testid="enrollment-start-capture"
              >
                {!modelsReady ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparando…
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Iniciar captura
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* ---------- Step 2..6: Capture ---------- */
          <div className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {allPhotosCaptured
                    ? 'Todas as fotos capturadas'
                    : `Foto ${currentStep + 1} de ${MAX_PHOTOS}`}
                </span>
                <span className="text-muted-foreground">
                  {embeddings.length}/{MAX_PHOTOS}
                </span>
              </div>
              <Progress value={progressValue} />
            </div>

            {/* Instruction */}
            {!allPhotosCaptured && (
              <p className="text-center text-base font-medium">
                {STEP_INSTRUCTIONS[currentStep]}
              </p>
            )}

            {/* Camera + overlay */}
            <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl bg-slate-900">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  'h-full w-full -scale-x-100 object-cover',
                  !cameraReady && 'invisible'
                )}
              />

              {/* Silhouette overlay — circular frame guide (280px) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <div className="h-[70%] w-[54%] rounded-[50%] border-2 border-white/40" />
              </div>

              {!cameraReady && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-200">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="mt-2 text-sm">Preparando câmera…</p>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{cameraError}</AlertDescription>
                  </Alert>
                </div>
              )}
            </div>

            {/* Inline warnings */}
            {captureStatus.kind === 'searching' && !allPhotosCaptured && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Nenhuma face detectada. Ajuste a câmera ou a iluminação.
                </AlertDescription>
              </Alert>
            )}
            {captureStatus.kind === 'multiple' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Mais de uma pessoa no enquadramento. Deixe apenas o
                  funcionário.
                </AlertDescription>
              </Alert>
            )}

            {/* Slots row */}
            <div className="flex flex-wrap justify-center gap-3">
              {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
                <EnrollmentPhotoSlot
                  key={i}
                  index={i + 1}
                  state={
                    i < embeddings.length
                      ? 'captured'
                      : i === embeddings.length && !allPhotosCaptured
                        ? 'active'
                        : 'empty'
                  }
                />
              ))}
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              {embeddings.length > 0 && !allPhotosCaptured && (
                <Button
                  variant="ghost"
                  onClick={handleRetryShot}
                  disabled={createMutation.isPending}
                >
                  Refazer esta foto
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={createMutation.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              {canSubmitShortcut && (
                <Button
                  variant="secondary"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  data-testid="enrollment-submit-shortcut"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Concluir com {embeddings.length} fotos
                </Button>
              )}
              {allPhotosCaptured && (
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  data-testid="enrollment-submit"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Salvar biometria
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
