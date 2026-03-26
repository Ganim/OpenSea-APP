'use client';

/**
 * OpenSea OS - Request Sick Leave Modal (HR)
 *
 * Modal para registrar atestado médico.
 * Two-column layout: icon left, content right.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { EmployeeSelector } from '@/components/shared/employee-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { FileHeart, X } from 'lucide-react';
import { useRequestSickLeave } from '../api';

interface RequestSickLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string;
}

export function RequestSickLeaveModal({
  isOpen,
  onClose,
  employeeId,
}: RequestSickLeaveModalProps) {
  const [formEmployeeId, setFormEmployeeId] = useState(employeeId ?? '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cid, setCid] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [reason, setReason] = useState('');

  const requestSickLeave = useRequestSickLeave({
    onSuccess: () => {
      resetForm();
      onClose();
    },
  });

  function resetForm() {
    setFormEmployeeId(employeeId ?? '');
    setStartDate('');
    setEndDate('');
    setCid('');
    setDocumentUrl('');
    setReason('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formEmployeeId || !startDate || !endDate || !cid || !reason) return;

    requestSickLeave.mutate({
      employeeId: formEmployeeId,
      startDate,
      endDate,
      cid,
      documentUrl: documentUrl || undefined,
      reason,
    });
  }

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid =
    formEmployeeId && startDate && endDate && cid && reason.length >= 3;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[800px] max-w-[800px] h-[490px] p-0 gap-0 overflow-hidden flex flex-row"
      >
        <VisuallyHidden>
          <DialogTitle>Registrar Atestado Médico</DialogTitle>
        </VisuallyHidden>

        {/* Left icon column */}
        <div className="w-[200px] shrink-0 bg-slate-50 dark:bg-white/5 flex items-center justify-center border-r border-border/50">
          <FileHeart className="h-16 w-16 text-rose-400" strokeWidth={1.2} />
        </div>

        {/* Right content column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div>
              <h2 className="text-lg font-semibold">
                Registrar Atestado Médico
              </h2>
              <p className="text-sm text-muted-foreground">
                Preencha os dados do atestado médico
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable body */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-4">
              {!employeeId && (
                <div className="space-y-2">
                  <Label>Funcionário *</Label>
                  <EmployeeSelector
                    value={formEmployeeId}
                    onChange={id => setFormEmployeeId(id)}
                    placeholder="Selecionar funcionário..."
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sick-start-date">Data Início *</Label>
                  <Input
                    id="sick-start-date"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sick-end-date">Data Fim *</Label>
                  <Input
                    id="sick-end-date"
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="space-y-2 w-40">
                  <Label htmlFor="sick-cid">CID (Código) *</Label>
                  <Input
                    id="sick-cid"
                    value={cid}
                    onChange={e => setCid(e.target.value)}
                    placeholder="Ex.: J11, A09"
                    required
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="sick-document-url">
                    URL do Documento (opcional)
                  </Label>
                  <Input
                    id="sick-document-url"
                    value={documentUrl}
                    onChange={e => setDocumentUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sick-reason">Motivo / Observações *</Label>
                <Textarea
                  id="sick-reason"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Descreva o motivo do atestado..."
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isValid || requestSickLeave.isPending}
              >
                <FileHeart className="h-4 w-4 mr-2" />
                {requestSickLeave.isPending
                  ? 'Registrando...'
                  : 'Registrar Atestado'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RequestSickLeaveModal;
