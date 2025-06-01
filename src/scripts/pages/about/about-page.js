export default class AboutPage {
  async render() {
    return `
      <div class="skip-link">
        <a href="#content" class="skip-to-content">Skip to Content</a>
      </div>
      
      <section id="content" class="about-page container">
        <h1>About StoryShare</h1>
        
        <div class="about-content">
          <article class="about-section">
            <h2>Our Mission</h2>
            <p>StoryShare is a platform for sharing your stories and experiences with the world. We believe that everyone has unique stories to tell, and we want to provide a simple way to capture and share those moments.</p>
            
            <p>Whether it's a memorable travel experience, a special event, or just a moment that made you smile, StoryShare helps you document these memories and connect with others through storytelling.</p>
          </article>
          
          <article class="about-section">
            <h2>Features</h2>
            <ul class="feature-list">
              <li>
                <span class="feature-icon">📸</span>
                <div class="feature-info">
                  <h3>Capture Photos</h3>
                  <p>Use your device's camera to capture photos directly from the app.</p>
                </div>
              </li>
              <li>
                <span class="feature-icon">📍</span>
                <div class="feature-info">
                  <h3>Location Sharing</h3>
                  <p>Add location to your stories and see where others have shared their experiences.</p>
                </div>
              </li>
              <li>
                <span class="feature-icon">🔔</span>
                <div class="feature-info">
                  <h3>Push Notifications</h3>
                  <p>Get notified when new stories are shared or when someone interacts with your story.</p>
                </div>
              </li>
              <li>
                <span class="feature-icon">🌐</span>
                <div class="feature-info">
                  <h3>Interactive Maps</h3>
                  <p>Explore stories on an interactive map and discover experiences from around the world.</p>
                </div>
              </li>
            </ul>
          </article>
          
          <article class="about-section">
            <h2>How It Works</h2>
            <ol class="steps-list">
              <li>
                <h3>Create an Account</h3>
                <p>Sign up with your email to get started.</p>
              </li>
              <li>
                <h3>Capture a Moment</h3>
                <p>Take a photo and write a description for your story.</p>
              </li>
              <li>
                <h3>Add Location (Optional)</h3>
                <p>Mark where your story took place on the map.</p>
              </li>
              <li>
                <h3>Share Your Story</h3>
                <p>Publish your story for others to see and explore.</p>
              </li>
            </ol>
          </article>
          
          <article class="about-section">
            <h2>Privacy & Security</h2>
            <p>We value your privacy and take data security seriously. Your account information is encrypted, and you have control over what you share and with whom.</p>
            
            <p>For guest accounts, your stories are shared publicly but not linked to any personal information.</p>
          </article>
          
          <article class="about-section about-footer">
            <p>StoryShare &copy; 2025 - All rights reserved</p>
            <p>This application was created as a project submission for Dicoding Indonesia.</p>
          </article>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Nothing to do after render for this page
  }
}