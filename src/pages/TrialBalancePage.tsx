import { useEffect } from 'react';
import {
  Alert, Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableFooter, TableHead, TableRow, Typography,
} from '@mui/material';
import { useAccountStore } from '@/state/accountStore';
import { useJournalEntryStore } from '@/state/journalEntryStore';
import { buildTrialBalance } from '@/domain';

export function TrialBalancePage() {
  const { accounts, load: loadAccounts } = useAccountStore();
  const { entries, load: loadEntries } = useJournalEntryStore();

  useEffect(() => { void loadAccounts(); void loadEntries(); }, [loadAccounts, loadEntries]);

  const lines = buildTrialBalance(accounts, entries).filter(
    (l) => l.totalDebits !== 0 || l.totalCredits !== 0
  );

  const totalDebits = lines.reduce((s, l) => s + l.totalDebits, 0);
  const totalCredits = lines.reduce((s, l) => s + l.totalCredits, 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.001;

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>Trial Balance</Typography>

      {lines.length === 0 && (
        <Alert severity="info">No transactions yet. Post some journal entries first.</Alert>
      )}

      {lines.length > 0 && (
        <>
          {!isBalanced && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Ledger is out of balance! Total debits ({fmt(totalDebits)}) ≠ total credits ({fmt(totalCredits)}).
            </Alert>
          )}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Account Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Debits</TableCell>
                  <TableCell align="right">Credits</TableCell>
                  <TableCell align="right">Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map(({ account, totalDebits: td, totalCredits: tc, balance }) => (
                  <TableRow key={account.id} hover>
                    <TableCell>{account.code}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize', color: 'text.secondary', fontSize: 13 }}>{account.type}</TableCell>
                    <TableCell align="right">{fmt(td)}</TableCell>
                    <TableCell align="right">{fmt(tc)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{fmt(balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>Totals</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(totalDebits)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(totalCredits)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
