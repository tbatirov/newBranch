import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProcessedData } from '../types';

interface DataPreviewProps {
  data: ProcessedData[];
  onContinue: () => void;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, onContinue }) => {
  const { t } = useTranslation();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">{t('statementBuilder.dataPreview')}</h3>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
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
            {data.map((row, index) => (
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
                {t('common.total')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                {formatNumber(data.reduce((sum, row) => sum + row.debit_balance, 0))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                {formatNumber(data.reduce((sum, row) => sum + row.credit_balance, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onContinue}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  );
};

export default DataPreview;