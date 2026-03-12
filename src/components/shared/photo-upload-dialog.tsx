'use client';

import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Upload, RotateCcw, Trash2 } from 'lucide-react';

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, crop: Area) => Promise<void>;
  onRemove?: () => Promise<void>;
  hasPhoto?: boolean;
  title?: string;
  aspectRatio?: number;
}

export function PhotoUploadDialog({
  open,
  onOpenChange,
  onUpload,
  onRemove,
  hasPhoto = false,
  title = 'Enviar Foto',
  aspectRatio = 1,
}: PhotoUploadDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      await onUpload(selectedFile, croppedAreaPixels);
      handleReset();
      onOpenChange(false);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, croppedAreaPixels, onUpload, onOpenChange]);

  const handleRemove = useCallback(async () => {
    if (!onRemove) return;
    setIsRemoving(true);
    try {
      await onRemove();
      handleReset();
      onOpenChange(false);
    } finally {
      setIsRemoving(false);
    }
  }, [onRemove, onOpenChange]);

  const handleReset = useCallback(() => {
    setImageSrc(null);
    setSelectedFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, []);

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        handleReset();
      }
      onOpenChange(isOpen);
    },
    [onOpenChange, handleReset]
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {!imageSrc ? (
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 cursor-pointer hover:border-primary transition-colors">
            <Upload className="h-10 w-10 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Clique ou arraste uma imagem
            </span>
            <span className="text-xs text-gray-400">
              JPEG, PNG, WebP ou GIF (máx. 5MB)
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="flex items-center gap-3 px-2">
              <ZoomOut className="h-4 w-4 text-gray-400 shrink-0" />
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={([val]) => setZoom(val)}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-gray-400 shrink-0" />
            </div>
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <div>
            {onRemove && hasPhoto && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading || isRemoving}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isRemoving ? 'Removendo...' : 'Remover Foto'}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {imageSrc && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isUploading || isRemoving}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Trocar Imagem
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={!imageSrc || isUploading || isRemoving}
            >
              {isUploading ? 'Enviando...' : 'Salvar Foto'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
