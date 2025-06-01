import StoryPresenter from '../../presenters/story-presenter';

export default class AddStoryPage {
  constructor() {
    this._initialData = {
      map: null,
      marker: null,
      mediaStream: null,
      locationData: {
        lat: null,
        lon: null,
      },
    };
    this._presenter = new StoryPresenter(this);
  }

  async render() {
    return `
      <div class="skip-link">
        <a href="#main-form" class="skip-to-content">Skip to Story Form</a>
      </div>
      
      <section id="add-story-section" class="add-story container">
        <h1>Share Your Story</h1>
        
        <form id="main-form" class="add-story-form">
          <div class="form-group">
            <label for="description">Story Description</label>
            <textarea 
              id="description" 
              name="description" 
              rows="4" 
              placeholder="Tell your story..." 
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="photo">Photo</label>
            <div class="photo-capture-container">
              <div class="camera-preview-container">
                <video id="camera-preview" class="camera-preview" autoplay></video>
                <canvas id="photo-canvas" class="photo-canvas" style="display: none;"></canvas>
                <img id="captured-photo" class="captured-photo" style="display: none;" alt="Captured photo for your story">
              </div>
              
              <div class="camera-controls">
                <button type="button" id="start-camera" class="btn btn-secondary">Open Camera</button>
                <button type="button" id="capture-photo" class="btn btn-primary" disabled>Take Photo</button>
                <button type="button" id="retry-photo" class="btn btn-secondary" style="display: none;">Retake Photo</button>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="location-map">Location (Optional)</label>
            <p class="hint-text">Click on the map to set your story's location</p>
            <div id="location-map" class="location-map"></div>
            
            <div class="location-data">
              <p id="selected-location">No location selected</p>
              <button type="button" id="clear-location" class="btn btn-text" style="display: none;">Clear Location</button>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" id="submit-story" class="btn btn-primary">Share Story</button>
            <a href="#/" class="btn btn-text">Cancel</a>
          </div>
        </form>
        
        <div id="story-submission-status" class="submission-status" style="display: none;"></div>
      </section>
    `;
  }

  async afterRender() {
    // Check authentication
    if (!this._presenter.isAuthenticated()) {
      window.location.hash = '#/login';
      return;
    }
    
    this._initMap();
    this._initCameraControls();
    this._initFormSubmission();
  }

  _initMap() {
    // Initialize map for location selection
    this._initialData.map = L.map('location-map').setView([0, 0], 2);
    
    // Add OpenStreetMap tile layer (no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._initialData.map);
    
    // Add click event to select location
    this._initialData.map.on('click', (e) => {
      this._setLocation(e.latlng.lat, e.latlng.lng);
    });
    
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this._initialData.map.setView([latitude, longitude], 13);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
    
    // Initialize clear location button
    document.getElementById('clear-location').addEventListener('click', () => {
      this._clearLocation();
    });
  }

  _setLocation(lat, lon) {
    // Store location data
    this._initialData.locationData.lat = lat;
    this._initialData.locationData.lon = lon;
    
    // Update UI
    document.getElementById('selected-location').textContent = `Selected: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    document.getElementById('clear-location').style.display = 'inline-block';
    
    // Update or create marker
    if (this._initialData.marker) {
      this._initialData.marker.setLatLng([lat, lon]);
    } else {
      this._initialData.marker = L.marker([lat, lon]).addTo(this._initialData.map);
    }
  }

  _clearLocation() {
    // Clear location data
    this._initialData.locationData.lat = null;
    this._initialData.locationData.lon = null;
    
    // Update UI
    document.getElementById('selected-location').textContent = 'No location selected';
    document.getElementById('clear-location').style.display = 'none';
    
    // Remove marker
    if (this._initialData.marker) {
      this._initialData.marker.remove();
      this._initialData.marker = null;
    }
  }

  _initCameraControls() {
    const startCameraButton = document.getElementById('start-camera');
    const capturePhotoButton = document.getElementById('capture-photo');
    const retryPhotoButton = document.getElementById('retry-photo');
    const cameraPreview = document.getElementById('camera-preview');
    const photoCanvas = document.getElementById('photo-canvas');
    const capturedPhoto = document.getElementById('captured-photo');
    
    // Start camera
    startCameraButton.addEventListener('click', async () => {
      try {
        this._initialData.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        
        cameraPreview.srcObject = this._initialData.mediaStream;
        cameraPreview.style.display = 'block';
        capturedPhoto.style.display = 'none';
        
        startCameraButton.style.display = 'none';
        capturePhotoButton.style.display = 'inline-block';
        capturePhotoButton.disabled = false;
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Could not access camera. Please make sure you have granted permission.');
      }
    });
    
    // Capture photo
    capturePhotoButton.addEventListener('click', () => {
      // Set canvas dimensions to match video
      photoCanvas.width = cameraPreview.videoWidth;
      photoCanvas.height = cameraPreview.videoHeight;
      
      // Draw video frame to canvas
      const context = photoCanvas.getContext('2d');
      context.drawImage(cameraPreview, 0, 0, photoCanvas.width, photoCanvas.height);
      
      // Convert canvas to image
      const photoDataUrl = photoCanvas.toDataURL('image/jpeg');
      capturedPhoto.src = photoDataUrl;
      
      // Update UI
      cameraPreview.style.display = 'none';
      capturedPhoto.style.display = 'block';
      capturePhotoButton.style.display = 'none';
      retryPhotoButton.style.display = 'inline-block';
      
      // Stop camera stream
      this._stopMediaStream();
    });
    
    // Retry photo
    retryPhotoButton.addEventListener('click', () => {
      // Reset UI for new photo
      capturedPhoto.style.display = 'none';
      retryPhotoButton.style.display = 'none';
      startCameraButton.style.display = 'inline-block';
    });
  }

  _stopMediaStream() {
    // Stop all tracks in the media stream
    if (this._initialData.mediaStream) {
      this._initialData.mediaStream.getTracks().forEach(track => track.stop());
      this._initialData.mediaStream = null;
    }
  }

  _initFormSubmission() {
    const form = document.getElementById('main-form');
    
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const description = document.getElementById('description').value;
      const capturedPhoto = document.getElementById('captured-photo');
      const { lat, lon } = this._initialData.locationData;
      
      // Using the presenter to add the story
      const success = await this._presenter.addNewStory(
        description,
        capturedPhoto.src,
        lat,
        lon
      );
      
      if (success) {
        // Redirect after a short delay
        setTimeout(() => {
          window.location.hash = '#/';
        }, 2000);
      }
    });
  }

  // Method for presenter to show status messages
  showStatus(message, type = 'info') {
    const statusContainer = document.getElementById('story-submission-status');
    
    statusContainer.textContent = message;
    statusContainer.className = `submission-status ${type}`;
    statusContainer.style.display = 'block';
    
    // Scroll to status message
    statusContainer.scrollIntoView({ behavior: 'smooth' });
  }
  
  // Clean up resources when page is changed
  destroy() {
    // Stop media stream if active
    this._stopMediaStream();
    
    // Remove map instance
    if (this._initialData.map) {
      this._initialData.map.remove();
      this._initialData.map = null;
    }
  }
}