import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';

interface ProtectItemRequest {
  itemId: string;
  itemType: 'file' | 'folder';
  password: string;
}

interface UnprotectItemRequest {
  itemId: string;
  itemType: 'file' | 'folder';
  password: string;
}

interface VerifyProtectionRequest {
  itemId: string;
  itemType: 'file' | 'folder';
  password: string;
}

interface VerifyProtectionResponse {
  valid: boolean;
}

interface HideItemRequest {
  itemId: string;
  itemType: 'file' | 'folder';
}

export const storageSecurityService = {
  // POST /v1/storage/security/protect - Protege arquivo ou pasta com senha
  async protectItem(data: ProtectItemRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.STORAGE.SECURITY.PROTECT,
      data,
    );
  },

  // POST /v1/storage/security/unprotect - Remove proteção por senha
  async unprotectItem(data: UnprotectItemRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.STORAGE.SECURITY.UNPROTECT,
      data,
    );
  },

  // POST /v1/storage/security/verify - Verifica senha de item protegido
  async verifyProtection(data: VerifyProtectionRequest): Promise<VerifyProtectionResponse> {
    return apiClient.post<VerifyProtectionResponse>(
      API_ENDPOINTS.STORAGE.SECURITY.VERIFY,
      data,
    );
  },

  // POST /v1/storage/security/hide - Oculta arquivo ou pasta
  async hideItem(data: HideItemRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.STORAGE.SECURITY.HIDE,
      data,
    );
  },

  // POST /v1/storage/security/unhide - Revela arquivo ou pasta
  async unhideItem(data: HideItemRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.STORAGE.SECURITY.UNHIDE,
      data,
    );
  },

  // POST /v1/storage/security/verify-key - Verifica chave de segurança do usuário
  async verifySecurityKey(key: string): Promise<{ valid: boolean }> {
    return apiClient.post<{ valid: boolean }>(
      API_ENDPOINTS.STORAGE.SECURITY.VERIFY_KEY,
      { key },
    );
  },
};
