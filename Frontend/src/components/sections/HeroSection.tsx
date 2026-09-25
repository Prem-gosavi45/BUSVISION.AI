import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  indicatorColor: string;
  highlightText: string;
  highlightColor: string;
  metaText: string;
  unit?: string;
  onClick?: () => void;
}

function MetricCard({
  label,
  value,
  indicatorColor,
  highlightText,
  highlightColor,
  metaText,
  unit,
  onClick,
}: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded-md p-3.5 flex flex-col justify-between transition-colors ${
        onClick ? 'hover:border-[#2F6FED] dark:hover:border-[#3B82F6] cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#5F6872] dark:text-[#9CA3AF] uppercase font-semibold tracking-wider font-sans">
          {label}
        </span>
        <span className={`w-2 h-2 rounded-full ${indicatorColor}`} />
      </div>

      <div className="mt-2">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-[30px] font-bold tracking-tight text-[#18212B] dark:text-[#F3F4F6] font-mono tabular-nums leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-[11px] font-mono text-[#5F6872] dark:text-[#9CA3AF]">
              {unit}
            </span>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-[#E1E5E8]/60 dark:border-[#334155]/60 flex items-center justify-between text-[11px] font-sans">
          <span className={`font-semibold ${highlightColor}`}>{highlightText}</span>
          <span className="text-[#5F6872] dark:text-[#9CA3AF] text-[10.5px] truncate max-w-[120px] text-right">
            {metaText}
          </span>
        </div>
      </div>
    </div>
  );
}

export interface HeroSectionStats {
  activeBuses?: { count: number | string; changeText: string; metaText: string };
  potholes?: { count: number | string; highlightText: string; metaText: string };
  traffic?: { count: number | string; highlightText: string; metaText: string };
  incidents?: { count: number | string; highlightText: string; metaText: string };
}

interface HeroSectionProps {
  stats?: HeroSectionStats;
  onFilterByCategory?: (category: string) => void;
  isLoading?: boolean;
}

export default function HeroSection({ stats, onFilterByCategory, isLoading = false }: HeroSectionProps) {
  // If loading or no data provided, display clear data-driven empty states: "--" and "No data"
  const activeBuses = stats?.activeBuses ?? {
    count: isLoading ? '...' : '--',
    changeText: isLoading ? 'Loading...' : 'No data',
    metaText: isLoading ? 'Checking fleet...' : 'No active buses'
  };

  const potholes = stats?.potholes ?? {
    count: isLoading ? '...' : '--',
    highlightText: isLoading ? 'Loading...' : 'No data',
    metaText: isLoading ? 'Querying hazards...' : 'No hazards reported'
  };

  const traffic = stats?.traffic ?? {
    count: isLoading ? '...' : '--',
    highlightText: isLoading ? 'Loading...' : 'No data',
    metaText: isLoading ? 'Querying traffic...' : 'No traffic events'
  };

  const incidents = stats?.incidents ?? {
    count: isLoading ? '...' : '--',
    highlightText: isLoading ? 'Loading...' : 'No data',
    metaText: isLoading ? 'Querying events...' : 'No road incidents'
  };

  const hasFleetData = activeBuses.count !== '--' && activeBuses.count !== '...';
  const hasPotholeData = potholes.count !== '--' && potholes.count !== '...';
  const hasTrafficData = traffic.count !== '--' && traffic.count !== '...';
  const hasIncidentData = incidents.count !== '--' && incidents.count !== '...';

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 flex-shrink-0">
      {/* Active Fleet */}
      <MetricCard
        label="Active Fleet / En Route"
        value={activeBuses.count}
        indicatorColor={hasFleetData ? 'bg-[#16A36A]' : 'bg-[#CBD0D5] dark:bg-[#475569]'}
        highlightText={activeBuses.changeText}
        highlightColor={hasFleetData ? 'text-[#16A36A]' : 'text-[#5F6872] dark:text-[#9CA3AF]'}
        metaText={activeBuses.metaText}
        unit="BUSES"
        onClick={() => onFilterByCategory?.('fleet')}
      />

      {/* Potholes Detected */}
      <MetricCard
        label="Pothole Hazards"
        value={potholes.count}
        indicatorColor={hasPotholeData ? 'bg-[#E5484D]' : 'bg-[#CBD0D5] dark:bg-[#475569]'}
        highlightText={potholes.highlightText}
        highlightColor={hasPotholeData ? 'text-[#E5484D]' : 'text-[#5F6872] dark:text-[#9CA3AF]'}
        metaText={potholes.metaText}
        unit="DEFECTS"
        onClick={() => onFilterByCategory?.('potholes')}
      />

      {/* Traffic Events */}
      <MetricCard
        label="Congestion Hotspots"
        value={traffic.count}
        indicatorColor={hasTrafficData ? 'bg-[#F59E0B]' : 'bg-[#CBD0D5] dark:bg-[#475569]'}
        highlightText={traffic.highlightText}
        highlightColor={hasTrafficData ? 'text-[#B45309] dark:text-amber-400' : 'text-[#5F6872] dark:text-[#9CA3AF]'}
        metaText={traffic.metaText}
        unit="SECTORS"
        onClick={() => onFilterByCategory?.('traffic')}
      />

      {/* Road Incidents */}
      <MetricCard
        label="Active Road Incidents"
        value={incidents.count}
        indicatorColor={hasIncidentData ? 'bg-[#7C5CFC]' : 'bg-[#CBD0D5] dark:bg-[#475569]'}
        highlightText={incidents.highlightText}
        highlightColor={hasIncidentData ? 'text-[#7C5CFC] dark:text-purple-400' : 'text-[#5F6872] dark:text-[#9CA3AF]'}
        metaText={incidents.metaText}
        unit="EVENTS"
        onClick={() => onFilterByCategory?.('incidents')}
      />
    </section>
  );
}
