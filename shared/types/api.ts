export interface ApiResponse<T = unknown> {
  data: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiError {
  error: string;
  code?: string;
}
