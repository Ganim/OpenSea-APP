'use client';

import {
  PiFileDocDuotone,
  PiFileImageDuotone,
  PiFileXlsDuotone,
  PiFilePptDuotone,
  PiFilePdfDuotone,
  PiFileZipDuotone,
  PiFileVideoDuotone,
  PiFileAudioDuotone,
  PiFileCodeDuotone,
  PiFileDuotone,
} from 'react-icons/pi';
import type { FileTypeCategory } from '@/types/storage';
import { cn } from '@/lib/utils';

interface FileTypeIconProps {
  fileType: FileTypeCategory;
  className?: string;
  size?: number;
}

const FILE_TYPE_CONFIG: Record<
  FileTypeCategory,
  { icon: React.ElementType; color: string; label: string }
> = {
  document: { icon: PiFileDocDuotone, color: 'text-blue-500', label: 'Documento' },
  image: { icon: PiFileImageDuotone, color: 'text-emerald-500', label: 'Imagem' },
  spreadsheet: {
    icon: PiFileXlsDuotone,
    color: 'text-green-600',
    label: 'Planilha',
  },
  presentation: {
    icon: PiFilePptDuotone,
    color: 'text-orange-500',
    label: 'Apresentação',
  },
  pdf: { icon: PiFilePdfDuotone, color: 'text-red-500', label: 'PDF' },
  archive: {
    icon: PiFileZipDuotone,
    color: 'text-amber-600',
    label: 'Arquivo compactado',
  },
  video: { icon: PiFileVideoDuotone, color: 'text-purple-500', label: 'Vídeo' },
  audio: { icon: PiFileAudioDuotone, color: 'text-pink-500', label: 'Áudio' },
  code: { icon: PiFileCodeDuotone, color: 'text-cyan-500', label: 'Código' },
  other: { icon: PiFileDuotone, color: 'text-gray-500', label: 'Arquivo' },
};

export function FileTypeIcon({
  fileType,
  className,
  size = 20,
}: FileTypeIconProps) {
  const config = FILE_TYPE_CONFIG[fileType] ?? FILE_TYPE_CONFIG.other;
  const Icon = config.icon;

  return (
    <Icon
      className={cn(config.color, className)}
      size={size}
      aria-label={config.label}
    />
  );
}

export function getFileTypeLabel(fileType: FileTypeCategory): string {
  return FILE_TYPE_CONFIG[fileType]?.label ?? 'Arquivo';
}

export function getFileTypeColor(fileType: FileTypeCategory): string {
  return FILE_TYPE_CONFIG[fileType]?.color ?? 'text-gray-500';
}
