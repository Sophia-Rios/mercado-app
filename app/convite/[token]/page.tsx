"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { mensagemErroAuth } from "@/lib/auth-error";
import LogoMark from "@/components/LogoMark";

export default function ConvitePage() {
  const { token } = useParams<{ token: string }>();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [status, setStatus] = useState<"checando" | "valido" | "invalido">("checando");
  const [papel, setPapel] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [criando, setCriando] = useState(false);

  useEffect(() => {
    supabase.rpc("validar_convite", { token_busca: token }).then(({ data, error }) => {
      const linha = data?.[0];
      if (error || !linha || !linha.valido) {
        setStatus("invalido");
        return;
      }
      setPapel(linha.papel);
      setStatus("valido");
    });
  }, [supabase, token]);

  async function aceitar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCriando(true);

    const { error: erroSignUp } = await supabase.auth.signUp({ email, password: senha });
    if (erroSignUp) {
      setCriando(false);
      setErro(mensagemErroAuth(erroSignUp)!);
      return;
    }

    const { error: erroRpc } = await supabase.rpc("aceitar_convite", {
      token_busca: token,
      nome_novo: nome.trim(),
    });
    setCriando(false);
    if (erroRpc) {
      setErro(erroRpc.message);
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

        {status === "checando" && <p className="text-center text-sm text-muted">Verificando convite...</p>}

        {status === "invalido" && (
          <div className="surface-card p-6 text-center space-y-3">
            <p className="text-sm">Esse link de convite não é válido ou já foi usado.</p>
            <Link href="/login" className="text-sm text-text underline">
              Entrar com uma conta existente
            </Link>
          </div>
        )}

        {status === "valido" && (
          <form onSubmit={aceitar} className="surface-card p-6 space-y-4">
            <div>
              <h1 className="text-lg font-semibold mb-1">Você foi convidado(a)</h1>
              <p className="text-sm text-muted">Crie sua conta pra entrar como {papel.toLowerCase()} da família.</p>
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
              {criando ? "Criando..." : "Criar conta e entrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
