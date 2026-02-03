/**
 * Notifications Panel
 * Painel de notificações com dropdown
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  DollarSign,
  Package,
  ShoppingCart,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: 'sale' | 'product' | 'customer' | 'payment';
}

const iconMap = {
  sale: ShoppingCart,
  product: Package,
  customer: Users,
  payment: DollarSign,
};

const colorMap = {
  info: 'from-blue-500 to-blue-600',
  success: 'from-green-500 to-green-600',
  warning: 'from-orange-500 to-orange-600',
  error: 'from-red-500 to-red-600',
};

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Nova venda realizada',
      message: 'Pedido #12345 de João Silva - R$ 1.250,00',
      time: '5 min atrás',
      read: false,
      icon: 'sale',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Estoque baixo',
      message: 'Produto XYZ-123 com apenas 5 unidades',
      time: '15 min atrás',
      read: false,
      icon: 'product',
    },
    {
      id: '3',
      type: 'success',
      title: 'Pagamento confirmado',
      message: 'Pedido #12344 - R$ 850,00',
      time: '1 hora atrás',
      read: true,
      icon: 'payment',
    },
    {
      id: '4',
      type: 'info',
      title: 'Novo cliente cadastrado',
      message: 'Maria Santos se cadastrou no sistema',
      time: '2 horas atrás',
      read: true,
      icon: 'customer',
    },
    {
      id: '5',
      type: 'success',
      title: 'Produto atualizado',
      message: 'Preço do item ABC-456 foi atualizado',
      time: '3 horas atrás',
      read: true,
      icon: 'product',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={22}
        className="w-96 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10 p-0"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <DropdownMenuLabel className="p-0 text-lg font-bold">
              Notificações
            </DropdownMenuLabel>
            {unreadCount > 0 && (
              <Badge variant="default" className="bg-red-500 text-white">
                {unreadCount} nova{unreadCount !== 1 && 's'}
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-7 text-xs"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Marcar todas como lidas
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-7 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Limpar tudo
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Nenhuma notificação
              </p>
              <p className="text-xs text-gray-600 dark:text-white/60 text-center">
                Você está em dia! Não há notificações no momento.
              </p>
            </div>
          ) : (
            <div className="p-2">
              <AnimatePresence>
                {notifications.map((notification, index) => {
                  const Icon = iconMap[notification.icon];
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <DropdownMenuItem
                        className={`p-3 mb-2 cursor-pointer rounded-lg transition-colors ${
                          !notification.read
                            ? 'bg-blue-50 dark:bg-blue-500/10'
                            : 'hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                        onSelect={e => e.preventDefault()}
                      >
                        <div className="flex gap-3 w-full">
                          {/* Icon */}
                          <div
                            className={`w-10 h-10 rounded-xl bg-linear-to-br ${colorMap[notification.type]} flex items-center justify-center shrink-0`}
                          >
                            <Icon className="w-5 h-5 text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-white/60 mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-white/40">
                                {notification.time}
                              </span>
                              <div className="flex gap-1">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                  className="h-6 px-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm font-medium"
              >
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
