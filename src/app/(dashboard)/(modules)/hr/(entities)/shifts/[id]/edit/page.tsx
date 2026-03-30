'use client';

import { GridError } from '@/components/handlers/grid-error';
import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { VerifyActionPinModal } from '@/components/modals/verify-action-pin-modal';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { usePermissions } from '@/hooks/use-permissions';
import { HR_PERMISSIONS } from '@/app/(dashboard)/(modules)/hr/_shared/constants/hr-permissions';
import { translateError } from '@/lib/error-messages';
import type { ShiftType, UpdateShiftData } from '@/types/hr';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  Info,
  Loader2,
  Moon,
  Save,
  Timer,
  Trash2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { shiftsApi, shiftKeys, SHIFT_TYPE_LABELS } from '../../src';

const SHIFT_TYPE_OPTIONS: { value: ShiftType; label: string }[] = [
  { value: 'FIXED', label: 'Fixo' },
  { value: 'ROTATING', label: 'Rotativo' },
  { value: 'FLEXIBLE', label: 'Flexível' },
  { value: 'ON_CALL', label: 'Sobreaviso' },
];

export default function EditShiftPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const shiftId = params.id as string;

  const { hasPermission } = usePermissions();
  const canDelete = hasPermission(HR_PERMISSIONS.SHIFTS.DELETE);
  const canSave = hasPermission(HR_PERMISSIONS.SHIFTS.UPDATE);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<ShiftType>('FIXED');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakMinutes, setBreakMinutes] = useState('60');
  const [isNightShift, setIsNightShift] = useState(false);
  const [color, setColor] = useState('#6366F1');
  const [isActive, setIsActive] = useState(true);

  const {
    data: shiftData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: shiftKeys.detail(shiftId),
    queryFn: async () => shiftsApi.get(shiftId),
    enabled: !!shiftId,
  });

  const shift = shiftData?.shift;

  // Populate form when data loads
  useEffect(() => {
    if (shift) {
      setName(shift.name);
      setCode(shift.code ?? '');
      setType(shift.type);
      setStartTime(shift.startTime);
      setEndTime(shift.endTime);
      setBreakMinutes(String(shift.breakMinutes));
      setIsNightShift(shift.isNightShift);
      setColor(shift.color ?? '#6366F1');
      setIsActive(shift.isActive);
    }
  }, [shift]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateShiftData) => {
      return shiftsApi.update(shiftId, data);
    },
    onSuccess: () => {
      toast.success('Turno atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: shiftKeys.all });
      router.push(`/hr/shifts/${shiftId}`);
    },
    onError: (err) => {
      toast.error(translateError(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return shiftsApi.delete(shiftId);
    },
    onSuccess: () => {
      toast.success('Turno excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: shiftKeys.all });
      router.push('/hr/shifts');
    },
    onError: (err) => {
      toast.error(translateError(err));
    },
  });

  function handleSave() {
    updateMutation.mutate({
      name,
      code: code || null,
      type,
      startTime,
      endTime,
      breakMinutes: Number(breakMinutes) || 60,
      isNightShift,
      color: color || null,
      isActive,
    });
  }

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Turnos', href: '/hr/shifts' },
              { label: 'Carregando...' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={1} layout="grid" size="lg" />
        </PageBody>
      </PageLayout>
    );
  }

  if (error || !shift) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'RH', href: '/hr' },
              { label: 'Turnos', href: '/hr/shifts' },
              { label: 'Erro' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridError
            type="server"
            title="Turno não encontrado"
            message="Não foi possível carregar o turno para edição."
            action={{ label: 'Tentar Novamente', onClick: () => { refetch(); } }}
          />
        </PageBody>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'RH', href: '/hr' },
            { label: 'Turnos', href: '/hr/shifts' },
            { label: shift.name, href: `/hr/shifts/${shiftId}` },
            { label: 'Editar' },
          ]}
          buttons={[
            ...(canDelete
              ? [
                  {
                    id: 'delete-shift' as const,
                    title: 'Excluir',
                    icon: Trash2,
                    onClick: () => setDeleteModalOpen(true),
                    variant: 'destructive' as const,
                  },
                ]
              : []),
            ...(canSave
              ? [
                  {
                    id: 'save-shift' as const,
                    title: 'Salvar',
                    icon: updateMutation.isPending ? Loader2 : Save,
                    onClick: handleSave,
                    variant: 'default' as const,
                    disabled: updateMutation.isPending || !name || !startTime || !endTime,
                  },
                ]
              : []),
          ]}
        />
      </PageHeader>

      <PageBody>
        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              }}
            >
              {isNightShift ? (
                <Moon className="h-7 w-7 text-white" />
              ) : (
                <Clock className="h-7 w-7 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{name || shift.name}</h1>
              <p className="text-sm text-muted-foreground">
                Criado em{' '}
                {new Date(shift.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>

        {/* Form Card */}
        <Card className="bg-white/5 p-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Informações Gerais</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Turno *</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Turno da Manhã"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-code">Código</Label>
                  <Input
                    id="edit-code"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="Ex: TM01"
                    maxLength={32}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Turno *</Label>
                  <Select
                    value={type}
                    onValueChange={v => setType(v as ShiftType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIFT_TYPE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-color">Cor</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="edit-color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded-md border border-input"
                    />
                    <span className="text-sm text-muted-foreground">
                      {color}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Turnos inativos não aceitam novas atribuições
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Horários</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start">Hora de Início *</Label>
                  <Input
                    id="edit-start"
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-end">Hora de Término *</Label>
                  <Input
                    id="edit-end"
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-break">Intervalo (min)</Label>
                  <Input
                    id="edit-break"
                    type="number"
                    min={0}
                    max={480}
                    value={breakMinutes}
                    onChange={e => setBreakMinutes(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-sm font-medium">Turno noturno</Label>
                  <p className="text-xs text-muted-foreground">
                    Marque se o turno ocorre predominantemente no período
                    noturno (22h às 5h)
                  </p>
                </div>
                <Switch
                  checked={isNightShift}
                  onCheckedChange={setIsNightShift}
                />
              </div>
            </div>
          </div>
        </Card>

        <VerifyActionPinModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={() => deleteMutation.mutate()}
          title="Confirmar Exclusão"
          description="Digite seu PIN de ação para excluir este turno. Esta ação não pode ser desfeita."
        />
      </PageBody>
    </PageLayout>
  );
}
