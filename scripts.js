// scripts.js — small helpers (lightbox)
(function(){
  let lastActive = null;
  let keyHandler = null;

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
      if(ev.key === 'Escape') closeModal();
      if(ev.key === 'ArrowRight'){
        // optional: could add next image support later
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

  // expose for older inline usages (backwards compat)
  window.openModal = openModal;
  window.closeModal = closeModal;
})();
