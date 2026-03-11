/**
 * OpenSea OS - Company Validation Schemas (Finance)
 *
 * Schemas de validação Zod para formulários de empresa.
 * Inclui validações de CNPJ, e-mail e campos obrigatórios.
 */

import { z } from 'zod';

/* ===========================================
   HELPER VALIDATORS
   =========================================== */

const cnpjValidator = z
  .string()
  .min(1, 'CNPJ é obrigatório')
  .refine(
    val => {
      const cleaned = val.replace(/\D/g, '');
      return cleaned.length === 14;
    },
    { message: 'CNPJ deve ter 14 dígitos' }
  )
  .refine(
    val => {
      const cleaned = val.replace(/\D/g, '');

      if (/^(\d)\1{13}$/.test(cleaned)) return false;

      let sum = 0;
      let weight = 5;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(cleaned[i]) * weight;
        weight = weight === 2 ? 9 : weight - 1;
      }
      let digit = 11 - (sum % 11);
      if (digit > 9) digit = 0;
      if (parseInt(cleaned[12]) !== digit) return false;

      sum = 0;
      weight = 6;
      for (let i = 0; i < 13; i++) {
        sum += parseInt(cleaned[i]) * weight;
        weight = weight === 2 ? 9 : weight - 1;
      }
      digit = 11 - (sum % 11);
      if (digit > 9) digit = 0;
      if (parseInt(cleaned[13]) !== digit) return false;

      return true;
    },
    { message: 'CNPJ inválido' }
  );

const optionalEmailValidator = z
  .string()
  .email('E-mail inválido')
  .optional()
  .nullable()
  .or(z.literal(''));

const optionalPhoneValidator = z
  .string()
  .optional()
  .nullable()
  .refine(
    val => {
      if (!val || val === '') return true;
      const cleaned = val.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 11;
    },
    { message: 'Telefone inválido' }
  );

/* ===========================================
   ENUM SCHEMAS
   =========================================== */

export const companyStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'], {
  message: 'Status inválido',
});

export const taxRegimeSchema = z.enum(
  ['SIMPLES', 'LUCRO_PRESUMIDO', 'LUCRO_REAL', 'IMUNE_ISENTA', 'OUTROS'],
  {
    message: 'Regime tributário inválido',
  }
);

/* ===========================================
   MAIN SCHEMAS
   =========================================== */

export const createCompanySchema = z.object({
  legalName: z
    .string()
    .min(3, 'Razão social deve ter no mínimo 3 caracteres')
    .max(255, 'Razão social muito longa'),

  tradeName: z
    .string()
    .max(255, 'Nome fantasia muito longo')
    .optional()
    .nullable()
    .or(z.literal('')),

  cnpj: cnpjValidator,

  stateRegistration: z
    .string()
    .max(50, 'Inscrição estadual muito longa')
    .optional()
    .nullable()
    .or(z.literal('')),

  municipalRegistration: z
    .string()
    .max(50, 'Inscrição municipal muito longa')
    .optional()
    .nullable()
    .or(z.literal('')),

  legalNature: z
    .string()
    .max(255, 'Natureza jurídica muito longa')
    .optional()
    .nullable()
    .or(z.literal('')),

  taxRegime: taxRegimeSchema.optional(),

  taxRegimeDetail: z
    .string()
    .max(255, 'Detalhe do regime muito longo')
    .optional()
    .nullable()
    .or(z.literal('')),

  activityStartDate: z
    .string()
    .optional()
    .nullable()
    .refine(
      val => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Data inválida' }
    ),

  status: companyStatusSchema.default('ACTIVE'),

  email: optionalEmailValidator,
  phoneMain: optionalPhoneValidator,
  phoneAlt: optionalPhoneValidator,

  logoUrl: z
    .string()
    .url('URL inválida')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export const updateCompanySchema = createCompanySchema.partial();

/* ===========================================
   SUB-RESOURCE SCHEMAS
   =========================================== */

export const addressTypeSchema = z.enum(
  ['FISCAL', 'DELIVERY', 'BILLING', 'OTHER'],
  {
    message: 'Tipo de endereço inválido',
  }
);

export const companyAddressSchema = z.object({
  type: addressTypeSchema,

  zip: z
    .string()
    .min(1, 'CEP é obrigatório')
    .refine(
      val => {
        const cleaned = val.replace(/\D/g, '');
        return cleaned.length === 8;
      },
      { message: 'CEP deve ter 8 dígitos' }
    ),

  street: z.string().max(255, 'Logradouro muito longo').optional().nullable(),
  number: z.string().max(20, 'Número muito longo').optional().nullable(),
  complement: z
    .string()
    .max(100, 'Complemento muito longo')
    .optional()
    .nullable(),
  district: z.string().max(100, 'Bairro muito longo').optional().nullable(),
  city: z.string().max(100, 'Cidade muito longa').optional().nullable(),
  state: z
    .string()
    .max(2, 'Use a sigla do estado (2 letras)')
    .optional()
    .nullable(),
  ibgeCityCode: z
    .string()
    .max(10, 'Código IBGE inválido')
    .optional()
    .nullable(),
  countryCode: z
    .string()
    .max(3, 'Código de país inválido')
    .optional()
    .nullable(),
  isPrimary: z.boolean().default(false),
});

export const companyCnaeSchema = z.object({
  code: z
    .string()
    .min(1, 'Código CNAE é obrigatório')
    .max(10, 'Código CNAE inválido'),

  description: z
    .string()
    .max(500, 'Descrição muito longa')
    .optional()
    .nullable(),

  isPrimary: z.boolean().default(false),

  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const companyStakeholderSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(255, 'Nome muito longo'),

  role: z.string().max(100, 'Cargo muito longo').optional().nullable(),

  personDocumentMasked: z
    .string()
    .max(20, 'Documento muito longo')
    .optional()
    .nullable(),

  isLegalRepresentative: z.boolean().default(false),

  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),

  entryDate: z.string().optional().nullable(),
  exitDate: z.string().optional().nullable(),
  source: z.string().max(50, 'Fonte muito longa').optional().nullable(),
});

/* ===========================================
   TYPE EXPORTS
   =========================================== */

export type CreateCompanyFormData = z.infer<typeof createCompanySchema>;
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>;
export type CompanyAddressFormData = z.infer<typeof companyAddressSchema>;
export type CompanyCnaeFormData = z.infer<typeof companyCnaeSchema>;
export type CompanyStakeholderFormData = z.infer<
  typeof companyStakeholderSchema
>;
export type CompanyStatus = z.infer<typeof companyStatusSchema>;
export type TaxRegime = z.infer<typeof taxRegimeSchema>;
export type AddressType = z.infer<typeof addressTypeSchema>;

export default createCompanySchema;
