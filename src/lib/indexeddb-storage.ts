import { StateStorage } from "zustand/middleware";

const DB_NAME = "toeic-app-db";
const STORE_NAME = "app-state";
const DB_VERSION = 1;

/**
 * IndexedDB storage adapter for Zustand persist middleware
 * Provides more reliable data persistence compared to localStorage
 */
class IndexedDBStorage implements StateStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== "undefined" && typeof indexedDB !== "undefined") {
      this.dbPromise = this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  getItem(name: string): string | null | Promise<string | null> {
    if (!this.dbPromise) {
      return null;
    }

    return this.dbPromise
      .then((db) => {
        return new Promise<string | null>((resolve, reject) => {
          const transaction = db.transaction(STORE_NAME, "readonly");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(name);

          request.onsuccess = () => {
            resolve(request.result ?? null);
          };

          request.onerror = () => {
            reject(new Error("Failed to get item from IndexedDB"));
          };
        });
      })
      .catch((error) => {
        console.error("IndexedDB getItem error:", error);
        return null;
      });
  }

  setItem(name: string, value: string): void | Promise<void> {
    if (!this.dbPromise) {
      return;
    }

    return this.dbPromise
      .then((db) => {
        return new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(STORE_NAME, "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.put(value, name);

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = () => {
            reject(new Error("Failed to set item in IndexedDB"));
          };
        });
      })
      .catch((error) => {
        console.error("IndexedDB setItem error:", error);
      });
  }

  removeItem(name: string): void | Promise<void> {
    if (!this.dbPromise) {
      return;
    }

    return this.dbPromise
      .then((db) => {
        return new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(STORE_NAME, "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.delete(name);

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = () => {
            reject(new Error("Failed to remove item from IndexedDB"));
          };
        });
      })
      .catch((error) => {
        console.error("IndexedDB removeItem error:", error);
      });
  }
}

// Export a singleton instance
export const indexedDBStorage = new IndexedDBStorage();
