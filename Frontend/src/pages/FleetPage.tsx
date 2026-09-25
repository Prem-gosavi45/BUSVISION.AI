import React, { useEffect, useState } from 'react';
import { Bus, MapPin, RefreshCw, Activity, Gauge, Clock, ShieldAlert } from 'lucide-react';
import { getBuses } from '../api/buses';
import { getBusGps } from '../api/gps';
import { BusSummary } from '../types/buses';
import { BusGpsFix } from '../types/gps';
import ApiStatusNotice from '../components/ui/ApiStatusNotice';
import Loader from '../components/ui/Loader';
import { formatGps, formatTimestamp, formatVehicleCount } from '../utils/formatters';

export default function FleetPage() {
  const [buses, setBuses] = useState<BusSummary[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [selectedGps, setSelectedGps] = useState<BusGpsFix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const fetchBusesData = async () => {
    setLoading(true);
    setError(null);
    const res = await getBuses();
    if (res.error) {
      setError(res.error);
    }
    setIsFallback(res.isFallback);
    setBuses(res.data || []);
    if (res.data && res.data.length > 0 && !selectedBusId) {
      setSelectedBusId(res.data[0].bus_id);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBusesData();
  }, []);

  useEffect(() => {
    if (!selectedBusId) return;
    let isCancelled = false;

    async function loadGps() {
      setGpsLoading(true);
      const res = await getBusGps(selectedBusId!);
      if (!isCancelled) {
        setSelectedGps(res.data);
        setGpsLoading(false);
      }
    }

    loadGps();
    return () => {
      isCancelled = true;
    };
  }, [selectedBusId]);

  const activeBus = buses.find((b) => b.bus_id === selectedBusId);

  return (
    <div className="space-y-3.5">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E1E5E8] dark:border-[#334155]">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#18212B] dark:text-[#F3F4F6]">
            Transit Fleet Telemetry
          </h2>
          <p className="text-[11px] text-[#5F6872] dark:text-[#9CA3AF] mt-0.5">
            Active urban municipal bus fleet units, route telemetry, and GPS fixes · PMC Transit Network
          </p>
        </div>
        <button
          type="button"
          onClick={fetchBusesData}
          disabled={loading}
          className="flex items-center space-x-1.5 px-2.5 py-1 bg-white dark:bg-[#111827] border border-[#CBD0D5] dark:border-[#334155] rounded text-[11px] font-mono font-medium text-[#18212B] dark:text-[#F3F4F6] hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>POLL FLEET</span>
        </button>
      </div>

      {/* API Status Notice */}
      <ApiStatusNotice
        isFallback={isFallback}
        error={error}
        onRetry={fetchBusesData}
        isLoading={loading}
      />

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded-md p-10">
          <Loader label="Synchronizing bus fleet telemetry via FastAPI (GET /api/buses)..." />
        </div>
      ) : buses.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded-md p-10 text-center text-xs text-[#5F6872]">
          No active buses reported by the API.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Buses List Table (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded-md overflow-hidden">
            <div className="h-9 px-3.5 border-b border-[#E1E5E8] dark:border-[#334155] bg-[#FAFAFA] dark:bg-[#1E293B]/70 flex items-center justify-between text-xs">
              <span className="font-semibold text-[12px] uppercase tracking-wide text-[#18212B] dark:text-[#F3F4F6]">
                Registered Units ({buses.length})
              </span>
              <span className="font-mono text-[10px] text-[#5F6872] dark:text-[#9CA3AF]">
                ENDPOINT: GET /api/buses
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F4F5F2]/80 dark:bg-[#0B0F17] border-b border-[#E1E5E8] dark:border-[#334155] text-[10px] uppercase text-[#5F6872] dark:text-[#9CA3AF] font-mono tracking-wider">
                    <th className="py-2 px-3 font-semibold">BUS ID</th>
                    <th className="py-2 px-3 font-semibold">CORRIDOR / ROUTE</th>
                    <th className="py-2 px-3 font-semibold">GPS FIX</th>
                    <th className="py-2 px-3 font-semibold">STATUS</th>
                    <th className="py-2 px-3 font-semibold">LAST TELEMETRY</th>
                    <th className="py-2 px-3 font-semibold">VEHICLES</th>
                    <th className="py-2 px-3 font-semibold">TRAFFIC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E5E8]/80 dark:divide-[#334155]/80 bg-white dark:bg-[#111827]">
                  {buses.map((bus) => {
                    const isSelected = bus.bus_id === selectedBusId;
                    return (
                      <tr
                        key={bus.bus_id}
                        onClick={() => setSelectedBusId(bus.bus_id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#EEF4FF] dark:bg-[#1E293B]/80'
                            : 'hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B]/40'
                        }`}
                      >
                        <td className="py-2 px-3 font-mono font-semibold text-[#2F6FED] dark:text-[#3B82F6]">
                          {bus.bus_id}
                        </td>
                        <td className="py-2 px-3 text-[#18212B] dark:text-[#F3F4F6] text-[11.5px]">
                          {bus.route || 'Urban Transit Corridor'}
                        </td>
                        <td className="py-2 px-3 font-mono text-[10.5px] text-[#5F6872] dark:text-[#9CA3AF]">
                          {formatGps(bus.latitude, bus.longitude)}
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[9.5px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" />
                            <span>{bus.status}</span>
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[10.5px] text-[#5F6872] dark:text-[#9CA3AF]">
                          {bus.last_update || '—'}
                        </td>
                        <td className="py-2 px-3 font-semibold font-mono text-[11px] text-[#18212B] dark:text-[#F3F4F6] tabular-nums">
                          {formatVehicleCount(bus.vehicle_count)}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold ${
                            bus.traffic_level === 'HIGH'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {bus.traffic_level || 'NOMINAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bus Telemetry Inspector (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded-md p-3.5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E5E8] dark:border-[#334155]">
                <div className="flex items-center space-x-2">
                  <Bus className="w-3.5 h-3.5 text-[#2F6FED] dark:text-[#3B82F6]" />
                  <span className="font-mono font-bold text-xs uppercase text-[#18212B] dark:text-[#F3F4F6]">
                    {selectedBusId || 'Select Unit'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#5F6872] dark:text-[#9CA3AF]">
                  GET /gps/{selectedBusId}
                </span>
              </div>

              {gpsLoading ? (
                <div className="py-8">
                  <Loader size="sm" label="Fetching GPS fix..." />
                </div>
              ) : selectedGps ? (
                <div className="mt-2.5 space-y-2 text-xs font-mono">
                  <div className="p-2.5 bg-[#F4F5F2] dark:bg-[#0B0F17] rounded border border-[#E1E5E8] dark:border-[#334155] space-y-1.5">
                    <div className="flex justify-between text-[#5F6872] dark:text-[#9CA3AF]">
                      <span>LATITUDE:</span>
                      <span className="text-[#18212B] dark:text-[#F3F4F6] font-semibold">
                        {selectedGps.latitude != null ? selectedGps.latitude.toFixed(6) : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#5F6872] dark:text-[#9CA3AF]">
                      <span>LONGITUDE:</span>
                      <span className="text-[#18212B] dark:text-[#F3F4F6] font-semibold">
                        {selectedGps.longitude != null ? selectedGps.longitude.toFixed(6) : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#5F6872] dark:text-[#9CA3AF]">
                      <span>SPEED:</span>
                      <span className="text-[#18212B] dark:text-[#F3F4F6]">
                        {selectedGps.speed_kmh != null ? `${selectedGps.speed_kmh} km/h` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#5F6872] dark:text-[#9CA3AF]">
                      <span>HEADING:</span>
                      <span className="text-[#18212B] dark:text-[#F3F4F6]">
                        {selectedGps.heading_deg != null ? `${selectedGps.heading_deg}°` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#5F6872] dark:text-[#9CA3AF]">
                      <span>ACCURACY:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {selectedGps.accuracy_m != null ? `±${selectedGps.accuracy_m} m` : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-sans mt-2">
                    <span className="text-[#5F6872] dark:text-[#9CA3AF] text-[10.5px] uppercase font-mono block">
                      Assigned Municipal Corridor
                    </span>
                    <span className="font-semibold text-[#18212B] dark:text-[#F3F4F6] text-[12px] block">
                      {activeBus?.route || 'Pune Municipal BRTS Line'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#5F6872] py-4">No GPS telemetry available.</div>
              )}
            </div>

            <div className="pt-2 border-t border-[#E1E5E8] dark:border-[#334155] text-[10px] font-mono text-[#5F6872] dark:text-[#9CA3AF]">
              FASTAPI LIVE ENDPOINT: <span className="text-[#2F6FED]">/api/buses</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
