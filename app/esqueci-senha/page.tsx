"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { mensagemErroAuth } from "@/lib/auth-error";
import LogoMark from "@/components/LogoMark";

export default function EsqueciSenhaPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setEnviando(false);
    if (error) {
      setErro(mensagemErroAuth(error)!);
      return;
    }
    setEnviado(true);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-5 bg-bg">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <LogoMark className="h-11 w-auto" />
        </div>

        {enviado ? (
          <div className="surface-card p-6 text-center space-y-3">
            <p className="text-sm">
              Se <span className="font-medium text-text">{email}</span> tiver uma conta, mandamos um link pra
              redefinir a senha. Confere sua caixa de entrada (e o spam).
            </p>
            <Link href="/login" className="text-sm text-text underline">
              Voltar pro login
            </Link>
          </div>
        ) : (
          <form onSubmit={enviar} className="surface-card p-6 space-y-4">
            <div>
              <h1 className="text-lg font-semibold mb-1">Esqueci minha senha</h1>
              <p className="text-sm text-muted">
                Digita o e-mail da sua conta e mandamos um link pra você criar uma senha nova.
              </p>
            </div>
            <label className="block">
              <span className="text-xs text-muted mb-1 block">E-mail</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
              />
            </label>
            {erro && <p className="text-xs text-danger">{erro}</p>}
            <button
              type="submit"
              disabled={enviando}
              className="w-full btn-accent rounded-full py-3 text-sm font-medium disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Mandar link de recuperação"}
            </button>
            <p className="text-center text-xs text-muted">
              <Link href="/login" className="text-text underline">
                Voltar pro login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
