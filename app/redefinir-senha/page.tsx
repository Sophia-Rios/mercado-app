"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { mensagemErroAuth } from "@/lib/auth-error";
import LogoMark from "@/components/LogoMark";

export default function RedefinirSenhaPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [invalido, setInvalido] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    // o link do e-mail já deixa uma sessão temporária de recuperação
    // pronta assim que o navegador processa a URL — só precisamos
    // detectar isso antes de mostrar o formulário de nova senha
    const { data: assinatura } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "PASSWORD_RECOVERY") setPronto(true);
    });

    const tempo = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setPronto(true);
      else setInvalido(true);
    }, 2000);

    return () => {
      assinatura.subscription.unsubscribe();
      clearTimeout(tempo);
    };
  }, [supabase]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) {
      setErro(mensagemErroAuth(error)!);
      return;
    }
    setSucesso(true);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1500);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-5 bg-bg">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <LogoMark className="h-11 w-auto" />
        </div>

        {invalido && (
          <div className="surface-card p-6 text-center space-y-3">
            <p className="text-sm">
              Esse link de redefinição não é válido ou expirou. Pede um novo na tela de login.
            </p>
            <a href="/esqueci-senha" className="text-sm text-text underline">
              Pedir novo link
            </a>
          </div>
        )}

        {!invalido && !pronto && <p className="text-center text-sm text-muted">Verificando link...</p>}

        {pronto && !sucesso && (
          <form onSubmit={salvar} className="surface-card p-6 space-y-4">
            <div>
              <h1 className="text-lg font-semibold mb-1">Nova senha</h1>
              <p className="text-sm text-muted">Escolhe uma senha nova pra sua conta.</p>
            </div>
            <label className="block">
              <span className="text-xs text-muted mb-1 block">Nova senha</span>
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
            <label className="block">
              <span className="text-xs text-muted mb-1 block">Confirmar nova senha</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-bg border border-border text-sm"
              />
            </label>
            {erro && <p className="text-xs text-danger">{erro}</p>}
            <button
              type="submit"
              disabled={salvando}
              className="w-full btn-accent rounded-full py-3 text-sm font-medium disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}

        {sucesso && (
          <div className="surface-card p-6 text-center">
            <p className="text-sm">Senha alterada! Entrando...</p>
          </div>
        )}
      </div>
    </div>
  );
}
