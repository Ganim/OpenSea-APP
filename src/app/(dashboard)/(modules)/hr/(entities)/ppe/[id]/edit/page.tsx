'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { ppeService } from '@/services/hr/ppe.service';
import type { PPEItem, PPECategory, UpdatePPEItemData } from '@/types/hr';
import { useQuery } from '@tanstack/react-query';
import { HardHat, Loader2, Minus, Plus, Save, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  ppeKeys,
  useUpdatePPEItem,
  useDeletePPEItem,
  useAdjustPPEStock,
  getCategoryLabel,
  PPE_CATEGORIES,
} from '../../src';

export default function PPEEditPage() {
  const router = useRouter();
  const params = useParams();
  const ppeItemId = params.id as string;

  const { hasPermission } = usePermissions();
  const canDelete = hasPermission(HR_PERMISSIONS.PPE.DELETE);

  // ============================================================================
  // DATA
  // ============================================================================

  const {
    data: ppeItemData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ppeKeys.itemDetail(ppeItemId),
    queryFn: async () => {
      const response = await ppeService.getItem(ppeItemId);
      return response.ppeItem;
    },
  });

  const ppeItem = ppeItemData as PPEItem | undefined;

  // ============================================================================
  // FORM STATE
  // ============================================================================

  const [name, setName] = useState('');
  const [category, setCategory] = useState<PPECategory>('HEAD');
  const [caNumber, setCaNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [expirationMonths, setExpirationMonths] = useState('');
  const [minStock, setMinStock] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [stockAdjustment, setStockAdjustment] = useState('');

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Initialize form when data loads
  useEffect(() => {
    if (ppeItem) {
      setName(ppeItem.name);
      setCategory(ppeItem.category);
      setCaNumber(ppeItem.caNumber ?? '');
      setManufacturer(ppeItem.manufacturer ?? '');
      setModel(ppeItem.model ?? '');
      setExpirationMonths(
        ppeItem.expirationMonths ? String(ppeItem.expirationMonths) : ''
      );
      setMinStock(String(ppeItem.minStock));
      setIsActive(ppeItem.isActive);
      setNotes(ppeItem.notes ?? '');
    }
  }, [ppeItem]);

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const updateMutation = useUpdatePPEItem({
    onSuccess: () => router.push(`/hr/ppe/${ppeItemId}`),
  });

  const deleteMutation = useDeletePPEItem({
    onSuccess: () => router.push('/hr/ppe'),
  });

  const adjustStockMutation = useAdjustPPEStock();

  const handleSave = useCallback(async () => {
    const payload: UpdatePPEItemData = {
      name: name.trim(),
      category,
      caNumber: caNumber.trim() || null,
      manufacturer: manufacturer.trim() || null,
      model: model.trim() || null,
      expirationMonths: expirationMonths ? Number(expirationMonths) : null,
      minStock: Number(minStock) || 0,
      isActive,
      notes: notes.trim() || null,
    };

    await updateMutation.mutateAsync({ id: ppeItemId, data: payload });
  }, [
    name,
    category,
    caNumber,
    manufacturer,
    model,
    expirationMonths,
    minStock,
    isActive,
    notes,
    ppeItemId,
    updateMutation,
  ]);

  const handleDeleteConfirm = useCallback(async () => {
    await deleteMutation.mutateAsync(ppeItemId);
    setIsDeleteOpen(false);
  }, [deleteMutation, ppeItemId]);

  const handleAdjustStock = useCallback(
    async (adjustment: number) => {
      await adjustStockMutation.mutateAsync({
        id: ppeItemId,
        adjustment,
      });
      setStockAdjustment('');
    },
    [adjustStockMutation, ppeItemId]
  );

  // ============================================================================
  // LOADING / ERROR
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'EPI', href: '/hr/ppe' },
              { label: 'Carregando...' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={1} layout="list" size="lg" />
        </PageBody>
      </PageLayout>
    );
  }

  if (error || !ppeItem) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'EPI', href: '/hr/ppe' },
              { label: 'Erro' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="not-found"
            title="EPI não encontrado"
            message="O equipamento solicitado não foi encontrado."
            action={{
              label: 'Voltar',
              onClick: () => router.push('/hr/ppe'),
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
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'EPI', href: '/hr/ppe' },
            { label: ppeItem.name, href: `/hr/ppe/${ppeItemId}` },
            { label: 'Editar' },
          ]}
          buttons={[
            ...(canDelete
              ? [
                  {
                    id: 'delete',
                    title: 'Excluir',
                    icon: Trash2,
                    onClick: () => setIsDeleteOpen(true),
                    variant: 'destructive' as const,
                  },
                ]
              : []),
            {
              id: 'save',
              title: 'Salvar',
              icon: Save,
              onClick: handleSave,
              variant: 'default' as const,
              disabled: updateMutation.isPending,
            },
          ]}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-sky-600">
              <HardHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{ppeItem.name}</h2>
              <p className="text-xs text-muted-foreground">
                Cadastrado em{' '}
                {new Date(ppeItem.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>

        {/* Form Card */}
        <Card className="bg-white/5 py-2 overflow-hidden">
          <div className="space-y-6 p-5">
            {/* Basic Info */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Informações Básicas
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Nome *</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nome do EPI"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-category">Categoria *</Label>
                    <Select
                      value={category}
                      onValueChange={val => setCategory(val as PPECategory)}
                    >
                      <SelectTrigger id="edit-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PPE_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {getCategoryLabel(cat)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-ca">Número do CA</Label>
                    <Input
                      id="edit-ca"
                      value={caNumber}
                      onChange={e => setCaNumber(e.target.value)}
                      placeholder="CA-12345"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-manufacturer">Fabricante</Label>
                    <Input
                      id="edit-manufacturer"
                      value={manufacturer}
                      onChange={e => setManufacturer(e.target.value)}
                      placeholder="Fabricante"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-model">Modelo</Label>
                    <Input
                      id="edit-model"
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      placeholder="Modelo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-expiration">Validade (meses)</Label>
                    <Input
                      id="edit-expiration"
                      type="number"
                      min="1"
                      value={expirationMonths}
                      onChange={e => setExpirationMonths(e.target.value)}
                      placeholder="12"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch
                      id="edit-active"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <Label htmlFor="edit-active">Ativo</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Stock */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Estoque
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-min-stock">Estoque Mínimo</Label>
                    <Input
                      id="edit-min-stock"
                      type="number"
                      min="0"
                      value={minStock}
                      onChange={e => setMinStock(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Estoque Atual</Label>
                    <p className="mt-1 text-2xl font-bold">
                      {ppeItem.currentStock}
                    </p>
                  </div>
                </div>

                {/* Quick stock adjustment */}
                <div className="rounded-lg border bg-muted/30 p-4">
                  <Label className="mb-2 block text-sm font-medium">
                    Ajuste Rápido de Estoque
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Quantidade"
                      value={stockAdjustment}
                      onChange={e => setStockAdjustment(e.target.value)}
                      className="w-32"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        !stockAdjustment ||
                        Number(stockAdjustment) <= 0 ||
                        adjustStockMutation.isPending
                      }
                      onClick={() => handleAdjustStock(Number(stockAdjustment))}
                    >
                      {adjustStockMutation.isPending ? (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="mr-1 h-3.5 w-3.5" />
                      )}
                      Adicionar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        !stockAdjustment ||
                        Number(stockAdjustment) <= 0 ||
                        adjustStockMutation.isPending
                      }
                      onClick={() =>
                        handleAdjustStock(-Number(stockAdjustment))
                      }
                    >
                      {adjustStockMutation.isPending ? (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Minus className="mr-1 h-3.5 w-3.5" />
                      )}
                      Remover
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Notes */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Observações
              </h3>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Observações sobre o EPI..."
                rows={4}
              />
            </div>
          </div>
        </Card>

        {/* Delete Modal */}
        <VerifyActionPinModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onSuccess={handleDeleteConfirm}
          title="Excluir EPI"
          description="Digite seu PIN de ação para excluir este equipamento de proteção. Esta ação não pode ser desfeita."
        />
      </PageBody>
    </PageLayout>
  );
}
