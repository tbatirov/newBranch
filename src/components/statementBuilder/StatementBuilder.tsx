import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileSpreadsheet, ArrowRight, AlertCircle } from 'lucide-react';
import { ProcessedData } from './types';
import { processExcelData } from './utils/dataProcessing';

const StatementBuilder: React.FC = () => {
  const [uploadedData, setUploadedData] = useState<ProcessedData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    console.log('File selected:', file.name, 'Type:', file.type);

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        console.log('File loaded, processing data...');
        if (e.target?.result instanceof ArrayBuffer) {
          const data = processExcelData(e.target.result);
          console.log('Data processed:', data);
          setUploadedData(data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error processing file:', errorMessage);
        setError(errorMessage);
        setUploadedData(null);
      }
    };

    reader.onerror = (e) => {
      console.error('FileReader error:', reader.error);
      setError('Error reading file: ' + reader.error?.message);
      setUploadedData(null);
    };

    try {
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error starting file read:', err);
      setError('Error reading file');
      setUploadedData(null);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">{t('statementBuilder.title')}</h1>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 flex items-start">
          <AlertCircle className="text-red-500 mr-2 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {!uploadedData ? (
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
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {t('statementBuilder.dataPreview')}
            </h2>
            <button
              onClick={() => setUploadedData(null)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Upload Different File
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
              <tbody className="bg-white divide-y divide-gray-200">
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
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Totals
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {formatNumber(uploadedData.reduce((sum, row) => sum + row.debit_balance, 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {formatNumber(uploadedData.reduce((sum, row) => sum + row.credit_balance, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
            >
              Generate Statements
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatementBuilder;