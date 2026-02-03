'use client';

import { Header } from '@/components/layout/header';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Box, Layers, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ImportOptionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  variant?: 'default' | 'products' | 'variants' | 'items';
}

function ImportOptionCard({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
  variant = 'default',
}: ImportOptionCardProps) {
  const variantStyles = {
    default: {
      card: '',
      icon: 'bg-muted text-muted-foreground',
      button: 'outline' as const,
    },
    products: {
      card: 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50',
      icon: 'bg-purple-500/10 text-purple-500',
      button: 'outline' as const,
    },
    variants: {
      card: 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50',
      icon: 'bg-blue-500/10 text-blue-500',
      button: 'outline' as const,
    },
    items: {
      card: 'border-green-500/30 bg-green-500/5 hover:border-green-500/50',
      icon: 'bg-green-500/10 text-green-500',
      button: 'default' as const,
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:shadow-md cursor-pointer group',
        styles.card
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center mb-2',
            styles.icon
          )}
        >
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant={styles.button}
          className="w-full group-hover:translate-x-1 transition-transform"
        >
          {buttonLabel}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ImportStockHomePage() {
  const router = useRouter();

  return (
    <PageLayout backgroundVariant="none" maxWidth="full">
      <Header
        title="Importar Estoque"
        description="Escolha o tipo de dados que deseja importar"
        buttons={[
          {
            id: 'back',
            title: 'Voltar',
            icon: ArrowLeft,
            variant: 'outline',
            onClick: () => router.push('/stock/products'),
          },
        ]}
      />

      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            O que voce deseja importar?
          </h2>
          <p className="text-muted-foreground mt-2">
            Selecione o tipo de cadastro para iniciar a importacao
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <ImportOptionCard
            icon={<Package className="w-6 h-6" />}
            title="Importar Produtos"
            description="Importe produtos base com informacoes gerais como nome, codigo, template e fabricante"
            buttonLabel="Importar Produtos"
            onClick={() => router.push('/import/stock/products')}
            variant="products"
          />

          <ImportOptionCard
            icon={<Layers className="w-6 h-6" />}
            title="Importar Variantes"
            description="Importe variacoes de produtos como cores, tamanhos e SKUs vinculados aos produtos"
            buttonLabel="Importar Variantes"
            onClick={() => router.push('/import/stock/variants')}
            variant="variants"
          />

          <ImportOptionCard
            icon={<Box className="w-6 h-6" />}
            title="Importar Itens"
            description="Importe itens de estoque com quantidade, lote, validade e localizacao no armazem"
            buttonLabel="Importar Itens"
            onClick={() => router.push('/import/stock/items')}
            variant="items"
          />
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>
            <strong>Ordem recomendada:</strong> Produtos → Variantes → Itens
          </p>
          <p>
            Os itens dependem das variantes, que por sua vez dependem dos
            produtos cadastrados
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
