import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { htmlParaTexto, parseNotaTexto, urlNfceValida } from "@/lib/nfce";

export const maxDuration = 30;

async function baixarPagina(inicial: URL): Promise<string> {
  let atual = inicial;
  // segue redirects na mão pra garantir que nenhum salto saia do domínio da Fazenda
  for (let i = 0; i < 4; i++) {
    const res = await fetch(atual, {
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
    });
    if (res.status >= 300 && res.status < 400) {
      const destino = res.headers.get("location");
      const proximo = destino ? urlNfceValida(new URL(destino, atual).toString()) : null;
      if (!proximo) throw new Error("A Fazenda redirecionou pra um endereço inesperado.");
      atual = proximo;
      continue;
    }
    if (!res.ok) throw new Error(`A Fazenda respondeu com erro ${res.status}.`);
    return await res.text();
  }
  throw new Error("Redirecionamentos demais ao abrir a nota.");
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Sessão expirada. Entre de novo." }, { status: 401 });

  const corpo = (await request.json().catch(() => ({}))) as { url?: string; texto?: string };

  let texto = corpo.texto?.trim() ?? "";
  if (!texto) {
    const url = corpo.url ? urlNfceValida(corpo.url) : null;
    if (!url) {
      return NextResponse.json(
        { erro: "Esse QR Code não parece ser de uma nota fiscal eletrônica (NFC-e)." },
        { status: 400 }
      );
    }
    try {
      const html = await baixarPagina(url);
      texto = htmlParaTexto(html);
      if (!/Qtde total de/i.test(texto) && /captcha/i.test(html)) {
        return NextResponse.json(
          { erro: "A Fazenda pediu uma verificação (captcha) e não deu pra abrir a nota sozinho.", colar: true },
          { status: 422 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { erro: e instanceof Error ? e.message : "Não consegui abrir a nota na Fazenda.", colar: true },
        { status: 502 }
      );
    }
  }

  const nota = parseNotaTexto(texto);
  if ("erro" in nota) return NextResponse.json({ ...nota, colar: true }, { status: 422 });
  return NextResponse.json(nota);
}
