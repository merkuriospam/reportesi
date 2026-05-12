import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Autocomplete from './Autocomplete';
import { MapPin, CheckCircle } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ReportForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [people, setPeople] = useState<any[]>([]);
  const [personId, setPersonId] = useState(searchParams.get('personId') || '');
  const [comment, setComment] = useState('');
  const [urgency, setUrgency] = useState('Media');
  const [status, setStatus] = useState('Pendiente');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPeople();
    getLocation();
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

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location', error);
          alert('No se pudo obtener la ubicación. Por favor activa el GPS.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert('Esperando ubicación GPS...');
      return;
    }
    setLoading(true);
    try {
      await api.post('/reports', {
        personId: parseInt(personId),
        latitude: location.lat,
        longitude: location.lng,
        comment,
        urgency,
        status
      });
      setMessage('Reporte enviado correctamente');
      setPersonId('');
      setComment('');
      setUrgency('Media');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Error al enviar el reporte');
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
          Nueva Visita
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 ml-1">Persona Asistida</label>
            <Autocomplete
              people={people}
              value={personId}
              onChange={setPersonId}
              onEdit={(person) => navigate('/people', { state: { editPerson: person } })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Nivel de Urgencia</label>
              <select
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica 🆘</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Estado Inicial</label>
              <select
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Atendido">Ya atendido</option>
                <option value="Derivado">Derivado</option>
                <option value="Resuelto">Resuelto</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">Observaciones / Hallazgos</label>
            <textarea
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition min-h-[140px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Cómo se encuentra la persona? ¿Necesitó abrigo, comida, salud?"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center text-sm font-semibold">
              <MapPin size={20} className="mr-2 text-blue-500" />
              {location ? (
                <span className="text-green-600">Ubicación fijada correctamente</span>
              ) : (
                <span className="text-gray-400 animate-pulse">Obteniendo coordenadas GPS...</span>
              )}
            </div>
            {location && (
              <span className="text-[10px] text-gray-400 font-mono">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
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
            {loading ? 'Procesando...' : 'REGISTRAR VISITA'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
