/**
 * Metadata Section - Display creation and update timestamps
 */

'use client';

import { Card } from '@/components/ui/card';
import { Calendar, RefreshCcwDot } from 'lucide-react';
import { InfoField } from './info-field';

interface MetadataSectionProps {
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  title?: string;
  className?: string;
}

export function MetadataSection({
  createdAt,
  updatedAt,
  title = 'Metadados',
  className = '',
}: MetadataSectionProps) {
  const hasMetadata = createdAt || updatedAt;

  if (!hasMetadata) {
    return null;
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const showUpdatedAt = updatedAt && createdAt !== updatedAt;

  return (
    <Card className={` p-4 sm:p-6 space-y-3 ${className}`}>
      <h3 className="text-lg uppercase font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-6">
        {createdAt && (
          <InfoField
            label="Criada em"
            value={formatDate(createdAt)}
            icon={<Calendar className="h-4 w-4" />}
          />
        )}
        {showUpdatedAt && (
          <InfoField
            label="Atualizada em"
            value={formatDate(updatedAt)}
            icon={<RefreshCcwDot className="h-4 w-4" />}
          />
        )}
      </div>
    </Card>
  );
}
