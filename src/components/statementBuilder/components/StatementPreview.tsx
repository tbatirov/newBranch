import React from 'react';
import { useTranslation } from 'react-i18next';
import { GeneratedStatements } from '../types';

interface StatementPreviewProps {
  statements: GeneratedStatements;
}

const StatementPreview: React.FC<StatementPreviewProps> = ({ statements }) => {
  const { t } = useTranslation();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const renderStatement = (title: string, sections: { [key: string]: Record<string, number> }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        {Object.entries(sections).map(([sectionName, accounts]) => (
          <div key={sectionName} className="mb-6 last:mb-0">
            <h4 className="text-lg font-medium text-gray-700 mb-3 capitalize">{sectionName}</h4>
            <div className="space-y-2">
              {Object.entries(accounts).map(([account, value]) => (
                <div key={account} className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600">{account}</span>
                  <span className="font-medium">{formatNumber(value)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 font-semibold border-t border-gray-300">
                <span>{t('common.total')}</span>
                <span>{formatNumber(Object.values(accounts).reduce((sum, val) => sum + val, 0))}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">{t('statementBuilder.preview.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderStatement(t('statementBuilder.preview.balanceSheet'), {
          [t('statementBuilder.preview.assets')]: statements.balanceSheet.assets,
          [t('statementBuilder.preview.liabilities')]: statements.balanceSheet.liabilities,
          [t('statementBuilder.preview.equity')]: statements.balanceSheet.equity
        })}
        {renderStatement(t('statementBuilder.preview.incomeStatement'), {
          [t('statementBuilder.preview.revenue')]: statements.incomeStatement.revenue,
          [t('statementBuilder.preview.expenses')]: statements.incomeStatement.expenses
        })}
      </div>
    </div>
  );
};

export default StatementPreview;