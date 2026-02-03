/**
 * @deprecated Use os componentes PageLayout, PageHeader, PageActionBar e Header
 * de '@/components/layout' no lugar. Este componente será removido em versão futura.
 * Referência: stock/templates/page.tsx
 */
'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Copy,
  Edit,
  HelpCircle,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export interface PageHeaderAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  hideOnMobile?: boolean;
}

export interface PageHeaderConfig {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backUrl?: string;

  // A\u00e7\u00f5es pr\u00e9-definidas
  onAdd?: () => void;
  onQuickAdd?: () => void;
  onImport?: () => void;
  onHelp?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;

  // Labels customiz\u00e1veis
  addLabel?: string;
  quickAddLabel?: string;
  importLabel?: string;
  saveLabel?: string;
  editLabel?: string;
  duplicateLabel?: string;
  deleteLabel?: string;
  cancelLabel?: string;

  // Estados
  isLoading?: boolean;
  saveDisabled?: boolean;

  // A\u00e7\u00f5es personalizadas
  customActions?: PageHeaderAction[];
}

interface PageHeaderProps {
  config: PageHeaderConfig;
}

/**
 * Componente de cabe\u00e7alho de p\u00e1gina gen\u00e9rico e reutiliz\u00e1vel
 * Suporta a\u00e7\u00f5es pr\u00e9-definidas e customizadas
 * Responsivo com design mobile-first
 */
export function PageHeader({ config }: PageHeaderProps) {
  const router = useRouter();

  const {
    title,
    description,
    showBackButton = true,
    backUrl,
    onAdd,
    onQuickAdd,
    onImport,
    onHelp,
    onCancel,
    onSave,
    onEdit,
    onDuplicate,
    onDelete,
    addLabel = 'Adicionar',
    quickAddLabel = 'Cria\u00e7\u00e3o R\u00e1pida',
    importLabel = 'Importar',
    saveLabel = 'Salvar',
    editLabel = 'Editar',
    duplicateLabel = 'Duplicar',
    deleteLabel = 'Excluir',
    cancelLabel = 'Cancelar',
    isLoading = false,
    saveDisabled = false,
    customActions = [],
  } = config;

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* T\u00edtulo e Descri\u00e7\u00e3o */}
        <div className="flex items-start gap-3 flex-1">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mt-1 shrink-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 hidden sm:flex">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* A\u00e7\u00f5es */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile: Somente \u00edcones */}
          <div className="flex sm:hidden items-center gap-2">
            {onHelp && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onHelp}
                className="h-10 w-10 rounded-xl"
                title="Ajuda"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
            )}

            {onImport && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onImport}
                className="h-10 w-10 rounded-xl"
                title={importLabel}
              >
                <Upload className="w-5 h-5" />
              </Button>
            )}

            {onQuickAdd && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onQuickAdd}
                className="h-10 w-10 rounded-xl"
                title={quickAddLabel}
              >
                <Zap className="w-5 h-5" />
              </Button>
            )}

            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-10 w-10 rounded-xl"
                title={editLabel}
              >
                <Edit className="w-5 h-5" />
              </Button>
            )}

            {onDuplicate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDuplicate}
                className="h-10 w-10 rounded-xl"
                title={duplicateLabel}
              >
                <Copy className="w-5 h-5" />
              </Button>
            )}

            {onCancel && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="h-10 w-10 rounded-xl"
                title={cancelLabel}
              >
                <X className="w-5 h-5" />
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-10 w-10 rounded-xl text-red-600 hover:text-red-700"
                title={deleteLabel}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}

            {onSave && (
              <Button
                size="icon"
                onClick={onSave}
                disabled={saveDisabled || isLoading}
                className="h-10 w-10 rounded-xl"
                title={saveLabel}
              >
                <Save className="w-5 h-5" />
              </Button>
            )}

            {onAdd && (
              <Button
                size="icon"
                onClick={onAdd}
                className="h-10 w-10 rounded-xl"
                title={addLabel}
              >
                <Plus className="w-5 h-5" />
              </Button>
            )}

            {/* Custom actions - mobile */}
            {customActions
              .filter(action => !action.hideOnMobile)
              .map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'ghost'}
                  size="icon"
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading}
                  className="h-10 w-10 rounded-xl"
                  title={action.label}
                >
                  {action.icon}
                </Button>
              ))}
          </div>

          {/* Desktop: \u00cdcones + Texto */}
          <div className="hidden sm:flex items-center gap-2">
            {onHelp && (
              <Button variant="ghost" onClick={onHelp} className="rounded-xl">
                <HelpCircle className="w-4 h-4 mr-2" />
                Ajuda
              </Button>
            )}

            {onImport && (
              <Button
                variant="outline"
                onClick={onImport}
                className="rounded-xl"
              >
                <Upload className="w-4 h-4 mr-2" />
                {importLabel}
              </Button>
            )}

            {onQuickAdd && (
              <Button
                variant="outline"
                onClick={onQuickAdd}
                className="rounded-xl"
              >
                <Zap className="w-4 h-4 mr-2" />
                {quickAddLabel}
              </Button>
            )}

            {onEdit && (
              <Button variant="outline" onClick={onEdit} className="rounded-xl">
                <Edit className="w-4 h-4 mr-2" />
                {editLabel}
              </Button>
            )}

            {onDuplicate && (
              <Button
                variant="outline"
                onClick={onDuplicate}
                className="rounded-xl"
              >
                <Copy className="w-4 h-4 mr-2" />
                {duplicateLabel}
              </Button>
            )}

            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                className="rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                {cancelLabel}
              </Button>
            )}

            {onDelete && (
              <Button
                variant="destructive"
                onClick={onDelete}
                className="rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteLabel}
              </Button>
            )}

            {onSave && (
              <Button
                onClick={onSave}
                disabled={saveDisabled || isLoading}
                className="rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Salvando...' : saveLabel}
              </Button>
            )}

            {onAdd && (
              <Button onClick={onAdd} className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                {addLabel}
              </Button>
            )}

            {/* Custom actions - desktop */}
            {customActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className="rounded-xl"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.loading ? 'Carregando...' : action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
