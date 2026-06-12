import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, Collapse, IconButton, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useJournalEntryStore } from '@/state/journalEntryStore';
import { useAccountStore } from '@/state/accountStore';
import { NewEntryDialog } from '@/components/features/NewEntryDialog';
import { logger } from '@/logger';

export function JournalEntriesPage() {
  const { entries, loading, error, load, remove } = useJournalEntryStore();
  const { accounts, load: loadAccounts } = useAccountStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { void load(); void loadAccounts(); }, [load, loadAccounts]);

  const accountName = (id: string) => {
    const a = accounts.find((ac) => ac.id === id);
    return a ? `${a.code} — ${a.name}` : id;
  };

  const fmt = (n: number) => n === 0 ? '—' : n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600} sx={{ flexGrow: 1 }}>Journal Entries</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          New Entry
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Reference</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Lines</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={6} align="center">Loading…</TableCell></TableRow>}
            {!loading && entries.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ color: 'text.secondary' }}>No entries yet.</TableCell></TableRow>
            )}
            {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map((entry) => (
              <>
                <TableRow key={entry.id} hover>
                  <TableCell padding="checkbox">
                    <IconButton size="small" onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}>
                      {expanded === entry.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell><Chip label={entry.reference} size="small" /></TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell align="right">{entry.lines.length}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => {
                      logger.info({ module: 'JournalEntriesPage', action: 'delete', meta: { id: entry.id } }, 'Deleting entry');
                      void remove(entry.id);
                    }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow key={`${entry.id}-detail`}>
                  <TableCell colSpan={6} sx={{ py: 0 }}>
                    <Collapse in={expanded === entry.id}>
                      <Box sx={{ py: 1, px: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Account</TableCell>
                              <TableCell>Memo</TableCell>
                              <TableCell align="right">Debit</TableCell>
                              <TableCell align="right">Credit</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {entry.lines.map((line, i) => (
                              <TableRow key={i}>
                                <TableCell>{accountName(line.accountId)}</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{line.memo}</TableCell>
                                <TableCell align="right">{fmt(line.debit)}</TableCell>
                                <TableCell align="right">{fmt(line.credit)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <NewEntryDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
