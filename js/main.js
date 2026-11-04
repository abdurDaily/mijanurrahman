import { SOCIAL } from './data.js';
import { initLanguage } from './language.js';
import { renderSocialLinks } from './icons.js';
import { initModals } from './modal.js';
import { initNavigation } from './navigation.js';
import { initGallery } from './gallery.js';
import { initRecitation } from './audio-player.js';
import { initVideos } from './video.js';
import { initSections } from './sections.js';
import { initContact } from './contact.js';
import { runPreloader, prepareHero, playHero, initAnimations } from './animations.js';
import { initHeroScene } from './three-scene.js';

/** Run one boot step; a failure is logged but never blocks the rest of the page. */
function step(name, fn) {
  try { return fn(); } catch (err) { console.error(`[boot:${name}]`, err); return undefined; }
}

// 1. Render data-driven content
step('social', () => renderSocialLinks(SOCIAL));
step('modals', initModals);
step('gallery', initGallery);
step('recitation', initRecitation);
step('videos', initVideos);
step('sections', initSections);
step('icons', () => window.lucide?.createIcons());

// 2. Behaviour
step('language', initLanguage);
step('navigation', initNavigation);
step('contact', initContact);

// 3. Motion — if any of it fails, content must still be revealed
step('hero', prepareHero);
step('animations', initAnimations);
(step('preloader', runPreloader) ?? Promise.resolve())
  .catch((err) => { console.error('[boot:preloader]', err); document.getElementById('preloader')?.remove(); })
  .finally(() => {
    step('hero-play', playHero);
    // Three.js loads after first paint so it never delays content
    const start = () => initHeroScene(document.getElementById('hero-canvas')).catch((err) => console.error('[boot:three]', err));
    'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300);
  });
