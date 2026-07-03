# YZI IMOB — Modelo de Relação CRM/Financeiro v0.1

## 1. Decisão central

YZI IMOB não nasce como CRM genérico, mas precisa rastrear a operação comercial e financeira. Contrato permanece manual no MVP. Documentos comerciais e contratos precisam estar linkados a imóvel, lead, corretor e negócio para que o financeiro seja confiável.

**Regra central:** sem vínculo entre imóvel, lead, corretor e documento, não existe financeiro confiável.

## 2. IDs mínimos

| ID | Significado |
|---|---|
| `property_id` | imóvel |
| `lead_id` | lead/interessado |
| `broker_id` | corretor/responsável |
| `deal_id` | oportunidade/negócio comercial |
| `document_id` | documento comercial manual |
| `commission_id` | registro financeiro/comissão |
| `developer_id` | construtora/incorporadora, quando houver |
| `owner_id` | proprietário, quando houver |

## 3. Tipos de documento comercial

O sistema não assume um único tipo de contrato: intermediação/corretagem; autorização de venda; exclusividade; proposta; reserva de unidade; contrato de compra e venda; contrato da construtora; recibo de comissão; documento jurídico externo; outro.

## 4. Cenários operacionais

### 4.1 Lançamento / construtora

Contrato principal pode ser feito pela construtora/incorporadora. YZI IMOB rastreia: imóvel/unidade, lead, corretor, construtora, campanha/origem, status da proposta/reserva, comissão prevista, comissão recebida/pendente.

### 4.2 Imóvel avulso / captado pela imobiliária

Pode haver autorização de venda, intermediação/corretagem, exclusividade ou não, proposta, contrato entre comprador e vendedor, recibo/comissão. YZI IMOB rastreia vínculo entre: imóvel, lead/comprador, proprietário, corretor, documento manual, comissão, status financeiro.

## 5. Status mínimos

**Documento:** não iniciado; em preparação; enviado; aguardando assinatura; assinado; cancelado; externo/fora do sistema.

**Comissão/Financeiro:** não aplicável; prevista; a receber; recebida; parcial; atrasada; cancelada; em disputa.

## 6. Relações

- um imóvel pode ter muitos leads;
- um lead pode demonstrar interesse em um ou mais imóveis;
- um corretor pode acompanhar muitos leads;
- um corretor pode ser responsável por muitos imóveis;
- um negócio/deal conecta imóvel, lead, corretor e origem;
- um documento comercial deve estar vinculado a um negócio ou, no mínimo, a imóvel + lead + corretor;
- uma comissão deve estar vinculada a um negócio, corretor e documento/origem;
- venda/perda deve registrar contexto comercial e financeiro.

## 7. Regra de produto

Contrato é manual no MVP, mas rastreável. A YZI não deve: gerar contrato jurídico automaticamente; prometer assinatura; confirmar aprovação de financiamento; definir valor final de comissão sem regra humana; substituir validação jurídica/administrativa; inventar condição contratual.
