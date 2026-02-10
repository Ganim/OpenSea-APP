import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useManufacturers } from '@/hooks/stock/use-stock-other';
import { Factory, Loader2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface AssignManufacturerModalProps {
  isOpen: boolean;
  onClose: () => void;
  productIds: string[];
  isSubmitting: boolean;
  onSubmit: (ids: string[], manufacturerId: string) => Promise<void>;
}

export function AssignManufacturerModal({
  isOpen,
  onClose,
  productIds,
  isSubmitting,
  onSubmit,
}: AssignManufacturerModalProps) {
  const [selectedManufacturerId, setSelectedManufacturerId] = useState('');
  const { data: manufacturersData } = useManufacturers();

  const manufacturerOptions = useMemo(() => {
    const manufacturers = manufacturersData?.manufacturers || [];
    return manufacturers
      .filter(m => m.isActive)
      .map(m => ({ value: m.id, label: m.name }));
  }, [manufacturersData]);

  const count = productIds.length;
  const title =
    count > 1
      ? `Atribuir Fabricante (${count} produtos)`
      : 'Atribuir Fabricante';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManufacturerId) return;
    await onSubmit(productIds, selectedManufacturerId);
    setSelectedManufacturerId('');
    onClose();
  };

  const handleClose = () => {
    setSelectedManufacturerId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-3 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-violet-500 to-purple-600 p-2 rounded-lg">
                <Factory className="h-5 w-5" />
              </div>
              {title}
            </div>
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Fabricante</Label>
            <Combobox
              options={manufacturerOptions}
              value={selectedManufacturerId}
              onValueChange={setSelectedManufacturerId}
              placeholder="Selecione um fabricante..."
              searchPlaceholder="Buscar fabricante..."
              emptyText="Nenhum fabricante encontrado."
            />
          </div>

          {count > 1 && (
            <p className="text-sm text-muted-foreground">
              O fabricante selecionado será atribuído a {count} produtos.
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedManufacturerId || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Atribuir'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
