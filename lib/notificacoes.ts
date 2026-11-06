import type { Compra, Produto, UsuarioPreferencias } from "./types";
import { formatBRL } from "./format";
import { parseTamanho, precoPorBase, type Tamanho } from "./unidades";

export type Notificacao = {
  id: string;
  tipo: "estoque" | "economia";
  titulo: string;
  descricao: string;
};

type Prefs = Pick<UsuarioPreferencias, "notif_estoque_baixo" | "notif_economia"> | undefined;

// notificações não são uma tabela de eventos — são calculadas na hora a
// partir do estado atual de estoque e do histórico de compras
export function calcularNotificacoes(produtos: Produto[], compras: Compra[], prefs: Prefs): Notificacao[] {
  const lista: Notificacao[] = [];
  const notifEstoqueBaixo = prefs?.notif_estoque_baixo ?? true;
  const notifEconomia = prefs?.notif_economia ?? true;

  if (notifEstoqueBaixo) {
    produtos
      .filter((p) => p.estoque_minimo > 0 && p.estoque_atual <= p.estoque_minimo)
      .forEach((p) => {
        lista.push({
          id: `estoque-${p.id}`,
          tipo: "estoque",
          titulo: `Repor ${p.nome}`,
          descricao: `Estoque atual (${p.estoque_atual}) está no mínimo ou abaixo (${p.estoque_minimo}).`,
        });
      });
  }

  if (notifEconomia) {
    const porProduto = new Map<string, Compra[]>();
    compras.forEach((c) => {
      // compra órfã (produto excluído) não gera notificação de economia
      if (!c.produto_id) return;
      const arr = porProduto.get(c.produto_id) ?? [];
      arr.push(c);
      porProduto.set(c.produto_id, arr);
    });
    porProduto.forEach((arr, produtoId) => {
      // compara preço por kg / litro / unidade, não o preço da embalagem:
      // 7L por R$ 25 sai mais barato que 2L por R$ 10. O tamanho vem da
      // própria compra, ou do cadastro do produto quando a compra não tem.
      const comTamanho = arr.map((c) => ({
        c,
        tamanho: parseTamanho(c.peso_volume ?? c.produto?.peso_volume) as Tamanho | null,
      }));
      const medidas = comTamanho.filter((x) => x.tamanho);
      const usarTamanho = medidas.length > 0;
      const base = usarTamanho ? medidas : comTamanho;
      if (base.length < 2) return;
      // tipos diferentes (ex: gramas x litros) não são comparáveis
      if (usarTamanho && new Set(medidas.map((x) => x.tamanho!.tipo)).size > 1) return;

      const valorDe = (x: (typeof base)[number]) =>
        usarTamanho ? precoPorBase(x.c.preco_unitario, x.tamanho!).valor : x.c.preco_unitario;
      const rotulo = usarTamanho ? precoPorBase(1, medidas[0].tamanho!).rotulo : "";
      const mostrar = (x: (typeof base)[number]) =>
        usarTamanho ? `${formatBRL(valorDe(x))}/${rotulo}` : formatBRL(x.c.preco_unitario);

      const porData = [...base].sort((a, b) => (a.c.data_compra < b.c.data_compra ? 1 : -1));
      const ultimo = porData[0];
      const maisBarato = [...base].sort((a, b) => valorDe(a) - valorDe(b))[0];
      if (maisBarato.c.mercado_id === ultimo.c.mercado_id) return;
      if (valorDe(ultimo) > valorDe(maisBarato) * 1.15) {
        const dif = valorDe(ultimo) - valorDe(maisBarato);
        const nomeProduto = ultimo.c.produto?.nome ?? "Produto";
        const mercadoUltimo = ultimo.c.mercado?.nome ?? "—";
        const mercadoBarato = maisBarato.c.mercado?.nome ?? "—";
        lista.push({
          id: `economia-${produtoId}`,
          tipo: "economia",
          titulo: `${nomeProduto} sai mais barato no ${mercadoBarato}`,
          descricao: `Última compra: ${mostrar(ultimo)} no ${mercadoUltimo}. No ${mercadoBarato} saiu por ${mostrar(maisBarato)} (economia de ${formatBRL(dif)}${usarTamanho ? `/${rotulo}` : ""}).`,
        });
      }
    });
  }

  return lista;
}
