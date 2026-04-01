/**
 * Recruitment / ATS Types
 * Tipos do módulo de Recrutamento e Seleção
 */

// =============================================================================
// Enums
// =============================================================================

export type JobPostingStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'FILLED';
export type JobPostingType = 'FULL_TIME' | 'PART_TIME' | 'INTERN' | 'TEMPORARY';

export type CandidateSource =
  | 'WEBSITE'
  | 'LINKEDIN'
  | 'REFERRAL'
  | 'AGENCY'
  | 'OTHER';

export type ApplicationStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'ASSESSMENT'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type InterviewStageType =
  | 'SCREENING'
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'CULTURE_FIT'
  | 'FINAL';

export type InterviewStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type InterviewRecommendation = 'ADVANCE' | 'HOLD' | 'REJECT';

// =============================================================================
// Entities
// =============================================================================

export interface JobPosting {
  id: string;
  title: string;
  description?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  status: JobPostingStatus;
  type: JobPostingType;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  requirements?: Record<string, unknown> | null;
  benefits?: string | null;
  maxApplicants?: number | null;
  publishedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // Enriched
  department?: { id: string; name: string } | null;
  position?: { id: string; name: string } | null;
  _count?: {
    applications?: number;
    interviewStages?: number;
  };
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  resumeUrl?: string | null;
  linkedinUrl?: string | null;
  source: CandidateSource;
  notes?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  _count?: {
    applications?: number;
  };
}

export interface Application {
  id: string;
  jobPostingId: string;
  candidateId: string;
  status: ApplicationStatus;
  currentStageId?: string | null;
  appliedAt: string;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  hiredAt?: string | null;
  rating?: number | null;
  createdAt: string;
  updatedAt: string;
  // Enriched
  jobPosting?: JobPosting | null;
  candidate?: Candidate | null;
  currentStage?: InterviewStage | null;
}

export interface InterviewStage {
  id: string;
  jobPostingId: string;
  name: string;
  order: number;
  type: InterviewStageType;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  interviewStageId: string;
  interviewerId: string;
  scheduledAt: string;
  duration: number;
  location?: string | null;
  meetingUrl?: string | null;
  status: InterviewStatus;
  feedback?: string | null;
  rating?: number | null;
  recommendation?: InterviewRecommendation | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Enriched
  application?: Application | null;
  interviewStage?: InterviewStage | null;
  interviewer?: { id: string; fullName: string } | null;
}

// =============================================================================
// Create / Update DTOs
// =============================================================================

export interface CreateJobPostingData {
  title: string;
  description?: string;
  departmentId?: string;
  positionId?: string;
  type: JobPostingType;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  requirements?: Record<string, unknown>;
  benefits?: string;
  maxApplicants?: number;
}

export interface UpdateJobPostingData {
  title?: string;
  description?: string;
  departmentId?: string | null;
  positionId?: string | null;
  type?: JobPostingType;
  location?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  requirements?: Record<string, unknown>;
  benefits?: string;
  maxApplicants?: number | null;
}

export interface CreateCandidateData {
  fullName: string;
  email: string;
  phone?: string;
  cpf?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  source: CandidateSource;
  notes?: string;
  tags?: string[];
}

export interface UpdateCandidateData {
  fullName?: string;
  email?: string;
  phone?: string | null;
  cpf?: string | null;
  resumeUrl?: string | null;
  linkedinUrl?: string | null;
  source?: CandidateSource;
  notes?: string | null;
  tags?: string[];
}

export interface CreateApplicationData {
  jobPostingId: string;
  candidateId: string;
}

export interface UpdateApplicationStatusData {
  status: ApplicationStatus;
  currentStageId?: string;
}

export interface RejectApplicationData {
  rejectionReason?: string;
}

export interface CreateInterviewStageData {
  jobPostingId: string;
  name: string;
  type: InterviewStageType;
  description?: string;
}

export interface ReorderStagesData {
  stageIds: string[];
}

export interface ScheduleInterviewData {
  applicationId: string;
  interviewStageId: string;
  interviewerId: string;
  scheduledAt: string;
  duration: number;
  location?: string;
  meetingUrl?: string;
}

export interface CompleteInterviewData {
  feedback: string;
  rating: number;
  recommendation: InterviewRecommendation;
}
