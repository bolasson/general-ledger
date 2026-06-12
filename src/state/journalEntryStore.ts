import { create } from 'zustand';
import { daoFactory } from '@/data/Factory';
import type { JournalEntry } from '@/domain';
import { logger } from '@/logger';

interface JournalEntryState {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  create: (entry: JournalEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useJournalEntryStore = create<JournalEntryState>((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const entries = await daoFactory.journalEntries().list();
      set({ entries, loading: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load entries';
      logger.error({ module: 'journalEntryStore', action: 'load' }, msg);
      set({ error: msg, loading: false });
    }
  },

  create: async (entry) => {
    await daoFactory.journalEntries().create(entry);
    set({ entries: [...get().entries, entry] });
  },

  remove: async (id) => {
    await daoFactory.journalEntries().delete(id);
    set({ entries: get().entries.filter((e) => e.id !== id) });
  },
}));
