/**
 * Create/Edit Location Modal
 * Modal enxuto para criação e edição de localizações
 * - Apenas nome necessário
 * - Código gerado automaticamente (3 primeiros caracteres em maiúsculo)
 * - Tipo definido automaticamente pela hierarquia
 */

'use client';

import { BatchProgressDialog } from '@/components/shared/progress/batch-progress-dialog';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateLocation,
  useUpdateLocation,
} from '@/hooks/stock/use-stock-other';
import { useBatchOperation } from '@/hooks/use-batch-operation-v2';
import type {
  CreateLocationRequest,
  LocationType,
  UpdateLocationRequest,
} from '@/types/stock';
import { MapPin, Plus, Save, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Constants for location management
const LOCATION_HIERARCHY: Record<string, LocationType> = {
  WAREHOUSE: 'ZONE',
  ZONE: 'AISLE',
  AISLE: 'SHELF',
  SHELF: 'BIN',
  BIN: 'OTHER',
};

const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  WAREHOUSE: 'Armazém',
  ZONE: 'Zona',
  AISLE: 'Corredor',
  SHELF: 'Prateleira',
  BIN: 'Compartimento',
  OTHER: 'Outro',
};

const MAX_COLUMNS = 99;
const MAX_ROWS = 26;
const PREVIEW_LIMIT = 10;
const FOCUS_DELAY_MS = 100;
const PARSE_DELAY_MS = 500;

// Regex patterns for parsing location patterns
const COMPLEX_PATTERN_REGEX = /^(.+?)\{([^}]+)\}(.+?)\[([^\]]+)\]$/;
const SIMPLE_BRACKET_PATTERN = /^(.+?)\[([^\]]+)\]$/;
const START_BRACKET_PATTERN = /^\[([^\]]+)\]$/;
const BRACE_PATTERN = /^(.*?)\{([^}]+)\}(.*?)$/;
const COMPLEX_ADVANCED_PATTERN = /^(.+?)\{([^}]+)\}-\[([^\]]+)\]$/;
const COLUMNS_ONLY_PATTERN = /^(.+?)\{([^}]+)\}$/;
const ROWS_ONLY_PATTERN = /^(.+?)\[([^\]]+)\]$/;
const SIMPLE_PATTERN = /^(.+?)$/;
const HIERARCHY_PATTERN = /^(.+?)\*\((.+?)\)$/;

interface CreateEditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editLocation?: {
    id: string;
    name: string;
    code: string;
    type: string;
    parentId?: string;
    isActive: boolean;
  };
  parentLocation?: {
    id: string;
    type: string;
    code?: string;
  };
}

