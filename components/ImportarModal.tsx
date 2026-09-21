"use client";

import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { parseTabela, type LinhaImportada, type ResultadoImportacao } from "@/lib/import-compras";
import { formatBRL, formatDataBR } from "@/lib/format";
import { gravarCompras } from "@/lib/import-db";
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
    try {
      const { importadas, puladas } = await gravarCompras(supabase, validas);
      const partes = [`${importadas} ${importadas === 1 ? "compra importada" : "compras importadas"}`];
      if (puladas > 0) partes.push(`${puladas} já existiam e foram ignoradas`);
      mostrarToast(partes.join(" · "));
      onFechar();
    } catch (e) {
      mostrarToast(e instanceof Error ? e.message : "Não consegui importar.");
    } finally {
      setImportando(false);
    }
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
