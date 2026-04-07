'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface FormErrorItem {
  field: string;
  fieldLabel: string;
  message: string;
  sectionId?: string;
}

export interface FormErrorSection {
  id: string;
  title: string;
  icon?: LucideIcon;
  errors: FormErrorItem[];
}

interface FormErrorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: FormErrorSection[];
  onGoToField?: (fieldName: string) => void;
}

export function FormErrorReportModal({
  isOpen,
  onClose,
  sections,
  onGoToField,
}: FormErrorReportModalProps) {
  const totalErrors = sections.reduce((acc, s) => acc + s.errors.length, 0);
  const nonEmptySections = sections.filter(s => s.errors.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgb(var(--color-destructive)/0.1)]">
              <AlertCircle className="h-4 w-4 text-[rgb(var(--color-destructive))]" />
            </div>
            {totalErrors} erro{totalErrors > 1 ? 's' : ''} encontrado
            {totalErrors > 1 ? 's' : ''}
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto py-2 space-y-4">
          {nonEmptySections.map(section => {
            const SectionIcon = section.icon;
            return (
              <div key={section.id} className="space-y-2">
                {/* Section header */}
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  {SectionIcon && <SectionIcon className="h-4 w-4" />}
                  <span>{section.title}</span>
                  <span className="ml-auto text-xs bg-[rgb(var(--color-destructive)/0.1)] text-[rgb(var(--color-destructive))] px-1.5 py-0.5 rounded-full">
                    {section.errors.length}
                  </span>
                </div>

                {/* Error list */}
                <div className="space-y-1">
                  {section.errors.map((error, idx) => (
                    <button
                      key={`${error.field}-${idx}`}
                      type="button"
                      onClick={() => {
                        onGoToField?.(error.field);
                        onClose();
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left',
                        'hover:bg-[rgb(var(--color-destructive)/0.05)] transition-colors',
                        'group cursor-pointer'
                      )}
                    >
                      <AlertCircle className="h-3.5 w-3.5 text-[rgb(var(--color-destructive))] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {error.fieldLabel}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {error.message}
                        </p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
