import { tagsService } from '@/services/stock';
import type { CreateTagRequest, Tag, UpdateTagRequest } from '@/types/stock';

export async function createTag(data: CreateTagRequest): Promise<Tag> {
  const response = await tagsService.createTag(data);
  return response.tag;
}

export async function getTag(id: string): Promise<Tag> {
  const response = await tagsService.getTag(id);
  return response.tag;
}

export async function listTags(): Promise<Tag[]> {
  const response = await tagsService.listTags();
  return response.tags;
}

export async function updateTag(
  id: string,
  data: UpdateTagRequest
): Promise<Tag> {
  const response = await tagsService.updateTag(id, data);
  return response.tag;
}

export async function deleteTag(id: string): Promise<void> {
  await tagsService.deleteTag(id);
}
