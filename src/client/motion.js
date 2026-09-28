// Page-wide motion: splits section titles into words for the staggered
// heading reveal, and drives the scroll-linked effects (progress bar, hero
// parallax / scroll-out, [data-parallax] images). All scroll work is batched
// into one requestAnimationFrame and only writes CSS custom properties, which
// the stylesheets turn into translate / scale / opacity.
(() => {
  // Word-split every section title (text nodes only, so inline markup
  // survives). Runs even under reduced motion; the CSS simply never hides
  // the words then.
  document.querySelectorAll('.section__head .section__title').forEach((title) => {
    let i = 0;
    Array.from(title.childNodes).forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        const w = document.createElement('span');
        w.className = 'w';
        w.style.setProperty('--i', i++);
        w.textContent = part;
        frag.appendChild(w);
      });
      node.replaceWith(frag);
    });
  });

  // Index schedule items so each day's list can cascade in (see
  // program-timeline.js styles); indexes restart per day panel.
  document.querySelectorAll('.agenda').forEach((list) => {
    Array.from(list.children).forEach((li, i) => li.style.setProperty('--i', i));
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);

  const hero = document.querySelector('.hero');

  // Only parallax images that are on (or near) screen get updated each frame.
  const parallaxEls = new Set();
  const parallaxIo =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) parallaxEls.add(e.target);
              else parallaxEls.delete(e.target);
            }
            schedule();
          },
          { rootMargin: '20% 0px' }
        )
      : null;
  document.querySelectorAll('[data-parallax]').forEach((el) => parallaxIo?.observe(el));

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  function update() {
    queued = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = root.scrollHeight - vh;
    bar.style.setProperty('--progress', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');

    if (hero) {
      const h = hero.offsetHeight;
      if (y <= h) {
        hero.style.setProperty('--hero-y', y.toFixed(1));
        hero.style.setProperty('--hero-out', Math.min(1, y / h).toFixed(3));
      }
    }

    parallaxEls.forEach((el) => {
      const speed = Number(el.dataset.parallax) || 0.1;
      const r = el.parentElement.getBoundingClientRect();
      // Clamped to the 6% overscan the 1.12 scale in global.css provides.
      const limit = r.height * 0.055;
      const offset = Math.max(-limit, Math.min(limit, (r.top + r.height / 2 - vh / 2) * -speed));
      el.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`);
    });
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
})();
