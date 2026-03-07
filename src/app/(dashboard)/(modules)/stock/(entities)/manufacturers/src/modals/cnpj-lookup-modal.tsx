/**
 * CNPJ Lookup Modal for Manufacturers
 * Modal para consulta e importação de dados da BrasilAPI
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { brasilApiService } from '@/services/brasilapi.service';
import type { BrasilAPICompanyData } from '@/types/brasilapi';
import { AlertCircle, CheckCircle, Factory, Loader, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type Step = 'cnpj' | 'loading' | 'results' | 'error';

interface CNPJLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: BrasilAPICompanyData) => void;
  onCreateManually: () => void;
}

export function CNPJLookupModal({
  isOpen,
  onClose,
  onImport,
  onCreateManually,
}: CNPJLookupModalProps) {
  const [step, setStep] = useState<Step>('cnpj');
  const [cnpj, setCnpj] = useState('');
  const [companyData, setCompanyData] = useState<BrasilAPICompanyData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCnpj('');
      setCompanyData(null);
      setError(null);
      setStep('cnpj');
    }
  }, [isOpen]);

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 14) {
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value));
  };

  const handleAdvance = async () => {
    const cleanCnpj = cnpj.replace(/\D/g, '');

    // Validação básica
    if (cleanCnpj.length !== 14) {
      setError('CNPJ deve conter exatamente 14 dígitos.');
      setStep('error');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStep('loading');

    try {
      // Consultar BrasilAPI
      const data = await brasilApiService.getCompanyByCnpj(cleanCnpj);
      setCompanyData(data);
      setStep('results');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao buscar dados do fabricante.';
      setError(errorMessage);
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (companyData) {
      onImport(companyData);
      onClose();
    }
  };

  const handleCreateManually = () => {
    onCreateManually();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl [&>button]:hidden">
        {step === 'cnpj' && (
          <>
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="flex items-center gap-3">
                <div className="flex items-center justify-center text-white shrink-0 bg-linear-to-br from-violet-500 to-purple-600 p-2 rounded-lg">
                  <Factory className="h-5 w-5" />
                </div>
                Novo Fabricante
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Para cadastrar um novo fabricante brasileiro, informe o CNPJ.
                  Iremos buscar os dados automaticamente na BrasilAPI.
                </p>

                <Label htmlFor="cnpj" className="block mb-2">
                  CNPJ
                </Label>
                <Input
                  id="cnpj"
                  value={cnpj}
                  onChange={handleCNPJChange}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  autoFocus
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      handleAdvance();
                    }
                  }}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  💡 Dica: Após validar o CNPJ, você poderá importar os dados
                  automaticamente da BrasilAPI ou criar manualmente. Para
                  fabricantes internacionais, clique em &quot;Criar
                  manualmente&quot;.
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-between border-t pt-4">
              <Button variant="outline" onClick={handleCreateManually}>
                Criar manualmente
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleAdvance}
                  disabled={cnpj.replace(/\D/g, '').length !== 14}
                >
                  Buscar CNPJ
                </Button>
              </div>
            </DialogFooter>
          </>
        )}

        {step === 'loading' && (
          <>
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="flex items-center gap-3">
                <Loader className="h-5 w-5 animate-spin text-violet-500" />
                Buscando dados...
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-8">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </>
        )}

        {step === 'results' && companyData && (
          <>
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-violet-500" />
                  Dados encontrados
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-6 max-h-96 overflow-y-auto">
              <Card className="p-4 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
                <p className="text-sm font-medium text-violet-900 dark:text-violet-100 mb-3">
                  ✓ Encontramos os dados deste fabricante na BrasilAPI!
                </p>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Razão Social
                    </p>
                    <p className="font-semibold">{companyData.razao_social}</p>
                  </div>

                  {companyData.nome_fantasia && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Nome Fantasia
                      </p>
                      <p className="font-semibold">
                        {companyData.nome_fantasia}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground">CNPJ</p>
                    <p className="font-mono text-sm">{companyData.cnpj}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">CEP</p>
                      <p className="font-semibold">{companyData.cep}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cidade/UF</p>
                      <p className="font-semibold">
                        {companyData.municipio}/{companyData.uf}
                      </p>
                    </div>
                  </div>

                  {companyData.ddd_telefone_1 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Telefone</p>
                      <p className="font-semibold">
                        {companyData.ddd_telefone_1}
                      </p>
                    </div>
                  )}

                  {companyData.email && (
                    <div>
                      <p className="text-xs text-muted-foreground">E-mail</p>
                      <p className="font-semibold">{companyData.email}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Natureza Jurídica
                    </p>
                    <p className="font-semibold">
                      {companyData.natureza_juridica}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Ao importar, os dados serão preenchidos automaticamente no
                  formulário. Você ainda poderá editar qualquer informação antes
                  de salvar.
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-between border-t pt-4">
              <Button variant="outline" onClick={handleCreateManually}>
                Criar manualmente
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('cnpj')}>
                  Voltar
                </Button>
                <Button onClick={handleImport}>Importar dados</Button>
              </div>
            </DialogFooter>
          </>
        )}

        {step === 'error' && (
          <>
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Erro
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <Card className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  {error}
                </p>
              </Card>

              <div className="text-sm text-muted-foreground">
                Você pode:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Verificar o CNPJ digitado</li>
                  <li>
                    Criar o fabricante manualmente com os dados disponíveis
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-between border-t pt-4">
              <Button variant="outline" onClick={handleCreateManually}>
                Criar manualmente
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('cnpj')}>
                  Tentar novamente
                </Button>
                <Button variant="destructive" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
