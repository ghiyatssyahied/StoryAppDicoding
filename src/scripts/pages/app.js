import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import Auth from '../utils/auth';
import { setupSkipToContent } from '../utils/accessibility-helper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #currentPage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    this.#setupAuthNav();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  #setupAuthNav() {
    // Update the navigation based on authentication state
    const authNav = document.getElementById('auth-nav');
    
    if (authNav) {
      this.#updateAuthNav();
      
      // Add event listener for logout
      authNav.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'logout-button') {
          event.preventDefault();
          Auth.destroyAuth();
          this.#updateAuthNav();
          window.location.hash = '#/';
        }
      });
    }
  }

  #updateAuthNav() {
    const authNav = document.getElementById('auth-nav');
    
    if (!authNav) return;
    
    if (Auth.isAuthenticated()) {
      const { name } = Auth.getAuth();
      authNav.innerHTML = `
        <span class="user-greeting">Hello, ${name}</span>
        <a href="#/stories" class="nav-link">Add Story</a>
        <button id="logout-button" class="btn-logout">Logout</button>
      `;
    } else {
      authNav.innerHTML = `
        <a href="#/login" class="nav-link">Login</a>
        <a href="#/register" class="nav-link btn-register">Register</a>
      `;
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    let page = routes[url];
    
    // Handle page not found
    if (!page) {
      page = routes['/404'];
      // Update URL to 404 without adding to history
      history.replaceState(null, '', '#/404');
    }
    
    // Clean up current page if it has a destroy method
    if (this.#currentPage && typeof this.#currentPage.destroy === 'function') {
      this.#currentPage.destroy();
    }
    
    this.#currentPage = page;
    
    // Apply view transitions if supported
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        this.#updateAuthNav();
        
        // Setup skip to content accessibility
        setupSkipToContent();
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this.#updateAuthNav();
      
      // Setup skip to content accessibility
      setupSkipToContent();
    }
  }
}

export default App;