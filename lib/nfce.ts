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

// o site da Fazenda só entrega a nota pra links dela mesma; barrar qualquer
// outro host evita que essa rota vire um proxy aberto pra internet
export function urlNfceValida(url: string): URL | null {
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    u.protocol = "https:";
    if (!/(^|\.)fazenda\.[a-z]{2}\.gov\.br$/i.test(u.hostname) && !/(^|\.)sefaz\.[a-z.]*gov\.br$/i.test(u.hostname))
      return null;
    return u;
  } catch {
    return null;
  }
}

export function htmlParaTexto(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|tr|td|th|li|h\d|span|label)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+/g, " ");
}

const RUIDO = [/^https?:\/\/\S+/i, /^P[áa]gina \d+ de \d+$/i, /Filtar [ií]tens/i, /^\d{2}\/\d{2}\/\d{4},? \d{2}:\d{2}$/];

export function parseNotaTexto(bruto: string): NotaFiscal | { erro: string } {
  const linhas = bruto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !RUIDO.some((r) => r.test(l)));
  const texto = linhas.join(" ").replace(/\s+/g, " ");

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
