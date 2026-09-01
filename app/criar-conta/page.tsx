"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { mensagemErroAuth } from "@/lib/auth-error";
import LogoMark from "@/components/LogoMark";

export default function CriarContaPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [criando, setCriando] = useState(false);

  async function criarConta(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCriando(true);

    const { error: erroSignUp } = await supabase.auth.signUp({ email, password: senha });
    if (erroSignUp) {
      setCriando(false);
      setErro(mensagemErroAuth(erroSignUp)!);
      return;
    }

    const { error: erroRpc } = await supabase.rpc("criar_primeira_conta", { nome_novo: nome.trim() });
    setCriando(false);
    if (erroRpc) {
      setErro(
        erroRpc.message.includes("Já existe uma família")
          ? "Já existe uma família cadastrada nesse app. Peça um convite pra um administrador em vez de criar conta aqui."
          : erroRpc.message
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-5 bg-bg">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <LogoMark className="h-11 w-auto" />
        </div>
        <form onSubmit={criarConta} className="surface-card p-6 space-y-4">
          <div>
            <h1 className="text-lg font-semibold mb-1">Criar conta de administrador</h1>
            <p className="text-sm text-muted">
              Só funciona na primeira vez — depois disso, novos membros entram por convite.
            </p>
          </div>
          <label className="block">
            <span className="text-xs text-muted mb-1 block">Seu nome</span>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
            />
          </label>
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
              minLength={6}
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
            />
          </label>
          {erro && <p className="text-xs text-danger">{erro}</p>}
          <button
            type="submit"
            disabled={criando}
            className="w-full btn-accent rounded-full py-3 text-sm font-medium disabled:opacity-50"
          >
            {criando ? "Criando..." : "Criar conta"}
          </button>
        </form>
        <p className="text-center text-xs text-muted mt-4">
          Já tem conta?{" "}
          <Link href="/login" className="text-text underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
