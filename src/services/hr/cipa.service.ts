import { apiClient } from '@/lib/api-client';
import type {
  CipaMandate,
  CreateCipaMandateData,
  UpdateCipaMandateData,
  CipaMember,
  CreateCipaMemberData,
  UpdateCipaMemberData,
} from '@/types/hr';

export interface CipaMandateResponse {
  mandate: CipaMandate;
}

export interface CipaMandatesResponse {
  mandates: CipaMandate[];
}

export interface CipaMemberResponse {
  member: CipaMember;
}

export interface CipaMembersResponse {
  members: CipaMember[];
}

export interface ListCipaMandatesParams {
  status?: string;
  page?: number;
  perPage?: number;
}

export const cipaService = {
  // Mandates
  async listMandates(params?: ListCipaMandatesParams): Promise<CipaMandatesResponse> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    const qs = query.toString();
    return apiClient.get<CipaMandatesResponse>(
      `/v1/hr/cipa/mandates${qs ? `?${qs}` : ''}`
    );
  },

  async getMandate(id: string): Promise<CipaMandateResponse> {
    return apiClient.get<CipaMandateResponse>(`/v1/hr/cipa/mandates/${id}`);
  },

  async createMandate(data: CreateCipaMandateData): Promise<CipaMandateResponse> {
    return apiClient.post<CipaMandateResponse>('/v1/hr/cipa/mandates', data);
  },

  async updateMandate(
    id: string,
    data: UpdateCipaMandateData
  ): Promise<CipaMandateResponse> {
    return apiClient.patch<CipaMandateResponse>(
      `/v1/hr/cipa/mandates/${id}`,
      data
    );
  },

  async deleteMandate(id: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/cipa/mandates/${id}`);
  },

  // Members
  async listMembers(mandateId: string): Promise<CipaMembersResponse> {
    return apiClient.get<CipaMembersResponse>(
      `/v1/hr/cipa/mandates/${mandateId}/members`
    );
  },

  async addMember(
    mandateId: string,
    data: CreateCipaMemberData
  ): Promise<CipaMemberResponse> {
    return apiClient.post<CipaMemberResponse>(
      `/v1/hr/cipa/mandates/${mandateId}/members`,
      data
    );
  },

  async updateMember(
    mandateId: string,
    memberId: string,
    data: UpdateCipaMemberData
  ): Promise<CipaMemberResponse> {
    return apiClient.patch<CipaMemberResponse>(
      `/v1/hr/cipa/mandates/${mandateId}/members/${memberId}`,
      data
    );
  },

  async removeMember(mandateId: string, memberId: string): Promise<void> {
    return apiClient.delete<void>(
      `/v1/hr/cipa/mandates/${mandateId}/members/${memberId}`
    );
  },
};
