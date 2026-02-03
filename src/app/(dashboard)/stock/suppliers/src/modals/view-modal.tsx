import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Supplier } from '@/types/stock';
import {
  Calendar,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  RefreshCcwDot,
  Star,
  Truck,
} from 'lucide-react';

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

export function ViewModal({ isOpen, onClose, supplier }: ViewModalProps) {
  if (!supplier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex-col flex">
                <span className="text-xs text-slate-500/50">Fornecedor</span>
                {supplier.name.length > 32
                  ? `${supplier.name.substring(0, 32)}...`
                  : supplier.name}
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
                <p className="text-base mt-1">{supplier.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CNPJ</p>
                <p className="text-base mt-1 font-mono">
                  {supplier.cnpj || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tax ID</p>
                <p className="text-base mt-1">{supplier.taxId || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-base mt-1">
                  {supplier.isActive ? 'Ativo' : 'Inativo'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avaliacao</p>
                <p className="text-base mt-1 flex items-center gap-1">
                  {supplier.rating ? (
                    <>
                      <Star className="h-4 w-4 text-yellow-500" />
                      {supplier.rating}/5
                    </>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pais</p>
                <p className="text-base mt-1">{supplier.country || '-'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{supplier.email || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{supplier.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>{supplier.website || '-'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Endereco</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  {supplier.addressLine1 && <p>{supplier.addressLine1}</p>}
                  {supplier.addressLine2 && <p>{supplier.addressLine2}</p>}
                  {(supplier.city || supplier.state || supplier.postalCode) && (
                    <p>
                      {[supplier.city, supplier.state, supplier.postalCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {supplier.country && <p>{supplier.country}</p>}
                  {!supplier.addressLine1 && !supplier.city && (
                    <p className="text-muted-foreground">-</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {supplier.notes && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observacoes
              </h3>
              <p className="text-sm text-muted-foreground">{supplier.notes}</p>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Metadados</h3>
            <div className="space-y-3">
              {supplier.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-500">Criado em:</span>
                  <span className="font-medium">
                    {new Date(supplier.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {supplier.updatedAt &&
                supplier.updatedAt !== supplier.createdAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <RefreshCcwDot className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-500">Atualizado em:</span>
                    <span className="font-medium">
                      {new Date(supplier.updatedAt).toLocaleDateString('pt-BR')}
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
