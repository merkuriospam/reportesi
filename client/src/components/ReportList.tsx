import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock, MapPin, ClipboardList, Calendar as CalendarIcon } from 'lucide-react';
import Calendar from './Calendar';

const ReportList: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [datesWithReports, setDatesWithReports] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);

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
      const response = await api.get(`/reports/by-date/${dateStr}`);
      setReports(response.data.reverse());
    } catch (err) {
      console.error('Error fetching reports', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Crítica': return 'bg-red-100 text-red-700 border-red-200';
      case 'Alta': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Media': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading && reports.length === 0) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-10 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Historial de Recorrida</h2>
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

      <div className="mb-4 px-1">
        <p className="text-sm font-bold text-gray-500 capitalize">{formatDateHeader(selectedDate)}</p>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className="p-4 sm:p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3">
                    {report.Person?.name[0] || '?'}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 leading-tight">
                      {report.Person?.name || 'Persona Desconocida'}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center mt-0.5">
                      <Clock size={12} className="mr-1" /> {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getUrgencyColor(report.urgency)}`}>
                  {report.urgency}
                </span>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-xl mb-4 text-gray-700 text-sm italic leading-relaxed">
                "{report.comment || 'Sin comentarios adicionales.'}"
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                    report.status === 'Atendido' ? 'bg-green-100 text-green-700' : 
                    report.status === 'Derivado' ? 'bg-purple-100 text-purple-700' : 
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    • {report.status}
                  </span>
                </div>
                
                <button 
                  onClick={() => navigate('/map', { state: { selectedDate: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` } })}
                  className="flex items-center text-xs font-bold text-blue-600 hover:text-indigo-700 transition"
                >
                  <MapPin size={16} className="mr-1" /> VER EN MAPA
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && reports.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <ClipboardList size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">No se han registrado reportes en esta jornada.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportList;
