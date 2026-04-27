/**
 * Location Display Component (Phase 9 Plan 09-03)
 *
 * Shows current location + accuracy + mock GPS detection status.
 * Renders during punch flow; calls detectMockGps after geolocation success.
 *
 * Visual states:
 * - Loading: spinner + "Obtendo localização..."
 * - Success: lat/lng + accuracy (m) + mock detection badge
 * - Error: "Localização não disponível" + manual punch CTA
 */

'use client';

import { useEffect, useState } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { detectMockGps } from '@/app/punch/utils/detect-mock-gps';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface LocationDisplayProps {
  onLocationDetected?: (location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    suspectMock: boolean;
  }) => void;
  onError?: (error: Error) => void;
}

export function LocationDisplay({
  onLocationDetected,
  onError,
}: LocationDisplayProps) {
  const [state, setState] = useState<
    'loading' | 'success' | 'error' | 'mock-detected'
  >('loading');
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [suspectMock, setSuspectMock] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );

        if (!isMounted) return;

        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setLocation(loc);

        // Check for mock GPS
        const isMock = await detectMockGps();
        if (!isMounted) return;

        setSuspectMock(isMock);
        setState(isMock ? 'mock-detected' : 'success');

        onLocationDetected?.({
          ...loc,
          suspectMock: isMock,
        });
      } catch (err) {
        if (!isMounted) return;

        setState('error');
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error);
      }
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, [onLocationDetected, onError]);

  if (state === 'loading') {
    return (
      <Card className="p-4 bg-white/5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin h-4 w-4">⟳</div>
          <span>Obtendo localização...</span>
        </div>
      </Card>
    );
  }

  if (state === 'error') {
    return (
      <Card className="p-4 bg-rose-50 dark:bg-rose-500/8 border border-rose-200 dark:border-rose-500/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-rose-900 dark:text-rose-300">
              Localização não disponível
            </p>
            <p className="text-rose-700 dark:text-rose-400 text-xs mt-1">
              Ative o GPS e tente novamente
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!location) {
    return null;
  }

  return (
    <Card
      className={`p-4 ${
        suspectMock
          ? 'bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/20'
          : 'bg-white/5'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <MapPin
            className={`h-4 w-4 mt-0.5 ${
              suspectMock
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-foreground/60'
            }`}
          />
          <div>
            <p className="text-xs text-muted-foreground">Localização</p>
            <p className="text-sm font-mono">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Precisão: ±{location.accuracy.toFixed(1)}m
            </p>
          </div>
        </div>
        {suspectMock && (
          <Badge variant="destructive" className="ml-auto">
            GPS Suspeito
          </Badge>
        )}
      </div>
    </Card>
  );
}
