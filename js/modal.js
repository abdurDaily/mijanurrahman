// Accessible modal dialogs: focus trap, ESC to close, scroll lock, focus restore.
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, iframe, [tabindex]:not([tabindex="-1"])';
let active = null; // { el, onClose, returnFocus }

function onKey(e) {
  if (!active) return;
  if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
  if (e.key !== 'Tab') return;
  const items = [...active.el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

export function openModal(el, { onClose } = {}) {
  if (active) closeModal();
  active = { el, onClose, returnFocus: document.activeElement };
  el.classList.remove('hidden');
  el.classList.add(el.id === 'video-modal' ? 'flex' : 'block');
  document.body.classList.add('is-locked');
  // opacity (not autoAlpha): the dialog must stay focusable while it fades in
  window.gsap?.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
  document.addEventListener('keydown', onKey);
  (el.querySelector('.modal-close') ?? el).focus();
}

export function closeModal() {
  if (!active) return;
  const { el, onClose, returnFocus } = active;
  active = null;
  document.removeEventListener('keydown', onKey);
  el.classList.add('hidden');
  el.classList.remove('flex', 'block');
  document.body.classList.remove('is-locked');
  onClose?.();
  returnFocus?.focus?.();
}

export const isModalOpen = (el) => active?.el === el;

export function initModals() {
  document.querySelectorAll('.modal').forEach((m) => {
    m.querySelectorAll('.modal-close').forEach((b) => b.addEventListener('click', closeModal));
    // click on the backdrop (the modal element itself) closes
    m.addEventListener('click', (e) => { if (e.target === m) closeModal(); });
  });
}
