import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, X, Check, Users, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZES = [10, 20, 40];

const PeopleAdmin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [people, setPeople] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPerson, setCurrentPerson] = useState({ 
    id: null as number | null, 
    name: '', 
    alias: '', 
    ageEstimate: '', 
    gender: '', 
    description: '', 
    lastKnownLocation: '' 
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPeople();
  }, [page, pageSize]);

  useEffect(() => {
    if (location.state?.editPerson) {
      setCurrentPerson(location.state.editPerson);
      setIsEditing(true);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const fetchPeople = async () => {
    try {
      const response = await api.get(`/people?limit=${pageSize}&offset=${page * pageSize}`);
      setPeople(response.data.data);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Error fetching people', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...currentPerson,
        ageEstimate: currentPerson.ageEstimate ? parseInt(currentPerson.ageEstimate as string) : null
      };
      if (currentPerson.id) {
        await api.put(`/people/${currentPerson.id}`, data);
      } else {
        await api.post('/people', data);
      }
      setIsEditing(false);
      resetForm();
      setPage(0);
      fetchPeople();
    } catch (err) {
      alert('Error al guardar');
    }
  };

  const resetForm = () => {
    setCurrentPerson({ 
      id: null, 
      name: '', 
      alias: '', 
      ageEstimate: '', 
      gender: '', 
      description: '', 
      lastKnownLocation: '' 
    });
  };

  const filteredPeople = useMemo(() => {
    if (!searchTerm) return people;
    const q = searchTerm.toLowerCase();
    return people.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.alias && p.alias.toLowerCase().includes(q))
    );
  }, [people, searchTerm]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Censo de Personas</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95"
          >
            <UserPlus size={20} className="inline mr-2" /> 
            <span className="hidden sm:inline">Nueva Persona</span>
          </button>
        )}
      </div>

      {!isEditing && (
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o alias..."
            className="w-full p-4 pl-12 border-0 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Users className="absolute left-4 top-4 text-gray-400" size={20} />
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">{currentPerson.id ? 'Editar Perfil' : 'Nuevo Registro'}</h3>
            <button 
              type="button"
              onClick={() => { setIsEditing(false); resetForm(); }}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 ml-1">Nombre Completo *</label>
              <input
                type="text"
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={currentPerson.name}
                onChange={(e) => setCurrentPerson({ ...currentPerson, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 ml-1">Alias / Apodo</label>
              <input
                type="text"
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={currentPerson.alias}
                onChange={(e) => setCurrentPerson({ ...currentPerson, alias: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 ml-1">Edad Estimada</label>
              <input
                type="number"
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={currentPerson.ageEstimate}
                onChange={(e) => setCurrentPerson({ ...currentPerson, ageEstimate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 ml-1">Género</label>
              <select
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={currentPerson.gender}
                onChange={(e) => setCurrentPerson({ ...currentPerson, gender: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-semibold text-gray-600 ml-1">Última ubicación conocida</label>
              <input
                type="text"
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={currentPerson.lastKnownLocation}
                onChange={(e) => setCurrentPerson({ ...currentPerson, lastKnownLocation: e.target.value })}
                placeholder="Ej: Plaza de Mayo, Banco Nación..."
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-semibold text-gray-600 ml-1">Descripción / Notas médicas / Historia</label>
              <textarea
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                value={currentPerson.description}
                onChange={(e) => setCurrentPerson({ ...currentPerson, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={() => { setIsEditing(false); resetForm(); }}
              className="px-6 py-3 text-gray-500 font-semibold hover:bg-gray-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95 transition flex items-center"
            >
              <Check size={20} className="mr-2" /> {currentPerson.id ? 'Actualizar' : 'Guardar Registro'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPeople.map((p) => (
          <div 
            key={p.id} 
            onClick={() => navigate(`/person/${p.id}`)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group cursor-pointer active:scale-95"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-black text-xl">
                {p.name[0]}
              </div>
            </div>
            
            <h4 className="font-black text-lg text-gray-900 leading-tight mb-1">
              {p.name} {p.alias && <span className="text-gray-400 font-normal text-sm ml-1">("{p.alias}")</span>}
            </h4>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {p.gender && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold rounded-md tracking-wider">{p.gender}</span>}
              {p.ageEstimate && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold rounded-md tracking-wider">~{p.ageEstimate} años</span>}
            </div>

            {p.lastKnownLocation && (
              <p className="text-gray-500 text-xs mt-3 flex items-start italic">
                <MapPin size={14} className="mr-1 shrink-0" /> {p.lastKnownLocation}
              </p>
            )}

            <p className="text-gray-600 text-sm mt-3 line-clamp-2 italic">
              {p.description || 'Sin notas adicionales.'}
            </p>
          </div>
        ))}
        {people.length === 0 && !isEditing && (
          <div className="col-span-full py-20 text-center">
            <Users size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">No hay personas registradas aún.</p>
          </div>
        )}
      </div>

      {!isEditing && total > 0 && (
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

export default PeopleAdmin;
