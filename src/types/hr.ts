// HR Types

/**
 * Department
 * Representa um departamento na estrutura organizacional
 */
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  companyId: string;
  company?: Company | null;
  parentId?: string | null;
  managerId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // Dados enriquecidos da API
  _count?: {
    positions?: number;
    employees?: number;
  };
  positions?: Position[];
  employees?: Employee[];
}

/**
 * CreateDepartmentData
 * Dados para criar um novo departamento
 */
export interface CreateDepartmentData {
  name: string;
  code: string;
  companyId: string;
  description?: string;
  parentId?: string | null;
  managerId?: string | null;
  isActive?: boolean;
}

/**
 * UpdateDepartmentData
 * Dados para atualizar um departamento existente
 */
export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  companyId?: string;
  description?: string;
  parentId?: string | null;
  managerId?: string | null;
  isActive?: boolean;
}

/**
 * Position
 * Representa um cargo na estrutura organizacional
 */
export interface Position {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  departmentId?: string | null;
  department?: Department | null;
  level: number;
  minSalary?: number | null;
  maxSalary?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // Dados enriquecidos da API
  _count?: {
    employees?: number;
  };
  employees?: Employee[];
}

/**
 * CreatePositionData
 * Dados para criar um novo cargo
 */
export interface CreatePositionData {
  name: string;
  code: string;
  description?: string;
  departmentId?: string | null;
  level?: number;
  minSalary?: number;
  maxSalary?: number;
  isActive?: boolean;
}

/**
 * UpdatePositionData
 * Dados para atualizar um cargo existente
 */
export interface UpdatePositionData {
  name?: string;
  code?: string;
  description?: string;
  departmentId?: string | null;
  level?: number;
  minSalary?: number;
  maxSalary?: number;
  isActive?: boolean;
}

/**
 * ContractType
 * Tipos de contrato de trabalho
 */
export type ContractType = 'CLT' | 'PJ' | 'INTERN' | 'TEMPORARY' | 'APPRENTICE';

/**
 * WorkRegime
 * Regimes de trabalho
 */
export type WorkRegime =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'HOURLY'
  | 'SHIFT'
  | 'FLEXIBLE';

/**
 * CompanyStatus
 * Status possíveis para uma empresa
 */
export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

/**
 * TaxRegime
 * Regimes tributários suportados
 */
export type TaxRegime =
  | 'SIMPLES'
  | 'LUCRO_PRESUMIDO'
  | 'LUCRO_REAL'
  | 'IMUNE_ISENTA'
  | 'OUTROS';

/**
 * Employee
 * Representa um funcionário na organização
 */
