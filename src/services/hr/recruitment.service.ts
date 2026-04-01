import { apiClient } from '@/lib/api-client';
import type {
  JobPosting,
  Candidate,
  Application,
  InterviewStage,
  Interview,
  CreateJobPostingData,
  UpdateJobPostingData,
  CreateCandidateData,
  UpdateCandidateData,
  CreateApplicationData,
  UpdateApplicationStatusData,
  RejectApplicationData,
  CreateInterviewStageData,
  ReorderStagesData,
  ScheduleInterviewData,
  CompleteInterviewData,
} from '@/types/hr';
import type { PaginationMeta } from '@/types/pagination';

// =============================================================================
// Response types
// =============================================================================

export interface JobPostingsResponse {
  jobPostings: JobPosting[];
  total: number;
  page: number;
  totalPages: number;
  meta?: PaginationMeta;
}

export interface JobPostingResponse {
  jobPosting: JobPosting;
}

export interface CandidatesResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  totalPages: number;
  meta?: PaginationMeta;
}

export interface CandidateResponse {
  candidate: Candidate;
}

export interface ApplicationsResponse {
  applications: Application[];
  total: number;
  page: number;
  totalPages: number;
  meta?: PaginationMeta;
}

export interface ApplicationResponse {
  application: Application;
}

export interface InterviewStagesResponse {
  interviewStages: InterviewStage[];
}

export interface InterviewStageResponse {
  interviewStage: InterviewStage;
}

export interface InterviewsResponse {
  interviews: Interview[];
  total: number;
  page: number;
  totalPages: number;
  meta?: PaginationMeta;
}

export interface InterviewResponse {
  interview: Interview;
}

// =============================================================================
// List params
// =============================================================================

export interface ListJobPostingsParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  type?: string;
  departmentId?: string;
  positionId?: string;
}

export interface ListCandidatesParams {
  page?: number;
  perPage?: number;
  search?: string;
  source?: string;
  tags?: string;
}

export interface ListApplicationsParams {
  page?: number;
  perPage?: number;
  jobPostingId?: string;
  candidateId?: string;
  status?: string;
}

export interface ListInterviewsParams {
  page?: number;
  perPage?: number;
  applicationId?: string;
  interviewerId?: string;
  status?: string;
}

// =============================================================================
// Service
// =============================================================================

const BASE = '/v1/hr/recruitment';

function buildQuery(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  }
  const str = query.toString();
  return str ? `?${str}` : '';
}

