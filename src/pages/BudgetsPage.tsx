import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Paper, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useBudgetStore } from '@/state/budgetStore';
import { useAccountStore } from '@/state/accountStore';
import { useJournalEntryStore } from '@/state/journalEntryStore';
import { buildBudgetVariance } from '@/domain';
import { logger } from '@/logger';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function BudgetsPage() {
  const { budgets, load: loadBudgets, create, remove } = useBudgetStore();
  const { accounts, load: loadAccounts } = useAccountStore();
  const { entries, load: loadEntries } = useJournalEntryStore();
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [budgetYear, setBudgetYear] = useState(new Date().getFullYear());
  const [budgetMonth, setBudgetMonth] = useState(new Date().getMonth() + 1);
  const [budgetLines, setBudgetLines] = useState<{ accountId: string; amount: string }[]>([{ accountId: '', amount: '' }]);

  useEffect(() => { void loadBudgets(); void loadAccounts(); void loadEntries(); }, [loadBudgets, loadAccounts, loadEntries]);

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

  const handleCreate = async () => {
    if (!budgetName.trim()) return;
    logger.info({ module: 'BudgetsPage', action: 'create' }, 'Creating budget');
    await create({
      id: crypto.randomUUID(),
      name: budgetName.trim(),
      year: budgetYear,
      month: budgetMonth,
      lines: budgetLines
        .filter((l) => l.accountId && l.amount)
        .map((l) => ({ accountId: l.accountId, amount: parseFloat(l.amount) || 0 })),
      createdAt: new Date().toISOString(),
    });
    setBudgetName('');
    setBudgetLines([{ accountId: '', amount: '' }]);
    setDialogOpen(false);
  };

  const selectedBudget = budgets[tab] ?? null;
  const varianceLines = selectedBudget ? buildBudgetVariance(selectedBudget, accounts, entries) : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={600} sx={{ flexGrow: 1 }}>Budgets</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>New Budget</Button>
      </Box>

      {budgets.length === 0 && <Alert severity="info">No budgets yet. Create one to track variance.</Alert>}

      {budgets.length > 0 && (
        <>
          <Tabs value={tab} onChange={(_, v) => setTab(v as number)} sx={{ mb: 2 }}>
            {budgets.map((b, i) => (
              <Tab key={b.id} label={`${b.name} (${MONTHS[b.month - 1]} ${b.year})`} value={i} />
            ))}
          </Tabs>

          {selectedBudget && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <IconButton color="error" size="small" onClick={() => {
                  void remove(selectedBudget.id);
                  setTab(0);
                }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Account</TableCell>
                      <TableCell align="right">Budgeted</TableCell>
                      <TableCell align="right">Actual</TableCell>
                      <TableCell align="right">Variance</TableCell>
                      <TableCell align="right">% Var</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {varianceLines.map(({ account, budgeted, actual, variance, variancePct }) => (
                      <TableRow key={account.id} hover>
                        <TableCell>{account.code} — {account.name}</TableCell>
                        <TableCell align="right">{fmt(budgeted)}</TableCell>
                        <TableCell align="right">{fmt(actual)}</TableCell>
                        <TableCell align="right" sx={{ color: variance >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                          {fmt(variance)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={fmtPct(variancePct)}
                            size="small"
                            color={variance >= 0 ? 'success' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {varianceLines.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>No budget lines.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Budget</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Budget Name" value={budgetName} onChange={(e) => setBudgetName(e.target.value)} fullWidth />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Year" type="number" value={budgetYear}
              onChange={(e) => setBudgetYear(parseInt(e.target.value) || budgetYear)}
              sx={{ flex: 1 }}
            />
            <TextField select label="Month" value={budgetMonth} onChange={(e) => setBudgetMonth(parseInt(e.target.value))} sx={{ flex: 1 }}>
              {MONTHS.map((m, i) => <MenuItem key={i} value={i + 1}>{m}</MenuItem>)}
            </TextField>
          </Box>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>Budget Lines</Typography>
          {budgetLines.map((line, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                select label="Account" value={line.accountId} size="small"
                onChange={(e) => setBudgetLines((prev) => prev.map((l, idx) => idx === i ? { ...l, accountId: e.target.value } : l))}
                sx={{ flexGrow: 1 }}
              >
                {accounts.map((a) => <MenuItem key={a.id} value={a.id}>{a.code} — {a.name}</MenuItem>)}
              </TextField>
              <TextField
                label="Amount" type="number" value={line.amount} size="small"
                onChange={(e) => setBudgetLines((prev) => prev.map((l, idx) => idx === i ? { ...l, amount: e.target.value } : l))}
                sx={{ width: 120 }}
              />
            </Box>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => setBudgetLines((p) => [...p, { accountId: '', amount: '' }])}>
            Add Line
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleCreate()}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
