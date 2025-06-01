import API from '../data/api';
import Auth from '../utils/auth';

class HomePresenter {
  constructor(view) {
    this._view = view;
    this._api = API;
    this._auth = Auth;
  }

  async getAllStories() {
    try {
      if (!this._auth.isAuthenticated()) {
        this._view.showGuestMessage();
        return;
      }

      const { token } = this._auth.getAuth();
      const result = await this._api.getAllStories(token, { location: 1 });

      if (result.error) {
        this._view.showErrorMessage(result.message);
        return;
      }

      const stories = result.listStory;
      this._view.displayStories(stories);
      
      if (stories.length > 0) {
        this._view.initializeMap(stories);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      this._view.showErrorMessage('Failed to load stories. Please try again later.');
    }
  }
}

export default HomePresenter;