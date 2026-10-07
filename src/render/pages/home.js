// Ported from src/pages/[lang]/index.astro.
// Assembles the page sections in order: Nav, Hero, Marquee, Cifras, About,
// EjesSection, Ideathon, ProgramTimeline, ParticipantsPreview, Registration,
// Sponsors, Sede, Faq, Footer — wrapped in the Base page shell.

import { renderPageShell } from '../page-shell.js';
import { renderNav } from '../nav.js';
import { renderHero } from '../hero.js';
import { renderMarquee } from '../marquee.js';
import { renderCifras } from '../cifras.js';
import { renderAbout } from '../about.js';
import { renderEjesSection } from '../ejes-section.js';
import { renderIdeathon } from '../ideathon.js';
import { renderProgramTimeline } from '../program-timeline.js';
import { renderParticipantsPreview } from '../participants-preview.js';
import { renderRegistration } from '../registration.js';
import { renderSponsors } from '../sponsors.js';
import { renderSede } from '../sede.js';
import { renderFaq } from '../faq.js';
import { renderFooter } from '../footer.js';

export function renderHomePage({ lang, data }) {
  const { calendario, ejes, participants, sponsors, config, ideathon, cifras } = data;
  const currentPath = `/${lang}`;

  const bodyHtml = `${renderNav({ lang, currentPath })}
<main id="main">
${renderHero({ lang, config })}
${renderMarquee({ lang })}
${renderCifras({ lang, cifras })}
${renderAbout({ lang })}
${renderEjesSection({ lang, ejes })}
${renderIdeathon({ lang, ideathon, formUrl: config.forms.ideathon })}
${renderProgramTimeline({ lang, calendario, ejes })}
${renderParticipantsPreview({ lang, participants, ejes })}
${renderRegistration({ lang, registerHref: config.forms.register })}
${renderSponsors({ lang, sponsors, email: config.social.email, proposalUrl: config.sponsorshipProposalUrl })}
${renderSede({ lang, config })}
${renderFaq({ lang })}
</main>
${renderFooter({ lang, config })}`;

  return renderPageShell({ lang, title: 'Yachay Open Science Week 2026', bodyHtml });
}
