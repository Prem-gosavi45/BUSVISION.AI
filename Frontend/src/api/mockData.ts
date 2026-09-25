/**
 * TEMPORARY DEMO / MOCK DATA
 *
 * NOTE: Kept isolated here so it can be completely discarded once the
 * live FastAPI + Supabase backend is reachable.
 */

import { TrafficEvent, PotholeEvent, BusVisionEvent } from '../types/events';
import { BusSummary } from '../types/buses';
import { BusGpsFix } from '../types/gps';
import { TrafficDensityResponse } from '../types/traffic';

export const mockPotholeEvents: PotholeEvent[] = [
  {
    event_type: 'POTHOLE',
    bus_id: 'BUS_101',
    pothole_id: 'POTH-FC-2026-001',
    confidence: 0.84,
    size_category: 'CRITICAL',
    width_px: 142,
    height_px: 88,
    area_px: 12496,
    area_percent: 4.8,
    latitude: 18.503079,
    longitude: 73.773163,
    timestamp: '2026-09-23T10:28:12+05:30',
    snapshot_path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5_ilTze65qa8xcAJsAcJecXRZwWkwYCligU51_z5OxAi4KmLQMhbSD9GWwG8NAd_zTPUovAsOJEqDr3ak0Cyoj8CyEopVAfwUpL3bKZ86BSNyMagU5jgEe9gWlvdtAMxtunJTRcrQn-MuWErKvVVKxNiQmBqjf8nkxdlPQYnMQNw1e55y8FpDAMLO9XLgWlMlVZcNofwrRGB0xyBnx6xd3SyA3OEDqfLt3reyGB2djENS_lza_PCZag',
    crop_path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5_ilTze65qa8xcAJsAcJecXRZwWkwYCligU51_z5OxAi4KmLQMhbSD9GWwG8NAd_zTPUovAsOJEqDr3ak0Cyoj8CyEopVAfwUpL3bKZ86BSNyMagU5jgEe9gWlvdtAMxtunJTRcrQn-MuWErKvVVKxNiQmBqjf8nkxdlPQYnMQNw1e55y8FpDAMLO9XLgWlMlVZcNofwrRGB0xyBnx6xd3SyA3OEDqfLt3reyGB2djENS_lza_PCZag',
    status: 'New'
  },
  {
    event_type: 'POTHOLE',
    bus_id: 'BUS_115',
    pothole_id: 'POTH-PAUD-2026-018',
    confidence: 0.91,
    size_category: 'LARGE',
    width_px: 195,
    height_px: 130,
    area_px: 25350,
    area_percent: 7.2,
    latitude: 18.507421,
    longitude: 73.806815,
    timestamp: '2026-09-23T10:15:02+05:30',
    snapshot_path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUjz7t3SuNeZpALiTvc3I8YmH7KMRXC7AwkQOJl1FwDuyTtzhPfe0fu86KWUYbnHCJF4HN_xPLXnwQy1CJnw06bR8yp7d-J8799hoLw9VT8ogswZgA2q4nBZGBHfQz3mLm7wfhuvfPwvF6Muhxj6wsiZyOZPcNEgSuhdCunsbozGB2x83hvXcvhDd6UThyXL5QgYRjYa3dlSuOVI-r-SYJgidnD5fNjLlKI147K3cSwtL6kDCIcwq80A',
    crop_path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUjz7t3SuNeZpALiTvc3I8YmH7KMRXC7AwkQOJl1FwDuyTtzhPfe0fu86KWUYbnHCJF4HN_xPLXnwQy1CJnw06bR8yp7d-J8799hoLw9VT8ogswZgA2q4nBZGBHfQz3mLm7wfhuvfPwvF6Muhxj6wsiZyOZPcNEgSuhdCunsbozGB2x83hvXcvhDd6UThyXL5QgYRjYa3dlSuOVI-r-SYJgidnD5fNjLlKI147K3cSwtL6kDCIcwq80A',
    status: 'Verified'
  },
  {
    event_type: 'POTHOLE',
    bus_id: 'BUS_104',
    pothole_id: 'POTH-KARVE-2026-004',
    confidence: 0.68,
    size_category: 'MEDIUM',
    width_px: 90,
    height_px: 65,
    area_px: 5850,
    area_percent: 2.1,
    latitude: 18.50124,
    longitude: 73.81245,
    timestamp: '2026-09-23T10:14:18+05:30',
    snapshot_path: null, // Test safe null handling
    crop_path: null,
    status: 'Processed'
  }
];

