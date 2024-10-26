import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Save, X, ChevronRight, ChevronDown } from 'lucide-react';

interface NasAccount {
  id: string;
  code: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parentId?: string;
  description?: string;
}

const NasAdmin: React.FC = () => {
  const [accounts, setAccounts] = useState<NasAccount[]>([]);
  const [editingAccount, setEditingAccount] = useState<NasAccount | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    // Load accounts from localStorage
    const savedAccounts = localStorage.getItem('nasAccounts');
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    }
  }, []);

  const saveAccounts = (updatedAccounts: NasAccount[]) => {
    localStorage.setItem('nasAccounts', JSON.stringify(updatedAccounts));
    setAccounts(updatedAccounts);
  };

  const handleAddAccount = () => {
    setEditingAccount({
      id: Date.now().toString(),
      code: '',
      nameUz: '',
      nameRu: '',
      nameEn: '',
      type: 'asset',
    });
  };

  const handleSaveAccount = (account: NasAccount) => {
    const updatedAccounts = editingAccount.id
      ? accounts.map(a => (a.id === editingAccount.id ? account : a))
      : [...accounts, account];
    
    saveAccounts(updatedAccounts);
    setEditingAccount(null);
  };

  const handleDeleteAccount = (id: string) => {
    const updatedAccounts = accounts.filter(a => a.id !== id);
    saveAccounts(updatedAccounts);
  };

  const toggleCategory = (type: string) => {
    setExpandedCategories(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const accountTypes = [
    { type: 'asset', range: '0-4', title: t('nasAdmin.types.assets') },
    { type: 'liability', range: '6', title: t('nasAdmin.types.liabilities') },
    { type: 'equity', range: '5', title: t('nasAdmin.types.equity') },
    { type: 'income', range: '7', title: t('nasAdmin.types.income') },
    { type: 'expense', range: '8', title: t('nasAdmin.types.expenses') },
  ];

  const AccountForm = ({ account, onSave, onCancel }: {
    account: NasAccount;
    onSave: (account: NasAccount) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(account);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {account.id ? t('nasAdmin.editAccount') : t('nasAdmin.addAccount')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('nasAdmin.accountCode')}</label>
              <input
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('nasAdmin.nameUz')}</label>
              <input
                type="text"
                value={formData.nameUz}
                onChange={e => setFormData({ ...formData, nameUz: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('nasAdmin.nameRu')}</label>
              <input
                type="text"
                value={formData.nameRu}
                onChange={e => setFormData({ ...formData, nameRu: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('nasAdmin.nameEn')}</label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('nasAdmin.type')}</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as NasAccount['type'] })}
                className="w-full p-2 border rounded"
              >
                {accountTypes.map(({ type, title }) => (
                  <option key={type} value={type}>{title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('nasAdmin.description')}</label>
              <textarea
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => onCancel()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => onSave(formData)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('nasAdmin.title')}</h1>
        <button
          onClick={handleAddAccount}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus size={20} className="mr-2" />
          {t('nasAdmin.addAccount')}
        </button>
      </div>

      <div className="space-y-4">
        {accountTypes.map(({ type, range, title }) => (
          <div key={type} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(type)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex items-center">
                {expandedCategories.includes(type) ? (
                  <ChevronDown size={20} className="mr-2" />
                ) : (
                  <ChevronRight size={20} className="mr-2" />
                )}
                <span className="font-medium">{title}</span>
                <span className="ml-2 text-gray-500">({range})</span>
              </div>
              <span className="text-gray-500">
                {accounts.filter(a => a.type === type).length} {t('nasAdmin.accounts')}
              </span>
            </button>
            
            {expandedCategories.includes(type) && (
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2">{t('nasAdmin.accountCode')}</th>
                      <th className="text-left py-2">{t('nasAdmin.nameUz')}</th>
                      <th className="text-left py-2">{t('nasAdmin.nameRu')}</th>
                      <th className="text-left py-2">{t('nasAdmin.nameEn')}</th>
                      <th className="text-right py-2">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts
                      .filter(account => account.type === type)
                      .sort((a, b) => a.code.localeCompare(b.code))
                      .map(account => (
                        <tr key={account.id} className="border-t">
                          <td className="py-2">{account.code}</td>
                          <td className="py-2">{account.nameUz}</td>
                          <td className="py-2">{account.nameRu}</td>
                          <td className="py-2">{account.nameEn}</td>
                          <td className="py-2 text-right">
                            <button
                              onClick={() => setEditingAccount(account)}
                              className="text-blue-500 hover:text-blue-700 mr-2"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAccount(account.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {editingAccount && (
        <AccountForm
          account={editingAccount}
          onSave={handleSaveAccount}
          onCancel={() => setEditingAccount(null)}
        />
      )}
    </div>
  );
};

export default NasAdmin;