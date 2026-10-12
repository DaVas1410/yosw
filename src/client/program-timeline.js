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
})();
