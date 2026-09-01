# Dois bugs na importação de compras

## 1. Compras antigas somem quando o produto já existe (crítico — perda de dado)

**Sintoma:** importei um CSV com 4 compras de "Batata congelada" em datas diferentes
(07/06, 22/06, 05/07, 22/08). O produto "Batata congelada" já existia no banco de
outras importações anteriores. Depois de importar, abrindo o produto no app, só
aparece **1 compra** — as outras 3 sumiram. Confirmei direto no Table Editor do
Supabase, na tabela `compras`: existe mesmo só 1 linha pra esse produto, então o
dado nunca chegou a ser inserido (ou foi sobrescrito) — não é bug de tela.

**Causa provável:** a rota de importação, ao encontrar um produto que já existe
(match por nome), provavelmente está fazendo um `upsert` na tabela `compras` com
uma constraint de unicidade que não inclui `data_compra` — por exemplo, unique em
`(produto_id, mercado_id)` sozinho, ou até um `update` no lugar de `insert`. Isso
faz cada nova compra sobrescrever a anterior em vez de virar uma linha nova.

**Correção esperada:** toda compra importada deve sempre gerar um **insert** novo
em `compras`, nunca um `update`/`upsert` que substitui uma compra existente. Se
quiser evitar duplicar exatamente a mesma compra importada duas vezes, a chave de
deduplicação precisa incluir pelo menos `produto_id + mercado_id + data_compra +
quantidade + preco_unitario` — só pula o insert se TODOS esses campos baterem
exatamente com uma linha já existente.

## 2. Marcas diferentes viram "o mesmo produto" (perde precisão no histórico de preço)

**Sintoma:** "Azeite de oliva extravirgem" existe com marca Galo e com marca
Herdade dos Coteis — são produtos diferentes de verdade, com preços bem diferentes.
"Lasanha bolonhesa" tem o mesmo problema com três marcas (Flip, Perdigão, Pif Paf).
O app trata tudo isso como um produto só, porque o match de produto na importação
usa só o campo `nome`, ignorando `marca`.

**Impacto:** o histórico de preço e o "menor preço já visto" desse produto ficam
comparando marcas diferentes como se fossem a mesma coisa, o que não faz sentido
pra decidir onde vale mais a pena comprar.

**Correção esperada:** o match de produto (tanto na importação de CSV quanto em
qualquer outro lugar que crie/associe produtos) deve considerar `nome` **+**
`marca` juntos como identidade do produto, não só `nome`. Produtos com o mesmo
nome e marcas diferentes (ou uma marca vazia) devem ser tratados como produtos
distintos. Bom também ter uma constraint única em `(nome, marca)` na tabela
`produtos` pra isso ficar garantido no banco, não só na lógica da aplicação.

## Antes de corrigir

Os dois bugs juntos provavelmente já corromperam o que está no banco agora
(produtos de marcas diferentes já mesclados, e compras já perdidas de reimportações
anteriores). Depois de corrigir o código, pode ser necessário limpar e reimportar
os CSVs do zero pra garantir que os dados atuais estão certos — vale confirmar isso
comigo antes de eu reimportar qualquer coisa.
