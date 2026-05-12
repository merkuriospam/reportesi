import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Clock, MapPin, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZES = [10, 20, 40];

const PersonDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerson();
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
    if (window.confirm('¿Seguro que deseas eliminar a esta persona? También se eliminarán todos sus reportes de asistencia.')) {
      try {
        await api.delete(`/people/${person.id}`);
        navigate('/people');
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!person) return <div className="text-center py-20 text-gray-500">Persona no encontrada.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <button 
        onClick={() => navigate('/people')}
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors font-bold text-sm uppercase tracking-wider"
      >
        <ArrowLeft size={18} className="mr-2" /> Volver al Censo
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-blue-600 text-4xl font-black ring-8 ring-white">
            {person.name[0]}
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                {person.name} {person.alias && <span className="text-gray-400 font-normal ml-2">("{person.alias}")</span>}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {person.gender && <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black uppercase rounded-full">{person.gender}</span>}
                {person.ageEstimate && <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black uppercase rounded-full">~{person.ageEstimate} años</span>}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
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
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
              >
                NUEVO REPORTE
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-gray-50 pt-8">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Descripción General</h3>
              <p className="text-gray-700 leading-relaxed italic">
                {person.description || 'Sin notas adicionales registradas.'}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Ubicación Frecuente</h3>
              <div className="flex items-center text-gray-700 font-medium">
                <MapPin size={20} className="text-red-500 mr-2 shrink-0" />
                {person.lastKnownLocation || 'No especificada.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center">
        <Clock className="mr-2 text-blue-500" /> Historial de Asistencias
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
            <p className="text-gray-700 text-sm mb-4 italic">"{report.comment || 'Sin comentarios.'}"</p>
            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                report.status === 'Resuelto' ? 'bg-green-100 text-green-700' :
                report.status === 'Atendido' ? 'bg-blue-100 text-blue-700' : 
                'bg-yellow-100 text-yellow-700'
              }`}>
                {report.status}
              </span>
              <button
                onClick={() => {
                  const d = new Date(report.createdAt);
                  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  navigate('/map', { state: { selectedDate: dateStr } });
                }}
                className="text-xs font-bold text-blue-600 flex items-center hover:underline"
              >
                <MapPin size={14} className="mr-1" /> VER MAPA
              </button>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="bg-gray-50 rounded-3xl p-10 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Esta persona aún no tiene reportes de asistencia.</p>
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
    </div>
  );
};

export default PersonDetail;
