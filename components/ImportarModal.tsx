"use client";

import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { parseTabela, type LinhaImportada, type ResultadoImportacao } from "@/lib/import-compras";
import { formatBRL, formatDataBR } from "@/lib/format";
import { mensagemErroSupabase } from "@/lib/supabase-error";
import { useToast } from "@/components/ToastProvider";

const EXEMPLO =
  "Produto\tMercado\tData\tQuantidade\tPreço Unitário\nArroz Rei Arthur 5kg\tEconomart\t20/08/2026\t1\t20,98";

export default function ImportarModal({ onFechar }: { onFechar: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const mostrarToast = useToast();
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const [importando, setImportando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function processar() {
    if (!texto.trim()) return;
    setResultado(parseTabela(texto));
  }

  function lerArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const conteudo = String(ev.target?.result ?? "");
      setTexto(conteudo);
      setResultado(parseTabela(conteudo));
    };
    reader.readAsText(file, "utf-8");
  }

  async function confirmarImportacao() {
    if (!resultado || "erro" in resultado) return;
    const validas = resultado.linhas.filter((l) => l.erros.length === 0);
    if (validas.length === 0) return;

    setImportando(true);

    const [
      { data: produtosExistentes, error: erroProdutos },
      { data: mercadosExistentes, error: erroMercados },
      { data: comprasExistentes, error: erroComprasExistentes },
    ] = await Promise.all([
      supabase.from("produtos").select("id, nome, marca"),
      supabase.from("mercados").select("id, nome"),
      supabase.from("compras").select("produto_id, mercado_id, data_compra, quantidade, preco_unitario"),
    ]);
    if (erroProdutos || erroMercados || erroComprasExistentes) {
      setImportando(false);
      mostrarToast(mensagemErroSupabase(erroProdutos || erroMercados || erroComprasExistentes)!);
      return;
    }

    // produto = nome + marca juntos, não só nome — "Azeite Galo" e "Azeite
    // Herdade dos Coteis" são produtos diferentes de verdade, com preços
    // diferentes; tratar como um produto só embaralha o histórico de preço
    const chaveProduto = (nome: string, marca: string) => `${nome.trim().toLowerCase()}|${marca.trim().toLowerCase()}`;
    const produtoPorChave = new Map(
      (produtosExistentes ?? []).map((p) => [chaveProduto(p.nome, p.marca ?? ""), p.id as string])
    );
    const mercadoPorNome = new Map(
      (mercadosExistentes ?? []).map((m) => [m.nome.trim().toLowerCase(), m.id as string])
    );

    const novosProdutos: { id: string; nome: string; marca: string | null; categoria: string }[] = [];
    const novosMercados: { id: string; nome: string }[] = [];

    validas.forEach((l) => {
      const chaveP = chaveProduto(l.nome, l.marca);
      if (!produtoPorChave.has(chaveP)) {
        const id = crypto.randomUUID();
        produtoPorChave.set(chaveP, id);
        novosProdutos.push({ id, nome: l.nome, marca: l.marca || null, categoria: l.categoria || "Outros" });
      }
      const chaveMercado = l.mercado.trim().toLowerCase();
      if (!mercadoPorNome.has(chaveMercado)) {
        const id = crypto.randomUUID();
        mercadoPorNome.set(chaveMercado, id);
        novosMercados.push({ id, nome: l.mercado });
      }
    });

    if (novosMercados.length > 0) {
      const { error } = await supabase.from("mercados").insert(novosMercados);
      if (error) {
        setImportando(false);
        mostrarToast(mensagemErroSupabase(error)!);
        return;
      }
    }
    if (novosProdutos.length > 0) {
      const { error } = await supabase.from("produtos").insert(novosProdutos);
      if (error) {
        setImportando(false);
        mostrarToast(mensagemErroSupabase(error)!);
        return;
      }
    }

    // deduplica contra compras que já existem no banco (reimportar o mesmo
    // cupom duas vezes não deve dobrar a compra) e contra linhas repetidas
    // dentro do próprio arquivo — nunca contra outra compra em data
    // diferente, que é uma compra de verdade e precisa virar linha nova
    const chaveCompra = (produtoId: string, mercadoId: string, data: string, quantidade: number, preco: number) =>
      `${produtoId}|${mercadoId}|${data}|${quantidade}|${preco.toFixed(2)}`;
    const chavesExistentes = new Set(
      (comprasExistentes ?? [])
        .filter((c) => c.produto_id)
        .map((c) => chaveCompra(c.produto_id!, c.mercado_id, c.data_compra, c.quantidade, c.preco_unitario))
    );

    let puladasPorDuplicidade = 0;
    const novasCompras: {
      produto_id: string;
      mercado_id: string;
      quantidade: number;
      preco_unitario: number;
      preco_total: number;
      data_compra: string;
    }[] = [];

    validas.forEach((l) => {
      const produtoId = produtoPorChave.get(chaveProduto(l.nome, l.marca))!;
      const mercadoId = mercadoPorNome.get(l.mercado.trim().toLowerCase())!;
      const precoUnitario = Math.round((l.precoUnitario ?? 0) * 100) / 100;
      const chave = chaveCompra(produtoId, mercadoId, l.data, l.quantidade, precoUnitario);
      if (chavesExistentes.has(chave)) {
        puladasPorDuplicidade++;
        return;
      }
      chavesExistentes.add(chave);
      novasCompras.push({
        produto_id: produtoId,
        mercado_id: mercadoId,
        quantidade: l.quantidade,
        preco_unitario: precoUnitario,
        preco_total: Math.round((l.precoTotal ?? 0) * 100) / 100,
        data_compra: l.data,
      });
    });

    if (novasCompras.length > 0) {
      const { error: erroCompras } = await supabase.from("compras").insert(novasCompras);
      if (erroCompras) {
        setImportando(false);
        mostrarToast(mensagemErroSupabase(erroCompras)!);
        return;
      }
    }
    setImportando(false);

    const partes = [`${novasCompras.length} ${novasCompras.length === 1 ? "compra importada" : "compras importadas"}`];
    if (puladasPorDuplicidade > 0) {
      partes.push(`${puladasPorDuplicidade} já existiam e foram ignoradas`);
    }
    mostrarToast(partes.join(" · "));
    onFechar();
  }

  const linhas: LinhaImportada[] = resultado && "linhas" in resultado ? resultado.linhas : [];
  const totalErros = linhas.filter((l) => l.erros.length > 0).length;
  const totalValidas = linhas.filter((l) => l.erros.length === 0).length;

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div
        className="bg-surface w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <p className="font-medium">Importar compras</p>
          <button onClick={onFechar} className="p-1 text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!resultado && (
            <>
              <p className="text-sm text-muted">
                Cole abaixo uma tabela com colunas de produto, mercado, data, quantidade e preço — do jeito que sai
                quando você pede pra transformar o PDF do cupom em tabela. Ou envie um arquivo .csv.
              </p>
              <p className="text-xs text-muted">
                Cabeçalhos aceitos: Produto (ou Item), Marca, Categoria, Mercado, Data, Quantidade, Preço Unitário,
                Preço Total.
              </p>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={EXEMPLO}
                rows={7}
                className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-xs font-data resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border border-border rounded-full py-2.5 text-sm font-medium text-muted"
                >
                  Escolher arquivo .csv
                </button>
                <button
                  onClick={processar}
                  disabled={!texto.trim()}
                  className="flex-1 btn-accent rounded-full py-2.5 text-sm font-medium disabled:opacity-30"
                >
                  Analisar
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv,.txt,.tsv" onChange={lerArquivo} className="hidden" />
            </>
          )}

          {resultado && "erro" in resultado && (
            <div className="text-center py-8">
              <p className="text-sm text-danger mb-4">{resultado.erro}</p>
              <button onClick={() => setResultado(null)} className="text-sm text-muted underline">
                Tentar de novo
              </button>
            </div>
          )}

          {resultado && "linhas" in resultado && (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">
                  <span className="font-medium text-text">{totalValidas}</span> prontas pra importar
                  {totalErros > 0 && <span className="text-warning"> · {totalErros} com problema</span>}
                </span>
                <button onClick={() => setResultado(null)} className="text-muted underline">
                  Editar texto
                </button>
              </div>
              <div className="border border-border rounded-xl max-h-64 overflow-y-auto divide-y divide-border">
                {linhas.map((l, i) => (
                  <div key={i} className={`px-3 py-2 text-xs ${l.erros.length > 0 ? "bg-warning-bg" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate pr-2">{l.nome || `(linha ${l.linha} sem nome)`}</span>
                      <span className="font-data text-muted flex-shrink-0">
                        {l.precoUnitario !== null ? formatBRL(l.precoUnitario) : "—"}
                      </span>
                    </div>
                    <div className="text-muted mt-0.5">
                      {l.mercado || "sem mercado"} · {l.data ? formatDataBR(l.data) : "sem data"} · {l.quantidade}x
                      {l.erros.length > 0 && <span className="text-warning ml-1">({l.erros.join(", ")})</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={confirmarImportacao}
                disabled={totalValidas === 0 || importando}
                className="w-full btn-accent rounded-full py-3 text-sm font-medium disabled:opacity-30"
              >
                {importando ? "Importando..." : `Importar ${totalValidas} ${totalValidas === 1 ? "compra" : "compras"}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
