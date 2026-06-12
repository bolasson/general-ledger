import { create } from 'zustand';
import { daoFactory } from '@/data/Factory';
import type { Budget } from '@/domain';
import { logger } from '@/logger';

interface BudgetState {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  create: (budget: Budget) => Promise<void>;
  update: (budget: Budget) => Promise<Budget>;
  remove: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const budgets = await daoFactory.budgets().list();
      set({ budgets, loading: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load budgets';
      logger.error({ module: 'budgetStore', action: 'load' }, msg);
      set({ error: msg, loading: false });
    }
  },

  create: async (budget) => {
    await daoFactory.budgets().create(budget);
    set({ budgets: [...get().budgets, budget] });
  },

  update: async (budget) => {
    await daoFactory.budgets().update(budget);
    set({ budgets: get().budgets.map((b) => (b.id === budget.id ? budget : b)) });
    return budget;
  },

  remove: async (id) => {
    await daoFactory.budgets().delete(id);
    set({ budgets: get().budgets.filter((b) => b.id !== id) });
  },
}));
