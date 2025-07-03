// Prefix for all storage keys to avoid conflicts
const STORAGE_PREFIX = 'walmart_delivery_';

export const storage = {
  // Get item from localStorage with JSON parsing
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },
  
  // Set item in localStorage with JSON stringification
  set: (key, value) => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },
  
  // Remove item from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },
  
  // Clear all items with prefix
  clear: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

// Session storage utilities
export const sessionStorage = {
  get: (key, defaultValue = null) => {
    try {
      const item = window.sessionStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Session storage get error:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      window.sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Session storage set error:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      window.sessionStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (error) {
      console.error('Session storage remove error:', error);
      return false;
    }
  }
};
