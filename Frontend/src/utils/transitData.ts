import { AlertItem, BusVehicle, DetectionItem, TrafficDailyStat, TrafficHourlyStat } from '../types';

export const busesData: BusVehicle[] = [
  {
    id: 'BUS_101',
    label: 'BUS_101',
    route: 'Route 12 - Katraj to Shivajinagar',
    lat: 18.503079,
    lng: 73.773163,
    cx: 150,
    cy: 205,
    status: 'LIVE',
    sector: 'FC Road Sector 4',
    gps: '18.503079, 73.773163',
    lastUpdate: '10:28:12 AM IST',
    vehicleCount: 29,
    trafficLevel: 'HIGH',
    latestEvent: 'Traffic Congestion',
    speed: '16.8 km/h'
  },
  {
    id: 'BUS_104',
    label: 'BUS_104',
    route: 'Route 7 - Kothrud to Pune Station',
    lat: 18.5145,
    lng: 73.8421,
    cx: 210,
    cy: 340,
    status: 'LIVE',
    sector: 'Deccan Gymkhana',
    gps: '18.514512, 73.842104',
    lastUpdate: '10:27:45 AM IST',
    vehicleCount: 21,
    trafficLevel: 'MEDIUM',
    latestEvent: 'Road Surface Scan',
    speed: '22.4 km/h'
  },
  {
    id: 'BUS_112',
    label: 'BUS_112',
    route: 'Route 24 - Pune Station to Viman Nagar',
    lat: 18.5362,
    lng: 73.8791,
    cx: 510,
    cy: 155,
    status: 'LIVE',
    sector: 'Bund Garden Rd',
    gps: '18.536209, 73.879120',
    lastUpdate: '10:26:50 AM IST',
    vehicleCount: 18,
    trafficLevel: 'LOW',
    latestEvent: 'Nominal Telemetry',
    speed: '31.2 km/h'
  },
  {
    id: 'BUS_107',
    label: 'BUS_107',
    route: 'Route 16 - Swargate to Viman Nagar',
    lat: 18.5583,
    lng: 73.9142,
    cx: 680,
    cy: 120,
    status: 'LIVE',
    sector: 'Nagar Road Corridor',
    gps: '18.558310, 73.914221',
    lastUpdate: '10:25:30 AM IST',
    vehicleCount: 34,
    trafficLevel: 'HIGH',
    latestEvent: 'Road Incident Scan',
    speed: '12.6 km/h'
  },
  {
    id: 'BUS_115',
    label: 'BUS_115',
    route: 'Route 9 - Paud Road to Deccan',
    lat: 18.5074,
    lng: 73.8068,
    cx: 100,
    cy: 330,
    status: 'LIVE',
    sector: 'Paud Road / Kothrud',
    gps: '18.507421, 73.806815',
    lastUpdate: '10:15:02 AM IST',
    vehicleCount: 16,
    trafficLevel: 'MEDIUM',
    latestEvent: 'Pothole Verified',
    speed: '24.0 km/h'
  }
];

export const alertsData: AlertItem[] = [
  {
    id: 'alert-1',
    title: 'Pothole Detected',
    location: 'FC Road, Shivajinagar',
    time: '10:28 AM',
    severity: 'High',
    type: 'Pothole',
    busId: 'BUS_101',
    coords: [18.503079, 73.773163]
  },
  {
    id: 'alert-2',
    title: 'Traffic Congestion',
    location: 'JM Road, Deccan Gymkhana',
    time: '10:25 AM',
    severity: 'Medium',
    type: 'Traffic',
    busId: 'BUS_101',
    coords: [18.5173, 73.8441]
  },
  {
    id: 'alert-3',
    title: 'Road Incident',
    location: 'Nagar Road, Viman Nagar',
    time: '10:21 AM',
    severity: 'High',
    type: 'Road Incident',
    busId: 'BUS_107',
    coords: [18.5583, 73.9142]
  },
  {
    id: 'alert-4',
    title: 'Pothole Cluster',
    location: 'Karve Road, Kothrud',
    time: '10:14 AM',
    severity: 'Medium',
    type: 'Pothole',
    busId: 'BUS_115',
    coords: [18.5012, 73.8124]
  },
  {
    id: 'alert-5',
    title: 'Traffic Choke',
    location: 'Swargate Junction',
    time: '10:08 AM',
    severity: 'Low',
    type: 'Traffic',
    coords: [18.4988, 73.8582]
  }
];

