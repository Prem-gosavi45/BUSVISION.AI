import React from 'react';
import HeroSection, { HeroSectionStats } from '../components/sections/HeroSection';
import GisMap from '../components/sections/GisMap';
import RecentAlerts from '../components/sections/RecentAlerts';
import TrafficDensity from '../components/sections/TrafficDensity';
import RecentDetectionsTable from '../components/sections/RecentDetectionsTable';
import { BusSummary } from '../types/buses';
import { BusVisionEvent } from '../types/events';
import { DetectionItem, AlertItem } from '../types';

interface DashboardPageProps {
  buses: BusSummary[];
  events: BusVisionEvent[];
  selectedBusId: string;
  onSelectBus: (bus: BusSummary) => void;
  searchQuery: string;
  alerts: AlertItem[];
  detections: DetectionItem[];
  onSelectAlert: (alert: AlertItem) => void;
  onInspectEvidence: (item: DetectionItem) => void;
  onFilterByCategory: (category: string) => void;
  stats?: HeroSectionStats;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function DashboardPage({
  buses,
  events,
  selectedBusId,
  onSelectBus,
  searchQuery,
  alerts,
  detections,
  onSelectAlert,
  onInspectEvidence,
  onFilterByCategory,
  stats,
  isLoading = false,
  error = null,
  onRetry
}: DashboardPageProps) {
  return (
    <div className="space-y-4">
      {/* Top 4 KPI Metrics Strip */}
      <HeroSection 
        stats={stats} 
        onFilterByCategory={onFilterByCategory} 
        isLoading={isLoading} 
      />

      {/* Middle Section: GIS Map (col-span-8) + Right Stack (col-span-4) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-stretch">
        <div className="xl:col-span-8 flex flex-col">
          <GisMap
            buses={buses}
            events={events}
            selectedBusId={selectedBusId}
            onSelectBus={onSelectBus}
            searchFilter={searchQuery}
          />
        </div>

        <div className="xl:col-span-4 flex flex-col space-y-3.5">
          <RecentAlerts
            alerts={alerts}
            onSelectAlert={onSelectAlert}
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
          />
          <TrafficDensity />
        </div>
      </div>

      {/* Bottom Section: Recent Detections Table (Full Width) */}
      <RecentDetectionsTable
        detections={detections}
        onInspectEvidence={onInspectEvidence}
        searchFilter={searchQuery}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
      />
    </div>
  );
}
