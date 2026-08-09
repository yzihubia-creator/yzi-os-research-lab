"use client";

import { useState } from "react";

import { decideCreativeRevisionAction } from "@/app/cockpit/yzi-imob/imoveis/[id]/creative/actions";
import { YziPanel, YziStatusBadge } from "@/components/yzi-os/yzi-primitives";
import type {
  PropertyAsset,
  PropertyAssetCategory,
  PropertyAssetStatus,
} from "@/lib/yzi-imob/creative/property-assets";

export type PropertyAssetVisualPreview = {
  url: string;
  mediaType: "image" | "video";
  posterUrl: string | null;
  altText: string;
  kind: "rendered" | "reference";
  decisionReady: boolean;
};

const STATUS_LABELS: Record<PropertyAssetStatus, string> = {
  draft: "Em preparo",
  in_review: "Aguardando aprovação",
  adjustment_requested: "Ajuste solicitado",
  approved: "Aprovada",
  rejected: "Reprovada",
  archived: "Substituída",
  published: "Publicada",
};

function statusTone(status: PropertyAssetStatus) {
  if (status === "approved" || status === "published") return "opportunity" as const;
  if (status === "rejected") return "blocked" as const;
  if (status === "in_review" || status === "adjustment_requested") {
    return "authorization" as const;
  }
  return "neutral" as const;
}

