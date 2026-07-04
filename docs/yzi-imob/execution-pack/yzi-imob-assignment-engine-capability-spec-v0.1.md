# YZI IMOB — Assignment Engine Capability Spec v0.1 (rev. 1)

Especificação documentária da capability **Assignment Engine** — motor canônico de decisão "quem atende cada lead". Complementa `yzi-imob-visit-orchestration-capability-spec-v0.1.md` e `yzi-imob-lead-intelligence-capability-spec-v0.1.md`. Sem implementação.

Invariantes do Execution Pack — tenant boundary, human-in-the-loop, evidence, estados honestos — aplicam-se **por referência** e não são repetidas aqui.

Princípio de identidade: **a capability resolve um problema operacional; não é definida por API, MCP, SDK ou provider.**

## 1. Objetivo

Recomendar, para cada lead, **qual corretor deve atender** — de forma consistente, explicável e justa. Recomendação automática, nunca atribuição forçada ou silenciosa.

Problema operacional que resolve: *"como garanto que cada lead cai com o corretor certo, rápido, sem briga por lead e sem sobrecarregar sempre os mesmos?"*

## 2. Valor para o negócio

- **Problema que resolve:** distribuição manual de leads é lenta, injusta e sem critério — lead bom esfria esperando, corretor errado atende, ninguém sabe por quê.
- **Ganho operacional:** todo lead recebe um corretor recomendado imediatamente, com critério declarado e distribuição equilibrada.
- **Decisão que melhora:** quem atende cada lead — e, no agregado, como a carteira de corretores é usada.

## 3. Posição no fluxo

Capability **canônica** de assignment; consumidores não duplicam a lógica:

- **Atendimento** — pede recomendação quando um lead novo precisa de responsável.
- **Visit Orchestration** — pede recomendação restrita aos corretores com slot disponível na janela do cliente.
- **Lead Intelligence** — alimenta o motor com score histórico (Distribution Advisor), mas não decide.

`Lead novo ou visita a agendar → Assignment Engine → corretor recomendado + explicação → aceito, ajustado ou recusado conforme política do tenant`

## 4. Fatores considerados

- **Bairro / Região** — histórico e cobertura geográfica do corretor.
- **Tipo de imóvel** — especialização (residencial, comercial, alto padrão, terreno).
- **Agenda / Disponibilidade** — compromissos existentes (via Availability Provider da Visit Orchestration, quando aplicável) e estado ativo do corretor.
- **Score** — desempenho histórico (conversão, satisfação, velocidade de resposta), alimentado por Lead Intelligence.
- **Relationship Score** — força da relação existente entre o corretor e este lead/imóvel: já atendeu, já visitou junto, já negociou. Relação viva pesa mais que afinidade estatística.
- **Idioma** — compatibilidade com o idioma do lead.
- **Corretor preferencial** — vínculo declarado do lead/imóvel; prioridade sobre distribuição automática.
- **Carga atual** — leads/visitas ativos do corretor, para equilíbrio.
- **Urgência** — leads quentes (intenção de compra imediata, campanha ativa, janela curta) priorizam corretor de resposta rápida disponível agora sobre o match perfeito indisponível.

Fator ausente entra como neutro/honesto — nunca inventado para forçar resultado.

## 5. Estrutura de decisão

Três camadas, nesta ordem:

- **Hard Rules (eliminam):** corretor ativo no tenant; disponível no momento/janela; idioma minimamente compatível; sem bloqueio administrativo. Quem falha, sai — não entra no ranking.
- **Business Rules (restringem):** limite de leads simultâneos por corretor; política de exclusividade por imóvel/região; regras de plantão do tenant; janela de resposta exigida por urgência.
- **Ranking (prioriza):** pontua os elegíveis por bairro/região, tipo de imóvel, score, relationship score, carga (carga alta reduz), urgência × velocidade de resposta.

Desempate: corretor preferencial/relationship vivo → menor carga atual → maior score para aquele perfil de lead → disponibilidade mais próxima.

## 6. Estrutura da capability

- **Signal Collector** — reúne fatores do lead e dos corretores candidatos.
- **Hard Rules Filter** — aplica as regras eliminatórias.
- **Business Rules Layer** — aplica as restrições do tenant.
- **Score & Ranking Engine** — pontua e ordena os elegíveis.
- **Recommendation Composer** — monta a recomendação com explicação obrigatória.
- **Override Learner** — registra ajuste/recusa humana **como aprendizado**: padrões de override recorrentes (gestor sempre troca X por Y para certo perfil) viram sinal para o Insight Engine da Lead Intelligence e podem propor ajuste de regra — sempre como recomendação, nunca mudança automática de política.
- **Evidence Recorder** — grava fatores, score, confidence e decisão.

## 7. Explicabilidade obrigatória

Nenhuma recomendação é caixa-preta. Toda recomendação declara: quais fatores foram considerados; qual peso cada camada teve (hard/business/ranking); por que este corretor e não o segundo colocado; qual a **confidence** da recomendação (alta quando há evidência forte e volume; baixa quando o histórico é curto) e o **volume analisado**. Confidence nunca substitui evidence.

## 8. Workflows

`ASSIGNMENT_SIGNAL_COLLECT` · `ASSIGNMENT_HARD_RULES_APPLY` · `ASSIGNMENT_BUSINESS_RULES_APPLY` · `ASSIGNMENT_RANK` · `ASSIGNMENT_RECOMMEND` (com explicação e confidence) · `ASSIGNMENT_OVERRIDE_LEARN` · `ASSIGNMENT_EVIDENCE_RECORD`

Parada honesta quando não houver corretor elegível (`no_eligible_broker`) — nunca atribuição forçada fora de regra.

## 9. Resultado

A YZI recomenda automaticamente o corretor ideal, de imediato e com explicação legível. A aplicação segue a política do tenant: automática para rotina interna, ou com confirmação humana quando o tenant exigir revisão. Em nenhum caso a recomendação vira atribuição sem motivo registrado.

## 10. Nota arquitetural — generalização para o YZI OS

O padrão **Hard Rules → Business Rules → Ranking → Recomendação explicável → Override como aprendizado** é agnóstico de vertical: serve para distribuir qualquer trabalho entre qualquer equipe (atendimento, produção, suporte). A versão atual é especializada para IMOB; o motor pode ser promovido futuramente ao **Core do YZI OS**. **Sem mover a capability agora.**

## 11. Evidence

Cada recomendação registra: perfil do lead; corretores considerados; fatores, camadas e score de cada um; corretor recomendado, motivo e confidence; override humano e razão, quando houver; timestamp.

## 12. Estados honestos

`collecting_signals` · `no_eligible_broker` · `scored` · `recommended` · `accepted` · `overridden` · `override_learned` · `assignment_recorded` · `insufficient_data`

## 13. Próxima Capability

**Esta capability entrega:** corretor recomendado por lead/visita, com explicação, confidence e evidence — e aprendizado contínuo a partir dos overrides.

**Consumida por:** Atendimento (responsável pelo lead novo) · Visit Orchestration (corretor do slot de visita) · Lead Intelligence (overrides e resultados realimentam o score) · Operating Surface / módulos Atendimento e Operação (distribuição visível e auditável).

## 14. Fora do escopo

Sem implementação, código, SQL, API, ML real, banco, notificação real ou efeito externo. Mapa da capability para autorização futura.
