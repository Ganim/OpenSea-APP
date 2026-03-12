/**
 * Amortization calculation functions for SAC and Price systems.
 *
 * SAC (Sistema de Amortização Constante): Fixed principal, decreasing total payment.
 * Price (Tabela Price): Fixed total payment, decreasing principal portion.
 */

export interface AmortizationRow {
  installment: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

/**
 * Calculates SAC amortization table.
 *
 * In SAC, the principal portion is constant across all installments.
 * Interest decreases as the balance decreases, so total payment decreases.
 * Uses last-item remainder pattern to avoid rounding errors.
 *
 * @param principalAmount Total loan principal
 * @param monthlyRate Monthly interest rate as decimal (e.g., 0.01 for 1%)
 * @param totalMonths Number of installments
 */
export function calculateSAC(
  principalAmount: number,
  monthlyRate: number,
  totalMonths: number
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  const fixedPrincipal =
    Math.round((principalAmount / totalMonths) * 100) / 100;
  let balance = principalAmount;

  for (let i = 1; i <= totalMonths; i++) {
    const interest = Math.round(balance * monthlyRate * 100) / 100;

    // Last installment gets the remainder to zero out balance
    const principal =
      i === totalMonths ? Math.round(balance * 100) / 100 : fixedPrincipal;

    const payment = Math.round((principal + interest) * 100) / 100;

    balance = Math.round((balance - principal) * 100) / 100;
    if (balance < 0) balance = 0;

    rows.push({
      installment: i,
      payment,
      interest,
      principal,
      balance,
    });
  }

  return rows;
}

/**
 * Calculates Price (Tabela Price) amortization table.
 *
 * In Price, the total payment is fixed across all installments.
 * Principal portion increases over time as interest decreases.
 * Uses last-item remainder pattern to avoid rounding errors.
 *
 * @param principalAmount Total loan principal
 * @param monthlyRate Monthly interest rate as decimal (e.g., 0.01 for 1%)
 * @param totalMonths Number of installments
 */
export function calculatePrice(
  principalAmount: number,
  monthlyRate: number,
  totalMonths: number
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];

  let fixedPayment: number;

  if (monthlyRate === 0) {
    fixedPayment = Math.round((principalAmount / totalMonths) * 100) / 100;
  } else {
    // PMT formula: P * r / (1 - (1 + r)^-n)
    fixedPayment =
      Math.round(
        ((principalAmount * monthlyRate) /
          (1 - Math.pow(1 + monthlyRate, -totalMonths))) *
          100
      ) / 100;
  }

  let balance = principalAmount;

  for (let i = 1; i <= totalMonths; i++) {
    const interest = Math.round(balance * monthlyRate * 100) / 100;

    // Last installment: pay off remaining balance
    const principal =
      i === totalMonths
        ? Math.round(balance * 100) / 100
        : Math.round((fixedPayment - interest) * 100) / 100;

    const payment =
      i === totalMonths
        ? Math.round((principal + interest) * 100) / 100
        : fixedPayment;

    balance = Math.round((balance - principal) * 100) / 100;
    if (balance < 0) balance = 0;

    rows.push({
      installment: i,
      payment,
      interest,
      principal,
      balance,
    });
  }

  return rows;
}
