import type { JournalEntry } from '@/domain';
import { logger } from '@/logger';

const KEY = 'gl_entries';

function load(): JournalEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as JournalEntry[];
  } catch {
    return [];
  }
}

function save(entries: JournalEntry[]): void {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export interface IJournalEntryDao {
  list(): Promise<JournalEntry[]>;
  create(entry: JournalEntry): Promise<JournalEntry>;
  delete(id: string): Promise<void>;
}

export class LocalStorageJournalEntryDao implements IJournalEntryDao {
  async list(): Promise<JournalEntry[]> {
    logger.debug({ module: 'JournalEntryDao', action: 'list' }, 'Loading entries');
    return load();
  }

  async create(entry: JournalEntry): Promise<JournalEntry> {
    const entries = load();
    entries.push(entry);
    save(entries);
    logger.info({ module: 'JournalEntryDao', action: 'create', meta: { id: entry.id } }, 'Entry created');
    return entry;
  }

  async delete(id: string): Promise<void> {
    save(load().filter((e) => e.id !== id));
    logger.info({ module: 'JournalEntryDao', action: 'delete', meta: { id } }, 'Entry deleted');
  }
}
