# YZI IMOB — Workspace Wireframes v1.2 · Property Editor Workspace (Journey First)

Primeira unidade em **Journey First**: o Workspace nasce da operação real, não da arquitetura. Responde **como nasce um imóvel dentro do YZI IMOB**. Descreve a operação; a interface é consequência. Apoia-se nas fundações LOCKED (Property Catalog Capability, Workspace/Visual/Interaction/Content Language) sem alterá-las.

## Jornada
**O corretor recebeu um imóvel novo para vender.**

A partir daí ele constrói o imóvel do zero. Abre o Editor, cria o cadastro e preenche as informações comerciais. Em seguida traz o material bruto: fotografias, vídeos, planta, memorial e arquivos adicionais. Ele não organiza nada — apenas envia o que tem. Quando termina de subir tudo, finaliza o cadastro.

```
Recebe imóvel → Cria cadastro → Preenche informações →
Envia fotos → Envia vídeos → Envia planta → Envia memorial →
Envia arquivos adicionais → Finaliza cadastro
```

Nesse ponto entra a YZI.

## Papel da YZI
Quando o corretor finaliza, a YZI assume o trabalho pesado de organização e verificação. Ela: organiza mídias · identifica problemas · encontra arquivos duplicados · verifica resolução · aponta mídia faltando · cria a estrutura do imóvel · calcula completude · prepara o Creative Brief · informa o que ainda falta.

Limites: **nunca publica · nunca inventa · nunca altera dados sem autorização.** A YZI prepara e devolve ao humano; a decisão é sempre dele.

## Momentos da jornada
- **Cadastro** — o corretor trabalha; a YZI apenas observa. Nenhuma interferência.
- **Upload** — o corretor envia arquivos brutos; a YZI organiza em segundo plano.
- **Organização** — a YZI cria automaticamente galeria, capas, ordem e categorias.
- **Qualidade** — a YZI verifica: fotos ruins, vídeos corrompidos, baixa resolução, ausência de fachada, ausência de planta, ausência de localização.
- **Preparação** — a YZI monta Creative Brief → Resumo Comercial → Status → Pendências.
- **Aprovação** — o gestor revisa e pode aprovar, devolver ou solicitar ajustes.

## Derivação do Workspace
A estrutura abaixo existe **porque a jornada exige** — nada além disso.

**Canvas.** Dois modos, um por vez: o **formulário de cadastro** (o corretor preenche e envia) e a **galeria de mídias organizada** (o resultado do trabalho da YZI). O corretor edita, a YZI organiza; ambos operam sobre o mesmo imóvel, nunca duas tarefas principais ao mesmo tempo.

**Inspector (YZI).** Aparece quando a YZI termina de processar. Mostra: completude do imóvel · pendências (o que falta) · alertas de qualidade · Creative Brief preparado · status. Some enquanto o corretor só preenche e sobe arquivos — ainda não há o que dizer.

**Toolbar.** Só as ações que a jornada usa: Novo imóvel · Salvar cadastro · Enviar mídia · Reprocessar (pedir à YZI que organize de novo) · Enviar para aprovação. Se uma ação não move a jornada, não entra.

**Estados** (derivados da jornada, não inventados): vazio (imóvel novo) · cadastrando · enviando mídia · organizando (YZI trabalhando) · com pendências · aguardando aprovação · aprovado · erro.

## Regra permanente
Cada elemento responde: **por que existe? qual problema operacional resolve?** Se não resolve nenhum, não entra no Workspace.

## Leitura self-contained (resultado)
- **Como nasce um imóvel:** o corretor cria o cadastro e sobe o material bruto; a YZI organiza, verifica e prepara o Creative Brief; o gestor aprova.
- **Como o corretor trabalha:** preenche e envia; não organiza nada manualmente.
- **Como a YZI trabalha:** organiza, verifica qualidade, calcula completude, prepara o Brief — nunca publica nem altera sem autorização.
- **Onde o gestor entra:** na Aprovação (aprovar, devolver ou pedir ajustes).
- **Quando acontece a aprovação:** após a Preparação, sobre o Creative Brief e as pendências.
- **Como termina:** imóvel aprovado, Creative Brief pronto para o Creative Studio.
- **Como o Workspace deve existir:** Canvas (cadastro ↔ galeria), Inspector que surge quando a YZI conclui, Toolbar mínima, estados derivados da jornada.

## Próxima unidade
**v1.3 — Creative Studio Workspace (Journey First)**, começando por "O gestor aprovou um imóvel pronto para divulgação": como nasce um criativo.
