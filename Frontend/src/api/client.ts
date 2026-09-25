/**
 * Centralized API client for communicating with FastAPI REST backend.
 *
 * Architecture:
 * React + TypeScript -> Central API Service -> FastAPI -> Supabase PostgreSQL & Storage
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isFallback: boolean;
}

/**
 * Generic request runner against FastAPI REST endpoints.
 * Returns genuine response from the FastAPI service.
 * Never silently substitutes fake operational data.
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorDetail = `FastAPI error: HTTP ${res.status} ${res.statusText}`;
      return {
        data: null,
        error: errorDetail,
        isFallback: false
      };
    }

    const json = await res.json();
    return {
      data: json as T,
      error: null,
      isFallback: false
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : 'Unable to connect to BusVision API';
    return {
      data: null,
      error: message.includes('abort') 
        ? 'Connection timeout: BusVision API took too long to respond' 
        : 'Unable to connect to BusVision API',
      isFallback: false
    };
  }
}
