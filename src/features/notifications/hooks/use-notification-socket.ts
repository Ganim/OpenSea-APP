'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSocket } from '@/hooks/use-socket';

/**
 * Attaches real-time listeners to the shared Socket.IO connection.
 * On every notification:* event it invalidates the React Query caches
 * so the UI re-renders with fresh data.
 */
export function useNotificationSocket() {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification:new', invalidate);
    socket.on('notification:updated', invalidate);
    socket.on('notification:resolved', invalidate);
    socket.on('notification:cancelled', invalidate);
    socket.on('notification:progress', invalidate);

    return () => {
      socket.off('notification:new', invalidate);
      socket.off('notification:updated', invalidate);
      socket.off('notification:resolved', invalidate);
      socket.off('notification:cancelled', invalidate);
      socket.off('notification:progress', invalidate);
    };
  }, [socket, isConnected, queryClient]);
}
