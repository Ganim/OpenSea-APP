/**
 * Edit Manufacturer Page - Identical to Company Edit Page
 * Uses manual form (proven to work) with companies layout
 */

'use client';

import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { formatCEP, formatPhone } from '@/lib/masks';
import type { Manufacturer, UpdateManufacturerRequest } from '@/types/stock';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Factory, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { manufacturersApi } from '../../src';

export default function EditManufacturerPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const manufacturerId = params.id as string;

  // Form state
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [cnpj, setCnpj] = useState('');
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

  const { data: manufacturer, isLoading } = useQuery<Manufacturer>({
    queryKey: ['manufacturers', manufacturerId],
    queryFn: () => manufacturersApi.get(manufacturerId),
    enabled: !!manufacturerId,
  });

  // Load manufacturer data into form
  useEffect(() => {
    if (manufacturer) {
      setName(manufacturer.name || '');
      setLegalName(manufacturer.legalName || '');
      setCnpj(manufacturer.cnpj || '');
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

  const updateMutation = useMutation({
    mutationFn: (data: UpdateManufacturerRequest) =>
      manufacturersApi.update(manufacturerId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast.success('Fabricante atualizado com sucesso');
      router.push(`/stock/manufacturers/${manufacturerId}`);
    },
    onError: error => {
      logger.error(
        'Erro ao atualizar fabricante',
        error instanceof Error ? error : undefined
      );
      toast.error('Não foi possível atualizar o fabricante');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !country.trim()) {
      toast.error('Nome e País são obrigatórios');
      return;
    }

    const data: UpdateManufacturerRequest = {
      name: name.trim(),
      legalName: legalName.trim() || undefined,
      cnpj: cnpj.trim() || undefined,
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

    await updateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!manufacturer) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <Factory className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">
            Fabricante não encontrado
          </h2>
          <Button
            onClick={() => router.push('/stock/manufacturers')}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Fabricantes
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-8xl flex items-center gap-4 mb-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              const form = document.getElementById(
                'manufacturer-form'
              ) as HTMLFormElement;
              if (form) {
                form.dispatchEvent(
                  new Event('submit', { cancelable: true, bubbles: true })
                );
              }
            }}
            className="gap-2"
            disabled={updateMutation.isPending}
          >
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Manufacturer Info Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex gap-4 sm:flex-row items-center sm:gap-6">
          <div className="flex items-center justify-center h-10 w-10 md:h-16 md:w-16 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 shrink-0">
            <Factory className="md:h-8 md:w-8 text-white" />
          </div>
          <div className="flex justify-between flex-1 gap-4 flex-row items-center">
            <div>
              <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                {manufacturer.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Editar Fabricante
              </p>
            </div>
            <div>
              <Badge variant="secondary" className="mt-1">
                Editando
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card className="w-full p-4 sm:p-6">
        <form
          id="manufacturer-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Identificação</h3>
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
                  maxLength={255}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="legalName">Razão Social</Label>
                <Input
                  id="legalName"
                  value={legalName}
                  onChange={e => setLegalName(e.target.value)}
                  placeholder="Razão social completa"
                  maxLength={256}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={cnpj}
                  onChange={e => setCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
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
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contato</h3>
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
                  maxLength={20}
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
                maxLength={255}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="addressLine2">Endereço Linha 2</Label>
              <Input
                id="addressLine2"
                value={addressLine2}
                onChange={e => setAddressLine2(e.target.value)}
                placeholder="Complemento, bairro"
                maxLength={255}
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
                  maxLength={100}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="SP"
                  maxLength={100}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="postalCode">CEP</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={e => setPostalCode(formatCEP(e.target.value))}
                  placeholder="00000-000"
                  maxLength={20}
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Observações</h3>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Observações adicionais"
                rows={4}
                maxLength={1000}
              />
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
