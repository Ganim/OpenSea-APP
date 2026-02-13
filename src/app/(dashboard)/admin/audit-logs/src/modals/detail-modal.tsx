'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Calendar,
  FileText,
  Globe,
  Hash,
  Link,
  Monitor,
  User,
} from 'lucide-react';
import { getActionLabel, getEntityLabel, getModuleLabel } from '../constants';
import type { AuditLog } from '../types';
import {
  formatAuditNarrative,
  formatAuditTimestamp,
  formatFieldLabel,
  getActionStyle,
} from '../utils';

interface DetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditLog | null;
}

/** Extract field-level diffs between oldData and newData */
function extractDiffs(log: AuditLog) {
  if (!log.oldData || !log.newData) return null;

  const oldData = log.oldData as Record<string, unknown>;
  const newData = log.newData as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  const diffs: Array<{
    field: string;
    label: string;
    oldValue: string;
    newValue: string;
    changed: boolean;
  }> = [];

  allKeys.forEach(key => {
    const oldVal = oldData[key];
    const newVal = newData[key];
    const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);

    // Skip complex nested objects for the diff table
    if (
      (oldVal && typeof oldVal === 'object' && !Array.isArray(oldVal)) ||
      (newVal && typeof newVal === 'object' && !Array.isArray(newVal))
    ) {
      return;
    }

    diffs.push({
      field: key,
      label: formatFieldLabel(key),
      oldValue: formatDisplayValue(oldVal),
      newValue: formatDisplayValue(newVal),
      changed,
    });
  });

  return diffs.length > 0 ? diffs : null;
}

function formatDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onOpenChange,
  log,
}) => {
  if (!log) return null;

  const style = getActionStyle(log.action);
  const summary = formatAuditNarrative(log);
  const Icon = style.icon;
  const diffs = extractDiffs(log);
  const authorValue = log.userName || log.userId;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'rounded-full border p-2.5',
                style.bg,
                style.border
              )}
            >
              <Icon className={cn('w-5 h-5', style.text)} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-base">
                {summary.sentence}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {getModuleLabel(log.module)} &gt; {getEntityLabel(log.entity)}{' '}
                &gt; {getActionLabel(log.action)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Warning for missing oldData on updates */}
        {log.action === 'UPDATE' && !log.oldData && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3 text-sm">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              Dados anteriores não disponíveis
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
              O backend não retornou os dados anteriores desta atualização.
            </p>
          </div>
        )}

        <Tabs defaultValue="metadata" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metadata">Metadados</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
          </TabsList>
          {/* Metadata Tab */}
          <TabsContent value="metadata">
            <div className="border rounded-lg overflow-hidden border-gray-200 dark:border-white/10">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100 dark:border-white/5 last:border-b-0">
                    <td className="px-3 py-2">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Data e hora
                          </p>
                          <p className="font-mono text-xs text-gray-900 dark:text-white">
                            {formatAuditTimestamp(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-white/5 last:border-b-0">
                    <td className="px-3 py-2">
                      <div className="flex items-start gap-2">
                        <Hash className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            ID da Entidade
                          </p>
                          <p className="font-mono text-xs text-gray-900 dark:text-white break-all">
                            {log.entityId}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {authorValue && (
                    <tr className="border-b border-gray-100 dark:border-white/5 last:border-b-0">
                      <td className="px-3 py-2">
                        <div className="flex items-start gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Autor
                            </p>
                            <p className="text-xs text-gray-900 dark:text-white">
                              {authorValue}
                              {log.userPermissionGroups &&
                                log.userPermissionGroups.length > 0 && (
                                  <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
                                    (
                                    {log.userPermissionGroups
                                      .map(g => g.name)
                                      .join(', ')}
                                    )
                                  </span>
                                )}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {log.affectedUser && (
                    <tr className="border-b border-gray-100 dark:border-white/5 last:border-b-0">
                      <td className="px-3 py-2">
                        <div className="flex items-start gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Afetado
                            </p>
                            <p className="text-xs text-gray-900 dark:text-white">
                              {log.affectedUser}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {log.ip && (
                    <tr className="border-b border-gray-100 dark:border-white/5 last:border-b-0">
                      <td className="px-3 py-2">
                        <div className="flex items-start gap-2">
                          <Globe className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              IP
                            </p>
                            <p className="font-mono text-xs text-gray-900 dark:text-white">
                              {log.ip}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {log.description && (
                    <tr className="border-b border-gray-100 dark:border-white/5 last:border-b-0">
                      <td className="px-3 py-2">
                        <div className="flex items-start gap-2">
                          <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Descricao
                            </p>
                            <p className="text-xs text-gray-900 dark:text-white">
                              {log.description}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {log.endpoint && (
                    <tr className="border-b border-gray-100 dark:border-white/5 last:border-b-0">
                      <td className="px-3 py-2">
                        <div className="flex items-start gap-2">
                          <Link className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Endpoint
                            </p>
                            <p className="font-mono text-xs text-gray-900 dark:text-white">
                              {log.method} {log.endpoint}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {log.userAgent && (
                    <tr className="border-b border-gray-100 dark:border-white/5 last:border-b-0">
                      <td className="px-3 py-2">
                        <div className="flex items-start gap-2">
                          <Monitor className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              User Agent
                            </p>
                            <p className="font-mono text-xs text-gray-900 dark:text-white break-all">
                              {log.userAgent}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            {/* Field-level diff table when both oldData and newData exist */}
            {diffs ? (
              <div className="border rounded-lg overflow-hidden border-gray-200 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        Campo
                      </th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        Antes
                      </th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        Depois
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {diffs.map(diff => (
                      <tr
                        key={diff.field}
                        className={cn(
                          'border-b border-gray-100 dark:border-white/5 last:border-b-0',
                          diff.changed && 'bg-amber-50/50 dark:bg-amber-950/10'
                        )}
                      >
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {diff.label}
                        </td>
                        <td
                          className={cn(
                            'px-3 py-2 font-mono text-xs',
                            diff.changed
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                          )}
                        >
                          {diff.oldValue}
                        </td>
                        <td
                          className={cn(
                            'px-3 py-2 font-mono text-xs',
                            diff.changed
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-500 dark:text-gray-400'
                          )}
                        >
                          {diff.newValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : log.oldData && log.newData ? (
              /* Fallback: raw JSON when diffs couldn't be extracted (complex nested objects) */
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-red-600 dark:text-red-400 mb-2 block">
                    Antes
                  </label>
                  <pre className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3 rounded-lg overflow-x-auto text-xs text-gray-900 dark:text-gray-100">
                    {JSON.stringify(log.oldData, null, 2)}
                  </pre>
                </div>
                <div>
                  <label className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 block">
                    Depois
                  </label>
                  <pre className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-3 rounded-lg overflow-x-auto text-xs text-gray-900 dark:text-gray-100">
                    {JSON.stringify(log.newData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <>
                {/* Only old data */}
                {log.oldData && !log.newData && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                      Dados Anteriores
                    </label>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto text-xs">
                      {JSON.stringify(log.oldData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Only new data */}
                {log.newData && !log.oldData && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                      Dados
                    </label>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto text-xs">
                      {JSON.stringify(log.newData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* No data */}
                {!log.oldData && !log.newData && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Nenhum dado disponível
                  </p>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t border-gray-200/50 dark:border-white/10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
