"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import {
  MOCK_SEMANA_CREDITOS_MES,
  MOCK_SEMANA_ITENS,
  MOCK_SEMANA_LABEL,
  type SemanaItem,
} from "@/components/yzi-imob/yzi-imob-marketing-semana-mock";
import {
  MarketingActionGroup,
  MarketingButton,
  MarketingDependency,
  MarketingPreviewStage,
  MarketingProgress,
  MarketingReviewLayout,
  MarketingShellContent,
  MarketingStatusBadge,
  MarketingTerminalState,
  MarketingWeekCloseRow,
  marketingOrientation,
} from "@/components/yzi-imob/yzi-imob-marketing-kit";
import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";
import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";

// Revisar Semana v0 — o momento central do módulo Marketing.
// O gestor revisa a semana peça a peça, ajusta só o necessário e aprova uma
// única vez. Estado 100% local; nada é gerado, agendado ou publicado.
// Layout e componentes vêm do Marketing Kit (yzi-imob-marketing-kit).

type DecisaoTipo = "manter" | "ajustar" | "tirar";

type Decisao = {
  tipo: DecisaoTipo;
  ajuste?: string;
};

type Fase = "revisao" | "fechamento" | "aprovada";

const OPCOES_AJUSTE = ["Trocar a foto", "Mudar o texto", "Quero outra versão"];

function formatDuracao(segundos: number): string {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}

