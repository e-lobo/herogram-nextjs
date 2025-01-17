import { config } from "@/config";
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  ApiErrorInterface,
} from "@/types/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

class AuthService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = (await response.json()) as ApiErrorInterface;
      throw new ApiError(response.status, error.message || "An error occurred");
    }
    return response.json() as Promise<T>;
  }

  private static async fetchApi<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Network error occurred");
    }
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    return this.fetchApi<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.fetchApi<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export default AuthService;
