/**
 * PWA Installation Helper for StoryShare
 * File: /src/scripts/utils/pwa-install.js
 */

class PWAInstallHelper {
    constructor() {
      this.deferredPrompt = null;
      this.isInstalled = false;
      this.isStandalone = false;
      
      this.init();
    }
  
    init() {
      // Check if app is already installed/running in standalone mode
      this.checkInstallationStatus();
      
      // Listen for the beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (event) => {
        console.log('PWA install prompt available');
        
        // Prevent the default mini-infobar from appearing
        event.preventDefault();
        
        // Store the event for later use
        this.deferredPrompt = event;
        
        // Show custom install UI
        this.showInstallUI();
      });
  
      // Listen for app installed event
      window.addEventListener('appinstalled', (event) => {
        console.log('PWA was installed successfully');
        this.isInstalled = true;
        this.hideInstallUI();
        this.showInstalledMessage();
      });
  
      // Listen for online/offline events
      window.addEventListener('online', () => {
        this.updateOnlineStatus(true);
      });
  
      window.addEventListener('offline', () => {
        this.updateOnlineStatus(false);
      });
  
      // Initialize online status
      this.updateOnlineStatus(navigator.onLine);
    }
  
    // Check if app is running in standalone mode or already installed
    checkInstallationStatus() {
      // Check if running in standalone mode
      this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone === true;
  
      // Check various indicators of installation
      this.isInstalled = this.isStandalone ||
                         document.referrer.includes('android-app://') ||
                         window.matchMedia('(display-mode: minimal-ui)').matches;
  
      console.log('PWA Installation Status:', {
        isInstalled: this.isInstalled,
        isStandalone: this.isStandalone,
        displayMode: this.getDisplayMode()
      });
  
      // Update UI based on installation status
      if (this.isInstalled) {
        this.hideInstallUI();
      }
    }
  
    // Get current display mode
    getDisplayMode() {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return 'standalone';
      }
      if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        return 'minimal-ui';
      }
      if (window.matchMedia('(display-mode: fullscreen)').matches) {
        return 'fullscreen';
      }
      return 'browser';
    }
  
    // Show custom install UI
    showInstallUI() {
      // Check if install button already exists
      let installButton = document.getElementById('pwa-install-button');
      
      if (!installButton) {
        installButton = this.createInstallButton();
        document.body.appendChild(installButton);
      }
      
      installButton.style.display = 'block';
      
      // Remove existing listener and add new one
      installButton.removeEventListener('click', this.handleInstallClick);
      installButton.addEventListener('click', this.handleInstallClick.bind(this));
    }
  
    // Handle install button click
    handleInstallClick() {
      this.promptInstall();
    }
  
    // Create install button element
    createInstallButton() {
      const button = document.createElement('button');
      button.id = 'pwa-install-button';
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
        Install App
      `;
      button.className = 'pwa-install-btn';
      
      // Add CSS styles if not already added
      if (!document.getElementById('pwa-styles')) {
        this.addPWAStyles();
      }
      
      return button;
    }
  
    // Add PWA-related styles
    addPWAStyles() {
      const style = document.createElement('style');
      style.id = 'pwa-styles';
      style.textContent = `
        .pwa-install-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg, #A0C878 0%, #DDED9D 100%);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(160, 200, 120, 0.3);
          transition: all 0.3s ease;
          z-index: 9999;
          display: none;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .pwa-install-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(160, 200, 120, 0.4);
          background: linear-gradient(135deg, #8FB466 0%, #A0C878 100%);
        }
        
        .pwa-install-btn:active {
          transform: translateY(0);
        }
        
        .pwa-install-btn svg {
          transition: transform 0.3s ease;
        }
        
        .pwa-install-btn:hover svg {
          transform: translateY(-1px);
        }
        
        .pwa-status-indicator {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          z-index: 9998;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .pwa-status-online {
          background: rgba(76, 175, 80, 0.9);
          color: white;
        }
        
        .pwa-status-offline {
          background: rgba(255, 152, 0, 0.9);
          color: white;
        }
        
        .pwa-installed-message {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(76, 175, 80, 0.95);
          color: white;
          padding: 20px 30px;
          border-radius: 12px;
          font-weight: 600;
          box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
          z-index: 10000;
          animation: showInstallMessage 0.5s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
          max-width: 300px;
        }
        
        @keyframes showInstallMessage {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        .pwa-status-indicator.slide-in {
          animation: slideInFromRight 0.3s ease;
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Responsive design */
        @media (max-width: 480px) {
          .pwa-install-btn {
            bottom: 15px;
            right: 15px;
            padding: 10px 16px;
            font-size: 13px;
          }
          
          .pwa-status-indicator {
            top: 15px;
            right: 15px;
            padding: 6px 12px;
            font-size: 11px;
          }
          
          .pwa-installed-message {
            padding: 16px 24px;
            max-width: 280px;
            margin: 0 20px;
          }
        }
      `;
      
      document.head.appendChild(style);
    }
  
    // Hide install UI
    hideInstallUI() {
      const installButton = document.getElementById('pwa-install-button');
      if (installButton) {
        installButton.style.display = 'none';
      }
    }
  
    // Prompt user to install the app
    async promptInstall() {
      if (!this.deferredPrompt) {
        console.log('No deferred prompt available');
        return false;
      }
  
      try {
        // Show the install prompt
        this.deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const choiceResult = await this.deferredPrompt.userChoice;
        
        console.log('Install prompt result:', choiceResult.outcome);
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          this.hideInstallUI();
        } else {
          console.log('User dismissed the install prompt');
        }
        
        // Clear the deferredPrompt
        this.deferredPrompt = null;
        
        return choiceResult.outcome === 'accepted';
      } catch (error) {
        console.error('Error showing install prompt:', error);
        return false;
      }
    }
  
    // Show message when app is installed
    showInstalledMessage() {
      const message = document.createElement('div');
      message.className = 'pwa-installed-message';
      message.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 10px;">🎉</div>
        <div>StoryShare installed successfully!</div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">You can now access it from your home screen</div>
      `;
      
      document.body.appendChild(message);
      
      // Remove message after 4 seconds
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 4000);
    }
  
    // Update online/offline status indicator
    updateOnlineStatus(isOnline) {
      let statusIndicator = document.getElementById('pwa-status-indicator');
      
      if (!statusIndicator) {
        statusIndicator = document.createElement('div');
        statusIndicator.id = 'pwa-status-indicator';
        statusIndicator.className = 'pwa-status-indicator';
        document.body.appendChild(statusIndicator);
      }
      
      // Remove existing classes
      statusIndicator.classList.remove('pwa-status-online', 'pwa-status-offline', 'slide-in');
      
      if (isOnline) {
        statusIndicator.classList.add('pwa-status-online', 'slide-in');
        statusIndicator.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
            <path d="M12,21L15.6,16.2C14.6,15.45 13.35,15 12,15C10.65,15 9.4,15.45 8.4,16.2L12,21M12,3C7.95,3 4.68,4.67 2.61,7.33L5.21,10.24C6.65,8.75 8.58,8 12,8C15.42,8 17.35,8.75 18.79,10.24L21.39,7.33C19.32,4.67 16.05,3 12,3Z"/>
          </svg>
          Online
        `;
        
        // Hide after 3 seconds when coming back online
        setTimeout(() => {
          if (statusIndicator) {
            statusIndicator.style.opacity = '0';
            setTimeout(() => {
              if (statusIndicator) {
                statusIndicator.style.display = 'none';
              }
            }, 300);
          }
        }, 3000);
      } else {
        statusIndicator.classList.add('pwa-status-offline', 'slide-in');
        statusIndicator.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M15,17H9V15H15V17M15,13H9V7H15V13Z"/>
          </svg>
          Offline Mode
        `;
        statusIndicator.style.display = 'block';
        statusIndicator.style.opacity = '1';
      }
    }
  
    // Check if app can be installed
    canInstall() {
      return !!this.deferredPrompt && !this.isInstalled;
    }
  
    // Get installation status
    getStatus() {
      return {
        isInstalled: this.isInstalled,
        isStandalone: this.isStandalone,
        canInstall: this.canInstall(),
        displayMode: this.getDisplayMode(),
        isOnline: navigator.onLine
      };
    }
  
    // Manual trigger for install UI (for testing or manual activation)
    showInstallPrompt() {
      if (this.canInstall()) {
        this.showInstallUI();
      } else {
        console.log('Cannot show install prompt - app may already be installed or prompt not available');
      }
    }
  
    // Get app info for debugging
    getAppInfo() {
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        standalone: navigator.standalone,
        displayMode: this.getDisplayMode(),
        orientation: screen.orientation ? screen.orientation.type : 'unknown',
        online: navigator.onLine,
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notifications: 'Notification' in window
      };
    }
  }
  
  // Create global instance
  const pwaInstallHelper = new PWAInstallHelper();
  
  // Export for use in other scripts
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = pwaInstallHelper;
  } else {
    window.pwaInstallHelper = pwaInstallHelper;
  }
  
  // Auto-initialize when DOM is loaded (if not already loaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('PWA Install Helper initialized');
    });
  } else {
    console.log('PWA Install Helper initialized');
  }