export const mockTrafficEvents: TrafficEvent[] = [
  {
    event_type: 'TRAFFIC',
    bus_id: 'BUS_101',
    vehicle_count: 29,
    average_vehicle_count: 26.5,
    traffic_level: 'HIGH',
    latitude: 18.517342,
    longitude: 73.844118,
    timestamp: '2026-09-23T10:25:00+05:30',
    status: 'Processed'
  },
  {
    event_type: 'TRAFFIC',
    bus_id: 'BUS_107',
    vehicle_count: 34,
    average_vehicle_count: 28.0,
    traffic_level: 'HIGH',
    latitude: 18.55831,
    longitude: 73.914221,
    timestamp: '2026-09-23T10:21:40+05:30',
    status: 'Processed'
  },
  {
    event_type: 'TRAFFIC',
    bus_id: 'BUS_104',
    vehicle_count: 14,
    average_vehicle_count: 18.2,
    traffic_level: 'MEDIUM',
    latitude: 18.4988,
    longitude: 73.8582,
    timestamp: '2026-09-23T10:08:22+05:30',
    status: 'Active'
  },
  {
    event_type: 'TRAFFIC',
    bus_id: 'BUS_112',
    vehicle_count: 8,
    average_vehicle_count: 12.0,
    traffic_level: 'LOW',
    latitude: null, // Test safe null handling
    longitude: null,
    timestamp: '2026-09-23T10:05:00+05:30',
    status: 'Nominal'
  }
];

export const mockAllEvents: BusVisionEvent[] = [
  ...mockPotholeEvents,
  ...mockTrafficEvents
];

export const mockBuses: BusSummary[] = [
  {
    bus_id: 'BUS_101',
    status: 'LIVE',
    route: 'Route 12 - Katraj to Shivajinagar',
    latitude: 18.503079,
    longitude: 73.773163,
    last_update: '10:28:12 AM IST',
    vehicle_count: 29,
    traffic_level: 'HIGH',
    speed_kmh: 16.8
  },
  {
    bus_id: 'BUS_104',
    status: 'LIVE',
    route: 'Route 7 - Kothrud to Pune Station',
    latitude: 18.514512,
    longitude: 73.842104,
    last_update: '10:27:45 AM IST',
    vehicle_count: 21,
    traffic_level: 'MEDIUM',
    speed_kmh: 22.4
  },
  {
    bus_id: 'BUS_107',
    status: 'LIVE',
    route: 'Route 16 - Swargate to Viman Nagar',
    latitude: 18.55831,
    longitude: 73.914221,
    last_update: '10:25:30 AM IST',
    vehicle_count: 34,
    traffic_level: 'HIGH',
    speed_kmh: 12.6
  },
  {
    bus_id: 'BUS_112',
    status: 'LIVE',
    route: 'Route 24 - Pune Station to Viman Nagar',
    latitude: 18.536209,
    longitude: 73.87912,
    last_update: '10:26:50 AM IST',
    vehicle_count: 18,
    traffic_level: 'LOW',
    speed_kmh: 31.2
  },
  {
    bus_id: 'BUS_115',
    status: 'LIVE',
    route: 'Route 9 - Paud Road to Deccan',
    latitude: 18.507421,
    longitude: 73.806815,
    last_update: '10:15:02 AM IST',
    vehicle_count: 16,
    traffic_level: 'MEDIUM',
    speed_kmh: 24.0
  }
];

