/**
 * Null-safe mappers transforming real backend events from FastAPI
 * into UI representation.
 *
 * Pothole evidence:
 * - snapshot_path = original detection frame
 * - crop_path     = cropped pothole image
 *
 * No fake locations or fake evidence are generated.
 */

import {
  BusVisionEvent,
  TrafficEvent,
  PotholeEvent,
  RoadIncidentEvent
} from '../types/events';

import {
  AlertItem,
  DetectionItem,
  DetectionStatus
} from '../types';

import { formatTimestamp } from './formatters';

// ---------------------------------------------------------
// LOCATION
// ---------------------------------------------------------

export function formatRealLocation(
  lat: number | null | undefined,
  lng: number | null | undefined
): string {
  if (
    lat != null &&
    lng != null &&
    !isNaN(Number(lat)) &&
    !isNaN(Number(lng))
  ) {
    return `Location: ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
  }

  return 'Location: Unavailable';
}

// ---------------------------------------------------------
// EVIDENCE URL
// ---------------------------------------------------------

/**
 * Returns the best available pothole evidence.
 *
 * Priority:
 * 1. snapshot_path
 * 2. crop_path
 *
 * Does not invent an image URL.
 */
export function getPotholeEvidenceUrl(
  pothole: PotholeEvent
): string | undefined {
  if (pothole.snapshot_path) {
    return pothole.snapshot_path;
  }

  if (pothole.crop_path) {
    return pothole.crop_path;
  }

  return undefined;
}

/**
 * Returns original snapshot only.
 */
export function getPotholeSnapshotUrl(
  pothole: PotholeEvent
): string | undefined {
  return pothole.snapshot_path || undefined;
}

/**
 * Returns cropped pothole image only.
 */
export function getPotholeCropUrl(
  pothole: PotholeEvent
): string | undefined {
  return pothole.crop_path || undefined;
}

// ---------------------------------------------------------
// SORT
// ---------------------------------------------------------

export function sortEventsByLatest(
  events: BusVisionEvent[]
): BusVisionEvent[] {
  if (!events || !Array.isArray(events)) {
    return [];
  }

  return [...events].sort((a, b) => {
    const timeA = a.timestamp
      ? new Date(a.timestamp).getTime()
      : 0;

    const timeB = b.timestamp
      ? new Date(b.timestamp).getTime()
      : 0;

    return timeB - timeA;
  });
}

// ---------------------------------------------------------
// ALERT MAPPER
// ---------------------------------------------------------

export function mapEventsToAlerts(
  events: BusVisionEvent[]
): AlertItem[] {
  if (!events || !Array.isArray(events)) {
    return [];
  }

  const sorted = sortEventsByLatest(events);

  return sorted.map((evt, idx) => {
    const coords:
      | [number, number]
      | undefined =
      evt.latitude != null &&
      evt.longitude != null
        ? [
            Number(evt.latitude),
            Number(evt.longitude)
          ]
        : undefined;

    const locString = formatRealLocation(
      evt.latitude,
      evt.longitude
    );

    const timeStr = formatTimestamp(
      evt.timestamp
    );

    // -----------------------------------------------------
    // POTHOLE
    // -----------------------------------------------------

    if (evt.event_type === 'POTHOLE') {
      const pothole = evt as PotholeEvent;

      const size = (
        pothole.size_category || 'MEDIUM'
      ).toUpperCase();

      const severity =
        size === 'HIGH' ||
        size === 'CRITICAL'
          ? 'High'
          : size === 'MEDIUM'
            ? 'Medium'
            : 'Low';

      const confStr =
        pothole.confidence != null
          ? ` · ${(pothole.confidence * 100).toFixed(0)}% conf`
          : '';

      return {
        id:
          pothole.pothole_id ||
          `pothole-alert-${idx}`,

        title:
          `Pothole Hazard (${pothole.pothole_id || 'DEFECT'})${confStr}`,

        location: locString,

        time: timeStr,

        severity,

        type: 'Pothole',

        busId: evt.bus_id,

        coords
      };
    }

    // -----------------------------------------------------
    // TRAFFIC
    // -----------------------------------------------------

    if (evt.event_type === 'TRAFFIC') {
      const traffic = evt as TrafficEvent;

      const level = (
        traffic.traffic_level || 'MEDIUM'
      ).toUpperCase();

      const severity =
        level === 'HIGH'
          ? 'High'
          : level === 'MEDIUM'
            ? 'Medium'
            : 'Low';

      return {
        id: `traffic-alert-${evt.bus_id}-${idx}`,

        title:
          `Traffic Congestion (${traffic.vehicle_count ?? 0} veh)`,

        location: locString,

        time: timeStr,

        severity,

        type: 'Traffic',

        busId: evt.bus_id,

        coords
      };
    }

    // -----------------------------------------------------
    // ROAD INCIDENT
    // -----------------------------------------------------

    const incident =
      evt as RoadIncidentEvent;

    const severity =
      incident.severity === 'High'
        ? 'High'
        : incident.severity === 'Low'
          ? 'Low'
          : 'Medium';

    const confStr =
      incident.confidence != null
        ? ` · ${(incident.confidence * 100).toFixed(0)}% conf`
        : '';

    return {
      id:
        incident.incident_id ||
        `incident-alert-${idx}`,

      title:
        `${incident.incident_type || 'Road Incident'}${confStr}`,

      location: locString,

      time: timeStr,

      severity,

      type: 'Road Incident',

      busId: evt.bus_id,

      coords
    };
  });
}

// ---------------------------------------------------------
// DETECTION MAPPER
// ---------------------------------------------------------

export function mapEventsToDetections(
  events: BusVisionEvent[]
): DetectionItem[] {
  if (!events || !Array.isArray(events)) {
    return [];
  }

  const sorted = sortEventsByLatest(events);

  return sorted.map((evt, idx) => {
    // -----------------------------------------------------
    // STATUS
    // -----------------------------------------------------

    let status: DetectionStatus = 'New';

    const rawStatus = (
      evt.status || ''
    ).toLowerCase();

    if (rawStatus.includes('verified')) {
      status = 'Verified';
    } else if (rawStatus.includes('process')) {
      status = 'Processed';
    }

    // -----------------------------------------------------
    // COMMON
    // -----------------------------------------------------

    const locString = formatRealLocation(
      evt.latitude,
      evt.longitude
    );

    const timeStr = formatTimestamp(
      evt.timestamp
    );

    // =====================================================
    // POTHOLE
    // =====================================================

    if (evt.event_type === 'POTHOLE') {
      const pothole = evt as PotholeEvent;

      const size = (
        pothole.size_category || 'MEDIUM'
      ).toUpperCase();

      const severity =
        size === 'HIGH' ||
        size === 'CRITICAL'
          ? 'High'
          : size === 'MEDIUM'
            ? 'Medium'
            : 'Low';

      // -----------------------------------------------
      // REAL IMAGE PATHS
      // -----------------------------------------------

      const snapshotUrl =
        getPotholeSnapshotUrl(pothole);

      const cropUrl =
        getPotholeCropUrl(pothole);

      const evidenceUrl =
        getPotholeEvidenceUrl(pothole);

      return {
        id:
          pothole.pothole_id ||
          `det-${idx}`,

        event: 'Pothole',

        locationTitle:
          pothole.pothole_id
            ? `Pothole ${pothole.pothole_id}`
            : 'Road Cavity Defect',

        locationSub: locString,

        busId:
          evt.bus_id || 'UNKNOWN',

        time: timeStr,

        confidence:
          pothole.confidence ?? 0,

        severity,

        status,

        // ---------------------------------------------
        // IMAGE / EVIDENCE
        // ---------------------------------------------

        evidenceUrl,

        snapshotUrl,

        cropUrl,

        altText:
          `Pothole defect telemetry snapshot by bus ${evt.bus_id || ''}`,

        // ---------------------------------------------
        // DETAILS
        // ---------------------------------------------

        details: {
          coordinates:
            evt.latitude != null &&
            evt.longitude != null
              ? `${Number(evt.latitude).toFixed(6)}, ${Number(evt.longitude).toFixed(6)}`
              : 'N/A',

          depthMm:
            pothole.height_px
              ? Math.round(
                  pothole.height_px / 2
                )
              : undefined,

          areaSqM:
            pothole.area_percent
              ? +(
                  pothole.area_percent * 2
                ).toFixed(2)
              : undefined,

          lane: undefined,

          recommendedAction:
            undefined
        }
      } as DetectionItem & {
        snapshotUrl?: string;
        cropUrl?: string;
      };
    }

    // =====================================================
    // TRAFFIC
    // =====================================================

    if (evt.event_type === 'TRAFFIC') {
      const traffic =
        evt as TrafficEvent;

      const level = (
        traffic.traffic_level || 'MEDIUM'
      ).toUpperCase();

      const severity =
        level === 'HIGH'
          ? 'High'
          : level === 'MEDIUM'
            ? 'Medium'
            : 'Low';

      return {
        id:
          `traffic-det-${evt.bus_id}-${idx}`,

        event: 'Traffic',

        locationTitle:
          `Congestion (${traffic.vehicle_count ?? 0} veh)`,

        locationSub: locString,

        busId:
          evt.bus_id || 'UNKNOWN',

        time: timeStr,

        confidence: 0,

        severity,

        status,

        evidenceUrl: undefined,

        altText:
          `Traffic optical detection by bus ${evt.bus_id || ''}`,

        details: {
          coordinates:
            evt.latitude != null &&
            evt.longitude != null
              ? `${Number(evt.latitude).toFixed(6)}, ${Number(evt.longitude).toFixed(6)}`
              : 'N/A'
        }
      };
    }

    // =====================================================
    // ROAD INCIDENT
    // =====================================================

    const incident =
      evt as RoadIncidentEvent;

    const severity =
      incident.severity === 'High'
        ? 'High'
        : incident.severity === 'Low'
          ? 'Low'
          : 'Medium';

    return {
      id:
        incident.incident_id ||
        `incident-det-${idx}`,

      event: 'Road Incident',

      locationTitle:
        incident.incident_type ||
        'Road Incident',

      locationSub: locString,

      busId:
        evt.bus_id || 'UNKNOWN',

      time: timeStr,

      confidence:
        incident.confidence ?? 0,

      severity,

      status,

      evidenceUrl: undefined,

      altText:
        `Road incident detected by bus ${evt.bus_id || ''}`,

      details: {
        coordinates:
          evt.latitude != null &&
          evt.longitude != null
            ? `${Number(evt.latitude).toFixed(6)}, ${Number(evt.longitude).toFixed(6)}`
            : 'N/A'
      }
    };
  });
}