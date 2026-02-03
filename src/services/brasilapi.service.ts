/**
 * BrasilAPI Service
 * Serviço para consultar dados da BrasilAPI
 */

import { brasilApiClient } from '@/lib/brasilapi-client';
import type { BrasilAPICep, BrasilAPICompanyData } from '@/types/brasilapi';

export const brasilApiService = {
  /**
   * Busca dados de uma empresa na BrasilAPI pelo CNPJ
   * @param cnpj - CNPJ da empresa (com ou sem formatação)
   * @returns Dados da empresa ou erro
   */
  async getCompanyByCnpj(cnpj: string): Promise<BrasilAPICompanyData> {
    const cleanCnpj = cnpj.replace(/\D/g, '');

    if (cleanCnpj.length !== 14) {
      throw new Error('CNPJ deve conter exatamente 14 dígitos.');
    }

    try {
      const data = await brasilApiClient.get<BrasilAPICompanyData>(
        `/cnpj/v1/${cleanCnpj}`
      );
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('404') ||
          error.message.includes('não encontrado')
        ) {
          throw new Error(`CNPJ ${cnpj} não encontrado na BrasilAPI.`);
        }
        if (
          error.message.includes('400') ||
          error.message.includes('inválido')
        ) {
          throw new Error('CNPJ inválido. Verifique o número digitado.');
        }
      }
      throw error;
    }
  },

  /**
   * Busca dados de endereço pelo CEP na BrasilAPI
   * @param cep - CEP a ser consultado (com ou sem formatação)
   * @returns Dados do endereço ou erro
   */
  async getCep(cep: string): Promise<BrasilAPICep> {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      throw new Error('CEP deve conter exatamente 8 dígitos.');
    }

    try {
      const data = await brasilApiClient.get<BrasilAPICep>(
        `/cep/v2/${cleanCep}`
      );
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('404') ||
          error.message.includes('não encontrado')
        ) {
          throw new Error(`CEP ${cep} não encontrado.`);
        }
        if (
          error.message.includes('400') ||
          error.message.includes('inválido')
        ) {
          throw new Error('CEP inválido. Verifique o número digitado.');
        }
      }
      throw error;
    }
  },
};
