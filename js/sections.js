import { PERSON, PROJECTS, ACHIEVEMENTS, SERVICES, POSTS, TESTIMONIALS, CONTACT, SOCIAL } from './data.js';
import { bi, biKey, esc, altAttr, t } from './language.js';
import { openLightbox } from './gallery.js';
import { openModal } from './modal.js';
import { brandIcon } from './icons.js';

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, '0');
const sampleTag = (key = 'sample') => `<span class="sample-tag">${biKey(key)}</span>`;
export const whatsappUrl = (msg) => (CONTACT.whatsapp ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}` : null);

/* ── About ── */
function initAbout() {
  const btn = $('about-toggle'), more = $('about-more');
  btn?.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    more.setAttribute('aria-hidden', String(!open));
    btn.querySelector('[data-i18n]').dataset.i18n = open ? 'about.less' : 'about.more';
    btn.querySelector('[data-i18n]').textContent = t(open ? 'about.less' : 'about.more');
    btn.querySelector('svg')?.style.setProperty('transform', open ? 'rotate(45deg)' : '');
    if (open) {
      more.classList.remove('hidden');
      window.gsap?.from(more, { height: 0, autoAlpha: 0, duration: 0.7, ease: 'expo.out', clearProps: 'height' });
    } else more.classList.add('hidden');
    window.ScrollTrigger?.refresh();
  });
  if (PERSON.biographyPdf) {
    const a = $('bio-download');
    a.href = PERSON.biographyPdf;
    a.classList.remove('hidden');
  }
}

/* ── Selected stories ── */
function initProjects() {
  const list = $('projects-list');
  list.innerHTML = PROJECTS.map((p, i) => {
    const flip = i % 2 === 1;
    return `
    <article class="project grid items-center gap-8 md:grid-cols-12 md:gap-10">
      <div class="md:col-span-7 md:row-start-1 ${flip ? 'md:col-start-6' : 'md:col-start-1'}">
        <button type="button" data-project="${i}" class="proj-media parallax-wrap img-zoom relative block aspect-[4/3] w-full overflow-hidden bg-sand">
          <img class="parallax-img absolute inset-0 h-[118%] w-full object-cover" src="${p.img.src}" srcset="${p.img.srcset}" sizes="(min-width:768px) 58vw, 92vw" width="1200" height="900" loading="lazy" ${altAttr(p.title)} />
        </button>
      </div>
      <div class="proj-text md:col-span-4 md:row-start-1 ${flip ? 'md:col-start-1' : 'md:col-start-9'}">
        <p class="mb-6 font-display text-7xl font-light leading-none text-gold/40 md:text-8xl">${pad(i + 1)}</p>
        <p class="label mb-4 text-mute">${bi(p.category)} — ${esc(p.year)}</p>
        <h3 class="mb-5 font-display text-4xl font-light leading-tight md:text-5xl">${bi(p.title)}</h3>
        <p class="mb-8 leading-relaxed text-mute">${bi(p.text)}</p>
        <div class="flex flex-wrap items-center gap-4">
          <button type="button" data-project="${i}" class="link-u label inline-flex items-center gap-2 text-ink">${biKey('proj.view')} <span aria-hidden="true">→</span></button>
          ${p.sample ? sampleTag() : ''}
        </div>
      </div>
    </article>`;
  }).join('');
  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-project]');
    if (!b) return;
    const items = PROJECTS.map((p) => ({ img: p.img, title: p.title, meta: { en: `${p.category.en} — ${p.year}`, bn: `${p.category.bn} — ${p.year}` }, text: p.text }));
    openLightbox(items, Number(b.dataset.project));
  });
}

/* ── Timeline ── */
function initTimeline() {
  const ol = $('timeline');
  ol.innerHTML = ACHIEVEMENTS.map((a, i) => {
    const right = i % 2 === 1;
    return `
    <li class="tl-item relative pl-12 md:grid md:grid-cols-2 md:gap-20 md:pl-0">
      <span class="tl-dot absolute left-4 top-3 h-3 w-3 -translate-x-1/2 rounded-full border border-gold bg-paper md:left-1/2" aria-hidden="true"></span>
      <div class="${right ? 'md:col-start-2' : 'md:text-right'}">
        <p class="mb-3 font-display text-5xl font-light text-gold">${esc(a.year)}</p>
        <p class="label mb-3 text-mute">${bi(a.type)}</p>
        <h3 class="mb-2 font-display text-3xl leading-tight">${bi(a.title)}</h3>
        <p class="mb-3 text-sm font-medium text-ink/70">${bi(a.org)}</p>
        <p class="leading-relaxed text-mute">${bi(a.text)}</p>
        <div class="mt-4 flex gap-2 ${right ? '' : 'md:justify-end'}">${a.confirm ? sampleTag('ach.confirm') : ''}${a.sample ? sampleTag() : ''}</div>
        ${a.img ? `
        <button type="button" data-ach="${i}" class="img-zoom mt-6 block aspect-[16/10] w-full overflow-hidden bg-sand md:max-w-md ${right ? '' : 'md:ml-auto'}">
          <img class="h-full w-full object-cover" src="${a.img.src}" width="800" height="500" loading="lazy" ${altAttr(a.title)} />
        </button>` : ''}
      </div>
    </li>`;
  }).join('');
  ol.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ach]');
    if (!b) return;
    const withImg = ACHIEVEMENTS.filter((a) => a.img);
    const items = withImg.map((a) => ({ img: a.img, title: a.title, meta: a.org, text: a.text }));
    openLightbox(items, withImg.indexOf(ACHIEVEMENTS[Number(b.dataset.ach)]));
  });
}

/* ── Services ── */
function initServices() {
  $('services-list').innerHTML = SERVICES.map((s) => {
    const wa = whatsappUrl(`Hello Mijan, I'd like to inquire about ${s.name.en.toLowerCase()}.`);
    return `
    <div class="svc-col">
      <div class="mb-8 flex items-center gap-4">
        <span class="flex h-12 w-12 items-center justify-center border border-ink/15 text-gold"><i data-lucide="${s.icon}" class="h-5 w-5"></i></span>
        <h3 class="font-display text-4xl font-light">${bi(s.name)}</h3>
      </div>
      <ul class="mb-10 border-b border-ink/10">
        ${s.items.map((it, i) => `
        <li class="svc-item grid grid-cols-[3rem_1fr] gap-2 border-t border-ink/10 py-6">
          <span class="label pt-2 tabular-nums text-gold-deep">${pad(i + 1)}</span>
          <div>
            <p class="mb-1 font-display text-2xl">${bi(it)}</p>
            <p class="text-sm leading-relaxed text-mute">${bi(it.d)}</p>
          </div>
        </li>`).join('')}
      </ul>
      <div class="flex flex-wrap gap-3">
        <a href="#contact" class="btn btn-dark" data-inquiry="${s.inquiry}"><span>${biKey('svc.book')}</span><i data-lucide="arrow-up-right" class="h-4 w-4"></i></a>
        ${wa ? `<a href="${wa}" target="_blank" rel="noopener noreferrer" class="btn btn-line">${brandIcon('whatsapp', 'relative z-[1] h-4 w-4')}<span>${biKey('svc.whatsapp')}</span></a>` : ''}
      </div>
    </div>`;
  }).join('');
}

