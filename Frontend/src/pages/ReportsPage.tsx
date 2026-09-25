import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('daily');
  const [exported, setExported] = useState(false);

  const handleSimulateExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#E1E5E8] dark:border-[#334155]">
        <div>
          <h2 className="text-base font-bold text-[#18212B] dark:text-[#f3f4f6]">
            Municipal Transit & Road Condition Reports
          </h2>
          <p className="text-xs text-[#5F6872] dark:text-[#9ca3af] mt-0.5">
            Structured municipal export engine for Public Works Department & City Transport Authorities
          </p>
        </div>
      </div>

      {/* Report Configuration Card */}
      <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-[#E1E5E8] dark:border-[#334155]">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-[#18212B] dark:text-[#f3f4f6]">
            Export Parameters (API Endpoint: POST /api/reports/generate)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#18212B] dark:text-[#f3f4f6] mb-1">
              Report Cadence
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-[#F4F5F2] dark:bg-[#131b28] border border-[#E1E5E8] dark:border-[#334155] rounded-md p-2 text-xs text-[#18212B] dark:text-[#f3f4f6]"
            >
              <option value="daily">Daily Defect & Traffic Digest (Last 24 Hours)</option>
              <option value="weekly">Weekly Pavement Quality Audit</option>
              <option value="monthly">Monthly BRTS Fleet Operational Audit</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#18212B] dark:text-[#f3f4f6] mb-1">
              Corridor Focus
            </label>
            <select className="w-full bg-[#F4F5F2] dark:bg-[#131b28] border border-[#E1E5E8] dark:border-[#334155] rounded-md p-2 text-xs text-[#18212B] dark:text-[#f3f4f6]">
              <option value="all">All Corridors (PMC Metropolitan Node)</option>
              <option value="fc">FC Road & JM Road Arterials</option>
              <option value="nagar">Nagar Road BRTS Corridor</option>
              <option value="karve">Karve Road & Paud Road</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#18212B] dark:text-[#f3f4f6] mb-1">
              Output Format
            </label>
            <select className="w-full bg-[#F4F5F2] dark:bg-[#131b28] border border-[#E1E5E8] dark:border-[#334155] rounded-md p-2 text-xs text-[#18212B] dark:text-[#f3f4f6]">
              <option value="csv">Standard CSV / GIS GeoJSON</option>
              <option value="pdf">Official PMC Departmental PDF</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-[#5F6872] dark:text-[#9ca3af]">
            Future API integration will stream data directly from Supabase PostgreSQL tables.
          </p>

          <button
            type="button"
            onClick={handleSimulateExport}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#0055ce] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {exported ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Report Dispatched</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Generate Official Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
