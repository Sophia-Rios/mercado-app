# Mercado · Domus (módulo standalone)

App local de gestão de mercado: lista de compras, estoque com alerta de mínimo,
e histórico de preço comparando os supermercados que você usa. É o primeiro
módulo do Domus, pensado para já nascer com a estrutura de banco que o app
completo vai usar depois.

## Passo 1 — Criar o projeto no Supabase

1. Acesse https://supabase.com e crie um projeto novo (gratuito).
2. Vá em **Authentication → Providers → Email** e **desligue "Confirm
   email"** (numa família pequena, exigir confirmação por e-mail só
   atrapalha o cadastro — o remetente padrão do Supabase é limitado e não
   é feito pra isso).
3. No painel do projeto, vá em **SQL Editor** e rode o conteúdo de
   `supabase/schema.sql` (cria todas as tabelas, funções de login/convite,
   políticas de acesso e o bucket de Storage pros logos dos mercados).
4. Depois, rode o conteúdo de `supabase/seed.sql` (importa as 227 compras
   reais da sua planilha de junho a agosto de 2026, já organizadas por
   produto e mercado).
5. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.

## Passo 2 — Configurar o projeto local

1. Copie `.env.local.example` para `.env.local`.
2. Cole a URL e a chave do Supabase nas duas variáveis.

## Passo 3 — Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Funciona em celular e desktop.

Na primeira vez, vá em **/criar-conta** e crie sua conta de administrador
(só funciona uma vez — depois disso, todo mundo entra pelo link de convite
que você gera no Perfil).

## Se for abrir com Claude Code

Abra essa pasta como projeto no Claude Code e peça o que quiser evoluir,
por exemplo: "adiciona leitor de código de barras na lista de compras" ou
"cria a tela de receitas". O Claude Code já vai entender a estrutura porque
o schema e os componentes estão organizados por módulo.

## O que já está pronto

- **Início** — itens pendentes, produtos abaixo do mínimo, gasto mensal,
  gasto por categoria, gasto por mercado e o "fator economia por mês".
- **Lista de compras** — busca ou cadastra produto na hora, ajusta
  quantidade, estimativa de gasto total baseada no último preço pago,
  botão de copiar a lista formatada pra colar no WhatsApp.
- **Estoque** — CRUD completo (criar, editar, excluir, substituir um
  produto duplicado mesclando o histórico), código de barras, categoria
  colorida, histórico de preço por mercado na ficha do produto.
- **Mercados** — lista com tendência de preço, ficha com gráfico de gasto
  por visita e histórico em formato de cupom fiscal, edição de nome/cor/
  logo/endereço.
- **Buscar** — full-text por produto/marca, filtro por mercado e período,
  mostra onde historicamente saiu mais barato.
- **Notificações** — calculadas na hora a partir do estoque e do histórico
  (nunca uma tabela de eventos), marcar como lida individual ou tudo.
- **Perfil** — nome, preferências de notificação, cores das categorias,
  gestão de família (convite por link, papel de administrador/membro),
  importar compras via Excel/CSV.
- **Login por e-mail/senha**, com convite de novos membros por link (gerado
  no Perfil, manda por WhatsApp) — só quem tem conta na família acessa os
  dados.
- **Leitor de código de barras** via câmera na ficha do produto (precisa
  de HTTPS em produção; funciona em `localhost` sem HTTPS).
- Sincronização entre dispositivos via **Supabase Realtime** (não polling)
  — qualquer escrita em qualquer aparelho atualiza os outros na hora.

## O que ainda falta (fica pro próximo módulo ou pra V2)

- Data de validade com notificação (o campo já existe no banco, falta a UI).
- Integração com os módulos de Tarefas e Receitas do Domus completo.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase.
Fontes: Sora (títulos), Manrope (corpo), JetBrains Mono (preços e números).
