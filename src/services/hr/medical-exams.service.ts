import { apiClient } from '@/lib/api-client';
import type {
  MedicalExam,
  CreateMedicalExamData,
  UpdateMedicalExamData,
} from '@/types/hr';

export interface MedicalExamResponse {
  medicalExam: MedicalExam;
}

export interface MedicalExamsResponse {
  medicalExams: MedicalExam[];
}

export interface ListMedicalExamsParams {
  employeeId?: string;
  type?: string;
  result?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

export const medicalExamsService = {
  async list(params?: ListMedicalExamsParams): Promise<MedicalExamsResponse> {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.type) query.append('type', params.type);
    if (params?.result) query.append('result', params.result);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    const qs = query.toString();
    return apiClient.get<MedicalExamsResponse>(
      `/v1/hr/medical-exams${qs ? `?${qs}` : ''}`
    );
  },

  async get(id: string): Promise<MedicalExamResponse> {
    return apiClient.get<MedicalExamResponse>(`/v1/hr/medical-exams/${id}`);
  },

  async create(data: CreateMedicalExamData): Promise<MedicalExamResponse> {
    return apiClient.post<MedicalExamResponse>('/v1/hr/medical-exams', data);
  },

  async update(
    id: string,
    data: UpdateMedicalExamData
  ): Promise<MedicalExamResponse> {
    return apiClient.patch<MedicalExamResponse>(
      `/v1/hr/medical-exams/${id}`,
      data
    );
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/medical-exams/${id}`);
  },
};
