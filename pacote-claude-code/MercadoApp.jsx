import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";
import {
  Home, ShoppingCart, Package, Search, Plus, Check, Trash2, AlertTriangle,
  TrendingDown, SlidersHorizontal, Copy, X, Pencil, Barcode, Repeat,
  Bell, User as UserIcon, ChevronRight, BellOff, TrendingUp as TrendingUpIcon,
  Store, Minus, ArrowLeft, Users, Shield, UserPlus, RefreshCw,
} from "lucide-react";

const SEED = {"produtos":[{"nome":"Achoc. Po Nescau 900g Nescau 900g","categoria":"Mercearia"},{"nome":"Alho picado Mais 350g","categoria":"Hortifruti"},{"nome":"Amaciante de roupas Ypê 2L","categoria":"Limpeza"},{"nome":"Azeite de oliva extravirgem Herdade dos Coteis 500ml","categoria":"Mercearia"},{"nome":"Batata palha Creck 300g","categoria":"Mercearia"},{"nome":"Bebida láctea morango Brasil 1,150g","categoria":"Laticínios"},{"nome":"Biscoito amanteigado sabor chocolate Marilan 280g","categoria":"Mercearia"},{"nome":"Chocolate de confeitos Arcor Tortuguita 80g","categoria":"Doces"},{"nome":"Creme de leite Piracanjuba 200g","categoria":"Laticínios"},{"nome":"Leite integral Ibituruna 1L","categoria":"Laticínios"},{"nome":"Limão - 615g","categoria":"Hortifruti"},{"nome":"Milho de pipoca premium Anchieta 500g","categoria":"Mercearia"},{"nome":"Milho verde em lata Predilecta 170g","categoria":"Mercearia"},{"nome":"Molho de tomate tradicional (sachê) Pomarola 300g","categoria":"Mercearia"},{"nome":"Molho premium para carne WF 150ml","categoria":"Mercearia"},{"nome":"Páprica defumada Quintal 10g","categoria":"Mercearia"},{"nome":"Pimenta do reino em pó (pote) Sabor 30g","categoria":"Mercearia"},{"nome":"Refresco em pó Tang 18g","categoria":"Bebidas"},{"nome":"Requeijão cremoso tradicional Mutumilk 350g","categoria":"Laticínios"},{"nome":"Tapioca Amafil 500g","categoria":"Mercearia"},{"nome":"Vinagre de álcool Anchieta 750ml","categoria":"Mercearia"},{"nome":"Arroz branco tipo 1 Rei Arthur 5kg","categoria":"Mercearia"},{"nome":"Abóbora Itália - 1239g","categoria":"Hortifruti"},{"nome":"Absorvente higiênico, c/30 Instimus -","categoria":"Higiene Pessoal"},{"nome":"Açúcar cristal Delta 2kg","categoria":"Mercearia"},{"nome":"Alface lisa - -","categoria":"Hortifruti"},{"nome":"Amaciante de roupas Ypê 7L","categoria":"Limpeza"},{"nome":"Azeitona verde sem caroço Mariza 160g","categoria":"Mercearia"},{"nome":"Bacon em cubos Saudali 200g","categoria":"Carnes e Aves"},{"nome":"Batata congelada Pif Paf 2kg","categoria":"Congelados"},{"nome":"Batata inglesa - 1086g","categoria":"Hortifruti"},{"nome":"Bife de hambúrguer Rezende -","categoria":"Congelados"},{"nome":"Biscoito maizena Ninfa 700g","categoria":"Mercearia"},{"nome":"Biscoito rosquinha Rancheiro 500g","categoria":"Mercearia"},{"nome":"Caixa de bombons Lacta 250,6g","categoria":"Mercearia"},{"nome":"Cebola amarela - 524g","categoria":"Hortifruti"},{"nome":"Cebolinha - -","categoria":"Hortifruti"},{"nome":"Cenoura - 1055g","categoria":"Hortifruti"},{"nome":"Chicken bits Rezende 1kg","categoria":"Carnes e Aves"},{"nome":"Chocolate Snickers 42g/45g","categoria":"Doces"},{"nome":"Chocolate em tablete ao leite Neugebauer 80g","categoria":"Doces"},{"nome":"Colorau Sabor 100g","categoria":"Mercearia"},{"nome":"Condimento lemon pepper (mini sachê) - 15g","categoria":"Mercearia"},{"nome":"Creme de leite levíssimo Ibituruna 200g","categoria":"Laticínios"},{"nome":"Detergente líquido neutro Ypê 500ml","categoria":"Limpeza"},{"nome":"Ervilha em conserva (vidro) Olé 170g","categoria":"Mercearia"},{"nome":"Faca inox para carne (N8) - -","categoria":"Bazar e Ferramentas"},{"nome":"Farinha de trigo Boa Sorte 1kg","categoria":"Mercearia"},{"nome":"Fermento em pó Apti 100g","categoria":"Mercearia"},{"nome":"Filé peito de frango (bandeja) Seara 1kg","categoria":"Carnes e Aves"},{"nome":"Filezinho de frango (sassâmi) - 1kg","categoria":"Carnes e Aves"},{"nome":"Forma de gelo de silicone - -","categoria":"Utilidades Domésticas"},{"nome":"Frango desfiado Tropeira 400g","categoria":"Carnes e Aves"},{"nome":"Guardanapo de papel, 50un Mili -","categoria":"Utilidades Domésticas"},{"nome":"Jogo de copos de vidro, 6un - -","categoria":"Utilidades Domésticas"},{"nome":"Ketchup sabor bacon Heinz 397g","categoria":"Mercearia"},{"nome":"Kit refrigerante Coca + Fanta laranja - 2L","categoria":"Bebidas"},{"nome":"Kit sabonete íntimo Vizet 400ml","categoria":"Higiene Pessoal"},{"nome":"Kit sal de churrasco Parrilla Gonzalo -","categoria":"Mercearia"},{"nome":"Lâmina para serra em arco, 3un - -","categoria":"Bazar e Ferramentas"},{"nome":"Lasanha bolonhesa Pif Paf 600g","categoria":"Congelados"},{"nome":"Limpador multiuso (limpeza milagrosa) Cif 450ml","categoria":"Limpeza"},{"nome":"Limpador multiuso com antibac Cif 500ml","categoria":"Limpeza"},{"nome":"Macarrão espaguete Vilma 500g","categoria":"Mercearia"},{"nome":"Macarrão pena Santa Amália 500g","categoria":"Mercearia"},{"nome":"Maionese Hellmann's 500g","categoria":"Mercearia"},{"nome":"Molho de tomate tradicional (sachê) Pomarola 460g","categoria":"Mercearia"},{"nome":"Óleo de soja Liza 900ml","categoria":"Mercearia"},{"nome":"Pão francês - 862g","categoria":"Padaria"},{"nome":"Pepino - 688g","categoria":"Hortifruti"},{"nome":"Refresco Tang (pacote 18 unidades) Tang 18un x 18g","categoria":"Bebidas"},{"nome":"Sal grosso para churrasco Lebre 1kg","categoria":"Mercearia"},{"nome":"Salsinha - -","categoria":"Hortifruti"},{"nome":"Toalha de papel, 3 rolos Snob -","categoria":"Utilidades Domésticas"},{"nome":"Tomate andrea - 450g","categoria":"Hortifruti"},{"nome":"Torrada integral Visconti 120g","categoria":"Padaria"},{"nome":"Farinha panko Anchieta -","categoria":"Mercearia"},{"nome":"Filme PVC Globopack -","categoria":"Utilidades Domésticas"},{"nome":"Leite condensado Piracanjuba 395g","categoria":"Laticínios"},{"nome":"Pão de forma Pullman 480g","categoria":"Padaria"},{"nome":"Aveia em flocos finos Vitao 400g","categoria":"Mercearia"},{"nome":"Balança de cozinha - -","categoria":"Utilidades Domésticas"},{"nome":"Banana prata - 1116g","categoria":"Hortifruti"},{"nome":"Batata asterix - 1014g","categoria":"Hortifruti"},{"nome":"Batata palha Fritop 800g","categoria":"Mercearia"},{"nome":"Bombom (caixa Favoritos) Lacta -","categoria":"Doces"},{"nome":"Cebola amarela - 256g","categoria":"Hortifruti"},{"nome":"Copo medidor - -","categoria":"Utilidades Domésticas"},{"nome":"Escova sanitária com estojo Baianinha -","categoria":"Utilidades Domésticas"},{"nome":"Filé peito frango desfiado Pif Paf 400g","categoria":"Carnes e Aves"},{"nome":"Granola tradicional Vitao 250g","categoria":"Mercearia"},{"nome":"Leite integral Ita 1L","categoria":"Laticínios"},{"nome":"Maionese Hellmann's 1kg","categoria":"Mercearia"},{"nome":"Papel higiênico, 16 rolos de 60m Cameratta -","categoria":"Higiene Pessoal"},{"nome":"Sabonete Biofleur 180g","categoria":"Higiene"},{"nome":"Canela em pó Anchieta 30g","categoria":"Mercearia"},{"nome":"Filezinho de frango (sassâmi) Sadia 1kg","categoria":"Carnes e Aves"},{"nome":"Molho pimenta com goiaba WF 150ml","categoria":"Mercearia"},{"nome":"Açafrão Brasileirinho 10g","categoria":"Mercearia"},{"nome":"Alho - 240g","categoria":"Hortifruti"},{"nome":"Amido de milho Pacha 500g","categoria":"Mercearia"},{"nome":"Batata - 1788g","categoria":"Hortifruti"},{"nome":"Brigadeiro Gelástica 120g","categoria":"Mercearia"},{"nome":"Cenoura - 785g","categoria":"Hortifruti"},{"nome":"Desodorante roll on Blue (kit 2un) Giovanna Baby 50ml","categoria":"Higiene Pessoal"},{"nome":"Desodorante roll on Candy Giovanna Baby 50ml","categoria":"Higiene Pessoal"},{"nome":"Filé peito frango (bandeja) Seara 1kg","categoria":"Carnes e Aves"},{"nome":"Ketchup tradicional Cepêra 1,01kg","categoria":"Mercearia"},{"nome":"Limão tahiti - 415g","categoria":"Hortifruti"},{"nome":"Louro Brasileirinho 5g","categoria":"Mercearia"},{"nome":"Macarrão pappardelle com ovos Vilma Ninho 500g","categoria":"Mercearia"},{"nome":"Macarrão sêmola pena Galo 500g","categoria":"Mercearia"},{"nome":"Massa para tapioca Pacha 500g","categoria":"Mercearia"},{"nome":"Mel Naturapis 280g","categoria":"Mercearia"},{"nome":"Pão de forma Delícias do Trigo 400g","categoria":"Padaria"},{"nome":"Pão de queijo Tino 800g","categoria":"Padaria"},{"nome":"Papel manteiga Boreda 30cm x 7,5m","categoria":"Limpeza"},{"nome":"Páprica defumada Sabor 10g","categoria":"Mercearia"},{"nome":"Requeijão tradicional Alegre 400g","categoria":"Laticínios"},{"nome":"Saco de lixo econômico, 25un Baglixo 100L","categoria":"Limpeza"},{"nome":"Biscoito teens sabores Marilan 80g","categoria":"Mercearia"},{"nome":"Café moído Salomão 250g","categoria":"Mercearia"},{"nome":"Cebola - 600g","categoria":"Hortifruti"},{"nome":"Cereal matinal Sucrilhos Kellogg's 240g","categoria":"Mercearia"},{"nome":"Filé peito de frango (bandeja) Pif Paf 1kg","categoria":"Carnes e Aves"},{"nome":"Filezinho peito de frango (bandeja) Seara 1kg","categoria":"Carnes e Aves"},{"nome":"Lasanha congelada Pif Paf 600g","categoria":"Congelados"},{"nome":"Limão - 625g","categoria":"Hortifruti"},{"nome":"Macarrão cortado sêmola Santa Amália 500g","categoria":"Mercearia"},{"nome":"Macarrão espaguete sêmola Santa Amália 1kg","categoria":"Mercearia"},{"nome":"Milho verde em lata Quero 170g","categoria":"Mercearia"},{"nome":"Molho de tomate tradicional Heinz 240g","categoria":"Mercearia"},{"nome":"Refresco em pó Frisco 18g","categoria":"Bebidas"},{"nome":"Sabonete gelato Albany 80g","categoria":"Higiene Pessoal"},{"nome":"Shampoo anticaspa Clear 200ml","categoria":"Higiene Pessoal"},{"nome":"Álcool 70% Sul Álcool -","categoria":"Limpeza"},{"nome":"Aparador de barba (shaver) BIC -","categoria":"Higiene Pessoal"},{"nome":"Cereal matinal sabor chocolate (Nescau) Nestlé 210g","categoria":"Mercearia"},{"nome":"Desengordurante UAU 500ml","categoria":"Limpeza"},{"nome":"Detergente líquido côco Ypê 500ml","categoria":"Limpeza"},{"nome":"Limpa vidro Veja 500ml","categoria":"Limpeza"},{"nome":"Mostarda Predilecta 180g","categoria":"Mercearia"},{"nome":"Pão de forma Milani 450g","categoria":"Padaria"},{"nome":"Perfume para casa (brisa) UAU -","categoria":"Limpeza"},{"nome":"Tempero alho e sal Irici 300g","categoria":"Mercearia"},{"nome":"Tesoura multiuso - -","categoria":"Utilidades Domésticas"},{"nome":"Alface crespa hidropônica - -","categoria":"Hortifruti"},{"nome":"Alho - 304g","categoria":"Hortifruti"},{"nome":"Azeite de oliva extravirgem Gallo 500ml","categoria":"Mercearia"},{"nome":"Banana prata - 765g","categoria":"Hortifruti"},{"nome":"Batata - 3095g","categoria":"Hortifruti"},{"nome":"Batata para airfryer Bem Brasil 700g","categoria":"Congelados"},{"nome":"Biscoito maizena Marilan 300g","categoria":"Mercearia"},{"nome":"Cebola amarela - 451g","categoria":"Hortifruti"},{"nome":"Cenoura - 1044g","categoria":"Hortifruti"},{"nome":"Cereal matinal sabor chocolate Sucrilhos Kellogg's 240g","categoria":"Mercearia"},{"nome":"Chocolate em tablete 40% cacau Neugebauer 80g","categoria":"Mercearia"},{"nome":"Chocolate Trio Nestlé 90g","categoria":"Mercearia"},{"nome":"Colorau Sabor 1kg","categoria":"Mercearia"},{"nome":"Desengordurante para cozinha Cif 500ml","categoria":"Limpeza"},{"nome":"Desodorante roll on Giovanna Baby 50ml","categoria":"Higiene Pessoal"},{"nome":"Escova dental Dentil Ultra Clinic C2 -","categoria":"Higiene Pessoal"},{"nome":"Essência de baunilha Regina 30ml","categoria":"Mercearia"},{"nome":"Filezinho de frango Seara 1kg","categoria":"Carnes e Aves"},{"nome":"Filme PVC 28cm x 30m Mello -","categoria":"Limpeza"},{"nome":"Frango passarinho temperado Seara 1kg","categoria":"Carnes e Aves"},{"nome":"Gelatina Apti 20g","categoria":"Mercearia"},{"nome":"Lasanha bolonhesa Flip 600g","categoria":"Congelados"},{"nome":"Lasanha bolonhesa Perdigão 600g","categoria":"Congelados"},{"nome":"Lasanha de frango Pif Paf 600g","categoria":"Congelados"},{"nome":"Leite condensado semidesnatado Itambé 395g","categoria":"Laticínios"},{"nome":"Leite UHT integral Ita 1L","categoria":"Laticínios"},{"nome":"Limão tahiti - 612g","categoria":"Hortifruti"},{"nome":"Manta de microfibra casal sortida Home Design -","categoria":"Cama, mesa e banho"},{"nome":"Massa para tapioca Amafil 500g","categoria":"Mercearia"},{"nome":"Milho verde em lata Minas Mais 170g","categoria":"Mercearia"},{"nome":"Molho barbecue Sabor Premium 420g","categoria":"Mercearia"},{"nome":"Molho de tomate em pedaços (sachê) Heinz 240g","categoria":"Mercearia"},{"nome":"Orégano Brasileirinho 5g","categoria":"Mercearia"},{"nome":"Pão de forma integral Visconti 400g","categoria":"Padaria"},{"nome":"Papel alumínio 30cm x 4m Mello -","categoria":"Limpeza"},{"nome":"Pimenta do reino em pó Sabor 10g","categoria":"Mercearia"},{"nome":"Refrigerante Coca Zero + Sprite Zero Coca-Cola 2L","categoria":"Bebidas"},{"nome":"Saco de lixo reforçado, 20un Baianinha 100L","categoria":"Limpeza"}],"compras":[{"produto":"Achoc. Po Nescau 900g Nescau 900g","mercado":"Juvenil","qtd":1,"preco":26.99,"total":26.99,"data":"2026-06-01"},{"produto":"Alho picado Mais 350g","mercado":"Juvenil","qtd":1,"preco":15.99,"total":15.99,"data":"2026-06-01"},{"produto":"Amaciante de roupas Ypê 2L","mercado":"Juvenil","qtd":1,"preco":9.99,"total":9.99,"data":"2026-06-01"},{"produto":"Azeite de oliva extravirgem Herdade dos Coteis 500ml","mercado":"Juvenil","qtd":1,"preco":34.99,"total":34.99,"data":"2026-06-01"},{"produto":"Batata palha Creck 300g","mercado":"Juvenil","qtd":1,"preco":11.99,"total":11.99,"data":"2026-06-01"},{"produto":"Bebida láctea morango Brasil 1,150g","mercado":"Juvenil","qtd":1,"preco":11.99,"total":11.99,"data":"2026-06-01"},{"produto":"Biscoito amanteigado sabor chocolate Marilan 280g","mercado":"Juvenil","qtd":1,"preco":8.29,"total":8.29,"data":"2026-06-01"},{"produto":"Chocolate de confeitos Arcor Tortuguita 80g","mercado":"Juvenil","qtd":1,"preco":10.99,"total":10.99,"data":"2026-06-01"},{"produto":"Creme de leite Piracanjuba 200g","mercado":"Juvenil","qtd":2,"preco":3.49,"total":6.98,"data":"2026-06-01"},{"produto":"Leite integral Ibituruna 1L","mercado":"Juvenil","qtd":1,"preco":5.89,"total":5.89,"data":"2026-06-01"},{"produto":"Limão - 615g","mercado":"Juvenil","qtd":1,"preco":3.07,"total":3.07,"data":"2026-06-01"},{"produto":"Milho de pipoca premium Anchieta 500g","mercado":"Juvenil","qtd":1,"preco":3.99,"total":3.99,"data":"2026-06-01"},{"produto":"Milho verde em lata Predilecta 170g","mercado":"Juvenil","qtd":1,"preco":3.49,"total":3.49,"data":"2026-06-01"},{"produto":"Molho de tomate tradicional (sachê) Pomarola 300g","mercado":"Juvenil","qtd":2,"preco":3.49,"total":6.98,"data":"2026-06-01"},{"produto":"Molho premium para carne WF 150ml","mercado":"Juvenil","qtd":1,"preco":5.99,"total":5.99,"data":"2026-06-01"},{"produto":"Páprica defumada Quintal 10g","mercado":"Juvenil","qtd":3,"preco":2.69,"total":8.07,"data":"2026-06-01"},{"produto":"Pimenta do reino em pó (pote) Sabor 30g","mercado":"Juvenil","qtd":1,"preco":8.49,"total":8.49,"data":"2026-06-01"},{"produto":"Refresco em pó Tang 18g","mercado":"Juvenil","qtd":10,"preco":1.49,"total":14.9,"data":"2026-06-01"},{"produto":"Requeijão cremoso tradicional Mutumilk 350g","mercado":"Juvenil","qtd":1,"preco":13.29,"total":13.29,"data":"2026-06-01"},{"produto":"Tapioca Amafil 500g","mercado":"Juvenil","qtd":1,"preco":5.49,"total":5.49,"data":"2026-06-01"},{"produto":"Vinagre de álcool Anchieta 750ml","mercado":"Juvenil","qtd":1,"preco":3.29,"total":3.29,"data":"2026-06-01"},{"produto":"Arroz branco tipo 1 Rei Arthur 5kg","mercado":"Juvenil","qtd":1,"preco":22.99,"total":22.99,"data":"2026-06-02"},{"produto":"Abóbora Itália - 1239g","mercado":"Economart","qtd":1,"preco":7.42,"total":7.42,"data":"2026-06-07"},{"produto":"Absorvente higiênico, c/30 Instimus -","mercado":"Economart","qtd":1,"preco":27.99,"total":27.99,"data":"2026-06-07"},{"produto":"Açúcar cristal Delta 2kg","mercado":"Economart","qtd":1,"preco":6.99,"total":6.99,"data":"2026-06-07"},{"produto":"Alface lisa - -","mercado":"Economart","qtd":1,"preco":4.99,"total":4.99,"data":"2026-06-07"},{"produto":"Amaciante de roupas Ypê 7L","mercado":"Economart","qtd":1,"preco":25.99,"total":25.99,"data":"2026-06-07"},{"produto":"Azeitona verde sem caroço Mariza 160g","mercado":"Economart","qtd":1,"preco":7.94,"total":7.94,"data":"2026-06-07"},{"produto":"Bacon em cubos Saudali 200g","mercado":"Economart","qtd":1,"preco":7.49,"total":7.49,"data":"2026-06-07"},{"produto":"Batata congelada Pif Paf 2kg","mercado":"Economart","qtd":1,"preco":19.98,"total":19.98,"data":"2026-06-07"},{"produto":"Batata inglesa - 1086g","mercado":"Economart","qtd":1,"preco":7.58,"total":7.58,"data":"2026-06-07"},{"produto":"Bife de hambúrguer Rezende -","mercado":"Economart","qtd":12,"preco":0.95,"total":11.4,"data":"2026-06-07"},{"produto":"Biscoito amanteigado sabor chocolate Marilan 280g","mercado":"Economart","qtd":1,"preco":6.99,"total":6.99,"data":"2026-06-07"},{"produto":"Biscoito maizena Ninfa 700g","mercado":"Economart","qtd":1,"preco":8.99,"total":8.99,"data":"2026-06-07"},{"produto":"Biscoito rosquinha Rancheiro 500g","mercado":"Economart","qtd":1,"preco":5.99,"total":5.99,"data":"2026-06-07"},{"produto":"Caixa de bombons Lacta 250,6g","mercado":"Economart","qtd":1,"preco":12.98,"total":12.98,"data":"2026-06-07"},{"produto":"Cebola amarela - 524g","mercado":"Economart","qtd":1,"preco":3.14,"total":3.14,"data":"2026-06-07"},{"produto":"Cebolinha - -","mercado":"Economart","qtd":1,"preco":2.99,"total":2.99,"data":"2026-06-07"},{"produto":"Cenoura - 1055g","mercado":"Economart","qtd":1,"preco":9.48,"total":9.48,"data":"2026-06-07"},{"produto":"Chicken bits Rezende 1kg","mercado":"Economart","qtd":1,"preco":13.98,"total":13.98,"data":"2026-06-07"},{"produto":"Chocolate Snickers 42g/45g","mercado":"Coelho Diniz","qtd":1,"preco":3.99,"total":3.99,"data":"2026-06-07"},{"produto":"Chocolate em tablete ao leite Neugebauer 80g","mercado":"Economart","qtd":2,"preco":5.98,"total":11.96,"data":"2026-06-07"},{"produto":"Colorau Sabor 100g","mercado":"Economart","qtd":1,"preco":3.79,"total":3.79,"data":"2026-06-07"},{"produto":"Condimento lemon pepper (mini sachê) - 15g","mercado":"Economart","qtd":2,"preco":2.24,"total":4.48,"data":"2026-06-07"},{"produto":"Creme de leite levíssimo Ibituruna 200g","mercado":"Economart","qtd":6,"preco":2.59,"total":15.54,"data":"2026-06-07"},{"produto":"Detergente líquido neutro Ypê 500ml","mercado":"Economart","qtd":1,"preco":2.59,"total":2.59,"data":"2026-06-07"},{"produto":"Ervilha em conserva (vidro) Olé 170g","mercado":"Economart","qtd":2,"preco":3.99,"total":7.98,"data":"2026-06-07"},{"produto":"Faca inox para carne (N8) - -","mercado":"Economart","qtd":1,"preco":9.98,"total":9.98,"data":"2026-06-07"},{"produto":"Farinha de trigo Boa Sorte 1kg","mercado":"Economart","qtd":2,"preco":3.78,"total":7.56,"data":"2026-06-07"},{"produto":"Fermento em pó Apti 100g","mercado":"Economart","qtd":1,"preco":3.49,"total":3.49,"data":"2026-06-07"},{"produto":"Filé peito de frango (bandeja) Seara 1kg","mercado":"Economart","qtd":1,"preco":18.98,"total":18.98,"data":"2026-06-07"},{"produto":"Filezinho de frango (sassâmi) - 1kg","mercado":"Economart","qtd":2,"preco":18.9,"total":37.8,"data":"2026-06-07"},{"produto":"Forma de gelo de silicone - -","mercado":"Economart","qtd":1,"preco":9.98,"total":9.98,"data":"2026-06-07"},{"produto":"Frango desfiado Tropeira 400g","mercado":"Economart","qtd":1,"preco":17.9,"total":17.9,"data":"2026-06-07"},{"produto":"Guardanapo de papel, 50un Mili -","mercado":"Economart","qtd":1,"preco":1.99,"total":1.99,"data":"2026-06-07"},{"produto":"Jogo de copos de vidro, 6un - -","mercado":"Economart","qtd":1,"preco":29.98,"total":29.98,"data":"2026-06-07"},{"produto":"Ketchup sabor bacon Heinz 397g","mercado":"Economart","qtd":1,"preco":13.99,"total":13.99,"data":"2026-06-07"},{"produto":"Kit refrigerante Coca + Fanta laranja - 2L","mercado":"Economart","qtd":1,"preco":17.69,"total":17.69,"data":"2026-06-07"},{"produto":"Kit sabonete íntimo Vizet 400ml","mercado":"Coelho Diniz","qtd":1,"preco":14.99,"total":14.99,"data":"2026-06-07"},{"produto":"Kit sal de churrasco Parrilla Gonzalo -","mercado":"Coelho Diniz","qtd":1,"preco":67.0,"total":67.0,"data":"2026-06-07"},{"produto":"Lâmina para serra em arco, 3un - -","mercado":"Economart","qtd":1,"preco":6.99,"total":6.99,"data":"2026-06-07"},{"produto":"Lasanha bolonhesa Pif Paf 600g","mercado":"Economart","qtd":2,"preco":8.98,"total":17.96,"data":"2026-06-07"},{"produto":"Limpador multiuso (limpeza milagrosa) Cif 450ml","mercado":"Economart","qtd":1,"preco":13.99,"total":13.99,"data":"2026-06-07"},{"produto":"Limpador multiuso com antibac Cif 500ml","mercado":"Economart","qtd":1,"preco":3.99,"total":3.99,"data":"2026-06-07"},{"produto":"Macarrão espaguete Vilma 500g","mercado":"Economart","qtd":2,"preco":4.49,"total":8.98,"data":"2026-06-07"},{"produto":"Macarrão pena Santa Amália 500g","mercado":"Economart","qtd":2,"preco":3.79,"total":7.58,"data":"2026-06-07"},{"produto":"Maionese Hellmann's 500g","mercado":"Economart","qtd":1,"preco":8.98,"total":8.98,"data":"2026-06-07"},{"produto":"Milho verde em lata Predilecta 170g","mercado":"Economart","qtd":6,"preco":2.88,"total":17.28,"data":"2026-06-07"},{"produto":"Molho de tomate tradicional (sachê) Pomarola 460g","mercado":"Economart","qtd":5,"preco":4.49,"total":22.45,"data":"2026-06-07"},{"produto":"Óleo de soja Liza 900ml","mercado":"Economart","qtd":1,"preco":6.79,"total":6.79,"data":"2026-06-07"},{"produto":"Pão francês - 862g","mercado":"Economart","qtd":1,"preco":10.77,"total":10.77,"data":"2026-06-07"},{"produto":"Pepino - 688g","mercado":"Economart","qtd":1,"preco":6.87,"total":6.87,"data":"2026-06-07"},{"produto":"Refresco Tang (pacote 18 unidades) Tang 18un x 18g","mercado":"Economart","qtd":1,"preco":21.42,"total":21.42,"data":"2026-06-07"},{"produto":"Sal grosso para churrasco Lebre 1kg","mercado":"Economart","qtd":1,"preco":3.19,"total":3.19,"data":"2026-06-07"},{"produto":"Salsinha - -","mercado":"Economart","qtd":1,"preco":2.99,"total":2.99,"data":"2026-06-07"},{"produto":"Toalha de papel, 3 rolos Snob -","mercado":"Economart","qtd":1,"preco":18.99,"total":18.99,"data":"2026-06-07"},{"produto":"Tomate andrea - 450g","mercado":"Economart","qtd":1,"preco":4.04,"total":4.04,"data":"2026-06-07"},{"produto":"Torrada integral Visconti 120g","mercado":"Economart","qtd":1,"preco":4.99,"total":4.99,"data":"2026-06-07"},{"produto":"Farinha panko Anchieta -","mercado":"Juvenil","qtd":3,"preco":6.99,"total":20.97,"data":"2026-06-13"},{"produto":"Filme PVC Globopack -","mercado":"Juvenil","qtd":1,"preco":10.99,"total":10.99,"data":"2026-06-13"},{"produto":"Leite condensado Piracanjuba 395g","mercado":"Juvenil","qtd":2,"preco":6.99,"total":13.98,"data":"2026-06-13"},{"produto":"Pão de forma Pullman 480g","mercado":"Juvenil","qtd":1,"preco":8.69,"total":8.69,"data":"2026-06-13"},{"produto":"Arroz branco tipo 1 Rei Arthur 5kg","mercado":"Economart","qtd":1,"preco":19.98,"total":19.98,"data":"2026-06-22"},{"produto":"Aveia em flocos finos Vitao 400g","mercado":"Economart","qtd":1,"preco":12.98,"total":12.98,"data":"2026-06-22"},{"produto":"Balança de cozinha - -","mercado":"Economart","qtd":1,"preco":14.99,"total":14.99,"data":"2026-06-22"},{"produto":"Banana prata - 1116g","mercado":"Economart","qtd":1,"preco":5.57,"total":5.57,"data":"2026-06-22"},{"produto":"Batata asterix - 1014g","mercado":"Economart","qtd":1,"preco":9.11,"total":9.11,"data":"2026-06-22"},{"produto":"Batata congelada Pif Paf 2kg","mercado":"Economart","qtd":1,"preco":19.8,"total":19.8,"data":"2026-06-22"},{"produto":"Batata palha Fritop 800g","mercado":"Economart","qtd":1,"preco":21.98,"total":21.98,"data":"2026-06-22"},{"produto":"Bombom (caixa Favoritos) Lacta -","mercado":"Economart","qtd":1,"preco":14.98,"total":14.98,"data":"2026-06-22"},{"produto":"Cebola amarela - 256g","mercado":"Economart","qtd":1,"preco":2.04,"total":2.04,"data":"2026-06-22"},{"produto":"Chocolate em tablete ao leite Neugebauer 80g","mercado":"Economart","qtd":2,"preco":6.99,"total":13.98,"data":"2026-06-22"},{"produto":"Copo medidor - -","mercado":"Coelho Diniz","qtd":1,"preco":6.99,"total":6.99,"data":"2026-06-22"},{"produto":"Ervilha em conserva (vidro) Olé 170g","mercado":"Economart","qtd":1,"preco":3.99,"total":3.99,"data":"2026-06-22"},{"produto":"Escova sanitária com estojo Baianinha -","mercado":"Economart","qtd":1,"preco":14.99,"total":14.99,"data":"2026-06-22"},{"produto":"Filé peito frango desfiado Pif Paf 400g","mercado":"Economart","qtd":2,"preco":13.9,"total":27.8,"data":"2026-06-22"},{"produto":"Granola tradicional Vitao 250g","mercado":"Economart","qtd":1,"preco":16.98,"total":16.98,"data":"2026-06-22"},{"produto":"Leite integral Ita 1L","mercado":"Economart","qtd":1,"preco":4.98,"total":4.98,"data":"2026-06-22"},{"produto":"Maionese Hellmann's 1kg","mercado":"Economart","qtd":1,"preco":16.98,"total":16.98,"data":"2026-06-22"},{"produto":"Milho verde em lata Predilecta 170g","mercado":"Economart","qtd":6,"preco":2.99,"total":17.94,"data":"2026-06-22"},{"produto":"Papel higiênico, 16 rolos de 60m Cameratta -","mercado":"Economart","qtd":1,"preco":24.99,"total":24.99,"data":"2026-06-22"},{"produto":"Sabonete Biofleur 180g","mercado":"Economart","qtd":2,"preco":4.99,"total":9.98,"data":"2026-06-22"},{"produto":"Canela em pó Anchieta 30g","mercado":"Juvenil","qtd":1,"preco":4.7,"total":4.7,"data":"2026-06-27"},{"produto":"Filezinho de frango (sassâmi) Sadia 1kg","mercado":"Juvenil","qtd":1,"preco":19.99,"total":19.99,"data":"2026-06-27"},{"produto":"Molho pimenta com goiaba WF 150ml","mercado":"Juvenil","qtd":1,"preco":5.99,"total":5.99,"data":"2026-06-27"},{"produto":"Açafrão Brasileirinho 10g","mercado":"Economart","qtd":1,"preco":2.39,"total":2.39,"data":"2026-07-05"},{"produto":"Alho - 240g","mercado":"Economart","qtd":1,"preco":21.92,"total":5.26,"data":"2026-07-05"},{"produto":"Amido de milho Pacha 500g","mercado":"Economart","qtd":1,"preco":3.99,"total":3.99,"data":"2026-07-05"},{"produto":"Bacon em cubos Saudali 200g","mercado":"Economart","qtd":2,"preco":7.49,"total":14.98,"data":"2026-07-05"},{"produto":"Batata - 1788g","mercado":"Economart","qtd":1,"preco":4.99,"total":8.92,"data":"2026-07-05"},{"produto":"Batata congelada Pif Paf 2kg","mercado":"Economart","qtd":2,"preco":19.8,"total":39.6,"data":"2026-07-05"},{"produto":"Brigadeiro Gelástica 120g","mercado":"Economart","qtd":1,"preco":6.99,"total":6.99,"data":"2026-07-05"},{"produto":"Cenoura - 785g","mercado":"Economart","qtd":1,"preco":5.99,"total":4.7,"data":"2026-07-05"},{"produto":"Chicken bits Rezende 1kg","mercado":"Economart","qtd":1,"preco":13.98,"total":13.98,"data":"2026-07-05"},{"produto":"Desodorante roll on Blue (kit 2un) Giovanna Baby 50ml","mercado":"Economart","qtd":1,"preco":14.99,"total":14.99,"data":"2026-07-05"},{"produto":"Desodorante roll on Candy Giovanna Baby 50ml","mercado":"Economart","qtd":1,"preco":6.99,"total":6.99,"data":"2026-07-05"},{"produto":"Ervilha em conserva (vidro) Olé 170g","mercado":"Economart","qtd":3,"preco":3.99,"total":11.97,"data":"2026-07-05"},{"produto":"Filé peito frango (bandeja) Seara 1kg","mercado":"Economart","qtd":2,"preco":17.98,"total":35.96,"data":"2026-07-05"},{"produto":"Filé peito frango desfiado Pif Paf 400g","mercado":"Economart","qtd":1,"preco":13.9,"total":13.9,"data":"2026-07-05"},{"produto":"Ketchup tradicional Cepêra 1,01kg","mercado":"Economart","qtd":1,"preco":11.49,"total":11.49,"data":"2026-07-05"},{"produto":"Kit refrigerante Coca + Fanta laranja - 2L","mercado":"Economart","qtd":1,"preco":17.69,"total":17.69,"data":"2026-07-05"},{"produto":"Lasanha bolonhesa Pif Paf 600g","mercado":"Economart","qtd":3,"preco":9.98,"total":29.94,"data":"2026-07-05"},{"produto":"Leite integral Ita 1L","mercado":"Economart","qtd":3,"preco":4.98,"total":14.94,"data":"2026-07-05"},{"produto":"Limão tahiti - 415g","mercado":"Economart","qtd":1,"preco":4.99,"total":2.07,"data":"2026-07-05"},{"produto":"Louro Brasileirinho 5g","mercado":"Economart","qtd":1,"preco":2.89,"total":2.89,"data":"2026-07-05"},{"produto":"Macarrão pappardelle com ovos Vilma Ninho 500g","mercado":"Economart","qtd":1,"preco":6.59,"total":6.59,"data":"2026-07-05"},{"produto":"Macarrão sêmola pena Galo 500g","mercado":"Economart","qtd":1,"preco":3.49,"total":3.49,"data":"2026-07-05"},{"produto":"Maionese Hellmann's 1kg","mercado":"Economart","qtd":1,"preco":18.98,"total":18.98,"data":"2026-07-05"},{"produto":"Massa para tapioca Pacha 500g","mercado":"Economart","qtd":2,"preco":5.59,"total":11.18,"data":"2026-07-05"},{"produto":"Mel Naturapis 280g","mercado":"Economart","qtd":1,"preco":15.98,"total":15.98,"data":"2026-07-05"},{"produto":"Milho verde em lata Predilecta 170g","mercado":"Economart","qtd":2,"preco":3.29,"total":6.58,"data":"2026-07-05"},{"produto":"Óleo de soja Liza 900ml","mercado":"Economart","qtd":1,"preco":6.78,"total":6.78,"data":"2026-07-05"},{"produto":"Pão de forma Delícias do Trigo 400g","mercado":"Economart","qtd":1,"preco":7.49,"total":7.49,"data":"2026-07-05"},{"produto":"Pão de queijo Tino 800g","mercado":"Economart","qtd":1,"preco":7.98,"total":7.98,"data":"2026-07-05"},{"produto":"Papel manteiga Boreda 30cm x 7,5m","mercado":"Economart","qtd":1,"preco":5.99,"total":5.99,"data":"2026-07-05"},{"produto":"Páprica defumada Sabor 10g","mercado":"Economart","qtd":1,"preco":3.79,"total":3.79,"data":"2026-07-05"},{"produto":"Refresco em pó Tang 18g","mercado":"Economart","qtd":9,"preco":1.39,"total":12.51,"data":"2026-07-05"},{"produto":"Requeijão tradicional Alegre 400g","mercado":"Economart","qtd":1,"preco":17.9,"total":17.9,"data":"2026-07-05"},{"produto":"Sabonete Biofleur 180g","mercado":"Economart","qtd":4,"preco":4.99,"total":19.96,"data":"2026-07-05"},{"produto":"Saco de lixo econômico, 25un Baglixo 100L","mercado":"Economart","qtd":1,"preco":12.99,"total":12.99,"data":"2026-07-05"},{"produto":"Arroz branco tipo 1 Rei Arthur 5kg","mercado":"Coelho Diniz","qtd":1,"preco":19.99,"total":19.99,"data":"2026-07-19"},{"produto":"Biscoito teens sabores Marilan 80g","mercado":"Coelho Diniz","qtd":2,"preco":4.79,"total":9.58,"data":"2026-07-19"},{"produto":"Café moído Salomão 250g","mercado":"Coelho Diniz","qtd":1,"preco":34.99,"total":34.99,"data":"2026-07-19"},{"produto":"Cebola - 600g","mercado":"Coelho Diniz","qtd":1,"preco":8.98,"total":8.98,"data":"2026-07-19"},{"produto":"Cereal matinal Sucrilhos Kellogg's 240g","mercado":"Coelho Diniz","qtd":1,"preco":6.99,"total":6.99,"data":"2026-07-19"},{"produto":"Filé peito de frango (bandeja) Pif Paf 1kg","mercado":"Coelho Diniz","qtd":1,"preco":19.99,"total":19.99,"data":"2026-07-19"},{"produto":"Filezinho peito de frango (bandeja) Seara 1kg","mercado":"Coelho Diniz","qtd":2,"preco":19.99,"total":39.98,"data":"2026-07-19"},{"produto":"Lasanha congelada Pif Paf 600g","mercado":"Coelho Diniz","qtd":3,"preco":9.99,"total":29.97,"data":"2026-07-19"},{"produto":"Leite integral Ibituruna 1L","mercado":"Coelho Diniz","qtd":1,"preco":4.95,"total":4.95,"data":"2026-07-19"},{"produto":"Limão - 625g","mercado":"Coelho Diniz","qtd":1,"preco":5.98,"total":5.98,"data":"2026-07-19"},{"produto":"Macarrão cortado sêmola Santa Amália 500g","mercado":"Coelho Diniz","qtd":1,"preco":3.99,"total":3.99,"data":"2026-07-19"},{"produto":"Macarrão espaguete sêmola Santa Amália 1kg","mercado":"Coelho Diniz","qtd":1,"preco":6.99,"total":6.99,"data":"2026-07-19"},{"produto":"Milho verde em lata Quero 170g","mercado":"Coelho Diniz","qtd":1,"preco":3.49,"total":3.49,"data":"2026-07-19"},{"produto":"Molho de tomate tradicional Heinz 240g","mercado":"Coelho Diniz","qtd":3,"preco":1.99,"total":5.97,"data":"2026-07-19"},{"produto":"Pão de forma Pullman 480g","mercado":"Coelho Diniz","qtd":1,"preco":7.99,"total":7.99,"data":"2026-07-19"},{"produto":"Refresco em pó Tang 18g","mercado":"Coelho Diniz","qtd":3,"preco":0.79,"total":2.37,"data":"2026-07-19"},{"produto":"Refresco em pó Frisco 18g","mercado":"Coelho Diniz","qtd":4,"preco":0.79,"total":3.16,"data":"2026-07-19"},{"produto":"Sabonete gelato Albany 80g","mercado":"Coelho Diniz","qtd":4,"preco":1.99,"total":7.96,"data":"2026-07-19"},{"produto":"Shampoo anticaspa Clear 200ml","mercado":"Coelho Diniz","qtd":1,"preco":19.99,"total":19.99,"data":"2026-07-19"},{"produto":"Álcool 70% Sul Álcool -","mercado":"Juvenil","qtd":1,"preco":10.99,"total":10.99,"data":"2026-07-26"},{"produto":"Aparador de barba (shaver) BIC -","mercado":"Juvenil","qtd":1,"preco":3.99,"total":3.99,"data":"2026-07-26"},{"produto":"Cereal matinal sabor chocolate (Nescau) Nestlé 210g","mercado":"Juvenil","qtd":1,"preco":12.49,"total":12.49,"data":"2026-07-26"},{"produto":"Desengordurante UAU 500ml","mercado":"Juvenil","qtd":1,"preco":22.99,"total":22.99,"data":"2026-07-26"},{"produto":"Detergente líquido côco Ypê 500ml","mercado":"Juvenil","qtd":1,"preco":2.99,"total":2.99,"data":"2026-07-26"},{"produto":"Detergente líquido neutro Ypê 500ml","mercado":"Juvenil","qtd":3,"preco":8.97,"total":26.91,"data":"2026-07-26"},{"produto":"Limpa vidro Veja 500ml","mercado":"Juvenil","qtd":1,"preco":11.49,"total":11.49,"data":"2026-07-26"},{"produto":"Milho verde em lata Predilecta 170g","mercado":"Juvenil","qtd":3,"preco":3.49,"total":10.47,"data":"2026-07-26"},{"produto":"Molho de tomate tradicional (sachê) Pomarola 300g","mercado":"Juvenil","qtd":2,"preco":3.49,"total":6.98,"data":"2026-07-26"},{"produto":"Mostarda Predilecta 180g","mercado":"Juvenil","qtd":1,"preco":4.99,"total":4.99,"data":"2026-07-26"},{"produto":"Pão de forma Milani 450g","mercado":"Juvenil","qtd":2,"preco":6.99,"total":13.98,"data":"2026-07-26"},{"produto":"Páprica defumada Quintal 10g","mercado":"Juvenil","qtd":3,"preco":2.69,"total":8.07,"data":"2026-07-26"},{"produto":"Perfume para casa (brisa) UAU -","mercado":"Juvenil","qtd":1,"preco":9.99,"total":9.99,"data":"2026-07-26"},{"produto":"Refresco em pó Frisco 18g","mercado":"Juvenil","qtd":7,"preco":0.99,"total":6.93,"data":"2026-07-26"},{"produto":"Tempero alho e sal Irici 300g","mercado":"Juvenil","qtd":1,"preco":5.49,"total":5.49,"data":"2026-07-26"},{"produto":"Tesoura multiuso - -","mercado":"Juvenil","qtd":1,"preco":11.49,"total":11.49,"data":"2026-07-26"},{"produto":"Alface crespa hidropônica - -","mercado":"Economart","qtd":1,"preco":4.99,"total":4.99,"data":"2026-08-08"},{"produto":"Alho - 304g","mercado":"Economart","qtd":1,"preco":19.9,"total":19.9,"data":"2026-08-08"},{"produto":"Arroz branco tipo 1 Rei Arthur 5kg","mercado":"Economart","qtd":1,"preco":20.98,"total":20.98,"data":"2026-08-08"},{"produto":"Azeite de oliva extravirgem Gallo 500ml","mercado":"Economart","qtd":1,"preco":29.98,"total":29.98,"data":"2026-08-08"},{"produto":"Banana prata - 765g","mercado":"Economart","qtd":1,"preco":5.99,"total":5.99,"data":"2026-08-08"},{"produto":"Batata - 3095g","mercado":"Economart","qtd":1,"preco":3.98,"total":3.98,"data":"2026-08-08"},{"produto":"Batata para airfryer Bem Brasil 700g","mercado":"Economart","qtd":2,"preco":14.9,"total":29.8,"data":"2026-08-08"},{"produto":"Biscoito maizena Marilan 300g","mercado":"Economart","qtd":3,"preco":3.99,"total":11.97,"data":"2026-08-08"},{"produto":"Cebola amarela - 451g","mercado":"Economart","qtd":1,"preco":5.99,"total":5.99,"data":"2026-08-08"},{"produto":"Cenoura - 1044g","mercado":"Economart","qtd":1,"preco":4.99,"total":4.99,"data":"2026-08-08"},{"produto":"Cereal matinal sabor chocolate Sucrilhos Kellogg's 240g","mercado":"Coelho Diniz","qtd":1,"preco":7.99,"total":7.99,"data":"2026-08-08"},{"produto":"Chicken bits Rezende 1kg","mercado":"Economart","qtd":1,"preco":13.98,"total":13.98,"data":"2026-08-08"},{"produto":"Chocolate em tablete 40% cacau Neugebauer 80g","mercado":"Economart","qtd":5,"preco":5.49,"total":27.45,"data":"2026-08-08"},{"produto":"Chocolate Trio Nestlé 90g","mercado":"Economart","qtd":3,"preco":9.99,"total":29.97,"data":"2026-08-08"},{"produto":"Colorau Sabor 1kg","mercado":"Economart","qtd":1,"preco":14.98,"total":14.98,"data":"2026-08-08"},{"produto":"Condimento lemon pepper (mini sachê) - 15g","mercado":"Economart","qtd":2,"preco":2.24,"total":4.48,"data":"2026-08-08"},{"produto":"Creme de leite Piracanjuba 200g","mercado":"Economart","qtd":4,"preco":3.29,"total":13.16,"data":"2026-08-08"},{"produto":"Desengordurante para cozinha Cif 500ml","mercado":"Economart","qtd":1,"preco":16.99,"total":16.99,"data":"2026-08-08"},{"produto":"Desodorante roll on Giovanna Baby 50ml","mercado":"Economart","qtd":1,"preco":8.99,"total":8.99,"data":"2026-08-08"},{"produto":"Escova dental Dentil Ultra Clinic C2 -","mercado":"Coelho Diniz","qtd":1,"preco":8.79,"total":8.79,"data":"2026-08-08"},{"produto":"Essência de baunilha Regina 30ml","mercado":"Coelho Diniz","qtd":1,"preco":8.99,"total":8.99,"data":"2026-08-08"},{"produto":"Filé peito frango (bandeja) Seara 1kg","mercado":"Economart","qtd":2,"preco":17.98,"total":35.96,"data":"2026-08-08"},{"produto":"Filé peito frango desfiado Pif Paf 400g","mercado":"Economart","qtd":2,"preco":13.9,"total":27.8,"data":"2026-08-08"},{"produto":"Filezinho de frango Seara 1kg","mercado":"Economart","qtd":3,"preco":14.98,"total":44.94,"data":"2026-08-08"},{"produto":"Filme PVC 28cm x 30m Mello -","mercado":"Economart","qtd":1,"preco":5.99,"total":5.99,"data":"2026-08-08"},{"produto":"Frango passarinho temperado Seara 1kg","mercado":"Economart","qtd":1,"preco":13.9,"total":13.9,"data":"2026-08-08"},{"produto":"Gelatina Apti 20g","mercado":"Economart","qtd":4,"preco":1.39,"total":5.56,"data":"2026-08-08"},{"produto":"Ketchup tradicional Cepêra 1,01kg","mercado":"Economart","qtd":1,"preco":11.49,"total":11.49,"data":"2026-08-08"},{"produto":"Lasanha bolonhesa Flip 600g","mercado":"Economart","qtd":1,"preco":7.98,"total":7.98,"data":"2026-08-08"},{"produto":"Lasanha bolonhesa Perdigão 600g","mercado":"Economart","qtd":1,"preco":15.9,"total":15.9,"data":"2026-08-08"},{"produto":"Lasanha de frango Pif Paf 600g","mercado":"Economart","qtd":3,"preco":10.49,"total":31.47,"data":"2026-08-08"},{"produto":"Leite condensado semidesnatado Itambé 395g","mercado":"Economart","qtd":6,"preco":5.99,"total":35.94,"data":"2026-08-08"},{"produto":"Leite UHT integral Ita 1L","mercado":"Economart","qtd":3,"preco":5.29,"total":15.87,"data":"2026-08-08"},{"produto":"Limão tahiti - 612g","mercado":"Economart","qtd":1,"preco":7.99,"total":7.99,"data":"2026-08-08"},{"produto":"Limpador multiuso com antibac Cif 500ml","mercado":"Economart","qtd":1,"preco":3.49,"total":3.49,"data":"2026-08-08"},{"produto":"Manta de microfibra casal sortida Home Design -","mercado":"Economart","qtd":1,"preco":29.98,"total":29.98,"data":"2026-08-08"},{"produto":"Massa para tapioca Amafil 500g","mercado":"Economart","qtd":2,"preco":5.29,"total":10.58,"data":"2026-08-08"},{"produto":"Milho verde em lata Minas Mais 170g","mercado":"Economart","qtd":6,"preco":2.99,"total":17.94,"data":"2026-08-08"},{"produto":"Molho barbecue Sabor Premium 420g","mercado":"Economart","qtd":1,"preco":9.99,"total":9.99,"data":"2026-08-08"},{"produto":"Molho de tomate em pedaços (sachê) Heinz 240g","mercado":"Economart","qtd":6,"preco":1.98,"total":11.88,"data":"2026-08-08"},{"produto":"Orégano Brasileirinho 5g","mercado":"Economart","qtd":1,"preco":2.19,"total":2.19,"data":"2026-08-08"},{"produto":"Pão de forma Delícias do Trigo 400g","mercado":"Economart","qtd":1,"preco":7.49,"total":7.49,"data":"2026-08-08"},{"produto":"Pão de forma integral Visconti 400g","mercado":"Economart","qtd":1,"preco":5.98,"total":5.98,"data":"2026-08-08"},{"produto":"Pão de queijo Tino 800g","mercado":"Economart","qtd":1,"preco":7.98,"total":7.98,"data":"2026-08-08"},{"produto":"Papel alumínio 30cm x 4m Mello -","mercado":"Economart","qtd":1,"preco":3.99,"total":3.99,"data":"2026-08-08"},{"produto":"Papel higiênico, 16 rolos de 60m Cameratta -","mercado":"Economart","qtd":1,"preco":24.99,"total":24.99,"data":"2026-08-08"},{"produto":"Pimenta do reino em pó Sabor 10g","mercado":"Economart","qtd":1,"preco":2.89,"total":2.89,"data":"2026-08-08"},{"produto":"Refresco em pó Tang 18g","mercado":"Economart","qtd":19,"preco":1.39,"total":26.41,"data":"2026-08-08"},{"produto":"Refrigerante Coca Zero + Sprite Zero Coca-Cola 2L","mercado":"Coelho Diniz","qtd":1,"preco":17.99,"total":17.99,"data":"2026-08-08"},{"produto":"Requeijão tradicional Alegre 400g","mercado":"Economart","qtd":1,"preco":14.98,"total":14.98,"data":"2026-08-08"},{"produto":"Saco de lixo reforçado, 20un Baianinha 100L","mercado":"Economart","qtd":1,"preco":14.98,"total":14.98,"data":"2026-08-08"},{"produto":"Salsinha - -","mercado":"Economart","qtd":1,"preco":3.99,"total":3.99,"data":"2026-08-08"}]};

