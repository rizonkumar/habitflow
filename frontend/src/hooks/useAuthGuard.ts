import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth";

export const useAuthGuard = () => {
  const router = useRouter();
  const { token, user, status, loadCurrentUser } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const ensure = async () => {
      if (!token) {
        router.replace("/login");
        return;
      }
      if (!user && status !== "loading") {
        await loadCurrentUser();
      }
    };
    ensure().finally(() => setChecking(false));
  }, [token, user, status, loadCurrentUser, router]);

  const isAuthenticated = Boolean(token && (user || status === "authenticated"));
  return { isAuthenticated, checking };
};

