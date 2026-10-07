// Ported from the inline <script> in src/components/Cifras.astro (count-up
// animation). TypeScript type annotations removed; logic unchanged.

(() => {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target;
        const end = Number(el.dataset.count) || 0;
        const start = performance.now();
        const dur = 1100;
        const step = (now) => {
          const p = Math.min(1, (now - start) / dur);
          el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      }
    },
    { threshold: 0.6 }
  );
  // The HTML carries the final values (correct without JS); reset to 0 so
  // the count-up starts from zero once the band scrolls into view.
  document.querySelectorAll('.cifras__num').forEach((el) => {
    el.textContent = '0';
    io.observe(el);
  });
})();
