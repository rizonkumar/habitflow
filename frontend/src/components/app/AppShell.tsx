"use client";

import { ReactNode } from "react";

type AppShellProps = {
  sidebar?: ReactNode;
  children: ReactNode;
};

export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {sidebar && (
        <aside className="hidden lg:flex lg:flex-col w-64 border-r border-(--border) bg-(--card) h-full shrink-0">
          <div className="flex-1 p-4 overflow-y-auto">{sidebar}</div>
        </aside>
      )}

      <main className="flex-1 overflow-y-auto h-full">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
