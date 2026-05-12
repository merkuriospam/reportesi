import React, { useState, useRef, useEffect } from 'react';
import { Users, Edit2, X } from 'lucide-react';

interface Person {
  id: number;
  name: string;
  alias?: string;
}

interface AutocompleteProps {
  people: Person[];
  value: string;
  onChange: (personId: string) => void;
  onEdit: (person: Person) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ people, value, onChange, onEdit }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const selected = people.find(p => p.id.toString() === value);

  const filtered = people.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.alias && p.alias.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selected) {
      setQuery(selected.name);
    } else if (!value) {
      setQuery('');
    }
  }, [value, selected]);

  const handleSelect = (person: Person) => {
    onChange(person.id.toString());
    setQuery(person.name);
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={inputRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            className="w-full p-4 pl-10 bg-gray-50 border-0 rounded-2xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-lg font-medium"
            placeholder="Buscar persona por nombre o alias..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>
          )}

          {open && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-4 text-gray-400 text-sm text-center">Sin resultados</div>
              ) : (
                filtered.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`w-full text-left p-4 hover:bg-blue-50 transition border-b border-gray-100 last:border-0 ${
                      p.id.toString() === value ? 'bg-blue-50 font-semibold' : ''
                    }`}
                    onClick={() => handleSelect(p)}
                  >
                    <span className="text-gray-800">{p.name}</span>
                    {p.alias && (
                      <span className="text-gray-400 ml-1">"{p.alias}"</span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => selected && onEdit(selected)}
          disabled={!selected}
          className={`shrink-0 p-4 rounded-2xl transition-all flex items-center justify-center ${
            selected
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 ring-1 ring-blue-200'
              : 'bg-gray-50 text-gray-300 cursor-not-allowed ring-1 ring-gray-200'
          }`}
        >
          <Edit2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default Autocomplete;
