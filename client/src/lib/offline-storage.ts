export interface OfflineData {
  id: string;
  type: 'project' | 'analysis' | 'milestone' | 'activity';
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineStorage {
  private dbName = 'CodeMentorDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('synced', 'synced', { unique: false });
        }

        if (!db.objectStoreNames.contains('analysis')) {
          const analysisStore = db.createObjectStore('analysis', { keyPath: 'id' });
          analysisStore.createIndex('synced', 'synced', { unique: false });
        }

        if (!db.objectStoreNames.contains('activities')) {
          const activityStore = db.createObjectStore('activities', { keyPath: 'id' });
          activityStore.createIndex('synced', 'synced', { unique: false });
        }

        if (!db.objectStoreNames.contains('user_data')) {
          db.createObjectStore('user_data', { keyPath: 'key' });
        }
      };
    });
  }

  async store(type: string, data: any): Promise<string> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([type], 'readwrite');
      const store = transaction.objectStore(type);
      
      const item: OfflineData = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: type as any,
        data,
        timestamp: Date.now(),
        synced: false,
      };

      const request = store.add(item);
      request.onsuccess = () => resolve(item.id);
      request.onerror = () => reject(request.error);
    });
  }

  async get(type: string, id?: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([type], 'readonly');
      const store = transaction.objectStore(type);
      
      if (id) {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result?.data);
        request.onerror = () => reject(request.error);
      } else {
        const request = store.getAll();
        request.onsuccess = () => {
          const results = request.result.map((item: OfflineData) => item.data);
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      }
    });
  }

  async markAsSynced(type: string, id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([type], 'readwrite');
      const store = transaction.objectStore(type);
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.synced = true;
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getPendingSync(): Promise<OfflineData[]> {
    if (!this.db) await this.init();

    const stores = ['projects', 'analysis', 'activities'];
    const pendingItems: OfflineData[] = [];

    for (const storeName of stores) {
      const items = await new Promise<OfflineData[]>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index('synced');
        
        const request = index.getAll(false); // Get unsynced items
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      pendingItems.push(...items);
    }

    return pendingItems.sort((a, b) => a.timestamp - b.timestamp);
  }

  async getPendingSyncCount(): Promise<number> {
    const pending = await this.getPendingSync();
    return pending.length;
  }

  async syncPendingData(): Promise<void> {
    if (!navigator.onLine) return;

    const pendingItems = await this.getPendingSync();
    
    for (const item of pendingItems) {
      try {
        // Attempt to sync with server
        const endpoint = this.getEndpointForType(item.type);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });

        if (response.ok) {
          await this.markAsSynced(item.type, item.id);
        }
      } catch (error) {
        console.warn(`Failed to sync ${item.type} ${item.id}:`, error);
      }
    }
  }

  private getEndpointForType(type: string): string {
    const endpoints = {
      project: '/api/projects',
      analysis: '/api/code-analysis',
      milestone: '/api/milestones',
      activity: '/api/activity',
    };
    return endpoints[type as keyof typeof endpoints] || '/api/data';
  }

  async storeUserData(key: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['user_data'], 'readwrite');
      const store = transaction.objectStore('user_data');
      
      const request = store.put({ key, data, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUserData(key: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['user_data'], 'readonly');
      const store = transaction.objectStore('user_data');
      
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.data);
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedData(): Promise<void> {
    if (!this.db) await this.init();

    const stores = ['projects', 'analysis', 'activities'];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const index = store.index('synced');
        
        const request = index.openCursor(IDBKeyRange.only(true));
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    }
  }
}

export const offlineStorage = new OfflineStorage();

// Initialize on app start
if (typeof window !== 'undefined') {
  offlineStorage.init().catch(console.error);
}
