'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { t } from '@/lib/i18n';

interface PasswordCriteria {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

function getDefaultCriteria(): PasswordCriteria[] {
  return [
    {
      key: 'minLength',
      label: t('password.minLength'),
      test: p => p.length >= 8,
    },
    {
      key: 'uppercase',
      label: t('password.uppercase'),
      test: p => /[A-Z]/.test(p),
    },
    {
      key: 'lowercase',
      label: t('password.lowercase'),
      test: p => /[a-z]/.test(p),
    },
    { key: 'number', label: t('password.number'), test: p => /[0-9]/.test(p) },
    {
      key: 'special',
      label: t('password.special'),
      test: p => /[^A-Za-z0-9]/.test(p),
    },
  ];
}

interface PasswordStrengthChecklistProps {
  password: string;
  criteria?: PasswordCriteria[];
  className?: string;
}

export function PasswordStrengthChecklist({
  password,
  criteria,
  className,
}: PasswordStrengthChecklistProps) {
  const resolvedCriteria = criteria ?? getDefaultCriteria();
  const results = useMemo(() => {
    return resolvedCriteria.map(c => ({
      ...c,
      passed: password ? c.test(password) : false,
    }));
  }, [password, resolvedCriteria]);

  return (
    <div className={cn('space-y-1.5 pt-2', className)}>
      {results.map(item => (
        <div
          key={item.key}
          className={cn(
            'flex items-center gap-2 text-xs transition-colors duration-200',
            item.passed
              ? 'text-[rgb(var(--color-success))]'
              : 'text-muted-foreground'
          )}
        >
          {item.passed ? (
            <Check className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <X className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Validates if password meets all criteria
 */
export function isPasswordStrong(
  password: string,
  criteria?: PasswordCriteria[]
): boolean {
  if (!criteria) criteria = getDefaultCriteria();
  return criteria.every(c => c.test(password));
}
