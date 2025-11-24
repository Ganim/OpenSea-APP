/**
 * New Template Page
 * Página completa para criação de template com todos os detalhes
 */

'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageHeader } from '@/components/stock/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateTemplate } from '@/hooks/stock';
import type { CreateTemplateRequest } from '@/types/stock';
import { Layers, Plus, Save, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type AttributeType = 'string' | 'number' | 'boolean' | 'date' | 'select';

interface Attribute {
  key: string;
  label: string;
  type: AttributeType;
  required: boolean;
  options?: string[];
}

// Gera slug a partir do rótulo
const generateSlug = (label: string): string => {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '_') // Substitui caracteres especiais por _
    .replace(/^_+|_+$/g, ''); // Remove _ do início e fim
};

export default function NewTemplatePage() {
  const router = useRouter();
  const createTemplateMutation = useCreateTemplate();

  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [productAttributes, setProductAttributes] = useState<Attribute[]>([]);
  const [variantAttributes, setVariantAttributes] = useState<Attribute[]>([]);
  const [itemAttributes, setItemAttributes] = useState<Attribute[]>([]);

  const addProductAttribute = () => {
    setProductAttributes([
      ...productAttributes,
      { key: '', label: '', type: 'string', required: false },
    ]);
  };

  const removeProductAttribute = (index: number) => {
    setProductAttributes(productAttributes.filter((_, i) => i !== index));
  };

  const updateProductAttribute = (
    index: number,
    field: keyof Attribute,
    value: string | boolean | string[]
  ) => {
    const updated = [...productAttributes];
    updated[index] = { ...updated[index], [field]: value };

    // Gera slug automaticamente ao alterar o rótulo
    if (field === 'label' && typeof value === 'string') {
      updated[index].key = generateSlug(value);
    }

    setProductAttributes(updated);
  };

  const addVariantAttribute = () => {
    setVariantAttributes([
      ...variantAttributes,
      { key: '', label: '', type: 'string', required: false },
    ]);
  };

  const removeVariantAttribute = (index: number) => {
    setVariantAttributes(variantAttributes.filter((_, i) => i !== index));
  };

  const updateVariantAttribute = (
    index: number,
    field: keyof Attribute,
    value: string | boolean | string[]
  ) => {
    const updated = [...variantAttributes];
    updated[index] = { ...updated[index], [field]: value };

    // Gera slug automaticamente ao alterar o rótulo
    if (field === 'label' && typeof value === 'string') {
      updated[index].key = generateSlug(value);
    }

    setVariantAttributes(updated);
  };

  const addItemAttribute = () => {
    setItemAttributes([
      ...itemAttributes,
      { key: '', label: '', type: 'string', required: false },
    ]);
  };

  const removeItemAttribute = (index: number) => {
    setItemAttributes(itemAttributes.filter((_, i) => i !== index));
  };

  const updateItemAttribute = (
    index: number,
    field: keyof Attribute,
    value: string | boolean | string[]
  ) => {
    const updated = [...itemAttributes];
    updated[index] = { ...updated[index], [field]: value };

    // Gera slug automaticamente ao alterar o rótulo
    if (field === 'label' && typeof value === 'string') {
      updated[index].key = generateSlug(value);
    }

    setItemAttributes(updated);
  };

  const formatAttributes = (
    attributes: Attribute[]
  ): Record<string, unknown> => {
    if (attributes.length === 0) return {};

    const formatted = attributes.reduce(
      (acc, attr) => {
        if (attr.key) {
          acc[attr.key] = {
            label: attr.label,
            type: attr.type,
            required: attr.required,
            ...(attr.type === 'select' && attr.options
              ? { options: attr.options }
              : {}),
          };
        }
        return acc;
      },
      {} as Record<string, unknown>
    );

    return formatted;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      const data: CreateTemplateRequest = {
        name: name.trim(),
        productAttributes: formatAttributes(productAttributes),
        variantAttributes: formatAttributes(variantAttributes),
        itemAttributes: formatAttributes(itemAttributes),
      };

      await createTemplateMutation.mutateAsync(data);
      toast.success('Template criado com sucesso!');
      router.push('/stock/assets/templates');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      const errorDetails = JSON.stringify(
        {
          error: message,
          templateName: name,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );

      toast.error('Erro ao criar template', {
        description: message,
        action: {
          label: 'Copiar erro',
          onClick: () => {
            navigator.clipboard.writeText(errorDetails);
            toast.success('Erro copiado para área de transferência');
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="MANAGER">
      <div className="pb-8">
        <PageHeader
          title="Novo Template"
          description="Configure um template completo com todos os atributos necessários"
          showBackButton={true}
          backUrl="/stock/assets/templates"
          buttons={[
            {
              icon: Save,
              text: 'Criar Template',
              onClick: () => {
                const event = { preventDefault: () => {} } as React.FormEvent;
                handleSubmit(event);
              },
              variant: 'default',
              disabled: !name.trim(),
            },
            {
              icon: X,
              text: 'Cancelar',
              onClick: () => router.push('/stock/assets/templates'),
              variant: 'outline',
            },
          ]}
        />

        <form className="space-y-6">
          {/* Campo Nome acima das tabs */}
          <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome do Template <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ex: Eletrônicos, Roupas, Alimentos..."
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </div>

          {/* Tabs para atributos */}
          <Tabs defaultValue="product" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="product" className="gap-2">
                <Layers className="w-4 h-4" />
                Atributos de Produtos
              </TabsTrigger>
              <TabsTrigger value="variant" className="gap-2">
                <Layers className="w-4 h-4" />
                Atributos de Variantes
              </TabsTrigger>
              <TabsTrigger value="item" className="gap-2">
                <Layers className="w-4 h-4" />
                Atributos de Itens
              </TabsTrigger>
            </TabsList>

            {/* Tab: Atributos de Produtos */}
            <TabsContent value="product" className="space-y-4 mt-6">
              <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Atributos de Produtos</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Defina os campos que cada produto deste template terá
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProductAttribute}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {productAttributes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum atributo adicionado. Clique em &quot;Adicionar&quot;
                    para começar.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productAttributes.map((attr, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Rótulo</Label>
                            <Input
                              placeholder="ex: Marca"
                              value={attr.label}
                              onChange={e =>
                                updateProductAttribute(
                                  index,
                                  'label',
                                  e.target.value
                                )
                              }
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select
                              value={attr.type}
                              onValueChange={value =>
                                updateProductAttribute(
                                  index,
                                  'type',
                                  value as AttributeType
                                )
                              }
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">Texto</SelectItem>
                                <SelectItem value="number">Número</SelectItem>
                                <SelectItem value="boolean">Sim/Não</SelectItem>
                                <SelectItem value="date">Data</SelectItem>
                                <SelectItem value="select">Seleção</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Ações</Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={attr.required ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                  updateProductAttribute(
                                    index,
                                    'required',
                                    !attr.required
                                  )
                                }
                                className={
                                  attr.required
                                    ? 'flex-1 h-11'
                                    : 'flex-1 h-11 bg-white dark:bg-gray-900'
                                }
                              >
                                {attr.required ? 'Obrigatório' : 'Opcional'}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProductAttribute(index)}
                                className="h-11 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {attr.type === 'select' && (
                            <div className="col-span-full space-y-2">
                              <Label>Opções (separadas por vírgula)</Label>
                              <Input
                                placeholder="ex: Nike, Adidas, Puma"
                                value={attr.options?.join(', ') || ''}
                                onChange={e =>
                                  updateProductAttribute(
                                    index,
                                    'options',
                                    e.target.value.split(',').map(s => s.trim())
                                  )
                                }
                                className="h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab: Atributos de Variantes */}
            <TabsContent value="variant" className="space-y-4 mt-6">
              <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Atributos de Variantes</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Defina os campos que cada variante deste template terá
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariantAttribute}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {variantAttributes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum atributo adicionado. Clique em &quot;Adicionar&quot;
                    para começar.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {variantAttributes.map((attr, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Rótulo</Label>
                            <Input
                              placeholder="ex: Cor"
                              value={attr.label}
                              onChange={e =>
                                updateVariantAttribute(
                                  index,
                                  'label',
                                  e.target.value
                                )
                              }
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select
                              value={attr.type}
                              onValueChange={value =>
                                updateVariantAttribute(
                                  index,
                                  'type',
                                  value as AttributeType
                                )
                              }
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">Texto</SelectItem>
                                <SelectItem value="number">Número</SelectItem>
                                <SelectItem value="boolean">Sim/Não</SelectItem>
                                <SelectItem value="date">Data</SelectItem>
                                <SelectItem value="select">Seleção</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Ações</Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={attr.required ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                  updateVariantAttribute(
                                    index,
                                    'required',
                                    !attr.required
                                  )
                                }
                                className={
                                  attr.required
                                    ? 'flex-1 h-11'
                                    : 'flex-1 h-11 bg-white dark:bg-gray-900'
                                }
                              >
                                {attr.required ? 'Obrigatório' : 'Opcional'}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVariantAttribute(index)}
                                className="h-11 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {attr.type === 'select' && (
                            <div className="col-span-full space-y-2">
                              <Label>Opções (separadas por vírgula)</Label>
                              <Input
                                placeholder="ex: Vermelho, Azul, Verde"
                                value={attr.options?.join(', ') || ''}
                                onChange={e =>
                                  updateVariantAttribute(
                                    index,
                                    'options',
                                    e.target.value.split(',').map(s => s.trim())
                                  )
                                }
                                className="h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Atributos de Itens */}
            <TabsContent value="item" className="space-y-4 mt-6">
              <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Atributos de Itens</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Defina os campos que cada item deste template terá
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItemAttribute}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {itemAttributes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum atributo adicionado. Clique em &quot;Adicionar&quot;
                    para começar.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {itemAttributes.map((attr, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Rótulo</Label>
                            <Input
                              placeholder="ex: Número de Série"
                              value={attr.label}
                              onChange={e =>
                                updateItemAttribute(
                                  index,
                                  'label',
                                  e.target.value
                                )
                              }
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select
                              value={attr.type}
                              onValueChange={value =>
                                updateItemAttribute(
                                  index,
                                  'type',
                                  value as AttributeType
                                )
                              }
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">Texto</SelectItem>
                                <SelectItem value="number">Número</SelectItem>
                                <SelectItem value="boolean">Sim/Não</SelectItem>
                                <SelectItem value="date">Data</SelectItem>
                                <SelectItem value="select">Seleção</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Ações</Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={attr.required ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                  updateItemAttribute(
                                    index,
                                    'required',
                                    !attr.required
                                  )
                                }
                                className={
                                  attr.required
                                    ? 'flex-1 h-11'
                                    : 'flex-1 h-11 bg-white dark:bg-gray-900'
                                }
                              >
                                {attr.required ? 'Obrigatório' : 'Opcional'}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemAttribute(index)}
                                className="h-11 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {attr.type === 'select' && (
                            <div className="col-span-full space-y-2">
                              <Label>Opções (separadas por vírgula)</Label>
                              <Input
                                placeholder="ex: Novo, Usado, Recondicionado"
                                value={attr.options?.join(', ') || ''}
                                onChange={e =>
                                  updateItemAttribute(
                                    index,
                                    'options',
                                    e.target.value.split(',').map(s => s.trim())
                                  )
                                }
                                className="h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </ProtectedRoute>
  );
}
