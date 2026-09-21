import { CATEGORIAS } from "@/lib/categorias";

// interpretação por regras, usada quando a IA não está disponível: menos
// esperta que ela, mas já separa peso, marca e categoria do texto da nota

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const norm = (s: string) => semAcento(s).toLowerCase();

const REGEX_PESO = /(\d+(?:[.,]\d+)?)\s?(kg|gr|g|ml|l)\b/i;

export function extrairPeso(descricao: string): string {
  const m = descricao.match(REGEX_PESO);
  if (!m) return "";
  const unidade = m[2].toLowerCase() === "gr" ? "g" : m[2].toLowerCase() === "l" ? "L" : m[2].toLowerCase();
  return `${m[1].replace(",", ".")}${unidade}`;
}

export function acharMarca(descricao: string, marcasConhecidas: string[]): string {
  const d = ` ${norm(descricao)} `;
  const candidatas = marcasConhecidas
    .filter((m) => m.trim().length >= 3)
    .sort((a, b) => b.length - a.length)
    .filter((m) => d.includes(` ${norm(m)} `));
  return candidatas[0] ?? "";
}

const CATEGORIA_POR_PALAVRA: [string, string[]][] = [
  ["Frios e Embutidos", ["bacon", "presunto", "salsicha", "linguica", "mortadela", "salame", "apresuntado"]],
  ["Congelados", ["congelad", "lasanha", "las ", "chicken", "nugget", "pizza", "hamburguer", "sorvete", "empanado", "pif paf"]],
  ["Laticínios", ["leite", "queijo", "iogurte", "cr leite", "creme de leite", "manteiga", "requeijao", "margarina", "nata"]],
  ["Carnes e Aves", ["frango", "fgo", "file", "carne", "bife", "coxa", "peito", "costela", "acem", "patinho", "linguica", "peixe"]],
  ["Padaria", ["pao ", "pao forma", "bolo", "torrada", "bisnaga"]],
  ["Bebidas", ["refr", "refresco", "suco", "cerveja", "agua ", "vinho", "cafe ", "energetico", "chá", "cha "]],
  ["Doces", ["choco", "chocolate", "bombom", "bala", "doce de", "goiabada", "sorvete", "pacoca"]],
  ["Higiene Pessoal", ["sabonete", "sab ", "shampoo", "condicionador", "desodorante", "ds ", "creme dental", "escova dental", "papel hig", "fralda", "absorvente", "cotonete"]],
  ["Limpeza", ["detergente", "det liq", "lava roupa", "lava-roupa", "sabao", "amaciante", "desinfetante", "agua sanit", "esponja", "multiuso", "limpador", "alvejante", "saco lixo"]],
  ["Utilidades Domésticas", ["filtro pap", "filtro de papel", "pilha", "lampada", "vela ", "fosforo", "papel aluminio", "guardanapo"]],
  ["Mercearia", ["arroz", "feijao", "oleo", "molho", "milho", "ervilha", "macarrao", "massa", "farinha", "acucar", "sal ", "condimento", "paprica", "cereal", "biscoito", "bisc ", "azeite", "vinagre", "extrato", "tempero", "tapioca", "batata palha", "aveia", "leite cond", "maionese", "ketchup"]],
  ["Hortifruti", ["alface", "tomate", "cebola", "alho", "limao", "banana", "laranja", "maca ", "cenoura", "batata kg", "batata ", "abobrinha", "pimentao", "couve", "brocolis", "melancia", "mamao", "abacaxi", "uva "]],
];

export function acharCategoria(descricao: string, unidade: string): string {
  const d = ` ${norm(descricao)} `;
  const aGranel = unidade.toUpperCase() === "KG";
  for (const [categoria, palavras] of CATEGORIA_POR_PALAVRA) {
    // batata/cebola/etc. só são hortifruti quando vendidas a granel (kg)
    if (categoria === "Hortifruti" && !aGranel) continue;
    if (palavras.some((p) => d.includes(p))) return CATEGORIAS.includes(categoria) ? categoria : "Outros";
  }
  return "Outros";
}

// abreviações comuns nas notas -> palavra por extenso ("" = descartar)
const ABREVIACOES: Record<string, string> = {
  vde: "verde", lt: "lata", lv: "", p: "", pc: "", un: "", kg: "", int: "integral", las: "lasanha", bol: "bolonhesa",
  fgo: "frango", bj: "bandeja", refr: "refresco", choco: "chocolate", choc: "chocolate", det: "detergente",
  liq: "líquido", sab: "sabonete", ds: "desodorante", tom: "tomate", tradic: "tradicional", bisc: "biscoito",
  amant: "amanteigado", tabl: "tablete", rech: "recheado", pao: "pão", oleo: "óleo", vd: "vidro", sache: "sachê",
  pap: "papel", integ: "integral", cong: "congelado", esp: "especial", cx: "caixa", pct: "pacote", mac: "macarrão",
};

function expandir(descricao: string): string {
  const d = norm(descricao)
    .replace(/\brefr po\b/g, "refresco em pó")
    .replace(/\bcr leite\b/g, "creme de leite")
    .replace(/\bmolho tom\b/g, "molho de tomate")
    .replace(/\bpao forma\b/g, "pão de forma");
  return d
    .split(/\s+/)
    .map((t) => (t in ABREVIACOES ? ABREVIACOES[t] : t))
    .filter(Boolean)
    .join(" ");
}

export function limparNome(descricao: string, marca: string, peso: string): string {
  let n = descricao;
  if (marca) {
    const i = n.toLowerCase().indexOf(marca.toLowerCase());
    if (i >= 0) n = n.slice(0, i) + " " + n.slice(i + marca.length);
  }
  if (peso) n = n.replace(REGEX_PESO, " ");
  n = expandir(n.replace(/\b\d+\s?(un|und)\b/gi, " ").replace(/\s+/g, " ").trim());
  return n.charAt(0).toUpperCase() + n.slice(1);
}

type ProdutoCatalogo = { nome: string; marca: string | null; categoria: string };

// procura um produto já cadastrado que seja o mesmo item da nota (mesma marca
// e nome parecido) pra reaproveitar nome/categoria em vez de criar duplicado
export function buscarNoCatalogo(
  descricao: string,
  marca: string,
  catalogo: ProdutoCatalogo[]
): ProdutoCatalogo | null {
  const tokens = norm(expandir(descricao))
    .split(/\s+/)
    .filter((t) => t.length >= 3);
  let melhor: ProdutoCatalogo | null = null;
  let melhorScore = 0;
  for (const p of catalogo) {
    if (norm(p.marca ?? "") !== norm(marca)) continue;
    const tokensNome = norm(p.nome)
      .split(/\s+/)
      .filter((t) => t.length >= 3);
    if (tokensNome.length === 0 || tokens[0] !== tokensNome[0]) continue;
    const score = tokensNome.filter((t) => tokens.some((d) => d === t || (d.length >= 3 && t.startsWith(d)))).length;
    if (score > melhorScore) {
      melhorScore = score;
      melhor = p;
    }
  }
  return melhor;
}
