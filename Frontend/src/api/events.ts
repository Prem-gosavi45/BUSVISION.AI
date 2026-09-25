/**
 * Event telemetry API service functions calling FastAPI REST endpoints.
 * Interacts with:
 * - GET /api/events
 * - GET /api/events/latest
 * - GET /api/events?event_type=POTHOLE
 * - GET /api/events?event_type=TRAFFIC
 */

import { apiRequest, ApiResponse } from './client';
import { BusVisionEvent, PotholeEvent, TrafficEvent, RoadIncidentEvent, EventQueryParams } from '../types/events';

/**
 * Fetch all events or filtered by query parameters.
 * Endpoint: GET /api/events
 */
export async function getEvents(params?: EventQueryParams): Promise<ApiResponse<BusVisionEvent[]>> {
  const query = new URLSearchParams();
  if (params?.event_type) query.set('event_type', params.event_type);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  if (params?.bus_id) query.set('bus_id', params.bus_id);

  const qs = query.toString();
  const endpoint = `/api/events${qs ? `?${qs}` : ''}`;

  return apiRequest<BusVisionEvent[]>(endpoint);
}

/**
 * Fetch latest high-priority telemetry alerts and detections.
 * Endpoint: GET /api/events/latest
 */
export async function getLatestEvents(): Promise<ApiResponse<BusVisionEvent[]>> {
  return apiRequest<BusVisionEvent[]>('/api/events/latest');
}

/**
 * Fetch specifically pothole events for Road Infrastructure.
 * Endpoint: GET /api/events?event_type=POTHOLE
 */
export async function getPotholeEvents(limit?: number): Promise<ApiResponse<PotholeEvent[]>> {
  const endpoint = `/api/events?event_type=POTHOLE${limit ? `&limit=${limit}` : ''}`;
  return apiRequest<PotholeEvent[]>(endpoint);
}

/**
 * Fetch specifically traffic density & congestion events.
 * Endpoint: GET /api/events?event_type=TRAFFIC
 */
export async function getTrafficEvents(limit?: number): Promise<ApiResponse<TrafficEvent[]>> {
  const endpoint = `/api/events?event_type=TRAFFIC${limit ? `&limit=${limit}` : ''}`;
  return apiRequest<TrafficEvent[]>(endpoint);
}

/**
 * Fetch specifically road incident events.
 * Endpoint: GET /api/events?event_type=ROAD_INCIDENT
 */
export async function getRoadIncidentEvents(limit?: number): Promise<ApiResponse<RoadIncidentEvent[]>> {
  const endpoint = `/api/events?event_type=ROAD_INCIDENT${limit ? `&limit=${limit}` : ''}`;
  return apiRequest<RoadIncidentEvent[]>(endpoint);
}
