'use client';

import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Warehouse,
  MapPin,
  Layers,
  Grid3X3,
  Box,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  BIN_DIRECTION_LABELS,
  SEPARATOR_LABELS,
  BIN_LABELING_LABELS,
} from '../../constants';
import type { ZoneStructureFormData } from '../../types';

interface StepConfirmProps {
  formData: ZoneStructureFormData;
  warehouseCode: string;
  warehouseName: string;
  zoneCode: string;
  zoneName: string;
  totalBins: number;
  firstAddress: string;
  lastAddress: string;
}

export function StepConfirm({
  formData,
  warehouseCode,
  warehouseName,
  zoneCode,
  zoneName,
  totalBins,
  firstAddress,
  lastAddress,
}: StepConfirmProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Confirmar Configuração</h2>
        <p className="text-sm text-muted-foreground">
          Revise as informações antes de criar as localizações
        </p>
      </div>

      {/* Aviso */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>
          Esta ação irá criar{' '}
          <strong>{totalBins.toLocaleString()} nichos</strong> automaticamente.
          Após a criação, você poderá visualizar e gerenciar cada nicho
          individualmente.
        </AlertDescription>
      </Alert>

      {/* Resumo da Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Resumo da Configuração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Localização */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Warehouse className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Armazém</p>
                <p className="font-medium">
                  {warehouseCode} - {warehouseName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Zona</p>
                <p className="font-medium">
                  {zoneCode} - {zoneName}
                </p>
              </div>
            </div>
          </div>

          {/* Estrutura */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Layers className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Corredores</p>
                <p className="text-lg font-bold text-blue-600">
                  {formData.aisles}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <Grid3X3 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Prateleiras/corredor
                </p>
                <p className="text-lg font-bold text-emerald-600">
                  {formData.shelvesPerAisle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <Box className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Nichos/prateleira
                </p>
                <p className="text-lg font-bold text-amber-600">
                  {formData.binsPerShelf}
                </p>
              </div>
            </div>
          </div>

          {/* Configurações do Código */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Padrão de Código</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Separador</span>
                <span className="font-medium">
                  {SEPARATOR_LABELS[formData.separator]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Dígitos do corredor
                </span>
                <span className="font-medium">{formData.aisleDigits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Dígitos da prateleira
                </span>
                <span className="font-medium">{formData.shelfDigits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Identificação do nicho
                </span>
                <span className="font-medium">
                  {BIN_LABELING_LABELS[formData.binLabeling]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Direção dos nichos
                </span>
                <span className="font-medium">
                  {BIN_DIRECTION_LABELS[formData.binDirection]}
                </span>
              </div>
            </div>
          </div>

          {/* Endereços */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Intervalo de Endereços</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <p className="text-xs text-muted-foreground mb-1">Primeiro</p>
                <p className="font-mono font-bold text-green-700 dark:text-green-400">
                  {firstAddress}
                </p>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex-1 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
                <p className="text-xs text-muted-foreground mb-1">Último</p>
                <p className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  {lastAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
              <span className="text-lg font-medium">
                Total de nichos a criar
              </span>
              <span className="text-3xl font-bold text-primary">
                {totalBins.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* O que acontece depois */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Após a confirmação</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>
                Todos os {totalBins.toLocaleString()} nichos serão criados
                automaticamente
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Você será redirecionado para o mapa 2D da zona</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Poderá imprimir etiquetas para cada nicho</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Poderá associar itens a cada localização</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
