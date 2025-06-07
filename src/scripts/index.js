// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import { setupSkipToContent } from './utils/accessibility-helper';
import PushNotificationManager from './utils/push-notification';
import IndexedDBHelper from './utils/indexeddb-helper';
import Auth from './utils/auth';
// Add PWA Install Helper import
import './utils/pwa-install';


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

      // PWA Install Helper is auto-initialized via import
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

    if (banner) {
      banner.style.display = 'block';

      if (enableButton) {
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
      }

      if (dismissButton) {
        dismissButton.addEventListener('click', () => {
          banner.style.display = 'none';
          localStorage.setItem('notification-decision', 'dismissed');
        });
      }
    }
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

    // PWA Install Helper will handle the install UI automatically
    // You can also manually trigger it if needed:
    if (window.pwaInstallHelper && window.pwaInstallHelper.canInstall()) {
      console.log('PWA can be installed');
      // Optionally show your own install prompt
    }
  }

  showConnectionStatus(status) {
    const statusElement = document.getElementById('connection-status');
    const textElement = document.getElementById('connection-text');

    if (statusElement && textElement) {
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
    } else {
      // Fallback to PWA Install Helper's status indicator
      if (window.pwaInstallHelper) {
        window.pwaInstallHelper.updateOnlineStatus(status === 'online');
      }
    }
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
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="error-container container">
          <h1>Something went wrong</h1>
          <p>${message}</p>
          <button onclick="window.location.reload()" class="btn btn-primary">Reload App</button>
        </div>
      `;
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const appInitializer = new AppInitializer();
  await appInitializer.init();
});

// Handle service worker messages - enhanced to work with new SW
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SYNC_COMPLETE') {
      console.log('Background sync completed:', event.data.message);
      
      // Show notification to user
      const notification = document.createElement('div');
      notification.className = 'notification notification-success';
      notification.textContent = event.data.message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    }
  });
}

// Handle PWA install prompt - enhanced
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  localStorage.setItem('pwa-installed', 'true');
  
  // Show success message
  const notification = document.createElement('div');
  notification.className = 'notification notification-success';
  notification.textContent = '🎉 StoryShare installed successfully!';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 4000);
});

// Disable right-click context menu in standalone mode for better app experience
if (window.matchMedia('(display-mode: standalone)').matches) {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Debug helper for PWA status (remove in production)
if (process.env.NODE_ENV === 'development') {
  window.debugPWA = () => {
    console.log('PWA Install Helper Status:', window.pwaInstallHelper?.getStatus());
    console.log('PWA Install Helper Info:', window.pwaInstallHelper?.getAppInfo());
    console.log('Service Worker Registration:', navigator.serviceWorker.controller);
  };
}