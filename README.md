# Mijan — Photography & Bangla Recitation Portfolio

Static, framework-free personal site: HTML5 + Tailwind CSS (compiled) + vanilla ES modules, GSAP/ScrollTrigger, Three.js (hero particles, lazy-loaded), Lucide icons.

## Run locally

```bash
npm install
npm run build        # optimise photos (images/ → assets/images/*.webp) + compile Tailwind
npm run serve        # http://localhost:5173
```

ES modules need an HTTP server — opening `index.html` from the file system will not work.
During design work use `npm run watch:css`.

## Publish a live preview (GitHub Pages — free)

The repo is ready to serve as-is (compiled `css/style.css` is committed, all paths are relative, `.nojekyll` included).

1. Create an empty **public** repository on github.com, e.g. `mijan-portfolio` (no README).
2. Push this folder:
   ```bash
   git remote add origin https://github.com/<username>/mijan-portfolio.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save.**
4. After ~1 minute the site is live at `https://<username>.github.io/mijan-portfolio/` — share that link.
5. For a proper link-preview card (Facebook/Messenger/WhatsApp), replace `https://mijan.example.com/` in `index.html`
   (canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD), `robots.txt` and `sitemap.xml` with that Pages URL, then commit & push.

After any content change: `npm run build:css` (only if you used new Tailwind classes), commit, push — Pages redeploys automatically.

## Editing content

**All content lives in `js/data.js`.** Interface labels (EN/বাংলা) live in `js/language.js` → `TRANSLATIONS`.

| What | Where in `data.js` | Notes |
|---|---|---|
| Contact email / phone / WhatsApp | `CONTACT` | `null` hides the item everywhere. WhatsApp buttons appear once `whatsapp` is set (digits with country code). |
| Contact form delivery | `CONTACT.formEndpoint` | Static site → needs a form service (Formspree, Getform, Web3Forms…). Until set: email fallback (if `email` set), otherwise a clear "not connected yet" message. |
| Social links | `SOCIAL` | Facebook is set; add Instagram/YouTube URLs to show them. |
| Photography gallery | `PHOTOS` | Currently **stock placeholders** (picsum.photos). Put Mijan's photos in `assets/images/photography/` and use `local('photography/name')` after adding them to `scripts/optimize-images.mjs`, or set `img: { src, srcset, full }` directly. `size`: `std` / `tall` / `wide`. |
| Featured projects | `PROJECTS` | Sample. |
| Audio recitations | `TRACKS` | Drop MP3s at the listed `src` paths in `assets/audio/recitations/`. Missing files show "Recording coming soon" instead of a broken player. |
| Videos & reels | `VIDEOS` | Facebook reels play through Facebook's official embed when clicked. `kind: 'recitation'` → Recitation section; other kinds → "Films & Reels". Add `title`, `poet` or `cover` per item. YouTube is supported too. |
| Achievements | `ACHIEVEMENTS` | Two entries use real photos (Cplus TV award moment, book presentation) — **year/role need confirming**. The rest are samples. |
| Journal, testimonials | `POSTS`, `TESTIMONIALS` | All sample — never publish invented testimonials. |
| Biography PDF | `PERSON.biographyPdf` | Download button appears when set. |

Items with `sample: true` show a small dashed **Sample** tag. Remove the flag once the content is real.

## Before going live

- Replace `https://mijan.example.com` in `index.html`, `robots.txt`, `sitemap.xml`, `js/data.js`.
- Confirm location label ("Based in Bangladesh") and the draft biography in the About section.
- Fill `CONTACT` and connect a form service.

## Structure

```
index.html            page markup (sections are containers; data renders into them)
css/input.css         Tailwind source + design tokens/components → css/style.css (build output)
js/main.js            boot order
js/data.js            ALL editable content
js/language.js        EN/বাংলা translations + switching (persisted in localStorage)
js/navigation.js      sticky header, mobile menu, smooth anchors
js/gallery.js         filterable gallery + lightbox (keyboard, swipe, counter)
js/audio-player.js    recitation player, library, videos, performance gallery, poems
js/sections.js        about, projects, timeline, services, journal, testimonials, contact links
js/contact.js         form validation + submission
js/animations.js      preloader, hero intro, ScrollTrigger animations (reduced-motion aware)
js/three-scene.js     hero particle field (lazy, paused off-screen, disposable, WebGL fallback)
scripts/optimize-images.mjs   sharp → responsive WebP
```
