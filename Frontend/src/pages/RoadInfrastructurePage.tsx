import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  ZoomIn,
  ShieldCheck,
  ImageOff,
  ExternalLink,
} from 'lucide-react';

import { getPotholeEvents } from '../api/events';
import { PotholeEvent } from '../types/events';
import ApiStatusNotice from '../components/ui/ApiStatusNotice';
import Loader from '../components/ui/Loader';

import {
  formatGps,
  formatConfidencePercent,
  formatTimestamp,
} from '../utils/formatters';

// =========================================================
// URL NORMALIZATION
// =========================================================

/**
 * Backend may return either:
 *
 * 1. Raw URL
 *    https://....jpg
 *
 * 2. Markdown URL
 *    [https://....jpg](https://....jpg)
 *
 * This function converts both into a real image URL.
 *
 * No URL is invented.
 */
function normalizeEvidenceUrl(
  value: string | null | undefined
): string | null {
  if (!value) return null;

  const raw = value.trim();

  if (!raw) return null;

  // -------------------------------------------------------
  // RAW HTTP / HTTPS URL
  // -------------------------------------------------------

  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://')
  ) {
    return raw;
  }

  // -------------------------------------------------------
  // MARKDOWN LINK
  //
  // [https://example.com/image.jpg](https://example.com/image.jpg)
  // -------------------------------------------------------

  const markdownMatch = raw.match(
    /^\[[^\]]*\]\((https?:\/\/[^)\s]+)\)$/
  );

  if (markdownMatch?.[1]) {
    return markdownMatch[1];
  }

  // -------------------------------------------------------
  // Sometimes the backend may contain a URL somewhere
  // inside the string.
  // -------------------------------------------------------

  const urlMatch = raw.match(
    /(https?:\/\/[^\s)]+)/
  );

  if (urlMatch?.[1]) {
    return urlMatch[1];
  }

  return null;
}

// =========================================================
// EVIDENCE URLS
// =========================================================

function getSnapshotUrl(
  item: PotholeEvent | null
): string | null {
  if (!item) return null;

  return normalizeEvidenceUrl(
    item.snapshot_path
  );
}

function getCropUrl(
  item: PotholeEvent | null
): string | null {
  if (!item) return null;

  return normalizeEvidenceUrl(
    item.crop_path
  );
}

/**
 * Snapshot has priority.
 * Crop is fallback.
 */
function getEvidenceUrl(
  item: PotholeEvent | null
): string | null {
  if (!item) return null;

  return (
    getSnapshotUrl(item) ||
    getCropUrl(item)
  );
}

function isValidImageUrl(
  value: string | null
): boolean {
  if (!value) return false;

  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/') ||
    value.startsWith('blob:')
  );
}

// =========================================================
// EVIDENCE IMAGE
// =========================================================

