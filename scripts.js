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
  const dateInput = document.getElementById('date-search');
  const dateBtn = document.getElementById('date-search-btn');
  const searchResults = document.getElementById('search-results');

  if(!searchInput || !searchBtn || !searchResults || !dateInput || !dateBtn) return;

  // Database of birds and their locations across the site
  const birdDatabase = {
    'garden_birds.html': [
      'Blackbird (F)', 'Blackbird (M)', 'Blackcap (F)', 'Blackcap (M)', 'Blue Tit', 'Bullfinch', 'Chaffinch (M)', 'Chaffinch (F)', 'Coal Tit', 'Collared Dove', 'Dunnock', 'Goldfinch', 'Goldcrest', 'Great Tit', 'House Sparrow', 'Long Tailed Tit', 'Mistle Thrush', 'Nuthatch', 'Redwing', 'Robin', 'Song Thrush', 'Starling', 'Tree Sparrow', 'Wren', 'Wood Pigeon'
    ],
    'countryside.html': [
      'Collared Dove', 'Goldfinch', 'Green Woodpecker', 'Great Spotted Woodpecker', 'Jackdaw', 'Jay', 'Magpie', 'Red-legged Partridge', 'Pheasant', 'Rook', 'Stonechat'
    ],
    'water_birds.html': [
      'Ash Headed Goose', 'Bar Headed Goose', 'Barrows Goldeneye', 'Bufflehead', 'Canada Goose', 'Chiloe Wigeon', 'Common Redshank', 'Common Crane', 'Common Goldeneye', 'Common Kingfisher', 'Common Sandpiper', 'Common Shelduck', 'Coot', 'Coscoroba Swan', 'Eurasian Spoonbill', 'Flamingo', 'Garganey', 'Greater Flamingo', 'Greater Scaup', 'Greylag Goose', 'Hooded Merganser', 'Kingfisher', 'Knob Billed Duck', 'Lesser White Fronted Goose', 'Little Egret', 'Little Grebe', 'Magellanic Goose', 'Mallard', 'Mallard Duck', 'Masked Lapwing', 'Mareca', 'Moorhen', 'Mute Swan', 'Netta'
    ],
    'sea_birds.html': [
      'Black-headed Gull', 'Curlew', 'Eurasian Oystercatcher', 'Gannet', 'Great Cormorant', 'Guillemot', 'Egret', 'Gull', 'Kittiwake', 'Pelican', 'Tern'
    ],
    'birds_of_prey.html': [
      'Bald Eagle', 'Barn Owl', 'Barn Owl (landing)', 'Common Buzzard', 'Peregrine Falcon', 'African Fish Eagle', 'Golden Eagle', 'Hen Harrier', 'Kestrel', 'Long Eared Owl', 'Tawny Owl', 'Great Grey Owl', 'Red Kite', 'Griffon Vulture', 'Gyrfalcon'
    ],
    'australia_birds.html': [
      'Australian Magpie', 'Australian Ringneck', 'Bar Shouldered Dove', 'Black Parrot', 'Black Swan', 'Blue Faced Honeyeater', 'Brahminy Kite', 'Brush Turkey', 'Bush Stone Curlew', 'Butcher Bird', 'Cockatoo', 'Cockatoos', 'Cormorant', 'Crimson Finch', 'Crimson Rosella', 'Ducula', 'Egret', 'Emerald Dove', 'Emu', 'Fruit Dove', 'Galah', 'Greater Crested Tern', 'Green Ringneck Parrot', 'Jacada', 'Kingfisher', 'Kookaboro', 'Kookaboro 2', 'Little Pied Cormorant', 'Loon'
    ],
    'world.html': [
      'Common Myna', 'Limpkin', 'Ostrich', 'Penguin', 'Hoopoe', 'Hooded Crow', 'Otter', 'Red Whiskered Bulbul', 'Roulroul Partridge', 'Rose Ringed Parakeet', 'Seals', 'Turkey Vulture'
    ]
  };

  const pageNames = {
    'garden_birds.html': 'Garden Birds',
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
    displayResults(results, query, 'bird');
  }

  // Date search implementation
  // For each gallery, scan the DOM for captions and match the date string
  function performDateSearch(){
    const dateQuery = dateInput.value.trim().toLowerCase();
    if(!dateQuery){
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      return;
    }

    // List of gallery pages to search
    const galleryPages = [
      'garden_birds.html',
      'countryside.html',
      'water_birds.html',
      'sea_birds.html',
      'birds_of_prey.html',
      'australia_birds.html',
      'world.html'
    ];

    // Helper to fetch and parse a gallery page
    function fetchGallery(page) {
      return fetch(page)
        .then(r => r.text())
        .then(html => {
          // Create a DOM parser
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          // Find all figures
          const figures = Array.from(doc.querySelectorAll('.gallery-item'));
          return figures.map(fig => {
            const bird = fig.querySelector('.common-name')?.textContent?.trim() || '';
            // Use innerHTML to replace <br> with spaces for robust date search
            let caption = '';
            const capElem = fig.querySelector('.figure-caption');
            if (capElem) {
              caption = capElem.innerHTML.replace(/<br\s*\/?>(\s*)?/gi, ' ');
              // Remove any remaining HTML tags (just in case)
              caption = caption.replace(/<[^>]+>/g, '');
            }
            caption = caption.trim();
            return { bird, caption, page };
          });
        });
    }

    // Fetch all galleries and search for date
    Promise.all(galleryPages.map(fetchGallery)).then(allResults => {
      const flat = allResults.flat();
      // Debug output: show how many items and sample captions
      let debugHtml = '<details style="margin:1em 0;"><summary>Debug: ' + flat.length + ' gallery items parsed</summary><ul>';
      flat.slice(0, 10).forEach(item => {
        debugHtml += '<li>' + escapeHtml(item.caption) + '</li>';
      });
      debugHtml += '</ul></details>';

      function normalize(text) {
        return text.replace(/\s+/g, ' ').trim().toLowerCase();
      }
      const normQuery = dateQuery.replace(/\s+/g, ' ').trim().toLowerCase();
      const matches = flat.filter(item => normalize(item.caption).includes(normQuery));
      let html = '';
      if(matches.length === 0){
        html = '<div class="no-results">No birds found for date "' + escapeHtml(dateQuery) + '". Try searching for a year (e.g., 2020) or month/year (e.g., Mar 2020).</div>';
      } else {
        html = '<div class="search-results-header">Found ' + matches.length + ' result' + (matches.length !== 1 ? 's' : '') + ' for date "' + escapeHtml(dateQuery) + '":</div>';
        matches.forEach(result => {
          html += '<div class="search-result-item">';
          html += '<a href="' + result.page + '">' + escapeHtml(result.bird) + '</a>';
          html += '<div class="search-result-page">In: ' + escapeHtml(pageNames[result.page] || result.page) + '</div>';
          html += '<div class="search-result-caption">' + escapeHtml(result.caption) + '</div>';
          html += '</div>';
        });
      }
      searchResults.classList.add('active');
      searchResults.innerHTML = debugHtml + html;
    });
  }

  function displayResults(results, query, type){
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
  // Date search events
  dateBtn.addEventListener('click', performDateSearch);
  dateInput.addEventListener('keypress', function(e){
    if(e.key === 'Enter'){
      e.preventDefault();
      performDateSearch();
    }
  });
  // Clear results when input is cleared
  searchInput.addEventListener('input', function(){
    if(!searchInput.value.trim()){
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
    }
  });
  dateInput.addEventListener('input', function(){
    if(!dateInput.value.trim()){
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
    }
  });
})();
