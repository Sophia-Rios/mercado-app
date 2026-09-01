"use client";

import { useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { getLogoUrl } from "@/lib/supabase-storage";
import type { Mercado } from "@/lib/types";

export default function MercadoAvatar({
  mercado,
  size = 40,
}: {
  mercado: Pick<Mercado, "nome" | "cor" | "logo_path"> | null | undefined;
  size?: number;
}) {
  const supabase = useMemo(() => createClient(), []);
  const logoUrl = mercado ? getLogoUrl(supabase, mercado.logo_path) : null;

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={mercado?.nome}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0 border border-border"
      />
    );
  }

  const cor = mercado?.cor || "#9CA3AF";
  return (
    <div
      style={{ width: size, height: size, backgroundColor: `${cor}22`, color: cor }}
      className="rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm flex-none"
    >
      {(mercado?.nome || "?").charAt(0).toUpperCase()}
    </div>
  );
}
