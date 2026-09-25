/**
 * Exact schema for BusVision event entities returned by FastAPI / Supabase PostgreSQL.
 * Matches real backend models for TRAFFIC and POTHOLE events without modification.
 */

export interface TrafficEvent {
  event_type: 'TRAFFIC';
  bus_id: string;

  vehicle_count: number;
  average_vehicle_count: number;
  traffic_level: 'HIGH' | 'MEDIUM' | 'LOW' | string;

  latitude: number | null;
  longitude: number | null;

  location_name?: string | null;
  road_name?: string | null;
  neighbourhood?: string | null;
  suburb?: string | null;
  city?: string | null;
  state?: string | null;
  postcode?: string | null;

  timestamp: string | null;
  status: string;
}

export interface PotholeEvent {
  event_type: 'POTHOLE';
  bus_id: string;
  pothole_id: string | number;
  confidence: number | null;
  size_category: string;

  width_px?: number | null;
  height_px?: number | null;
  area_px?: number | null;
  area_percent?: number | null;

  latitude: number | null;
  longitude: number | null;
  timestamp: string | null;

  location_name?: string | null;
  road_name?: string | null;
  neighbourhood?: string | null;
  suburb?: string | null;
  city?: string | null;
  state?: string | null;
  postcode?: string | null;

  snapshot_path: string | null;
  crop_path: string | null;
  status: string;
}
export interface RoadIncidentEvent {
  event_type: 'ROAD_INCIDENT';
  bus_id?: string;
  incident_id?: string;
  incident_type?: string;
  severity?: 'High' | 'Medium' | 'Low' | string;
  latitude: number | null;
  longitude: number | null;
  timestamp: string | null;
  description?: string;
  confidence?: number | null;
  status: string;
}

export type RoadIncident = RoadIncidentEvent;

export type BusVisionEvent = TrafficEvent | PotholeEvent | RoadIncidentEvent;

export interface EventQueryParams {
  event_type?: 'POTHOLE' | 'TRAFFIC' | 'ROAD_INCIDENT';
  limit?: number;
  status?: string;
  bus_id?: string;
}
