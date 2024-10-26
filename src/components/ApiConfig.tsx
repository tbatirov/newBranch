import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

const ApiConfig: React.FC = () => {
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const savedOpenaiApiKey = localStorage.getItem('openaiApiKey');
    if (savedOpenaiApiKey) {
      setOpenaiApiKey(savedOpenaiApiKey);
      logger.log(LogLevel.INFO, 'API key loaded from localStorage');
    } else {
      logger.log(LogLevel.WARNING, 'No API key found in localStorage');
    }
  }, []);

  const handleOpenaiApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenaiApiKey(e.target.value);
    setError(null);
    setSuccess(false);
  };

  const handleSaveApiKeys = () => {
    try {
      if (!openaiApiKey.trim()) {
        throw new Error(t('apiConfig.emptyKeyError'));
      }

      localStorage.setItem('openaiApiKey', openaiApiKey);
      logger.log(LogLevel.INFO, 'API key saved successfully');
      setError(null);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('apiConfig.saveError');
      logger.log(LogLevel.ERROR, errorMessage, { error: err });
      setError(errorMessage);
      setSuccess(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('apiConfig.title')}</h1>
      
      {error && (
        <div className="mb-4 flex items-center bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <AlertCircle className="text-red-500 mr-2" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <CheckCircle className="text-green-500 mr-2" size={20} />
          <span className="text-green-700">{t('apiConfig.saveSuccess')}</span>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="mb-6 text-gray-600">
          {t('apiConfig.description')}
        </p>

        <div className="mb-6">
          <label 
            htmlFor="openai-api-key" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t('apiConfig.openaiApiKey')}
          </label>
          <input
            type="password"
            id="openai-api-key"
            value={openaiApiKey}
            onChange={handleOpenaiApiKeyChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder={t('apiConfig.enterApiKey')}
          />
        </div>

        <Button
          variant="primary"
          icon={<Save size={20} />}
          onClick={handleSaveApiKeys}
          className="w-full"
        >
          {t('apiConfig.saveApiKey')}
        </Button>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h3 className="font-medium text-blue-800 mb-2">
            {t('apiConfig.securityNote')}
          </h3>
          <p className="text-sm text-blue-700">
            {t('apiConfig.securityDescription')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiConfig;