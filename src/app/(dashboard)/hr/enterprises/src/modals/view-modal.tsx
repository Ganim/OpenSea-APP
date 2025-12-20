/**
 * Enterprise View Modal
 * Modal para visualização dos dados de uma empresa
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Enterprise } from '@/types/hr';
import { EnterpriseViewer } from '../components/enterprise-viewer';

export interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterprise: Enterprise | null;
}

export function ViewModal({
  isOpen,
  onClose,
  enterprise,
}: ViewModalProps) {
  if (!enterprise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visualizar Empresa</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <EnterpriseViewer
            enterprise={enterprise}
            showHeader={true}
            showEditButton={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