function AssetCard({
  asset,
  preview,
  canDecide,
  isCurrentRevision,
}: {
  asset: PropertyAsset;
  preview: PropertyAssetVisualPreview | null;
  canDecide: boolean;
  isCurrentRevision: boolean;
}) {
  const canReview =
    canDecide && isCurrentRevision && asset.status === "in_review" && asset.revisionId;
  const isVideo = asset.category === "video_tour";

  return (
    <YziPanel className="overflow-hidden p-0">
      <div className={isVideo ? "bg-[#0d151f] p-4" : "bg-[#0d151f]"}>
        <div className={isVideo ? "mx-auto w-full max-w-[14rem]" : "w-full"}>
          <AssetVisualPreview asset={asset} preview={preview} />
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
              {asset.title}
            </h3>
            <p className="mt-1 text-xs text-[var(--yzi-text-faint)]">
              {asset.revisionId ? "Versão vinculada ao imóvel" : "Conteúdo ainda não preparado"}
            </p>
          </div>
          <YziStatusBadge tone={statusTone(asset.status)}>
            {STATUS_LABELS[asset.status]}
          </YziStatusBadge>
        </div>

        {asset.status === "approved" ? (
          <p className="mt-4 text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
            Pronta para publicação em WhatsApp, site e redes sociais quando você decidir.
          </p>
        ) : asset.status === "published" ? (
          <p className="mt-4 text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
            Já publicada em um dos canais do imóvel.
          </p>
        ) : (
          <p className="mt-4 text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
            WhatsApp, site e redes sociais permanecem bloqueados até a aprovação.
          </p>
        )}

        {canReview ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <form action={decideCreativeRevisionAction}>
              <input type="hidden" name="propertyId" value={asset.propertyId} />
              <input type="hidden" name="revisionId" value={asset.revisionId ?? ""} />
              <input type="hidden" name="deliverableType" value={asset.format} />
              <input type="hidden" name="decision" value="approved" />
              <button
                type="submit"
                disabled={!preview?.decisionReady}
                title={!preview?.decisionReady ? "Aguarde uma prévia visual completa para aprovar" : undefined}
                className="w-full rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.4)] bg-[rgba(var(--imob-ice),0.1)] px-3 py-2 text-xs text-[rgb(var(--imob-ice))] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Aprovar
              </button>
            </form>

            <form action={decideCreativeRevisionAction} className="sm:col-span-2">
              <input type="hidden" name="propertyId" value={asset.propertyId} />
              <input type="hidden" name="revisionId" value={asset.revisionId ?? ""} />
              <input type="hidden" name="deliverableType" value={asset.format} />
              <input type="hidden" name="decision" value="changes_requested" />
              <input
                type="hidden"
                name="idempotencyKey"
                value={`property-asset-adjustment:${asset.revisionId}`}
              />
              <input
                type="hidden"
                name="adjustmentKind"
                value={isVideo ? "slow_motion" : "shorten_headline"}
              />
              <input type="hidden" name="scenePosition" value="1" />
              <input type="hidden" name="cardPosition" value="1" />
              <div className="flex gap-2">
                <input
                  name="observation"
                  required
                  maxLength={500}
                  placeholder="Descreva o ajuste"
                  className="min-w-0 flex-1 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-2 text-xs"
                >
                  Pedir ajuste
                </button>
              </div>
            </form>

            <form action={decideCreativeRevisionAction} className="sm:col-span-3">
              <input type="hidden" name="propertyId" value={asset.propertyId} />
              <input type="hidden" name="revisionId" value={asset.revisionId ?? ""} />
              <input type="hidden" name="deliverableType" value={asset.format} />
              <input type="hidden" name="decision" value="rejected" />
              <input type="hidden" name="observation" value="Arte reprovada na revisão humana." />
              <button
                type="submit"
                className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-2 text-xs text-[var(--yzi-status-danger)]"
              >
                Reprovar
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </YziPanel>
  );
}

function AssetVisualPreview({
  asset,
  preview,
}: {
  asset: PropertyAsset;
  preview: PropertyAssetVisualPreview | null;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const isVideo = asset.category === "video_tour";
  const failed = preview?.url === failedUrl;

  return (
    <div
      className={`relative isolate w-full overflow-hidden rounded-[var(--yzi-radius-md)] bg-[#101924] text-white ${isVideo ? "aspect-[9/16]" : "aspect-[4/5]"}`}
      aria-label={`Preview de ${asset.title}`}
    >
      {preview && !failed ? (
        preview.mediaType === "video" ? (
          <video
            src={preview.url}
            poster={preview.posterUrl ?? undefined}
            controls
            playsInline
            preload="metadata"
            onError={() => setFailedUrl(preview.url)}
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            {/* URL canônica ou temporária resolvida no servidor para o tenant ativo. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.url}
              alt={preview.altText}
              onError={() => setFailedUrl(preview.url)}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(5,10,16,0.9))]" />
            <div className="absolute inset-x-4 bottom-4">
              <p className="text-[0.62rem] uppercase tracking-[0.14em] text-white/65">
                {preview.kind === "rendered" ? "Preview renderizado" : "Imagem de referência"}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-medium">{asset.previewLabel}</p>
            </div>
          </>
        )
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 border border-dashed border-white/20 px-6 text-center">
          <p className="text-sm font-medium">Preview visual pendente</p>
          <p className="text-xs leading-relaxed text-white/60">
            {asset.revisionId
              ? "Ainda não há uma imagem ou vídeo disponível para esta versão."
              : "Esta arte ainda não tem uma versão preparada."}
          </p>
        </div>
      )}
    </div>
  );
}

function AssetSection({
  title,
  description,
  category,
  assets,
  previews,
  canDecide,
  currentRevisionIds,
}: {
  title: string;
  description: string;
  category: PropertyAssetCategory;
  assets: readonly PropertyAsset[];
  previews: Readonly<Record<string, PropertyAssetVisualPreview>>;
  canDecide: boolean;
  currentRevisionIds: readonly string[];
}) {
  const items = assets.filter((asset) => asset.category === category);

  return (
    <section aria-labelledby={`property-assets-${category}`}>
      <div>
        <h2 id={`property-assets-${category}`} className="text-base font-semibold">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[var(--yzi-text-secondary)]">{description}</p>
      </div>
      {items.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              preview={previews[asset.id] ?? null}
              canDecide={canDecide}
              isCurrentRevision={Boolean(
                asset.revisionId && currentRevisionIds.includes(asset.revisionId),
              )}
            />
          ))}
        </div>
      ) : (
        <YziPanel className="mt-4">
          <p className="text-sm text-[var(--yzi-text-secondary)]">
            Nenhuma arte deste tipo foi preparada para este imóvel ainda.
          </p>
        </YziPanel>
      )}
    </section>
  );
}

export function YziImobPropertyAssetsReview({
  assets,
  previews,
  canDecide,
  currentRevisionIds,
}: {
  assets: readonly PropertyAsset[];
  previews: Readonly<Record<string, PropertyAssetVisualPreview>>;
  canDecide: boolean;
  currentRevisionIds: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <AssetSection
        title="Artes estáticas"
        description="Carrosséis e peças deste imóvel, prontos para você revisar e aprovar."
        category="static_art"
        assets={assets}
        previews={previews}
        canDecide={canDecide}
        currentRevisionIds={currentRevisionIds}
      />
      <AssetSection
        title="Video tour"
        description="Vídeo deste imóvel, pronto para você revisar e aprovar."
        category="video_tour"
        assets={assets}
        previews={previews}
        canDecide={canDecide}
        currentRevisionIds={currentRevisionIds}
      />
    </div>
  );
}
