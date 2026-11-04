import { PHOTOS, PHOTO_CATEGORIES } from './data.js';
import { bi, esc, altAttr, getLang, t } from './language.js';
import { openModal, isModalOpen } from './modal.js';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const catLabel = (id) => PHOTO_CATEGORIES.find((c) => c.id === id) ?? { en: id, bn: id };

/* ───────────────────────── Lightbox ───────────────────────── */
// items: [{ img: {src, full}, title: {en,bn}, meta: {en,bn}|string, text?: {en,bn} }]
const lb = { items: [], index: 0, el: null, img: null };

function renderLightbox(direction = 0) {
  const item = lb.items[lb.index];
  const { img, caption, count } = lb;
  count.textContent = `${String(lb.index + 1).padStart(2, '0')} / ${String(lb.items.length).padStart(2, '0')}`;
  caption.innerHTML = `
    <p class="label mb-2 text-gold-soft">${bi(item.meta)}</p>
    <p class="font-display text-2xl font-light md:text-3xl">${bi(item.title)}</p>
    ${item.text ? `<p class="mx-auto mt-3 max-w-xl text-sm text-ivory/60">${bi(item.text)}</p>` : ''}`;
  const multi = lb.items.length > 1;
  lb.prev.hidden = !multi; lb.next.hidden = !multi;

  const swap = () => {
    img.src = item.img.full ?? item.img.src;
    const title = item.title ?? { en: '', bn: '' };
    img.alt = typeof title === 'string' ? title : title[getLang()];
  };
  if (!window.gsap || reduced() || !direction) { swap(); return; }
  const loader = new Image();
  loader.src = item.img.full ?? item.img.src;
  gsap.to(img, {
    autoAlpha: 0, x: -40 * direction, duration: 0.25, ease: 'power2.in',
    onComplete: () => {
      const show = () => { swap(); gsap.fromTo(img, { autoAlpha: 0, x: 40 * direction }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'expo.out' }); };
      loader.complete ? show() : (loader.onload = loader.onerror = show);
    },
  });
}

function step(dir) {
  if (lb.items.length < 2) return;
  lb.index = (lb.index + dir + lb.items.length) % lb.items.length;
  renderLightbox(dir);
}

export function openLightbox(items, index = 0) {
  lb.items = items; lb.index = index;
  if (window.gsap) gsap.set(lb.img, { autoAlpha: 1, x: 0 });
  renderLightbox(0);
  openModal(lb.el, { onClose: () => { lb.img.removeAttribute('src'); } });
}

function initLightbox() {
  lb.el = document.getElementById('lightbox');
  lb.img = document.getElementById('lb-img');
  lb.caption = document.getElementById('lb-caption');
  lb.count = document.getElementById('lb-count');
  lb.prev = document.getElementById('lb-prev');
  lb.next = document.getElementById('lb-next');
  lb.prev.addEventListener('click', () => step(-1));
  lb.next.addEventListener('click', () => step(1));
  document.addEventListener('keydown', (e) => {
    if (!isModalOpen(lb.el)) return;
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  // Touch swipe
  let x0 = null;
  lb.el.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.el.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    x0 = null;
  });
}

/* ───────────────────────── Gallery ───────────────────────── */
const SIZES = { std: '(min-width:768px) 32vw, 50vw', tall: '(min-width:768px) 32vw, 50vw', wide: '(min-width:768px) 64vw, 100vw' };
const DIMS = { std: [640, 640], tall: [640, 900], wide: [960, 640] };

function galleryItemHTML(p, i) {
  const [w, h] = DIMS[p.size];
  const cat = catLabel(p.cat);
  return `
  <figure class="g-item g-${p.size} group relative overflow-hidden bg-ink/5" data-cat="${p.cat}" data-index="${i}">
    <button type="button" class="img-zoom block h-full w-full" data-open="${i}" aria-label="${esc(p.title.en)}" data-label-en="${esc(p.title.en)}" data-label-bn="${esc(p.title.bn)}">
      <img class="h-full w-full object-cover" src="${p.img.src}" srcset="${p.img.srcset}" sizes="${SIZES[p.size]}" width="${w}" height="${h}" loading="lazy" decoding="async" ${altAttr(p.title)} />
    </button>
    <figcaption class="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 items-end justify-between gap-4 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16 text-ivory opacity-0 transition duration-500 ease-expo group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 md:p-5">
      <span><span class="label mb-1 block text-ivory/70">${bi(cat)}</span><span class="font-display text-xl md:text-2xl">${bi(p.title)}</span></span>
      <span class="label tabular-nums text-ivory/60">${String(i + 1).padStart(2, '0')}</span>
    </figcaption>
  </figure>`;
}

const toLightboxItem = (p) => ({ img: p.img, title: p.title, meta: catLabel(p.cat) });

export function initGallery() {
  initLightbox();
  const grid = document.getElementById('gallery');
  const filters = document.getElementById('gallery-filters');
  if (!grid || !filters) return;

  grid.innerHTML = PHOTOS.map(galleryItemHTML).join('');
  filters.innerHTML = PHOTO_CATEGORIES.map((c) =>
    `<button type="button" class="chip shrink-0" data-filter="${c.id}" aria-pressed="${c.id === 'all'}">${bi(c)}</button>`).join('');

  let activeCat = 'all';
  const visible = () => PHOTOS.map((p, i) => ({ p, i })).filter(({ p }) => activeCat === 'all' || p.cat === activeCat);

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open]');
    if (!btn) return;
    const list = visible();
    const pos = list.findIndex(({ i }) => i === Number(btn.dataset.open));
    openLightbox(list.map(({ p }) => toLightboxItem(p)), Math.max(0, pos));
  });

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn || btn.dataset.filter === activeCat) return;
    activeCat = btn.dataset.filter;
    filters.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const items = [...grid.children];
    const apply = () => {
      items.forEach((el) => { el.hidden = !(activeCat === 'all' || el.dataset.cat === activeCat); });
      const shown = items.filter((el) => !el.hidden);
      if (window.gsap && !reduced()) {
        gsap.fromTo(shown, { autoAlpha: 0, y: 30, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.05, ease: 'expo.out' });
      }
      window.ScrollTrigger?.refresh();
    };
    if (window.gsap && !reduced()) {
      gsap.to(items.filter((el) => !el.hidden), { autoAlpha: 0, y: -10, duration: 0.25, stagger: 0.015, ease: 'power1.in', onComplete: apply });
    } else apply();
  });

  // Translate the per-item button labels on language change
  document.addEventListener('langchange', () => {
    const key = getLang() === 'bn' ? 'labelBn' : 'labelEn';
    grid.querySelectorAll('[data-open]').forEach((b) => b.setAttribute('aria-label', `${t('a11y.open')}: ${b.dataset[key]}`));
  });
}
