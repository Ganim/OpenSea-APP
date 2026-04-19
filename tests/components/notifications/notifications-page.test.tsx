/**
 * Tests for `/notifications` listing page.
 *
 * Hooks (`useNotificationsInfiniteV2`, `useMarkAllReadV2`) are mocked at
 * module level so each test can drive loading / empty / data / paginated
 * states without spinning up the network or React Query.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

const fetchNextPage = vi.fn();
const refetch = vi.fn();
const markAllMutate = vi.fn();

let listMockState: ReturnType<typeof buildListResult> = buildListResult({});

function buildListResult(opts: {
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetching?: boolean;
  isFetchingNextPage?: boolean;
  pages?: Array<{
    notifications: Array<Record<string, unknown>>;
    nextCursor: string | null;
    total: number;
    totalUnread: number;
  }>;
}) {
  return {
    data: opts.pages ? { pages: opts.pages } : undefined,
    isLoading: opts.isLoading ?? false,
    isFetching: opts.isFetching ?? false,
    isFetchingNextPage: opts.isFetchingNextPage ?? false,
    hasNextPage: opts.hasNextPage ?? false,
    fetchNextPage,
    refetch,
  };
}

vi.mock('@/features/notifications/hooks/use-notifications-v2', () => ({
  useNotificationsInfiniteV2: () => listMockState,
  useMarkAllReadV2: () => ({ mutate: markAllMutate, isPending: false }),
  useMarkNotificationReadV2: () => ({ mutate: vi.fn() }),
}));

vi.mock('@/features/notifications/hooks/use-notification-preferences', () => ({
  useResolveNotification: () => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}));

// Minimal IntersectionObserver shim — the page constructs one on mount.
class FakeIO {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IntersectionObserver = FakeIO as any;

import NotificationsPage from '@/app/(dashboard)/(tools)/notifications/page';

afterEach(() => {
  fetchNextPage.mockClear();
  refetch.mockClear();
  markAllMutate.mockClear();
  listMockState = buildListResult({});
});

describe('NotificationsPage', () => {
  it('renders skeletons while loading', () => {
    listMockState = buildListResult({ isLoading: true });
    const { container } = render(<NotificationsPage />);
    // Skeletons live in the page's loading branch — at least one [data-slot="skeleton"]
    // element should be present.
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders empty state when there are zero notifications', () => {
    listMockState = buildListResult({
      pages: [
        { notifications: [], nextCursor: null, total: 0, totalUnread: 0 },
      ],
    });
    render(<NotificationsPage />);
    expect(screen.getByText(/Nenhuma notificação/i)).toBeInTheDocument();
  });

  it('renders notification rows when data is present', () => {
    listMockState = buildListResult({
      pages: [
        {
          notifications: [
            {
              id: 'n-1',
              title: 'First',
              message: 'msg-1',
              kind: 'INFORMATIONAL',
              priority: 'NORMAL',
              state: null,
              actionUrl: null,
              actions: null,
              metadata: null,
              isRead: false,
              progress: null,
              progressTotal: null,
              expiresAt: null,
              createdAt: new Date().toISOString(),
            },
            {
              id: 'n-2',
              title: 'Second',
              message: 'msg-2',
              kind: 'INFORMATIONAL',
              priority: 'NORMAL',
              state: null,
              actionUrl: null,
              actions: null,
              metadata: null,
              isRead: true,
              progress: null,
              progressTotal: null,
              expiresAt: null,
              createdAt: new Date().toISOString(),
            },
          ],
          nextCursor: null,
          total: 2,
          totalUnread: 1,
        },
      ],
    });
    render(<NotificationsPage />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    // Footer says "Você chegou ao fim." when hasNextPage is false.
    expect(screen.getByText(/Você chegou ao fim/i)).toBeInTheDocument();
  });

  it('shows "Marcar todas como lidas" only when there are unread notifications', () => {
    listMockState = buildListResult({
      pages: [
        {
          notifications: [
            {
              id: 'n-1',
              title: 'unread',
              message: 'm',
              kind: 'INFORMATIONAL',
              priority: 'NORMAL',
              state: null,
              actionUrl: null,
              actions: null,
              metadata: null,
              isRead: false,
              progress: null,
              progressTotal: null,
              expiresAt: null,
              createdAt: new Date().toISOString(),
            },
          ],
          nextCursor: null,
          total: 1,
          totalUnread: 1,
        },
      ],
    });
    render(<NotificationsPage />);
    const btn = screen.getByRole('button', {
      name: /marcar todas como lidas/i,
    });
    fireEvent.click(btn);
    expect(markAllMutate).toHaveBeenCalledTimes(1);
  });

  it('calls refetch when the Atualizar button is clicked', () => {
    listMockState = buildListResult({
      pages: [
        { notifications: [], nextCursor: null, total: 0, totalUnread: 0 },
      ],
    });
    render(<NotificationsPage />);
    fireEvent.click(screen.getByRole('button', { name: /atualizar/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders the infinite-scroll sentinel when hasNextPage is true', () => {
    listMockState = buildListResult({
      hasNextPage: true,
      pages: [
        {
          notifications: [
            {
              id: 'n-1',
              title: 'first',
              message: 'm',
              kind: 'INFORMATIONAL',
              priority: 'NORMAL',
              state: null,
              actionUrl: null,
              actions: null,
              metadata: null,
              isRead: false,
              progress: null,
              progressTotal: null,
              expiresAt: null,
              createdAt: new Date().toISOString(),
            },
          ],
          nextCursor: 'next-1',
          total: 100,
          totalUnread: 50,
        },
      ],
    });
    const { container } = render(<NotificationsPage />);
    // No "Você chegou ao fim." while there's still a next page.
    expect(screen.queryByText(/Você chegou ao fim/i)).not.toBeInTheDocument();
    // IntersectionObserver was wired (page mounts the observer on the sentinel).
    const sentinel = container.querySelector(
      'div.flex.items-center.justify-center.py-4'
    );
    expect(sentinel).not.toBeNull();
  });
});
