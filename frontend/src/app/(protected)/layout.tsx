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
      <div className="flex min-h-screen items-center justify-center text-zinc-700">
        <Loader label="Loading workspace..." size={28} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
