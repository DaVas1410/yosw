// Ported from the inline <script> in src/components/Faq.astro (accordion
// expand/collapse). TypeScript type annotations removed; logic unchanged.

document.querySelectorAll('.faq__q').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const ans = item.querySelector('.faq__a');
    const wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('.faq__item.is-open').forEach((o) => {
      o.classList.remove('is-open');
      o.querySelector('.faq__a').style.maxHeight = '';
    });
    if (!wasOpen) {
      item.classList.add('is-open');
      ans.style.maxHeight = ans.scrollHeight + 'px';
    }
  });
});
