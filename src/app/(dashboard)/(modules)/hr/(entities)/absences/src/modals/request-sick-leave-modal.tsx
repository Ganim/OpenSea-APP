'use client';

/**
 * OpenSea OS - Request Sick Leave Modal (HR)
 *
 * Modal para registrar atestado médico.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

  const isValid =
    formEmployeeId && startDate && endDate && cid && reason.length >= 3;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Registrar Atestado Médico</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!employeeId && (
            <div className="space-y-2">
              <Label htmlFor="sick-employee-id">ID do Funcionário</Label>
              <Input
                id="sick-employee-id"
                value={formEmployeeId}
                onChange={e => setFormEmployeeId(e.target.value)}
                placeholder="ID do funcionário"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sick-start-date">Data Início</Label>
              <Input
                id="sick-start-date"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sick-end-date">Data Fim</Label>
              <Input
                id="sick-end-date"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sick-cid">CID (Código)</Label>
            <Input
              id="sick-cid"
              value={cid}
              onChange={e => setCid(e.target.value)}
              placeholder="Ex.: J11, A09, M54"
              required
            />
          </div>

          <div className="space-y-2">
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

          <div className="space-y-2">
            <Label htmlFor="sick-reason">Motivo / Observações</Label>
            <Textarea
              id="sick-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Descreva o motivo do atestado..."
              rows={3}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || requestSickLeave.isPending}
              className="bg-gradient-to-r from-rose-500 to-rose-600 text-white"
            >
              {requestSickLeave.isPending ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RequestSickLeaveModal;
