'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelfieCaptureProps {
  onCapture: (photoData: string) => void;
  captured?: string;
  onRetake: () => void;
  disabled?: boolean;
}

export function SelfieCapture({
  onCapture,
  captured,
  onRetake,
  disabled = false,
}: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
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
        setIsStreaming(true);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro desconhecido';
      if (
        message.includes('NotAllowedError') ||
        message.includes('Permission')
      ) {
        setError(
          'Permissão de câmera negada. Habilite nas configurações do navegador.'
        );
      } else {
        setError('Não foi possível acessar a câmera frontal.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    if (!captured && !disabled) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [captured, disabled, startCamera, stopCamera]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the image (selfie mode)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(photoData);
    stopCamera();
  }, [onCapture, stopCamera]);

  const handleRetake = useCallback(() => {
    onRetake();
    startCamera();
  }, [onRetake, startCamera]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 aspect-[4/3] p-6 text-center">
        <User className="size-12 text-slate-400 mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
        <button
          type="button"
          onClick={startCamera}
          className="mt-3 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (captured) {
    return (
      <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
        <img
          src={captured}
          alt="Foto capturada"
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={handleRetake}
          disabled={disabled}
          className={cn(
            'absolute bottom-3 right-3 flex items-center gap-2 rounded-xl px-3 py-2',
            'bg-black/60 text-white text-sm font-medium backdrop-blur-sm',
            'active:bg-black/80 transition-colors',
            disabled && 'opacity-50 pointer-events-none'
          )}
        >
          <RefreshCw className="size-4" />
          Recapturar
        </button>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          'w-full h-full object-cover scale-x-[-1]',
          !isStreaming && 'invisible'
        )}
      />

      {!isStreaming && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="size-10 rounded-full border-2 border-slate-500 border-t-violet-400 animate-spin" />
          <p className="mt-3 text-sm text-slate-400">Iniciando câmera...</p>
        </div>
      )}

      {isStreaming && (
        <button
          type="button"
          onClick={handleCapture}
          disabled={disabled}
          className={cn(
            'absolute bottom-4 left-1/2 -translate-x-1/2',
            'flex items-center gap-2 rounded-xl px-5 py-2.5',
            'bg-violet-600 text-white font-semibold text-sm shadow-lg',
            'active:bg-violet-700 transition-colors',
            disabled && 'opacity-50 pointer-events-none'
          )}
        >
          <Camera className="size-4" />
          Capturar
        </button>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
