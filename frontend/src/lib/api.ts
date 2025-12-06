const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
};

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = "GET", body, token } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    /* ignore */
  }

  if (!response.ok) {
    const errorData =
      (data as { error?: { message?: string }; message?: string }) || {};
    const message =
      errorData.error?.message || errorData.message || "Request failed";
    throw new Error(message);
  }

  return data as T;
};
