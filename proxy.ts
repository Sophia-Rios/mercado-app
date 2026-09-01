import type { NextRequest } from "next/server";
import { atualizarSessao } from "@/lib/supabase-middleware";

export async function proxy(request: NextRequest) {
  return atualizarSessao(request);
}

export const config = {
  matcher: [
    /*
     * roda em tudo, exceto arquivos estáticos e assets do Next — sem isso
     * o middleware tentaria checar sessão em pedido de imagem/ícone/etc
     */
    "/((?!_next/static|_next/image|favicon|apple-touch-icon|icon-|manifest\\.json|.*\\.svg$|.*\\.png$).*)",
  ],
};
