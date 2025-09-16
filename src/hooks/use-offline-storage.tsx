import { useState, useEffect } from "react";
import { offlineStorage } from "@/lib/offline-storage";

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      offlineStorage.syncPendingData();
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending sync count
    const checkPendingSync = async () => {
      const count = await offlineStorage.getPendingSyncCount();
      setPendingSyncCount(count);
    };

    checkPendingSync();
    const interval = setInterval(checkPendingSync, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    pendingSyncCount,
    storeOffline: offlineStorage.store.bind(offlineStorage),
    getOfflineData: offlineStorage.get.bind(offlineStorage),
    syncData: offlineStorage.syncPendingData.bind(offlineStorage),
  };
}
