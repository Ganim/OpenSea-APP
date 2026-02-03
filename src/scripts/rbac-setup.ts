/**
 * OpenSea OS - RBAC Setup Script
 * Script para criar permissões e grupos base do sistema
 *
 * IMPORTANTE: Este script deve ser executado apenas uma vez após a instalação
 * do sistema ou quando precisar resetar as permissões base.
 */

import baseGroups from '@/config/rbac/base-groups';
import { allBasePermissions } from '@/config/rbac/base-permissions';
import * as rbacService from '@/services/rbac/rbac.service';
import { logger } from '@/lib/logger';

// =============================================================================
// TYPES
// =============================================================================

interface SetupResult {
  success: boolean;
  permissionsCreated: number;
  groupsCreated: number;
  errors: string[];
}

// =============================================================================
// SETUP FUNCTIONS
// =============================================================================

/**
 * Cria todas as permissões base do sistema
 */
async function setupPermissions(): Promise<{
  created: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let created = 0;

  logger.info('📝 Criando permissões base...');

  for (const permission of allBasePermissions) {
    try {
      await rbacService.createPermission(permission);
      created++;
      logger.debug(`✓ Criada: ${permission.code}`);
    } catch (error: unknown) {
      const errorMsg = `Erro ao criar ${permission.code}: ${(error as Error).message}`;
      errors.push(errorMsg);
      logger.error(`Erro ao criar permissão`, error as Error, { code: permission.code });
    }
  }

  return { created, errors };
}

/**
 * Cria todos os grupos base e atribui permissões
 */
async function setupGroups(): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;

  logger.info('👥 Criando grupos de permissões base...');

  for (const groupDef of baseGroups) {
    try {
      // Criar grupo
      const { permissions, ...groupData } = groupDef;
      const group = await rbacService.createPermissionGroup(groupData);
      created++;
      logger.debug(`✓ Criado grupo: ${group.name} (${group.slug})`);

      // Atribuir permissões ao grupo
      for (const perm of permissions) {
        try {
          await rbacService.addPermissionToGroup(group.id, {
            permissionCode: perm.code,
            effect: perm.effect,
          });
          logger.debug(
            `  ✓ Permissão adicionada: ${perm.code} (${perm.effect})`
          );
        } catch (error: unknown) {
          const errorMsg = `Erro ao adicionar permissão ${perm.code} ao grupo ${group.name}: ${(error as Error).message}`;
          errors.push(errorMsg);
          logger.error('Erro ao adicionar permissão ao grupo', error as Error, { groupName: group.name, permCode: perm.code });
        }
      }
    } catch (error: unknown) {
      const errorMsg = `Erro ao criar grupo ${groupDef.name}: ${(error as Error).message}`;
      errors.push(errorMsg);
      logger.error('Erro ao criar grupo', error as Error, { groupName: groupDef.name });
    }
  }

  return { created, errors };
}

/**
 * Executa o setup completo do RBAC
 */
export async function setupRBAC(): Promise<SetupResult> {
  logger.info('🚀 Iniciando setup do RBAC...');

  const result: SetupResult = {
    success: false,
    permissionsCreated: 0,
    groupsCreated: 0,
    errors: [],
  };

  try {
    // Passo 1: Criar permissões
    const permResult = await setupPermissions();
    result.permissionsCreated = permResult.created;
    result.errors.push(...permResult.errors);

    // Passo 2: Criar grupos
    const groupResult = await setupGroups();
    result.groupsCreated = groupResult.created;
    result.errors.push(...groupResult.errors);

    // Verificar se houve erros
    if (result.errors.length === 0) {
      result.success = true;
      logger.info('✅ Setup do RBAC concluído com sucesso!');
      logger.info(`📝 ${result.permissionsCreated} permissões criadas`);
      logger.info(`👥 ${result.groupsCreated} grupos criados`);
    } else {
      logger.warn('Setup concluído com alguns erros');
      logger.info(`📝 ${result.permissionsCreated} permissões criadas`);
      logger.info(`👥 ${result.groupsCreated} grupos criados`);
      logger.error(`${result.errors.length} erros durante setup`, new Error('Setup incompleto'), { errorCount: result.errors.length });
    }
  } catch (error: unknown) {
    result.errors.push(`Erro fatal no setup: ${(error as Error).message}`);
    logger.error('Erro fatal no setup', error as Error, { step: 'rbac-setup' });
  }

  return result;
}

/**
 * Verifica se o RBAC já foi configurado
 */
export async function checkRBACSetup(): Promise<{
  isSetup: boolean;
  permissionsCount: number;
  groupsCount: number;
}> {
  try {
    const permissions = await rbacService.listPermissions({ limit: 1 });
    const groups = await rbacService.listPermissionGroups({ limit: 1 });

    return {
      isSetup: permissions.length > 0 && groups.length > 0,
      permissionsCount: permissions.length,
      groupsCount: groups.length,
    };
  } catch (error) {
    return {
      isSetup: false,
      permissionsCount: 0,
      groupsCount: 0,
    };
  }
}

// =============================================================================
// CLI EXECUTION
// =============================================================================

/**
 * Executa o script se chamado diretamente
 */
if (require.main === module) {
  (async () => {
    logger.info('====================================');
    logger.info('  OpenSea OS - RBAC Setup Script  ');
    logger.info('====================================');

    // Verificar se já foi configurado
    const check = await checkRBACSetup();

    if (check.isSetup) {
      logger.warn('⚠️  O RBAC já foi configurado anteriormente:');
      logger.info(`   - ${check.permissionsCount} permissões encontradas`);
      logger.info(`   - ${check.groupsCount} grupos encontrados`);

      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        'Deseja continuar e criar duplicatas? (s/N): ',
        async (answer: string) => {
          rl.close();

          if (answer.toLowerCase() !== 's') {
            logger.info('❌ Setup cancelado pelo usuário');
            process.exit(0);
          }

          const result = await setupRBAC();
          process.exit(result.success ? 0 : 1);
        }
      );
    } else {
      const result = await setupRBAC();
      process.exit(result.success ? 0 : 1);
    }
  })();
}

// =============================================================================
// EXPORTS
// =============================================================================

export default setupRBAC;
