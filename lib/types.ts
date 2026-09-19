export type Mercado = {
  id: string
  nome: string
  cor: string
  logo_path: string | null
  endereco: string | null
}

export type Produto = {
  id: string
  nome: string
  marca: string | null
  categoria: string
  unidade: string
  quantidade_embalagem: number
  estoque_minimo: number
  estoque_atual: number
  validade_dias_estimado: number | null
  peso_volume: string | null
  codigo_barras: string | null
  ultima_compra_data: string | null
  // estoque é sempre contado na unidade de consumo (ex: rolo), não na
  // embalagem de compra (ex: fardo) — quantidade_unidade_consumo é quantas
  // unidades de consumo vêm em UMA embalagem desse produto específico.
  // Como cada linha de "produtos" já representa uma variação/tamanho
  // específico (o nome já traz isso, ex: "Papel Higiênico Neve 12 rolos"),
  // pacotes de tamanhos diferentes do mesmo item viram produtos diferentes,
  // cada um com seu próprio valor aqui — não precisa de conversão dinâmica.
  unidade_consumo: string | null
  quantidade_unidade_consumo: number | null
  foto_path: string | null
}

export type Compra = {
  id: string
  produto_id: string | null
  mercado_id: string
  quantidade: number
  preco_unitario: number
  preco_total: number
  data_compra: string
  data_validade: string | null
  produto?: Produto
  mercado?: Mercado
}

export type ItemLista = {
  id: string
  produto_id: string
  quantidade_desejada: number
  comprado: boolean
  criado_em: string
  produto?: Produto
}

export type Categoria = {
  nome: string
  cor: string
}

export type MembroFamilia = {
  id: string
  user_id: string | null
  email: string | null
  nome: string
  papel: 'Administrador' | 'Membro'
  created_at: string
}

export type Convite = {
  id: string
  token: string
  papel: 'Administrador' | 'Membro'
  criado_por: string | null
  criado_em: string
  usado_em: string | null
  usado_por: string | null
}

export type UsuarioPreferencias = {
  id: true
  nome: string
  notif_estoque_baixo: boolean
  notif_economia: boolean
}

export type NotificacaoLida = {
  notif_id: string
  lida_em: string
}
