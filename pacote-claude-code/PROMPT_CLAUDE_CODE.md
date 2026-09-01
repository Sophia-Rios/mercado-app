# Prompt para o Claude Code — Mercado.App

Cole o conteúdo abaixo como primeira mensagem pro Claude Code, dentro da pasta do projeto (a mesma que já tem `schema.sql`, `seed.sql` e o restante do scaffold Next.js criado antes). Anexe também o arquivo `MercadoApp.jsx` — é a referência viva de tudo que já funciona.

---

## Prompt

Estou retomando um projeto chamado **Mercado.App**, o primeiro módulo de um sistema maior de gestão doméstica (Domus). Ele já tem um protótipo funcional completo construído como artefato React dentro de uma conversa com Claude — o arquivo `MercadoApp.jsx` que anexei é esse protótipo real, rodando, com toda a lógica de negócio já validada por mim no dia a dia. Quero que você use esse arquivo como **referência de comportamento e regras de negócio**, não para copiar a arquitetura dele (ele usa um `window.storage` de artefato que não existe fora desse ambiente) — a stack de verdade é **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase**, com sincronização em tempo real de verdade entre dispositivos.

### Por que migrar do artefato

O protótipo em artefato usa um armazenamento chave-valor que só existe dentro da conversa e não faz sincronização em tempo real — eu só conseguia simular isso com verificação periódica (polling a cada 15s), e isso me trouxe bugs reais: edições que pareciam não salvar porque uma leitura atrasada sobrescrevia a edição recém-feita, e perda de dados quando uma falha de leitura era tratada como "primeira vez usando o app" e resetava tudo. **Use Supabase Realtime (subscriptions) para sincronização entre dispositivos**, não polling. E toda escrita no banco precisa de tratamento de erro visível pro usuário (nunca falhar em silêncio).

### Já existe no projeto (pasta local)

- `schema.sql` — schema inicial (produtos, mercados, compras, lista_compras). **Precisa ser estendido**, ver seção de modelo de dados abaixo — várias tabelas/campos foram adicionados depois que esse schema foi criado.
- `seed.sql` — importação das 227 compras reais de jun–ago/2026, em 3 mercados (Juvenil, Economart, Coelho Diniz), já vinculadas a produtos únicos.
- `MercadoApp.jsx` (anexado agora) — implementação de referência completa, com todas as telas e regras de negócio já funcionando.

### Modelo de dados (estenda o schema.sql existente)

Tabelas necessárias, além das já existentes:

- **produtos**: `nome`, `marca`, `peso_volume`, `categoria`, `codigo_barras`, `estoque_atual`, `estoque_minimo`, `ultima_compra_data`. (`marca` e `peso_volume` já vêm preenchidos no seed a partir da extração correta do PDF original da Sefaz — não são mais campos vazios.)
- **compras**: `produto_id`, `mercado_id` (ou nome do mercado), `quantidade`, `preco_unitario`, `preco_total`, `data_compra`.
- **lista_compras**: `produto_id`, `quantidade_desejada`, `comprado` (boolean).
- **mercados**: `nome`, `cor` (hex, usada nos gráficos), `logo` (imagem — no protótipo é base64 comprimido no cliente antes de salvar; no Supabase, use o Storage do Supabase pra isso em vez de base64 no banco), `endereco`.
- **categorias_cores**: mapa categoria → cor hex (uma linha por categoria, ou uma tabela `categorias` com campo `cor`). Categorias fixas: Mercearia, Hortifruti, Laticínios, Carnes e Aves, Congelados, Padaria, Bebidas, Doces, Limpeza, Higiene Pessoal, Utilidades Domésticas, Bazar e Ferramentas, Frios e Embutidos, Cama mesa e banho, Outros.
- **familia**: `nome`, `papel` (Administrador | Membro) — por enquanto é só organizacional (sem autenticação individual real ainda).
- **usuario_preferencias**: nome, preferências de notificação (estoque baixo, oportunidades de economia — dois booleanos).
- **notificacoes_lidas**: registro de quais notificações (geradas dinamicamente, não persistidas como entidade) já foram marcadas como lidas.

### Telas e funcionalidades (replicar do MercadoApp.jsx)

**Início (dashboard)**
- Cards: itens pendentes na lista, produtos abaixo do estoque mínimo.
- Gráfico de área: gasto mensal (últimos 6 meses), com variação % vs mês anterior.
- Gráfico de barras: gasto por categoria (cor de cada barra = cor da categoria).
- Gráfico de barras: gasto total por mercado (cor de cada barra = cor do mercado).
- Gráfico "Fator economia por mês": compara o preço pago com o menor preço já registrado pra cada produto, em qualquer mercado, mostrando o % de espaço de economia por mês. Linguagem sempre positiva (ex: "já otimizado", "X% de espaço"), nunca "economia perdida".

