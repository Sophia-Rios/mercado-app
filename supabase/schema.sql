-- Schema do módulo Mercado (semente do futuro Domus)
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois rode
-- seed.sql pra importar o histórico real de compras.
--
-- IMPORTANTE — antes de rodar isso, vá em Authentication → Providers →
-- Email no painel do Supabase e DESLIGUE "Confirm email". Sem isso, toda
-- pessoa que criar conta (você ou quem você convidar) precisa clicar num
-- link de confirmação por e-mail antes de conseguir entrar — e o
-- remetente padrão do Supabase é limitado e não confiável pra isso. Numa
-- família pequena e de confiança, exigir confirmação de e-mail só
-- atrapalha; se um dia isso virar um app com estranhos se cadastrando,
-- vale religar.

create extension if not exists "pgcrypto";

-- 1. Tabelas principais ------------------------------------------------------
--
-- Cada bloco usa "create table if not exists" (que NÃO altera uma tabela
-- que já exista) seguido de "alter table ... add column if not exists"
-- pra cada coluna — assim o arquivo funciona igual tanto num projeto
-- totalmente vazio quanto num onde uma versão antiga/parcial já rodou
-- antes (o que já aconteceu: uma tentativa anterior criou "produtos" sem
-- a coluna "ultima_compra_data", e como a tabela já existia, o "create
-- table" seguinte não fazia nada — daí o erro "column does not exist").

create table if not exists mercados (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  created_at timestamptz not null default now()
);
alter table mercados add column if not exists cor text not null default '#9CA3AF';
alter table mercados add column if not exists logo_path text;
alter table mercados add column if not exists endereco text;

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  marca text,
  categoria text not null default 'Outros',
  unidade text not null default 'un', -- un, g, kg, ml, l
  quantidade_embalagem numeric not null default 1,
  estoque_minimo numeric not null default 0,
  estoque_atual numeric not null default 0,
  validade_dias_estimado integer,
  created_at timestamptz not null default now(),
  unique (nome, marca)
);
-- estoque é sempre contado na unidade de consumo (ex: rolo), não na
-- embalagem de compra (ex: fardo) — quantidade_unidade_consumo é quantas
-- unidades de consumo vêm em UMA embalagem desse produto específico. Como
-- cada linha de produtos já representa uma variação/tamanho específico
-- (o nome já traz isso, ex: "Papel Higiênico Neve 12 rolos"), pacotes de
-- tamanhos diferentes do mesmo item viram produtos diferentes.
alter table produtos add column if not exists unidade_consumo text;
alter table produtos add column if not exists quantidade_unidade_consumo numeric;
alter table produtos add column if not exists peso_volume text;
alter table produtos add column if not exists codigo_barras text;
alter table produtos add column if not exists ultima_compra_data date;
alter table produtos add column if not exists foto_path text;

create table if not exists compras (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid,
  mercado_id uuid not null references mercados(id) on delete restrict,
  quantidade numeric not null default 1,
  preco_unitario numeric not null,
  preco_total numeric not null,
  data_compra date not null,
  data_validade date,
  created_at timestamptz not null default now()
);
-- produto_id fica nullable de propósito: excluir um produto (tela Estoque)
-- não pode apagar o histórico financeiro dele — a compra sobrevive, só
-- perde a filiação com o produto específico (ON DELETE SET NULL, não
-- CASCADE). Refaz a constraint do zero pra garantir isso mesmo que uma
-- versão anterior tenha criado com NOT NULL / CASCADE.
alter table compras alter column produto_id drop not null;
alter table compras drop constraint if exists compras_produto_id_fkey;
alter table compras
  add constraint compras_produto_id_fkey
  foreign key (produto_id) references produtos(id) on delete set null;

