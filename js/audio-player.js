import { TRACKS, POETS, PERFORMANCE_PHOTOS, FEATURED_POEMS } from './data.js';
import { bi, biKey, esc, altAttr, t } from './language.js';
import { openLightbox } from './gallery.js';

const $ = (id) => document.getElementById(id);
const poetOf = (track) => track.poetName ?? POETS.find((p) => p.id === track.poet) ?? { en: '', bn: '' };
const fmt = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');
const sampleTag = () => `<span class="sample-tag">${biKey('sample')}</span>`;

/* ───────────────────────── Player ───────────────────────── */
const state = { index: 0, poet: 'all', unavailable: new Set() };
let el = {};

function setPlayingUI(playing) {
  el.play.querySelector('.i-play').classList.toggle('hidden', playing);
  el.play.querySelector('.i-pause').classList.toggle('hidden', !playing);
  el.play.setAttribute('aria-label', t(playing ? 'a11y.pause' : 'a11y.play'));
  el.eq.classList.toggle('paused', !playing);
  document.querySelectorAll('#track-list [data-track]').forEach((row) => {
    const active = Number(row.dataset.track) === state.index;
    row.classList.toggle('text-gold-soft', active);
    row.setAttribute('aria-current', String(active && playing));
  });
}

function setStatus(key) {
  el.status.innerHTML = key ? biKey(key) : '';
}

function markUnavailable() {
  state.unavailable.add(state.index);
  el.play.disabled = true;
  el.seek.disabled = true;
  setPlayingUI(false);
  setStatus('rec.soon');
  renderTrackList();
}

function loadTrack(i, { autoplay = false } = {}) {
  const track = TRACKS[i];
  state.index = i;
  el.audio.pause();
  el.title.innerHTML = bi(track.title);
  el.poet.innerHTML = bi(poetOf(track));
  el.sample.innerHTML = track.sample ? sampleTag() : '';
  const cover = track.cover ?? TRACKS.find((x) => x.cover)?.cover;
  if (cover) el.cover.src = el.coverBg.src = cover.src;
  el.seek.value = 0;
  el.current.textContent = '0:00';
  el.duration.textContent = '0:00';

  if (!track.src || state.unavailable.has(i)) { markUnavailable(); return; }
  el.play.disabled = false;
  el.seek.disabled = false;
  setStatus('');
  el.audio.src = track.src;
  el.audio.preload = 'metadata';
  setPlayingUI(false);
  renderTrackList();
  if (autoplay) play();
}

function play() {
  if (el.play.disabled) return;
  setStatus('rec.loading');
  el.audio.play().then(() => setStatus('rec.playing')).catch((err) => {
    // Missing/undecodable files surface as NotSupportedError (and the 'error' event);
    // autoplay-policy or interrupted plays are not the track's fault.
    if (err?.name === 'NotSupportedError') markUnavailable();
    else setStatus('');
  });
}

function initPlayer() {
  el = {
    audio: $('player-audio'), play: $('player-play'), prev: $('player-prev'), next: $('player-next'),
    seek: $('player-seek'), volume: $('player-volume'), mute: $('player-mute'), cover: $('player-cover'), coverBg: $('player-cover-bg'),
    title: $('player-title'), poet: $('player-poet'), sample: $('player-sample'), status: $('player-status'),
    current: $('player-current'), duration: $('player-duration'), eq: document.querySelector('#player .eq'),
  };
  if (!el.audio) return;

  el.play.innerHTML = '<i data-lucide="play" class="i-play ml-0.5 h-6 w-6"></i><i data-lucide="pause" class="i-pause hidden h-6 w-6"></i>';
  el.mute.innerHTML = '<i data-lucide="volume-2" class="i-vol h-4 w-4"></i><i data-lucide="volume-x" class="i-muted hidden h-4 w-4"></i>';

  el.play.addEventListener('click', () => (el.audio.paused ? play() : el.audio.pause()));
  el.prev.addEventListener('click', () => loadTrack((state.index - 1 + TRACKS.length) % TRACKS.length, { autoplay: !el.audio.paused }));
  el.next.addEventListener('click', () => loadTrack((state.index + 1) % TRACKS.length, { autoplay: !el.audio.paused }));

  el.audio.addEventListener('play', () => setPlayingUI(true));
  el.audio.addEventListener('pause', () => { setPlayingUI(false); if (!el.play.disabled) setStatus(''); });
  el.audio.addEventListener('ended', () => { el.audio.currentTime = 0; setPlayingUI(false); });
  el.audio.addEventListener('error', () => { if (el.audio.getAttribute('src')) markUnavailable(); });
  el.audio.addEventListener('loadedmetadata', () => { el.duration.textContent = fmt(el.audio.duration); });
  el.audio.addEventListener('timeupdate', () => {
    const d = el.audio.duration;
    el.current.textContent = fmt(el.audio.currentTime);
    if (Number.isFinite(d) && d > 0) el.seek.value = (el.audio.currentTime / d) * 100;
  });
  el.seek.addEventListener('input', () => {
    const d = el.audio.duration;
    if (Number.isFinite(d)) el.audio.currentTime = (el.seek.value / 100) * d;
  });
  el.audio.volume = Number(el.volume.value);
  el.volume.addEventListener('input', () => { el.audio.volume = Number(el.volume.value); el.audio.muted = el.audio.volume === 0; });
  el.mute.addEventListener('click', () => { el.audio.muted = !el.audio.muted; });
  el.audio.addEventListener('volumechange', () => {
    el.mute.querySelector('.i-vol').classList.toggle('hidden', el.audio.muted);
    el.mute.querySelector('.i-muted').classList.toggle('hidden', !el.audio.muted);
  });
  document.addEventListener('langchange', () => setPlayingUI(!el.audio.paused));

  loadTrack(0);
}

