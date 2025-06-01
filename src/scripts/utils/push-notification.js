import API from '../data/api';
import Auth from './auth';
import CONFIG from '../config.js';

class PushNotificationManager {
    constructor() {
      this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      this.isSubscribed = false;
      this.registration = null;
    }
  
    async init() {
      if (!this.isSupported) {
        console.warn('Push notifications are not supported');
        return false;
      }
  
      try {
        // Register service worker
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
  
        // Check if already subscribed
        const subscription = await this.registration.pushManager.getSubscription();
        this.isSubscribed = !(subscription === null);
  
        return true;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return false;
      }
    }
  
    async requestPermission() {
      if (!this.isSupported) {
        console.warn('Push notifications are not supported');
        return false;
      }
  
      try {
        // Check current permission
        if (Notification.permission === 'granted') {
          console.log('Notification permission already granted');
          return true;
        }
        
        if (Notification.permission === 'denied') {
          console.warn('Notification permission was denied');
          return false;
        }
        
        // Request permission
        const permission = await Notification.requestPermission();
        console.log('Notification permission result:', permission);
        
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
  
    async subscribe() {
      if (!this.isSupported || !Auth.isAuthenticated()) {
        console.warn('Cannot subscribe: not supported or not authenticated');
        return false;
      }
  
      try {
        // Check permission first
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
          console.warn('Cannot subscribe: permission not granted');
          throw new Error('Notification permission not granted');
        }
  
        // Check if already subscribed
        const existingSubscription = await this.registration.pushManager.getSubscription();
        if (existingSubscription) {
          console.log('Already subscribed to push notifications');
          this.isSubscribed = true;
          return true;
        }
  
        // Subscribe to push notifications
        const subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this._urlBase64ToUint8Array(CONFIG.PUSH_MSG_VAPID_PUBLIC_KEY),
        });
  
        console.log('Push subscription created:', subscription);
  
        // Send subscription to server
        const { token } = Auth.getAuth();
        const result = await API.subscribePushNotification(token, {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
          },
        });
  
        if (result.error) {
          console.error('Server subscription failed:', result.message);
          throw new Error(result.message);
        }
  
        this.isSubscribed = true;
        console.log('Successfully subscribed to push notifications');
        
        // Test notification to confirm it works
        this.sendTestNotification();
        
        return true;
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
        return false;
      }
    }
    
    // Test notification method
    sendTestNotification() {
      if (Notification.permission === 'granted') {
        try {
          const notification = new Notification('StoryShare Notifications Enabled', {
            body: 'You will now receive notifications when new stories are shared!',
            icon: '/images/icon-192x192.png',
            badge: '/images/icon-96x96.png',
            tag: 'test-notification'
          });
          
          // Auto close after 5 seconds
          setTimeout(() => {
            notification.close();
          }, 5000);
          
          console.log('Test notification sent');
        } catch (error) {
          console.error('Error sending test notification:', error);
        }
      }
    }
  
    async unsubscribe() {
      if (!this.isSupported || !Auth.isAuthenticated()) {
        return false;
      }
  
      try {
        const subscription = await this.registration.pushManager.getSubscription();
        if (!subscription) {
          console.log('Not subscribed to push notifications');
          return true;
        }
  
        // Unsubscribe from browser
        await subscription.unsubscribe();
  
        // Notify server
        const { token } = Auth.getAuth();
        await API.unsubscribePushNotification(token, subscription.endpoint);
  
        this.isSubscribed = false;
        console.log('Successfully unsubscribed from push notifications');
        return true;
      } catch (error) {
        console.error('Failed to unsubscribe from push notifications:', error);
        return false;
      }
    }
  
    async getSubscriptionStatus() {
      if (!this.isSupported) {
        return false;
      }
  
      try {
        const subscription = await this.registration.pushManager.getSubscription();
        this.isSubscribed = !(subscription === null);
        return this.isSubscribed;
      } catch (error) {
        console.error('Failed to check subscription status:', error);
        return false;
      }
    }
  
    _urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      
      return outputArray;
    }
  }
  
  // Export singleton instance
  export default new PushNotificationManager();