function EvidenceImage({
  src,
  fallbackSrc,
  alt,
  className = '',
}: {
  src: string;
  fallbackSrc?: string | null;
  alt: string;
  className?: string;
}) {
  const [currentSrc, setCurrentSrc] =
    useState<string>(src);

  const [failed, setFailed] =
    useState(false);

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
    setLoaded(false);
  }, [src]);

  const handleImageError = () => {
    // -----------------------------------------------------
    // If snapshot fails, automatically try crop.
    // -----------------------------------------------------

    if (
      fallbackSrc &&
      fallbackSrc !== currentSrc &&
      isValidImageUrl(fallbackSrc)
    ) {
      setCurrentSrc(fallbackSrc);
      setLoaded(false);
      return;
    }

    setFailed(true);
  };

  if (
    !isValidImageUrl(currentSrc) ||
    failed
  ) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#0f172a] text-[#94a3b8] ${className}`}
      >
        <ImageOff className="w-6 h-6 mb-2" />

        <span className="text-[11px]">
          Evidence image unavailable
        </span>

        <span className="text-[9px] mt-1 opacity-70">
          Snapshot and crop could not be loaded
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-black ${className}`}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-[#94a3b8] text-[10px] z-10">
          Loading image...
        </div>
      )}

      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity ${
          loaded
            ? 'opacity-100'
            : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        onError={handleImageError}
      />
    </div>
  );
}

// =========================================================
// PAGE
// =========================================================

export default function RoadInfrastructurePage() {
  const [potholes, setPotholes] =
    useState<PotholeEvent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [isFallback, setIsFallback] =
    useState(false);

  const [
    inspectedPothole,
    setInspectedPothole,
  ] = useState<PotholeEvent | null>(null);

  // =======================================================
  // FETCH
  // =======================================================

  const fetchPotholes = async () => {
    setLoading(true);
    setError(null);

    try {
      const res =
        await getPotholeEvents();

      if (res.error) {
        setError(res.error);
      }

      setIsFallback(
        res.isFallback
      );

      setPotholes(
        res.data || []
      );
    } catch (err) {
      console.error(
        'Failed to load potholes:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load pothole events'
      );

      setPotholes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPotholes();
  }, []);

  // =======================================================
  // INSPECTED EVIDENCE
  // =======================================================

  const inspectedSnapshotUrl =
    useMemo(
      () =>
        getSnapshotUrl(
          inspectedPothole
        ),
      [inspectedPothole]
    );

  const inspectedCropUrl =
    useMemo(
      () =>
        getCropUrl(
          inspectedPothole
        ),
      [inspectedPothole]
    );

  const inspectedEvidenceUrl =
    useMemo(
      () =>
        getEvidenceUrl(
          inspectedPothole
        ),
      [inspectedPothole]
    );

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="space-y-4">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex items-center justify-between pb-1 border-b border-[#E1E5E8] dark:border-[#334155]">

        <div>
          <h2 className="text-base font-bold text-[#18212B] dark:text-[#f3f4f6]">
            Road Infrastructure & Pothole Surveillance
          </h2>

          <p className="text-xs text-[#5F6872] dark:text-[#9ca3af] mt-0.5">
            Automated optical edge detection feeds from transit vehicle
            roof/dash cameras · GET /api/events?event_type=POTHOLE
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPotholes}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-[#1e293b] border border-[#CBD0D5] dark:border-[#475569] rounded-lg text-xs font-medium text-[#18212B] dark:text-[#f3f4f6] hover:bg-[#F4F5F2] dark:hover:bg-[#283548] transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              loading
                ? 'animate-spin'
                : ''
            }`}
          />

          <span>
            Refresh Potholes
          </span>
        </button>
      </div>

      {/* ================================================= */}
      {/* API STATUS */}
      {/* ================================================= */}

      <ApiStatusNotice
        isFallback={isFallback}
        error={error}
        onRetry={fetchPotholes}
        isLoading={loading}
      />

      {/* ================================================= */}
      {/* LOADING */}
      {/* ================================================= */}

      {loading ? (

        <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-12">
          <Loader label="Querying pothole telemetry from FastAPI backend..." />
        </div>

      ) : potholes.length === 0 ? (

        /* ================================================= */
        /* EMPTY */
        /* ================================================= */

        <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-12 text-center text-xs text-[#5F6872]">
          No road infrastructure potholes detected.
          All monitored corridors nominal.
        </div>

      ) : (

        /* ================================================= */
        /* TABLE */
        /* ================================================= */

        <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg overflow-hidden shadow-xs">

          {/* TABLE HEADER */}

          <div className="h-10 px-3.5 border-b border-[#E1E5E8] dark:border-[#334155] bg-[#FAFAFA] dark:bg-[#1e293b]/80 flex items-center justify-between text-xs">

            <span className="font-semibold text-[#18212B] dark:text-[#f3f4f6]">
              Detected Defects ({potholes.length} Events)
            </span>

            <span className="font-mono text-[11px] text-[#5F6872] dark:text-[#9ca3af]">
              Supabase Storage Evidence
            </span>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs border-collapse">

              <thead>
                <tr className="bg-[#F4F5F2] dark:bg-[#131b28] border-b border-[#E1E5E8] dark:border-[#334155] text-[11px] uppercase text-[#5F6872] dark:text-[#9ca3af] tracking-wider">

                  <th className="py-2.5 px-3.5 font-semibold">
                    Pothole ID
                  </th>

                  <th className="py-2.5 px-3.5 font-semibold">
                    Bus ID
                  </th>

                  <th className="py-2.5 px-3.5 font-semibold">
                    Location (GPS)
                  </th>

                  <th className="py-2.5 px-3.5 font-semibold">
                    Confidence
                  </th>

                  <th className="py-2.5 px-3.5 font-semibold">
                    Size Category
                  </th>

                  <th className="py-2.5 px-3.5 font-semibold">
                    Timestamp
                  </th>

                  <th className="py-2.5 px-3.5 font-semibold">
                    Status
                  </th>

                  <th className="py-2.5 px-3.5 font-semibold text-right">
                    Evidence
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-[#E1E5E8] dark:divide-[#334155] bg-white dark:bg-[#1e293b]">

                {potholes.map((item) => {

                  const snapshotUrl =
                    getSnapshotUrl(item);

                  const cropUrl =
                    getCropUrl(item);

                  const evidenceUrl =
                    snapshotUrl ||
                    cropUrl;

                  return (
                    <tr
                      key={String(
                        item.pothole_id
                      )}
                      className="hover:bg-[#EEF4FF]/50 dark:hover:bg-[#253347] transition-colors cursor-pointer"
                      onClick={() =>
                        setInspectedPothole(
                          item
                        )
                      }
                    >

                      {/* ID */}

                      <td className="py-3 px-3.5 font-mono font-semibold text-[#18212B] dark:text-[#f3f4f6]">
                        {item.pothole_id}
                      </td>

                      {/* BUS */}

                      <td className="py-3 px-3.5 font-mono text-[#0055ce] dark:text-blue-400 font-semibold">
                        {item.bus_id}
                      </td>

                      {/* GPS */}

                      <td className="py-3 px-3.5 font-mono text-[11px] text-[#5F6872] dark:text-[#9ca3af]">
                        {formatGps(
                          item.latitude,
                          item.longitude
                        )}
                      </td>

                      {/* CONFIDENCE */}

                      <td className="py-3 px-3.5">
                        <span className="font-mono font-bold text-[#E5484D]">
                          {formatConfidencePercent(
                            item.confidence
                          )}
                        </span>
                      </td>

                      {/* SIZE */}

                      <td className="py-3 px-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold border bg-red-50 dark:bg-red-950/40 text-[#E5484D] border-red-200 dark:border-red-800">
                          {item.size_category}
                        </span>
                      </td>

                      {/* TIME */}

                      <td className="py-3 px-3.5 font-mono text-[11px] text-[#5F6872] dark:text-[#9ca3af]">
                        {formatTimestamp(
                          item.timestamp
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="py-3 px-3.5">

                        <span className="inline-flex items-center space-x-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">

                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" />

                          <span>
                            {item.status}
                          </span>

                        </span>

                      </td>

                      {/* EVIDENCE */}

                      <td className="py-3 px-3.5 text-right">

                        {evidenceUrl ? (

                          <div className="inline-flex items-center space-x-1.5 group">

                            <div className="w-14 h-9 rounded border border-[#CBD0D5] dark:border-[#475569] overflow-hidden bg-black">

                              <EvidenceImage
                                src={evidenceUrl}
                                fallbackSrc={
                                  snapshotUrl &&
                                  cropUrl &&
                                  snapshotUrl !== cropUrl
                                    ? cropUrl
                                    : null
                                }
                                alt={`Pothole ${item.pothole_id}`}
                                className="w-full h-full"
                              />

                            </div>

                            <ZoomIn className="w-3.5 h-3.5 text-[#5F6872] group-hover:text-primary" />

                          </div>

                        ) : (

                          <span className="inline-flex items-center space-x-1 text-[10px] text-[#89919A]">

                            <ImageOff className="w-3 h-3" />

                            <span>
                              No snapshot
                            </span>

                          </span>

                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* EVIDENCE MODAL */}
      {/* ================================================= */}

      {inspectedPothole && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() =>
            setInspectedPothole(null)
          }
        >

          <div
            className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden p-5 space-y-4"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-center justify-between pb-2 border-b border-[#E1E5E8] dark:border-[#334155]">

              <div className="flex items-center gap-2">

                <ShieldCheck className="w-4 h-4 text-emerald-500" />

                <span className="font-bold text-sm text-[#18212B] dark:text-[#f3f4f6]">
                  Pothole Evidence ·{' '}
                  {inspectedPothole.pothole_id}
                </span>

              </div>

              <button
                type="button"
                onClick={() =>
                  setInspectedPothole(null)
                }
                className="text-xs px-2 py-1 rounded bg-[#F4F5F2] dark:bg-[#334155] text-[#18212B] dark:text-[#f3f4f6] hover:bg-[#e5e7eb] dark:hover:bg-[#475569]"
              >
                Close
              </button>

            </div>

            {/* ================================================= */}
            {/* IMAGE */}
            {/* ================================================= */}

            {inspectedEvidenceUrl ? (

              <div className="rounded-lg overflow-hidden border border-[#CBD0D5] dark:border-[#475569] bg-black">

                <div className="min-h-[260px] max-h-[480px]">

                  <EvidenceImage
                    src={
                      inspectedEvidenceUrl
                    }
                    fallbackSrc={
                      inspectedSnapshotUrl &&
                      inspectedCropUrl &&
                      inspectedSnapshotUrl !==
                        inspectedCropUrl
                        ? inspectedCropUrl
                        : null
                    }
                    alt={`Pothole ${inspectedPothole.pothole_id} evidence`}
                    className="w-full h-full min-h-[260px] max-h-[480px]"
                  />

                </div>

              </div>

            ) : (

              <div className="p-8 text-center text-xs text-[#5F6872] bg-[#F4F5F2] dark:bg-[#131b28] rounded-lg">

                <ImageOff className="w-8 h-8 mx-auto mb-2 opacity-50" />

                No storage snapshot image provided
                for this record.

              </div>

            )}

            {/* ================================================= */}
            {/* SOURCE PATHS */}
            {/* ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              {/* SNAPSHOT */}

              <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-3">

                <div className="text-[10px] uppercase tracking-wider text-[#64748b] mb-1">
                  Original Snapshot
                </div>

                <div className="font-mono text-[10px] text-[#cbd5e1] break-all">
                  {inspectedSnapshotUrl ||
                    'N/A'}
                </div>

              </div>

              {/* CROP */}

              <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-3">

                <div className="text-[10px] uppercase tracking-wider text-[#64748b] mb-1">
                  Cropped Pothole
                </div>

                <div className="font-mono text-[10px] text-[#cbd5e1] break-all">
                  {inspectedCropUrl ||
                    'N/A'}
                </div>

              </div>

            </div>

            {/* ================================================= */}
            {/* DETAILS */}
            {/* ================================================= */}

            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#F4F5F2] dark:bg-[#131b28] p-3 rounded-lg border border-[#E1E5E8] dark:border-[#334155]">

              <div>
                Bus:{' '}
                <strong className="text-primary">
                  {inspectedPothole.bus_id}
                </strong>
              </div>

              <div>
                Confidence:{' '}
                <strong className="text-[#E5484D]">
                  {formatConfidencePercent(
                    inspectedPothole.confidence
                  )}
                </strong>
              </div>

              <div>
                Coordinates:{' '}
                <strong>
                  {formatGps(
                    inspectedPothole.latitude,
                    inspectedPothole.longitude
                  )}
                </strong>
              </div>

              <div>
                Status:{' '}
                <strong>
                  {inspectedPothole.status}
                </strong>
              </div>

              <div>
                Size:{' '}
                <strong>
                  {inspectedPothole.size_category}
                </strong>
              </div>

              <div>
                Width:{' '}
                <strong>
                  {inspectedPothole.width_px ??
                    'N/A'}{' '}
                  px
                </strong>
              </div>

              <div>
                Height:{' '}
                <strong>
                  {inspectedPothole.height_px ??
                    'N/A'}{' '}
                  px
                </strong>
              </div>

              <div>
                Area:{' '}
                <strong>
                  {inspectedPothole.area_px ??
                    'N/A'}{' '}
                  px
                </strong>
              </div>

            </div>

            {/* ================================================= */}
            {/* OPEN ORIGINAL SNAPSHOT */}
            {/* ================================================= */}

            {inspectedSnapshotUrl &&
              isValidImageUrl(
                inspectedSnapshotUrl
              ) && (

                <div className="flex justify-end gap-2">

                  <a
                    href={
                      inspectedSnapshotUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] text-white text-xs hover:bg-[#334155]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />

                    Open Original Snapshot
                  </a>

                  {inspectedCropUrl &&
                    isValidImageUrl(
                      inspectedCropUrl
                    ) && (
                      <a
                        href={
                          inspectedCropUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#334155] text-white text-xs hover:bg-[#475569]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />

                        Open Crop
                      </a>
                    )}

                </div>
              )}

          </div>

        </div>
      )}

    </div>
  );
}