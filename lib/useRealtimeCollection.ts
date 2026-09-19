"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type OrderBy = { column: string; ascending?: boolean };

type Options = {
  select?: string;
  orderBy?: OrderBy;
};

/**
 * Busca uma tabela e mantém ela sincronizada entre dispositivos via
 * Supabase Realtime: qualquer INSERT/UPDATE/DELETE nessa tabela (feito por
 * qualquer cliente, em qualquer aparelho) refaz a busca. Isso troca o
 * polling por push — não existe janela em que uma leitura atrasada
 * sobrescreve uma edição recente, porque a busca só acontece quando o
 * banco avisa que mudou de verdade.
 */
export function useRealtimeCollection<T>(
  supabase: SupabaseClient,
  table: string,
  options: Options = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const carregandoRef = useRef(false);
  // cada instância do hook precisa do seu próprio canal — duas telas
  // assinando a mesma tabela (ex: o sino de notificações na topbar e a
  // página de notificações) não podem dividir o nome do canal, senão o
  // segundo `.subscribe()` falha com "cannot add callbacks after subscribe()".
  // useState com inicializador preguiçoso roda só uma vez (diferente de
  // useRef(valor), que reavaliaria Math.random() a cada render)
  const [canalId] = useState(() => Math.random().toString(36).slice(2));

  const select = options.select ?? "*";
  const orderColumn = options.orderBy?.column;
  const orderAscending = options.orderBy?.ascending ?? true;

  // depende só de valores primitivos (não do objeto `options` em si) — assim
  // não importa se quem chama o hook passa um literal novo a cada render,
  // o efeito abaixo só reassina o canal quando algo realmente muda
  const carregar = useCallback(async () => {
    // evita corridas: se já tem uma busca em andamento, deixa ela terminar
    // e ignora o disparo duplicado (ex: dois eventos realtime seguidos)
    if (carregandoRef.current) return;
    carregandoRef.current = true;
    let query = supabase.from(table).select(select);
    if (orderColumn) query = query.order(orderColumn, { ascending: orderAscending });
    const { data: linhas, error } = await query;
    carregandoRef.current = false;
    if (error) {
      setErro(error.message);
      return;
    }
    setErro(null);
    setData((linhas as T[]) ?? []);
    setLoading(false);
  }, [supabase, table, select, orderColumn, orderAscending]);

  useEffect(() => {
    carregar();
    const channel = supabase
      .channel(`realtime:${table}:${canalId}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => carregar())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregar]);

  return { data, loading, erro, refetch: carregar, setData };
}
