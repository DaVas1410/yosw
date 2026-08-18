// Ported from src/components/Sponsors.astro. No inline <script> in the
// source.

import { t } from '../lib/i18n.js';

const TIERS = ['principal', 'colaborador', 'institucional'];
const TIER_COLORS = {
  principal: 'var(--y-blue)',
  colaborador: 'var(--y-teal)',
  institucional: 'var(--y-purple)',
};

export function renderSponsors({ lang, sponsors, email, proposalUrl }) {
  const groups = TIERS.map((tier) => ({
    tier,
    label: t(lang, `sponsors.${tier}`),
    color: TIER_COLORS[tier],
    items: sponsors.filter((s) => s.nivel === tier),
  }));

  return `<section id="sponsors" class="section sponsors">
  <div class="section__wrap">
    <div class="section__head" data-reveal>
      <span class="eyebrow">${t(lang, 'nav.sponsors')}</span>
      <h2 class="section__title">${t(lang, 'sponsors.heading')}</h2>
      <div class="divider"></div>
    </div>

    <div class="sponsors__tiers">
      ${groups
        .map(
          (group, i) => `<div class="card card--accent sponsors__tier" style="--accent: ${group.color}; --delay: ${i * 100}ms" data-reveal>
        <h3 class="sponsors__tier-label" style="color: ${group.color}">${group.label}</h3>
        ${
          group.items.length > 0
            ? `<div class="sponsors__logos">
          ${group.items
            .map((s) => {
              const inner = s.logo
                ? `<img src="${s.logo}" alt="${s.nombre}" loading="lazy" />`
                : `<span>${s.nombre}</span>`;
              return s.enlace
                ? `<a class="sponsors__logo" href="${s.enlace}" target="_blank" rel="noopener noreferrer">${inner}</a>`
                : `<div class="sponsors__logo">${inner}</div>`;
            })
            .join('\n          ')}
        </div>`
            : `<div class="sponsors__logos">
          <div class="sponsors__logo sponsors__logo--placeholder" aria-hidden="true"></div>
          <div class="sponsors__logo sponsors__logo--placeholder" aria-hidden="true"></div>
        </div>`
        }
      </div>`
        )
        .join('\n      ')}
    </div>

    <div class="sponsors__cta" data-reveal>
      ${
        email
          ? `<a class="sponsors__contact" href="mailto:${email}">${t(lang, 'sponsors.cta')}: ${email}</a>`
          : `<span class="sponsors__contact sponsors__contact--fallback">${t(lang, 'sponsors.contact.fallback')}</span>`
      }
      ${proposalUrl ? `<a class="sponsors__download" href="${proposalUrl}">${t(lang, 'sponsors.download')}</a>` : ''}
    </div>
  </div>
</section>

<style>
  .sponsors__tiers {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: calc(var(--space) * 2.5);
  }
  .sponsors__tier {
    transition-delay: var(--delay);
    padding: clamp(1.4rem, 3vw, 2rem);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .sponsors__tier-label {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    margin: 0;
    text-transform: uppercase;
  }
  .sponsors__logos {
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--space) * 1.5);
  }
  .sponsors__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 120px;
    background: var(--color-surface-solid);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    min-height: 68px;
    padding: var(--space) calc(var(--space) * 2);
    text-decoration: none;
    color: var(--color-text);
    font-family: var(--font-body);
    font-size: 0.9rem;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  a.sponsors__logo:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-sm);
  }
  .sponsors__logo img { max-width: 100%; max-height: 44px; }
  .sponsors__logo--placeholder {
    border-style: dashed;
    background: transparent;
    min-height: 68px;
  }
  .sponsors__cta {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: calc(var(--space) * 2.5);
    margin-top: calc(var(--space) * 4);
  }
  .sponsors__contact {
    font-family: var(--font-body);
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 600;
  }
  .sponsors__contact:hover { text-decoration: underline; }
  .sponsors__contact--fallback { color: var(--color-muted); font-weight: 400; }
  .sponsors__download {
    font-family: var(--font-body);
    color: #fff;
    background: var(--grad-brand);
    text-decoration: none;
    font-weight: 600;
    padding: 0.7rem 1.6rem;
    border-radius: 999px;
    box-shadow: var(--shadow-sm);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .sponsors__download:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  @media (max-width: 760px) {
    .sponsors__tiers { grid-template-columns: 1fr; max-width: 420px; margin-inline: auto; }
  }
</style>`;
}
