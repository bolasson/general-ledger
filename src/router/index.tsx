import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/ui/AppLayout';
import { AccountsPage } from '@/pages/AccountsPage';
import { JournalEntriesPage } from '@/pages/JournalEntriesPage';
import { TrialBalancePage } from '@/pages/TrialBalancePage';
import { IncomeStatementPage } from '@/pages/IncomeStatementPage';
import { BalanceSheetPage } from '@/pages/BalanceSheetPage';
import { BudgetsPage } from '@/pages/BudgetsPage';

export function AppRouter() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/accounts" replace />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/entries" element={<JournalEntriesPage />} />
        <Route path="/trial-balance" element={<TrialBalancePage />} />
        <Route path="/income-statement" element={<IncomeStatementPage />} />
        <Route path="/balance-sheet" element={<BalanceSheetPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="*" element={<Navigate to="/accounts" replace />} />
      </Routes>
    </AppLayout>
  );
}
