# YZI IMOB — Property Workspace (Entity Workspace Pattern v1)

> Ancorada em `yzi-imob-material-system-v1.md`, `yzi-imob-ux-composition-v1.md`
> (Jornada 1) e `yzi-imob-next-screens-plan-v1.md` (#3, Property Editor →
> renomeado Property Workspace). Define o padrão de **Entity Workspace**
> reaproveitável por Corretores, Clientes, Campanhas, Atendimento.

## Objetivo

Imóvel = entidade operacional, não formulário. Pergunta única: "o que falta
para virar oferta pronta?". Termina quando a YZI diz "operacionalmente
pronto" — nunca em "cadastro concluído".

## Arquitetura (3 camadas)

```
Hero (objetivo operacional)
Workspace
├── Conteúdo (tabs): Informações · Fotos · Vídeos · Documentos · SEO · Anúncios · IA
└── Inspector YZI (estrutura canônica, sempre igual)
```

As 7 tabs sempre existem, mesmo sem a capability pronta. O Inspector é o
Inspector v2 do Shell, não um painel novo.

## Rota

- `platform/src/app/cockpit/yzi-imob/imoveis/[id]/page.tsx`.
- `id === "novo"` → Novo imóvel (sem `DemoProperty`, form vazio).
- Outro `id` sem match → "imóvel não encontrado" + link ao catálogo.
- `CatalogRow`/`GalleryCard` navegam (`router.push`) em vez de só `select()`.
  Botão "Novo imóvel" deixa de ser `disabled`, navega para `/imoveis/novo`.
- Mount chama `select(toInspection(property))` para popular o Inspector.

## Hero por estado

| Estado | `PropertyStatus` | Hero |
|---|---|---|
| Novo imóvel | `id==="novo"` | "Vamos transformar este material em uma oferta pronta." |
| Em preparação | `rascunho`,`organizando` | "Estou organizando este imóvel para publicação." |
| Pendências | `pendencias` | "Existem bloqueios antes da publicação." |
| Pronto | `aguardando`,`publicar`,`publicado` | "Está pronto para publicar quando você decidir." |

Inclui nome do imóvel (exceto Novo) + frase curta; sem métrica em destaque.

## Conteúdo — tabs

- **Informações** (única funcional): form "Dados básicos" — Nome, Tipo
  (apartamento/casa/terreno/comercial), Endereço, Bairro, Cidade, Valor, Área,
  Quartos, Banheiros (ocultos se Tipo=terreno), Descrição curta. Estado local,
  sem submit/persistência real.
- **Fotos/Vídeos/Documentos** → "em breve — entra com o Creative Studio."
- **SEO** → "em breve — entra com o Site."
- **Anúncios** → "em breve — entra com o Campaign Workspace."
- **IA** → "a YZI já está no Inspector — mais ações chegam aqui."

Mesmo padrão visual do botão desabilitado já existente (ícone + frase +
capability responsável), nada simulado.

## Inspector — estrutura canônica

Sempre 7 seções, qualquer entidade: **Resumo · Pendências · Checklist ·
Score · Próxima ação · Sugestões · Histórico**.

Novo tipo genérico (substitui `YziInspection` atual em
`yzi-imob-workspace-context.tsx`):

```ts
export type YziInspection = {
  name: string;
  subtitle?: string;      // era "location"
  statusLabel: string;
  situation: string;      // Resumo
  pendencies: string[];
  checklist: { label: string; done: boolean }[];
  score: number;          // 0–100
  scoreLabel: string;
  nextAction: string;     // era parte de "publication"
  suggestions: string[];  // inclui o antigo "creativeBrief"
  history: string[];
};
```

`publication`/`creativeBrief` somem do tipo genérico — viram `nextAction` e
item de `suggestions`. Impacto:

- `yzi-imob-inspector-v2.tsx`: renderiza as 7 seções canônicas; mantém
  estado vazio (`reading`) sem entidade selecionada.
- `yzi-imob-catalog-mock.ts`: `toInspection()` monta o novo formato; cada
  `DemoProperty.inspection` ganha `checklist` (4 itens abaixo), `score` (=
  `completeness`), `scoreLabel`, `nextAction` (= `nextStep`), `suggestions`.
- Nenhum outro consumidor hoje (Corretor/Cliente/Campanha não existem) —
  único ponto de migração.

## Checklist (4 itens, ecoa o Readiness Panel)

1. Cadastro do imóvel
2. Mídia organizada
3. SEO / Site
4. Publicação — nunca "pronto" sozinho; fica "aguardando aprovação" até
   autorização humana, mesmo com os outros 3 prontos.

Derivado de `completeness`/`media`/`publication` do mock; nenhum estado novo.

## Regras permanentes

Paleta fria sem verde saturado; lilás só p/ autorização; estados sempre
mockados/honestos; sem backend/API/banco/Runtime/publicação real; uma
decisão principal por Canvas; YZI só no Inspector, nunca chatbot aberto.

## Fora de escopo

Tabs além de Informações funcionais; outras entidades (Corretor/Cliente/
Campanha/Atendimento — spec define o padrão, implementação é unidade
futura); persistência/upload/publicação reais.
