"use client";

import { useMemo } from "react";
import { createClient } from "./supabase";
import { useRealtimeCollection } from "./useRealtimeCollection";
import { calcularNotificacoes } from "./notificacoes";
import { mensagemErroSupabase } from "./supabase-error";
import type { Compra, NotificacaoLida, Produto, UsuarioPreferencias } from "./types";

export function useNotificacoes() {
  const supabase = useMemo(() => createClient(), []);
  const { data: produtos } = useRealtimeCollection<Produto>(supabase, "produtos");
  const { data: compras } = useRealtimeCollection<Compra>(supabase, "compras", {
    select: "id, produto_id, mercado_id, preco_unitario, data_compra, produto:produtos(nome), mercado:mercados(nome)",
  });
  const { data: prefsLinhas } = useRealtimeCollection<UsuarioPreferencias>(supabase, "usuario_preferencias");
  const { data: lidas } = useRealtimeCollection<NotificacaoLida>(supabase, "notificacoes_lidas");

  const notificacoes = useMemo(
    () => calcularNotificacoes(produtos, compras, prefsLinhas[0]),
    [produtos, compras, prefsLinhas]
  );
  const idsLidas = useMemo(() => new Set(lidas.map((l) => l.notif_id)), [lidas]);
  const naoLidas = useMemo(() => notificacoes.filter((n) => !idsLidas.has(n.id)), [notificacoes, idsLidas]);

  async function marcarComoLida(id: string): Promise<string | null> {
    if (idsLidas.has(id)) return null;
    const { error } = await supabase.from("notificacoes_lidas").upsert({ notif_id: id });
    return mensagemErroSupabase(error);
  }

  async function marcarTodasComoLidas(): Promise<string | null> {
    const pendentes = naoLidas.map((n) => ({ notif_id: n.id }));
    if (pendentes.length === 0) return null;
    const { error } = await supabase.from("notificacoes_lidas").upsert(pendentes);
    return mensagemErroSupabase(error);
  }

  return { notificacoes, idsLidas, naoLidas, marcarComoLida, marcarTodasComoLidas };
}
