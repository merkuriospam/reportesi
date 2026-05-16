import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { X, UserPlus } from 'lucide-react';

interface Props {
  onCreated: (person: { id: number; name: string; alias?: string }) => void;
  onClose: () => void;
}

const CreatePersonModal: React.FC<Props> = ({ onCreated, onClose }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [ageEstimate, setAgeEstimate] = useState('');
  const [gender, setGender] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/people', {
        name: name.trim(),
        alias: alias.trim() || null,
        ageEstimate: ageEstimate ? parseInt(ageEstimate) : null,
        gender: gender || null,
      });
      onCreated(res.data);
      onClose();
    } catch {
      alert(t('people.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
            <UserPlus size={22} /> {t('people.newTitle')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 ml-1">{t('people.nameLabel')}</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 ml-1">{t('people.aliasLabel')}</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 ml-1">{t('people.ageLabel')}</label>
              <input
                type="number"
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={ageEstimate}
                onChange={(e) => setAgeEstimate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 ml-1">{t('people.genderLabel')}</label>
              <select
                className="w-full p-3 bg-gray-50 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">{t('people.genderSelect')}</option>
                <option value="Masculino">{t('people.genderMale')}</option>
                <option value="Femenino">{t('people.genderFemale')}</option>
                <option value="Otro">{t('people.genderOther')}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {t('people.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className={`px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all shadow-lg active:scale-95 ${
                saving || !name.trim()
                  ? 'bg-gray-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200'
              }`}
            >
              {saving ? t('report.processing') : t('people.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePersonModal;
