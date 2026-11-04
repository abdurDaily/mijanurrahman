/**
 * Motion: preloader, hero intro, and scroll-driven animations.
 * Everything GSAP-driven lives inside gsap.matchMedia() so it is skipped for
 * prefers-reduced-motion and reverted/cleaned up automatically. Light-weight
 * fade-ups (.reveal) use IntersectionObserver + CSS.
 */
const MOTION_OK = '(prefers-reduced-motion: no-preference)';
// Reveal once and stay. (Not `once: true`: when a page reloads mid-scroll, those
// triggers kill themselves during ScrollTrigger's first refresh and it throws.)
const PLAY_ONCE = 'play none none none';
const has = () => Boolean(window.gsap && window.ScrollTrigger);

/* ───────────── Preloader ───────────── */
export function runPreloader() {
  const pre = document.getElementById('preloader');
  const finish = () => { pre?.remove(); };
  if (!pre) return Promise.resolve();
  if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return Promise.resolve(); }

  const heroImg = document.querySelector('.hero-img');
  const imgReady = heroImg?.complete ? Promise.resolve() : new Promise((r) => { heroImg?.addEventListener('load', r, { once: true }); heroImg?.addEventListener('error', r, { once: true }); });
  const ready = Promise.race([
    Promise.all([document.fonts?.ready ?? Promise.resolve(), imgReady, new Promise((r) => setTimeout(r, 900))]),
    new Promise((r) => setTimeout(r, 3500)), // never hold the site hostage
  ]);

  return ready.then(() => new Promise((resolve) => {
    gsap.timeline({ onComplete: finish })
      .to('.pl-spinner', { scale: 0.6, autoAlpha: 0, duration: 0.5, ease: 'power2.in' })
      .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '-=0.15')
      .add(resolve, '-=0.7'); // start the hero intro while the curtain lifts
  }));
}

/* ───────────── Hero ───────────── */
let heroTl = null;

/** Called before the preloader exits so nothing flashes. */
export function prepareHero() {
  if (!has()) return;
  gsap.matchMedia().add(MOTION_OK, () => {
    heroTl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .from('#site-header', { yPercent: -100, autoAlpha: 0, duration: 1.2 }, 0.3)
      .from('.hero-line > span', { yPercent: 115, duration: 1.4, stagger: 0.09 }, 0)
      .fromTo('.hero-media', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0.05)
      .from('.hero-img', { scale: 1.35, duration: 2.2 }, 0.05)
      .from('.hero-layer', { y: 80, autoAlpha: 0, duration: 1.4 }, 0.7)
      .from('.hero-fade', { y: 24, autoAlpha: 0, duration: 1.2, stagger: 0.1 }, 0.6)
      .from('.hero-float', { autoAlpha: 0, duration: 1.5 }, 1);
    return () => { heroTl = null; };
  });
}

export function playHero() {
  heroTl?.play();
}

/* ───────────── Scroll animations ───────────── */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach((e) => io.observe(e));
}

function initScroll() {
  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    // Section headings
    gsap.utils.toArray('.split-heading').forEach((h) => {
      gsap.from(h, { yPercent: 35, autoAlpha: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%', toggleActions: PLAY_ONCE } });
    });

    // Gallery entrance
    gsap.set('.g-item', { autoAlpha: 0, y: 60 });
    ScrollTrigger.batch('.g-item', {
      start: 'top 92%', toggleActions: PLAY_ONCE,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', overwrite: true }),
    });

    // Featured projects: image wipe + text stagger
    gsap.utils.toArray('.project').forEach((p) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 78%', toggleActions: PLAY_ONCE }, defaults: { ease: 'expo.out' } });
      tl.fromTo(p.querySelector('.proj-media'), { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
        .from(p.querySelectorAll('.proj-text > *'), { y: 40, autoAlpha: 0, duration: 1.1, stagger: 0.08 }, 0.5);
    });

    // Timeline: progressive line + entries
    gsap.fromTo('#timeline-progress', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '#timeline', start: 'top 70%', end: 'bottom 70%', scrub: 0.6 },
    });
    gsap.utils.toArray('.tl-item').forEach((item, i) => {
      gsap.from(item.querySelector('div'), { x: window.innerWidth >= 768 ? (i % 2 ? 50 : -50) : 30, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: item, start: 'top 82%', toggleActions: PLAY_ONCE } });
      gsap.from(item.querySelector('.tl-dot'), { scale: 0, duration: 0.6, ease: 'back.out(3)', scrollTrigger: { trigger: item, start: 'top 82%', toggleActions: PLAY_ONCE } });
    });

    // Lists that benefit from a gentle stagger
    [['.svc-col', '.svc-item'], ['#poem-list', '.poem-row'], ['#performance-grid', '.perf-item']].forEach(([wrap, sel]) => {
      gsap.utils.toArray(wrap).forEach((w) => {
        gsap.from(w.querySelectorAll(sel), { y: 40, autoAlpha: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: w, start: 'top 85%', toggleActions: PLAY_ONCE } });
      });
    });

    // Footer
    gsap.from('.footer-reveal', { y: 60, autoAlpha: 0, duration: 1.2, stagger: 0.15, ease: 'expo.out', scrollTrigger: { trigger: '#footer', start: 'top 85%', toggleActions: PLAY_ONCE } });
  });

  // Parallax & floating accents — desktop/tablet only
  mm.add(`${MOTION_OK} and (min-width: 768px)`, () => {
    gsap.to('.hero-img', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true } });
    // yPercent (not y): the hero intro already animates `y` on this element
    gsap.to('.hero-layer', { yPercent: -45, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-float', { y: -14, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.8 });
    gsap.utils.toArray('.parallax-wrap').forEach((wrap) => {
      const img = wrap.querySelector('.parallax-img');
      if (img) gsap.fromTo(img, { yPercent: -15 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.from('.footer-mark', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.footer-mark', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

export function initAnimations() {
  initReveal();
  if (!has()) return;
  gsap.registerPlugin(ScrollTrigger);
  initScroll();
}
