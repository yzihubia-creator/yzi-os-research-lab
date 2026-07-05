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

## Identificadores operacionais e responsável pelo imóvel

Todo imóvel carrega `id_imovel` e um vínculo de responsável — sem isso a
YZI não sabe com quem falar ao agendar visita, encaminhar lead ou preparar
ação comercial. **Regra:** nenhum imóvel avança para publicação, visita,
campanha ou atendimento sem responsável definido. Fluxo correto: `Imóvel
cadastrado → corretor responsável vinculado → pronto para publicação →
lead interessado → YZI consulta imóvel + responsável → agenda/encaminha
com o corretor certo` — nunca a YZI descobrindo o corretor na hora da visita.

Campos do vínculo no `DemoProperty` (mock honesto; entidade Corretor
completa é unidade futura): `id_corretores`/`corretor_id`,
`responsavel_imovel` (nome), status do vínculo (`vinculado`/`pendente`),
especialidade/região (quando houver), contato operacional.

**Sem responsável:** estado `missing_responsible_broker` — hero "Este
imóvel ainda precisa de um responsável."; próxima ação "Vincular corretor
responsável"; a YZI não prepara visita para esse imóvel.

## Arquitetura (3 camadas) e rota

```
Hero (objetivo operacional)
Workspace
├── Conteúdo (tabs): Informações · Base de Conhecimento · SEO · Anúncios · IA
└── Inspector YZI (estrutura canônica, sempre igual)
```

As 5 tabs sempre existem, mesmo sem a capability pronta. O Inspector é o
Inspector v2 do Shell, não um painel novo. Rota:
`platform/src/app/cockpit/yzi-imob/imoveis/[id]/page.tsx`. `id==="novo"` →
Novo imóvel (sem `DemoProperty`, form vazio); outro `id` sem match →
"imóvel não encontrado" + link ao catálogo. `CatalogRow`/`GalleryCard`
navegam (`router.push`) em vez de só `select()`; botão "Novo imóvel" deixa
de ser `disabled` e navega para `/imoveis/novo`. Mount chama
`select(toInspection(property))` para popular o Inspector.

## Hero por estado

| Estado | `PropertyStatus` / vínculo | Hero |
|---|---|---|
| Novo imóvel | `id==="novo"` | "Vamos transformar este material em uma oferta pronta." |
| Sem responsável | `missing_responsible_broker` | "Este imóvel ainda precisa de um responsável." |
| Em preparação | `rascunho`,`organizando` | "Estou organizando este imóvel para publicação." |
| Pendências | `pendencias` | "Existem bloqueios antes da publicação." |
| Pronto | `aguardando`,`publicar`,`publicado` | "Está pronto para publicar quando você decidir." |

`missing_responsible_broker` tem prioridade sobre os demais estados: sem
responsável vinculado, o hero e a próxima ação são sempre sobre vincular o
corretor, independente de `completeness`. Nome do imóvel (exceto Novo) +
frase curta; sem métrica em destaque.

## Conteúdo — tabs

Tabs: **Informações · Base de Conhecimento · SEO · Anúncios · IA**
(consolida Fotos/Vídeos/Documentos numa única aba de upload).

**Informações** (única funcional), dois blocos, estado local, sem
submit/persistência real:

1. **Dados básicos** — Nome, Tipo (apartamento/casa/terreno/comercial),
   Endereço, Bairro, Cidade, Valor, Área, Quartos, Banheiros (ocultos se
   Tipo=terreno).
2. **Conhecimento da YZI** — o que alimenta site, SEO, atendimento,
   criativos, campanhas, WhatsApp e landing pages. Campo principal:
   *Descrição Comercial do Imóvel* (textarea, helper: "Escreva como se
   estivesse apresentando este imóvel para um cliente. Quanto mais
   contexto você fornecer, melhor a YZI poderá gerar anúncios, páginas,
   campanhas e responder clientes."). Mais: diferenciais, perfil ideal do
   comprador, objeções comuns, observações internas.

**Base de Conhecimento** (não "Fotos"; "em breve", sem upload real):
mostra as 9 categorias como grid honesto — Fotos, Vídeos, Drone, Plantas,
Memorial, PDF, Contratos, Documentos, Arquivos adicionais — cada uma "0
arquivos" até o Creative Studio existir. **SEO** → "em breve, entra com o
Site". **Anúncios** → "em breve, entra com o Campaign Workspace". **IA** →
"a YZI já está no Inspector — mais ações chegam aqui." Mesmo padrão visual
do botão desabilitado já existente, nada simulado.

## Inspector — estrutura canônica

Sempre 7 seções, qualquer entidade: **Resumo · Pendências · Checklist ·
Readiness (rótulo por entidade: "Property Readiness", futuramente "Broker
Readiness" etc.) · Próxima ação · Sugestões · Histórico**. Novo tipo
genérico (substitui `YziInspection` atual em
`yzi-imob-workspace-context.tsx`):

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
`yzi-imob-catalog-mock.ts` → `DemoProperty` ganha `idImovel`, `responsavel`
(`{ corretorId, nome, vinculo: "vinculado"|"pendente", especialidade?,
contato }`), `knowledge` (`{ descricaoComercial, diferenciais,
perfilComprador, objecoesComuns, observacoesInternas }`, todos opcionais,
vazios por padrão); `toInspection()` monta o novo formato, cada
`DemoProperty.inspection` ganha `checklist`, `score` (=`completeness`, 0
quando sem responsável), `scoreLabel`, `nextAction` (=`nextStep`, ou
"Vincular corretor responsável" quando `vinculo==="pendente"`),
`suggestions`. Nenhum outro consumidor hoje — único ponto de migração.

**Checklist** (5 itens, ecoa o Readiness Panel, derivado de
`completeness`/`media`/`publication`/vínculo do mock, nenhum estado novo):
1. Cadastro do imóvel — 2. **Corretor responsável vinculado** — 3. Mídia
organizada — 4. SEO / Site — 5. Publicação (nunca "pronto" sozinho; fica
"aguardando aprovação" até autorização humana). Item 2 é **gate**: sem ele,
os itens 3–5 não avançam e a publicação/campanha/visita ficam bloqueadas
(regra da seção anterior).

## Regras e fora de escopo

Paleta fria sem verde saturado; lilás só p/ autorização; estados sempre
mockados/honestos; uma decisão principal por Canvas; YZI só no Inspector,
nunca chatbot aberto. Fora de escopo desta unidade: tabs além de Informações
funcionais; outras entidades (Corretor/Cliente/Campanha/Atendimento — a
spec define o padrão, implementação é unidade futura); banco/backend,
upload e publicação reais (Fonte da Verdade é princípio de forma aqui, não
implementação de backend).
