// Bird Table Usability Enhancements
(function() {
  // Utility selectors
  const toolbar = document.querySelector('.bird-table-toolbar');
  const searchInput = document.getElementById('bird-table-search');
  const statusSelect = document.getElementById('bird-table-status');
  const migrationSelect = document.getElementById('bird-table-migration');
  const clearBtn = document.getElementById('bird-table-clear');
  const countSpan = document.getElementById('bird-table-count');

  // Find all tabbed tables
  function getActiveTable() {
    // Find visible .tab-content or .table-responsive
    const activeTab = document.querySelector('.tab-content.active, .table-responsive:visible');
    if (!activeTab) return null;
    return activeTab.querySelector('table');
  }

  // Search/filter/sort state
  let sortCol = null;
  let sortDir = 1; // 1 = asc, -1 = desc

  // Column index mapping
  const colMap = {
    type: 0,
    latin: 1,
    status: 2,
    migration: 3,
    lifespan: 4,
    nest: 5,
    period: 6,
    eggs: 7,
    food: 8
  };

  // Filtering logic
  function filterTable() {
    const table = getActiveTable();
    if (!table) return;
    const rows = Array.from(table.tBodies[0].rows);
    const search = searchInput.value.trim().toLowerCase();
    const status = statusSelect.value;
    const migration = migrationSelect.value;

    let shown = 0;
    rows.forEach(row => {
      const cells = row.cells;
      // Search fields: Type, Latin, Nest, Food
      const text = [
        cells[colMap.type].textContent,
        cells[colMap.latin].textContent,
        cells[colMap.nest].textContent,
        cells[colMap.food].textContent
      ].join(' ').toLowerCase();

      // Status badge
      const statusBadge = cells[colMap.status].querySelector('.status-badge');
      const statusVal = statusBadge ? statusBadge.textContent : '';
      // Migration dot
      const migrationDot = cells[colMap.migration].querySelector('.migration-dot');
      let migrationVal = '';
      if (migrationDot) {
        if (migrationDot.classList.contains('resident')) migrationVal = 'resident';
        else if (migrationDot.classList.contains('summer')) migrationVal = 'summer';
        else if (migrationDot.classList.contains('winter')) migrationVal = 'winter';
        else if (migrationDot.classList.contains('passage')) migrationVal = 'passage';
      }

      let visible = true;
      if (search && !text.includes(search)) visible = false;
      if (status && statusVal !== status) visible = false;
      if (migration && migrationVal !== migration) visible = false;

      row.style.display = visible ? '' : 'none';
      if (visible) shown++;
    });

    // Show result count
    countSpan.textContent = `${shown} birds shown`;

    // Show no results message
    let noResults = table.querySelector('.no-results');
    if (shown === 0) {
      if (!noResults) {
        noResults = document.createElement('tr');
        noResults.className = 'no-results';
        noResults.innerHTML = `<td colspan="${table.tHead.rows[0].cells.length}">No results found</td>`;
        table.tBodies[0].appendChild(noResults);
      }
    } else if (noResults) {
      noResults.remove();
    }
  }

  // Sorting logic
  function sortTable(colIdx) {
    const table = getActiveTable();
    if (!table) return;
    const rows = Array.from(table.tBodies[0].rows).filter(r => r.style.display !== 'none');
    // Remove no-results row if present
    rows.filter(r => r.classList.contains('no-results')).forEach(r => r.remove());

    // Toggle direction
    if (sortCol === colIdx) sortDir *= -1;
    else sortDir = 1;
    sortCol = colIdx;

    // Remove arrows from all headers
    Array.from(table.tHead.rows[0].cells).forEach(th => {
      const arrow = th.querySelector('.sort-arrow');
      if (arrow) arrow.remove();
    });

    // Add arrow to sorted column
    const th = table.tHead.rows[0].cells[colIdx];
    const arrow = document.createElement('span');
    arrow.className = 'sort-arrow';
    arrow.textContent = sortDir === 1 ? '▲' : '▼';
    th.appendChild(arrow);

    // Sort rows
    rows.sort((a, b) => {
      let aVal = a.cells[colIdx].textContent.trim();
      let bVal = b.cells[colIdx].textContent.trim();
      // Numeric sort for eggs/lifespan
      if (colIdx === colMap.lifespan || colIdx === colMap.eggs) {
        aVal = parseFloat(aVal.replace(/[^0-9.]/g, '')) || 0;
        bVal = parseFloat(bVal.replace(/[^0-9.]/g, '')) || 0;
      }
      if (aVal < bVal) return -1 * sortDir;
      if (aVal > bVal) return 1 * sortDir;
      return 0;
    });

    // Re-append sorted rows
    rows.forEach(row => table.tBodies[0].appendChild(row));
  }

  // Attach event listeners
  if (toolbar) {
    searchInput.addEventListener('input', filterTable);
    statusSelect.addEventListener('change', filterTable);
    migrationSelect.addEventListener('change', filterTable);
    clearBtn.addEventListener('click', function() {
      searchInput.value = '';
      statusSelect.value = '';
      migrationSelect.value = '';
      filterTable();
    });
  }

  // Make headers sortable
  function makeHeadersSortable() {
    document.querySelectorAll('.table-responsive table').forEach(table => {
      const ths = table.tHead.rows[0].cells;
      // Sortable columns: Type, Latin Name, Lifespan, Nesting Period, Number of Eggs
      [colMap.type, colMap.latin, colMap.lifespan, colMap.period, colMap.eggs].forEach(idx => {
        ths[idx].classList.add('sortable');
        ths[idx].tabIndex = 0;
        ths[idx].setAttribute('role', 'button');
        ths[idx].setAttribute('aria-label', 'Sort column');
        ths[idx].addEventListener('click', () => sortTable(idx));
        ths[idx].addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') sortTable(idx);
        });
      });
    });
  }

  // Sticky header polyfill for older browsers
  function stickyHeaderPolyfill() {
    // Modern browsers support position: sticky, but fallback if needed
    // No-op for now, as most browsers support sticky
  }

  // Tab switching: re-filter and re-sort for new active table
  function handleTabSwitch() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setTimeout(() => {
          filterTable();
          makeHeadersSortable();
        }, 100);
      });
    });
  }

  // Initial setup
  document.addEventListener('DOMContentLoaded', function() {
    filterTable();
    makeHeadersSortable();
    handleTabSwitch();
    stickyHeaderPolyfill();
  });
})();
// Bird of the Month Archive (optional JS rendering)
const birdArchiveEntries = [
  {
    year: 2026,
    months: [
      { month: 'January', name: 'Robin', category: 'Garden', link: 'garden_birds.html' },
      { month: 'February', name: 'Goldfinch', category: 'Garden', link: 'garden_birds.html' },
      { month: 'March', name: 'Turnstone', category: 'Seabirds', link: 'sea_birds.html', current: true }
    ]
  }
];

