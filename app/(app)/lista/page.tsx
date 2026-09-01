"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRealtimeCollection } from "@/lib/useRealtimeCollection";
import { useToast } from "@/components/ToastProvider";
import { mensagemErroSupabase } from "@/lib/supabase-error";
import { formatBRL } from "@/lib/format";
import type { Compra, ItemLista, Produto } from "@/lib/types";
import { Plus, Check, Trash2, Copy } from "lucide-react";

export default function ListaCompras() {
  const supabase = useMemo(() => createClient(), []);
  const mostrarToast = useToast();
  const [busca, setBusca] = useState("");

  const { data: itens } = useRealtimeCollection<ItemLista>(supabase, "lista_compras", {
    select: "*, produto:produtos(*)",
    orderBy: { column: "criado_em" },
  });
  const { data: produtos } = useRealtimeCollection<Produto>(supabase, "produtos", { orderBy: { column: "nome" } });
  const { data: compras } = useRealtimeCollection<Compra>(supabase, "compras", {
    select: "id, produto_id, preco_unitario, data_compra",
  });

  const ultimoPreco = useMemo(() => {
    const map = new Map<string, number>();
    const ordenadas = [...compras].sort((a, b) => (a.data_compra < b.data_compra ? 1 : -1));
    ordenadas.forEach((c) => {
      if (c.produto_id && !map.has(c.produto_id)) map.set(c.produto_id, c.preco_unitario);
    });
    return map;
  }, [compras]);

  const pendentes = itens.filter((i) => !i.comprado);
  const comprados = itens.filter((i) => i.comprado);
  const estimativa = pendentes.reduce((sum, item) => sum + (ultimoPreco.get(item.produto_id) ?? 0) * item.quantidade_desejada, 0);

  const produtosFiltrados = produtos.filter(
    (p) => busca.length > 0 && p.nome.toLowerCase().includes(busca.toLowerCase()) && !itens.some((i) => i.produto_id === p.id)
  );

  async function adicionarItem(produtoId: string) {
    const { error } = await supabase.from("lista_compras").insert({ produto_id: produtoId, quantidade_desejada: 1 });
    if (error) {
      mostrarToast(mensagemErroSupabase(error)!);
      return;
    }
    setBusca("");
  }

  async function adicionarNovoProduto() {
    if (!busca.trim()) return;
    const { data, error } = await supabase
      .from("produtos")
      .insert({ nome: busca.trim(), categoria: "Outros" })
      .select()
      .single();
    if (error) {
      mostrarToast(mensagemErroSupabase(error)!);
      return;
    }
    await adicionarItem(data.id);
  }

  async function toggleComprado(item: ItemLista) {
    const { error } = await supabase.from("lista_compras").update({ comprado: !item.comprado }).eq("id", item.id);
    if (error) mostrarToast(mensagemErroSupabase(error)!);
  }

  async function removerItem(id: string) {
    const { error } = await supabase.from("lista_compras").delete().eq("id", id);
    if (error) mostrarToast(mensagemErroSupabase(error)!);
  }

  async function alterarQuantidade(item: ItemLista, delta: number) {
    const nova = Math.max(1, item.quantidade_desejada + delta);
    const { error } = await supabase.from("lista_compras").update({ quantidade_desejada: nova }).eq("id", item.id);
    if (error) mostrarToast(mensagemErroSupabase(error)!);
  }

  async function copiarLista() {
    const texto = pendentes.map((i) => `• ${i.produto?.nome} (${i.quantidade_desejada}x)`).join("\n");
    const conteudo = `Lista de compras\n\n${texto}\n\nEstimativa: ${formatBRL(estimativa)}`;
    try {
      await navigator.clipboard.writeText(conteudo);
      mostrarToast("Lista copiada");
    } catch {
      mostrarToast("Não foi possível copiar");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-8 md:pt-10">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lista de compras</h1>
          <p className="text-muted text-sm mt-1">
            {pendentes.length} {pendentes.length === 1 ? "item pendente" : "itens pendentes"}
          </p>
        </div>
        <button
          onClick={copiarLista}
          disabled={pendentes.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium disabled:opacity-40"
        >
          <Copy size={16} />
          Copiar
        </button>
      </div>

      {/* busca / adicionar */}
      <div className="relative mb-6">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar ou adicionar item..."
          className="w-full px-4 py-3 rounded-2xl bg-surface border border-border outline-none focus:ring-2 focus:ring-accent text-sm"
        />
        {busca.length > 0 && (
          <div className="absolute mt-1 w-full bg-surface-raised border border-border rounded-2xl shadow-lg overflow-hidden z-10 max-h-64 overflow-y-auto">
            {produtosFiltrados.map((p) => (
              <button
                key={p.id}
                onClick={() => adicionarItem(p.id)}
                className="w-full text-left px-4 py-3 hover:bg-bg text-sm flex items-center justify-between"
              >
                <span>{p.nome}</span>
                <span className="text-muted text-xs">{p.categoria}</span>
              </button>
            ))}
            <button
              onClick={adicionarNovoProduto}
              className="w-full text-left px-4 py-3 hover:bg-bg text-sm flex items-center gap-2 text-accent font-medium border-t border-border"
            >
              <Plus size={16} />
              Cadastrar &quot;{busca}&quot; como novo produto
            </button>
          </div>
        )}
      </div>

      {/* estimativa estilo recibo */}
      {pendentes.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between text-sm text-muted mb-2">
            <span>Estimativa (base: último preço)</span>
          </div>
          <div className="receipt-divider mb-3" />
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold">Total previsto</span>
            <span className="font-data text-xl font-semibold">{formatBRL(estimativa)}</span>
          </div>
        </div>
      )}

      {itens.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          Sua lista está vazia. Busque um item acima pra começar.
        </div>
      ) : (
        <div className="space-y-6">
          {pendentes.length > 0 && (
            <ul className="space-y-2">
              {pendentes.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3"
                >
                  <button
                    onClick={() => toggleComprado(item)}
                    className="w-6 h-6 rounded-full border-2 border-border flex-shrink-0 flex items-center justify-center hover:border-accent"
                  />
                  <span className="flex-1 text-sm">{item.produto?.nome}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alterarQuantidade(item, -1)}
                      className="w-6 h-6 rounded-full border border-border text-xs"
                    >
                      −
                    </button>
                    <span className="font-data text-sm w-5 text-center">{item.quantidade_desejada}</span>
                    <button
                      onClick={() => alterarQuantidade(item, 1)}
                      className="w-6 h-6 rounded-full border border-border text-xs"
                    >
                      +
                    </button>
                  </div>
                  <button onClick={() => removerItem(item.id)} className="text-muted hover:text-danger">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {comprados.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted mb-2 font-medium">Já no carrinho</p>
              <ul className="space-y-2">
                {comprados.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 bg-surface/50 border border-border rounded-xl px-4 py-3 opacity-60"
                  >
                    <button
                      onClick={() => toggleComprado(item)}
                      className="w-6 h-6 rounded-full btn-accent flex-shrink-0 flex items-center justify-center"
                    >
                      <Check size={14} className="text-accent-contrast" />
                    </button>
                    <span className="flex-1 text-sm line-through">{item.produto?.nome}</span>
                    <button onClick={() => removerItem(item.id)} className="text-muted hover:text-danger">
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
