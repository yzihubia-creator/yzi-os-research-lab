# Skill Spec — Next.js 16 Platform Safety (Lane 4) v1

> Spec documental apenas. Não é skill executável, não cria arquivo `.claude/`, não roda nada. Materialização exige task própria e gate humano.

## Quando Usar

Antes de qualquer escrita futura em `platform/src/app/` ou `platform/src/proxy.ts` na Lane 4 (Steps 4 e 6), para garantir que padrões do Next.js em uso no `platform/` sejam respeitados sem expandir escopo. No Next.js 16, proxy substitui middleware (`16-proxy.md` da doc embarcada) e o arquivo fica dentro de `src/`.

## Inputs

- Step e gate vigentes;
- Lista fechada de arquivos da seção 4 do execution program;
- Estrutura atual de `platform/src/app/` (leitura);
- Versão do Next.js do `package.json` (leitura).

## Passos

1. Confirmar que o arquivo alvo está na lista fechada;
2. Confirmar server/client component apropriado (auth e tenant context = server-side por padrão);
3. Confirmar que nenhuma env var nova é necessária além das existentes (anon key/url);
4. Confirmar ausência de `use client` desnecessário, fetch externo ou dependência nova;
5. Confirmar que rotas novas limitam-se a `/login` e `/cockpit`;
6. Registrar resultado textual.

## Outputs

- Checklist textual PASSOU/FALHOU por item;
- Lista de violações com arquivo e motivo.

## Stop Conditions

- Arquivo fora da lista fechada → `OUT_OF_SCOPE_WRITE`;
- Dependência nova não aprovada → parar e reportar;
- Necessidade de secret novo → `SECRET_EXPOSURE`;
- Python proposto → `LANGUAGE_VIOLATION`.
