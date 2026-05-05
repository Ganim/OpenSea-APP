/**
 * Devices Module Landing Page
 * Página inicial do módulo de dispositivos com cards de navegação
 */

'use client';

import { PageActionBar } from '@/components/layout/page-action-bar';
import { PageDashboardSections } from '@/components/layout/page-dashboard-sections';
import { PageHeroBanner } from '@/components/layout/page-hero-banner';
import { usePermissions } from '@/hooks/use-permissions';
import {
  Fingerprint,
  Monitor,
  Printer,
  ShoppingCart,
  Webhook,
} from 'lucide-react';

const sections = [
  {
    title: 'Gerenciamento',
    cards: [
      {
        id: 'remote-prints',
        title: 'Impressoras Remotas',
        description: 'Gerencie impressoras conectadas via Print Server',
        icon: Printer,
        href: '/devices/remote-prints',
        gradient: 'from-blue-500 to-indigo-600',
        hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
      },
      {
        id: 'pos-terminals',
        title: 'Terminais de Venda',
        description:
          'Configure e monitore terminais PDV (Emporion) — modos de operação e pareamento',
        icon: ShoppingCart,
        href: '/devices/pos-terminals',
        gradient: 'from-violet-500 to-purple-600',
        hoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-500/10',
      },
      {
        id: 'punch-terminals',
        title: 'Terminais de Ponto',
        description:
          'Gerencie terminais Horus de ponto — kiosks, leitores biométricos e PCs pessoais',
        icon: Fingerprint,
        href: '/devices/punch-terminals',
        gradient: 'from-indigo-500 to-violet-600',
        hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
      },
      {
        id: 'webhooks',
        title: 'Webhooks',
        description:
          'Configure endpoints para receber eventos do sistema em tempo real (assinatura HMAC).',
        icon: Webhook,
        href: '/devices/webhooks',
        gradient: 'from-amber-500 to-orange-600',
        hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
      },
    ],
  },
];

export default function DevicesLandingPage() {
  const { hasPermission } = usePermissions();

  return (
    <div className="space-y-8">
      <PageActionBar
        breadcrumbItems={[{ label: 'Dispositivos', href: '/devices' }]}
        hasPermission={hasPermission}
      />

      <PageHeroBanner
        title="Dispositivos"
        description="Gerencie impressoras remotas, terminais POS e outros dispositivos conectados ao seu sistema."
        icon={Monitor}
        iconGradient="from-blue-500 to-indigo-600"
        buttons={[]}
        hasPermission={hasPermission}
      />

      <PageDashboardSections
        sections={sections}
        counts={{}}
        countsLoading={false}
        hasPermission={hasPermission}
      />
    </div>
  );
}
