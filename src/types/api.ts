export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  status: "success" | "error";
  data: {
    user: User;
    token: string;
  };
}

export interface ApiErrorInterface {
  status: "error";
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest extends LoginRequest {
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface FileResponse {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  folder: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy: string;
}

export interface FetchFilesResponse {
  status: "success" | "error";
  data: FileResponse[];
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
}

export interface ShareStats {
  id: string;
  url: string;
  expiresAt: string | null;
  statistics: {
    totalViews: number;
    uniqueViews: number;
    lastViewedAt: string | null;
    isExpired: boolean;
  };
}

export interface ShareStatsResponse {
  status: "success" | "error";
  data: ShareStats[];
}

export type UserResponse = ApiResponse<User>;
export type FilesResponse = ApiResponse<File[]>;
