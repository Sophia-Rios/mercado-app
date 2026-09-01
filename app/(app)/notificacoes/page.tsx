"use client";

import { useState } from "react";
import { BellOff, Check } from "lucide-react";
import { useNotificacoes } from "@/lib/useNotificacoes";
import { useToast } from "@/components/ToastProvider";
import NotifCard from "@/components/NotifCard";

export default function NotificacoesPage() {
  const mostrarToast = useToast();
  const [filtro, setFiltro] = useState<"todas" | "naoLidas">("todas");
  const { notificacoes, idsLidas, naoLidas, marcarComoLida, marcarTodasComoLidas } = useNotificacoes();

  async function lidarComClique(id: string) {
    const erro = await marcarComoLida(id);
    if (erro) mostrarToast(erro);
  }

  async function lidarComMarcarTudo() {
    const erro = await marcarTodasComoLidas();
    if (erro) mostrarToast(erro);
  }

  const lidasVisiveis = filtro === "todas" ? notificacoes.filter((n) => idsLidas.has(n.id)) : [];

  return (
    <div className="max-w-2xl mx-auto px-5 pt-8 md:pt-12 pb-8">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-display">Notificações</h1>
          <p className="text-muted text-sm mt-1">Alertas gerados a partir do seu estoque e histórico</p>
        </div>
        {naoLidas.length > 0 && (
          <button
            onClick={lidarComMarcarTudo}
            className="text-xs font-medium text-muted hover:text-text flex-shrink-0"
          >
            Marcar tudo como lido
          </button>
        )}
      </div>

      {notificacoes.length > 0 && (
        <div className="flex bg-surface-raised border border-border rounded-full p-1 text-xs w-fit mb-6">
          <button
            onClick={() => setFiltro("todas")}
            className={`px-3 py-1.5 rounded-full font-medium ${filtro === "todas" ? "btn-accent" : "text-muted"}`}
          >
            Todas ({notificacoes.length})
          </button>
          <button
            onClick={() => setFiltro("naoLidas")}
            className={`px-3 py-1.5 rounded-full font-medium ${filtro === "naoLidas" ? "btn-accent" : "text-muted"}`}
          >
            Não lidas ({naoLidas.length})
          </button>
        </div>
      )}

      {notificacoes.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm flex flex-col items-center gap-3">
          <BellOff size={28} className="text-muted" />
          Nenhuma notificação por enquanto.
        </div>
      ) : naoLidas.length === 0 && filtro === "naoLidas" ? (
        <div className="text-center py-16 text-muted text-sm flex flex-col items-center gap-3">
          <Check size={28} className="text-muted" />
          Tudo em dia por aqui.
        </div>
      ) : (
        <div className="space-y-2">
          {naoLidas.map((n) => (
            <NotifCard key={n.id} n={n} lida={false} onClick={() => lidarComClique(n.id)} />
          ))}
          {lidasVisiveis.length > 0 && (
            <>
              <p className="text-xs uppercase tracking-wide text-muted mt-6 mb-2 font-medium">Lidas</p>
              {lidasVisiveis.map((n) => (
                <NotifCard key={n.id} n={n} lida={true} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
