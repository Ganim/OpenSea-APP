import { apiClient } from '@/lib/api-client';
import type {
  MedicalExam,
  CreateMedicalExamData,
  UpdateMedicalExamData,
  OccupationalExamRequirement,
  CreateExamRequirementData,
  EmployeeCompliance,
  MedicalExamStatus,
} from '@/types/hr';

export interface MedicalExamResponse {
  medicalExam: MedicalExam;
}

export interface MedicalExamsResponse {
  medicalExams: MedicalExam[];
}

export interface ExpiringExamsResponse {
  expiringExams: MedicalExam[];
}

export interface OverdueExamsResponse {
  overdueExams: MedicalExam[];
}

export interface ExamRequirementResponse {
  examRequirement: OccupationalExamRequirement;
}

export interface ExamRequirementsResponse {
  examRequirements: OccupationalExamRequirement[];
}

export interface ListMedicalExamsParams {
  employeeId?: string;
  type?: string;
  result?: string;
  aptitude?: string;
  status?: MedicalExamStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

export interface ListExamRequirementsParams {
  positionId?: string;
  examCategory?: string;
  page?: number;
  perPage?: number;
}

export const medicalExamsService = {
  async list(params?: ListMedicalExamsParams): Promise<MedicalExamsResponse> {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.type) query.append('type', params.type);
    if (params?.result) query.append('result', params.result);
    if (params?.aptitude) query.append('aptitude', params.aptitude);
    if (params?.status) query.append('status', params.status);
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

  async listExpiring(daysThreshold = 30): Promise<ExpiringExamsResponse> {
    return apiClient.get<ExpiringExamsResponse>(
      `/v1/hr/medical-exams/expiring?daysThreshold=${daysThreshold}`
    );
  },

  async listOverdue(): Promise<OverdueExamsResponse> {
    return apiClient.get<OverdueExamsResponse>('/v1/hr/medical-exams/overdue');
  },

  async checkCompliance(employeeId: string): Promise<EmployeeCompliance> {
    return apiClient.get<EmployeeCompliance>(
      `/v1/hr/medical-exams/compliance/${employeeId}`
    );
  },

  // Exam Requirements
  async listRequirements(
    params?: ListExamRequirementsParams
  ): Promise<ExamRequirementsResponse> {
    const query = new URLSearchParams();
    if (params?.positionId) query.append('positionId', params.positionId);
    if (params?.examCategory) query.append('examCategory', params.examCategory);
    if (params?.page) query.append('page', String(params.page));
    if (params?.perPage) query.append('perPage', String(params.perPage));
    const qs = query.toString();
    return apiClient.get<ExamRequirementsResponse>(
      `/v1/hr/exam-requirements${qs ? `?${qs}` : ''}`
    );
  },

  async createRequirement(
    data: CreateExamRequirementData
  ): Promise<ExamRequirementResponse> {
    return apiClient.post<ExamRequirementResponse>(
      '/v1/hr/exam-requirements',
      data
    );
  },

  async deleteRequirement(id: string): Promise<void> {
    return apiClient.delete<void>(`/v1/hr/exam-requirements/${id}`);
  },
};
