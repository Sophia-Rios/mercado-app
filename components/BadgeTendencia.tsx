import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Tendencia } from "@/lib/mercado-calc";

export default function BadgeTendencia({ tendencia }: { tendencia: Tendencia }) {
  if (!tendencia) return <span className="text-xs text-muted">Sem dados suficientes</span>;

  const { percentual } = tendencia;
  if (percentual > 3) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-warning bg-warning-bg px-2.5 py-1 rounded-full">
        <TrendingUp size={12} /> Subindo {percentual.toFixed(0)}%
      </span>
    );
  }
  if (percentual < -3) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-success bg-success-bg px-2.5 py-1 rounded-full">
        <TrendingDown size={12} /> Caindo {Math.abs(percentual).toFixed(0)}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-muted bg-surface-raised px-2.5 py-1 rounded-full">
      <Minus size={12} /> Estável
    </span>
  );
}
