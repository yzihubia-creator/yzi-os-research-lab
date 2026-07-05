# YZI IMOB — Property Workspace (Entity Workspace Pattern v1)

> Ancorada em `yzi-imob-material-system-v1.md`, `yzi-imob-ux-composition-v1.md`
> (Jornada 1) e `yzi-imob-next-screens-plan-v1.md` (#3, Property Editor →
> Property Workspace). Define o padrão de **Entity Workspace** reaproveitável
> por Corretores, Clientes, Campanhas, Atendimento.

## Objetivo

Imóvel = entidade operacional, não formulário. Pergunta única: "o que falta
para virar oferta pronta?". Termina quando a YZI diz "operacionalmente
pronto" — nunca "cadastro concluído". O gestor não preenche campos: ensina
o imóvel à YZI.

## Fonte da Verdade

O imóvel **nasce no YZI IMOB, não no site**. Banco/backend do YZI IMOB é a
fonte operacional da verdade; site é só canal de publicação/distribuição,
nunca origem. Fluxo correto: `Property Workspace → banco/backend →
publicação no site → SEO → criativos → campanhas → atendimento WhatsApp`
— nunca o inverso. **Regra:** nenhum imóvel publicado no site existe fora
do banco/backend do YZI IMOB. Nesta unidade (mock, sem backend real) a
regra vira contrato de forma: campos, uploads e checklist já são
desenhados como o futuro schema do banco, não um formulário solto.

## Base de Conhecimento do Imóvel / Publicação no Site

A aba Informações não é só cadastro comercial — é onde o gestor ensina o
imóvel à YZI. Dados básicos + materiais (Fotos/Vídeos/Documentos, "em breve"
aqui) formam a base que a YZI usa depois para gerar criativos, SEO e
triagem de atendimento — cada campo/mídia entra no Workspace antes de
existir em qualquer outro lugar do produto. O site nunca cria ou edita um
imóvel — só consome o que o Workspace preparou e o gestor aprovou; o item
"Publicação" do checklist é o único ponto de saída para o site, e até ser
aprovado ali o imóvel não existe publicamente. Publicação real (API/banco/
site) segue fora de escopo — mock honesto continua até essas capabilities
existirem.

## Arquitetura (3 camadas) e rota

```
Hero (objetivo operacional)
Workspace
├── Conteúdo (tabs): Informações · Fotos · Vídeos · Documentos · SEO · Anúncios · IA
└── Inspector YZI (estrutura canônica, sempre igual)
```

As 7 tabs sempre existem, mesmo sem a capability pronta. O Inspector é o
Inspector v2 do Shell, não um painel novo. Rota:
`platform/src/app/cockpit/yzi-imob/imoveis/[id]/page.tsx`. `id==="novo"` →
Novo imóvel (sem `DemoProperty`, form vazio); outro `id` sem match →
"imóvel não encontrado" + link ao catálogo. `CatalogRow`/`GalleryCard`
navegam (`router.push`) em vez de só `select()`; botão "Novo imóvel" deixa
de ser `disabled` e navega para `/imoveis/novo`. Mount chama
`select(toInspection(property))` para popular o Inspector.

## Hero por estado

| Estado | `PropertyStatus` | Hero |
|---|---|---|
| Novo imóvel | `id==="novo"` | "Vamos transformar este material em uma oferta pronta." |
| Em preparação | `rascunho`,`organizando` | "Estou organizando este imóvel para publicação." |
| Pendências | `pendencias` | "Existem bloqueios antes da publicação." |
| Pronto | `aguardando`,`publicar`,`publicado` | "Está pronto para publicar quando você decidir." |

Nome do imóvel (exceto Novo) + frase curta; sem métrica em destaque.

## Conteúdo — tabs

**Informações** (única funcional): form "Dados básicos" — Nome, Tipo
(apartamento/casa/terreno/comercial), Endereço, Bairro, Cidade, Valor, Área,
Quartos, Banheiros (ocultos se Tipo=terreno), Descrição curta. Estado local,
sem submit/persistência real. Demais tabs, "em breve" (mesmo padrão visual
do botão desabilitado já existente — ícone + frase + capability
responsável, nada simulado): **Fotos/Vídeos/Documentos** → Creative Studio;
**SEO** → Site; **Anúncios** → Campaign Workspace; **IA** → "a YZI já está
no Inspector — mais ações chegam aqui."

## Inspector — estrutura canônica

Sempre 7 seções, qualquer entidade: **Resumo · Pendências · Checklist ·
Score · Próxima ação · Sugestões · Histórico**. Novo tipo genérico
(substitui `YziInspection` atual em `yzi-imob-workspace-context.tsx`):

```ts
export type YziInspection = {
  name: string;
  subtitle?: string; // era "location"
  statusLabel: string;
  situation: string; // Resumo
  pendencies: string[];
  checklist: { label: string; done: boolean }[];
  score: number; // 0–100
  scoreLabel: string;
  nextAction: string; // era parte de "publication"
  suggestions: string[]; // inclui o antigo "creativeBrief"
  history: string[];
};
```

`publication`/`creativeBrief` somem do tipo genérico — viram `nextAction` e
item de `suggestions`. Impacto: `yzi-imob-inspector-v2.tsx` renderiza as 7
seções (mantém o estado vazio `reading` sem entidade selecionada);
`yzi-imob-catalog-mock.ts` → `toInspection()` monta o novo formato, cada
`DemoProperty.inspection` ganha `checklist`, `score` (=`completeness`),
`scoreLabel`, `nextAction` (=`nextStep`), `suggestions`. Nenhum outro
consumidor hoje — único ponto de migração.

**Checklist** (4 itens, ecoa o Readiness Panel, derivado de
`completeness`/`media`/`publication` do mock, nenhum estado novo): 1.
Cadastro do imóvel — 2. Mídia organizada — 3. SEO / Site — 4. Publicação
(nunca "pronto" sozinho; fica "aguardando aprovação" até autorização
humana, mesmo com os outros 3 prontos — gate da seção "Publicação no Site").

## Regras e fora de escopo

Paleta fria sem verde saturado; lilás só p/ autorização; estados sempre
mockados/honestos; uma decisão principal por Canvas; YZI só no Inspector,
nunca chatbot aberto. Fora de escopo desta unidade: tabs além de Informações
funcionais; outras entidades (Corretor/Cliente/Campanha/Atendimento — a
spec define o padrão, implementação é unidade futura); banco/backend,
upload e publicação reais (Fonte da Verdade é princípio de forma aqui, não
implementação de backend).
