/**
 * OpenSea OS - Edit Combo Page
 * Follows the standard edit page pattern: PageLayout > PageHeader > PageBody
 */

'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import type { HeaderButton } from '@/components/layout/types/header.types';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  useCombo,
  useUpdateCombo,
  useDeleteCombo,
} from '@/hooks/sales/use-combos';
import { usePermissions } from '@/hooks/use-permissions';
import { SALES_PERMISSIONS } from '@/config/rbac/permission-codes';
import { logger } from '@/lib/logger';
import type { Combo, ComboDiscountType, ComboType } from '@/types/sales';
import { useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  DollarSign,
  Info,
  Loader2,
  Package,
  Save,
  Trash2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// =============================================================================
// SECTION HEADER
// =============================================================================

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-foreground" />
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="border-b border-border" />
    </div>
  );
}

// =============================================================================
// PAGE
// =============================================================================

export default function EditComboPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const comboId = params.id as string;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const {
    data: comboData,
    isLoading: isLoadingCombo,
    error,
  } = useCombo(comboId);

  const combo = comboData?.combo as Combo | undefined;

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const updateMutation = useUpdateCombo();
  const deleteMutation = useDeleteCombo();

  // ============================================================================
  // STATE
  // ============================================================================

  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ComboType>('FIXED');
  const [fixedPrice, setFixedPrice] = useState('');
  const [discountType, setDiscountType] = useState<ComboDiscountType | ''>('');
  const [discountValue, setDiscountValue] = useState('');
  const [minItems, setMinItems] = useState('');
  const [maxItems, setMaxItems] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (combo) {
      setName(combo.name || '');
      setDescription(combo.description || '');
      setType(combo.type || 'FIXED');
      setFixedPrice(combo.fixedPrice != null ? String(combo.fixedPrice) : '');
      setDiscountType(combo.discountType || '');
      setDiscountValue(
        combo.discountValue != null ? String(combo.discountValue) : ''
      );
      setMinItems(combo.minItems != null ? String(combo.minItems) : '');
      setMaxItems(combo.maxItems != null ? String(combo.maxItems) : '');
      setIsActive(combo.isActive ?? true);
      setValidFrom(
        combo.validFrom ? combo.validFrom.substring(0, 10) : ''
      );
      setValidUntil(
        combo.validUntil ? combo.validUntil.substring(0, 10) : ''
      );
    }
  }, [combo]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Nome e obrigatorio');
      return;
    }

    try {
      setIsSaving(true);
      await updateMutation.mutateAsync({
        comboId,
        data: {
          name: name.trim(),
          description: description.trim() || null,
          type,
          fixedPrice: fixedPrice ? Number(fixedPrice) : null,
          discountType: discountType || null,
          discountValue: discountValue ? Number(discountValue) : null,
          minItems: minItems ? Number(minItems) : null,
          maxItems: maxItems ? Number(maxItems) : null,
          isActive,
          validFrom: validFrom || null,
          validUntil: validUntil || null,
        },
      });

      toast.success('Combo atualizado com sucesso!');
      await queryClient.invalidateQueries({
        queryKey: ['combos', comboId],
      });
      router.push(`/sales/combos/${comboId}`);
    } catch (err) {
      logger.error(
        'Erro ao atualizar combo',
        err instanceof Error ? err : undefined
      );
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao atualizar combo', { description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(comboId);
      toast.success('Combo excluido com sucesso!');
      router.push('/sales/combos');
    } catch (err) {
      logger.error(
        'Erro ao deletar combo',
        err instanceof Error ? err : undefined
      );
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao deletar combo', { description: message });
    }
  };

  // ============================================================================
  // ACTION BUTTONS
  // ============================================================================

  const actionButtons: HeaderButton[] = [
    ...(hasPermission(SALES_PERMISSIONS.COMBOS.REMOVE)
      ? [
          {
            id: 'delete',
            title: 'Excluir',
            icon: Trash2,
            onClick: () => setDeleteModalOpen(true),
            variant: 'default' as const,
            className:
              'bg-slate-200 text-slate-700 border-transparent hover:bg-rose-600 hover:text-white dark:bg-[#334155] dark:text-white dark:hover:bg-rose-600',
          },
        ]
      : []),
    {
      id: 'save',
      title: isSaving ? 'Salvando...' : 'Salvar',
      icon: isSaving ? Loader2 : Save,
      onClick: handleSubmit,
      variant: 'default',
      disabled: isSaving || !name.trim(),
    },
  ];

  // ============================================================================
  // LOADING / ERROR
  // ============================================================================

  const breadcrumbItems = [
    { label: 'Vendas', href: '/sales' },
    { label: 'Combos', href: '/sales/combos' },
    {
      label: combo?.name || '...',
      href: `/sales/combos/${comboId}`,
    },
    { label: 'Editar' },
  ];

  if (isLoadingCombo) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (error || !combo) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar breadcrumbItems={breadcrumbItems} />
        </PageHeader>
        <PageBody>
          <GridError
            type="not-found"
            title="Combo nao encontrado"
            message="O combo solicitado nao foi encontrado."
            action={{
              label: 'Voltar para Combos',
              onClick: () => router.push('/sales/combos'),
            }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={breadcrumbItems}
          buttons={actionButtons}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-lg bg-linear-to-br from-violet-500 to-purple-600">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Editando combo</p>
              <h1 className="text-xl font-bold truncate">{combo.name}</h1>
            </div>
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-2">
                <div className="text-right">
                  <p className="text-xs font-semibold">Status</p>
                  <p className="text-[11px] text-muted-foreground">
                    {isActive ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>
          </div>
        </Card>

        {/* Form Card: Dados do Combo */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-8">
            <div className="space-y-5">
              <SectionHeader
                icon={Info}
                title="Dados do Combo"
                subtitle="Informacoes basicas de identificacao"
              />
              <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="grid gap-2 sm:col-span-2 lg:col-span-2">
                    <Label htmlFor="name">
                      Nome <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Nome do combo"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="type">
                      Tipo <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={type}
                      onValueChange={v => setType(v as ComboType)}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED">Preco Fixo</SelectItem>
                        <SelectItem value="DYNAMIC">Dinamico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descricao</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descricao do combo..."
                    rows={3}
                  />
                </div>

                {/* Mobile toggle */}
                <div className="grid grid-cols-1 sm:hidden gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-white dark:bg-slate-800/60">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Status</Label>
                      <p className="text-sm text-muted-foreground">
                        {isActive ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Card: Precos e Descontos */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-8">
            <div className="space-y-5">
              <SectionHeader
                icon={DollarSign}
                title="Precos e Descontos"
                subtitle="Configuracao de valores do combo"
              />
              <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {type === 'FIXED' && (
                    <div className="grid gap-2">
                      <Label htmlFor="fixedPrice">Preco Fixo (R$)</Label>
                      <Input
                        id="fixedPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={fixedPrice}
                        onChange={e => setFixedPrice(e.target.value)}
                        placeholder="0,00"
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="discountType">Tipo de Desconto</Label>
                    <Select
                      value={discountType}
                      onValueChange={v =>
                        setDiscountType(v as ComboDiscountType | '')
                      }
                    >
                      <SelectTrigger id="discountType">
                        <SelectValue placeholder="Sem desconto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentual</SelectItem>
                        <SelectItem value="FIXED_VALUE">Valor Fixo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {discountType && (
                    <div className="grid gap-2">
                      <Label htmlFor="discountValue">
                        {discountType === 'PERCENTAGE'
                          ? 'Desconto (%)'
                          : 'Desconto (R$)'}
                      </Label>
                      <Input
                        id="discountValue"
                        type="number"
                        step={discountType === 'PERCENTAGE' ? '1' : '0.01'}
                        min="0"
                        max={discountType === 'PERCENTAGE' ? '100' : undefined}
                        value={discountValue}
                        onChange={e => setDiscountValue(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="minItems">Minimo de Itens</Label>
                    <Input
                      id="minItems"
                      type="number"
                      min="0"
                      value={minItems}
                      onChange={e => setMinItems(e.target.value)}
                      placeholder="Sem minimo"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maxItems">Maximo de Itens</Label>
                    <Input
                      id="maxItems"
                      type="number"
                      min="0"
                      value={maxItems}
                      onChange={e => setMaxItems(e.target.value)}
                      placeholder="Sem maximo"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Card: Periodo de Validade */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-8">
            <div className="space-y-5">
              <SectionHeader
                icon={Calendar}
                title="Periodo de Validade"
                subtitle="Defina quando o combo estara disponivel"
              />
              <div className="w-full rounded-xl border border-border bg-white p-6 dark:bg-slate-800/60 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="validFrom">Valido a partir de</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={validFrom}
                      onChange={e => setValidFrom(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="validUntil">Valido ate</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={validUntil}
                      onChange={e => setValidUntil(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Itens do Combo (placeholder) */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="px-6 py-4 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-foreground" />
                <div>
                  <h3 className="text-base font-semibold">
                    Itens do Combo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Produtos e categorias incluidos neste combo
                  </p>
                </div>
              </div>
              <div className="border-b border-border" />
            </div>

            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-base font-semibold text-muted-foreground">
                Itens do Combo
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                A edicao de itens vinculados ao combo estara disponivel em
                breve.
              </p>
            </div>
          </div>
        </Card>
      </PageBody>

      {/* Delete PIN Modal */}
      <VerifyActionPinModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleDeleteConfirm}
        title="Excluir Combo"
        description={`Digite seu PIN de acao para excluir o combo "${combo.name}". Esta acao nao pode ser desfeita.`}
      />
    </PageLayout>
  );
}
