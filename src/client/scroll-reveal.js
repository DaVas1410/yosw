// Reveal-on-scroll for any [data-reveal] element.
// Ported verbatim from the inline <script> in src/layouts/Base.astro.
// Wrapped in an IIFE so its top-level declarations don't collide with other
// classic <script> tags sharing this page's global scope.
(() => {
  const els = document.querySelectorAll('[data-reveal]');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('is-visible'));
  }
})();
