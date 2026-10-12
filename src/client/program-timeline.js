// Ported from the inline <script> in src/components/timeline/ProgramTimeline.astro
// (day tab switcher). TypeScript type annotations removed; logic unchanged.

(() => {
  const tabs = document.querySelectorAll('.programa__tab');
  const panels = document.querySelectorAll('.programa__panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((b) => b.classList.remove('is-active'));
      panels.forEach((p) => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      document.querySelector(`[data-panel="${tab.dataset.tab}"]`)?.classList.add('is-active');
    });
  });

  // Room tabs inside a block of simultaneous talks.
  document.querySelectorAll('[data-salas]').forEach((group) => {
    const salaTabs = [...group.querySelectorAll('.salas__tab')];
    const select = (tab) => {
      salaTabs.forEach((b) => {
        const on = b === tab;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        document.getElementById(b.getAttribute('aria-controls'))?.classList.toggle('is-active', on);
      });
    };
    salaTabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = salaTabs[(i + step + salaTabs.length) % salaTabs.length];
        select(next);
        next.focus();
      });
    });
  });
})();
