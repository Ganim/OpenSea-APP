'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BoardVisibility } from '@/types/tasks';

interface BoardSettingsGeneralProps {
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  visibility: BoardVisibility;
  onVisibilityChange: (value: BoardVisibility) => void;
}

export function BoardSettingsGeneral({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  visibility,
  onVisibilityChange,
}: BoardSettingsGeneralProps) {
  return (
    <>
      {/* Nome */}
      <div className="space-y-1.5">
        <label htmlFor="settings-name" className="text-sm font-medium">
          Nome <span className="text-red-500">*</span>
        </label>
        <Input
          id="settings-name"
          value={name}
          onChange={e => onNameChange(e.target.value)}
        />
      </div>

      {/* Descrição */}
      <div className="space-y-1.5">
        <label
          htmlFor="settings-description"
          className="text-sm font-medium"
        >
          Descrição
        </label>
        <Textarea
          id="settings-description"
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>

      {/* Visibilidade */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Visibilidade</label>
        <Select
          value={visibility}
          onValueChange={v => onVisibilityChange(v as BoardVisibility)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PRIVATE">Privado</SelectItem>
            <SelectItem value="SHARED">Compartilhado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
