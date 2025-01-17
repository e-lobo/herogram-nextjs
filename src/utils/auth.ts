import { config } from "@/config";
import type { User } from "@/types/api";

export const setToken = (token: string): void => {
  document.cookie = `${config.jwtCookieName}=${token}; path=/; max-age=${config.cookieMaxAge}; SameSite=Lax; Secure`;
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const match = document.cookie.match(
    new RegExp(`${config.jwtCookieName}=([^;]+)`)
  );
  return match ? match[1] : null;
};

export const removeToken = (): void => {
  document.cookie = `${config.jwtCookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Parse JWT payload
export const parseJwt = (token: string): User | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));
    return payload as User;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return null;
  }
};
