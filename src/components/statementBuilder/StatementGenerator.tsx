import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Loader } from 'lucide-react';
import { ProcessedData } from './types';
import { generateFinancialStatements } from './utils/statementGeneration';

interface StatementGeneratorProps {
  data: ProcessedData[];
  onStatementsGenerated: (statements: any) => void;
}

const StatementGenerator: React.FC<StatementGeneratorProps> = ({ data, onStatementsGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    generateStatements();
  }, [data]);

  const generateStatements = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Group transactions by account classes
      setProgress(25);
      const statements = await generateFinancialStatements(data);
      setProgress(100);
      onStatementsGenerated(statements);
    } catch (error) {
      console.error('Error generating statements:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('statementBuilder.generator.title')}</h2>
      
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
            <span>{t('statementBuilder.generator.generating')}</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={generateStatements}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('statementBuilder.generator.regenerate')}
            <ArrowRight className="ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default StatementGenerator;