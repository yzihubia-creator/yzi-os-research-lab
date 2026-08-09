import { decideCreativeRevisionAction } from "@/app/cockpit/yzi-imob/imoveis/[id]/creative/actions";
import { YziPanel, YziStatusBadge } from "@/components/yzi-os/yzi-primitives";
import type {
  PropertyAsset,
  PropertyAssetCategory,
  PropertyAssetStatus,
} from "@/lib/yzi-imob/creative/property-assets";

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
  canDecide,
  isCurrentRevision,
}: {
  asset: PropertyAsset;
  canDecide: boolean;
  isCurrentRevision: boolean;
}) {
  const canReview =
    canDecide && isCurrentRevision && asset.status === "in_review" && asset.revisionId;
  const isVideo = asset.category === "video_tour";

  return (
    <YziPanel className="overflow-hidden p-0">
      <div
        className={
          isVideo
            ? "relative aspect-video bg-[linear-gradient(135deg,#101924,#23354a)] p-5 text-white"
            : "relative aspect-[4/3] bg-[linear-gradient(145deg,#142337,#536c80)] p-5 text-white"
        }
        aria-label={`Preview de ${asset.title}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.18),transparent_38%)]" />
        <div className="relative flex h-full flex-col justify-end">
          <p className="text-[0.6rem] uppercase tracking-[0.18em] text-white/60">
            {isVideo ? "Prévia em movimento" : "Prévia da arte"}
          </p>
          <p className="mt-2 line-clamp-2 text-lg font-semibold leading-tight">
            {asset.previewLabel}
          </p>
          <p className="mt-2 text-xs text-white/70">{asset.previewDetail}</p>
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
                className="w-full rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.4)] bg-[rgba(var(--imob-ice),0.1)] px-3 py-2 text-xs text-[rgb(var(--imob-ice))]"
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

function AssetSection({
  title,
  description,
  category,
  assets,
  canDecide,
  currentRevisionIds,
}: {
  title: string;
  description: string;
  category: PropertyAssetCategory;
  assets: readonly PropertyAsset[];
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
  canDecide,
  currentRevisionIds,
}: {
  assets: readonly PropertyAsset[];
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
        canDecide={canDecide}
        currentRevisionIds={currentRevisionIds}
      />
      <AssetSection
        title="Video tour"
        description="Vídeo deste imóvel, pronto para você revisar e aprovar."
        category="video_tour"
        assets={assets}
        canDecide={canDecide}
        currentRevisionIds={currentRevisionIds}
      />
    </div>
  );
}
