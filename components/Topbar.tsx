"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRealtimeCollection } from "@/lib/useRealtimeCollection";
import { useNotificacoes } from "@/lib/useNotificacoes";
import { tituloDaRota } from "@/lib/nav";
import ThemeToggle from "@/components/ThemeToggle";
import LogoMark from "@/components/LogoMark";

type ProdutoBusca = { id: string; nome: string; categoria: string };

export default function Topbar() {
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();
  const router = useRouter();
  const [busca, setBusca] = useState("");

  const { data: produtos } = useRealtimeCollection<ProdutoBusca>(supabase, "produtos", {
    select: "id, nome, categoria",
    orderBy: { column: "nome" },
  });
  const { naoLidas } = useNotificacoes();

  const sugestoes = busca.length > 0
    ? produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 6)
    : [];

  function irParaBusca(termo: string) {
    router.push(`/buscar?q=${encodeURIComponent(termo)}`);
    setBusca("");
  }

  return (
    <header className="flex items-center gap-3 px-5 py-4 border-b border-border blur-surface sticky top-0 z-20">
      <Link href="/" className="md:hidden flex-shrink-0">
        <LogoMark className="h-7 w-auto" />
      </Link>
      <Link href="/" className="hidden md:block font-semibold text-base flex-shrink-0 w-40 truncate">
        {tituloDaRota(pathname)}
      </Link>

      <div className="hidden md:flex flex-1 justify-center px-4">
        <div className="relative w-full max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && busca.trim() && irParaBusca(busca.trim())}
            placeholder="Buscar produto ou marca..."
            className="w-full pl-9 pr-3 py-2 rounded-full bg-surface border border-border outline-none focus:ring-2 focus:ring-accent text-sm"
          />
          {sugestoes.length > 0 && (
            <div className="absolute mt-1 w-full bg-surface border border-border rounded-2xl shadow-lg overflow-hidden z-30">
              {sugestoes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => irParaBusca(p.nome)}
                  className="w-full text-left px-4 py-2.5 hover:bg-surface-raised text-sm flex items-center justify-between"
                >
                  <span className="truncate">{p.nome}</span>
                  <span className="text-muted text-xs flex-shrink-0 ml-2">{p.categoria}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto md:ml-0 md:w-40 md:justify-end">
        <ThemeToggle className="p-2 rounded-full text-muted hover:text-text hover:bg-surface-raised" />
        <Link
          href="/notificacoes"
          aria-label="Notificações"
          className={`relative p-2 rounded-full ${
            pathname === "/notificacoes" ? "btn-accent" : "text-muted hover:text-text hover:bg-surface-raised"
          }`}
        >
          <Bell size={18} />
          {naoLidas.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger ring-2 ring-bg" />
          )}
        </Link>
        <Link
          href="/perfil"
          aria-label="Perfil"
          className={`p-2 rounded-full ${
            pathname === "/perfil" ? "btn-accent" : "text-muted hover:text-text hover:bg-surface-raised"
          }`}
        >
          <User size={18} />
        </Link>
      </div>
    </header>
  );
}
