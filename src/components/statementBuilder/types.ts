export interface ProcessedData {
  account_code: string;
  account_name: string;
  debit_balance: number;
  credit_balance: number;
}

export interface GeneratedStatements {
  balanceSheet: {
    assets: Record<string, number>;
    liabilities: Record<string, number>;
    equity: Record<string, number>;
  };
  incomeStatement: {
    revenue: Record<string, number>;
    expenses: Record<string, number>;
  };
  cashFlow: {
    operating: Record<string, number>;
    investing: Record<string, number>;
    financing: Record<string, number>;
  };
}