function renderBirdArchive(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <section class="bird-archive container" aria-labelledby="bird-archive-title">
      <h2 id="bird-archive-title">Bird of the Month Archive <span aria-hidden="true">🐦</span></h2>
      <div class="bird-archive-panel">
        ${birdArchiveEntries.map(entry => `
          <h3 class="bird-archive-year">${entry.year}</h3>
          <ul class="bird-archive-list">
            ${entry.months.map(item => `
              <li>
                <a href="${item.link}" class="bird-archive-link${item.current ? ' current' : ''}">
                  <span class="bird-archive-month">${item.month}</span>
                  <span class="bird-archive-name">${item.name}</span>
                  <span class="bird-archive-category">${item.category}</span>
                  ${item.current ? '<span class="bird-archive-badge" aria-label="Current month">Current</span>' : ''}
                </a>
              </li>
            `).join('')}
          </ul>
        `).join('')}
      </div>
    </section>
  `;
}

document.addEventListener('DOMContentLoaded', function() {
  renderBirdArchive('bird-archive-js');
});
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
      'Blackbird (F)', 'Blackbird (M)', 'Blackcap (F)', 'Blackcap (M)', 'Blue Tit', 'Bullfinch', 'Chaffinch (M)', 'Chaffinch (F)', 'Coal Tit', 'Dunnock', 'Goldfinch', 'Goldcrest', 'Great Tit', 'House Sparrow', 'Long Tailed Tit', 'Mistle Thrush', 'Nuthatch', 'Redwing', 'Robin', 'Song Thrush', 'Starling', 'Tree Sparrow', 'Wren', 'Wood Pigeon'
    ],
    'countryside.html': [
      'Collared Dove', 'Goldfinch', 'Green Woodpecker', 'Great Spotted Woodpecker', 'Jackdaw', 'Jay', 'Magpie', 'Red-legged Partridge', 'Pheasant', 'Rook', 'Stonechat'
    ],
    'water_birds.html': [
      'Ash Headed Goose', 'Barrows Goldeneye', 'Bufflehead', 'Common Goldeneye', 'Common Redshank', 'Common Crane', 'Coot', 'Coscoroba Swan', 'Egret', 'Little Grebe', 'Greylag Goose', 'Lesser White Fronted Goose', 'Bar Headed Goose', 'Canada Goose', 'Chiloe Wigeon', 'Flamingo', 'Garganey', 'Hooded Merganser', 'Common Kingfisher', 'Knob Billed Duck', 'Magellanic Goose', 'Mallard', 'Mallard Duck', 'Masked Lapwing', 'Mareca', 'Moorhen', 'Netta', 'Oxyura', 'Teal', 'Tufted Duck', 'Pied Avocet', 'Puna Teal', 'Redhead Duck', 'Red-breasted Merganser', 'Northern Pintail', 'Redshank', 'Ringed Teal', 'Ruddy Shelduck', 'Ruff', 'Common Sandpiper', 'Greater Scaup', 'Common Shelduck', 'Smew', 'Southern Screamer', 'Eurasian Spoonbill', 'Swan Goose', 'Mute Swan', 'Whooper Swan', 'Black Necked Swan', 'Water Rail', 'White-faced Whistling Duck', 'Wigeon', 'Chiloe Widgeon', 'Yellowhammer'
    ],
    'sea_birds.html': [
      'Black-headed Gull', 'Curlew', 'Eurasian Oystercatcher', 'Gannet', 'Great Cormorant', 'Guillemot', 'Egret', 'Gull', 'Kittiwake', 'Pelican', 'Tern'
    ],
    'birds_of_prey.html': [
      'Bald Eagle', 'Barn Owl', 'Barn Owl (landing)', 'Common Buzzard', 'Peregrine Falcon', 'African Fish Eagle', 'Golden Eagle', 'Hen Harrier', 'Kestrel', 'Long Eared Owl', 'Tawny Owl', 'Great Grey Owl', 'Red Kite', 'Griffon Vulture', 'Gyrfalcon'
    ],
    'australia_birds.html': [
      'Australian Magpie', 'Australian Ringneck', 'Bar Shouldered Dove', 'Black Parrot', 'Black Swan', 'Blue Faced Honeyeater', 'Brahminy Kite', 'Brush Turkey', 'Bush Stone Curlew', 'Butcher Bird', 'Cockatoo', 'Cockatoos', 'Ducula', 'Cormorant', 'Crimson Finch', 'Crimson Rosella', 'Egret', 'Emerald Dove', 'Emu', 'Fruit Dove', 'Galah', 'Greater Crested Tern', 'Green Ringneck Parrot', 'Jacada', 'Kingfisher', 'Kookaboro', 'Kookaboro 2', 'Little Pied Cormorant', 'Loon', 'Magpie Goose', 'Magpie Goose Flying', 'Masked Lapwing', 'Merops', 'Mute Swan', 'Peacock', 'Pelican', 'Pied Currawong', 'Pied Imperial Pigeon', 'Pied Oystercatcher', 'Red-collared Lorikeet', 'Shelduck', 'Spinifex Pigeon', 'Straw-necked Ibis', 'White-Bellied Sea Eagle', 'Wandering Whistling Duck', 'Welcome Swallow', 'White-Necked Heron', 'Yellow-Throated Miner'
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
