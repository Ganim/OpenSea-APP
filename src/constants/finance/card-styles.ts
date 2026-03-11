/**
 * Finance Module - Centralized card gradient and hover styles
 *
 * Each key corresponds to a finance sub-module / card on the landing page.
 * Detail pages, modals, and config files should import from here
 * instead of hardcoding gradient classes.
 */

export const FINANCE_CARD_GRADIENTS = {
  // Lançamentos
  payable: 'from-red-500 to-red-600',
  receivable: 'from-green-500 to-green-600',
  overdue: 'from-amber-500 to-amber-600',
  recurring: 'from-violet-500 to-violet-600',

  // Cadastros
  bankAccounts: 'from-purple-500 to-purple-600',
  costCenters: 'from-emerald-500 to-emerald-600',
  categories: 'from-cyan-500 to-cyan-600',
  companies: 'from-indigo-500 to-indigo-600',

  // Crédito
  loans: 'from-orange-500 to-orange-600',
  consortia: 'from-pink-500 to-pink-600',
  contracts: 'from-teal-500 to-teal-600',

  // Relatórios
  reports: 'from-violet-500 to-violet-600',
  export: 'from-indigo-500 to-indigo-600',

  // Hero banner
  dashboard: 'from-blue-500 to-blue-600',
  analytics: 'from-emerald-500 to-emerald-600',
  cashflow: 'from-slate-500 to-slate-600',

  // Hero icon
  heroIcon: 'from-blue-500 to-emerald-600',
} as const;

export const FINANCE_CARD_HOVER_BG = {
  payable: 'hover:bg-red-50 dark:hover:bg-red-500/10',
  receivable: 'hover:bg-green-50 dark:hover:bg-green-500/10',
  overdue: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
  recurring: 'hover:bg-violet-50 dark:hover:bg-violet-500/10',
  bankAccounts: 'hover:bg-purple-50 dark:hover:bg-purple-500/10',
  costCenters: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
  categories: 'hover:bg-cyan-50 dark:hover:bg-cyan-500/10',
  companies: 'hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
  loans: 'hover:bg-orange-50 dark:hover:bg-orange-500/10',
  consortia: 'hover:bg-pink-50 dark:hover:bg-pink-500/10',
  contracts: 'hover:bg-teal-50 dark:hover:bg-teal-500/10',
  reports: 'hover:bg-violet-50 dark:hover:bg-violet-500/10',
  export: 'hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
  dashboard: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
  analytics: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
  cashflow: 'hover:bg-slate-50 dark:hover:bg-slate-500/10',
} as const;

export type FinanceCardKey = keyof typeof FINANCE_CARD_GRADIENTS;
