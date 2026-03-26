import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

export interface FormsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FormsResponse {
  forms: Record<string, unknown>[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface FormResponse {
  form: Record<string, unknown>;
}

export interface FormSubmissionsResponse {
  submissions: Record<string, unknown>[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface FormSubmissionResponse {
  submission: Record<string, unknown>;
}

export const formsService = {
  async list(params?: FormsQuery): Promise<FormsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.FORMS.LIST}?${query}`
      : API_ENDPOINTS.FORMS.LIST;
    return apiClient.get<FormsResponse>(url);
  },

  async get(id: string): Promise<FormResponse> {
    return apiClient.get<FormResponse>(API_ENDPOINTS.FORMS.GET(id));
  },

  async create(data: Record<string, unknown>): Promise<FormResponse> {
    return apiClient.post<FormResponse>(API_ENDPOINTS.FORMS.CREATE, data);
  },

  async update(
    id: string,
    data: Record<string, unknown>
  ): Promise<FormResponse> {
    return apiClient.put<FormResponse>(API_ENDPOINTS.FORMS.UPDATE(id), data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.FORMS.DELETE(id));
  },

  async publish(id: string): Promise<FormResponse> {
    return apiClient.post<FormResponse>(API_ENDPOINTS.FORMS.PUBLISH(id), {});
  },

  async unpublish(id: string): Promise<FormResponse> {
    return apiClient.post<FormResponse>(API_ENDPOINTS.FORMS.UNPUBLISH(id), {});
  },

  async duplicate(id: string): Promise<FormResponse> {
    return apiClient.post<FormResponse>(API_ENDPOINTS.FORMS.DUPLICATE(id), {});
  },

  async listSubmissions(
    formId: string,
    params?: { page?: number; limit?: number }
  ): Promise<FormSubmissionsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.FORMS.SUBMISSIONS(formId)}?${query}`
      : API_ENDPOINTS.FORMS.SUBMISSIONS(formId);
    return apiClient.get<FormSubmissionsResponse>(url);
  },

  async submitForm(
    formId: string,
    data: Record<string, unknown>
  ): Promise<FormSubmissionResponse> {
    return apiClient.post<FormSubmissionResponse>(
      API_ENDPOINTS.FORMS.SUBMIT(formId),
      data
    );
  },
};
