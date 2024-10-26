import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Loader } from 'lucide-react';
import { calculateFinancialRatios } from './utils/financialAnalysis';

interface FinancialAnalysisProps {
  statements: any;
  onAnalysisComplete: (analysis: any) => void;
}

const FinancialAnalysis: React.FC<FinancialAnalysisProps> = ({ statements, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    performAnalysis();
  }, [statements]);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Calculate financial ratios
      setProgress(25);
      const ratios = await calculateFinancialRatios(statements);
      setProgress(50);

      // Generate analysis results
      const analysis = {
        ratios,
        summary: generateSummary(ratios),
        recommendations: generateRecommendations(ratios)
      };
      setProgress(100);

      onAnalysisComplete(analysis);
    } catch (error) {
      console.error('Error performing analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSummary = (ratios: any) => {
    return {
      profitability: analyzeProfitability(ratios.profitability),
      liquidity: analyzeLiquidity(ratios.liquidity),
      efficiency: analyzeEfficiency(ratios.efficiency),
      leverage: analyzeLeverage(ratios.leverage)
    };
  };

  const analyzeProfitability = (ratios: any) => ({
    status: ratios.netProfitMargin > 10 ? 'good' : 'needs-improvement',
    details: `Net profit margin is ${ratios.netProfitMargin.toFixed(2)}%`
  });

  const analyzeLiquidity = (ratios: any) => ({
    status: ratios.currentRatio > 1.5 ? 'good' : 'needs-improvement',
    details: `Current ratio is ${ratios.currentRatio.toFixed(2)}`
  });

  const analyzeEfficiency = (ratios: any) => ({
    status: ratios.assetTurnover > 1 ? 'good' : 'needs-improvement',
    details: `Asset turnover is ${ratios.assetTurnover.toFixed(2)}`
  });

  const analyzeLeverage = (ratios: any) => ({
    status: ratios.debtToEquity < 2 ? 'good' : 'needs-improvement',
    details: `Debt to equity ratio is ${ratios.debtToEquity.toFixed(2)}`
  });

  const generateRecommendations = (ratios: any) => {
    const recommendations = [];

    if (ratios.profitability.netProfitMargin < 10) {
      recommendations.push('Consider strategies to improve profit margins');
    }
    if (ratios.liquidity.currentRatio < 1.5) {
      recommendations.push('Review working capital management');
    }
    if (ratios.efficiency.assetTurnover < 1) {
      recommendations.push('Look for ways to improve asset utilization');
    }
    if (ratios.leverage.debtToEquity > 2) {
      recommendations.push('Consider debt reduction strategies');
    }

    return recommendations;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('statementBuilder.analysis.title')}</h2>
      
      {isAnalyzing ? (
        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-center">
            <Loader className="animate-spin mr-2" />
            <span>{t('statementBuilder.analysis.analyzing')}</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={performAnalysis}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('statementBuilder.analysis.reanalyze')}
            <ArrowRight className="ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FinancialAnalysis;