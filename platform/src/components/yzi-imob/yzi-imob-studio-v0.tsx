import Link from "next/link";

import { YziBadge } from "@/components/yzi-os/yzi-primitives";
import { CommandCenterIcon } from "@/components/yzi-os/yzi-icons";
import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";

const ENGINE_FLOW = [
  { label: "Imóvel", detail: "brief comercial", role: "primary" },
  { label: "Creative Package", detail: "patrimônio organizado", role: "cyan" },
  { label: "Conteúdo", detail: "post, reel, carrossel", role: "amber" },
  { label: "Biblioteca", detail: "assets aprovados", role: "coldGreen" },
  { label: "Campanha", detail: "plano para aprovação", role: "lilac" },
  { label: "Site", detail: "página publicável", role: "petrol" },
  { label: "Resultados", detail: "aprendizado futuro", role: "graphite" },
] satisfies Array<{ label: string; detail: string; role: YziImobRole }>;

const PACKAGE_ASSETS = [
  { title: "Reel premium", format: "9:16", state: "motion preparado", role: "cyan" },
  { title: "Carrossel alto padrão", format: "1:1 / 5 cards", state: "preview mock", role: "amber" },
  { title: "Post de feed", format: "4:5", state: "aprovável", role: "coldGreen" },
  { title: "Página do imóvel", format: "16:10", state: "site preview", role: "petrol" },
] satisfies Array<{ title: string; format: string; state: string; role: YziImobRole }>;

function EngineStep({ label, detail, role, index }: (typeof ENGINE_FLOW)[number] & { index: number }) {
  return (
    <div className="flex min-w-[136px] flex-1 items-center gap-2.5 rounded-[var(--yzi-radius-md)] border border-[rgba(var(--imob-graphite),0.28)] bg-[rgba(17,22,31,0.66)] px-3 py-2.5 shadow-[var(--yzi-edge-highlight)]">
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-[var(--yzi-radius-sm)] border text-[0.72rem] font-semibold"
        style={{ borderColor: imobRgba(role, 0.34), backgroundColor: imobRgba(role, 0.12), color: imobRgba(role, 0.96) }}
      >
        {index + 1}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[0.8rem] font-semibold text-[var(--yzi-text-primary)]">{label}</span>
        <span className="block truncate text-[0.68rem] text-[var(--yzi-text-faint)]">{detail}</span>
      </span>
    </div>
  );
}

function MockFrame({
  title,
  format,
  state,
  role,
  tall = false,
}: {
  title: string;
  format: string;
  state: string;
  role: YziImobRole;
  tall?: boolean;
}) {
  return (
    <article className="yzi-growth-card flex min-w-0 flex-col gap-3.5 rounded-[var(--yzi-radius-lg)] border p-3.5">
      <div
        className={`relative overflow-hidden rounded-[var(--yzi-radius-md)] border border-white/12 ${
          tall ? "aspect-[9/16]" : "aspect-[4/3]"
        }`}
        style={{
          background: `linear-gradient(155deg, rgba(255,255,255,0.15), transparent 24%), linear-gradient(145deg, ${imobRgba(
            role,
            0.42,
          )}, rgba(8,12,18,0.96) 62%)`,
        }}
      >
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3 text-[0.58rem] uppercase tracking-[0.12em] text-white/58">
          <span>{format}</span>
          <span>mock</span>
        </div>
        <div className="absolute left-4 right-4 top-12 h-[42%] overflow-hidden rounded-[18px] border border-white/10 bg-black/20">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.03))]" />
          <div className="absolute bottom-0 left-0 h-1/2 w-full bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.44))]" />
          <div className="absolute bottom-4 left-4 h-10 w-20 rounded-t-full bg-black/28" />
          <div className="absolute bottom-4 right-4 h-12 w-14 rounded-[8px] bg-white/12" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <span className="mb-2 block w-fit rounded-[var(--yzi-radius-sm)] bg-black/28 px-2 py-1 text-[0.58rem] uppercase tracking-[0.12em] text-white/62">
            preview
          </span>
          <h3 className="text-[1rem] font-semibold leading-[1.08] text-white">{title}</h3>
          <span className="mt-3 block h-1.5 w-4/5 rounded bg-white/28" />
          <span className="mt-1.5 block h-1.5 w-1/2 rounded bg-white/14" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 text-[0.72rem] leading-snug text-[var(--yzi-text-secondary)]">{state}</span>
        <span
          className="rounded-[var(--yzi-radius-sm)] border px-2 py-1 text-[0.62rem]"
          style={{ borderColor: imobRgba(role, 0.34), backgroundColor: imobRgba(role, 0.1), color: imobRgba(role, 0.95) }}
        >
          {format}
        </span>
      </div>
    </article>
  );
}

