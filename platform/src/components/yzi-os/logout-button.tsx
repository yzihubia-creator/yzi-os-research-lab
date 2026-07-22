"use client";

import { LogoutIcon } from "@/components/yzi-os/yzi-icons";
import { YziButton } from "@/components/yzi-os/yzi-primitives";

export function LogoutButton({
  className = "",
  label = "Sair",
  iconOnly = false,
}: {
  className?: string;
  label?: string;
  iconOnly?: boolean;
}) {
  function handleLogout() {
    window.location.assign("/auth/logout");
  }

  if (iconOnly) {
    return (
      <YziButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        title={label}
        aria-label={label}
        className={`h-9 w-9 p-0 ${className}`}
      >
        <LogoutIcon className="h-4.5 w-4.5" />
      </YziButton>
    );
  }

  return (
    <YziButton
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className={className}
    >
      <LogoutIcon className="h-3.5 w-3.5" />
      {label}
    </YziButton>
  );
}