/* ───────────────────────── Library ───────────────────────── */
function renderPoetTabs() {
  const box = $('poet-tabs');
  box.setAttribute('role', 'group');
  const all = { id: 'all', en: 'All Poets', bn: 'সকল কবি' };
  box.innerHTML = [all, ...POETS].map((p) => {
    const n = p.id === 'all' ? TRACKS.length : TRACKS.filter((x) => x.poet === p.id).length;
    if (!n) return ''; // only poets with recordings
    return `<button type="button" class="chip border-ivory/15 text-ivory/60 hover:border-ivory hover:text-ivory aria-pressed:border-gold-soft aria-pressed:bg-gold-soft aria-pressed:text-night" data-poet="${p.id}" aria-pressed="${p.id === state.poet}">${bi(p)} <span class="opacity-60">· ${n}</span></button>`;
  }).join('');
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-poet]');
    if (!b) return;
    state.poet = b.dataset.poet;
    box.querySelectorAll('[data-poet]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderTrackList();
    if (window.gsap) gsap.from('#track-list li', { autoAlpha: 0, x: -16, duration: 0.6, stagger: 0.05, ease: 'expo.out' });
  });
}

function renderTrackList() {
  const list = $('track-list');
  const rows = TRACKS.map((tr, i) => ({ tr, i })).filter(({ tr }) => state.poet === 'all' || tr.poet === state.poet);
  list.innerHTML = rows.map(({ tr, i }) => {
    const active = i === state.index;
    const soon = state.unavailable.has(i);
    return `
    <li>
      <button type="button" data-track="${i}" class="group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-5 text-left transition-colors hover:text-gold-soft ${active ? 'text-gold-soft' : ''}">
        <span class="label tabular-nums text-ivory/40">${String(i + 1).padStart(2, '0')}</span>
        <span>
          <span class="block font-bnserif text-xl leading-snug sm:text-2xl">${bi(tr.title)}</span>
          <span class="mt-1 block text-sm text-ivory/50">${bi(poetOf(tr))}${soon ? ` · <span class="text-ivory/40">${biKey('rec.soon')}</span>` : ''}${tr.sample ? ` &nbsp;${sampleTag()}` : ''}</span>
        </span>
        <span data-row-icon class="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 transition group-hover:border-gold-soft">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>
        </span>
      </button>
    </li>`;
  }).join('');
}

function initLibrary() {
  renderPoetTabs();
  renderTrackList();
  $('track-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-track]');
    if (!b) return;
    const i = Number(b.dataset.track);
    if (i === state.index && !el.audio.paused) { el.audio.pause(); return; }
    loadTrack(i, { autoplay: true });
    document.getElementById('player').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ───────────────────────── Performance + poems ───────────────────────── */
function initPerformance() {
  const grid = $('performance-grid');
  grid.innerHTML = PERFORMANCE_PHOTOS.map((p, i) => `
    <figure class="perf-item group ${i % 2 ? 'md:mt-16' : ''}">
      <button type="button" data-perf="${i}" class="img-zoom block aspect-[4/5] w-full overflow-hidden bg-night-2">
        <img class="h-full w-full object-cover" src="${p.img.src}" width="800" height="1000" loading="lazy" ${altAttr(p.caption)} />
      </button>
      <figcaption class="mt-3 text-sm text-ivory/60">${bi(p.caption)}</figcaption>
    </figure>`).join('');
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-perf]');
    if (!b) return;
    const items = PERFORMANCE_PHOTOS.map((p) => ({ img: p.img, title: p.caption, meta: { en: 'On stage & in studio', bn: 'মঞ্চে ও স্টুডিওতে' } }));
    openLightbox(items, Number(b.dataset.perf));
  });

  $('poem-list').innerHTML = FEATURED_POEMS.map((p, i) => `
    <li class="poem-row group flex items-baseline gap-6 border-b border-night-line py-6 md:py-8">
      <span class="label w-8 shrink-0 tabular-nums text-ivory/30">${String(i + 1).padStart(2, '0')}</span>
      <span lang="bn" class="font-bnserif text-3xl font-light leading-snug transition-colors duration-500 group-hover:text-gold-soft md:text-5xl">${esc(p.title)}</span>
      <span lang="bn" class="ml-auto hidden text-right font-bn text-ivory/50 sm:block">${esc(p.poet)}</span>
    </li>`).join('');
}

export function initRecitation() {
  if (!$('player') || !TRACKS.length) return;
  initPlayer();
  initLibrary();
  initPerformance();
}
