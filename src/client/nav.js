// Ported from the inline <script> in src/components/Nav.astro (mobile menu
// toggle + scroll-spy). TypeScript type annotations removed; logic unchanged.

(() => {
  function spy() {
    const y = window.scrollY + 140;
    let current = null;
    spySecs.forEach(([link, sec]) => {
      if (sec.offsetTop <= y) current = link;
    });
    spyLinks.forEach((l) => l.classList.toggle('is-active', l === current));
  }

  const header = document.getElementById('siteHeader');
  const menuBtn = document.getElementById('menuBtn');
  if (header && menuBtn) {
    window.addEventListener(
      'scroll',
      () => {
        header.classList.toggle('is-scrolled', window.scrollY > 40);
        spy();
      },
      { passive: true }
    );
    menuBtn.addEventListener('click', () => header.classList.toggle('is-open'));
    header.querySelectorAll('.nav__links a').forEach((a) =>
      a.addEventListener('click', () => header.classList.remove('is-open'))
    );
  }

  const spyLinks = Array.from(
    document.querySelectorAll('.nav__links a[href^="#"]:not(.nav__cta)')
  );
  const spySecs = [];
  spyLinks.forEach((l) => {
    const sec = document.querySelector(l.getAttribute('href') || '');
    if (sec) spySecs.push([l, sec]);
  });
  spy();
})();
