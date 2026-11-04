/**
 * Videos: "Video Recitations" rail (Recitation section) and the "Films & Reels"
 * screening room (stage + playlist). Every frame first shows a cover (the video's
 * poster frame, or a designed fallback) with a play button; the official Facebook /
 * YouTube player is only loaded when the visitor presses play.
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
const isFb = (v) => v.platform === 'facebook';
const aspect = (v) => (v.vertical ? 'aspect-[9/16]' : 'aspect-video');

function embedUrl(v, w, h) {
  if (isFb(v)) {
    const href = encodeURIComponent(sourceUrl(v));
    // No autoplay: Facebook mutes self-started videos. A press on its own play
    // button is a real user gesture, so playback starts with sound.
    return `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&width=${Math.max(220, Math.round(w))}&height=${Math.round(h)}`;
  }
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?rel=0&autoplay=1`;
}

/** Cover image with designed fallback underneath (shown if the image is missing). */
const coverHTML = (v, n, thumb = false) => `
  <span class="absolute inset-0 bg-night-2 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(164,123,69,0.28),transparent_65%)] p-5">
    ${thumb ? '' : `<span class="font-display text-6xl font-light leading-none text-ivory/15">${pad(n)}</span>`}
  </span>
  ${v.cover ? `<img class="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-expo group-hover/frame:scale-[1.04]" src="${esc(v.cover)}" width="960" height="540" loading="lazy" alt="" onerror="this.remove()" />` : ''}`;

/** Click-to-play face of a frame. */
const faceHTML = (v, n, size = 'md') => {
  const btn = size === 'lg' ? 'h-20 w-20 md:h-24 md:w-24' : 'h-14 w-14 md:h-16 md:w-16';
  return `
  <button type="button" data-play class="group/frame absolute inset-0 block h-full w-full overflow-hidden text-ivory" aria-label="${esc(titleOf(v).en)} — play">
    ${coverHTML(v, n)}
    <span class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20 transition-opacity duration-500 group-hover/frame:opacity-80" aria-hidden="true"></span>
    <span class="absolute left-1/2 top-1/2 flex ${btn} -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/95 text-night shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition duration-500 group-hover/frame:scale-110 group-hover/frame:bg-gold-soft" aria-hidden="true">
      <span class="absolute -inset-2 rounded-full border border-ivory/40 transition-all duration-700 group-hover/frame:-inset-3.5 group-hover/frame:border-gold-soft/70"></span>
      ${playIcon(size === 'lg' ? 'ml-1 h-7 w-7' : 'ml-0.5 h-5 w-5')}
    </span>
    <span class="absolute bottom-4 left-4 flex items-center gap-2 text-ivory/90" aria-hidden="true">
      <span class="h-px w-6 bg-gold-soft"></span><span class="label">${bi(VIDEO_KINDS[v.kind])}</span>
    </span>
  </button>`;
};

/* One video at a time. Cross-origin players can't be paused, so the previous one is
 * stopped by swapping its player back to the cover it replaced. */
let active = null; // { frame, face }
function stopActive() {
  if (active?.frame.querySelector('iframe')) active.frame.innerHTML = active.face;
  active = null;
}

/** Replace a frame's face with the real player. */
function playIn(frame, v) {
  if (active?.frame !== frame) stopActive();
  active = { frame, face: frame.innerHTML };
  document.getElementById('player-audio')?.pause(); // the recitation audio player too
  frame.innerHTML = `<iframe class="absolute inset-0 h-full w-full bg-black" src="${embedUrl(v, frame.clientWidth, frame.clientHeight)}" title="${esc(titleOf(v).en)}" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen" allowfullscreen scrolling="no"></iframe>`;
  frame.querySelector('iframe').focus();
}

/* ───────────── Modal (enlarge) ───────────── */
function openVideo(v) {
  const frame = document.getElementById('video-frame');
  frame.className = `relative overflow-hidden bg-black ${v.vertical ? 'aspect-[9/16] h-[min(80vh,760px)] max-w-full' : 'aspect-video w-full max-w-5xl'}`;
  frame.innerHTML = '';
  const link = document.getElementById('video-source');
  link.href = sourceUrl(v);
  link.innerHTML = `${biKey(isFb(v) ? 'video.onFacebook' : 'video.onYoutube')} <span aria-hidden="true">↗</span>`;
  openModal(document.getElementById('video-modal'), { onClose: () => { frame.innerHTML = ''; } });
  requestAnimationFrame(() => playIn(frame, v));
}

