'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin, MapPinOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationDisplayProps {
  onLocationReady: (lat: number, lng: number) => void;
}

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

const REFRESH_INTERVAL = 30_000;

export function LocationDisplay({ onLocationReady }: LocationDisplayProps) {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
  });

  const onLocationReadyRef = useRef(onLocationReady);
  onLocationReadyRef.current = onLocationReady;

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocalização não suportada neste navegador.',
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          latitude,
          longitude,
          accuracy,
          loading: false,
          error: null,
        });
        onLocationReadyRef.current(latitude, longitude);
      },
      err => {
        let message = 'Erro ao obter localização.';
        if (err.code === err.PERMISSION_DENIED) {
          message =
            'Permissão de localização negada. Habilite nas configurações.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Localização indisponível no momento.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Tempo limite para obter localização excedido.';
        }
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: message,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
    const interval = setInterval(fetchLocation, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLocation]);

  if (location.error) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 px-4 py-3">
        <MapPinOff className="size-5 text-rose-500 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
            Localização indisponível
          </p>
          <p className="text-xs text-rose-600/70 dark:text-rose-400/70 truncate">
            {location.error}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLocation}
          className="ml-auto text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline shrink-0"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (location.loading && location.latitude === null) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3">
        <Loader2 className="size-5 text-slate-400 animate-spin shrink-0" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Obtendo localização...
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-4 py-3',
        'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
      )}
    >
      <MapPin className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          Localização capturada
        </p>
        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-mono tabular-nums">
          {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
          {location.accuracy && (
            <span className="ml-1.5">
              (&plusmn;{Math.round(location.accuracy)}m)
            </span>
          )}
        </p>
      </div>
      {location.loading && (
        <Loader2 className="size-4 text-emerald-500 animate-spin ml-auto shrink-0" />
      )}
    </div>
  );
}
