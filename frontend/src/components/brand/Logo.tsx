"use client";

import { useId } from "react";
import React from "react";

export function LogoMark({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id}-g)`} />
      <path d="M8 18c2.6-4 6-6.5 8.5-10.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
      <path d="M10 24c2.8-4.2 6.8-7.2 11.5-13" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <circle cx="8" cy="18" r="1.6" fill="#fff" />
      <circle cx="20" cy="8" r="1.4" fill="#fff" />
      <circle cx="26" cy="12" r="1.2" fill="#fff" />
    </svg>
  );
}

export function Logo({
  size = 20,
  withText = true,
  className = "",
  textClassName = "",
}: {
  size?: number;
  withText?: boolean;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {withText && (
        <span className={`font-semibold tracking-tight ${textClassName}`}>HabitFlow</span>
      )}
    </span>
  );
}

export default Logo;
