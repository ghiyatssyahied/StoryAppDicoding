import Auth from '../../utils/auth';
import { showFormattedDate } from '../../utils/index';
import HomePresenter from '../../presenters/home-presenter';
import IndexedDBHelper from '../../utils/indexeddb-helper';

export default class HomePage {
  constructor() {
    this._initialData = {
      stories: [],
      map: null,
      markers: [],
    };
    this._presenter = new HomePresenter(this);
  }

  async render() {
    return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to Content</a>
      </div>
      
      <section class="hero">
        <div class="container">
          <h1>Share Your Stories</h1>
          <p>Capture moments, share experiences, and connect with others through your unique stories</p>
          ${Auth.isAuthenticated() 
            ? `<a href="#/stories" class="btn btn-primary">Share New Story</a>`
            : `<a href="#/login" class="btn btn-primary">Login to Share</a>`
          }
        </div>
      </section>
      
      <main id="main-content" class="story-list container">
        <h2>Recent Stories</h2>
        <div class="story-map-container">
          <div id="story-map" class="story-map"></div>
        </div>
        
        <div id="stories" class="stories-grid">
          <!-- Story items will be rendered here -->
          <div class="loading-indicator">Loading stories...</div>
        </div>
      </main>
    `;
  }

  async afterRender() {
    // Menggunakan presenter untuk memuat cerita
    await this._presenter.getAllStories();
  }

  // Method untuk menampilkan pesan ketika user belum login
  showGuestMessage() {
    const storiesContainer = document.querySelector('#stories');
    storiesContainer.innerHTML = `
      <div class="guest-message">
        <p>Login to see stories with locations</p>
        <a href="#/login" class="btn btn-secondary">Login</a>
      </div>
    `;
  }

  // Method untuk menampilkan pesan error
  showErrorMessage(message) {
    const storiesContainer = document.querySelector('#stories');
    storiesContainer.innerHTML = `<div class="error-message">${message}</div>`;
  }

  // Method untuk menampilkan cerita
  displayStories(stories) {
    this._initialData.stories = stories;
    this._renderStories();
  }

  // Method untuk menginisialisasi peta
  initializeMap(stories) {
    const mapContainer = document.getElementById('story-map');
    
    if (!mapContainer) return;
    
    // Initialize map
    this._initialData.map = L.map('story-map').setView([0, 0], 2);
    
    // Define tile layers first
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    });
    
    // Add Stamen Watercolor for artistic alternative (optional)
    const watercolorLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 16
    });
    
    // Add Stamen Toner for high contrast (optional)
    const tonerLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    });
    
    // Add default layer to map
    osmLayer.addTo(this._initialData.map);
    
    // Layer control - optional feature
    const baseLayers = {
      'OpenStreetMap': osmLayer,
      'Watercolor': watercolorLayer,
      'Toner': tonerLayer
    };
    
    L.control.layers(baseLayers).addTo(this._initialData.map);
    
    // Add markers for each story with location
    this._addStoryMarkers();
  }

  _addStoryMarkers() {
    // Clear any existing markers
    this._clearMarkers();
    
    // Get stories with location data
    const storiesWithLocation = this._initialData.stories.filter(
      story => story.lat && story.lon
    );
    
    if (storiesWithLocation.length === 0) return;
    
    // Create bounds object to fit all markers
    const bounds = L.latLngBounds();
    
    // Add markers for each story
    storiesWithLocation.forEach(story => {
      const marker = L.marker([story.lat, story.lon]).addTo(this._initialData.map);
      
      // Create popup with story info
      marker.bindPopup(`
        <div class="map-popup">
          <img src="${story.photoUrl}" alt="Story from ${story.name}" class="popup-img">
          <h3>${story.name}</h3>
          <p>${story.description.substring(0, 50)}${story.description.length > 50 ? '...' : ''}</p>
          <a href="#/stories/${story.id}" class="popup-link">View Story</a>
        </div>
      `);
      
      // Add marker to array for later cleanup
      this._initialData.markers.push(marker);
      
      // Extend bounds to include this point
      bounds.extend([story.lat, story.lon]);
    });
    
    // Fit map to bounds with padding
    this._initialData.map.fitBounds(bounds, { padding: [50, 50] });
  }

  _clearMarkers() {
    // Remove all existing markers
    this._initialData.markers.forEach(marker => {
      if (this._initialData.map) {
        marker.remove();
      }
    });
    
    this._initialData.markers = [];
  }

  _renderStories() {
    const storiesContainer = document.querySelector('#stories');
    
    if (this._initialData.stories.length === 0) {
      storiesContainer.innerHTML = `
        <div class="empty-state">
          <p>No stories available yet</p>
          <a href="#/stories" class="btn btn-primary">Be the first to share!</a>
        </div>
      `;
      return;
    }
    
    const storiesFragment = document.createDocumentFragment();
    
    this._initialData.stories.forEach(story => {
      const storyElement = document.createElement('article');
      storyElement.classList.add('story-item');
      
      storyElement.innerHTML = `
        <a href="#/stories/${story.id}" class="story-link">
          <div class="story-image-container">
            <img src="${story.photoUrl}" alt="Story from ${story.name}" class="story-image">
          </div>
          <div class="story-content">
            <h3 class="story-title">${story.name}</h3>
            <p class="story-date">${showFormattedDate(story.createdAt)}</p>
            <p class="story-description">${story.description.substring(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
            ${story.lat && story.lon ? `<p class="story-location"><i class="location-icon">📍</i> Location attached</p>` : ''}
          </div>
        </a>
        
        <div class="story-item-actions">
          <button class="btn-favorite-small" data-story-id="${story.id}" onclick="event.preventDefault(); window.toggleStoryFavorite('${story.id}', this)">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>
      `;
      
      storiesFragment.appendChild(storyElement);
    });
    
    storiesContainer.innerHTML = '';
    storiesContainer.appendChild(storiesFragment);
    
    // Setup favorite buttons
    this._setupFavoriteButtons();
  }
  
  async _setupFavoriteButtons() {
    // Check favorite status for each story
    const favoriteButtons = document.querySelectorAll('.btn-favorite-small');
    
    for (const button of favoriteButtons) {
      const storyId = button.getAttribute('data-story-id');
      const isFavorite = await IndexedDBHelper.isFavorite(storyId);
      
      if (isFavorite) {
        button.classList.add('active');
        button.querySelector('i').className = 'fa-solid fa-heart';
      }
    }
    
    // Setup global toggle function
    window.toggleStoryFavorite = async (storyId, buttonElement) => {
      try {
        const story = this._initialData.stories.find(s => s.id === storyId);
        const isFavorite = await IndexedDBHelper.isFavorite(storyId);
        
        if (isFavorite) {
          await IndexedDBHelper.removeFromFavorites(storyId);
          buttonElement.classList.remove('active');
          buttonElement.querySelector('i').className = 'fa-regular fa-heart';
          this._showNotification('Removed from favorites', 'success');
        } else {
          await IndexedDBHelper.addToFavorites(storyId, story);
          buttonElement.classList.add('active');
          buttonElement.querySelector('i').className = 'fa-solid fa-heart';
          this._showNotification('Added to favorites', 'success');
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        this._showNotification('Failed to update favorites', 'error');
      }
    };
  }
  
  _showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }
  
  // Clean up resources when page is changed
  destroy() {
    // Remove map instance
    if (this._initialData.map) {
      this._initialData.map.remove();
      this._initialData.map = null;
    }
  }
}