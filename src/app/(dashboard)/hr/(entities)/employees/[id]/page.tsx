/**
 * OpenSea OS - Employee Detail Page
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { GridLoading } from '@/components/handlers/grid-loading';
import { PageActionBar } from '@/components/layout/page-action-bar';
import {
  PageBody,
  PageHeader,
  PageLayout,
} from '@/components/layout/page-layout';
import { InfoField } from '@/components/shared/info-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { listPermissionGroups } from '@/services/rbac/rbac.service';
import { usersService } from '@/services/auth';
import type { Employee } from '@/types/hr';
import type { PermissionGroup } from '@/types/rbac';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePrintQueue } from '@/core/print-queue';
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Edit,
  Eye,
  EyeOff,
  Factory,
  FileText,
  Hash,
  Lock,
  Mail,
  Plus,
  Printer,
  Shield,
  Trash,
  User,
  UserCircle,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  employeesApi,
  formatCPF,
  formatSalary,
  getCompanyTime,
  getContractTypeLabel,
  getStatusLabel,
  getWorkRegimeLabel,
} from '../src';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const employeeId = params.id as string;

  // State for create user modal
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [permissionGroupId, setPermissionGroupId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: employee, isLoading } = useQuery<Employee>({
    queryKey: ['employees', employeeId],
    queryFn: async () => {
      return employeesApi.get(employeeId);
    },
  });

  const { data: userData } = useQuery({
    queryKey: ['users', employee?.userId],
    queryFn: async () => {
      const response = await usersService.getUser(employee!.userId!);
      return response.user;
    },
    enabled: !!employee?.userId,
  });

  const { data: permissionGroupsData } = useQuery<PermissionGroup[]>({
    queryKey: ['permission-groups'],
    queryFn: async () => {
      return await listPermissionGroups({ isActive: true });
    },
    enabled: isCreateUserModalOpen,
  });

  const permissionGroups = permissionGroupsData || [];

  // Print queue
  const { actions: printActions } = usePrintQueue();
  const isInPrintQueue = employee ? printActions.isInQueue(employee.id) : false;

  const handlePrint = () => {
    if (!employee || isInPrintQueue) return;
    printActions.addToQueue({ entityType: 'employee', employee });
  };

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createUserMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      permissionGroupId: string;
    }) => {
      return employeesApi.createUserForEmployee(employeeId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', employeeId] });
      toast.success('Usuário criado e vinculado com sucesso!');
      handleCloseCreateUserModal();
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar usuário', {
        description: error.message || 'Tente novamente mais tarde',
      });
    },
  });

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (userEmail && userEmail.length > 0) {
      if (!validateEmail(userEmail)) {
        setEmailError('Email inválido');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [userEmail]);

  useEffect(() => {
    if (userPassword && userPassword.length > 0 && userPassword.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres');
    } else {
      setPasswordError('');
    }
  }, [userPassword]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleEdit = () => {
    router.push(`/hr/employees/${employeeId}/edit`);
  };

  const handleDelete = () => {
    // TODO: Implement delete
    router.push(`/hr/employees/${employeeId}`);
  };

  const handleViewUser = () => {
    if (employee?.userId) {
      router.push(`/admin/users/${employee.userId}`);
    }
  };

  const handleOpenCreateUserModal = () => {
    setIsCreateUserModalOpen(true);
  };

  const handleCloseCreateUserModal = () => {
    setIsCreateUserModalOpen(false);
    setUserEmail('');
    setUserPassword('');
    setPermissionGroupId('');
    setShowPassword(false);
    setEmailError('');
    setPasswordError('');
  };

  const handleCreateUser = async () => {
    if (
      userEmail &&
      userPassword &&
      permissionGroupId &&
      !emailError &&
      !passwordError
    ) {
      await createUserMutation.mutateAsync({
        email: userEmail,
        password: userPassword,
        permissionGroupId,
      });
    }
  };

  const canSubmitUser =
    userEmail !== '' &&
    !emailError &&
    userPassword !== '' &&
    !passwordError &&
    permissionGroupId !== '';

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getCompanyName = () => {
    return (
      employee?.company?.tradeName ||
      employee?.company?.legalName ||
      employee?.department?.company?.tradeName ||
      employee?.department?.company?.legalName ||
      null
    );
  };

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'secondary';
      case 'ON_LEAVE':
        return 'warning';
      case 'TERMINATED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Recursos Humanos', href: '/hr' },
              { label: 'Funcionários', href: '/hr/employees' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <GridLoading count={3} layout="list" size="md" />
        </PageBody>
      </PageLayout>
    );
  }

  if (!employee) {
    return (
      <PageLayout>
        <PageHeader>
          <PageActionBar
            breadcrumbItems={[
              { label: 'Recursos Humanos', href: '/hr' },
              { label: 'Funcionários', href: '/hr/employees' },
            ]}
          />
        </PageHeader>
        <PageBody>
          <Card className="bg-white/5 p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">
              Funcionário não encontrado
            </h2>
            <Button onClick={() => router.push('/hr/employees')}>
              Voltar para Funcionários
            </Button>
          </Card>
        </PageBody>
      </PageLayout>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <PageLayout>
      <PageHeader>
        <PageActionBar
          breadcrumbItems={[
            { label: 'Recursos Humanos', href: '/hr' },
            { label: 'Funcionários', href: '/hr/employees' },
            { label: employee.fullName },
          ]}
          buttons={[
            {
              id: 'delete',
              title: 'Excluir',
              icon: Trash,
              onClick: handleDelete,
              variant: 'outline',
            },
            {
              id: 'print',
              title: isInPrintQueue ? 'Na fila' : 'Imprimir Etiqueta',
              icon: Printer,
              onClick: handlePrint,
              variant: 'outline',
              disabled: isInPrintQueue,
            },
            {
              id: 'edit',
              title: 'Editar',
              icon: Edit,
              onClick: handleEdit,
            },
          ]}
        />

        {/* Identity Card */}
        <Card className="bg-white/5 p-5">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-linear-to-br from-emerald-500 to-teal-600">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {employee.fullName}
                </h1>
                <Badge variant={getStatusVariant(employee.status)}>
                  {getStatusLabel(employee.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Matrícula: {employee.registrationNumber}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 text-sm">
              {employee.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>
                    {new Date(employee.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {employee.updatedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>
                    {new Date(employee.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* Informações Pessoais */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg uppercase font-semibold mb-4">
            Informações Pessoais
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoField
              label="Nome Completo"
              value={employee.fullName}
              icon={<User className="h-4 w-4" />}
              showCopyButton
              copyTooltip="Copiar nome"
            />
            <InfoField
              label="Matrícula"
              value={employee.registrationNumber}
              icon={<Hash className="h-4 w-4" />}
              showCopyButton
              copyTooltip="Copiar matrícula"
            />
            <InfoField
              label="CPF"
              value={formatCPF(employee.cpf)}
              icon={<CreditCard className="h-4 w-4" />}
              showCopyButton
              copyTooltip="Copiar CPF"
            />
            <InfoField
              label="Status"
              value={getStatusLabel(employee.status)}
              badge={
                <Badge variant={getStatusVariant(employee.status)}>
                  {getStatusLabel(employee.status)}
                </Badge>
              }
            />
          </div>
        </Card>

        {/* Informações Profissionais */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg uppercase font-semibold mb-4">
            Informações Profissionais
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoField
              label="Cargo"
              value={employee.position?.name}
              icon={<Briefcase className="h-4 w-4" />}
            />
            <InfoField
              label="Departamento"
              value={employee.department?.name}
              icon={<Building2 className="h-4 w-4" />}
            />
            <InfoField
              label="Empresa"
              value={getCompanyName()}
              icon={<Factory className="h-4 w-4" />}
            />
            <InfoField
              label="Data de Admissão"
              value={new Date(employee.hireDate).toLocaleDateString('pt-BR')}
              icon={<Calendar className="h-4 w-4" />}
            />
            <InfoField
              label="Tempo de Empresa"
              value={getCompanyTime(employee.hireDate)}
              icon={<Clock className="h-4 w-4" />}
            />
            <InfoField
              label="Salário Base"
              value={formatSalary(employee.baseSalary)}
            />
          </div>
        </Card>

        {/* Informações Contratuais */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg uppercase font-semibold mb-4">
            Informações Contratuais
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoField
              label="Tipo de Contrato"
              value={getContractTypeLabel(employee.contractType)}
              icon={<FileText className="h-4 w-4" />}
            />
            <InfoField
              label="Regime de Trabalho"
              value={getWorkRegimeLabel(employee.workRegime)}
            />
            <InfoField
              label="Horas Semanais"
              value={`${employee.weeklyHours}h`}
              icon={<Clock className="h-4 w-4" />}
            />
            {employee.terminationDate && (
              <InfoField
                label="Data de Desligamento"
                value={new Date(employee.terminationDate).toLocaleDateString(
                  'pt-BR'
                )}
                icon={<Calendar className="h-4 w-4" />}
              />
            )}
          </div>
        </Card>

        {/* Usuário Vinculado */}
        <Card className="p-4 sm:p-6 bg-white/95 dark:bg-white/5 border-gray-200 dark:border-white/10">
          <h3 className="text-lg uppercase font-semibold mb-4">
            Usuário do Sistema
          </h3>
          {employee.userId ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900">
                  <UserCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium">
                    {userData?.profile
                      ? `${userData.profile.name} ${userData.profile.surname}`.trim()
                      : userData?.username || 'Usuário vinculado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {userData?.email ||
                      'Este funcionário possui acesso ao sistema'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewUser}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Visualizar Usuário
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                  <UserCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Nenhum usuário vinculado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Crie um usuário para dar acesso ao sistema
                  </p>
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleOpenCreateUserModal}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar Usuário
              </Button>
            </div>
          )}
        </Card>
      </PageBody>

      {/* Modal para criar usuário */}
      <Dialog
        open={isCreateUserModalOpen}
        onOpenChange={open => !open && handleCloseCreateUserModal()}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600">
                <UserCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="block">Criar Usuário</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {employee.fullName}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userEmail">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className={`pl-10 ${
                    emailError
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                />
              </div>
              {emailError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {emailError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userPassword">
                Senha <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="userPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={userPassword}
                  onChange={e => setUserPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={`pl-10 pr-10 ${
                    passwordError
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {passwordError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {passwordError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="permissionGroup">
                Grupo de Permissão <span className="text-red-500">*</span>
              </Label>
              <Select
                value={permissionGroupId}
                onValueChange={setPermissionGroupId}
              >
                <SelectTrigger id="permissionGroup">
                  <SelectValue placeholder="Selecione um grupo de permissão">
                    {permissionGroupId && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {
                            permissionGroups.find(
                              g => g.id === permissionGroupId
                            )?.name
                          }
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {permissionGroups.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhum grupo de permissão disponível
                    </div>
                  ) : (
                    permissionGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{group.name}</p>
                            {group.description && (
                              <p className="text-xs text-muted-foreground">
                                {group.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {!permissionGroupId && (
                <p className="text-xs text-muted-foreground">
                  Selecione um grupo de permissão para definir o nível de acesso
                  do usuário
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCloseCreateUserModal}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={!canSubmitUser || createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
