/**
 * Termination Types
 * Tipos para rescisões de contrato de trabalho
 */

export type TerminationType =
  | 'SEM_JUSTA_CAUSA'
  | 'JUSTA_CAUSA'
  | 'PEDIDO_DEMISSAO'
  | 'ACORDO_MUTUO'
  | 'CONTRATO_TEMPORARIO'
  | 'RESCISAO_INDIRETA'
  | 'FALECIMENTO';

export type NoticeType = 'TRABALHADO' | 'INDENIZADO' | 'DISPENSADO';

export type TerminationStatus = 'PENDING' | 'CALCULATED' | 'PAID';

export interface Termination {
  id: string;
  tenantId: string;
  employeeId: string;
  type: TerminationType;
  terminationDate: string;
  lastWorkDay: string;
  noticeType: NoticeType;
  noticeDays: number;

  // Verbas rescisórias
  saldoSalario?: number;
  avisoIndenizado?: number;
  decimoTerceiroProp?: number;
  feriasVencidas?: number;
  feriasVencidasTerco?: number;
  feriasProporcional?: number;
  feriasProporcionalTerco?: number;
  multaFgts?: number;

  // Descontos
  inssRescisao?: number;
  irrfRescisao?: number;
  outrosDescontos?: number;

  // Totais
  totalBruto?: number;
  totalDescontos?: number;
  totalLiquido?: number;

  // Pagamento
  paymentDeadline: string;
  paidAt?: string;
  status: TerminationStatus;
  notes?: string;

  // Metadados
  createdAt: string;
  updatedAt: string;
}

export interface CreateTerminationData {
  employeeId: string;
  type: TerminationType;
  terminationDate: string;
  lastWorkDay: string;
  noticeType: NoticeType;
  noticeDays: number;
  paymentDeadline: string;
  notes?: string;
}

export interface UpdateTerminationData {
  type?: TerminationType;
  terminationDate?: string;
  lastWorkDay?: string;
  noticeType?: NoticeType;
  noticeDays?: number;
  paymentDeadline?: string;
  notes?: string;
  status?: TerminationStatus;
}
