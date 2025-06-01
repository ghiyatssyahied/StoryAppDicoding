import CONFIG from '../config.js';

class IndexedDBHelper {
  constructor() {
    this.dbName = CONFIG.DATABASE_NAME || 'story-app-database';
    this.dbVersion = CONFIG.DATABASE_VERSION || 1;
    this.objectStoreName = CONFIG.OBJECT_STORE_NAME || 'stories';
    this.db = null;
  }

  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Error opening database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('Upgrading database...');

        // Create object store for stories
        if (!db.objectStoreNames.contains(this.objectStoreName)) {
          const objectStore = db.createObjectStore(this.objectStoreName, {
            keyPath: 'id',
            autoIncrement: true
          });

          // Create indexes for better querying
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          objectStore.createIndex('name', 'name', { unique: false });
          objectStore.createIndex('synced', 'synced', { unique: false });
          
          console.log('Object store created successfully');
        }

        // Create object store for offline stories (stories created while offline)
        if (!db.objectStoreNames.contains('offline_stories')) {
          const offlineStore = db.createObjectStore('offline_stories', {
            keyPath: 'tempId',
            autoIncrement: true
          });
          
          offlineStore.createIndex('createdAt', 'createdAt', { unique: false });
          offlineStore.createIndex('synced', 'synced', { unique: false });
          
          console.log('Offline stories object store created');
        }

