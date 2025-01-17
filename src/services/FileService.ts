import { config } from "@/config";
import { getToken } from "@/utils/auth";
import { ApiErrorInterface, FetchFilesResponse, ShareStatsResponse } from "@/types/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

class FileService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    // check for delete response
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return {} as T;
    }
    if (!response.ok) {
      return {} as T; // Return an empty object or a suitable default value
    }
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
    const token = getToken();
    try {
      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
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

  static async fetchFiles(): Promise<FetchFilesResponse> {
    return this.fetchApi<FetchFilesResponse>("/files/my-files", {
      method: "GET",
    });
  }

  static async uploadFile(file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);

    await fetch(`${config.apiUrl}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });
  }

  static async deleteFile(fileId: string): Promise<void> {
    return this.fetchApi<void>(`/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  }

  static async createShareLink(fileId: string): Promise<{ data: { url: string } }> {
    return this.fetchApi(`/files/share/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, expirationHours: 1 }),
    });
  }
  
  static async getShareStats(fileId: string): Promise<ShareStatsResponse> {
    return this.fetchApi(`/files/share-stats/${fileId}`, {
      method: "GET",
    });
  }
}

export default FileService;