export const mockGpsData: Record<string, BusGpsFix> = {
  BUS_101: {
    bus_id: 'BUS_101',
    latitude: 18.503079,
    longitude: 73.773163,
    timestamp: '2026-09-23T10:28:12+05:30',
    speed_kmh: 16.8,
    heading_deg: 58.4,
    altitude_m: 560.2,
    accuracy_m: 1.8
  },
  BUS_104: {
    bus_id: 'BUS_104',
    latitude: 18.514512,
    longitude: 73.842104,
    timestamp: '2026-09-23T10:27:45+05:30',
    speed_kmh: 22.4,
    heading_deg: 120.0,
    altitude_m: 554.0,
    accuracy_m: 2.1
  },
  BUS_107: {
    bus_id: 'BUS_107',
    latitude: 18.55831,
    longitude: 73.914221,
    timestamp: '2026-09-23T10:25:30+05:30',
    speed_kmh: 12.6,
    heading_deg: 82.5,
    altitude_m: 570.1,
    accuracy_m: 1.5
  },
  BUS_112: {
    bus_id: 'BUS_112',
    latitude: 18.536209,
    longitude: 73.87912,
    timestamp: '2026-09-23T10:26:50+05:30',
    speed_kmh: 31.2,
    heading_deg: 260.0,
    altitude_m: 562.3,
    accuracy_m: 2.4
  },
  BUS_115: {
    bus_id: 'BUS_115',
    latitude: 18.507421,
    longitude: 73.806815,
    timestamp: '2026-09-23T10:15:02+05:30',
    speed_kmh: 24.0,
    heading_deg: 45.0,
    altitude_m: 558.0,
    accuracy_m: 1.9
  }
};

export const mockDensity24h: TrafficDensityResponse = {
  period: '24h',
  high_percentage: 28,
  medium_percentage: 54,
  low_percentage: 18,
  average_speed_kmh: 18.4,
  speed_change_kmh: 1.2,
  data: [
    { hour: '06:00', density: 18 },
    { hour: '07:00', density: 32 },
    { hour: '08:00', density: 60 },
    { hour: '09:00', density: 94, label: '09:00 (Peak AM)', isPeak: true },
    { hour: '10:00', density: 100, label: '10:00 (Peak AM)', isPeak: true },
    { hour: '11:00', density: 75 },
    { hour: '12:00', density: 45 },
    { hour: '13:00', density: 35 },
    { hour: '14:00', density: 35 },
    { hour: '15:00', density: 42 },
    { hour: '16:00', density: 64 },
    { hour: '17:00', density: 92, label: '17:00 (Peak PM)', isPeak: true },
    { hour: '18:00', density: 98, label: '18:00 (Peak PM)', isPeak: true },
    { hour: '19:00', density: 95, label: '19:00 (Peak PM)', isPeak: true },
    { hour: '20:00', density: 68 },
    { hour: '21:00', density: 40 },
    { hour: '22:00', density: 25 },
    { hour: '23:00', density: 15 }
  ]
};

export const mockDensity7d: TrafficDensityResponse = {
  period: '7d',
  corridor_average_vehicles_per_min: 40.0,
  total_events: 110,
  average_speed_kmh: 18.4,
  speed_change_kmh: 1.2,
  data: [
    { date: '2026-09-15', day: 'Mon', average_vehicle_count: 38.2, traffic_level: 'MEDIUM', event_count: 14 },
    { date: '2026-09-16', day: 'Tue', average_vehicle_count: 41.0, traffic_level: 'MEDIUM', event_count: 16 },
    { date: '2026-09-17', day: 'Wed', average_vehicle_count: 46.8, traffic_level: 'HIGH', event_count: 22 },
    { date: '2026-09-18', day: 'Thu', average_vehicle_count: 42.5, traffic_level: 'MEDIUM', event_count: 18 },
    { date: '2026-09-19', day: 'Fri', average_vehicle_count: 51.2, traffic_level: 'HIGH', event_count: 24 },
    { date: '2026-09-20', day: 'Sat', average_vehicle_count: 32.4, traffic_level: 'LOW', event_count: 9 },
    { date: '2026-09-21', day: 'Sun', average_vehicle_count: 28.1, traffic_level: 'LOW', event_count: 7 }
  ]
};
