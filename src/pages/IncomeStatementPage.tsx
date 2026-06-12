import { useEffect } from 'react';
import {
  Alert, Box, Divider, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { useAccountStore } from '@/state/accountStore';
import { useJournalEntryStore } from '@/state/journalEntryStore';
import { buildIncomeStatement } from '@/domain';

export function IncomeStatementPage() {
  const { accounts, load: loadAccounts } = useAccountStore();
  const { entries, load: loadEntries } = useJournalEntryStore();

  useEffect(() => { void loadAccounts(); void loadEntries(); }, [loadAccounts, loadEntries]);

  const stmt = buildIncomeStatement(accounts, entries);
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const hasData = stmt.revenues.length > 0 || stmt.expenses.length > 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>Income Statement</Typography>

      {!hasData && <Alert severity="info">No revenue or expense accounts with transactions yet.</Alert>}

      {hasData && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Account</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow><TableCell colSpan={2} sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>Revenue</TableCell></TableRow>
              {stmt.revenues.map(({ account, amount }) => (
                <TableRow key={account.id} hover>
                  <TableCell sx={{ pl: 4 }}>{account.code} — {account.name}</TableCell>
                  <TableCell align="right">{fmt(amount)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, pl: 4 }}>Total Revenue</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {fmt(stmt.revenues.reduce((s, r) => s + r.amount, 0))}
                </TableCell>
              </TableRow>

              <TableRow><TableCell colSpan={2}><Divider /></TableCell></TableRow>
              <TableRow><TableCell colSpan={2} sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>Expenses</TableCell></TableRow>
              {stmt.expenses.map(({ account, amount }) => (
                <TableRow key={account.id} hover>
                  <TableCell sx={{ pl: 4 }}>{account.code} — {account.name}</TableCell>
                  <TableCell align="right">{fmt(amount)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ fontWeight: 600, pl: 4 }}>Total Expenses</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {fmt(stmt.expenses.reduce((s, e) => s + e.amount, 0))}
                </TableCell>
              </TableRow>

              <TableRow><TableCell colSpan={2}><Divider /></TableCell></TableRow>
              <TableRow sx={{ bgcolor: stmt.netIncome >= 0 ? 'success.light' : 'error.light' }}>
                <TableCell sx={{ fontWeight: 700 }}>Net Income</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(stmt.netIncome)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
