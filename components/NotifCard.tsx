import { AlertTriangle, TrendingUp } from "lucide-react";
import type { Notificacao } from "@/lib/notificacoes";

export default function NotifCard({
  n,
  lida,
  onClick,
}: {
  n: Notificacao;
  lida: boolean;
  onClick?: () => void;
}) {
  const Icon = n.tipo === "estoque" ? AlertTriangle : TrendingUp;
  const cor = n.tipo === "estoque" ? "text-warning bg-warning-bg" : "text-success bg-success-bg";

  return (
    <button
      onClick={onClick}
      disabled={lida}
      className={`w-full text-left flex items-start gap-3 border rounded-xl px-4 py-3 ${
        lida ? "border-border opacity-50" : "border-border"
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cor}`}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{n.titulo}</p>
        <p className="text-xs text-muted mt-0.5">{n.descricao}</p>
      </div>
      {!lida && <span className="w-2 h-2 rounded-full bg-danger flex-shrink-0 mt-1.5" />}
    </button>
  );
}
