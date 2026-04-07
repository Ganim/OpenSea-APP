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
  async listMandates(
    params?: ListCipaMandatesParams
  ): Promise<CipaMandatesResponse> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    const qs = query.toString();
    const raw = await apiClient.get<{ cipaMandates: CipaMandate[] }>(
      `/v1/hr/cipa-mandates${qs ? `?${qs}` : ''}`
    );
    return { mandates: raw.cipaMandates ?? [] };
  },

  async getMandate(id: string): Promise<CipaMandateResponse> {
    const raw = await apiClient.get<{ cipaMandate: CipaMandate }>(
      `/v1/hr/cipa-mandates/${id}`
    );
    return { mandate: raw.cipaMandate };
  },

  async createMandate(
    data: CreateCipaMandateData
  ): Promise<CipaMandateResponse> {
    const raw = await apiClient.post<{ cipaMandate: CipaMandate }>(
      '/v1/hr/cipa-mandates',
      data
    );
    return { mandate: raw.cipaMandate };
  },

  async updateMandate(
    id: string,
    data: UpdateCipaMandateData
  ): Promise<CipaMandateResponse> {
    const raw = await apiClient.patch<{ cipaMandate: CipaMandate }>(
      `/v1/hr/cipa-mandates/${id}`,
      data
    );
    return { mandate: raw.cipaMandate };
  },

  async deleteMandate(id: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/cipa-mandates/${id}`);
  },

  // Members
  async listMembers(mandateId: string): Promise<CipaMembersResponse> {
    const raw = await apiClient.get<{ cipaMembers: CipaMember[] }>(
      `/v1/hr/cipa-mandates/${mandateId}/members`
    );
    return { members: raw.cipaMembers ?? [] };
  },

  async addMember(
    mandateId: string,
    data: CreateCipaMemberData
  ): Promise<CipaMemberResponse> {
    const raw = await apiClient.post<{ cipaMember: CipaMember }>(
      `/v1/hr/cipa-mandates/${mandateId}/members`,
      data
    );
    return { member: raw.cipaMember };
  },

  async updateMember(
    mandateId: string,
    memberId: string,
    data: UpdateCipaMemberData
  ): Promise<CipaMemberResponse> {
    const raw = await apiClient.patch<{ cipaMember: CipaMember }>(
      `/v1/hr/cipa-mandates/${mandateId}/members/${memberId}`,
      data
    );
    return { member: raw.cipaMember };
  },

  async removeMember(mandateId: string, memberId: string): Promise<void> {
    return apiClient.delete<void>(
      `/v1/hr/cipa-mandates/${mandateId}/members/${memberId}`
    );
  },
};
