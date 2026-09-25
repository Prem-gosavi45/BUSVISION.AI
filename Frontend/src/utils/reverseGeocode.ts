// utils/reverseGeocode.ts

const cache = new Map<string, string>();

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
  // Validate coordinates
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return 'Location unavailable';
  }

  // Round coordinates to reduce duplicate API calls
  const key = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;

  // Return cached result
  const cached = cache.get(key);

  if (cached) {
    return cached;
  }

  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2` +
      `&lat=${encodeURIComponent(latitude)}` +
      `&lon=${encodeURIComponent(longitude)}` +
      `&zoom=18` +
      `&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Reverse geocoding failed: ${response.status}`
      );
    }

    const data = await response.json();

    const address = data?.address ?? {};

    const parts = [
      address.road,
      address.neighbourhood,
      address.suburb,
      address.city ||
        address.town ||
        address.village ||
        address.municipality,
      address.state_district,
      address.state,
      address.postcode,
    ].filter(
      (part): part is string =>
        typeof part === 'string' && part.trim().length > 0
    );

    // Remove duplicate parts
    const uniqueParts = [...new Set(parts)];

    const location =
      uniqueParts.length > 0
        ? uniqueParts.join(', ')
        : typeof data?.display_name === 'string'
          ? data.display_name
          : 'Location unavailable';

    // Cache successful result
    cache.set(key, location);

    return location;
  } catch (error) {
    console.warn(
      'Reverse geocoding error:',
      error
    );

    return 'Location unavailable';
  }
}