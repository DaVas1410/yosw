// Ported from src/components/LangToggle.astro.
// Astro.url.pathname is replaced with an explicit currentPath param the
// caller passes in.

export function renderLangToggle({ lang, currentPath }) {
  const otherLang = lang === 'es' ? 'en' : 'es';
  const targetPath = currentPath.replace(/^\/(es|en)/, `/${otherLang}`);

  return `<a class="lang-toggle" href="${targetPath}">${otherLang.toUpperCase()}</a>

<style>
  .lang-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 3rem;
    font-family: var(--font-body);
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;
    border: 1px solid color-mix(in srgb, var(--color-muted) 40%, transparent);
    border-radius: 10px;
    padding: 0.85rem 1rem;
    font-size: 1rem;
    line-height: 1;
  }
  .lang-toggle:hover {
    color: var(--color-accent);
    border-color: var(--color-accent);
  }
</style>`;
}
