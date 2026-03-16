// Bird Table Usability Enhancements
(function() {
  const toolbar = document.querySelector('.bird-table-toolbar');
  const searchInput = document.getElementById('bird-table-search');
  const statusSelect = document.getElementById('bird-table-status');
  const migrationSelect = document.getElementById('bird-table-migration');
  const clearBtn = document.getElementById('bird-table-clear');
  const countSpan = document.getElementById('bird-table-count');
  const showImagesToggle = document.getElementById('bird-table-show-images');

  if (!toolbar) return;

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

  const tabFolderMap = {
    'garden-tab': 'garden',
    'woodland-tab': 'woodland',
    'countryside-tab': 'countryside',
    'water-tab': 'water_birds',
    'seabirds-tab': 'sea_birds'
  };

  const explicitThumbs = {
    'Blackbird': 'bird_photos/garden/blackbird.jpg',
    'Blackcap': 'bird_photos/woodland/black-cap.jpg',
    'Blue Tit': 'bird_photos/garden/blue-tit.jpg',
    'Bullfinch': 'bird_photos/garden/bullfinch.jpg',
    'Chaffinch': 'bird_photos/garden/chaffinch.jpg',
    'Coal Tit': 'bird_photos/woodland/coal-tit.jpg',
    'Dunnock': 'bird_photos/garden/dunnock.jpg',
    'Goldfinch': 'bird_photos/garden/Goldfinch.jpg',
    'Great Tit': 'bird_photos/garden/great-tit.jpg',
    'House Sparrow': 'bird_photos/stock/house-sparrow.jpeg',
    'Jackdaw': 'bird_photos/countryside/jackdaw_stock.jpg',
    'Jay': 'bird_photos/woodland/jay.jpg',
    'Long-tailed Tit': 'bird_photos/woodland/long-tail-tit.jpg',
    'Magpie': 'bird_photos/garden/magpie.jpg',
    'Nuthatch': 'bird_photos/woodland/nuthatch.jpg',
    'Redwing': 'bird_photos/garden/redwing.jpg',
    'Robin': 'bird_photos/garden/robin.jpg',
    'Song Thrush': 'bird_photos/garden/song-thrush.jpg',
    'Tree Sparrow': 'bird_photos/stock/tree-sparrow.jpeg',
    'Wood Pigeon': 'bird_photos/garden/wood-pigeon.jpg',
    'Wren': 'bird_photos/garden/wren.jpg',
    'Great Spotted Woodpecker': 'bird_photos/woodland/great_spotted_woodpecker.jpg',
    'Green Woodpecker': 'bird_photos/woodland/green-woodpecker.jpg',
    'Pheasant': 'bird_photos/countryside/pheasant.jpg',
    'Rook': 'bird_photos/countryside/rook.jpg',
    'Stonechat': 'bird_photos/countryside/stonechat.jpg',
    'Red-legged Partridge': 'bird_photos/countryside/red_legged_partridge.jpg',
    'Black-headed Gull': 'bird_photos/sea_birds/black-headed-gull.jpg',
    'Brown Pelican': 'bird_photos/sea_birds/pelican.jpg',
    'Common Tern': 'bird_photos/sea_birds/tern.jpg',
    'Curlew': 'bird_photos/sea_birds/curlew.jpg',
    'Eurasian Oystercatcher': 'bird_photos/sea_birds/eurasian-oystercatcher.jpg',
    'Rock Dove': 'bird_photos/sea_birds/rock_dove.JPG',
    'Turnstone': 'bird_photos/sea_birds/turnstone.jpg',
    'African Fish Eagle': 'bird_photos/world/fish-eagle.jpg',
    'Bald Eagle': 'bird_photos/world/bald-eagle.jpg',
    'Barn Owl': 'bird_photos/woodland/barn-owl.jpg',
    'Common Buzzard': 'bird_photos/woodland/common-buzzard.jpg',
    'Golden Eagle': 'bird_photos/world/golden-eagle.jpg',
    'Great Grey Owl': 'bird_photos/woodland/owl2.jpg',
    'Griffon Vulture': 'bird_photos/world/vulture.jpg',
    'Gyrfalcon': 'bird_photos/world/white-falcon.jpg',
    'Hen Harrier': 'bird_photos/countryside/hen-harrier.jpg',
    'Kestrel': 'bird_photos/stock/kestrel.jpg',
    'Long Eared Owl': 'bird_photos/woodland/long-eared-owl.jpg',
    'Peregrine Falcon': 'bird_photos/countryside/falcon1.jpg',
    'Red Kite': 'bird_photos/woodland/red-kite.jpg',
    'Tawny Owl': 'bird_photos/woodland/tawny-owl.jpg'
  };

  function photoToThumbPath(photoPath) {
    return photoPath.replace('bird_photos/', 'bird_thumbs/');
  }

  function getActiveTable() {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return null;
    return activeTab.querySelector('table');
  }

  function getDataCells(row) {
    const cells = Array.from(row.cells);
    if (cells[0] && cells[0].classList.contains('bird-thumb-cell')) {
      return cells.slice(1);
    }
    return cells;
  }

  function getHeaderOffset(table) {
    const firstHeader = table.tHead?.rows?.[0]?.cells?.[0];
    return firstHeader && firstHeader.classList.contains('bird-thumb-col') ? 1 : 0;
  }

  function slugifyBirdName(name) {
    return name
      .toLowerCase()
      .replace(/['().]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function getThumbCandidates(birdName, table) {
    if (explicitThumbs[birdName]) {
      return [explicitThumbs[birdName]];
    }

    const tab = table.closest('.tab-content');
    const folder = tabFolderMap[tab?.id] || 'garden';
    const slug = slugifyBirdName(birdName);
    const underscore = slug.replace(/-/g, '_');

    return [
      `bird_photos/${folder}/${slug}.jpg`,
      `bird_photos/${folder}/${slug}.jpeg`,
      `bird_photos/${folder}/${underscore}.jpg`,
      `bird_photos/${folder}/${underscore}.jpeg`
    ];
  }

  function buildThumbCell(birdName, table) {
    const cell = document.createElement('td');
    cell.className = 'bird-thumb-cell thumb-cell';

    const link = document.createElement('a');
    link.className = 'thumb-link';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Open full photo of ${birdName}`);

    const placeholder = document.createElement('span');
    placeholder.className = 'bird-thumb-placeholder thumb-placeholder';
    placeholder.textContent = '◌';
    placeholder.setAttribute('aria-label', 'No image');

    const photoCandidates = getThumbCandidates(birdName, table);
    const thumbCandidates = photoCandidates.map(photoToThumbPath);
    const img = document.createElement('img');
    img.className = 'bird-thumb-img thumb-img';
    img.alt = `${birdName} thumbnail`;
    img.loading = 'lazy';
    img.style.display = 'none';

    let candidateIndex = 0;
    img.onload = function() {
      img.style.display = '';
      placeholder.style.display = 'none';
      link.href = photoCandidates[candidateIndex];
      link.style.display = '';
    };
    img.onerror = function() {
      candidateIndex += 1;
      if (candidateIndex < thumbCandidates.length) {
        img.src = thumbCandidates[candidateIndex];
      } else {
        img.removeAttribute('src');
        img.style.display = 'none';
        placeholder.style.display = '';
        link.removeAttribute('href');
        link.style.display = 'none';
      }
    };

    link.appendChild(img);
    cell.appendChild(link);
    cell.appendChild(placeholder);

    if (thumbCandidates.length > 0) {
      img.src = thumbCandidates[0];
    }

    return cell;
  }

  function injectThumbnailColumns() {
    document.querySelectorAll('.table-responsive table').forEach(table => {
      const headerRow = table.tHead?.rows?.[0];
      if (!headerRow) return;

      const hasThumbHeader = headerRow.cells[0] && headerRow.cells[0].classList.contains('bird-thumb-col');
      if (!hasThumbHeader) {
        const th = document.createElement('th');
        th.className = 'bird-thumb-col';
        th.textContent = 'Photo';
        headerRow.insertBefore(th, headerRow.firstChild);
      }

      if (!table.tBodies[0]) return;
      Array.from(table.tBodies[0].rows).forEach(row => {
        if (row.classList.contains('no-results')) return;
        const hasThumbCell = row.cells[0] && row.cells[0].classList.contains('bird-thumb-cell');
        if (hasThumbCell) return;

        const birdName = row.cells[0] ? row.cells[0].textContent.trim() : '';
        const thumbCell = buildThumbCell(birdName, table);
        row.insertBefore(thumbCell, row.firstChild);
      });
    });
  }

  function applyImageVisibilityState() {
    const shouldShow = !showImagesToggle || showImagesToggle.checked;
    document.body.classList.toggle('bird-images-hidden', !shouldShow);
  }

  let sortCol = null;
  let sortDir = 1;

  function filterTable() {
    const table = getActiveTable();
    if (!table || !table.tBodies[0]) return;

    const rows = Array.from(table.tBodies[0].rows);
    const search = searchInput.value.trim().toLowerCase();
    const status = statusSelect.value;
    const migration = migrationSelect.value;

    let shown = 0;
    rows.forEach(row => {
      if (row.classList.contains('no-results')) return;

      const cells = getDataCells(row);
      if (cells.length < 9) return;

      const text = [
        cells[colMap.type].textContent,
        cells[colMap.latin].textContent,
        cells[colMap.nest].textContent,
        cells[colMap.food].textContent
      ].join(' ').toLowerCase();

      const statusBadge = cells[colMap.status].querySelector('.status-badge');
      const statusVal = statusBadge ? statusBadge.textContent.trim() : '';

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
      if (visible) shown += 1;
    });

    countSpan.textContent = `${shown} birds shown`;

    let noResults = table.querySelector('.no-results');
    if (shown === 0) {
      if (!noResults) {
        noResults = document.createElement('tr');
        noResults.className = 'no-results';
        noResults.innerHTML = `<td colspan="${table.tHead.rows[0].cells.length}">No birds match your filters</td>`;
        table.tBodies[0].appendChild(noResults);
      }
      noResults.style.display = '';
    } else if (noResults) {
      noResults.remove();
    }
  }

  function sortTable(dataColIdx) {
    const table = getActiveTable();
    if (!table || !table.tBodies[0]) return;

    const headerOffset = getHeaderOffset(table);
    const actualColIdx = dataColIdx + headerOffset;

    const rows = Array.from(table.tBodies[0].rows).filter(r => !r.classList.contains('no-results'));
    if (rows.length === 0) return;

    if (sortCol === actualColIdx) sortDir *= -1;
    else sortDir = 1;
    sortCol = actualColIdx;

    Array.from(table.tHead.rows[0].cells).forEach(th => {
      const arrow = th.querySelector('.sort-arrow');
      if (arrow) arrow.remove();
    });

    const th = table.tHead.rows[0].cells[actualColIdx];
    if (th) {
      const arrow = document.createElement('span');
      arrow.className = 'sort-arrow';
      arrow.textContent = sortDir === 1 ? '▲' : '▼';
      th.appendChild(arrow);
    }

    rows.sort((a, b) => {
      const aCells = getDataCells(a);
      const bCells = getDataCells(b);
      let aVal = (aCells[dataColIdx]?.textContent || '').trim();
      let bVal = (bCells[dataColIdx]?.textContent || '').trim();

      if (dataColIdx === colMap.lifespan || dataColIdx === colMap.eggs) {
        aVal = parseFloat(aVal.replace(/[^0-9.]/g, '')) || 0;
        bVal = parseFloat(bVal.replace(/[^0-9.]/g, '')) || 0;
      } else {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return -1 * sortDir;
      if (aVal > bVal) return 1 * sortDir;
      return 0;
    });

    rows.forEach(row => table.tBodies[0].appendChild(row));
    filterTable();
  }

  function makeHeadersSortable() {
    document.querySelectorAll('.table-responsive table').forEach(table => {
      const headerRow = table.tHead?.rows?.[0];
      if (!headerRow) return;

      const headerOffset = getHeaderOffset(table);
      const sortableDataCols = [colMap.type, colMap.latin, colMap.lifespan, colMap.period, colMap.eggs];

      sortableDataCols.forEach(dataIdx => {
        const th = headerRow.cells[dataIdx + headerOffset];
        if (!th || th.dataset.sortBound === 'true') return;

        th.classList.add('sortable');
        th.tabIndex = 0;
        th.setAttribute('role', 'button');
        th.setAttribute('aria-label', `Sort by ${th.textContent.trim()}`);
        th.addEventListener('click', () => sortTable(dataIdx));
        th.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            sortTable(dataIdx);
          }
        });
        th.dataset.sortBound = 'true';
      });
    });
  }

  function handleTabSwitch() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setTimeout(() => {
          filterTable();
        }, 10);
      });
    });
  }

  searchInput.addEventListener('input', filterTable);
  statusSelect.addEventListener('change', filterTable);
  migrationSelect.addEventListener('change', filterTable);
  clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    statusSelect.value = '';
    migrationSelect.value = '';
    filterTable();
  });

  if (showImagesToggle) {
    showImagesToggle.addEventListener('change', applyImageVisibilityState);
  }

  document.addEventListener('DOMContentLoaded', function() {
    injectThumbnailColumns();
    makeHeadersSortable();
    applyImageVisibilityState();
    filterTable();
    handleTabSwitch();
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
      'Blackbird (F)', 'Blackbird (M)', 'Blue Tit', 'Bullfinch', 'Chaffinch (M)', 'Chaffinch (F)', 'Dunnock', 'Goldfinch', 'Great Tit', 'House Sparrow', 'Mistle Thrush', 'Redwing', 'Robin', 'Song Thrush', 'Starling', 'Tree Sparrow', 'Wren', 'Wood Pigeon'
    ],
    'countryside.html': [
      'Collared Dove', 'Goldfinch', 'Jackdaw', 'Magpie', 'Red-legged Partridge', 'Pheasant', 'Rook', 'Stonechat', 'Kestrel', 'Hen Harrier', 'Peregrine Falcon'
    ],
    'water_birds.html': [
      'Ash Headed Goose', 'Barrows Goldeneye', 'Bufflehead', 'Common Goldeneye', 'Common Redshank', 'Common Crane', 'Coot', 'Coscoroba Swan', 'Egret', 'Little Grebe', 'Greylag Goose', 'Lesser White Fronted Goose', 'Bar Headed Goose', 'Canada Goose', 'Chiloe Wigeon', 'Flamingo', 'Garganey', 'Hooded Merganser', 'Common Kingfisher', 'Knob Billed Duck', 'Magellanic Goose', 'Mallard', 'Mallard Duck', 'Masked Lapwing', 'Mareca', 'Moorhen', 'Netta', 'Oxyura', 'Teal', 'Tufted Duck', 'Pied Avocet', 'Puna Teal', 'Redhead Duck', 'Red-breasted Merganser', 'Northern Pintail', 'Redshank', 'Ringed Teal', 'Ruddy Shelduck', 'Ruff', 'Common Sandpiper', 'Greater Scaup', 'Common Shelduck', 'Smew', 'Southern Screamer', 'Eurasian Spoonbill', 'Swan Goose', 'Mute Swan', 'Whooper Swan', 'Black Necked Swan', 'Water Rail', 'White-faced Whistling Duck', 'Wigeon', 'Chiloe Widgeon', 'Yellowhammer'
    ],
    'sea_birds.html': [
      'Black-headed Gull', 'Curlew', 'Eurasian Oystercatcher', 'Gannet', 'Great Cormorant', 'Guillemot', 'Egret', 'Gull', 'Kittiwake', 'Pelican', 'Tern'
    ],
    'woodland.html': [
      'Barn Owl', 'Great Grey Owl', 'Long Eared Owl', 'Tawny Owl', 'Sparrowhawk', 'Blackcap (F)', 'Blackcap (M)', 'Coal Tit', 'Goldcrest', 'Long Tailed Tit', 'Nuthatch', 'Jay', 'Great Spotted Woodpecker', 'Green Woodpecker', 'Common Buzzard', 'Red Kite'
    ],
    'australia_birds.html': [
      'Australian Magpie', 'Australian Ringneck', 'Bar Shouldered Dove', 'Black Parrot', 'Black Swan', 'Blue Faced Honeyeater', 'Brahminy Kite', 'Brush Turkey', 'Bush Stone Curlew', 'Butcher Bird', 'Cockatoo', 'Cockatoos', 'Ducula', 'Cormorant', 'Crimson Finch', 'Crimson Rosella', 'Egret', 'Emerald Dove', 'Emu', 'Fruit Dove', 'Galah', 'Greater Crested Tern', 'Green Ringneck Parrot', 'Jacada', 'Kingfisher', 'Kookaboro', 'Kookaboro 2', 'Little Pied Cormorant', 'Loon', 'Magpie Goose', 'Magpie Goose Flying', 'Masked Lapwing', 'Merops', 'Mute Swan', 'Peacock', 'Pelican', 'Pied Currawong', 'Pied Imperial Pigeon', 'Pied Oystercatcher', 'Red-collared Lorikeet', 'Shelduck', 'Spinifex Pigeon', 'Straw-necked Ibis', 'White-Bellied Sea Eagle', 'Wandering Whistling Duck', 'Welcome Swallow', 'White-Necked Heron', 'Yellow-Throated Miner'
    ],
    'world.html': [
      'Common Myna', 'Limpkin', 'Ostrich', 'Penguin', 'Hoopoe', 'Hooded Crow', 'Otter', 'Red Whiskered Bulbul', 'Roulroul Partridge', 'Rose Ringed Parakeet', 'Seals', 'Turkey Vulture', 'African Fish Eagle', 'Bald Eagle', 'Golden Eagle', 'Griffon Vulture', 'Gyrfalcon'
    ]
  };

  const pageNames = {
    'garden_birds.html': 'Garden Birds',
    'countryside.html': 'Countryside Birds',
    'water_birds.html': 'Water Birds',
    'sea_birds.html': 'Seabirds',
    'woodland.html': 'Woodland',
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
      'woodland.html',
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
