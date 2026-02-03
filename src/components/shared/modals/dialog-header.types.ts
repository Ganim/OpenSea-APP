import type { LucideIcon } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

export type DialogHeaderAlign = 'left' | 'center' | 'between';
export type DialogHeaderVariant = 'default' | 'subtle' | 'solid';

export type DialogHeaderActionSize = 'sm' | 'default' | 'icon';
export type DialogHeaderActionVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost';

export interface DialogHeaderAction {
  id?: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void | Promise<void>;
  tooltip?: string;
  variant?: DialogHeaderActionVariant;
  size?: DialogHeaderActionSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface DialogHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon | ComponentType | ReactNode;
  iconBgClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  align?: DialogHeaderAlign;
  variant?: DialogHeaderVariant;
  actions?: DialogHeaderAction[];
  onClose?: () => void;
  closeTooltip?: string;
  className?: string;
  contentClassName?: string;
}
