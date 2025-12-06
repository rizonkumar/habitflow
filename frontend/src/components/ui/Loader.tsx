"use client";

import { Loader2 } from "lucide-react";

type LoaderProps = {
  label?: string;
  size?: number;
};

export const Loader = ({ label, size = 20 }: LoaderProps) => (
  <div className="flex items-center gap-3 text-(--foreground)">
    <Loader2 className="animate-spin text-(--primary)" size={size} />
    {label ? <span className="text-sm text-(--muted)">{label}</span> : null}
  </div>
);

