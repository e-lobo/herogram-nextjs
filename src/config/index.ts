interface Config {
  apiUrl: string;
  jwtCookieName: string;
  cookieMaxAge: number;
}

export const config: Config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  jwtCookieName: process.env.JWT_COOKIE_NAME || "jwt",
  cookieMaxAge: Number(process.env.COOKIE_MAX_AGE) || 86400, // 24 hours in seconds
} as const;
