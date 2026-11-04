/**
 * Video cards + player modal, shared by "Video Recitations" and "Films & Reels".
 * Supports Facebook reels/videos (official embed plugin) and YouTube.
 * Nothing from Facebook/YouTube loads until a visitor clicks play.
 */
import { VIDEOS, VIDEO_KINDS, POETS } from './data.js';
import { bi, biKey, esc } from './language.js';
import { openModal } from './modal.js';

const pad = (n) => String(n).padStart(2, '0');

function embedUrl(v) {
  if (v.platform === 'facebook') {
    const href = `https://www.facebook.com/reel/${v.id}`;
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false&autoplay=true&width=${v.vertical ? 400 : 960}`;
  }
  if (v.platform === 'youtube') return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?autoplay=1&rel=0`;
  return null;
}
const sourceUrl = (v) => (v.platform === 'facebook' ? `https://www.facebook.com/reel/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`);

/** Untitled works show their kind ("Video Documentary") — never an invented name. */
const titleOf = (v) => v.title ?? VIDEO_KINDS[v.kind];

function cardHTML(v, index, n) {
  const kind = VIDEO_KINDS[v.kind];
  const poet = v.poet && POETS.find((p) => p.id === v.poet);
  const title = titleOf(v);
  const cover = v.cover
    ? `<img class="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100" src="${esc(v.cover)}" loading="lazy" alt="" />`
    : `<span class="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(164,123,69,0.28),transparent_60%)] transition-opacity duration-700 group-hover:opacity-70"></span>
       <span class="absolute left-5 top-4 font-display text-7xl font-light leading-none text-ivory/15 md:text-8xl" aria-hidden="true">${pad(n)}</span>`;
  return `
  <button type="button" class="vid-card reveal group block text-left" data-video="${index}">
    <span class="relative block ${v.vertical ? 'aspect-[9/14]' : 'aspect-video'} overflow-hidden border border-night-line bg-night-2 text-ivory">
      ${cover}
      <span class="absolute bottom-4 left-5 flex h-11 w-11 items-center justify-center rounded-full border border-ivory/50 transition duration-500 group-hover:scale-110 group-hover:border-gold-soft group-hover:bg-gold-soft group-hover:text-night">
        <svg class="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>
      </span>
      <span class="label absolute bottom-7 right-5 text-ivory/50">${v.platform === 'facebook' ? 'Facebook' : 'YouTube'}</span>
    </span>
    <span class="block pt-4">
      <span class="label mb-1 block text-gold-soft">${poet ? bi(poet) : `${pad(n)} · ${bi(kind)}`}</span>
      <span class="block font-display text-xl font-light leading-snug md:text-2xl">${bi(title)}</span>
    </span>
  </button>`;
}

function openVideo(v, title) {
  const modal = document.getElementById('video-modal');
  const frame = document.getElementById('video-frame');
  frame.className = v.vertical ? 'aspect-[9/16] h-[min(80vh,720px)] max-w-full bg-black' : 'aspect-video w-full max-w-5xl bg-black';
  frame.innerHTML = `<iframe class="h-full w-full" src="${embedUrl(v)}" title="${esc(title.en)}" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe>`;
  const link = document.getElementById('video-source');
  link.href = sourceUrl(v);
  link.innerHTML = `${biKey(v.platform === 'facebook' ? 'video.onFacebook' : 'video.onYoutube')} <span aria-hidden="true">↗</span>`;
  openModal(modal, { onClose: () => { frame.innerHTML = ''; } });
}

/** Render every video whose `kind` passes `filter` into `container`. */
function renderGrid(container, filter) {
  if (!container) return;
  const items = VIDEOS.map((v, i) => ({ v, i })).filter(({ v }) => filter(v));
  if (!items.length) { container.closest('[data-video-block]')?.remove(); return; }
  container.innerHTML = items.map(({ v, i }, n) => cardHTML(v, i, n + 1)).join('');
  container.addEventListener('click', (e) => {
    const b = e.target.closest('[data-video]');
    if (!b) return;
    const v = VIDEOS[Number(b.dataset.video)];
    openVideo(v, titleOf(v));
  });
}

export function initVideos() {
  renderGrid(document.getElementById('video-grid'), (v) => v.kind === 'recitation');
  renderGrid(document.getElementById('film-grid'), (v) => v.kind !== 'recitation');
}
