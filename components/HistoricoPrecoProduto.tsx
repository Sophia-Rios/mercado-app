"use client";

import { useMemo } from "react";
import { formatBRL, formatDataBR } from "@/lib/format";
import type { Compra } from "@/lib/types";

export default function HistoricoPrecoProduto({
  produtoId,
  compras,
}: {
  produtoId: string;
  compras: Compra[];
}) {
  const porMercado = useMemo(() => {
    const doProduto = compras.filter((c) => c.produto_id === produtoId);
    const map = new Map<string, Compra[]>();
    doProduto.forEach((c) => {
      const nome = c.mercado?.nome ?? "—";
      const arr = map.get(nome) ?? [];
      arr.push(c);
      map.set(nome, arr);
    });
    const linhas = Array.from(map.entries()).map(([mercado, arr]) => {
      const ordenado = [...arr].sort((a, b) => (a.data_compra < b.data_compra ? 1 : -1));
      return { mercado, ultimoPreco: ordenado[0].preco_unitario, ultimaData: ordenado[0].data_compra };
    });
    return linhas.sort((a, b) => a.ultimoPreco - b.ultimoPreco);
  }, [produtoId, compras]);

  if (porMercado.length === 0) return null;
  const maisBarato = porMercado[0].mercado;

  return (
    <div className="border border-border rounded-xl p-3">
      <p className="text-xs text-muted mb-2">Histórico de preço por mercado</p>
      <div className="space-y-1.5">
        {porMercado.map((l) => (
          <div key={l.mercado} className="flex items-center justify-between text-sm">
            <span className={l.mercado === maisBarato ? "font-medium" : "text-muted"}>
              {l.mercado}{" "}
              {l.mercado === maisBarato && porMercado.length > 1 && (
                <span className="text-[10px] text-success bg-success-bg px-1.5 py-0.5 rounded-full ml-1">
                  mais barato
                </span>
              )}
            </span>
            <span className="font-data text-muted">
              {formatBRL(l.ultimoPreco)} · {formatDataBR(l.ultimaData)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
