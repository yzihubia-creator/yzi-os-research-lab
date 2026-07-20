const WHATSAPP_CHANNEL = "whatsapp";

export function conversationChannelLabel(channel: string): string {
  return channel === WHATSAPP_CHANNEL ? "WhatsApp" : channel;
}

export function maskExternalSenderId(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 4 && digits.length >= trimmed.length / 2) {
    return `final ${digits.slice(-4)}`;
  }

  if (trimmed.includes("@")) {
    const [local, domain] = trimmed.split("@");
    const domainTail = domain ? domain.split(".").slice(-2).join(".") : "identidade externa";
    const localTail = local ? local.slice(-2).padStart(Math.min(local.length, 2), "*") : "**";
    return `final ${localTail}@${domainTail}`;
  }

  if (trimmed.length <= 4) return `final ${trimmed}`;
  return `final ${trimmed.slice(-4)}`;
}
