import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { CATEGORIAS } from "@/lib/categorias";

export const maxDuration = 60;

type ItemEntrada = { codigo: string; descricao: string; unidade: string };
type CatalogoItem = { nome: string; marca: string | null };

const INSTRUCOES = `Você organiza os itens de uma nota fiscal de supermercado brasileira para um app de controle doméstico.
As descrições da nota são abreviadas em CAIXA ALTA (ex: "MILHO VDE PREDILECTA 170GR LT", "LAS PIF PAF 600G BOL").
Para cada item devolva:
- nome: nome do produto em português, SEM a marca, legível e no estilo "Milho verde em lata", "Leite integral", "Lasanha bolonhesa", "Óleo de soja". Sem peso/volume no nome. Não inclua sabor/variação quando for só uma variação da mesma coisa (ex: refresco em pó de sabores diferentes = "Refresco em pó"), mas mantenha o que muda de fato o produto (ex: "Lasanha de frango" x "Lasanha bolonhesa").
- marca: só a marca, com a grafia correta (ex: "Pif Paf", "Nestlé", "Predilecta"). Vazio "" para hortifruti a granel e itens sem marca.
- categoria: exatamente uma destas: ${CATEGORIAS.join(", ")}.
- peso_volume: tamanho da embalagem quando aparece na descrição (ex: "170g", "1L", "5kg"), senão "".
REGRA IMPORTANTE: se o item for o mesmo produto de algum do CATÁLOGO já existente, use exatamente o mesmo nome e a mesma marca do catálogo (isso evita cadastrar duplicado). Só invente nome novo quando não existir equivalente.
Devolva um resultado para CADA item recebido, usando o mesmo "codigo".`;

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Sessão expirada. Entre de novo." }, { status: 401 });

  const chave = process.env.ANTHROPIC_API_KEY;
  if (!chave) return NextResponse.json({ erro: "sem_chave" }, { status: 503 });

  const { itens, catalogo } = (await request.json().catch(() => ({}))) as {
    itens?: ItemEntrada[];
    catalogo?: CatalogoItem[];
  };
  if (!Array.isArray(itens) || itens.length === 0 || itens.length > 200) {
    return NextResponse.json({ erro: "Lista de itens inválida." }, { status: 400 });
  }

  const catalogoTexto = (catalogo ?? [])
    .slice(0, 800)
    .map((p) => (p.marca ? `${p.nome} | ${p.marca}` : p.nome))
    .join("\n");
  const itensTexto = itens.map((i) => `${i.codigo} | ${i.descricao} | ${i.unidade}`).join("\n");

  const resposta = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: AbortSignal.timeout(55000),
    headers: { "content-type": "application/json", "x-api-key": chave, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      system: INSTRUCOES,
      tools: [
        {
          name: "registrar_itens",
          description: "Registra a interpretação de cada item da nota.",
          input_schema: {
            type: "object",
            properties: {
              itens: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    codigo: { type: "string" },
                    nome: { type: "string" },
                    marca: { type: "string" },
                    categoria: { type: "string" },
                    peso_volume: { type: "string" },
                  },
                  required: ["codigo", "nome", "marca", "categoria", "peso_volume"],
                },
              },
            },
            required: ["itens"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "registrar_itens" },
      messages: [
        {
          role: "user",
          content: `CATÁLOGO (nome | marca):\n${catalogoTexto || "(vazio)"}\n\nITENS DA NOTA (código | descrição | unidade):\n${itensTexto}`,
        },
      ],
    }),
  }).catch(() => null);

  if (!resposta || !resposta.ok) {
    return NextResponse.json({ erro: "Não consegui interpretar os itens agora." }, { status: 502 });
  }
  const json = (await resposta.json()) as { content?: { type: string; input?: { itens?: unknown[] } }[] };
  const bruto = json.content?.find((c) => c.type === "tool_use")?.input?.itens;
  if (!Array.isArray(bruto)) return NextResponse.json({ erro: "Resposta inesperada da IA." }, { status: 502 });

  const resultado = (bruto as Record<string, string>[]).map((r) => ({
    codigo: String(r.codigo ?? ""),
    nome: String(r.nome ?? "").trim(),
    marca: String(r.marca ?? "").trim(),
    categoria: CATEGORIAS.includes(r.categoria) ? r.categoria : "Outros",
    peso_volume: String(r.peso_volume ?? "").trim(),
  }));
  return NextResponse.json({ itens: resultado });
}