/* ── Journal ── */
const fmtDate = (iso, lang) => new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
const dateBi = (iso) => bi({ en: fmtDate(iso, 'en'), bn: fmtDate(iso, 'bn') });

function initJournal() {
  $('post-list').innerHTML = POSTS.map((p, i) => {
    const lead = i === 0;
    return `
    <article class="post reveal group ${lead ? 'md:col-span-7 md:row-span-2' : 'md:col-span-5'}">
      <button type="button" data-post="${i}" class="img-zoom mb-6 block w-full overflow-hidden bg-sand ${lead ? 'aspect-[4/3]' : 'aspect-[16/9]'}">
        <img class="h-full w-full object-cover" src="${p.img.src}" width="900" height="640" loading="lazy" ${altAttr(p.title)} />
      </button>
      <p class="label mb-3 flex flex-wrap items-center gap-3 text-mute"><span class="text-gold-deep">${bi(p.category)}</span><span aria-hidden="true">·</span><time datetime="${p.date}">${dateBi(p.date)}</time>${p.sample ? sampleTag() : ''}</p>
      <h3 class="mb-3 font-display ${lead ? 'text-4xl md:text-5xl' : 'text-3xl'} font-light leading-tight">${bi(p.title)}</h3>
      <p class="mb-5 text-mute">${bi(p.excerpt)}</p>
      <button type="button" data-post="${i}" class="link-u label inline-flex items-center gap-2">${biKey('blog.read')} <span aria-hidden="true">→</span></button>
    </article>`;
  }).join('');

  $('post-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-post]');
    if (!b) return;
    const p = POSTS[Number(b.dataset.post)];
    const paras = (lang) => p.body[lang].map((x) => `<p class="bi" lang="${lang}">${esc(x)}</p>`).join('');
    $('article-body').innerHTML = `
      <p class="label mb-6 flex flex-wrap items-center gap-3 text-mute"><span class="text-gold-deep">${bi(p.category)}</span><span>·</span><time datetime="${p.date}">${dateBi(p.date)}</time>${p.sample ? sampleTag() : ''}</p>
      <h2 id="article-title" class="h-display mb-10 text-5xl md:text-7xl">${bi(p.title)}</h2>
      <img class="mb-12 aspect-[16/10] w-full object-cover" src="${p.img.full}" width="1800" height="1280" ${altAttr(p.title)} />
      <div class="space-y-6 text-lg leading-relaxed text-ink/80">${paras('en')}${paras('bn')}</div>`;
    openModal($('article-modal'));
    $('article-modal').scrollTop = 0;
  });
}

