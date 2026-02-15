'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useVerifyActionPin } from '@/hooks/use-pins';
import { translateError } from '@/lib/error-messages';
import { Loader2, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface VerifyActionPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function VerifyActionPinModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Verificação de Segurança',
  description = 'Digite seu PIN de Ação para autorizar esta operação.',
}: VerifyActionPinModalProps) {
  const [pin, setPin] = useState('');
  const verifyPin = useVerifyActionPin();

  const handleVerify = async (pinValue?: string) => {
    const pinToVerify = pinValue ?? pin;
    try {
      const result = await verifyPin.mutateAsync({ actionPin: pinToVerify });
      if (result.valid) {
        setPin('');
        onSuccess();
        onClose();
      } else {
        toast.error('PIN incorreto. Tente novamente.');
        setPin('');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(translateError(message));
      setPin('');
    }
  };

  const handleClose = () => {
    setPin('');
    onClose();
  };

  const handlePinChange = (value: string) => {
    setPin(value);
    if (value.length === 4) {
      // Auto-submit passing the value directly to avoid stale closure
      setTimeout(() => {
        handleVerify(value);
      }, 100);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-6">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={handlePinChange}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} masked />
              <InputOTPSlot index={1} masked />
              <InputOTPSlot index={2} masked />
              <InputOTPSlot index={3} masked />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={verifyPin.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => handleVerify()}
            disabled={verifyPin.isPending || pin.length !== 4}
            className="gap-2"
          >
            {verifyPin.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Verificar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