create table if not exists lista_compras (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos(id) on delete cascade,
  quantidade_desejada numeric not null default 1,
  comprado boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists categorias (
  nome text primary key,
  cor text not null
);

insert into categorias (nome, cor) values
  ('Mercearia', '#F59E0B'),
  ('Hortifruti', '#10B981'),
  ('Laticínios', '#3B82F6'),
  ('Carnes e Aves', '#EF4444'),
  ('Congelados', '#06B6D4'),
  ('Padaria', '#D97706'),
  ('Bebidas', '#8B5CF6'),
  ('Doces', '#EC4899'),
  ('Limpeza', '#14B8A6'),
  ('Higiene Pessoal', '#F472B6'),
  ('Utilidades Domésticas', '#6366F1'),
  ('Bazar e Ferramentas', '#78716C'),
  ('Frios e Embutidos', '#DC2626'),
  ('Cama, mesa e banho', '#A855F7'),
  ('Outros', '#9CA3AF')
on conflict (nome) do nothing;

-- cada linha vira uma conta de login real (via convite ou bootstrap)
create table if not exists familia (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  papel text not null default 'Membro' check (papel in ('Administrador', 'Membro')),
  created_at timestamptz not null default now()
);
alter table familia add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table familia add column if not exists email text;
create unique index if not exists familia_user_id_key on familia (user_id);

-- linha única — sem login individual não haveria por onde guardar isso,
-- agora que existe login dá pra pensar em mover pra "familia" no futuro
create table if not exists usuario_preferencias (
  id boolean primary key default true check (id),
  nome text not null default 'Você',
  notif_estoque_baixo boolean not null default true,
  notif_economia boolean not null default true
);
insert into usuario_preferencias (id) values (true) on conflict (id) do nothing;

-- notificações são calculadas na hora, não persistidas — só o "lida" fica
create table if not exists notificacoes_lidas (
  notif_id text primary key,
  lida_em timestamptz not null default now()
);

-- token de uso único que vira o link de convite mandado por WhatsApp
create table if not exists convites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  papel text not null default 'Membro' check (papel in ('Administrador', 'Membro')),
  criado_por uuid references auth.users(id),
  criado_em timestamptz not null default now(),
  usado_em timestamptz,
  usado_por uuid references auth.users(id)
);

-- 2. (nada aqui — uma view auxiliar "historico_precos" existiu nessa seção
-- em versões anteriores do arquivo, mas nunca chegou a ser usada pelo
-- código do app: a lógica de "menor preço por mercado" acabou sendo feita
-- direto no front-end. Views normais do Postgres rodam com o privilégio
-- de quem criou a view, não de quem consulta — ou seja, ela ignorava
-- silenciosamente a RLS pra quem quer que a consultasse pela API. Como
-- não tinha uso nenhum, a forma mais segura de resolver foi remover.
drop view if exists historico_precos;

-- 3. Mantém produtos.ultima_compra_data em dia sozinho -----------------------

create or replace function atualizar_ultima_compra()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update produtos
    set ultima_compra_data = new.data_compra
    where id = new.produto_id
      and (ultima_compra_data is null or new.data_compra > ultima_compra_data);
  return new;
end;
$$;

drop trigger if exists trg_atualizar_ultima_compra on compras;
create trigger trg_atualizar_ultima_compra
  after insert or update of data_compra on compras
  for each row execute function atualizar_ultima_compra();

-- 4. Funções de autenticação e convite ---------------------------------------
--
-- Todas as funções SECURITY DEFINER abaixo travam explicitamente o
-- search_path (evita um ataque clássico de shadowing de objetos).
--
-- "eh_da_familia" e "eh_administrador" só servem pra uso interno dentro de
-- políticas de RLS — nunca deveriam ser chamáveis direto pela API. Em vez
-- de depender só de REVOKE/GRANT por função (que na prática não bastou:
-- o Security Advisor continuou reportando as duas como alcançáveis por
-- anon mesmo depois de revogadas), elas vivem num schema "private" que o
-- PostgREST nunca expõe — por padrão o Supabase só expõe o schema
-- "public", então qualquer coisa fora dele já não tem endpoint /rest/v1/
-- nenhum, independente de GRANT.
create schema if not exists private;
grant usage on schema private to authenticated;

-- limpa as versões antigas em "public" de tentativas anteriores — elas
-- não podem continuar existindo expostas na API, e políticas antigas que
-- ainda apontavam pra elas saem junto (recriadas mais abaixo)
drop function if exists public.eh_da_familia() cascade;
drop function if exists public.eh_administrador() cascade;

-- "essa conta logada pertence à família?" — usada em toda política de RLS
create or replace function private.eh_da_familia()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from familia where user_id = auth.uid());
$$;

revoke execute on function private.eh_da_familia() from public;
grant execute on function private.eh_da_familia() to authenticated;

-- "essa conta logada é administradora?" — usada nas políticas que só
-- administrador pode fazer (editar/remover família, gerenciar convites)
create or replace function private.eh_administrador()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from familia where user_id = auth.uid() and papel = 'Administrador');
$$;

