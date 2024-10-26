import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, FileSpreadsheet, Printer, Share2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReportingDashboardProps {
  statements: any;
  analysis: any;
  insights: any;
}

const ReportingDashboard: React.FC<ReportingDashboardProps> = ({ statements, analysis, insights }) => {
  const [activeTab, setActiveTab] = useState<'statements' | 'analysis' | 'insights'>('statements');
  const { t } = useTranslation();

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Add financial statements
    const statementsWS = XLSX.utils.json_to_sheet(formatStatementsForExport());
    XLSX.utils.book_append_sheet(wb, statementsWS, 'Financial Statements');

    // Add analysis
    const analysisWS = XLSX.utils.json_to_sheet(formatAnalysisForExport());
    XLSX.utils.book_append_sheet(wb, analysisWS, 'Financial Analysis');

    // Add insights
    const insightsWS = XLSX.utils.json_to_sheet(formatInsightsForExport());
    XLSX.utils.book_append_sheet(wb, insightsWS, 'Business Insights');

    XLSX.writeFile(wb, 'Financial_Report.xlsx');
  };

  const formatStatementsForExport = () => {
    return Object.entries(statements).map(([category, accounts]) => ({
      Category: category,
      ...accounts
    }));
  };

  const formatAnalysisForExport = () => {
    return Object.entries(analysis.ratios).map(([category, ratios]) => ({
      Category: category,
      ...ratios
    }));
  };

  const formatInsightsForExport = () => {
    return [
      ...insights.performance.strengths,
      ...insights.performance.weaknesses,
      ...insights.opportunities
    ];
  };

  const printReport = () => {
    window.print();
  };

  const renderStatements = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{t('statementBuilder.reporting.statements')}</h3>
      {Object.entries(statements).map(([category, accounts]) => (
        <div key={category} className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium mb-2 capitalize">{category}</h4>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-2">Account</th>
                <th className="text-right py-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(accounts).map(([account, data]: [string, any]) => (
                <tr key={account}>
                  <td className="py-1">{data.name}</td>
                  <td className="text-right">{data.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{t('statementBuilder.reporting.analysis')}</h3>
      {Object.entries(analysis.ratios).map(([category, ratios]: [string, any]) => (
        <div key={category} className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium mb-2 capitalize">{category}</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(ratios).map(([ratio, value]: [string, any]) => (
              <div key={ratio} className="p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-600 capitalize">{ratio}</p>
                <p className="text-lg font-medium">{typeof value === 'number' ? value.toFixed(2) : value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{t('statementBuilder.reporting.insights')}</h3>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-medium mb-2">{t('statementBuilder.reporting.strengths')}</h4>
        <ul className="list-disc list-inside space-y-2">
          {insights.performance.strengths.map((strength: any, index: number) => (
            <li key={index}>{strength.details}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-medium mb-2">{t('statementBuilder.reporting.opportunities')}</h4>
        <ul className="list-disc list-inside space-y-2">
          {insights.opportunities.map((opportunity: any, index: number) => (
            <li key={index}>{opportunity.description}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-medium mb-2">{t('statementBuilder.reporting.actions')}</h4>
        <ul className="list-disc list-inside space-y-2">
          {insights.actionItems.map((item: any) => (
            <li key={item.id} className="flex items-center justify-between">
              <span>{item.action}</span>
              <span className="text-sm text-gray-500">{item.priority}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('statementBuilder.reporting.title')}</h2>
        <div className="flex space-x-2">
          <button
            onClick={exportToExcel}
            className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            {t('statementBuilder.reporting.exportExcel')}
          </button>
          <button
            onClick={printReport}
            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Printer className="w-4 h-4 mr-2" />
            {t('statementBuilder.reporting.print')}
          </button>
        </div>
      </div>

      <div className="flex space-x-4 border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'statements' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('statements')}
        >
          {t('statementBuilder.reporting.statements')}
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'analysis' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          {t('statementBuilder.reporting.analysis')}
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'insights' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          {t('statementBuilder.reporting.insights')}
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'statements' && renderStatements()}
        {activeTab === 'analysis' && renderAnalysis()}
        {activeTab === 'insights' && renderInsights()}
      </div>
    </div>
  );
};

export default ReportingDashboard;