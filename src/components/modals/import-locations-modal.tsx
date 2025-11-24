/**
 * Import Locations Modal
 * Modal para importação em massa de localizações
 */

'use client';

import { ImportModal } from '@/components/shared/modals/import-modal';
import { MapPin } from 'lucide-react';

interface ImportLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
}

export function ImportLocationsModal({
  isOpen,
  onClose,
  onImport,
}: ImportLocationsModalProps) {
  return (
    <ImportModal
      isOpen={isOpen}
      onClose={onClose}
      onImport={onImport}
      title="Importar Localizações"
      description="Faça upload de um arquivo CSV ou Excel para importar localizações em massa."
      acceptedFormats=".csv,.xlsx,.xls"
      templateUrl="/templates/locations-import-template.xlsx"
      icon={<MapPin className="w-5 h-5 text-blue-500" />}
    />
  );
}
