import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Clock, MapPin, User } from 'lucide-react';

const ReportList: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data.reverse()); // Show newest first
    } catch (err) {
      console.error('Error fetching reports', err);
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Crítica': return 'bg-red-100 text-red-700 border-red-200';
      case 'Alta': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Media': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Historial de Recorrida</h2>
        <div className="bg-white px-3 py-1 rounded-full shadow-sm text-xs font-bold text-gray-400 border border-gray-100">
          {reports.length} reportes
        </div>
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
                
                <a 
                  href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-xs font-bold text-blue-600 hover:text-indigo-700 transition"
                >
                  <MapPin size={16} className="mr-1" /> VER EN MAPA
                </a>
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
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