export const detectionsData: DetectionItem[] = [
  {
    id: 'det-1',
    event: 'Pothole',
    locationTitle: 'FC Road',
    locationSub: 'Shivajinagar Junction',
    busId: 'BUS_101',
    time: '10:28 AM',
    confidence: 0.84,
    severity: 'High',
    status: 'New',
    evidenceUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5_ilTze65qa8xcAJsAcJecXRZwWkwYCligU51_z5OxAi4KmLQMhbSD9GWwG8NAd_zTPUovAsOJEqDr3ak0Cyoj8CyEopVAfwUpL3bKZ86BSNyMagU5jgEe9gWlvdtAMxtunJTRcrQn-MuWErKvVVKxNiQmBqjf8nkxdlPQYnMQNw1e55y8FpDAMLO9XLgWlMlVZcNofwrRGB0xyBnx6xd3SyA3OEDqfLt3reyGB2djENS_lza_PCZag',
    altText: 'Clear daytime road surface camera frame capturing an active road asphalt fissure and pothole marked with an automated red computer vision bounding box.',
    details: {
      coordinates: '18.503079 N, 73.773163 E',
      speedKmH: 22.4,
      depthMm: 78,
      areaSqM: 0.85,
      lane: 'Lane 2 (Middle Northbound)',
      recommendedAction: 'Rapid cold-mix patching dispatch within 4 hours (P1 Priority).'
    }
  },
  {
    id: 'det-2',
    event: 'Traffic',
    locationTitle: 'JM Road',
    locationSub: 'Deccan Gymkhana Corner',
    busId: 'BUS_101',
    time: '10:25 AM',
    confidence: 0.76,
    severity: 'Medium',
    status: 'Processed',
    evidenceUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8eWyhDz2jR0sqQy1_imLrHAuNzIQU5aEdrJygE0NHlsvRpzJx5MeJMD2tl45iLjxFFGMaDT7YA_5CxVI9riJhCfD7cEdg6qdvpKeFvWM6QWewlSdY0Z4U7PaTyUP_d-AIwB7AQ0iNGx6FUahbHHp-e4FrBlUDMt4uMsobgpvT_Pm947fonYOe3cbKzH3R5r7CoyV56Ek-hjv_AiCgOM-a1EpV3T57YFOu7YU-CLBsr93lN900EsL6lg',
    altText: 'Wide vehicle windshield camera perspective showing stationary city traffic queue on an Indian municipal boulevard during morning rush hour.',
    details: {
      coordinates: '18.517342 N, 73.844118 E',
      speedKmH: 7.2,
      lane: 'All Lanes Congested',
      recommendedAction: 'Adaptive traffic signal priority adjustment at Deccan rotary.'
    }
  },
  {
    id: 'det-3',
    event: 'Road Incident',
    locationTitle: 'Nagar Road',
    locationSub: 'Viman Nagar Flyover Exit',
    busId: 'BUS_107',
    time: '10:21 AM',
    confidence: 0.79,
    severity: 'High',
    status: 'Processed',
    evidenceUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzZ7T5aevnxaJd6MPA7yvx3UonMfA1xixXnp4J4qMhAVFjRmbkOSGC2i6TN4e3grGe6vYsXrBNRIqQs7bNNVBUQrLflxTSQP7PNqYgu9T0t5Y-PK_mfd2etEnqK3raycZr1xY6lr4h0np3W4jnLW0q50tEhcn93zOQrAYpSFLMSny573BIUEzPOXQJZG-9yqZ6i7NlCapdQmUyW0fpdDtpaKLu1eE96VNm9XwRJu5vdBGp6tYdZIZy4A',
    altText: 'Onboard transit optical sensor capturing a minor roadside vehicle breakdown incident with cautionary traffic cones along a multi-lane city thoroughfare.',
    details: {
      coordinates: '18.558310 N, 73.914221 E',
      speedKmH: 14.1,
      lane: 'Right-most lane blocked by stranded utility vehicle',
      recommendedAction: 'Traffic police tow unit notified; dynamic VMS board routing alert active.'
    }
  },
  {
    id: 'det-4',
    event: 'Pothole',
    locationTitle: 'Paud Road',
    locationSub: 'Kothrud Depot Approach',
    busId: 'BUS_115',
    time: '10:15 AM',
    confidence: 0.91,
    severity: 'High',
    status: 'Verified',
    evidenceUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUjz7t3SuNeZpALiTvc3I8YmH7KMRXC7AwkQOJl1FwDuyTtzhPfe0fu86KWUYbnHCJF4HN_xPLXnwQy1CJnw06bR8yp7d-J8799hoLw9VT8ogswZgA2q4nBZGBHfQz3mLm7wfhuvfPwvF6Muhxj6wsiZyOZPcNEgSuhdCunsbozGB2x83hvXcvhDd6UThyXL5QgYRjYa3dlSuOVI-r-SYJgidnD5fNjLlKI147K3cSwtL6kDCIcwq80A',
    altText: 'Close-up edge detection frame depicting a wide fractured road cavity crater in worn tar pavement under bright daytime sun.',
    details: {
      coordinates: '18.507421 N, 73.806815 E',
      speedKmH: 18.5,
      depthMm: 95,
      areaSqM: 1.2,
      lane: 'Bus Bay Entry lane',
      recommendedAction: 'Work order #PMC-ROADS-8841 auto-dispatched to Zone 3 asphalt crew.'
    }
  }
];

export const hourlyTrafficData: TrafficHourlyStat[] = [
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
];

export const traffic7dData: { period: string; data: TrafficDailyStat[] } = {
  period: '7d',
  data: [
    { date: '2026-09-15', day: 'Mon', average_vehicle_count: 38.2, traffic_level: 'MEDIUM', event_count: 14, cx: 35, cy: 41 },
    { date: '2026-09-16', day: 'Tue', average_vehicle_count: 41.0, traffic_level: 'MEDIUM', event_count: 16, cx: 78, cy: 38 },
    { date: '2026-09-17', day: 'Wed', average_vehicle_count: 46.8, traffic_level: 'HIGH', event_count: 22, cx: 122, cy: 30 },
    { date: '2026-09-18', day: 'Thu', average_vehicle_count: 42.5, traffic_level: 'MEDIUM', event_count: 18, cx: 166, cy: 36 },
    { date: '2026-09-19', day: 'Fri', average_vehicle_count: 51.2, traffic_level: 'HIGH', event_count: 24, cx: 210, cy: 24 },
    { date: '2026-09-20', day: 'Sat', average_vehicle_count: 32.4, traffic_level: 'LOW', event_count: 9, cx: 254, cy: 49 },
    { date: '2026-09-21', day: 'Sun', average_vehicle_count: 28.1, traffic_level: 'LOW', event_count: 7, cx: 298, cy: 54 }
  ]
};
