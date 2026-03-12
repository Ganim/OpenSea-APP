'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  useBankAccounts,
  useFinanceCategories,
  useFinanceCustomers,
} from '@/hooks/finance';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, ArrowRight, CalendarIcon, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { CostCenterAllocationComponent } from './cost-center-allocation';
import { InlineBankAccountForm } from './inline-bank-account-form';
import { InlineCategoryForm } from './inline-category-form';
import { InlineCreateModal } from './inline-create-modal';
import { InlineCustomerForm } from './inline-customer-form';
import type {
  ReceivableWizardData,
  WizardStep,
} from './receivable-wizard-modal';

// ============================================================================
// PROPS
// ============================================================================

interface WizardStepDataReceivableProps {
  wizardData: ReceivableWizardData;
  updateWizardData: (updates: Partial<ReceivableWizardData>) => void;
  goToStep: (step: WizardStep) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WizardStepDataReceivable({
  wizardData,
  updateWizardData,
  goToStep,
}: WizardStepDataReceivableProps) {
  // Inline modal states (managed here to avoid parent re-renders)
  const [showCustomerCreate, setShowCustomerCreate] = useState(false);
  const [showCategoryCreate, setShowCategoryCreate] = useState(false);
  const [showBankAccountCreate, setShowBankAccountCreate] = useState(false);

  // Data fetching
  const { data: customersData } = useFinanceCustomers();
  const customers = customersData?.customers ?? [];

  const { data: categoriesData } = useFinanceCategories({
    type: 'REVENUE',
  });
  const allCategories = categoriesData?.categories ?? [];
  // Include BOTH type too
  const { data: bothCategoriesData } = useFinanceCategories({
    type: 'BOTH',
  });
  const bothCategories = bothCategoriesData?.categories ?? [];
  const categories = [...allCategories, ...bothCategories];

  const { data: bankAccountsData } = useBankAccounts();
  const bankAccounts = bankAccountsData?.bankAccounts ?? [];

  // Validation
  const validate = useCallback((): boolean => {
    if (!wizardData.description.trim()) {
      toast.error('Preencha a descrição.');
      return false;
    }
    if (!wizardData.categoryId) {
      toast.error('Selecione uma categoria.');
      return false;
    }
    if (wizardData.expectedAmount <= 0) {
      toast.error('Informe um valor maior que zero.');
      return false;
    }
    if (!wizardData.dueDate) {
      toast.error('Informe a data de vencimento.');
      return false;
    }
    return true;
  }, [wizardData]);

  const handleNext = () => {
    if (validate()) {
      goToStep(3);
    }
  };

  // --------------------------------------------------------------------------
  // Date picker helper
  // --------------------------------------------------------------------------

  const renderDatePicker = (
    label: string,
    value: string,
    onChange: (date: string) => void,
    required = false
  ) => {
    const dateValue = value ? parseISO(value) : undefined;

    return (
      <div className="space-y-2">
        <Label>
          {label}
          {required && ' *'}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !dateValue && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue
                ? format(dateValue, 'dd/MM/yyyy', { locale: ptBR })
                : 'Selecionar data'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={date => {
                if (date) {
                  onChange(format(date, 'yyyy-MM-dd'));
                }
              }}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="wizard-rcv-description">Descrição *</Label>
        <Input
          id="wizard-rcv-description"
          value={wizardData.description}
          onChange={e => updateWizardData({ description: e.target.value })}
          placeholder="Descrição do lançamento"
          required
        />
      </div>

      {/* Cliente */}
      <div className="space-y-2">
        <Label>Cliente</Label>
        <div className="flex items-center gap-2">
          <Select
            value={wizardData.customerId}
            onValueChange={val => {
              const selected = customers.find(c => c.id === val);
              updateWizardData({
                customerId: val,
                customerName: selected?.name ?? '',
              });
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowCustomerCreate(true)}
            title="Criar novo cliente"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <Label>Categoria *</Label>
        <div className="flex items-center gap-2">
          <Select
            value={wizardData.categoryId}
            onValueChange={val => {
              const selected = categories.find(c => c.id === val);
              updateWizardData({
                categoryId: val,
                categoryName: selected?.name ?? '',
              });
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowCategoryCreate(true)}
            title="Criar nova categoria"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Centro de Custo (single/rateio) */}
      <CostCenterAllocationComponent
        value={wizardData.costCenterAllocations}
        onChange={allocations =>
          updateWizardData({ costCenterAllocations: allocations })
        }
        totalAmount={wizardData.expectedAmount}
        useRateio={wizardData.useRateio}
        onToggleRateio={useRateio => updateWizardData({ useRateio })}
        costCenterId={wizardData.costCenterId}
        costCenterName={wizardData.costCenterName}
        onCostCenterChange={(id, name) =>
          updateWizardData({ costCenterId: id, costCenterName: name })
        }
      />

      {/* Conta Bancária */}
      <div className="space-y-2">
        <Label>Conta Bancária</Label>
        <div className="flex items-center gap-2">
          <Select
            value={wizardData.bankAccountId}
            onValueChange={val => {
              const selected = bankAccounts.find(ba => ba.id === val);
              updateWizardData({
                bankAccountId: val,
                bankAccountName: selected?.name ?? '',
              });
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione uma conta (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.map(ba => (
                <SelectItem key={ba.id} value={ba.id}>
                  {ba.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowBankAccountCreate(true)}
            title="Criar nova conta bancária"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Valor */}
      <div className="space-y-2">
        <Label htmlFor="wizard-rcv-amount">Valor (R$) *</Label>
        <Input
          id="wizard-rcv-amount"
          type="number"
          step="0.01"
          min="0"
          value={wizardData.expectedAmount || ''}
          onChange={e =>
            updateWizardData({
              expectedAmount: parseFloat(e.target.value) || 0,
            })
          }
          placeholder="0,00"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        {renderDatePicker('Data de Emissão', wizardData.issueDate, date =>
          updateWizardData({ issueDate: date })
        )}
        {renderDatePicker(
          'Data de Vencimento',
          wizardData.dueDate,
          date => updateWizardData({ dueDate: date }),
          true
        )}
      </div>

      {renderDatePicker(
        'Data de Competência',
        wizardData.competenceDate,
        date => updateWizardData({ competenceDate: date })
      )}

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="wizard-rcv-notes">Observações</Label>
        <Textarea
          id="wizard-rcv-notes"
          value={wizardData.notes}
          onChange={e => updateWizardData({ notes: e.target.value })}
          placeholder="Observações adicionais (opcional)"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => goToStep(1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleNext}>
          Próximo
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Inline Create Modals */}
      <InlineCreateModal
        open={showCustomerCreate}
        onOpenChange={setShowCustomerCreate}
        title="Novo Cliente"
      >
        <InlineCustomerForm
          onCreated={customer => {
            setShowCustomerCreate(false);
            updateWizardData({
              customerId: customer.id,
              customerName: customer.name,
            });
          }}
          onCancel={() => setShowCustomerCreate(false)}
        />
      </InlineCreateModal>

      <InlineCreateModal
        open={showCategoryCreate}
        onOpenChange={setShowCategoryCreate}
        title="Nova Categoria"
      >
        <InlineCategoryForm
          onCreated={category => {
            setShowCategoryCreate(false);
            updateWizardData({
              categoryId: category.id,
              categoryName: category.name,
            });
          }}
          onCancel={() => setShowCategoryCreate(false)}
        />
      </InlineCreateModal>

      <InlineCreateModal
        open={showBankAccountCreate}
        onOpenChange={setShowBankAccountCreate}
        title="Nova Conta Bancária"
      >
        <InlineBankAccountForm
          onCreated={bankAccount => {
            setShowBankAccountCreate(false);
            updateWizardData({
              bankAccountId: bankAccount.id,
              bankAccountName: bankAccount.name,
            });
          }}
          onCancel={() => setShowBankAccountCreate(false)}
        />
      </InlineCreateModal>
    </div>
  );
}
