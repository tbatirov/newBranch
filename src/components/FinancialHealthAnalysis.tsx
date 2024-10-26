import React, { useState, useCallback } from 'react';
import { analyzeFinancialHealth } from '../utils/api';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';
import { RefreshCw, ArrowRight, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { ParsedData } from '../utils/fileParsers';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';

interface FinancialHealthAnalysisProps {
  statements: { name: string; ifrsData: ParsedData }[];
  onAnalysisComplete: (analysis: FinancialHealthData) => void;
  onProgress: (progress: number) => void;
}

interface FinancialHealthData {
  analysis: string;
  ratios: { [key: string]: number };
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

const FinancialHealthAnalysis: React.FC<FinancialHealthAnalysisProps> = ({
  statements,
  onAnalysisComplete,
  onProgress,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FinancialHealthData | null>(null);
  const { t, i18n } = useTranslation();

  const performAnalysis = useCallback(async () => {
    if (isAnalyzing || !statements.length) return;

    setIsAnalyzing(true);
    setError(null);
    onProgress(0);

    try {
      const progressInterval = setInterval(() => {
        onProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      // Combine all IFRS data from statements
      const combinedIfrsData = statements.reduce((acc, statement) => {
        return { ...acc, ...statement.ifrsData };
      }, {});

      const result = await analyzeFinancialHealth(combinedIfrsData, i18n.language);
      clearInterval(progressInterval);
      
      setAnalysis(result);
      onProgress(100);
      
      logger.log(LogLevel.INFO, 'Financial health analysis completed successfully', { 
        analysisData: result 
      });
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Error analyzing financial health', { error });
      setError(t('common.error') + ': ' + (error instanceof Error ? error.message : String(error)));
      onProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  }, [statements, onProgress, t, i18n.language]);

  const renderRatioCard = (title: string, value: number, trend: 'up' | 'down' | 'neutral') => {
    const getTrendColor = () => {
      switch (trend) {
        case 'up': return 'text-green-500';
        case 'down': return 'text-red-500';
        default: return 'text-gray-500';
      }
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h4 className="text-sm font-medium text-gray-600 mb-2">{title}</h4>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{value.toFixed(2)}</span>
          <span className={getTrendColor()}>
            {trend === 'up' && <TrendingUp size={20} />}
            {trend === 'down' && <TrendingDown size={20} />}
          </span>
        </div>
      </div>
    );
  };

  const renderAnalysisSection = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(analysis.ratios).map(([key, value]) => (
            <div key={key}>
              {renderRatioCard(
                key,
                value,
                value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'
              )}
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('financialHealthAnalysis.analysisTitle')}</h3>
          <p className="text-gray-700 mb-6">{analysis.analysis}</p>

          <div className="space-y-4">
            {analysis.strengths.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-2">{t('financialHealthAnalysis.strengths')}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700">{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.concerns.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">{t('financialHealthAnalysis.concerns')}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.concerns.map((concern, index) => (
                    <li key={index} className="text-gray-700">{concern}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-2">{t('financialHealthAnalysis.recommendations')}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-gray-700">{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="primary"
            icon={<ArrowRight />}
            iconPosition="right"
            onClick={() => onAnalysisComplete(analysis)}
          >
            {t('common.proceedToNextStep')}
          </Button>
        </div>
      </div>
    );
  };

  if (!statements.length) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <AlertCircle className="text-yellow-400 mr-2" size={20} />
          <p className="text-yellow-700">{t('financialHealthAnalysis.noStatements')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{t('financialHealthAnalysis.title')}</h2>
      
      {error && (
        <div className="mb-4 flex items-center bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <AlertCircle className="text-red-500 mr-2" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center p-8">
          <RefreshCw className="animate-spin mb-4" size={32} />
          <p className="text-gray-600">{t('financialHealthAnalysis.analyzing')}</p>
        </div>
      ) : analysis ? (
        renderAnalysisSection()
      ) : (
        <Button
          variant="primary"
          icon={<RefreshCw />}
          onClick={performAnalysis}
          className="w-full"
        >
          {t('financialHealthAnalysis.analyze')}
        </Button>
      )}
    </div>
  );
};

export default FinancialHealthAnalysis;