export const recruitmentService = {
  // =========================================================================
  // Job Postings
  // =========================================================================

  async listJobPostings(
    params?: ListJobPostingsParams
  ): Promise<JobPostingsResponse> {
    return apiClient.get<JobPostingsResponse>(
      `${BASE}/job-postings${buildQuery((params ?? {}) as Record<string, unknown>)}`
    );
  },

  async getJobPosting(id: string): Promise<JobPostingResponse> {
    return apiClient.get<JobPostingResponse>(`${BASE}/job-postings/${id}`);
  },

  async createJobPosting(
    data: CreateJobPostingData
  ): Promise<JobPostingResponse> {
    return apiClient.post<JobPostingResponse>(`${BASE}/job-postings`, data);
  },

  async updateJobPosting(
    id: string,
    data: UpdateJobPostingData
  ): Promise<JobPostingResponse> {
    return apiClient.put<JobPostingResponse>(
      `${BASE}/job-postings/${id}`,
      data
    );
  },

  async deleteJobPosting(id: string): Promise<void> {
    return apiClient.delete<void>(`${BASE}/job-postings/${id}`);
  },

  async publishJobPosting(id: string): Promise<JobPostingResponse> {
    return apiClient.patch<JobPostingResponse>(
      `${BASE}/job-postings/${id}/publish`
    );
  },

  async closeJobPosting(id: string): Promise<JobPostingResponse> {
    return apiClient.patch<JobPostingResponse>(
      `${BASE}/job-postings/${id}/close`
    );
  },

  // =========================================================================
  // Candidates
  // =========================================================================

  async listCandidates(
    params?: ListCandidatesParams
  ): Promise<CandidatesResponse> {
    return apiClient.get<CandidatesResponse>(
      `${BASE}/candidates${buildQuery((params ?? {}) as Record<string, unknown>)}`
    );
  },

  async getCandidate(id: string): Promise<CandidateResponse> {
    return apiClient.get<CandidateResponse>(`${BASE}/candidates/${id}`);
  },

  async createCandidate(data: CreateCandidateData): Promise<CandidateResponse> {
    return apiClient.post<CandidateResponse>(`${BASE}/candidates`, data);
  },

  async updateCandidate(
    id: string,
    data: UpdateCandidateData
  ): Promise<CandidateResponse> {
    return apiClient.put<CandidateResponse>(`${BASE}/candidates/${id}`, data);
  },

  async deleteCandidate(id: string): Promise<void> {
    return apiClient.delete<void>(`${BASE}/candidates/${id}`);
  },

  // =========================================================================
  // Applications
  // =========================================================================

  async listApplications(
    params?: ListApplicationsParams
  ): Promise<ApplicationsResponse> {
    return apiClient.get<ApplicationsResponse>(
      `${BASE}/applications${buildQuery((params ?? {}) as Record<string, unknown>)}`
    );
  },

  async getApplication(id: string): Promise<ApplicationResponse> {
    return apiClient.get<ApplicationResponse>(`${BASE}/applications/${id}`);
  },

  async createApplication(
    data: CreateApplicationData
  ): Promise<ApplicationResponse> {
    return apiClient.post<ApplicationResponse>(`${BASE}/applications`, data);
  },

  async updateApplicationStatus(
    id: string,
    data: UpdateApplicationStatusData
  ): Promise<ApplicationResponse> {
    return apiClient.patch<ApplicationResponse>(
      `${BASE}/applications/${id}/status`,
      data
    );
  },

  async hireApplication(id: string): Promise<ApplicationResponse> {
    return apiClient.patch<ApplicationResponse>(
      `${BASE}/applications/${id}/hire`
    );
  },

  async rejectApplication(
    id: string,
    data?: RejectApplicationData
  ): Promise<ApplicationResponse> {
    return apiClient.patch<ApplicationResponse>(
      `${BASE}/applications/${id}/reject`,
      data ?? {}
    );
  },

  // =========================================================================
  // Interview Stages
  // =========================================================================

  async listInterviewStages(
    jobPostingId: string
  ): Promise<InterviewStagesResponse> {
    return apiClient.get<InterviewStagesResponse>(
      `${BASE}/job-postings/${jobPostingId}/stages`
    );
  },

  async createInterviewStage(
    data: CreateInterviewStageData
  ): Promise<InterviewStageResponse> {
    return apiClient.post<InterviewStageResponse>(
      `${BASE}/interview-stages`,
      data
    );
  },

  async deleteInterviewStage(id: string): Promise<void> {
    return apiClient.delete<void>(`${BASE}/interview-stages/${id}`);
  },

  async reorderInterviewStages(
    jobPostingId: string,
    data: ReorderStagesData
  ): Promise<void> {
    return apiClient.patch<void>(
      `${BASE}/job-postings/${jobPostingId}/stages/reorder`,
      data
    );
  },

  // =========================================================================
  // Interviews
  // =========================================================================

  async listInterviews(
    params?: ListInterviewsParams
  ): Promise<InterviewsResponse> {
    return apiClient.get<InterviewsResponse>(
      `${BASE}/interviews${buildQuery((params ?? {}) as Record<string, unknown>)}`
    );
  },

  async getInterview(id: string): Promise<InterviewResponse> {
    return apiClient.get<InterviewResponse>(`${BASE}/interviews/${id}`);
  },

  async scheduleInterview(
    data: ScheduleInterviewData
  ): Promise<InterviewResponse> {
    return apiClient.post<InterviewResponse>(`${BASE}/interviews`, data);
  },

  async completeInterview(
    id: string,
    data: CompleteInterviewData
  ): Promise<InterviewResponse> {
    return apiClient.patch<InterviewResponse>(
      `${BASE}/interviews/${id}/complete`,
      data
    );
  },

  async cancelInterview(id: string): Promise<InterviewResponse> {
    return apiClient.patch<InterviewResponse>(
      `${BASE}/interviews/${id}/cancel`
    );
  },
};
