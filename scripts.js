// scripts.js — small helpers (lightbox + mobile menu)
(function(){
  let lastActive = null;
  let keyHandler = null;

  // Mobile menu toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('nav ul');
  
  if(menuToggle && nav){
    menuToggle.addEventListener('click', function(){
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      nav.classList.toggle('show');
    });

    // Close menu when clicking a link
    nav.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(){
        nav.classList.remove('show');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e){
      if(!menuToggle.contains(e.target) && !nav.contains(e.target)){
        nav.classList.remove('show');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.addEventListener('click', function(e){
    const t = e.target;
    if(t.matches('.gallery-item img')){
      openModal(t.src, t.alt, t.closest('.gallery-item')?.querySelector('.figure-caption')?.innerText);
      return;
    }

    if(t.matches('.modal')){
      closeModal();
      return;
    }

    if(t.matches('.modal img')){
      // don't close when clicking the image
      e.stopPropagation();
      return;
    }

    if(t.matches('.modal-close')){
      closeModal();
    }
  });

  function openModal(src, alt, caption){
    let modal = document.querySelector('.modal');
    if(!modal){
      modal = document.createElement('div');
      modal.className = 'modal';
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');
      modal.innerHTML = '<button class="modal-close" aria-label="Close image">&times;</button><img src="" alt="" /><div class="modal-caption"></div>';
      document.body.appendChild(modal);
    }

    const img = modal.querySelector('img');
    const cap = modal.querySelector('.modal-caption');
    const closeBtn = modal.querySelector('.modal-close');

    img.src = src;
    img.alt = alt || '';
    cap.textContent = caption || alt || '';

    // show
    modal.classList.add('open');
    // prevent background scroll
    document.body.style.overflow = 'hidden';

    // focus management
    lastActive = document.activeElement;
    closeBtn.focus();

    // keyboard handler
    keyHandler = function(ev){
      if(ev.key === 'Escape') { ev.preventDefault(); closeModal(); }

      // Trap focus inside the modal
      if(ev.key === 'Tab'){
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if(focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if(!ev.shiftKey && document.activeElement === last){ ev.preventDefault(); first.focus(); }
        if(ev.shiftKey && document.activeElement === first){ ev.preventDefault(); last.focus(); }
      }

      // Future: keyboard image navigation
      if(ev.key === 'ArrowRight'){
        // TODO: advance to next image when implemented
      }
      if(ev.key === 'ArrowLeft'){
        // TODO: go to previous image when implemented
      }
    };
    document.addEventListener('keydown', keyHandler);
  }

  function closeModal(){
    const modal = document.querySelector('.modal');
    if(!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', keyHandler);
    keyHandler = null;
    if(lastActive && typeof lastActive.focus === 'function') lastActive.focus();
  }

  // make gallery images keyboard accessible (ensure focusable + Enter/Space activation)
  document.querySelectorAll('.gallery-item img').forEach(function(img){
    img.setAttribute('tabindex','0');
    img.setAttribute('role','button');
    img.addEventListener('keydown', function(ev){
      if(ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar'){
        ev.preventDefault();
        openModal(img.src, img.alt, img.closest('.gallery-item')?.querySelector('.figure-caption')?.innerText);
      }
    });
  });

  // expose for older inline usages (backwards compat)
  window.openModal = openModal;
  window.closeModal = closeModal;
})();

// Bird search functionality
(function(){
  const searchInput = document.getElementById('bird-search');
  const searchBtn = document.getElementById('search-btn');
  const searchResults = document.getElementById('search-results');

  if(!searchInput || !searchBtn || !searchResults) return;

  // Database of birds and their locations across the site
  const birdDatabase = {
    'Garden_Birds.html': ['Blackbird', 'Blackcap', 'Blue Tit', 'Bullfinch', 'Dunnock', 'Goldfinch', 'Great Tit', 'Green Woodpecker', 'Jackdaw', 'Jay', 'Long Tailed Tit', 'Magpie', 'Nuthatch', 'Redwing', 'Robin', 'Song Thrush', 'Wood Pigeon', 'Woodpecker', 'Wren'],
    'countryside.html': ['Pheasant', 'Stonechat'],
    'water_birds.html': ['Ash Headed Goose', 'Bar Headed Goose', 'Black Necked Swan', 'Canada Goose', 'Coot', 'Egret', 'Flamingo', 'Greylag Goose', 'Kingfisher', 'Knob Billed Duck', 'Lesser White Fronted Goose', 'Mallard', 'Moorhen', 'Redhead Duck', 'Sandpiper', 'Scaup', 'Shelduck', 'Spoonbill', 'Swans', 'Whooper Swan', 'Yellowhammer'],
    'sea_birds.html': ['Black-headed Gull', 'Curlew', 'Egret', 'Gull', 'Pelican', 'Tern'],
    'birds_of_prey.html': ['Bald Eagle', 'Barn Owl', 'Common Buzzard', 'Falcon', 'Fish Eagle', 'Golden Eagle', 'Great Grey Owl', 'Hen Harrier', 'Long Eared Owl', 'Owl', 'Red Kite', 'Tawny Owl', 'Vulture', 'White Falcon'],
    'australia_birds.html': ['Australian Ringneck', 'Bar Shouldered Dove', 'Black Parrot', 'Blue Faced Honeyeater', 'Brahminy Kite', 'Brush Turkey', 'Bush Stone Curlew', 'Butcher Bird', 'Cockatoo', 'Cockatoos', 'Cormorant', 'Crimson Finch', 'Crimson Rosella', 'Ducula', 'Egret', 'Emerald Dove', 'Galah', 'Green Ringneck Parrot', 'Jacada', 'Kingfisher', 'Kookaburra', 'Magpie Goose', 'Masked Lapwing', 'Merops', 'Mute Swan', 'Peacock', 'Pelican', 'Pied Imperial Pigeon', 'Red-collared Lorikeet', 'Shelduck', 'Spinifex Pigeon', 'Straw-necked Ibis', 'White-Bellied Sea Eagle', 'Yellow-Throated Miner'],
    'world.html': ['Limpkin', 'Ostrich', 'Penguin', 'Roulroul Partridge']
  };

  const pageNames = {
    'Garden_Birds.html': 'Garden Birds',
    'countryside.html': 'Countryside Birds',
    'water_birds.html': 'Water Birds',
    'sea_birds.html': 'Seabirds',
    'birds_of_prey.html': 'Raptors',
    'australia_birds.html': 'Australian Birds',
    'world.html': 'World Birds'
  };

  function performSearch(){
    const query = searchInput.value.trim().toLowerCase();
    if(!query){
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      return;
    }

    const results = [];
    
    // Search through all pages
    for(const [page, birds] of Object.entries(birdDatabase)){
      birds.forEach(bird => {
        if(bird.toLowerCase().includes(query)){
          results.push({
            bird: bird,
            page: page,
            pageName: pageNames[page]
          });
        }
      });
    }

    displayResults(results, query);
  }

  function displayResults(results, query){
    searchResults.classList.add('active');
    
    if(results.length === 0){
      searchResults.innerHTML = '<div class="no-results">No birds found matching "' + escapeHtml(query) + '". Try searching for common names like "Blue Tit", "Robin", or "Owl".</div>';
      return;
    }

    let html = '<div class="search-results-header">Found ' + results.length + ' result' + (results.length !== 1 ? 's' : '') + ' for "' + escapeHtml(query) + '":</div>';
    
    results.forEach(result => {
      html += '<div class="search-result-item">';
      html += '<a href="' + result.page + '">' + escapeHtml(result.bird) + '</a>';
      html += '<div class="search-result-page">In: ' + escapeHtml(result.pageName) + '</div>';
      html += '</div>';
    });

    searchResults.innerHTML = html;
  }

  function escapeHtml(text){
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  searchBtn.addEventListener('click', performSearch);
  
  searchInput.addEventListener('keypress', function(e){
    if(e.key === 'Enter'){
      e.preventDefault();
      performSearch();
    }
  });

  // Clear results when input is cleared
  searchInput.addEventListener('input', function(){
    if(!searchInput.value.trim()){
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
    }
  });
})();
