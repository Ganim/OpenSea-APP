import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Importação | OpenSea OS',
  description: 'Sistema de importação de dados',
};

export default function ImportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
