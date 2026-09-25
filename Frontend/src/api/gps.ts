/**
 * GPS Telemetry API service function calling FastAPI REST endpoints.
 * Interacts with:
 * - GET /gps/{bus_id}
 */

import { apiRequest, ApiResponse } from './client';
import { GPSData } from '../types/gps';

/**
 * Fetch real-time GPS coordinate telemetry for a specific bus.
 * Endpoint: GET /gps/{bus_id}
 */
export async function getBusGps(busId: string): Promise<ApiResponse<GPSData>> {
  const endpoint = `/gps/${encodeURIComponent(busId)}`;
  return apiRequest<GPSData>(endpoint);
}

export const getGPS = getBusGps;
