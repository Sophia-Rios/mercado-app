/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Link as LinkIcon, LogOut, Shield, Trash2, UserPlus, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRealtimeCollection } from "@/lib/useRealtimeCollection";
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/components/ToastProvider";
import { mensagemErroSupabase } from "@/lib/supabase-error";
import { formatDataBR } from "@/lib/format";
import { CATEGORIAS } from "@/lib/categorias";
import PrefToggle from "@/components/PrefToggle";
import ImportarModal from "@/components/ImportarModal";
import ImportarNotaModal from "@/components/ImportarNotaModal";
import type { Categoria, Convite, MembroFamilia, UsuarioPreferencias } from "@/lib/types";

export default function PerfilPage() {
  const supabase = useMemo(() => createClient(), []);
  const mostrarToast = useToast();
  const { user, sair } = useAuth();

  const { data: prefsLinhas } = useRealtimeCollection<UsuarioPreferencias>(supabase, "usuario_preferencias");
  const { data: familia } = useRealtimeCollection<MembroFamilia>(supabase, "familia", {
    orderBy: { column: "created_at" },
  });
  const { data: convites } = useRealtimeCollection<Convite>(supabase, "convites", {
    orderBy: { column: "criado_em", ascending: false },
  });
  const { data: categorias } = useRealtimeCollection<Categoria>(supabase, "categorias", {
    orderBy: { column: "nome" },
  });

  const prefs = prefsLinhas[0];
  const souAdministrador = familia.some((m) => m.user_id === user?.id && m.papel === "Administrador");
  const convitesPendentes = convites.filter((c) => !c.usado_em);
  const [nome, setNome] = useState("");
  const [novoPapel, setNovoPapel] = useState<"Administrador" | "Membro">("Membro");
  const [gerandoConvite, setGerandoConvite] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);
  const [modalNota, setModalNota] = useState(false);

  useEffect(() => {
    if (prefs) setNome(prefs.nome);
  }, [prefs]);

  async function salvarNome() {
    if (!prefs || nome === prefs.nome) return;
    const { error } = await supabase.from("usuario_preferencias").update({ nome }).eq("id", true);
    if (error) mostrarToast(mensagemErroSupabase(error)!);
    else mostrarToast("Nome atualizado");
  }

  async function togglePref(chave: "notif_estoque_baixo" | "notif_economia") {
    if (!prefs) return;
    const { error } = await supabase
      .from("usuario_preferencias")
      .update({ [chave]: !prefs[chave] })
      .eq("id", true);
    if (error) mostrarToast(mensagemErroSupabase(error)!);
  }

  async function alterarCorCategoria(nomeCategoria: string, cor: string) {
    const { error } = await supabase.from("categorias").upsert({ nome: nomeCategoria, cor });
    if (error) mostrarToast(mensagemErroSupabase(error)!);
  }

  async function gerarConvite() {
    setGerandoConvite(true);
    const { data, error } = await supabase.from("convites").insert({ papel: novoPapel }).select().single();
    setGerandoConvite(false);
    if (error) {
      mostrarToast(mensagemErroSupabase(error)!);
      return;
    }
    const link = `${window.location.origin}/convite/${data.token}`;
    try {
      await navigator.clipboard.writeText(link);
      mostrarToast("Link de convite copiado — manda pra pessoa pelo WhatsApp");
    } catch {
      mostrarToast(link);
    }
  }

  async function cancelarConvite(id: string) {
    const { error } = await supabase.from("convites").delete().eq("id", id);
    if (error) mostrarToast(mensagemErroSupabase(error)!);
  }

  async function alterarPapel(id: string, papel: "Administrador" | "Membro") {
    const { error } = await supabase.from("familia").update({ papel }).eq("id", id);
    if (error) mostrarToast(mensagemErroSupabase(error)!);
  }

  async function removerMembro(id: string, userId: string | null) {
    if (userId === user?.id) {
      mostrarToast("Você não pode remover a própria conta por aqui");
      return;
    }
    const { error } = await supabase.from("familia").delete().eq("id", id);
    if (error) mostrarToast(mensagemErroSupabase(error)!);
  }

  async function limparListaComprados() {
    const { error } = await supabase.from("lista_compras").delete().eq("comprado", true);
    if (error) {
      mostrarToast(mensagemErroSupabase(error)!);
      return;
    }
    mostrarToast("Itens comprados removidos da lista");
  }

  async function resetarTudo() {
    if (
      !window.confirm(
        "Isso apaga todos os produtos, compras e a lista de compras atual. Mercados, categorias e família continuam. Não dá pra desfazer. Confirma?"
      )
    )
      return;
    // deleta explicitamente em vez de confiar em cascade: "compras" agora
    // sobrevive à exclusão de um produto (ON DELETE SET NULL), então
    // apagar só "produtos" não bastaria mais pra limpar o histórico
    const { error: erroCompras } = await supabase.from("compras").delete().not("id", "is", null);
    if (erroCompras) {
      mostrarToast(mensagemErroSupabase(erroCompras)!);
      return;
    }
    const { error: erroLista } = await supabase.from("lista_compras").delete().not("id", "is", null);
    if (erroLista) {
      mostrarToast(mensagemErroSupabase(erroLista)!);
      return;
    }
    const { error: erroProdutos } = await supabase.from("produtos").delete().not("id", "is", null);
    if (erroProdutos) {
      mostrarToast(mensagemErroSupabase(erroProdutos)!);
      return;
    }
    // sem isso, notas já importadas continuariam bloqueadas mesmo com as compras apagadas
    const { error: erroNotas } = await supabase.from("notas_fiscais").delete().not("chave", "is", null);
    if (erroNotas) {
      mostrarToast(mensagemErroSupabase(erroNotas)!);
      return;
    }
    mostrarToast("Dados resetados");
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-8 md:pt-12 pb-8 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-1">Perfil</h1>
        <p className="text-muted text-sm">Sua conta e preferências do app</p>
      </div>

      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Sua conta</p>
          <button
            onClick={sair}
            className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-danger"
          >
            <LogOut size={13} /> Sair
          </button>
        </div>
        {user?.email && <p className="text-xs text-muted mb-3">{user.email}</p>}
        <label className="text-xs text-muted flex flex-col gap-1 mb-3">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onBlur={salvarNome}
            className="px-3 py-2 rounded-lg bg-bg border border-border text-text text-sm"
          />
        </label>
        <p className="text-xs text-muted">
          Os dados desse app são compartilhados: quem entrar com uma conta da família vê e edita a mesma lista,
          estoque e histórico.
        </p>
      </div>

      {prefs && (
        <div className="surface-card p-5">
          <p className="text-sm font-medium mb-3">Notificações</p>
          <div className="space-y-3">
            <PrefToggle
              label="Estoque baixo"
              descricao="Avisar quando um produto atingir o estoque mínimo"
              ativo={prefs.notif_estoque_baixo}
              onClick={() => togglePref("notif_estoque_baixo")}
            />
            <PrefToggle
              label="Oportunidades de economia"
              descricao="Avisar quando um produto sair bem mais barato em outro mercado"
              ativo={prefs.notif_economia}
              onClick={() => togglePref("notif_economia")}
            />
          </div>
        </div>
      )}

      <div className="surface-card p-5">
        <p className="text-sm font-medium mb-1">Cores das categorias</p>
        <p className="text-xs text-muted mb-4">Usadas nos gráficos de gasto por categoria</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {CATEGORIAS.map((cat) => {
            const cor = categorias.find((c) => c.nome === cat)?.cor ?? "#9CA3AF";
            return (
              <label key={cat} className="flex items-center gap-2 text-xs">
                <input
                  type="color"
                  value={cor}
                  onChange={(e) => alterarCorCategoria(cat, e.target.value)}
                  className="w-6 h-6 rounded-md border border-border cursor-pointer flex-shrink-0"
                />
                <span className="truncate">{cat}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="surface-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Users size={15} className="text-muted" />
          <p className="text-sm font-medium">Família</p>
        </div>
        <p className="text-xs text-muted mb-4">
          Quem tem conta entra com e-mail e senha e vê os mesmos dados. Só administradores podem convidar, mudar
          papel ou remover alguém.
        </p>
        <div className="space-y-2 mb-4">
          {familia.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-2 border border-border rounded-xl px-3 py-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-surface-raised flex items-center justify-center flex-shrink-0 text-xs font-medium">
                  {m.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="text-sm truncate block">
                    {m.nome} {m.user_id === user?.id && <span className="text-muted">(você)</span>}
                  </span>
                  {m.email && <span className="text-xs text-muted truncate block">{m.email}</span>}
                </div>
                {m.papel === "Administrador" && <Shield size={12} className="text-muted flex-shrink-0" />}
              </div>
              {souAdministrador && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <select
                    value={m.papel}
                    onChange={(e) => alterarPapel(m.id, e.target.value as "Administrador" | "Membro")}
                    className="text-xs bg-bg border border-border rounded-full px-2.5 py-1"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Membro">Membro</option>
                  </select>
                  {m.user_id !== user?.id && (
                    <button
                      onClick={() => removerMembro(m.id, m.user_id)}
                      className="text-muted hover:text-danger p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {souAdministrador && (
          <>
            {convitesPendentes.length > 0 && (
              <div className="space-y-1.5 mb-4">
                <p className="text-xs uppercase tracking-wide text-muted font-medium">Convites pendentes</p>
                {convitesPendentes.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-2 border border-border rounded-xl px-3 py-2 text-xs"
                  >
                    <span className="text-muted">
                      {c.papel} · gerado em {formatDataBR(c.criado_em.slice(0, 10))}
                    </span>
                    <button onClick={() => cancelarConvite(c.id)} className="text-muted hover:text-danger">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <select
                value={novoPapel}
                onChange={(e) => setNovoPapel(e.target.value as "Administrador" | "Membro")}
                className="flex-1 text-sm bg-bg border border-border rounded-lg px-3 py-2"
              >
                <option value="Membro">Convidar como Membro</option>
                <option value="Administrador">Convidar como Administrador</option>
              </select>
              <button
                onClick={gerarConvite}
                disabled={gerandoConvite}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg btn-accent text-sm font-medium disabled:opacity-50 flex-shrink-0"
              >
                <UserPlus size={15} /> {gerandoConvite ? "Gerando..." : "Convidar"}
              </button>
            </div>
            <p className="text-xs text-muted mt-2 flex items-center gap-1.5">
              <LinkIcon size={12} /> Gera um link de convite e copia pra você mandar pelo WhatsApp.
            </p>
          </>
        )}
      </div>

      <div className="surface-card p-5">
        <p className="text-sm font-medium mb-3">Dados</p>
        <button
          onClick={() => setModalNota(true)}
          className="w-full text-left text-sm text-text py-2 flex items-center justify-between"
        >
          Importar nota fiscal (QR Code)
          <ChevronRight size={15} className="text-muted" />
        </button>
        <div className="h-px bg-border my-1" />
        <button
          onClick={() => setModalImportar(true)}
          className="w-full text-left text-sm text-text py-2 flex items-center justify-between"
        >
          Importar compras (Excel / CSV)
          <ChevronRight size={15} className="text-muted" />
        </button>
        <div className="h-px bg-border my-1" />
        <button
          onClick={limparListaComprados}
          className="w-full text-left text-sm text-text py-2 flex items-center justify-between"
        >
          Limpar itens já comprados da lista
          <ChevronRight size={15} className="text-muted" />
        </button>
        <div className="h-px bg-border my-1" />
        <button
          onClick={resetarTudo}
          className="w-full text-left text-sm text-danger py-2 flex items-center justify-between"
        >
          Resetar produtos, compras e lista
          <ChevronRight size={15} className="text-danger/40" />
        </button>
      </div>

      {modalImportar && <ImportarModal onFechar={() => setModalImportar(false)} />}
      {modalNota && <ImportarNotaModal onFechar={() => setModalNota(false)} />}
    </div>
  );
}
