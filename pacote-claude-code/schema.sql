-- Schema do módulo Mercado (semente do futuro Domus)
-- Rode este arquivo no SQL Editor do seu projeto Supabase antes de tudo.

create extension if not exists "pgcrypto";

create table if not exists mercados (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  marca text,
  categoria text not null default 'Outros',
  unidade text not null default 'un', -- un, g, kg, ml, l
  quantidade_embalagem numeric not null default 1,
  unidade_consumo text, -- ex: fardo -> unidade individual
  quantidade_unidade_consumo numeric,
  estoque_minimo numeric not null default 0,
  estoque_atual numeric not null default 0,
  validade_dias_estimado integer,
  created_at timestamptz not null default now(),
  unique (nome, marca)
);

create table if not exists compras (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos(id) on delete cascade,
  mercado_id uuid not null references mercados(id) on delete restrict,
  quantidade numeric not null default 1,
  preco_unitario numeric not null,
  preco_total numeric not null,
  data_compra date not null,
  data_validade date,
  created_at timestamptz not null default now()
);

create table if not exists lista_compras (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos(id) on delete cascade,
  quantidade_desejada numeric not null default 1,
  comprado boolean not null default false,
  criado_em timestamptz not null default now()
);

-- view auxiliar: último preço e mercado mais barato por produto
create or replace view historico_precos as
select
  c.produto_id,
  p.nome as produto_nome,
  m.nome as mercado_nome,
  c.preco_unitario,
  c.data_compra,
  rank() over (partition by c.produto_id order by c.data_compra desc) as recencia,
  rank() over (partition by c.produto_id order by c.preco_unitario asc) as ranking_preco
from compras c
join produtos p on p.id = c.produto_id
join mercados m on m.id = c.mercado_id;

alter table mercados enable row level security;
alter table produtos enable row level security;
alter table compras enable row level security;
alter table lista_compras enable row level security;

-- MVP para 2 pessoas: qualquer usuário autenticado lê e escreve tudo.
-- Quando o Domus virar multiusuário de verdade, trocar por política por household_id.
create policy "authenticated full access" on mercados for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on produtos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on compras for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on lista_compras for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
