/**
 * Traffic density API service functions calling FastAPI REST endpoints.
 * Interacts with:
 * - GET /api/traffic/density?period=24h
 * - GET /api/traffic/density?period=7d
 */

import { apiRequest, ApiResponse } from './client';
import { TrafficDensity } from '../types/traffic';

/**
 * Fetch traffic density timeseries and peak distribution.
 * Endpoint: GET /api/traffic/density?period=24h | 7d
 */
export async function getTrafficDensity(period: '24h' | '7d'): Promise<ApiResponse<TrafficDensity>> {
  const endpoint = `/api/traffic/density?period=${encodeURIComponent(period)}`;
  return apiRequest<TrafficDensity>(endpoint);
}
