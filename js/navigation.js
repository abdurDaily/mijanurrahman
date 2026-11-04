import { t } from './language.js';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Header: transparent → solid on scroll, inverts over dark sections, active link tracking. */
function initHeader() {
  const header = document.getElementById('site-header');
  const SOLID = ['bg-paper/90', 'backdrop-blur-md', 'shadow-[0_1px_0_rgba(23,23,23,0.08)]'];
  const DARK = ['bg-night/85', 'backdrop-blur-md', 'text-ivory', 'shadow-[0_1px_0_rgba(245,242,235,0.08)]'];
  const darkSections = [...document.querySelectorAll('[data-nav-theme="dark"]')];
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const mid = header.offsetHeight / 2;
    const overDark = darkSections.some((s) => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    header.classList.remove(...SOLID, ...DARK);
    if (overDark) header.classList.add(...DARK);
    else if (y > 40) header.classList.add(...SOLID);
    header.querySelector('nav').classList.toggle('py-5', y <= 40);
    header.querySelector('nav').classList.toggle('py-3', y > 40);
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  // Active section highlighting
  const links = [...document.querySelectorAll('.nav-link')];
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      map.get(en.target.id)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

/** Mobile menu with GSAP open/close. */
function initMobileMenu() {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  const lines = btn.querySelectorAll('.menu-line');
  let open = false;
  let tl = null;

  if (window.gsap) {
    tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
      .set(menu, { visibility: 'visible' })
      .fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8 })
      .to(lines[0], { y: 0, rotate: 45, duration: 0.4 }, 0)
      .to(lines[1], { y: 0, rotate: -45, duration: 0.4 }, 0)
      .fromTo(menu.querySelectorAll('.mm-link'), { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.05, ease: 'expo.out' }, 0.35)
      .fromTo(menu.querySelector('.mm-foot'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.6);
  }

  const toggle = (state = !open) => {
    open = state;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', t(open ? 'a11y.menuClose' : 'a11y.menu'));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('is-locked', open);
    document.getElementById('site-header').classList.toggle('is-menu-open', open);
    if (tl && !reduced()) {
      open ? tl.timeScale(1).play() : tl.timeScale(1.6).reverse();
    } else {
      menu.style.visibility = open ? 'visible' : 'hidden';
      menu.style.clipPath = 'none';
    }
    if (open) {
      menu.style.visibility = 'visible'; // must be focusable before the timeline's first tick
      menu.querySelector('.mm-link')?.focus({ preventScroll: true });
    }
  };

  btn.addEventListener('click', () => toggle());
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) toggle(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { toggle(false); btn.focus(); } });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches && open) toggle(false); });
}

/** Smooth anchor scrolling with header offset (native, respects reduced motion). */
function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - (target.id === 'home' ? 0 : 64);
    window.scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' });
    history.replaceState(null, '', a.getAttribute('href'));
    if (target.id !== 'home') target.setAttribute('tabindex', '-1'), target.focus({ preventScroll: true });
  });
}

export function initNavigation() {
  initHeader();
  initMobileMenu();
  initAnchors();
}
