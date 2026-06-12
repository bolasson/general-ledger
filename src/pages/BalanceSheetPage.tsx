import { useEffect } from 'react';
import {
  Alert, Box, Divider, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { useAccountStore } from '@/state/accountStore';
import { useJournalEntryStore } from '@/state/journalEntryStore';
import { buildBalanceSheet } from '@/domain';

export function BalanceSheetPage() {
  const { accounts, load: loadAccounts } = useAccountStore();
  const { entries, load: loadEntries } = useJournalEntryStore();

  useEffect(() => { void loadAccounts(); void loadEntries(); }, [loadAccounts, loadEntries]);

  const bs = buildBalanceSheet(accounts, entries);
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const hasData = bs.assets.length > 0 || bs.liabilities.length > 0 || bs.equity.length > 0;
  const isBalanced = Math.abs(bs.totalAssets - bs.totalLiabilitiesAndEquity) < 0.01;

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>Balance Sheet</Typography>

      {!hasData && <Alert severity="info">No balance sheet accounts with transactions yet.</Alert>}

      {hasData && (
        <>
          {!isBalanced && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Balance sheet does not balance! Assets ({fmt(bs.totalAssets)}) ≠ Liabilities + Equity ({fmt(bs.totalLiabilitiesAndEquity)}).
            </Alert>
          )}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Account</TableCell>
                  <TableCell align="right">Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow><TableCell colSpan={2} sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>Assets</TableCell></TableRow>
                {bs.assets.map(({ account, balance }) => (
                  <TableRow key={account.id} hover>
                    <TableCell sx={{ pl: 4 }}>{account.code} — {account.name}</TableCell>
                    <TableCell align="right">{fmt(balance)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, pl: 4 }}>Total Assets</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{fmt(bs.totalAssets)}</TableCell>
                </TableRow>

                <TableRow><TableCell colSpan={2}><Divider /></TableCell></TableRow>
                <TableRow><TableCell colSpan={2} sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>Liabilities</TableCell></TableRow>
                {bs.liabilities.map(({ account, balance }) => (
                  <TableRow key={account.id} hover>
                    <TableCell sx={{ pl: 4 }}>{account.code} — {account.name}</TableCell>
                    <TableCell align="right">{fmt(balance)}</TableCell>
                  </TableRow>
                ))}

                <TableRow><TableCell colSpan={2} sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>Equity</TableCell></TableRow>
                {bs.equity.map(({ account, balance }) => (
                  <TableRow key={account.id} hover>
                    <TableCell sx={{ pl: 4 }}>{account.code} — {account.name}</TableCell>
                    <TableCell align="right">{fmt(balance)}</TableCell>
                  </TableRow>
                ))}

                <TableRow><TableCell colSpan={2}><Divider /></TableCell></TableRow>
                <TableRow sx={{ bgcolor: isBalanced ? 'success.light' : 'error.light' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Total Liabilities + Equity</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(bs.totalLiabilitiesAndEquity)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
