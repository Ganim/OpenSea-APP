'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/auth-context';
import { useTenant } from '@/contexts/tenant-context';
import { apiConfig } from '@/config/api';

let globalSocket: Socket | null = null;
let refCount = 0;

export function useSocket() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !currentTenant?.id) return;

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) return;

    if (!globalSocket) {
      globalSocket = io(apiConfig.baseURL, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        transports: ['websocket', 'polling'],
      });
    }

    refCount++;
    socketRef.current = globalSocket;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    globalSocket.on('connect', onConnect);
    globalSocket.on('disconnect', onDisconnect);

    if (globalSocket.connected) setIsConnected(true);

    return () => {
      refCount--;
      globalSocket?.off('connect', onConnect);
      globalSocket?.off('disconnect', onDisconnect);

      if (refCount <= 0 && globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        refCount = 0;
      }
    };
  }, [user, currentTenant?.id]);

  const on = useCallback(
    <T = unknown>(event: string, handler: (data: T) => void) => {
      socketRef.current?.on(event, handler as (...args: unknown[]) => void);
      return () => {
        socketRef.current?.off(event, handler as (...args: unknown[]) => void);
      };
    },
    []
  );

  return { isConnected, socket: socketRef.current, on };
}
