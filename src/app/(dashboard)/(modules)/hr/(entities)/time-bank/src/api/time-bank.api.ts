/**
 * OpenSea OS - Time Bank API
 */

import { timeBankService } from '@/services/hr';
import type {
  TimeBankResponse,
  TimeBanksResponse,
  CreditDebitTimeBankRequest,
  AdjustTimeBankRequest,
  ListTimeBanksParams,
} from '@/services/hr/time-bank.service';
import type { TimeBank } from '@/types/hr';

export const timeBankApi = {
  async list(params?: ListTimeBanksParams): Promise<TimeBanksResponse> {
    return timeBankService.list(params);
  },

  async getByEmployee(employeeId: string, year?: number): Promise<TimeBank> {
    const { timeBank } = await timeBankService.getByEmployee(employeeId, year);
    return timeBank;
  },

  async credit(data: CreditDebitTimeBankRequest): Promise<TimeBank> {
    const { timeBank } = await timeBankService.credit(data);
    return timeBank;
  },

  async debit(data: CreditDebitTimeBankRequest): Promise<TimeBank> {
    const { timeBank } = await timeBankService.debit(data);
    return timeBank;
  },

  async adjust(data: AdjustTimeBankRequest): Promise<TimeBank> {
    const { timeBank } = await timeBankService.adjust(data);
    return timeBank;
  },
};

export type {
  TimeBankResponse,
  TimeBanksResponse,
  CreditDebitTimeBankRequest,
  AdjustTimeBankRequest,
  ListTimeBanksParams,
};
