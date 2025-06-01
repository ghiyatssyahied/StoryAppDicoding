
export function setupSkipToContent() {
  
    const mainContentElements = document.querySelectorAll('#main-content, #main-form');
    
    mainContentElements.forEach(element => {
      if (element) {
        
        element.setAttribute('tabindex', '-1');
        
        
        const skipLinks = document.querySelectorAll('.skip-to-content');
        skipLinks.forEach(link => {
          link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
              target.focus();
              
              target.scrollIntoView({ behavior: 'smooth' });
            }
          });
        });
      }
    });
  }