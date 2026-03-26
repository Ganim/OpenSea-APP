'use client';

import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StepWizardDialog,
  type WizardStep,
} from '@/components/ui/step-wizard-dialog';
import { Button } from '@/components/ui/button';
import { translateError } from '@/lib/error-messages';
import type { GeofenceZone } from '@/types/hr';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: Partial<GeofenceZone>) => Promise<void>;
}

export function CreateModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
}: CreateModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radiusMeters, setRadiusMeters] = useState('200');
  const [address, setAddress] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [wasOpen, setWasOpen] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset when modal opens
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setCurrentStep(1);
    setName('');
    setLatitude('');
    setLongitude('');
    setRadiusMeters('200');
    setAddress('');
    setFieldErrors({});
  }
  if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  const handleSubmit = async () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radius = parseInt(radiusMeters, 10);

    // Validate
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Nome é obrigatório';
    if (isNaN(lat) || lat < -90 || lat > 90)
      errors.latitude = 'Latitude inválida (-90 a 90)';
    if (isNaN(lng) || lng < -180 || lng > 180)
      errors.longitude = 'Longitude inválida (-180 a 180)';
    if (isNaN(radius) || radius < 10 || radius > 10000)
      errors.radiusMeters = 'Raio deve ser entre 10 e 10.000 metros';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        latitude: lat,
        longitude: lng,
        radiusMeters: radius,
        isActive: true,
        address: address.trim() || null,
      });
      handleClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('name') || msg.includes('nome')) {
        setFieldErrors(prev => ({ ...prev, name: translateError(msg) }));
      } else {
        toast.error(translateError(msg));
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Focus name input when entering step 2
  useEffect(() => {
    if (currentStep === 2 && isOpen) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen]);

  const isStep1Valid = !!name.trim();
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const isStep2Valid =
    !isNaN(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    !isNaN(lng) &&
    lng >= -180 &&
    lng <= 180;

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Identificação da Zona',
        description: 'Defina o nome e endereço da zona de geofencing',
        icon: <MapPin className="h-16 w-16 text-teal-500/60" />,
        isValid: isStep1Valid,
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zone-name">
                Nome da Zona <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  ref={nameInputRef}
                  id="zone-name"
                  placeholder="Ex: Sede Principal, Filial Centro"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (fieldErrors.name)
                      setFieldErrors(prev => ({ ...prev, name: '' }));
                  }}
                  aria-invalid={!!fieldErrors.name}
                />
                <FormErrorIcon message={fieldErrors.name || ''} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone-address">Endereço (opcional)</Label>
              <Input
                id="zone-address"
                placeholder="Ex: Rua das Flores, 123 - Centro"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
          </div>
        ),
        footer: (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button disabled={!isStep1Valid} onClick={() => setCurrentStep(2)}>
              Próximo
            </Button>
          </div>
        ),
      },
      {
        title: 'Coordenadas e Raio',
        description: 'Defina a localização e o raio da zona',
        icon: <Navigation className="h-16 w-16 text-teal-500/60" />,
        isValid: isStep2Valid && !isSubmitting,
        onBack: () => setCurrentStep(1),
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="zone-latitude">
                  Latitude <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="zone-latitude"
                    type="number"
                    step="any"
                    placeholder="Ex: -23.5505"
                    value={latitude}
                    onChange={e => {
                      setLatitude(e.target.value);
                      if (fieldErrors.latitude)
                        setFieldErrors(prev => ({ ...prev, latitude: '' }));
                    }}
                    aria-invalid={!!fieldErrors.latitude}
                  />
                  <FormErrorIcon message={fieldErrors.latitude || ''} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone-longitude">
                  Longitude <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="zone-longitude"
                    type="number"
                    step="any"
                    placeholder="Ex: -46.6333"
                    value={longitude}
                    onChange={e => {
                      setLongitude(e.target.value);
                      if (fieldErrors.longitude)
                        setFieldErrors(prev => ({ ...prev, longitude: '' }));
                    }}
                    aria-invalid={!!fieldErrors.longitude}
                  />
                  <FormErrorIcon message={fieldErrors.longitude || ''} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone-radius">Raio (metros)</Label>
              <div className="relative">
                <Input
                  id="zone-radius"
                  type="number"
                  min={10}
                  max={10000}
                  placeholder="Ex: 200"
                  value={radiusMeters}
                  onChange={e => {
                    setRadiusMeters(e.target.value);
                    if (fieldErrors.radiusMeters)
                      setFieldErrors(prev => ({
                        ...prev,
                        radiusMeters: '',
                      }));
                  }}
                  aria-invalid={!!fieldErrors.radiusMeters}
                />
                <FormErrorIcon message={fieldErrors.radiusMeters || ''} />
              </div>
              <p className="text-xs text-muted-foreground">
                Mínimo 10m, máximo 10.000m. Padrão: 200m.
              </p>
            </div>
          </div>
        ),
        footer: (
          <Button
            type="button"
            disabled={isSubmitting || !isStep2Valid}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Zona'
            )}
          </Button>
        ),
      },
    ],
    [
      name,
      address,
      latitude,
      longitude,
      radiusMeters,
      isSubmitting,
      fieldErrors,
      isStep1Valid,
      isStep2Valid,
    ]
  );

  return (
    <StepWizardDialog
      open={isOpen}
      onOpenChange={open => !open && handleClose()}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onClose={handleClose}
    />
  );
}
