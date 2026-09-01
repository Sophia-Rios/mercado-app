export function formatBRL(n: number): string {
  return "R$ " + (Number(n) || 0).toFixed(2).replace(".", ",");
}

export function formatDataBR(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
