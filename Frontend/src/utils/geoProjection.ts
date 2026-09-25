/**
 * Geographic coordinate projection utility for Pune Municipal Telemetry Grid.
 * Maps real latitude/longitude from FastAPI & Supabase to canvas screen coordinates (840x500).
 * Prepares map for seamless transition to MapLibre GL JS vector/raster layers.
 */

// Bounding box for Pune BRTS & Urban Transit Corridors (Kothrud/Deccan to Viman Nagar)
const PUNE_BOUNDS = {
  minLat: 18.490,
  maxLat: 18.570,
  minLng: 73.760,
  maxLng: 73.930,
};

export function projectLatLongToCanvas(
  lat: number | null | undefined,
  lng: number | null | undefined,
  width = 840,
  height = 500
): { x: number; y: number; isValid: boolean } {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
    return { x: 0, y: 0, isValid: false };
  }

  // Normalize lat/lng to 0-1
  const normX = (lng - PUNE_BOUNDS.minLng) / (PUNE_BOUNDS.maxLng - PUNE_BOUNDS.minLng);
  // Latitude goes from bottom to top, so invert for SVG Y
  const normY = (PUNE_BOUNDS.maxLat - lat) / (PUNE_BOUNDS.maxLat - PUNE_BOUNDS.minLat);

  // Clamp within canvas with slight margin
  const clampedX = Math.max(30, Math.min(width - 30, normX * width));
  const clampedY = Math.max(30, Math.min(height - 30, normY * height));

  return {
    x: Math.round(clampedX),
    y: Math.round(clampedY),
    isValid: true
  };
}
