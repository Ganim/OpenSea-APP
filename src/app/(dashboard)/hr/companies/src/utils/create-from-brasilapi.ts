/**
 * Utilitários para criar empresa com dados importados
 */

import type { BrasilAPICompanyData } from '@/types/brasilapi';
import type { Company } from '@/types/hr';
import {
  companiesApi,
  companyAddressesApi,
  companyCnaesApi,
  companyFiscalSettingsApi,
  companyStakeholdersApi,
} from '../api';
import { mapBrasilAPIToCompanyData } from './brasilapi-mapper';

/**
 * Cria uma empresa com dados importados da BrasilAPI
 */
export async function createCompanyFromBrasilAPI(
  brasilData: BrasilAPICompanyData
): Promise<Company> {
  const importedData = mapBrasilAPIToCompanyData(brasilData);

  try {
    // 1. Criar empresa base
    let company: Company;
    try {
      company = await companiesApi.create(importedData.company);

      // Valida se temos pelo menos um ID
      if (!company || !company.id) {
        console.warn(
          '[CreateCompanyFromBrasilAPI] Empresa criada mas sem ID, tentando refetch...'
        );
        throw new Error(
          'API retornou empresa sem ID. A empresa pode ter sido criada, mas não conseguimos recuperar os dados.'
        );
      }
    } catch (error) {
      // Se o erro mencionar CNPJ duplicado, re-lança com mensagem clara
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.toLowerCase().includes('cnpj') ||
        errorMessage.toLowerCase().includes('unique') ||
        errorMessage.toLowerCase().includes('já existe')
      ) {
        throw new Error(`Este CNPJ já está cadastrado no sistema.`);
      }
      throw error;
    }

    try {
      // 2. Criar endereço fiscal
      if (importedData.addresses.length > 0) {
        const primaryAddress = importedData.addresses[0];
        try {
          await companyAddressesApi.create(company.id, primaryAddress);
        } catch (addressError) {
          console.warn(
            '[CreateCompanyFromBrasilAPI] Erro ao criar endereço:',
            addressError
          );
          // Continua mesmo se o endereço falhar
        }
      }

      // 3. Criar CNAEs
      if (importedData.cnaes.length > 0) {
        for (const cnae of importedData.cnaes) {
          try {
            await companyCnaesApi.create(company.id, cnae);
          } catch (cnaeError) {
            console.warn(
              '[CreateCompanyFromBrasilAPI] Erro ao criar CNAE:',
              cnaeError
            );
            // Continua mesmo se o CNAE falhar
          }
        }
      }

      // 4. Criar Stakeholders
      if (importedData.stakeholders.length > 0) {
        for (const stakeholder of importedData.stakeholders) {
          try {
            await companyStakeholdersApi.create(company.id, stakeholder);
          } catch (stakeholderError) {
            console.warn(
              '[CreateCompanyFromBrasilAPI] Erro ao criar stakeholder:',
              stakeholderError
            );
            // Continua mesmo se o stakeholder falhar
          }
        }
      }

      // 5. Criar Configurações Fiscais
      if (importedData.fiscalSettings) {
        try {
          await companyFiscalSettingsApi.create(
            company.id,
            importedData.fiscalSettings
          );
        } catch (fiscalError) {
          console.warn(
            '[CreateCompanyFromBrasilAPI] Erro ao criar configurações fiscais:',
            fiscalError
          );
          // Continua mesmo se as configurações fiscais falharem
        }
      }

      return company;
    } catch (error) {
      console.error(
        '[CreateCompanyFromBrasilAPI] Erro crítico ao criar adjuntos:',
        error
      );
      // Retorna a empresa criada mesmo que os adjuntos falharem
      // O usuário pode completar depois
      return company;
    }
  } catch (error) {
    console.error('[CreateCompanyFromBrasilAPI] Erro ao criar empresa:', error);
    throw error;
  }
}
