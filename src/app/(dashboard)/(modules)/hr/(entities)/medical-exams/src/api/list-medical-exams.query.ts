/**
 * OpenSea OS - List Medical Exams Query
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { medicalExamsService } from '@/services/hr/medical-exams.service';
import type { MedicalExam } from '@/types/hr';
import { medicalExamKeys, type MedicalExamFilters } from './keys';

export interface ListMedicalExamsResponse {
  medicalExams: MedicalExam[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export function useListMedicalExams(params?: MedicalExamFilters) {
  return useInfiniteQuery<ListMedicalExamsResponse>({
    queryKey: medicalExamKeys.list(params),

    queryFn: async ({ pageParam }): Promise<ListMedicalExamsResponse> => {
      const page = pageParam as number;
      const response = await medicalExamsService.list({
        employeeId: params?.employeeId,
        type: params?.type,
        result: params?.result,
        aptitude: params?.aptitude,
        status: params?.status,
        startDate: params?.startDate,
        endDate: params?.endDate,
        page,
        perPage: PAGE_SIZE,
      });

      const exams =
        (response as { medicalExams?: MedicalExam[] }).medicalExams ?? [];

      return {
        medicalExams: exams,
        total: exams.length,
        page,
        perPage: PAGE_SIZE,
        hasMore: exams.length >= PAGE_SIZE,
      };
    },

    initialPageParam: 1,
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default useListMedicalExams;
