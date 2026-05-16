import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import Calendar from './Calendar';
import ReportEditModal from './ReportEditModal';
import api from '../services/api';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'Crítica': return '#ef4444';
    case 'Alta': return '#f97316';
    case 'Media': return '#3b82f6';
    default: return '#6b7280';
  }
};

const getUrgencyIcon = (urgency: string) => {
  const color = getUrgencyColor(urgency);
  return L.divIcon({
    className: '',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <span style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 12px;">!</span>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const MapController: React.FC<{ onReady: (map: L.Map) => void }> = ({ onReady }) => {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
};

const ClusterLayer: React.FC<{ reports: any[] }> = ({ reports }) => {
  const { t, i18n } = useTranslation();
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    const mcg = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    reports.forEach((report) => {
      const color = getUrgencyColor(report.urgency);
      const marker = L.marker([parseFloat(report.latitude), parseFloat(report.longitude)], {
        icon: getUrgencyIcon(report.urgency),
      });

      const timeStr = new Date(report.createdAt).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
      const unknownName = t('map.unknownPerson');
      const viewProfileText = t('map.viewProfile');
      const editVisitText = t('map.editVisit');
      const editSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';
      marker.bindPopup(`
        <div class="min-w-[200px]">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
            <h4 class="font-bold text-gray-900">${report.Person?.name || unknownName}</h4>
          </div>
          <p class="text-xs text-gray-500 mb-2">
            ${timeStr}
          </p>
          ${report.comment ? `<p class="text-sm text-gray-700 italic mb-2">"${report.comment}"</p>` : ''}
          <button onclick="window.__navigateToPerson(${report.personId})" class="w-full mb-1.5 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 py-1.5 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            ${viewProfileText}
          </button>
          <button onclick="window.__editReportById(${report.id})" class="w-full mb-2 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 py-1.5 rounded-lg transition-colors">
            ${editSvg}
            ${editVisitText}
          </button>
          <div class="flex gap-2">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600">${report.urgency}</span>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600">${report.status}</span>
          </div>
        </div>
      `);

      mcg.addLayer(marker);
    });

    map.addLayer(mcg);

    if (reports.length > 0) {
      map.fitBounds(mcg.getBounds(), { padding: [40, 40], maxZoom: 16 });
    }

    clusterGroupRef.current = mcg;

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
      }
    };
  }, [reports, map]);

  return null;
};

const MapReport: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(() => {
    if (location.state?.selectedDate) {
      const [y, m, d] = location.state.selectedDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });
  const [reports, setReports] = useState<any[]>([]);
  const [datesWithReports, setDatesWithReports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const navigate = useNavigate();
  const mapInstance = useRef<L.Map | null>(null);
  const [editingReport, setEditingReport] = useState<any>(null);
  const navigateToPerson = (id: number) => navigate(`/person/${id}`);

  useEffect(() => {
    (window as any).__navigateToPerson = navigateToPerson;
    return () => { delete (window as any).__navigateToPerson; };
  }, [navigateToPerson]);

  useEffect(() => {
    (window as any).__editReportById = (id: number) => {
      const r = reports.find((rep) => rep.id === id);
      if (r) setEditingReport(r);
    };
    return () => { delete (window as any).__editReportById; };
  }, [reports]);

  const handleUpdateReport = (updated: any) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  useEffect(() => {
    fetchDatesWithReports();
  }, []);

  useEffect(() => {
    fetchReportsForDate();
  }, [selectedDate]);

  const fetchDatesWithReports = async () => {
    try {
      const res = await api.get('/reports/dates-with-reports');
      setDatesWithReports(res.data);
    } catch (err) {
      console.error('Error fetching dates', err);
    }
  };

  const fetchReportsForDate = async () => {
    setLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const res = await api.get(`/reports/by-date/${dateStr}`);
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : i18n.language === 'pt' ? 'pt-BR' : 'es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const invalidateMap = () => {
    if (mapInstance.current) {
      mapInstance.current.invalidateSize();
    }
  };

  useEffect(() => {
    invalidateMap();
  }, [calendarOpen]);

  return (
    <div className="relative h-[calc(100vh-120px)] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 drop-shadow-md">{t('map.title')}</h1>
          <p className="text-xs text-gray-600 font-medium capitalize drop-shadow-sm">{formatDate(selectedDate)}</p>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        <button
          onClick={() => setCalendarOpen(!calendarOpen)}
          className={`p-2.5 rounded-xl shadow-lg border transition-all ${
            calendarOpen
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-100 hover:text-blue-600'
          }`}
        >
          <CalendarIcon size={20} />
        </button>
        <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100">
          <p className="text-xs font-bold text-gray-500">
            {loading ? '...' : `${reports.length} ${reports.length === 1 ? t('map.report') : t('map.reports')}`}
          </p>
        </div>
      </div>

      {calendarOpen && (
        <>
          <div className="fixed inset-0 z-[999]" onClick={() => setCalendarOpen(false)} />
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            datesWithReports={datesWithReports}
            onClose={() => setCalendarOpen(false)}
          />
        </>
      )}

      <MapContainer
        center={[-34.6037, -58.3816]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapController onReady={(map) => { mapInstance.current = map; }} />
        <ClusterLayer reports={reports} />
      </MapContainer>

      {editingReport && (
        <ReportEditModal
          report={editingReport}
          onSave={handleUpdateReport}
          onClose={() => setEditingReport(null)}
        />
      )}
    </div>
  );
};

export default MapReport;
