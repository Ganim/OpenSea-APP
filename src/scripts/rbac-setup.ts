/**
 * OpenSea OS - RBAC Setup Script
 * Script para criar permissões e grupos base do sistema
 *
 * IMPORTANTE: Este script deve ser executado apenas uma vez após a instalação
 * do sistema ou quando precisar resetar as permissões base.
 */

import { allBasePermissions } from '@/config/rbac/base-permissions';
import baseGroups from '@/config/rbac/base-groups';
import * as rbacService from '@/services/rbac/rbac.service';

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

  console.log('📝 Criando permissões base...');

  for (const permission of allBasePermissions) {
    try {
      await rbacService.createPermission(permission);
      created++;
      console.log(`✓ Criada: ${permission.code}`);
    } catch (error: any) {
      const errorMsg = `Erro ao criar ${permission.code}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`✗ ${errorMsg}`);
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

  console.log('\n👥 Criando grupos de permissões base...');

  for (const groupDef of baseGroups) {
    try {
      // Criar grupo
      const { permissions, ...groupData } = groupDef;
      const group = await rbacService.createPermissionGroup(groupData);
      created++;
      console.log(`✓ Criado grupo: ${group.name} (${group.slug})`);

      // Atribuir permissões ao grupo
      for (const perm of permissions) {
        try {
          await rbacService.addPermissionToGroup(group.id, {
            permissionCode: perm.code,
            effect: perm.effect,
          });
          console.log(`  ✓ Permissão adicionada: ${perm.code} (${perm.effect})`);
        } catch (error: any) {
          const errorMsg = `Erro ao adicionar permissão ${perm.code} ao grupo ${group.name}: ${error.message}`;
          errors.push(errorMsg);
          console.error(`  ✗ ${errorMsg}`);
        }
      }
    } catch (error: any) {
      const errorMsg = `Erro ao criar grupo ${groupDef.name}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`✗ ${errorMsg}`);
    }
  }

  return { created, errors };
}

/**
 * Executa o setup completo do RBAC
 */
export async function setupRBAC(): Promise<SetupResult> {
  console.log('🚀 Iniciando setup do RBAC...\n');

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
      console.log('\n✅ Setup do RBAC concluído com sucesso!');
      console.log(`📝 ${result.permissionsCreated} permissões criadas`);
      console.log(`👥 ${result.groupsCreated} grupos criados`);
    } else {
      console.log('\n⚠️  Setup concluído com alguns erros:');
      console.log(`📝 ${result.permissionsCreated} permissões criadas`);
      console.log(`👥 ${result.groupsCreated} grupos criados`);
      console.log(`❌ ${result.errors.length} erros`);
    }
  } catch (error: any) {
    result.errors.push(`Erro fatal no setup: ${error.message}`);
    console.error('\n❌ Erro fatal no setup:', error);
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
      isSetup: permissions.pagination.total > 0 && groups.pagination.total > 0,
      permissionsCount: permissions.pagination.total,
      groupsCount: groups.pagination.total,
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
    console.log('====================================');
    console.log('  OpenSea OS - RBAC Setup Script  ');
    console.log('====================================\n');

    // Verificar se já foi configurado
    const check = await checkRBACSetup();

    if (check.isSetup) {
      console.log('⚠️  O RBAC já foi configurado anteriormente:');
      console.log(`   - ${check.permissionsCount} permissões encontradas`);
      console.log(`   - ${check.groupsCount} grupos encontrados\n`);

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
            console.log('❌ Setup cancelado pelo usuário');
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
