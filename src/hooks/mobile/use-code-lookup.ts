import { useMutation } from '@tanstack/react-query';
import { lookupService } from '@/services/stock/lookup.service';
import { scanSuccess, scanError } from '@/lib/scan-feedback';

export function useCodeLookup() {
  return useMutation({
    mutationFn: (code: string) => lookupService.lookupByCode(code),
    onSuccess: () => scanSuccess(),
    onError: () => scanError(),
  });
}