export interface Employee {
  id: string;
  registrationNumber: string;
  fullName: string;
  cpf: string;
  hireDate: string;
  baseSalary: number;
  contractType: ContractType;
  workRegime: WorkRegime;
  weeklyHours: number;
  companyId?: string | null;
  company?: Company | null;
  departmentId?: string | null;
  department?: Department | null;
  positionId?: string | null;
  position?: Position | null;
  supervisorId?: string | null;
  userId?: string | null;
  socialName?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  birthPlace?: string | null;
  rg?: string | null;
  rgIssuer?: string | null;
  rgIssueDate?: string | null;
  pis?: string | null;
  ctpsNumber?: string | null;
  ctpsSeries?: string | null;
  ctpsState?: string | null;
  status?: string;
  terminationDate?: string | null;
  pendingIssues?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/**
 * CreateEmployeeData
 * Dados para criar um novo funcionário
 */
export interface CreateEmployeeData {
  registrationNumber: string;
  fullName: string;
  cpf: string;
  hireDate: string;
  baseSalary: number;
  contractType: ContractType;
  workRegime: WorkRegime;
  weeklyHours: number;
  departmentId?: string | null;
  positionId?: string | null;
  supervisorId?: string | null;
  userId?: string | null;
  socialName?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  birthPlace?: string;
  rg?: string;
  rgIssuer?: string;
  rgIssueDate?: string;
  pis?: string;
  ctpsNumber?: string;
  ctpsSeries?: string;
  ctpsState?: string;
  companyId?: string | null;
  status?: string;
  terminationDate?: string;
}

/**
 * UpdateEmployeeData
 * Dados para atualizar um funcionário existente
 */
export interface UpdateEmployeeData {
  registrationNumber?: string;
  fullName?: string;
  cpf?: string;
  hireDate?: string;
  baseSalary?: number;
  contractType?: ContractType;
  workRegime?: WorkRegime;
  weeklyHours?: number;
  departmentId?: string | null;
  positionId?: string | null;
  supervisorId?: string | null;
  userId?: string | null;
  socialName?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  birthPlace?: string;
  rg?: string;
  rgIssuer?: string;
  rgIssueDate?: string;
  pis?: string;
  ctpsNumber?: string;
  ctpsSeries?: string;
  ctpsState?: string;
  companyId?: string | null;
  status?: string;
  terminationDate?: string;
}

/**
 * Company
 * Representa uma empresa na organização
 */
export interface Company {
  id: string;
  legalName: string;
  tradeName?: string | null;
  cnpj: string;
  stateRegistration?: string | null;
  municipalRegistration?: string | null;
  legalNature?: string | null;
  taxRegime?: TaxRegime | null;
  taxRegimeDetail?: string | null;
  activityStartDate?: string | null;
  status: CompanyStatus;
  email?: string | null;
  phoneMain?: string | null;
  phoneAlt?: string | null;
  logoUrl?: string | null;
  pendingIssues?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // Dados enriquecidos da API
  _count?: {
    departments?: number;
    employees?: number;
  };
  departments?: Department[];
  employees?: Employee[];
}

/**
 * CreateCompanyData
 * Dados para criar uma nova empresa
 */
export interface CreateCompanyData {
  legalName: string;
  tradeName?: string | null;
  cnpj: string;
  stateRegistration?: string | null;
  municipalRegistration?: string | null;
  legalNature?: string | null;
  taxRegime?: TaxRegime;
  taxRegimeDetail?: string | null;
  activityStartDate?: string | null;
  status?: CompanyStatus;
  email?: string | null;
  phoneMain?: string | null;
  phoneAlt?: string | null;
  logoUrl?: string | null;
}

/**
 * UpdateCompanyData
 * Dados para atualizar uma empresa existente
 */
export interface UpdateCompanyData {
  legalName?: string;
  tradeName?: string | null;
  cnpj?: string;
  stateRegistration?: string | null;
  municipalRegistration?: string | null;
  legalNature?: string | null;
  taxRegime?: TaxRegime;
  taxRegimeDetail?: string | null;
  activityStartDate?: string | null;
  status?: CompanyStatus;
  email?: string | null;
  phoneMain?: string | null;
  phoneAlt?: string | null;
  logoUrl?: string | null;
}

// ----------------------------------------------------------------------------
// CompanyAddress
// ----------------------------------------------------------------------------

export type CompanyAddressType = 'FISCAL' | 'DELIVERY' | 'BILLING' | 'OTHER';

export interface CompanyAddress {
  id: string;
  companyId: string;
  type: CompanyAddressType;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  zip: string;
  ibgeCityCode?: string | null;
  countryCode?: string | null;
  isPrimary: boolean;
  metadata?: Record<string, unknown>;
  pendingIssues?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateCompanyAddressData {
  type: CompanyAddressType;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  zip: string;
  ibgeCityCode?: string | null;
  countryCode?: string | null;
  isPrimary?: boolean;
  metadata?: Record<string, unknown>;
}

export type UpdateCompanyAddressData = Partial<CreateCompanyAddressData>;

// ----------------------------------------------------------------------------
// CompanyCNAE
// ----------------------------------------------------------------------------

export interface CompanyCnae {
  id: string;
  companyId: string;
  code: string;
  description?: string | null;
  isPrimary: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  metadata?: Record<string, unknown>;
  pendingIssues?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateCompanyCnaeData {
  code: string;
  description?: string | null;
  isPrimary?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  metadata?: Record<string, unknown>;
}

export type UpdateCompanyCnaeData = Partial<CreateCompanyCnaeData>;

// ----------------------------------------------------------------------------
// CompanyFiscalSettings
// ----------------------------------------------------------------------------

export interface CompanyFiscalSettings {
  id: string;
  companyId: string;
  nfeEnvironment?: 'PRODUCTION' | 'HOMOLOGATION';
  nfeSeries?: string | null;
  nfeLastNumber?: number | null;
  nfeDefaultOperationNature?: string | null;
  nfeDefaultCfop?: string | null;
  digitalCertificateType?: 'NONE' | 'A1' | 'A3';
  certificateA1ExpiresAt?: string | null;
  nfceEnabled?: boolean;
  nfceCscId?: string | null;
  defaultTaxProfileId?: string | null;
  metadata?: Record<string, unknown>;
  pendingIssues?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type CreateCompanyFiscalSettingsData = Omit<
  CompanyFiscalSettings,
  'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'pendingIssues'
>;

export type UpdateCompanyFiscalSettingsData =
  Partial<CreateCompanyFiscalSettingsData>;

// ----------------------------------------------------------------------------
// CompanyStakeholder
// ----------------------------------------------------------------------------

export interface CompanyStakeholder {
  id: string;
  companyId: string;
  name: string;
  role?: string | null;
  personDocumentMasked?: string | null;
  email?: string | null;
  phone?: string | null;
  isLegalRepresentative?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  entranceDate?: string | null;
  exitDate?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown>;
  pendingIssues?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateCompanyStakeholderData {
  name: string;
  role?: string | null;
  personDocumentMasked?: string | null;
  email?: string | null;
  phone?: string | null;
  isLegalRepresentative?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  entranceDate?: string | null;
  exitDate?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown>;
}

export type UpdateCompanyStakeholderData =
  Partial<CreateCompanyStakeholderData>;
