"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ShoppingCart, AlertTriangle, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
} from "recharts";
import { createClient } from "@/lib/supabase";
import { useRealtimeCollection } from "@/lib/useRealtimeCollection";
import { formatBRL } from "@/lib/format";
import type { Categoria, Compra, ItemLista, Produto } from "@/lib/types";

const NOMES_MES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function Dashboard() {
  const supabase = useMemo(() => createClient(), []);

  const { data: produtos, loading: carregandoProdutos } = useRealtimeCollection<Produto>(supabase, "produtos");
  const { data: itensLista, loading: carregandoLista } = useRealtimeCollection<ItemLista>(supabase, "lista_compras");
  const { data: compras, loading: carregandoCompras } = useRealtimeCollection<Compra>(supabase, "compras", {
    select:
      "id, produto_id, mercado_id, quantidade, preco_unitario, preco_total, data_compra, produto:produtos(categoria), mercado:mercados(nome, cor)",
  });
  const { data: categorias } = useRealtimeCollection<Categoria>(supabase, "categorias");

  const loading = carregandoProdutos || carregandoLista || carregandoCompras;
  const pendentes = itensLista.filter((i) => !i.comprado).length;
  const estoqueBaixo = produtos.filter((p) => p.estoque_minimo > 0 && p.estoque_atual <= p.estoque_minimo).length;

  const stats = useMemo(() => {
    const mesesMap = new Map<string, number>();
    const catMap = new Map<string, number>();
    const mercadoMap = new Map<string, { total: number; cor: string }>();

    // menor preço unitário já visto por produto (histórico completo, qualquer mercado)
    const menorPreco = new Map<string, number>();
    compras.forEach((c) => {
      if (!c.produto_id) return;
      const atual = menorPreco.get(c.produto_id);
      if (atual === undefined || c.preco_unitario < atual) menorPreco.set(c.produto_id, c.preco_unitario);
    });

    const economiaMesesMap = new Map<string, { real: number; ideal: number }>();
    let somaReal = 0;
    let somaIdeal = 0;

    compras.forEach((c) => {
      const [y, m] = c.data_compra.split("-");
      const chave = `${y}-${m}`;
      mesesMap.set(chave, (mesesMap.get(chave) ?? 0) + Number(c.preco_total));

      const cat = c.produto?.categoria ?? "Outros";
      catMap.set(cat, (catMap.get(cat) ?? 0) + Number(c.preco_total));

      const nomeMercado = c.mercado?.nome ?? "—";
      const corMercado = c.mercado?.cor ?? "#9CA3AF";
      const entradaMercado = mercadoMap.get(nomeMercado) ?? { total: 0, cor: corMercado };
      entradaMercado.total += Number(c.preco_total);
      mercadoMap.set(nomeMercado, entradaMercado);

      const menor = c.produto_id ? menorPreco.get(c.produto_id) ?? c.preco_unitario : c.preco_unitario;
      const ideal = menor * c.quantidade;
      const entradaMes = economiaMesesMap.get(chave) ?? { real: 0, ideal: 0 };
      entradaMes.real += Number(c.preco_total);
      entradaMes.ideal += ideal;
      economiaMesesMap.set(chave, entradaMes);
      somaReal += Number(c.preco_total);
      somaIdeal += ideal;
    });

    const ordenado = Array.from(mesesMap.entries()).sort(([a], [b]) => (a > b ? 1 : -1));
    const porMes = ordenado.slice(-6).map(([chave, total]) => {
      const [, mm] = chave.split("-");
      return { mes: NOMES_MES[Number(mm) - 1], total: Math.round(total * 100) / 100 };
    });

    const porCategoria = Array.from(catMap.entries())
      .map(([categoria, total]) => ({ categoria, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    const porMercadoTotal = Array.from(mercadoMap.entries())
      .map(([mercado, { total, cor }]) => ({ mercado, total: Math.round(total * 100) / 100, cor }))
      .sort((a, b) => b.total - a.total);

    const economiaOrdenado = Array.from(economiaMesesMap.entries()).sort(([a], [b]) => (a > b ? 1 : -1));
    const economiaPorMes = economiaOrdenado.slice(-6).map(([chave, { real, ideal }]) => {
      const [, mm] = chave.split("-");
      const percentual = real > 0 ? ((real - ideal) / real) * 100 : 0;
      return { mes: NOMES_MES[Number(mm) - 1], percentual: Math.round(percentual * 10) / 10 };
    });

    const hoje = new Date();
    const chaveAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
    const anteriorDate = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const chaveAnterior = `${anteriorDate.getFullYear()}-${String(anteriorDate.getMonth() + 1).padStart(2, "0")}`;

    return {
      porMes,
      porCategoria,
      porMercadoTotal,
      economiaPorMes,
      gastoMes: mesesMap.get(chaveAtual) ?? 0,
      gastoMesAnterior: mesesMap.get(chaveAnterior) ?? 0,
      economiaTotal: {
        valor: somaReal - somaIdeal,
        percentual: somaReal > 0 ? ((somaReal - somaIdeal) / somaReal) * 100 : 0,
      },
    };
  }, [compras]);

  const corDaCategoria = (nome: string) => categorias.find((c) => c.nome === nome)?.cor ?? "#9CA3AF";
  const variacao =
    stats.gastoMesAnterior > 0 ? ((stats.gastoMes - stats.gastoMesAnterior) / stats.gastoMesAnterior) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-5 pt-8 md:pt-12 pb-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-1 font-display">Início</h1>
      <p className="text-muted text-sm mb-8">Resumo do módulo Mercado</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Link href="/lista" className="surface-card p-5 hover:border-accent/40 transition-colors">
          <ShoppingCart size={20} className="text-muted" />
          <p className="font-data text-3xl font-semibold mt-3">{loading ? "—" : pendentes}</p>
          <p className="text-xs text-muted mt-1">Itens na lista</p>
        </Link>
        <Link href="/estoque" className="surface-card p-5 hover:border-accent/40 transition-colors">
          <AlertTriangle size={20} className={estoqueBaixo > 0 ? "text-warning" : "text-muted"} />
          <p className="font-data text-3xl font-semibold mt-3">{loading ? "—" : estoqueBaixo}</p>
          <p className="text-xs text-muted mt-1">Abaixo do mínimo</p>
        </Link>
      </div>

      {/* gasto mensal com gráfico de área */}
      <div className="surface-card p-6 mb-3">
        <div className="flex items-end justify-between mb-1">
          <div>
            <p className="text-sm text-muted mb-1">Gasto neste mês</p>
            <p className="font-data text-4xl font-semibold">{loading ? "—" : formatBRL(stats.gastoMes)}</p>
          </div>
          {!loading && stats.gastoMesAnterior > 0 && (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                variacao <= 0 ? "text-success bg-success-bg" : "text-warning bg-warning-bg"
              }`}
            >
              {variacao > 0 ? "+" : ""}
              {variacao.toFixed(0)}% vs mês anterior
            </span>
          )}
        </div>
        <div className="h-40 mt-4 -mx-2">
          {stats.porMes.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.porMes} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillGasto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="mes"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [formatBRL(Number(value)), "Gasto"]}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--text)" }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#fillGasto)"
                  dot={{ fill: "var(--accent)", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* gasto por categoria */}
      {stats.porCategoria.length > 0 && (
        <div className="surface-card p-6 mb-3">
          <p className="text-sm text-muted mb-4">Gasto por categoria</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.porCategoria} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="categoria"
                  width={110}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [formatBRL(Number(value)), "Gasto"]}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "var(--surface-raised)" }}
                />
                <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={18}>
                  {stats.porCategoria.map((entry) => (
                    <Cell key={entry.categoria} fill={corDaCategoria(entry.categoria)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* gasto total por mercado */}
      {stats.porMercadoTotal.length > 0 && (
        <div className="surface-card p-6 mb-3">
          <p className="text-sm text-muted mb-4">Gasto total por mercado</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.porMercadoTotal} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="mercado"
                  width={100}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [formatBRL(Number(value)), "Gasto"]}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "var(--surface-raised)" }}
                />
                <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={18}>
                  {stats.porMercadoTotal.map((entry) => (
                    <Cell key={entry.mercado} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* fator economia por mês */}
      {stats.economiaPorMes.length > 0 && (
        <div className="surface-card p-6 mb-3">
          <div className="flex items-start justify-between mb-1">
            <p className="text-sm text-muted">Fator economia por mês</p>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                stats.economiaTotal.percentual > 10 ? "text-warning bg-warning-bg" : "text-success bg-success-bg"
              }`}
            >
              {stats.economiaTotal.percentual <= 1
                ? "já otimizado"
                : `${stats.economiaTotal.percentual.toFixed(1)}% de espaço`}
            </span>
          </div>
          <p className="text-xs text-muted mb-4">
            Compara o que você pagou com o menor preço já registrado pra cada produto, em qualquer mercado — quanto
            menor, mais próximo do ideal você já está comprando.{" "}
            {stats.economiaTotal.valor > 0
              ? `Escolhendo sempre o mercado mais barato, dava pra guardar mais ${formatBRL(stats.economiaTotal.valor)} no período.`
              : "Você já compra quase sempre pelo menor preço visto."}
          </p>
          <div className="h-48 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.economiaPorMes} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Espaço de economia"]}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "var(--surface-raised)" }}
                />
                <Bar dataKey="percentual" fill="var(--accent)" radius={[6, 6, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <Link
        href="/buscar"
        className="flex items-center justify-between surface-card p-5 hover:border-accent/40 transition-colors"
      >
        <div>
          <p className="text-sm font-medium">Buscar e comparar preços</p>
          <p className="text-xs text-muted mt-1">Filtre por produto, marca, mercado ou data</p>
        </div>
        <ArrowRight size={18} className="text-muted" />
      </Link>
    </div>
  );
}
