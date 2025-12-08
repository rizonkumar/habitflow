import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth";

export const useAuthGuard = () => {
  const router = useRouter();
  const { token, user, status, loadCurrentUser } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const ensure = async () => {
      await loadCurrentUser();
      const stillNoToken = !useAuthStore.getState().token;
      if (stillNoToken) {
        router.replace("/login");
      }
    };
    ensure().finally(() => setChecking(false));
  }, [loadCurrentUser, router]);

  const isAuthenticated = Boolean(
    token && (user || status === "authenticated")
  );
  return { isAuthenticated, checking };
};
