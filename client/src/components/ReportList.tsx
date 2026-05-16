import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock, MapPin, ClipboardList, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import Calendar from './Calendar';
import ReportEditModal from './ReportEditModal';

const PAGE_SIZES = [10, 20, 40];

const ReportList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [datesWithReports, setDatesWithReports] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);

  useEffect(() => {
    fetchDatesWithReports();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [selectedDate, page, pageSize]);

  const fetchDatesWithReports = async () => {
    try {
      const res = await api.get('/reports/dates-with-reports');
      setDatesWithReports(res.data);
    } catch (err) {
      console.error('Error fetching dates', err);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `/reports?limit=${pageSize}&offset=${page * pageSize}`;
      if (selectedDate) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        url += `&date=${year}-${month}-${day}`;
      }
      const response = await api.get(url);
      setReports(response.data.data);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Error fetching reports', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setPage(0);
    setCalendarOpen(false);
  };

  const clearDate = () => {
    setSelectedDate(null);
    setPage(0);
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

  const dateParam = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const handleUpdateReport = (updated: any) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading && reports.length === 0) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-10 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">{t('history.title')}</h2>
        <div className="flex items-center gap-2">
          {selectedDate && (
            <button
              onClick={clearDate}
              className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
              title={t('history.showAll')}
            >
              <X size={20} />
            </button>
          )}
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
      </div>

      {calendarOpen && (
        <>
          <div className="fixed inset-0 z-[999]" onClick={() => setCalendarOpen(false)} />
          <Calendar
            selectedDate={selectedDate || new Date()}
            onSelectDate={handleSelectDate}
            datesWithReports={datesWithReports}
            onClose={() => setCalendarOpen(false)}
          />
        </>
      )}

      <div className="mb-4 px-1 flex items-center gap-2">
        {selectedDate ? (
          <>
            <p className="text-sm font-bold text-gray-500 capitalize">
              {selectedDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <button onClick={clearDate} className="text-gray-400 hover:text-red-500 transition">
              <X size={16} />
            </button>
          </>
        ) : (
          <p className="text-sm font-bold text-blue-600">{t('history.filterDate')}</p>
        )}
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
                    <button onClick={() => navigate(`/person/${report.personId}`)} className="font-black text-gray-900 leading-tight hover:text-blue-600 transition-colors text-left">
                      {report.Person?.name || t('history.unknownPerson')}
                    </button>
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
                "{report.comment || t('history.noComments')}"
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                    report.status === 'Resuelto' ? 'bg-green-100 text-green-700' :
                    report.status === 'Atendido' ? 'bg-blue-100 text-blue-700' : 
                    report.status === 'Derivado' ? 'bg-purple-100 text-purple-700' : 
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    • {report.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingReport(report); }}
                    className="p-1.5 text-gray-500 bg-gray-100 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Editar"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => navigate('/map', { state: { selectedDate: dateParam(new Date(report.createdAt)) } })}
                    className="flex items-center text-xs font-bold text-blue-600 hover:text-indigo-700 transition"
                  >
                    <MapPin size={16} className="mr-1" /> {t('history.viewMap')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!loading && reports.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <ClipboardList size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">{t('history.noReports')}</p>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between mt-6 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">{t('history.view')}</span>
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

export default ReportList;
