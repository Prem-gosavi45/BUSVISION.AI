/**
 * Safe formatting utilities to ensure no fake values or crashes occur
 * when real API data contains null or undefined fields.
 */

export function formatGps(lat: number | null | undefined, lng: number | null | undefined): string {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
    return 'No GPS Fix';
  }
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export function formatConfidence(conf: number | null | undefined): string {
  if (conf == null || isNaN(conf)) {
    return 'N/A';
  }
  return conf.toFixed(2);
}

export function formatConfidencePercent(conf: number | null | undefined): string {
  if (conf == null || isNaN(conf)) {
    return 'N/A';
  }
  return `${(conf * 100).toFixed(0)}%`;
}

export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return iso || '—';
  }
}

export function formatVehicleCount(count: number | null | undefined): string {
  if (count == null || isNaN(count)) return '—';
  return `${count} vehicles`;
}
