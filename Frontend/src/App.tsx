import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';

import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import DashboardPage from './pages/Dashboard';
import LiveMapPage from './pages/LiveMapPage';
import FleetPage from './pages/FleetPage';
import RoadInfrastructurePage from './pages/RoadInfrastructurePage';
import TrafficIntelligencePage from './pages/TrafficIntelligencePage';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

import EvidenceModal from './components/ui/EvidenceModal';
import ApiStatusNotice, {
  ApiConnectivityStatus
} from './components/ui/ApiStatusNotice';

import { getBuses } from './api/buses';
import {
  getEvents,
  getPotholeEvents,
  getTrafficEvents,
  getRoadIncidentEvents
} from './api/events';

import { BusSummary } from './types/buses';
import {
  BusVisionEvent,
  PotholeEvent,
  TrafficEvent,
  RoadIncidentEvent
} from './types/events';

import { DetectionItem, AlertItem } from './types';

import {
  mapEventsToAlerts,
  mapEventsToDetections
} from './utils/eventMappers';


// ============================================================
// ROUTING
// ============================================================

function getTabFromPath(pathname: string): string {
  const clean = pathname.replace(/^\//, '').toLowerCase();

  if (!clean || clean === 'dashboard') return 'dashboard';
  if (clean === 'live-map') return 'live-map';
  if (clean === 'fleet') return 'fleet';

  if (
    clean === 'road-infrastructure' ||
    clean === 'infrastructure'
  ) {
    return 'road-infrastructure';
  }

  if (clean === 'traffic') return 'traffic';
  if (clean === 'alerts') return 'alerts';
  if (clean === 'analytics') return 'analytics';
  if (clean === 'reports') return 'reports';
  if (clean === 'settings') return 'settings';

  return 'dashboard';
}


function getPathFromTab(tab: string): string {
  if (tab === 'dashboard') return '/';
  return `/${tab}`;
}


// ============================================================
// APP
// ============================================================

export default function App() {

  // ==========================================================
  // THEME
  // ==========================================================

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    const saved = localStorage.getItem('bv_theme');

    if (saved !== null) {
      return saved === 'dark';
    }

    return (
      window.matchMedia?.(
        '(prefers-color-scheme: dark)'
      ).matches ?? false
    );
  });


  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPath(window.location.pathname);
    }

    return 'dashboard';
  });

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPeriod, setSelectedPeriod] =
    useState('Last 24 Hours');

  const [inspectedDetection, setInspectedDetection] =
    useState<DetectionItem | null>(null);


  // ==========================================================
  // BACKEND DATA
  // ==========================================================

  const [buses, setBuses] =
    useState<BusSummary[]>([]);

  const [events, setEvents] =
    useState<BusVisionEvent[]>([]);

  const [potholes, setPotholes] =
    useState<PotholeEvent[]>([]);

  const [trafficEvents, setTrafficEvents] =
    useState<TrafficEvent[]>([]);

  const [incidentEvents, setIncidentEvents] =
    useState<RoadIncidentEvent[]>([]);

  const [selectedBusId, setSelectedBusId] =
    useState('');

  const [apiLoading, setApiLoading] =
    useState(true);

  const [apiError, setApiError] =
    useState<string | null>(null);

  const [apiStatus, setApiStatus] =
    useState<ApiConnectivityStatus>('connecting');

  const [detections, setDetections] =
    useState<DetectionItem[]>([]);

  const [alerts, setAlerts] =
    useState<AlertItem[]>([]);

  // Prevent overlapping 10-second refresh calls and keep the
  // dashboard stable while background telemetry is refreshing.
  const refreshInFlightRef = useRef(false);
  const hasLoadedOnceRef = useRef(false);


  // ==========================================================
  // URL NAVIGATION
  // ==========================================================

  useEffect(() => {

    const handlePopState = () => {
      setCurrentTab(
        getTabFromPath(window.location.pathname)
      );
    };

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );
    };

  }, []);


  const handleTabChange = (tab: string) => {

    setCurrentTab(tab);

    const newPath = getPathFromTab(tab);

    if (window.location.pathname !== newPath) {
      window.history.pushState(
        null,
        '',
        newPath
      );
    }
  };


  // ==========================================================
  // THEME
  // ==========================================================

  useEffect(() => {

    const root = document.documentElement;
    const body = document.body;

    if (isDark) {

      root.classList.add('dark');
      body.classList.add('dark');

      localStorage.setItem(
        'bv_theme',
        'dark'
      );

    } else {

      root.classList.remove('dark');
      body.classList.remove('dark');

      localStorage.setItem(
        'bv_theme',
        'light'
      );
    }

  }, [isDark]);


  const handleToggleTheme = () => {
    setIsDark(prev => !prev);
  };


  // ==========================================================
  // LOAD BACKEND DATA
  // IMPORTANT:
  // This callback DOES NOT depend on selectedBusId.
  // This prevents the refresh effect from restarting
  // whenever the selected bus changes.
  // ==========================================================

  const loadBackendData = useCallback(async () => {

    // Do not allow a slow API request to overlap with the next
    // 10-second refresh cycle.
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;

    const isInitialLoad = !hasLoadedOnceRef.current;

    if (isInitialLoad) {
      setApiLoading(true);
      setApiStatus('connecting');
    }

    try {
      const [
        busesRes,
        eventsRes,
        potholeRes,
        trafficRes,
        incidentRes
      ] = await Promise.all([
        getBuses(),
        getEvents({ limit: 500 }),
        getPotholeEvents(500),
        getTrafficEvents(500),
        getRoadIncidentEvents(500)
      ]);

      const responses = [
        busesRes,
        eventsRes,
        potholeRes,
        trafficRes,
        incidentRes
      ];

      const failedCount = responses.filter(
        response => Boolean(response.error)
      ).length;

      const allFailed = failedCount === responses.length;

      // --------------------------------------------------------
      // Update only successful API slices.
      // This prevents a single endpoint failure from wiping
      // already-visible telemetry from the dashboard.
      // --------------------------------------------------------

      if (!busesRes.error) {
        const receivedBuses: BusSummary[] =
          Array.isArray(busesRes.data)
            ? busesRes.data
            : [];

        setBuses(receivedBuses);

        setSelectedBusId(prevSelectedBusId => {
          const selectedStillExists = receivedBuses.some(
            bus => bus.bus_id === prevSelectedBusId
          );

          if (selectedStillExists) {
            return prevSelectedBusId;
          }

          return receivedBuses[0]?.bus_id || '';
        });
      }

      if (!eventsRes.error) {
        const receivedEvents: BusVisionEvent[] =
          Array.isArray(eventsRes.data)
            ? eventsRes.data
            : [];

        setEvents(receivedEvents);
        setAlerts(mapEventsToAlerts(receivedEvents));
        setDetections(mapEventsToDetections(receivedEvents));
      }

      if (!potholeRes.error) {
        setPotholes(
          Array.isArray(potholeRes.data)
            ? potholeRes.data
            : []
        );
      }

      if (!trafficRes.error) {
        setTrafficEvents(
          Array.isArray(trafficRes.data)
            ? trafficRes.data
            : []
        );
      }

      if (!incidentRes.error) {
        setIncidentEvents(
          Array.isArray(incidentRes.data)
            ? incidentRes.data
            : []
        );
      }

      // --------------------------------------------------------
      // Connection state
      // --------------------------------------------------------

      if (allFailed) {
        setApiStatus('offline');
        setApiError(
          responses.find(response => response.error)?.error ||
          'FastAPI service unreachable'
        );
      } else if (failedCount > 0) {
        setApiStatus('connected');
        setApiError(
          `${failedCount} telemetry endpoint${failedCount > 1 ? 's' : ''} unavailable; showing available data.`
        );
      } else {
        setApiStatus('connected');
        setApiError(null);
      }

      hasLoadedOnceRef.current = true;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to connect to BusVision API';

      setApiStatus('offline');
      setApiError(message);

      // IMPORTANT: keep the last successful data on screen.
      // Clearing the dashboard here causes the visible map,
      // alerts and KPI cards to flash empty during a transient
      // backend/network failure.
    } finally {
      hasLoadedOnceRef.current = true;
      setApiLoading(false);
      refreshInFlightRef.current = false;
    }

  }, []);

  // ==========================================================
  // INITIAL LOAD + AUTO REFRESH
  //
  // This effect runs once and keeps one stable interval.
  // Selecting a bus will NOT restart this effect.
  // ==========================================================

  useEffect(() => {

    let isMounted = true;

    const initialLoad = async () => {

      if (!isMounted) return;

      await loadBackendData();
    };

    initialLoad();

    const intervalId = window.setInterval(() => {

      if (!isMounted) return;

      loadBackendData();

    }, 10000);


    return () => {

      isMounted = false;

      window.clearInterval(
        intervalId
      );

    };

  }, [loadBackendData]);


  // ==========================================================
  // KPI CALCULATIONS
  // ==========================================================

  const kpiStats = useMemo(() => {

    if (
      apiStatus === 'offline' &&
      buses.length === 0 &&
      events.length === 0
    ) {

      return {

        activeBuses: {
          count: '--',
          changeText: 'Offline',
          metaText: 'No API connection'
        },

        potholes: {
          count: '--',
          highlightText: 'Offline',
          metaText: 'No API connection'
        },

        traffic: {
          count: '--',
          highlightText: 'Offline',
          metaText: 'No API connection'
        },

        incidents: {
          count: '--',
          highlightText: 'Offline',
          metaText: 'No API connection'
        }

      };
    }


    if (
      apiLoading &&
      buses.length === 0 &&
      events.length === 0
    ) {

      return {

        activeBuses: {
          count: '...',
          changeText: 'Loading...',
          metaText: 'Loading buses'
        },

        potholes: {
          count: '...',
          highlightText: 'Loading...',
          metaText: 'Loading potholes'
        },

        traffic: {
          count: '...',
          highlightText: 'Loading...',
          metaText: 'Loading traffic'
        },

        incidents: {
          count: '...',
          highlightText: 'Loading...',
          metaText: 'Loading incidents'
        }

      };
    }


    // ========================================================
    // BUSES
    // ========================================================

    const activeBusCount =
      buses.filter(
        bus =>
          bus.status === 'LIVE' ||
          bus.status === 'ACTIVE'
      ).length;


    // ========================================================
    // POTHOLES
    // ========================================================

    const potholeList =
      potholes.length > 0
        ? potholes
        : events.filter(
            (event): event is PotholeEvent =>
              event.event_type === 'POTHOLE'
          );


    const criticalPotholes =
      potholeList.filter(
        pothole => {

          const size =
            (pothole.size_category || '')
              .toUpperCase();

          return (
            size === 'HIGH' ||
            size === 'CRITICAL'
          );
        }
      ).length;


    const mediumPotholes =
      potholeList.filter(
        pothole =>
          (pothole.size_category || '')
            .toUpperCase() === 'MEDIUM'
      ).length;


    // ========================================================
    // TRAFFIC
    // ========================================================

    const trafficList =
      trafficEvents.length > 0
        ? trafficEvents
        : events.filter(
            (event): event is TrafficEvent =>
              event.event_type === 'TRAFFIC'
          );


    const highTraffic =
      trafficList.filter(
        traffic =>
          (traffic.traffic_level || '')
            .toUpperCase() === 'HIGH'
      ).length;


    // ========================================================
    // INCIDENTS
    // ========================================================

    const incidentList =
      incidentEvents.length > 0
        ? incidentEvents
        : events.filter(
            (event): event is RoadIncidentEvent =>
              event.event_type === 'ROAD_INCIDENT'
          );


    const verifiedIncidents =
      incidentList.filter(
        incident =>
          incident.status === 'VERIFIED'
      ).length;


    const activeIncidents =
      incidentList.filter(
        incident =>
          incident.status !== 'VERIFIED'
      ).length;


    // ========================================================
    // RETURN KPI DATA
    // ========================================================

    return {

      activeBuses: {

        count:
          buses.length > 0
            ? activeBusCount || buses.length
            : '--',

        changeText:
          buses.length > 0
            ? `${buses.length} registered`
            : 'No data',

        metaText:
          buses.length > 0
            ? `${activeBusCount} active units`
            : 'No buses reported'

      },

      potholes: {

        count:
          potholeList.length > 0
            ? potholeList.length
            : '--',

        highlightText:
          potholeList.length > 0
            ? `${criticalPotholes} Critical`
            : 'No data',

        metaText:
          potholeList.length > 0
            ? `${mediumPotholes} Medium hazards`
            : 'No hazards detected'

      },

      traffic: {

        count:
          trafficList.length > 0
            ? trafficList.length
            : '--',

        highlightText:
          trafficList.length > 0
            ? `${highTraffic} Bottlenecks`
            : 'No data',

        metaText:
          trafficList.length > 0
            ? `${trafficList.length} monitored events`
            : 'Nominal flow'

      },

      incidents: {

        count:
          incidentList.length > 0
            ? incidentList.length
            : '--',

        highlightText:
          incidentList.length > 0
            ? `${verifiedIncidents} Cleared`
            : 'No data',

        metaText:
          incidentList.length > 0
            ? `${activeIncidents} Active`
            : 'No incidents reported'

      }

    };

  }, [
    buses,
    events,
    potholes,
    trafficEvents,
    incidentEvents,
    apiStatus,
    apiLoading
  ]);


  // ==========================================================
  // ALERT / DETECTION ACTIONS
  // ==========================================================

  const handleUpdateStatus = (
    id: string,
    newStatus: DetectionItem['status']
  ) => {

    setDetections(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: newStatus
            }
          : item
      )
    );


    if (
      inspectedDetection &&
      inspectedDetection.id === id
    ) {

      setInspectedDetection(prev =>
        prev
          ? {
              ...prev,
              status: newStatus
            }
          : null
      );

    }

  };


  const handleSelectAlert = (
    alert: AlertItem
  ) => {

    if (alert.busId) {
      setSelectedBusId(
        alert.busId
      );
    }

    setSearchQuery(
      alert.location?.split(',')[0] || ''
    );

  };


  const handleKpiFilter = (
    category: string
  ) => {

    if (category === 'potholes') {

      setSearchQuery('Pothole');

    } else if (category === 'traffic') {

      setSearchQuery('Traffic');

    } else if (category === 'incidents') {

      setSearchQuery('Incident');

    } else if (category === 'fleet') {

      setSearchQuery('BUS');

    }

  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      className="
        flex h-screen
        bg-[#F4F5F2]
        dark:bg-[#0b0f17]
        text-[#18212B]
        dark:text-[#f3f4f6]
        font-sans
        antialiased
        overflow-hidden
        select-none
        transition-colors
        duration-200
      "
    >

      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />


      <div
        className="
          flex-1
          flex
          flex-col
          min-w-0
          h-screen
          overflow-hidden
        "
      >

        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          alerts={alerts}
          onSelectAlert={handleSelectAlert}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />


        <div
          className="
            px-4
            pt-3
            flex-shrink-0
          "
        >

          <ApiStatusNotice
            status={apiStatus}
            error={apiError}
            onRetry={loadBackendData}
            isLoading={apiLoading}
          />

        </div>


        <main
          className="
            p-4
            flex-1
            custom-scroll
            overflow-y-auto
          "
        >

          {currentTab === 'dashboard' && (

            <DashboardPage
              buses={buses}
              events={events}
              selectedBusId={selectedBusId}

              onSelectBus={bus =>
                setSelectedBusId(
                  bus.bus_id
                )
              }

              searchQuery={searchQuery}
              alerts={alerts}
              detections={detections}

              onSelectAlert={
                handleSelectAlert
              }

              onInspectEvidence={item =>
                setInspectedDetection(item)
              }

              onFilterByCategory={
                handleKpiFilter
              }

              stats={kpiStats}

              isLoading={apiLoading}

              error={apiError}

              onRetry={
                loadBackendData
              }
            />

          )}


          {currentTab === 'live-map' && (
            <LiveMapPage />
          )}


          {currentTab === 'fleet' && (
            <FleetPage />
          )}


          {currentTab === 'road-infrastructure' && (
            <RoadInfrastructurePage />
          )}


          {currentTab === 'traffic' && (
            <TrafficIntelligencePage />
          )}


          {currentTab === 'alerts' && (
            <AlertsPage />
          )}


          {currentTab === 'analytics' && (
            <AnalyticsPage />
          )}


          {currentTab === 'reports' && (
            <ReportsPage />
          )}


          {currentTab === 'settings' && (

            <SettingsPage
              isDark={isDark}
              onToggleTheme={
                handleToggleTheme
              }
            />

          )}

        </main>


        <Footer />

      </div>


      {inspectedDetection && (

        <EvidenceModal
          detection={inspectedDetection}

          onClose={() =>
            setInspectedDetection(null)
          }

          onUpdateStatus={
            handleUpdateStatus
          }
        />

      )}

    </div>

  );
}