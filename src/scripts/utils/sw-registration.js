/**
 * Service Worker Registration Helper
 * File: /src/scripts/utils/sw-registration.js
 */

class ServiceWorkerRegistration {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator;
  }

  async register() {
    if (!this.isSupported) {
      console.warn('Service Worker is not supported in this browser');
      return false;
    }

    try {
      // Try multiple paths to find working SW location
      console.log('Attempting to register service worker...');
      
      const swPaths = [
        '/src/sw.js',        // Current path
        '/sw.js',            // Root path
        './src/sw.js',       // Relative path
        './sw.js'            // Relative root
      ];

      let registration = null;
      let workingPath = null;

      // Try each path until one works
      for (const path of swPaths) {
        try {
          console.log(`[SW] Trying path: ${path}`);
          
          // First check if file exists
          const response = await fetch(path);
          if (response.ok) {
            console.log(`[SW] ✅ File found at: ${path}`);
            
            // Try to register
            registration = await navigator.serviceWorker.register(path, {
              scope: '/'
            });
            
            workingPath = path;
            console.log(`[SW] ✅ Successfully registered from: ${path}`);
            break;
          } else {
            console.log(`[SW] ❌ File not found at: ${path} (${response.status})`);
          }
        } catch (error) {
          console.log(`[SW] ❌ Failed to register from: ${path}`, error.message);
          continue;
        }
      }

      if (!registration) {
        throw new Error('Service Worker file not found in any expected location');
      }

      this.registration = registration;
      console.log('✅ Service Worker registered successfully:', registration.scope);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker is ready');

      // Handle updates
      this.handleUpdates(registration);

      // Handle messages from service worker
      this.setupMessageHandling();

      return true;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      
      // Show helpful error message
      this.showRegistrationError(error);
      return false;
    }
  }

  showRegistrationError(error) {
    console.group('🔧 Service Worker Debug Info');
    console.log('Error:', error.message);
    console.log('Possible solutions:');
    console.log('1. Ensure sw.js file is deployed to production');
    console.log('2. Check file is accessible at /src/sw.js or /sw.js');
    console.log('3. Verify build process copies SW file');
    console.log('4. Check browser console for specific errors');
    console.groupEnd();

    // Try to provide helpful debug info
    this.debugServiceWorkerLocation();
  }

  async debugServiceWorkerLocation() {
    const paths = ['/src/sw.js', '/sw.js', './src/sw.js', './sw.js'];
    
    console.group('📍 Service Worker File Check');
    for (const path of paths) {
      try {
        const response = await fetch(path);
        console.log(`${path}: ${response.status} ${response.ok ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`${path}: Network Error ❌`);
      }
    }
    console.groupEnd();
  }

  handleUpdates(registration) {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker installed, show update notification
          this.showUpdateNotification();
        }
      });
    });
  }

  setupMessageHandling() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from SW:', event.data);
      
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        this.notifyAppOfSync(event.data);
      }
    });
  }

  showUpdateNotification() {
    // Create update notification
    const notification = document.createElement('div');
    notification.className = 'sw-update-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        max-width: 300px;
      ">
        <div style="margin-bottom: 10px;">
          <strong>🔄 App Update Available</strong>
        </div>
        <div style="margin-bottom: 10px; font-size: 12px;">
          A new version is ready. Refresh to update.
        </div>
        <button onclick="window.location.reload()" style="
          background: white;
          color: #4CAF50;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          margin-right: 8px;
        ">Update</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        ">Later</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 10000);
  }

  notifyAppOfSync(data) {
    // Dispatch custom event for app to handle
    const event = new CustomEvent('sw-sync-complete', {
      detail: data
    });
    window.dispatchEvent(event);
  }

  // Method to check registration status
  getStatus() {
    return {
      isSupported: this.isSupported,
      isRegistered: !!this.registration,
      registration: this.registration,
      controller: navigator.serviceWorker.controller
    };
  }

  // Method to manually test SW paths
  async testPaths() {
    const paths = ['/src/sw.js', '/sw.js', './src/sw.js', './sw.js'];
    const results = {};
    
    for (const path of paths) {
      try {
        const response = await fetch(path);
        results[path] = {
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type')
        };
      } catch (error) {
        results[path] = {
          error: error.message
        };
      }
    }
    
    console.table(results);
    return results;
  }

  // Method to unregister (for debugging)
  async unregister() {
    if (this.registration) {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      return result;
    }
    return false;
  }

  // Method to force update
  async forceUpdate() {
    if (this.registration) {
      await this.registration.update();
      console.log('Service Worker update forced');
    }
  }
}

// Create and export singleton
const swRegistration = new ServiceWorkerRegistration();

// Auto-register when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    swRegistration.register();
  });
} else {
  swRegistration.register();
}

// Export for manual control and debugging
window.swRegistration = swRegistration;

// Debug helper
window.debugSW = () => {
  console.log('SW Status:', swRegistration.getStatus());
  swRegistration.testPaths();
};

export default swRegistration;