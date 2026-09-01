"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { mensagemErroAuth } from "@/lib/auth-error";
import LogoMark from "@/components/LogoMark";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <LoginConteudo />
    </Suspense>
  );
}

function LoginConteudo() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEntrando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setEntrando(false);
    if (error) {
      setErro(mensagemErroAuth(error)!);
      return;
    }
    router.push(searchParams.get("proximo") || "/");
    router.refresh();
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-5 bg-bg">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <LogoMark className="h-11 w-auto" />
        </div>
        <form onSubmit={entrar} className="surface-card p-6 space-y-4">
          <div>
            <h1 className="text-lg font-semibold mb-1">Entrar</h1>
            <p className="text-sm text-muted">Acesse a conta compartilhada da família.</p>
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
          <label className="block">
            <span className="text-xs text-muted mb-1 block">Senha</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
            />
            <Link href="/esqueci-senha" className="text-xs text-muted hover:text-text underline mt-1.5 inline-block">
              Esqueci minha senha
            </Link>
          </label>
          {erro && <p className="text-xs text-danger">{erro}</p>}
          <button
            type="submit"
            disabled={entrando}
            className="w-full btn-accent rounded-full py-3 text-sm font-medium disabled:opacity-50"
          >
            {entrando ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="text-center text-xs text-muted mt-4">
          Primeira vez usando o Mercado.App?{" "}
          <Link href="/criar-conta" className="text-text underline">
            Criar conta de administrador
          </Link>
        </p>
      </div>
    </div>
  );
}
