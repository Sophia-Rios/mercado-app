"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { mensagemErroSupabase } from "@/lib/supabase-error";
import { useToast } from "@/components/ToastProvider";
import type { Mercado, Produto } from "@/lib/types";

// registra uma nova remessa comprada de um produto já cadastrado (achado
// pelo código de barras): cria a compra no histórico de preço e já soma no
// estoque, em vez de deixar o usuário cadastrar o produto de novo do zero
export default function RegistrarCompraModal({
  produto,
  mercados,
  onFechar,
}: {
  produto: Produto;
  mercados: Mercado[];
  onFechar: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const mostrarToast = useToast();
  const [mercadoId, setMercadoId] = useState(mercados[0]?.id ?? "");
  // texto, não número: assim dá pra apagar o campo e digitar outro valor
  const [quantidadeTexto, setQuantidadeTexto] = useState("1");
  const [preco, setPreco] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [salvando, setSalvando] = useState(false);

  const quantidade = Number(quantidadeTexto.replace(",", "."));
  const porEmbalagem = produto.quantidade_unidade_consumo ?? 1;
  const precoNumero = Number(preco.replace(",", "."));
  const podeConfirmar = mercadoId && quantidade > 0 && precoNumero > 0 && data;

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    if (!podeConfirmar) return;
    setSalvando(true);

    const { error: erroCompra } = await supabase.from("compras").insert({
      produto_id: produto.id,
      mercado_id: mercadoId,
      quantidade,
      preco_unitario: precoNumero,
      preco_total: Math.round(precoNumero * quantidade * 100) / 100,
      data_compra: data,
    });
    if (erroCompra) {
      setSalvando(false);
      mostrarToast(mensagemErroSupabase(erroCompra)!);
      return;
    }

    const { error: erroProduto } = await supabase
      .from("produtos")
      .update({
        estoque_atual: produto.estoque_atual + quantidade * porEmbalagem,
        ultima_compra_data: data,
      })
      .eq("id", produto.id);
    setSalvando(false);
    if (erroProduto) {
      mostrarToast(mensagemErroSupabase(erroProduto)!);
      return;
    }
    mostrarToast("Remessa registrada e somada ao histórico de preço");
    onFechar();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div
        className="bg-surface w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <p className="font-medium">Nova remessa</p>
          <button onClick={onFechar} className="p-1 text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={confirmar} className="p-5 space-y-4">
          <p className="text-sm">
            Código já identificado como <span className="font-medium">{produto.nome}</span>
            {produto.marca ? ` (${produto.marca})` : ""}. Essa compra entra no histórico de preço desse produto.
          </p>

          {mercados.length === 0 ? (
            <p className="text-sm text-warning">
              Cadastre um mercado primeiro (na aba Mercados) pra poder registrar essa compra.
            </p>
          ) : (
            <label className="block">
              <span className="text-xs text-muted mb-1 block">Mercado</span>
              <select
                value={mercadoId}
                onChange={(e) => setMercadoId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
              >
                {mercados.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted mb-1 block">
                {porEmbalagem > 1 ? "Embalagens compradas" : "Quantidade"}
              </span>
              <input
                inputMode="decimal"
                value={quantidadeTexto}
                onChange={(e) => setQuantidadeTexto(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm font-data"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted mb-1 block">Preço pago (por embalagem)</span>
              <input
                inputMode="decimal"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm font-data"
              />
            </label>
          </div>

          {porEmbalagem > 1 && (
            <p className="text-xs text-muted -mt-2">
              Isso soma {quantidade * porEmbalagem} {produto.unidade_consumo ?? "unidades"} no estoque
              ({quantidade} × {porEmbalagem}).
            </p>
          )}

          <label className="block">
            <span className="text-xs text-muted mb-1 block">Data da compra</span>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm font-data"
            />
          </label>

          <button
            type="submit"
            disabled={!podeConfirmar || salvando}
            className="w-full btn-accent rounded-full py-3 text-sm font-medium mt-2 disabled:opacity-30"
          >
            {salvando ? "Salvando..." : "Registrar remessa"}
          </button>
        </form>
      </div>
    </div>
  );
}
