/**
 * Entity Cards Components
 * Cards genéricos para Grid e List view de todas as entidades
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Box,
  Grid3x3,
  Layers,
  MapPin,
  Package,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

/**
 * Calcula se um item é novo ou foi atualizado nas últimas 24 horas
 */
function getItemBadge(
  createdAt: Date | string,
  updatedAt?: Date | string
): { isNew: boolean; isUpdated: boolean } {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const created =
    typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const updated = updatedAt
    ? typeof updatedAt === 'string'
      ? new Date(updatedAt)
      : updatedAt
    : null;

  const isNew = created > oneDayAgo;
  const isUpdated =
    updated && updated > oneDayAgo && updated > created ? true : false;

  return { isNew, isUpdated };
}

// ==================== TEMPLATE CARDS ====================

export function TemplateGridCard({
  name,
  attributesCount,
  createdAt,
  updatedAt,
  onClick,
  isSelected = false,
}: {
  name: string;
  attributesCount: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const { isNew, isUpdated } = getItemBadge(createdAt, updatedAt);

  return (
    <Card
      onClick={onClick}
      className={`p-6 border-gray-200/50 dark:border-white/10 hover:shadow-lg transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
          : 'bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
            isSelected
              ? 'bg-blue-600'
              : 'bg-linear-to-br from-blue-500 to-purple-600'
          }`}
        >
          <Grid3x3 className="w-6 h-6" />
        </div>
        <div className="flex gap-1">
          {isNew && (
            <Badge
              variant="default"
              className="bg-cyan-400 dark:bg-cyan-500/70 text-white dark:text-white shadow-md shadow-cyan-400/50 dark:shadow-cyan-500/20"
            >
              <Sparkles className="w-3 h-3" />
              {!isUpdated && <span className="ml-1">Novo</span>}
            </Badge>
          )}
          {isUpdated && (
            <Badge
              variant="secondary"
              className="bg-amber-400 dark:bg-amber-500/70 text-white dark:text-white flex items-center gap-1 shadow-md shadow-amber-400/50 dark:shadow-amber-500/20"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atualizado</span>
            </Badge>
          )}
        </div>
      </div>
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 truncate">
        {name}
      </h3>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {attributesCount} atributos
        </Badge>
      </div>
    </Card>
  );
}

export function TemplateListCard({
  name,
  attributesCount,
  createdAt,
  updatedAt,
  onClick,
  isSelected = false,
}: {
  name: string;
  attributesCount: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const createdDate =
    typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const updatedDate = updatedAt
    ? typeof updatedAt === 'string'
      ? new Date(updatedAt)
      : updatedAt
    : undefined;
  const { isNew, isUpdated } = getItemBadge(createdDate, updatedDate);

  return (
    <Card
      onClick={onClick}
      className={`p-4 border-gray-200/50 dark:border-white/10 transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
          : 'bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
              isSelected
                ? 'bg-blue-600'
                : 'bg-linear-to-br from-blue-500 to-purple-600'
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>{attributesCount} atributos</span>
              <span>•</span>
              <span>
                {typeof createdAt === 'string'
                  ? createdAt
                  : createdDate.toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 ml-2">
          {isNew && (
            <Badge
              variant="default"
              className="bg-cyan-400 dark:bg-cyan-500/70 text-white dark:text-white flex items-center shadow-md shadow-cyan-400/50 dark:shadow-cyan-500/20"
            >
              <Sparkles className="w-3 h-3" />
              {!isUpdated && <span className="ml-1">Novo</span>}
            </Badge>
          )}
          {isUpdated && (
            <Badge
              variant="secondary"
              className="bg-amber-400 dark:bg-amber-500/70 text-white dark:text-white flex items-center gap-1 shadow-md shadow-amber-400/50 dark:shadow-amber-500/20"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atualizado</span>
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

// ==================== PRODUCT CARDS ====================

export function ProductGridCard({
  name,
  sku,
  price,
  quantity,
  createdAt,
  updatedAt,
  onClick,
  isSelected = false,
}: {
  name: string;
  sku: string;
  price: number;
  quantity?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const { isNew, isUpdated } = getItemBadge(createdAt, updatedAt);

  return (
    <Card
      onClick={onClick}
      className={`p-6 border-gray-200/50 dark:border-white/10 hover:shadow-lg transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
          : 'bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
            isSelected
              ? 'bg-green-600'
              : 'bg-linear-to-br from-green-500 to-emerald-600'
          }`}
        >
          <Package className="w-6 h-6" />
        </div>
        <div className="flex gap-1">
          {isNew && (
            <Badge
              variant="default"
              className="bg-cyan-400 dark:bg-cyan-500/70 text-white shadow-md"
            >
              <Sparkles className="w-3 h-3" />
              {!isUpdated && <span className="ml-1">Novo</span>}
            </Badge>
          )}
          {isUpdated && (
            <Badge
              variant="secondary"
              className="bg-amber-400 dark:bg-amber-500/70 text-white flex items-center gap-1 shadow-md"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atualizado</span>
            </Badge>
          )}
        </div>
      </div>
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 truncate">
        {name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{sku}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          R$ {price.toFixed(2)}
        </span>
        {quantity !== undefined && (
          <Badge
            variant={quantity > 0 ? 'default' : 'destructive'}
            className="text-xs"
          >
            {quantity} em estoque
          </Badge>
        )}
      </div>
    </Card>
  );
}

export function ProductListCard({
  name,
  sku,
  price,
  quantity,
  createdAt,
  updatedAt,
  onClick,
  isSelected = false,
}: {
  name: string;
  sku: string;
  price: number;
  quantity?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const createdDate =
    typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const { isNew, isUpdated } = getItemBadge(createdAt, updatedAt);

  return (
    <Card
      onClick={onClick}
      className={`p-4 border-gray-200/50 dark:border-white/10 transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
          : 'bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
              isSelected
                ? 'bg-green-600'
                : 'bg-linear-to-br from-green-500 to-emerald-600'
            }`}
          >
            <Package className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>{sku}</span>
              <span>•</span>
              <span>R$ {price.toFixed(2)}</span>
              {quantity !== undefined && (
                <>
                  <span>•</span>
                  <span>{quantity} em estoque</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1 ml-2">
          {isNew && (
            <Badge variant="default" className="bg-cyan-400 text-white">
              <Sparkles className="w-3 h-3" />
              {!isUpdated && <span className="ml-1">Novo</span>}
            </Badge>
          )}
          {isUpdated && (
            <Badge
              variant="secondary"
              className="bg-amber-400 text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atualizado</span>
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

// ==================== VARIANT CARDS ====================

export function VariantGridCard({
  name,
  sku,
  options,
  quantity,
  createdAt,
  updatedAt,
  onClick,
  isSelected = false,
}: {
  name: string;
  sku: string;
  options: string[];
  quantity?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const { isNew, isUpdated } = getItemBadge(createdAt, updatedAt);

  return (
    <Card
      onClick={onClick}
      className={`p-6 border-gray-200/50 dark:border-white/10 hover:shadow-lg transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
          : 'bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
            isSelected
              ? 'bg-purple-600'
              : 'bg-linear-to-br from-purple-500 to-pink-600'
          }`}
        >
          <Layers className="w-6 h-6" />
        </div>
        <div className="flex gap-1">
          {isNew && (
            <Badge variant="default" className="bg-cyan-400 text-white">
              <Sparkles className="w-3 h-3" />
              {!isUpdated && <span className="ml-1">Novo</span>}
            </Badge>
          )}
          {isUpdated && (
            <Badge
              variant="secondary"
              className="bg-amber-400 text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atualizado</span>
            </Badge>
          )}
        </div>
      </div>
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 truncate">
        {name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{sku}</p>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {options.map((option, idx) => (
          <Badge key={idx} variant="outline" className="text-xs">
            {option}
          </Badge>
        ))}
      </div>
      {quantity !== undefined && (
        <Badge
          variant={quantity > 0 ? 'default' : 'destructive'}
          className="text-xs"
        >
          {quantity} disponíveis
        </Badge>
      )}
    </Card>
  );
}

export function VariantListCard({
  name,
  sku,
  options,
  quantity,
  createdAt,
  updatedAt,
  onClick,
  isSelected = false,
}: {
  name: string;
  sku: string;
  options: string[];
  quantity?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const { isNew, isUpdated } = getItemBadge(createdAt, updatedAt);

  return (
    <Card
      onClick={onClick}
      className={`p-4 border-gray-200/50 dark:border-white/10 transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
          : 'bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
              isSelected
                ? 'bg-purple-600'
                : 'bg-linear-to-br from-purple-500 to-pink-600'
            }`}
          >
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
              <span>{sku}</span>
              {options.map((option, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {option}
                </Badge>
              ))}
              {quantity !== undefined && (
                <Badge
                  variant={quantity > 0 ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {quantity}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1 ml-2">
          {isNew && (
            <Badge variant="default" className="bg-cyan-400 text-white">
              <Sparkles className="w-3 h-3" />
              {!isUpdated && <span className="ml-1">Novo</span>}
            </Badge>
          )}
          {isUpdated && (
            <Badge
              variant="secondary"
              className="bg-amber-400 text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atualizado</span>
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

// ==================== ITEM CARDS ====================

export function ItemGridCard({
  serialNumber,
  condition,
  status,
  location,
  createdAt,
  updatedAt,
  onClick,
  isSelected = false,
}: {
  serialNumber: string;
  condition: string;
  status: string;
  location?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const { isNew, isUpdated } = getItemBadge(createdAt, updatedAt);

  const statusColors: Record<string, string> = {
    available: 'bg-green-500',
    reserved: 'bg-yellow-500',
    sold: 'bg-gray-500',
    in_transit: 'bg-blue-500',
    returned: 'bg-red-500',
  };

  return (
    <Card
      onClick={onClick}
      className={`p-6 border-gray-200/50 dark:border-white/10 hover:shadow-lg transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
          : 'bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
            isSelected
              ? 'bg-orange-600'
              : 'bg-linear-to-br from-orange-500 to-red-600'
          }`}
        >
          <Box className="w-6 h-6" />
        </div>
        <div className="flex gap-1">
          {isNew && (
            <Badge variant="default" className="bg-cyan-400 text-white">
              <Sparkles className="w-3 h-3" />
              {!isUpdated && <span className="ml-1">Novo</span>}
            </Badge>
          )}
          {isUpdated && (
            <Badge
              variant="secondary"
              className="bg-amber-400 text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atualizado</span>
            </Badge>
          )}
        </div>
      </div>
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 truncate font-mono">
        {serialNumber}
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {condition}
          </Badge>
          <div
            className={`w-2 h-2 rounded-full ${statusColors[status] || 'bg-gray-500'}`}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {status}
          </span>
        </div>
        {location && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{location}</p>
        )}
      </div>
    </Card>
  );
}

export function ItemListCard({
  serialNumber,
  condition,
  status,
  location,
  quantity,
  createdAt,
  updatedAt,
  onClick,
  isSelected = false,
  badges = [],
}: {
  serialNumber: string;
  condition: string;
  status: string;
  location?: string;
  quantity?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  onClick?: () => void;
  isSelected?: boolean;
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }>;
}) {
  const { isNew, isUpdated } = getItemBadge(createdAt, updatedAt);

  const statusColors: Record<string, string> = {
    available: 'bg-green-500',
    reserved: 'bg-yellow-500',
    sold: 'bg-gray-500',
    in_transit: 'bg-blue-500',
    returned: 'bg-red-500',
  };

  const statusLabels: Record<string, string> = {
    available: 'Disponível',
    reserved: 'Reservado',
    sold: 'Vendido',
    in_transit: 'Em Trânsito',
    returned: 'Devolvido',
  };

  return (
    <Card
      onClick={onClick}
      className={`p-4 border-gray-200/50 dark:border-white/10 transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
          : 'bg-white/80 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
              isSelected
                ? 'bg-orange-600'
                : 'bg-linear-to-br from-orange-500 to-red-600'
            }`}
          >
            <Box className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white font-mono">
                {serialNumber}
              </h3>
              {quantity !== undefined && (
                <Badge
                  variant={quantity > 0 ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  Qtd: {quantity}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Badge variant="outline" className="text-xs">
                {condition}
              </Badge>
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${statusColors[status] || 'bg-gray-500'}`}
                />
                <span className="text-xs">
                  {statusLabels[status] || status}
                </span>
              </div>
              {location && (
                <>
                  <span className="text-xs">•</span>
                  <span className="text-xs">{location}</span>
                </>
              )}
            </div>
            {/* Additional badges */}
            {badges.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {badges.map((badge, idx) => (
                  <Badge
                    key={idx}
                    variant={badge.variant || 'outline'}
                    className="text-xs"
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1 ml-2">
          {isNew && (
            <Badge variant="default" className="bg-cyan-400 text-white">
              <Sparkles className="w-3 h-3" />
              {!isUpdated && <span className="ml-1">Novo</span>}
            </Badge>
          )}
          {isUpdated && (
            <Badge
              variant="secondary"
              className="bg-amber-400 text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atualizado</span>
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

// ==================== MANUFACTURER CARDS ====================

export function ManufacturerGridCard({
  name,
  country,
  email,
  phone,
  website,
  rating,
  isActive,
  isSelected,
  onClick,
}: {
  name: string;
  country: string;
  email?: string;
  phone?: string;
  website?: string;
  rating?: number;
  isActive: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-sm truncate">{name}</h3>
            {!isActive && (
              <Badge variant="secondary" className="text-xs">
                Inativo
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Box className="w-3 h-3" />
              <span>{country}</span>
            </div>
            {email && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>📧</span>
                <span className="truncate">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>📞</span>
                <span>{phone}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>🌐</span>
                <span className="truncate">{website}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-2">
          {rating && (
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">{rating.toFixed(1)}</span>
              <span className="text-xs">⭐</span>
            </div>
          )}
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className="text-xs"
          >
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

export function ManufacturerListCard({
  name,
  country,
  email,
  phone,
  website,
  rating,
  isActive,
  isSelected,
  onClick,
}: {
  name: string;
  country: string;
  email?: string;
  phone?: string;
  website?: string;
  rating?: number;
  isActive: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`p-3 cursor-pointer transition-all hover:shadow-sm ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{name}</h3>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Box className="w-3 h-3" />
                <span>{country}</span>
              </div>
              {email && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>📧</span>
                  <span className="truncate">{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>📞</span>
                  <span>{phone}</span>
                </div>
              )}
              {website && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>��</span>
                  <span className="truncate">{website}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {rating && (
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">{rating.toFixed(1)}</span>
              <span className="text-xs">⭐</span>
            </div>
          )}
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className="text-xs"
          >
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

// ==================== SUPPLIER CARDS ====================

export function SupplierGridCard({
  name,
  country,
  cnpj,
  email,
  phone,
  website,
  rating,
  isActive,
  isSelected,
  onClick,
}: {
  name: string;
  country?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  website?: string;
  rating?: number;
  isActive: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-sm truncate">{name}</h3>
            {!isActive && (
              <Badge variant="secondary" className="text-xs">
                Inativo
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {country && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Box className="w-3 h-3" />
                <span>{country}</span>
              </div>
            )}
            {cnpj && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>🏢</span>
                <span>CNPJ: {cnpj}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>📧</span>
                <span className="truncate">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>📞</span>
                <span>{phone}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>🌐</span>
                <span className="truncate">{website}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-2">
          {rating && (
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">{rating.toFixed(1)}</span>
              <span className="text-xs">⭐</span>
            </div>
          )}
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className="text-xs"
          >
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

export function SupplierListCard({
  name,
  country,
  cnpj,
  email,
  phone,
  website,
  rating,
  isActive,
  isSelected,
  onClick,
}: {
  name: string;
  country?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  website?: string;
  rating?: number;
  isActive: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`p-3 cursor-pointer transition-all hover:shadow-sm ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{name}</h3>
            <div className="flex items-center gap-4 mt-1">
              {country && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Box className="w-3 h-3" />
                  <span>{country}</span>
                </div>
              )}
              {cnpj && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>🏢</span>
                  <span>CNPJ: {cnpj}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>📧</span>
                  <span className="truncate">{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>📞</span>
                  <span>{phone}</span>
                </div>
              )}
              {website && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>🌐</span>
                  <span className="truncate">{website}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {rating && (
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">{rating.toFixed(1)}</span>
              <span className="text-xs">⭐</span>
            </div>
          )}
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className="text-xs"
          >
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

// ==================== LOCATION CARDS ====================

export function LocationGridCard({
  name,
  description,
  address,
  type,
  isActive,
  isSelected,
  onClick,
}: {
  name: string;
  description?: string;
  address?: string;
  type?: string;
  isActive: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-sm truncate">{name}</h3>
            {!isActive && (
              <Badge variant="secondary" className="text-xs">
                Inativo
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {description && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>📝</span>
                <span className="truncate">{description}</span>
              </div>
            )}
            {address && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{address}</span>
              </div>
            )}
            {type && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>🏢</span>
                <span>{type}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-2">
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className="text-xs"
          >
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

export function LocationListCard({
  name,
  description,
  address,
  type,
  isActive,
  isSelected,
  onClick,
}: {
  name: string;
  description?: string;
  address?: string;
  type?: string;
  isActive: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`p-3 cursor-pointer transition-all hover:shadow-sm ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{name}</h3>
            <div className="flex items-center gap-4 mt-1">
              {description && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>📝</span>
                  <span className="truncate">{description}</span>
                </div>
              )}
              {address && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{address}</span>
                </div>
              )}
              {type && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>🏢</span>
                  <span>{type}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className="text-xs"
          >
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

// ==================== TAG CARDS ====================

export function TagGridCard({
  name,
  description,
  color,
  category,
  isActive,
  isSelected,
  onClick,
}: {
  name: string;
  description?: string;
  color?: string;
  category?: string;
  isActive: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: color || '#6b7280' }}
            />
            <h3 className="font-medium text-sm truncate">{name}</h3>
            {!isActive && (
              <Badge variant="secondary" className="text-xs">
                Inativo
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {description && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>📝</span>
                <span className="truncate">{description}</span>
              </div>
            )}
            {category && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>📁</span>
                <span>{category}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-2">
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className="text-xs"
          >
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

export function TagListCard({
  name,
  description,
  color,
  category,
  isActive,
  isSelected,
  onClick,
}: {
  name: string;
  description?: string;
  color?: string;
  category?: string;
  isActive: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`p-3 cursor-pointer transition-all hover:shadow-sm ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm shrink-0"
            style={{ backgroundColor: color || '#6b7280' }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{name}</h3>
            <div className="flex items-center gap-4 mt-1">
              {description && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>📝</span>
                  <span className="truncate">{description}</span>
                </div>
              )}
              {category && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>📁</span>
                  <span>{category}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className="text-xs"
          >
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

// ==================== PURCHASE ORDER CARDS ====================

export function PurchaseOrderGridCard({
  orderNumber,
  supplierName,
  orderDate,
  deliveryDate,
  status,
  total,
  isSelected,
  onClick,
  onStatusUpdate,
}: {
  orderNumber: string;
  supplierName?: string;
  orderDate: string | Date;
  deliveryDate?: string | Date;
  status: string;
  total?: number;
  isSelected?: boolean;
  onClick?: () => void;
  onStatusUpdate?: (status: string) => void;
}) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    approved: 'bg-blue-500',
    in_transit: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    in_transit: 'Em Trânsito',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };

  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-sm truncate">#{orderNumber}</h3>
            <div
              className={`w-2 h-2 rounded-full ${statusColors[status] || 'bg-gray-500'}`}
            />
          </div>
          <div className="space-y-1">
            {supplierName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>🏢</span>
                <span className="truncate">{supplierName}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>📅</span>
              <span>{new Date(orderDate).toLocaleDateString('pt-BR')}</span>
            </div>
            {deliveryDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>🚚</span>
                <span>
                  {new Date(deliveryDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-2">
          {total && (
            <div className="text-sm font-medium">
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          )}
          <Badge variant="outline" className="text-xs">
            {statusLabels[status] || status}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

export function PurchaseOrderListCard({
  orderNumber,
  supplierName,
  orderDate,
  deliveryDate,
  status,
  total,
  isSelected,
  onClick,
  onStatusUpdate,
}: {
  orderNumber: string;
  supplierName?: string;
  orderDate: string | Date;
  deliveryDate?: string | Date;
  status: string;
  total?: number;
  isSelected?: boolean;
  onClick?: () => void;
  onStatusUpdate?: (status: string) => void;
}) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    approved: 'bg-blue-500',
    in_transit: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    in_transit: 'Em Trânsito',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };

  return (
    <Card
      className={`p-3 cursor-pointer transition-all hover:shadow-sm ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">#{orderNumber}</h3>
            <div className="flex items-center gap-4 mt-1">
              {supplierName && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>🏢</span>
                  <span className="truncate">{supplierName}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>📅</span>
                <span>{new Date(orderDate).toLocaleDateString('pt-BR')}</span>
              </div>
              {deliveryDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>🚚</span>
                  <span>
                    {new Date(deliveryDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {total && (
            <div className="text-sm font-medium">
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          )}
          <Badge variant="outline" className="text-xs">
            {statusLabels[status] || status}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
