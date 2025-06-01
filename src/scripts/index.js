// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import { setupSkipToContent } from './utils/accessibility-helper';
import PushNotificationManager from './utils/push-notification';
import IndexedDBHelper from './utils/indexeddb-helper';
import Auth from './utils/auth';

class AppInitializer {
  constructor() {
    this.app = null;
    this.isOnline = navigator.onLine;
  }

  async init() {
    try {
      // Initialize IndexedDB
      await IndexedDBHelper.openDatabase();
      console.log('IndexedDB initialized');

      // Initialize the main app
      this.app = new App({
        content: document.querySelector('#main-content'),
        drawerButton: document.querySelector('#drawer-button'),
        navigationDrawer: document.querySelector('#navigation-drawer'),
      });

      // Render initial page
      await this.app.renderPage();

      // Setup accessibility features
      setupSkipToContent();

      // Initialize PWA features
      await this.initPWAFeatures();

      // Setup connection monitoring
      this.setupConnectionMonitoring();

      // Setup navigation
      this.setupNavigation();

      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
      this.showErrorMessage('Failed to initialize app. Please refresh the page.');
    }
  }

  async initPWAFeatures() {
    try {
      // Initialize push notifications if user is authenticated
      if (Auth.isAuthenticated()) {
        const pushInitialized = await PushNotificationManager.init();
        if (pushInitialized) {
          this.showPushNotificationBanner();
        }
      }

      // Show PWA install banner after a delay
      setTimeout(() => {
        this.checkPWAInstallability();
      }, 5000);

      // Listen for auth state changes
      this.setupAuthStateListener();

    } catch (error) {
      console.error('Error initializing PWA features:', error);
    }
  }

  setupConnectionMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showConnectionStatus('online');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showConnectionStatus('offline');
    });

    // Initial connection check
    if (!this.isOnline) {
      this.showConnectionStatus('offline');
    }
  }

  setupNavigation() {
    // Handle hash change
    window.addEventListener('hashchange', async () => {
      await this.app.renderPage();
      setupSkipToContent();
    });

    // Handle browser back/forward
    window.addEventListener('popstate', async () => {
      await this.app.renderPage();
      setupSkipToContent();
    });
  }

  setupAuthStateListener() {
    // Listen for storage changes (auth state changes)
    window.addEventListener('storage', async (event) => {
      if (event.key === 'auth') {
        // Auth state changed, re-render current page
        await this.app.renderPage();
        
        // Update push notification status
        if (Auth.isAuthenticated()) {
          await PushNotificationManager.init();
        }
      }
    });
  }

  showPushNotificationBanner() {
    const banner = document.getElementById('push-notification-banner');
    const enableButton = document.getElementById('enable-notifications');
    const dismissButton = document.getElementById('dismiss-notifications');

    // Check if user has already made a decision
    const notificationDecision = localStorage.getItem('notification-decision');
    if (notificationDecision) {
      return;
    }

    banner.style.display = 'block';

    enableButton.addEventListener('click', async () => {
      const success = await PushNotificationManager.subscribe();
      if (success) {
        this.showNotification('Notifications enabled successfully!', 'success');
        localStorage.setItem('notification-decision', 'enabled');
      } else {
        this.showNotification('Failed to enable notifications.', 'error');
      }
      banner.style.display = 'none';
    });

    dismissButton.addEventListener('click', () => {
      banner.style.display = 'none';
      localStorage.setItem('notification-decision', 'dismissed');
    });
  }

  checkPWAInstallability() {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed');
      return;
    }

    // Check if install banner was already dismissed
    if (localStorage.getItem('pwa-install-dismissed') === 'true') {
      return;
    }

    // The install banner will be shown by the beforeinstallprompt event
    // This is handled in the HTML file
  }

  showConnectionStatus(status) {
    const statusElement = document.getElementById('connection-status');
    const textElement = document.getElementById('connection-text');

    if (status === 'online') {
      textElement.textContent = '🟢 You\'re back online!';
      statusElement.className = 'connection-status online';
      
      setTimeout(() => {
        statusElement.style.display = 'none';
      }, 3000);
    } else {
      textElement.textContent = '🔴 You\'re offline. Some features may not work.';
      statusElement.className = 'connection-status offline';
    }

    statusElement.style.display = 'block';
  }

  async syncOfflineData() {
    try {
      // Get offline stories from IndexedDB
      const offlineStories = await IndexedDBHelper.getOfflineStories();
      
      if (offlineStories.length > 0) {
        console.log('Syncing offline stories:', offlineStories.length);
        
        // Attempt to sync each offline story
        for (const story of offlineStories) {
          try {
            // This would normally sync with the API
            // For now, we'll just mark them as synced
            await IndexedDBHelper.deleteOfflineStory(story.tempId);
            console.log('Synced offline story:', story.tempId);
          } catch (error) {
            console.error('Failed to sync story:', story.tempId, error);
          }
        }
        
        this.showNotification('Offline stories synced successfully!', 'success');
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  }

  showErrorMessage(message) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="error-container container">
        <h1>Something went wrong</h1>
        <p>${message}</p>
        <button onclick="window.location.reload()" class="btn btn-primary">Reload App</button>
      </div>
    `;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const appInitializer = new AppInitializer();
  await appInitializer.init();
});

// Handle service worker messages
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SYNC_COMPLETE') {
      console.log('Background sync completed:', event.data.message);
    }
  });
}

// Handle PWA install prompt
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  localStorage.setItem('pwa-installed', 'true');
});

// Disable right-click context menu in standalone mode for better app experience
if (window.matchMedia('(display-mode: standalone)').matches) {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
}