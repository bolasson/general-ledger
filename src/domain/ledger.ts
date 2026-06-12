/**
 * Pure domain functions — no React, no storage, no side-effects.
 * All calculations happen here so they can be tested independently.
 */
import type {
  Account,
  AccountType,
  JournalEntry,
  Budget,
  TrialBalanceLine,
  IncomeStatement,
  BalanceSheet,
  BudgetVarianceLine,
} from './types';

/** Normal balance side for each account type (debit = positive balance increases). */
export function isDebitNormal(type: AccountType): boolean {
  return type === 'asset' || type === 'expense';
}

/** Net balance for an account given all journal entries. */
export function accountBalance(account: Account, entries: JournalEntry[]): number {
  let debits = 0;
  let credits = 0;
  for (const entry of entries) {
    for (const line of entry.lines) {
      if (line.accountId === account.id) {
        debits += line.debit;
        credits += line.credit;
      }
    }
  }
  return isDebitNormal(account.type) ? debits - credits : credits - debits;
}

/** Validate that a journal entry balances (debits === credits). */
export function entryIsBalanced(lines: { debit: number; credit: number }[]): boolean {
  const totalDebits = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredits = lines.reduce((s, l) => s + l.credit, 0);
  return Math.abs(totalDebits - totalCredits) < 0.001;
}

/** Build a trial balance from accounts and entries. */
export function buildTrialBalance(accounts: Account[], entries: JournalEntry[]): TrialBalanceLine[] {
  return accounts.map((account) => {
    let totalDebits = 0;
    let totalCredits = 0;
    for (const entry of entries) {
      for (const line of entry.lines) {
        if (line.accountId === account.id) {
          totalDebits += line.debit;
          totalCredits += line.credit;
        }
      }
    }
    const balance = isDebitNormal(account.type)
      ? totalDebits - totalCredits
      : totalCredits - totalDebits;
    return { account, totalDebits, totalCredits, balance };
  });
}

/** Build an income statement from accounts and entries. */
export function buildIncomeStatement(accounts: Account[], entries: JournalEntry[]): IncomeStatement {
  const revenues = accounts
    .filter((a) => a.type === 'revenue')
    .map((account) => ({ account, amount: accountBalance(account, entries) }));

  const expenses = accounts
    .filter((a) => a.type === 'expense')
    .map((account) => ({ account, amount: accountBalance(account, entries) }));

  const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  return { revenues, expenses, netIncome };
}

/** Build a balance sheet from accounts and entries. */
export function buildBalanceSheet(accounts: Account[], entries: JournalEntry[]): BalanceSheet {
  const assets = accounts
    .filter((a) => a.type === 'asset')
    .map((account) => ({ account, balance: accountBalance(account, entries) }));

  const liabilities = accounts
    .filter((a) => a.type === 'liability')
    .map((account) => ({ account, balance: accountBalance(account, entries) }));

  const equity = accounts
    .filter((a) => a.type === 'equity')
    .map((account) => ({ account, balance: accountBalance(account, entries) }));

  // Net income rolls into equity for balance sheet
  const incomeStatement = buildIncomeStatement(accounts, entries);

  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0);
  const totalEquity = equity.reduce((s, e) => s + e.balance, 0) + incomeStatement.netIncome;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return { assets, liabilities, equity, totalAssets, totalLiabilitiesAndEquity };
}

/** Build budget variance lines for a given month/year budget against actual entries. */
export function buildBudgetVariance(
  budget: Budget,
  accounts: Account[],
  entries: JournalEntry[]
): BudgetVarianceLine[] {
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  // Filter entries to the budget month/year
  const filtered = entries.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === budget.year && d.getMonth() + 1 === budget.month;
  });

  return budget.lines.map((bl) => {
    const account = accountMap.get(bl.accountId);
    if (!account) {
      return {
        account: { id: bl.accountId, code: '?', name: 'Unknown', type: 'expense' as const, description: '', createdAt: '' },
        budgeted: bl.amount,
        actual: 0,
        variance: -bl.amount,
        variancePct: -100,
      };
    }
    const actual = accountBalance(account, filtered);
    const variance = actual - bl.amount;
    const variancePct = bl.amount !== 0 ? (variance / bl.amount) * 100 : 0;
    return { account, budgeted: bl.amount, actual, variance, variancePct };
  });
}

/** Generate the next journal entry reference number. */
export function nextReference(existing: JournalEntry[]): string {
  const nums = existing.map((e) => {
    const m = e.reference.match(/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  });
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `JE-${String(max + 1).padStart(4, '0')}`;
}
