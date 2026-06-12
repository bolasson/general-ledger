import type { Budget } from '@/domain';
import { logger } from '@/logger';

const KEY = 'gl_budgets';

function load(): Budget[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Budget[];
  } catch {
    return [];
  }
}

function save(budgets: Budget[]): void {
  localStorage.setItem(KEY, JSON.stringify(budgets));
}

export interface IBudgetDao {
  list(): Promise<Budget[]>;
  create(budget: Budget): Promise<Budget>;
  update(budget: Budget): Promise<Budget>;
  delete(id: string): Promise<void>;
}

export class LocalStorageBudgetDao implements IBudgetDao {
  async list(): Promise<Budget[]> {
    logger.debug({ module: 'BudgetDao', action: 'list' }, 'Loading budgets');
    return load();
  }

  async create(budget: Budget): Promise<Budget> {
    const budgets = load();
    budgets.push(budget);
    save(budgets);
    logger.info({ module: 'BudgetDao', action: 'create', meta: { id: budget.id } }, 'Budget created');
    return budget;
  }

  async update(budget: Budget): Promise<Budget> {
    const budgets = load().map((b) => (b.id === budget.id ? budget : b));
    save(budgets);
    logger.info({ module: 'BudgetDao', action: 'update', meta: { id: budget.id } }, 'Budget updated');
    return budget;
  }

  async delete(id: string): Promise<void> {
    save(load().filter((b) => b.id !== id));
    logger.info({ module: 'BudgetDao', action: 'delete', meta: { id } }, 'Budget deleted');
  }
}
