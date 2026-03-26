'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormErrorIcon } from '@/components/ui/form-error-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { translateError } from '@/lib/error-messages';
import type {
  CreateGeofenceZoneData,
  GeofenceZone,
} from '../src/api/punch-config.api';
import { Loader2, MapPinned } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

interface GeofenceZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone: GeofenceZone | null;
  defaultRadius: number;
  onSubmit: (data: CreateGeofenceZoneData) => Promise<void>;
  isLoading?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function GeofenceZoneModal({
  isOpen,
  onClose,
  zone,
  defaultRadius,
  onSubmit,
  isLoading,
}: GeofenceZoneModalProps) {
  const isEditing = !!zone;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radiusMeters, setRadiusMeters] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (zone) {
        setName(zone.name);
        setAddress(zone.address ?? '');
        setLatitude(String(zone.latitude));
        setLongitude(String(zone.longitude));
        setRadiusMeters(String(zone.radiusMeters));
        setIsActive(zone.isActive);
      } else {
        setName('');
        setAddress('');
        setLatitude('');
        setLongitude('');
        setRadiusMeters(String(defaultRadius));
        setIsActive(true);
      }
    }
  }, [isOpen, zone, defaultRadius]);

  const canSubmit =
    name.trim().length >= 2 &&
    latitude !== '' &&
    longitude !== '' &&
    radiusMeters !== '' &&
    Number(radiusMeters) > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      await onSubmit({
        name: name.trim(),
        address: address.trim() || null,
        latitude: Number(latitude),
        longitude: Number(longitude),
        radiusMeters: Number(radiusMeters),
        isActive,
      });
      setFieldErrors({});
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('name already') || msg.includes('already exists') || msg.includes('nome')) {
        setFieldErrors(prev => ({ ...prev, name: translateError(msg) }));
      } else {
        toast.error(translateError(msg));
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/10">
              <MapPinned className="h-5 w-5 text-sky-500" />
            </div>
            <DialogTitle>
              {isEditing ? 'Editar Zona' : 'Nova Zona de Geofence'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="zone-name">
              Nome <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="zone-name"
                placeholder="Ex: Sede, Filial Centro, Escritório SP"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
                }}
                aria-invalid={!!fieldErrors.name}
              />
              <FormErrorIcon message={fieldErrors.name} />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="zone-address">Endereço</Label>
            <Input
              id="zone-address"
              placeholder="Rua, número, bairro, cidade"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          {/* Coordinates Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zone-lat">
                Latitude <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="zone-lat"
                type="number"
                step="any"
                placeholder="-23.550520"
                value={latitude}
                onChange={e => setLatitude(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone-lng">
                Longitude <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="zone-lng"
                type="number"
                step="any"
                placeholder="-46.633308"
                value={longitude}
                onChange={e => setLongitude(e.target.value)}
              />
            </div>
          </div>

          {/* Radius */}
          <div className="space-y-2">
            <Label htmlFor="zone-radius">
              Raio (metros) <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="zone-radius"
              type="number"
              min={10}
              max={10000}
              placeholder="200"
              value={radiusMeters}
              onChange={e => setRadiusMeters(e.target.value)}
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Zona Ativa</p>
              <p className="text-xs text-muted-foreground">
                Zonas inativas não são consideradas na validação
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditing ? 'Salvando...' : 'Criando...'}
              </>
            ) : isEditing ? (
              'Salvar'
            ) : (
              'Criar Zona'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
