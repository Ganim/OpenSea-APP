import { apiClient } from '@/lib/api-client';
import type {
  Survey,
  SurveyQuestion,
  SurveyResponse,
  CreateSurveyData,
  UpdateSurveyData,
  AddSurveyQuestionData,
  SubmitSurveyResponseData,
} from '@/types/hr';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface SurveysResponse {
  surveys: Survey[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SurveyDetailResponse {
  survey: Survey & { questions: SurveyQuestion[] };
}

export interface SurveyQuestionResponse {
  question: SurveyQuestion;
}

export interface SurveyResponseResponse {
  response: SurveyResponse;
}

// ============================================================================
// PARAMS
// ============================================================================

export interface ListSurveysParams {
  page?: number;
  perPage?: number;
  search?: string;
  type?: string;
  status?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function buildQuery(params?: ListSurveysParams): string {
  if (!params) return '';
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

// ============================================================================
// SERVICE
// ============================================================================

class SurveysService {
  private readonly baseUrl = '/v1/hr/surveys';

  async list(params?: ListSurveysParams): Promise<SurveysResponse> {
    const response = await apiClient.get<{ surveys: Survey[]; total: number }>(
      `${this.baseUrl}${buildQuery(params)}`
    );
    const total = response.total;
    const perPage = params?.perPage ?? 20;
    return {
      ...response,
      page: params?.page ?? 1,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async get(id: string): Promise<SurveyDetailResponse> {
    return apiClient.get<SurveyDetailResponse>(`${this.baseUrl}/${id}`);
  }

  async create(data: CreateSurveyData): Promise<{ survey: Survey }> {
    return apiClient.post<{ survey: Survey }>(this.baseUrl, data);
  }

  async update(
    id: string,
    data: UpdateSurveyData
  ): Promise<{ survey: Survey }> {
    return apiClient.put<{ survey: Survey }>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async activate(id: string): Promise<{ survey: Survey }> {
    return apiClient.patch<{ survey: Survey }>(
      `${this.baseUrl}/${id}/activate`
    );
  }

  async close(id: string): Promise<{ survey: Survey }> {
    return apiClient.patch<{ survey: Survey }>(`${this.baseUrl}/${id}/close`);
  }

  async addQuestion(
    surveyId: string,
    data: AddSurveyQuestionData
  ): Promise<SurveyQuestionResponse> {
    return apiClient.post<SurveyQuestionResponse>(
      `${this.baseUrl}/${surveyId}/questions`,
      data
    );
  }

  async submitResponse(
    surveyId: string,
    data: SubmitSurveyResponseData
  ): Promise<SurveyResponseResponse> {
    return apiClient.post<SurveyResponseResponse>(
      `${this.baseUrl}/${surveyId}/responses`,
      data
    );
  }
}

export const surveysService = new SurveysService();
