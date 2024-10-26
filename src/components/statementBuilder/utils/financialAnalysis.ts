import { ProcessedData } from '../types';

interface FinancialRatios {
  profitability: {
    grossProfitMargin: number;
    operatingMargin: number;
    netProfitMargin: number;
    returnOnAssets: number;
    returnOnEquity: number;
  };
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    workingCapital: number;
  };
  efficiency: {
    assetTurnover: number;
    inventoryTurnover: number;
    receivablesTurnover: number;
    payablesTurnover: number;
  };
  leverage: {
    debtToEquity: number;
    debtToAssets: number;
    equityMultiplier: number;
  };
}

export const calculateFinancialRatios = (data: ProcessedData[]): FinancialRatios => {
  // Group accounts by type
  const accounts = groupAccountsByType(data);
  
  // Calculate totals
  const totalAssets = calculateTotal(accounts.assets);
  const totalLiabilities = calculateTotal(accounts.liabilities);
  const totalEquity = calculateTotal(accounts.equity);
  const totalRevenue = calculateTotal(accounts.revenue);
  const totalExpenses = calculateTotal(accounts.expenses);
  const netIncome = totalRevenue - totalExpenses;

  return {
    profitability: {
      grossProfitMargin: calculateRatio(totalRevenue - totalExpenses, totalRevenue),
      operatingMargin: calculateRatio(netIncome, totalRevenue),
      netProfitMargin: calculateRatio(netIncome, totalRevenue),
      returnOnAssets: calculateRatio(netIncome, totalAssets),
      returnOnEquity: calculateRatio(netIncome, totalEquity)
    },
    liquidity: {
      currentRatio: calculateRatio(accounts.currentAssets, accounts.currentLiabilities),
      quickRatio: calculateRatio(accounts.currentAssets - accounts.inventory, accounts.currentLiabilities),
      workingCapital: accounts.currentAssets - accounts.currentLiabilities
    },
    efficiency: {
      assetTurnover: calculateRatio(totalRevenue, totalAssets),
      inventoryTurnover: calculateRatio(totalRevenue, accounts.inventory),
      receivablesTurnover: calculateRatio(totalRevenue, accounts.receivables),
      payablesTurnover: calculateRatio(totalRevenue, accounts.payables)
    },
    leverage: {
      debtToEquity: calculateRatio(totalLiabilities, totalEquity),
      debtToAssets: calculateRatio(totalLiabilities, totalAssets),
      equityMultiplier: calculateRatio(totalAssets, totalEquity)
    }
  };
};

const groupAccountsByType = (data: ProcessedData[]) => {
  const accounts = {
    assets: [] as ProcessedData[],
    liabilities: [] as ProcessedData[],
    equity: [] as ProcessedData[],
    revenue: [] as ProcessedData[],
    expenses: [] as ProcessedData[],
    currentAssets: 0,
    currentLiabilities: 0,
    inventory: 0,
    receivables: 0,
    payables: 0
  };

  data.forEach(account => {
    const code = account.account_code.charAt(0);
    const balance = account.debit_balance - account.credit_balance;

    switch (code) {
      case '1':
      case '2':
      case '3':
      case '4':
        accounts.assets.push(account);
        if (code === '1' || code === '2') accounts.currentAssets += balance;
        if (code === '1') accounts.inventory += balance;
        if (code === '4') accounts.receivables += balance;
        break;
      case '6':
        accounts.liabilities.push(account);
        accounts.currentLiabilities += balance;
        accounts.payables += balance;
        break;
      case '5':
        accounts.equity.push(account);
        break;
      case '7':
        accounts.revenue.push(account);
        break;
      case '8':
        accounts.expenses.push(account);
        break;
    }
  });

  return accounts;
};

const calculateTotal = (accounts: ProcessedData[]): number => {
  return accounts.reduce((total, account) => {
    return total + (account.debit_balance - account.credit_balance);
  }, 0);
};

const calculateRatio = (numerator: number, denominator: number): number => {
  if (denominator === 0) return 0;
  return Number((numerator / denominator).toFixed(4));
};

export const analyzeFinancialHealth = (ratios: FinancialRatios) => {
  const analysis = {
    strengths: [] as string[],
    weaknesses: [] as string[],
    recommendations: [] as string[]
  };

  // Analyze profitability
  if (ratios.profitability.netProfitMargin > 0.15) {
    analysis.strengths.push('Strong net profit margin indicating good profitability');
  } else if (ratios.profitability.netProfitMargin < 0.05) {
    analysis.weaknesses.push('Low net profit margin indicating potential profitability issues');
    analysis.recommendations.push('Consider cost reduction strategies and pricing optimization');
  }

  // Analyze liquidity
  if (ratios.liquidity.currentRatio > 2) {
    analysis.strengths.push('Strong liquidity position with healthy current ratio');
  } else if (ratios.liquidity.currentRatio < 1) {
    analysis.weaknesses.push('Poor liquidity position with current ratio below 1');
    analysis.recommendations.push('Improve working capital management and consider short-term financing options');
  }

  // Analyze efficiency
  if (ratios.efficiency.assetTurnover > 1) {
    analysis.strengths.push('Efficient asset utilization');
  } else {
    analysis.weaknesses.push('Low asset turnover indicating potential inefficiencies');
    analysis.recommendations.push('Review asset management practices and identify underutilized assets');
  }

  // Analyze leverage
  if (ratios.leverage.debtToEquity > 2) {
    analysis.weaknesses.push('High leverage indicating increased financial risk');
    analysis.recommendations.push('Consider debt reduction strategies or equity financing options');
  } else if (ratios.leverage.debtToEquity < 0.5) {
    analysis.strengths.push('Conservative leverage position indicating financial stability');
  }

  return analysis;
};