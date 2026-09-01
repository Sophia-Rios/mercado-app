"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { formatBRL, formatDataBR } from "@/lib/format";
import type { Compra } from "@/lib/types";

export default function CupomHistorico({ compras }: { compras: Compra[] }) {
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const recibos = useMemo(() => {
    const filtradas = compras.filter((c) => {
      const nome = c.produto?.nome?.toLowerCase() ?? "";
      const bateBusca = busca.trim().length === 0 || nome.includes(busca.toLowerCase());
      const bateInicio = !dataInicio || c.data_compra >= dataInicio;
      const bateFim = !dataFim || c.data_compra <= dataFim;
      return bateBusca && bateInicio && bateFim;
    });
    const porData = new Map<string, Compra[]>();
    filtradas.forEach((c) => {
      const arr = porData.get(c.data_compra) ?? [];
      arr.push(c);
      porData.set(c.data_compra, arr);
    });
    return Array.from(porData.entries())
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([data, itens]) => ({
        data,
        itens: [...itens].sort((a, b) => (a.produto?.nome ?? "").localeCompare(b.produto?.nome ?? "")),
        total: itens.reduce((s, i) => s + Number(i.preco_total), 0),
      }));
  }, [compras, busca, dataInicio, dataFim]);

  const filtrosAtivos = Boolean(dataInicio || dataFim);
  const totalGeral = recibos.reduce((s, r) => s + r.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Histórico de compras</p>
        <span className="text-xs text-muted">
          {recibos.length} {recibos.length === 1 ? "visita" : "visitas"}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto nesse mercado..."
            className="w-full pl-9 pr-3 py-2.5 rounded-full bg-surface border border-border outline-none focus:ring-2 focus:ring-accent text-sm"
          />
        </div>
        <button
          onClick={() => setMostrarFiltros((v) => !v)}
          className={`p-2.5 rounded-full border ${
            filtrosAtivos ? "btn-accent border-transparent" : "border-border text-muted"
          }`}
          aria-label="Filtros"
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {mostrarFiltros && (
        <div className="surface-card p-4 mb-4 grid grid-cols-2 gap-3">
          <label className="text-xs text-muted flex flex-col gap-1">
            De
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="px-3 py-2 rounded-lg bg-bg border border-border text-text text-sm font-data"
            />
          </label>
          <label className="text-xs text-muted flex flex-col gap-1">
            Até
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="px-3 py-2 rounded-lg bg-bg border border-border text-text text-sm font-data"
            />
          </label>
        </div>
      )}

      {recibos.length === 0 ? (
        <p className="text-center text-muted text-sm py-12">Nada encontrado com esses filtros.</p>
      ) : (
        <div className="space-y-3">
          {recibos.map((r) => (
            <div key={r.data} className="surface-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">{formatDataBR(r.data)}</span>
                <span className="text-xs text-muted">
                  {r.itens.length} {r.itens.length === 1 ? "item" : "itens"}
                </span>
              </div>
              <div className="receipt-divider mb-3" />
              <div className="space-y-1.5">
                {r.itens.map((i) => (
                  <div key={i.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted truncate pr-3">
                      {i.quantidade}x {i.produto?.nome}
                    </span>
                    <span className="font-data text-muted flex-shrink-0">{formatBRL(i.preco_total)}</span>
                  </div>
                ))}
              </div>
              <div className="receipt-divider mt-3 mb-3" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-semibold font-data">{formatBRL(r.total)}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between px-2 pt-1 text-xs text-muted">
            <span>Total no período filtrado</span>
            <span className="font-data font-medium">{formatBRL(totalGeral)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