**Lista de compras**
- Busca/adiciona produto existente ou cadastra um novo direto da busca.
- Ajuste de quantidade, marcar como comprado, remover.
- Estimativa de gasto total baseada no último preço pago de cada item pendente.
- Botão de copiar lista formatada (pra colar no WhatsApp).

**Estoque**
- Lista de produtos com atual/mínimo editável inline, alerta visual "Repor" quando abaixo do mínimo.
- CRUD completo: criar, editar, excluir e **substituir** (mescla o histórico de compras de um produto duplicado em outro e remove o original).
- Ficha do produto: nome, marca, peso/volume, categoria, código de barras, estoque atual/mínimo, data da última compra.
- Dentro da ficha, histórico de preço por mercado daquele produto (menor preço em destaque).

**Mercados**
- Lista de mercados com total gasto, nº de visitas e badge de tendência (Subindo / Caindo / Estável — compara preço da primeira com a última compra de cada produto repetido ali, tira a média).
- Detalhe do mercado: total gasto, visitas, ticket médio, produtos distintos, gráfico de gasto por visita ao longo do tempo.
- Edição do mercado: nome (renomear atualiza em cascata todas as compras), cor, logo, endereço.
- Histórico de compras em formato de cupom fiscal (agrupado por data/visita, com itens e total), filtrável por produto e por período.

**Buscar**
- Busca full-text por produto/marca em todo o histórico de compras.
- Filtros por mercado e por período (de/até).
- Resultado mostra último preço pago, último mercado, e onde historicamente saiu mais barato.
- Campo de busca também centralizado na topbar (versão desktop), levando direto pra essa tela com o termo já preenchido.

**Notificações**
- Geradas dinamicamente (não é uma tabela de eventos, é calculado a partir do estado atual): produtos abaixo do estoque mínimo, produtos que historicamente saem bem mais baratos em outro mercado do que o preço pago na última compra.
- Filtro Todas / Não lidas, marcar como lida individualmente ou tudo de uma vez.
- Cada categoria pode ser desligada nas preferências do usuário.

**Perfil**
- Nome do usuário.
- Preferências de notificação (dois toggles).
- Gestão de família: lista de membros com papel (Administrador/Membro), adicionar/remover. Deixar claro na UI que isso é organizacional até existir autenticação individual de verdade.
- Cores das categorias: um seletor de cor por categoria, usado nos gráficos.
- Importar compras via Excel/CSV: cola uma tabela (colado do Excel ou upload de .csv) com colunas Produto, Marca, Categoria, Mercado, Data, Quantidade, Preço Unitário (aceita variações de cabeçalho, calcula Preço Total sozinho). Mostra prévia antes de confirmar, com linhas problemáticas destacadas.
- **Já existe uma skill separada** (`cupom-sefaz-para-planilha`) que converte o PDF do cupom fiscal da Sefaz nesse formato de tabela — a importação no app precisa aceitar exatamente esse formato de saída.

### Design

- Preto e branco, estética minimalista tipo site da Apple — sem os gradientes roxos de versões anteriores do projeto.
- Logo "Mercado.App" em fonte geométrica (Space Grotesk ou similar).
- Sidebar fixa à esquerda no desktop, com os itens do menu logo abaixo da logo; menu inferior fixo no mobile. **Use breakpoints CSS normais do Tailwind aqui** — o protótipo em artefato precisou de um `ResizeObserver` customizado porque vivia num iframe de largura variável; num app Next.js real isso não é necessário, `md:` do Tailwind funciona direto.
- Números (preços, quantidades) em fonte monoespaçada (tabular-nums).
- Transições suaves entre trocas de tela.
- Notificações e perfil acessíveis por ícones na topbar (não escondidos no rodapé da sidebar).

### O que ainda não existe e fica pra depois

- Autenticação individual de verdade (login por pessoa da família).
- Leitor de código de barras (o campo já existe no cadastro do produto, falta a UI de leitura via câmera).
- Notificação de validade de produto (o campo de data existe, falta a lógica de alerta).
- Integração com os outros módulos do Domus (tarefas, receitas).

### Primeiro passo

Antes de escrever qualquer código, leia o `MercadoApp.jsx` inteiro pra entender a lógica de cada tela, depois me proponha como quer dividir o trabalho (schema primeiro, depois telas uma a uma, etc.) antes de começar a gerar arquivos.
