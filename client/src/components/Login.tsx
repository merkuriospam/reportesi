import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      onLogin(response.data.token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 sm:mt-24 px-4">
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-100 p-8 border border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg mb-4 rotate-3">
            <ClipboardList size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">{t('auth.welcome')}</h2>
          <p className="text-gray-400 font-medium mt-1">{t('auth.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">{t('auth.username')}</label>
            <input
              type="text"
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('auth.usernamePlaceholder')}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">{t('auth.password')}</label>
            <input
              type="password"
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              required
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400 font-medium">
          {t('auth.noAccount')} <Link to="/register" className="text-blue-600 font-bold hover:underline">{t('auth.registerHere')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
