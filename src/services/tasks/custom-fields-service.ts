import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CustomField,
  CardCustomFieldValue,
  CreateCustomFieldRequest,
  UpdateCustomFieldRequest,
  SetCustomFieldValueRequest,
} from '@/types/tasks';

export interface CustomFieldsResponse {
  customFields: CustomField[];
}

export interface CustomFieldResponse {
  customField: CustomField;
}

export interface CustomFieldValuesResponse {
  values: CardCustomFieldValue[];
}

export const customFieldsService = {
  async list(boardId: string): Promise<CustomFieldsResponse> {
    return apiClient.get<CustomFieldsResponse>(
      API_ENDPOINTS.TASKS.CUSTOM_FIELDS.LIST(boardId),
    );
  },

  async create(
    boardId: string,
    data: CreateCustomFieldRequest,
  ): Promise<CustomFieldResponse> {
    return apiClient.post<CustomFieldResponse>(
      API_ENDPOINTS.TASKS.CUSTOM_FIELDS.CREATE(boardId),
      data,
    );
  },

  async update(
    boardId: string,
    fieldId: string,
    data: UpdateCustomFieldRequest,
  ): Promise<CustomFieldResponse> {
    return apiClient.patch<CustomFieldResponse>(
      API_ENDPOINTS.TASKS.CUSTOM_FIELDS.UPDATE(boardId, fieldId),
      data,
    );
  },

  async delete(boardId: string, fieldId: string): Promise<void> {
    await apiClient.delete<void>(
      API_ENDPOINTS.TASKS.CUSTOM_FIELDS.DELETE(boardId, fieldId),
    );
  },

  async setValues(
    boardId: string,
    cardId: string,
    data: SetCustomFieldValueRequest,
  ): Promise<CustomFieldValuesResponse> {
    return apiClient.put<CustomFieldValuesResponse>(
      API_ENDPOINTS.TASKS.CUSTOM_FIELDS.SET_VALUES(boardId, cardId),
      data,
    );
  },
};
