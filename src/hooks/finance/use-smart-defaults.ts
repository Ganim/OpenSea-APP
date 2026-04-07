'use client';

import { useBankAccounts } from '@/hooks/finance/use-bank-accounts';
import { useFinanceCategories } from '@/hooks/finance/use-finance-categories';
import { useCostCenters } from '@/hooks/finance/use-cost-centers';
import { useLastSupplierEntry } from '@/hooks/finance/use-ocr';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface SmartDefaults {
  categoryId: string;
  categoryName: string;
  costCenterId: string;
  costCenterName: string;
  bankAccountId: string;
  bankAccountName: string;
  description: string;
  isLoading: boolean;
}

/**
 * useSmartDefaults
 *
 * Auto-fills category, cost center, bank account and description
 * based on the last entry for this supplier/customer and the default bank account.
 */
export function useSmartDefaults(
  type: 'PAYABLE' | 'RECEIVABLE',
  entityName?: string
): SmartDefaults {
  // 1. Query last entry for this supplier/customer name
  const { data: supplierSuggestion, isLoading: suggestionLoading } =
    useLastSupplierEntry(entityName ?? '');

  // 2. Get categories to resolve name
  const categoryType = type === 'PAYABLE' ? 'EXPENSE' : 'REVENUE';
  const { data: categoriesData } = useFinanceCategories({ type: categoryType });
  const { data: bothCategoriesData } = useFinanceCategories({ type: 'BOTH' });
  const categories = useMemo(() => {
    const primary = categoriesData?.categories ?? [];
    const both = bothCategoriesData?.categories ?? [];
    return [...primary, ...both.filter(b => !primary.some(p => p.id === b.id))];
  }, [categoriesData, bothCategoriesData]);

  // 3. Get cost centers to resolve name
  const { data: costCentersData } = useCostCenters();
  const costCenters = costCentersData?.costCenters ?? [];

  // 4. Get bank accounts — find default
  const { data: bankAccountsData, isLoading: bankAccountsLoading } =
    useBankAccounts();
  const bankAccounts = bankAccountsData?.bankAccounts ?? [];

  return useMemo(() => {
    // Category from last supplier entry
    let categoryId = '';
    let categoryName = '';
    if (supplierSuggestion?.categoryId) {
      const cat = categories.find(c => c.id === supplierSuggestion.categoryId);
      if (cat) {
        categoryId = cat.id;
        categoryName = cat.name;
      }
    }

    // Cost center from last supplier entry
    let costCenterId = '';
    let costCenterName = '';
    if (supplierSuggestion?.costCenterId) {
      const cc = costCenters.find(
        c => c.id === supplierSuggestion.costCenterId
      );
      if (cc) {
        costCenterId = cc.id;
        costCenterName = cc.name;
      }
    }

    // Default bank account (isDefault: true) or first active one
    let bankAccountId = '';
    let bankAccountName = '';
    const defaultAccount =
      bankAccounts.find(
        ba => ba.isDefault === true && ba.status === 'ACTIVE'
      ) ?? bankAccounts.find(ba => ba.status === 'ACTIVE');
    if (defaultAccount) {
      bankAccountId = defaultAccount.id;
      bankAccountName = defaultAccount.name;
    }

    // Auto-generate description
    const now = new Date();
    const monthYear = format(now, 'MMMM/yyyy', { locale: ptBR });
    const capitalizedMonth =
      monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    const description = entityName ? `${entityName} - ${capitalizedMonth}` : '';

    return {
      categoryId,
      categoryName,
      costCenterId,
      costCenterName,
      bankAccountId,
      bankAccountName,
      description,
      isLoading: suggestionLoading || bankAccountsLoading,
    };
  }, [
    supplierSuggestion,
    categories,
    costCenters,
    bankAccounts,
    entityName,
    suggestionLoading,
    bankAccountsLoading,
  ]);
}
