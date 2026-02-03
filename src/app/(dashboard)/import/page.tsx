'use client';

import { Header } from '@/components/layout/header';
import { PageLayout } from '@/components/layout/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowRight,
  Box,
  FolderTree,
  Layers,
  LayoutTemplate,
  Package,
  Truck,
  Upload,
  Users,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ENTITY_DEFINITIONS } from './_shared/config/entity-definitions';

// Icon mapping
const ICONS: Record<string, React.ElementType> = {
  Package,
  Layers,
  Box,
  Truck,
  FolderTree,
  Users,
  LayoutTemplate,
};

// Color mapping
const COLORS: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  purple:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  orange:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  yellow:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  violet:
    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  none: '',
};

export default function ImportPage() {
  const router = useRouter();

  const entities = Object.values(ENTITY_DEFINITIONS);

  return (
    <PageLayout backgroundVariant="none" maxWidth="full">
      <Header
        title="Importação de Dados"
        description="Importe dados em massa para o sistema"
        buttons={[]}
      />

      {/* Featured: Catalog Import Wizard */}
      <Card
        className="mb-6 border-primary/50 bg-linear-to-r from-primary/5 to-purple-500/5 hover:shadow-lg transition-all cursor-pointer"
        onClick={() => router.push('/import/catalog')}
      >
        <CardContent className="flex items-center gap-6 py-6">
          <div className="w-16 h-16 rounded-xl bg-linear-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg">
            <FileSpreadsheet className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">Importação de Catálogo</h3>
              <Badge className="bg-primary/10 text-primary border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Novo
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Importe produtos e variantes de forma unificada a partir de
              arquivos Excel ou CSV. Sistema inteligente de mapeamento de
              colunas e geração automática de códigos.
            </p>
          </div>
          <Button className="gap-2">
            Iniciar Wizard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {entities.map(entity => {
          const Icon = ICONS[entity.icon] || Package;
          const colorClass = COLORS[entity.color] || COLORS.blue;

          return (
            <Card
              key={entity.entityType}
              className="group hover:shadow-lg transition-all cursor-pointer"
              onClick={() =>
                router.push(entity.basePath || `/import/${entity.entityType}`)
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {entity.fields.filter(f => f.required).length} campos
                    obrigatórios
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">
                  {entity.labelPlural}
                </CardTitle>
                <CardDescription>{entity.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {entity.fields.length} campos disponíveis
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    Importar
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help section */}
      <Card className="mt-6 bg-muted/50">
        <CardContent className="flex items-center gap-4 py-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Como funciona a importação?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              1. Escolha a entidade que deseja importar
              <br />
              2. Configure quais campos serão importados (opcional)
              <br />
              3. Carregue um arquivo CSV ou preencha a planilha interativa
              <br />
              4. Valide os dados e execute a importação
            </p>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
