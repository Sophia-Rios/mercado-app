"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { createClient } from "@/lib/supabase";
import { useRealtimeCollection } from "@/lib/useRealtimeCollection";
import { resumoMercado } from "@/lib/mercado-calc";
import { formatBRL } from "@/lib/format";
import MercadoAvatar from "@/components/MercadoAvatar";
import BadgeTendencia from "@/components/BadgeTendencia";
import MercadoModal from "@/components/MercadoModal";
import CupomHistorico from "@/components/CupomHistorico";
import type { Mercado, Compra } from "@/lib/types";

export default function MercadoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const { data: mercados, loading: carregandoMercados, erro: erroMercados } = useRealtimeCollection<Mercado>(
    supabase,
    "mercados"
  );
  const { data: compras, loading: carregandoCompras, erro: erroCompras } = useRealtimeCollection<Compra>(
    supabase,
    "compras",
    {
      select:
        "id, produto_id, mercado_id, quantidade, preco_unitario, preco_total, data_compra, produto:produtos(nome)",
    }
  );
  const [editando, setEditando] = useState(false);

  const mercado = mercados.find((m) => m.id === id);
  const resumo = useMemo(() => resumoMercado(compras, id), [compras, id]);
  const comprasDoMercado = useMemo(() => compras.filter((c) => c.mercado_id === id), [compras, id]);

  const loading = carregandoMercados || carregandoCompras;
  const erro = erroMercados || erroCompras;

  if (erro) {
    return (
      <div className="max-w-2xl mx-auto px-5 pt-8">
        <p className="text-danger text-sm">Não consegui carregar: {erro}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 pt-8">
        <p className="text-muted text-sm">Carregando...</p>
      </div>
    );
  }

  if (!mercado) {
    return (
      <div className="max-w-2xl mx-auto px-5 pt-8">
        <p className="text-muted text-sm mb-4">Mercado não encontrado.</p>
        <button onClick={() => router.push("/mercados")} className="text-sm underline">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-8 md:pt-12 pb-8">
      <button
        onClick={() => router.push("/mercados")}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-text mb-4"
      >
        <ArrowLeft size={15} /> Mercados
      </button>

      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <MercadoAvatar mercado={mercado} size={44} />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold font-display truncate">{mercado.nome}</h1>
            {mercado.endereco && <p className="text-xs text-muted truncate">{mercado.endereco}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <BadgeTendencia tendencia={resumo.tendencia} />
          <button
            onClick={() => setEditando(true)}
            className="p-2 text-muted hover:text-text border border-border rounded-full"
          >
            <Pencil size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="surface-card p-5">
          <p className="text-2xl font-semibold font-data">{formatBRL(resumo.totalGasto)}</p>
          <p className="text-xs text-muted mt-1">Total gasto</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-2xl font-semibold font-data">{resumo.visitas}</p>
          <p className="text-xs text-muted mt-1">Visitas registradas</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-2xl font-semibold font-data">{formatBRL(resumo.ticketMedio)}</p>
          <p className="text-xs text-muted mt-1">Ticket médio por visita</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-2xl font-semibold font-data">{resumo.produtosDistintos}</p>
          <p className="text-xs text-muted mt-1">Produtos distintos</p>
        </div>
      </div>

      {resumo.serieVisitas.length > 1 && (
        <div className="surface-card p-6 mb-3">
          <p className="text-sm text-muted mb-4">Gasto por visita ao longo do tempo</p>
          <div className="h-48 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resumo.serieVisitas} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillMercado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={mercado.cor} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={mercado.cor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [formatBRL(Number(value)), "Gasto"]}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="total" stroke={mercado.cor} strokeWidth={2} fill="url(#fillMercado)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <p className="text-xs text-muted mb-6">
        A tendência compara o preço da primeira e da última compra de cada produto repetido nesse mercado, e tira a
        média.
        {resumo.tendencia ? ` Baseado em ${resumo.tendencia.baseadoEm} produtos comprados mais de uma vez ali.` : ""}
      </p>

      <CupomHistorico compras={comprasDoMercado} />

      {editando && <MercadoModal mercado={mercado} onFechar={() => setEditando(false)} />}
    </div>
  );
}