const MARCA_PESO_MAP = {"Achoc. Po Nescau 900g Nescau 900g":{"marca":"Nescau","pesoVolume":"900g"},"Alho picado Mais 350g":{"marca":"Mais","pesoVolume":"350g"},"Amaciante de roupas Ypê 2L":{"marca":"Ypê","pesoVolume":"2L"},"Azeite de oliva extravirgem Herdade dos Coteis 500ml":{"marca":"Herdade dos Coteis","pesoVolume":"500ml"},"Batata palha Creck 300g":{"marca":"Creck","pesoVolume":"300g"},"Bebida láctea morango Brasil 1,150g":{"marca":"Brasil","pesoVolume":"1,150g"},"Biscoito amanteigado sabor chocolate Marilan 280g":{"marca":"Marilan","pesoVolume":"280g"},"Chocolate de confeitos Arcor Tortuguita 80g":{"marca":"Arcor Tortuguita","pesoVolume":"80g"},"Creme de leite Piracanjuba 200g":{"marca":"Piracanjuba","pesoVolume":"200g"},"Leite integral Ibituruna 1L":{"marca":"Ibituruna","pesoVolume":"1L"},"Limão - 615g":{"marca":"","pesoVolume":"615g"},"Milho de pipoca premium Anchieta 500g":{"marca":"Anchieta","pesoVolume":"500g"},"Milho verde em lata Predilecta 170g":{"marca":"Predilecta","pesoVolume":"170g"},"Molho de tomate tradicional (sachê) Pomarola 300g":{"marca":"Pomarola","pesoVolume":"300g"},"Molho premium para carne WF 150ml":{"marca":"WF","pesoVolume":"150ml"},"Páprica defumada Quintal 10g":{"marca":"Quintal","pesoVolume":"10g"},"Pimenta do reino em pó (pote) Sabor 30g":{"marca":"Sabor","pesoVolume":"30g"},"Refresco em pó Tang 18g":{"marca":"Tang","pesoVolume":"18g"},"Requeijão cremoso tradicional Mutumilk 350g":{"marca":"Mutumilk","pesoVolume":"350g"},"Tapioca Amafil 500g":{"marca":"Amafil","pesoVolume":"500g"},"Vinagre de álcool Anchieta 750ml":{"marca":"Anchieta","pesoVolume":"750ml"},"Arroz branco tipo 1 Rei Arthur 5kg":{"marca":"Rei Arthur","pesoVolume":"5kg"},"Abóbora Itália - 1239g":{"marca":"","pesoVolume":"1239g"},"Absorvente higiênico, c/30 Instimus -":{"marca":"Instimus","pesoVolume":""},"Açúcar cristal Delta 2kg":{"marca":"Delta","pesoVolume":"2kg"},"Alface lisa - -":{"marca":"","pesoVolume":""},"Amaciante de roupas Ypê 7L":{"marca":"Ypê","pesoVolume":"7L"},"Azeitona verde sem caroço Mariza 160g":{"marca":"Mariza","pesoVolume":"160g"},"Bacon em cubos Saudali 200g":{"marca":"Saudali","pesoVolume":"200g"},"Batata congelada Pif Paf 2kg":{"marca":"Pif Paf","pesoVolume":"2kg"},"Batata inglesa - 1086g":{"marca":"","pesoVolume":"1086g"},"Bife de hambúrguer Rezende -":{"marca":"Rezende","pesoVolume":""},"Biscoito maizena Ninfa 700g":{"marca":"Ninfa","pesoVolume":"700g"},"Biscoito rosquinha Rancheiro 500g":{"marca":"Rancheiro","pesoVolume":"500g"},"Caixa de bombons Lacta 250,6g":{"marca":"Lacta","pesoVolume":"250,6g"},"Cebola amarela - 524g":{"marca":"","pesoVolume":"524g"},"Cebolinha - -":{"marca":"","pesoVolume":""},"Cenoura - 1055g":{"marca":"","pesoVolume":"1055g"},"Chicken bits Rezende 1kg":{"marca":"Rezende","pesoVolume":"1kg"},"Chocolate Snickers 42g/45g":{"marca":"Snickers","pesoVolume":"42g/45g"},"Chocolate em tablete ao leite Neugebauer 80g":{"marca":"Neugebauer","pesoVolume":"80g"},"Colorau Sabor 100g":{"marca":"Sabor","pesoVolume":"100g"},"Condimento lemon pepper (mini sachê) - 15g":{"marca":"","pesoVolume":"15g"},"Creme de leite levíssimo Ibituruna 200g":{"marca":"Ibituruna","pesoVolume":"200g"},"Detergente líquido neutro Ypê 500ml":{"marca":"Ypê","pesoVolume":"500ml"},"Ervilha em conserva (vidro) Olé 170g":{"marca":"Olé","pesoVolume":"170g"},"Faca inox para carne (N8) - -":{"marca":"","pesoVolume":""},"Farinha de trigo Boa Sorte 1kg":{"marca":"Boa Sorte","pesoVolume":"1kg"},"Fermento em pó Apti 100g":{"marca":"Apti","pesoVolume":"100g"},"Filé peito de frango (bandeja) Seara 1kg":{"marca":"Seara","pesoVolume":"1kg"},"Filezinho de frango (sassâmi) - 1kg":{"marca":"","pesoVolume":"1kg"},"Forma de gelo de silicone - -":{"marca":"","pesoVolume":""},"Frango desfiado Tropeira 400g":{"marca":"Tropeira","pesoVolume":"400g"},"Guardanapo de papel, 50un Mili -":{"marca":"Mili","pesoVolume":""},"Jogo de copos de vidro, 6un - -":{"marca":"","pesoVolume":""},"Ketchup sabor bacon Heinz 397g":{"marca":"Heinz","pesoVolume":"397g"},"Kit refrigerante Coca + Fanta laranja - 2L":{"marca":"","pesoVolume":"2L"},"Kit sabonete íntimo Vizet 400ml":{"marca":"Vizet","pesoVolume":"400ml"},"Kit sal de churrasco Parrilla Gonzalo -":{"marca":"Gonzalo","pesoVolume":""},"Lâmina para serra em arco, 3un - -":{"marca":"","pesoVolume":""},"Lasanha bolonhesa Pif Paf 600g":{"marca":"Pif Paf","pesoVolume":"600g"},"Limpador multiuso (limpeza milagrosa) Cif 450ml":{"marca":"Cif","pesoVolume":"450ml"},"Limpador multiuso com antibac Cif 500ml":{"marca":"Cif","pesoVolume":"500ml"},"Macarrão espaguete Vilma 500g":{"marca":"Vilma","pesoVolume":"500g"},"Macarrão pena Santa Amália 500g":{"marca":"Santa Amália","pesoVolume":"500g"},"Maionese Hellmann's 500g":{"marca":"Hellmann's","pesoVolume":"500g"},"Molho de tomate tradicional (sachê) Pomarola 460g":{"marca":"Pomarola","pesoVolume":"460g"},"Óleo de soja Liza 900ml":{"marca":"Liza","pesoVolume":"900ml"},"Pão francês - 862g":{"marca":"","pesoVolume":"862g"},"Pepino - 688g":{"marca":"","pesoVolume":"688g"},"Refresco Tang (pacote 18 unidades) Tang 18un x 18g":{"marca":"Tang","pesoVolume":"18un x 18g"},"Sal grosso para churrasco Lebre 1kg":{"marca":"Lebre","pesoVolume":"1kg"},"Salsinha - -":{"marca":"","pesoVolume":""},"Toalha de papel, 3 rolos Snob -":{"marca":"Snob","pesoVolume":""},"Tomate andrea - 450g":{"marca":"","pesoVolume":"450g"},"Torrada integral Visconti 120g":{"marca":"Visconti","pesoVolume":"120g"},"Farinha panko Anchieta -":{"marca":"Anchieta","pesoVolume":""},"Filme PVC Globopack -":{"marca":"Globopack","pesoVolume":""},"Leite condensado Piracanjuba 395g":{"marca":"Piracanjuba","pesoVolume":"395g"},"Pão de forma Pullman 480g":{"marca":"Pullman","pesoVolume":"480g"},"Aveia em flocos finos Vitao 400g":{"marca":"Vitao","pesoVolume":"400g"},"Balança de cozinha - -":{"marca":"","pesoVolume":""},"Banana prata - 1116g":{"marca":"","pesoVolume":"1116g"},"Batata asterix - 1014g":{"marca":"","pesoVolume":"1014g"},"Batata palha Fritop 800g":{"marca":"Fritop","pesoVolume":"800g"},"Bombom (caixa Favoritos) Lacta -":{"marca":"Lacta","pesoVolume":""},"Cebola amarela - 256g":{"marca":"","pesoVolume":"256g"},"Copo medidor - -":{"marca":"","pesoVolume":""},"Escova sanitária com estojo Baianinha -":{"marca":"Baianinha","pesoVolume":""},"Filé peito frango desfiado Pif Paf 400g":{"marca":"Pif Paf","pesoVolume":"400g"},"Granola tradicional Vitao 250g":{"marca":"Vitao","pesoVolume":"250g"},"Leite integral Ita 1L":{"marca":"Ita","pesoVolume":"1L"},"Maionese Hellmann's 1kg":{"marca":"Hellmann's","pesoVolume":"1kg"},"Papel higiênico, 16 rolos de 60m Cameratta -":{"marca":"Cameratta","pesoVolume":""},"Sabonete Biofleur 180g":{"marca":"Biofleur","pesoVolume":"180g"},"Canela em pó Anchieta 30g":{"marca":"Anchieta","pesoVolume":"30g"},"Filezinho de frango (sassâmi) Sadia 1kg":{"marca":"Sadia","pesoVolume":"1kg"},"Molho pimenta com goiaba WF 150ml":{"marca":"WF","pesoVolume":"150ml"},"Açafrão Brasileirinho 10g":{"marca":"Brasileirinho","pesoVolume":"10g"},"Alho - 240g":{"marca":"","pesoVolume":"240g"},"Amido de milho Pacha 500g":{"marca":"Pacha","pesoVolume":"500g"},"Batata - 1788g":{"marca":"","pesoVolume":"1788g"},"Brigadeiro Gelástica 120g":{"marca":"Gelástica","pesoVolume":"120g"},"Cenoura - 785g":{"marca":"","pesoVolume":"785g"},"Desodorante roll on Blue (kit 2un) Giovanna Baby 50ml":{"marca":"Giovanna Baby","pesoVolume":"50ml"},"Desodorante roll on Candy Giovanna Baby 50ml":{"marca":"Giovanna Baby","pesoVolume":"50ml"},"Filé peito frango (bandeja) Seara 1kg":{"marca":"Seara","pesoVolume":"1kg"},"Ketchup tradicional Cepêra 1,01kg":{"marca":"Cepêra","pesoVolume":"1,01kg"},"Limão tahiti - 415g":{"marca":"","pesoVolume":"415g"},"Louro Brasileirinho 5g":{"marca":"Brasileirinho","pesoVolume":"5g"},"Macarrão pappardelle com ovos Vilma Ninho 500g":{"marca":"Vilma Ninho","pesoVolume":"500g"},"Macarrão sêmola pena Galo 500g":{"marca":"Galo","pesoVolume":"500g"},"Massa para tapioca Pacha 500g":{"marca":"Pacha","pesoVolume":"500g"},"Mel Naturapis 280g":{"marca":"Naturapis","pesoVolume":"280g"},"Pão de forma Delícias do Trigo 400g":{"marca":"Delícias do Trigo","pesoVolume":"400g"},"Pão de queijo Tino 800g":{"marca":"Tino","pesoVolume":"800g"},"Papel manteiga Boreda 30cm x 7,5m":{"marca":"Boreda","pesoVolume":"30cm x 7,5m"},"Páprica defumada Sabor 10g":{"marca":"Sabor","pesoVolume":"10g"},"Requeijão tradicional Alegre 400g":{"marca":"Alegre","pesoVolume":"400g"},"Saco de lixo econômico, 25un Baglixo 100L":{"marca":"Baglixo","pesoVolume":"100L"},"Biscoito teens sabores Marilan 80g":{"marca":"Marilan","pesoVolume":"80g"},"Café moído Salomão 250g":{"marca":"Salomão","pesoVolume":"250g"},"Cebola - 600g":{"marca":"","pesoVolume":"600g"},"Cereal matinal Sucrilhos Kellogg's 240g":{"marca":"Sucrilhos Kellogg's","pesoVolume":"240g"},"Filé peito de frango (bandeja) Pif Paf 1kg":{"marca":"Pif Paf","pesoVolume":"1kg"},"Filezinho peito de frango (bandeja) Seara 1kg":{"marca":"Seara","pesoVolume":"1kg"},"Lasanha congelada Pif Paf 600g":{"marca":"Pif Paf","pesoVolume":"600g"},"Limão - 625g":{"marca":"","pesoVolume":"625g"},"Macarrão cortado sêmola Santa Amália 500g":{"marca":"Santa Amália","pesoVolume":"500g"},"Macarrão espaguete sêmola Santa Amália 1kg":{"marca":"Santa Amália","pesoVolume":"1kg"},"Milho verde em lata Quero 170g":{"marca":"Quero","pesoVolume":"170g"},"Molho de tomate tradicional Heinz 240g":{"marca":"Heinz","pesoVolume":"240g"},"Refresco em pó Frisco 18g":{"marca":"Frisco","pesoVolume":"18g"},"Sabonete gelato Albany 80g":{"marca":"Albany","pesoVolume":"80g"},"Shampoo anticaspa Clear 200ml":{"marca":"Clear","pesoVolume":"200ml"},"Álcool 70% Sul Álcool -":{"marca":"Sul Álcool","pesoVolume":""},"Aparador de barba (shaver) BIC -":{"marca":"BIC","pesoVolume":""},"Cereal matinal sabor chocolate (Nescau) Nestlé 210g":{"marca":"Nestlé","pesoVolume":"210g"},"Desengordurante UAU 500ml":{"marca":"UAU","pesoVolume":"500ml"},"Detergente líquido côco Ypê 500ml":{"marca":"Ypê","pesoVolume":"500ml"},"Limpa vidro Veja 500ml":{"marca":"Veja","pesoVolume":"500ml"},"Mostarda Predilecta 180g":{"marca":"Predilecta","pesoVolume":"180g"},"Pão de forma Milani 450g":{"marca":"Milani","pesoVolume":"450g"},"Perfume para casa (brisa) UAU -":{"marca":"UAU","pesoVolume":""},"Tempero alho e sal Irici 300g":{"marca":"Irici","pesoVolume":"300g"},"Tesoura multiuso - -":{"marca":"","pesoVolume":""},"Alface crespa hidropônica - -":{"marca":"","pesoVolume":""},"Alho - 304g":{"marca":"","pesoVolume":"304g"},"Azeite de oliva extravirgem Gallo 500ml":{"marca":"Gallo","pesoVolume":"500ml"},"Banana prata - 765g":{"marca":"","pesoVolume":"765g"},"Batata - 3095g":{"marca":"","pesoVolume":"3095g"},"Batata para airfryer Bem Brasil 700g":{"marca":"Bem Brasil","pesoVolume":"700g"},"Biscoito maizena Marilan 300g":{"marca":"Marilan","pesoVolume":"300g"},"Cebola amarela - 451g":{"marca":"","pesoVolume":"451g"},"Cenoura - 1044g":{"marca":"","pesoVolume":"1044g"},"Cereal matinal sabor chocolate Sucrilhos Kellogg's 240g":{"marca":"Sucrilhos Kellogg's","pesoVolume":"240g"},"Chocolate em tablete 40% cacau Neugebauer 80g":{"marca":"Neugebauer","pesoVolume":"80g"},"Chocolate Trio Nestlé 90g":{"marca":"Nestlé","pesoVolume":"90g"},"Colorau Sabor 1kg":{"marca":"Sabor","pesoVolume":"1kg"},"Desengordurante para cozinha Cif 500ml":{"marca":"Cif","pesoVolume":"500ml"},"Desodorante roll on Giovanna Baby 50ml":{"marca":"Giovanna Baby","pesoVolume":"50ml"},"Escova dental Dentil Ultra Clinic C2 -":{"marca":"Dentil Ultra Clinic C2","pesoVolume":""},"Essência de baunilha Regina 30ml":{"marca":"Regina","pesoVolume":"30ml"},"Filezinho de frango Seara 1kg":{"marca":"Seara","pesoVolume":"1kg"},"Filme PVC 28cm x 30m Mello -":{"marca":"Mello","pesoVolume":""},"Frango passarinho temperado Seara 1kg":{"marca":"Seara","pesoVolume":"1kg"},"Gelatina Apti 20g":{"marca":"Apti","pesoVolume":"20g"},"Lasanha bolonhesa Flip 600g":{"marca":"Flip","pesoVolume":"600g"},"Lasanha bolonhesa Perdigão 600g":{"marca":"Perdigão","pesoVolume":"600g"},"Lasanha de frango Pif Paf 600g":{"marca":"Pif Paf","pesoVolume":"600g"},"Leite condensado semidesnatado Itambé 395g":{"marca":"Itambé","pesoVolume":"395g"},"Leite UHT integral Ita 1L":{"marca":"Ita","pesoVolume":"1L"},"Limão tahiti - 612g":{"marca":"","pesoVolume":"612g"},"Manta de microfibra casal sortida Home Design -":{"marca":"Home Design","pesoVolume":""},"Massa para tapioca Amafil 500g":{"marca":"Amafil","pesoVolume":"500g"},"Milho verde em lata Minas Mais 170g":{"marca":"Minas Mais","pesoVolume":"170g"},"Molho barbecue Sabor Premium 420g":{"marca":"Sabor Premium","pesoVolume":"420g"},"Molho de tomate em pedaços (sachê) Heinz 240g":{"marca":"Heinz","pesoVolume":"240g"},"Orégano Brasileirinho 5g":{"marca":"Brasileirinho","pesoVolume":"5g"},"Pão de forma integral Visconti 400g":{"marca":"Visconti","pesoVolume":"400g"},"Papel alumínio 30cm x 4m Mello -":{"marca":"Mello","pesoVolume":""},"Pimenta do reino em pó Sabor 10g":{"marca":"Sabor","pesoVolume":"10g"},"Refrigerante Coca Zero + Sprite Zero Coca-Cola 2L":{"marca":"Coca-Cola","pesoVolume":"2L"},"Saco de lixo reforçado, 20un Baianinha 100L":{"marca":"Baianinha","pesoVolume":"100L"}};

