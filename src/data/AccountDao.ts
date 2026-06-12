import type { Account } from '@/domain';
import { logger } from '@/logger';

const KEY = 'gl_accounts';

function load(): Account[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Account[];
  } catch {
    return [];
  }
}

function save(accounts: Account[]): void {
  localStorage.setItem(KEY, JSON.stringify(accounts));
}

export interface IAccountDao {
  list(): Promise<Account[]>;
  create(account: Account): Promise<Account>;
  update(account: Account): Promise<Account>;
  delete(id: string): Promise<void>;
}

export class LocalStorageAccountDao implements IAccountDao {
  async list(): Promise<Account[]> {
    logger.debug({ module: 'AccountDao', action: 'list' }, 'Loading accounts');
    return load();
  }

  async create(account: Account): Promise<Account> {
    const accounts = load();
    accounts.push(account);
    save(accounts);
    logger.info({ module: 'AccountDao', action: 'create', meta: { id: account.id } }, 'Account created');
    return account;
  }

  async update(account: Account): Promise<Account> {
    const accounts = load().map((a) => (a.id === account.id ? account : a));
    save(accounts);
    logger.info({ module: 'AccountDao', action: 'update', meta: { id: account.id } }, 'Account updated');
    return account;
  }

  async delete(id: string): Promise<void> {
    save(load().filter((a) => a.id !== id));
    logger.info({ module: 'AccountDao', action: 'delete', meta: { id } }, 'Account deleted');
  }
}
