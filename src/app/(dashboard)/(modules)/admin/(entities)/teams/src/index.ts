/**
 * Teams Module Index
 * Exportações centralizadas de todo o módulo de equipes
 */

// Config
export { teamsConfig } from './config/teams.config';

// Modals
export { CreateModal, DetailModal } from './modals';

// Types
export type {
  CreateModalProps,
  DetailModalProps,
  EditModalProps,
  NewTeamData,
  TeamCardProps,
} from './types';

// Utils
export {
  createTeam,
  deleteTeam,
  formatMembersCount,
  getStatusBadgeVariant,
  getStatusLabel,
  getTeam,
  getTeamColorStyle,
  listTeams,
  updateTeam,
} from './utils';
