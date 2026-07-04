# YZI IMOB — Workspace Wireframes v1.1 · Property Catalog Workspace

Primeiro Workspace real do YZI IMOB. Responde **como o gestor trabalha com imóveis durante um dia inteiro**. Wireframe estrutural (texto), não interface, React, cores nem Design System. Apoia-se nas fundações LOCKED (Workspace Architecture, Visual/Interaction/Content Language, Capability Graph, Property Catalog Capability) sem alterá-las.

## Regiões (herdadas da Workspace Architecture)
```
┌─────────┬────────────────────────────┬──────────────┐
│ Sidebar │   Workspace Principal       │  Inspector   │
│ (áreas) │   (Canvas: Catálogo/Editor) │  (YZI)       │
└─────────┴────────────────────────────┴──────────────┘
```
Sidebar e Inspector já são definidos em `yzi-workspace-architecture-v1.md`; aqui detalhamos o miolo.

## 1. Objetivo do Workspace
Administrar o **ativo mais importante da empresa: o imóvel**. Não é CRUD, não é tabela — é uma **central operacional** do imóvel, do cadastro à publicação.

## 2. Fluxo principal (dominante)
```
Entrar → Encontrar imóvel → Abrir imóvel → Editar →
Enviar mídia → Preparar publicação → Enviar ao Creative Studio
```

## 3. Views (oficiais, fechadas)
- **Catalog View:** lista dos imóveis.
- **Gallery View:** grade visual.
- **Map View:** visualização geográfica.
- **Timeline View:** histórico do imóvel.

Nenhuma outra View.

## 4. Canvas
Uma única tarefa principal por vez:
- **Nenhum imóvel aberto →** o Canvas mostra o **Catálogo** (na View escolhida).
- **Imóvel aberto →** o Canvas vira **Editor** do imóvel.

Nunca duas tarefas principais simultâneas.

## 5. Inspector
Ao selecionar um imóvel, o Inspector (YZI) mostra: situação · pendências · publicação · Creative Brief · histórico. Nunca mostra Runtime nem banco.

## 6. Toolbar (apenas grupos)
Busca · Filtros · Ordenação · View · Novo imóvel · Importar. Nada além disso.

## 7. Estados oficiais do Workspace
vazio · carregando · catálogo · imóvel aberto · preparando · aguardando aprovação · publicado · erro.

## 8. Objeto operacional — o imóvel
Um imóvel é composto por:
```
Cadastro → Mídias → Status → Publicação → Creative Brief → Histórico
```
Não é uma linha de tabela; é um objeto operacional completo.

## 9. Integração
Única saída: Property Catalog entrega o **Creative Brief** ao **Creative Studio**. Nenhuma outra integração.

## 10. Quando a YZI aparece
Somente quando: encontrou mídia faltando · publicação pronta · imóvel parado · problema · conclusão. Fora disso, a YZI **desaparece** e o Workspace fica visível.

## Leitura self-contained (resultado)
- **Como funciona:** três regiões; o Canvas alterna Catálogo ↔ Editor; quatro Views; Inspector contextual.
- **Como o usuário trabalha:** segue o fluxo dominante (§2), uma tarefa principal por vez.
- **Onde a YZI aparece:** só nos cinco momentos do §10.
- **Como o imóvel evolui:** Cadastro → Mídias → Status → Publicação → Creative Brief → Histórico, refletido nos estados do §7.
- **O que acontece ao terminar:** publicação pronta e Creative Brief entregue ao Creative Studio (§9).

## Próxima unidade
Após aprovação: **Workspace Wireframes v1.2 — Property Editor Workspace** (como construir um imóvel completo: cadastro, mídias, documentos, publicação e preparação para o Creative Studio). Só então começa o React.
