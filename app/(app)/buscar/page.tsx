"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useRealtimeCollection } from "@/lib/useRealtimeCollection";
import { formatBRL, formatDataBR } from "@/lib/format";
import { Search, TrendingDown, SlidersHorizontal } from "lucide-react";
import type { Compra } from "@/lib/types";

// useSearchParams() só funciona em cliente e precisa de um limite de
// Suspense, senão o Next tenta pré-renderizar a página inteira no build e
// quebra ("useSearchParams() should be wrapped in a suspense boundary")
export default function Buscar() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-5 pt-8 md:pt-12 pb-8 text-muted text-sm">Carregando...</div>}>
      <BuscarConteudo />
    </Suspense>
  );
}

function BuscarConteudo() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const [busca, setBusca] = useState(searchParams.get("q") ?? "");
  const [mercadoFiltro, setMercadoFiltro] = useState<string>("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const { data: linhas, loading, erro } = useRealtimeCollection<Compra>(supabase, "compras", {
    select: "id, quantidade, preco_unitario, data_compra, produto:produtos(nome, marca, categoria), mercado:mercados(nome)",
    orderBy: { column: "data_compra", ascending: false },
  });

  const mercados = useMemo(
    () => Array.from(new Set(linhas.map((l) => l.mercado?.nome).filter((n): n is string => Boolean(n)))),
    [linhas]
  );

  const filtradas = useMemo(() => {
    return linhas.filter((l) => {
      const nome = l.produto?.nome?.toLowerCase() ?? "";
      const marca = l.produto?.marca?.toLowerCase() ?? "";
      const bateBusca =
        busca.trim().length === 0 || nome.includes(busca.toLowerCase()) || marca.includes(busca.toLowerCase());
      const bateMercado = mercadoFiltro === "todos" || l.mercado?.nome === mercadoFiltro;
      const bateInicio = !dataInicio || l.data_compra >= dataInicio;
      const bateFim = !dataFim || l.data_compra <= dataFim;
      return bateBusca && bateMercado && bateInicio && bateFim;
    });
  }, [linhas, busca, mercadoFiltro, dataInicio, dataFim]);

  // resumo por produto: último preço + mercado mais barato, dentro do filtro atual
  const resumos = useMemo(() => {
    const porProduto = new Map<string, Compra[]>();
    filtradas.forEach((l) => {
      const nome = l.produto?.nome ?? "Produto";
      const lista = porProduto.get(nome) ?? [];
      lista.push(l);
      porProduto.set(nome, lista);
    });
    return Array.from(porProduto.entries())
      .map(([nome, lista]) => {
        const porData = [...lista].sort((a, b) => (a.data_compra < b.data_compra ? 1 : -1));
        const maisBarato = [...lista].sort((a, b) => a.preco_unitario - b.preco_unitario)[0];
        return {
          nome,
          marca: porData[0].produto?.marca,
          ultimoPreco: porData[0].preco_unitario,
          ultimoMercado: porData[0].mercado?.nome ?? "—",
          ultimaData: porData[0].data_compra,
          mercadoMaisBarato: maisBarato.mercado?.nome ?? "—",
          precoMaisBarato: maisBarato.preco_unitario,
        };
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [filtradas]);

  const filtrosAtivos = mercadoFiltro !== "todos" || dataInicio || dataFim;

  return (
    <div className="max-w-3xl mx-auto px-5 pt-8 md:pt-12 pb-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-1 font-display">Buscar</h1>
      <p className="text-muted text-sm mb-6">Produto, marca, mercado ou período — compare onde saiu mais barato</p>

      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Produto ou marca..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface border border-border outline-none focus:ring-2 focus:ring-accent text-sm"
          />
        </div>
        <button
          onClick={() => setMostrarFiltros((v) => !v)}
          className={`p-3 rounded-2xl border transition-colors ${
            filtrosAtivos ? "btn-accent border-transparent" : "border-border text-muted"
          }`}
          aria-label="Filtros"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {mostrarFiltros && (
        <div className="surface-card p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-xs text-muted flex flex-col gap-1">
            Mercado
            <select
              value={mercadoFiltro}
              onChange={(e) => setMercadoFiltro(e.target.value)}
              className="px-3 py-2 rounded-lg bg-bg border border-border text-text text-sm"
            >
              <option value="todos">Todos</option>
              {mercados.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
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

      {erro ? (
        <p className="text-center text-danger text-sm py-16">Não consegui carregar: {erro}</p>
      ) : loading ? (
        <p className="text-muted text-sm">Carregando...</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted mb-1">
            {resumos.length} {resumos.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>
          {resumos.map((r) => {
            const economia = r.ultimoPreco - r.precoMaisBarato;
            return (
              <div key={r.nome} className="surface-card px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{r.nome}</p>
                    {r.marca && <p className="text-xs text-muted">{r.marca}</p>}
                  </div>
                  <span className="font-data text-sm">{formatBRL(r.ultimoPreco)}</span>
                </div>
                <div className="receipt-divider mb-2" />
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>
                    {r.ultimoMercado} · {formatDataBR(r.ultimaData)}
                  </span>
                  {economia > 0.01 && (
                    <span className="flex items-center gap-1 text-success font-medium">
                      <TrendingDown size={12} />
                      {r.mercadoMaisBarato} por {formatBRL(r.precoMaisBarato)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {resumos.length === 0 && (
            <p className="text-center text-muted text-sm py-16">Nada encontrado com esses filtros.</p>
          )}
        </div>
      )}
    </div>
  );
}
