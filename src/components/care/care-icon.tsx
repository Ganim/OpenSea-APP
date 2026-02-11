import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CareIconProps {
  assetPath: string;
  size?: number;
  className?: string;
  alt?: string;
}

/**
 * Componente para exibir ícones SVG de instruções de cuidado (ISO 3758)
 */
export function CareIcon({
  assetPath,
  size = 48,
  className,
  alt = '',
}: CareIconProps) {
  // URL base dos assets - você pode configurar como variável de ambiente
  const baseUrl = process.env.NEXT_PUBLIC_ASSETS_URL || '/assets';

  return (
    <Image
      src={`${baseUrl}/${assetPath}`}
      alt={alt}
      width={size}
      height={size}
      className={cn('object-contain', className)}
      unoptimized
    />
  );
}
