# 📱 StoryShare - Progressive Web App

![StoryShare Banner](https://img.shields.io/badge/PWA-StoryShare-A0C878?style=for-the-badge&logo=pwa)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?style=flat-square)

> **Capture moments, share experiences, and connect with others through your unique stories**

StoryShare is a Progressive Web App that allows users to create, share, and discover stories with photos and location data. Built with modern web technologies, it provides a native app-like experience across all devices.

## ✨ Features

### 🌟 Core Features
- **📝 Story Creation** - Write and share your stories with rich media
- **📸 Photo Upload** - Add images to bring your stories to life
- **📍 Location Mapping** - Show where your stories happened with interactive maps
- **👤 User Authentication** - Secure login and user management
- **❤️ Story Interactions** - Like and save your favorite stories
- **🔍 Story Discovery** - Browse and explore stories from other users

### 🚀 Progressive Web App Features
- **📱 Installable** - Add to home screen on any device
- **⚡ Offline Support** - Works without internet connection
- **🔔 Push Notifications** - Get notified about new stories and interactions
- **📊 Background Sync** - Sync data when connection is restored
- **🎨 Responsive Design** - Optimized for desktop, tablet, and mobile
- **⚡ Fast Loading** - Optimized performance with caching strategies

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with responsive design
- **Vanilla JavaScript** - ES6+ features and modules
- **Leaflet.js** - Interactive maps
- **Font Awesome** - Icons and visual elements

### Build Tools
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing

### PWA Technologies
- **Service Worker** - Caching and offline functionality
- **Web App Manifest** - Installation and app metadata
- **IndexedDB** - Client-side storage
- **Push API** - Push notifications
- **Cache API** - Resource caching

### Backend Integration
- **Dicoding Story API** - RESTful API for data management
- **JWT Authentication** - Secure user authentication
- **VAPID Push** - Web push notifications

### Deployment
- **Netlify** - Static site hosting and deployment
- **HTTPS** - Secure connection required for PWA features

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **HTTPS** connection (for PWA features)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/storyshare-pwa.git
cd storyshare-pwa
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=https://story-api.dicoding.dev/v1
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```

### 6. Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
storyshare-pwa/
├── public/                 # Static assets
│   ├── images/            # App icons and images
│   ├── manifest.json      # PWA manifest
│   └── offline.html       # Offline fallback page
├── src/                   # Source code
│   ├── scripts/           # JavaScript modules
│   │   ├── data/         # API and data management
│   │   ├── pages/        # Page components
│   │   ├── presenters/   # Business logic
│   │   ├── routes/       # Routing system
│   │   └── utils/        # Utility functions
│   │       ├── auth.js                    # Authentication helper
│   │       ├── indexeddb-helper.js        # Local storage
│   │       ├── push-notification.js       # Push notifications
│   │       ├── pwa-install.js            # PWA installation
│   │       ├── sw-registration.js        # Service worker registration
│   │       └── accessibility-helper.js   # Accessibility features
│   ├── styles/           # CSS stylesheets
│   └── sw.js            # Service worker
├── dist/                # Production build output
├── netlify.toml         # Netlify deployment config
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

## 🔧 Configuration

### Service Worker Configuration
The service worker is located at `/src/sw.js` and provides:
- **App Shell Caching** - Critical resources cached for offline use
- **Dynamic Caching** - API responses cached with network-first strategy
- **Push Notification Handling** - Background push message processing
- **Background Sync** - Offline data synchronization

### PWA Manifest
The manifest file (`/public/manifest.json`) defines:
```json
{
  "name": "StoryShare - Share Your Stories",
  "short_name": "StoryShare",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#A0C878",
  "background_color": "#FFFDF6"
}
```

### Build Configuration
Vite configuration in `vite.config.js`:
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  publicDir: 'public'
})
```

## 🌐 Deployment

### Netlify Deployment
The project is configured for automatic deployment on Netlify:

1. **Connect Repository** to Netlify
2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment Variables:**
   - Set API keys and configuration in Netlify dashboard

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy dist folder to your hosting provider
# Ensure HTTPS is enabled for PWA features
```

## 📱 PWA Features

### Installation
Users can install StoryShare as a native app:
- **Desktop:** Install button in browser address bar
- **Mobile:** "Add to Home Screen" prompt
- **Manual:** Browser menu → Install option

### Offline Support
- **App Shell** loads instantly when offline
- **Cached Stories** available without connection
- **Offline Page** shown for uncached content
- **Background Sync** syncs data when online

### Push Notifications
```javascript
// Enable push notifications
PushNotificationManager.subscribe()
  .then(success => {
    if (success) {
      console.log('Push notifications enabled!');
    }
  });
```

### Performance Optimizations
- **Service Worker Caching** - Fast loading times
- **Code Splitting** - Optimized bundle sizes
- **Image Optimization** - WebP format support
- **Lazy Loading** - Resources loaded on demand

## 🧪 Testing

### PWA Testing
```bash
# Test PWA installability
npm run test:pwa

# Check service worker registration
npm run test:sw

# Validate manifest
npm run test:manifest
```

### Browser Testing
- **Chrome DevTools** - Lighthouse PWA audit
- **Application Tab** - Service worker and manifest inspection
- **Network Offline** - Test offline functionality

### Cross-Platform Testing
- **Desktop:** Chrome, Firefox, Safari, Edge
- **Mobile:** Chrome Android, Safari iOS
- **PWA Features:** Installation and offline support

## 🔒 Security

### Authentication
- **JWT Tokens** for secure API access
- **HTTPS Required** for PWA features
- **Secure Headers** configured in deployment

### Data Protection
- **Client-side Storage** encrypted where possible
- **API Security** following REST best practices
- **User Privacy** settings and data control

## 🚀 Performance

### Lighthouse Scores
- **Performance:** 95+
- **Accessibility:** 100
- **Best Practices:** 95+
- **PWA:** 100

### Optimization Techniques
- **Service Worker** caching strategies
- **Resource Minification** and compression
- **Critical CSS** inlined for faster rendering
- **Preload** critical resources

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow **ESLint** configuration
- Write **semantic HTML**
- Use **CSS custom properties**
- Add **JSDoc comments** for functions
- Test **PWA features** thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Dicoding** - For the Story API and PWA learning resources
- **Leaflet** - For the interactive mapping library
- **Font Awesome** - For the beautiful icons
- **Netlify** - For hosting and deployment services
- **Vite** - For the fast build tool and development experience

## 🔗 Links

- **🌐 Live Demo:** [https://preeminent-heliotrope-0ee544.netlify.app](https://preeminent-heliotrope-0ee544.netlify.app)
- **📱 PWA Features:** Install from browser for native app experience
- **🔔 Push Notifications:** Enable for story updates
- **📍 Location Features:** Allow location access for map functionality

---

<div align="center">

**Built with ❤️ for the web**

![PWA Compatible](https://img.shields.io/badge/PWA-Compatible-success?style=for-the-badge)
![Mobile Ready](https://img.shields.io/badge/Mobile-Ready-blue?style=for-the-badge)
![Offline Capable](https://img.shields.io/badge/Offline-Capable-orange?style=for-the-badge)

</div>
