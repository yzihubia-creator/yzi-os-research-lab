"use client";

import Link from "next/link";

// Corretores — superfície operacional, não catálogo de pessoas.
//
// Estado atual (2026-07): não existe schema real de corretores no banco.
// A lista abaixo era alimentada por `DEMO_BROKERS` (dado de demonstração)
// apresentada como se fosse operação real, sem qualquer indicação de mock e
// sem porta de entrada para cadastro. Isso viola a regra institucional do
// produto: dado fictício nunca pode ser exibido como dado real, e toda porta
// de entrada (cadastro) precisa existir mesmo sem dado real por trás.
//
// Esta tela agora mostra um estado honesto de "capability ainda não
// conectada" no lugar da lista fictícia, e mantém um CTA de cadastro que
// abre o Broker Workspace em modo "novo" (mesmo componente usado para editar
// um corretor existente). O formulário é navegável e funcional, mas ao
// tentar salvar ele informa — sem simular sucesso — que a gravação real
// ainda não está disponível (ver aviso já existente no rodapé do
// `YziImobBrokerWorkspace`, componente fora do escopo desta unidade).
//
// Contrato mínimo de backend necessário para esta capability (registro, não
// implementação — nenhuma tabela/migration foi criada):
//   corretores {
//     id            uuid primary key
//     tenant_id     uuid not null   -- isolamento por imobiliária
//     full_name     text not null
//     email         text
//     phone         text
//     status        text            -- ex.: ativo | em integração | inativo
//     role          text            -- tipo/papel do corretor na operação
//     created_at    timestamptz not null default now()
//     updated_at    timestamptz not null default now()
//   }
//
// Decisões de produto sobre captador prioritário, distribuição estilo Uber,
// equipes, comissão ou lançamento NÃO são tratadas aqui — ficam para quando
// a capability for de fato conectada.

export default function YziImobCorretoresPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-8 py-10">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.01em] text-[var(--yzi-text-primary)]">
          Corretores
        </h1>
        <p className="text-[0.82rem] text-[var(--yzi-text-secondary)]">
          A YZI encaminha os leads. Aqui fica o que ainda está em aberto.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
            Corretores
          </h2>
          <Link
            href="/cockpit/yzi-imob/corretores/novo"
            className="rounded-full border border-[color:rgba(var(--imob-ice),0.35)] bg-[color:rgba(var(--imob-ice),0.1)] px-3.5 py-1.5 text-[0.78rem] font-medium text-[rgb(var(--imob-ice))] transition-colors hover:bg-[color:rgba(var(--imob-ice),0.16)]"
          >
            Cadastrar corretor
          </Link>
        </div>

        <div className="flex flex-col gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-6 text-center shadow-[var(--yzi-edge-highlight)]">
          <p className="text-[0.88rem] font-medium text-[var(--yzi-text-primary)]">
            O cadastro de corretores ainda não está conectado à operação da imobiliária.
          </p>
          <p className="mx-auto max-w-md text-[0.78rem] leading-relaxed text-[var(--yzi-text-faint)]">
            Ainda não existe uma fonte real de corretores no banco. Assim que essa
            capability for conectada, a lista aqui passa a refletir os corretores
            cadastrados de verdade — com fila de atenção, status e leads
            encaminhados. Use &ldquo;Cadastrar corretor&rdquo; para ver como o formulário
            vai funcionar; nenhum dado é salvo por enquanto.
          </p>
        </div>
      </div>
    </section>
  );
}
