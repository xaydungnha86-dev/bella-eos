/**
 * BELLA EOS PLATFORM CORE: Persistence Adapter Interface
 * Part of Task Governance Bounded Context v5.4
 */

export interface PersistenceAdapter {
  save(key: string, data: any): void;
  load(key: string): any;
  transaction(operations: () => void): void;
}

export class LocalStoragePersistenceAdapter implements PersistenceAdapter {
  private inTransaction = false;
  private transactionBuffer: Map<string, any> = new Map();

  public save(key: string, data: any): void {
    if (this.inTransaction) {
      this.transactionBuffer.set(key, data);
      return;
    }

    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error(`[LocalStoragePersistenceAdapter] Error saving key "${key}":`, err);
    }
  }

  public load(key: string): any {
    if (this.inTransaction && this.transactionBuffer.has(key)) {
      return this.transactionBuffer.get(key);
    }

    if (typeof window === 'undefined') return null;
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error(`[LocalStoragePersistenceAdapter] Error loading key "${key}":`, err);
      return null;
    }
  }

  public transaction(operations: () => void): void {
    this.inTransaction = true;
    this.transactionBuffer.clear();

    try {
      operations();
      
      // Commit operation buffer transactionally
      if (typeof window !== 'undefined') {
        this.transactionBuffer.forEach((data, key) => {
          localStorage.setItem(key, JSON.stringify(data));
        });
      }
    } catch (err) {
      console.error('[LocalStoragePersistenceAdapter] Transaction aborted due to error:', err);
      throw err;
    } finally {
      this.inTransaction = false;
      this.transactionBuffer.clear();
    }
  }
}
