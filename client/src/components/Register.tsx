import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, UserPlus } from 'lucide-react';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { username, password, pin });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 sm:mt-24 px-4">
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-100 p-8 border border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-600 to-teal-600"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg mb-4 -rotate-3">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">{t('auth.registerTitle')}</h2>
          <p className="text-gray-400 font-medium mt-1">{t('auth.registerSubtitle')}</p>
        </div>

        {success ? (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <ClipboardList size={40} />
            </div>
            <p className="text-green-600 font-bold text-lg">{t('auth.registerSuccess')}</p>
            <p className="text-gray-500 text-sm mt-1">{t('auth.registerRedirect')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">{t('auth.username')}</label>
              <input
                type="text"
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl ring-1 ring-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('auth.registerUsernamePlaceholder')}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">{t('auth.password')}</label>
              <input
                type="password"
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl ring-1 ring-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.registerPasswordPlaceholder')}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">{t('auth.registerPin')}</label>
              <input
                type="password"
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl ring-1 ring-gray-200 focus:ring-2 focus:ring-green-600 outline-none transition"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t('auth.registerPinPlaceholder')}
                required
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? t('auth.registering') : t('auth.registerButton')}
            </button>
          </form>
        )}

        {!success && (
          <p className="mt-8 text-center text-sm text-gray-400 font-medium">
            {t('auth.hasAccount')} <Link to="/login" className="text-green-600 font-bold hover:underline">{t('auth.loginLink')}</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
