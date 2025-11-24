'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AttributeConfig } from '@/types/entity-config';
import { Plus, X } from 'lucide-react';
import React, { useState } from 'react';

interface AttributeManagerProps {
  value: Array<{ key: string; value: string }>;
  onChange: (attributes: Array<{ key: string; value: string }>) => void;
  config: AttributeConfig;
  disabled?: boolean;
  error?: string;
}

/**
 * Componente para gerenciar atributos dinâmicos (chave-valor)
 * Permite adicionar, remover e editar atributos
 */
export const AttributeManager: React.FC<AttributeManagerProps> = ({
  value = [],
  onChange,
  config,
  disabled = false,
  error,
}) => {
  const {
    singular,
    plural,
    keyLabel,
    valueLabel,
    keyPlaceholder = 'Digite a chave',
    valuePlaceholder = 'Digite o valor',
    maxAttributes,
    allowDuplicateKeys = false,
  } = config;

  const [localError, setLocalError] = useState<string | null>(null);

  // Adiciona novo atributo vazio
  const handleAdd = () => {
    if (maxAttributes && value.length >= maxAttributes) {
      setLocalError(
        `Máximo de ${maxAttributes} ${plural.toLowerCase()} permitidos`
      );
      return;
    }

    onChange([...value, { key: '', value: '' }]);
    setLocalError(null);
  };

  // Remove atributo por índice
  const handleRemove = (index: number) => {
    const newAttributes = value.filter((_, i) => i !== index);
    onChange(newAttributes);
    setLocalError(null);
  };

  // Atualiza chave de um atributo
  const handleKeyChange = (index: number, newKey: string) => {
    // Verifica duplicatas se não for permitido
    if (!allowDuplicateKeys && newKey) {
      const isDuplicate = value.some(
        (attr, i) =>
          i !== index && attr.key.toLowerCase() === newKey.toLowerCase()
      );

      if (isDuplicate) {
        setLocalError(`Já existe um ${singular.toLowerCase()} com essa chave`);
      } else {
        setLocalError(null);
      }
    }

    const newAttributes = value.map((attr, i) =>
      i === index ? { ...attr, key: newKey } : attr
    );
    onChange(newAttributes);
  };

  // Atualiza valor de um atributo
  const handleValueChange = (index: number, newValue: string) => {
    const newAttributes = value.map((attr, i) =>
      i === index ? { ...attr, value: newValue } : attr
    );
    onChange(newAttributes);
  };

  const canAddMore = !maxAttributes || value.length < maxAttributes;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{plural}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={disabled || !canAddMore}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar {singular}
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
          <p className="text-sm">Nenhum {singular.toLowerCase()} adicionado</p>
          <p className="text-xs mt-1">
            Clique em &quot;Adicionar {singular}&quot; para começar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((attribute, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 border rounded-lg bg-card"
            >
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor={`attr-key-${index}`} className="text-xs">
                    {keyLabel}
                  </Label>
                  <Input
                    id={`attr-key-${index}`}
                    value={attribute.key}
                    onChange={e => handleKeyChange(index, e.target.value)}
                    placeholder={keyPlaceholder}
                    disabled={disabled}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`attr-value-${index}`} className="text-xs">
                    {valueLabel}
                  </Label>
                  <Input
                    id={`attr-value-${index}`}
                    value={attribute.value}
                    onChange={e => handleValueChange(index, e.target.value)}
                    placeholder={valuePlaceholder}
                    disabled={disabled}
                    className="h-9"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="h-9 w-9 p-0 mt-5 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {(error || localError) && (
        <p className="text-sm text-destructive">{error || localError}</p>
      )}

      {maxAttributes && (
        <p className="text-xs text-muted-foreground">
          {value.length} de {maxAttributes} {plural.toLowerCase()} adicionados
        </p>
      )}
    </div>
  );
};
