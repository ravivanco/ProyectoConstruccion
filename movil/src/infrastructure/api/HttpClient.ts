const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error { constructor(message: string, readonly status: number) { super(message); } }

export class HttpClient {
  private token?: string;
  setToken(token: string) { this.token = token; }
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}), ...options.headers } });
    const body: { message?: string } = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(body.message ?? 'No se pudo completar la solicitud.', response.status);
    return body as T;
  }
}
