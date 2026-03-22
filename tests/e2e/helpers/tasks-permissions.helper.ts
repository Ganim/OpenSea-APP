import { createUserWithPermissions } from './permissions.helper';

export const TASKS_PERMISSIONS = {
  BOARDS_ACCESS: 'tools.tasks.boards.access',
  BOARDS_REGISTER: 'tools.tasks.boards.register',
  BOARDS_MODIFY: 'tools.tasks.boards.modify',
  BOARDS_REMOVE: 'tools.tasks.boards.remove',
  BOARDS_SHARE: 'tools.tasks.boards.share',
  CARDS_ACCESS: 'tools.tasks.cards.access',
  CARDS_REGISTER: 'tools.tasks.cards.register',
  CARDS_MODIFY: 'tools.tasks.cards.modify',
  CARDS_REMOVE: 'tools.tasks.cards.remove',
  CARDS_ADMIN: 'tools.tasks.cards.admin',
  CARDS_SHARE: 'tools.tasks.cards.share',
  CARDS_ONLYSELF: 'tools.tasks.cards.onlyself',
} as const;

export const TASKS_FULL_PERMISSIONS = Object.values(TASKS_PERMISSIONS);

export async function createTasksUser(
  permissionCodes: string[],
  groupName?: string
) {
  return createUserWithPermissions(permissionCodes, groupName);
}
