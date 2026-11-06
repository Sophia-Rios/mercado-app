"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRealtimeCollection } from "@/lib/useRealtimeCollection";
import { useToast } from "@/components/ToastProvider";
import { mensagemErroSupabase } from "@/lib/supabase-error";
import { formatBRL } from "@/lib/format";
import type { Compra, ItemLista, Produto } from "@/lib/types";
import { Plus, Check, Copy, Eraser, GripVertical } from "lucide-react";
import SwipeRow from "@/components/SwipeRow";

export default function ListaCompras() {
  const supabase = useMemo(() => createClient(), []);
  const mostrarToast = useToast();
  const [busca, setBusca] = useState("");

  const { data: itens, setData: setItens, refetch: recarregarItens } = useRealtimeCollection<ItemLista>(supabase, "lista_compras", {
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

  // posição manual; sem ela, vale a ordem em que foram adicionados
  const posicao = (i: ItemLista) => Number(i.ordem ?? Date.parse(i.criado_em) / 1000);
  const ordenados = useMemo(() => [...itens].sort((a, b) => posicao(a) - posicao(b)), [itens]);
  const pendentes = ordenados.filter((i) => !i.comprado);
  const comprados = ordenados.filter((i) => i.comprado);
  // soma todos os itens, não só os pendentes — marcar um item como comprado
  // não deve derrubar o total previsto até a compra ser finalizada de fato
  const estimativa = itens.reduce((sum, item) => sum + (ultimoPreco.get(item.produto_id) ?? 0) * item.quantidade_desejada, 0);

  // "20 tang" ou "20x tang" adiciona 20 unidades de uma vez
  const { quantidadeDigitada, termoBusca } = useMemo(() => {
    const m = busca.trim().match(/^(\d+)\s*(?:x|un|unid\w*)?\s+(.+)$/i);
    return m
      ? { quantidadeDigitada: Math.min(Number(m[1]), 999), termoBusca: m[2].trim() }
      : { quantidadeDigitada: 1, termoBusca: busca.trim() };
  }, [busca]);

  const produtosFiltrados = produtos.filter((p) => {
    if (busca.length === 0 || itens.some((i) => i.produto_id === p.id)) return false;
    const alvo = `${p.nome} ${p.marca ?? ""}`.toLowerCase();
    return alvo.includes(termoBusca.toLowerCase()) || alvo.includes(busca.trim().toLowerCase());
  });

  async function adicionarItem(produtoId: string) {
    const quantidade = Math.max(1, quantidadeDigitada);
    setBusca("");
    const { data, error } = await supabase
      .from("lista_compras")
      .insert({ produto_id: produtoId, quantidade_desejada: quantidade })
      .select("*, produto:produtos(*)")
      .single();
    if (error) {
      mostrarToast(mensagemErroSupabase(error)!);
      return;
    }
    setItens((prev) => (prev.some((i) => i.id === data.id) ? prev : [...prev, data as ItemLista]));
  }

  async function adicionarNovoProduto() {
    if (!termoBusca) return;
    const { data, error } = await supabase
      .from("produtos")
      .insert({ nome: termoBusca, categoria: "Outros" })
      .select()
      .single();
    if (error) {
      mostrarToast(mensagemErroSupabase(error)!);
      return;
    }
    await adicionarItem(data.id);
  }

  // as ações abaixo atualizam a tela na hora e confirmam no banco em seguida;
  // se o banco recusar, a tela volta ao estado real
  async function toggleComprado(item: ItemLista) {
    setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, comprado: !i.comprado } : i)));
    const { error } = await supabase.from("lista_compras").update({ comprado: !item.comprado }).eq("id", item.id);
    if (error) {
      mostrarToast(mensagemErroSupabase(error)!);
      recarregarItens();
    }
  }

  async function removerItem(id: string) {
    setItens((prev) => prev.filter((i) => i.id !== id));
    const { error } = await supabase.from("lista_compras").delete().eq("id", id);
    if (error) {
      mostrarToast(mensagemErroSupabase(error)!);
      recarregarItens();
    }
  }

  async function finalizarCompra() {
    setItens((prev) => prev.filter((i) => !i.comprado));
    const { error } = await supabase.from("lista_compras").delete().eq("comprado", true);
    if (error) {
      mostrarToast(mensagemErroSupabase(error)!);
      recarregarItens();
      return;
    }
    mostrarToast("Compra finalizada");
  }

  async function limparTudo() {
    if (!window.confirm(`Remover os ${itens.length} itens da lista? Não dá pra desfazer.`)) return;
    setItens([]);
    const { error } = await supabase.from("lista_compras").delete().not("id", "is", null);
    if (error) {
      mostrarToast(mensagemErroSupabase(error)!);
      recarregarItens();
      return;
    }
    mostrarToast("Lista limpa");
  }

  async function alterarQuantidade(item: ItemLista, delta: number) {
    const nova = Math.max(1, item.quantidade_desejada + delta);
    if (nova === item.quantidade_desejada) return;
    setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantidade_desejada: nova } : i)));
    const { error } = await supabase.from("lista_compras").update({ quantidade_desejada: nova }).eq("id", item.id);
    if (error) {
      mostrarToast(mensagemErroSupabase(error)!);
      recarregarItens();
    }
  }

  // reordenar arrastando pela alça: durante o arrasto só movemos a tela;
  // ao soltar, renumera os pendentes (1..n) e grava só o que mudou
  const [arrasto, setArrasto] = useState<{ de: number; para: number; dy: number; altura: number } | null>(null);
  const arrastoRef = useRef<{ startY: number; de: number; centros: number[]; altura: number } | null>(null);
  const ultimoArrasto = useRef<{ de: number; para: number } | null>(null);
  const itensRef = useRef<Map<string, HTMLLIElement>>(new Map());

  function iniciarArrasto(e: React.PointerEvent<HTMLElement>, indice: number) {
    e.stopPropagation();
    e.preventDefault();
    const elementos = pendentes.map((i) => itensRef.current.get(i.id));
    if (elementos.some((el) => !el)) return;
    const rects = elementos.map((el) => el!.getBoundingClientRect());
    const altura = rects[indice].height + 8; // 8 = espaço entre linhas
    arrastoRef.current = {
      startY: e.clientY,
      de: indice,
      centros: rects.map((r) => r.top + r.height / 2),
      altura,
    };
    ultimoArrasto.current = { de: indice, para: indice };
    e.currentTarget.setPointerCapture(e.pointerId);
    setArrasto({ de: indice, para: indice, dy: 0, altura });
  }

  function moverArrasto(e: React.PointerEvent<HTMLElement>) {
    const a = arrastoRef.current;
    if (!a) return;
    const dy = e.clientY - a.startY;
    const centroArrastado = a.centros[a.de] + dy;
    const para = a.centros.filter((c, i) => i !== a.de && c < centroArrastado).length;
    ultimoArrasto.current = { de: a.de, para };
    setArrasto({ de: a.de, para, dy, altura: a.altura });
  }

  async function soltarArrasto() {
    const resultado = ultimoArrasto.current;
    arrastoRef.current = null;
    ultimoArrasto.current = null;
    setArrasto(null);
    if (!resultado || resultado.para === resultado.de) return;

    const novaOrdem = [...pendentes];
    const [movido] = novaOrdem.splice(resultado.de, 1);
    novaOrdem.splice(resultado.para, 0, movido);
    const mudancas = new Map(
      novaOrdem
        .map((item, i) => ({ id: item.id, ordem: i + 1, atual: Number(item.ordem) }))
        .filter((m) => m.atual !== m.ordem)
        .map((m) => [m.id, m.ordem])
    );

    setItens((prev) => prev.map((i) => (mudancas.has(i.id) ? { ...i, ordem: mudancas.get(i.id)! } : i)));
    const respostas = await Promise.all(
      Array.from(mudancas, ([id, ordem]) => supabase.from("lista_compras").update({ ordem }).eq("id", id))
    );
    const falha = respostas.find((r) => r.error);
    if (falha?.error) {
      mostrarToast(mensagemErroSupabase(falha.error)!);
      recarregarItens();
    }
  }

  function deslocamento(indice: number): number {
    if (!arrasto) return 0;
    const { de, para, dy, altura } = arrasto;
    if (indice === de) return dy;
    if (de < para && indice > de && indice <= para) return -altura;
    if (de > para && indice >= para && indice < de) return altura;
    return 0;
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
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={limparTudo}
            disabled={itens.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium text-danger disabled:opacity-40"
          >
            <Eraser size={16} />
            Limpar tudo
          </button>
          <button
            onClick={copiarLista}
            disabled={pendentes.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium disabled:opacity-40"
          >
            <Copy size={16} />
            Copiar
          </button>
        </div>
      </div>

      {/* busca / adicionar */}
      <div className="relative mb-6">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar ou adicionar item... (ex: 20 tang)"
          className="w-full px-4 py-3 rounded-2xl bg-surface border border-border outline-none focus:ring-2 focus:ring-accent text-sm"
        />
        {busca.length > 0 && (
          <div className="absolute mt-1 w-full bg-surface-raised border border-border rounded-2xl shadow-lg overflow-hidden z-10 max-h-64 overflow-y-auto">
            {produtosFiltrados.map((p) => (
              <button
                key={p.id}
                onClick={() => adicionarItem(p.id)}
                className="w-full text-left px-4 py-3 hover:bg-bg text-sm flex items-center justify-between gap-2"
              >
                <span className="min-w-0">
                  <span className="block truncate">{p.nome}</span>
                  {p.marca && <span className="block text-xs text-muted truncate">{p.marca}</span>}
                </span>
                <span className="text-muted text-xs flex-shrink-0">
                  {quantidadeDigitada > 1 ? `${quantidadeDigitada}× · ` : ""}
                  {p.categoria}
                </span>
              </button>
            ))}
            <button
              onClick={adicionarNovoProduto}
              className="w-full text-left px-4 py-3 hover:bg-bg text-sm flex items-center gap-2 text-accent font-medium border-t border-border"
            >
              <Plus size={16} />
              Cadastrar &quot;{termoBusca}&quot; como novo produto{quantidadeDigitada > 1 ? ` (${quantidadeDigitada}×)` : ""}
            </button>
          </div>
        )}
      </div>

      {/* estimativa estilo recibo */}
      {itens.length > 0 && (
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
              {pendentes.map((item, indice) => (
                <li
                  key={item.id}
                  ref={(el) => {
                    if (el) itensRef.current.set(item.id, el);
                    else itensRef.current.delete(item.id);
                  }}
                  style={{
                    transform: `translateY(${deslocamento(indice)}px)`,
                    transition: arrasto && arrasto.de !== indice ? "transform 150ms ease-out" : "none",
                    zIndex: arrasto?.de === indice ? 10 : undefined,
                    position: "relative",
                  }}
                  className={arrasto?.de === indice ? "shadow-lg rounded-xl" : ""}
                >
                  <SwipeRow onDireita={() => toggleComprado(item)} onEsquerda={() => removerItem(item.id)}>
                    <div className="flex items-center gap-2 border border-border rounded-xl pr-4 pl-1 py-3 select-none">
                      <button
                        aria-label="Arrastar pra reordenar"
                        onPointerDown={(e) => iniciarArrasto(e, indice)}
                        onPointerMove={moverArrasto}
                        onPointerUp={soltarArrasto}
                        onPointerCancel={soltarArrasto}
                        style={{ touchAction: "none" }}
                        className="w-8 h-10 flex items-center justify-center text-muted cursor-grab active:cursor-grabbing flex-shrink-0"
                      >
                        <GripVertical size={18} />
                      </button>
                      <button
                        onClick={() => toggleComprado(item)}
                        aria-label="Marcar como comprado"
                        className="w-7 h-7 rounded-full border-2 border-border flex-shrink-0 flex items-center justify-center hover:border-accent"
                      />
                      <span className="flex-1 text-sm">{item.produto?.nome}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => alterarQuantidade(item, -1)}
                          aria-label="Diminuir quantidade"
                          className="w-10 h-10 rounded-full border border-border text-xl leading-none active:bg-surface-raised"
                        >
                          −
                        </button>
                        <span className="font-data text-base w-8 text-center">{item.quantidade_desejada}</span>
                        <button
                          onClick={() => alterarQuantidade(item, 1)}
                          aria-label="Aumentar quantidade"
                          className="w-10 h-10 rounded-full border border-border text-xl leading-none active:bg-surface-raised"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </SwipeRow>
                </li>
              ))}
            </ul>
          )}

          {comprados.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wide text-muted font-medium">Já no carrinho</p>
                <button
                  onClick={finalizarCompra}
                  className="flex items-center gap-1.5 text-xs font-medium text-accent"
                >
                  <Check size={13} /> Finalizar compra
                </button>
              </div>
              <ul className="space-y-2">
                {comprados.map((item) => (
                  <li key={item.id}>
                    <SwipeRow
                      desfazer
                      onDireita={() => toggleComprado(item)}
                      onEsquerda={() => removerItem(item.id)}
                    >
                      <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 opacity-60 select-none">
                        <button
                          onClick={() => toggleComprado(item)}
                          aria-label="Desmarcar"
                          className="w-7 h-7 rounded-full btn-accent flex-shrink-0 flex items-center justify-center"
                        >
                          <Check size={14} className="text-accent-contrast" />
                        </button>
                        <span className="flex-1 text-sm line-through">{item.produto?.nome}</span>
                      </div>
                    </SwipeRow>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-muted text-center">
            Arraste pra direita pra marcar, pra esquerda pra excluir, e pela alça pra reordenar.
          </p>
        </div>
      )}
    </div>
  );
}
