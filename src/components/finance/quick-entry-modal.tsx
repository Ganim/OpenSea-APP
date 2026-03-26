'use client';

import { translateError } from '@/lib/error-messages';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
  useCostCenters,
  useCreateFinanceEntry,
  useFinanceCategories,
  useFinanceCustomers,
  useFinanceSuppliers,
} from '@/hooks/finance';
import { useSmartDefaults } from '@/hooks/finance/use-smart-defaults';
import { cn } from '@/lib/utils';
import type { CreateFinanceEntryData, FinanceEntryType } from '@/types/finance';
import { addDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CalendarIcon,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { InlineCreateModal } from './inline-create-modal';
import { InlineSupplierForm } from './inline-supplier-form';

// =============================================================================
// TYPES
// =============================================================================

interface QuickEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: FinanceEntryType;
  onCreated?: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function QuickEntryModal({
  open,
  onOpenChange,
  defaultType = 'PAYABLE',
  onCreated,
}: QuickEntryModalProps) {
  // ---------------------------------------------------------------------------
  // Form state
  // ---------------------------------------------------------------------------

  const [type, setType] = useState<FinanceEntryType>(defaultType);
  const [entityId, setEntityId] = useState('');
  const [entityName, setEntityName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(
    format(addDays(new Date(), 30), 'yyyy-MM-dd')
  );

  // Expanded details
  const [expanded, setExpanded] = useState(false);
  const [descriptionOverride, setDescriptionOverride] = useState('');
  const [categoryOverride, setCategoryOverride] = useState('');
  const [costCenterOverride, setCostCenterOverride] = useState('');
  const [bankAccountOverride, setBankAccountOverride] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [continueAfterCreate, setContinueAfterCreate] = useState(false);
  const [justCreated, setJustCreated] = useState(false);
  const [showSupplierCreate, setShowSupplierCreate] = useState(false);

  // ---------------------------------------------------------------------------
  // Smart defaults
  // ---------------------------------------------------------------------------

  const smartDefaults = useSmartDefaults(type, entityName);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const { data: suppliersData } = useFinanceSuppliers();
  const suppliers = suppliersData?.suppliers ?? [];

  const { data: customersData } = useFinanceCustomers();
  const customers = customersData?.customers ?? [];

  const entities = type === 'PAYABLE' ? suppliers : customers;
  const entityLabel = type === 'PAYABLE' ? 'Fornecedor' : 'Cliente';

  // Categories for override
  const categoryType = type === 'PAYABLE' ? 'EXPENSE' : 'REVENUE';
  const { data: categoriesData } = useFinanceCategories({ type: categoryType });
  const { data: bothCategoriesData } = useFinanceCategories({ type: 'BOTH' });
  const categories = useMemo(() => {
    const primary = categoriesData?.categories ?? [];
    const both = bothCategoriesData?.categories ?? [];
    return [...primary, ...both.filter(b => !primary.some(p => p.id === b.id))];
  }, [categoriesData, bothCategoriesData]);

  // Cost centers for override
  const { data: costCentersData } = useCostCenters();
  const costCenters = costCentersData?.costCenters ?? [];

  // Bank accounts for override
  const { data: bankAccountsData } = useBankAccounts();
  const bankAccounts = bankAccountsData?.bankAccounts ?? [];

  // ---------------------------------------------------------------------------
  // Resolved values (user override > smart default)
  // ---------------------------------------------------------------------------

  const resolvedCategoryId = categoryOverride || smartDefaults.categoryId;
  const resolvedCategoryName = categoryOverride
    ? (categories.find(c => c.id === categoryOverride)?.name ?? '')
    : smartDefaults.categoryName;

  const resolvedCostCenterId = costCenterOverride || smartDefaults.costCenterId;
  const resolvedCostCenterName = costCenterOverride
    ? (costCenters.find(c => c.id === costCenterOverride)?.name ?? '')
    : smartDefaults.costCenterName;

  const resolvedBankAccountId =
    bankAccountOverride || smartDefaults.bankAccountId;
  const resolvedBankAccountName = bankAccountOverride
    ? (bankAccounts.find(b => b.id === bankAccountOverride)?.name ?? '')
    : smartDefaults.bankAccountName;

  const resolvedDescription = descriptionOverride || smartDefaults.description;

  // ---------------------------------------------------------------------------
  // Mutation
  // ---------------------------------------------------------------------------

  const createMutation = useCreateFinanceEntry();

  // ---------------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------------

  const resetForm = useCallback(
    (keepType = false) => {
      if (!keepType) setType(defaultType);
      setEntityId('');
      setEntityName('');
      setAmount('');
      setDueDate(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
      setExpanded(false);
      setDescriptionOverride('');
      setCategoryOverride('');
      setCostCenterOverride('');
      setBankAccountOverride('');
      setTags([]);
      setTagInput('');
      setNotes('');
    },
    [defaultType]
  );

  // Reset on open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (open && !prevOpen.current) {
      resetForm();
      setType(defaultType);
    }
    prevOpen.current = open;
  }, [open, defaultType, resetForm]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const isValid =
    parsedAmount > 0 && dueDate !== '' && resolvedCategoryId !== '';

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;

    try {
      const payload: CreateFinanceEntryData = {
        type,
        description:
          resolvedDescription ||
          (type === 'PAYABLE' ? 'Conta a pagar' : 'Conta a receber'),
        categoryId: resolvedCategoryId,
        expectedAmount: parsedAmount,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate,
        costCenterId: resolvedCostCenterId || undefined,
        bankAccountId: resolvedBankAccountId || undefined,
        supplierId: type === 'PAYABLE' && entityId ? entityId : undefined,
        supplierName: type === 'PAYABLE' && entityName ? entityName : undefined,
        customerId: type === 'RECEIVABLE' && entityId ? entityId : undefined,
        customerName:
          type === 'RECEIVABLE' && entityName ? entityName : undefined,
        notes: notes || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      await createMutation.mutateAsync(payload);

      setJustCreated(true);
      setTimeout(() => setJustCreated(false), 1200);

      const typeLabel =
        type === 'PAYABLE' ? 'Conta a pagar' : 'Conta a receber';
      toast.success(`${typeLabel} criada com sucesso!`);

      onCreated?.();

      if (continueAfterCreate) {
        resetForm(true);
      } else {
        setTimeout(() => {
          onOpenChange(false);
        }, 600);
      }
    } catch (err) {
      toast.error(translateError(err));
    }
  }, [
    isValid,
    type,
    resolvedDescription,
    resolvedCategoryId,
    parsedAmount,
    dueDate,
    resolvedCostCenterId,
    resolvedBankAccountId,
    entityId,
    entityName,
    notes,
    tags,
    createMutation,
    onCreated,
    continueAfterCreate,
    resetForm,
    onOpenChange,
  ]);

  // ---------------------------------------------------------------------------
  // Tag helpers
  // ---------------------------------------------------------------------------

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const removeTag = useCallback(
    (tag: string) => setTags(prev => prev.filter(t => t !== tag)),
    []
  );

  // ---------------------------------------------------------------------------
  // Amount formatting
  // ---------------------------------------------------------------------------

  const handleAmountChange = (value: string) => {
    // Allow only digits, comma, and dot
    const cleaned = value.replace(/[^\d.,]/g, '');
    setAmount(cleaned);
  };

  const formattedAmount =
    parsedAmount > 0
      ? new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(parsedAmount)
      : '';

  // ---------------------------------------------------------------------------
  // Date display
  // ---------------------------------------------------------------------------

  const dateValue = dueDate ? parseISO(dueDate) : undefined;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" showCloseButton={true}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10">
                <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <DialogTitle>Lançamento Rápido</DialogTitle>
            </div>
            <DialogDescription>
              Crie um lançamento financeiro em segundos com preenchimento
              inteligente.
            </DialogDescription>
          </DialogHeader>

          {/* Success overlay */}
          {justCreated && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-emerald-500/10">
                  <Check className="h-8 w-8 text-emerald-500" />
                </div>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Lançamento criado!
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* ============================================================= */}
            {/* TYPE TOGGLE                                                    */}
            {/* ============================================================= */}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('PAYABLE');
                  setEntityId('');
                  setEntityName('');
                }}
                className={cn(
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border',
                  type === 'PAYABLE'
                    ? 'bg-rose-50 dark:bg-rose-500/8 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20'
                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted/50'
                )}
              >
                A Pagar
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('RECEIVABLE');
                  setEntityId('');
                  setEntityName('');
                }}
                className={cn(
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border',
                  type === 'RECEIVABLE'
                    ? 'bg-emerald-50 dark:bg-emerald-500/8 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted/50'
                )}
              >
                A Receber
              </button>
            </div>

            {/* ============================================================= */}
            {/* ENTITY (SUPPLIER / CUSTOMER)                                   */}
            {/* ============================================================= */}

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">
                {entityLabel}
              </label>
              <div className="flex items-center gap-1.5">
                <Select
                  value={entityId}
                  onValueChange={val => {
                    const entity = entities.find(
                      (e: { id: string }) => e.id === val
                    );
                    setEntityId(val);
                    setEntityName(entity?.name ?? '');
                  }}
                >
                  <SelectTrigger className="flex-1 h-9">
                    <SelectValue
                      placeholder={`Selecionar ${entityLabel.toLowerCase()}...`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((e: { id: string; name: string }) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => setShowSupplierCreate(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* ============================================================= */}
            {/* AMOUNT                                                         */}
            {/* ============================================================= */}

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">
                Valor (R$) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  value={amount}
                  onChange={e => handleAmountChange(e.target.value)}
                  placeholder="0,00"
                  className="h-10 text-lg font-semibold pl-10"
                  inputMode="decimal"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && isValid) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  R$
                </span>
              </div>
            </div>

            {/* ============================================================= */}
            {/* DUE DATE                                                       */}
            {/* ============================================================= */}

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">
                Vencimento <span className="text-rose-500">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-9',
                      !dateValue && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
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
                      if (date) setDueDate(format(date, 'yyyy-MM-dd'));
                    }}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* ============================================================= */}
            {/* AUTO-FILLED BADGES                                             */}
            {/* ============================================================= */}

            {(resolvedCategoryName ||
              resolvedCostCenterName ||
              resolvedBankAccountName ||
              resolvedDescription) && (
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                  Preenchimento Automático
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {resolvedCategoryName && (
                    <span className="bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs rounded-full px-2.5 py-0.5 font-medium">
                      {resolvedCategoryName}
                    </span>
                  )}
                  {resolvedCostCenterName && (
                    <span className="bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs rounded-full px-2.5 py-0.5 font-medium">
                      {resolvedCostCenterName}
                    </span>
                  )}
                  {resolvedBankAccountName && (
                    <span className="bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs rounded-full px-2.5 py-0.5 font-medium">
                      {resolvedBankAccountName}
                    </span>
                  )}
                  {resolvedDescription && !descriptionOverride && (
                    <span className="bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs rounded-full px-2.5 py-0.5 font-medium truncate max-w-[200px]">
                      {resolvedDescription}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* VALIDATION HINT — missing category                             */}
            {/* ============================================================= */}

            {!resolvedCategoryId && parsedAmount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Selecione um {entityLabel.toLowerCase()} para sugestão
                automática de categoria, ou expanda os detalhes para selecionar
                manualmente.
              </p>
            )}

            {/* ============================================================= */}
            {/* EXPANDABLE DETAILS                                             */}
            {/* ============================================================= */}

            <div>
              <button
                type="button"
                onClick={() => setExpanded(prev => !prev)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                Mais detalhes
              </button>

              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  expanded
                    ? 'max-h-[600px] opacity-100 mt-3'
                    : 'max-h-0 opacity-0'
                )}
              >
                <div className="space-y-3 border-t border-border/40 pt-3">
                  {/* Description override */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Descrição
                    </label>
                    <Input
                      value={descriptionOverride}
                      onChange={e => setDescriptionOverride(e.target.value)}
                      placeholder={
                        smartDefaults.description || 'Descrição do lançamento'
                      }
                      className="h-8 text-sm"
                    />
                  </div>

                  {/* Category override */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Categoria <span className="text-rose-500">*</span>
                    </label>
                    <Select
                      value={categoryOverride || smartDefaults.categoryId}
                      onValueChange={val => setCategoryOverride(val)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Selecionar categoria..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cost Center override */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Centro de Custo
                    </label>
                    <Select
                      value={costCenterOverride || smartDefaults.costCenterId}
                      onValueChange={val => setCostCenterOverride(val)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent>
                        {costCenters.map(cc => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bank Account override */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Conta Bancária
                    </label>
                    <Select
                      value={bankAccountOverride || smartDefaults.bankAccountId}
                      onValueChange={val => setBankAccountOverride(val)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts.map(ba => (
                          <SelectItem key={ba.id} value={ba.id}>
                            {ba.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Tags
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Digitar e pressionar Enter"
                        className="h-8 text-sm"
                      />
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 bg-violet-50 dark:bg-violet-500/8 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded text-[11px] font-medium"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-violet-400 hover:text-violet-600 dark:hover:text-violet-200"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Observações
                    </label>
                    <Textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Opcional"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* FOOTER                                                         */}
          {/* ============================================================= */}

          <DialogFooter className="flex-col gap-3 sm:flex-col">
            {/* Continue checkbox */}
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer self-start">
              <input
                type="checkbox"
                checked={continueAfterCreate}
                onChange={e => setContinueAfterCreate(e.target.checked)}
                className="rounded border-border h-3.5 w-3.5 accent-violet-600"
              />
              Criar e continuar
            </label>

            <div className="flex items-center gap-2 w-full justify-end">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-9 px-2.5"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isValid || createMutation.isPending}
                className="h-9 px-4"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-1.5" />
                    Criar Lançamento
                    {formattedAmount && (
                      <span className="ml-1.5 opacity-70 text-xs">
                        {formattedAmount}
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inline supplier/customer create */}
      <InlineCreateModal
        open={showSupplierCreate}
        onOpenChange={setShowSupplierCreate}
        title={type === 'PAYABLE' ? 'Novo Fornecedor' : 'Novo Cliente'}
      >
        <InlineSupplierForm
          onCreated={entity => {
            setShowSupplierCreate(false);
            setEntityId(entity.id);
            setEntityName(entity.name);
          }}
          onCancel={() => setShowSupplierCreate(false)}
        />
      </InlineCreateModal>
    </>
  );
}
