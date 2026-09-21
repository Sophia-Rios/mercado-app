import type { SupabaseClient } from "@supabase/supabase-js";
import type { LinhaImportada } from "@/lib/import-compras";
import { mensagemErroSupabase } from "@/lib/supabase-error";

export type ResultadoGravacao = {
  importadas: number;
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
    });
  });

  if (novasCompras.length > 0) {
    const { error } = await supabase.from("compras").insert(novasCompras);
    if (error) falhar(error);
  }

  return { importadas: novasCompras.length, puladas, produtoIds };
}
