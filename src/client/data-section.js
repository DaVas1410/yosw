// Ported from the inline <script> in src/components/data/DataSection.astro
// (bar-fill reveal animation). TypeScript type annotations removed; logic
// unchanged.

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const fills = e.target.querySelectorAll('.datos__bar-fill');
      fills.forEach((f, i) => {
        setTimeout(() => {
          f.style.width = (f.dataset.pct || '0') + '%';
        }, i * 70);
      });
      io.unobserve(e.target);
    }
  },
  { threshold: 0.3 }
);
document.querySelectorAll('.datos__bars').forEach((el) => io.observe(el));
