import { useEffect, useState } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAccountStore } from '@/state/accountStore';
import type { AccountType } from '@/domain';
import { logger } from '@/logger';

const ACCOUNT_TYPES: AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense'];

const TYPE_COLORS: Record<AccountType, 'success' | 'error' | 'info' | 'warning' | 'default'> = {
  asset: 'success',
  liability: 'error',
  equity: 'info',
  revenue: 'warning',
  expense: 'default',
};

const schema = z.object({
  code: z.string().min(1, 'Code required').max(20),
  name: z.string().min(1, 'Name required').max(100),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  description: z.string().max(200).optional().default(''),
});

type FormData = z.infer<typeof schema>;

export function AccountsPage() {
  const { accounts, loading, error, load, create, remove } = useAccountStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', name: '', type: 'asset', description: '' },
  });

  useEffect(() => { void load(); }, [load]);

  const onSubmit = async (data: FormData) => {
    logger.info({ module: 'AccountsPage', action: 'create' }, 'Creating account');
    await create({
      id: crypto.randomUUID(),
      code: data.code,
      name: data.name,
      type: data.type,
      description: data.description ?? '',
      createdAt: new Date().toISOString(),
    });
    reset();
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600} sx={{ flexGrow: 1 }}>Chart of Accounts</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Account
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={5} align="center">Loading…</TableCell></TableRow>
            )}
            {!loading && accounts.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>No accounts yet. Add one to get started.</TableCell></TableRow>
            )}
            {accounts.map((a) => (
              <TableRow key={a.id} hover>
                <TableCell>{a.code}</TableCell>
                <TableCell>{a.name}</TableCell>
                <TableCell><Chip label={a.type} size="small" color={TYPE_COLORS[a.type]} /></TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{a.description}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => void remove(a.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>New Account</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Controller name="code" control={control} render={({ field }) => (
              <TextField {...field} label="Account Code" error={!!errors.code} helperText={errors.code?.message} fullWidth />
            )} />
            <Controller name="name" control={control} render={({ field }) => (
              <TextField {...field} label="Account Name" error={!!errors.name} helperText={errors.name?.message} fullWidth />
            )} />
            <Controller name="type" control={control} render={({ field }) => (
              <TextField {...field} select label="Type" fullWidth>
                {ACCOUNT_TYPES.map((t) => <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>)}
              </TextField>
            )} />
            <Controller name="description" control={control} render={({ field }) => (
              <TextField {...field} label="Description (optional)" multiline rows={2} fullWidth />
            )} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
