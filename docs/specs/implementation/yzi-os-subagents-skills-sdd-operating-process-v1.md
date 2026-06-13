# YZI OS — Processo Operacional SDD com Subagentes + Skills + Auditoria (v1)

> Documento operacional único. Substitui o fluxo manual/documental anterior.
> Vigência: imediata. Status: ativo.

---

## 1. Declaração de mudança de processo

O fluxo anterior ficou manual, documental e caro demais, com o humano validando microetapas. Isso não é o processo correto do YZI OS. A partir de agora:

- **Produto primeiro** — entregar cockpit/produto navegável, não documentação.
- **Documentação mínima** — só o necessário para executar e auditar.
- **Specs curtas** — uma spec por bloco, objetiva, com critério de aceite verificável.
- **Subagentes executam** — implementação prática feita por subagentes por função.
- **Auditor valida contra a spec** — auditoria automatizada por agente, não pelo humano.
- **Humano não valida microetapas** — humano entra apenas em **gates de risco**: SQL, push, alteração de schema e decisão de produto.

---

## 2. Subagentes oficiais

| # | Subagente | Função |
|---|-----------|--------|
| 1 | **Product Architect Agent** | Define o quê e o porquê do bloco; recorta escopo mínimo viável. |
| 2 | **Spec Engineer Agent** | Converte intenção em spec curta com critério de aceite. |
| 3 | **Implementation Agent** | Implementa o código do bloco conforme a spec. |
| 4 | **UI/Product Agent** | Implementa superfície navegável do cockpit (job-anchored). |
| 5 | **Backend/Data Agent** | Implementa dados/acesso; **propõe** SQL/schema, nunca aplica. |
| 6 | **Audit Agent** | Valida a entrega contra a spec; emite PASS/FAIL. |
| 7 | **Evidence Agent** | Registra evidência mínima da entrega quando solicitado. |

---

## 3. Responsabilidade de cada subagente

- **Product Architect Agent**
  - Define objetivo do bloco e resultado esperado para o usuário.
  - Recorta o menor escopo entregável.
  - **Não** cria roadmap longo nem fases especulativas.

- **Spec Engineer Agent**
  - Produz spec curta: objetivo, escopo, fora-de-escopo, critério de aceite.
  - **Não** detalha implementação passo a passo; descreve resultado, não microetapas.

- **Implementation Agent**
  - Implementa exatamente o escopo da spec.
  - Garante `lint` e `build` verdes localmente.

- **UI/Product Agent**
  - Implementa o cockpit liderando por **job/resultado**, nunca por nomes de agentes.
  - **Não** bloqueia commit local por validação visual quando `lint`/`build` e `audit` passaram.

- **Backend/Data Agent**
  - Implementa acesso a dados dentro do escopo.
  - **Propõe** SQL/schema em arquivo; aplicação fica para o gate humano.

- **Audit Agent**
  - Compara entrega ↔ spec e emite veredito **PASS/FAIL** com motivo.
  - É a validação que substitui a microvalidação humana.

- **Evidence Agent**
  - Registra evidência mínima e objetiva apenas quando o bloco exige.
  - Sem evidence inflada por microetapa.

---

## 4. Skills reutilizáveis

- Skills são **reutilizáveis por função**, não por lane.
- Cada subagente carrega a skill correspondente ao seu papel.
- Skills encapsulam o "como"; specs definem o "o quê"; isso evita reescrever processo a cada bloco.

---

## 5. Fluxo SDD (ciclo por bloco)

1. **Product Architect** define o bloco (escopo mínimo).
2. **Spec Engineer** escreve spec curta com critério de aceite.
3. **Implementation / UI / Backend** executam dentro da spec.
4. **Audit Agent** valida contra a spec → PASS/FAIL.
5. **Evidence Agent** registra evidência mínima (se aplicável).
6. **Commit local** por entrega (sem push).
7. **Gate humano** somente quando houver risco (ver §6).

---

## 6. Gates humanos

O humano atua **apenas** em:

- **SQL** — qualquer execução de SQL.
- **Push** — todo push ao remoto.
- **Schema** — toda alteração de schema.
- **Decisão de produto** — escolhas de direção/produto.

Fora desses gates, o ciclo subagente→auditor é autônomo até o commit local.

---

## 7. Regras operacionais

- **Não** criar roadmap longo.
- **Não** validar microetapas com humano.
- **Não** bloquear commit local por validação visual quando `lint`/`build` e `audit` passaram.
- Commit **local por entrega**; **sem push automático**.
- SQL, schema, MCP e push exigem gate humano explícito.

---

## 8. Aplicação imediata — próximo bloco: Cockpit Productization

- **Próximo bloco:** Cockpit Productization.
- **Objetivo:** transformar o cockpit em **produto navegável** (liderado por job/resultado).
- **Como:** usar subagentes oficiais + skills reutilizáveis + auditoria contra spec.
- **Entrega:** commit local por entrega.
- **Restrição:** sem push automático; gates humanos preservados (SQL, push, schema, produto).
