import { useState, useEffect } from 'react';

interface StoredValue<T> {
  value: T;
  timestamp: number;
}

const SESSION_TIMESTAMP_PREFIX = '__session_timestamp__';
const SESSION_KEYS_PREFIX = '__session_keys__';

function getSessionTimestampKey(sessionKey: string): string {
  return `${SESSION_TIMESTAMP_PREFIX}${sessionKey}`;
}

function getSessionKeysKey(sessionKey: string): string {
  return `${SESSION_KEYS_PREFIX}${sessionKey}`;
}

function getSessionTimestamp(sessionKey: string, ttlMs: number): number | null {
  try {
    const timestampKey = getSessionTimestampKey(sessionKey);
    const item = window.localStorage.getItem(timestampKey);
    if (!item) return null;
    
    const timestamp = parseInt(item);
    const now = Date.now();
    
    if (now - timestamp > ttlMs) {
      clearSession(sessionKey);
      return null;
    }
    
    return timestamp;
  } catch {
    return null;
  }
}

function setSessionTimestamp(sessionKey: string): void {
  try {
    const timestampKey = getSessionTimestampKey(sessionKey);
    window.localStorage.setItem(timestampKey, Date.now().toString());
  } catch (error) {
    console.error(`Error setting session timestamp for "${sessionKey}":`, error);
  }
}

function addKeyToSession(sessionKey: string, key: string): void {
  try {
    const keysKey = getSessionKeysKey(sessionKey);
    const item = window.localStorage.getItem(keysKey);
    const keys: string[] = item ? JSON.parse(item) : [];
    
    if (!keys.includes(key)) {
      keys.push(key);
      window.localStorage.setItem(keysKey, JSON.stringify(keys));
    }
  } catch (error) {
    console.error(`Error adding key to session "${sessionKey}":`, error);
  }
}

function clearSession(sessionKey: string): void {
  try {
    const keysKey = getSessionKeysKey(sessionKey);
    const timestampKey = getSessionTimestampKey(sessionKey);
    const item = window.localStorage.getItem(keysKey);
    
    if (item) {
      const keys: string[] = JSON.parse(item);
      keys.forEach(key => window.localStorage.removeItem(key));
    }
    
    window.localStorage.removeItem(keysKey);
    window.localStorage.removeItem(timestampKey);
  } catch (error) {
    console.error(`Error clearing session "${sessionKey}":`, error);
  }
}

export function useLocalStorage<T>(key: string, initialValue: T, ttlHours: number = 2, sessionKey?: string) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const ttlMs = ttlHours * 60 * 60 * 1000;
      
      if (sessionKey) {
        const sessionTimestamp = getSessionTimestamp(sessionKey, ttlMs);
        if (!sessionTimestamp) {
          return initialValue;
        }
        addKeyToSession(sessionKey, key);
      }
      
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item);
      
      if (parsed && typeof parsed === 'object' && 'value' in parsed && 'timestamp' in parsed) {
        const stored = parsed as StoredValue<T>;
        return stored.value;
      } else {
        const migrated: StoredValue<T> = {
          value: parsed,
          timestamp: Date.now()
        };
        window.localStorage.setItem(key, JSON.stringify(migrated));
        if (sessionKey) {
          addKeyToSession(sessionKey, key);
          setSessionTimestamp(sessionKey);
        }
        return parsed;
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    const checkExpiration = () => {
      try {
        const ttlMs = ttlHours * 60 * 60 * 1000;
        
        if (sessionKey) {
          const sessionTimestamp = getSessionTimestamp(sessionKey, ttlMs);
          if (!sessionTimestamp) {
            setStoredValue(initialValue);
          }
        } else {
          const item = window.localStorage.getItem(key);
          if (!item) return;

          const parsed = JSON.parse(item);
          
          if (parsed && typeof parsed === 'object' && 'value' in parsed && 'timestamp' in parsed) {
            const stored = parsed as StoredValue<T>;
            const now = Date.now();

            if (now - stored.timestamp > ttlMs) {
              window.localStorage.removeItem(key);
              setStoredValue(initialValue);
            }
          }
        }
      } catch (error) {
        console.error(`Error checking expiration for "${key}":`, error);
      }
    };

    const interval = setInterval(checkExpiration, 60000);
    return () => clearInterval(interval);
  }, [key, initialValue, ttlHours, sessionKey]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      const stored: StoredValue<T> = {
        value: valueToStore,
        timestamp: Date.now()
      };
      
      window.localStorage.setItem(key, JSON.stringify(stored));
      
      if (sessionKey) {
        addKeyToSession(sessionKey, key);
        setSessionTimestamp(sessionKey);
      }
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  };

  const clearValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error clearing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, clearValue] as const;
}
