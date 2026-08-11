"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  beginPropertyMediaUploadAction,
  cancelPropertyMediaUploadAction,
  finalizePropertyMediaUploadAction,
  setPropertyMediaCoverAction,
} from "@/app/cockpit/yzi-imob/imoveis/[id]/media-actions";
import {
  PROPERTY_MEDIA_ALLOWED_FILES,
  validatePropertyMediaFile,
  type PropertyGallerySlotDefinition,
} from "@/lib/yzi-imob/creative/media/gallery-contract";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PropertyPublicationMedia } from "@/lib/yzi-imob/publication/types";

type UploadPhase = "idle" | "reserving" | "uploading" | "finalizing" | "success" | "error";
type UploadStage = "reserve" | "storage" | "finalize" | "cancel";
type SuccessfulReservation = Extract<
  Awaited<ReturnType<typeof beginPropertyMediaUploadAction>>,
  { status: "ok" }
>;

const PHASE_PROGRESS: Record<UploadPhase, number> = {
  idle: 0,
  reserving: 15,
  uploading: 55,
  finalizing: 90,
  success: 100,
  error: 0,
};

function logUploadFailure(stage: UploadStage, error: unknown) {
  console.error("[yzi-imob-property-media-upload]", {
    stage,
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
}

export function PropertyMediaUploadControl({
  propertyId,
  slot,
  enabled,
}: {
  propertyId: string;
  slot: PropertyGallerySlotDefinition;
  enabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const busy = ["reserving", "uploading", "finalizing"].includes(phase);
  const fileContract = PROPERTY_MEDIA_ALLOWED_FILES[slot.mediaClass];

  async function handleFile(file: File) {
    const validation = validatePropertyMediaFile(slot.key, file);
    if (!validation.valid) {
      setPhase("error");
      setMessage(validation.message);
      return;
    }

    let stage: UploadStage = "reserve";
    let reservation: SuccessfulReservation | null = null;

    const cancelReservation = async () => {
      if (!reservation) return;
      try {
        await cancelPropertyMediaUploadAction({
          propertyId,
          mediaId: reservation.reservation.mediaId,
          path: reservation.reservation.path,
        });
      } catch (error) {
        logUploadFailure("cancel", error);
      }
    };

    try {
      setMessage("Preparando a mídia...");
      setPhase("reserving");
      const reservationResult = await beginPropertyMediaUploadAction({
        propertyId,
        slot: slot.key,
        filename: file.name,
        mimeType: file.type,
        byteSize: file.size,
      });
      if (reservationResult.status === "error") {
        setPhase("error");
        setMessage(
          reservationResult.code === "media_upload_prepare_failed"
            ? `Não foi possível preparar a mídia. Código de diagnóstico: ${reservationResult.diagnosticId}. Etapa: ${reservationResult.stage}.`
            : reservationResult.message,
        );
        return;
      }
      reservation = reservationResult;

      stage = "storage";
      setPhase("uploading");
      setMessage("Enviando mídia...");
      const upload = await getSupabaseBrowserClient().storage
        .from(reservation.reservation.bucket)
        .upload(reservation.reservation.path, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });
      if (upload.error) {
        logUploadFailure("storage", upload.error);
        await cancelReservation();
        setPhase("error");
        setMessage("Não foi possível enviar a mídia. Tente novamente.");
        return;
      }

      stage = "finalize";
      setPhase("finalizing");
      setMessage("Finalizando envio...");
      const finalized = await finalizePropertyMediaUploadAction({
        propertyId,
        mediaId: reservation.reservation.mediaId,
        path: reservation.reservation.path,
      });
      if (finalized.status === "error") {
        await cancelReservation();
        setPhase("error");
        setMessage(finalized.message);
        return;
      }

      setPhase("success");
      setMessage(finalized.message);
      router.refresh();
    } catch (error) {
      logUploadFailure(stage, error);
      if (reservation) await cancelReservation();
      setPhase("error");
      setMessage(
        stage === "reserve"
          ? "Não foi possível preparar a mídia. Atualize a página e tente novamente."
          : "Não foi possível concluir o envio. Tente novamente.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={fileContract.mimeTypes.join(",")}
        disabled={!enabled || busy}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={!enabled || busy}
        title={enabled ? `Aceita ${fileContract.ruleLabel}` : "A migration de upload seguro ainda não está ativa neste ambiente."}
        onClick={() => inputRef.current?.click()}
        className="w-fit rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-2 text-[0.72rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Enviando..." : "Adicionar mídia"}
      </button>
      {phase !== "idle" ? (
        <div aria-live="polite" className="flex flex-col gap-1.5">
          <progress className="h-1.5 w-full accent-[rgb(var(--imob-ice))]" max={100} value={PHASE_PROGRESS[phase]} />
          <p className={phase === "error" ? "text-[0.68rem] text-red-300" : "text-[0.68rem] text-[var(--yzi-text-faint)]"}>
            {message}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function PropertyMediaPreview({ media }: { media: PropertyPublicationMedia }) {
  const [temporaryUrl, setTemporaryUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadPreview() {
    if (!media.storageBucket || !media.storagePath || media.uploadState !== "completed") return;
    setLoading(true);
    const result = await getSupabaseBrowserClient().storage
      .from(media.storageBucket)
      .createSignedUrl(media.storagePath, 120);
    setLoading(false);
    if (!result.error) setTemporaryUrl(result.data.signedUrl);
  }

  if (!media.storageBucket || !media.storagePath || media.uploadState !== "completed") return null;
  if (!temporaryUrl) {
    return (
      <button
        type="button"
        onClick={() => void loadPreview()}
        disabled={loading}
        className="mt-3 text-left text-[0.68rem] text-[rgb(var(--imob-ice))] disabled:opacity-60"
      >
        {loading ? "Criando acesso temporário..." : "Carregar prévia privada (2 min)"}
      </button>
    );
  }
  if (media.mediaType === "image") {
    return (
      <div
        role="img"
        aria-label={media.altText ?? media.originalFilename ?? "Prévia da mídia do imóvel"}
        className="mt-3 aspect-video w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-cover bg-center"
        style={{ backgroundImage: `url(${JSON.stringify(temporaryUrl)})` }}
      />
    );
  }
  if (media.mediaType === "video") {
    return <video className="mt-3 w-full rounded-[var(--yzi-radius-sm)]" controls preload="metadata" src={temporaryUrl} />;
  }
  return (
    <a className="mt-3 inline-flex text-[0.68rem] text-[rgb(var(--imob-ice))]" href={temporaryUrl} target="_blank" rel="noreferrer">
      Abrir PDF em acesso temporário
    </a>
  );
}

export function PropertyMediaCoverControl({
  propertyId,
  media,
  enabled,
}: {
  propertyId: string;
  media: PropertyPublicationMedia;
  enabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const allowed =
    enabled &&
    media.mediaType === "image" &&
    media.mediaStatus === "approved" &&
    media.processingStatus === "ready" &&
    media.isPublicationAllowed &&
    media.uploadState === "completed" &&
    !media.isPrimary;

  return (
    <div>
      <button
        type="button"
        disabled={!allowed || pending}
        title={allowed ? "Define esta imagem aprovada como capa e registra o evento de governança." : "A capa exige uma imagem aprovada e liberada por governança."}
        onClick={() => {
          startTransition(async () => {
            const result = await setPropertyMediaCoverAction({ propertyId, mediaId: media.id });
            setMessage(result.message);
            if (result.status === "ok") router.refresh();
          });
        }}
        className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-2.5 py-1.5 text-[0.68rem] text-[var(--yzi-text-secondary)] disabled:cursor-not-allowed disabled:text-[var(--yzi-text-faint)] disabled:opacity-70"
      >
        {media.isPrimary ? "Capa atual" : pending ? "Definindo..." : "Definir capa"}
      </button>
      {message ? <p className="mt-1 text-[0.65rem] text-[var(--yzi-text-faint)]">{message}</p> : null}
    </div>
  );
}
