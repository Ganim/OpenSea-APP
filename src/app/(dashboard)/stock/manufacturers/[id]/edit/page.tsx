/**
 * Edit Manufacturer Page
 * Página de edição de fabricante
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
  useDeleteManufacturer,
  useUpdateManufacturer,
} from '@/hooks/stock/use-stock-other';
import { formatCEP, formatPhone } from '@/lib/masks';
import type { Manufacturer, UpdateManufacturerRequest } from '@/types/stock';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditManufacturerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: manufacturerId } = use(params);

  const { data: manufacturer, isLoading: isLoadingManufacturer } =
    useQuery<Manufacturer>({
      queryKey: ['manufacturers', manufacturerId],
      queryFn: async () => {
        const response = await fetch(`/api/v1/manufacturers/${manufacturerId}`);
        const data = await response.json();
        return data.manufacturer;
      },
    });
  const updateManufacturerMutation = useUpdateManufacturer();
  const deleteManufacturerMutation = useDeleteManufacturer();

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [rating, setRating] = useState('0');
  const [notes, setNotes] = useState('');

  // Carregar dados do fabricante quando disponível
  useEffect(() => {
    if (manufacturer) {
      setName(manufacturer.name || '');
      setCountry(manufacturer.country || '');
      setEmail(manufacturer.email || '');
      setPhone(manufacturer.phone || '');
      setWebsite(manufacturer.website || '');
      setAddressLine1(manufacturer.addressLine1 || '');
      setAddressLine2(manufacturer.addressLine2 || '');
      setCity(manufacturer.city || '');
      setState(manufacturer.state || '');
      setPostalCode(manufacturer.postalCode || '');
      setIsActive(manufacturer.isActive ?? true);
      setRating(String(manufacturer.rating || 0));
      setNotes(manufacturer.notes || '');
    }
  }, [manufacturer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !country.trim()) {
      toast.error('Nome e País são obrigatórios');
      return;
    }

    try {
      setIsLoading(true);
      const data: UpdateManufacturerRequest = {
        name: name.trim(),
        country: country.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        addressLine1: addressLine1.trim() || undefined,
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        isActive,
        rating: parseFloat(rating) || undefined,
        notes: notes.trim() || undefined,
      };

      await updateManufacturerMutation.mutateAsync({
        id: manufacturerId,
        data,
      });

      toast.success('Fabricante atualizado com sucesso!');
      router.push(`/stock/manufacturers/${manufacturerId}`);
    } catch (error) {
      console.error('Erro ao atualizar fabricante:', error);
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao atualizar fabricante', { description: message });
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
      await deleteManufacturerMutation.mutateAsync(manufacturerId);
      toast.success('Fabricante excluído com sucesso!');
      router.push('/stock/manufacturers');
    } catch (error) {
      console.error('Erro ao deletar fabricante:', error);
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao deletar fabricante', { description: message });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoadingManufacturer) {
    return (
      <ProtectedRoute requiredPermission="stock.manufacturers.update">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <p className="text-muted-foreground">Carregando fabricante...</p>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (!manufacturer) {
    return (
      <ProtectedRoute requiredPermission="stock.manufacturers.update">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <p className="text-red-500">Fabricante não encontrado</p>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermission="stock.manufacturers.update">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Editar Fabricante"
          description="Atualize as informações do fabricante"
        />

        <Card className="mt-6 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nome do fabricante"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="country">
                    País <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    placeholder="Brasil"
                    required
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
                    placeholder="contato@fabricante.com"
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
                    placeholder="https://fabricante.com"
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

                <div className="grid gap-4 md:grid-cols-3">
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
                  disabled={
                    isLoading || isDeleting || !name.trim() || !country.trim()
                  }
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
                Excluir Fabricante
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
              Tem certeza que deseja excluir o fabricante "{manufacturer.name}"?
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
