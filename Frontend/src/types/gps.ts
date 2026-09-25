/**
 * Exact schema for GPS fix data from FastAPI /gps/{bus_id}.
 */

export interface GPSData {
  bus_id: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: string | null;
  speed_kmh?: number | null;
  heading_deg?: number | null;
  altitude_m?: number | null;
  accuracy_m?: number | null;
}

export type BusGpsFix = GPSData;
