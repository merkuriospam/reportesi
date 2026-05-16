import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import api from '../services/api';
import ReportEditModal from './ReportEditModal';
import { ArrowLeft, Clock, MapPin, Edit2, Trash2, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';

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
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const PAGE_SIZES = [10, 20, 40];

const ClusterLayer: React.FC<{ reports: any[] }> = ({ reports }) => {
  const map = useMap();

  useEffect(() => {
    const mcg = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    reports.forEach((report) => {
      const marker = L.marker([parseFloat(report.latitude), parseFloat(report.longitude)], {
        icon: getUrgencyIcon(report.urgency),
      });

      const timeStr = new Date(report.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      marker.bindPopup(`
        <div class="min-w-[150px]">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-2.5 h-2.5 rounded-full" style="background-color: ${getUrgencyColor(report.urgency)}"></div>
            <span class="font-bold text-gray-900 text-xs">${report.urgency}</span>
          </div>
          <p class="text-[10px] text-gray-500 mb-1">${timeStr}</p>
          ${report.comment ? `<p class="text-xs text-gray-700 italic">"${report.comment}"</p>` : ''}
          <p class="text-[10px] text-gray-400 mt-1">${report.status}</p>
        </div>
      `);

      mcg.addLayer(marker);
    });

    map.addLayer(mcg);

    if (reports.length > 0) {
      map.fitBounds(mcg.getBounds(), { padding: [40, 40], maxZoom: 16 });
    }

    return () => {
      map.removeLayer(mcg);
    };
  }, [reports, map]);

  return null;
};

const PersonDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setReports([]);
    setAllReports([]);
    setPage(0);
    setLoading(true);
    fetchPerson();
    fetchAllReports();
  }, [id]);

  useEffect(() => {
    if (id) fetchReports();
  }, [id, page, pageSize]);

  const fetchPerson = async () => {
    try {
      const res = await api.get('/people?limit=1000');
      const p = res.data.data.find((p: any) => p.id === parseInt(id!));
      setPerson(p);
    } catch (err) {
      console.error('Error fetching person', err);
    }
  };

  const fetchAllReports = async () => {
    try {
      const res = await api.get(`/reports/person/${id}?limit=1000&offset=0`);
      setAllReports(res.data.data);
    } catch (err) {
      console.error('Error fetching all reports', err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get(`/reports/person/${id}?limit=${pageSize}&offset=${page * pageSize}`);
      setReports(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Error fetching reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('person.deleteConfirm'))) {
      try {
        await api.delete(`/people/${person.id}`);
        navigate('/people');
      } catch (err) {
        alert(t('person.deleteError'));
      }
    }
  };

  const handleUpdateReport = (updated: any) => {
    const currentPersonId = parseInt(id!);
    if (updated.personId !== currentPersonId) {
      setReports((prev) => prev.filter((r) => r.id !== updated.id));
      setAllReports((prev) => prev.filter((r) => r.id !== updated.id));
      setTotal((prev) => prev - 1);
    } else {
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setAllReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const URG_VAL: Record<string, number> = { Baja: 1, Media: 3, Alta: 5, 'Crítica': 8 };

  const sortedReports = React.useMemo(() =>
    [...allReports].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [allReports]
  );

  const chart = React.useMemo(() => {
    if (sortedReports.length < 2) return null;
    const W = 700, H = 140, PT = 12, PR = 16, PB = 36, PL = 60;
    const PW = W - PL - PR, PH = H - PT - PB, MAX = 9;
    const points = sortedReports.map((r, i) => ({
      x: PL + (i / (sortedReports.length - 1)) * PW,
      y: PT + PH - (URG_VAL[r.urgency] || 0) / MAX * PH,
      urgency: r.urgency,
      date: new Date(r.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
    }));
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const yLabels = [
      { label: 'Crítica', val: 8 },
      { label: 'Alta', val: 5 },
      { label: 'Media', val: 3 },
      { label: 'Baja', val: 1 },
    ].map(v => ({
      label: v.label,
      y: PT + PH - (v.val / MAX) * PH,
    }));
    return { points, path, yLabels, W, H, PT, PR, PB, PL, PW, PH };
  }, [sortedReports]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!person) return     <div className="text-center py-20 text-gray-500">{t('person.notFound')}</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <button 
        onClick={() => navigate('/people')}
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors font-bold text-sm uppercase tracking-wider"
      >
        <ArrowLeft size={18} className="mr-2" /> {t('person.backToCensus')}
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-blue-600 text-4xl font-black ring-8 ring-white">
            {person.name[0]}
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight break-words">
                {person.name} {person.alias && <span className="text-gray-400 font-normal ml-2">("{person.alias}")</span>}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {person.gender && <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black uppercase rounded-full">{person.gender}</span>}
                {person.ageEstimate && <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black uppercase rounded-full">~{person.ageEstimate} {t('person.yearsOld')}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/people', { state: { editPerson: person } })}
                className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                title="Editar"
              >
                <Edit2 size={20} />
              </button>
              <div className="w-px h-8 bg-gray-200"></div>
              <button
                onClick={handleDelete}
                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Eliminar"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={() => navigate(`/report?personId=${person.id}`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
              >
                {t('person.newVisit')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-gray-50 pt-8">
            <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{t('person.description')}</h3>
              <p className="text-gray-700 leading-relaxed italic">
                {person.description || t('person.noDescription')}
              </p>
            </div>
            <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{t('person.frequentLocation')}</h3>
              <div className="flex items-center text-gray-700 font-medium">
                <MapPin size={20} className="text-red-500 mr-2 shrink-0" />
                {person.lastKnownLocation || t('person.locationNotSet')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {chart && (
        <div className="mb-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{t('person.chartTitle')}</h3>
          <svg viewBox={`0 0 ${chart.W} ${chart.H}`} className="w-full h-auto">
            {chart.yLabels.map(yl => (
              <text key={yl.label} x={chart.PL - 8} y={yl.y} fill="#9CA3AF" fontSize={10} fontFamily="inherit" textAnchor="end" dominantBaseline="middle">{yl.label}</text>
            ))}
            <path d={chart.path} fill="none" stroke="#93C5FD" strokeWidth={2} strokeLinejoin="round" />
            {chart.points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={6} fill="#3B82F6" stroke="white" strokeWidth={2} />
                <text x={p.x} y={chart.H - chart.PB + 16} fill="#9CA3AF" fontSize={9} fontFamily="inherit" textAnchor="middle">{p.date}</text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {allReports.some(r => r.latitude && r.longitude) && (
        <div className="mb-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{t('person.mapTitle')}</h3>
          <div className="h-64 rounded-xl overflow-hidden">
            <MapContainer
              center={[parseFloat(allReports.find(r => r.latitude)!.latitude), parseFloat(allReports.find(r => r.latitude)!.longitude)]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <ClusterLayer reports={allReports.filter(r => r.latitude && r.longitude)} />
            </MapContainer>
          </div>
        </div>
      )}

      <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center">
        <Clock className="mr-2 text-blue-500" /> {t('person.historyTitle')}
      </h2>

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                <Clock size={14} className="mr-1" /> 
                {new Date(report.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${
                report.urgency === 'Crítica' ? 'bg-red-100 text-red-700 border-red-200' :
                report.urgency === 'Alta' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                'bg-blue-100 text-blue-700 border-blue-200'
              }`}>
                {report.urgency}
              </span>
            </div>
            <p className="text-gray-700 text-sm mb-4 italic">"{report.comment || t('person.noComments')}"</p>
            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                report.status === 'Resuelto' ? 'bg-green-100 text-green-700' :
                report.status === 'Atendido' ? 'bg-blue-100 text-blue-700' : 
                report.status === 'Derivado' ? 'bg-purple-100 text-purple-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {report.status}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingReport(report)}
                  className="p-1.5 text-gray-500 bg-gray-100 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Editar"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => {
                    const d = new Date(report.createdAt);
                    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    navigate('/map', { state: { selectedDate: dateStr } });
                  }}
                  className="text-xs font-bold text-blue-600 flex items-center hover:underline"
                >
                  <MapPin size={14} className="mr-1" /> {t('person.viewMap')}
                </button>
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="bg-gray-50 rounded-3xl p-10 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">{t('person.noReports')}</p>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between mt-6 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Ver</span>
            <select
              className="text-xs font-bold border-0 bg-gray-50 rounded-lg px-2 py-1 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
            >
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-bold text-gray-500">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

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

export default PersonDetail;
