/**
 * Exact schema for Traffic Density telemetry returned by FastAPI /api/traffic/density.
 */

export interface HourlyTrafficDensityPoint {
  hour: string;
  density: number;
  label?: string | null;
  isPeak?: boolean;
}

export interface DailyTrafficDensityPoint {
  date: string;
  day: string;
  average_vehicle_count: number;
  traffic_level: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  event_count: number;
}

export interface TrafficDensity {
  period: '24h' | '7d';
  data: (HourlyTrafficDensityPoint | DailyTrafficDensityPoint)[];
  high_percentage?: number;
  medium_percentage?: number;
  low_percentage?: number;
  average_speed_kmh?: number;
  speed_change_kmh?: number;
  total_events?: number;
  corridor_average_vehicles_per_min?: number;
}

export type TrafficDensityResponse = TrafficDensity;
