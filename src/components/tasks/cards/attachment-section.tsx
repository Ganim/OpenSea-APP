'use client';

import { useRef, useState, useMemo, useCallback } from 'react';
import {
  Plus,
  X,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Eye,
  Download,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { StorageFilePicker } from './storage-file-picker';
import { FilePreviewModal } from '@/components/storage/file-preview-modal';
import { usePermissions } from '@/hooks/use-permissions';
import { TOOLS_PERMISSIONS } from '@/config/rbac/permission-codes';
import { storageFilesService } from '@/services/storage/files.service';
import { toast } from 'sonner';
import type { CardAttachment } from '@/types/tasks';
import type { StorageFile } from '@/types/storage';

interface AttachmentSectionProps {
  attachments: CardAttachment[];
  onUpload: (file: File) => void;
  onRemove: (attachmentId: string) => void;
  onLinkStorageFile?: (file: {
    id: string;
    name: string;
    size: number;
    mimeType: string;
  }) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv'))
    return FileSpreadsheet;
  if (mimeType.includes('pdf') || mimeType.includes('document'))
    return FileText;
  return File;
}

function resolveFileType(mimeType: string): StorageFile['fileType'] {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('csv') ||
    mimeType.includes('excel')
  )
    return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
    return 'presentation';
  if (
    mimeType.includes('document') ||
    mimeType.includes('msword') ||
    mimeType.includes('wordprocessing')
  )
    return 'document';
  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('tar') ||
    mimeType.includes('gzip')
  )
    return 'archive';
  return 'other';
}

/** Resolve mimeType from either flat or nested fields */
function resolveMimeType(attachment: CardAttachment): string {
  return (
    attachment.fileMimeType ??
    attachment.file?.mimeType ??
    'application/octet-stream'
  );
}

/** Resolve file size from either flat or nested fields */
function resolveFileSize(attachment: CardAttachment): number {
  return attachment.fileSizeBytes ?? attachment.file?.size ?? 0;
}

/** Map CardAttachment to a minimal StorageFile for the preview modal */
function toStorageFile(attachment: CardAttachment): StorageFile {
  const file = attachment.file;
  const mimeType = resolveMimeType(attachment);
  return {
    id: attachment.fileId,
    tenantId: '',
    folderId: null,
    name: attachment.fileName ?? file?.originalName ?? 'Arquivo',
    originalName: file?.originalName ?? attachment.fileName ?? 'Arquivo',
    fileKey: '',
    path: file?.path ?? '',
    size: resolveFileSize(attachment),
    mimeType,
    fileType: resolveFileType(mimeType),
    thumbnailKey: null,
    status: 'active' as StorageFile['status'],
    currentVersion: 1,
    entityType: 'task-attachment',
    entityId: attachment.cardId,
    expiresAt: null,
    uploadedBy: attachment.addedBy,
    isEncrypted: false,
    isProtected: false,
    isHidden: false,
    createdAt: attachment.createdAt,
  };
}

export function AttachmentSection({
  attachments,
  onUpload,
  onRemove,
  onLinkStorageFile,
}: AttachmentSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { hasPermission } = usePermissions();
  const canDownload = hasPermission(TOOLS_PERMISSIONS.STORAGE.FILES.ACCESS);

  const previewFiles = useMemo(
    () => attachments.map(toStorageFile),
    [attachments]
  );

  const handlePreview = useCallback((attachment: CardAttachment) => {
    setPreviewFile(toStorageFile(attachment));
    setShowPreview(true);
  }, []);

  const handleDownload = useCallback((attachment: CardAttachment) => {
    try {
      const url = storageFilesService.getServeUrl(attachment.fileId, {
        download: true,
      });
      window.open(url, '_blank');
    } catch {
      toast.error('Erro ao baixar o arquivo');
    }
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      onUpload(files[i]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setAddOpen(false);
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
    setAddOpen(false);
  }

  function handleStorageClick() {
    setPickerOpen(true);
    setAddOpen(false);
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">
          Anexos
        </p>
        <Popover open={addOpen} onOpenChange={setAddOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="h-3 w-3" />
              Adicionar
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1 z-[60]" align="end">
            <button
              type="button"
              className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted transition-colors"
              onClick={handleUploadClick}
            >
              Upload de arquivo
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted transition-colors"
              onClick={handleStorageClick}
            >
              Buscar no Storage
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Files grid */}
      {attachments.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {attachments.map(attachment => {
            const mimeType = resolveMimeType(attachment);
            const IconComp = getFileIcon(mimeType);
            const fileName =
              attachment.fileName ?? attachment.file?.originalName ?? 'Arquivo';
            const fileSize = resolveFileSize(attachment) || undefined;

            return (
              <div
                key={attachment.id}
                className={cn(
                  'rounded-md border border-border/40 bg-muted/30 overflow-hidden',
                  'group relative'
                )}
              >
                {/* File info + actions */}
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <IconComp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs truncate" title={fileName}>
                      {fileName}
                    </p>
                    {fileSize != null && (
                      <p className="text-[10px] text-muted-foreground">
                        {formatFileSize(fileSize)}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      title="Visualizar"
                      className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      onClick={() => handlePreview(attachment)}
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    {canDownload && (
                      <button
                        type="button"
                        title="Baixar"
                        className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                        onClick={() => handleDownload(attachment)}
                      >
                        <Download className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Remover"
                      className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      onClick={() => onRemove(attachment.id)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground">Nenhum anexo</p>
      )}

      {/* Storage file picker modal */}
      {onLinkStorageFile && (
        <StorageFilePicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelect={onLinkStorageFile}
        />
      )}

      {/* File preview modal — protected viewer */}
      <FilePreviewModal
        file={previewFile}
        files={previewFiles}
        open={showPreview}
        onOpenChange={setShowPreview}
        onNavigate={file => setPreviewFile(file)}
        canDownload={canDownload}
      />
    </div>
  );
}
