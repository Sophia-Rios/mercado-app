import type { Compra, Produto, UsuarioPreferencias } from "./types";
import { formatBRL } from "./format";

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
      if (arr.length < 2) return;
      const porData = [...arr].sort((a, b) => (a.data_compra < b.data_compra ? 1 : -1));
      const ultimo = porData[0];
      const maisBarato = [...arr].sort((a, b) => a.preco_unitario - b.preco_unitario)[0];
      if (maisBarato.mercado_id === ultimo.mercado_id) return;
      if (ultimo.preco_unitario > maisBarato.preco_unitario * 1.15) {
        const dif = ultimo.preco_unitario - maisBarato.preco_unitario;
        const nomeProduto = ultimo.produto?.nome ?? "Produto";
        const mercadoUltimo = ultimo.mercado?.nome ?? "—";
        const mercadoBarato = maisBarato.mercado?.nome ?? "—";
        lista.push({
          id: `economia-${produtoId}`,
          tipo: "economia",
          titulo: `${nomeProduto} sai mais barato na ${mercadoBarato}`,
          descricao: `Última compra: ${formatBRL(ultimo.preco_unitario)} na ${mercadoUltimo}. Na ${mercadoBarato} saiu por ${formatBRL(maisBarato.preco_unitario)} (economia de ${formatBRL(dif)}).`,
        });
      }
    });
  }

  return lista;
}
