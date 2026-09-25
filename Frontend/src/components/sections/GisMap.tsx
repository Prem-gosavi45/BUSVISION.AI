import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import maplibreglWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

import { reverseGeocode } from '../../utils/reverseGeocode';

import {
  Map as MapIcon,
  Plus,
  Minus,
  Crosshair,
  Maximize2,
  Minimize2,
  X,
  MapPin,
  Loader2,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

import { BusSummary } from '../../types/buses';
import {
  BusVisionEvent,
  PotholeEvent,
  TrafficEvent,
  RoadIncidentEvent
} from '../../types/events';

import { getBusGps } from '../../api/gps';
import { formatGps, formatTimestamp } from '../../utils/formatters';

// ---------------------------------------------------------
// MapLibre worker
// ---------------------------------------------------------

if (
  typeof window !== 'undefined' &&
  typeof maplibregl.setWorkerUrl === 'function'
) {
  try {
    maplibregl.setWorkerUrl(maplibreglWorkerUrl);
  } catch (err) {
    console.warn('MapLibre setWorkerUrl fallback:', err);
  }
}

// ---------------------------------------------------------
// Types
// ---------------------------------------------------------

interface GisMapProps {
  buses: BusSummary[];
  events?: BusVisionEvent[];
  selectedBusId?: string;
  onSelectBus?: (bus: BusSummary) => void;
  searchFilter?: string;
  onSelectEvent?: (event: BusVisionEvent) => void;
}

interface Telemetry {
  lat?: number | null;
  lng?: number | null;
  timestamp?: string | null;
}

// ---------------------------------------------------------
// Evidence image URL helper
// ---------------------------------------------------------

const resolveEvidenceUrl = (
  path?: string | null
): string | null => {
  if (!path || typeof path !== 'string') return null;

  const value = path.trim();
  if (!value) return null;

  // Already a complete browser-loadable URL.
  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  // Supabase storage paths such as "test/snapshot.jpg" are not browser URLs.
  // Build the public Supabase Storage URL when the backend has returned a
  // storage path instead of an already-expanded public URL.
  const env = (import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }).env || {};

  const supabaseUrl = (
    env.VITE_SUPABASE_URL ||
    env.VITE_SUPABASE_PROJECT_URL ||
    ''
  ).replace(/\/$/, '');

  const bucket =
    env.VITE_SUPABASE_STORAGE_BUCKET ||
    'pothole-images';

  const cleanPath = value
    .replace(/^\/+/, '')
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');

  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${cleanPath}`;
  }

  // Backward-compatible fallback for deployments where the backend already
  // exposes evidence files from the same origin.
  const apiOrigin = (
    env.VITE_API_URL ||
    env.VITE_BACKEND_URL ||
    ''
  ).replace(/\/$/, '');

  return apiOrigin
    ? `${apiOrigin}/${cleanPath}`
    : `/${cleanPath}`;
};

// ---------------------------------------------------------
// Component
// ---------------------------------------------------------

export default function GisMap({
  buses = [],
  events = [],
  selectedBusId,
  onSelectBus,
  onSelectEvent
}: GisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const addressCacheRef = useRef<Map<string, string>>(new Map());

  // -------------------------------------------------------
  // State
  // -------------------------------------------------------

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPopup, setShowPopup] = useState(true);

  const [selectedEvent, setSelectedEvent] =
    useState<BusVisionEvent | null>(null);

  const [mapInitError, setMapInitError] =
    useState<string | null>(null);

  const [mapReady, setMapReady] = useState(false);

  const [activeBusTelemetry, setActiveBusTelemetry] =
    useState<Telemetry | null>(null);

  const [locationName, setLocationName] =
    useState<string | null>(null);

  const [isLoadingLocation, setIsLoadingLocation] =
    useState(false);

  const [evidenceImageError, setEvidenceImageError] =
    useState(false);

  const [isEvidenceImageLoading, setIsEvidenceImageLoading] =
    useState(false);

  const [layers, setLayers] = useState({
    buses: true,
    potholes: true,
    traffic: true,
    incidents: true
  });

  // -------------------------------------------------------
  // Valid coordinates
  // -------------------------------------------------------

  const validBuses = useMemo(
    () =>
      buses.filter(
        (b) =>
          b.latitude != null &&
          b.longitude != null &&
          !isNaN(Number(b.latitude)) &&
          !isNaN(Number(b.longitude))
      ),
    [buses]
  );

  const validPotholes = useMemo(
    () =>
      events.filter(
        (e): e is PotholeEvent =>
          e.event_type === 'POTHOLE' &&
          e.latitude != null &&
          e.longitude != null &&
          !isNaN(Number(e.latitude)) &&
          !isNaN(Number(e.longitude))
      ),
    [events]
  );

  const validTraffic = useMemo(
    () =>
      events.filter(
        (e): e is TrafficEvent =>
          e.event_type === 'TRAFFIC' &&
          e.latitude != null &&
          e.longitude != null &&
          !isNaN(Number(e.latitude)) &&
          !isNaN(Number(e.longitude))
      ),
    [events]
  );

  const validIncidents = useMemo(
    () =>
      events.filter(
        (e): e is RoadIncidentEvent =>
          e.event_type === 'ROAD_INCIDENT' &&
          e.latitude != null &&
          e.longitude != null &&
          !isNaN(Number(e.latitude)) &&
          !isNaN(Number(e.longitude))
      ),
    [events]
  );

  const totalGeolocatedItems =
    (layers.buses ? validBuses.length : 0) +
    (layers.potholes ? validPotholes.length : 0) +
    (layers.traffic ? validTraffic.length : 0) +
    (layers.incidents ? validIncidents.length : 0);

  // -------------------------------------------------------
  // Active bus
  // -------------------------------------------------------

  const activeBus =
    buses.find((b) => b.bus_id === selectedBusId) ||
    (buses.length > 0 ? buses[0] : null);

  // -------------------------------------------------------
  // Default map center
  // -------------------------------------------------------

  const defaultCenter: [number, number] =
    validBuses.length > 0
      ? [
          Number(validBuses[0].longitude),
          Number(validBuses[0].latitude)
        ]
      : validPotholes.length > 0
        ? [
            Number(validPotholes[0].longitude),
            Number(validPotholes[0].latitude)
          ]
        : [73.8567, 18.5204];

  // -------------------------------------------------------
  // Get active bus GPS
  // -------------------------------------------------------

  useEffect(() => {
    if (!activeBus) {
      setActiveBusTelemetry(null);
      return;
    }

    if (
      activeBus.latitude == null ||
      activeBus.longitude == null
    ) {
      let isMounted = true;

      getBusGps(activeBus.bus_id)
        .then((res) => {
          if (
            isMounted &&
            res.data &&
            res.data.latitude != null &&
            res.data.longitude != null
          ) {
            setActiveBusTelemetry({
              lat: res.data.latitude,
              lng: res.data.longitude,
              timestamp: res.data.timestamp
            });
          }
        })
        .catch((err) => {
          console.warn('GPS fetch failed:', err);
        });

      return () => {
        isMounted = false;
      };
    }

    setActiveBusTelemetry({
      lat: activeBus.latitude,
      lng: activeBus.longitude,
      timestamp: activeBus.last_update
    });
  }, [
    activeBus?.bus_id,
    activeBus?.latitude,
    activeBus?.longitude,
    activeBus?.last_update
  ]);

  // -------------------------------------------------------
  // Reverse geocode
  // -------------------------------------------------------

  const loadLocationName = async (
    lat?: number | null,
    lng?: number | null
  ) => {
    if (
      lat == null ||
      lng == null ||
      !Number.isFinite(Number(lat)) ||
      !Number.isFinite(Number(lng))
    ) {
      setLocationName(null);
      return;
    }

    const key = `${Number(lat).toFixed(5)},${Number(lng).toFixed(5)}`;

    const cached = addressCacheRef.current.get(key);

    if (cached) {
      setLocationName(cached);
      return;
    }

    setIsLoadingLocation(true);

    try {
      const result = await reverseGeocode(
        Number(lat),
        Number(lng)
      );

      /*
       * Supports either:
       * reverseGeocode() -> string
       * reverseGeocode() -> { display_name: string }
       * reverseGeocode() -> { address: string }
       */

      let address = '';

      if (typeof result === 'string') {
        address = result;
      } else if (result && typeof result === 'object') {
        const data = result as {
          display_name?: string;
          address?: string;
          name?: string;
        };

        address =
          data.display_name ||
          data.address ||
          data.name ||
          '';
      }

      if (address) {
        addressCacheRef.current.set(key, address);
        setLocationName(address);
      } else {
        setLocationName('Location unavailable');
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      setLocationName('Location unavailable');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // -------------------------------------------------------
  // Load location when active bus changes
  // -------------------------------------------------------

  useEffect(() => {
    if (!selectedEvent && activeBusTelemetry) {
      loadLocationName(
        activeBusTelemetry.lat,
        activeBusTelemetry.lng
      );
    }
  }, [
    activeBus?.bus_id,
    activeBusTelemetry?.lat,
    activeBusTelemetry?.lng,
    selectedEvent
  ]);

  // -------------------------------------------------------
  // Initialize MapLibre
  // -------------------------------------------------------

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) return;

    try {
      const isSupportedFn = (
        maplibregl as unknown as {
          supported?: () => boolean;
        }
      ).supported;

      if (
        typeof isSupportedFn === 'function' &&
        !isSupportedFn()
      ) {
        setMapInitError(
          'WebGL is not supported in this environment'
        );
        return;
      }

      const isDark =
        document.documentElement.classList.contains('dark');

      // IMPORTANT:
      // Do NOT put Markdown []() around the URL.
      const tileUrl =
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

      const mapInstance = new maplibregl.Map({
        container: mapContainerRef.current,

        style: {
          version: 8,

          sources: {
            'base-tiles': {
              type: 'raster',
              tiles: [tileUrl],
              tileSize: 256,
              attribution:
                '&copy; CartoDB &copy; OpenStreetMap'
            }
          },

          layers: [
            {
              id: 'base-tiles-layer',
              type: 'raster',
              source: 'base-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },

        center: defaultCenter,
        zoom: 13.5,

        attributionControl: false
      });

      mapInstance.on('load', () => {
        setMapReady(true);
        setMapInitError(null);

        mapInstance.resize();
      });

      mapInstance.on('error', (e) => {
        const errMsg = e.error?.message || '';

        if (
          errMsg.toLowerCase().includes('worker')
        ) {
          console.warn(
            'MapLibre worker warning:',
            errMsg
          );
        } else {
          console.warn(
            'MapLibre map error:',
            errMsg
          );
        }
      });

      mapInstance.addControl(
        new maplibregl.AttributionControl({
          compact: true
        }),
        'bottom-right'
      );

      mapRef.current = mapInstance;
    } catch (err: unknown) {
      console.warn(
        'MapLibre initialization warning:',
        err
      );

      setMapInitError(
        err instanceof Error
          ? err.message
          : 'MapLibre initialization error'
      );
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {
          // Ignore cleanup errors
        }

        mapRef.current = null;
      }

      setMapReady(false);
    };
  }, []);

  // -------------------------------------------------------
  // Resize map when fullscreen changes
  // -------------------------------------------------------

  useEffect(() => {
    if (!mapRef.current) return;

    const timer = window.setTimeout(() => {
      mapRef.current?.resize();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [isFullscreen]);

  // -------------------------------------------------------
  // Marker helpers
  // -------------------------------------------------------

  const selectBus = (bus: BusSummary) => {
    onSelectBus?.(bus);
    setShowPopup(true);
    setSelectedEvent(null);

    loadLocationName(
      bus.latitude,
      bus.longitude
    );

    if (
      mapRef.current &&
      bus.latitude != null &&
      bus.longitude != null
    ) {
      mapRef.current.flyTo({
        center: [
          Number(bus.longitude),
          Number(bus.latitude)
        ],
        zoom: 15,
        essential: true
      });
    }
  };

  const selectEvent = (event: BusVisionEvent) => {
    setSelectedEvent(event);
    setShowPopup(true);
    setEvidenceImageError(false);
    setIsEvidenceImageLoading(
      event.event_type === 'POTHOLE' &&
      Boolean((event as PotholeEvent).snapshot_path)
    );
    onSelectEvent?.(event);

    loadLocationName(
      event.latitude,
      event.longitude
    );

    if (
      mapRef.current &&
      event.latitude != null &&
      event.longitude != null
    ) {
      mapRef.current.flyTo({
        center: [
          Number(event.longitude),
          Number(event.latitude)
        ],
        zoom: 15,
        essential: true
      });
    }
  };

  // -------------------------------------------------------
  // Update markers
  // -------------------------------------------------------

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) return;

    try {
      markersRef.current.forEach((marker) =>
        marker.remove()
      );

      markersRef.current = [];

      // ---------------------------------------------------
      // BUS MARKERS
      // ---------------------------------------------------

      if (layers.buses) {
        validBuses.forEach((bus) => {
          const isSelected =
            bus.bus_id === activeBus?.bus_id;

          const el = document.createElement('div');

          el.className =
            'group cursor-pointer select-none';

          el.innerHTML = `
            <div class="relative flex items-center justify-center">

              ${
                isSelected
                  ? `
                    <span
                      class="absolute w-9 h-9 rounded-full
                      bg-emerald-500/30 animate-ping">
                    </span>
                  `
                  : ''
              }

              <div
                class="w-7 h-7 rounded-full
                bg-[#16A36A]
                border-2 border-white
                shadow-md
                flex items-center justify-center
                text-white text-[8px] font-bold">
                BUS
              </div>

              <div
                class="absolute -top-6
                px-1.5 py-0.5
                bg-[#18212B]
                text-white
                text-[9px]
                font-mono
                rounded
                shadow
                whitespace-nowrap
                opacity-90
                group-hover:opacity-100">
                ${bus.bus_id}
              </div>

            </div>
          `;

          el.addEventListener('click', () => {
            selectBus(bus);
          });

          const marker =
            new maplibregl.Marker({
              element: el,
              anchor: 'center'
            })
              .setLngLat([
                Number(bus.longitude),
                Number(bus.latitude)
              ])
              .addTo(map);

          markersRef.current.push(marker);
        });
      }

      // ---------------------------------------------------
      // POTHOLES
      // ---------------------------------------------------

      if (layers.potholes) {
        validPotholes.forEach((pothole) => {
          const el = document.createElement('div');

          el.className =
            'group cursor-pointer select-none';

          el.innerHTML = `
            <div
              class="relative flex items-center justify-center">

              <div
                class="w-5 h-5 rounded-full
                bg-[#E5484D]
                border-2 border-white
                shadow
                flex items-center justify-center
                text-white
                text-[8px]
                font-bold">
                !
              </div>

              <div
                class="hidden
                group-hover:block
                absolute -top-6
                px-1.5 py-0.5
                bg-[#18212B]
                text-white
                text-[9px]
                font-mono
                rounded
                shadow
                whitespace-nowrap
                z-20">
                Pothole:
                ${pothole.pothole_id || 'Defect'}
              </div>

            </div>
          `;

          el.addEventListener('click', () => {
            selectEvent(pothole);
          });

          const marker =
            new maplibregl.Marker({
              element: el
            })
              .setLngLat([
                Number(pothole.longitude),
                Number(pothole.latitude)
              ])
              .addTo(map);

          markersRef.current.push(marker);
        });
      }

      // ---------------------------------------------------
      // TRAFFIC
      // ---------------------------------------------------

      if (layers.traffic) {
        validTraffic.forEach((traffic) => {
          const el = document.createElement('div');

          el.className =
            'group cursor-pointer select-none';

          el.innerHTML = `
            <div
              class="relative flex items-center justify-center">

              <div
                class="w-5 h-5 rounded-full
                bg-[#F59E0B]
                border-2 border-white
                shadow
                flex items-center justify-center
                text-white
                text-[8px]
                font-bold">
                T
              </div>

              <div
                class="hidden
                group-hover:block
                absolute -top-6
                px-1.5 py-0.5
                bg-[#18212B]
                text-white
                text-[9px]
                font-mono
                rounded
                shadow
                whitespace-nowrap
                z-20">
                Traffic:
                ${traffic.vehicle_count ?? 0} veh
              </div>

            </div>
          `;

          el.addEventListener('click', () => {
            selectEvent(traffic);
          });

          const marker =
            new maplibregl.Marker({
              element: el
            })
              .setLngLat([
                Number(traffic.longitude),
                Number(traffic.latitude)
              ])
              .addTo(map);

          markersRef.current.push(marker);
        });
      }

      // ---------------------------------------------------
      // ROAD INCIDENTS
      // ---------------------------------------------------

      if (layers.incidents) {
        validIncidents.forEach((incident) => {
          const el = document.createElement('div');

          el.className =
            'group cursor-pointer select-none';

          el.innerHTML = `
            <div
              class="relative flex items-center justify-center">

              <div
                class="w-5 h-5 rounded-full
                bg-[#7C5CFC]
                border-2 border-white
                shadow
                flex items-center justify-center
                text-white
                text-[8px]
                font-bold">
                I
              </div>

              <div
                class="hidden
                group-hover:block
                absolute -top-6
                px-1.5 py-0.5
                bg-[#18212B]
                text-white
                text-[9px]
                font-mono
                rounded
                shadow
                whitespace-nowrap
                z-20">
                ${
                  incident.incident_type ||
                  'Incident'
                }
              </div>

            </div>
          `;

          el.addEventListener('click', () => {
            selectEvent(incident);
          });

          const marker =
            new maplibregl.Marker({
              element: el
            })
              .setLngLat([
                Number(incident.longitude),
                Number(incident.latitude)
              ])
              .addTo(map);

          markersRef.current.push(marker);
        });
      }
    } catch (err) {
      console.warn(
        'Marker render warning:',
        err
      );
    }
  }, [
    mapReady,
    validBuses,
    validPotholes,
    validTraffic,
    validIncidents,
    layers,
    activeBus?.bus_id
  ]);

  // -------------------------------------------------------
  // Controls
  // -------------------------------------------------------

  const handleZoom = (delta: number) => {
    if (!mapRef.current) return;

    mapRef.current.zoomTo(
      mapRef.current.getZoom() + delta
    );
  };

  const handleRecenter = () => {
    if (!mapRef.current) return;

    if (
      activeBusTelemetry?.lat != null &&
      activeBusTelemetry?.lng != null
    ) {
      mapRef.current.flyTo({
        center: [
          Number(activeBusTelemetry.lng),
          Number(activeBusTelemetry.lat)
        ],
        zoom: 14.5,
        essential: true
      });

      return;
    }

    mapRef.current.flyTo({
      center: defaultCenter,
      zoom: 13.5,
      essential: true
    });
  };

  const toggleLayer = (
    key: keyof typeof layers
  ) => {
    setLayers((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // -------------------------------------------------------
  // Fallback projection
  // -------------------------------------------------------

  const projectToFallbackCanvas = (
    lat: number,
    lng: number
  ) => {
    const minLat = 18.48;
    const maxLat = 18.56;
    const minLng = 73.80;
    const maxLng = 73.90;

    const x = Math.max(
      30,
      Math.min(
        670,
        30 +
          ((lng - minLng) /
            (maxLng - minLng)) *
            640
      )
    );

    const y = Math.max(
      30,
      Math.min(
        370,
        370 -
          ((lat - minLat) /
            (maxLat - minLat)) *
            340
      )
    );

    return { x, y };
  };

  // -------------------------------------------------------
  // Selected event evidence
  // -------------------------------------------------------

  const selectedPothole =
    selectedEvent?.event_type === 'POTHOLE'
      ? (selectedEvent as PotholeEvent)
      : null;

  const snapshotUrl = selectedPothole
    ? resolveEvidenceUrl(selectedPothole.snapshot_path)
    : null;

  const cropUrl = selectedPothole
    ? resolveEvidenceUrl(selectedPothole.crop_path)
    : null;

  const evidenceUrl =
    snapshotUrl && !evidenceImageError
      ? snapshotUrl
      : cropUrl;

  // -------------------------------------------------------
  // JSX
  // -------------------------------------------------------

  return (
    <div
      className={`
        bg-white dark:bg-[#111827]
        border border-[#E1E5E8]
        dark:border-[#334155]
        rounded-md
        flex flex-col
        overflow-hidden
        relative
        transition-colors

        ${
          isFullscreen
            ? 'fixed inset-4 z-50 rounded-md shadow-2xl'
            : 'h-full'
        }
      `}
    >
      {/* --------------------------------------------------
          HEADER
      -------------------------------------------------- */}

      <div
        className="
          h-9 px-3.5
          border-b border-[#E1E5E8]
          dark:border-[#334155]
          bg-[#FAFAFA]
          dark:bg-[#1E293B]/70
          flex items-center
          justify-between
          flex-shrink-0
        "
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <MapIcon
            className="
              w-3.5 h-3.5
              text-[#2F6FED]
              dark:text-[#3B82F6]
              flex-shrink-0
            "
          />

          <span
            className="
              text-[12px]
              font-semibold
              text-[#18212B]
              dark:text-[#F3F4F6]
              truncate
              uppercase
              tracking-wide
            "
          >
            Municipal Fleet & Telemetry Grid
          </span>

          <span
            className="
              hidden md:inline-block
              text-[#CBD0D5]
              dark:text-[#475569]
            "
          >
            ·
          </span>

          <span
            className="
              hidden md:inline-block
              font-mono
              text-[10.5px]
              text-[#5F6872]
              dark:text-[#9CA3AF]
              flex-shrink-0
            "
          >
            MapLibre GL · {totalGeolocatedItems}{' '}
            Active Coordinates
          </span>
        </div>

        {/* Layer controls */}

        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
          <div
            className="
              hidden sm:flex
              items-center
              space-x-1
              font-mono
              text-[9px]
            "
          >
            {/* BUS */}

            <button
              type="button"
              onClick={() =>
                toggleLayer('buses')
              }
              className={`
                px-1.5 py-0.5
                rounded border
                transition-colors
                cursor-pointer

                ${
                  layers.buses
                    ? `
                      bg-emerald-50
                      dark:bg-emerald-950/40
                      text-[#16A36A]
                      border-emerald-300
                      dark:border-emerald-800
                    `
                    : `
                      bg-white
                      dark:bg-[#1E293B]
                      text-[#5F6872]
                      dark:text-[#9CA3AF]
                      border-[#E1E5E8]
                      dark:border-[#334155]
                    `
                }
              `}
            >
              BUSES ({validBuses.length})
            </button>

            {/* POTHOLES */}

            <button
              type="button"
              onClick={() =>
                toggleLayer('potholes')
              }
              className={`
                px-1.5 py-0.5
                rounded border
                transition-colors
                cursor-pointer

                ${
                  layers.potholes
                    ? `
                      bg-red-50
                      dark:bg-red-950/40
                      text-[#E5484D]
                      border-red-300
                      dark:border-red-800
                    `
                    : `
                      bg-white
                      dark:bg-[#1E293B]
                      text-[#5F6872]
                      dark:text-[#9CA3AF]
                      border-[#E1E5E8]
                      dark:border-[#334155]
                    `
                }
              `}
            >
              POTHOLES ({validPotholes.length})
            </button>

            {/* TRAFFIC */}

            <button
              type="button"
              onClick={() =>
                toggleLayer('traffic')
              }
              className={`
                px-1.5 py-0.5
                rounded border
                transition-colors
                cursor-pointer

                ${
                  layers.traffic
                    ? `
                      bg-amber-50
                      dark:bg-amber-950/40
                      text-[#B45309]
                      dark:text-amber-400
                      border-amber-300
                      dark:border-amber-800
                    `
                    : `
                      bg-white
                      dark:bg-[#1E293B]
                      text-[#5F6872]
                      dark:text-[#9CA3AF]
                      border-[#E1E5E8]
                      dark:border-[#334155]
                    `
                }
              `}
            >
              TRAFFIC ({validTraffic.length})
            </button>

            {/* INCIDENTS */}

            <button
              type="button"
              onClick={() =>
                toggleLayer('incidents')
              }
              className={`
                px-1.5 py-0.5
                rounded border
                transition-colors
                cursor-pointer

                ${
                  layers.incidents
                    ? `
                      bg-purple-50
                      dark:bg-purple-950/40
                      text-[#7C5CFC]
                      border-purple-300
                      dark:border-purple-800
                    `
                    : `
                      bg-white
                      dark:bg-[#1E293B]
                      text-[#5F6872]
                      dark:text-[#9CA3AF]
                      border-[#E1E5E8]
                      dark:border-[#334155]
                    `
                }
              `}
            >
              INCIDENTS ({validIncidents.length})
            </button>
          </div>

          {/* FULLSCREEN */}

          <button
            type="button"
            onClick={() =>
              setIsFullscreen(
                (prev) => !prev
              )
            }
            className="
              p-1
              text-[#5F6872]
              dark:text-[#9CA3AF]
              hover:text-[#18212B]
              dark:hover:text-white
              rounded
              border
              border-[#CBD0D5]
              dark:border-[#475569]
              cursor-pointer
            "
            title={
              isFullscreen
                ? 'Exit Fullscreen'
                : 'Fullscreen Map'
            }
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* --------------------------------------------------
          MAP VIEW
      -------------------------------------------------- */}

      <div
        className="
          relative
          w-full
          flex-1
          min-h-[470px]
          bg-[#E8EAE6]
          dark:bg-[#131b28]
          overflow-hidden
          select-none
        "
      >
        {/* MapLibre */}

        <div
          ref={mapContainerRef}
          className="
            w-full
            h-full
            absolute
            inset-0
            z-0
          "
        />

        {/* ------------------------------------------------
            FALLBACK
        ------------------------------------------------ */}

        {mapInitError && (
          <div
            className="
              absolute
              inset-0
              z-0
              w-full
              h-full
              bg-[#E9ECE7]
              dark:bg-[#151f2e]
              overflow-hidden
            "
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 700 400"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <pattern
                  id="gisGridFallback"
                  width="35"
                  height="35"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 35 0 L 0 0 0 35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="
                      text-[#CBD0D5]/50
                      dark:text-[#334155]/40
                    "
                  />
                </pattern>
              </defs>

              <rect
                width="100%"
                height="100%"
                fill="url(#gisGridFallback)"
              />

              {/* BUS FALLBACK */}

              {layers.buses &&
                validBuses.map((bus) => {
                  const pt =
                    projectToFallbackCanvas(
                      Number(bus.latitude),
                      Number(bus.longitude)
                    );

                  return (
                    <g
                      key={bus.bus_id}
                      className="cursor-pointer"
                      onClick={() =>
                        selectBus(bus)
                      }
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="10"
                        fill="#16A36A"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />

                      <text
                        x={pt.x}
                        y={pt.y - 12}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#18212B"
                        className="font-mono"
                      >
                        {bus.bus_id}
                      </text>
                    </g>
                  );
                })}

              {/* POTHOLE FALLBACK */}

              {layers.potholes &&
                validPotholes.map(
                  (pothole, idx) => {
                    const pt =
                      projectToFallbackCanvas(
                        Number(pothole.latitude),
                        Number(pothole.longitude)
                      );

                    return (
                      <g
                        key={`pothole-${idx}`}
                        className="cursor-pointer"
                        onClick={() =>
                          selectEvent(pothole)
                        }
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="7"
                          fill="#E5484D"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  }
                )}

              {/* TRAFFIC FALLBACK */}

              {layers.traffic &&
                validTraffic.map(
                  (traffic, idx) => {
                    const pt =
                      projectToFallbackCanvas(
                        Number(traffic.latitude),
                        Number(traffic.longitude)
                      );

                    return (
                      <g
                        key={`traffic-${idx}`}
                        className="cursor-pointer"
                        onClick={() =>
                          selectEvent(traffic)
                        }
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="7"
                          fill="#F59E0B"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  }
                )}

              {/* INCIDENT FALLBACK */}

              {layers.incidents &&
                validIncidents.map(
                  (incident, idx) => {
                    const pt =
                      projectToFallbackCanvas(
                        Number(incident.latitude),
                        Number(incident.longitude)
                      );

                    return (
                      <g
                        key={`incident-${idx}`}
                        className="cursor-pointer"
                        onClick={() =>
                          selectEvent(incident)
                        }
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="7"
                          fill="#7C5CFC"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  }
                )}
            </svg>
          </div>
        )}

        {/* ------------------------------------------------
            EMPTY STATE
        ------------------------------------------------ */}

        {totalGeolocatedItems === 0 && (
          <div
            className="
              absolute
              inset-0
              z-10
              flex
              flex-col
              items-center
              justify-center
              bg-[#F4F5F2]/85
              dark:bg-[#0B0F17]/85
              backdrop-blur-xs
              p-6
              text-center
              pointer-events-auto
            "
          >
            <div
              className="
                w-10 h-10
                rounded-full
                bg-white
                dark:bg-[#1E293B]
                border
                border-[#CBD0D5]
                dark:border-[#475569]
                flex items-center justify-center
                text-[#5F6872]
                dark:text-[#9CA3AF]
                mb-2
                shadow-xs
              "
            >
              <MapIcon className="w-5 h-5 text-[#2F6FED]" />
            </div>

            <h4
              className="
                text-[13px]
                font-bold
                text-[#18212B]
                dark:text-[#F3F4F6]
              "
            >
              No live location data available
            </h4>

            <p
              className="
                text-[11px]
                text-[#5F6872]
                dark:text-[#9CA3AF]
                max-w-sm
                mt-1
              "
            >
              Waiting for edge vision GPS telemetry
              fix from PMPML bus fleet.
            </p>
          </div>
        )}

        {/* ------------------------------------------------
            MAP CONTROLS
        ------------------------------------------------ */}

        <div
          className="
            absolute
            top-3
            right-3
            z-10
            flex
            flex-col
            space-y-1
          "
        >
          <button
            type="button"
            onClick={() =>
              handleZoom(1)
            }
            className="
              w-7 h-7
              bg-white
              dark:bg-[#111827]
              border
              border-[#CBD0D5]
              dark:border-[#334155]
              rounded
              flex
              items-center
              justify-center
              text-[#18212B]
              dark:text-[#F3F4F6]
              shadow-sm
              hover:bg-[#F4F5F2]
              cursor-pointer
            "
            title="Zoom in"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() =>
              handleZoom(-1)
            }
            className="
              w-7 h-7
              bg-white
              dark:bg-[#111827]
              border
              border-[#CBD0D5]
              dark:border-[#334155]
              rounded
              flex
              items-center
              justify-center
              text-[#18212B]
              dark:text-[#F3F4F6]
              shadow-sm
              hover:bg-[#F4F5F2]
              cursor-pointer
            "
            title="Zoom out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleRecenter}
            className="
              w-7 h-7
              bg-white
              dark:bg-[#111827]
              border
              border-[#CBD0D5]
              dark:border-[#334155]
              rounded
              flex
              items-center
              justify-center
              text-[#18212B]
              dark:text-[#F3F4F6]
              shadow-sm
              hover:bg-[#F4F5F2]
              cursor-pointer
            "
            title="Recenter"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ------------------------------------------------
            ACTIVE BUS POPUP
        ------------------------------------------------ */}

        {showPopup &&
          activeBus &&
          !selectedEvent && (
            <div
              className="
                absolute
                top-3
                left-3
                w-72
                bg-white/95
                dark:bg-[#111827]/95
                backdrop-blur-xs
                border
                border-[#E1E5E8]
                dark:border-[#334155]
                rounded
                p-2.5
                z-20
                text-[11px]
                transition-colors
                shadow-md
              "
            >
              {/* Header */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  pb-1.5
                  border-b
                  border-[#E1E5E8]
                  dark:border-[#334155]
                "
              >
                <div className="flex items-center space-x-1.5">
                  <span
                    className="
                      w-1.5 h-1.5
                      rounded-full
                      bg-[#16A36A]
                    "
                  />

                  <span
                    className="
                      font-mono
                      font-bold
                      text-[12px]
                      text-[#18212B]
                      dark:text-[#F3F4F6]
                    "
                  >
                    {activeBus.bus_id}
                  </span>

                  <span
                    className="
                      inline-flex
                      items-center
                      px-1
                      py-0.2
                      rounded
                      text-[9px]
                      font-mono
                      font-semibold
                      bg-[#EEF4FF]
                      dark:bg-[#1E293B]
                      text-[#2F6FED]
                      dark:text-[#3B82F6]
                      border
                      border-[#CBD0D5]/50
                      dark:border-[#334155]
                    "
                  >
                    {activeBus.status ||
                      'ACTIVE'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowPopup(false)
                  }
                  className="
                    text-[#5F6872]
                    hover:text-[#18212B]
                    dark:hover:text-white
                    p-0.5
                    cursor-pointer
                  "
                  title="Close popup"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Data */}

              <div
                className="
                  mt-2
                  space-y-1.5
                  font-mono
                  text-[10.5px]
                "
              >
                <div
                  className="
                    flex
                    justify-between
                    gap-3
                    text-[#5F6872]
                    dark:text-[#9CA3AF]
                  "
                >
                  <span>GPS Fix:</span>

                  <span
                    className="
                      text-[#18212B]
                      dark:text-[#F3F4F6]
                      font-medium
                    "
                  >
                    {formatGps(
                      activeBusTelemetry?.lat,
                      activeBusTelemetry?.lng
                    )}
                  </span>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    gap-3
                    text-[#5F6872]
                    dark:text-[#9CA3AF]
                  "
                >
                  <span>Telemetry:</span>

                  <span
                    className="
                      text-[#18212B]
                      dark:text-[#F3F4F6]
                    "
                  >
                    {formatTimestamp(
                      activeBusTelemetry?.timestamp
                    )}
                  </span>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    gap-3
                    text-[#5F6872]
                    dark:text-[#9CA3AF]
                  "
                >
                  <span>Vehicles:</span>

                  <span
                    className="
                      text-[#18212B]
                      dark:text-[#F3F4F6]
                      font-semibold
                      tabular-nums
                    "
                  >
                    {activeBus.vehicle_count !=
                    null
                      ? `${activeBus.vehicle_count} counted`
                      : '--'}
                  </span>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    items-center
                    gap-3
                    text-[#5F6872]
                    dark:text-[#9CA3AF]
                  "
                >
                  <span>Congestion:</span>

                  <span
                    className="
                      px-1
                      py-0.2
                      rounded
                      text-[9.5px]
                      font-mono
                      font-bold
                      bg-[#F4F5F2]
                      dark:bg-[#1E293B]
                      text-[#18212B]
                      dark:text-[#F3F4F6]
                      border
                      border-[#CBD0D5]
                      dark:border-[#475569]
                    "
                  >
                    {activeBus.traffic_level ||
                      '--'}
                  </span>
                </div>

                {/* LOCATION */}

                <div
                  className="
                    pt-1.5
                    mt-1
                    border-t
                    border-[#E1E5E8]
                    dark:border-[#334155]
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-1.5
                      text-[#5F6872]
                      dark:text-[#9CA3AF]
                    "
                  >
                    <MapPin
                      className="
                        w-3
                        h-3
                        mt-0.5
                        flex-shrink-0
                        text-[#2F6FED]
                      "
                    />

                    <span
                      className="
                        leading-4
                        text-[#18212B]
                        dark:text-[#F3F4F6]
                      "
                    >
                      {isLoadingLocation ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Locating...
                        </span>
                      ) : (
                        locationName ||
                        'Location unavailable'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* ------------------------------------------------
            SELECTED EVENT POPUP
        ------------------------------------------------ */}

        {showPopup && selectedEvent && (
          <div
            className="
              absolute
              top-3
              left-3
              w-72
              bg-white/95
              dark:bg-[#111827]/95
              backdrop-blur-xs
              border
              border-[#E1E5E8]
              dark:border-[#334155]
              rounded
              p-2.5
              z-20
              text-[11px]
              transition-colors
              shadow-md
            "
          >
            {/* Header */}

            <div
              className="
                flex
                items-center
                justify-between
                pb-1.5
                border-b
                border-[#E1E5E8]
                dark:border-[#334155]
              "
            >
              <div className="flex items-center space-x-1.5">
                <span
                  className={`
                    w-2 h-2 rounded-full

                    ${
                      selectedEvent.event_type ===
                      'POTHOLE'
                        ? 'bg-[#E5484D]'
                        : selectedEvent.event_type ===
                            'TRAFFIC'
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#7C5CFC]'
                    }
                  `}
                />

                <span
                  className="
                    font-mono
                    font-bold
                    text-[12px]
                    text-[#18212B]
                    dark:text-[#F3F4F6]
                  "
                >
                  {selectedEvent.event_type}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedEvent(null);
                  setLocationName(null);
                }}
                className="
                  text-[#5F6872]
                  hover:text-[#18212B]
                  dark:hover:text-white
                  p-0.5
                  cursor-pointer
                "
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Event data */}

            <div
              className="
                mt-2
                space-y-1.5
                font-mono
                text-[10.5px]
              "
            >
              <div
                className="
                  flex
                  justify-between
                  gap-3
                  text-[#5F6872]
                  dark:text-[#9CA3AF]
                "
              >
                <span>Bus Unit:</span>

                <span
                  className="
                    text-[#18212B]
                    dark:text-[#F3F4F6]
                    font-semibold
                  "
                >
                  {selectedEvent.bus_id ||
                    'UNKNOWN'}
                </span>
              </div>

              <div
                className="
                  flex
                  justify-between
                  gap-3
                  text-[#5F6872]
                  dark:text-[#9CA3AF]
                "
              >
                <span>Coordinates:</span>

                <span
                  className="
                    text-[#18212B]
                    dark:text-[#F3F4F6]
                  "
                >
                  {formatGps(
                    selectedEvent.latitude,
                    selectedEvent.longitude
                  )}
                </span>
              </div>

              <div
                className="
                  flex
                  justify-between
                  gap-3
                  text-[#5F6872]
                  dark:text-[#9CA3AF]
                "
              >
                <span>Timestamp:</span>

                <span
                  className="
                    text-[#18212B]
                    dark:text-[#F3F4F6]
                  "
                >
                  {formatTimestamp(
                    selectedEvent.timestamp
                  )}
                </span>
              </div>

              <div
                className="
                  flex
                  justify-between
                  gap-3
                  text-[#5F6872]
                  dark:text-[#9CA3AF]
                "
              >
                <span>Status:</span>

                <span
                  className="
                    text-[#18212B]
                    dark:text-[#F3F4F6]
                    font-semibold
                  "
                >
                  {selectedEvent.status ||
                    'NEW'}
                </span>
              </div>

              {/* ------------------------------------------------
                  POTHOLE EVIDENCE IMAGE
              ------------------------------------------------ */}

              {selectedPothole && (
                <div
                  className="
                    pt-2
                    mt-2
                    border-t
                    border-[#E1E5E8]
                    dark:border-[#334155]
                  "
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className="
                        flex items-center gap-1.5
                        text-[#5F6872]
                        dark:text-[#9CA3AF]
                        font-semibold
                      "
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#E5484D]" />
                      <span>Detection Evidence</span>
                    </div>

                    {evidenceUrl && (
                      <a
                        href={evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="
                          inline-flex items-center gap-1
                          text-[9px]
                          font-mono
                          text-[#2F6FED]
                          hover:underline
                        "
                        title="Open evidence image"
                      >
                        OPEN
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  {evidenceUrl ? (
                    <div
                      className="
                        relative
                        w-full
                        overflow-hidden
                        rounded-md
                        border
                        border-[#CBD0D5]
                        dark:border-[#475569]
                        bg-[#F4F5F2]
                        dark:bg-[#0F172A]
                      "
                    >
                      {isEvidenceImageLoading && (
                        <div
                          className="
                            absolute inset-0
                            flex items-center justify-center
                            bg-white/70
                            dark:bg-[#0F172A]/70
                            z-10
                          "
                        >
                          <Loader2
                            className="
                              w-5 h-5
                              text-[#2F6FED]
                              animate-spin
                            "
                          />
                        </div>
                      )}

                      <img
                        src={evidenceUrl}
                        alt={`Pothole ${selectedPothole.pothole_id || 'detection'} evidence`}
                        className="
                          block
                          w-full
                          h-40
                          object-cover
                          bg-[#E8EAE6]
                          dark:bg-[#131b28]
                        "
                        loading="eager"
                        onLoad={() => {
                          setIsEvidenceImageLoading(false);
                          setEvidenceImageError(false);
                        }}
                        onError={() => {
                          // If the full snapshot fails, fall back to crop_path.
                          setIsEvidenceImageLoading(false);
                          setEvidenceImageError(true);
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className="
                        h-24
                        rounded-md
                        border
                        border-dashed
                        border-[#CBD0D5]
                        dark:border-[#475569]
                        bg-[#F4F5F2]
                        dark:bg-[#0F172A]
                        flex items-center justify-center
                        text-[10px]
                        font-mono
                        text-[#5F6872]
                        dark:text-[#9CA3AF]
                        text-center
                        px-3
                      "
                    >
                      No pothole snapshot available
                    </div>
                  )}

                  <div
                    className="
                      mt-1.5
                      text-[9px]
                      font-mono
                      text-[#5F6872]
                      dark:text-[#9CA3AF]
                      truncate
                    "
                    title={
                      selectedPothole.snapshot_path ||
                      selectedPothole.crop_path ||
                      'No evidence path'
                    }
                  >
                    {selectedPothole.snapshot_path
                      ? `Snapshot: ${selectedPothole.snapshot_path}`
                      : selectedPothole.crop_path
                        ? `Crop: ${selectedPothole.crop_path}`
                        : 'Evidence path unavailable'}
                  </div>
                </div>
              )}

              {/* LOCATION */}

              <div
                className="
                  pt-1.5
                  mt-1
                  border-t
                  border-[#E1E5E8]
                  dark:border-[#334155]
                "
              >
                <div
                  className="
                    flex
                    items-start
                    gap-1.5
                    text-[#5F6872]
                    dark:text-[#9CA3AF]
                  "
                >
                  <MapPin
                    className="
                      w-3
                      h-3
                      mt-0.5
                      flex-shrink-0
                      text-[#2F6FED]
                    "
                  />

                  <span
                    className="
                      leading-4
                      text-[#18212B]
                      dark:text-[#F3F4F6]
                    "
                  >
                    {isLoadingLocation ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Locating...
                      </span>
                    ) : (
                      locationName ||
                      'Location unavailable'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}