import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Loader, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface InsightGeneratorProps {
  analysis: {
    ratios: any;
    summary: any;
    recommendations: string[];
  };
  onInsightsGenerated: (insights: any) => void;
}

const InsightGenerator: React.FC<InsightGeneratorProps> = ({ analysis, onInsightsGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    generateInsights();
  }, [analysis]);

  const generateInsights = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Generate performance insights
      const performanceInsights = generatePerformanceInsights();
      setProgress(25);

      // Generate trend analysis
      const trendAnalysis = generateTrendAnalysis();
      setProgress(50);

      // Generate risk assessment
      const riskAssessment = generateRiskAssessment();
      setProgress(75);

      // Generate opportunities
      const opportunities = generateOpportunities();
      setProgress(100);

      const insights = {
        performance: performanceInsights,
        trends: trendAnalysis,
        risks: riskAssessment,
        opportunities: opportunities,
        actionItems: generateActionItems()
      };

      onInsightsGenerated(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePerformanceInsights = () => {
    const { profitability, liquidity, efficiency, leverage } = analysis.summary;
    
    return {
      strengths: Object.entries({ profitability, liquidity, efficiency, leverage })
        .filter(([_, value]) => value.status === 'good')
        .map(([key, value]) => ({
          area: key,
          details: value.details,
          impact: 'positive'
        })),
      weaknesses: Object.entries({ profitability, liquidity, efficiency, leverage })
        .filter(([_, value]) => value.status === 'needs-improvement')
        .map(([key, value]) => ({
          area: key,
          details: value.details,
          impact: 'negative'
        }))
    };
  };

  const generateTrendAnalysis = () => {
    const { ratios } = analysis;
    
    return {
      profitability: analyzeTrend(ratios.profitability),
      liquidity: analyzeTrend(ratios.liquidity),
      efficiency: analyzeTrend(ratios.efficiency),
      leverage: analyzeTrend(ratios.leverage)
    };
  };

  const analyzeTrend = (ratios: any) => {
    return Object.entries(ratios).map(([key, value]) => ({
      metric: key,
      value: value,
      trend: Math.random() > 0.5 ? 'increasing' : 'decreasing', // In a real app, compare with historical data
      significance: 'medium'
    }));
  };

  const generateRiskAssessment = () => {
    const risks = [];
    const { ratios } = analysis;

    if (ratios.liquidity.currentRatio < 1) {
      risks.push({
        type: 'liquidity',
        severity: 'high',
        description: 'Current ratio below 1 indicates potential liquidity issues',
        mitigation: 'Review working capital management and consider short-term financing options'
      });
    }

    if (ratios.leverage.debtToEquity > 2) {
      risks.push({
        type: 'financial',
        severity: 'medium',
        description: 'High debt-to-equity ratio increases financial risk',
        mitigation: 'Develop debt reduction strategy and consider equity financing'
      });
    }

    return risks;
  };

  const generateOpportunities = () => {
    const { ratios, summary } = analysis;
    const opportunities = [];

    if (ratios.efficiency.assetTurnover < 1) {
      opportunities.push({
        area: 'Asset Utilization',
        potential: 'high',
        description: 'Improve asset turnover through better capacity utilization',
        implementation: 'Review asset management practices and identify underutilized assets'
      });
    }

    if (summary.profitability.status === 'needs-improvement') {
      opportunities.push({
        area: 'Profit Margins',
        potential: 'medium',
        description: 'Enhance profit margins through cost optimization',
        implementation: 'Analyze cost structure and identify areas for efficiency improvements'
      });
    }

    return opportunities;
  };

  const generateActionItems = () => {
    return analysis.recommendations.map((recommendation, index) => ({
      id: index + 1,
      action: recommendation,
      priority: index < 2 ? 'high' : 'medium',
      timeframe: index < 2 ? 'short-term' : 'medium-term',
      impact: 'significant'
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('statementBuilder.insights.title')}</h2>
      
      {isGenerating ? (
        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-center">
            <Loader className="animate-spin mr-2" />
            <span>{t('statementBuilder.insights.generating')}</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={generateInsights}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('statementBuilder.insights.regenerate')}
            <ArrowRight className="ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default InsightGenerator;