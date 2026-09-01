export type LinhaImportada = {
  linha: number;
  nome: string;
  marca: string;
  categoria: string;
  mercado: string;
  data: string;
  quantidade: number;
  precoUnitario: number | null;
  precoTotal: number | null;
  erros: string[];
};

export type ResultadoImportacao = { erro: string } | { linhas: LinhaImportada[] };

const ALIASES: Record<string, string[]> = {
  nome: ["produto", "item", "nome", "descricao", "descrição"],
  marca: ["marca"],
  categoria: ["categoria"],
  mercado: ["mercado", "loja", "supermercado"],
  data: ["data", "data da compra", "data compra"],
  quantidade: ["quantidade", "qtd", "qtde", "qt"],
  precoUnitario: [
    "preco unitario",
    "preço unitário",
    "preco un",
    "preço un",
    "valor unitario",
    "valor unitário",
    "preco",
    "preço",
    "preco un.",
  ],
  precoTotal: ["preco total", "preço total", "valor total", "total"],
};

function normalizarCabecalho(h: string): string {
  return h.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function mapearColunas(headers: string[]): Record<string, number> {
  const normalizados = headers.map(normalizarCabecalho);
  const mapa: Record<string, number> = {};
  Object.entries(ALIASES).forEach(([campo, opcoes]) => {
    const opcoesNorm = opcoes.map(normalizarCabecalho);
    const idx = normalizados.findIndex((h) => opcoesNorm.includes(h));
    if (idx !== -1) mapa[campo] = idx;
  });
  return mapa;
}

function parseData(str?: string): string {
  if (!str) return "";
  const s = str.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const [, d, mo] = m;
    let y = m[3];
    if (y.length === 2) y = "20" + y;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return "";
}

function parseNumero(str?: string): number | null {
  if (str === undefined || str === null || str === "") return null;
  let s = String(str).trim().replace(/^R\$\s*/i, "");
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

export function parseTabela(texto: string): ResultadoImportacao {
  const linhas = texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (linhas.length < 2) return { erro: "Cole pelo menos um cabeçalho e uma linha de dados." };

  const candidatos = ["\t", ";", ","];
  const delim = candidatos.find((d) => linhas[0].split(d).length > 1) || "\t";

  const headers = linhas[0].split(delim).map((h) => h.trim());
  const mapa = mapearColunas(headers);

  if (mapa.nome === undefined) {
    return { erro: "Não encontrei uma coluna de produto (nome/item/produto). Confira o cabeçalho." };
  }

  const linhasDados: LinhaImportada[] = linhas.slice(1).map((linha, i) => {
    const cols = linha.split(delim).map((c) => c.trim());
    const nome = cols[mapa.nome] || "";
    const marca = mapa.marca !== undefined ? cols[mapa.marca] || "" : "";
    const categoria = mapa.categoria !== undefined ? cols[mapa.categoria] || "" : "";
    const mercado = mapa.mercado !== undefined ? cols[mapa.mercado] || "" : "";
    const data = parseData(mapa.data !== undefined ? cols[mapa.data] : undefined);
    const quantidadeBruta = mapa.quantidade !== undefined ? parseNumero(cols[mapa.quantidade]) : 1;
    let precoUnitario = mapa.precoUnitario !== undefined ? parseNumero(cols[mapa.precoUnitario]) : null;
    let precoTotal = mapa.precoTotal !== undefined ? parseNumero(cols[mapa.precoTotal]) : null;

    const qtd = quantidadeBruta || 1;
    if (precoUnitario === null && precoTotal !== null) precoUnitario = precoTotal / qtd;
    if (precoTotal === null && precoUnitario !== null) precoTotal = precoUnitario * qtd;

    const erros: string[] = [];
    if (!nome) erros.push("sem nome");
    if (!mercado) erros.push("sem mercado");
    if (!data) erros.push("data inválida");
    if (precoUnitario === null) erros.push("sem preço");

    return {
      linha: i + 2,
      nome,
      marca,
      categoria,
      mercado,
      data,
      quantidade: qtd,
      precoUnitario,
      precoTotal,
      erros,
    };
  });

  return { linhas: linhasDados };
}
