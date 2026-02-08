/**
 * Add Employee to Queue Button
 * Botão para adicionar um funcionário à fila de impressão de etiquetas
 */

'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Employee } from '@/types/hr';
import { Check, Printer } from 'lucide-react';
import { usePrintQueue } from '../context/print-queue-context';

interface AddEmployeeToQueueButtonProps {
  employee: Employee;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function AddEmployeeToQueueButton({
  employee,
  className,
  variant = 'outline',
  size = 'sm',
  showLabel = false,
}: AddEmployeeToQueueButtonProps) {
  const { actions } = usePrintQueue();
  const alreadyInQueue = actions.isInQueue(employee.id);

  const handleClick = () => {
    if (alreadyInQueue) return;
    actions.addToQueue({
      entityType: 'employee',
      employee,
    });
  };

  if (size === 'icon') {
    return (
      <Button
        variant={variant}
        size="icon"
        className={cn(
          alreadyInQueue && 'text-green-600 border-green-300',
          className
        )}
        onClick={handleClick}
        disabled={alreadyInQueue}
        title={alreadyInQueue ? 'Já na fila de impressão' : 'Adicionar à fila de impressão'}
      >
        {alreadyInQueue ? (
          <Check className="w-4 h-4" />
        ) : (
          <Printer className="w-4 h-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        alreadyInQueue && 'text-green-600 border-green-300',
        className
      )}
      onClick={handleClick}
      disabled={alreadyInQueue}
    >
      {alreadyInQueue ? (
        <Check className="w-4 h-4 mr-2" />
      ) : (
        <Printer className="w-4 h-4 mr-2" />
      )}
      {showLabel && (alreadyInQueue ? 'Na fila' : 'Imprimir etiqueta')}
    </Button>
  );
}
