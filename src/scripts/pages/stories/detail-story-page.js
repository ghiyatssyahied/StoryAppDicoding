import { showFormattedDate } from '../../utils/index';
import StoryPresenter from '../../presenters/story-presenter';

export default class DetailStoryPage {
  constructor() {
    this._initialData = {
      story: null,
      map: null,
    };
    this._presenter = new StoryPresenter(this);
  }

  async render() {
    return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to Story Content</a>
      </div>
      
      <section id="main-content" class="story-detail container">
        <div id="loading" class="loading-indicator">Loading story...</div>
        <div id="story-detail-content" class="story-detail-content" style="display: none;"></div>
        <div id="error-message" class="error-message" style="display: none;"></div>
      </section>
    `;
  }

  async afterRender() {
    // Get story ID from URL
    const url = window.location.hash.slice(1);
    const storyId = url.split('/')[2];
    
    // Use presenter to load story detail
    const story = await this._presenter.getStoryDetail(storyId);
    
    if (story) {
      this._initialData.story = story;
      this._renderStoryDetail();
      
      // Hide loading indicator and show content
      document.getElementById('loading').style.display = 'none';
      document.getElementById('story-detail-content').style.display = 'block';
    }
  }

  // Method to show error message
  showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-message').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
  }

  _renderStoryDetail() {
    const { story } = this._initialData;
    const contentElement = document.getElementById('story-detail-content');
    
    if (!story) return;
    
    contentElement.innerHTML = `
      <a href="#/" class="back-link">&larr; Back to Stories</a>
      
      <article class="story-full">
        <header class="story-header">
          <h1 class="story-title">${story.name}'s Story</h1>
          <p class="story-date">${showFormattedDate(story.createdAt)}</p>
        </header>
        
        <div class="story-media">
          <img src="${story.photoUrl}" alt="Story photo from ${story.name}" class="story-image-full">
          
          ${story.lat && story.lon ? `
            <div class="story-location-container">
              <h2>Location</h2>
              <div id="story-map" class="story-map-detail"></div>
            </div>
          ` : ''}
        </div>
        
        <div class="story-content-full">
          <p class="story-description-full">${story.description}</p>
        </div>
      </article>
    `;
    
    // Initialize map if story has location
    if (story.lat && story.lon) {
      this._initMap(story.lat, story.lon);
    }
  }

  _initMap(lat, lon) {
    // Initialize map
    this._initialData.map = L.map('story-map').setView([lat, lon], 13);
    
    // Add OpenStreetMap tile layer (no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._initialData.map);
    
    // Add marker for story location
    L.marker([lat, lon])
      .addTo(this._initialData.map)
      .bindPopup(`<b>${this._initialData.story.name}'s story location</b>`)
      .openPopup();
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