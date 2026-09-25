import React from 'react';
import { X, CheckCircle, AlertTriangle, Download, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';
import { DetectionItem } from '../../types';

interface EvidenceModalProps {
  detection: DetectionItem | null;
  onClose: () => void;
  onUpdateStatus?: (id: string, newStatus: DetectionItem['status']) => void;
}

export default function EvidenceModal({ detection, onClose, onUpdateStatus }: EvidenceModalProps) {
  if (!detection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div 
        className="bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded-md shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-4 py-2.5 border-b border-[#E1E5E8] dark:border-[#334155] flex items-center justify-between bg-[#FAFAFA] dark:bg-[#1E293B]/70">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#2F6FED]" />
            <h3 className="font-semibold text-xs uppercase tracking-wide text-[#18212B] dark:text-[#F3F4F6]">
              Edge Telemetry Inspection · Bus {detection.busId}
            </h3>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-[#EEF4FF] dark:bg-[#1E293B] text-[#2F6FED] dark:text-[#3B82F6] border border-[#C2C6D7]/60 dark:border-[#334155]">
              {detection.event}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#5F6872] dark:text-[#9CA3AF] hover:text-[#18212B] dark:hover:text-white rounded hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-3.5">
          {/* Main Visual Frame with Automated AI Bounding Box */}
          <div className="relative rounded overflow-hidden border border-[#CBD0D5] dark:border-[#334155] bg-black aspect-video max-h-[360px] flex items-center justify-center">
            <img
              src={detection.evidenceUrl}
              alt={detection.altText}
              className="w-full h-full object-cover"
            />
            {/* Visual AI Bounding Overlay Overlay */}
            <div className="absolute inset-0 pointer-events-none p-6 flex items-center justify-center">
              <div className="relative border-2 border-dashed border-[#E5484D] w-3/5 h-3/5 rounded-none flex items-start justify-start p-1.5 shadow-[0_0_12px_rgba(229,72,77,0.4)]">
                <span className="bg-[#E5484D] text-white text-[9.5px] font-mono font-bold px-1.5 py-0.2 uppercase tracking-wider flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  {detection.event.toUpperCase()} · {(detection.confidence * 100).toFixed(1)}%
                </span>
                {/* Corner crosshairs */}
                <span className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                <span className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                <span className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />
              </div>
            </div>

            {/* Frame Watermark Overlay */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white text-[9.5px] font-mono flex items-center gap-3 backdrop-blur-xs">
              <span>CAM-01 FRONT</span>
              <span>TIME: {detection.time} IST</span>
              <span>BUS: {detection.busId}</span>
            </div>
          </div>

          {/* Telemetry Spec Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#F4F5F2] dark:bg-[#0B0F17] p-2.5 rounded border border-[#E1E5E8] dark:border-[#334155] text-xs">
            <div>
              <span className="text-[#5F6872] dark:text-[#9CA3AF] block text-[10px] font-mono uppercase">Location</span>
              <span className="font-semibold text-[#18212B] dark:text-[#F3F4F6] text-[11.5px] leading-tight block mt-0.5">
                {detection.locationTitle}, {detection.locationSub}
              </span>
            </div>
            <div>
              <span className="text-[#5F6872] dark:text-[#9CA3AF] block text-[10px] font-mono uppercase">Coordinates</span>
              <span className="font-mono text-[#18212B] dark:text-[#F3F4F6] text-[11px] block mt-0.5">
                {detection.details?.coordinates || '18.503079 N, 73.773163 E'}
              </span>
            </div>
            <div>
              <span className="text-[#5F6872] dark:text-[#9CA3AF] block text-[10px] font-mono uppercase">Model Confidence</span>
              <span className="font-mono font-bold text-[#2F6FED] dark:text-[#3B82F6] text-[11px] block mt-0.5">
                {(detection.confidence * 100).toFixed(0)}% (YOLO-v11-Edge)
              </span>
            </div>
            <div>
              <span className="text-[#5F6872] dark:text-[#9CA3AF] block text-[10px] font-mono uppercase">Current Status</span>
              <span className={`inline-flex items-center gap-1 font-semibold text-[11px] mt-0.5 ${
                detection.status === 'Verified' ? 'text-[#16A36A]' :
                detection.status === 'New' ? 'text-[#2F6FED]' : 'text-[#5F6872] dark:text-[#9CA3AF]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  detection.status === 'Verified' ? 'bg-[#16A36A]' :
                  detection.status === 'New' ? 'bg-[#2F6FED]' : 'bg-[#CBD0D5]'
                }`} />
                {detection.status}
              </span>
            </div>
          </div>

          {/* Actionable Notes */}
          {detection.details && (
            <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded text-xs flex items-start gap-2 text-amber-900 dark:text-amber-300">
              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-mono font-bold text-[10.5px] uppercase block">Municipal Action Directive</span>
                <span className="text-[11px] leading-relaxed">{detection.details.recommendedAction}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 py-2.5 border-t border-[#E1E5E8] dark:border-[#334155] bg-[#FAFAFA] dark:bg-[#1E293B]/70 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => onUpdateStatus?.(detection.id, 'Verified')}
              className="px-2.5 py-1 bg-[#16A36A] hover:bg-emerald-700 text-white rounded font-medium flex items-center space-x-1.5 transition-colors cursor-pointer text-[11px]"
            >
              <CheckCircle className="w-3 h-3" />
              <span>Verify & Dispatch Repair</span>
            </button>
            <button
              onClick={() => onUpdateStatus?.(detection.id, 'Processed')}
              className="px-2.5 py-1 bg-white dark:bg-[#111827] border border-[#CBD0D5] dark:border-[#334155] hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] text-[#18212B] dark:text-[#F3F4F6] rounded font-medium transition-colors cursor-pointer text-[11px]"
            >
              Mark Processed
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(detection, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `telemetry_${detection.id}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="px-2.5 py-1 bg-white dark:bg-[#111827] border border-[#CBD0D5] dark:border-[#334155] hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] text-[#18212B] dark:text-[#F3F4F6] rounded font-medium text-[11px] flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3 text-[#5F6872] dark:text-[#9CA3AF]" />
              <span>GeoJSON Data</span>
            </button>
            <button
              onClick={onClose}
              className="px-2.5 py-1 bg-white dark:bg-[#111827] border border-[#CBD0D5] dark:border-[#334155] hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] text-[#5F6872] dark:text-[#9CA3AF] rounded font-medium text-[11px] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
