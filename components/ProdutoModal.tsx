"use client";

import { useState } from "react";
import { Barcode, Camera, Repeat, Trash2, X } from "lucide-react";
import { CATEGORIAS } from "@/lib/categorias";
import HistoricoPrecoProduto from "@/components/HistoricoPrecoProduto";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";
import type { Compra, Produto } from "@/lib/types";

export type FormProduto = {
  nome: string;
  marca: string;
  peso_volume: string;
  categoria: string;
  codigo_barras: string;
  estoque_atual: number;
  estoque_minimo: number;
  ultima_compra_data: string;
  unidade_consumo: string;
  quantidade_unidade_consumo: number;
};

type Modo = "form" | "substituir" | "excluir";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted mb-1 block">{label}</span>
      {children}
    </label>
  );
}

export default function ProdutoModal({
  produto,
  outrosProdutos,
  compras,
  onSalvar,
  onExcluir,
  onSubstituir,
  onFechar,
}: {
  produto: Produto | null; // null = criar novo
  outrosProdutos: Produto[];
  compras: Compra[];
  onSalvar: (form: FormProduto) => void;
  onExcluir: (() => void) | null;
  onSubstituir: ((destinoId: string) => void) | null;
  onFechar: () => void;
}) {
  const [form, setForm] = useState<FormProduto>(() => ({
    nome: produto?.nome ?? "",
    marca: produto?.marca ?? "",
    peso_volume: produto?.peso_volume ?? "",
    categoria: produto?.categoria ?? "Outros",
    codigo_barras: produto?.codigo_barras ?? "",
    estoque_atual: produto?.estoque_atual ?? 0,
    estoque_minimo: produto?.estoque_minimo ?? 0,
    ultima_compra_data: produto?.ultima_compra_data ?? "",
    unidade_consumo: produto?.unidade_consumo ?? "",
    quantidade_unidade_consumo: produto?.quantidade_unidade_consumo ?? 1,
  }));
  const [modo, setModo] = useState<Modo>("form");
  const [destinoId, setDestinoId] = useState("");
  const [scannerAberto, setScannerAberto] = useState(false);

  function campo<K extends keyof FormProduto>(k: K, v: FormProduto[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function confirmarSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    onSalvar(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div
        className="bg-surface w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <p className="font-medium">{produto ? "Editar produto" : "Novo produto"}</p>
          <button onClick={onFechar} className="p-1 text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        {modo === "form" && (
          <form onSubmit={confirmarSalvar} className="p-5 space-y-4">
            <Campo label="Nome do produto">
              <input
                required
                value={form.nome}
                onChange={(e) => campo("nome", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
              />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Marca">
                <input
                  value={form.marca}
                  onChange={(e) => campo("marca", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
                />
              </Campo>
              <Campo label="Peso / volume">
                <input
                  value={form.peso_volume}
                  onChange={(e) => campo("peso_volume", e.target.value)}
                  placeholder="ex: 500g, 1L"
                  className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
                />
              </Campo>
            </div>
            <Campo label="Categoria">
              <select
                value={form.categoria}
                onChange={(e) => campo("categoria", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Código de barras">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Barcode size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    value={form.codigo_barras}
                    onChange={(e) => campo("codigo_barras", e.target.value)}
                    placeholder="Números do código"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-bg border border-border text-sm font-data"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setScannerAberto(true)}
                  aria-label="Ler código de barras com a câmera"
                  className="p-2.5 rounded-lg border border-border text-muted hover:text-text flex-shrink-0"
                >
                  <Camera size={16} />
                </button>
              </div>
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Unidade de consumo (opcional)">
                <input
                  value={form.unidade_consumo}
                  onChange={(e) => campo("unidade_consumo", e.target.value)}
                  placeholder="ex: rolo, unidade"
                  className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
                />
              </Campo>
              <Campo label="Unidades por embalagem">
                <input
                  type="number"
                  min={1}
                  value={form.quantidade_unidade_consumo}
                  onChange={(e) => campo("quantidade_unidade_consumo", Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm font-data"
                />
              </Campo>
            </div>
            {form.unidade_consumo.trim() && form.quantidade_unidade_consumo > 1 && (
              <p className="text-xs text-muted -mt-2">
                O estoque abaixo é contado em {form.unidade_consumo}. Cada embalagem comprada dá pra somar{" "}
                {form.quantidade_unidade_consumo} de uma vez, com o botão de reposição rápida no Estoque.
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Campo label={form.unidade_consumo.trim() ? `Quantidade em estoque (${form.unidade_consumo})` : "Quantidade em estoque"}>
                <input
                  type="number"
                  value={form.estoque_atual}
                  onChange={(e) => campo("estoque_atual", Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm font-data"
                />
              </Campo>
              <Campo label={form.unidade_consumo.trim() ? `Estoque mínimo (${form.unidade_consumo})` : "Estoque mínimo"}>
                <input
                  type="number"
                  value={form.estoque_minimo}
                  onChange={(e) => campo("estoque_minimo", Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm font-data"
                />
              </Campo>
            </div>
            <Campo label="Data da última compra">
              <input
                type="date"
                value={form.ultima_compra_data}
                onChange={(e) => campo("ultima_compra_data", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm font-data"
              />
            </Campo>

            {produto && <HistoricoPrecoProduto produtoId={produto.id} compras={compras} />}

            <button type="submit" className="w-full btn-accent rounded-full py-3 text-sm font-medium mt-2">
              Salvar
            </button>

            {produto && (
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModo("substituir")}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-border rounded-full py-2.5 text-xs font-medium text-muted"
                >
                  <Repeat size={13} /> Substituir
                </button>
                <button
                  type="button"
                  onClick={() => setModo("excluir")}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-danger/40 rounded-full py-2.5 text-xs font-medium text-danger"
                >
                  <Trash2 size={13} /> Excluir
                </button>
              </div>
            )}
          </form>
        )}

        {modo === "substituir" && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted">
              Escolha outro produto já cadastrado. Todo o histórico de compras de{" "}
              <span className="font-medium text-text">{produto?.nome}</span> passa a pertencer a ele, e esse produto
              é removido.
            </p>
            <select
              value={destinoId}
              onChange={(e) => setDestinoId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
            >
              <option value="">Selecione um produto</option>
              {outrosProdutos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModo("form")}
                className="flex-1 border border-border rounded-full py-2.5 text-sm font-medium"
              >
                Voltar
              </button>
              <button
                disabled={!destinoId}
                onClick={() => onSubstituir?.(destinoId)}
                className="flex-1 btn-accent rounded-full py-2.5 text-sm font-medium disabled:opacity-30"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

        {modo === "excluir" && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted">
              Excluir <span className="font-medium text-text">{produto?.nome}</span>? O histórico de compras
              continua registrado (sem esse produto associado), mas ele some da lista e do estoque. Isso não pode ser
              desfeito.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModo("form")}
                className="flex-1 border border-border rounded-full py-2.5 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => onExcluir?.()}
                className="flex-1 bg-danger text-white rounded-full py-2.5 text-sm font-medium"
              >
                Excluir
              </button>
            </div>
          </div>
        )}
      </div>

      {scannerAberto && (
        <BarcodeScannerModal
          onDetectado={(codigo) => {
            campo("codigo_barras", codigo);
            setScannerAberto(false);
          }}
          onFechar={() => setScannerAberto(false)}
        />
      )}
    </div>
  );
}
