// Ported from src/components/Footer.astro. No inline <script> in the
// source. Logo image reference updated to /assets/brand/tower-mark.png,
// matching the asset the .astro source imports (import towerMark from
// '../assets/brand/tower-mark.png') — the plan's step text names
// logo-lockup-white.png, but that does not match the current source file,
// so ground truth (tower-mark.png) is used here per the Global Constraints.

import { t } from '../lib/i18n.js';

export function renderFooter({ lang, config }) {
  const { instagram, email, facebook, linkedin } = config.social;
  const year = new Date(config.eventStart).getFullYear();

  return `<footer class="footer">
  <div class="wrap footer__grid">
    <div>
      <div class="footer__brand">
        <img class="footer__tower" src="/assets/brand/tower-mark.png" alt="" aria-hidden="true" width="320" height="780" />
        <b>${t(lang, 'brand.short')}</b>
      </div>
      <p>${t(lang, 'footer.committee')}</p>
      <div class="footer__social">
        ${
          instagram
            ? `<a href="${instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.2" cy="6.8" r=".8"></circle></svg>
        </a>`
            : ''
        }
        ${
          facebook
            ? `<a href="${facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <svg viewBox="0 0 24 24"><path d="M14 9h3V5h-3a4 4 0 0 0-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 0 1 1-1Z"></path></svg>
        </a>`
            : ''
        }
        ${
          linkedin
            ? `<a href="${linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M7.5 9.5v7M7.5 6.5v.01M11.5 16.5v-4a2 2 0 0 1 4 0v4M11.5 16.5v-7"></path></svg>
        </a>`
            : ''
        }
        ${
          email
            ? `<a href="mailto:${email}" aria-label="Email">
          <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 7l9 6 9-6"></path></svg>
        </a>`
            : ''
        }
      </div>
    </div>
    <div>
      <h4>${t(lang, 'footer.explore')}</h4>
      <a href="#about">${t(lang, 'nav.about')}</a>
      <a href="#ejes">${t(lang, 'nav.ejes')}</a>
      <a href="#ideathon">${t(lang, 'idea.heading')}</a>
      <a href="#programa">${t(lang, 'nav.programa')}</a>
      <a href="#sede">${t(lang, 'sede.heading')}</a>
    </div>
    <div>
      <h4>${t(lang, 'footer.participate')}</h4>
      <a href="#registro">${t(lang, 'nav.registro')}</a>
      <a href="#ideathon">${t(lang, 'idea.cta')}</a>
      <a href="#faq">${t(lang, 'faq.heading')}</a>
      <a href="#sponsors">${t(lang, 'nav.sponsors')}</a>
    </div>
    <div>
      <h4>${t(lang, 'footer.contact')}</h4>
      ${
        email
          ? `<a class="footer__link" href="mailto:${email}">${email}</a>`
          : `<span class="footer__fallback">${t(lang, 'footer.email.fallback')}</span>`
      }
      <p>${config.venue[lang]}</p>
    </div>
  </div>
  <div class="wrap footer__bottom">
    <span>© ${year} ${t(lang, 'brand.name')}</span>
    <div class="footer__stripe"></div>
    <span>${t(lang, 'footer.rights')}</span>
  </div>
</footer>

<style>
  .footer {
    background: #12283c;
    color: #c4d2de;
    padding: 4rem 0 0;
  }
  .footer__grid {
    display: grid;
    grid-template-columns: 1.3fr 1fr 1fr 1fr;
    gap: 2.5rem;
    padding-bottom: 3rem;
  }
  .footer__grid h4 {
    color: #fff;
    font-family: var(--font-display);
    font-size: 0.95rem;
    margin: 0 0 1rem;
  }
  .footer__grid a {
    font-size: 0.86rem;
    display: block;
    padding: 0.22rem 0;
    opacity: 0.85;
    text-decoration: none;
    color: inherit;
    transition: 0.25s ease;
  }
  .footer__grid a:hover {
    opacity: 1;
    color: #7db6e8;
    transform: translateX(4px);
  }
  .footer__grid p {
    font-size: 0.86rem;
    opacity: 0.85;
    margin: 0.3rem 0 0;
  }
  .footer__brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1rem;
  }
  .footer__tower {
    width: 18px;
    height: auto;
  }
  .footer__brand b {
    font-family: var(--font-display);
    color: #fff;
    font-size: 1.2rem;
  }
  .footer__social {
    display: flex;
    gap: 0.6rem;
    margin-top: 1rem;
  }
  .footer__social a {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid #3b5a77;
    display: grid;
    place-items: center;
    transition: 0.25s ease;
    padding: 0;
  }
  .footer__social a svg {
    width: 17px;
    height: 17px;
    stroke: #c4d2de;
    fill: none;
    stroke-width: 2;
  }
  .footer__social a:hover {
    background: var(--y-teal);
    border-color: var(--y-teal);
    transform: translateY(-3px);
  }
  .footer__social a:hover svg {
    stroke: #fff;
  }
  .footer__link {
    color: #7db6e8;
  }
  .footer__fallback {
    opacity: 0.7;
  }
  .footer__bottom {
    border-top: 1px solid #24425c;
    padding: 1.2rem 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.8rem;
    font-size: 0.78rem;
    opacity: 0.8;
  }
  .footer__stripe {
    height: 4px;
    width: 90px;
    border-radius: 99px;
    background: var(--grad-spectrum);
  }
  @media (max-width: 1020px) {
    .footer__grid { grid-template-columns: 1fr 1fr; }
  }
</style>`;
}
