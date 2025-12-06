"use client";

import { Loader2 } from "lucide-react";

type LoaderProps = {
  label?: string;
  size?: number;
};

export const Loader = ({ label, size = 20 }: LoaderProps) => (
  <div className="flex items-center gap-2 text-zinc-700">
    <Loader2 className="animate-spin" size={size} />
    {label ? <span className="text-sm">{label}</span> : null}
  </div>
);

