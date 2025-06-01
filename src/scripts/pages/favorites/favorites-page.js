import { showFormattedDate } from '../../utils/index';
import IndexedDBHelper from '../../utils/indexeddb-helper';
import Auth from '../../utils/auth';

export default class FavoritesPage {
  constructor() {
    this._favorites = [];
  }

  async render() {
    return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to Content</a>
      </div>
      
      <main id="main-content" class="favorites-page container">
        <header class="page-header">
          <h1>My Favorite Stories</h1>
          <p>Stories you've saved for offline reading</p>
        </header>
        
        <div class="favorites-actions">
          <button id="clear-favorites" class="btn btn-secondary">Clear All Favorites</button>
          <span id="favorites-count" class="favorites-count">0 favorites</span>
        </div>
        
        <div id="favorites-container" class="favorites-container">
          <div class="loading-indicator">Loading favorites...</div>
        </div>
        
        <div id="empty-favorites" class="empty-state" style="display: none;">
          <div class="empty-icon">💝</div>
          <h2>No Favorites Yet</h2>
          <p>Start exploring stories and add them to your favorites for offline access!</p>
          <a href="#/" class="btn btn-primary">Browse Stories</a>
        </div>
      </main>
    `;
  }

  async afterRender() {
    if (!Auth.isAuthenticated()) {
      window.location.hash = '#/login';
      return;
    }

    await this._loadFavorites();
    this._setupEventListeners();
  }

  async _loadFavorites() {
    try {
      const favoritesContainer = document.getElementById('favorites-container');
      const emptyState = document.getElementById('empty-favorites');
      const favoritesCount = document.getElementById('favorites-count');
      
      // Get favorites from IndexedDB
      this._favorites = await IndexedDBHelper.getFavorites();
      
      // Update count
      const count = this._favorites.length;
      favoritesCount.textContent = `${count} favorite${count !== 1 ? 's' : ''}`;
      
      if (this._favorites.length === 0) {
        favoritesContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
      }
      
      // Render favorites
      this._renderFavorites();
      favoritesContainer.style.display = 'block';
      emptyState.style.display = 'none';
      
    } catch (error) {
      console.error('Error loading favorites:', error);
      this._showError('Failed to load favorites. Please try again.');
    }
  }

  _renderFavorites() {
    const favoritesContainer = document.getElementById('favorites-container');
    
    const favoritesHTML = this._favorites.map(favorite => `
      <article class="favorite-item" data-story-id="${favorite.storyId}">
        <div class="favorite-content">
          <div class="favorite-image-container">
            <img src="${favorite.photoUrl}" alt="Story from ${favorite.name}" class="favorite-image">
          </div>
          
          <div class="favorite-details">
            <h3 class="favorite-title">${favorite.name}'s Story</h3>
            <p class="favorite-date">Added: ${showFormattedDate(favorite.addedAt)}</p>
            <p class="favorite-description">${favorite.description?.substring(0, 150)}${favorite.description?.length > 150 ? '...' : ''}</p>
            
            <div class="favorite-actions">
              <a href="#/stories/${favorite.storyId}" class="btn btn-primary btn-sm">View Story</a>
              <button class="btn btn-secondary btn-sm remove-favorite" data-story-id="${favorite.storyId}">
                Remove
              </button>
            </div>
          </div>
        </div>
      </article>
    `).join('');
    
    favoritesContainer.innerHTML = `
      <div class="favorites-grid">
        ${favoritesHTML}
      </div>
    `;
  }

  _setupEventListeners() {
    // Clear all favorites
    const clearButton = document.getElementById('clear-favorites');
    clearButton.addEventListener('click', async () => {
      if (confirm('Are you sure you want to remove all favorites? This action cannot be undone.')) {
        await this._clearAllFavorites();
      }
    });

    // Remove individual favorites
    document.addEventListener('click', async (event) => {
      if (event.target.classList.contains('remove-favorite')) {
        const storyId = event.target.getAttribute('data-story-id');
        await this._removeFavorite(storyId);
      }
    });
  }

  async _removeFavorite(storyId) {
    try {
      await IndexedDBHelper.removeFromFavorites(storyId);
      
      // Remove from current list
      this._favorites = this._favorites.filter(fav => fav.storyId !== storyId);
      
      // Update UI
      if (this._favorites.length === 0) {
        document.getElementById('favorites-container').style.display = 'none';
        document.getElementById('empty-favorites').style.display = 'block';
      } else {
        this._renderFavorites();
      }
      
      // Update count
      const count = this._favorites.length;
      document.getElementById('favorites-count').textContent = `${count} favorite${count !== 1 ? 's' : ''}`;
      
      this._showSuccess('Favorite removed successfully');
      
    } catch (error) {
      console.error('Error removing favorite:', error);
      this._showError('Failed to remove favorite. Please try again.');
    }
  }

  async _clearAllFavorites() {
    try {
      // Remove all favorites from IndexedDB
      const promises = this._favorites.map(favorite => 
        IndexedDBHelper.removeFromFavorites(favorite.storyId)
      );
      
      await Promise.all(promises);
      
      // Update UI
      this._favorites = [];
      document.getElementById('favorites-container').style.display = 'none';
      document.getElementById('empty-favorites').style.display = 'block';
      document.getElementById('favorites-count').textContent = '0 favorites';
      
      this._showSuccess('All favorites cleared successfully');
      
    } catch (error) {
      console.error('Error clearing favorites:', error);
      this._showError('Failed to clear favorites. Please try again.');
    }
  }

  _showSuccess(message) {
    this._showNotification(message, 'success');
  }

  _showError(message) {
    this._showNotification(message, 'error');
  }

  _showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }
}