/* ── Testimonials ── */
function initTestimonials() {
  const track = $('test-track'), count = $('test-count');
  track.innerHTML = TESTIMONIALS.map((q, i) => `
    <figure class="test-slide ${i ? 'hidden' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${TESTIMONIALS.length}">
      <span class="block font-display text-8xl leading-[0.5] text-gold/40" aria-hidden="true">“</span>
      <blockquote class="mb-10 font-display text-3xl font-light italic leading-snug md:text-[2.75rem]">${bi(q.quote)}</blockquote>
      <figcaption class="flex flex-wrap items-center gap-4">
        <span class="h-px w-10 bg-gold"></span>
        <span><span class="block font-medium">${bi(q.name)}</span><span class="text-sm text-mute">${bi(q.role)}</span></span>
        ${q.sample ? sampleTag() : ''}
      </figcaption>
    </figure>`).join('');
  const slides = [...track.children];
  let i = 0;
  const show = (n) => {
    const prev = slides[i];
    i = (n + slides.length) % slides.length;
    count.textContent = `${pad(i + 1)} / ${pad(slides.length)}`;
    if (prev === slides[i]) return;
    prev.classList.add('hidden');
    slides[i].classList.remove('hidden');
    window.gsap?.fromTo(slides[i], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out' });
  };
  show(0);
  $('test-prev').addEventListener('click', () => show(i - 1));
  $('test-next').addEventListener('click', () => show(i + 1));
  if (slides.length < 2) { $('test-prev').hidden = true; $('test-next').hidden = true; }
}

/* ── Contact links & footer ── */
function contactItems() {
  const items = [];
  if (CONTACT.email) items.push({ href: `mailto:${CONTACT.email}`, icon: '<i data-lucide="mail" class="h-[18px] w-[18px]"></i>', label: CONTACT.email });
  if (CONTACT.phone) items.push({ href: `tel:${CONTACT.phone.replace(/[^\d+]/g, '')}`, icon: '<i data-lucide="phone" class="h-[18px] w-[18px]"></i>', label: CONTACT.phone });
  const wa = whatsappUrl('Hello Mijan,');
  if (wa) items.push({ href: wa, icon: brandIcon('whatsapp'), label: 'WhatsApp', ext: true });
  SOCIAL.filter((s) => s.url).forEach((s) => items.push({ href: s.url, icon: brandIcon(s.id), label: s.label, ext: true }));
  return items;
}

function initContactLinks() {
  const items = contactItems();
  const li = (it, cls) => `<li><a href="${it.href}" ${it.ext ? 'target="_blank" rel="noopener noreferrer"' : ''} class="${cls}">${it.icon}<span>${esc(it.label)}</span></a></li>`;
  $('contact-links').innerHTML = items.map((it) => li(it, 'group flex items-center gap-4 text-lg transition-colors hover:text-gold-deep')).join('');
  $('footer-contact').innerHTML = items.filter((it) => !SOCIAL.some((s) => s.url === it.href)).map((it) => li(it, 'inline-flex items-center gap-3 hover:text-ivory')).join('');
  $('year').textContent = new Date().getFullYear();
  $('to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));

  // "Send an Inquiry" buttons preselect the inquiry type in the form
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-inquiry]');
    if (a) { const sel = $('cf-type'); if (sel) sel.value = a.dataset.inquiry; }
  });
}

export function initSections() {
  initAbout();
  initProjects();
  initTimeline();
  initServices();
  initJournal();
  initTestimonials();
  initContactLinks();
}