revoke execute on function private.eh_administrador() from public;
grant execute on function private.eh_administrador() to authenticated;

-- valida um token de convite sem expor a tabela inteira pra quem ainda não
-- tem conta (a pessoa convidada abre /convite/<token> antes de se
-- cadastrar) — essa PRECISA continuar em "public" e chamável por "anon",
-- é assim que a tela de convite funciona sem login prévio
create or replace function validar_convite(token_busca text)
returns table (papel text, valido boolean)
language sql security definer
set search_path = public
as $$
  select papel, (usado_em is null) as valido
  from convites
  where token = token_busca;
$$;

revoke execute on function validar_convite(text) from public;
grant execute on function validar_convite(text) to anon, authenticated;

-- primeira conta (bootstrap) — só funciona se "familia" estiver vazia, pra
-- você conseguir criar sua própria conta de administrador sem precisar de
-- um convite que ninguém ainda pode gerar. Confere auth.uid() explicitamente
-- (defesa extra: mesmo que a revogação de EXECUTE falhasse por algum
-- motivo, a função rejeita sozinha quem não estiver logado).
create or replace function criar_primeira_conta(nome_novo text)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Não autenticado.';
  end if;
  if exists (select 1 from familia) then
    raise exception 'Já existe uma família cadastrada. Peça um convite pra um administrador.';
  end if;
  insert into familia (user_id, nome, papel, email)
  values (auth.uid(), nome_novo, 'Administrador', (select email from auth.users where id = auth.uid()));
end;
$$;

revoke execute on function criar_primeira_conta(text) from public;
grant execute on function criar_primeira_conta(text) to authenticated;

-- aceitar convite: vincula a conta recém-criada à família e marca o
-- convite como usado, tudo de uma vez. Mesma defesa extra de auth.uid().
create or replace function aceitar_convite(token_busca text, nome_novo text)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  convite_id uuid;
  papel_convite text;
begin
  if auth.uid() is null then
    raise exception 'Não autenticado.';
  end if;

  select id, papel into convite_id, papel_convite
  from convites
  where token = token_busca and usado_em is null;

  if convite_id is null then
    raise exception 'Convite inválido ou já usado.';
  end if;

  insert into familia (user_id, nome, papel, email)
  values (auth.uid(), nome_novo, papel_convite, (select email from auth.users where id = auth.uid()));

  update convites set usado_em = now(), usado_por = auth.uid() where id = convite_id;
end;
$$;

revoke execute on function aceitar_convite(text, text) from public;
grant execute on function aceitar_convite(text, text) to authenticated;

-- 5. RLS: só quem tem conta E está na família consegue ler/escrever --------

alter table mercados enable row level security;
alter table produtos enable row level security;
alter table compras enable row level security;
alter table lista_compras enable row level security;
alter table categorias enable row level security;
alter table familia enable row level security;
alter table usuario_preferencias enable row level security;
alter table notificacoes_lidas enable row level security;
alter table convites enable row level security;

