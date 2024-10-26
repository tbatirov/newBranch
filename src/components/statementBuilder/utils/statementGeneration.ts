import * as XLSX from 'xlsx';
import { ProcessedData, GeneratedStatements } from '../types';
import { logger } from '../../../utils/logger';
import { LogLevel } from '../../../types/logging';

export const generateFinancialStatements = (data: ProcessedData[]): GeneratedStatements => {
  try {
    logger.log(LogLevel.INFO, 'Starting financial statement generation');

    const statements: GeneratedStatements = {
      balanceSheet: {
        assets: {},
        liabilities: {},
        equity: {}
      },
      incomeStatement: {
        revenue: {},
        expenses: {}
      },
      cashFlow: {
        operating: {},
        investing: {},
        financing: {}
      }
    };

    // Process each account based on account code
    data.forEach(account => {
      const code = account.account_code;
      const firstDigit = code.charAt(0);
      const balance = account.debit_balance - account.credit_balance;

      // Skip accounts with zero balance
      if (balance === 0) return;

      // Skip if account name indicates a total
      const name = account.account_name.toLowerCase();
      if (name.includes('total') || 
          name.includes('итого') || 
          name.includes('jami') ||
          name.startsWith('sum of') ||
          name.startsWith('сумма') ||
          name.startsWith('yigindi')) {
        return;
      }

      // Classify based on first digit of account code
      switch (firstDigit) {
        case '1':
        case '2':
        case '3':
        case '4':
          statements.balanceSheet.assets[account.account_name] = Math.abs(balance);
          if (['1', '2'].includes(firstDigit)) {
            statements.cashFlow.operating[account.account_name] = balance;
          }
          break;

        case '5':
          statements.balanceSheet.equity[account.account_name] = Math.abs(balance);
          statements.cashFlow.financing[account.account_name] = balance;
          break;

        case '6':
          statements.balanceSheet.liabilities[account.account_name] = Math.abs(balance);
          statements.cashFlow.financing[account.account_name] = balance;
          break;

        case '7':
          statements.incomeStatement.revenue[account.account_name] = Math.abs(balance);
          statements.cashFlow.operating[account.account_name] = balance;
          break;

        case '8':
          statements.incomeStatement.expenses[account.account_name] = Math.abs(balance);
          statements.cashFlow.operating[account.account_name] = -balance;
          break;

        default:
          logger.log(LogLevel.WARNING, `Unknown account type for code: ${code}`);
      }
    });

    // Calculate net income
    const netIncome = 
      Object.values(statements.incomeStatement.revenue).reduce((sum, val) => sum + val, 0) -
      Object.values(statements.incomeStatement.expenses).reduce((sum, val) => sum + val, 0);
    
    if (netIncome !== 0) {
      statements.balanceSheet.equity['Net Income'] = netIncome;
      statements.cashFlow.operating['Net Income'] = netIncome;
    }

    logger.log(LogLevel.INFO, 'Financial statements generated successfully');
    return statements;

  } catch (error) {
    logger.log(LogLevel.ERROR, 'Error generating financial statements', { error });
    throw new Error('Failed to generate financial statements');
  }
};

export const downloadStatementAsExcel = (
  statements: GeneratedStatements,
  type: 'balanceSheet' | 'incomeStatement'
) => {
  try {
    logger.log(LogLevel.INFO, `Generating Excel file for ${type}`);

    const workbook = XLSX.utils.book_new();
    const data: any[] = [];

    if (type === 'balanceSheet') {
      // Assets section
      data.push(['Assets']);
      Object.entries(statements.balanceSheet.assets).forEach(([name, value]) => {
        data.push([name, value]);
      });
      data.push([]);

      // Liabilities section
      data.push(['Liabilities']);
      Object.entries(statements.balanceSheet.liabilities).forEach(([name, value]) => {
        data.push([name, value]);
      });
      data.push([]);

      // Equity section
      data.push(['Equity']);
      Object.entries(statements.balanceSheet.equity).forEach(([name, value]) => {
        data.push([name, value]);
      });

    } else {
      // Revenue section
      data.push(['Revenue']);
      Object.entries(statements.incomeStatement.revenue).forEach(([name, value]) => {
        data.push([name, value]);
      });
      data.push([]);

      // Expenses section
      data.push(['Expenses']);
      Object.entries(statements.incomeStatement.expenses).forEach(([name, value]) => {
        data.push([name, value]);
      });

      // Net Income
      const totalRevenue = Object.values(statements.incomeStatement.revenue).reduce((sum, val) => sum + val, 0);
      const totalExpenses = Object.values(statements.incomeStatement.expenses).reduce((sum, val) => sum + val, 0);
      data.push([]);
      data.push(['Net Income', totalRevenue - totalExpenses]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, type === 'balanceSheet' ? 'Balance Sheet' : 'Income Statement');

    // Format numbers
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        const cell = worksheet[cell_ref];
        if (!cell) continue;

        if (typeof cell.v === 'number') {
          cell.z = '#,##0.00';
        }
      }
    }

    XLSX.writeFile(workbook, `${type === 'balanceSheet' ? 'Balance_Sheet' : 'Income_Statement'}.xlsx`);
    logger.log(LogLevel.INFO, `Excel file generated successfully for ${type}`);
  } catch (error) {
    logger.log(LogLevel.ERROR, `Error generating Excel file for ${type}`, { error });
    throw new Error(`Failed to generate Excel file for ${type}`);
  }
};