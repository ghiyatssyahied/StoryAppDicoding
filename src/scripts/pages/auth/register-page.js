import AuthPresenter from '../../presenters/auth-presenter';

export default class RegisterPage {
  constructor() {
    this._presenter = new AuthPresenter(this);
  }

  async render() {
    return `
      <div class="skip-link">
        <a href="#main-form" class="skip-to-content">Skip to Registration Form</a>
      </div>
      
      <section id="register-section" class="auth-page container">
        <div class="auth-container">
          <h1>Create Account</h1>
          
          <form id="main-form" class="auth-form">
            <div class="form-group">
              <label for="name">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Enter your name" 
                required
                autocomplete="name"
              >
            </div>
            
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
                placeholder="Enter your password (min. 8 characters)" 
                required
                autocomplete="new-password"
                minlength="8"
              >
              <p class="password-hint">Password must be at least 8 characters long</p>
            </div>
            
            <div class="form-group">
              <label for="confirm-password">Confirm Password</label>
              <input 
                type="password" 
                id="confirm-password" 
                name="confirm-password" 
                placeholder="Confirm your password" 
                required
                autocomplete="new-password"
                minlength="8"
              >
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-block">Register</button>
            </div>
          </form>
          
          <div id="register-status" class="auth-status" style="display: none;"></div>
          
          <div class="auth-links">
            <p>Already have an account? <a href="#/login">Login here</a></p>
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
    
    this._initRegisterForm();
  }

  _initRegisterForm() {
    const form = document.getElementById('main-form');
    
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Validate password match
      if (password !== confirmPassword) {
        this.showStatus('Passwords do not match', 'error');
        return;
      }
      
      // Menggunakan presenter untuk register
      const success = await this._presenter.register(name, email, password);
      
      if (success) {
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 2000);
      }
    });
  }

  showStatus(message, type = 'info') {
    const statusContainer = document.getElementById('register-status');
    
    statusContainer.textContent = message;
    statusContainer.className = `auth-status ${type}`;
    statusContainer.style.display = 'block';
  }
}