export function YziImobStudioV0() {
  return (
    <section className="yzi-growth-surface flex min-h-full w-full flex-col gap-6 px-4 pb-10 pt-5 sm:px-6 min-[1720px]:px-8">
      <header className="flex flex-col gap-4">
        <Link
          href="/cockpit/yzi-imob"
          className="inline-flex w-fit items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-graphite),0.34)] bg-[rgba(var(--imob-graphite),0.12)] px-3 py-1.5 text-xs text-[var(--yzi-text-secondary)] transition-colors hover:border-[rgba(var(--imob-ice),0.28)] hover:text-[var(--yzi-text-primary)]"
        >
          <CommandCenterIcon className="h-3.5 w-3.5" />
          Voltar ao YZI IMOB
        </Link>

        <div className="grid gap-4 min-[1640px]:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col justify-end gap-3">
            <span className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[rgba(var(--imob-cyan),0.86)]">
              Creative Engine / mock operacional
            </span>
            <h1 className="max-w-4xl text-[clamp(2rem,4.5vw,4.4rem)] font-semibold leading-[1] text-[var(--yzi-text-primary)]">
              Um imóvel vira patrimônio de marketing.
            </h1>
            <p className="max-w-2xl text-[0.96rem] leading-relaxed text-[var(--yzi-text-secondary)]">
              A YZI transforma o brief do imóvel em pacote criativo, conteúdo, biblioteca, campanha, site e aprendizado.
              Tudo abaixo é demonstrativo; nada foi gerado, publicado ou conectado.
            </p>
          </div>

          <div className="yzi-growth-card rounded-[var(--yzi-radius-lg)] border p-3.5">
            <div className="relative aspect-[16/11] overflow-hidden rounded-[var(--yzi-radius-md)] border border-white/12 bg-[radial-gradient(circle_at_35%_0%,rgba(var(--imob-cold),0.32),transparent_42%),linear-gradient(145deg,rgba(var(--imob-deep),0.42),rgba(6,9,14,0.98))]">
              <div className="absolute left-5 top-5">
                <YziBadge tone="preview" className="normal-case">
                  preview mockado
                </YziBadge>
              </div>
              <div className="absolute inset-x-6 top-16 h-28 rounded-[24px] border border-white/10 bg-white/10" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[0.62rem] uppercase tracking-[0.14em] text-white/58">Apartamento Altiplano</span>
                <h2 className="mt-2 text-[2rem] font-semibold leading-none text-white">Creative Package</h2>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {["reel", "post", "site"].map((item) => (
                    <span key={item} className="rounded-[var(--yzi-radius-sm)] bg-white/12 px-2.5 py-2 text-[0.68rem] text-white/72">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="flex flex-wrap gap-2">
        {ENGINE_FLOW.map((step, index) => (
          <EngineStep key={step.label} {...step} index={index} />
        ))}
      </section>

      <main className="grid gap-4 min-[1760px]:grid-cols-[minmax(0,1fr)_340px]">
        <section className="grid gap-4 sm:grid-cols-2 min-[1760px]:grid-cols-4">
          {PACKAGE_ASSETS.map((asset, index) => (
            <MockFrame key={asset.title} {...asset} tall={index === 0} />
          ))}
        </section>

        <aside className="yzi-growth-card flex flex-col gap-3.5 rounded-[var(--yzi-radius-lg)] border p-4">
          <div className="border-b border-[rgba(var(--imob-graphite),0.22)] pb-3">
            <span className="text-[0.6rem] font-medium uppercase tracking-[0.16em] text-[rgba(var(--imob-cyan),0.82)]">
              engine status
            </span>
            <h2 className="mt-1 text-[1rem] font-semibold text-[var(--yzi-text-primary)]">Preparado para motion</h2>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {["Motion Ready", "Voice Ready", "Package Ready"].map((label) => (
                <span
                  key={label}
                  className="rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-graphite),0.32)] bg-[rgba(var(--imob-graphite),0.1)] px-2 py-1 text-[0.6rem] text-[var(--yzi-text-secondary)]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          {[
            ["Preview de vídeo", "espaço visual reservado"],
            ["Timeline", "estrutura pronta para Remotion futuro"],
            ["Thumbnail", "mock gerado localmente por componente"],
            ["Motion status", "sem render real nesta task"],
            ["Render status", "offline / não conectado"],
            ["Voice status", "roteiro, sem voz gerada"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 border-b border-[rgba(var(--imob-graphite),0.18)] pb-3 last:border-b-0">
              <span className="text-[0.7rem] uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">{label}</span>
              <span className="text-right text-[0.78rem] text-[var(--yzi-text-secondary)]">{value}</span>
            </div>
          ))}
          <p className="rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-amber),0.3)] bg-[rgba(var(--imob-amber),0.09)] px-3 py-2.5 text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
            Nenhuma API, provider, render, publicação, campanha ou banco foi acionado. Esta tela mostra a percepção de
            produto da Creative Engine.
          </p>
        </aside>
      </main>
    </section>
  );
}
