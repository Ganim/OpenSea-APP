'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, FileSpreadsheet, Table2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type ImportMethod = 'config' | 'csv' | 'spreadsheet';

interface ImportMethodSelectorProps {
  entityLabel: string;
  onSelectMethod: (method: ImportMethod) => void;
  hasConfig?: boolean;
}

interface MethodCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  variant?: 'default' | 'primary';
}

function MethodCard({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
  variant = 'default',
}: MethodCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:shadow-md cursor-pointer group',
        variant === 'primary' && 'border-primary/50 bg-primary/5'
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center mb-2',
            variant === 'primary'
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant={variant === 'primary' ? 'default' : 'outline'}
          className="w-full group-hover:translate-x-1 transition-transform"
        >
          {buttonLabel}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function ImportMethodSelector({
  entityLabel,
  onSelectMethod,
  hasConfig = false,
}: ImportMethodSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Importar {entityLabel}
        </h2>
        <p className="text-muted-foreground mt-2">
          Escolha como você deseja importar os dados
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <MethodCard
          icon={<Settings className="w-6 h-6" />}
          title="Configurar Importação"
          description="Defina quais campos serão importados, sua ordem e valores padrão"
          buttonLabel={hasConfig ? 'Editar Configuração' : 'Criar Configuração'}
          onClick={() => onSelectMethod('config')}
        />

        <MethodCard
          icon={<FileSpreadsheet className="w-6 h-6" />}
          title="Importar de CSV"
          description="Carregue um arquivo CSV ou Excel com os dados para importar"
          buttonLabel="Carregar Arquivo"
          onClick={() => onSelectMethod('csv')}
        />

        <MethodCard
          icon={<Table2 className="w-6 h-6" />}
          title="Planilha Manual"
          description="Preencha uma planilha interativa ou cole dados do Excel"
          buttonLabel="Abrir Planilha"
          onClick={() => onSelectMethod('spreadsheet')}
          variant="primary"
        />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Dica: Você pode copiar dados diretamente do Excel ou Google Sheets e
          colar na planilha interativa
        </p>
      </div>
    </div>
  );
}
