'use client';

import { useNotificationSocket } from '../hooks/use-notification-socket';

/**
 * Mount once per authenticated session. Attaches socket listeners that
 * invalidate the notifications React Query cache when events arrive.
 * Renders nothing.
 */
export function NotificationSocketListener() {
  useNotificationSocket();
  return null;
}
