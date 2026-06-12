import type { ILogger } from '@/logger';
import { logger } from '@/logger';
import { LocalStorageAccountDao } from './AccountDao';
import { LocalStorageJournalEntryDao } from './JournalEntryDao';
import { LocalStorageBudgetDao } from './BudgetDao';
import type { IAccountDao } from './AccountDao';
import type { IJournalEntryDao } from './JournalEntryDao';
import type { IBudgetDao } from './BudgetDao';

export interface DaoFactory {
  readonly factoryName: string;
  readonly logger: ILogger;
  accounts(): IAccountDao;
  journalEntries(): IJournalEntryDao;
  budgets(): IBudgetDao;
}

export class LocalStorageDaoFactory implements DaoFactory {
  readonly factoryName = 'LocalStorageDaoFactory';
  readonly logger = logger;

  accounts(): IAccountDao {
    return new LocalStorageAccountDao();
  }

  journalEntries(): IJournalEntryDao {
    return new LocalStorageJournalEntryDao();
  }

  budgets(): IBudgetDao {
    return new LocalStorageBudgetDao();
  }
}

export const daoFactory: DaoFactory = new LocalStorageDaoFactory();
