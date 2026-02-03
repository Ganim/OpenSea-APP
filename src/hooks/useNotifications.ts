/**
 * useNotifications Hook
 * Hook para gerenciar notificações do usuário
 */

import type { Notification } from '@/types/';
import { useCallback, useEffect, useState } from 'react';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  refresh: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Estoque baixo',
          message: 'Produto XYZ-123 com apenas 5 unidades',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false,
          type: 'warning',
          icon: 'AlertTriangle',
        },
        {
          id: '2',
          title: 'Novo pedido',
          message: 'Pedido #12345 aguardando aprovação',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          read: false,
          type: 'info',
          icon: 'ShoppingBag',
        },
        {
          id: '3',
          title: 'Fornecedor confirmado',
          message: 'ABC Corp confirmou entrega',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: true,
          type: 'success',
          icon: 'CheckCircle2',
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}
