export type Tamanho = { tipo: "massa" | "volume" | "unidade"; quantidade: number };

// "7L", "500g", "1,5 kg", "2x500g", "30un" -> quantidade em g, ml ou unidades
export function parseTamanho(texto: string | null | undefined): Tamanho | null {
  if (!texto) return null;
  const t = texto.toLowerCase().replace(",", ".").trim();
  const m = t.match(/(?:(\d+)\s*x\s*)?(\d+(?:\.\d+)?)\s*(kg|gr|g|ml|l|un|und|unid)\b/);
  if (!m) return null;
  const multiplicador = m[1] ? Number(m[1]) : 1;
  const valor = Number(m[2]) * multiplicador;
  if (!(valor > 0)) return null;
  switch (m[3]) {
    case "kg":
      return { tipo: "massa", quantidade: valor * 1000 };
    case "g":
    case "gr":
      return { tipo: "massa", quantidade: valor };
    case "l":
      return { tipo: "volume", quantidade: valor * 1000 };
    case "ml":
      return { tipo: "volume", quantidade: valor };
    default:
      return { tipo: "unidade", quantidade: valor };
  }
}

// preço por kg, por litro ou por unidade — o que dá pra comparar de verdade
export function precoPorBase(preco: number, tamanho: Tamanho): { valor: number; rotulo: string } {
  if (tamanho.tipo === "unidade") return { valor: preco / tamanho.quantidade, rotulo: "un" };
  return { valor: (preco / tamanho.quantidade) * 1000, rotulo: tamanho.tipo === "massa" ? "kg" : "L" };
}
