// Reveal-on-scroll for [data-reveal] blocks and [data-reveal-stagger]
// containers (whose direct children arrive one after another).
// Ported from the inline <script> in src/layouts/Base.astro.
// Wrapped in an IIFE so its top-level declarations don't collide with other
// classic <script> tags sharing this page's global scope.
(() => {
  const els = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  document.querySelectorAll('[data-reveal-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => child.style.setProperty('--i', i));
  });
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const el = e.target;
          el.style.willChange = 'opacity, translate';
          el.addEventListener('transitionend', () => { el.style.willChange = ''; }, { once: true });
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      }
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('is-visible'));
  }
})();
