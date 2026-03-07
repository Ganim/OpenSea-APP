import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Manufacturer } from '@/types/stock';
import {
  Calendar,
  Factory,
  Globe,
  Mail,
  MapPin,
  Phone,
  RefreshCcwDot,
  Star,
} from 'lucide-react';

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  manufacturer: Manufacturer | null;
}

export function ViewModal({ isOpen, onClose, manufacturer }: ViewModalProps) {
  if (!manufacturer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-violet-500 to-purple-600 p-2 rounded-lg">
                <Factory className="h-5 w-5" />
              </div>
              <div className="flex-col flex">
                <span className="text-xs text-slate-500/50">Fabricante</span>
                {manufacturer.name.length > 32
                  ? `${manufacturer.name.substring(0, 32)}...`
                  : manufacturer.name}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Dados Cadastrais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="text-base mt-1">{manufacturer.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">País</p>
                <p className="text-base mt-1">{manufacturer.country}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-base mt-1">
                  {manufacturer.isActive ? 'Ativo' : 'Inativo'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avaliação</p>
                <p className="text-base mt-1 flex items-center gap-1">
                  {manufacturer.rating ? (
                    <>
                      <Star className="h-4 w-4 text-yellow-500" />
                      {manufacturer.rating}/5
                    </>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{manufacturer.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{manufacturer.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>{manufacturer.website || '—'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Endereço</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  {manufacturer.addressLine1 && (
                    <p>{manufacturer.addressLine1}</p>
                  )}
                  {manufacturer.addressLine2 && (
                    <p>{manufacturer.addressLine2}</p>
                  )}
                  {(manufacturer.city ||
                    manufacturer.state ||
                    manufacturer.postalCode) && (
                    <p>
                      {[
                        manufacturer.city,
                        manufacturer.state,
                        manufacturer.postalCode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {!manufacturer.addressLine1 && !manufacturer.city && (
                    <p className="text-muted-foreground">—</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {manufacturer.notes && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Observações</h3>
              <p className="text-sm text-muted-foreground">
                {manufacturer.notes}
              </p>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Metadados</h3>
            <div className="space-y-3">
              {manufacturer.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-500">Criado em:</span>
                  <span className="font-medium">
                    {new Date(manufacturer.createdAt).toLocaleDateString(
                      'pt-BR'
                    )}
                  </span>
                </div>
              )}
              {manufacturer.updatedAt &&
                manufacturer.updatedAt !== manufacturer.createdAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <RefreshCcwDot className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-500">Atualizado em:</span>
                    <span className="font-medium">
                      {new Date(manufacturer.updatedAt).toLocaleDateString(
                        'pt-BR'
                      )}
                    </span>
                  </div>
                )}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
