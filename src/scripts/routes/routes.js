import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import AddStoryPage from '../pages/stories/add-story-page';
import DetailStoryPage from '../pages/stories/detail-story-page';
import FavoritesPage from '../pages/favorites/favorites-page';
import NotFoundPage from '../pages/not-found/not-found-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/stories': new AddStoryPage(),
  '/stories/:id': new DetailStoryPage(),
  '/favorites': new FavoritesPage(),
  '/404': new NotFoundPage(),
};

export default routes;