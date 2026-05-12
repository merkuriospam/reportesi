import React from 'react';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    Cookies.set('i18n_lang', code, { expires: 365 });
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <Globe size={16} className="text-gray-400 shrink-0" />
      <div className="flex gap-1">
        {languages.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => handleChange(code)}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
              i18n.language === code
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