const STORAGE_KEY = "mercado-domus-v2";

const MERCADO_CORES = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];
const CATEGORIA_CORES_PADRAO = {
  "Mercearia": "#F59E0B", "Hortifruti": "#10B981", "Laticínios": "#3B82F6",
  "Carnes e Aves": "#EF4444", "Congelados": "#06B6D4", "Padaria": "#D97706",
  "Bebidas": "#8B5CF6", "Doces": "#EC4899", "Limpeza": "#14B8A6",
  "Higiene Pessoal": "#F472B6", "Utilidades Domésticas": "#6366F1",
  "Bazar e Ferramentas": "#78716C", "Frios e Embutidos": "#DC2626",
  "Cama, mesa e banho": "#A855F7", "Outros": "#9CA3AF",
};

function corParaMercado(nome, index) {
  return MERCADO_CORES[index % MERCADO_CORES.length];
}

function corDoMercado(dados, nomeMercado) {
  const info = (dados.mercadosInfo || []).find((m) => m.nome === nomeMercado);
  return info?.cor || "#000000";
}

function construirMercadosInfo(nomesMercados, existentes) {
  const existentesMap = new Map((existentes || []).map((m) => [m.nome, m]));
  return nomesMercados.map((nome, i) => existentesMap.get(nome) || {
    id: uid(), nome, cor: corParaMercado(nome, i), logo: "", endereco: "",
  });
}

