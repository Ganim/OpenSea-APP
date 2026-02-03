/**
 * Edit Supplier Page
 * Página de edição de fornecedor
 */

'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/stock/page-header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
  useDeleteSupplier,
  useUpdateSupplier,
} from '@/hooks/stock/use-stock-other';
import { formatCEP, formatCNPJ, formatPhone } from '@/lib/masks';
import type { Supplier, UpdateSupplierRequest } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: supplierId } = use(params);

  const { data: supplier, isLoading: isLoadingSupplier } = useQuery<Supplier>({
    queryKey: ['suppliers', supplierId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/suppliers/${supplierId}`);
      const data = await response.json();
      return data.supplier;
    },
  });
  const updateSupplierMutation = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [taxId, setTaxId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [rating, setRating] = useState('0');
  const [notes, setNotes] = useState('');

  // Carregar dados do fornecedor quando disponível
  useEffect(() => {
    if (supplier) {
      setName(supplier.name || '');
      setCnpj(supplier.cnpj || '');
      setTaxId(supplier.taxId || '');
      setEmail(supplier.email || '');
      setPhone(supplier.phone || '');
      setWebsite(supplier.website || '');
      setAddressLine1(supplier.addressLine1 || '');
      setAddressLine2(supplier.addressLine2 || '');
      setCity(supplier.city || '');
      setState(supplier.state || '');
      setPostalCode(supplier.postalCode || '');
      setCountry(supplier.country || '');
      setIsActive(supplier.isActive ?? true);
      setRating(String(supplier.rating || 0));
      setNotes(supplier.notes || '');
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      const data: UpdateSupplierRequest = {
        name: name.trim(),
        cnpj: cnpj.trim() || undefined,
        taxId: taxId.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        addressLine1: addressLine1.trim() || undefined,
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        country: country.trim() || undefined,
        isActive,
        rating: parseFloat(rating) || undefined,
        notes: notes.trim() || undefined,
      };

      await updateSupplierMutation.mutateAsync({
        id: supplierId,
        data,
      });

      toast.success('Fornecedor atualizado com sucesso!');
      router.push(`/stock/suppliers/${supplierId}`);
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao atualizar fornecedor', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteSupplierMutation.mutateAsync(supplierId);
      toast.success('Fornecedor excluído com sucesso!');
      router.push('/stock/suppliers');
    } catch (error) {
      console.error('Erro ao deletar fornecedor:', error);
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao deletar fornecedor', { description: message });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoadingSupplier) {
    return (
      <ProtectedRoute requiredPermission="stock.suppliers.update">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <p className="text-muted-foreground">Carregando fornecedor...</p>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (!supplier) {
    return (
      <ProtectedRoute requiredPermission="stock.suppliers.update">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <p className="text-red-500">Fornecedor não encontrado</p>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermission="stock.suppliers.update">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Editar Fornecedor"
          description="Atualize as informações do fornecedor"
        />

        <Card className="mt-6 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nome do fornecedor"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={cnpj}
                    onChange={e => setCnpj(formatCNPJ(e.target.value))}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                    placeholder="Tax ID"
                  />
                </div>
              </div>

              {/* Contato */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contato@fornecedor.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={e => setPhone(formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://fornecedor.com"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Endereço</h3>

                <div className="grid gap-2">
                  <Label htmlFor="addressLine1">Endereço Linha 1</Label>
                  <Input
                    id="addressLine1"
                    value={addressLine1}
                    onChange={e => setAddressLine1(e.target.value)}
                    placeholder="Rua, número"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="addressLine2">Endereço Linha 2</Label>
                  <Input
                    id="addressLine2"
                    value={addressLine2}
                    onChange={e => setAddressLine2(e.target.value)}
                    placeholder="Complemento, bairro"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="São Paulo"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="SP"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="postalCode">CEP</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={e => setPostalCode(formatCEP(e.target.value))}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      placeholder="Brasil"
                    />
                  </div>
                </div>
              </div>

              {/* Outros */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="rating">Avaliação (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={rating}
                    onChange={e => setRating(e.target.value)}
                    placeholder="0.0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="isActive">Status</Label>
                  <Select
                    value={isActive ? 'active' : 'inactive'}
                    onValueChange={value => setIsActive(value === 'active')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Observações adicionais"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading || isDeleting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading || isDeleting || !name.trim()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>

              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={isLoading || isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Fornecedor
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor "{supplier.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
