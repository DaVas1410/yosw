// Ported from src/components/Nav.astro.
// The inline <script> (mobile menu toggle + scroll spy) moves verbatim to
// src/client/nav.js.

import { t } from '../lib/i18n.js';
import { renderLangToggle } from './lang-toggle.js';

export function renderNav({ lang, currentPath }) {
  const links = [
    { href: '#about', label: t(lang, 'nav.about') },
    { href: '#ejes', label: t(lang, 'nav.ejes') },
    { href: '#programa', label: t(lang, 'nav.programa') },
    { href: '#datos', label: t(lang, 'nav.datos') },
    { href: '#participantes', label: t(lang, 'nav.participantes') },
    { href: '#sponsors', label: t(lang, 'nav.sponsors') },
  ];

  return `<header class="nav" id="siteHeader">
  <div class="wrap nav__bar">
    <a class="nav__brand" href="./" aria-label="${t(lang, 'brand.short')}">
      <img class="nav__logo" src="../assets/brand/logo-color.png" alt="${t(lang, 'brand.short')}" width="220" height="101" />
    </a>
    <nav class="nav__links" id="navLinks" aria-label="Navegación principal">
      ${links.map((link) => `<a href="${link.href}">${link.label}</a>`).join('\n      ')}
      <a href="#registro" class="btn btn-primary nav__cta">${t(lang, 'nav.registro')}</a>
      ${renderLangToggle({ lang, currentPath })}
    </nav>
    <button id="menuBtn" aria-label="Abrir menú" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>

<style>
  .nav {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 60;
    background: rgba(244, 245, 242, 0.86);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: box-shadow 0.3s ease, background 0.3s ease;
  }
  .nav.is-scrolled {
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 6px 24px rgba(21, 58, 94, 0.1);
  }
  .nav__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    padding: 0.9rem clamp(1.5rem, 4vw, 3rem);
  }
  .nav__brand {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    text-decoration: none;
  }
  .nav__logo {
    display: block;
    height: 54px;
    width: auto;
  }
  .nav__links {
    display: flex;
    align-items: center;
    gap: 1.4rem;
    flex-wrap: nowrap;
  }
  .nav__links a {
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 1rem;
    color: var(--color-muted);
    text-decoration: none;
    position: relative;
    padding: 0.3rem 0;
    white-space: nowrap;
  }
  .nav__links a::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 0;
    height: 3px;
    border-radius: 99px;
    background: var(--grad-spectrum);
    transition: width 0.3s ease;
  }
  .nav__links a:hover::after,
  .nav__links a.is-active::after {
    width: 100%;
  }
  .nav__links a.is-active {
    color: var(--y-blue);
  }
  .nav__links a.nav__cta {
    padding: 1rem 2.3rem;
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: #fff;
    border-radius: 10px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .nav__cta::after {
    display: none;
  }
  #menuBtn {
    display: none;
    background: none;
    border: 0;
    cursor: pointer;
    width: 44px;
    height: 44px;
    position: relative;
  }
  #menuBtn span {
    position: absolute;
    left: 10px;
    right: 10px;
    height: 3px;
    border-radius: 99px;
    background: var(--y-blue);
    transition: 0.3s ease;
  }
  #menuBtn span:nth-child(1) { top: 14px; }
  #menuBtn span:nth-child(2) { top: 21px; }
  #menuBtn span:nth-child(3) { top: 28px; }
  .nav.is-open #menuBtn span:nth-child(1) { top: 21px; transform: rotate(45deg); }
  .nav.is-open #menuBtn span:nth-child(2) { opacity: 0; }
  .nav.is-open #menuBtn span:nth-child(3) { top: 21px; transform: rotate(-45deg); }

  @media (max-width: 1080px) {
    #menuBtn { display: block; }
    .nav__links {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #fff;
      flex-direction: column;
      align-items: flex-start;
      padding: 1.4rem 5%;
      gap: 1rem;
      box-shadow: 0 20px 30px rgba(21, 58, 94, 0.12);
      transform: scaleY(0);
      transform-origin: top;
      transition: transform 0.3s ease;
      border-top: 1px solid var(--color-border);
    }
    .nav.is-open .nav__links { transform: scaleY(1); }
  }
</style>

<script src="../client/nav.js" defer></script>`;
}
