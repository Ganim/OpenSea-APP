export interface AccountantAccess {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  cpfCnpj: string | null;
  crc: string | null;
  accessToken: string;
  isActive: boolean;
  lastAccessAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InviteAccountantRequest {
  email: string;
  name: string;
  cpfCnpj?: string;
  crc?: string;
  expiresInDays?: number;
}

export interface InviteAccountantResponse {
  access: AccountantAccess;
  portalUrl: string;
}

export interface AccountantAccessesResponse {
  accesses: AccountantAccess[];
}

// ---- Accountant Portal Data (read-only, fetched via token) ----

export interface AccountantDataCategory {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
}

export interface AccountantDataEntry {
  id: string;
  code: string;
  description: string;
  type: string;
  status: string;
  expectedAmount: number;
  actualAmount: number | null;
  dueDate: string;
  paymentDate: string | null;
  categoryId: string;
  categoryName?: string;
}

export interface AccountantDataSummary {
  totalRevenue: number;
  totalExpenses: number;
  netResult: number;
  entryCount: number;
}

export interface AccountantPortalData {
  tenantName: string;
  period: { year: number; month: number };
  categories: AccountantDataCategory[];
  entries: AccountantDataEntry[];
  summary: AccountantDataSummary;
}

export interface AccountantDreReport {
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  netResult: number;
  monthly: Array<{
    month: number;
    revenue: number;
    expenses: number;
    result: number;
  }>;
}
