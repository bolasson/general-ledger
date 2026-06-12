import { useState } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useJournalEntryStore } from '@/state/journalEntryStore';
import { useAccountStore } from '@/state/accountStore';
import { entryIsBalanced, nextReference } from '@/domain';
import { logger } from '@/logger';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface LineForm {
  accountId: string;
  debit: string;
  credit: string;
  memo: string;
}

const emptyLine = (): LineForm => ({ accountId: '', debit: '', credit: '', memo: '' });

export function NewEntryDialog({ open, onClose }: Props) {
  const { entries, create } = useJournalEntryStore();
  const { accounts } = useAccountStore();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<LineForm[]>([emptyLine(), emptyLine()]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateLine = (i: number, field: keyof LineForm, value: string) => {
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));

  const handleClose = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setDescription('');
    setLines([emptyLine(), emptyLine()]);
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!description.trim()) { setSubmitError('Description is required.'); return; }

    const parsedLines = lines.map((l) => ({
      accountId: l.accountId,
      debit: parseFloat(l.debit) || 0,
      credit: parseFloat(l.credit) || 0,
      memo: l.memo,
    }));

    if (parsedLines.some((l) => !l.accountId)) {
      setSubmitError('All lines must have an account selected.'); return;
    }

    if (!entryIsBalanced(parsedLines)) {
      const totalDebits = parsedLines.reduce((s, l) => s + l.debit, 0);
      const totalCredits = parsedLines.reduce((s, l) => s + l.credit, 0);
      setSubmitError(`Entry is out of balance. Debits: ${totalDebits.toFixed(2)}, Credits: ${totalCredits.toFixed(2)}`);
      return;
    }

    logger.info({ module: 'NewEntryDialog', action: 'submit' }, 'Creating journal entry');
    await create({
      id: crypto.randomUUID(),
      date,
      reference: nextReference(entries),
      description: description.trim(),
      lines: parsedLines,
      createdAt: new Date().toISOString(),
    });
    handleClose();
  };

  const totalDebits = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredits = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const balanced = Math.abs(totalDebits - totalCredits) < 0.001 && totalDebits > 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>New Journal Entry</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, pt: 1 }}>
          <TextField
            label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }} sx={{ width: 180 }}
          />
          <TextField
            label="Description" value={description} onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
        </Box>

        {lines.map((line, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
            <TextField
              select label="Account" value={line.accountId}
              onChange={(e) => updateLine(i, 'accountId', e.target.value)}
              sx={{ minWidth: 220 }} size="small"
            >
              {accounts.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.code} — {a.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Memo" value={line.memo} size="small"
              onChange={(e) => updateLine(i, 'memo', e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              label="Debit" value={line.debit} size="small" type="number"
              onChange={(e) => updateLine(i, 'debit', e.target.value)}
              sx={{ width: 110 }}
            />
            <TextField
              label="Credit" value={line.credit} size="small" type="number"
              onChange={(e) => updateLine(i, 'credit', e.target.value)}
              sx={{ width: 110 }}
            />
            <IconButton size="small" onClick={() => removeLine(i)} disabled={lines.length <= 2}>
              <RemoveIcon />
            </IconButton>
          </Box>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Button startIcon={<AddIcon />} onClick={addLine} size="small">Add Line</Button>
          <Typography variant="body2" color={balanced ? 'success.main' : 'error.main'}>
            Debits: {totalDebits.toFixed(2)} | Credits: {totalCredits.toFixed(2)}
            {balanced ? ' ✓ Balanced' : ' ✗ Out of balance'}
          </Typography>
        </Box>

        {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={() => void handleSubmit()} variant="contained">Post Entry</Button>
      </DialogActions>
    </Dialog>
  );
}
