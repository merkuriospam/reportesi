import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import Autocomplete from './Autocomplete';
import CreatePersonModal from './CreatePersonModal';
import { MapPin, CheckCircle, RefreshCw } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const ReportForm: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [people, setPeople] = useState<any[]>([]);
  const [personId, setPersonId] = useState(searchParams.get('personId') || '');
  const [comment, setComment] = useState('');
  const [urgency, setUrgency] = useState('Media');
  const [status, setStatus] = useState('Pendiente');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsFixCount, setGpsFixCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const sortedPeople = useMemo(() => {
    if (!location) return people;
    return [...people].sort((a, b) => {
      const distA = a.lastLat != null && a.lastLng != null
        ? haversineDistance(location.lat, location.lng, parseFloat(a.lastLat), parseFloat(a.lastLng))
        : Infinity;
      const distB = b.lastLat != null && b.lastLng != null
        ? haversineDistance(location.lat, location.lng, parseFloat(b.lastLat), parseFloat(b.lastLng))
        : Infinity;
      return distA - distB;
    });
  }, [people, location]);

  useEffect(() => {
    fetchPeople();
    getLocation().catch(() => {});
  }, []);

  useEffect(() => {
    const id = searchParams.get('personId');
    if (id) setPersonId(id);
  }, [searchParams]);

  const fetchPeople = async () => {
    try {
      const response = await api.get('/people?limit=1000');
      setPeople(response.data.data);
    } catch (err) {
      console.error('Error fetching people', err);
    }
  };

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(loc);
          setGpsFixCount((c) => c + 1);
          resolve(loc);
        },
        (error) => {
          console.error('Error getting location', error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const DragHandler: React.FC<{
    center: [number, number];
    onCenterChange: (lat: number, lng: number) => void;
    gpsFixCount: number;
  }> = ({ center, onCenterChange, gpsFixCount }) => {
    const map = useMap();
    const initial = useRef(true);

    useEffect(() => {
      if (initial.current) {
        map.setView(center, 16);
        initial.current = false;
      }
    }, []);

    useEffect(() => {
      if (!initial.current) {
        map.flyTo(center, 16);
      }
    }, [gpsFixCount]);

    useEffect(() => {
      const handler = () => {
        const c = map.getCenter();
        onCenterChange(c.lat, c.lng);
      };
      map.on('dragend', handler);
      return () => { map.off('dragend', handler); };
    }, [map, onCenterChange]);

    return null;
  };

  const handlePersonCreated = (person: { id: number; name: string }) => {
    setPeople((prev) => [person, ...prev]);
    setPersonId(person.id.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reports', {
        personId: parseInt(personId),
        latitude: location!.lat,
        longitude: location!.lng,
        comment,
        urgency,
        status
      });
      setMessage(t('report.success'));
      setPersonId('');
      setComment('');
      setUrgency('Media');
      setLocation(null);
      getLocation().catch(() => {});
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        alert('No se pudo obtener la ubicación. Por favor activa el GPS.');
      } else {
        alert('Error al enviar el reporte');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-10">
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        
        <h2 className="text-2xl font-black mb-6 flex items-center text-gray-800 tracking-tight">
          <MapPin className="mr-3 text-red-500 animate-bounce" size={28} /> 
          {t('report.title')}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 ml-1">{t('report.personLabel')}</label>
            <Autocomplete
              people={sortedPeople}
              value={personId}
              onChange={setPersonId}
              onEdit={(person) => navigate('/people', { state: { editPerson: person } })}
              onCreate={() => setShowCreateModal(true)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">{t('report.urgencyLabel')}</label>
              <select
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="Baja">{t('report.urgencyLow')}</option>
                <option value="Media">{t('report.urgencyMedium')}</option>
                <option value="Alta">{t('report.urgencyHigh')}</option>
                <option value="Crítica">{t('report.urgencyCritical')} 🆘</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">{t('report.statusLabel')}</label>
              <select
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pendiente">{t('report.statusPending')}</option>
                <option value="Atendido">{t('report.statusAttended')}</option>
                <option value="Derivado">{t('report.statusReferred')}</option>
                <option value="Resuelto">{t('report.statusResolved')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">{t('report.commentLabel')}</label>
            <textarea
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition min-h-[140px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('report.commentPlaceholder')}
            />
          </div>

          <div className="h-48 rounded-2xl overflow-hidden ring-1 ring-gray-200 relative">
            {location ? (
              <>
                <MapContainer
                  center={[location.lat, location.lng]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                  dragging={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <DragHandler
                    center={[location.lat, location.lng]}
                    onCenterChange={(lat, lng) => setLocation({ lat, lng })}
                    gpsFixCount={gpsFixCount}
                  />
                </MapContainer>
                <div className="absolute inset-0 pointer-events-none z-[1000] flex items-center justify-center">
                  <MapPin
                    size={32}
                    className="text-red-500 drop-shadow-lg"
                    style={{ transform: 'translateY(-16px)' }}
                    fill="white"
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400 text-sm font-medium">
                <MapPin size={24} className="mr-2 animate-pulse" />
                {t('report.locationGetting')}
              </div>
            )}
            {location && (
              <div className="absolute bottom-2 left-2 z-[1000] flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-lg shadow">
                <MapPin size={12} className="text-blue-500 shrink-0" />
                <span className="text-[10px] font-mono font-bold text-gray-600">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </span>
                <button
                  type="button"
                  onClick={() => { getLocation().catch(() => {}); }}
                  className="ml-0.5 p-0.5 rounded-md text-blue-500 hover:bg-blue-100 transition-colors"
                  title={t('report.refreshLocation')}
                >
                  <RefreshCw size={12} />
                </button>
              </div>
            )}
          </div>

          {message && (
            <div className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex items-center font-bold animate-in zoom-in duration-300">
              <CheckCircle size={24} className="mr-3" /> {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !location}
            className={`w-full py-4 rounded-2xl font-black text-lg text-white transition-all shadow-xl active:scale-95 ${
              loading || !location 
                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200'
            }`}
          >
            {loading ? t('report.processing') : t('report.submitButton')}
          </button>
        </form>
      </div>

      {showCreateModal && (
        <CreatePersonModal
          onCreated={handlePersonCreated}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default ReportForm;
