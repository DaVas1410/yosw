// Wires up the ejes temáticos orbit wheel: clicking or keyboard-activating
// a wedge swaps the detail panel's title/description and marks that wedge
// active. Wrapped in an IIFE per the client-script scoping convention (see
// src/client/scroll-reveal.js) so top-level names never collide across
// scripts sharing this page's global scope.
(() => {
  const wedges = document.querySelectorAll('.ejes__wedge');
  const numEl = document.getElementById('ejes-detail-num');
  const titleEl = document.getElementById('ejes-detail-title');
  const descEl = document.getElementById('ejes-detail-desc');
  const logosEl = document.getElementById('ejes-detail-logos');
  if (!wedges.length || !titleEl || !descEl) return;

  function activate(wedge) {
    wedges.forEach((w) => {
      w.classList.remove('is-active');
      w.setAttribute('aria-pressed', 'false');
    });
    wedge.classList.add('is-active');
    wedge.setAttribute('aria-pressed', 'true');
    if (numEl) {
      const num = wedge.querySelector('.ejes__wedge-num');
      numEl.textContent = num ? `/ ${num.textContent}` : '';
    }
    titleEl.textContent = wedge.dataset.title || '';
    descEl.textContent = wedge.dataset.desc || '';
    if (logosEl) {
      logosEl.replaceChildren(
        ...(wedge.dataset.logos || '').split(' ').filter(Boolean).map((src) => {
          const img = document.createElement('img');
          img.className = 'ejes__logo';
          img.src = src;
          img.alt = `${logosEl.dataset.alt || ''}: ${wedge.dataset.title || ''}`;
          img.decoding = 'async';
          return img;
        })
      );
    }
  }

  wedges.forEach((wedge) => {
    wedge.addEventListener('click', () => activate(wedge));
    wedge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate(wedge);
      }
    });
  });
})();
