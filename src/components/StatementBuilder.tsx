import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileSpreadsheet, ArrowRight, AlertCircle, BarChart2, RefreshCw, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ProcessedData, GeneratedStatements } from './statementBuilder/types';
import { processExcelData } from './statementBuilder/utils/dataProcessing';
import { generateFinancialStatements, downloadStatementAsExcel } from './statementBuilder/utils/statementGeneration';
import StatementPreview from './statementBuilder/components/StatementPreview';
import Button from './ui/Button';

const StatementBuilder: React.FC = () => {
  const [uploadedData, setUploadedData] = useState<ProcessedData[] | null>(null);
  const [generatedStatements, setGeneratedStatements] = useState<GeneratedStatements | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = processExcelData(arrayBuffer);
      setUploadedData(data);
      setGeneratedStatements(null); // Reset generated statements when new file is uploaded
    } catch (err) {
      setError(t('statementBuilder.invalidFormat'));
      setUploadedData(null);
      setGeneratedStatements(null);
    }
  };

  const handleGenerateStatements = () => {
    if (!uploadedData) return;

    try {
      const statements = generateFinancialStatements(uploadedData);
      setGeneratedStatements(statements);
      setError(null);
    } catch (err) {
      setError(t('statementBuilder.error'));
      setGeneratedStatements(null);
    }
  };

  const handleDownloadExcel = (type: 'balanceSheet' | 'incomeStatement') => {
    if (!generatedStatements) return;
    downloadStatementAsExcel(generatedStatements, type);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const renderNextSteps = () => {
    if (!generatedStatements) return null;

    const steps = [
      {
        title: t('statementBuilder.nextSteps.analysis'),
        description: t('statementBuilder.nextSteps.analysisDesc'),
        icon: <BarChart2 className="h-6 w-6" />,
        action: () => console.log('Navigate to analysis')
      },
      {
        title: t('statementBuilder.nextSteps.conversion'),
        description: t('statementBuilder.nextSteps.conversionDesc'),
        icon: <RefreshCw className="h-6 w-6" />,
        action: () => console.log('Navigate to conversion')
      },
      {
        title: t('statementBuilder.nextSteps.disclosures'),
        description: t('statementBuilder.nextSteps.disclosuresDesc'),
        icon: <FileText className="h-6 w-6" />,
        action: () => console.log('Navigate to disclosures')
      }
    ];

    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">{t('statementBuilder.nextSteps.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={step.action}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 text-blue-500 group-hover:text-blue-600 transition-colors">
                  {step.icon}
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {step.description}
                  </p>
                </div>
                <ArrowRight className="ml-auto flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">{t('statementBuilder.title')}</h1>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 flex items-start">
          <AlertCircle className="text-red-500 mr-2 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-800 font-medium">{t('common.error')}</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-3" />
            <span className="text-sm text-gray-600">
              {t('statementBuilder.uploadSection')}
            </span>
            <span className="mt-2 text-xs text-gray-500">
              {t('statementBuilder.fileFormat')}
            </span>
          </label>
        </div>

        {uploadedData && (
          <>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">{t('statementBuilder.dataPreview')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('statementBuilder.accountCode')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('statementBuilder.accountName')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('statementBuilder.debitBalance')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('statementBuilder.creditBalance')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.account_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.account_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatNumber(row.debit_balance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatNumber(row.credit_balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <Button
                  variant="primary"
                  icon={<RefreshCw className="h-5 w-5" />}
                  onClick={handleGenerateStatements}
                >
                  {t('statementBuilder.generateStatements')}
                </Button>
              </div>
            </div>

            {generatedStatements && (
              <>
                <StatementPreview statements={generatedStatements} />
                <div className="mt-6 flex justify-end space-x-4">
                  <Button
                    variant="success"
                    icon={<FileSpreadsheet className="h-5 w-5" />}
                    onClick={() => handleDownloadExcel('balanceSheet')}
                  >
                    {t('statementBuilder.balanceSheet')}
                  </Button>
                  <Button
                    variant="success"
                    icon={<FileSpreadsheet className="h-5 w-5" />}
                    onClick={() => handleDownloadExcel('incomeStatement')}
                  >
                    {t('statementBuilder.incomeStatement')}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {renderNextSteps()}
    </div>
  );
};

export default StatementBuilder;