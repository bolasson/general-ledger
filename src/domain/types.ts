export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  description: string;
  createdAt: string;
}

export interface EntryLine {
  accountId: string;
  debit: number;
  credit: number;
  memo: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  lines: EntryLine[];
  createdAt: string;
}

export interface BudgetLine {
  accountId: string;
  amount: number;
}

export interface Budget {
  id: string;
  name: string;
  year: number;
  month: number;
  lines: BudgetLine[];
  createdAt: string;
}

export interface TrialBalanceLine {
  account: Account;
  totalDebits: number;
  totalCredits: number;
  balance: number;
}

export interface IncomeStatementLine {
  account: Account;
  amount: number;
}

export interface IncomeStatement {
  revenues: IncomeStatementLine[];
  expenses: IncomeStatementLine[];
  netIncome: number;
}

export interface BalanceSheetLine {
  account: Account;
  balance: number;
}

export interface BalanceSheet {
  assets: BalanceSheetLine[];
  liabilities: BalanceSheetLine[];
  equity: BalanceSheetLine[];
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
}

export interface BudgetVarianceLine {
  account: Account;
  budgeted: number;
  actual: number;
  variance: number;
  variancePct: number;
}
