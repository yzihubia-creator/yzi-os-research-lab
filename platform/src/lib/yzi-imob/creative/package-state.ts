import type { CreativeDeliverable } from "./types.ts";

export type CreativePackageState =
  | "preparing"
  | "partially_ready"
  | "awaiting_approval"
  | "changes_requested"
  | "approved"
  | "partially_failed"
  | "failed";

export function deriveCreativePackageState(
  deliverables: readonly Pick<CreativeDeliverable, "status">[],
): CreativePackageState {
  if (!deliverables.length) {
    return "preparing";
  }
  const statuses = deliverables.map((item) => item.status);
  const terminalFailure = (status: CreativeDeliverable["status"]) =>
    ["failed", "rejected", "cancelled"].includes(status);
  if (statuses.every(terminalFailure)) return "failed";
  if (statuses.some(terminalFailure)) return "partially_failed";
  if (statuses.includes("changes_requested")) return "changes_requested";
  if (statuses.every((status) => status === "approved")) return "approved";
  if (
    statuses.every((status) => ["approved", "in_review"].includes(status)) &&
    statuses.includes("in_review")
  ) {
    return "awaiting_approval";
  }
  if (statuses.every((status) => ["planned", "generating"].includes(status))) {
    return "preparing";
  }
  return "partially_ready";
}
