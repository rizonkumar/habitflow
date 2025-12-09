"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSidebarCollapsed } from "./AppShell";

type TooltipProps = {
  children: ReactNode;
  targetRef: React.RefObject<HTMLElement | null>;
  show: boolean;
};

function Tooltip({ children, targetRef, show }: TooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!show || !targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    setPosition({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  }, [show, targetRef]);

  if (!mounted || !show) return null;

  return createPortal(
    <div
      className="fixed z-[99999] pointer-events-none -translate-y-1/2"
      style={{ top: position.top, left: position.left }}
    >
      {children}
    </div>,
    document.body
  );
}

type SidebarItemProps = {
  icon: ReactNode;
  label: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  activeClassName?: string;
  inactiveClassName?: string;
};

export function SidebarItem({
  icon,
  label,
  count,
  isActive,
  onClick,
  activeClassName = "bg-gradient-to-r from-(--primary)/15 to-(--primary)/5 text-(--primary) shadow-sm",
  inactiveClassName = "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)",
}: SidebarItemProps) {
  const { isCollapsed } = useSidebarCollapsed();
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={() => isCollapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center w-full rounded-xl transition-all ${
          isCollapsed
            ? "justify-center px-2 py-2.5"
            : "justify-between px-3 py-2.5"
        } text-sm font-medium ${isActive ? activeClassName : inactiveClassName}`}
      >
        <span className={`flex items-center ${isCollapsed ? "" : "gap-2.5"}`}>
          <span className="shrink-0">{icon}</span>
          {!isCollapsed && <span className="truncate">{label}</span>}
        </span>
        {!isCollapsed && count !== undefined && (
          <span className="text-xs font-medium bg-(--secondary) px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </button>
      <Tooltip targetRef={buttonRef} show={isCollapsed && showTooltip}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--foreground) text-(--background) text-xs font-medium whitespace-nowrap shadow-xl">
          {label}
          {count !== undefined && (
            <span className="px-1.5 py-0.5 rounded bg-(--background)/20">
              {count}
            </span>
          )}
        </div>
      </Tooltip>
    </div>
  );
}

type SidebarSectionProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
};

export function SidebarSection({ title, children, action }: SidebarSectionProps) {
  const { isCollapsed } = useSidebarCollapsed();

  if (isCollapsed) {
    return <div className="space-y-1 py-2 border-b border-(--border) last:border-b-0">{children}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
          {title}
        </h3>
        {action}
      </div>
      <nav className="space-y-1">{children}</nav>
    </div>
  );
}

type SidebarButtonProps = {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "default";
};

export function SidebarButton({
  icon,
  label,
  onClick,
  variant = "primary",
}: SidebarButtonProps) {
  const { isCollapsed } = useSidebarCollapsed();
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const baseStyles =
    variant === "primary"
      ? "bg-gradient-to-r from-(--primary) to-blue-600 text-(--primary-foreground) shadow-lg shadow-(--primary)/25 hover:shadow-xl hover:shadow-(--primary)/30 hover:scale-[1.02] active:scale-[0.98]"
      : "border border-(--border) text-(--foreground) hover:bg-(--card-hover)";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={() => isCollapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`group flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all ${baseStyles}`}
      >
        <span className="transition-transform group-hover:rotate-90 shrink-0">{icon}</span>
        {!isCollapsed && label}
      </button>
      <Tooltip targetRef={buttonRef} show={isCollapsed && showTooltip}>
        <div className="px-3 py-1.5 rounded-lg bg-(--foreground) text-(--background) text-xs font-medium whitespace-nowrap shadow-xl">
          {label}
        </div>
      </Tooltip>
    </div>
  );
}

type SidebarInputProps = {
  icon: ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function SidebarInput({ icon, placeholder, value, onChange }: SidebarInputProps) {
  const { isCollapsed } = useSidebarCollapsed();
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (isCollapsed) {
    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="flex items-center justify-center w-full p-2.5 rounded-xl border border-(--input-border) bg-(--input) text-(--muted)"
        >
          {icon}
        </button>
        <Tooltip targetRef={buttonRef} show={showTooltip}>
          <div className="px-3 py-1.5 rounded-lg bg-(--foreground) text-(--background) text-xs font-medium whitespace-nowrap shadow-xl">
            {placeholder}
          </div>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">
        {icon}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-(--input-border) bg-(--input) pl-9 pr-3 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20 transition-all"
      />
    </div>
  );
}