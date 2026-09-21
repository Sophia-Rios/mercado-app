"use client";

import { useMemo, useRef, useState } from "react";
import { Camera, Check, FileUp, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { gravarCompras } from "@/lib/import-db";
import { mensagemErroSupabase } from "@/lib/supabase-error";
import { CATEGORIAS } from "@/lib/categorias";
import { formatBRL, formatDataBR } from "@/lib/format";
import { parseNotaTexto, type NotaFiscal } from "@/lib/nfce";
import { extrairTextoPdf } from "@/lib/pdf-texto";
import { acharCategoria, acharMarca, buscarNoCatalogo, extrairPeso, limparNome } from "@/lib/nfce-heuristica";
import type { LinhaImportada } from "@/lib/import-compras";
import { useToast } from "@/components/ToastProvider";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";

type Linha = {
  id: string;
  codigos: string[];
  descricao: string;
  produtoId: string | null; // já conhecido pelo código do mercado
  nome: string;
  marca: string;
  categoria: string;
  pesoVolume: string;
  quantidade: number;
  total: number;
  incluir: boolean;
  interpretado: boolean; // false = caiu no fallback (sem IA), vale revisar com mais atenção
};

type Passo = "ler" | "lendo" | "revisar";

const arredondar = (n: number) => Math.round(n * 100) / 100;

function titulo(s: string) {
  return s
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase())
    .trim();
}

