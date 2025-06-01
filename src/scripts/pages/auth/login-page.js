import AuthPresenter from '../../presenters/auth-presenter';

export default class LoginPage {
  constructor() {
    this._presenter = new AuthPresenter(this);
  }
  
  async render() {
    return `
      <div class="skip-link">
        <a href="#main-form" class="skip-to-content">Skip to Login Form</a>
      </div>
      
      <section id="login-section" class="auth-page container">
        <div class="auth-container">
          <h1>Login</h1>
          
          <form id="main-form" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Enter your email" 
                required
                autocomplete="email"
              >
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Enter your password" 
                required
                autocomplete="current-password"
                minlength="8"
              >
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-block">Login</button>
            </div>
          </form>
          
          <div id="login-status" class="auth-status" style="display: none;"></div>
          
          <div class="auth-links">
            <p>Don't have an account? <a href="#/register">Register here</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Redirect if already logged in
    if (this._presenter.isAuthenticated()) {
      window.location.hash = '#/';
      return;
    }
    
    this._initLoginForm();
  }

  _initLoginForm() {
    const form = document.getElementById('main-form');
    
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Menggunakan presenter untuk login
      const success = await this._presenter.login(email, password);
      
      if (success) {
        // Redirect after a short delay
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1500);
      }
    });
  }

  showStatus(message, type = 'info') {
    const statusContainer = document.getElementById('login-status');
    
    statusContainer.textContent = message;
    statusContainer.className = `auth-status ${type}`;
    statusContainer.style.display = 'block';
  }
}