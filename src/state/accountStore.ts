import { create } from 'zustand';
import { daoFactory } from '@/data/Factory';
import type { Account } from '@/domain';
import { logger } from '@/logger';

interface AccountState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  create: (account: Account) => Promise<void>;
  update: (account: Account) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const accounts = await daoFactory.accounts().list();
      set({ accounts, loading: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load accounts';
      logger.error({ module: 'accountStore', action: 'load' }, msg);
      set({ error: msg, loading: false });
    }
  },

  create: async (account) => {
    await daoFactory.accounts().create(account);
    set({ accounts: [...get().accounts, account] });
  },

  update: async (account) => {
    await daoFactory.accounts().update(account);
    set({ accounts: get().accounts.map((a) => (a.id === account.id ? account : a)) });
  },

  remove: async (id) => {
    await daoFactory.accounts().delete(id);
    set({ accounts: get().accounts.filter((a) => a.id !== id) });
  },
}));
