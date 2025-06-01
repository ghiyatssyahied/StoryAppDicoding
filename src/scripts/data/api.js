import CONFIG from '../config';

const API = {
  // Auth endpoints
  async register({ name, email, password }) {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });
    
    return await response.json();
  },
  
  async login({ email, password }) {
    const response = await fetch(`${CONFIG.BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    
    return await response.json();
  },
  
  // Story endpoints
  async getAllStories(token, { page, size, location = 0 } = {}) {
    let url = `${CONFIG.BASE_URL}/stories`;
    const queryParams = [];
    
    if (page) queryParams.push(`page=${page}`);
    if (size) queryParams.push(`size=${size}`);
    if (location) queryParams.push(`location=${location}`);
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return await response.json();
  },
  
  async getStoryDetail(token, id) {
    const response = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return await response.json();
  },
  
  async addNewStory({ token, description, photo, lat, lon }) {
    const formData = new FormData();
    
    formData.append('description', description);
    formData.append('photo', photo);
    
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);
    
    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    return await response.json();
  },
  
  async addNewStoryAsGuest({ description, photo, lat, lon }) {
    const formData = new FormData();
    
    formData.append('description', description);
    formData.append('photo', photo);
    
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);
    
    const response = await fetch(`${CONFIG.BASE_URL}/stories/guest`, {
      method: 'POST',
      body: formData,
    });
    
    return await response.json();
  },
  
  // Push notification endpoints
  async subscribePushNotification(token, subscription) {
    const response = await fetch(`${CONFIG.PUSH_MSG_SUBSCRIBE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });
    
    return await response.json();
  },
  
  async unsubscribePushNotification(token, endpoint) {
    const response = await fetch(`${CONFIG.PUSH_MSG_UNSUBSCRIBE_URL}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });
    
    return await response.json();
  },
};

export default API;