export type AlertSeverity = 'High' | 'Medium' | 'Low';
export type DetectionStatus = 'New' | 'Processed' | 'Verified';
export type EventType = 'Pothole' | 'Traffic' | 'Road Incident';

// Export all 6 primary schema types explicitly required:
export type { TrafficEvent, PotholeEvent, RoadIncident, BusVisionEvent, EventQueryParams } from './events';
export type { Bus, BusSummary } from './buses';
export type { GPSData, BusGpsFix } from './gps';
export type { TrafficDensity, TrafficDensityResponse, HourlyTrafficDensityPoint, DailyTrafficDensityPoint } from './traffic';

export interface AlertItem {
  id: string;
  title: string;
  location: string;
  time: string;
  severity: AlertSeverity;
  type: EventType;
  busId?: string;
  coords?: [number, number];
}

export interface DetectionItem {
  id: string;
  event: EventType;
  locationTitle: string;
  locationSub: string;
  busId: string;
  time: string;
  confidence: number;
  severity: AlertSeverity;
  status: DetectionStatus;
  evidenceUrl?: string;
  altText: string;
  details?: {
    coordinates?: string;
    speedKmH?: number;
    depthMm?: number;
    areaSqM?: number;
    lane?: string;
    recommendedAction?: string;
  };
}

export interface BusVehicle {
  id: string;
  label: string;
  route: string;
  lat: number;
  lng: number;
  cx: number;
  cy: number;
  status: 'LIVE' | 'STANDBY' | 'MAINTENANCE';
  sector: string;
  gps: string;
  lastUpdate: string;
  vehicleCount: number;
  trafficLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  latestEvent: string;
  speed: string;
}

export interface TrafficHourlyStat {
  hour: string;
  density: number;
  label?: string;
  isPeak?: boolean;
}

export interface TrafficDailyStat {
  date: string;
  day: string;
  average_vehicle_count: number;
  traffic_level: 'HIGH' | 'MEDIUM' | 'LOW';
  event_count: number;
  cx: number;
  cy: number;
}