function construirCategoriasInfo(existentes) {
  return { ...CATEGORIA_CORES_PADRAO, ...(existentes || {}) };
}

const CATEGORIAS = [
  "Mercearia", "Hortifruti", "Laticínios", "Carnes e Aves", "Congelados",
  "Padaria", "Bebidas", "Doces", "Limpeza", "Higiene Pessoal",
  "Utilidades Domésticas", "Bazar e Ferramentas", "Frios e Embutidos",
  "Cama, mesa e banho", "Outros",
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function buildInitialState() {
  const produtos = SEED.produtos.map((p) => {
    const extra = MARCA_PESO_MAP[p.nome] || { marca: "", pesoVolume: "" };
    return {
      id: uid(),
      nome: p.nome,
      marca: extra.marca,
      pesoVolume: extra.pesoVolume,
      categoria: p.categoria,
      codigoBarras: "",
      estoqueAtual: 0,
      estoqueMinimo: 0,
      ultimaCompraData: "",
    };
  });
  const porNome = new Map(produtos.map((p) => [p.nome, p]));
  const compras = SEED.compras.map((c) => ({
    id: uid(),
    produtoId: porNome.get(c.produto)?.id,
    produtoNome: c.produto,
    mercado: c.mercado,
    quantidade: c.qtd,
    precoUnitario: c.preco,
    precoTotal: c.total,
    data: c.data,
  }));
  // preenche a última data de compra em cada produto
  compras.forEach((c) => {
    const p = produtos.find((x) => x.id === c.produtoId);
    if (p && (!p.ultimaCompraData || c.data > p.ultimaCompraData)) {
      p.ultimaCompraData = c.data;
    }
  });
  const nomesMercados = Array.from(new Set(compras.map((c) => c.mercado)));
  return {
    produtos,
    compras,
    lista: [],
    usuario: {
      nome: "Sophia",
      notificacoes: { estoqueBaixo: true, economia: true },
    },
    notificacoesLidas: [],
    familia: [{ id: uid(), nome: "Sophia", papel: "Administrador" }],
    mercadosInfo: construirMercadosInfo(nomesMercados, []),
    categoriasInfo: construirCategoriasInfo({}),
  };
}

function formatBRL(n) {
  return "R$ " + (Number(n) || 0).toFixed(2).replace(".", ",");
}

function formatDataBR(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const NAV_ITEMS = [
  { id: "inicio", label: "Início", icon: Home },
  { id: "lista", label: "Lista", icon: ShoppingCart },
  { id: "estoque", label: "Estoque", icon: Package },
  { id: "mercados", label: "Mercados", icon: Store },
  { id: "buscar", label: "Buscar", icon: Search },
];

const FONT_LOGO = "'Space Grotesk', 'Avenir Next', 'Century Gothic', -apple-system, sans-serif";

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&display=swap');
      @keyframes mercadoFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes mercadoModalIn {
        from { opacity: 0; transform: scale(0.97) translateY(8px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .mercado-page-enter { animation: mercadoFadeIn 240ms cubic-bezier(0.16, 1, 0.3, 1); }
      .mercado-modal-enter { animation: mercadoModalIn 220ms cubic-bezier(0.16, 1, 0.3, 1); }
      .mercado-nav-btn { transition: background-color 180ms ease, color 180ms ease, transform 120ms ease; }
      .mercado-nav-btn:active { transform: scale(0.97); }
    `}</style>
  );
}

const DESKTOP_BREAKPOINT = 860;

function migrarDados(carregado) {
  if (!carregado.usuario) carregado.usuario = { nome: "Sophia", notificacoes: { estoqueBaixo: true, economia: true } };
  if (!carregado.notificacoesLidas) carregado.notificacoesLidas = [];
  if (!carregado.familia) carregado.familia = [{ id: uid(), nome: carregado.usuario.nome, papel: "Administrador" }];
  carregado.produtos = carregado.produtos.map((p) => {
    const base = { marca: "", pesoVolume: "", codigoBarras: "", ultimaCompraData: "", ...p };
    // preenche marca/peso a partir do PDF original só se o campo ainda estiver vazio (nunca sobrescreve edição manual)
    if (!base.marca && !base.pesoVolume && MARCA_PESO_MAP[base.nome]) {
      const extra = MARCA_PESO_MAP[base.nome];
      if (!base.marca) base.marca = extra.marca;
      if (!base.pesoVolume) base.pesoVolume = extra.pesoVolume;
    }
    return base;
  });
  const nomesMercadosAtuais = Array.from(new Set(carregado.compras.map((c) => c.mercado)));
  carregado.mercadosInfo = construirMercadosInfo(nomesMercadosAtuais, carregado.mercadosInfo);
  carregado.categoriasInfo = construirCategoriasInfo(carregado.categoriasInfo);
  return carregado;
}

export default function MercadoApp() {
  const [aba, setAba] = useState("inicio");
  const [dados, setDados] = useState(null);
  const [pronto, setPronto] = useState(false);
  const [toast, setToast] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);
  const [buscaTopbar, setBuscaTopbar] = useState("");
  const [buscaExterna, setBuscaExterna] = useState("");
  const [buscaSeed, setBuscaSeed] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const containerRef = useRef(null);
  const ultimoValorRef = useRef(null); // guarda o último JSON que ESTE dispositivo escreveu ou leu, pra saber se mudou por fora
  const ultimoSalvamentoLocalRef = useRef(0); // timestamp do último salvar() feito aqui

  // mede a largura real do artefato (não a da janela) pra decidir sidebar vs menu inferior
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width || 0;
      setIsDesktop(width >= DESKTOP_BREAKPOINT);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let ativo = true;
    async function tentarCarregar() {
      const res = await window.storage.get(STORAGE_KEY, true);
      if (res && res.value) {
        ultimoValorRef.current = res.value;
        return migrarDados(JSON.parse(res.value));
      }
      return null; // chave existe mas sem valor — trata como "ainda não há dados"
    }
    async function carregar() {
      // até 3 tentativas: uma falha de leitura (rede instável, storage momentaneamente
      // indisponível) NUNCA pode virar um "resetar os dados de todo mundo" — só cria
      // e grava um estado novo se, depois de tentar de verdade, a conclusão for que
      // isso é genuinamente a primeira vez que o app abre.
      let ultimoErro = null;
      for (let tentativa = 0; tentativa < 3; tentativa++) {
        try {
          const carregado = await tentarCarregar();
          if (!ativo) return;
          if (carregado) {
            setDados(carregado);
          } else {
            const inicial = buildInitialState();
            setDados(inicial);
            // primeira vez de verdade: não há nada pra perder, então pode gravar
            const texto = JSON.stringify(inicial);
            ultimoValorRef.current = texto;
            await window.storage.set(STORAGE_KEY, texto, true);
          }
          setPronto(true);
          return;
        } catch (e) {
          ultimoErro = e;
          if (tentativa < 2) await new Promise((r) => setTimeout(r, 1200 * (tentativa + 1)));
        }
      }
      // esgotou as tentativas: mostra os dados localmente pra não travar o app,
      // mas NUNCA grava por cima do que já existe — só o botão de atualizar
      // ou a próxima ação de salvar vai tentar de novo.
      console.error("Não consegui carregar os dados salvos depois de 3 tentativas", ultimoErro);
      if (ativo) {
        setDados((atual) => atual || buildInitialState());
        setPronto(true);
        mostrarToast("Não consegui carregar seus dados salvos agora. Toque em atualizar quando a conexão normalizar.");
      }
    }
    carregar();
    return () => { ativo = false; };
  }, []);

  // busca mudanças feitas em outro dispositivo (o storage não avisa sozinho, então checa periodicamente)
  const buscarAtualizacoes = useCallback(async (manual) => {
    // se salvamos algo por aqui há pouco segundos, não aceita nenhuma leitura agora —
    // evita que uma resposta levemente atrasada do storage sobrescreva a própria edição
    // que acabamos de fazer, o que parecia "o botão de salvar não funciona"
    const segundosDesdeUltimoSalvamento = (Date.now() - ultimoSalvamentoLocalRef.current) / 1000;
    if (segundosDesdeUltimoSalvamento < 10) {
      if (manual) mostrarToast("Aguardando seu último salvamento se confirmar...");
      return;
    }
    if (manual) setSincronizando(true);
    async function tentar() {
      const res = await window.storage.get(STORAGE_KEY, true);
      if (res && res.value && res.value !== ultimoValorRef.current) {
        ultimoValorRef.current = res.value;
        setDados(migrarDados(JSON.parse(res.value)));
        return "atualizado";
      }
      return "sem mudanças";
    }
    try {
      const resultado = await tentar();
      if (manual) mostrarToast(resultado === "atualizado" ? "Atualizado com as mudanças mais recentes" : "Já está tudo atualizado");
    } catch (primeiroErro) {
      // pode ser instabilidade passageira de rede — tenta mais uma vez antes de desistir
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const resultado = await tentar();
        if (manual) mostrarToast(resultado === "atualizado" ? "Atualizado com as mudanças mais recentes" : "Já está tudo atualizado");
      } catch (e) {
        console.error("Erro ao buscar atualizações", e);
        if (manual) mostrarToast(`Não consegui checar agora: ${e?.message || "erro desconhecido"}`);
      }
    } finally {
      if (manual) setSincronizando(false);
    }
  }, []);

  useEffect(() => {
    if (!pronto) return;
    const intervalo = setInterval(() => buscarAtualizacoes(false), 15000);
    return () => clearInterval(intervalo);
  }, [pronto, buscarAtualizacoes]);

  const salvar = useCallback(async (novo) => {
    setDados(novo);
    ultimoSalvamentoLocalRef.current = Date.now();
    const texto = JSON.stringify(novo);
    try {
      const resultado = await window.storage.set(STORAGE_KEY, texto, true);
      if (!resultado) {
        mostrarToast("Não consegui salvar agora. Tente de novo.");
      } else {
        ultimoValorRef.current = texto;
        ultimoSalvamentoLocalRef.current = Date.now();
      }
    } catch (e) {
      console.error("Erro ao salvar", e);
      mostrarToast("Não consegui salvar agora. Tente de novo.");
    }
  }, []);

  function mostrarToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  function irParaBusca(termo) {
    setBuscaExterna(termo);
    setBuscaSeed((s) => s + 1);
    setAba("buscar");
    setBuscaTopbar("");
  }

  if (!pronto || !dados) {
    return (
      <div ref={containerRef} className="w-full h-full min-h-[500px] flex items-center justify-center bg-white text-gray-400 text-sm">
        Carregando...
      </div>
    );
  }

  const notificacoes = calcularNotificacoes(dados);
  const naoLidas = notificacoes.filter((n) => !dados.notificacoesLidas.includes(n.id)).length;

  const titulos = {
    inicio: "Início", lista: "Lista de compras", estoque: "Estoque", mercados: "Mercados",
    buscar: "Buscar", notificacoes: "Notificações", perfil: "Perfil",
  };

  const sugestoesTopbar = buscaTopbar.length > 0
    ? dados.produtos.filter((p) =>
        p.nome.toLowerCase().includes(buscaTopbar.toLowerCase()) ||
        (p.marca || "").toLowerCase().includes(buscaTopbar.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[640px] bg-white text-gray-900 flex"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}
    >
      <GlobalStyle />

      {/* sidebar desktop — só renderiza quando o próprio artefato (não a janela) é largo o bastante */}
      {isDesktop && (
        <aside className="flex flex-col w-56 lg:w-64 border-r border-gray-200 flex-shrink-0 py-6 px-3">
          <div className="px-3 mb-8">
            <span className="text-xl tracking-tight" style={{ fontFamily: FONT_LOGO, fontWeight: 700 }}>
              Mercado<span className="text-gray-300">.</span>App
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.filter((item) => item.id !== "buscar").map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAba(id)}
                className={`mercado-nav-btn flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left ${
                  aba === id ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* topbar */}
        <header className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur z-20">
          {!isDesktop && (
            <span className="text-lg tracking-tight flex-shrink-0" style={{ fontFamily: FONT_LOGO, fontWeight: 700 }}>
              Mercado<span className="text-gray-300">.</span>App
            </span>
          )}
          {isDesktop && (
            <span className="font-semibold text-base flex-shrink-0 w-40">{titulos[aba]}</span>
          )}

          {isDesktop && (
            <div className="flex-1 flex justify-center px-4">
              <div className="relative w-full max-w-sm">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={buscaTopbar}
                  onChange={(e) => setBuscaTopbar(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && buscaTopbar.trim() && irParaBusca(buscaTopbar.trim())}
                  placeholder="Buscar produto ou marca..."
                  className="w-full pl-9 pr-3 py-2 rounded-full bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-black text-sm"
                />
                {sugestoesTopbar.length > 0 && (
                  <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-30">
                    {sugestoesTopbar.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => irParaBusca(p.nome)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center justify-between"
                      >
                        <span className="truncate">{p.nome}</span>
                        <span className="text-gray-400 text-xs flex-shrink-0 ml-2">{p.categoria}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={`flex items-center gap-1.5 flex-shrink-0 ${isDesktop ? "w-40 justify-end" : "ml-auto"}`}>
            <button
              onClick={() => buscarAtualizacoes(true)}
              disabled={sincronizando}
              title="Buscar mudanças feitas em outro aparelho"
              className="mercado-nav-btn p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-50"
            >
              <RefreshCw size={17} className={sincronizando ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setAba("notificacoes")}
              className={`mercado-nav-btn relative p-2 rounded-full ${aba === "notificacoes" ? "bg-black text-white" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <Bell size={18} />
              {naoLidas > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
            <button
              onClick={() => setAba("perfil")}
              className={`mercado-nav-btn p-2 rounded-full ${aba === "perfil" ? "bg-black text-white" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <UserIcon size={18} />
            </button>
          </div>
        </header>

        <main key={aba} className={`mercado-page-enter flex-1 px-5 py-6 max-w-2xl w-full mx-auto ${isDesktop ? "" : "pb-24"}`}>
          {aba === "inicio" && <Inicio dados={dados} />}
          {aba === "lista" && <Lista dados={dados} salvar={salvar} toast={mostrarToast} />}
          {aba === "estoque" && <Estoque dados={dados} salvar={salvar} toast={mostrarToast} />}
          {aba === "mercados" && <Mercados dados={dados} salvar={salvar} toast={mostrarToast} />}
          {aba === "buscar" && <Buscar key={buscaSeed} dados={dados} initialBusca={buscaExterna} />}
          {aba === "notificacoes" && (
            <Notificacoes dados={dados} salvar={salvar} notificacoes={notificacoes} />
          )}
          {aba === "perfil" && <Perfil dados={dados} salvar={salvar} toast={mostrarToast} />}
        </main>
      </div>

      {/* menu inferior — só quando o artefato não tem largura de desktop */}
      {!isDesktop && (
        <nav className="fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur border-t border-gray-200 flex items-stretch">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={`mercado-nav-btn flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
                aba === id ? "text-black" : "text-gray-400"
              }`}
            >
              <Icon size={18} strokeWidth={aba === id ? 2.5 : 2} />
              {label}
            </button>
          ))}
        </nav>
      )}

      {toast && (
        <div className={`fixed left-1/2 -translate-x-1/2 bg-black text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg z-30 mercado-modal-enter ${isDesktop ? "bottom-5" : "bottom-20"}`}>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------- Mercados ---------- */
function tendenciaMercado(compras, mercadoNome) {
  const doMercado = compras.filter((c) => c.mercado === mercadoNome);
  const porProduto = new Map();
  doMercado.forEach((c) => {
    const arr = porProduto.get(c.produtoId) || [];
    arr.push(c);
    porProduto.set(c.produtoId, arr);
  });
  let soma = 0, n = 0;
  porProduto.forEach((arr) => {
    if (arr.length < 2) return;
    const ordenado = [...arr].sort((a, b) => (a.data < b.data ? -1 : 1));
    const primeiro = ordenado[0];
    const ultimo = ordenado[ordenado.length - 1];
    if (primeiro.precoUnitario > 0) {
      soma += (ultimo.precoUnitario - primeiro.precoUnitario) / primeiro.precoUnitario;
      n++;
    }
  });
  if (n === 0) return null;
  return { percentual: (soma / n) * 100, baseadoEm: n };
}

function resumoMercado(dados, mercadoNome) {
  const compras = dados.compras.filter((c) => c.mercado === mercadoNome);
  const totalGasto = compras.reduce((s, c) => s + Number(c.precoTotal), 0);
  const visitas = new Set(compras.map((c) => c.data)).size;
  const produtosDistintos = new Set(compras.map((c) => c.produtoId)).size;
  const tendencia = tendenciaMercado(dados.compras, mercadoNome);
  const porData = new Map();
  compras.forEach((c) => porData.set(c.data, (porData.get(c.data) || 0) + Number(c.precoTotal)));
  const serieVisitas = Array.from(porData.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([data, total]) => ({ data: formatDataBR(data), total: Math.round(total * 100) / 100 }));
  return { nome: mercadoNome, totalGasto, visitas, produtosDistintos, tendencia, serieVisitas, ticketMedio: visitas > 0 ? totalGasto / visitas : 0 };
}

function BadgeTendencia({ tendencia }) {
  if (!tendencia) return <span className="text-xs text-gray-400">Sem dados suficientes</span>;
  const { percentual } = tendencia;
  if (percentual > 3) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
        <TrendingUpIcon size={12} /> Subindo {percentual.toFixed(0)}%
      </span>
    );
  }
  if (percentual < -3) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
        <TrendingDown size={12} /> Caindo {Math.abs(percentual).toFixed(0)}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
      <Minus size={12} /> Estável
    </span>
  );
}

/* ---------- Histórico em formato de cupom fiscal ---------- */
function CupomHistorico({ compras, mercado }) {
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const recibos = useMemo(() => {
    const filtradas = compras.filter((c) => {
      if (c.mercado !== mercado) return false;
      const bateBusca = busca.trim().length === 0 || c.produtoNome.toLowerCase().includes(busca.toLowerCase());
      const bateInicio = !dataInicio || c.data >= dataInicio;
      const bateFim = !dataFim || c.data <= dataFim;
      return bateBusca && bateInicio && bateFim;
    });
    const porData = new Map();
    filtradas.forEach((c) => {
      const arr = porData.get(c.data) || [];
      arr.push(c);
      porData.set(c.data, arr);
    });
    return Array.from(porData.entries())
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([data, itens]) => ({
        data,
        itens: itens.sort((a, b) => a.produtoNome.localeCompare(b.produtoNome)),
        total: itens.reduce((s, i) => s + Number(i.precoTotal), 0),
      }));
  }, [compras, mercado, busca, dataInicio, dataFim]);

  const filtrosAtivos = dataInicio || dataFim;
  const totalGeral = recibos.reduce((s, r) => s + r.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Histórico de compras</p>
        <span className="text-xs text-gray-400">{recibos.length} {recibos.length === 1 ? "visita" : "visitas"}</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto nesse mercado..."
            className="w-full pl-9 pr-3 py-2.5 rounded-full bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-black text-sm"
          />
        </div>
        <button
          onClick={() => setMostrarFiltros((v) => !v)}
          className={`p-2.5 rounded-full border ${filtrosAtivos ? "bg-black text-white border-transparent" : "border-gray-200 text-gray-400"}`}
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {mostrarFiltros && (
        <div className="border border-gray-200 rounded-2xl p-4 mb-4 grid grid-cols-2 gap-3">
          <label className="text-xs text-gray-400 flex flex-col gap-1">
            De
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm tabular-nums" />
          </label>
          <label className="text-xs text-gray-400 flex flex-col gap-1">
            Até
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm tabular-nums" />
          </label>
        </div>
      )}

      {recibos.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">Nada encontrado com esses filtros.</p>
      ) : (
        <div className="space-y-3">
          {recibos.map((r) => (
            <div key={r.data} className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">{formatDataBR(r.data)}</span>
                <span className="text-xs text-gray-400">{r.itens.length} {r.itens.length === 1 ? "item" : "itens"}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-3 space-y-1.5">
                {r.itens.map((i) => (
                  <div key={i.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate pr-3">{i.quantidade}x {i.produtoNome}</span>
                    <span className="tabular-nums text-gray-500 flex-shrink-0">{formatBRL(i.precoTotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-gray-200 mt-3 pt-3 flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-semibold tabular-nums">{formatBRL(r.total)}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between px-2 pt-1 text-xs text-gray-400">
            <span>Total no período filtrado</span>
            <span className="tabular-nums font-medium text-gray-600">{formatBRL(totalGeral)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MercadoAvatar({ info, size = 40 }) {
  if (info?.logo) {
    return (
      <img
        src={info.logo}
        alt={info.nome}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0 border border-gray-200"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, backgroundColor: (info?.cor || "#9CA3AF") + "22", color: info?.cor || "#9CA3AF" }}
      className="rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm"
    >
      {(info?.nome || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function MercadoModal({ info, onSalvar, onFechar }) {
  const [form, setForm] = useState(() => ({ nome: "", cor: "#9CA3AF", logo: "", endereco: "", ...info }));
  const [erro, setErro] = useState("");
  const fileInputRef = useRef(null);

  function campo(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function lerLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.onload = () => {
        const tamanho = 160;
        const canvas = document.createElement("canvas");
        canvas.width = tamanho;
        canvas.height = tamanho;
        const ctx = canvas.getContext("2d");
        const escala = Math.max(tamanho / img.width, tamanho / img.height);
        const w = img.width * escala, h = img.height * escala;
        ctx.drawImage(img, (tamanho - w) / 2, (tamanho - h) / 2, w, h);
        campo("logo", canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => setErro("Não consegui ler essa imagem. Tenta outra.");
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function confirmar(e) {
    e.preventDefault();
    if (!form.nome || !form.nome.trim()) {
      setErro("Dá um nome pro mercado antes de salvar.");
      return;
    }
    onSalvar(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="mercado-modal-enter bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <p className="font-medium">Editar mercado</p>
          <button onClick={onFechar} className="p-1 text-gray-400 hover:text-black"><X size={18} /></button>
        </div>
        <form onSubmit={confirmar} className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <MercadoAvatar info={form} size={56} />
            <div className="flex-1 flex items-center gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-medium border border-gray-200 rounded-full px-3 py-1.5">
                {form.logo ? "Trocar logo" : "Adicionar logo"}
              </button>
              {form.logo && (
                <button type="button" onClick={() => campo("logo", "")} className="text-xs text-red-500">Remover</button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={lerLogo} className="hidden" />
            </div>
          </div>

          <Campo label="Nome do mercado">
            <input required value={form.nome} onChange={(e) => campo("nome", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
          </Campo>

          <Campo label="Cor nos gráficos">
            <div className="flex items-center gap-3">
              <input type="color" value={form.cor} onChange={(e) => campo("cor", e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <span className="text-xs text-gray-400 tabular-nums">{form.cor}</span>
            </div>
          </Campo>

          <Campo label="Endereço (opcional)">
            <input value={form.endereco} onChange={(e) => campo("endereco", e.target.value)} placeholder="Rua, número, bairro" className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
          </Campo>

          {erro && <p className="text-xs text-red-500">{erro}</p>}

          <button type="submit" className="w-full bg-black text-white rounded-full py-3 text-sm font-medium mt-2">
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}

function Mercados({ dados, salvar, toast }) {
  const [selecionado, setSelecionado] = useState(null);
  const [editando, setEditando] = useState(null);
  const mercados = useMemo(() => Array.from(new Set(dados.compras.map((c) => c.mercado))), [dados.compras]);
  const resumos = useMemo(() => mercados.map((m) => resumoMercado(dados, m)).sort((a, b) => b.totalGasto - a.totalGasto), [dados, mercados]);
  const infoPorNome = useMemo(() => new Map((dados.mercadosInfo || []).map((m) => [m.nome, m])), [dados.mercadosInfo]);

  function salvarMercado(formEditado) {
    const nomeAntigo = editando.nome;
    const nomeNovo = formEditado.nome.trim();
    const renomeou = nomeNovo !== nomeAntigo;
    const existe = (dados.mercadosInfo || []).some((m) => m.nome === nomeAntigo);

    const novasInfos = existe
      ? dados.mercadosInfo.map((m) => (m.nome === nomeAntigo ? { ...formEditado, nome: nomeNovo } : m))
      : [...(dados.mercadosInfo || []), { ...formEditado, nome: nomeNovo }];
    const novasCompras = renomeou
      ? dados.compras.map((c) => (c.mercado === nomeAntigo ? { ...c, mercado: nomeNovo } : c))
      : dados.compras;

    salvar({ ...dados, mercadosInfo: novasInfos, compras: novasCompras });
    if (renomeou && selecionado === nomeAntigo) setSelecionado(nomeNovo);
    setEditando(null);
    toast("Mercado atualizado");
  }

  if (selecionado) {
    const r = resumos.find((x) => x.nome === selecionado);
    const info = infoPorNome.get(selecionado);
    if (!r) { setSelecionado(null); return null; }
    return (
      <div key={selecionado} className="mercado-page-enter">
        <button onClick={() => setSelecionado(null)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-black mb-4">
          <ArrowLeft size={15} /> Mercados
        </button>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MercadoAvatar info={info} size={44} />
            <div>
              <h1 className="text-2xl font-semibold">{r.nome}</h1>
              {info?.endereco && <p className="text-xs text-gray-400">{info.endereco}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BadgeTendencia tendencia={r.tendencia} />
            <button onClick={() => setEditando(info || { id: uid(), nome: r.nome, cor: "#9CA3AF", logo: "", endereco: "" })} className="p-2 text-gray-400 hover:text-black border border-gray-200 rounded-full">
              <Pencil size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="border border-gray-200 rounded-2xl p-5">
            <p className="text-2xl font-semibold tabular-nums">{formatBRL(r.totalGasto)}</p>
            <p className="text-xs text-gray-400 mt-1">Total gasto</p>
          </div>
          <div className="border border-gray-200 rounded-2xl p-5">
            <p className="text-2xl font-semibold tabular-nums">{r.visitas}</p>
            <p className="text-xs text-gray-400 mt-1">Visitas registradas</p>
          </div>
          <div className="border border-gray-200 rounded-2xl p-5">
            <p className="text-2xl font-semibold tabular-nums">{formatBRL(r.ticketMedio)}</p>
            <p className="text-xs text-gray-400 mt-1">Ticket médio por visita</p>
          </div>
          <div className="border border-gray-200 rounded-2xl p-5">
            <p className="text-2xl font-semibold tabular-nums">{r.produtosDistintos}</p>
            <p className="text-xs text-gray-400 mt-1">Produtos distintos</p>
          </div>
        </div>

        {r.serieVisitas.length > 1 && (
          <div className="border border-gray-200 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-4">Gasto por visita ao longo do tempo</p>
            <div className="h-48 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={r.serieVisitas} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillMercado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={info?.cor || "#000000"} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={info?.cor || "#000000"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <Tooltip formatter={(value) => [formatBRL(value), "Gasto"]} contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="total" stroke={info?.cor || "#000000"} strokeWidth={2} fill="url(#fillMercado)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3 mb-6">
          A tendência compara o preço da primeira e da última compra de cada produto repetido nesse mercado, e tira a média. {r.tendencia ? `Baseado em ${r.tendencia.baseadoEm} produtos comprados mais de uma vez ali.` : ""}
        </p>

        <CupomHistorico compras={dados.compras} mercado={r.nome} />

        {editando && <MercadoModal info={editando} onSalvar={salvarMercado} onFechar={() => setEditando(null)} />}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Mercados</h1>
      <p className="text-gray-400 text-sm mb-6">Compare gasto, ticket médio e tendência de preço entre onde você compra</p>
      <div className="space-y-2">
        {resumos.map((r) => {
          const info = infoPorNome.get(r.nome);
          return (
            <div key={r.nome} className="border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-3 hover:border-gray-300">
              <button onClick={() => setSelecionado(r.nome)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <MercadoAvatar info={info} />
                <div className="min-w-0">
                  <p className="font-medium truncate">{r.nome}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.visitas} visitas · {formatBRL(r.totalGasto)} no total</p>
                </div>
              </button>
              <div className="flex items-center gap-2 flex-shrink-0">
                <BadgeTendencia tendencia={r.tendencia} />
                <button onClick={() => setEditando(info || { id: uid(), nome: r.nome, cor: "#9CA3AF", logo: "", endereco: "" })} className="p-1.5 text-gray-400 hover:text-black">
                  <Pencil size={14} />
                </button>
                <ChevronRight size={16} className="text-gray-300" onClick={() => setSelecionado(r.nome)} />
              </div>
            </div>
          );
        })}
        {resumos.length === 0 && <p className="text-center text-gray-400 text-sm py-16">Nenhuma compra registrada ainda.</p>}
      </div>

      {editando && <MercadoModal info={editando} onSalvar={salvarMercado} onFechar={() => setEditando(null)} />}
    </div>
  );
}

/* ---------- Notificações (lógica) ---------- */
function calcularNotificacoes(dados) {
  const lista = [];
  const prefs = dados.usuario?.notificacoes || { estoqueBaixo: true, economia: true };

  if (prefs.estoqueBaixo) {
    dados.produtos
      .filter((p) => p.estoqueMinimo > 0 && p.estoqueAtual <= p.estoqueMinimo)
      .forEach((p) => {
        lista.push({
          id: `estoque-${p.id}`,
          tipo: "estoque",
          titulo: `Repor ${p.nome}`,
          descricao: `Estoque atual (${p.estoqueAtual}) está no mínimo ou abaixo (${p.estoqueMinimo}).`,
          data: null,
        });
      });
  }

  if (prefs.economia) {
    const porProduto = new Map();
    dados.compras.forEach((c) => {
      const arr = porProduto.get(c.produtoId) || [];
      arr.push(c);
      porProduto.set(c.produtoId, arr);
    });
    porProduto.forEach((arr, produtoId) => {
      if (arr.length < 2) return;
      const porData = [...arr].sort((a, b) => (a.data < b.data ? 1 : -1));
      const ultimo = porData[0];
      const maisBarato = [...arr].sort((a, b) => a.precoUnitario - b.precoUnitario)[0];
      if (maisBarato.mercado === ultimo.mercado) return;
      if (ultimo.precoUnitario > maisBarato.precoUnitario * 1.15) {
        const dif = ultimo.precoUnitario - maisBarato.precoUnitario;
        lista.push({
          id: `economia-${produtoId}`,
          tipo: "economia",
          titulo: `${ultimo.produtoNome} sai mais barato na ${maisBarato.mercado}`,
          descricao: `Última compra: ${formatBRL(ultimo.precoUnitario)} na ${ultimo.mercado}. Na ${maisBarato.mercado} saiu por ${formatBRL(maisBarato.precoUnitario)} (economia de ${formatBRL(dif)}).`,
          data: null,
        });
      }
    });
  }

  return lista;
}

function Notificacoes({ dados, salvar, notificacoes }) {
  const [filtro, setFiltro] = useState("todas"); // todas | naoLidas

  function marcarComoLida(id) {
    if (dados.notificacoesLidas.includes(id)) return;
    salvar({ ...dados, notificacoesLidas: [...dados.notificacoesLidas, id] });
  }
  function marcarTodasComoLidas() {
    const todosIds = notificacoes.map((n) => n.id);
    salvar({ ...dados, notificacoesLidas: Array.from(new Set([...dados.notificacoesLidas, ...todosIds])) });
  }

  const naoLidas = notificacoes.filter((n) => !dados.notificacoesLidas.includes(n.id));
  const lidas = notificacoes.filter((n) => dados.notificacoesLidas.includes(n.id));
  const lidasVisiveis = filtro === "todas" ? lidas : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Notificações</h1>
          <p className="text-gray-400 text-sm mt-1">Alertas gerados a partir do seu estoque e histórico</p>
        </div>
        {naoLidas.length > 0 && (
          <button onClick={marcarTodasComoLidas} className="text-xs font-medium text-gray-400 hover:text-black">
            Marcar tudo como lido
          </button>
        )}
      </div>

      {notificacoes.length > 0 && (
        <div className="flex bg-gray-50 border border-gray-200 rounded-full p-1 text-xs w-fit mb-6">
          <button onClick={() => setFiltro("todas")} className={`px-3 py-1.5 rounded-full font-medium ${filtro === "todas" ? "bg-black text-white" : "text-gray-400"}`}>
            Todas ({notificacoes.length})
          </button>
          <button onClick={() => setFiltro("naoLidas")} className={`px-3 py-1.5 rounded-full font-medium ${filtro === "naoLidas" ? "bg-black text-white" : "text-gray-400"}`}>
            Não lidas ({naoLidas.length})
          </button>
        </div>
      )}

      {notificacoes.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm flex flex-col items-center gap-3">
          <BellOff size={28} className="text-gray-300" />
          Nenhuma notificação por enquanto.
        </div>
      ) : naoLidas.length === 0 && filtro === "naoLidas" ? (
        <div className="text-center py-16 text-gray-400 text-sm flex flex-col items-center gap-3">
          <Check size={28} className="text-gray-300" />
          Tudo em dia por aqui.
        </div>
      ) : (
        <div className="space-y-2">
          {naoLidas.map((n) => (
            <NotifCard key={n.id} n={n} lida={false} onClick={() => marcarComoLida(n.id)} />
          ))}
          {lidasVisiveis.length > 0 && (
            <>
              <p className="text-xs uppercase tracking-wide text-gray-400 mt-6 mb-2 font-medium">Lidas</p>
              {lidasVisiveis.map((n) => (
                <NotifCard key={n.id} n={n} lida={true} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function NotifCard({ n, lida, onClick }) {
  const Icon = n.tipo === "estoque" ? AlertTriangle : TrendingUpIcon;
  const cor = n.tipo === "estoque" ? "text-amber-500 bg-amber-50" : "text-green-600 bg-green-50";
  return (
    <button
      onClick={onClick}
      disabled={lida}
      className={`w-full text-left flex items-start gap-3 border rounded-xl px-4 py-3 ${
        lida ? "border-gray-100 opacity-50" : "border-gray-200"
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cor}`}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{n.titulo}</p>
        <p className="text-xs text-gray-400 mt-0.5">{n.descricao}</p>
      </div>
      {!lida && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />}
    </button>
  );
}

/* ---------- Perfil ---------- */
function Perfil({ dados, salvar, toast }) {
  const [nome, setNome] = useState(dados.usuario.nome);
  const [novoMembro, setNovoMembro] = useState("");
  const [novoPapel, setNovoPapel] = useState("Membro");
  const [modalImportar, setModalImportar] = useState(false);

  function salvarNome() {
    salvar({ ...dados, usuario: { ...dados.usuario, nome } });
    toast("Nome atualizado");
  }

  function togglePref(chave) {
    const novasPrefs = { ...dados.usuario.notificacoes, [chave]: !dados.usuario.notificacoes[chave] };
    salvar({ ...dados, usuario: { ...dados.usuario, notificacoes: novasPrefs } });
  }

  function adicionarMembro() {
    if (!novoMembro.trim()) return;
    salvar({ ...dados, familia: [...dados.familia, { id: uid(), nome: novoMembro.trim(), papel: novoPapel }] });
    setNovoMembro("");
    toast("Membro adicionado");
  }

  function alterarPapel(id, papel) {
    salvar({ ...dados, familia: dados.familia.map((m) => (m.id === id ? { ...m, papel } : m)) });
  }

  function removerMembro(id) {
    if (dados.familia.length <= 1) {
      toast("Precisa ter pelo menos um membro");
      return;
    }
    salvar({ ...dados, familia: dados.familia.filter((m) => m.id !== id) });
  }

  function alterarCorCategoria(categoria, cor) {
    salvar({ ...dados, categoriasInfo: { ...dados.categoriasInfo, [categoria]: cor } });
  }

  function limparListaComprados() {
    salvar({ ...dados, lista: dados.lista.filter((i) => !i.comprado) });
    toast("Itens comprados removidos da lista");
  }

  function resetarTudo() {
    if (!window.confirm("Isso apaga todos os produtos, compras e a lista atual. Não dá pra desfazer. Confirma?")) return;
    const inicial = buildInitialState();
    salvar(inicial);
    toast("Dados resetados");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Perfil</h1>
        <p className="text-gray-400 text-sm">Sua conta e preferências do app</p>
      </div>

      <div className="border border-gray-200 rounded-2xl p-5">
        <p className="text-sm font-medium mb-3">Sua conta</p>
        <label className="text-xs text-gray-400 flex flex-col gap-1 mb-3">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onBlur={salvarNome}
            className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm"
          />
        </label>
        <p className="text-xs text-gray-400">
          Os dados desse app são compartilhados: qualquer pessoa que abrir esse mesmo artefato vê e edita a mesma lista, estoque e histórico.
        </p>
      </div>

      <div className="border border-gray-200 rounded-2xl p-5">
        <p className="text-sm font-medium mb-3">Notificações</p>
        <div className="space-y-3">
          <PrefToggle
            label="Estoque baixo"
            descricao="Avisar quando um produto atingir o estoque mínimo"
            ativo={dados.usuario.notificacoes.estoqueBaixo}
            onClick={() => togglePref("estoqueBaixo")}
          />
          <PrefToggle
            label="Oportunidades de economia"
            descricao="Avisar quando um produto sair bem mais barato em outro mercado"
            ativo={dados.usuario.notificacoes.economia}
            onClick={() => togglePref("economia")}
          />
        </div>
      </div>

      <div className="border border-gray-200 rounded-2xl p-5">
        <p className="text-sm font-medium mb-1">Cores das categorias</p>
        <p className="text-xs text-gray-400 mb-4">Usadas nos gráficos de gasto por categoria</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {CATEGORIAS.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-xs">
              <input
                type="color"
                value={dados.categoriasInfo?.[cat] || "#9CA3AF"}
                onChange={(e) => alterarCorCategoria(cat, e.target.value)}
                className="w-6 h-6 rounded-md border border-gray-200 cursor-pointer flex-shrink-0"
              />
              <span className="truncate">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Users size={15} className="text-gray-400" />
          <p className="text-sm font-medium">Família</p>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Organize quem faz parte e o papel de cada um. Como o app ainda não tem login individual, isso é organizacional — todos continuam vendo e editando os mesmos dados.
        </p>
        <div className="space-y-2 mb-4">
          {dados.familia.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-2 border border-gray-100 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                  {m.nome.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm truncate">{m.nome}</span>
                {m.papel === "Administrador" && <Shield size={12} className="text-gray-400 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <select
                  value={m.papel}
                  onChange={(e) => alterarPapel(m.id, e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Membro">Membro</option>
                </select>
                <button onClick={() => removerMembro(m.id)} className="text-gray-300 hover:text-red-500 p-1">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={novoMembro}
            onChange={(e) => setNovoMembro(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionarMembro()}
            placeholder="Nome do familiar"
            className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
          />
          <select value={novoPapel} onChange={(e) => setNovoPapel(e.target.value)} className="text-xs bg-gray-50 border border-gray-200 rounded-full px-2.5 py-2">
            <option value="Membro">Membro</option>
            <option value="Administrador">Administrador</option>
          </select>
          <button onClick={adicionarMembro} className="p-2 rounded-full bg-black text-white flex-shrink-0">
            <UserPlus size={15} />
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-2xl p-5">
        <p className="text-sm font-medium mb-3">Dados</p>
        <button onClick={() => setModalImportar(true)} className="w-full text-left text-sm text-gray-600 py-2 flex items-center justify-between">
          Importar compras (Excel / CSV)
          <ChevronRight size={15} className="text-gray-300" />
        </button>
        <div className="h-px bg-gray-100 my-1" />
        <button onClick={limparListaComprados} className="w-full text-left text-sm text-gray-600 py-2 flex items-center justify-between">
          Limpar itens já comprados da lista
          <ChevronRight size={15} className="text-gray-300" />
        </button>
        <div className="h-px bg-gray-100 my-1" />
        <button onClick={resetarTudo} className="w-full text-left text-sm text-red-500 py-2 flex items-center justify-between">
          Resetar todos os dados
          <ChevronRight size={15} className="text-red-200" />
        </button>
      </div>

      {modalImportar && (
        <ImportarModal dados={dados} salvar={salvar} toast={toast} onFechar={() => setModalImportar(false)} />
      )}
    </div>
  );
}

function PrefToggle({ label, descricao, ativo, onClick }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm">{label}</p>
        <p className="text-xs text-gray-400">{descricao}</p>
      </div>
      <button
        onClick={onClick}
        className={`w-11 h-6 rounded-full flex-shrink-0 flex items-center px-0.5 transition-colors ${
          ativo ? "bg-black justify-end" : "bg-gray-200 justify-start"
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-white shadow" />
      </button>
    </div>
  );
}

/* ---------- Importar compras (Excel / CSV) ---------- */
const ALIASES = {
  nome: ["produto", "item", "nome", "descricao", "descrição"],
  marca: ["marca"],
  categoria: ["categoria"],
  mercado: ["mercado", "loja", "supermercado"],
  data: ["data", "data da compra", "data compra"],
  quantidade: ["quantidade", "qtd", "qtde", "qt"],
  precoUnitario: ["preco unitario", "preço unitário", "preco un", "preço un", "valor unitario", "valor unitário", "preco", "preço", "preço un", "preco un."],
  precoTotal: ["preco total", "preço total", "valor total", "total"],
};

function normalizarCabecalho(h) {
  return h.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function mapearColunas(headers) {
  const normalizados = headers.map(normalizarCabecalho);
  const mapa = {};
  Object.entries(ALIASES).forEach(([campo, opcoes]) => {
    const opcoesNorm = opcoes.map(normalizarCabecalho);
    const idx = normalizados.findIndex((h) => opcoesNorm.includes(h));
    if (idx !== -1) mapa[campo] = idx;
  });
  return mapa;
}

function parseData(str) {
  if (!str) return "";
  const s = str.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    let [, d, mo, y] = m;
    if (y.length === 2) y = "20" + y;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return "";
}

function parseNumero(str) {
  if (str === undefined || str === null || str === "") return null;
  let s = String(str).trim().replace(/^R\$\s*/i, "");
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function parseTabela(texto) {
  const linhas = texto.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (linhas.length < 2) return { erro: "Cole pelo menos um cabeçalho e uma linha de dados." };

  const candidatos = ["\t", ";", ","];
  const delim = candidatos.find((d) => linhas[0].split(d).length > 1) || "\t";

  const headers = linhas[0].split(delim).map((h) => h.trim());
  const mapa = mapearColunas(headers);

  if (mapa.nome === undefined) {
    return { erro: "Não encontrei uma coluna de produto (nome/item/produto). Confira o cabeçalho." };
  }

  const linhasDados = linhas.slice(1).map((linha, i) => {
    const cols = linha.split(delim).map((c) => c.trim());
    const nome = cols[mapa.nome] || "";
    const marca = mapa.marca !== undefined ? cols[mapa.marca] || "" : "";
    const categoria = mapa.categoria !== undefined ? cols[mapa.categoria] || "" : "";
    const mercado = mapa.mercado !== undefined ? cols[mapa.mercado] || "" : "";
    const data = parseData(mapa.data !== undefined ? cols[mapa.data] : "");
    const quantidade = mapa.quantidade !== undefined ? parseNumero(cols[mapa.quantidade]) : 1;
    let precoUnitario = mapa.precoUnitario !== undefined ? parseNumero(cols[mapa.precoUnitario]) : null;
    let precoTotal = mapa.precoTotal !== undefined ? parseNumero(cols[mapa.precoTotal]) : null;

    const qtd = quantidade || 1;
    if (precoUnitario === null && precoTotal !== null) precoUnitario = precoTotal / qtd;
    if (precoTotal === null && precoUnitario !== null) precoTotal = precoUnitario * qtd;

    const erros = [];
    if (!nome) erros.push("sem nome");
    if (!mercado) erros.push("sem mercado");
    if (!data) erros.push("data inválida");
    if (precoUnitario === null) erros.push("sem preço");

    return {
      linha: i + 2, nome, marca, categoria, mercado, data,
      quantidade: qtd, precoUnitario, precoTotal, erros,
    };
  });

  return { linhas: linhasDados };
}

function ImportarModal({ dados, salvar, toast, onFechar }) {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState(null);
  const fileInputRef = useRef(null);

  function processar() {
    if (!texto.trim()) return;
    setResultado(parseTabela(texto));
  }

  function lerArquivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTexto(ev.target.result);
      setResultado(parseTabela(ev.target.result));
    };
    reader.readAsText(file, "utf-8");
  }

  function confirmarImportacao() {
    const validas = resultado.linhas.filter((l) => l.erros.length === 0);
    if (validas.length === 0) return;

    let produtos = [...dados.produtos];
    const novasCompras = [];

    validas.forEach((l) => {
      let produto = produtos.find((p) => p.nome.trim().toLowerCase() === l.nome.trim().toLowerCase());
      if (!produto) {
        produto = {
          id: uid(), nome: l.nome, marca: l.marca || "", pesoVolume: "",
          categoria: l.categoria || "Outros", codigoBarras: "",
          estoqueAtual: 0, estoqueMinimo: 0, ultimaCompraData: l.data,
        };
        produtos.push(produto);
      } else if (!produto.ultimaCompraData || l.data > produto.ultimaCompraData) {
        produtos = produtos.map((p) => (p.id === produto.id ? { ...p, ultimaCompraData: l.data } : p));
      }
      novasCompras.push({
        id: uid(), produtoId: produto.id, produtoNome: produto.nome, mercado: l.mercado,
        quantidade: l.quantidade, precoUnitario: Math.round(l.precoUnitario * 100) / 100,
        precoTotal: Math.round(l.precoTotal * 100) / 100, data: l.data,
      });
    });

    salvar({ ...dados, produtos, compras: [...dados.compras, ...novasCompras] });
    toast(`${validas.length} ${validas.length === 1 ? "compra importada" : "compras importadas"}`);
    onFechar();
  }

  const totalErros = resultado?.linhas?.filter((l) => l.erros.length > 0).length || 0;
  const totalValidas = resultado?.linhas?.filter((l) => l.erros.length === 0).length || 0;

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="mercado-modal-enter bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <p className="font-medium">Importar compras</p>
          <button onClick={onFechar} className="p-1 text-gray-400 hover:text-black"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {!resultado && (
            <>
              <p className="text-sm text-gray-500">
                Cole abaixo uma tabela com colunas de produto, mercado, data, quantidade e preço — do jeito que sai quando você pede pra transformar o PDF do cupom em tabela. Ou envie um arquivo .csv.
              </p>
              <p className="text-xs text-gray-400">
                Cabeçalhos aceitos: Produto (ou Item), Marca, Categoria, Mercado, Data, Quantidade, Preço Unitário, Preço Total.
              </p>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={"Produto\tMercado\tData\tQuantidade\tPreço Unitário\nArroz Rei Arthur 5kg\tEconomart\t20/08/2026\t1\t20,98"}
                rows={7}
                className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono resize-none"
              />
              <div className="flex items-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 border border-gray-200 rounded-full py-2.5 text-sm font-medium text-gray-600">
                  Escolher arquivo .csv
                </button>
                <button onClick={processar} disabled={!texto.trim()} className="flex-1 bg-black text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-30">
                  Analisar
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv,.txt,.tsv" onChange={lerArquivo} className="hidden" />
            </>
          )}

          {resultado?.erro && (
            <div className="text-center py-8">
              <p className="text-sm text-red-500 mb-4">{resultado.erro}</p>
              <button onClick={() => setResultado(null)} className="text-sm text-gray-500 underline">Tentar de novo</button>
            </div>
          )}

          {resultado?.linhas && (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  <span className="font-medium text-gray-900">{totalValidas}</span> prontas pra importar
                  {totalErros > 0 && <span className="text-amber-600"> · {totalErros} com problema</span>}
                </span>
                <button onClick={() => setResultado(null)} className="text-gray-400 underline">Editar texto</button>
              </div>
              <div className="border border-gray-200 rounded-xl max-h-64 overflow-y-auto divide-y divide-gray-100">
                {resultado.linhas.map((l, i) => (
                  <div key={i} className={`px-3 py-2 text-xs ${l.erros.length > 0 ? "bg-amber-50" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate pr-2">{l.nome || `(linha ${l.linha} sem nome)`}</span>
                      <span className="tabular-nums text-gray-500 flex-shrink-0">
                        {l.precoUnitario !== null ? formatBRL(l.precoUnitario) : "—"}
                      </span>
                    </div>
                    <div className="text-gray-400 mt-0.5">
                      {l.mercado || "sem mercado"} · {l.data ? formatDataBR(l.data) : "sem data"} · {l.quantidade}x
                      {l.erros.length > 0 && <span className="text-amber-600 ml-1">({l.erros.join(", ")})</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={confirmarImportacao}
                disabled={totalValidas === 0}
                className="w-full bg-black text-white rounded-full py-3 text-sm font-medium disabled:opacity-30"
              >
                Importar {totalValidas} {totalValidas === 1 ? "compra" : "compras"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Início ---------- */
function Inicio({ dados }) {
  const pendentes = dados.lista.filter((i) => !i.comprado).length;
  const estoqueBaixo = dados.produtos.filter(
    (p) => p.estoqueMinimo > 0 && p.estoqueAtual <= p.estoqueMinimo
  ).length;

  const { porMes, porCategoria, porMercadoTotal, economiaPorMes, gastoMes, gastoMesAnterior, economiaTotal } = useMemo(() => {
    const mesesMap = new Map();
    const catMap = new Map();
    const mercadoMap = new Map();

    // menor preço unitário já visto por produto (histórico completo, qualquer mercado)
    const menorPreco = new Map();
    dados.compras.forEach((c) => {
      const atual = menorPreco.get(c.produtoId);
      if (atual === undefined || c.precoUnitario < atual) menorPreco.set(c.produtoId, c.precoUnitario);
    });

    const economiaMesesMap = new Map(); // chave -> { real, ideal }
    let somaReal = 0, somaIdeal = 0;

    dados.compras.forEach((c) => {
      const [y, m] = c.data.split("-");
      const chave = `${y}-${m}`;
      mesesMap.set(chave, (mesesMap.get(chave) || 0) + Number(c.precoTotal));
      const produto = dados.produtos.find((p) => p.id === c.produtoId);
      const cat = produto?.categoria || "Outros";
      catMap.set(cat, (catMap.get(cat) || 0) + Number(c.precoTotal));
      mercadoMap.set(c.mercado, (mercadoMap.get(c.mercado) || 0) + Number(c.precoTotal));

      const menor = menorPreco.get(c.produtoId) ?? c.precoUnitario;
      const ideal = menor * c.quantidade;
      const entry = economiaMesesMap.get(chave) || { real: 0, ideal: 0 };
      entry.real += Number(c.precoTotal);
      entry.ideal += ideal;
      economiaMesesMap.set(chave, entry);
      somaReal += Number(c.precoTotal);
      somaIdeal += ideal;
    });

    const nomesMes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const ordenado = Array.from(mesesMap.entries()).sort(([a], [b]) => (a > b ? 1 : -1));
    const porMes = ordenado.slice(-6).map(([chave, total]) => {
      const [, mm] = chave.split("-");
      return { mes: nomesMes[Number(mm) - 1], total: Math.round(total * 100) / 100 };
    });
    const porCategoria = Array.from(catMap.entries())
      .map(([categoria, total]) => ({ categoria, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
    const porMercadoTotal = Array.from(mercadoMap.entries())
      .map(([mercado, total]) => ({ mercado, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total);

    const economiaOrdenado = Array.from(economiaMesesMap.entries()).sort(([a], [b]) => (a > b ? 1 : -1));
    const economiaPorMes = economiaOrdenado.slice(-6).map(([chave, { real, ideal }]) => {
      const [, mm] = chave.split("-");
      const percentual = real > 0 ? ((real - ideal) / real) * 100 : 0;
      return { mes: nomesMes[Number(mm) - 1], percentual: Math.round(percentual * 10) / 10 };
    });

    const hoje = new Date();
    const chaveAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
    const anteriorDate = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const chaveAnterior = `${anteriorDate.getFullYear()}-${String(anteriorDate.getMonth() + 1).padStart(2, "0")}`;
    return {
      porMes, porCategoria, porMercadoTotal, economiaPorMes,
      gastoMes: mesesMap.get(chaveAtual) || 0,
      gastoMesAnterior: mesesMap.get(chaveAnterior) || 0,
      economiaTotal: { valor: somaReal - somaIdeal, percentual: somaReal > 0 ? ((somaReal - somaIdeal) / somaReal) * 100 : 0 },
    };
  }, [dados]);

  const variacao = gastoMesAnterior > 0 ? ((gastoMes - gastoMesAnterior) / gastoMesAnterior) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-gray-200 rounded-2xl p-5">
          <ShoppingCart size={18} className="text-gray-400" />
          <p className="text-3xl font-semibold mt-3 tabular-nums">{pendentes}</p>
          <p className="text-xs text-gray-400 mt-1">Itens na lista</p>
        </div>
        <div className="border border-gray-200 rounded-2xl p-5">
          <AlertTriangle size={18} className={estoqueBaixo > 0 ? "text-amber-500" : "text-gray-400"} />
          <p className="text-3xl font-semibold mt-3 tabular-nums">{estoqueBaixo}</p>
          <p className="text-xs text-gray-400 mt-1">Abaixo do mínimo</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-2xl p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Gasto neste mês</p>
            <p className="text-4xl font-semibold tabular-nums">{formatBRL(gastoMes)}</p>
          </div>
          {gastoMesAnterior > 0 && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${variacao <= 0 ? "text-green-700 bg-green-50" : "text-amber-700 bg-amber-50"}`}>
              {variacao > 0 ? "+" : ""}{variacao.toFixed(0)}% vs mês anterior
            </span>
          )}
        </div>
        <div className="h-40 mt-4 -mx-2">
          {porMes.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={porMes} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillGasto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000000" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Tooltip formatter={(value) => [formatBRL(value), "Gasto"]} contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="#000000" strokeWidth={2} fill="url(#fillGasto)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {porCategoria.length > 0 && (
        <div className="border border-gray-200 rounded-2xl p-6">
          <p className="text-sm text-gray-400 mb-4">Gasto por categoria</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porCategoria} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="categoria" width={110} axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Tooltip formatter={(value) => [formatBRL(value), "Gasto"]} contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 12 }} cursor={{ fill: "#F9FAFB" }} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={18}>
                  {porCategoria.map((entry, i) => (
                    <Cell key={i} fill={dados.categoriasInfo?.[entry.categoria] || "#000000"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {porMercadoTotal.length > 0 && (
        <div className="border border-gray-200 rounded-2xl p-6">
          <p className="text-sm text-gray-400 mb-4">Gasto total por mercado</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porMercadoTotal} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="mercado" width={100} axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Tooltip formatter={(value) => [formatBRL(value), "Gasto"]} contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 12 }} cursor={{ fill: "#F9FAFB" }} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={18}>
                  {porMercadoTotal.map((entry, i) => (
                    <Cell key={i} fill={corDoMercado(dados, entry.mercado)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {economiaPorMes.length > 0 && (
        <div className="border border-gray-200 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-1">
            <p className="text-sm text-gray-400">Fator economia por mês</p>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${economiaTotal.percentual > 10 ? "text-amber-700 bg-amber-50" : "text-green-700 bg-green-50"}`}>
              {economiaTotal.percentual <= 1 ? "já otimizado" : `${economiaTotal.percentual.toFixed(1)}% de espaço`}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Compara o que você pagou com o menor preço já registrado pra cada produto, em qualquer mercado — quanto menor, mais próximo do ideal você já está comprando. {economiaTotal.valor > 0 ? `Escolhendo sempre o mercado mais barato, dava pra guardar mais ${formatBRL(economiaTotal.valor)} no período.` : "Você já compra quase sempre pelo menor preço visto."}
          </p>
          <div className="h-48 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={economiaPorMes} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <YAxis hide />
                <Tooltip formatter={(value) => [`${value}%`, "Espaço de economia"]} contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, fontSize: 12 }} cursor={{ fill: "#F9FAFB" }} />
                <Bar dataKey="percentual" fill="#000000" radius={[6, 6, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Lista de compras ---------- */
function Lista({ dados, salvar, toast }) {
  const [busca, setBusca] = useState("");

  const ultimoPreco = useMemo(() => {
    const map = new Map();
    const ordenadas = [...dados.compras].sort((a, b) => (a.data < b.data ? 1 : -1));
    ordenadas.forEach((c) => { if (!map.has(c.produtoId)) map.set(c.produtoId, c.precoUnitario); });
    return map;
  }, [dados.compras]);

  const pendentes = dados.lista.filter((i) => !i.comprado);
  const comprados = dados.lista.filter((i) => i.comprado);
  const estimativa = pendentes.reduce((sum, item) => sum + (ultimoPreco.get(item.produtoId) || 0) * item.quantidade, 0);

  const sugestoes = dados.produtos.filter((p) =>
    busca.length > 0 && p.nome.toLowerCase().includes(busca.toLowerCase()) && !dados.lista.some((i) => i.produtoId === p.id)
  ).slice(0, 8);

  function adicionarItem(produtoId, produtoNome) {
    salvar({ ...dados, lista: [...dados.lista, { id: uid(), produtoId, produtoNome, quantidade: 1, comprado: false }] });
    setBusca("");
  }

  function adicionarNovoProduto() {
    if (!busca.trim()) return;
    const novoProduto = { id: uid(), nome: busca.trim(), marca: "", pesoVolume: "", categoria: "Outros", codigoBarras: "", estoqueAtual: 0, estoqueMinimo: 0, ultimaCompraData: "" };
    salvar({
      ...dados,
      produtos: [...dados.produtos, novoProduto],
      lista: [...dados.lista, { id: uid(), produtoId: novoProduto.id, produtoNome: novoProduto.nome, quantidade: 1, comprado: false }],
    });
    setBusca("");
  }

  function toggleComprado(id) {
    salvar({ ...dados, lista: dados.lista.map((i) => (i.id === id ? { ...i, comprado: !i.comprado } : i)) });
  }
  function removerItem(id) {
    salvar({ ...dados, lista: dados.lista.filter((i) => i.id !== id) });
  }
  function alterarQuantidade(id, delta) {
    salvar({ ...dados, lista: dados.lista.map((i) => (i.id === id ? { ...i, quantidade: Math.max(1, i.quantidade + delta) } : i)) });
  }

  async function copiarLista() {
    const texto = pendentes.map((i) => `• ${i.produtoNome} (${i.quantidade}x)`).join("\n");
    const conteudo = `Lista de compras\n\n${texto}\n\nEstimativa: ${formatBRL(estimativa)}`;
    try {
      await navigator.clipboard.writeText(conteudo);
      toast("Lista copiada");
    } catch (e) {
      toast("Não foi possível copiar");
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Lista de compras</h1>
          <p className="text-gray-400 text-sm mt-1">{pendentes.length} {pendentes.length === 1 ? "item pendente" : "itens pendentes"}</p>
        </div>
        <button onClick={copiarLista} disabled={pendentes.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium disabled:opacity-30">
          <Copy size={14} /> Copiar
        </button>
      </div>

      <div className="relative mb-6">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar ou adicionar item..." className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-black text-sm" />
        {busca.length > 0 && (
          <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-10 max-h-64 overflow-y-auto">
            {sugestoes.map((p) => (
              <button key={p.id} onClick={() => adicionarItem(p.id, p.nome)} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-center justify-between">
                <span>{p.nome}</span>
                <span className="text-gray-400 text-xs">{p.categoria}</span>
              </button>
            ))}
            <button onClick={adicionarNovoProduto} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-center gap-2 text-black font-medium border-t border-gray-200">
              <Plus size={14} /> Cadastrar "{busca}" como novo produto
            </button>
          </div>
        )}
      </div>

      {pendentes.length > 0 && (
        <div className="border border-gray-200 rounded-2xl p-5 mb-6">
          <p className="text-sm text-gray-400 mb-2">Estimativa (base: último preço)</p>
          <div className="h-px bg-gray-100 mb-3" />
          <div className="flex items-center justify-between">
            <span className="font-medium">Total previsto</span>
            <span className="text-xl font-semibold tabular-nums">{formatBRL(estimativa)}</span>
          </div>
        </div>
      )}

      {dados.lista.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Sua lista está vazia. Busque um item acima pra começar.</div>
      ) : (
        <div className="space-y-6">
          {pendentes.length > 0 && (
            <ul className="space-y-2">
              {pendentes.map((item) => (
                <li key={item.id} className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
                  <button onClick={() => toggleComprado(item.id)} className="w-6 h-6 rounded-full border-2 border-gray-200 flex-shrink-0 hover:border-black" />
                  <span className="flex-1 text-sm">{item.produtoNome}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => alterarQuantidade(item.id, -1)} className="w-6 h-6 rounded-full border border-gray-200 text-xs">−</button>
                    <span className="text-sm w-5 text-center tabular-nums">{item.quantidade}</span>
                    <button onClick={() => alterarQuantidade(item.id, 1)} className="w-6 h-6 rounded-full border border-gray-200 text-xs">+</button>
                  </div>
                  <button onClick={() => removerItem(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
                </li>
              ))}
            </ul>
          )}
          {comprados.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2 font-medium">Já no carrinho</p>
              <ul className="space-y-2">
                {comprados.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 opacity-50">
                    <button onClick={() => toggleComprado(item.id)} className="w-6 h-6 rounded-full bg-black flex-shrink-0 flex items-center justify-center"><Check size={13} className="text-white" /></button>
                    <span className="flex-1 text-sm line-through">{item.produtoNome}</span>
                    <button onClick={() => removerItem(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Estoque ---------- */
function Estoque({ dados, salvar, toast }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modalProduto, setModalProduto] = useState(null); // null | "novo" | produtoId
  const [modalAberto, setModalAberto] = useState(false);

  function atualizarCampoRapido(id, campo, valor) {
    salvar({ ...dados, produtos: dados.produtos.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)) });
  }

  function abrirEdicao(id) { setModalProduto(id); setModalAberto(true); }
  function abrirNovo() { setModalProduto("novo"); setModalAberto(true); }
  function fecharModal() { setModalAberto(false); setModalProduto(null); }

  function salvarProduto(produtoEditado) {
    if (modalProduto === "novo") {
      salvar({ ...dados, produtos: [...dados.produtos, produtoEditado] });
      toast("Produto cadastrado");
    } else {
      salvar({ ...dados, produtos: dados.produtos.map((p) => (p.id === produtoEditado.id ? produtoEditado : p)) });
      toast("Produto atualizado");
    }
    fecharModal();
  }

  function excluirProduto(id) {
    salvar({
      ...dados,
      produtos: dados.produtos.filter((p) => p.id !== id),
      lista: dados.lista.filter((i) => i.produtoId !== id),
    });
    toast("Produto excluído");
    fecharModal();
  }

  function substituirProduto(idOriginal, idDestino) {
    salvar({
      ...dados,
      compras: dados.compras.map((c) => (c.produtoId === idOriginal ? { ...c, produtoId: idDestino } : c)),
      lista: dados.lista.filter((i) => i.produtoId !== idOriginal),
      produtos: dados.produtos.filter((p) => p.id !== idOriginal),
    });
    toast("Produto substituído");
    fecharModal();
  }

  const filtrados = dados.produtos.filter((p) => {
    const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || (p.marca || "").toLowerCase().includes(busca.toLowerCase());
    const bateFiltro = filtro === "todos" || (p.estoqueMinimo > 0 && p.estoqueAtual <= p.estoqueMinimo);
    return bateBusca && bateFiltro;
  });

  const abaixoDoMinimo = dados.produtos.filter((p) => p.estoqueMinimo > 0 && p.estoqueAtual <= p.estoqueMinimo);
  const produtoEmEdicao = modalProduto && modalProduto !== "novo" ? dados.produtos.find((p) => p.id === modalProduto) : null;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="text-2xl font-semibold">Estoque</h1>
        <button onClick={abrirNovo} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black text-white text-sm font-medium">
          <Plus size={14} /> Novo
        </button>
      </div>
      <p className="text-gray-400 text-sm mb-6">{dados.produtos.length} produtos cadastrados</p>

      {abaixoDoMinimo.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6">
          <AlertTriangle size={17} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm"><span className="font-medium">{abaixoDoMinimo.length}</span> {abaixoDoMinimo.length === 1 ? "item está" : "itens estão"} abaixo do estoque mínimo.</p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar produto ou marca..." className="w-full pl-9 pr-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-black text-sm" />
        </div>
        <div className="flex bg-gray-50 border border-gray-200 rounded-full p-1 text-xs">
          <button onClick={() => setFiltro("todos")} className={`px-3 py-1.5 rounded-full font-medium ${filtro === "todos" ? "bg-black text-white" : "text-gray-400"}`}>Todos</button>
          <button onClick={() => setFiltro("baixo")} className={`px-3 py-1.5 rounded-full font-medium ${filtro === "baixo" ? "bg-black text-white" : "text-gray-400"}`}>Estoque baixo</button>
        </div>
      </div>

      <div className="space-y-2">
        {filtrados.map((p) => {
          const baixo = p.estoqueMinimo > 0 && p.estoqueAtual <= p.estoqueMinimo;
          return (
            <div key={p.id} className={`border rounded-xl px-4 py-3 ${baixo ? "border-amber-300" : "border-gray-200"}`}>
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.nome}</p>
                  <p className="text-xs text-gray-400 truncate flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dados.categoriasInfo?.[p.categoria] || "#9CA3AF" }}
                    />
                    {[p.marca, p.pesoVolume, p.categoria].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {baixo && <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Repor</span>}
                  <button onClick={() => abrirEdicao(p.id)} className="p-1.5 text-gray-400 hover:text-black"><Pencil size={14} /></button>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs text-gray-400">
                <label className="flex items-center gap-2">
                  Atual
                  <input type="number" value={p.estoqueAtual} onChange={(e) => atualizarCampoRapido(p.id, "estoqueAtual", Number(e.target.value))} className="w-16 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 tabular-nums" />
                </label>
                <label className="flex items-center gap-2">
                  Mínimo
                  <input type="number" value={p.estoqueMinimo} onChange={(e) => atualizarCampoRapido(p.id, "estoqueMinimo", Number(e.target.value))} className="w-16 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 tabular-nums" />
                </label>
              </div>
            </div>
          );
        })}
        {filtrados.length === 0 && <p className="text-center text-gray-400 text-sm py-16">Nenhum produto encontrado.</p>}
      </div>

      {modalAberto && (
        <ProdutoModal
          produto={produtoEmEdicao}
          outrosProdutos={dados.produtos.filter((p) => p.id !== modalProduto)}
          compras={dados.compras}
          onSalvar={salvarProduto}
          onExcluir={produtoEmEdicao ? () => excluirProduto(produtoEmEdicao.id) : null}
          onSubstituir={produtoEmEdicao ? (destinoId) => substituirProduto(produtoEmEdicao.id, destinoId) : null}
          onFechar={fecharModal}
        />
      )}
    </div>
  );
}

function HistoricoPrecoProduto({ produto, compras }) {
  const porMercado = useMemo(() => {
    const doProduto = compras.filter((c) => c.produtoId === produto.id);
    const map = new Map();
    doProduto.forEach((c) => {
      const arr = map.get(c.mercado) || [];
      arr.push(c);
      map.set(c.mercado, arr);
    });
    const linhas = Array.from(map.entries()).map(([mercado, arr]) => {
      const ordenado = [...arr].sort((a, b) => (a.data < b.data ? 1 : -1));
      return { mercado, ultimoPreco: ordenado[0].precoUnitario, ultimaData: ordenado[0].data };
    });
    return linhas.sort((a, b) => a.ultimoPreco - b.ultimoPreco);
  }, [produto.id, compras]);

  if (porMercado.length === 0) return null;
  const maisBarato = porMercado[0].mercado;

  return (
    <div className="border border-gray-200 rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-2">Histórico de preço por mercado</p>
      <div className="space-y-1.5">
        {porMercado.map((l) => (
          <div key={l.mercado} className="flex items-center justify-between text-sm">
            <span className={l.mercado === maisBarato ? "font-medium" : "text-gray-500"}>
              {l.mercado} {l.mercado === maisBarato && porMercado.length > 1 && (
                <span className="text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full ml-1">mais barato</span>
              )}
            </span>
            <span className="tabular-nums text-gray-500">{formatBRL(l.ultimoPreco)} · {formatDataBR(l.ultimaData)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProdutoModal({ produto, outrosProdutos, compras, onSalvar, onExcluir, onSubstituir, onFechar }) {
  const [form, setForm] = useState(() => produto ? { ...produto } : {
    id: uid(), nome: "", marca: "", pesoVolume: "", categoria: "Outros",
    codigoBarras: "", estoqueAtual: 0, estoqueMinimo: 0, ultimaCompraData: "",
  });
  const [modo, setModo] = useState("form"); // form | substituir | excluir
  const [destinoId, setDestinoId] = useState("");

  function campo(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function confirmarSalvar(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    onSalvar(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center" onClick={onFechar}>
      <div className="mercado-modal-enter bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <p className="font-medium">{produto ? "Editar produto" : "Novo produto"}</p>
          <button onClick={onFechar} className="p-1 text-gray-400 hover:text-black"><X size={18} /></button>
        </div>

        {modo === "form" && (
          <form onSubmit={confirmarSalvar} className="p-5 space-y-4">
            <Campo label="Nome do produto">
              <input required value={form.nome} onChange={(e) => campo("nome", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Marca">
                <input value={form.marca} onChange={(e) => campo("marca", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
              </Campo>
              <Campo label="Peso / volume">
                <input value={form.pesoVolume} onChange={(e) => campo("pesoVolume", e.target.value)} placeholder="ex: 500g, 1L" className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
              </Campo>
            </div>
            <Campo label="Categoria">
              <select value={form.categoria} onChange={(e) => campo("categoria", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Campo>
            <Campo label="Código de barras">
              <div className="relative">
                <Barcode size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.codigoBarras} onChange={(e) => campo("codigoBarras", e.target.value)} placeholder="Números do código" className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm tabular-nums" />
              </div>
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Quantidade em estoque">
                <input type="number" value={form.estoqueAtual} onChange={(e) => campo("estoqueAtual", Number(e.target.value))} className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm tabular-nums" />
              </Campo>
              <Campo label="Estoque mínimo">
                <input type="number" value={form.estoqueMinimo} onChange={(e) => campo("estoqueMinimo", Number(e.target.value))} className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm tabular-nums" />
              </Campo>
            </div>
            <Campo label="Data da última compra">
              <input type="date" value={form.ultimaCompraData} onChange={(e) => campo("ultimaCompraData", e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm tabular-nums" />
            </Campo>

            {produto && <HistoricoPrecoProduto produto={produto} compras={compras} />}

            <button type="submit" className="w-full bg-black text-white rounded-full py-3 text-sm font-medium mt-2">
              Salvar
            </button>

            {produto && (
              <div className="flex items-center gap-2 pt-2">
                <button type="button" onClick={() => setModo("substituir")} className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-full py-2.5 text-xs font-medium text-gray-600">
                  <Repeat size={13} /> Substituir
                </button>
                <button type="button" onClick={() => setModo("excluir")} className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 rounded-full py-2.5 text-xs font-medium text-red-500">
                  <Trash2 size={13} /> Excluir
                </button>
              </div>
            )}
          </form>
        )}

        {modo === "substituir" && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-500">
              Escolha outro produto já cadastrado. Todo o histórico de compras de <span className="font-medium text-gray-900">{produto?.nome}</span> passa a pertencer a ele, e esse produto é removido.
            </p>
            <select value={destinoId} onChange={(e) => setDestinoId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
              <option value="">Selecione um produto</option>
              {outrosProdutos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <button onClick={() => setModo("form")} className="flex-1 border border-gray-200 rounded-full py-2.5 text-sm font-medium">Voltar</button>
              <button disabled={!destinoId} onClick={() => onSubstituir(destinoId)} className="flex-1 bg-black text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-30">Confirmar</button>
            </div>
          </div>
        )}

        {modo === "excluir" && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-500">
              Excluir <span className="font-medium text-gray-900">{produto?.nome}</span>? O histórico de compras continua registrado, mas o produto some da lista e do estoque. Isso não pode ser desfeito.
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setModo("form")} className="flex-1 border border-gray-200 rounded-full py-2.5 text-sm font-medium">Cancelar</button>
              <button onClick={onExcluir} className="flex-1 bg-red-500 text-white rounded-full py-2.5 text-sm font-medium">Excluir</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-400 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

/* ---------- Buscar ---------- */
function Buscar({ dados, initialBusca }) {
  const [busca, setBusca] = useState(initialBusca || "");
  const [mercadoFiltro, setMercadoFiltro] = useState("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const mercados = useMemo(() => Array.from(new Set(dados.compras.map((c) => c.mercado))), [dados.compras]);

  const filtradas = useMemo(() => {
    return dados.compras.filter((c) => {
      const nome = c.produtoNome.toLowerCase();
      const bateBusca = busca.trim().length === 0 || nome.includes(busca.toLowerCase());
      const bateMercado = mercadoFiltro === "todos" || c.mercado === mercadoFiltro;
      const bateInicio = !dataInicio || c.data >= dataInicio;
      const bateFim = !dataFim || c.data <= dataFim;
      return bateBusca && bateMercado && bateInicio && bateFim;
    });
  }, [dados.compras, busca, mercadoFiltro, dataInicio, dataFim]);

  const resumos = useMemo(() => {
    const porProduto = new Map();
    filtradas.forEach((c) => {
      const lista = porProduto.get(c.produtoNome) || [];
      lista.push(c);
      porProduto.set(c.produtoNome, lista);
    });
    return Array.from(porProduto.entries()).map(([nome, lista]) => {
      const porData = [...lista].sort((a, b) => (a.data < b.data ? 1 : -1));
      const maisBarato = [...lista].sort((a, b) => a.precoUnitario - b.precoUnitario)[0];
      return {
        nome, ultimoPreco: porData[0].precoUnitario, ultimoMercado: porData[0].mercado,
        ultimaData: porData[0].data, mercadoMaisBarato: maisBarato.mercado, precoMaisBarato: maisBarato.precoUnitario,
      };
    }).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [filtradas]);

  const filtrosAtivos = mercadoFiltro !== "todos" || dataInicio || dataFim;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Buscar</h1>
      <p className="text-gray-400 text-sm mb-6">Produto, mercado ou período — compare onde saiu mais barato</p>

      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Produto ou marca..." className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-black text-sm" />
        </div>
        <button onClick={() => setMostrarFiltros((v) => !v)} className={`p-3 rounded-2xl border transition-colors ${filtrosAtivos ? "bg-black text-white border-transparent" : "border-gray-200 text-gray-400"}`}>
          <SlidersHorizontal size={15} />
        </button>
      </div>

      {mostrarFiltros && (
        <div className="border border-gray-200 rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-xs text-gray-400 flex flex-col gap-1">
            Mercado
            <select value={mercadoFiltro} onChange={(e) => setMercadoFiltro(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm">
              <option value="todos">Todos</option>
              {mercados.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="text-xs text-gray-400 flex flex-col gap-1">
            De
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm tabular-nums" />
          </label>
          <label className="text-xs text-gray-400 flex flex-col gap-1">
            Até
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm tabular-nums" />
          </label>
        </div>
      )}

      <p className="text-xs text-gray-400 mb-2">{resumos.length} {resumos.length === 1 ? "produto encontrado" : "produtos encontrados"}</p>
      <div className="space-y-2">
        {resumos.map((r) => {
          const economia = r.ultimoPreco - r.precoMaisBarato;
          return (
            <div key={r.nome} className="border border-gray-200 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{r.nome}</p>
                <span className="text-sm tabular-nums">{formatBRL(r.ultimoPreco)}</span>
              </div>
              <div className="h-px bg-gray-100 mb-2" />
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{r.ultimoMercado} · {formatDataBR(r.ultimaData)}</span>
                {economia > 0.01 && (
                  <span className="flex items-center gap-1 text-green-700 font-medium">
                    <TrendingDown size={12} /> {r.mercadoMaisBarato} por {formatBRL(r.precoMaisBarato)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {resumos.length === 0 && <p className="text-center text-gray-400 text-sm py-16">Nada encontrado com esses filtros.</p>}
      </div>
    </div>
  );
}
