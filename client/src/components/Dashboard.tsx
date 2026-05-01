import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, FileText, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalPeople: 0,
    totalReports: 0,
    criticalReports: 0,
    attendedReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [peopleRes, reportsRes] = await Promise.all([
        api.get('/people'),
        api.get('/reports')
      ]);
      
      const people = peopleRes.data;
      const reports = reportsRes.data;
      
      setStats({
        totalPeople: people.length,
        totalReports: reports.length,
        criticalReports: reports.filter((r: any) => r.urgency === 'Crítica').length,
        attendedReports: reports.filter((r: any) => r.status === 'Atendido').length,
      });
    } catch (err) {
      console.error('Error fetching stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Panel de Control</h1>
        <p className="text-gray-500 font-medium mt-1">Resumen de la actividad en calle</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <Users className="text-blue-600 mb-3 relative z-10" size={24} />
          <div className="text-2xl font-black text-gray-900 leading-none">{stats.totalPeople}</div>
          <div className="text-xs font-bold text-gray-400 uppercase mt-1">Censo Total</div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <FileText className="text-indigo-600 mb-3 relative z-10" size={24} />
          <div className="text-2xl font-black text-gray-900 leading-none">{stats.totalReports}</div>
          <div className="text-xs font-bold text-gray-400 uppercase mt-1">Reportes</div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <AlertCircle className="text-red-600 mb-3 relative z-10" size={24} />
          <div className="text-2xl font-black text-red-600 leading-none">{stats.criticalReports}</div>
          <div className="text-xs font-bold text-gray-400 uppercase mt-1">Críticos</div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <CheckCircle2 className="text-green-600 mb-3 relative z-10" size={24} />
          <div className="text-2xl font-black text-green-600 leading-none">{stats.attendedReports}</div>
          <div className="text-xs font-bold text-gray-400 uppercase mt-1">Atendidos</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden mb-8">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <TrendingUp size={200} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-2 leading-tight">Misión Nocturna</h2>
          <p className="text-blue-100 font-medium mb-6 max-w-sm">
            Cada reporte ayuda a mapear las necesidades reales y coordinar la asistencia efectiva.
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-transform active:scale-95">
              INICIAR RECORRIDA
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center">
            <AlertCircle className="mr-2 text-red-500" size={20} /> Urgencias Activas
          </h3>
          <p className="text-gray-400 text-sm font-medium">No hay urgencias críticas reportadas en las últimas 12 horas.</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-500" size={20} /> Impacto Semanal
          </h3>
          <div className="h-24 flex items-end gap-1">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-100 rounded-t-lg transition-all hover:bg-blue-600 group relative cursor-pointer" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {h}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
