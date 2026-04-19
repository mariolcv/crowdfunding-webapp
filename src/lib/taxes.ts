export function calculateInterest(
  amount: number,
  annualRatePercent: number,
  months: number
): { gross: number; withholding: number; net: number } {
  const gross = amount * (annualRatePercent / 100) * (months / 12);
  const withholding = gross * 0.19;
  return { gross, withholding, net: gross - withholding };
}

export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number(amount));
}

export function formatPercent(value: number | string): string {
  return `${Number(value).toFixed(2)}%`;
}
