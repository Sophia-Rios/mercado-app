"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type OrderBy = { column: string; ascending?: boolean };

type Options = {
  select?: string;
  orderBy?: OrderBy;
};

// cache em memória entre telas: ao navegar, a página já abre com os dados da
// última visita e atualiza em segundo plano, em vez de mostrar "Carregando"
// e refazer toda a busca do zero a cada troca de página
const cache = new Map<string, unknown[]>();

export function limparCacheColecoes() {
  cache.clear();
}

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
  const select = options.select ?? "*";
  const orderColumn = options.orderBy?.column;
  const orderAscending = options.orderBy?.ascending ?? true;
  const chaveCache = `${table}|${select}|${orderColumn ?? ""}|${orderAscending}`;

  const [data, setDataEstado] = useState<T[]>(() => (cache.get(chaveCache) as T[] | undefined) ?? []);
  const [loading, setLoading] = useState(() => !cache.has(chaveCache));
  const [erro, setErro] = useState<string | null>(null);
  const carregandoRef = useRef(false);
  const recarregarDepoisRef = useRef(false);
  // cada instância do hook precisa do seu próprio canal — duas telas
  // assinando a mesma tabela (ex: o sino de notificações na topbar e a
  // página de notificações) não podem dividir o nome do canal, senão o
  // segundo `.subscribe()` falha com "cannot add callbacks after subscribe()".
  // useState com inicializador preguiçoso roda só uma vez (diferente de
  // useRef(valor), que reavaliaria Math.random() a cada render)
  const [canalId] = useState(() => Math.random().toString(36).slice(2));

  // setter que também atualiza o cache (usado pra atualizações otimistas)
  const setData = useCallback(
    (valor: T[] | ((anterior: T[]) => T[])) => {
      setDataEstado((anterior) => {
        const novo = typeof valor === "function" ? valor(anterior) : valor;
        cache.set(chaveCache, novo);
        return novo;
      });
    },
    [chaveCache]
  );

  // depende só de valores primitivos (não do objeto `options` em si) — assim
  // não importa se quem chama o hook passa um literal novo a cada render,
  // o efeito abaixo só reassina o canal quando algo realmente muda
  const carregar = useCallback(async () => {
    // se já tem uma busca em andamento, marca pra rodar de novo assim que ela
    // terminar — ignorar o aviso deixaria a tela com dado velho (a busca em
    // andamento pode ter começado antes da mudança que gerou o aviso)
    if (carregandoRef.current) {
      recarregarDepoisRef.current = true;
      return;
    }
    carregandoRef.current = true;
    do {
      recarregarDepoisRef.current = false;
      let query = supabase.from(table).select(select);
      if (orderColumn) query = query.order(orderColumn, { ascending: orderAscending });
      const { data: linhas, error } = await query;
      if (error) {
        setErro(error.message);
      } else {
        setErro(null);
        const novo = (linhas as T[]) ?? [];
        cache.set(chaveCache, novo);
        setDataEstado(novo);
      }
      setLoading(false);
    } while (recarregarDepoisRef.current);
    carregandoRef.current = false;
  }, [supabase, table, select, orderColumn, orderAscending, chaveCache]);

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
