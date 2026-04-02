import {
  Building2,
  DollarSign,
  LucideIcon,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Wrench,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Standard Actions (7 humanized capabilities)
// ---------------------------------------------------------------------------

export const STANDARD_ACTIONS = [
  // Ações
  'access',
  'register',
  'modify',
  'remove',
  'import',
  'print',
  // Compartilhamento
  'export',
  'share',
  // Gerenciamento
  'admin',
  'onlyself',
] as const;

export type StandardAction = (typeof STANDARD_ACTIONS)[number];

export const ACTION_LABELS: Record<StandardAction, string> = {
  access: 'Acessar',
  register: 'Cadastrar',
  modify: 'Alterar',
  remove: 'Remover',
  import: 'Importar',
  export: 'Externo',
  print: 'Imprimir',
  admin: 'Global',
  share: 'Interno',
  onlyself: 'Pessoal',
};

// ---------------------------------------------------------------------------
// Chip Labels & Descriptions (used by the toggle-chip permission UI)
// ---------------------------------------------------------------------------

export interface ActionChipConfig {
  label: string;
  description: string;
  /** Whether this action should appear after the divider (special/admin actions) */
  isSpecial?: boolean;
}

export const ACTION_CHIP_CONFIG: Record<string, ActionChipConfig> = {
  access: {
    label: 'Visualizar',
    description: 'Permite visualizar e listar registros',
  },
  register: {
    label: 'Criar',
    description: 'Permite cadastrar novos registros',
  },
  modify: {
    label: 'Editar',
    description: 'Permite alterar registros existentes',
  },
  remove: {
    label: 'Excluir',
    description: 'Permite excluir registros permanentemente',
  },
  import: {
    label: 'Importar',
    description: 'Permite importar registros em massa via planilha',
  },
  export: {
    label: 'Exportar',
    description: 'Permite exportar dados para Excel/CSV',
  },
  print: {
    label: 'Imprimir',
    description: 'Permite gerar documentos para impressão/PDF',
  },
  share: {
    label: 'Compartilhar',
    description: 'Permite compartilhar registros internamente',
  },
  admin: {
    label: 'Administrar',
    description:
      'Acesso administrativo — permite gerenciar registros de todos os usuários',
    isSpecial: true,
  },
  onlyself: {
    label: 'Somente próprios',
    description: 'Restringe acesso apenas aos registros do próprio usuário',
    isSpecial: true,
  },
  // Domain-specific actions (Sales)
  confirm: { label: 'Confirmar', description: 'Permite confirmar registros' },
  approve: { label: 'Aprovar', description: 'Permite aprovar registros pendentes' },
  cancel: { label: 'Cancelar', description: 'Permite cancelar registros' },
  reassign: { label: 'Reatribuir', description: 'Permite reatribuir registros para outro responsável' },
  reply: { label: 'Responder', description: 'Permite responder a registros' },
  execute: { label: 'Executar', description: 'Permite executar ações no registro' },
  activate: { label: 'Ativar', description: 'Permite ativar registros' },
  send: { label: 'Enviar', description: 'Permite enviar registros' },
  convert: { label: 'Converter', description: 'Permite converter registros para outro tipo' },
  sell: { label: 'Vender', description: 'Permite realizar vendas' },
  open: { label: 'Abrir', description: 'Permite abrir registros' },
  close: { label: 'Fechar', description: 'Permite fechar registros' },
  withdraw: { label: 'Retirar', description: 'Permite retirar valores' },
  supply: { label: 'Abastecer', description: 'Permite abastecer registros' },
  receive: { label: 'Receber', description: 'Permite receber registros' },
  verify: { label: 'Verificar', description: 'Permite verificar registros' },
  override: { label: 'Sobrescrever', description: 'Permite sobrescrever valores ou configurações' },
  publish: { label: 'Publicar', description: 'Permite publicar registros' },
  generate: { label: 'Gerar', description: 'Permite gerar documentos ou relatórios' },
  query: { label: 'Consultar', description: 'Permite consultar dados externos' },
  sync: { label: 'Sincronizar', description: 'Permite sincronizar dados com sistemas externos' },
};

/**
 * Returns the chip label for an action. Falls back to title-casing the action code.
 */
export function getActionChipLabel(action: string): string {
  return (
    ACTION_CHIP_CONFIG[action]?.label ??
    action.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  );
}

/**
 * Returns the chip tooltip description for an action.
 */
export function getActionChipDescription(action: string): string {
  return ACTION_CHIP_CONFIG[action]?.description ?? `Permissão: ${action}`;
}

/**
 * Whether this action should appear after the divider (admin/special zone).
 */
export function isSpecialAction(action: string): boolean {
  return ACTION_CHIP_CONFIG[action]?.isSpecial === true;
}

/** Column groups for the matrix table super-header */
export interface ActionGroup {
  label: string;
  actions: StandardAction[];
}

export const ACTION_GROUPS: ActionGroup[] = [
  {
    label: 'Ações',
    actions: ['access', 'register', 'modify', 'remove', 'import', 'print'],
  },
  { label: 'Compartilhamento', actions: ['export', 'share'] },
  { label: 'Gerenciamento', actions: ['admin', 'onlyself'] },
];

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface MatrixResource {
  label: string;
  /** Visual group header this resource belongs to within the tab */
  group: string;
  backendResources: string[];
  availableActions: StandardAction[];
}

export interface MatrixTab {
  id: string;
  label: string;
  icon: LucideIcon;
  resources: MatrixResource[];
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

export const MATRIX_TABS: MatrixTab[] = [
  // ── Tab 1: Estoque ──────────────────────────────────────────────────
  {
    id: 'stock',
    label: 'Estoque',
    icon: Package,
    resources: [
      // Cadastros
      {
        label: 'Produtos',
        group: 'Cadastros',
        backendResources: ['stock.products'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'import',
          'export',
          'print',
          'admin',
          'onlyself',
        ],
      },
      {
        label: 'Variantes',
        group: 'Cadastros',
        backendResources: ['stock.variants'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'import',
          'export',
          'print',
          'admin',
          'onlyself',
        ],
      },
      {
        label: 'Templates',
        group: 'Cadastros',
        backendResources: ['stock.templates'],
        availableActions: ['access', 'register', 'modify', 'remove', 'import'],
      },
      {
        label: 'Categorias',
        group: 'Cadastros',
        backendResources: ['stock.categories'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'import',
          'export',
        ],
      },
      {
        label: 'Fabricantes',
        group: 'Cadastros',
        backendResources: ['stock.manufacturers'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'import',
          'export',
        ],
      },
      // Operações
      {
        label: 'Itens',
        group: 'Operações',
        backendResources: ['stock.items'],
        availableActions: ['access', 'import', 'export', 'print', 'admin'],
      },
      {
        label: 'Ordens de Compra',
        group: 'Operações',
        backendResources: ['stock.purchase-orders'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'export',
          'print',
          'admin',
          'onlyself',
        ],
      },
      {
        label: 'Volumes',
        group: 'Operações',
        backendResources: ['stock.volumes'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'export',
          'print',
          'admin',
          'onlyself',
        ],
      },
      // Infraestrutura
      {
        label: 'Armazéns',
        group: 'Infraestrutura',
        backendResources: ['stock.warehouses'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      {
        label: 'Inventário',
        group: 'Operações',
        backendResources: ['stock.inventory'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'export',
          'print',
          'admin',
        ],
      },
    ],
  },

  // ── Tab 2: Financeiro ───────────────────────────────────────────────
  {
    id: 'finance',
    label: 'Financeiro',
    icon: DollarSign,
    resources: [
      // Cadastros
      {
        label: 'Categorias',
        group: 'Cadastros',
        backendResources: ['finance.categories'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Centros de Custo',
        group: 'Cadastros',
        backendResources: ['finance.cost-centers'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Contas Bancárias',
        group: 'Cadastros',
        backendResources: ['finance.bank-accounts'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'import',
          'admin',
        ],
      },
      {
        label: 'Fornecedores',
        group: 'Cadastros',
        backendResources: ['finance.suppliers'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'import',
          'export',
        ],
      },
      {
        label: 'Contratos',
        group: 'Cadastros',
        backendResources: ['finance.contracts'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'export',
          'print',
        ],
      },
      // Operações
      {
        label: 'Lançamentos',
        group: 'Operações',
        backendResources: ['finance.entries'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'import',
          'export',
          'print',
          'admin',
          'onlyself',
        ],
      },
      {
        label: 'Consórcios',
        group: 'Operações',
        backendResources: ['finance.consortia'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'export',
          'admin',
          'onlyself',
        ],
      },
      {
        label: 'Empréstimos',
        group: 'Operações',
        backendResources: ['finance.loans'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'export',
          'admin',
          'onlyself',
        ],
      },
      {
        label: 'Recorrências',
        group: 'Operações',
        backendResources: ['finance.recurring'],
        availableActions: ['access', 'register', 'modify', 'admin', 'onlyself'],
      },
      {
        label: 'Orçamentos',
        group: 'Operações',
        backendResources: ['finance.budgets'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
    ],
  },

  // ── Tab 3: Recursos Humanos ─────────────────────────────────────────
  {
    id: 'hr',
    label: 'Recursos Humanos',
    icon: Users,
    resources: [
      // Cadastros
      {
        label: 'Cargos',
        group: 'Cadastros',
        backendResources: ['hr.positions'],
        availableActions: ['access', 'register', 'modify', 'remove', 'import'],
      },
      {
        label: 'Departamentos',
        group: 'Cadastros',
        backendResources: ['hr.departments'],
        availableActions: ['access', 'register', 'modify', 'remove', 'import'],
      },
      {
        label: 'Escalas de Trabalho',
        group: 'Cadastros',
        backendResources: ['hr.work-schedules'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      // Operações
      {
        label: 'Colaboradores',
        group: 'Operações',
        backendResources: ['hr.employees'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'import',
          'export',
          'print',
          'admin',
          'onlyself',
        ],
      },
      {
        label: 'Férias',
        group: 'Operações',
        backendResources: ['hr.vacations'],
        availableActions: ['access', 'register', 'modify', 'admin', 'onlyself'],
      },
      {
        label: 'Ausências',
        group: 'Operações',
        backendResources: ['hr.absences'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
          'onlyself',
        ],
      },
      {
        label: 'Folha de Pagamento',
        group: 'Operações',
        backendResources: ['hr.payroll'],
        availableActions: ['access', 'register', 'export', 'print', 'admin'],
      },
      {
        label: 'Ponto',
        group: 'Operações',
        backendResources: ['hr.time-control'],
        availableActions: ['access', 'register', 'export', 'print', 'admin'],
      },
      {
        label: 'Bonificações',
        group: 'Operações',
        backendResources: ['hr.bonuses'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Descontos',
        group: 'Operações',
        backendResources: ['hr.deductions'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      // Saúde e Segurança
      {
        label: 'Exames Médicos',
        group: 'Saúde e Segurança',
        backendResources: ['hr.medical-exams'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Segurança do Trabalho',
        group: 'Saúde e Segurança',
        backendResources: ['hr.safety'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      // Benefícios e Comunicação
      {
        label: 'Benefícios',
        group: 'Benefícios e Comunicação',
        backendResources: ['hr.benefits'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      {
        label: 'Comunicados',
        group: 'Benefícios e Comunicação',
        backendResources: ['hr.announcements'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Solicitações',
        group: 'Benefícios e Comunicação',
        backendResources: ['hr.employee-requests'],
        availableActions: ['access', 'register', 'admin'],
      },
      {
        label: 'Reconhecimentos',
        group: 'Benefícios e Comunicação',
        backendResources: ['hr.kudos'],
        availableActions: ['access', 'register'],
      },
      // Admissão e Desligamento
      {
        label: 'Onboarding',
        group: 'Admissão e Desligamento',
        backendResources: ['hr.onboarding'],
        availableActions: ['access', 'modify', 'admin'],
      },
      {
        label: 'Admissões',
        group: 'Admissão e Desligamento',
        backendResources: ['hr.admissions'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      // eSocial
      {
        label: 'eSocial: Configuração',
        group: 'eSocial',
        backendResources: ['esocial.config'],
        availableActions: ['access', 'modify', 'admin'],
      },
      {
        label: 'eSocial: Eventos',
        group: 'eSocial',
        backendResources: ['esocial.events'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'export',
          'admin',
        ],
      },
      {
        label: 'eSocial: Rubricas',
        group: 'eSocial',
        backendResources: ['esocial.rubricas'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'eSocial: Tabelas',
        group: 'eSocial',
        backendResources: ['esocial.tables'],
        availableActions: ['access'],
      },
      {
        label: 'eSocial: Certificados',
        group: 'eSocial',
        backendResources: ['esocial.certificates'],
        availableActions: ['access', 'admin'],
      },
    ],
  },

  // ── Tab 4: Vendas ───────────────────────────────────────────────────
  {
    id: 'sales',
    label: 'Vendas',
    icon: ShoppingCart,
    resources: [
      // CRM
      {
        label: 'Clientes',
        group: 'CRM',
        backendResources: ['sales.customers'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'import',
          'export',
          'admin',
          'onlyself',
        ],
      },
      {
        label: 'Contatos',
        group: 'CRM',
        backendResources: ['sales.contacts'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
          'onlyself',
        ],
      },
      {
        label: 'Negócios',
        group: 'CRM',
        backendResources: ['sales.deals'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
          'onlyself',
        ],
      },
      {
        label: 'Blueprints',
        group: 'CRM',
        backendResources: ['sales.blueprints'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      {
        label: 'Pipelines',
        group: 'CRM',
        backendResources: ['sales.pipelines'],
        availableActions: ['access', 'admin'],
      },
      {
        label: 'Atividades',
        group: 'CRM',
        backendResources: ['sales.activities'],
        availableActions: ['access', 'register'],
      },
      {
        label: 'Conversas',
        group: 'CRM',
        backendResources: ['sales.conversations'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
        ],
      },
      {
        label: 'Chatbot',
        group: 'CRM',
        backendResources: ['sales.chatbot'],
        availableActions: ['access', 'modify', 'admin'],
      },
      {
        label: 'Previsões IA',
        group: 'CRM',
        backendResources: ['sales.predictions'],
        availableActions: ['access', 'admin'],
      },
      {
        label: 'Análise de Sentimento',
        group: 'CRM',
        backendResources: ['sales.sentiment'],
        availableActions: ['access', 'admin'],
      },
      {
        label: 'Workflows',
        group: 'CRM',
        backendResources: ['sales.workflows'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
        ],
      },
      {
        label: 'Formulários',
        group: 'CRM',
        backendResources: ['sales.forms'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
        ],
      },
      {
        label: 'Landing Pages',
        group: 'CRM',
        backendResources: ['sales.landing-pages'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
        ],
      },
      {
        label: 'Propostas',
        group: 'CRM',
        backendResources: ['sales.proposals'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'export',
          'print',
          'admin',
        ],
      },
      {
        label: 'Templates de Mensagem',
        group: 'CRM',
        backendResources: ['sales.msg-templates'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
        ],
      },
      // Pedidos e Orçamentos
      {
        label: 'Pedidos',
        group: 'Pedidos e Orçamentos',
        backendResources: ['sales.orders'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'export',
          'print',
          'admin',
          'onlyself',
        ],
      },
      {
        label: 'Orçamentos',
        group: 'Pedidos e Orçamentos',
        backendResources: ['sales.quotes'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'print',
          'admin',
          'onlyself',
        ],
      },
      {
        label: 'Créditos de Loja',
        group: 'Pedidos e Orçamentos',
        backendResources: ['sales.store-credits'],
        availableActions: ['access', 'register', 'remove', 'admin'],
      },
      {
        label: 'Devoluções',
        group: 'Pedidos e Orçamentos',
        backendResources: ['sales.returns'],
        availableActions: ['access', 'register', 'admin'],
      },
      // Preços e Promoções
      {
        label: 'Promoções',
        group: 'Preços e Promoções',
        backendResources: ['sales.promotions'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Tabelas de Preço',
        group: 'Preços e Promoções',
        backendResources: ['sales.price-tables'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      {
        label: 'Preços de Cliente',
        group: 'Preços e Promoções',
        backendResources: ['sales.customer-prices'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Descontos',
        group: 'Preços e Promoções',
        backendResources: ['sales.discounts'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
        ],
      },
      {
        label: 'Pontuação de Leads',
        group: 'Preços e Promoções',
        backendResources: ['sales.lead-scoring'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
        ],
      },
      {
        label: 'Cupons',
        group: 'Preços e Promoções',
        backendResources: ['sales.coupons'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      {
        label: 'Combos',
        group: 'Preços e Promoções',
        backendResources: ['sales.combos'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
        ],
      },
      {
        label: 'Campanhas',
        group: 'Preços e Promoções',
        backendResources: ['sales.campaigns'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      // PDV e Caixa
      {
        label: 'PDV',
        group: 'PDV e Caixa',
        backendResources: ['sales.pos'],
        availableActions: ['access', 'admin', 'onlyself'],
      },
      {
        label: 'PDV: Terminais',
        group: 'PDV e Caixa',
        backendResources: ['sales.pos.terminals'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'PDV: Sessões',
        group: 'PDV e Caixa',
        backendResources: ['sales.pos.sessions'],
        availableActions: ['access', 'admin'],
      },
      {
        label: 'PDV: Transações',
        group: 'PDV e Caixa',
        backendResources: ['sales.pos.transactions'],
        availableActions: ['access', 'register', 'admin'],
      },
      {
        label: 'PDV: Caixa',
        group: 'PDV e Caixa',
        backendResources: ['sales.pos.cash'],
        availableActions: ['access', 'admin'],
      },
      {
        label: 'Caixa',
        group: 'PDV e Caixa',
        backendResources: ['sales.cashier'],
        availableActions: ['access', 'admin'],
      },
      {
        label: 'Comissões',
        group: 'PDV e Caixa',
        backendResources: ['sales.commissions'],
        availableActions: ['access', 'admin', 'onlyself'],
      },
      // Licitações
      {
        label: 'Licitações',
        group: 'Licitações',
        backendResources: ['sales.bids'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      {
        label: 'Propostas de Licitação',
        group: 'Licitações',
        backendResources: ['sales.bid-proposals'],
        availableActions: ['access', 'admin'],
      },
      {
        label: 'Bot de Licitação',
        group: 'Licitações',
        backendResources: ['sales.bid-bot'],
        availableActions: ['access', 'admin'],
      },
      {
        label: 'Contratos de Licitação',
        group: 'Licitações',
        backendResources: ['sales.bid-contracts'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      {
        label: 'Documentos de Licitação',
        group: 'Licitações',
        backendResources: ['sales.bid-documents'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      {
        label: 'Empenhos',
        group: 'Licitações',
        backendResources: ['sales.bid-empenhos'],
        availableActions: ['access', 'register', 'modify'],
      },
      // Catálogos e Conteúdo
      {
        label: 'Catálogos',
        group: 'Catálogos e Conteúdo',
        backendResources: ['sales.catalogs'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      {
        label: 'Conteúdo',
        group: 'Catálogos e Conteúdo',
        backendResources: ['sales.content'],
        availableActions: ['access', 'register', 'remove', 'admin'],
      },
      {
        label: 'Identidade Visual',
        group: 'Catálogos e Conteúdo',
        backendResources: ['sales.brand'],
        availableActions: ['access', 'modify'],
      },
      {
        label: 'Portal do Cliente',
        group: 'Catálogos e Conteúdo',
        backendResources: ['sales.customer-portal'],
        availableActions: ['access', 'register', 'remove'],
      },
      // Marketplaces
      {
        label: 'Marketplaces: Conexões',
        group: 'Marketplaces',
        backendResources: ['sales.marketplace-connections'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Marketplaces: Anúncios',
        group: 'Marketplaces',
        backendResources: ['sales.marketplace-listings'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Marketplaces: Pedidos',
        group: 'Marketplaces',
        backendResources: ['sales.marketplace-orders'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Marketplaces: Pagamentos',
        group: 'Marketplaces',
        backendResources: ['sales.marketplace-payments'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Marketplaces (geral)',
        group: 'Marketplaces',
        backendResources: ['sales.marketplaces'],
        availableActions: ['access', 'admin'],
      },
      // Analytics
      {
        label: 'Analytics',
        group: 'Analytics',
        backendResources: ['sales.analytics'],
        availableActions: ['access', 'export', 'admin', 'onlyself'],
      },
      {
        label: 'Metas',
        group: 'Analytics',
        backendResources: ['sales.analytics-goals'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Relatórios',
        group: 'Analytics',
        backendResources: ['sales.analytics-reports'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      {
        label: 'Dashboards',
        group: 'Analytics',
        backendResources: ['sales.analytics-dashboards'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Rankings',
        group: 'Analytics',
        backendResources: ['sales.analytics-rankings'],
        availableActions: ['access'],
      },
      // Automação
      {
        label: 'Cadências',
        group: 'Automação',
        backendResources: ['sales.cadences'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
        ],
      },
      {
        label: 'Roteamento de Leads',
        group: 'Automação',
        backendResources: ['sales.lead-routing'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
        ],
      },
      {
        label: 'Integrações',
        group: 'Automação',
        backendResources: ['sales.integrations'],
        availableActions: ['access', 'register', 'modify', 'admin'],
      },
    ],
  },

  // ── Tab 5: Administração ────────────────────────────────────────────
  {
    id: 'admin',
    label: 'Administração',
    icon: Building2,
    resources: [
      // Gestão
      {
        label: 'Usuários',
        group: 'Gestão',
        backendResources: ['admin.users'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'import',
          'admin',
        ],
      },
      {
        label: 'Grupos de Permissão',
        group: 'Gestão',
        backendResources: ['admin.permission-groups'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      {
        label: 'Empresas',
        group: 'Gestão',
        backendResources: ['admin.companies'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'import',
          'admin',
        ],
      },
      // Sistema
      {
        label: 'Sessões',
        group: 'Sistema',
        backendResources: ['admin.sessions'],
        availableActions: ['access', 'admin'],
      },
      {
        label: 'Auditoria',
        group: 'Sistema',
        backendResources: ['admin.audit'],
        availableActions: ['access', 'export', 'admin'],
      },
      {
        label: 'Configurações',
        group: 'Sistema',
        backendResources: ['admin.settings'],
        availableActions: ['access', 'admin'],
      },
    ],
  },

  // ── Tab 6: Ferramentas ──────────────────────────────────────────────
  {
    id: 'tools',
    label: 'Ferramentas',
    icon: Wrench,
    resources: [
      // Comunicação
      {
        label: 'Email: Contas',
        group: 'Comunicação',
        backendResources: ['tools.email.accounts'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
          'share',
        ],
      },
      {
        label: 'Email: Mensagens',
        group: 'Comunicação',
        backendResources: ['tools.email.messages'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'onlyself',
        ],
      },
      // Mensageria
      {
        label: 'Mensageria: Contas',
        group: 'Mensageria',
        backendResources: ['tools.messaging.accounts'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
        ],
      },
      {
        label: 'Mensageria: Contatos',
        group: 'Mensageria',
        backendResources: ['tools.messaging.contacts'],
        availableActions: ['access'],
      },
      {
        label: 'Mensageria: Mensagens',
        group: 'Mensageria',
        backendResources: ['tools.messaging.messages'],
        availableActions: ['access', 'register'],
      },
      // Produtividade
      {
        label: 'Tarefas: Quadros',
        group: 'Produtividade',
        backendResources: ['tools.tasks.boards'],
        availableActions: ['access', 'register', 'modify', 'remove', 'share'],
      },
      {
        label: 'Tarefas: Cartões',
        group: 'Produtividade',
        backendResources: ['tools.tasks.cards'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
          'share',
          'onlyself',
        ],
      },
      {
        label: 'Tarefas: Comentários',
        group: 'Produtividade',
        backendResources: ['tools.tasks.comments'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Tarefas: Anexos',
        group: 'Produtividade',
        backendResources: ['tools.tasks.attachments'],
        availableActions: ['access', 'register', 'remove'],
      },
      {
        label: 'Tarefas: Etiquetas',
        group: 'Produtividade',
        backendResources: ['tools.tasks.labels'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Tarefas: Checklists',
        group: 'Produtividade',
        backendResources: ['tools.tasks.checklists'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Tarefas: Campos Personalizados',
        group: 'Produtividade',
        backendResources: ['tools.tasks.customfields'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Agenda',
        group: 'Produtividade',
        backendResources: ['tools.calendar'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'export',
          'admin',
          'share',
          'onlyself',
        ],
      },
      // Arquivos
      {
        label: 'Pastas',
        group: 'Arquivos',
        backendResources: ['tools.storage.folders'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
          'share',
        ],
      },
      {
        label: 'Arquivos',
        group: 'Arquivos',
        backendResources: ['tools.storage.files'],
        availableActions: [
          'access',
          'register',
          'modify',
          'remove',
          'admin',
          'share',
          'onlyself',
        ],
      },
      // Assinatura Digital
      {
        label: 'Envelopes',
        group: 'Assinatura Digital',
        backendResources: ['tools.signature.envelopes'],
        availableActions: ['access', 'register', 'modify', 'remove', 'admin'],
      },
      {
        label: 'Certificados',
        group: 'Assinatura Digital',
        backendResources: ['tools.signature.certificates'],
        availableActions: ['access', 'register', 'remove', 'admin'],
      },
      {
        label: 'Templates de Assinatura',
        group: 'Assinatura Digital',
        backendResources: ['tools.signature.templates'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      // IA
      {
        label: 'Chat IA',
        group: 'Inteligência Artificial',
        backendResources: ['tools.ai.chat'],
        availableActions: ['access'],
      },
      {
        label: 'Insights IA',
        group: 'Inteligência Artificial',
        backendResources: ['tools.ai.insights'],
        availableActions: ['access'],
      },
      {
        label: 'Configuração IA',
        group: 'Inteligência Artificial',
        backendResources: ['tools.ai.config'],
        availableActions: ['access', 'modify'],
      },
      {
        label: 'Favoritos IA',
        group: 'Inteligência Artificial',
        backendResources: ['tools.ai.favorites'],
        availableActions: ['access', 'register', 'remove'],
      },
      {
        label: 'Ações IA',
        group: 'Inteligência Artificial',
        backendResources: ['tools.ai.actions'],
        availableActions: ['access'],
      },
    ],
  },

  // ── Tab 7: Sistema ──────────────────────────────────────────────────
  {
    id: 'system',
    label: 'Sistema',
    icon: Settings,
    resources: [
      // Usuário
      {
        label: 'Perfil',
        group: 'Usuário',
        backendResources: ['system.self'],
        availableActions: ['access', 'modify', 'admin'],
      },
      {
        label: 'Notificações',
        group: 'Usuário',
        backendResources: ['system.notifications'],
        availableActions: ['admin'],
      },
      // Sistema
      {
        label: 'Etiquetas',
        group: 'Sistema',
        backendResources: ['system.label-templates'],
        availableActions: ['access', 'register', 'modify', 'remove'],
      },
      {
        label: 'Fiscal',
        group: 'Sistema',
        backendResources: ['system.fiscal'],
        availableActions: ['access', 'register', 'modify', 'admin'],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Builds a lookup map from backend resource key (e.g. `"stock.products"`)
 * to the tab and resource index where it appears.
 */
export function buildBackendResourceToTabMap(): Map<
  string,
  { tabId: string; resourceIndex: number }
> {
  const map = new Map<string, { tabId: string; resourceIndex: number }>();

  for (const tab of MATRIX_TABS) {
    for (let i = 0; i < tab.resources.length; i++) {
      for (const backendRes of tab.resources[i].backendResources) {
        map.set(backendRes, { tabId: tab.id, resourceIndex: i });
      }
    }
  }

  return map;
}

/**
 * Maps a backend action string to a StandardAction.
 *
 * New codes use actions directly (access, register, modify, etc.).
 * Legacy codes are also handled: list/read → access, create → register,
 * update → modify, delete → remove, manage → admin.
 */
const STANDARD_ACTION_SET = new Set<string>(STANDARD_ACTIONS);

const LEGACY_ACTION_MAP: Record<string, StandardAction> = {
  list: 'access',
  read: 'access',
  create: 'register',
  update: 'modify',
  delete: 'remove',
  manage: 'admin',
};

export function mapActionToStandard(action: string): StandardAction {
  if (STANDARD_ACTION_SET.has(action)) return action as StandardAction;
  return LEGACY_ACTION_MAP[action] ?? 'admin';
}

/**
 * Extracts unique ordered group names from a tab's resources.
 */
export function getResourceGroups(tab: MatrixTab): string[] {
  const seen = new Set<string>();
  const groups: string[] = [];
  for (const r of tab.resources) {
    if (!seen.has(r.group)) {
      seen.add(r.group);
      groups.push(r.group);
    }
  }
  return groups;
}
