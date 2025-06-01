var I=i=>{throw TypeError(i)};var D=(i,t,o)=>t.has(i)||I("Cannot "+o);var l=(i,t,o)=>(D(i,t,"read from private field"),o?o.call(i):t.get(i)),g=(i,t,o)=>t.has(i)?I("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(i):t.set(i,o),w=(i,t,o,e)=>(D(i,t,"write to private field"),e?e.call(i,o):t.set(i,o),o),f=(i,t,o)=>(D(i,t,"access private method"),o);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))e(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&e(a)}).observe(document,{childList:!0,subtree:!0});function o(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function e(s){if(s.ep)return;s.ep=!0;const r=o(s);fetch(s.href,r)}})();const k="auth",c={setAuth({userId:i,name:t,token:o}){localStorage.setItem(k,JSON.stringify({userId:i,name:t,token:o}))},getAuth(){return JSON.parse(localStorage.getItem(k)||"{}")},destroyAuth(){localStorage.removeItem(k)},isAuthenticated(){return!!this.getAuth().token}};function C(i,t="en-US",o={}){return new Date(i).toLocaleDateString(t,{year:"numeric",month:"long",day:"numeric",...o})}async function $(i){return await(await fetch(i)).blob()}function x(i){const t="=".repeat((4-i.length%4)%4),o=(i+t).replace(/-/g,"+").replace(/_/g,"/"),e=window.atob(o),s=new Uint8Array(e.length);for(let r=0;r<e.length;++r)s[r]=e.charCodeAt(r);return s}const d={BASE_URL:"https://story-api.dicoding.dev/v1",DEFAULT_LANGUAGE:"id",CACHE_NAME:"StoryApp-V1",PUSH_MSG_VAPID_PUBLIC_KEY:"BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk",PUSH_MSG_SUBSCRIBE_URL:"https://story-api.dicoding.dev/v1/notifications/subscribe",PUSH_MSG_UNSUBSCRIBE_URL:"https://story-api.dicoding.dev/v1/notifications/subscribe"},E={async register({name:i,email:t,password:o}){return await(await fetch(`${d.BASE_URL}/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:i,email:t,password:o})})).json()},async login({email:i,password:t}){return await(await fetch(`${d.BASE_URL}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:i,password:t})})).json()},async getAllStories(i,{page:t,size:o,location:e=0}={}){let s=`${d.BASE_URL}/stories`;const r=[];return t&&r.push(`page=${t}`),o&&r.push(`size=${o}`),e&&r.push(`location=${e}`),r.length>0&&(s+=`?${r.join("&")}`),await(await fetch(s,{headers:{Authorization:`Bearer ${i}`}})).json()},async getStoryDetail(i,t){return await(await fetch(`${d.BASE_URL}/stories/${t}`,{headers:{Authorization:`Bearer ${i}`}})).json()},async addNewStory({token:i,description:t,photo:o,lat:e,lon:s}){const r=new FormData;return r.append("description",t),r.append("photo",o),e&&r.append("lat",e),s&&r.append("lon",s),await(await fetch(`${d.BASE_URL}/stories`,{method:"POST",headers:{Authorization:`Bearer ${i}`},body:r})).json()},async addNewStoryAsGuest({description:i,photo:t,lat:o,lon:e}){const s=new FormData;return s.append("description",i),s.append("photo",t),o&&s.append("lat",o),e&&s.append("lon",e),await(await fetch(`${d.BASE_URL}/stories/guest`,{method:"POST",body:s})).json()},async subscribePushNotification(i,t){return await(await fetch(`${d.PUSH_MSG_SUBSCRIBE_URL}`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${i}`},body:JSON.stringify(t)})).json()},async unsubscribePushNotification(i,t){return await(await fetch(`${d.PUSH_MSG_UNSUBSCRIBE_URL}`,{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${i}`},body:JSON.stringify({endpoint:t})})).json()}};class T{constructor(t){this._view=t,this._api=E,this._auth=c}async getAllStories(){try{if(!this._auth.isAuthenticated()){this._view.showGuestMessage();return}const{token:t}=this._auth.getAuth(),o=await this._api.getAllStories(t,{location:1});if(o.error){this._view.showErrorMessage(o.message);return}const e=o.listStory;this._view.displayStories(e),e.length>0&&this._view.initializeMap(e)}catch(t){console.error("Error loading stories:",t),this._view.showErrorMessage("Failed to load stories. Please try again later.")}}}class q{constructor(){this.dbName=d.DATABASE_NAME||"story-app-database",this.dbVersion=d.DATABASE_VERSION||1,this.objectStoreName=d.OBJECT_STORE_NAME||"stories",this.db=null}async openDatabase(){return new Promise((t,o)=>{const e=indexedDB.open(this.dbName,this.dbVersion);e.onerror=()=>{console.error("Error opening database:",e.error),o(e.error)},e.onsuccess=()=>{this.db=e.result,console.log("Database opened successfully"),t(this.db)},e.onupgradeneeded=s=>{const r=s.target.result;if(console.log("Upgrading database..."),!r.objectStoreNames.contains(this.objectStoreName)){const a=r.createObjectStore(this.objectStoreName,{keyPath:"id",autoIncrement:!0});a.createIndex("createdAt","createdAt",{unique:!1}),a.createIndex("name","name",{unique:!1}),a.createIndex("synced","synced",{unique:!1}),console.log("Object store created successfully")}if(!r.objectStoreNames.contains("offline_stories")){const a=r.createObjectStore("offline_stories",{keyPath:"tempId",autoIncrement:!0});a.createIndex("createdAt","createdAt",{unique:!1}),a.createIndex("synced","synced",{unique:!1}),console.log("Offline stories object store created")}r.objectStoreNames.contains("favorites")||(r.createObjectStore("favorites",{keyPath:"storyId"}).createIndex("addedAt","addedAt",{unique:!1}),console.log("Favorites object store created"))}})}async ensureDbOpen(){return this.db||await this.openDatabase(),this.db}async saveStory(t){try{await this.ensureDbOpen();const e=this.db.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName),s={...t,savedAt:new Date().toISOString(),synced:!0},r=e.put(s);return new Promise((a,n)=>{r.onsuccess=()=>{console.log("Story saved to IndexedDB:",r.result),a(r.result)},r.onerror=()=>{console.error("Error saving story:",r.error),n(r.error)}})}catch(o){throw console.error("Error in saveStory:",o),o}}async getAllStories(){try{await this.ensureDbOpen();const e=this.db.transaction([this.objectStoreName],"readonly").objectStore(this.objectStoreName).getAll();return new Promise((s,r)=>{e.onsuccess=()=>{console.log("Retrieved stories from IndexedDB:",e.result.length),s(e.result)},e.onerror=()=>{console.error("Error getting stories:",e.error),r(e.error)}})}catch(t){throw console.error("Error in getAllStories:",t),t}}async getStoryById(t){try{await this.ensureDbOpen();const s=this.db.transaction([this.objectStoreName],"readonly").objectStore(this.objectStoreName).get(t);return new Promise((r,a)=>{s.onsuccess=()=>{r(s.result)},s.onerror=()=>{console.error("Error getting story by ID:",s.error),a(s.error)}})}catch(o){throw console.error("Error in getStoryById:",o),o}}async deleteStory(t){try{await this.ensureDbOpen();const s=this.db.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName).delete(t);return new Promise((r,a)=>{s.onsuccess=()=>{console.log("Story deleted from IndexedDB:",t),r(!0)},s.onerror=()=>{console.error("Error deleting story:",s.error),a(s.error)}})}catch(o){throw console.error("Error in deleteStory:",o),o}}async saveMultipleStories(t){try{await this.ensureDbOpen();const e=this.db.transaction([this.objectStoreName],"readwrite").objectStore(this.objectStoreName),s=t.map(a=>{const n={...a,savedAt:new Date().toISOString(),synced:!0};return new Promise((p,M)=>{const A=e.put(n);A.onsuccess=()=>p(A.result),A.onerror=()=>M(A.error)})}),r=await Promise.all(s);return console.log("Multiple stories saved to IndexedDB:",r.length),r}catch(o){throw console.error("Error in saveMultipleStories:",o),o}}async saveOfflineStory(t){try{await this.ensureDbOpen();const e=this.db.transaction(["offline_stories"],"readwrite").objectStore("offline_stories"),s={...t,createdAt:new Date().toISOString(),synced:!1},r=e.add(s);return new Promise((a,n)=>{r.onsuccess=()=>{console.log("Offline story saved:",r.result),a(r.result)},r.onerror=()=>{console.error("Error saving offline story:",r.error),n(r.error)}})}catch(o){throw console.error("Error in saveOfflineStory:",o),o}}async getOfflineStories(){try{await this.ensureDbOpen();const e=this.db.transaction(["offline_stories"],"readonly").objectStore("offline_stories").getAll();return new Promise((s,r)=>{e.onsuccess=()=>{s(e.result)},e.onerror=()=>{console.error("Error getting offline stories:",e.error),r(e.error)}})}catch(t){throw console.error("Error in getOfflineStories:",t),t}}async deleteOfflineStory(t){try{await this.ensureDbOpen();const s=this.db.transaction(["offline_stories"],"readwrite").objectStore("offline_stories").delete(t);return new Promise((r,a)=>{s.onsuccess=()=>{console.log("Offline story deleted:",t),r(!0)},s.onerror=()=>{console.error("Error deleting offline story:",s.error),a(s.error)}})}catch(o){throw console.error("Error in deleteOfflineStory:",o),o}}async addToFavorites(t,o){try{await this.ensureDbOpen();const s=this.db.transaction(["favorites"],"readwrite").objectStore("favorites"),r={storyId:t,...o,addedAt:new Date().toISOString()},a=s.put(r);return new Promise((n,p)=>{a.onsuccess=()=>{console.log("Added to favorites:",t),n(a.result)},a.onerror=()=>{console.error("Error adding to favorites:",a.error),p(a.error)}})}catch(e){throw console.error("Error in addToFavorites:",e),e}}async removeFromFavorites(t){try{await this.ensureDbOpen();const s=this.db.transaction(["favorites"],"readwrite").objectStore("favorites").delete(t);return new Promise((r,a)=>{s.onsuccess=()=>{console.log("Removed from favorites:",t),r(!0)},s.onerror=()=>{console.error("Error removing from favorites:",s.error),a(s.error)}})}catch(o){throw console.error("Error in removeFromFavorites:",o),o}}async getFavorites(){try{await this.ensureDbOpen();const e=this.db.transaction(["favorites"],"readonly").objectStore("favorites").getAll();return new Promise((s,r)=>{e.onsuccess=()=>{s(e.result)},e.onerror=()=>{console.error("Error getting favorites:",e.error),r(e.error)}})}catch(t){throw console.error("Error in getFavorites:",t),t}}async isFavorite(t){try{await this.ensureDbOpen();const s=this.db.transaction(["favorites"],"readonly").objectStore("favorites").get(t);return new Promise((r,a)=>{s.onsuccess=()=>{r(!!s.result)},s.onerror=()=>{console.error("Error checking favorite status:",s.error),a(s.error)}})}catch(o){return console.error("Error in isFavorite:",o),!1}}async clearAllData(){try{await this.ensureDbOpen();const t=["stories","offline_stories","favorites"],o=this.db.transaction(t,"readwrite"),e=t.map(s=>new Promise((r,a)=>{const p=o.objectStore(s).clear();p.onsuccess=()=>r(),p.onerror=()=>a(p.error)}));return await Promise.all(e),console.log("All IndexedDB data cleared"),!0}catch(t){throw console.error("Error clearing data:",t),t}}async getDatabaseInfo(){try{await this.ensureDbOpen();const t=await this.getStoriesCount(),o=await this.getOfflineStoriesCount(),e=await this.getFavoritesCount();return{storiesCount:t,offlineStoriesCount:o,favoritesCount:e,totalCount:t+o+e}}catch(t){return console.error("Error getting database info:",t),{storiesCount:0,offlineStoriesCount:0,favoritesCount:0,totalCount:0}}}async getStoriesCount(){try{await this.ensureDbOpen();const e=this.db.transaction([this.objectStoreName],"readonly").objectStore(this.objectStoreName).count();return new Promise((s,r)=>{e.onsuccess=()=>s(e.result),e.onerror=()=>r(e.error)})}catch(t){return console.error("Error getting stories count:",t),0}}async getOfflineStoriesCount(){try{await this.ensureDbOpen();const e=this.db.transaction(["offline_stories"],"readonly").objectStore("offline_stories").count();return new Promise((s,r)=>{e.onsuccess=()=>s(e.result),e.onerror=()=>r(e.error)})}catch(t){return console.error("Error getting offline stories count:",t),0}}async getFavoritesCount(){try{await this.ensureDbOpen();const e=this.db.transaction(["favorites"],"readonly").objectStore("favorites").count();return new Promise((s,r)=>{e.onsuccess=()=>s(e.result),e.onerror=()=>r(e.error)})}catch(t){return console.error("Error getting favorites count:",t),0}}}const h=new q;class R{constructor(){this._initialData={stories:[],map:null,markers:[]},this._presenter=new T(this)}async render(){return`
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to Content</a>
      </div>
      
      <section class="hero">
        <div class="container">
          <h1>Share Your Stories</h1>
          <p>Capture moments, share experiences, and connect with others through your unique stories</p>
          ${c.isAuthenticated()?'<a href="#/stories" class="btn btn-primary">Share New Story</a>':'<a href="#/login" class="btn btn-primary">Login to Share</a>'}
        </div>
      </section>
      
      <main id="main-content" class="story-list container">
        <h2>Recent Stories</h2>
        <div class="story-map-container">
          <div id="story-map" class="story-map"></div>
        </div>
        
        <div id="stories" class="stories-grid">
          <!-- Story items will be rendered here -->
          <div class="loading-indicator">Loading stories...</div>
        </div>
      </main>
    `}async afterRender(){await this._presenter.getAllStories()}showGuestMessage(){const t=document.querySelector("#stories");t.innerHTML=`
      <div class="guest-message">
        <p>Login to see stories with locations</p>
        <a href="#/login" class="btn btn-secondary">Login</a>
      </div>
    `}showErrorMessage(t){const o=document.querySelector("#stories");o.innerHTML=`<div class="error-message">${t}</div>`}displayStories(t){this._initialData.stories=t,this._renderStories()}initializeMap(t){if(!document.getElementById("story-map"))return;this._initialData.map=L.map("story-map").setView([0,0],2);const e=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}),s=L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",{attribution:'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:16}),r=L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png",{attribution:'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:18});e.addTo(this._initialData.map);const a={OpenStreetMap:e,Watercolor:s,Toner:r};L.control.layers(a).addTo(this._initialData.map),this._addStoryMarkers()}_addStoryMarkers(){this._clearMarkers();const t=this._initialData.stories.filter(e=>e.lat&&e.lon);if(t.length===0)return;const o=L.latLngBounds();t.forEach(e=>{const s=L.marker([e.lat,e.lon]).addTo(this._initialData.map);s.bindPopup(`
        <div class="map-popup">
          <img src="${e.photoUrl}" alt="Story from ${e.name}" class="popup-img">
          <h3>${e.name}</h3>
          <p>${e.description.substring(0,50)}${e.description.length>50?"...":""}</p>
          <a href="#/stories/${e.id}" class="popup-link">View Story</a>
        </div>
      `),this._initialData.markers.push(s),o.extend([e.lat,e.lon])}),this._initialData.map.fitBounds(o,{padding:[50,50]})}_clearMarkers(){this._initialData.markers.forEach(t=>{this._initialData.map&&t.remove()}),this._initialData.markers=[]}_renderStories(){const t=document.querySelector("#stories");if(this._initialData.stories.length===0){t.innerHTML=`
        <div class="empty-state">
          <p>No stories available yet</p>
          <a href="#/stories" class="btn btn-primary">Be the first to share!</a>
        </div>
      `;return}const o=document.createDocumentFragment();this._initialData.stories.forEach(e=>{const s=document.createElement("article");s.classList.add("story-item"),s.innerHTML=`
        <a href="#/stories/${e.id}" class="story-link">
          <div class="story-image-container">
            <img src="${e.photoUrl}" alt="Story from ${e.name}" class="story-image">
          </div>
          <div class="story-content">
            <h3 class="story-title">${e.name}</h3>
            <p class="story-date">${C(e.createdAt)}</p>
            <p class="story-description">${e.description.substring(0,100)}${e.description.length>100?"...":""}</p>
            ${e.lat&&e.lon?'<p class="story-location"><i class="location-icon">📍</i> Location attached</p>':""}
          </div>
        </a>
        
        <div class="story-item-actions">
          <button class="btn-favorite-small" data-story-id="${e.id}" onclick="event.preventDefault(); window.toggleStoryFavorite('${e.id}', this)">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>
      `,o.appendChild(s)}),t.innerHTML="",t.appendChild(o),this._setupFavoriteButtons()}async _setupFavoriteButtons(){const t=document.querySelectorAll(".btn-favorite-small");for(const o of t){const e=o.getAttribute("data-story-id");await h.isFavorite(e)&&(o.classList.add("active"),o.querySelector("i").className="fa-solid fa-heart")}window.toggleStoryFavorite=async(o,e)=>{try{const s=this._initialData.stories.find(a=>a.id===o);await h.isFavorite(o)?(await h.removeFromFavorites(o),e.classList.remove("active"),e.querySelector("i").className="fa-regular fa-heart",this._showNotification("Removed from favorites","success")):(await h.addToFavorites(o,s),e.classList.add("active"),e.querySelector("i").className="fa-solid fa-heart",this._showNotification("Added to favorites","success"))}catch(s){console.error("Error toggling favorite:",s),this._showNotification("Failed to update favorites","error")}}}_showNotification(t,o){const e=document.createElement("div");e.className=`notification notification-${o}`,e.textContent=t,document.body.appendChild(e),setTimeout(()=>{document.body.contains(e)&&document.body.removeChild(e)},3e3)}destroy(){this._initialData.map&&(this._initialData.map.remove(),this._initialData.map=null)}}class U{async render(){return`
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
    `}async afterRender(){}}class N{constructor(t){this._view=t,this._api=E,this._auth=c}async login(t,o){try{this._view.showStatus("Logging in...","info");const e=await this._api.login({email:t,password:o});return e.error?(this._view.showStatus(`Login failed: ${e.message}`,"error"),!1):(this._auth.setAuth({userId:e.loginResult.userId,name:e.loginResult.name,token:e.loginResult.token}),this._view.showStatus("Login successful! Redirecting...","success"),!0)}catch(e){return console.error("Error logging in:",e),this._view.showStatus("An error occurred during login. Please try again.","error"),!1}}async register(t,o,e){try{this._view.showStatus("Creating account...","info");const s=await this._api.register({name:t,email:o,password:e});return s.error?(this._view.showStatus(`Registration failed: ${s.message}`,"error"),!1):(this._view.showStatus("Account created successfully! Redirecting to login...","success"),!0)}catch(s){return console.error("Error registering:",s),this._view.showStatus("An error occurred during registration. Please try again.","error"),!1}}isAuthenticated(){return this._auth.isAuthenticated()}}class H{constructor(){this._presenter=new N(this)}async render(){return`
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
    `}async afterRender(){if(this._presenter.isAuthenticated()){window.location.hash="#/";return}this._initLoginForm()}_initLoginForm(){document.getElementById("main-form").addEventListener("submit",async o=>{o.preventDefault();const e=document.getElementById("email").value,s=document.getElementById("password").value;await this._presenter.login(e,s)&&setTimeout(()=>{window.location.hash="#/"},1500)})}showStatus(t,o="info"){const e=document.getElementById("login-status");e.textContent=t,e.className=`auth-status ${o}`,e.style.display="block"}}class W{constructor(){this._presenter=new N(this)}async render(){return`
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
    `}async afterRender(){if(this._presenter.isAuthenticated()){window.location.hash="#/";return}this._initRegisterForm()}_initRegisterForm(){document.getElementById("main-form").addEventListener("submit",async o=>{o.preventDefault();const e=document.getElementById("name").value,s=document.getElementById("email").value,r=document.getElementById("password").value,a=document.getElementById("confirm-password").value;if(r!==a){this.showStatus("Passwords do not match","error");return}await this._presenter.register(e,s,r)&&setTimeout(()=>{window.location.hash="#/login"},2e3)})}showStatus(t,o="info"){const e=document.getElementById("register-status");e.textContent=t,e.className=`auth-status ${o}`,e.style.display="block"}}class j{constructor(t){this._view=t,this._api=E,this._auth=c}async getStoryDetail(t){try{if(!t)return this._view.showError("Story ID not found"),null;if(!this._auth.isAuthenticated())return this._view.showError("Please login to view story details"),null;const{token:o}=this._auth.getAuth(),e=await this._api.getStoryDetail(o,t);return e.error?(this._view.showError(e.message||"Failed to load story"),null):e.story}catch(o){return console.error("Error loading story detail:",o),this._view.showError("An error occurred while loading the story"),null}}async addNewStory(t,o,e,s){try{if(!t)return this._view.showStatus("Please enter a description for your story.","error"),!1;if(!o)return this._view.showStatus("Please take a photo for your story.","error"),!1;const r=await $(o),{token:a}=this._auth.getAuth(),n=await this._api.addNewStory({token:a,description:t,photo:r,lat:e,lon:s});return n.error?(this._view.showStatus(`Failed to share story: ${n.message}`,"error"),!1):(this._view.showStatus("Story shared successfully! Redirecting...","success"),this._registerPushNotification(a),!0)}catch(r){return console.error("Error submitting story:",r),this._view.showStatus("An error occurred while sharing your story. Please try again.","error"),!1}}isAuthenticated(){return this._auth.isAuthenticated()}async _registerPushNotification(t){if(!("PushManager"in window)){console.log("Push notification not supported");return}try{if(await Notification.requestPermission()!=="granted")return;navigator.serviceWorker.controller||await navigator.serviceWorker.register("/sw.js");const s=await(await navigator.serviceWorker.ready).pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:x(d.PUSH_MSG_VAPID_PUBLIC_KEY)});await this._api.subscribePushNotification(t,{endpoint:s.endpoint,keys:{p256dh:btoa(String.fromCharCode.apply(null,new Uint8Array(s.getKey("p256dh")))),auth:btoa(String.fromCharCode.apply(null,new Uint8Array(s.getKey("auth"))))}})}catch(o){console.error("Error registering push notification:",o)}}}class z{constructor(){this._initialData={map:null,marker:null,mediaStream:null,locationData:{lat:null,lon:null}},this._presenter=new j(this)}async render(){return`
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
    `}async afterRender(){if(!this._presenter.isAuthenticated()){window.location.hash="#/login";return}this._initMap(),this._initCameraControls(),this._initFormSubmission()}_initMap(){this._initialData.map=L.map("location-map").setView([0,0],2),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this._initialData.map),this._initialData.map.on("click",t=>{this._setLocation(t.latlng.lat,t.latlng.lng)}),navigator.geolocation&&navigator.geolocation.getCurrentPosition(t=>{const{latitude:o,longitude:e}=t.coords;this._initialData.map.setView([o,e],13)},t=>{console.error("Error getting location:",t)}),document.getElementById("clear-location").addEventListener("click",()=>{this._clearLocation()})}_setLocation(t,o){this._initialData.locationData.lat=t,this._initialData.locationData.lon=o,document.getElementById("selected-location").textContent=`Selected: ${t.toFixed(6)}, ${o.toFixed(6)}`,document.getElementById("clear-location").style.display="inline-block",this._initialData.marker?this._initialData.marker.setLatLng([t,o]):this._initialData.marker=L.marker([t,o]).addTo(this._initialData.map)}_clearLocation(){this._initialData.locationData.lat=null,this._initialData.locationData.lon=null,document.getElementById("selected-location").textContent="No location selected",document.getElementById("clear-location").style.display="none",this._initialData.marker&&(this._initialData.marker.remove(),this._initialData.marker=null)}_initCameraControls(){const t=document.getElementById("start-camera"),o=document.getElementById("capture-photo"),e=document.getElementById("retry-photo"),s=document.getElementById("camera-preview"),r=document.getElementById("photo-canvas"),a=document.getElementById("captured-photo");t.addEventListener("click",async()=>{try{this._initialData.mediaStream=await navigator.mediaDevices.getUserMedia({video:!0,audio:!1}),s.srcObject=this._initialData.mediaStream,s.style.display="block",a.style.display="none",t.style.display="none",o.style.display="inline-block",o.disabled=!1}catch(n){console.error("Error accessing camera:",n),alert("Could not access camera. Please make sure you have granted permission.")}}),o.addEventListener("click",()=>{r.width=s.videoWidth,r.height=s.videoHeight,r.getContext("2d").drawImage(s,0,0,r.width,r.height);const p=r.toDataURL("image/jpeg");a.src=p,s.style.display="none",a.style.display="block",o.style.display="none",e.style.display="inline-block",this._stopMediaStream()}),e.addEventListener("click",()=>{a.style.display="none",e.style.display="none",t.style.display="inline-block"})}_stopMediaStream(){this._initialData.mediaStream&&(this._initialData.mediaStream.getTracks().forEach(t=>t.stop()),this._initialData.mediaStream=null)}_initFormSubmission(){document.getElementById("main-form").addEventListener("submit",async o=>{o.preventDefault();const e=document.getElementById("description").value,s=document.getElementById("captured-photo"),{lat:r,lon:a}=this._initialData.locationData;await this._presenter.addNewStory(e,s.src,r,a)&&setTimeout(()=>{window.location.hash="#/"},2e3)})}showStatus(t,o="info"){const e=document.getElementById("story-submission-status");e.textContent=t,e.className=`submission-status ${o}`,e.style.display="block",e.scrollIntoView({behavior:"smooth"})}destroy(){this._stopMediaStream(),this._initialData.map&&(this._initialData.map.remove(),this._initialData.map=null)}}class V{constructor(){this._initialData={story:null,map:null},this._presenter=new j(this)}async render(){return`
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to Story Content</a>
      </div>
      
      <section id="main-content" class="story-detail container">
        <div id="loading" class="loading-indicator">Loading story...</div>
        <div id="story-detail-content" class="story-detail-content" style="display: none;"></div>
        <div id="error-message" class="error-message" style="display: none;"></div>
      </section>
    `}async afterRender(){const o=window.location.hash.slice(1).split("/")[2],e=await this._presenter.getStoryDetail(o);e&&(this._initialData.story=e,this._renderStoryDetail(),document.getElementById("loading").style.display="none",document.getElementById("story-detail-content").style.display="block")}showError(t){document.getElementById("error-message").textContent=t,document.getElementById("error-message").style.display="block",document.getElementById("loading").style.display="none"}_renderStoryDetail(){const{story:t}=this._initialData,o=document.getElementById("story-detail-content");t&&(o.innerHTML=`
      <a href="#/" class="back-link">&larr; Back to Stories</a>
      
      <article class="story-full">
        <header class="story-header">
          <h1 class="story-title">${t.name}'s Story</h1>
          <p class="story-date">${C(t.createdAt)}</p>
        </header>
        
        <div class="story-media">
          <img src="${t.photoUrl}" alt="Story photo from ${t.name}" class="story-image-full">
          
          ${t.lat&&t.lon?`
            <div class="story-location-container">
              <h2>Location</h2>
              <div id="story-map" class="story-map-detail"></div>
            </div>
          `:""}
        </div>
        
        <div class="story-content-full">
          <p class="story-description-full">${t.description}</p>
        </div>
      </article>
    `,t.lat&&t.lon&&this._initMap(t.lat,t.lon))}_initMap(t,o){this._initialData.map=L.map("story-map").setView([t,o],13),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this._initialData.map),L.marker([t,o]).addTo(this._initialData.map).bindPopup(`<b>${this._initialData.story.name}'s story location</b>`).openPopup()}destroy(){this._initialData.map&&(this._initialData.map.remove(),this._initialData.map=null)}}class G{constructor(){this._favorites=[]}async render(){return`
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to Content</a>
      </div>
      
      <main id="main-content" class="favorites-page container">
        <header class="page-header">
          <h1>My Favorite Stories</h1>
          <p>Stories you've saved for offline reading</p>
        </header>
        
        <div class="favorites-actions">
          <button id="clear-favorites" class="btn btn-secondary">Clear All Favorites</button>
          <span id="favorites-count" class="favorites-count">0 favorites</span>
        </div>
        
        <div id="favorites-container" class="favorites-container">
          <div class="loading-indicator">Loading favorites...</div>
        </div>
        
        <div id="empty-favorites" class="empty-state" style="display: none;">
          <div class="empty-icon">💝</div>
          <h2>No Favorites Yet</h2>
          <p>Start exploring stories and add them to your favorites for offline access!</p>
          <a href="#/" class="btn btn-primary">Browse Stories</a>
        </div>
      </main>
    `}async afterRender(){if(!c.isAuthenticated()){window.location.hash="#/login";return}await this._loadFavorites(),this._setupEventListeners()}async _loadFavorites(){try{const t=document.getElementById("favorites-container"),o=document.getElementById("empty-favorites"),e=document.getElementById("favorites-count");this._favorites=await h.getFavorites();const s=this._favorites.length;if(e.textContent=`${s} favorite${s!==1?"s":""}`,this._favorites.length===0){t.style.display="none",o.style.display="block";return}this._renderFavorites(),t.style.display="block",o.style.display="none"}catch(t){console.error("Error loading favorites:",t),this._showError("Failed to load favorites. Please try again.")}}_renderFavorites(){const t=document.getElementById("favorites-container"),o=this._favorites.map(e=>{var s,r;return`
      <article class="favorite-item" data-story-id="${e.storyId}">
        <div class="favorite-content">
          <div class="favorite-image-container">
            <img src="${e.photoUrl}" alt="Story from ${e.name}" class="favorite-image">
          </div>
          
          <div class="favorite-details">
            <h3 class="favorite-title">${e.name}'s Story</h3>
            <p class="favorite-date">Added: ${C(e.addedAt)}</p>
            <p class="favorite-description">${(s=e.description)==null?void 0:s.substring(0,150)}${((r=e.description)==null?void 0:r.length)>150?"...":""}</p>
            
            <div class="favorite-actions">
              <a href="#/stories/${e.storyId}" class="btn btn-primary btn-sm">View Story</a>
              <button class="btn btn-secondary btn-sm remove-favorite" data-story-id="${e.storyId}">
                Remove
              </button>
            </div>
          </div>
        </div>
      </article>
    `}).join("");t.innerHTML=`
      <div class="favorites-grid">
        ${o}
      </div>
    `}_setupEventListeners(){document.getElementById("clear-favorites").addEventListener("click",async()=>{confirm("Are you sure you want to remove all favorites? This action cannot be undone.")&&await this._clearAllFavorites()}),document.addEventListener("click",async o=>{if(o.target.classList.contains("remove-favorite")){const e=o.target.getAttribute("data-story-id");await this._removeFavorite(e)}})}async _removeFavorite(t){try{await h.removeFromFavorites(t),this._favorites=this._favorites.filter(e=>e.storyId!==t),this._favorites.length===0?(document.getElementById("favorites-container").style.display="none",document.getElementById("empty-favorites").style.display="block"):this._renderFavorites();const o=this._favorites.length;document.getElementById("favorites-count").textContent=`${o} favorite${o!==1?"s":""}`,this._showSuccess("Favorite removed successfully")}catch(o){console.error("Error removing favorite:",o),this._showError("Failed to remove favorite. Please try again.")}}async _clearAllFavorites(){try{const t=this._favorites.map(o=>h.removeFromFavorites(o.storyId));await Promise.all(t),this._favorites=[],document.getElementById("favorites-container").style.display="none",document.getElementById("empty-favorites").style.display="block",document.getElementById("favorites-count").textContent="0 favorites",this._showSuccess("All favorites cleared successfully")}catch(t){console.error("Error clearing favorites:",t),this._showError("Failed to clear favorites. Please try again.")}}_showSuccess(t){this._showNotification(t,"success")}_showError(t){this._showNotification(t,"error")}_showNotification(t,o){const e=document.createElement("div");e.className=`notification notification-${o}`,e.textContent=t,document.body.appendChild(e),setTimeout(()=>{document.body.contains(e)&&document.body.removeChild(e)},3e3)}}class Y{async render(){return`
        <div class="skip-link">
          <a href="#main-content" class="skip-to-content">Skip to Content</a>
        </div>
        
        <main id="main-content" class="not-found-page container">
          <div class="not-found-icon">🔍</div>
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.</p>
          
          <div class="not-found-actions">
            <a href="#/" class="btn btn-primary">
              <i class="fa-solid fa-house"></i> Go Home
            </a>
            <a href="#/stories" class="btn btn-secondary">
              <i class="fa-solid fa-plus"></i> Add Story
            </a>
            <button onclick="history.back()" class="btn btn-text">
              <i class="fa-solid fa-arrow-left"></i> Go Back
            </button>
          </div>
          
          <div class="not-found-suggestions">
            <h3>Popular Pages:</h3>
            <ul class="suggestions-list">
              <li><a href="#/">🏠 Home - Browse all stories</a></li>
              <li><a href="#/favorites">💝 Favorites - Your saved stories</a></li>
              <li><a href="#/about">ℹ️ About - Learn more about StoryShare</a></li>
            </ul>
          </div>
        </main>
      `}async afterRender(){console.log("404 Error:",window.location.hash),document.title="404 - Page Not Found | StoryShare"}}const B={"/":new R,"/about":new U,"/login":new H,"/register":new W,"/stories":new z,"/stories/:id":new V,"/favorites":new G,"/404":new Y};function K(i){const t=i.split("/");return{resource:t[1]||null,id:t[2]||null}}function J(i){let t="";return i.resource&&(t=t.concat(`/${i.resource}`)),i.id&&(t=t.concat("/:id")),t||"/"}function Z(){return location.hash.replace("#","")||"/"}function Q(){const i=Z(),t=K(i);return J(t)}function _(){document.querySelectorAll("#main-content, #main-form").forEach(t=>{t&&(t.setAttribute("tabindex","-1"),document.querySelectorAll(".skip-to-content").forEach(e=>{e.addEventListener("click",s=>{s.preventDefault();const r=e.getAttribute("href").substring(1),a=document.getElementById(r);a&&(a.focus(),a.scrollIntoView({behavior:"smooth"}))})}))})}var v,b,m,y,u,F,O,S;class X{constructor({navigationDrawer:t,drawerButton:o,content:e}){g(this,u);g(this,v,null);g(this,b,null);g(this,m,null);g(this,y,null);w(this,v,e),w(this,b,o),w(this,m,t),f(this,u,F).call(this),f(this,u,O).call(this)}async renderPage(){const t=Q();let o=B[t];o||(o=B["/404"],history.replaceState(null,"","#/404")),l(this,y)&&typeof l(this,y).destroy=="function"&&l(this,y).destroy(),w(this,y,o),document.startViewTransition?document.startViewTransition(async()=>{l(this,v).innerHTML=await o.render(),await o.afterRender(),f(this,u,S).call(this),_()}):(l(this,v).innerHTML=await o.render(),await o.afterRender(),f(this,u,S).call(this),_())}}v=new WeakMap,b=new WeakMap,m=new WeakMap,y=new WeakMap,u=new WeakSet,F=function(){l(this,b).addEventListener("click",()=>{l(this,m).classList.toggle("open")}),document.body.addEventListener("click",t=>{!l(this,m).contains(t.target)&&!l(this,b).contains(t.target)&&l(this,m).classList.remove("open"),l(this,m).querySelectorAll("a").forEach(o=>{o.contains(t.target)&&l(this,m).classList.remove("open")})})},O=function(){const t=document.getElementById("auth-nav");t&&(f(this,u,S).call(this),t.addEventListener("click",o=>{o.target&&o.target.id==="logout-button"&&(o.preventDefault(),c.destroyAuth(),f(this,u,S).call(this),window.location.hash="#/")}))},S=function(){const t=document.getElementById("auth-nav");if(t)if(c.isAuthenticated()){const{name:o}=c.getAuth();t.innerHTML=`
        <span class="user-greeting">Hello, ${o}</span>
        <a href="#/stories" class="nav-link">Add Story</a>
        <button id="logout-button" class="btn-logout">Logout</button>
      `}else t.innerHTML=`
        <a href="#/login" class="nav-link">Login</a>
        <a href="#/register" class="nav-link btn-register">Register</a>
      `};class tt{constructor(){this.isSupported="serviceWorker"in navigator&&"PushManager"in window,this.isSubscribed=!1,this.registration=null}async init(){if(!this.isSupported)return console.warn("Push notifications are not supported"),!1;try{this.registration=await navigator.serviceWorker.register("/sw.js"),console.log("Service Worker registered successfully");const t=await this.registration.pushManager.getSubscription();return this.isSubscribed=t!==null,!0}catch(t){return console.error("Service Worker registration failed:",t),!1}}async requestPermission(){if(!this.isSupported)return console.warn("Push notifications are not supported"),!1;try{if(Notification.permission==="granted")return console.log("Notification permission already granted"),!0;if(Notification.permission==="denied")return console.warn("Notification permission was denied"),!1;const t=await Notification.requestPermission();return console.log("Notification permission result:",t),t==="granted"}catch(t){return console.error("Error requesting notification permission:",t),!1}}async subscribe(){if(!this.isSupported||!c.isAuthenticated())return console.warn("Cannot subscribe: not supported or not authenticated"),!1;try{if(!await this.requestPermission())throw console.warn("Cannot subscribe: permission not granted"),new Error("Notification permission not granted");if(await this.registration.pushManager.getSubscription())return console.log("Already subscribed to push notifications"),this.isSubscribed=!0,!0;const e=await this.registration.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:this._urlBase64ToUint8Array(d.PUSH_MSG_VAPID_PUBLIC_KEY)});console.log("Push subscription created:",e);const{token:s}=c.getAuth(),r=await E.subscribePushNotification(s,{endpoint:e.endpoint,keys:{p256dh:btoa(String.fromCharCode.apply(null,new Uint8Array(e.getKey("p256dh")))),auth:btoa(String.fromCharCode.apply(null,new Uint8Array(e.getKey("auth"))))}});if(r.error)throw console.error("Server subscription failed:",r.message),new Error(r.message);return this.isSubscribed=!0,console.log("Successfully subscribed to push notifications"),this.sendTestNotification(),!0}catch(t){return console.error("Failed to subscribe to push notifications:",t),!1}}sendTestNotification(){if(Notification.permission==="granted")try{const t=new Notification("StoryShare Notifications Enabled",{body:"You will now receive notifications when new stories are shared!",icon:"/images/icon-192x192.png",badge:"/images/icon-96x96.png",tag:"test-notification"});setTimeout(()=>{t.close()},5e3),console.log("Test notification sent")}catch(t){console.error("Error sending test notification:",t)}}async unsubscribe(){if(!this.isSupported||!c.isAuthenticated())return!1;try{const t=await this.registration.pushManager.getSubscription();if(!t)return console.log("Not subscribed to push notifications"),!0;await t.unsubscribe();const{token:o}=c.getAuth();return await E.unsubscribePushNotification(o,t.endpoint),this.isSubscribed=!1,console.log("Successfully unsubscribed from push notifications"),!0}catch(t){return console.error("Failed to unsubscribe from push notifications:",t),!1}}async getSubscriptionStatus(){if(!this.isSupported)return!1;try{const t=await this.registration.pushManager.getSubscription();return this.isSubscribed=t!==null,this.isSubscribed}catch(t){return console.error("Failed to check subscription status:",t),!1}}_urlBase64ToUint8Array(t){const o="=".repeat((4-t.length%4)%4),e=(t+o).replace(/-/g,"+").replace(/_/g,"/"),s=window.atob(e),r=new Uint8Array(s.length);for(let a=0;a<s.length;++a)r[a]=s.charCodeAt(a);return r}}const P=new tt;class et{constructor(){this.app=null,this.isOnline=navigator.onLine}async init(){try{await h.openDatabase(),console.log("IndexedDB initialized"),this.app=new X({content:document.querySelector("#main-content"),drawerButton:document.querySelector("#drawer-button"),navigationDrawer:document.querySelector("#navigation-drawer")}),await this.app.renderPage(),_(),await this.initPWAFeatures(),this.setupConnectionMonitoring(),this.setupNavigation(),console.log("App initialized successfully")}catch(t){console.error("Error initializing app:",t),this.showErrorMessage("Failed to initialize app. Please refresh the page.")}}async initPWAFeatures(){try{c.isAuthenticated()&&await P.init()&&this.showPushNotificationBanner(),setTimeout(()=>{this.checkPWAInstallability()},5e3),this.setupAuthStateListener()}catch(t){console.error("Error initializing PWA features:",t)}}setupConnectionMonitoring(){window.addEventListener("online",()=>{this.isOnline=!0,this.showConnectionStatus("online"),this.syncOfflineData()}),window.addEventListener("offline",()=>{this.isOnline=!1,this.showConnectionStatus("offline")}),this.isOnline||this.showConnectionStatus("offline")}setupNavigation(){window.addEventListener("hashchange",async()=>{await this.app.renderPage(),_()}),window.addEventListener("popstate",async()=>{await this.app.renderPage(),_()})}setupAuthStateListener(){window.addEventListener("storage",async t=>{t.key==="auth"&&(await this.app.renderPage(),c.isAuthenticated()&&await P.init())})}showPushNotificationBanner(){const t=document.getElementById("push-notification-banner"),o=document.getElementById("enable-notifications"),e=document.getElementById("dismiss-notifications");localStorage.getItem("notification-decision")||(t.style.display="block",o.addEventListener("click",async()=>{await P.subscribe()?(this.showNotification("Notifications enabled successfully!","success"),localStorage.setItem("notification-decision","enabled")):this.showNotification("Failed to enable notifications.","error"),t.style.display="none"}),e.addEventListener("click",()=>{t.style.display="none",localStorage.setItem("notification-decision","dismissed")}))}checkPWAInstallability(){if(window.matchMedia("(display-mode: standalone)").matches){console.log("App is already installed");return}localStorage.getItem("pwa-install-dismissed")}showConnectionStatus(t){const o=document.getElementById("connection-status"),e=document.getElementById("connection-text");t==="online"?(e.textContent="🟢 You're back online!",o.className="connection-status online",setTimeout(()=>{o.style.display="none"},3e3)):(e.textContent="🔴 You're offline. Some features may not work.",o.className="connection-status offline"),o.style.display="block"}async syncOfflineData(){try{const t=await h.getOfflineStories();if(t.length>0){console.log("Syncing offline stories:",t.length);for(const o of t)try{await h.deleteOfflineStory(o.tempId),console.log("Synced offline story:",o.tempId)}catch(e){console.error("Failed to sync story:",o.tempId,e)}this.showNotification("Offline stories synced successfully!","success")}}catch(t){console.error("Error syncing offline data:",t)}}showNotification(t,o="info"){const e=document.createElement("div");e.className=`notification notification-${o}`,e.textContent=t,document.body.appendChild(e),setTimeout(()=>{document.body.contains(e)&&document.body.removeChild(e)},5e3)}showErrorMessage(t){const o=document.getElementById("main-content");o.innerHTML=`
      <div class="error-container container">
        <h1>Something went wrong</h1>
        <p>${t}</p>
        <button onclick="window.location.reload()" class="btn btn-primary">Reload App</button>
      </div>
    `}}document.addEventListener("DOMContentLoaded",async()=>{await new et().init()});"serviceWorker"in navigator&&navigator.serviceWorker.addEventListener("message",i=>{i.data&&i.data.type==="SYNC_COMPLETE"&&console.log("Background sync completed:",i.data.message)});window.addEventListener("appinstalled",()=>{console.log("PWA was installed"),localStorage.setItem("pwa-installed","true")});window.matchMedia("(display-mode: standalone)").matches&&document.addEventListener("contextmenu",i=>i.preventDefault());