export default function ImportarNotaModal({ onFechar }: { onFechar: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const mostrarToast = useToast();

  const [passo, setPasso] = useState<Passo>("ler");
  const [entrada, setEntrada] = useState("");
  const [scannerAberto, setScannerAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarColar, setMostrarColar] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [mensagemLendo, setMensagemLendo] = useState("Lendo a nota...");
  const [avisoIA, setAvisoIA] = useState<string | null>(null);

  const [nota, setNota] = useState<NotaFiscal | null>(null);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [mercados, setMercados] = useState<{ id: string; nome: string; cnpj: string | null }[]>([]);
  const [mercadoEscolhido, setMercadoEscolhido] = useState<string>("novo");
  const [nomeNovoMercado, setNomeNovoMercado] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function processar(fonte: { arquivo?: File; texto?: string }) {
    setErro(null);
    setPasso("lendo");
    setMensagemLendo("Lendo a nota...");

    let texto = fonte.texto ?? "";
    if (fonte.arquivo) {
      try {
        texto = await extrairTextoPdf(fonte.arquivo);
      } catch {
        setErro("Não consegui abrir esse PDF. Confira se é o PDF da nota fiscal.");
        setPasso("ler");
        return;
      }
    }
    const resultadoLeitura = parseNotaTexto(texto);
    if ("erro" in resultadoLeitura) {
      setErro("Não achei os itens da nota nesse arquivo. Confira se é o PDF (ou o texto) da nota fiscal completa.");
      setPasso("ler");
      return;
    }
    const lida: NotaFiscal = resultadoLeitura;

    // nota já importada antes?
    if (lida.chave) {
      const { data: jaImportada } = await supabase
        .from("notas_fiscais")
        .select("importada_em, data_emissao")
        .eq("chave", lida.chave)
        .maybeSingle();
      if (jaImportada) {
        setErro(`Essa nota (de ${formatDataBR(jaImportada.data_emissao)}) já foi importada antes.`);
        setPasso("ler");
        return;
      }
    }

    const [{ data: mercadosBanco }, { data: produtosBanco }] = await Promise.all([
      supabase.from("mercados").select("id, nome, cnpj"),
      supabase.from("produtos").select("id, nome, marca, categoria"),
    ]);
    const listaMercados = mercadosBanco ?? [];
    const mercadoConhecido = listaMercados.find((m) => m.cnpj && m.cnpj === lida.emitente.cnpj);

    let codigosConhecidos = new Map<string, string>();
    if (mercadoConhecido) {
      const { data } = await supabase
        .from("codigos_mercado")
        .select("codigo, produto_id")
        .eq("mercado_id", mercadoConhecido.id);
      codigosConhecidos = new Map((data ?? []).map((c) => [c.codigo as string, c.produto_id as string]));
    }
    const marcasConhecidas = Array.from(
      new Set((produtosBanco ?? []).map((p) => ((p.marca as string | null) ?? "").trim()).filter(Boolean))
    );
    const produtoPorId = new Map((produtosBanco ?? []).map((p) => [p.id as string, p]));

    // a nota repete a linha a cada unidade — junta por código do mercado
    const porCodigo = new Map<string, { descricao: string; unidade: string; quantidade: number; total: number }>();
    lida.itens.forEach((i) => {
      const atual = porCodigo.get(i.codigo);
      if (atual) {
        atual.quantidade += i.quantidade;
        atual.total += i.total;
      } else {
        porCodigo.set(i.codigo, { descricao: i.descricao, unidade: i.unidade, quantidade: i.quantidade, total: i.total });
      }
    });

    const desconhecidos = Array.from(porCodigo.entries())
      .filter(([codigo]) => !codigosConhecidos.has(codigo) || !produtoPorId.has(codigosConhecidos.get(codigo)!))
      .map(([codigo, i]) => ({ codigo, descricao: i.descricao, unidade: i.unidade }));

    const interpretados = new Map<string, { nome: string; marca: string; categoria: string; peso_volume: string }>();
    let aviso: string | null = null;
    if (desconhecidos.length > 0) {
      setMensagemLendo(`Interpretando ${desconhecidos.length} itens...`);
      const resIA = await fetch("/api/nfce/interpretar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          itens: desconhecidos,
          catalogo: (produtosBanco ?? []).map((p) => ({ nome: p.nome, marca: p.marca })),
        }),
      }).catch(() => null);
      const jsonIA = resIA ? await resIA.json().catch(() => null) : null;
      if (resIA?.ok && jsonIA?.itens) {
        (jsonIA.itens as { codigo: string; nome: string; marca: string; categoria: string; peso_volume: string }[]).forEach(
          (r) => interpretados.set(r.codigo, r)
        );
      } else {
        aviso =
          jsonIA?.erro === "sem_chave"
            ? "Modo manual: nomes, marca, peso e categoria foram deduzidos pelo app (reaproveitando seus produtos). Revise os itens — o que você corrigir aqui o app lembra nas próximas notas."
            : "Não consegui interpretar os itens automaticamente. Os nomes vieram direto da nota — revise antes de confirmar.";
      }
    }

    const novasLinhas: Linha[] = Array.from(porCodigo.entries()).map(([codigo, i]) => {
      const produtoId = codigosConhecidos.get(codigo);
      const produto = produtoId ? produtoPorId.get(produtoId) : undefined;
      if (produto) {
        return {
          id: codigo,
          codigos: [codigo],
          descricao: i.descricao,
          produtoId: produto.id as string,
          nome: produto.nome as string,
          marca: (produto.marca as string | null) ?? "",
          categoria: produto.categoria as string,
          pesoVolume: "",
          quantidade: i.quantidade,
          total: arredondar(i.total),
          incluir: true,
          interpretado: true,
        };
      }
      const ia = interpretados.get(codigo);
      // sem IA: deduz peso, marca (entre as já cadastradas) e categoria por regras
      const pesoRegra = extrairPeso(i.descricao);
      const marcaRegra = acharMarca(i.descricao, marcasConhecidas);
      const igual = ia ? null : buscarNoCatalogo(i.descricao, marcaRegra, produtosBanco ?? []);
      return {
        id: codigo,
        codigos: [codigo],
        descricao: i.descricao,
        produtoId: null,
        nome: ia?.nome || igual?.nome || limparNome(i.descricao, marcaRegra, pesoRegra) || titulo(i.descricao),
        marca: ia ? ia.marca : marcaRegra,
        categoria: ia ? ia.categoria : (igual?.categoria ?? acharCategoria(i.descricao, i.unidade)),
        pesoVolume: ia ? ia.peso_volume : pesoRegra,
        quantidade: i.quantidade,
        total: arredondar(i.total),
        incluir: true,
        interpretado: !!ia,
      };
    });

    setNota(lida);
    setLinhas(novasLinhas);
    setMercados(listaMercados);
    setMercadoEscolhido(mercadoConhecido?.id ?? "novo");
    setNomeNovoMercado(titulo(lida.emitente.razaoSocial));
    setAvisoIA(aviso);
    setPasso("revisar");
  }

  function iniciarLeitura() {
    const texto = entrada.trim();
    if (texto) processar({ texto });
  }

  function escolherPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (arquivo) processar({ arquivo });
    e.target.value = "";
  }

  function atualizar(id: string, campos: Partial<Linha>) {
    setLinhas((ls) => ls.map((l) => (l.id === id ? { ...l, ...campos } : l)));
  }

  const incluidas = linhas.filter((l) => l.incluir);
  const somaItens = arredondar(incluidas.reduce((s, l) => s + l.total, 0));
  const nomeMercadoFinal =
    mercadoEscolhido === "novo"
      ? nomeNovoMercado.trim()
      : (mercados.find((m) => m.id === mercadoEscolhido)?.nome ?? "");
  const totalConfere = nota?.totalNota != null && Math.abs(nota.totalNota - somaItens) < 0.05;
  const podeConfirmar = incluidas.length > 0 && incluidas.every((l) => l.nome.trim()) && !!nomeMercadoFinal && !!nota;

  async function confirmar() {
    if (!nota || !podeConfirmar) return;
    setSalvando(true);
    try {
      // 1. mercado (cria com CNPJ, ou grava o CNPJ no existente pra reconhecer da próxima vez)
      let mercadoId = mercadoEscolhido;
      if (mercadoEscolhido === "novo") {
        mercadoId = crypto.randomUUID();
        const { error } = await supabase
          .from("mercados")
          .insert({ id: mercadoId, nome: nomeMercadoFinal, cnpj: nota.emitente.cnpj || null });
        if (error) throw new Error(mensagemErroSupabase(error)!);
      } else {
        const existente = mercados.find((m) => m.id === mercadoEscolhido);
        if (existente && !existente.cnpj && nota.emitente.cnpj) {
          const { error } = await supabase.from("mercados").update({ cnpj: nota.emitente.cnpj }).eq("id", mercadoId);
          if (error) throw new Error(mensagemErroSupabase(error)!);
        }
      }

      // 2. junta linhas que viram o mesmo produto ao mesmo preço (ex: sabores
      // de um mesmo refresco) — duas compras idênticas no mesmo dia seriam
      // tratadas como duplicata pela proteção da importação
      const grupos = new Map<string, { linha: LinhaImportada; codigos: string[] }>();
      incluidas.forEach((l) => {
        const unitario = arredondar(l.total / l.quantidade);
        const chave = `${l.produtoId ?? `${l.nome.trim().toLowerCase()}|${l.marca.trim().toLowerCase()}`}|${unitario}`;
        const g = grupos.get(chave);
        if (g) {
          g.linha.quantidade += l.quantidade;
          g.linha.precoTotal = arredondar((g.linha.precoTotal ?? 0) + l.total);
          g.codigos.push(...l.codigos);
        } else {
          grupos.set(chave, {
            codigos: [...l.codigos],
            linha: {
              linha: 0,
              nome: l.nome.trim(),
              marca: l.marca.trim(),
              categoria: l.categoria,
              mercado: nomeMercadoFinal,
              data: nota.data,
              quantidade: l.quantidade,
              precoUnitario: unitario,
              precoTotal: l.total,
              erros: [],
              pesoVolume: l.pesoVolume,
              produtoId: l.produtoId ?? undefined,
            },
          });
        }
      });
      const lista = Array.from(grupos.values());

      // 3. grava compras + produtos novos
      const { importadas, puladas, produtoIds } = await gravarCompras(
        supabase,
        lista.map((g) => g.linha)
      );

      // 4. memoriza código -> produto e marca a nota como importada
      const codigosParaSalvar = lista.flatMap((g, i) =>
        g.codigos.map((codigo) => ({ mercado_id: mercadoId, codigo, produto_id: produtoIds[i] }))
      );
      if (codigosParaSalvar.length > 0) {
        const { error } = await supabase.from("codigos_mercado").upsert(codigosParaSalvar);
        if (error) throw new Error(mensagemErroSupabase(error)!);
      }
      if (nota.chave) {
        const { error } = await supabase.from("notas_fiscais").upsert({
          chave: nota.chave,
          mercado_id: mercadoId,
          data_emissao: nota.data,
          valor_total: nota.totalNota,
        });
        if (error) throw new Error(mensagemErroSupabase(error)!);
      }

      const partes = [`${importadas} ${importadas === 1 ? "compra importada" : "compras importadas"}`];
      if (puladas > 0) partes.push(`${puladas} já existiam`);
      mostrarToast(partes.join(" · "));
      onFechar();
    } catch (e) {
      mostrarToast(e instanceof Error ? e.message : "Não consegui importar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div
        className="bg-surface w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <p className="font-medium">Importar nota fiscal</p>
          <button onClick={onFechar} className="p-1 text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        {passo === "ler" && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted">
              Salve a nota fiscal como PDF e envie aqui. O app lê os itens e organiza nome, marca e categoria pra você só
              conferir.
            </p>
            <ol className="text-xs text-muted space-y-1 list-decimal pl-4">
              <li>Leia o QR Code da nota (abre o site da Fazenda) e resolva a verificação.</li>
              <li>Na nota aberta, use Imprimir → Salvar como PDF.</li>
              <li>Volte aqui e envie o PDF.</li>
            </ol>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setScannerAberto(true)}
                className="border border-border rounded-full py-3 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Camera size={16} /> Ler QR Code
              </button>
              <button
                onClick={() => pdfInputRef.current?.click()}
                className="btn-accent rounded-full py-3 text-sm font-medium flex items-center justify-center gap-2"
              >
                <FileUp size={16} /> Enviar PDF
              </button>
            </div>
            <input ref={pdfInputRef} type="file" accept="application/pdf,.pdf" onChange={escolherPdf} className="hidden" />
            {erro && <p className="text-sm text-danger">{erro}</p>}

            {!mostrarColar ? (
              <button onClick={() => setMostrarColar(true)} className="text-xs text-muted underline">
                Prefiro colar o texto da nota
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted">Copie todo o texto da página da nota e cole aqui.</p>
                <textarea
                  value={entrada}
                  onChange={(e) => setEntrada(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-xs font-data resize-none"
                />
                <button
                  onClick={iniciarLeitura}
                  disabled={!entrada.trim()}
                  className="w-full border border-border rounded-full py-2.5 text-sm font-medium disabled:opacity-30"
                >
                  Ler nota
                </button>
              </div>
            )}
          </div>
        )}

        {passo === "lendo" && (
          <div className="p-10 text-center">
            <p className="text-sm text-muted">{mensagemLendo}</p>
          </div>
        )}

        {passo === "revisar" && nota && (
          <div className="p-5 space-y-4">
            <div className="text-sm">
              <p className="font-medium">{nota.emitente.razaoSocial || "Mercado"}</p>
              <p className="text-xs text-muted">Compra de {formatDataBR(nota.data)}</p>
            </div>

            <label className="block">
              <span className="text-xs text-muted mb-1 block">Mercado no app</span>
              <select
                value={mercadoEscolhido}
                onChange={(e) => setMercadoEscolhido(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
              >
                {mercados.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
                <option value="novo">+ Cadastrar como novo mercado</option>
              </select>
              {mercadoEscolhido === "novo" && (
                <input
                  value={nomeNovoMercado}
                  onChange={(e) => setNomeNovoMercado(e.target.value)}
                  placeholder="Nome do mercado"
                  className="w-full mt-2 px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
                />
              )}
            </label>

            {avisoIA && <p className="text-xs text-warning bg-warning-bg rounded-lg px-3 py-2">{avisoIA}</p>}

            <div
              className={`text-xs rounded-lg px-3 py-2 ${
                totalConfere ? "text-success bg-success-bg" : "text-warning bg-warning-bg"
              }`}
            >
              {totalConfere ? (
                <>
                  Soma dos itens {formatBRL(somaItens)} confere com o total da nota.
                </>
              ) : (
                <>
                  Soma dos itens {formatBRL(somaItens)}
                  {nota.totalNota != null ? ` · total da nota ${formatBRL(nota.totalNota)}` : ""}. Confira se algum item
                  ficou de fora ou foi removido.
                </>
              )}
            </div>

            <div className="space-y-2">
              {linhas.map((l) => (
                <div
                  key={l.id}
                  className={`border border-border rounded-xl p-3 space-y-2 ${l.incluir ? "" : "opacity-40"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] text-muted font-data truncate">{l.descricao}</p>
                    <button
                      onClick={() => atualizar(l.id, { incluir: !l.incluir })}
                      className="text-muted hover:text-danger flex-shrink-0"
                      title={l.incluir ? "Não importar esse item" : "Importar esse item"}
                    >
                      {l.incluir ? <X size={14} /> : <Check size={14} />}
                    </button>
                  </div>
                  {l.produtoId ? (
                    <p className="text-sm">
                      <span className="font-medium">{l.nome}</span>
                      {l.marca && <span className="text-muted"> · {l.marca}</span>}{" "}
                      <span className="text-[10px] text-success bg-success-bg px-1.5 py-0.5 rounded-full">
                        já conhecido
                      </span>
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={l.nome}
                        onChange={(e) => atualizar(l.id, { nome: e.target.value })}
                        placeholder="Produto"
                        className={`col-span-2 px-2.5 py-2 rounded-lg bg-bg border text-sm ${
                          l.interpretado ? "border-border" : "border-warning/50"
                        }`}
                      />
                      <input
                        value={l.marca}
                        onChange={(e) => atualizar(l.id, { marca: e.target.value })}
                        placeholder="Marca"
                        className="px-2.5 py-2 rounded-lg bg-bg border border-border text-sm"
                      />
                      <input
                        value={l.pesoVolume}
                        onChange={(e) => atualizar(l.id, { pesoVolume: e.target.value })}
                        placeholder="Peso / volume"
                        className="px-2.5 py-2 rounded-lg bg-bg border border-border text-sm"
                      />
                      <select
                        value={l.categoria}
                        onChange={(e) => atualizar(l.id, { categoria: e.target.value })}
                        className="col-span-2 px-2.5 py-2 rounded-lg bg-bg border border-border text-sm"
                      >
                        {CATEGORIAS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <p className="text-xs text-muted font-data">
                    {l.quantidade} × {formatBRL(l.total / l.quantidade)} = {formatBRL(l.total)}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={confirmar}
              disabled={!podeConfirmar || salvando}
              className="w-full btn-accent rounded-full py-3 text-sm font-medium disabled:opacity-30"
            >
              {salvando ? "Importando..." : `Importar ${incluidas.length} itens · ${formatBRL(somaItens)}`}
            </button>
          </div>
        )}
      </div>

      {scannerAberto && (
        <BarcodeScannerModal
          tipo="qr"
          onDetectado={(texto) => {
            setScannerAberto(false);
            if (/^https?:\/\//i.test(texto)) {
              window.open(texto, "_blank", "noopener");
              mostrarToast("Nota aberta. Salve como PDF e volte aqui pra enviar.");
            } else {
              setErro("Esse QR Code não parece ser de uma nota fiscal.");
            }
          }}
          onFechar={() => setScannerAberto(false)}
        />
      )}
    </div>
  );
}
