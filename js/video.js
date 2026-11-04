/**
 * Videos: "Video Recitations" rail (Recitation section) and the "Films & Reels"
 * screening room (stage + playlist). Previews are Facebook's / YouTube's official
 * embed players, loaded lazily when they approach the viewport.
 */
import { VIDEOS, VIDEO_KINDS, POETS } from './data.js';
import { bi, biKey, esc } from './language.js';
import { openModal } from './modal.js';

const pad = (n) => String(n).padStart(2, '0');
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const titleOf = (v) => v.title ?? VIDEO_KINDS[v.kind]; // never invent a title
const poetOf = (v) => (v.poet ? POETS.find((p) => p.id === v.poet) : null);
const sourceUrl = (v) => (v.platform === 'facebook' ? `https://www.facebook.com/reel/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`);
const platformName = (v) => (v.platform === 'facebook' ? 'Facebook' : 'YouTube');
const playIcon = (cls = 'h-4 w-4') => `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>`;

/*
 * Branded preview skin.
 * Facebook's embed draws a header bar (page name + Share) and a large play button.
 * The iframe is extended CROP px above the frame so the header is clipped away, and
 * the skin's play button sits exactly over Facebook's (whose centre moves up by
 * CROP/2). The skin ignores pointer events, so the click lands on Facebook's real
 * button; once the iframe takes focus (= playback started) the skin fades out.
 */
const CROP = 64;
const isFb = (v) => v.platform === 'facebook';

/** Official embed URL sized to the iframe it will live in. */
function embedUrl(v, w, h) {
  if (isFb(v)) {
    const href = encodeURIComponent(sourceUrl(v));
    return `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&width=${Math.max(220, Math.round(w))}&height=${Math.round(h)}`;
  }
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?rel=0`;
}

const iframeHTML = (v) => {
  const pos = isFb(v) ? `style="top:-${CROP}px;height:calc(100% + ${CROP}px)" class="absolute inset-x-0 w-full` : 'class="absolute inset-0 h-full w-full';
  return `<iframe ${pos} bg-night opacity-0 transition-opacity duration-700" title="${esc(titleOf(v).en)}" allow="clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen" allowfullscreen scrolling="no"></iframe>`;
};

/** Placeholder shown while the embed loads (and if it never does). */
const posterHTML = (n, kind) => `
  <span class="absolute inset-0 flex flex-col justify-between bg-[radial-gradient(120%_70%_at_50%_0%,rgba(164,123,69,0.25),transparent_65%)] p-5">
    <span class="font-display text-7xl font-light leading-none text-ivory/15">${pad(n)}</span>
    <span class="flex items-center gap-3 text-ivory/60"><span class="h-px w-8 bg-gold-soft/60"></span><span class="label">${bi(kind)}</span></span>
  </span>`;

const skinHTML = (v, size = 'md') => {
  if (!isFb(v)) return '';
  const btn = size === 'lg' ? 'h-24 w-24' : 'h-[84px] w-[84px]';
  return `
  <span class="vid-skin pointer-events-none absolute inset-0 transition-opacity duration-500" aria-hidden="true">
    <span class="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent"></span>
    <span class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent"></span>
    <span class="absolute left-1/2 flex ${btn} -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-night shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition duration-500 group-hover/frame:scale-105 group-hover/frame:bg-gold-soft" style="top:calc(50% - ${CROP / 2}px)">
      <span class="absolute -inset-2.5 rounded-full border border-ivory/40 transition-all duration-700 group-hover/frame:-inset-4 group-hover/frame:border-gold-soft/70"></span>
      ${playIcon('ml-1 h-7 w-7')}
    </span>
    <span class="absolute bottom-4 left-4 flex items-center gap-2 text-ivory/85">
      <span class="h-px w-6 bg-gold-soft"></span><span class="label">${v.vertical ? 'Reel' : 'Video'}</span>
    </span>
  </span>`;
};

const frameInner = (v, n, size) => posterHTML(n, VIDEO_KINDS[v.kind]) + iframeHTML(v) + skinHTML(v, size);

/** Load an iframe's embed once its frame is near the viewport (and sized). */
const lazyFrames = new IntersectionObserver((entries) => {
  entries.forEach(({ isIntersecting, target }) => {
    if (!isIntersecting) return;
    lazyFrames.unobserve(target);
    loadFrame(target, VIDEOS[Number(target.dataset.vid)]);
  });
}, { rootMargin: '300px 0px' });

function loadFrame(frame, v) {
  const iframe = frame.querySelector('iframe');
  frame.classList.remove('is-playing');
  iframe.onload = () => iframe.classList.remove('opacity-0');
  iframe.src = embedUrl(v, frame.clientWidth, frame.clientHeight + (isFb(v) ? CROP : 0));
}

/* A click inside a cross-origin player moves focus into its iframe: hide that skin. */
let focusWatch = 0;
const markPlaying = () => {
  const el = document.activeElement;
  if (el?.tagName === 'IFRAME') el.closest('.vid-frame')?.classList.add('is-playing');
};
window.addEventListener('blur', () => {
  setTimeout(markPlaying, 0);
  clearInterval(focusWatch);
  focusWatch = setInterval(markPlaying, 400); // focus can hop between iframes without a new blur
});
window.addEventListener('focus', () => clearInterval(focusWatch));