/* -------------------------------------------------------------------- */
/* Palco da peça — o preview é o protagonista: sem card, sem chrome,      */
/* só a peça no formato real do canal (contrato de mídia do Marketing     */
/* Kit). A composição interna se adapta à orientação: vertical, quadrado  */
/* ou paisagem, sempre dentro da mesma moldura de aspect ratio real.     */
/* -------------------------------------------------------------------- */
function PecaPreview({ item, dimmed }: { item: SemanaItem; dimmed?: boolean }) {
  const orientacao = marketingOrientation(item.media);
  const vertical = orientacao === "vertical";
  const paisagem = orientacao === "paisagem";
  const carrossel = item.formato === "Carrossel";
  const video = item.media.mimeType.startsWith("video");

  return (
    <MarketingPreviewStage media={item.media} dimmed={dimmed}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, rgba(255,255,255,0.16), transparent 20%), linear-gradient(145deg, ${imobRgba(
            item.palette[0],
            0.44,
          )}, ${imobRgba(item.palette[1], 0.2)} 54%, rgba(7,10,16,0.98))`,
        }}
      />

      <div
        className={cx(
          "absolute left-5 right-5 flex items-center justify-between text-[0.6rem] uppercase tracking-[0.14em] text-white/60",
          paisagem ? "top-4" : "top-5",
        )}
      >
        <span>{item.canal}</span>
        <span>{item.formato}</span>
      </div>

      {/* Zona de mídia: em paisagem a peça é a própria mídia (full-bleed);
          nos demais formatos, um inset acima do bloco de texto. Assets
          reais entram preservando proporção (contain na moldura). */}
      <div
        className={cx(
          "absolute overflow-hidden",
          paisagem
            ? "inset-0"
            : cx(
                "rounded-[20px] border border-white/12 bg-black/22",
                vertical ? "left-5 right-5 top-14 h-[46%]" : "left-6 right-6 top-14 h-[48%]",
              ),
        )}
      >
        {item.imageSrc ? (
          <>
            <Image
              src={item.imageSrc}
              alt="Mídia de demonstração do conteúdo"
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
            />
            <div
              className={cx(
                "absolute bottom-0 left-0 w-full bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.42))]",
                paisagem ? "h-2/3" : "h-1/2",
              )}
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.035)_42%,rgba(0,0,0,0.16))]" />
            <div className="absolute bottom-0 left-0 h-1/2 w-full bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.42))]" />
            <div className="absolute bottom-5 left-5 h-12 w-24 rounded-t-full bg-black/28" />
            <div className="absolute bottom-5 right-5 h-16 w-20 rounded-[10px] border border-white/10 bg-white/12" />
          </>
        )}
        <span className="absolute left-4 top-4 rounded-[var(--yzi-radius-sm)] bg-black/32 px-2 py-1 text-[0.56rem] uppercase tracking-[0.12em] text-white/60">
          exemplo
        </span>
      </div>

      {carrossel ? (
        <div className="absolute right-7 top-[58%] flex gap-1.5" aria-hidden>
          {[0, 1, 2, 3].map((dot) => (
            <span
              key={dot}
              className={cx("h-1.5 rounded-full", dot === 0 ? "w-6 bg-white/70" : "w-1.5 bg-white/24")}
            />
          ))}
        </div>
      ) : null}

      {video && vertical ? (
        <div
          className="absolute bottom-5 left-5 right-5 flex items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-white/10 bg-black/22 px-2.5 py-2"
          aria-hidden
        >
          <span className="h-6 w-6 rounded-full border border-white/20 bg-white/12" />
          <span className="h-1.5 flex-1 rounded bg-white/16">
            <span className="block h-1.5 w-2/5 rounded bg-white/50" />
          </span>
          <span className="font-mono text-[0.58rem] text-white/55">
            {formatDuracao(item.media.durationSeconds ?? 0)}
          </span>
        </div>
      ) : null}

      {video && !vertical ? (
        <span
          className={cx(
            "absolute rounded-[var(--yzi-radius-sm)] bg-black/32 px-2 py-1 font-mono text-[0.58rem] text-white/60",
            paisagem ? "right-4 top-10" : "right-7 top-[58%]",
          )}
          aria-hidden
        >
          ▶ {formatDuracao(item.media.durationSeconds ?? 0)}
        </span>
      ) : null}

      <div
        className={cx(
          "absolute flex flex-col",
          vertical
            ? "bottom-16 left-5 right-5"
            : paisagem
              ? "bottom-5 left-6 right-6"
              : "bottom-8 left-7 right-7",
        )}
      >
        <h3
          className={cx(
            "text-balance font-semibold leading-[1.04] text-white",
            paisagem ? "text-[clamp(1.1rem,2.4vw,1.7rem)]" : "text-[clamp(1.3rem,3.2vw,2.4rem)]",
          )}
        >
          {item.headline}
        </h3>
        <p
          className={cx(
            "mt-2.5 max-w-lg text-[0.8rem] leading-relaxed text-white/68",
            paisagem && "mt-1.5",
          )}
        >
          {item.supportingText}
        </p>
        <div className={cx("flex flex-wrap gap-2", paisagem ? "mt-2.5" : "mt-4")}>
          {item.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-[var(--yzi-radius-sm)] bg-white/12 px-3 py-1 text-[0.64rem] text-white/72"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </MarketingPreviewStage>
  );
}

function LinhaMeta({ item }: { item: SemanaItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[0.8rem] text-[var(--yzi-text-secondary)]">
      <span className="font-medium text-[var(--yzi-text-primary)]">{item.formato}</span>
      <span aria-hidden>·</span>
      <span>{item.canal}</span>
      <span aria-hidden>·</span>
      <span>{item.diaHorario}</span>
      {item.publicacaoManual ? <MarketingStatusBadge status="manual" /> : null}
      {item.imovel ? (
        <span
          className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-2 py-0.5 text-[0.68rem] text-[var(--yzi-text-secondary)]"
          title={`Imóvel ${item.imovel.id}`}
        >
          {item.imovel.nome}
        </span>
      ) : null}
    </div>
  );
}

export function YziImobRevisarSemanaV0() {
  const itens = MOCK_SEMANA_ITENS;
  const [fase, setFase] = useState<Fase>("revisao");
  const [indice, setIndice] = useState(0);
  const [decisoes, setDecisoes] = useState<Record<string, Decisao>>({});
  const [ajusteAberto, setAjusteAberto] = useState(false);
  const [ajusteLivre, setAjusteLivre] = useState("");

  const item = itens[indice];
  const decisaoAtual = decisoes[item?.id ?? ""];

  const mantidos = useMemo(
    () => itens.filter((i) => (decisoes[i.id]?.tipo ?? "manter") !== "tirar"),
    [itens, decisoes],
  );
  const dependencias = mantidos.filter((i) => i.dependeDeVoce);
  const manuais = mantidos.filter((i) => i.publicacaoManual);
  const creditosSemana = mantidos.reduce((soma, i) => soma + i.creditos, 0);
  const canais = Array.from(new Set(mantidos.map((i) => i.canal))).join(" e ");

  function avancar() {
    setAjusteAberto(false);
    setAjusteLivre("");
    if (indice < itens.length - 1) {
      setIndice(indice + 1);
    } else {
      setFase("fechamento");
    }
  }

  function voltar() {
    setAjusteAberto(false);
    setAjusteLivre("");
    if (indice > 0) setIndice(indice - 1);
  }

  function decidir(tipo: DecisaoTipo, ajuste?: string) {
    setDecisoes((atual) => ({ ...atual, [item.id]: { tipo, ajuste } }));
    avancar();
  }

  function devolver() {
    setDecisoes((atual) => {
      const proximo = { ...atual };
      delete proximo[item.id];
      return proximo;
    });
  }

  /* ---------------------------------------------------------------- */
  /* Semana aprovada                                                    */
  /* ---------------------------------------------------------------- */
  if (fase === "aprovada") {
    return (
      <MarketingShellContent width="leitura">
        <MarketingTerminalState
          tone="sucesso"
          titulo="Semana aprovada. Eu cuido do resto — te aviso se precisar de você."
          consequencia={
            <>
              {mantidos.length} conteúdos confirmados para {canais}.
              {dependencias.length > 0
                ? ` Falta você: ${dependencias.length === 1 ? "1 gravação" : `${dependencias.length} gravações`}.`
                : ""}
            </>
          }
          nota="Semana de exemplo — nada foi gerado, agendado ou publicado."
        />
      </MarketingShellContent>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Fechamento — resumo executivo, não lista                           */
  /* ---------------------------------------------------------------- */
  if (fase === "fechamento") {
    const tirados = itens.length - mantidos.length;
    return (
      <MarketingShellContent width="leitura">
        <header className="flex flex-col gap-2">
          <span className="text-[0.7rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
            {MOCK_SEMANA_LABEL}
          </span>
          <h1 className="text-balance text-[1.55rem] font-semibold leading-tight text-[var(--yzi-text-primary)]">
            Sua semana: {mantidos.length} conteúdos no {canais}
            {tirados > 0 ? ` — você tirou ${tirados}` : ""}
          </h1>
          <p className="text-[0.9rem] text-[var(--yzi-text-secondary)]">
            Esta semana usa{" "}
            <span className="font-medium text-[var(--yzi-text-primary)]">
              {creditosSemana} dos seus {MOCK_SEMANA_CREDITOS_MES} créditos
            </span>{" "}
            do mês.
          </p>
        </header>

        <ul className="mt-8 flex flex-col divide-y divide-[color:var(--yzi-border-subtle)]">
          {itens.map((i) => {
            const d = decisoes[i.id];
            const tirado = d?.tipo === "tirar";
            return (
              <MarketingWeekCloseRow
                key={i.id}
                titulo={i.titulo}
                removido={tirado}
                detalhe={
                  tirado
                    ? "fora da semana"
                    : d?.tipo === "ajustar"
                      ? `com ajuste: ${d.ajuste ?? "solicitado"}`
                      : i.diaHorario
                }
              />
            );
          })}
        </ul>

        {dependencias.length > 0 ? (
          <div className="mt-8">
            <MarketingDependency tone="voce">
              {dependencias.map((i) => (
                <p key={i.id}>
                  {i.titulo}: {i.dependeDeVoce}
                </p>
              ))}
            </MarketingDependency>
          </div>
        ) : null}

        {manuais.length > 0 ? (
          <p className="mt-5 text-[0.8rem] leading-relaxed text-[var(--yzi-text-secondary)]">
            {manuais.length === 1 ? "1 conteúdo sai" : `${manuais.length} conteúdos saem`} pelo seu celular — o
            Instagram não deixa ferramenta publicar esse formato. Te aviso na hora certa.
          </p>
        ) : null}

        <p className="mt-8 text-[0.86rem] leading-relaxed text-[var(--yzi-text-primary)]">
          Depois do seu ok: eu finalizo as peças, agendo tudo nos melhores horários e só te chamo se precisar de
          você.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <MarketingButton variant="primario" onClick={() => setFase("aprovada")}>
            Aprovar semana
          </MarketingButton>
          <MarketingButton
            onClick={() => {
              setFase("revisao");
              setIndice(0);
            }}
          >
            Voltar à revisão
          </MarketingButton>
        </div>

        <p className="mt-6 text-[0.68rem] text-[var(--yzi-text-faint)]">
          Semana de exemplo — nada será gerado, agendado ou publicado.
        </p>
      </MarketingShellContent>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Deck de revisão                                                    */
  /* ---------------------------------------------------------------- */
  const tirado = decisaoAtual?.tipo === "tirar";

  return (
    <MarketingShellContent className="gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[1.1rem] font-semibold text-[var(--yzi-text-primary)]">Revisar sua semana</h1>
          <span className="text-[0.7rem] text-[var(--yzi-text-faint)]">
            {MOCK_SEMANA_LABEL} · nada será publicado
          </span>
        </div>
        <MarketingProgress total={itens.length} atual={indice} />
      </header>

      <MarketingReviewLayout
        preview={<PecaPreview item={item} dimmed={tirado} />}
        panel={
          <div className="flex min-w-0 flex-col gap-6 @min-[860px]/marketing:py-2">
            <div className="flex flex-col gap-3">
              <h2 className="text-balance text-[1.05rem] font-semibold leading-snug text-[var(--yzi-text-primary)]">
                {item.titulo}
              </h2>
              <LinhaMeta item={item} />
              <p className="text-[0.84rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                <span className="text-[var(--yzi-text-primary)]">Objetivo:</span> {item.objetivo}
              </p>
              <p className="text-[0.84rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                <span style={{ color: imobRgba("cyan", 1) }}>Por que sugeri:</span> {item.porQue}
              </p>
              {item.dependeDeVoce ? (
                <MarketingDependency tone="voce">{item.dependeDeVoce}</MarketingDependency>
              ) : null}
            </div>

            {tirado ? (
              <div className="flex flex-col gap-3">
                <p className="text-[0.82rem] text-[var(--yzi-text-secondary)]">
                  Este conteúdo está fora da semana.
                </p>
                <MarketingButton onClick={devolver}>Devolver à semana</MarketingButton>
              </div>
            ) : ajusteAberto ? (
              <div className="flex flex-col gap-2">
                <span className="text-[0.76rem] font-medium text-[var(--yzi-text-primary)]">
                  O que você quer ajustar?
                </span>
                {OPCOES_AJUSTE.map((opcao) => (
                  <MarketingButton key={opcao} onClick={() => decidir("ajustar", opcao)}>
                    {opcao}
                  </MarketingButton>
                ))}
                <label className="flex flex-col gap-1.5">
                  <span className="sr-only">Descreva o ajuste</span>
                  <textarea
                    value={ajusteLivre}
                    onChange={(e) => setAjusteLivre(e.target.value)}
                    placeholder="Ou descreva com suas palavras…"
                    rows={2}
                    className="w-full rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-transparent px-3 py-2.5 text-[0.82rem] text-[var(--yzi-text-primary)] placeholder:text-[var(--yzi-text-faint)] focus:outline focus:outline-2 focus:outline-[rgba(var(--imob-ice),0.5)]"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <MarketingButton
                    variant="primario"
                    onClick={() => decidir("ajustar", ajusteLivre.trim() || "ajuste solicitado")}
                    ariaLabel="Confirmar ajuste"
                  >
                    Pedir ajuste
                  </MarketingButton>
                  <MarketingButton onClick={() => setAjusteAberto(false)}>Cancelar</MarketingButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {decisaoAtual?.tipo === "ajustar" ? (
                  <p className="text-[0.76rem]" style={{ color: imobRgba("amber", 1) }}>
                    Ajuste pedido: {decisaoAtual.ajuste}
                  </p>
                ) : null}
                <MarketingActionGroup
                  primary={
                    <MarketingButton
                      variant="primario"
                      onClick={() => decidir("manter")}
                      ariaLabel={`Manter ${item.titulo} na semana`}
                    >
                      Manter na semana
                    </MarketingButton>
                  }
                  secondary={
                    <>
                      <MarketingButton onClick={() => setAjusteAberto(true)}>Ajustar</MarketingButton>
                      <MarketingButton onClick={() => decidir("tirar")}>Tirar da semana</MarketingButton>
                    </>
                  }
                />
              </div>
            )}

            <div className="flex flex-col gap-2 @min-[860px]/marketing:mt-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-4">
                <MarketingButton onClick={voltar} disabled={indice === 0} ariaLabel="Conteúdo anterior">
                  ← Anterior
                </MarketingButton>
                <MarketingButton onClick={avancar} ariaLabel="Próximo conteúdo (mantém este na semana)">
                  {indice === itens.length - 1 ? "Fechar a semana →" : "Próximo →"}
                </MarketingButton>
              </div>
              <p className="text-[0.66rem] text-[var(--yzi-text-faint)]">
                Avançar sem escolher mantém o conteúdo na semana.
              </p>
            </div>
          </div>
        }
      />
    </MarketingShellContent>
  );
}
