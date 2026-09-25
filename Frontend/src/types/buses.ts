/**
 * Exact schema for Bus fleet telemetry entities from FastAPI /api/buses.
 */

export interface Bus {
  bus_id: string;
  status: 'ACTIVE' | 'STANDBY' | 'MAINTENANCE' | 'LIVE' | string;
  route?: string | null;
  latitude: number | null;
  longitude: number | null;
  last_update: string | null;
  vehicle_count?: number | null;
  traffic_level?: 'HIGH' | 'MEDIUM' | 'LOW' | string | null;
  speed_kmh?: number | null;
}

export type BusSummary = Bus;
