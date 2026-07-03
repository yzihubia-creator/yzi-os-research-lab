# YZI IMOB — Modelo do Formulário de Cadastro de Imóvel v0.1

## 1. Decisão central

O corretor cadastra os dados reais do imóvel por formulário. A YZI recebe esses dados, organiza, melhora e prepara card, página, SEO, criativos e campanha. A YZI não inventa informações do imóvel.

## 2. Papéis

| Papel | Responsabilidade |
|---|---|
| Corretor | fornece os dados reais e as mídias do imóvel; confirma exatidão das informações |
| YZI | organiza, padroniza, enriquece copy/SEO, gera card, página, criativos e plano de campanha a partir do que foi informado |

## 3. Campos mínimos do formulário

### 3.1 Identificação
- `property_id` (gerado no cadastro)
- tipo de imóvel (apartamento, casa, terreno, comercial, outro)
- finalidade (venda, aluguel, ambos)
- `developer_id` (quando lançamento/construtora)
- `owner_id` (quando imóvel avulso, se informado)

### 3.2 Localização
- endereço/logradouro
- bairro
- cidade/UF
- referência de localização (quando endereço completo não puder ser divulgado)

### 3.3 Características
- área (m²)
- quartos/suítes
- vagas de garagem
- diferenciais informados pelo corretor (texto livre)
- condição (novo, usado, na planta, em construção)

### 3.4 Comercial
- valor
- condições de pagamento informadas (texto livre)
- comissão prevista (referência ao modelo CRM/Financeiro)
- `broker_id` responsável

### 3.5 Mídia
- fotos (obrigatório mínimo definido pela operação)
- vídeo/tour (opcional)
- documentos anexos (opcional, referência ao modelo de documentos comerciais)

## 4. O que a YZI faz com os dados

A partir dos dados informados, a YZI: organiza os campos em card e página do imóvel; sugere e melhora copy e SEO com base no que foi informado; prepara criativos e plano de campanha; identifica campos obrigatórios ausentes e sinaliza pendência ao corretor.

## 5. O que a YZI não faz

A YZI não inventa: endereço, metragem, valor, quartos, condição, diferenciais ou qualquer dado factual do imóvel que não tenha sido informado pelo corretor. Campo ausente é tratado como pendência, nunca como suposição.

## 6. Status mínimos do cadastro

- rascunho
- em revisão (pendência de campo obrigatório)
- pronto para publicar
- publicado
- pausado
- vendido/removido

## 7. Regra de produto

Formulário é a única fonte de verdade sobre o imóvel. A YZI só processa, organiza e melhora apresentação a partir do que foi cadastrado — nunca substitui a informação do corretor por inferência própria.
