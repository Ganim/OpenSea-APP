import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type { Company } from '@/types/hr';

export interface CompaniesResponse {
  companies: Company[];
  total: number;
  page: number;
  perPage: number;
}

export interface CompanyResponse {
  company: Company;
}

export interface CreateCompanyRequest {
  legalName: string;
  cnpj: string;
  taxRegime?: string;
  phone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  logoUrl?: string;
}

export interface UpdateCompanyRequest {
  legalName?: string;
  cnpj?: string;
  taxRegime?: string;
  phone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  logoUrl?: string;
}

export interface CheckCnpjRequest {
  cnpj: string;
}

export interface CheckCnpjResponse {
  exists: boolean;
  companyId?: string;
}

class CompaniesService {
  async listCompanies(
    page = 1,
    perPage = 20,
    search?: string,
    includeDeleted = false
  ): Promise<CompaniesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: perPage.toString(),
      includeDeleted: includeDeleted.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await apiClient.get<CompaniesResponse>(
      `${API_ENDPOINTS.COMPANIES.LIST}?${params.toString()}`
    );
    return response;
  }

  async getCompany(id: string): Promise<CompanyResponse> {
    const response = await apiClient.get<CompanyResponse>(
      API_ENDPOINTS.COMPANIES.GET(id)
    );
    return response;
  }

  async createCompany(data: CreateCompanyRequest): Promise<CompanyResponse> {
    const response = await apiClient.post<CompanyResponse>(
      API_ENDPOINTS.COMPANIES.CREATE,
      data
    );
    return response;
  }

  async updateCompany(
    id: string,
    data: UpdateCompanyRequest
  ): Promise<CompanyResponse> {
    const response = await apiClient.put<CompanyResponse>(
      API_ENDPOINTS.COMPANIES.UPDATE(id),
      data
    );
    return response;
  }

  async deleteCompany(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      API_ENDPOINTS.COMPANIES.DELETE(id)
    );
    return response;
  }

  async checkCnpj(cnpj: string): Promise<CheckCnpjResponse> {
    const response = await apiClient.post<CheckCnpjResponse>(
      API_ENDPOINTS.COMPANIES.CHECK_CNPJ,
      { cnpj }
    );
    return response;
  }
}

export const companiesService = new CompaniesService();
