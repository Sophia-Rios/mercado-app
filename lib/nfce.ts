export type ItemNota = {
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  total: number;
};

export type NotaFiscal = {
  emitente: { razaoSocial: string; cnpj: string };
  chave: string;
  data: string; // YYYY-MM-DD
  totalNota: number | null;
  itens: ItemNota[];
};

// "1.9270" e "R$ 1.234,56" e "582.72" — a nota mistura os dois formatos
function numero(str: string): number {
  let s = str.replace(/R\$/g, "").trim();
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  return Number(s);
}

const RUIDO = [/^https?:\/\/\S+/i, /^P[áa]gina \d+ de \d+$/i, /Filtar [ií]tens/i, /^\d{2}\/\d{2}\/\d{4},? \d{2}:\d{2}$/];

export function parseNotaTexto(bruto: string): NotaFiscal | { erro: string } {
  const linhas = bruto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !RUIDO.some((r) => r.test(l)));
  // a quebra de página do PDF corta um item no meio: o rodapé entra entre a
  // descrição e os valores, e os campos chegam fora de ordem. Reconstrói.
  const texto = linhas
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(
      /(\S[^()]*?) Qtde total de UN: ?Valor total R\$: ?\(Código: (\d+)\) ítens: ([\d.,]+) (\S+?) ?R\$ ([\d.,]+)/g,
      "$1 (Código: $2) Qtde total de ítens: $3 UN: $4 Valor total R$: R$ $5"
    );

  const cnpj = texto.match(/CNPJ:?\s*(\d{14})/)?.[1] ?? texto.match(/\b(\d{14})\b/)?.[1] ?? "";
  const razaoSocial = (texto.match(/NFC-e\)\s*(.+?)\s*CNPJ/)?.[1] ?? "").trim();

  const idxItens = texto.search(/\d{5,7}\s*-\s*[^,]+,\s*[A-Z]{2}\s/);
  const inicio = idxItens >= 0 ? texto.indexOf(" ", texto.slice(idxItens).search(/,\s*[A-Z]{2}\s/) + idxItens + 2) : 0;
  const fimItens = texto.search(/Consumidor Chave de acesso|Informações gerais da Nota/);
  const areaItens = texto.slice(Math.max(inicio, 0), fimItens > 0 ? fimItens : undefined);

  const itens: ItemNota[] = [];
  const re =
    /(.+?)\s*\(Código:\s*(\d+)\)\s*Qtde total de\s*ítens:\s*([\d.,]+)\s*UN:\s*(\S+?)\s*Valor total R\$:\s*R\$\s*([\d.,]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(areaItens))) {
    itens.push({
      descricao: m[1].trim(),
      codigo: m[2],
      quantidade: numero(m[3]),
      unidade: m[4],
      total: numero(m[5]),
    });
  }
  if (itens.length === 0) return { erro: "Não achei nenhum item nessa nota." };

  const cab = texto.match(/\b(\d{2})\s+(\d{1,3})\s+(\d{1,9})\s+(\d{2})\/(\d{2})\/(\d{4})/);
  const data = cab ? `${cab[6]}-${cab[5]}-${cab[4]}` : "";
  const chave = cab && cnpj ? `${cnpj}-${cab[1]}-${cab[2]}-${cab[3]}` : "";
  const totalTexto = texto.match(/Qtde total de ítens\s*\d+\s*Valor total R\$\s*([\d.,]+)/)?.[1];

  return {
    emitente: { razaoSocial, cnpj },
    chave,
    data,
    totalNota: totalTexto ? numero(totalTexto) : null,
    itens,
  };
}
