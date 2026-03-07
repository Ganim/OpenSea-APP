'use client';

import { PageBreadcrumb } from '@/components/layout/page-breadcrumb';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  Calculator,
  Check,
  Loader2,
  Minus,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { useCreatePurchaseOrder } from '@/hooks/stock/use-purchase-orders';
import { useSuppliers } from '@/hooks/stock/use-stock-other';
import { useVariantsPaginated } from '@/hooks/stock/use-variants';
import type { CreatePurchaseOrderRequest, Variant } from '@/types/stock';

// Zod schema for form validation
const purchaseOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Número da ordem é obrigatório'),
  supplierId: z.string().min(1, 'Selecione um fornecedor'),
  notes: z.string().optional(),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface OrderItem {
  variantId: string;
  variant: Variant;
  quantity: number;
  unitCost: number;
  notes?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();

  // State
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [variantSearch, setVariantSearch] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUnitCost, setItemUnitCost] = useState(0);
  const [itemNotes, setItemNotes] = useState('');

  // Fetch data
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers();
  const { data: variantsData, isLoading: isLoadingVariants } =
    useVariantsPaginated({
      search: variantSearch || undefined,
      limit: 10,
    });

  const createMutation = useCreatePurchaseOrder();

  const suppliers = suppliersData?.suppliers || [];
  const variants = variantsData?.variants || [];

  // Form
  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      orderNumber: `PO-${Date.now().toString(36).toUpperCase()}`,
      supplierId: '',
      notes: '',
    },
  });

  // Calculate totals
  const totals = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0
    );
    return { totalItems, totalValue };
  }, [items]);

  // Handlers
  const handleAddItem = useCallback(() => {
    if (!selectedVariant) {
      toast.error('Selecione um produto');
      return;
    }

    if (itemQuantity <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    if (itemUnitCost <= 0) {
      toast.error('Preço unitário deve ser maior que zero');
      return;
    }

    // Check if variant already exists
    const existingIndex = items.findIndex(
      i => i.variantId === selectedVariant.id
    );
    if (existingIndex >= 0) {
      // Update existing item
      setItems(prev =>
        prev.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + itemQuantity,
                unitCost: itemUnitCost,
              }
            : item
        )
      );
      toast.success('Quantidade atualizada');
    } else {
      // Add new item
      setItems(prev => [
        ...prev,
        {
          variantId: selectedVariant.id,
          variant: selectedVariant,
          quantity: itemQuantity,
          unitCost: itemUnitCost,
          notes: itemNotes || undefined,
        },
      ]);
      toast.success('Item adicionado');
    }

    // Reset form
    setSelectedVariant(null);
    setItemQuantity(1);
    setItemUnitCost(0);
    setItemNotes('');
    setVariantSearch('');
    setIsAddItemDialogOpen(false);
  }, [selectedVariant, itemQuantity, itemUnitCost, itemNotes, items]);

  const handleRemoveItem = useCallback((variantId: string) => {
    setItems(prev => prev.filter(item => item.variantId !== variantId));
    toast.success('Item removido');
  }, []);

  const handleUpdateQuantity = useCallback(
    (variantId: string, delta: number) => {
      setItems(prev =>
        prev.map(item => {
          if (item.variantId === variantId) {
            const newQuantity = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      );
    },
    []
  );

  const handleUpdatePrice = useCallback(
    (variantId: string, newPrice: number) => {
      setItems(prev =>
        prev.map(item => {
          if (item.variantId === variantId) {
            return { ...item, unitCost: Math.max(0, newPrice) };
          }
          return item;
        })
      );
    },
    []
  );

  const handleSelectVariant = useCallback((variant: Variant) => {
    setSelectedVariant(variant);
    setItemUnitCost(variant.costPrice || variant.price || 0);
  }, []);

  const handleSubmit = useCallback(
    async (data: PurchaseOrderFormData) => {
      if (items.length === 0) {
        toast.error('Adicione pelo menos um item à ordem');
        return;
      }

      const request: CreatePurchaseOrderRequest = {
        orderNumber: data.orderNumber,
        supplierId: data.supplierId,
        notes: data.notes || undefined,
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          notes: item.notes,
        })),
      };

      createMutation.mutate(request, {
        onSuccess: response => {
          toast.success('Ordem de compra criada com sucesso');
          router.push(
            `/stock/requests/purchase-orders/${response.purchaseOrder.id}`
          );
        },
        onError: () => {
          toast.error('Erro ao criar ordem de compra');
        },
      });
    },
    [items, createMutation, router]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <PageBreadcrumb
          items={[
            { label: 'Estoque', href: '/stock' },
            {
              label: 'Ordens de Compra',
              href: '/stock/requests/purchase-orders',
            },
            {
              label: 'Nova Ordem',
              href: '/stock/requests/purchase-orders/new',
            },
          ]}
        />
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Ordem</CardTitle>
            <CardDescription>
              Informações básicas da ordem de compra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Order Number */}
              <div className="space-y-2">
                <Label htmlFor="orderNumber">
                  Número da Ordem <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="orderNumber"
                  {...form.register('orderNumber')}
                  placeholder="PO-001"
                />
                {form.formState.errors.orderNumber && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.orderNumber.message}
                  </p>
                )}
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <Label>
                  Fornecedor <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.watch('supplierId')}
                  onValueChange={value => form.setValue('supplierId', value)}
                  disabled={isLoadingSuppliers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {supplier.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.supplierId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.supplierId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Observações sobre a ordem de compra..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Itens da Ordem</CardTitle>
              <CardDescription>
                Adicione os produtos que deseja comprar
              </CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsAddItemDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-4" />
                <p>Nenhum item adicionado</p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setIsAddItemDialogOpen(true)}
                >
                  Adicionar primeiro item
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.variantId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.variant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.variant.sku || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(item.variantId, -1)
                            }
                            disabled={item.quantity <= 1}
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(item.variantId, 1)
                            }
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitCost}
                          onChange={e =>
                            handleUpdatePrice(
                              item.variantId,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-28 text-right ml-auto"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.quantity * item.unitCost)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveItem(item.variantId)}
                          aria-label="Remover item da ordem"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>
                      <span className="font-medium">Total</span>
                      <Badge variant="secondary" className="ml-2">
                        {totals.totalItems} item(s)
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      Subtotal
                    </TableCell>
                    <TableCell className="text-right text-xl font-bold">
                      {formatCurrency(totals.totalValue)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Summary & Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {totals.totalItems} item(s)
                  </span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xl font-bold">
                    {formatCurrency(totals.totalValue)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/stock/requests/purchase-orders')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || items.length === 0}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Criar Ordem
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Item</DialogTitle>
            <DialogDescription>
              Selecione um produto e informe a quantidade e preço
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Buscar Produto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, SKU, código..."
                  value={variantSearch}
                  onChange={e => setVariantSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Variant Selection */}
            {!selectedVariant ? (
              <div className="space-y-2">
                <Label>Selecione um produto</Label>
                <ScrollArea className="h-[200px] border rounded-lg">
                  {isLoadingVariants ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : variants.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>Nenhum produto encontrado</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {variants.map(variant => (
                        <div
                          key={variant.id}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                            'hover:bg-muted',
                            items.some(i => i.variantId === variant.id) &&
                              'bg-muted'
                          )}
                          onClick={() => handleSelectVariant(variant)}
                        >
                          <div>
                            <p className="font-medium">{variant.name}</p>
                            <p className="text-sm text-muted-foreground">
                              SKU: {variant.sku || '-'} | Preço:{' '}
                              {formatCurrency(variant.price)}
                            </p>
                          </div>
                          {items.some(i => i.variantId === variant.id) && (
                            <Badge variant="secondary">Já adicionado</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected Variant */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{selectedVariant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {selectedVariant.sku || '-'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVariant(null)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Trocar
                  </Button>
                </div>

                {/* Quantity & Price */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      Quantidade <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={e =>
                        setItemQuantity(parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">
                      Preço Unitário (R$){' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemUnitCost}
                      onChange={e =>
                        setItemUnitCost(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                {/* Item Notes */}
                <div className="space-y-2">
                  <Label htmlFor="itemNotes">Observações do Item</Label>
                  <Textarea
                    id="itemNotes"
                    value={itemNotes}
                    onChange={e => setItemNotes(e.target.value)}
                    placeholder="Observações sobre este item..."
                    rows={2}
                  />
                </div>

                {/* Subtotal Preview */}
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <span className="text-muted-foreground">
                    Subtotal do item
                  </span>
                  <span className="text-lg font-bold">
                    {formatCurrency(itemQuantity * itemUnitCost)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddItemDialogOpen(false);
                setSelectedVariant(null);
                setItemQuantity(1);
                setItemUnitCost(0);
                setItemNotes('');
                setVariantSearch('');
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAddItem}
              disabled={
                !selectedVariant || itemQuantity <= 0 || itemUnitCost <= 0
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
