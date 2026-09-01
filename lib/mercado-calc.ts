import type { Compra } from "./types";
import { formatDataBR } from "./format";

export type Tendencia = { percentual: number; baseadoEm: number } | null;

// tendência = compara o preço da primeira e da última compra de cada
// produto repetido nesse mercado, e tira a média das variações
export function tendenciaMercado(compras: Compra[], mercadoId: string): Tendencia {
  const doMercado = compras.filter((c) => c.mercado_id === mercadoId);
  const porProduto = new Map<string, Compra[]>();
  doMercado.forEach((c) => {
    // compra órfã (produto excluído) não entra na comparação por produto
    if (!c.produto_id) return;
    const arr = porProduto.get(c.produto_id) ?? [];
    arr.push(c);
    porProduto.set(c.produto_id, arr);
  });
  let soma = 0;
  let n = 0;
  porProduto.forEach((arr) => {
    if (arr.length < 2) return;
    const ordenado = [...arr].sort((a, b) => (a.data_compra < b.data_compra ? -1 : 1));
    const primeiro = ordenado[0];
    const ultimo = ordenado[ordenado.length - 1];
    if (primeiro.preco_unitario > 0) {
      soma += (ultimo.preco_unitario - primeiro.preco_unitario) / primeiro.preco_unitario;
      n++;
    }
  });
  if (n === 0) return null;
  return { percentual: (soma / n) * 100, baseadoEm: n };
}

export type ResumoMercado = {
  mercadoId: string;
  totalGasto: number;
  visitas: number;
  produtosDistintos: number;
  tendencia: Tendencia;
  serieVisitas: { data: string; total: number }[];
  ticketMedio: number;
};

export function resumoMercado(compras: Compra[], mercadoId: string): ResumoMercado {
  const doMercado = compras.filter((c) => c.mercado_id === mercadoId);
  const totalGasto = doMercado.reduce((s, c) => s + Number(c.preco_total), 0);
  const visitas = new Set(doMercado.map((c) => c.data_compra)).size;
  const produtosDistintos = new Set(doMercado.map((c) => c.produto_id)).size;
  const tendencia = tendenciaMercado(compras, mercadoId);

  const porData = new Map<string, number>();
  doMercado.forEach((c) => porData.set(c.data_compra, (porData.get(c.data_compra) ?? 0) + Number(c.preco_total)));
  const serieVisitas = Array.from(porData.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([data, total]) => ({ data: formatDataBR(data), total: Math.round(total * 100) / 100 }));

  return {
    mercadoId,
    totalGasto,
    visitas,
    produtosDistintos,
    tendencia,
    serieVisitas,
    ticketMedio: visitas > 0 ? totalGasto / visitas : 0,
  };
}
