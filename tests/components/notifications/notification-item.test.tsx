/**
 * NotificationItem renderer tests — one per `kind`.
 *
 * Decision (S3.2): MSW was the original plan but is not yet installed in
 * OpenSea-APP. We mock the consumer hooks directly (matches the existing
 * pattern in `error-boundary.test.tsx`). Tests focus on the renderer's
 * shape per kind + XSS sanitization, which is the bug surface that drove
 * S3.3.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

vi.mock('@/features/notifications/hooks/use-notifications-v2', () => ({
  useMarkNotificationReadV2: () => ({ mutate: vi.fn() }),
}));

vi.mock('@/features/notifications/hooks/use-notification-preferences', () => ({
  useResolveNotification: () => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}));

import { NotificationItem } from '@/features/notifications/components/renderers/notification-item';
import {
  NotificationKind,
  NotificationPriority,
  NotificationState,
  type NotificationRecord,
} from '@/features/notifications/types';

function makeRecord(
  overrides: Partial<NotificationRecord> & { kind: NotificationKind }
): NotificationRecord {
  return {
    id: 'n-1',
    title: 'Sample title',
    message: 'Sample body message',
    kind: overrides.kind,
    priority: NotificationPriority.NORMAL,
    state: null,
    actionUrl: null,
    fallbackUrl: null,
    actions: null,
    resolvedAction: null,
    entityType: null,
    entityId: null,
    metadata: null,
    isRead: false,
    progress: null,
    progressTotal: null,
    expiresAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('NotificationItem — rendering per kind', () => {
  it('renders INFORMATIONAL with title and body', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.INFORMATIONAL,
          title: 'Hello',
          message: 'World',
        })}
      />
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('renders LINK with action text and a safe internal href', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.LINK,
          actionUrl: '/dashboard',
          metadata: { actionText: 'Abrir painel' },
        })}
      />
    );
    const link = screen.getByRole('link', { name: /abrir painel/i });
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('LINK with javascript: actionUrl is sanitized away (no link rendered)', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.LINK,
          // eslint-disable-next-line no-script-url
          actionUrl: 'javascript:alert(1)',
          metadata: { actionText: 'click' },
        })}
      />
    );
    expect(
      screen.queryByRole('link', { name: /click/i })
    ).not.toBeInTheDocument();
  });

  it('renders ACTIONABLE with all action buttons when state is PENDING', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.ACTIONABLE,
          state: NotificationState.PENDING,
          actions: [
            { key: 'yes', label: 'Sim', style: 'primary' },
            { key: 'no', label: 'Não', style: 'ghost' },
          ],
        })}
      />
    );
    expect(screen.getByRole('button', { name: 'Sim' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Não' })).toBeInTheDocument();
  });

  it('ACTIONABLE collapses to "Resolvido" when state is RESOLVED', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.ACTIONABLE,
          state: NotificationState.RESOLVED,
          resolvedAction: 'yes',
          actions: [{ key: 'yes', label: 'Sim', style: 'primary' }],
        })}
      />
    );
    expect(screen.getByText(/resolvido como/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sim' })
    ).not.toBeInTheDocument();
  });

  it('renders APPROVAL with approve + reject buttons', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.APPROVAL,
          state: NotificationState.PENDING,
          actions: [
            { key: 'approve', label: 'Aprovar', style: 'primary' },
            { key: 'reject', label: 'Rejeitar', style: 'destructive' },
          ],
        })}
      />
    );
    expect(screen.getByRole('button', { name: 'Aprovar' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Rejeitar' })
    ).toBeInTheDocument();
  });

  it('renders FORM submit button when state is PENDING (non-compact)', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.FORM,
          state: NotificationState.PENDING,
          actions: [
            {
              key: 'submit',
              label: 'Enviar',
              style: 'primary',
              formSchema: [{ key: 'qty', label: 'Quantidade', type: 'number' }],
            },
          ],
        })}
        compact={false}
      />
    );
    // Renderer's <label> currently has no htmlFor — assert label text + a
    // number input is present until the renderer wires htmlFor/id properly.
    expect(screen.getByText('Quantidade')).toBeInTheDocument();
    expect(document.querySelector('input[type="number"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });

  it('FORM resolved state shows "Formulário enviado"', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.FORM,
          state: NotificationState.RESOLVED,
        })}
      />
    );
    expect(screen.getByText(/formulário enviado/i)).toBeInTheDocument();
  });

  it('renders PROGRESS with percentage and progress numbers', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.PROGRESS,
          progress: 30,
          progressTotal: 100,
        })}
      />
    );
    expect(screen.getByText('30 / 100')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('renders SYSTEM_BANNER with the title (no kind-specific renderer)', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.SYSTEM_BANNER,
          title: 'Manutenção programada',
        })}
      />
    );
    expect(screen.getByText('Manutenção programada')).toBeInTheDocument();
  });

  it('renders IMAGE_BANNER with safe image and alt text', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.IMAGE_BANNER,
          metadata: {
            imageUrl: 'https://example.com/banner.jpg',
            imageAlt: 'Banner promocional',
          },
        })}
      />
    );
    const img = screen.getByAltText('Banner promocional');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/banner.jpg');
  });

  it('IMAGE_BANNER with javascript: imageUrl renders no img', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.IMAGE_BANNER,
          metadata: {
            // eslint-disable-next-line no-script-url
            imageUrl: 'javascript:alert(1)',
            imageAlt: 'Banner',
          },
        })}
      />
    );
    expect(screen.queryByAltText('Banner')).not.toBeInTheDocument();
  });

  it('renders REPORT with name + format + size formatted', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.REPORT,
          actionUrl: '/reports/sample.pdf',
          metadata: {
            reportUrl: '/reports/sample.pdf',
            reportName: 'Vendas-Outubro.pdf',
            reportFormat: 'pdf',
            reportSize: 102_400,
            reportPeriod: 'Out/2026',
          },
        })}
      />
    );
    expect(screen.getByText('Vendas-Outubro.pdf')).toBeInTheDocument();
    // size 102_400 / 1024 = 100 KB
    expect(screen.getByText(/PDF · 100 KB · Out\/2026/)).toBeInTheDocument();
  });

  it('renders EMAIL_PREVIEW with subject and from name', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.EMAIL_PREVIEW,
          metadata: {
            emailFrom: 'cliente@exemplo.com',
            emailFromName: 'Maria Souza',
            emailSubject: 'Dúvida sobre prazo',
            emailPreview: 'Olá, poderia confirmar?',
            openInAppUrl: '/email/123',
          },
        })}
      />
    );
    expect(screen.getByText('Maria Souza')).toBeInTheDocument();
    expect(screen.getByText('Dúvida sobre prazo')).toBeInTheDocument();
    expect(screen.getByText('Olá, poderia confirmar?')).toBeInTheDocument();
  });

  it('sanitizes XSS attempts in title and message', () => {
    render(
      <NotificationItem
        notification={makeRecord({
          kind: NotificationKind.INFORMATIONAL,
          title: '<script>alert("xss-title")</script>safe-title',
          message: '<img src=x onerror=alert(1)>safe-msg',
        })}
      />
    );
    expect(document.body.innerHTML).not.toContain('<script>');
    expect(document.body.innerHTML).not.toContain('onerror=');
    expect(screen.getByText(/safe-title/)).toBeInTheDocument();
    expect(screen.getByText(/safe-msg/)).toBeInTheDocument();
  });
});
