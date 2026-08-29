export function formatMXN(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function serviceFeeFor(subtotal: number): number {
  return Math.min(29, Math.max(5, Math.round(subtotal * 0.05)));
}
