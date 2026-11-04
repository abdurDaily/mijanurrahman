// Brand marks (Lucide no longer ships brand icons). 24×24, currentColor.
const PATHS = {
  facebook: '<path d="M14 8.5V6.8c0-.8.5-1.3 1.3-1.3H17V2.2h-2.6C11.6 2.2 10 4 10 6.6v1.9H7.5v3.3H10V22h4V11.8h2.8l.4-3.3H14z"/>',
  instagram: '<rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.4" cy="6.6" r="1.1"/>',
  youtube: '<path d="M22 7.6a2.8 2.8 0 0 0-2-2C18.3 5.2 12 5.2 12 5.2s-6.3 0-8 .4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1.6 12 29 29 0 0 0 2 16.4a2.8 2.8 0 0 0 2 2c1.7.4 8 .4 8 .4s6.3 0 8-.4a2.8 2.8 0 0 0 2-2c.3-1.4.4-2.9.4-4.4s-.1-3-.4-4.4zM10 15.2V8.8l5.4 3.2L10 15.2z"/>',
  whatsapp: '<path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9s-.5-.1-.7.1-.8.9-.9 1.1-.3.2-.6.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2.1c-.2-.3 0-.4.1-.6l.4-.5.3-.5v-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.5 13.5 0 0 0 5.2 4.6c1.9.8 2.7.9 3.6.7a3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.1-.3-.2-.6-.3zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zM12 .2a11.8 11.8 0 0 0-10.1 17.8L.2 23.8l6-1.6A11.8 11.8 0 1 0 12 .2z"/>',
};

export const brandIcon = (id, cls = 'h-[18px] w-[18px]') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">${PATHS[id] ?? ''}</svg>`;

/** Render social icon links into every .social-links container (only links that exist). */
export function renderSocialLinks(social) {
  const html = social.filter((s) => s.url).map((s) =>
    `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="transition-colors hover:text-gold" aria-label="${s.label}">${brandIcon(s.id)}</a>`).join('');
  document.querySelectorAll('.social-links').forEach((el) => { el.innerHTML = html; });
}
