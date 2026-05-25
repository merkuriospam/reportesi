import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, FileText, AlertCircle, CheckCircle2, TrendingUp, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const PAGE_SIZE = 10;

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalPeople: 0,
    totalReports: 0,
    criticalReports: 0,
    attendedReports: 0,
  });
  const [reports, setReports] = useState<any[]>([]);
  const [urgentPage, setUrgentPage] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [peopleRes, reportsRes] = await Promise.all([
        api.get('/people?limit=1000'),
        api.get('/reports?limit=1000')
      ]);
      
      const people = peopleRes.data.data;
      const allReports = reportsRes.data.data;
      setReports(allReports);
      
      const latestPerPerson = new Map<number, any>();
      for (const r of allReports) {
        const prev = latestPerPerson.get(r.personId);
        if (!prev || new Date(r.reportedAt) > new Date(prev.reportedAt)) {
          latestPerPerson.set(r.personId, r);
        }
      }
      const latestReports = [...latestPerPerson.values()];

      setStats({
        totalPeople: people.length,
        totalReports: allReports.length,
        criticalReports: latestReports.filter((r: any) => r.urgency === 'Crítica' && r.status !== 'Resuelto').length,
        attendedReports: latestReports.filter((r: any) => r.status === 'Resuelto').length,
      });
    } catch (err) {
      console.error('Error fetching stats', err);
    } finally {
      setLoading(false);
    }
  };

  const monthlyData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r: any) => {
      const raw = r.reportedAt;
      if (!raw) return;
      const d = new Date(raw);
      const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      counts[s] = (counts[s] || 0) + 1;
    });
    const keys = Object.keys(counts).sort();
    const days = keys.map(date => ({ label: date, count: counts[date], date }));
    const maxCount = Math.max(...days.map(d => d.count), 1);
    return { days, maxCount };
  }, [reports]);

  const urgentReports = useMemo(() => {
    const latest = new Map<number, any>();
    for (const r of reports) {
      const prev = latest.get(r.personId);
      if (!prev || new Date(r.reportedAt) > new Date(prev.reportedAt)) {
        latest.set(r.personId, r);
      }
    }
    return [...latest.values()].filter((r: any) =>
      r.status !== 'Resuelto' && (r.urgency === 'Alta' || r.urgency === 'Crítica')
    );
  }, [reports]);

  const totalUrgentPages = Math.ceil(urgentReports.length / PAGE_SIZE);
  const paginatedUrgent = urgentReports.slice(urgentPage * PAGE_SIZE, (urgentPage + 1) * PAGE_SIZE);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-gray-500 font-medium mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button onClick={() => navigate('/people')} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group text-left cursor-pointer hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <Users className="text-blue-600 mb-3 relative z-10" size={24} />
          <div className="text-2xl font-black text-gray-900 leading-none">{stats.totalPeople}</div>
          <div className="text-xs font-bold text-gray-400 uppercase mt-1">{t('dashboard.census')}</div>
        </button>

        <button onClick={() => navigate('/history')} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group text-left cursor-pointer hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <FileText className="text-indigo-600 mb-3 relative z-10" size={24} />
          <div className="text-2xl font-black text-gray-900 leading-none">{stats.totalReports}</div>
          <div className="text-xs font-bold text-gray-400 uppercase mt-1">{t('dashboard.history')}</div>
        </button>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <AlertCircle className="text-red-600 mb-3 relative z-10" size={24} />
          <div className="text-2xl font-black text-red-600 leading-none">{stats.criticalReports}</div>
          <div className="text-xs font-bold text-gray-400 uppercase mt-1">{t('dashboard.critical')}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <CheckCircle2 className="text-green-600 mb-3 relative z-10" size={24} />
          <div className="text-2xl font-black text-green-600 leading-none">{stats.attendedReports}</div>
          <div className="text-xs font-bold text-gray-400 uppercase mt-1">{t('dashboard.attended')}</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden mb-8">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <TrendingUp size={200} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-2 leading-tight">{t('dashboard.missionTitle')}</h2>
          <p className="text-blue-100 font-medium mb-6 max-w-sm">
            {t('dashboard.missionDesc')}
          </p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/report')} className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-transform active:scale-95">
              {t('dashboard.reportButton')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center">
            <AlertCircle className="mr-2 text-red-500" size={20} /> {t('dashboard.activeUrgencies')}
          </h3>
          {paginatedUrgent.length === 0 ? (
            <p className="text-gray-400 text-sm font-medium">{t('dashboard.noUrgencies')}</p>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedUrgent.map((r: any) => (
                  <div key={r.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      r.urgency === 'Crítica' ? 'bg-red-500' : 'bg-orange-500'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <button onClick={() => navigate(`/person/${r.personId}`)} className="text-sm font-bold text-gray-900 truncate hover:text-blue-600 transition-colors">{r.Person?.name || t('dashboard.unknownPerson')}</button>
                      <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {new Date(r.reportedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {r.comment && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.comment}</p>}
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.urgency === 'Crítica' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {r.urgency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {totalUrgentPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setUrgentPage(p => Math.max(0, p - 1))}
                    disabled={urgentPage === 0}
                    className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-xs font-bold text-gray-400">
                    {urgentPage + 1} / {totalUrgentPages}
                  </span>
                  <button
                    onClick={() => setUrgentPage(p => Math.min(totalUrgentPages - 1, p + 1))}
                    disabled={urgentPage === totalUrgentPages - 1}
                    className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-500" size={20} /> {t('dashboard.monthlyImpact')}
          </h3>
          <div className="h-24 relative flex items-end gap-px">
            {monthlyData.days.length === 0 ? (
              <p className="text-gray-400 text-sm absolute inset-0 flex items-center justify-center">{t('dashboard.noData')}</p>
            ) : monthlyData.days.map((day, i) => {
              const h = (day.count / monthlyData.maxCount) * 100;
              return (
                <div key={i} className="flex-1 relative h-full group cursor-pointer" onClick={() => navigate(`/map`, { state: { selectedDate: day.date } })}>
                  <div
                    className="absolute bottom-0 w-full rounded-t bg-blue-500 transition-all hover:opacity-80"
                    style={{ height: `${Math.max(h, 4)}%` }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                      {day.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
