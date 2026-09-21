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

export function limparNome(descricao: string, marca: string, peso: string): string {
  let n = descricao;
  if (marca) n = n.replace(new RegExp(marca.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), " ");
  if (peso) n = n.replace(REGEX_PESO, " ");
  n = n.replace(/\b(kg|un)\b/gi, " ").replace(/\s+/g, " ").trim();
  return n
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase())
    .trim();
}
