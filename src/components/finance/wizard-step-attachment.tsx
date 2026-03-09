'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FinanceAttachmentType } from '@/types/finance';
import { ArrowLeft, ArrowRight, FileUp, Trash2, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import type { WizardData, WizardStep } from './payable-wizard-modal';

// ============================================================================
// CONSTANTS
// ============================================================================

const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png,.doc,.docx';

const ATTACHMENT_TYPE_LABELS: Record<FinanceAttachmentType, string> = {
  BOLETO: 'Boleto',
  PAYMENT_RECEIPT: 'Comprovante',
  INVOICE: 'Nota Fiscal',
  CONTRACT: 'Contrato',
  OTHER: 'Outro',
};

// ============================================================================
// PROPS
// ============================================================================

interface WizardStepAttachmentProps {
  wizardData: WizardData;
  updateWizardData: (updates: Partial<WizardData>) => void;
  goToStep: (step: WizardStep) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WizardStepAttachment({
  wizardData,
  updateWizardData,
  goToStep,
}: WizardStepAttachmentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = useCallback(
    (file: File | null) => {
      updateWizardData({ attachmentFile: file });
    },
    [updateWizardData]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) {
      handleFileChange(file);
    }
  };

  const handleRemove = () => {
    handleFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Anexe um documento ao lancamento (opcional).
      </p>

      {/* Attachment Type */}
      <div className="space-y-2">
        <Label>Tipo de Anexo</Label>
        <Select
          value={wizardData.attachmentType}
          onValueChange={(val) =>
            updateWizardData({
              attachmentType: val as FinanceAttachmentType,
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ATTACHMENT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Drop Zone */}
      {!wizardData.attachmentFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">
              Arraste ou clique para enviar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, JPG, PNG, DOC, DOCX
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <FileUp className="h-8 w-8 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {wizardData.attachmentFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(wizardData.attachmentFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="shrink-0"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => goToStep(3)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={() => goToStep(5)}>
          Proximo
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