        // Create object store for user favorites
        if (!db.objectStoreNames.contains('favorites')) {
          const favStore = db.createObjectStore('favorites', {
            keyPath: 'storyId'
          });
          
          favStore.createIndex('addedAt', 'addedAt', { unique: false });
          
          console.log('Favorites object store created');
        }
      };
    });
  }

  async ensureDbOpen() {
    if (!this.db) {
      await this.openDatabase();
    }
    return this.db;
  }

  // CRUD Operations for Stories
  async saveStory(story) {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.objectStoreName);
      
      // Add timestamp and sync status
      const storyWithMeta = {
        ...story,
        savedAt: new Date().toISOString(),
        synced: true // Stories from API are already synced
      };
      
      const request = objectStore.put(storyWithMeta);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Story saved to IndexedDB:', request.result);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('Error saving story:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in saveStory:', error);
      throw error;
    }
  }

  async getAllStories() {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction([this.objectStoreName], 'readonly');
      const objectStore = transaction.objectStore(this.objectStoreName);
      
      const request = objectStore.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Retrieved stories from IndexedDB:', request.result.length);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('Error getting stories:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getAllStories:', error);
      throw error;
    }
  }

  async getStoryById(id) {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction([this.objectStoreName], 'readonly');
      const objectStore = transaction.objectStore(this.objectStoreName);
      
      const request = objectStore.get(id);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('Error getting story by ID:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getStoryById:', error);
      throw error;
    }
  }

  async deleteStory(id) {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.objectStoreName);
      
      const request = objectStore.delete(id);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Story deleted from IndexedDB:', id);
          resolve(true);
        };
        
        request.onerror = () => {
          console.error('Error deleting story:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in deleteStory:', error);
      throw error;
    }
  }

  async saveMultipleStories(stories) {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.objectStoreName);
      
      const promises = stories.map(story => {
        const storyWithMeta = {
          ...story,
          savedAt: new Date().toISOString(),
          synced: true
        };
        
        return new Promise((resolve, reject) => {
          const request = objectStore.put(storyWithMeta);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      });
      
      const results = await Promise.all(promises);
      console.log('Multiple stories saved to IndexedDB:', results.length);
      return results;
    } catch (error) {
      console.error('Error in saveMultipleStories:', error);
      throw error;
    }
  }

  // Operations for Offline Stories
  async saveOfflineStory(storyData) {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction(['offline_stories'], 'readwrite');
      const objectStore = transaction.objectStore('offline_stories');
      
      const offlineStory = {
        ...storyData,
        createdAt: new Date().toISOString(),
        synced: false
      };
      
      const request = objectStore.add(offlineStory);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Offline story saved:', request.result);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('Error saving offline story:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in saveOfflineStory:', error);
      throw error;
    }
  }

  async getOfflineStories() {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction(['offline_stories'], 'readonly');
      const objectStore = transaction.objectStore('offline_stories');
      
      const request = objectStore.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('Error getting offline stories:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getOfflineStories:', error);
      throw error;
    }
  }

  async deleteOfflineStory(tempId) {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction(['offline_stories'], 'readwrite');
      const objectStore = transaction.objectStore('offline_stories');
      
      const request = objectStore.delete(tempId);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Offline story deleted:', tempId);
          resolve(true);
        };
        
        request.onerror = () => {
          console.error('Error deleting offline story:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in deleteOfflineStory:', error);
      throw error;
    }
  }

  // Operations for Favorites
  async addToFavorites(storyId, storyData) {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction(['favorites'], 'readwrite');
      const objectStore = transaction.objectStore('favorites');
      
      const favorite = {
        storyId,
        ...storyData,
        addedAt: new Date().toISOString()
      };
      
      const request = objectStore.put(favorite);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Added to favorites:', storyId);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('Error adding to favorites:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in addToFavorites:', error);
      throw error;
    }
  }

  async removeFromFavorites(storyId) {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction(['favorites'], 'readwrite');
      const objectStore = transaction.objectStore('favorites');
      
      const request = objectStore.delete(storyId);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Removed from favorites:', storyId);
          resolve(true);
        };
        
        request.onerror = () => {
          console.error('Error removing from favorites:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in removeFromFavorites:', error);
      throw error;
    }
  }

  async getFavorites() {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction(['favorites'], 'readonly');
      const objectStore = transaction.objectStore('favorites');
      
      const request = objectStore.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('Error getting favorites:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getFavorites:', error);
      throw error;
    }
  }

  async isFavorite(storyId) {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction(['favorites'], 'readonly');
      const objectStore = transaction.objectStore('favorites');
      
      const request = objectStore.get(storyId);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(!!request.result);
        };
        
        request.onerror = () => {
          console.error('Error checking favorite status:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in isFavorite:', error);
      return false;
    }
  }

  // Clear all data
  async clearAllData() {
    try {
      await this.ensureDbOpen();
      
      const storeNames = ['stories', 'offline_stories', 'favorites'];
      const transaction = this.db.transaction(storeNames, 'readwrite');
      
      const promises = storeNames.map(storeName => {
        return new Promise((resolve, reject) => {
          const objectStore = transaction.objectStore(storeName);
          const request = objectStore.clear();
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });
      
      await Promise.all(promises);
      console.log('All IndexedDB data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  // Get database info
  async getDatabaseInfo() {
    try {
      await this.ensureDbOpen();
      
      const storiesCount = await this.getStoriesCount();
      const offlineStoriesCount = await this.getOfflineStoriesCount();
      const favoritesCount = await this.getFavoritesCount();
      
      return {
        storiesCount,
        offlineStoriesCount,
        favoritesCount,
        totalCount: storiesCount + offlineStoriesCount + favoritesCount
      };
    } catch (error) {
      console.error('Error getting database info:', error);
      return {
        storiesCount: 0,
        offlineStoriesCount: 0,
        favoritesCount: 0,
        totalCount: 0
      };
    }
  }

  async getStoriesCount() {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction([this.objectStoreName], 'readonly');
      const objectStore = transaction.objectStore(this.objectStoreName);
      
      const request = objectStore.count();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting stories count:', error);
      return 0;
    }
  }

  async getOfflineStoriesCount() {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction(['offline_stories'], 'readonly');
      const objectStore = transaction.objectStore('offline_stories');
      
      const request = objectStore.count();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting offline stories count:', error);
      return 0;
    }
  }

  async getFavoritesCount() {
    try {
      await this.ensureDbOpen();
      
      const transaction = this.db.transaction(['favorites'], 'readonly');
      const objectStore = transaction.objectStore('favorites');
      
      const request = objectStore.count();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting favorites count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export default new IndexedDBHelper();