import React, { useEffect, useState } from 'react';
import GisMap from '../components/sections/GisMap';
import { getBuses } from '../api/buses';
import { getEvents } from '../api/events';
import { BusSummary } from '../types/buses';
import { BusVisionEvent } from '../types/events';
import ApiStatusNotice from '../components/ui/ApiStatusNotice';
import Loader from '../components/ui/Loader';
import { RefreshCw } from 'lucide-react';

export default function LiveMapPage() {
  const [buses, setBuses] = useState<BusSummary[]>([]);
  const [events, setEvents] = useState<BusVisionEvent[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>('BUS_101');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const fetchMapData = async () => {
    setLoading(true);
    setError(null);
    const [busesRes, eventsRes] = await Promise.all([getBuses(), getEvents()]);
    if (busesRes.error || eventsRes.error) {
      setError(busesRes.error || eventsRes.error);
    }
    setIsFallback(busesRes.isFallback || eventsRes.isFallback);
    setBuses(busesRes.data || []);
    setEvents(eventsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="flex items-center justify-between pb-1 border-b border-[#E1E5E8] dark:border-[#334155] flex-shrink-0">
        <div>
          <h2 className="text-base font-bold text-[#18212B] dark:text-[#f3f4f6]">
            Full GIS Live Fleet & Sensor Map
          </h2>
          <p className="text-xs text-[#5F6872] dark:text-[#9ca3af] mt-0.5">
            Real-time geospatial telemetry grid · Prepared for MapLibre GL JS vector ingestion
          </p>
        </div>
        <button
          type="button"
          onClick={fetchMapData}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-[#1e293b] border border-[#CBD0D5] dark:border-[#475569] rounded-lg text-xs font-medium text-[#18212B] dark:text-[#f3f4f6] hover:bg-[#F4F5F2] dark:hover:bg-[#283548] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Map</span>
        </button>
      </div>

      <ApiStatusNotice
        isFallback={isFallback}
        error={error}
        onRetry={fetchMapData}
        isLoading={loading}
      />

      {loading ? (
        <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-16 flex-1 flex items-center justify-center">
          <Loader label="Plotting real-time transit telemetry coordinates..." />
        </div>
      ) : (
        <div className="flex-1 min-h-[580px]">
          <GisMap
            buses={buses}
            events={events}
            selectedBusId={selectedBusId}
            onSelectBus={(b) => setSelectedBusId(b.bus_id)}
          />
        </div>
      )}
    </div>
  );
}
