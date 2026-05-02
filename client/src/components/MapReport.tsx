import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import Calendar from './Calendar';
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

const MapController: React.FC<{ center: [number, number]; onReady: (map: L.Map) => void }> = ({ center, onReady }) => {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapReport: React.FC = () => {
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([-34.6037, -58.3816]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const mapInstance = useRef<L.Map | null>(null);

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
      if (res.data.length > 0) {
        const avgLat = res.data.reduce((sum: number, r: any) => sum + parseFloat(r.latitude), 0) / res.data.length;
        const avgLon = res.data.reduce((sum: number, r: any) => sum + parseFloat(r.longitude), 0) / res.data.length;
        setMapCenter([avgLat, avgLon]);
      }
    } catch (err) {
      console.error('Error fetching reports', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
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
          <h1 className="text-xl font-black text-gray-900 drop-shadow-md">Mapa de Reportes</h1>
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
            {loading ? '...' : `${reports.length} ${reports.length === 1 ? 'reporte' : 'reportes'}`}
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
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapController center={mapCenter} onReady={(map) => { mapInstance.current = map; }} />
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[parseFloat(report.latitude), parseFloat(report.longitude)]}
            icon={getUrgencyIcon(report.urgency)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getUrgencyColor(report.urgency) }}
                  />
                  <h4 className="font-bold text-gray-900">{report.Person?.name || 'Desconocido'}</h4>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(report.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {report.comment && (
                  <p className="text-sm text-gray-700 italic mb-2">"{report.comment}"</p>
                )}
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600">
                    {report.urgency}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600">
                    {report.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapReport;
