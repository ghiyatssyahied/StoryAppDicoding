import API from '../data/api';
import Auth from '../utils/auth';

class AuthPresenter {
  constructor(view) {
    this._view = view;
    this._api = API;
    this._auth = Auth;
  }

  // Method untuk login
  async login(email, password) {
    try {
      this._view.showStatus('Logging in...', 'info');
      
      const result = await this._api.login({ email, password });
      
      if (result.error) {
        this._view.showStatus(`Login failed: ${result.message}`, 'error');
        return false;
      }
      
      // Simpan data autentikasi
      this._auth.setAuth({
        userId: result.loginResult.userId,
        name: result.loginResult.name,
        token: result.loginResult.token,
      });
      
      this._view.showStatus('Login successful! Redirecting...', 'success');
      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      this._view.showStatus('An error occurred during login. Please try again.', 'error');
      return false;
    }
  }
  
  // Method untuk register
  async register(name, email, password) {
    try {
      this._view.showStatus('Creating account...', 'info');
      
      const result = await this._api.register({ name, email, password });
      
      if (result.error) {
        this._view.showStatus(`Registration failed: ${result.message}`, 'error');
        return false;
      }
      
      this._view.showStatus('Account created successfully! Redirecting to login...', 'success');
      return true;
    } catch (error) {
      console.error('Error registering:', error);
      this._view.showStatus('An error occurred during registration. Please try again.', 'error');
      return false;
    }
  }
  
  // Memeriksa apakah sudah terotentikasi
  isAuthenticated() {
    return this._auth.isAuthenticated();
  }
}

export default AuthPresenter;