import type { SupabaseClient } from "@supabase/supabase-js";
import type { LinhaImportada } from "@/lib/import-compras";
import { mensagemErroSupabase } from "@/lib/supabase-error";

export type ResultadoGravacao = {
  importadas: number;
  // produtos cujo estoque foi somado (só a compra mais recente mexe no estoque)
  estoqueAtualizado: number;
  puladas: number;
  // produto_id de cada linha válida recebida (na mesma ordem)
  produtoIds: string[];
};

// produto = nome + marca juntos, não só nome — "Azeite Galo" e "Azeite
// Herdade dos Coteis" são produtos diferentes de verdade, com preços
// diferentes; tratar como um produto só embaralha o histórico de preço
const chaveProduto = (nome: string, marca: string) => `${nome.trim().toLowerCase()}|${marca.trim().toLowerCase()}`;

const chaveCompra = (produtoId: string, mercadoId: string, data: string, quantidade: number, preco: number) =>
  `${produtoId}|${mercadoId}|${data}|${quantidade}|${preco.toFixed(2)}`;

function falhar(error: unknown): never {
  throw new Error(mensagemErroSupabase(error as Parameters<typeof mensagemErroSupabase>[0])!);
}

export async function gravarCompras(supabase: SupabaseClient, validas: LinhaImportada[]): Promise<ResultadoGravacao> {
  const [
    { data: produtosExistentes, error: erroProdutos },
    { data: mercadosExistentes, error: erroMercados },
    { data: comprasExistentes, error: erroComprasExistentes },
  ] = await Promise.all([
    supabase.from("produtos").select("id, nome, marca"),
    supabase.from("mercados").select("id, nome"),
    supabase.from("compras").select("produto_id, mercado_id, data_compra, quantidade, preco_unitario"),
  ]);
  if (erroProdutos || erroMercados || erroComprasExistentes) falhar(erroProdutos || erroMercados || erroComprasExistentes);

  const produtoPorChave = new Map(
    (produtosExistentes ?? []).map((p) => [chaveProduto(p.nome, p.marca ?? ""), p.id as string])
  );
  const mercadoPorNome = new Map((mercadosExistentes ?? []).map((m) => [m.nome.trim().toLowerCase(), m.id as string]));

  const novosProdutos: {
    id: string;
    nome: string;
    marca: string | null;
    categoria: string;
    peso_volume: string | null;
  }[] = [];
  const novosMercados: { id: string; nome: string }[] = [];

  validas.forEach((l) => {
    if (!l.produtoId) {
      const chaveP = chaveProduto(l.nome, l.marca);
      if (!produtoPorChave.has(chaveP)) {
        const id = crypto.randomUUID();
        produtoPorChave.set(chaveP, id);
        novosProdutos.push({
          id,
          nome: l.nome,
          marca: l.marca || null,
          categoria: l.categoria || "Outros",
          peso_volume: l.pesoVolume || null,
        });
      }
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
    if (error) falhar(error);
  }
  if (novosProdutos.length > 0) {
    const { error } = await supabase.from("produtos").insert(novosProdutos);
    if (error) falhar(error);
  }

  // deduplica contra compras que já existem no banco (reimportar o mesmo
  // cupom duas vezes não deve dobrar a compra) e contra linhas repetidas
  // dentro do próprio arquivo — nunca contra outra compra em data
  // diferente, que é uma compra de verdade e precisa virar linha nova
  const chavesExistentes = new Set(
    (comprasExistentes ?? [])
      .filter((c) => c.produto_id)
      .map((c) => chaveCompra(c.produto_id!, c.mercado_id, c.data_compra, c.quantidade, c.preco_unitario))
  );

  let puladas = 0;
  const produtoIds: string[] = [];
  const novasCompras: {
    produto_id: string;
    mercado_id: string;
    quantidade: number;
    preco_unitario: number;
    preco_total: number;
    data_compra: string;
    peso_volume: string | null;
  }[] = [];

  validas.forEach((l) => {
    const produtoId = l.produtoId ?? produtoPorChave.get(chaveProduto(l.nome, l.marca))!;
    produtoIds.push(produtoId);
    const mercadoId = mercadoPorNome.get(l.mercado.trim().toLowerCase())!;
    const precoUnitario = Math.round((l.precoUnitario ?? 0) * 100) / 100;
    const chave = chaveCompra(produtoId, mercadoId, l.data, l.quantidade, precoUnitario);
    if (chavesExistentes.has(chave)) {
      puladas++;
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
      peso_volume: l.pesoVolume || null,
    });
  });

  // só a compra mais recente de todas (a data mais nova, inclusive contra o
  // histórico já salvo) soma no estoque — importar uma nota antiga não deve
  // inflar o que tem em casa hoje
  const dataMaisRecenteSalva = (comprasExistentes ?? []).reduce((m, c) => (c.data_compra > m ? c.data_compra : m), "");
  const dataMaisRecenteLote = novasCompras.reduce((m, c) => (c.data_compra > m ? c.data_compra : m), "");
  const aplicaEstoque = dataMaisRecenteLote !== "" && dataMaisRecenteLote >= dataMaisRecenteSalva;
  const comFlag = novasCompras.map((c) => ({
    ...c,
    estoque_aplicado: aplicaEstoque && c.data_compra === dataMaisRecenteLote,
  }));

  if (comFlag.length > 0) {
    const { error } = await supabase.from("compras").insert(comFlag);
    if (error) falhar(error);
  }

  const estoqueAtualizado = await somarNoEstoque(
    supabase,
    comFlag.filter((c) => c.estoque_aplicado).map((c) => ({ produtoId: c.produto_id, quantidade: c.quantidade }))
  );

  return { importadas: novasCompras.length, estoqueAtualizado, puladas, produtoIds };
}

// soma as quantidades compradas no estoque, em unidades de consumo
// (ex: 2 fardos de 12 rolos = +24 rolos)
async function somarNoEstoque(
  supabase: SupabaseClient,
  itens: { produtoId: string; quantidade: number }[]
): Promise<number> {
  if (itens.length === 0) return 0;
  const porProduto = new Map<string, number>();
  itens.forEach((i) => porProduto.set(i.produtoId, (porProduto.get(i.produtoId) ?? 0) + i.quantidade));

  const { data, error } = await supabase
    .from("produtos")
    .select("id, estoque_atual, quantidade_unidade_consumo")
    .in("id", Array.from(porProduto.keys()));
  if (error) falhar(error);

  const respostas = await Promise.all(
    (data ?? []).map((p) => {
      const adicional = (porProduto.get(p.id as string) ?? 0) * Number(p.quantidade_unidade_consumo ?? 1);
      const novo = Math.round((Number(p.estoque_atual) + adicional) * 1000) / 1000;
      return supabase.from("produtos").update({ estoque_atual: novo }).eq("id", p.id);
    })
  );
  const falha = respostas.find((r) => r.error);
  if (falha?.error) falhar(falha.error);
  return porProduto.size;
}

// aplica ao estoque a última compra já salva que ainda não entrou na conta
// (usado uma vez, pra dados importados antes dessa regra existir)
export async function aplicarUltimaCompraAoEstoque(
  supabase: SupabaseClient
): Promise<{ produtos: number; data: string | null }> {
  const { data: ultima, error } = await supabase
    .from("compras")
    .select("data_compra")
    .order("data_compra", { ascending: false })
    .limit(1);
  if (error) falhar(error);
  const data = (ultima?.[0]?.data_compra as string | undefined) ?? null;
  if (!data) return { produtos: 0, data: null };

  const { data: pendentes, error: erroPendentes } = await supabase
    .from("compras")
    .select("id, produto_id, quantidade")
    .eq("data_compra", data)
    .eq("estoque_aplicado", false)
    .not("produto_id", "is", null);
  if (erroPendentes) falhar(erroPendentes);
  if (!pendentes || pendentes.length === 0) return { produtos: 0, data };

  const produtos = await somarNoEstoque(
    supabase,
    pendentes.map((c) => ({ produtoId: c.produto_id as string, quantidade: Number(c.quantidade) }))
  );
  const { error: erroMarcar } = await supabase
    .from("compras")
    .update({ estoque_aplicado: true })
    .in(
      "id",
      pendentes.map((c) => c.id)
    );
  if (erroMarcar) falhar(erroMarcar);
  return { produtos, data };
}
