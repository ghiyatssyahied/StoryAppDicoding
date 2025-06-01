export default class NotFoundPage {
    async render() {
      return `
        <div class="skip-link">
          <a href="#main-content" class="skip-to-content">Skip to Content</a>
        </div>
        
        <main id="main-content" class="not-found-page container">
          <div class="not-found-icon">🔍</div>
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.</p>
          
          <div class="not-found-actions">
            <a href="#/" class="btn btn-primary">
              <i class="fa-solid fa-house"></i> Go Home
            </a>
            <a href="#/stories" class="btn btn-secondary">
              <i class="fa-solid fa-plus"></i> Add Story
            </a>
            <button onclick="history.back()" class="btn btn-text">
              <i class="fa-solid fa-arrow-left"></i> Go Back
            </button>
          </div>
          
          <div class="not-found-suggestions">
            <h3>Popular Pages:</h3>
            <ul class="suggestions-list">
              <li><a href="#/">🏠 Home - Browse all stories</a></li>
              <li><a href="#/favorites">💝 Favorites - Your saved stories</a></li>
              <li><a href="#/about">ℹ️ About - Learn more about StoryShare</a></li>
            </ul>
          </div>
        </main>
      `;
    }
  
    async afterRender() {
      // Log 404 error for analytics (if implemented)
      console.log('404 Error:', window.location.hash);
      
      // Update page title
      document.title = '404 - Page Not Found | StoryShare';
    }
  }