import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, RefreshCw, Car, Activity, Image, ExternalLink } from 'lucide-react';
import { getLatestEvents } from '../api/events';
import { BusVisionEvent, PotholeEvent, TrafficEvent } from '../types/events';
import ApiStatusNotice from '../components/ui/ApiStatusNotice';
import Loader from '../components/ui/Loader';
import { formatGps, formatTimestamp, formatConfidencePercent } from '../utils/formatters';

export default function AlertsPage() {
  const [events, setEvents] = useState<BusVisionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    const res = await getLatestEvents();
    if (res.error) {
      setError(res.error);
    }
    setIsFallback(res.isFallback);
    setEvents(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#E1E5E8] dark:border-[#334155]">
        <div>
          <h2 className="text-base font-bold text-[#18212B] dark:text-[#f3f4f6]">
            Incident & Hazard Alerts
          </h2>
          <p className="text-xs text-[#5F6872] dark:text-[#9ca3af] mt-0.5">
            Mission-critical automated incident feed · Consumes GET /api/events/latest
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAlerts}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-[#1e293b] border border-[#CBD0D5] dark:border-[#475569] rounded-lg text-xs font-medium text-[#18212B] dark:text-[#f3f4f6] hover:bg-[#F4F5F2] dark:hover:bg-[#283548] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Alerts</span>
        </button>
      </div>

      <ApiStatusNotice
        isFallback={isFallback}
        error={error}
        onRetry={fetchAlerts}
        isLoading={loading}
      />

      {loading ? (
        <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-12">
          <Loader label="Synchronizing urgent municipal alerts (GET /api/events/latest)..." />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-12 text-center text-xs text-[#5F6872]">
          No active alerts at this time.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {events.map((evt, idx) => {
            const isPothole = evt.event_type === 'POTHOLE';
            const pothole = isPothole ? (evt as PotholeEvent) : null;
            const traffic = !isPothole ? (evt as TrafficEvent) : null;

            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-4 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {isPothole ? (
                      <AlertTriangle className="w-5 h-5 text-[#E5484D]" />
                    ) : (
                      <Activity className="w-5 h-5 text-[#F59E0B]" />
                    )}
                    <div>
                      <h4 className="font-semibold text-xs text-[#18212B] dark:text-[#f3f4f6]">
                        {isPothole ? `Pothole Hazard (${pothole?.pothole_id})` : `Traffic Surge (${traffic?.traffic_level})`}
                      </h4>
                      <span className="text-[11px] font-mono text-[#5F6872] dark:text-[#9ca3af]">
                        Source: {evt.bus_id}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    isPothole
                      ? 'bg-red-50 text-[#E5484D] border-red-200 dark:bg-red-950/40 dark:border-red-800'
                      : 'bg-amber-50 text-[#B45309] border-amber-200 dark:bg-amber-950/40 dark:border-amber-800'
                  }`}>
                    {isPothole ? pothole?.size_category || 'HIGH' : traffic?.traffic_level || 'MEDIUM'}
                  </span>
                </div>

                <div className="text-xs font-mono bg-[#F4F5F2] dark:bg-[#131b28] p-2.5 rounded border border-[#E1E5E8] dark:border-[#334155] space-y-1">
                  <div className="flex justify-between text-[#5F6872] dark:text-[#9ca3af]">
                    <span>Location GPS:</span>
                    <span className="text-[#18212B] dark:text-[#f3f4f6]">
                      {formatGps(evt.latitude, evt.longitude)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#5F6872] dark:text-[#9ca3af]">
                    <span>Time:</span>
                    <span className="text-[#18212B] dark:text-[#f3f4f6]">
                      {formatTimestamp(evt.timestamp)}
                    </span>
                  </div>
                  {isPothole && (
                    <div className="flex justify-between text-[#5F6872] dark:text-[#9ca3af]">
                      <span>Model Confidence:</span>
                      <span className="text-[#E5484D] font-bold">
                        {formatConfidencePercent(pothole?.confidence)}
                      </span>
                    </div>
                  )}
                  {!isPothole && (
                    <div className="flex justify-between text-[#5F6872] dark:text-[#9ca3af]">
                      <span>Count:</span>
                      <span className="text-[#18212B] dark:text-[#f3f4f6] font-bold">
                        {traffic?.vehicle_count} vehicles (avg {traffic?.average_vehicle_count})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[#5F6872] dark:text-[#9ca3af] text-[11px]">
                    Status: <strong className="text-primary">{evt.status}</strong>
                  </span>
                  {pothole?.snapshot_path && (
                    <button
                      type="button"
                      onClick={() => setSelectedEvidence(pothole.snapshot_path)}
                      className="inline-flex items-center space-x-1 text-primary hover:underline text-xs font-medium"
                    >
                      <Image className="w-3.5 h-3.5" />
                      <span>View Snapshot</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl max-w-lg w-full space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#18212B] dark:text-[#f3f4f6]">Evidence Frame</span>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="text-xs px-2 py-1 bg-[#F4F5F2] dark:bg-[#334155] rounded"
              >
                Close
              </button>
            </div>
            <div className="rounded-lg overflow-hidden border border-[#CBD0D5] bg-black">
              <img src={selectedEvidence} alt="Evidence" className="w-full h-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
