"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, PackagePlus, Pencil, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRealtimeCollection } from "@/lib/useRealtimeCollection";
import { useToast } from "@/components/ToastProvider";
import { mensagemErroSupabase } from "@/lib/supabase-error";
import ProdutoModal, { type FormProduto } from "@/components/ProdutoModal";
import type { Categoria, Compra, Produto } from "@/lib/types";

export default function Estoque() {
  const supabase = useMemo(() => createClient(), []);
  const mostrarToast = useToast();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "baixo">("todos");
  const [modalProdutoId, setModalProdutoId] = useState<string | "novo" | null>(null);

  const { data: produtos, loading } = useRealtimeCollection<Produto>(supabase, "produtos", {
    orderBy: { column: "nome" },
  });
  const { data: categorias } = useRealtimeCollection<Categoria>(supabase, "categorias");
  const { data: compras } = useRealtimeCollection<Compra>(supabase, "compras", {
    select: "id, produto_id, mercado_id, preco_unitario, data_compra, mercado:mercados(nome)",
  });

  async function atualizarCampo(id: string, campo: "estoque_atual" | "estoque_minimo", valor: number) {
    const { error } = await supabase.from("produtos").update({ [campo]: valor }).eq("id", id);
    if (error) mostrarToast(mensagemErroSupabase(error)!);
  }

  // dá entrada de 1 embalagem inteira de uma vez (ex: +12 ao comprar um
  // fardo de papel higiênico) — evita ter que somar de cabeça toda vez
  async function darEntradaPorEmbalagem(p: Produto) {
    const porEmbalagem = p.quantidade_unidade_consumo ?? 1;
    await atualizarCampo(p.id, "estoque_atual", p.estoque_atual + porEmbalagem);
  }

  async function salvarProduto(form: FormProduto) {
    const payload = {
      nome: form.nome.trim(),
      marca: form.marca.trim() || null,
      peso_volume: form.peso_volume.trim() || null,
      categoria: form.categoria,
      codigo_barras: form.codigo_barras.trim() || null,
      estoque_atual: form.estoque_atual,
      estoque_minimo: form.estoque_minimo,
      ultima_compra_data: form.ultima_compra_data || null,
      unidade_consumo: form.unidade_consumo.trim() || null,
      quantidade_unidade_consumo: form.quantidade_unidade_consumo > 0 ? form.quantidade_unidade_consumo : null,
    };

    if (modalProdutoId === "novo") {
      const { error } = await supabase.from("produtos").insert(payload);
      if (error) {
        mostrarToast(mensagemErroSupabase(error)!);
        return;
      }
      mostrarToast("Produto cadastrado");
    } else {
      const { error } = await supabase.from("produtos").update(payload).eq("id", modalProdutoId);
      if (error) {
        mostrarToast(mensagemErroSupabase(error)!);
        return;
      }
      mostrarToast("Produto atualizado");
    }
    setModalProdutoId(null);
  }

  async function excluirProduto(id: string) {
    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (error) {
      mostrarToast(mensagemErroSupabase(error)!);
      return;
    }
    mostrarToast("Produto excluído");
    setModalProdutoId(null);
  }

  async function substituirProduto(idOriginal: string, idDestino: string) {
    const { error: erroCompras } = await supabase
      .from("compras")
      .update({ produto_id: idDestino })
      .eq("produto_id", idOriginal);
    if (erroCompras) {
      mostrarToast(mensagemErroSupabase(erroCompras)!);
      return;
    }
    const { error: erroProduto } = await supabase.from("produtos").delete().eq("id", idOriginal);
    if (erroProduto) {
      mostrarToast(mensagemErroSupabase(erroProduto)!);
      return;
    }
    mostrarToast("Produto substituído");
    setModalProdutoId(null);
  }

  const filtrados = produtos.filter((p) => {
    const bateBusca =
      p.nome.toLowerCase().includes(busca.toLowerCase()) || (p.marca ?? "").toLowerCase().includes(busca.toLowerCase());
    const bateFiltro = filtro === "todos" || (p.estoque_minimo > 0 && p.estoque_atual <= p.estoque_minimo);
    return bateBusca && bateFiltro;
  });

  const abaixoDoMinimo = produtos.filter((p) => p.estoque_atual <= p.estoque_minimo && p.estoque_minimo > 0);
  const produtoEmEdicao =
    modalProdutoId && modalProdutoId !== "novo" ? produtos.find((p) => p.id === modalProdutoId) ?? null : null;

  function corDaCategoria(nome: string) {
    return categorias.find((c) => c.nome === nome)?.cor ?? "#9CA3AF";
  }

  return (
    <div className="max-w-3xl mx-auto px-5 pt-8 md:pt-10">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="text-2xl font-bold font-display">Estoque</h1>
        <button
          onClick={() => setModalProdutoId("novo")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full btn-accent text-sm font-medium flex-shrink-0"
        >
          <Plus size={14} /> Novo
        </button>
      </div>
      <p className="text-muted text-sm mb-6">{produtos.length} produtos cadastrados</p>

      {abaixoDoMinimo.length > 0 && (
        <div className="flex items-start gap-3 bg-warning-bg border border-warning/30 rounded-2xl px-4 py-3 mb-6">
          <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            <span className="font-medium">{abaixoDoMinimo.length}</span>{" "}
            {abaixoDoMinimo.length === 1 ? "item está" : "itens estão"} abaixo do estoque mínimo.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto ou marca..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full bg-surface border border-border outline-none focus:ring-2 focus:ring-accent text-sm"
          />
        </div>
        <div className="flex bg-surface border border-border rounded-full p-1 text-xs">
          <button
            onClick={() => setFiltro("todos")}
            className={`px-3 py-1.5 rounded-full font-medium ${filtro === "todos" ? "btn-accent" : "text-muted"}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro("baixo")}
            className={`px-3 py-1.5 rounded-full font-medium ${filtro === "baixo" ? "btn-accent" : "text-muted"}`}
          >
            Estoque baixo
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {filtrados.map((p) => {
            const baixo = p.estoque_minimo > 0 && p.estoque_atual <= p.estoque_minimo;
            return (
              <div
                key={p.id}
                className={`bg-surface border rounded-xl px-4 py-3 ${baixo ? "border-warning/40" : "border-border"}`}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.nome}</p>
                    <p className="text-xs text-muted truncate flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: corDaCategoria(p.categoria) }}
                      />
                      {[p.marca, p.peso_volume, p.categoria].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {baixo && (
                      <span className="text-xs font-medium text-warning bg-warning-bg px-2 py-1 rounded-full">
                        Repor
                      </span>
                    )}
                    <button onClick={() => setModalProdutoId(p.id)} className="p-1.5 text-muted hover:text-text">
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs text-muted">
                  <label className="flex items-center gap-2">
                    Atual{p.unidade_consumo ? ` (${p.unidade_consumo})` : ""}
                    <input
                      type="number"
                      value={p.estoque_atual}
                      onChange={(e) => atualizarCampo(p.id, "estoque_atual", Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg bg-bg border border-border font-data text-text"
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    Mínimo{p.unidade_consumo ? ` (${p.unidade_consumo})` : ""}
                    <input
                      type="number"
                      value={p.estoque_minimo}
                      onChange={(e) => atualizarCampo(p.id, "estoque_minimo", Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg bg-bg border border-border font-data text-text"
                    />
                  </label>
                  {p.unidade_consumo && (p.quantidade_unidade_consumo ?? 1) > 1 && (
                    <button
                      onClick={() => darEntradaPorEmbalagem(p)}
                      title={`Deu entrada de 1 embalagem (+${p.quantidade_unidade_consumo} ${p.unidade_consumo})`}
                      className="flex items-center gap-1 text-accent font-medium ml-auto flex-shrink-0"
                    >
                      <PackagePlus size={13} />+{p.quantidade_unidade_consumo} {p.unidade_consumo}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filtrados.length === 0 && (
            <p className="text-center text-muted text-sm py-16">Nenhum produto encontrado.</p>
          )}
        </div>
      )}

      {modalProdutoId && (
        <ProdutoModal
          produto={produtoEmEdicao}
          outrosProdutos={produtos.filter((p) => p.id !== modalProdutoId)}
          compras={compras}
          onSalvar={salvarProduto}
          onExcluir={produtoEmEdicao ? () => excluirProduto(produtoEmEdicao.id) : null}
          onSubstituir={produtoEmEdicao ? (destinoId) => substituirProduto(produtoEmEdicao.id, destinoId) : null}
          onFechar={() => setModalProdutoId(null)}
        />
      )}
    </div>
  );
}