/* ───────────── Recitation rail ───────────── */
function renderRail(container, list) {
  container.innerHTML = list.map(({ v, i }, k) => {
    const poet = poetOf(v);
    return `
    <article class="vid-card reveal w-[82vw] max-w-[440px] shrink-0 snap-start sm:w-[420px] lg:w-auto lg:max-w-none">
      <div class="vid-frame relative ${aspect(v)} overflow-hidden border border-night-line bg-night-2" data-vid="${i}">
        ${faceHTML(v, k + 1)}
      </div>
      <div class="flex items-start justify-between gap-3 pt-4">
        <div>
          <p class="label mb-1.5 text-gold-soft">${pad(k + 1)} · ${poet ? bi(poet) : bi(VIDEO_KINDS[v.kind])}</p>
          <p class="font-display text-2xl font-light leading-snug">${bi(titleOf(v))}</p>
        </div>
        <button type="button" data-enlarge="${i}" class="flex h-9 w-9 shrink-0 items-center justify-center border border-ivory/15 text-ivory/70 transition hover:border-gold-soft hover:text-gold-soft" data-i18n-attr="aria-label:video.enlarge" aria-label="Watch larger">
          <i data-lucide="maximize-2" class="h-4 w-4"></i>
        </button>
      </div>
    </article>`;
  }).join('');
  container.addEventListener('click', (e) => {
    const enlarge = e.target.closest('[data-enlarge]');
    if (enlarge) { openVideo(VIDEOS[Number(enlarge.dataset.enlarge)]); return; }
    const frame = e.target.closest('[data-play]')?.closest('.vid-frame');
    if (frame) playIn(frame, VIDEOS[Number(frame.dataset.vid)]);
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
      <button type="button" data-film="${k}" class="film-row group relative grid w-full grid-cols-[7rem_1fr_auto] items-center gap-4 border-b border-ink/10 py-4 text-left transition-colors hover:text-gold-deep aria-[current=true]:text-gold-deep sm:grid-cols-[8.5rem_1fr_auto] sm:gap-5">
        <span class="absolute inset-y-0 -left-4 w-0.5 origin-top scale-y-0 bg-gold transition-transform duration-500 group-aria-[current=true]:scale-y-100" aria-hidden="true"></span>
        <span class="relative ${aspect(v)} overflow-hidden bg-night text-ivory">
          ${coverHTML(v, k + 1, true)}
          <span class="label absolute left-1.5 top-1.5 bg-night/70 px-1.5 py-0.5 tabular-nums text-ivory">${pad(k + 1)}</span>
        </span>
        <span>
          <span class="block font-display text-xl font-light leading-tight md:text-2xl">${bi(titleOf(v))}</span>
          <span class="mt-1 block text-xs text-mute">${v.title ? `${bi(VIDEO_KINDS[v.kind])} · ` : ''}${platformName(v)}</span>
        </span>
        <span class="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 transition group-hover:border-ink group-aria-[current=true]:border-ink group-aria-[current=true]:bg-ink group-aria-[current=true]:text-paper">${playIcon('ml-0.5 h-3.5 w-3.5')}</span>
      </button>
    </li>`).join('');

  const show = (k, { play = false } = {}) => {
    current = (k + list.length) % list.length;
    const { v } = list[current];
    playlist.querySelectorAll('[data-film]').forEach((b) => b.setAttribute('aria-current', String(Number(b.dataset.film) === current)));
    now.innerHTML = `
      <p class="label mb-3 tabular-nums text-gold-deep">${pad(current + 1)} / ${pad(list.length)} · ${bi(VIDEO_KINDS[v.kind])}</p>
      <p class="h-display text-4xl md:text-5xl">${bi(titleOf(v))}</p>`;
    source.href = sourceUrl(v);
    source.innerHTML = `${biKey(isFb(v) ? 'video.onFacebook' : 'video.onYoutube')} <span aria-hidden="true">↗</span>`;
    stage.className = stage.className.replace(/aspect-\S+/, aspect(v));
    stage.innerHTML = faceHTML(v, current + 1, 'lg');
    if (play) playIn(stage, v);
    if (window.gsap && !reduced()) gsap.fromTo(now, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' });
  };

  stage.addEventListener('click', (e) => { if (e.target.closest('[data-play]')) playIn(stage, list[current].v); });
  playlist.addEventListener('click', (e) => {
    const b = e.target.closest('[data-film]');
    if (b) show(Number(b.dataset.film), { play: true });
  });
  root.querySelector('#film-prev').addEventListener('click', () => show(current - 1));
  root.querySelector('#film-next').addEventListener('click', () => show(current + 1));
  root.querySelector('#film-enlarge').addEventListener('click', () => openVideo(list[current].v));
  show(0);
}

export function initVideos() {
  document.getElementById('player-audio')?.addEventListener('play', stopActive);

  const indexed = VIDEOS.map((v, i) => ({ v, i }));
  const recitations = indexed.filter(({ v }) => v.kind === 'recitation');
  const films = indexed.filter(({ v }) => v.kind !== 'recitation');

  const rail = document.getElementById('video-grid');
  if (rail) recitations.length ? renderRail(rail, recitations) : rail.closest('[data-video-block]')?.remove();

  const room = document.getElementById('films');
  if (room) films.length ? renderScreeningRoom(room, films) : room.remove();
}
