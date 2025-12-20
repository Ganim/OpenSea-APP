/**
 * Users CRUD Operations
 * Funções isoladas para operações de CRUD
 */

import { usersService } from '@/services/auth/users.service';
import type { User } from '@/types/auth';

/**
 * Listar usuários
 */
export async function listUsers(): Promise<User[]> {
  const response = await usersService.listUsers();
  return response.users;
}

/**
 * Obter usuário por ID
 */
export async function getUser(id: string): Promise<User> {
  const response = await usersService.getUser(id);
  return response.user;
}

/**
 * Criar novo usuário
 */
export async function createUser(data: {
  username: string;
  email: string;
  password: string;
  role?: 'USER' | 'MANAGER' | 'ADMIN';
}): Promise<User> {
  const response = await usersService.createUser(data);
  return response.user;
}

/**
 * Atualizar papel do usuário
 */
export async function updateUserRole(
  id: string,
  role: 'USER' | 'MANAGER' | 'ADMIN'
): Promise<User> {
  const response = await usersService.updateUserRole(id, { role });
  return response.user;
}

/**
 * Deletar usuário
 */
export async function deleteUser(id: string): Promise<void> {
  await usersService.deleteUser(id);
}
