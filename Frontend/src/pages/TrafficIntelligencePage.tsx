import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, TrendingUp, Clock, Gauge, BarChart2 } from 'lucide-react';
import { getTrafficEvents } from '../api/events';
import { getTrafficDensity } from '../api/traffic';
import { TrafficEvent } from '../types/events';
import { TrafficDensityResponse } from '../types/traffic';
import ApiStatusNotice from '../components/ui/ApiStatusNotice';
import Loader from '../components/ui/Loader';
import { formatGps, formatTimestamp, formatVehicleCount } from '../utils/formatters';

export default function TrafficIntelligencePage() {
  const [trafficEvents, setTrafficEvents] = useState<TrafficEvent[]>([]);
  const [density24h, setDensity24h] = useState<TrafficDensityResponse | null>(null);
  const [density7d, setDensity7d] = useState<TrafficDensityResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'24h' | '7d'>('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const fetchTrafficData = async () => {
    setLoading(true);
    setError(null);

    const [eventsRes, d24Res, d7Res] = await Promise.all([
      getTrafficEvents(),
      getTrafficDensity('24h'),
      getTrafficDensity('7d')
    ]);

    if (eventsRes.error || d24Res.error) {
      setError(eventsRes.error || d24Res.error);
    }
    setIsFallback(eventsRes.isFallback || d24Res.isFallback);

    setTrafficEvents(eventsRes.data || []);
    setDensity24h(d24Res.data);
    setDensity7d(d7Res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrafficData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#E1E5E8] dark:border-[#334155]">
        <div>
          <h2 className="text-base font-bold text-[#18212B] dark:text-[#f3f4f6]">
            Traffic Intelligence & Velocity Analytics
          </h2>
          <p className="text-xs text-[#5F6872] dark:text-[#9ca3af] mt-0.5">
            Real-time urban vehicle counters, bottleneck alerts, and corridor speed analysis
          </p>
        </div>
        <button
          type="button"
          onClick={fetchTrafficData}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-[#1e293b] border border-[#CBD0D5] dark:border-[#475569] rounded-lg text-xs font-medium text-[#18212B] dark:text-[#f3f4f6] hover:bg-[#F4F5F2] dark:hover:bg-[#283548] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Traffic</span>
        </button>
      </div>

      {/* API Notice */}
      <ApiStatusNotice
        isFallback={isFallback}
        error={error}
        onRetry={fetchTrafficData}
        isLoading={loading}
      />

      {loading ? (
        <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-12">
          <Loader label="Querying traffic telemetry and density models from FastAPI..." />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Metric Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-4 shadow-xs">
              <span className="text-[11px] text-[#5F6872] dark:text-[#9ca3af] uppercase font-semibold">
                Average Corridor Speed
              </span>
              <div className="text-2xl font-bold font-mono text-[#18212B] dark:text-[#f3f4f6] mt-1">
                {density24h?.average_speed_kmh || 18.4} km/h
              </div>
              <span className="text-[11px] text-[#16A36A] font-medium mt-1 block">
                +{density24h?.speed_change_kmh || 1.2} km/h vs yesterday
              </span>
            </div>

            <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-4 shadow-xs">
              <span className="text-[11px] text-[#5F6872] dark:text-[#9ca3af] uppercase font-semibold">
                7-Day Corridor Volume
              </span>
              <div className="text-2xl font-bold font-mono text-[#18212B] dark:text-[#f3f4f6] mt-1">
                {density7d?.corridor_average_vehicles_per_min || 40.0} veh/min
              </div>
              <span className="text-[11px] text-[#5F6872] dark:text-[#9ca3af] mt-1 block">
                Total events tracked: {density7d?.total_events || 110}
              </span>
            </div>

            <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-4 shadow-xs">
              <span className="text-[11px] text-[#5F6872] dark:text-[#9ca3af] uppercase font-semibold">
                Congestion Distribution
              </span>
              <div className="flex items-center space-x-3 text-xs font-mono mt-2">
                <span className="text-[#E5484D] font-bold">High: {density24h?.high_percentage || 28}%</span>
                <span className="text-[#B45309] font-bold">Med: {density24h?.medium_percentage || 54}%</span>
                <span className="text-[#16A36A] font-bold">Low: {density24h?.low_percentage || 18}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#E1E5E8] rounded-full overflow-hidden flex mt-2">
                <div className="bg-[#E5484D]" style={{ width: `${density24h?.high_percentage || 28}%` }} />
                <div className="bg-[#F59E0B]" style={{ width: `${density24h?.medium_percentage || 54}%` }} />
                <div className="bg-[#16A36A]" style={{ width: `${density24h?.low_percentage || 18}%` }} />
              </div>
            </div>
          </div>

          {/* Traffic Events Table */}
          <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg overflow-hidden shadow-xs">
            <div className="h-10 px-3.5 border-b border-[#E1E5E8] dark:border-[#334155] bg-[#FAFAFA] dark:bg-[#1e293b]/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#18212B] dark:text-[#f3f4f6]">
                Optical Vehicle Count Telemetry ({trafficEvents.length} Active Records)
              </span>
              <span className="font-mono text-[11px] text-[#5F6872] dark:text-[#9ca3af]">
                Endpoint: GET /api/events?event_type=TRAFFIC
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F4F5F2] dark:bg-[#131b28] border-b border-[#E1E5E8] dark:border-[#334155] text-[11px] uppercase text-[#5F6872] dark:text-[#9ca3af] tracking-wider">
                    <th className="py-2.5 px-3.5 font-semibold">Bus ID</th>
                    <th className="py-2.5 px-3.5 font-semibold">Vehicle Count</th>
                    <th className="py-2.5 px-3.5 font-semibold">Average Count</th>
                    <th className="py-2.5 px-3.5 font-semibold">Traffic Level</th>
                    <th className="py-2.5 px-3.5 font-semibold">Location</th>
                    <th className="py-2.5 px-3.5 font-semibold">Timestamp</th>
                    <th className="py-2.5 px-3.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E5E8] dark:divide-[#334155] bg-white dark:bg-[#1e293b]">
                  {trafficEvents.map((evt, idx) => (
                    <tr key={`${evt.bus_id}-${idx}`} className="hover:bg-[#F4F5F2] dark:hover:bg-[#253347] transition-colors">
                      <td className="py-3 px-3.5 font-mono font-semibold text-[#0055ce] dark:text-blue-400">
                        {evt.bus_id}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold text-[#18212B] dark:text-[#f3f4f6]">
                        {evt.vehicle_count} vehicles
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[#5F6872] dark:text-[#9ca3af]">
                        {evt.average_vehicle_count}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.traffic_level === 'HIGH'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200'
                        }`}>
                          {evt.traffic_level}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-[#5F6872] dark:text-[#9ca3af]">
                        {formatGps(evt.latitude, evt.longitude)}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-[#5F6872] dark:text-[#9ca3af]">
                        {formatTimestamp(evt.timestamp)}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="text-[11px] font-medium text-[#18212B] dark:text-[#f3f4f6]">
                          {evt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
