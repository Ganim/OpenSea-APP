'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Landmark } from 'lucide-react';
import { useState } from 'react';
import { bankConnectionsService } from '@/services/finance';

interface PluggyConnectProps {
  onSuccess: (itemId: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    PluggyConnect?: {
      init: (options: {
        connectToken: string;
        onSuccess: (data: { item: { id: string } }) => void;
        onError: (error: { message: string }) => void;
        onClose: () => void;
      }) => { open: () => void; close: () => void };
    };
  }
}

export function PluggyConnect({
  onSuccess,
  onError,
  onClose,
}: PluggyConnectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const pluggyRef = useRef<{ open: () => void; close: () => void } | null>(
    null
  );

  // Load Pluggy Connect SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && window.PluggyConnect) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.pluggy.ai/connect/v2/pluggy-connect.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => onError?.('Falha ao carregar widget do Pluggy');
    document.head.appendChild(script);

    return () => {
      // Don't remove the script as it might be used by other instances
    };
  }, [onError]);

  const handleConnect = useCallback(async () => {
    if (!scriptLoaded || !window.PluggyConnect) {
      onError?.('Widget do Pluggy ainda não carregou');
      return;
    }

    setIsLoading(true);

    try {
      const { accessToken } = await bankConnectionsService.getConnectToken();

      pluggyRef.current = window.PluggyConnect.init({
        connectToken: accessToken,
        onSuccess: data => {
          onSuccess(data.item.id);
        },
        onError: error => {
          onError?.(error.message || 'Erro na conexão bancária');
        },
        onClose: () => {
          onClose?.();
        },
      });

      pluggyRef.current.open();
    } catch {
      onError?.('Erro ao obter token de conexão');
    } finally {
      setIsLoading(false);
    }
  }, [scriptLoaded, onSuccess, onError, onClose]);

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading || !scriptLoaded}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Landmark className="h-4 w-4" />
      )}
      Conectar Banco
    </Button>
  );
}
