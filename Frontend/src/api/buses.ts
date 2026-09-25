/**
 * Bus Fleet API service functions calling FastAPI REST endpoints.
 * Interacts with:
 * - GET /api/buses
 */

import { apiRequest, ApiResponse } from './client';
import { Bus } from '../types/buses';

/**
 * Fetch all registered buses and their latest operational status.
 * Endpoint: GET /api/buses
 */
export async function getBuses(): Promise<ApiResponse<Bus[]>> {
  return apiRequest<Bus[]>('/api/buses');
}
