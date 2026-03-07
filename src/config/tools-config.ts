/**
 * Tools Configuration
 * Configuração das ferramentas disponíveis no painel de ferramentas
 */

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  href?: string;
  disabled?: boolean;
  badge?: string;
  requiredPermission?: string;
}

export const TOOLS: ToolConfig[] = [
  {
    id: 'file-manager',
    name: 'Gerenciador de Arquivos',
    description: 'Gerencie documentos e arquivos da empresa',
    icon: 'FolderOpen',
    href: '/file-manager',
    requiredPermission: 'storage.interface.view',
  },
  {
    id: 'calendar',
    name: 'Calendário',
    description: 'Eventos e compromissos',
    icon: 'Calendar',
    href: '/calendar',
    requiredPermission: 'calendar.events.list',
  },
  {
    id: 'email',
    name: 'E-mail',
    description: 'Caixa de entrada e envio de e-mails',
    icon: 'Mail',
    href: '/email',
    requiredPermission: 'ui.menu.email',
  },
  {
    id: 'tasks',
    name: 'Tarefas',
    description: 'Quadros de tarefas e gerenciamento de projetos',
    icon: 'KanbanSquare',
    href: '/tasks',
    requiredPermission: 'tasks.boards.list',
  },
];
