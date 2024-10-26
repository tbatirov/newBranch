import React from 'react';
import { useTranslation } from 'react-i18next';

const RequirementsGuide: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">{t('statementBuilder.uploader.requirements')}</h3>
      <ul className="list-disc list-inside text-sm space-y-1">
        <li>{t('statementBuilder.uploader.reqAccountCode')} (код счета / hisob raqami)</li>
        <li>{t('statementBuilder.uploader.reqAccountName')} (наименование счета / hisob nomi)</li>
        <li>{t('statementBuilder.uploader.reqDebitBalance')} (дебет / debet)</li>
        <li>{t('statementBuilder.uploader.reqCreditBalance')} (кредит / kredit)</li>
      </ul>
      <p className="mt-4 text-sm text-gray-600">
        {t('statementBuilder.uploader.trialBalanceNote')}
      </p>
      <div className="mt-4 bg-white p-4 rounded border">
        <h4 className="font-medium mb-2">{t('statementBuilder.uploader.exampleFormat')}</h4>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Код счета / Account Code</th>
              <th className="text-left">Наименование / Account Name</th>
              <th className="text-right">Дебет / Debit</th>
              <th className="text-right">Кредит / Credit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1000</td>
              <td>Денежные средства / Cash</td>
              <td className="text-right">10000</td>
              <td className="text-right">0</td>
            </tr>
            <tr>
              <td>2000</td>
              <td>Счета к оплате / Accounts Payable</td>
              <td className="text-right">0</td>
              <td className="text-right">5000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequirementsGuide;