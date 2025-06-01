import API from '../data/api';
import Auth from '../utils/auth';
import CONFIG from '../config.js';
import { dataURLtoBlob, urlBase64ToUint8Array } from '../utils/index';

class StoryPresenter {
  constructor(view) {
    this._view = view;
    this._api = API;
    this._auth = Auth;
  }

  // Method untuk mendapatkan detail cerita
  async getStoryDetail(storyId) {
    try {
      if (!storyId) {
        this._view.showError('Story ID not found');
        return null;
      }
      
      if (!this._auth.isAuthenticated()) {
        this._view.showError('Please login to view story details');
        return null;
      }
      
      const { token } = this._auth.getAuth();
      const result = await this._api.getStoryDetail(token, storyId);
      
      if (result.error) {
        this._view.showError(result.message || 'Failed to load story');
        return null;
      }
      
      return result.story;
    } catch (error) {
      console.error('Error loading story detail:', error);
      this._view.showError('An error occurred while loading the story');
      return null;
    }
  }
  
  // Method untuk menambahkan cerita baru
  async addNewStory(description, photoDataUrl, lat, lon) {
    try {
      if (!description) {
        this._view.showStatus('Please enter a description for your story.', 'error');
        return false;
      }
      
      if (!photoDataUrl) {
        this._view.showStatus('Please take a photo for your story.', 'error');
        return false;
      }
      
      // Convert data URL to Blob
      const photoBlob = await dataURLtoBlob(photoDataUrl);
      
      // Submit story
      const { token } = this._auth.getAuth();
      const result = await this._api.addNewStory({
        token,
        description,
        photo: photoBlob,
        lat,
        lon,
      });
      
      if (result.error) {
        this._view.showStatus(`Failed to share story: ${result.message}`, 'error');
        return false;
      }
      
      this._view.showStatus('Story shared successfully! Redirecting...', 'success');
      
      // Register for push notifications (optional)
      this._registerPushNotification(token);
      
      return true;
    } catch (error) {
      console.error('Error submitting story:', error);
      this._view.showStatus('An error occurred while sharing your story. Please try again.', 'error');
      return false;
    }
  }
  
  // Method untuk mengecek autentikasi
  isAuthenticated() {
    return this._auth.isAuthenticated();
  }
  
  // Method untuk mendaftarkan push notification
  async _registerPushNotification(token) {
    // Check if Push API is supported
    if (!('PushManager' in window)) {
      console.log('Push notification not supported');
      return;
    }
    
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
      
      // Register service worker if not already registered
      if (!navigator.serviceWorker.controller) {
        await navigator.serviceWorker.register('/sw.js');
      }
      
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(CONFIG.PUSH_MSG_VAPID_PUBLIC_KEY),
      });
      
      // Send subscription to server
      await this._api.subscribePushNotification(token, {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
        },
      });
    } catch (error) {
      console.error('Error registering push notification:', error);
    }
  }
}

export default StoryPresenter;