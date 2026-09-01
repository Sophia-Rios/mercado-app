"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRealtimeCollection } from "@/lib/useRealtimeCollection";
import { resumoMercado } from "@/lib/mercado-calc";
import { formatBRL } from "@/lib/format";
import MercadoAvatar from "@/components/MercadoAvatar";
import BadgeTendencia from "@/components/BadgeTendencia";
import MercadoModal from "@/components/MercadoModal";
import type { Mercado, Compra } from "@/lib/types";

export default function MercadosPage() {
  const supabase = useMemo(() => createClient(), []);
  const { data: mercados, loading: carregandoMercados, erro: erroMercados } = useRealtimeCollection<Mercado>(
    supabase,
    "mercados",
    { orderBy: { column: "nome" } }
  );
  const { data: compras, loading: carregandoCompras, erro: erroCompras } = useRealtimeCollection<Compra>(
    supabase,
    "compras",
    { select: "id, produto_id, mercado_id, quantidade, preco_unitario, preco_total, data_compra" }
  );
  const [editando, setEditando] = useState<Mercado | "novo" | null>(null);

  const resumos = useMemo(
    () =>
      mercados
        .map((m) => ({ mercado: m, resumo: resumoMercado(compras, m.id) }))
        .sort((a, b) => b.resumo.totalGasto - a.resumo.totalGasto),
    [mercados, compras]
  );

  const loading = carregandoMercados || carregandoCompras;
  const erro = erroMercados || erroCompras;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-8 md:pt-12 pb-8">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="text-3xl md:text-4xl font-bold font-display">Mercados</h1>
        <button
          onClick={() => setEditando("novo")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full btn-accent text-sm font-medium flex-shrink-0"
        >
          <Plus size={14} /> Novo
        </button>
      </div>
      <p className="text-muted text-sm mb-6">
        Compare gasto, ticket médio e tendência de preço entre onde você compra
      </p>

      {erro ? (
        <p className="text-center text-danger text-sm py-16">Não consegui carregar: {erro}</p>
      ) : loading ? (
        <p className="text-muted text-sm">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {resumos.map(({ mercado, resumo }) => (
            <div
              key={mercado.id}
              className="surface-card px-5 py-4 flex items-center gap-3 hover:border-accent/30 transition-colors"
            >
              <Link href={`/mercados/${mercado.id}`} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <MercadoAvatar mercado={mercado} />
                <div className="min-w-0">
                  <p className="font-medium truncate">{mercado.nome}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {resumo.visitas} visitas · {formatBRL(resumo.totalGasto)} no total
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-2 flex-shrink-0">
                <BadgeTendencia tendencia={resumo.tendencia} />
                <button onClick={() => setEditando(mercado)} className="p-1.5 text-muted hover:text-text">
                  <Pencil size={14} />
                </button>
                <Link href={`/mercados/${mercado.id}`}>
                  <ChevronRight size={16} className="text-muted" />
                </Link>
              </div>
            </div>
          ))}
          {resumos.length === 0 && (
            <p className="text-center text-muted text-sm py-16">Nenhum mercado cadastrado ainda.</p>
          )}
        </div>
      )}

      {editando && (
        <MercadoModal mercado={editando === "novo" ? null : editando} onFechar={() => setEditando(null)} />
      )}
    </div>
  );
}