-- limpa nomes de política de qualquer tentativa anterior (as tentativas já
-- feitas nesse projeto usaram "authenticated full access" e "acesso da
-- casa" antes deste arquivo existir) — sem isso, "create policy" com um
-- nome que já existe falha com "policy already exists"
drop policy if exists "authenticated full access" on mercados;
drop policy if exists "acesso da casa" on mercados;
drop policy if exists "familia autenticada" on mercados;
drop policy if exists "authenticated full access" on produtos;
drop policy if exists "acesso da casa" on produtos;
drop policy if exists "familia autenticada" on produtos;
drop policy if exists "authenticated full access" on compras;
drop policy if exists "acesso da casa" on compras;
drop policy if exists "familia autenticada" on compras;
drop policy if exists "authenticated full access" on lista_compras;
drop policy if exists "acesso da casa" on lista_compras;
drop policy if exists "familia autenticada" on lista_compras;
drop policy if exists "acesso da casa" on categorias;
drop policy if exists "familia autenticada" on categorias;
drop policy if exists "acesso da casa" on usuario_preferencias;
drop policy if exists "familia autenticada" on usuario_preferencias;
drop policy if exists "acesso da casa" on notificacoes_lidas;
drop policy if exists "familia autenticada" on notificacoes_lidas;
drop policy if exists "acesso da casa" on familia;
drop policy if exists "familia le todos" on familia;
drop policy if exists "administrador edita familia" on familia;
drop policy if exists "administrador remove familia" on familia;
drop policy if exists "autenticado gerencia convites" on convites;
drop policy if exists "administrador gerencia convites" on convites;

create policy "familia autenticada" on mercados for all to authenticated using (private.eh_da_familia()) with check (private.eh_da_familia());
create policy "familia autenticada" on produtos for all to authenticated using (private.eh_da_familia()) with check (private.eh_da_familia());
create policy "familia autenticada" on compras for all to authenticated using (private.eh_da_familia()) with check (private.eh_da_familia());
create policy "familia autenticada" on lista_compras for all to authenticated using (private.eh_da_familia()) with check (private.eh_da_familia());
create policy "familia autenticada" on categorias for all to authenticated using (private.eh_da_familia()) with check (private.eh_da_familia());
create policy "familia autenticada" on usuario_preferencias for all to authenticated using (private.eh_da_familia()) with check (private.eh_da_familia());
create policy "familia autenticada" on notificacoes_lidas for all to authenticated using (private.eh_da_familia()) with check (private.eh_da_familia());

-- familia: todo mundo da família vê a lista toda (organizacional), mas só
-- Administrador edita papel ou remove alguém. Não existe política de
-- INSERT aqui de propósito — a única forma de entrar em "familia" é pelas
-- funções security definer acima (bootstrap ou convite válido).
create policy "familia le todos" on familia for select to authenticated using (private.eh_da_familia());
create policy "administrador edita familia" on familia for update to authenticated using (private.eh_administrador());
create policy "administrador remove familia" on familia for delete to authenticated using (
  private.eh_administrador() and user_id != auth.uid() -- ninguém se autoexclui por acidente
);

-- convites: só administrador gerencia (gerar, ver, cancelar). Antes essa
-- política era "using (true)" pra qualquer autenticado — o linter de
-- segurança do Supabase pegou isso certo: um Membro comum poderia usar
-- essa brecha pra se autopromover gerando um convite de Administrador.
create policy "administrador gerencia convites" on convites for all to authenticated using (private.eh_administrador()) with check (private.eh_administrador());

-- 6. Storage: bucket público para logos de mercado --------------------------

insert into storage.buckets (id, name, public)
values ('logos-mercados', 'logos-mercados', true)
on conflict (id) do nothing;

drop policy if exists "logos leitura publica" on storage.objects;
drop policy if exists "logos escrita da casa" on storage.objects;
drop policy if exists "logos escrita da familia" on storage.objects;

-- sem política de SELECT de propósito: bucket público já serve os
-- arquivos direto por URL (getPublicUrl) sem passar pela RLS de
-- storage.objects. Ter uma política de SELECT "using (true)" só serviria
-- pra permitir listar/enumerar todos os arquivos do bucket via API, que
-- não é algo que o app usa e não deveria ficar exposto.
create policy "logos escrita da familia" on storage.objects
  for all to authenticated
  using (bucket_id = 'logos-mercados' and private.eh_da_familia())
  with check (bucket_id = 'logos-mercados' and private.eh_da_familia());

-- 6b. Storage: bucket público para fotos de produto --------------------------

insert into storage.buckets (id, name, public)
values ('fotos-produtos', 'fotos-produtos', true)
on conflict (id) do nothing;

drop policy if exists "fotos produto escrita da familia" on storage.objects;

create policy "fotos produto escrita da familia" on storage.objects
  for all to authenticated
  using (bucket_id = 'fotos-produtos' and private.eh_da_familia())
  with check (bucket_id = 'fotos-produtos' and private.eh_da_familia());

-- 7. Realtime: garante que toda tabela emite postgres_changes ---------------
-- (é isso que substitui o polling — sem isso, edições feitas num aparelho
-- não aparecem sozinhas nos outros). Checa a associação direto em
-- pg_publication_tables em vez de tentar e capturar um erro de "já existe"
-- — depender do nome exato do código de erro já causou um bug aqui uma vez.

do $$
declare
  tabela text;
begin
  foreach tabela in array array[
    'mercados', 'produtos', 'compras', 'lista_compras', 'categorias',
    'familia', 'usuario_preferencias', 'notificacoes_lidas', 'convites'
  ]
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = tabela
    ) then
      execute format('alter publication supabase_realtime add table %I', tabela);
    end if;
  end loop;
end $$;
