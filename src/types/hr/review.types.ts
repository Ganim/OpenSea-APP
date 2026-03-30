// ============================================================================
// REVIEW CYCLE
// ============================================================================

export type ReviewCycleType =
  | 'ANNUAL'
  | 'SEMI_ANNUAL'
  | 'QUARTERLY'
  | 'PROBATION'
  | 'CUSTOM';

export type ReviewCycleStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'IN_REVIEW'
  | 'CALIBRATION'
  | 'CLOSED';

export interface ReviewCycle {
  id: string;
  name: string;
  description: string | null;
  type: ReviewCycleType;
  startDate: string;
  endDate: string;
  status: ReviewCycleStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewCycleData {
  name: string;
  description?: string;
  type: ReviewCycleType;
  startDate: string;
  endDate: string;
}

export interface UpdateReviewCycleData {
  name?: string;
  description?: string;
  type?: ReviewCycleType;
  startDate?: string;
  endDate?: string;
  status?: ReviewCycleStatus;
  isActive?: boolean;
}

// ============================================================================
// PERFORMANCE REVIEW
// ============================================================================

export type PerformanceReviewStatus =
  | 'PENDING'
  | 'SELF_ASSESSMENT'
  | 'MANAGER_REVIEW'
  | 'COMPLETED';

export interface PerformanceReview {
  id: string;
  reviewCycleId: string;
  employeeId: string;
  reviewerId: string;
  status: PerformanceReviewStatus;
  selfScore: number | null;
  managerScore: number | null;
  finalScore: number | null;
  selfComments: string | null;
  managerComments: string | null;
  strengths: string | null;
  improvements: string | null;
  goals: string | null;
  employeeAcknowledged: boolean;
  acknowledgedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAssignment {
  employeeId: string;
  reviewerId: string;
}

export interface CreateBulkReviewsData {
  reviewCycleId: string;
  assignments: ReviewAssignment[];
}

export interface SubmitSelfAssessmentData {
  selfScore: number;
  selfComments?: string;
  strengths?: string;
  improvements?: string;
  goals?: string;
}

export interface SubmitManagerReviewData {
  managerScore: number;
  managerComments?: string;
  strengths?: string;
  improvements?: string;
  goals?: string;
}
