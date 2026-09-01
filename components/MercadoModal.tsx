"use client";

import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { subirLogoMercado } from "@/lib/supabase-storage";
import { mensagemErroSupabase } from "@/lib/supabase-error";
import { useToast } from "@/components/ToastProvider";
import MercadoAvatar from "@/components/MercadoAvatar";
import type { Mercado } from "@/lib/types";

export default function MercadoModal({
  mercado,
  onFechar,
}: {
  mercado: Mercado | null; // null = criar novo
  onFechar: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const mostrarToast = useToast();
  const idRef = useRef(mercado?.id ?? crypto.randomUUID());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState(mercado?.nome ?? "");
  const [cor, setCor] = useState(mercado?.cor ?? "#9CA3AF");
  const [endereco, setEndereco] = useState(mercado?.endereco ?? "");
  const [logoPath, setLogoPath] = useState<string | null>(mercado?.logo_path ?? null);
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [erro, setErro] = useState("");

  async function lidarComLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviandoLogo(true);
    try {
      const path = await subirLogoMercado(supabase, idRef.current, file);
      setLogoPath(path);
    } catch (err) {
      mostrarToast(err instanceof Error ? err.message : "Não consegui enviar essa imagem.");
    } finally {
      setEnviandoLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setErro("Dá um nome pro mercado antes de salvar.");
      return;
    }
    setErro("");
    setSalvando(true);
    const { error } = await supabase.from("mercados").upsert({
      id: idRef.current,
      nome: nome.trim(),
      cor,
      endereco: endereco.trim() || null,
      logo_path: logoPath,
    });
    setSalvando(false);
    if (error) {
      mostrarToast(mensagemErroSupabase(error)!);
      return;
    }
    mostrarToast(mercado ? "Mercado atualizado" : "Mercado criado");
    onFechar();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center"
      onClick={onFechar}
    >
      <div
        className="bg-surface w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <p className="font-medium">{mercado ? "Editar mercado" : "Novo mercado"}</p>
          <button onClick={onFechar} className="p-1 text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={confirmar} className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <MercadoAvatar mercado={{ nome, cor, logo_path: logoPath }} size={56} />
            <div className="flex-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={enviandoLogo}
                className="text-xs font-medium border border-border rounded-full px-3 py-1.5 disabled:opacity-50"
              >
                {enviandoLogo ? "Enviando..." : logoPath ? "Trocar logo" : "Adicionar logo"}
              </button>
              {logoPath && (
                <button type="button" onClick={() => setLogoPath(null)} className="text-xs text-danger">
                  Remover
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={lidarComLogo} className="hidden" />
            </div>
          </div>

          <label className="block">
            <span className="text-xs text-muted mb-1 block">Nome do mercado</span>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs text-muted mb-1 block">Cor nos gráficos</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
              <span className="text-xs text-muted font-data">{cor}</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs text-muted mb-1 block">Endereço (opcional)</span>
            <input
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, bairro"
              className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
            />
          </label>

          {erro && <p className="text-xs text-danger">{erro}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="w-full btn-accent rounded-full py-3 text-sm font-medium mt-2 disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
}