export function CreateEditLocationModal({
  isOpen,
  onClose,
  onSuccess,
  editLocation,
  parentLocation,
}: CreateEditLocationModalProps) {
  const createLocationMutation = useCreateLocation();
  const updateLocationMutation = useUpdateLocation();

  const [names, setNames] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Estados para aba básica
  const [basicName, setBasicName] = useState('');
  const [aisleConfigs, setAisleConfigs] = useState<
    Array<{
      name: string;
      columns: number;
      rows: number;
    }>
  >([{ name: '', columns: 1, rows: 1 }]);

  const isEditing = !!editLocation;

  // Batch create operation
  const batchCreate = useBatchOperation(
    async (locationData: string) => {
      // locationData é um JSON stringificado com os dados da localização
      const data = JSON.parse(locationData) as CreateLocationRequest;
      return createLocationMutation.mutateAsync(data);
    },
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onComplete: results => {
        const succeeded = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;

        if (failed === 0) {
          toast.success(
            succeeded === 1
              ? 'Localização criada com sucesso!'
              : `${succeeded} localizações criadas com sucesso!`
          );
        } else if (succeeded > 0) {
          toast.warning(
            `${succeeded} localizações criadas, mas ${failed} falharam.`
          );
        } else {
          toast.error('Erro ao criar localizações');
        }

        onSuccess?.();
        handleClose();
      },
    }
  );

  // Estado para controlar se estamos criando pais ou filhos na hierarquia
  const createdLocationIdsRef = useRef(new Map<string, string>());

  // Função auxiliar para executar operação batch com modo específico
  const executeBatchOperation = async (
    locations: LocationCreationData[],
    creatingChildren: boolean
  ) => {
    const dataList = locations.map(location =>
      JSON.stringify({ ...location, creatingChildren })
    );
    await hierarchicalBatch.start(dataList);
  };

  // Batch operation para hierarquia (pais primeiro, filhos depois)
  const hierarchicalBatch = useBatchOperation(
    async (locationData: string) => {
      const data = JSON.parse(locationData) as LocationCreationData & {
        creatingChildren?: boolean;
      };
      const creatingChildren = data.creatingChildren || false;

      // Se estamos criando filhos, resolver o parentId baseado no nome do pai
      let parentId = data.parentId;
      if (creatingChildren && data.parentName) {
        parentId = createdLocationIdsRef.current.get(data.parentName);
        console.log(
          `Resolvendo parentId para ${data.titulo}: parentName=${data.parentName}, resolvedId=${parentId}`
        );
      }

      const result = await createLocationMutation.mutateAsync({
        titulo: data.titulo,
        type: data.type,
        parentId,
        isActive: data.isActive,
      });

      // Se estamos criando pais, armazenar o ID para referência futura
      if (
        !creatingChildren &&
        result &&
        typeof result.id === 'string' &&
        data.titulo
      ) {
        createdLocationIdsRef.current.set(data.titulo, result.id);
        console.log(`Armazenado ID para ${data.titulo}: ${result.id}`);
      }

      return result;
    },
    {
      batchSize: 3,
      delayBetweenItems: 500,
      delayBetweenBatches: 2000,
      maxRetries: 3,
      onComplete: results => {
        const succeeded = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;

        if (failed === 0) {
          toast.success(
            succeeded === 1
              ? 'Localização criada com sucesso!'
              : `${succeeded} localizações criadas com sucesso!`
          );
        } else if (succeeded > 0) {
          toast.warning(
            `${succeeded} localizações criadas, mas ${failed} falharam.`
          );
        } else {
          toast.error('Erro ao criar localizações');
        }

        onSuccess?.();
        handleClose();
      },
    }
  );

  // Hierarquia automática: Warehouse > Zona > Prateleira > Compartimento > Outro
  const getNextTypeInHierarchy = (parentType?: string): LocationType => {
    return LOCATION_HIERARCHY[parentType || ''] || 'WAREHOUSE';
  };

  // Reset form quando modal abre
  useEffect(() => {
    if (isOpen) {
      if (isEditing && editLocation) {
        setBasicName(editLocation.name || '');
        setNames(editLocation.name || '');
      } else {
        setBasicName('');
        setNames('');
        setAisleConfigs([{ name: '', columns: 1, rows: 1 }]);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, FOCUS_DELAY_MS);
    }
  }, [isOpen, isEditing, editLocation]);

  // Funções para gerenciar configurações de corredor
  const addAisleConfig = () => {
    setAisleConfigs([...aisleConfigs, { name: '', columns: 1, rows: 1 }]);
  };

  const updateAisleConfig = (
    index: number,
    field: keyof (typeof aisleConfigs)[0],
    value: string | number
  ) => {
    const updated = [...aisleConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setAisleConfigs(updated);
  };

  const removeAisleConfig = (index: number) => {
    if (aisleConfigs.length > 1) {
      setAisleConfigs(aisleConfigs.filter((_, i) => i !== index));
    }
  };

  // Gerar nomes para corredor baseado na configuração
  const generateAisleNames = (config: (typeof aisleConfigs)[0]): string[] => {
    const names: string[] = [];
    for (let col = 1; col <= config.columns; col++) {
      const paddedCol = formatNumberWithPadding(col, config.columns);
      for (let row = 0; row < config.rows; row++) {
        const letter = String.fromCharCode(65 + row); // A, B, C...
        names.push(`${config.name}${paddedCol}${letter}`);
      }
    }
    return names;
  };

  // Função para gerar texto da aba avançada baseado na aba básica
  const generateAdvancedTextFromBasic = useCallback((): string => {
    const nextType = getNextTypeInHierarchy(parentLocation?.type);

    if (nextType === 'AISLE') {
      // Para corredores, gerar padrão baseado nas configurações
      const validConfigs = aisleConfigs.filter(config => config.name.trim());
      if (validConfigs.length === 0) return '';

      const patterns: string[] = [];
      for (const config of validConfigs) {
        if (config.columns === 1 && config.rows === 1) {
          // Caso simples: apenas o nome base
          patterns.push(config.name);
        } else if (config.columns > 1 && config.rows === 1) {
          // Apenas colunas: nome{colunas}
          patterns.push(`${config.name}{${config.columns}}`);
        } else if (config.columns === 1 && config.rows > 1) {
          // Apenas linhas: nome[linhas]
          patterns.push(`${config.name}[${config.rows}]`);
        } else {
          // Colunas e linhas: nome{colunas}-[linhas]
          patterns.push(`${config.name}{${config.columns}}-[${config.rows}]`);
        }
      }
      return patterns.join(', ');
    } else {
      // Para warehouse/zona, apenas o nome simples
      return basicName.trim();
    }
  }, [aisleConfigs, basicName, parentLocation?.type]);

  // Função para tentar parsear texto da aba avançada e atualizar aba básica
  const parseAdvancedTextToBasic = useCallback(
    (text: string) => {
      const nextType = getNextTypeInHierarchy(parentLocation?.type);

      if (nextType === 'AISLE') {
        // Tentar parsear padrões de corredor
        const parts = text
          .split(',')
          .map(p => p.trim())
          .filter(p => p);
        const configs: typeof aisleConfigs = [];

        for (const part of parts) {
          // Tentar identificar padrões como: nome{colunas}-[linhas], nome{colunas}, nome[linhas]
          const complexPattern = COMPLEX_ADVANCED_PATTERN;
          const columnsOnlyPattern = COLUMNS_ONLY_PATTERN;
          const rowsOnlyPattern = ROWS_ONLY_PATTERN;
          const simplePattern = SIMPLE_PATTERN;

          let name = '';
          let columns = 1;
          let rows = 1;

          if (complexPattern.test(part)) {
            const match = part.match(complexPattern);
            if (match) {
              name = match[1];
              columns = parseInt(match[2]) || 1;
              rows = parseInt(match[3]) || 1;
            }
          } else if (columnsOnlyPattern.test(part)) {
            const match = part.match(columnsOnlyPattern);
            if (match) {
              name = match[1];
              columns = parseInt(match[2]) || 1;
            }
          } else if (rowsOnlyPattern.test(part)) {
            const match = part.match(rowsOnlyPattern);
            if (match) {
              name = match[1];
              rows = parseInt(match[2]) || 1;
            }
          } else if (simplePattern.test(part)) {
            name = part;
          }

          if (name.trim()) {
            configs.push({ name: name.trim(), columns, rows });
          }
        }

        if (configs.length > 0) {
          setAisleConfigs(configs);
        }
      } else {
        // Para warehouse/zona, usar o primeiro nome
        const firstName = text.split(',')[0]?.trim() || '';
        setBasicName(firstName);
      }
    },
    [parentLocation?.type]
  );

  // Sincronizar aba básica com aba avançada
  useEffect(() => {
    if (!isEditing && activeTab === 'basic') {
      const advancedText = generateAdvancedTextFromBasic();
      setNames(advancedText);
    }
  }, [generateAdvancedTextFromBasic, activeTab, isEditing]);

  // Sincronizar aba avançada com aba básica (apenas se for possível parsear)
  useEffect(() => {
    if (!isEditing && activeTab === 'advanced') {
      // Pequeno delay para não interferir enquanto o usuário está digitando
      const timeoutId = setTimeout(() => {
        parseAdvancedTextToBasic(names);
      }, PARSE_DELAY_MS);

      return () => clearTimeout(timeoutId);
    }
  }, [parseAdvancedTextToBasic, names, activeTab, isEditing]);

  // Estrutura para representar uma localização com filhos
  interface LocationNode {
    name: string;
    children: LocationNode[];
  }

  // Estrutura para criação com hierarquia
  interface LocationCreationData extends CreateLocationRequest {
    parentName?: string; // Nome do pai para referência
  }

  // Função auxiliar para formatar números com padding de zeros
  const formatNumberWithPadding = (num: number, maxNum: number): string => {
    const maxDigits = maxNum.toString().length;
    return num.toString().padStart(maxDigits, '0');
  };

  // Função para expandir padrões com chaves e colchetes
  const expandPattern = (
    pattern: string
  ): string[] | { parents: string[]; childrenPattern: string } => {
    // Verificar primeiro padrões de hierarquia: basePattern*(subPattern)
    const hierarchyMatch = pattern.match(HIERARCHY_PATTERN);

    if (hierarchyMatch) {
      const [, basePattern, subPattern] = hierarchyMatch;

      // Expandir o padrão base para obter todos os pais
      const baseExpanded = expandPattern(basePattern);
      if (Array.isArray(baseExpanded)) {
        return {
          parents: baseExpanded,
          childrenPattern: subPattern,
        };
      }
    }

    const results: string[] = [];

    // Regex para encontrar padrões como 10{2}-[3]
    const complexMatch = pattern.match(COMPLEX_PATTERN_REGEX);

    if (complexMatch) {
      const [, prefix, numRange, middle, letterRange] = complexMatch;
      const numCount = parseInt(numRange);
      const letterCount = parseInt(letterRange);

      for (let i = 1; i <= numCount; i++) {
        const paddedNum = formatNumberWithPadding(i, numCount);
        for (let j = 0; j < letterCount; j++) {
          const letter = String.fromCharCode(65 + j); // A, B, C...
          const result = `${prefix}${paddedNum}${middle}${letter}`;
          results.push(result);
        }
      }
    } else {
      // Verificar padrões mais simples
      // Padrão: prefix[letters] (ex: Zona[3])
      const simpleMatch = pattern.match(SIMPLE_BRACKET_PATTERN);

      if (simpleMatch) {
        const [, prefix, letterRange] = simpleMatch;
        const letterCount = parseInt(letterRange);

        for (let j = 0; j < letterCount; j++) {
          const letter = String.fromCharCode(65 + j); // A, B, C...
          results.push(`${prefix}${letter}`);
        }
      } else {
        // Verificar apenas colchetes no início: [letters] (ex: [3])
        const startMatch = pattern.match(START_BRACKET_PATTERN);

        if (startMatch) {
          const [, letterRange] = startMatch;
          const letterCount = parseInt(letterRange);

          for (let j = 0; j < letterCount; j++) {
            const letter = String.fromCharCode(65 + j); // A, B, C...
            results.push(letter);
          }
        } else {
          // Verificar padrões com chaves: prefix{num}suffix (ex: {3}00, PRT{5}, ABC{2}XYZ)
          const braceMatch = pattern.match(BRACE_PATTERN);

          if (braceMatch) {
            const [, prefix, numRange, suffix] = braceMatch;
            const numCount = parseInt(numRange);

            for (let i = 1; i <= numCount; i++) {
              const paddedNum = formatNumberWithPadding(i, numCount);
              results.push(`${prefix}${paddedNum}${suffix}`);
            }
          } else {
            // Se não há padrões especiais, retorna o padrão original
            results.push(pattern);
          }
        }
      }
    }

    return results;
  };

  // Função para parsear a string hierárquica com expansão
  const parseLocationStringAdvanced = (input: string): LocationNode[] => {
    // Primeiro expandir padrões com chaves e colchetes
    const expandedPatterns: string[] = [];
    const hierarchyPatterns: Array<{
      parents: string[];
      childrenPattern: string;
    }> = [];

    const parts = input.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed) {
        const expanded = expandPattern(trimmed);

        if (typeof expanded === 'object' && 'parents' in expanded) {
          // É um padrão hierárquico
          hierarchyPatterns.push(expanded);
        } else if (Array.isArray(expanded)) {
          // É um array de strings
          expandedPatterns.push(...expanded);
        }
      }
    }

    // Processar padrões hierárquicos
    const result: LocationNode[] = [];

    for (const hierarchy of hierarchyPatterns) {
      for (const parentName of hierarchy.parents) {
        const children: LocationNode[] = [];

        // Processar o childrenPattern
        if (
          hierarchy.childrenPattern.startsWith('+-[') &&
          hierarchy.childrenPattern.endsWith(']')
        ) {
          // Padrão +- [n] significa usar nome do pai + hífen + letras
          const letterCount = parseInt(
            hierarchy.childrenPattern.match(/\[(\d+)\]/)?.[1] || '1'
          );
          for (let i = 0; i < letterCount; i++) {
            const letter = String.fromCharCode(65 + i); // A, B, C...
            children.push({
              name: `${parentName}-${letter}`,
              children: [],
            });
          }
        } else if (
          hierarchy.childrenPattern.startsWith('+[') &&
          hierarchy.childrenPattern.endsWith(']')
        ) {
          // Padrão +[n] significa usar nome do pai + letras (sem hífen)
          const letterCount = parseInt(
            hierarchy.childrenPattern.match(/\[(\d+)\]/)?.[1] || '1'
          );
          for (let i = 0; i < letterCount; i++) {
            const letter = String.fromCharCode(65 + i); // A, B, C...
            children.push({
              name: `${parentName}${letter}`,
              children: [],
            });
          }
        }

        result.push({
          name: parentName,
          children,
        });
      }
    }

    // Adicionar padrões não-hierárquicos
    for (const pattern of expandedPatterns) {
      result.push({
        name: pattern,
        children: [],
      });
    }

    // Agora processar a hierarquia com parênteses (lógica existente) se não há padrões hierárquicos
    if (hierarchyPatterns.length === 0 && expandedPatterns.length > 0) {
      const finalResult: LocationNode[] = [];
      let current = '';
      let depth = 0;
      const stack: LocationNode[][] = [finalResult];

      const fullInput = expandedPatterns.join(', ');

      for (let i = 0; i < fullInput.length; i++) {
        const char = fullInput[i];

        if (char === '(') {
          if (current.trim()) {
            const node: LocationNode = {
              name: current.trim(),
              children: [],
            };
            stack[depth].push(node);
            stack.push(node.children);
            depth++;
            current = '';
          }
        } else if (char === ')') {
          if (current.trim()) {
            const node: LocationNode = {
              name: current.trim(),
              children: [],
            };
            stack[depth].push(node);
          }
          stack.pop();
          depth--;
          current = '';
        } else if (char === ',') {
          if (current.trim()) {
            const node: LocationNode = {
              name: current.trim(),
              children: [],
            };
            stack[depth].push(node);
          }
          current = '';
        } else {
          current += char;
        }
      }

      if (current.trim()) {
        const node: LocationNode = {
          name: current.trim(),
          children: [],
        };
        stack[depth].push(node);
      }

      return finalResult;
    }

    return result;
  };

  // Função para coletar todas as localizações a serem criadas
  const collectLocationsToCreate = (
    nodes: LocationNode[],
    parentId?: string,
    currentType?: LocationType,
    level = 0,
    parentName?: string
  ): LocationCreationData[] => {
    const locationsToCreate: LocationCreationData[] = [];

    for (const node of nodes) {
      // Determinar o tipo correto baseado na hierarquia
      const locationType =
        currentType || getNextTypeInHierarchy(parentLocation?.type);

      const data: LocationCreationData = {
        titulo: node.name,
        type: locationType,
        parentId,
        isActive: true,
        parentName, // Referência ao nome do pai para resolução posterior
      };

      locationsToCreate.push(data);

      // Coletar filhos recursivamente com o tipo correto baseado na hierarquia
      if (node.children.length > 0) {
        // O tipo dos filhos deve ser o próximo na hierarquia baseado no tipo atual
        const childType = getNextTypeInHierarchy(locationType);
        const children = collectLocationsToCreate(
          node.children,
          undefined, // parentId será resolvido depois
          childType,
          level + 1,
          node.name // Passar o nome do pai atual
        );
        locationsToCreate.push(...children);
      }
    }

    return locationsToCreate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação: sempre verificar se há texto na aba avançada (que é sincronizado com a básica)
    if (!names.trim()) return;

    try {
      setIsLoading(true);

      if (isEditing && editLocation) {
        // Edição - só permite um nome
        const data: UpdateLocationRequest = {
          titulo: names.trim(),
          type: editLocation.type as LocationType,
          parentId: editLocation.parentId,
          isActive: editLocation.isActive,
        };

        await updateLocationMutation.mutateAsync({
          id: editLocation.id,
          data,
        });

        toast.success('Localização atualizada com sucesso!');
      } else {
        // Criação - sempre processar o texto da aba avançada
        const parsedLocations = parseLocationStringAdvanced(names);
        const allLocations = collectLocationsToCreate(
          parsedLocations,
          parentLocation?.id,
          undefined, // tipo será determinado automaticamente
          0
        );

        // Separar em níveis hierárquicos para processamento correto
        const rootLocations = allLocations.filter(loc => !loc.parentName);
        const childLocations = allLocations.filter(loc => loc.parentName);

        // Limpar mapa de IDs criados
        createdLocationIdsRef.current.clear();

        // Primeiro criar as localizações raiz
        if (rootLocations.length > 0) {
          await executeBatchOperation(rootLocations, false);
        }

        // Depois criar as localizações filho com parentIds corretos
        if (childLocations.length > 0) {
          await executeBatchOperation(childLocations, true);
        }
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} localização`, {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNames('');
    setBasicName('');
    setAisleConfigs([{ name: '', columns: 1, rows: 1 }]);
    setActiveTab('basic');
    createdLocationIdsRef.current.clear();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/95 dark:bg-gray-900/95">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <DialogTitle>
                {isEditing ? 'Editar Localização' : 'Nova Localização'}
              </DialogTitle>
            </div>
            <DialogDescription>
              {isEditing
                ? 'Atualize o nome da localização.'
                : 'Crie uma nova localização. O código e tipo serão definidos automaticamente.'}
            </DialogDescription>
          </DialogHeader>

          <form id="location-form" onSubmit={handleSubmit}>
            {!isEditing && (
              <Tabs
                value={activeTab}
                onValueChange={value =>
                  setActiveTab(value as 'basic' | 'advanced')
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="advanced">Avançado</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  {(() => {
                    const nextType = getNextTypeInHierarchy(
                      parentLocation?.type
                    );
                    const typeLabels = {
                      WAREHOUSE: 'Armazém',
                      ZONE: 'Zona',
                      AISLE: 'Corredor',
                      SHELF: 'Prateleira',
                      BIN: 'Compartimento',
                      OTHER: 'Outro',
                    };

                    if (nextType === 'AISLE') {
                      return (
                        <div className="space-y-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Configurando <strong>{typeLabels[nextType]}</strong>{' '}
                            - Digite o nome base e defina colunas (números) e
                            linhas (letras A, B, C...).
                          </div>

                          {aisleConfigs.map((config, index) => (
                            <div
                              key={index}
                              className="flex items-end gap-2 p-3 border rounded-lg"
                            >
                              <div className="flex-1">
                                <Label htmlFor={`aisle-name-${index}`}>
                                  Nome Base
                                </Label>
                                <Input
                                  id={`aisle-name-${index}`}
                                  placeholder="Ex: PRT"
                                  value={config.name}
                                  onChange={e =>
                                    updateAisleConfig(
                                      index,
                                      'name',
                                      e.target.value
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <div className="w-20">
                                <Label htmlFor={`aisle-columns-${index}`}>
                                  Colunas
                                </Label>
                                <Input
                                  id={`aisle-columns-${index}`}
                                  type="number"
                                  min="1"
                                  max={MAX_COLUMNS}
                                  value={config.columns}
                                  onChange={e =>
                                    updateAisleConfig(
                                      index,
                                      'columns',
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <div className="w-20">
                                <Label htmlFor={`aisle-rows-${index}`}>
                                  Linhas
                                </Label>
                                <Input
                                  id={`aisle-rows-${index}`}
                                  type="number"
                                  min="1"
                                  max={MAX_ROWS}
                                  value={config.rows}
                                  onChange={e =>
                                    updateAisleConfig(
                                      index,
                                      'rows',
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              {aisleConfigs.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeAisleConfig(index)}
                                  className="mb-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}

                          <Button
                            type="button"
                            variant="outline"
                            onClick={addAisleConfig}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Outro Corredor
                          </Button>

                          {/* Preview */}
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-2">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Preview das localizações que serão criadas:
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 max-h-20 overflow-y-auto">
                              {aisleConfigs
                                .filter(config => config.name.trim())
                                .flatMap(config => generateAisleNames(config))
                                .slice(0, PREVIEW_LIMIT)
                                .join(', ')}
                              {aisleConfigs.flatMap(config =>
                                generateAisleNames(config)
                              ).length > PREVIEW_LIMIT && '...'}
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="space-y-2">
                          <Label htmlFor="basic-name">
                            Nome da {typeLabels[nextType]}{' '}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="basic-name"
                            placeholder={`Ex: ${nextType === 'WAREHOUSE' ? 'Armazém Central' : 'Zona A'}`}
                            value={basicName}
                            onChange={e => setBasicName(e.target.value)}
                            required
                          />
                        </div>
                      );
                    }
                  })()}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="names">
                      Padrão de Criação <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="names"
                      ref={inputRef}
                      placeholder="Ex: {3}00, 10{2}-[3], 20(20A, 20B), 20{2}*(+-[2]), Armazém(Zona A, Zona B)"
                      value={names}
                      onChange={e => setNames(e.target.value)}
                      required
                      className="min-h-20 resize-none"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Use vírgulas para separar, parênteses para hierarquia,
                      chaves {'{n}'} para números sequenciais com padding
                      automático e colchetes [n] para letras (A, B, C...).
                      <br />
                      <strong>Hierarquia automática:</strong>{' '}
                      <code>padrão*(subpadrão)</code> cria sublocalizações para
                      cada localização. Exemplo: <code>20{'{2}'}*(+-[2])</code>{' '}
                      cria 201 (201-A, 201-B) e 202 (202-A, 202-B)
                      <br />
                      Exemplos: <code>{'{3}'}00</code> cria 100, 200, 300;{' '}
                      <code>PRT{'{20}'}</code> cria PRT01, PRT02, ..., PRT20
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {isEditing && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="basic-name">
                    Nome da Localização <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="basic-name"
                    value={basicName}
                    onChange={e => setBasicName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </form>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading || batchCreate.isRunning}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="location-form"
              disabled={
                isEditing
                  ? !basicName.trim() || isLoading || batchCreate.isRunning
                  : activeTab === 'basic'
                    ? (() => {
                        const nextType = getNextTypeInHierarchy(
                          parentLocation?.type
                        );
                        if (nextType === 'AISLE') {
                          return (
                            aisleConfigs.every(config => !config.name.trim()) ||
                            isLoading ||
                            batchCreate.isRunning
                          );
                        } else {
                          return (
                            !basicName.trim() ||
                            isLoading ||
                            batchCreate.isRunning
                          );
                        }
                      })()
                    : !names.trim() || isLoading || batchCreate.isRunning
              }
              className="bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {batchCreate.isRunning
                ? 'Criando...'
                : isLoading
                  ? 'Iniciando...'
                  : isEditing
                    ? 'Salvar'
                    : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de progresso para criação em lote */}
      <BatchProgressDialog
        open={!batchCreate.isIdle}
        status={batchCreate.status}
        total={batchCreate.total}
        processed={batchCreate.processed}
        succeeded={batchCreate.succeeded}
        failed={batchCreate.failed}
        progress={batchCreate.progress}
        operationType="create"
        itemName="localizações"
        onClose={() => {
          batchCreate.reset();
          handleClose();
        }}
        onPause={batchCreate.pause}
        onResume={batchCreate.resume}
        onCancel={batchCreate.cancel}
      />
    </>
  );
}
