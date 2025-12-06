"use client";

import { useAuthGuard } from "../../hooks/useAuthGuard";
import { AppHeader } from "../../components/app/AppHeader";
import { Loader } from "../../components/ui/Loader";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checking, isAuthenticated } = useAuthGuard();

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--background)">
        <div className="flex flex-col items-center gap-4">
          <Loader size={32} />
          <p className="text-sm text-(--muted)">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      <AppHeader />
      {children}
    </div>
  );
}
