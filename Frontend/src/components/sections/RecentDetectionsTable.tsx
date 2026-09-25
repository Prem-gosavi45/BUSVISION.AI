import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  Car, 
  Download, 
  ZoomIn, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw 
} from 'lucide-react';
import { DetectionItem } from '../../types';

interface RecentDetectionsTableProps {
  detections: DetectionItem[];
  onInspectEvidence: (item: DetectionItem) => void;
  searchFilter?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function RecentDetectionsTable({
  detections,
  onInspectEvidence,
  searchFilter = '',
  isLoading = false,
  error = null,
  onRetry
}: RecentDetectionsTableProps) {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Potholes' | 'Traffic' | 'Incidents'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter detections based on category tab & search query
  const filtered = detections.filter((item) => {
    if (activeCategory === 'Potholes' && item.event !== 'Pothole') return false;
    if (activeCategory === 'Traffic' && item.event !== 'Traffic') return false;
    if (activeCategory === 'Incidents' && item.event !== 'Road Incident') return false;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        item.busId.toLowerCase().includes(q) ||
        item.locationTitle.toLowerCase().includes(q) ||
        item.locationSub.toLowerCase().includes(q) ||
        item.event.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'Pothole':
        return <AlertTriangle className="w-4 h-4 text-[#E5484D]" />;
      case 'Traffic':
        return <Activity className="w-4 h-4 text-[#F59E0B]" />;
      case 'Road Incident':
        return <Car className="w-4 h-4 text-[#7C5CFC]" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-[#0055ce]" />;
    }
  };

  const getConfidenceBarColor = (event: string) => {
    switch (event) {
      case 'Pothole':
        return 'bg-[#E5484D]';
      case 'Traffic':
        return 'bg-[#F59E0B]';
      case 'Road Incident':
        return 'bg-[#7C5CFC]';
      default:
        return 'bg-[#2F6FED]';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-[rgba(229,72,77,0.12)] text-[#E5484D] border-[rgba(229,72,77,0.3)]';
      case 'Medium':
        return 'bg-[rgba(245,158,11,0.12)] text-[#B45309] dark:text-amber-400 border-[rgba(245,158,11,0.3)]';
      case 'Low':
      default:
        return 'bg-[rgba(22,163,106,0.12)] text-[#16A36A] border-[rgba(22,163,106,0.3)]';
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) return;
    const csvHeader = "ID,Event,Location,BusID,Time,Confidence,Severity,Status\n";
    const csvRows = filtered.map(d => 
      `"${d.id}","${d.event}","${d.locationTitle} - ${d.locationSub}","${d.busId}","${d.time}",${d.confidence},"${d.severity}","${d.status}"`
    ).join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `busvision_detections_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded-md overflow-hidden transition-colors">
      {/* Table Control Header */}
      <div className="h-9 px-3.5 border-b border-[#E1E5E8] dark:border-[#334155] bg-[#FAFAFA] dark:bg-[#1E293B]/70 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="text-[12px] font-semibold text-[#18212B] dark:text-[#F3F4F6] uppercase tracking-wide">
            Edge Vision Detections
          </span>
          <span className="text-[10px] font-mono text-[#5F6872] dark:text-[#9CA3AF] px-1.5 py-0.2 bg-[#EEF4FF] dark:bg-[#1E293B] rounded border border-[#C2C6D7]/60 dark:border-[#334155]">
            {filtered.length} LOGGED
          </span>
        </div>

        {/* Filter Tabs & Export */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-[#F4F5F2] dark:bg-[#1E293B] p-0.5 rounded border border-[#E1E5E8] dark:border-[#334155] text-[10px] font-mono">
            {(['All', 'Potholes', 'Traffic', 'Incidents'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-white dark:bg-[#111827] text-[#18212B] dark:text-[#F3F4F6] font-semibold'
                    : 'text-[#5F6872] dark:text-[#9CA3AF] hover:text-[#18212B] dark:hover:text-[#F3F4F6]'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="flex items-center space-x-1.5 px-2 py-0.5 bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded text-[10.5px] font-medium text-[#18212B] dark:text-[#F3F4F6] hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] transition-colors cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3 h-3 text-[#5F6872] dark:text-[#9CA3AF]" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Structure */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E1E5E8] dark:border-[#334155] bg-[#F4F5F2]/50 dark:bg-[#1E293B]/40 text-[#5F6872] dark:text-[#9CA3AF] text-[10px] font-mono uppercase tracking-wider">
              <th className="py-2 px-3.5">Event</th>
              <th className="py-2 px-3.5">Location / Telemetry Fix</th>
              <th className="py-2 px-3.5">Bus ID</th>
              <th className="py-2 px-3.5">Timestamp</th>
              <th className="py-2 px-3.5">Confidence</th>
              <th className="py-2 px-3.5">Severity</th>
              <th className="py-2 px-3.5">Status</th>
              <th className="py-2 px-3.5 text-right">Evidence Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E5E8] dark:divide-[#334155]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#5F6872] dark:text-[#9CA3AF]">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#2F6FED]" />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-[#5F6872] dark:text-[#9CA3AF]">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span>Unable to load data</span>
                    {onRetry && (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-[#CBD0D5] dark:border-[#475569] rounded text-[10px] font-mono hover:bg-[#F4F5F2] cursor-pointer"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#5F6872] dark:text-[#9CA3AF]">
                  No data available
                </td>
              </tr>
            ) : (
              pageItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#F4F5F2]/60 dark:hover:bg-[#1E293B]/60 transition-colors group"
                >
                  {/* Event Type & Icon */}
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center space-x-2">
                      {getEventIcon(item.event)}
                      <span className="font-semibold text-[#18212B] dark:text-[#F3F4F6] text-[11.5px]">
                        {item.event}
                      </span>
                    </div>
                  </td>

                  {/* Location & Real Coords */}
                  <td className="py-2.5 px-3.5 max-w-[200px]">
                    <div className="text-[11.5px] font-medium text-[#18212B] dark:text-[#F3F4F6] truncate">
                      {item.locationTitle}
                    </div>
                    <div className="text-[10px] font-mono text-[#5F6872] dark:text-[#9CA3AF] truncate">
                      {item.locationSub}
                    </div>
                  </td>

                  {/* Bus ID */}
                  <td className="py-2.5 px-3.5 font-mono text-[11px] font-semibold text-[#18212B] dark:text-[#F3F4F6]">
                    {item.busId}
                  </td>

                  {/* Timestamp */}
                  <td className="py-2.5 px-3.5 font-mono text-[10.5px] text-[#5F6872] dark:text-[#9CA3AF] whitespace-nowrap">
                    {item.time}
                  </td>

                  {/* Confidence Bar & Percentage */}
                  <td className="py-2.5 px-3.5">
                    {item.confidence > 0 ? (
                      <div className="flex items-center space-x-2 w-24">
                        <div className="h-1.5 flex-1 bg-[#E1E5E8] dark:bg-[#334155] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getConfidenceBarColor(item.event)} rounded-full`}
                            style={{ width: `${Math.round(item.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10.5px] text-[#5F6872] dark:text-[#9CA3AF] tabular-nums font-semibold">
                          {(item.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-[10.5px] text-[#5F6872] dark:text-[#9CA3AF]">--</span>
                    )}
                  </td>

                  {/* Severity Badge */}
                  <td className="py-2.5 px-3.5">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9.5px] font-mono font-semibold border ${getSeverityBadge(
                        item.severity
                      )}`}
                    >
                      {item.severity}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-3.5">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9.5px] font-mono font-semibold ${
                        item.status === 'Verified'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-[#16A36A] border border-emerald-200 dark:border-emerald-800'
                          : item.status === 'Processed'
                          ? 'bg-blue-50 dark:bg-blue-950/30 text-[#2F6FED] dark:text-[#3B82F6] border border-blue-200 dark:border-blue-800'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>

                  {/* Action Link to Evidence Modal */}
                  <td className="py-2.5 px-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onInspectEvidence(item)}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-[#F4F5F2] dark:bg-[#1E293B] hover:bg-[#EEF4FF] dark:hover:bg-[#253248] text-[#2F6FED] dark:text-[#3B82F6] text-[10.5px] font-mono font-medium transition-colors cursor-pointer border border-[#E1E5E8] dark:border-[#334155]"
                    >
                      <ZoomIn className="w-3 h-3" />
                      <span>EVIDENCE</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer: Real Dynamic Pagination & Status */}
      <div className="h-9 px-3.5 border-t border-[#E1E5E8] dark:border-[#334155] bg-[#FAFAFA] dark:bg-[#1E293B]/70 flex items-center justify-between text-[11px] font-mono">
        <span className="text-[#5F6872] dark:text-[#9CA3AF] text-[10.5px]">
          DATA SOURCE: <strong className="text-[#18212B] dark:text-[#F3F4F6]">GET /api/events</strong>
        </span>

        <div className="flex items-center space-x-3">
          <span className="text-[10px] text-[#5F6872] dark:text-[#9CA3AF]">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="p-1 rounded bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] disabled:opacity-40 text-[#5F6872] dark:text-[#9CA3AF] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1 rounded bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] disabled:opacity-40 text-[#5F6872] dark:text-[#9CA3AF] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
