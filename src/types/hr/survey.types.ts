// ============================================================================
// SURVEY
// ============================================================================

export type SurveyType =
  | 'ENGAGEMENT'
  | 'SATISFACTION'
  | 'PULSE'
  | 'EXIT'
  | 'CUSTOM';

export type SurveyStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

export type SurveyQuestionType =
  | 'RATING_1_5'
  | 'RATING_1_10'
  | 'YES_NO'
  | 'TEXT'
  | 'MULTIPLE_CHOICE'
  | 'NPS';

export type SurveyQuestionCategory =
  | 'ENGAGEMENT'
  | 'LEADERSHIP'
  | 'CULTURE'
  | 'WORK_LIFE'
  | 'GROWTH'
  | 'COMPENSATION'
  | 'CUSTOM';

export interface Survey {
  id: string;
  title: string;
  description: string | null;
  type: SurveyType;
  status: SurveyStatus;
  isAnonymous: boolean;
  startDate: string | null;
  endDate: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    questions: number;
    responses: number;
  };
}

export interface SurveyQuestion {
  id: string;
  surveyId: string;
  text: string;
  type: SurveyQuestionType;
  options: string[] | null;
  order: number;
  isRequired: boolean;
  category: SurveyQuestionCategory;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  employeeId: string | null;
  submittedAt: string;
  createdAt: string;
  answers?: SurveyAnswer[];
}

export interface SurveyAnswer {
  questionId: string;
  ratingValue: number | null;
  textValue: string | null;
  selectedOptions: string[] | null;
}

// ============================================================================
// CREATE / UPDATE DATA
// ============================================================================

export interface CreateSurveyData {
  title: string;
  description?: string;
  type: SurveyType;
  isAnonymous?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdateSurveyData {
  title?: string;
  description?: string;
  type?: SurveyType;
  isAnonymous?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface AddSurveyQuestionData {
  text: string;
  type: SurveyQuestionType;
  options?: string[];
  order?: number;
  isRequired?: boolean;
  category?: SurveyQuestionCategory;
}

export interface SubmitSurveyResponseData {
  answers: SurveyAnswer[];
}