/* ───────────── Modal (enlarge) ───────────── */
function openVideo(v) {
  const frame = document.getElementById('video-frame');
  frame.className = `vid-frame group/frame relative overflow-hidden bg-night ${v.vertical ? 'aspect-[9/16] h-[min(80vh,760px)] max-w-full' : 'aspect-video w-full max-w-5xl'}`;
  frame.innerHTML = frameInner(v, 1, 'lg');
  const link = document.getElementById('video-source');
  link.href = sourceUrl(v);
  link.innerHTML = `${biKey(isFb(v) ? 'video.onFacebook' : 'video.onYoutube')} <span aria-hidden="true">↗</span>`;
  openModal(document.getElementById('video-modal'), { onClose: () => { frame.innerHTML = ''; } });
  requestAnimationFrame(() => loadFrame(frame, v));
}

/* ───────────── Recitation rail ───────────── */
function renderRail(container, list) {
  container.innerHTML = list.map(({ v, i }, k) => {
    const poet = poetOf(v);
    return `
    <article class="vid-card reveal group w-[72vw] max-w-[300px] shrink-0 snap-start sm:w-[260px] lg:w-auto lg:max-w-none">
      <div class="vid-frame group/frame relative aspect-[9/16] overflow-hidden border border-night-line bg-night-2" data-vid="${i}">
        ${frameInner(v, k + 1)}
      </div>
      <div class="flex items-start justify-between gap-3 pt-4">
        <div>
          <p class="label mb-1 text-gold-soft">${pad(k + 1)} · ${poet ? bi(poet) : bi(VIDEO_KINDS[v.kind])}</p>
          <p class="font-display text-xl font-light leading-snug">${bi(titleOf(v))}</p>
        </div>
        <button type="button" data-enlarge="${i}" class="flex h-9 w-9 shrink-0 items-center justify-center border border-ivory/15 text-ivory/70 transition hover:border-gold-soft hover:text-gold-soft" data-i18n-attr="aria-label:video.enlarge" aria-label="Watch larger">
          <i data-lucide="maximize-2" class="h-4 w-4"></i>
        </button>
      </div>
    </article>`;
  }).join('');
  container.querySelectorAll('.vid-frame').forEach((f) => lazyFrames.observe(f));
  container.addEventListener('click', (e) => {
    const b = e.target.closest('[data-enlarge]');
    if (b) openVideo(VIDEOS[Number(b.dataset.enlarge)]);
  });
}

/* ───────────── Films screening room ───────────── */
function renderScreeningRoom(root, list) {
  const stage = root.querySelector('#film-stage');
  const playlist = root.querySelector('#film-playlist');
  const now = root.querySelector('#film-now');
  const source = root.querySelector('#film-source');
  let current = 0;

  playlist.innerHTML = list.map(({ v }, k) => `
    <li>
      <button type="button" data-film="${k}" class="film-row group relative grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-ink/10 py-5 text-left transition-colors hover:text-gold-deep aria-[current=true]:text-gold-deep">
        <span class="absolute inset-y-0 -left-4 w-0.5 origin-top scale-y-0 bg-gold transition-transform duration-500 group-aria-[current=true]:scale-y-100" aria-hidden="true"></span>
        <span class="label tabular-nums text-mute group-aria-[current=true]:text-gold-deep">${pad(k + 1)}</span>
        <span>
          <span class="block font-display text-2xl font-light leading-tight md:text-3xl">${bi(titleOf(v))}</span>
          <span class="mt-1 block text-xs text-mute">${v.title ? `${bi(VIDEO_KINDS[v.kind])} · ` : ''}${platformName(v)}</span>
        </span>
        <span class="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 transition group-hover:border-ink group-aria-[current=true]:border-ink group-aria-[current=true]:bg-ink group-aria-[current=true]:text-paper">${playIcon('ml-0.5 h-3.5 w-3.5')}</span>
      </button>
    </li>`).join('');

  const show = (k) => {
    current = (k + list.length) % list.length;
    const { v } = list[current];
    playlist.querySelectorAll('[data-film]').forEach((b) => b.setAttribute('aria-current', String(Number(b.dataset.film) === current)));
    now.innerHTML = `
      <p class="label mb-3 tabular-nums text-gold-deep">${pad(current + 1)} / ${pad(list.length)} · ${platformName(v)}</p>
      <p class="h-display text-5xl md:text-6xl">${bi(titleOf(v))}</p>`;
    source.href = sourceUrl(v);
    source.innerHTML = `${biKey(v.platform === 'facebook' ? 'video.onFacebook' : 'video.onYoutube')} <span aria-hidden="true">↗</span>`;
    stage.dataset.vid = String(list[current].i);
    stage.innerHTML = frameInner(v, current + 1, 'lg');
    if (stage.dataset.ready) loadFrame(stage, v);
    else lazyFrames.observe(stage);
    stage.dataset.ready = '1';
    if (window.gsap && !reduced()) gsap.fromTo(now, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' });
  };

  playlist.addEventListener('click', (e) => {
    const b = e.target.closest('[data-film]');
    if (b) show(Number(b.dataset.film));
  });
  root.querySelector('#film-prev').addEventListener('click', () => show(current - 1));
  root.querySelector('#film-next').addEventListener('click', () => show(current + 1));
  root.querySelector('#film-enlarge').addEventListener('click', () => openVideo(list[current].v));
  delete stage.dataset.ready;
  show(0);
}

export function initVideos() {
  const indexed = VIDEOS.map((v, i) => ({ v, i }));
  const recitations = indexed.filter(({ v }) => v.kind === 'recitation');
  const films = indexed.filter(({ v }) => v.kind !== 'recitation');

  const rail = document.getElementById('video-grid');
  if (rail) recitations.length ? renderRail(rail, recitations) : rail.closest('[data-video-block]')?.remove();

  const room = document.getElementById('films');
  if (room) films.length ? renderScreeningRoom(room, films) : room.remove();
}
