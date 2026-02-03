/**
 * Detail Modal Component
 * Modal para visualizar detalhes de um log de auditoria
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, Globe, Monitor, User } from 'lucide-react';
import {
  MODULE_COLORS,
  getActionLabel,
  getEntityLabel,
  getModuleLabel,
} from '../constants';
import type { AuditLog } from '../types';
import {
  countChangedFields,
  formatAuditNarrative,
  formatAuditTimestamp,
  getActionStyle,
} from '../utils';

interface DetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditLog | null;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onOpenChange,
  log,
}) => {
  if (!log) return null;

  const style = getActionStyle(log.action);
  const summary = formatAuditNarrative(log);
  const changesCount = countChangedFields(log);
  const Icon = style.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Detalhes do Log de Auditoria
          </DialogTitle>
          <DialogDescription>
            {getActionLabel(log.action)} - {getEntityLabel(log.entity)}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-gray-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className={`${style.bg} ${style.border} rounded-full p-2`}>
              <Icon className={`w-4 h-4 ${style.text}`} />
            </div>
            <div className="space-y-2 flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                {summary.sentence}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className={style.pill}>
                  {getActionLabel(log.action)}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${MODULE_COLORS[log.module]?.bg || ''} ${MODULE_COLORS[log.module]?.text || ''} ${MODULE_COLORS[log.module]?.border || ''}`}
                >
                  {getModuleLabel(log.module)}
                </Badge>
                <Badge variant="secondary">
                  {getEntityLabel(log.entity)}
                  {log.entityId ? ` • #${log.entityId}` : ''}
                </Badge>
                <Badge variant="outline">{summary.timestamp}</Badge>
                {changesCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900"
                  >
                    {changesCount} alteração{changesCount > 1 ? 'es' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alerta sobre disponibilidade de dados */}
        {log.action === 'UPDATE' && !log.oldData && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3 text-sm">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              ⚠️ Dados anteriores não disponíveis
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
              O backend não retornou os dados anteriores desta atualização. Isso
              pode indicar que a API precisa ser atualizada para incluir o campo
              `oldData`.
            </p>
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
            <TabsTrigger value="metadata">Metadados</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Ação
                </label>
                <div className="mt-1">
                  <Badge variant="default">{getActionLabel(log.action)}</Badge>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Entidade
                </label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {getEntityLabel(log.entity)}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Módulo
                </label>
                <div className="mt-1">
                  <Badge variant="outline">{getModuleLabel(log.module)}</Badge>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  ID da Entidade
                </label>
                <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                  {log.entityId}
                </p>
              </div>

              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Data e Hora
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatAuditTimestamp(log.createdAt)}
                </p>
              </div>

              {log.description && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Descrição
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {log.description}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            {/* Comparação lado a lado quando há oldData e newData */}
            {log.oldData && log.newData ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-red-600 dark:text-red-400 mb-2 block flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                    Dados Anteriores (Antes)
                  </label>
                  <pre className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-4 rounded-lg overflow-x-auto text-xs text-gray-900 dark:text-gray-100">
                    {JSON.stringify(log.oldData, null, 2)}
                  </pre>
                </div>
                <div>
                  <label className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 block flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    Dados Novos (Depois)
                  </label>
                  <pre className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg overflow-x-auto text-xs text-gray-900 dark:text-gray-100">
                    {JSON.stringify(log.newData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <>
                {/* Apenas dados antigos */}
                {log.oldData && !log.newData && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                      Dados Anteriores
                    </label>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs">
                      {JSON.stringify(log.oldData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Apenas dados novos */}
                {log.newData && !log.oldData && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                      Dados Novos
                    </label>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs">
                      {JSON.stringify(log.newData, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            )}

            {/* Mensagem quando não há dados */}
            {!log.oldData && !log.newData && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Nenhum dado disponível
              </p>
            )}
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {log.userId && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    ID do Usuário
                  </label>
                  <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                    {log.userId}
                  </p>
                </div>
              )}

              {log.affectedUser && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Usuário Afetado
                  </label>
                  <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                    {log.affectedUser}
                  </p>
                </div>
              )}

              {log.ip && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Endereço IP
                  </label>
                  <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                    {log.ip}
                  </p>
                </div>
              )}

              {log.endpoint && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Endpoint
                  </label>
                  <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                    {log.method} {log.endpoint}
                  </p>
                </div>
              )}

              {log.userAgent && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Monitor className="w-3 h-3" />
                    User Agent
                  </label>
                  <p className="mt-1 text-xs font-mono text-gray-900 dark:text-white break-all">
                    {log.userAgent}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200/50 dark:border-white/10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
