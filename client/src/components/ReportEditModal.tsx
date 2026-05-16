import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import api from '../services/api';
import Autocomplete from './Autocomplete';
import { X, MapPin } from 'lucide-react';

const MapPicker: React.FC<{
  lat: number;
  lng: number;
  onCenterChange: (lat: number, lng: number) => void;
}> = ({ lat, lng, onCenterChange }) => {
  const map = useMap();
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      map.setView([lat, lng], 16);
      onCenterChange(lat, lng);
      initial.current = false;
    }
  }, [map]);

  useEffect(() => {
    const handler = () => {
      const c = map.getCenter();
      onCenterChange(c.lat, c.lng);
    };
    map.on('dragend', handler);
    return () => {
      map.off('dragend', handler);
    };
  }, [map, onCenterChange]);

  return null;
};

interface Props {
  report: any;
  onSave: (updated: any) => void;
  onClose: () => void;
}

const ReportEditModal: React.FC<Props> = ({ report, onSave, onClose }) => {
  const { t } = useTranslation();

  const [people, setPeople] = useState<any[]>([]);
  const [personId, setPersonId] = useState(report.personId?.toString() || '');
  const [comment, setComment] = useState(report.comment || '');
  const [urgency, setUrgency] = useState(report.urgency || 'Media');
  const [status, setStatus] = useState(report.status || 'Pendiente');
  const [latitude, setLatitude] = useState(parseFloat(report.latitude) || 0);
  const [longitude, setLongitude] = useState(parseFloat(report.longitude) || 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/people?limit=1000').then((res) => setPeople(res.data.data)).catch(() => {});
  }, []);

  const handleCenterChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/reports/${report.id}`, {
        personId: parseInt(personId),
        comment,
        urgency,
        status,
        latitude,
        longitude,
      });
      onSave(res.data);
      onClose();
    } catch {
      alert(t('editReport.error'));
    } finally {
      setSaving(false);
    }
  };

  const hasValidCoords = latitude !== 0 && longitude !== 0;
  const center: [number, number] = hasValidCoords
    ? [latitude, longitude]
    : [-34.6037, -58.3816];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-800 tracking-tight">
            {t('editReport.title')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">
              {t('report.personLabel')}
            </label>
            <Autocomplete
              people={people}
              value={personId}
              onChange={setPersonId}
              onEdit={(_p) => {}}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t('report.urgencyLabel')}
              </label>
              <select
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="Baja">{t('report.urgencyLow')}</option>
                <option value="Media">{t('report.urgencyMedium')}</option>
                <option value="Alta">{t('report.urgencyHigh')}</option>
                <option value="Crítica">{t('report.urgencyCritical')}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t('report.statusLabel')}
              </label>
              <select
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
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
            <label className="text-sm font-bold text-gray-700 ml-1">
              {t('report.commentLabel')}
            </label>
            <textarea
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition min-h-[100px] text-sm"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('report.commentPlaceholder')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">
              {t('editReport.locationLabel')}
            </label>
            <div className="h-56 rounded-2xl overflow-hidden ring-1 ring-gray-200 relative">
              {hasValidCoords ? (
                <>
                  <MapContainer
                    center={center}
                    zoom={16}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    dragging={true}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <MapPicker
                      lat={latitude}
                      lng={longitude}
                      onCenterChange={handleCenterChange}
                    />
                  </MapContainer>
                  <div className="absolute inset-0 pointer-events-none z-[1000] flex items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      <div
                        className="absolute w-8 h-8 rounded-full bg-red-500/20 border-2 border-red-500"
                        style={{ transform: 'translate(-50%, -100%)', left: '50%', top: '50%' }}
                      />
                      <MapPin
                        size={32}
                        className="text-red-500 drop-shadow-lg"
                        style={{ transform: 'translateY(-16px)' }}
                        fill="white"
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-gray-600 shadow">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400 text-sm font-medium">
                  {t('editReport.noLocation')}
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 ml-1">
              {t('editReport.dragHint')}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {t('editReport.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all shadow-lg active:scale-95 ${
              saving
                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200'
            }`}
          >
            {saving ? t('editReport.saving') : t('editReport.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportEditModal;
