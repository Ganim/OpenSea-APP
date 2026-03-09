'use client';

import {
  EmailAccountEditDialog,
  EmailAccountWizard,
  EmailComposeDialog,
  EmailEmptyState,
  EmailMessageDisplay,
  EmailMessageList,
  EmailSidebar,
} from '@/components/email';
import { getFolderDisplayName } from '@/components/email/email-utils';
import { PageActionBar } from '@/components/layout/page-action-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useEmailPage } from '@/hooks/email/use-email-page';
import { ArrowLeft, Mail } from 'lucide-react';
import { TbMailPlus } from 'react-icons/tb';

export default function EmailPage() {
  const {
    isMobile,
    mobileView,
    setMobileView,
    canSend,
    accounts,
    hasAccounts,
    composeOpen,
    setComposeOpen,
    composeMode,
    openCompose,
    accountWizardOpen,
    setAccountWizardOpen,
    editAccount,
    setEditAccount,
    selectedAccountId,
    selectedFolder,
    isCentralInbox,
    sidebarProps,
    messageListProps,
    messageDisplayProps,
    ariaAnnouncement,
  } = useEmailPage();

  const actionBarButtons = [
    ...(canSend && accounts.length > 0
      ? [
          {
            id: 'compose',
            title: 'Novo Email',
            icon: TbMailPlus,
            variant: 'default' as const,
            onClick: openCompose,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6 h-[calc(100vh-10rem)] md:h-[calc(100vh-10rem)]">
      {/* Action Bar */}
      <PageActionBar
        breadcrumbItems={[{ label: 'E-mail', href: '/email' }]}
        buttons={actionBarButtons}
      />

      {/* Hero Banner — hidden on mobile to save space */}
      <Card className="relative overflow-hidden p-6 md:p-8 bg-white dark:bg-white/5 border-gray-200/80 dark:border-white/10 shadow-sm dark:shadow-none shrink-0 hidden md:block">
        <div className="absolute top-0 right-0 w-56 h-56 bg-blue-500/15 dark:bg-blue-500/10 rounded-full opacity-80 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full opacity-80 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                E-mail
              </h1>
              <p className="text-sm text-slate-500 dark:text-white/60">
                Gerencie suas caixas de entrada, envie e receba mensagens
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Body — empty state or panel layout */}
      {!hasAccounts ? (
        <Card className="bg-white dark:bg-white/5 border-gray-200/80 dark:border-white/10 shadow-sm dark:shadow-none p-0 overflow-hidden flex-1 min-h-0 flex flex-col">
          <EmailEmptyState onAddAccount={() => setAccountWizardOpen(true)} />
        </Card>
      ) : isMobile ? (
        /* ═══ Mobile: single-panel view with navigation ═══ */
        <Card className="bg-white dark:bg-white/5 border-gray-200/80 dark:border-white/10 shadow-sm dark:shadow-none p-0 overflow-hidden flex-1 min-h-0 flex flex-col">
          {mobileView === 'sidebar' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setMobileView('list')}
                >
                  <ArrowLeft className="size-4 mr-1" />
                  Mensagens
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <EmailSidebar {...sidebarProps} />
              </div>
            </div>
          )}

          {mobileView === 'list' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setMobileView('sidebar')}
                >
                  <ArrowLeft className="size-4 mr-1" />
                  Contas
                </Button>
                <span className="text-sm font-medium text-muted-foreground truncate">
                  {isCentralInbox
                    ? 'Caixa Central'
                    : selectedFolder
                      ? getFolderDisplayName(selectedFolder)
                      : 'Selecionar pasta'}
                </span>
              </div>
              <div className="flex-1 min-h-0">
                <EmailMessageList {...messageListProps} />
              </div>
            </div>
          )}

          {mobileView === 'detail' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => {
                    setMobileView('list');
                  }}
                >
                  <ArrowLeft className="size-4 mr-1" />
                  Voltar
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <EmailMessageDisplay {...messageDisplayProps} />
              </div>
            </div>
          )}
        </Card>
      ) : (
        /* ═══ Desktop: 3-panel resizable layout (unchanged) ═══ */
        <Card className="bg-white dark:bg-white/5 border-gray-200/80 dark:border-white/10 shadow-sm dark:shadow-none p-0 overflow-hidden flex-1 min-h-0 flex flex-col">
          <div className="flex flex-1 min-h-0">
            <ResizablePanelGroup
              direction="horizontal"
              className="flex-1 min-w-0"
            >
              <ResizablePanel
                defaultSize={20}
                minSize={16}
                maxSize={28}
                className="border-r"
              >
                <EmailSidebar {...sidebarProps} />
              </ResizablePanel>

              <ResizableHandle />

              <ResizablePanel
                defaultSize={30}
                minSize={22}
                maxSize={45}
                className="border-r"
              >
                <EmailMessageList {...messageListProps} />
              </ResizablePanel>

              <ResizableHandle />

              <ResizablePanel defaultSize={50} minSize={35}>
                <EmailMessageDisplay {...messageDisplayProps} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </Card>
      )}

      {/* Compose Dialog */}
      <EmailComposeDialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        accounts={accounts}
        defaultAccountId={selectedAccountId ?? undefined}
        mode={composeMode}
      />

      {/* Account Wizard Modal */}
      <EmailAccountWizard
        open={accountWizardOpen}
        onOpenChange={setAccountWizardOpen}
      />

      {/* Account Edit Modal */}
      {editAccount && (
        <EmailAccountEditDialog
          account={editAccount}
          open={!!editAccount}
          onOpenChange={open => {
            if (!open) setEditAccount(null);
          }}
        />
      )}

      {/* Screen reader announcement for new messages */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {ariaAnnouncement}
      </div>
    </div>
  );
}
