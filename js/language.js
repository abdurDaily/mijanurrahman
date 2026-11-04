/**
 * Bilingual support.
 *  • Static interface text: elements with data-i18n="key" (textContent) and
 *    data-i18n-attr="attr:key;attr2:key2" pull from TRANSLATIONS below.
 *  • Data-driven content (js/data.js) is rendered in both languages with bi();
 *    CSS shows only the active one, so switching never re-renders or interrupts
 *    media playback.
 */

const STORAGE_KEY = 'mijan-lang';

export const TRANSLATIONS = {
  en: {
    'a11y.skip': 'Skip to content', 'a11y.lang': 'Switch language to Bangla', 'a11y.menu': 'Open menu', 'a11y.menuClose': 'Close menu',
    'a11y.scroll': 'Scroll to About', 'a11y.filter': 'Filter photographs by category', 'a11y.prev': 'Previous', 'a11y.next': 'Next',
    'a11y.seek': 'Seek', 'a11y.mute': 'Mute', 'a11y.volume': 'Volume', 'a11y.close': 'Close', 'a11y.viewer': 'Image viewer', 'a11y.video': 'Video player',
    'a11y.play': 'Play', 'a11y.pause': 'Pause', 'a11y.open': 'Open image',

    'nav.home': 'Home', 'nav.about': 'About', 'nav.photography': 'Photography', 'nav.recitation': 'Recitation',
    'nav.achievements': 'Achievements', 'nav.journal': 'Journal', 'nav.contact': 'Contact',

    'hero.location': 'Based in Bangladesh', 'hero.title': 'Capturing Moments. Expressing Emotions.',
    'hero.l1': 'Capturing', 'hero.l2': 'Moments.', 'hero.l3': 'Expressing', 'hero.l4': 'Emotions.',
    'hero.roles': 'Photographer | Bangla Reciter | Creative Artist',
    'hero.cta1': 'Explore My Photography', 'hero.cta2': 'Discover My Recitation', 'hero.scroll': 'Scroll',

    'about.eyebrow': 'About', 'about.title': 'Beyond the Lens & Beyond Words.', 'about.caption': 'Mijan, between frames.',
    'about.intro': '“I believe every photograph carries a story, and every poem holds an emotion. Through photography and Bangla recitation, I explore the beauty of human experiences, nature, culture, and expression.”',
    'about.p1t': 'Through the Lens', 'about.p1': 'Portraits, landscapes and everyday life — photographs that hold on to a feeling as much as a scene.',
    'about.p2t': 'Through the Voice', 'about.p2': 'Bangla recitation that gives breath to the poetry of Rabindranath, Nazrul, Jibanananda and more.',
    'about.p3t': 'Philosophy', 'about.p3': 'Look slowly, listen closely, and let the moment speak before the artist does.',
    'about.draft': 'Draft biography — to be reviewed by Mijan',
    'about.more1': 'Mijan’s work moves between two languages of art: the silent language of the photograph and the spoken language of poetry. Both begin with attention — to light, to rhythm, to the small details that carry meaning.',
    'about.more2': 'Whether framing a portrait or reciting a poem on stage, the aim is the same: to stay honest to the moment and let it reach someone else intact.',
    'about.more': 'Read More', 'about.less': 'Read Less', 'about.bio': 'Download Biography',

    'photo.eyebrow': 'Portfolio', 'photo.title': 'Through My Lens', 'photo.sub': 'Every frame captures a moment. Every moment tells a story.',
    'photo.sample': 'Sample frames — Mijan’s photographs to be added',

    'proj.eyebrow': 'Featured Projects', 'proj.title': 'Selected Stories', 'proj.sub': 'Longer photographic series — each one a place, a people, a season.',
    'proj.view': 'View Project',

    'rec.eyebrow': 'Bangla Recitation', 'rec.sub': 'Words become emotions. Poetry becomes an experience.',
    'rec.featured': 'Featured Recitation', 'rec.library': 'Recitation Library', 'rec.libsub': 'Browse by poet. Select any recitation to play it in the player above.',
    'rec.videos': 'Video Recitations', 'rec.performance': 'On Stage & In Studio', 'rec.poems': 'Featured Poetry',
    'rec.poemsnote': 'Poem titles only — full texts belong to their poets and publishers.',
    'rec.soon': 'Recording coming soon', 'rec.loading': 'Loading…', 'rec.playing': 'Now playing', 'rec.all': 'All Poets',
    'rec.videosub': 'Recitations performed on camera. Tap any reel to watch.',
    'film.eyebrow': 'Moving Pictures', 'film.title': 'Films & Reels',
    'film.sub': 'Short documentaries, videos and photo animations — stories told in motion.',
    'video.onFacebook': 'Watch on Facebook', 'video.onYoutube': 'Watch on YouTube',
    'video.enlarge': 'Watch larger', 'film.now': 'On Screen',

    'ach.eyebrow': 'Achievements & Experiences', 'ach.title': 'Recognition & Journey', 'ach.confirm': 'Details to be confirmed',

    'svc.eyebrow': 'Services & Collaboration', 'svc.title': 'Let’s Create Something Meaningful',
    'svc.sub': 'Available for commissions, programmes and collaborations. Tell me about your idea — I’ll reply with availability.',
    'svc.book': 'Send an Inquiry', 'svc.whatsapp': 'WhatsApp',

    'blog.eyebrow': 'Journal', 'blog.title': 'Stories & Thoughts', 'blog.read': 'Read Article',
    'blog.sub': 'Photography stories, creative thoughts, Bangla literature, recitation experiences and travel notes.',

    'test.eyebrow': 'Testimonials', 'test.title': 'Kind Words',

    'contact.eyebrow': 'Contact', 'contact.title': 'Have a Story to Share?',
    'contact.sub': 'For photography projects, recitation invitations, cultural collaborations, or simply a conversation, feel free to reach out.',
    'form.name': 'Name', 'form.email': 'Email', 'form.subject': 'Subject', 'form.type': 'Inquiry Type', 'form.message': 'Message',
    'form.choose': 'Choose one…', 'form.t1': 'Photography Booking', 'form.t2': 'Recitation Invitation', 'form.t3': 'Collaboration', 'form.t4': 'General Inquiry',
    'form.send': 'Send Message', 'form.sending': 'Sending…',
    'form.errRequired': 'This field is required.', 'form.errEmail': 'Please enter a valid email address.', 'form.errShort': 'Please write at least 10 characters.',
    'form.errFix': 'Please correct the highlighted fields.', 'form.ok': 'Thank you — your message has been sent.', 'form.fail': 'Sorry, the message could not be sent. Please try again later.',
    'form.mailto': 'Your email app has been opened with the message ready to send.',
    'form.offline': 'Form looks good! Online sending isn’t connected yet — please reach out via Facebook in the meantime.',

    'footer.quote': '“Some moments are captured through a lens; others are preserved through words.”',
    'footer.statement': 'Photographer and Bangla reciter — telling stories with light and with the spoken word.',
    'footer.nav': 'Explore', 'footer.connect': 'Connect', 'footer.rights': 'All rights reserved.', 'footer.top': 'Back to top',

    sample: 'Sample',
  },

  bn: {
    'a11y.skip': 'মূল অংশে যান', 'a11y.lang': 'ভাষা ইংরেজিতে পরিবর্তন করুন', 'a11y.menu': 'মেনু খুলুন', 'a11y.menuClose': 'মেনু বন্ধ করুন',
    'a11y.scroll': 'পরিচিতি অংশে যান', 'a11y.filter': 'বিভাগ অনুযায়ী ছবি দেখুন', 'a11y.prev': 'আগের', 'a11y.next': 'পরের',
    'a11y.seek': 'অবস্থান', 'a11y.mute': 'শব্দ বন্ধ', 'a11y.volume': 'শব্দের মাত্রা', 'a11y.close': 'বন্ধ করুন', 'a11y.viewer': 'ছবি দর্শক', 'a11y.video': 'ভিডিও প্লেয়ার',
    'a11y.play': 'চালু করুন', 'a11y.pause': 'থামান', 'a11y.open': 'ছবিটি খুলুন',

    'nav.home': 'প্রথম পাতা', 'nav.about': 'পরিচিতি', 'nav.photography': 'আলোকচিত্র', 'nav.recitation': 'আবৃত্তি',
    'nav.achievements': 'অর্জন', 'nav.journal': 'লেখালেখি', 'nav.contact': 'যোগাযোগ',

    'hero.location': 'বাংলাদেশ থেকে', 'hero.title': 'ক্যামেরার লেন্সে মুহূর্ত, কণ্ঠে কবিতার আবেগ।',
    'hero.l1': 'ক্যামেরার লেন্সে', 'hero.l2': 'মুহূর্ত,', 'hero.l3': 'কণ্ঠে কবিতার', 'hero.l4': 'আবেগ।',
    'hero.roles': 'আলোকচিত্রী | আবৃত্তিশিল্পী | সৃজনশিল্পী',
    'hero.cta1': 'আমার আলোকচিত্র দেখুন', 'hero.cta2': 'আমার আবৃত্তি শুনুন', 'hero.scroll': 'নিচে',

    'about.eyebrow': 'পরিচিতি', 'about.title': 'লেন্সের ওপারে, শব্দের ওপারে।', 'about.caption': 'মিজান, দুই ফ্রেমের মাঝে।',
    'about.intro': '“আমি বিশ্বাস করি প্রতিটি ছবি একটি গল্প বহন করে, আর প্রতিটি কবিতা ধারণ করে একটি আবেগ। আলোকচিত্র ও বাংলা আবৃত্তির মাধ্যমে আমি খুঁজে ফিরি মানুষের অভিজ্ঞতা, প্রকৃতি, সংস্কৃতি আর প্রকাশের সৌন্দর্য।”',
    'about.p1t': 'লেন্সের ভাষায়', 'about.p1': 'পোর্ট্রেট, প্রকৃতি আর প্রতিদিনের জীবন — যে ছবি দৃশ্যের পাশাপাশি অনুভূতিকেও ধরে রাখে।',
    'about.p2t': 'কণ্ঠের ভাষায়', 'about.p2': 'রবীন্দ্রনাথ, নজরুল, জীবনানন্দসহ বাংলা কবিতাকে কণ্ঠে প্রাণ দেওয়া।',
    'about.p3t': 'দর্শন', 'about.p3': 'ধীরে দেখা, মন দিয়ে শোনা — শিল্পীর আগে মুহূর্তকেই কথা বলতে দেওয়া।',
    'about.draft': 'খসড়া জীবনী — মিজানের পর্যালোচনা সাপেক্ষে',
    'about.more1': 'মিজানের কাজ চলে শিল্পের দুই ভাষার মাঝে — ছবির নীরব ভাষা আর কবিতার উচ্চারিত ভাষা। দুটোরই শুরু মনোযোগে — আলো, ছন্দ আর অর্থবহ ছোট ছোট খুঁটিনাটির প্রতি।',
    'about.more2': 'পোর্ট্রেটের ফ্রেম সাজানো হোক বা মঞ্চে কবিতা পাঠ — লক্ষ্য একটাই: মুহূর্তের প্রতি সৎ থাকা, আর তাকে অবিকৃতভাবে অন্যের কাছে পৌঁছে দেওয়া।',
    'about.more': 'আরও পড়ুন', 'about.less': 'সংক্ষেপে দেখুন', 'about.bio': 'জীবনী ডাউনলোড',

    'photo.eyebrow': 'পোর্টফোলিও', 'photo.title': 'আমার লেন্সে', 'photo.sub': 'প্রতিটি ফ্রেমে একটি মুহূর্ত, প্রতিটি মুহূর্তে একটি গল্প।',
    'photo.sample': 'নমুনা ছবি — মিজানের তোলা ছবি যুক্ত করা হবে',

    'proj.eyebrow': 'বিশেষ প্রকল্প', 'proj.title': 'নির্বাচিত গল্প', 'proj.sub': 'দীর্ঘ আলোকচিত্র সিরিজ — প্রতিটি একটি স্থান, একদল মানুষ, একটি ঋতু।',
    'proj.view': 'প্রকল্প দেখুন',

    'rec.eyebrow': 'বাংলা আবৃত্তি', 'rec.sub': 'শব্দ হয়ে ওঠে আবেগ, কবিতা হয়ে ওঠে অভিজ্ঞতা।',
    'rec.featured': 'নির্বাচিত আবৃত্তি', 'rec.library': 'আবৃত্তি সংগ্রহ', 'rec.libsub': 'কবি অনুযায়ী খুঁজুন। যেকোনো আবৃত্তি বেছে নিলে ওপরের প্লেয়ারে বাজবে।',
    'rec.videos': 'ভিডিও আবৃত্তি', 'rec.performance': 'মঞ্চে ও স্টুডিওতে', 'rec.poems': 'নির্বাচিত কবিতা',
    'rec.poemsnote': 'শুধু কবিতার শিরোনাম — পূর্ণ পাঠের স্বত্ব কবি ও প্রকাশকের।',
    'rec.soon': 'রেকর্ডিং শীঘ্রই আসছে', 'rec.loading': 'লোড হচ্ছে…', 'rec.playing': 'এখন বাজছে', 'rec.all': 'সকল কবি',
    'rec.videosub': 'ক্যামেরার সামনে আবৃত্তি। যেকোনো রিলে চাপ দিয়ে দেখুন।',
    'film.eyebrow': 'চলমান ছবি', 'film.title': 'চলচ্চিত্র ও রিল',
    'film.sub': 'স্বল্পদৈর্ঘ্য ডকুমেন্টারি, ভিডিও আর ছবির অ্যানিমেশন — গতিতে বলা গল্প।',
    'video.onFacebook': 'ফেসবুকে দেখুন', 'video.onYoutube': 'ইউটিউবে দেখুন',
    'video.enlarge': 'বড় করে দেখুন', 'film.now': 'পর্দায় এখন',

    'ach.eyebrow': 'অর্জন ও অভিজ্ঞতা', 'ach.title': 'স্বীকৃতি ও পথচলা', 'ach.confirm': 'বিস্তারিত নিশ্চিত করা হবে',

    'svc.eyebrow': 'সেবা ও সহযোগিতা', 'svc.title': 'চলুন অর্থবহ কিছু সৃষ্টি করি',
    'svc.sub': 'কমিশন, অনুষ্ঠান ও সহযোগিতার জন্য যোগাযোগ করুন। আপনার ভাবনা জানান — সময়সূচি জানিয়ে উত্তর দেব।',
    'svc.book': 'অনুরোধ পাঠান', 'svc.whatsapp': 'হোয়াটসঅ্যাপ',

    'blog.eyebrow': 'লেখালেখি', 'blog.title': 'গল্প ও ভাবনা', 'blog.read': 'লেখাটি পড়ুন',
    'blog.sub': 'ছবির গল্প, সৃজনশীল ভাবনা, বাংলা সাহিত্য, আবৃত্তির অভিজ্ঞতা আর ভ্রমণের নোট।',

    'test.eyebrow': 'মতামত', 'test.title': 'কিছু ভালো কথা',

    'contact.eyebrow': 'যোগাযোগ', 'contact.title': 'আপনার কি কোনো গল্প আছে?',
    'contact.sub': 'ফটোগ্রাফি প্রকল্প, আবৃত্তির আমন্ত্রণ, সাংস্কৃতিক সহযোগিতা কিংবা নিছক আলাপের জন্য নির্দ্বিধায় যোগাযোগ করুন।',
    'form.name': 'নাম', 'form.email': 'ইমেইল', 'form.subject': 'বিষয়', 'form.type': 'অনুরোধের ধরন', 'form.message': 'বার্তা',
    'form.choose': 'একটি বেছে নিন…', 'form.t1': 'ফটোগ্রাফি বুকিং', 'form.t2': 'আবৃত্তির আমন্ত্রণ', 'form.t3': 'সহযোগিতা', 'form.t4': 'সাধারণ জিজ্ঞাসা',
    'form.send': 'বার্তা পাঠান', 'form.sending': 'পাঠানো হচ্ছে…',
    'form.errRequired': 'এই ঘরটি পূরণ করা আবশ্যক।', 'form.errEmail': 'সঠিক ইমেইল ঠিকানা লিখুন।', 'form.errShort': 'অন্তত ১০টি অক্ষর লিখুন।',
    'form.errFix': 'চিহ্নিত ঘরগুলো ঠিক করুন।', 'form.ok': 'ধন্যবাদ — আপনার বার্তা পাঠানো হয়েছে।', 'form.fail': 'দুঃখিত, বার্তা পাঠানো যায়নি। পরে আবার চেষ্টা করুন।',
    'form.mailto': 'আপনার ইমেইল অ্যাপে বার্তাটি পাঠানোর জন্য প্রস্তুত করা হয়েছে।',
    'form.offline': 'ফর্ম ঠিক আছে! অনলাইনে পাঠানোর ব্যবস্থা এখনো যুক্ত হয়নি — আপাতত ফেসবুকে যোগাযোগ করুন।',

    'footer.quote': '“কিছু মুহূর্ত ধরা থাকে লেন্সে, কিছু রয়ে যায় শব্দে।”',
    'footer.statement': 'আলোকচিত্রী ও আবৃত্তিশিল্পী — আলো আর উচ্চারিত শব্দে গল্প বলা।',
    'footer.nav': 'ঘুরে দেখুন', 'footer.connect': 'যুক্ত থাকুন', 'footer.rights': 'সর্বস্বত্ব সংরক্ষিত।', 'footer.top': 'ওপরে যান',

    sample: 'নমুনা',
  },
};

let current = document.documentElement.lang === 'bn' ? 'bn' : 'en';

export const getLang = () => current;
export const t = (key) => TRANSLATIONS[current][key] ?? TRANSLATIONS.en[key] ?? key;
// Modules that hold language-dependent JS state listen for the 'langchange' document event.
const announce = () => document.dispatchEvent(new CustomEvent('langchange', { detail: current }));

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Render a { en, bn } value in both languages (CSS shows the active one). */
export function bi(v) {
  if (v == null) return '';
  if (typeof v === 'string') return esc(v);
  if (v.en === v.bn) return esc(v.en);
  return `<span class="bi" lang="en">${esc(v.en)}</span><span class="bi" lang="bn">${esc(v.bn)}</span>`;
}

/** Static UI text by translation key, in both languages. */
export const biKey = (key) => bi({ en: TRANSLATIONS.en[key], bn: TRANSLATIONS.bn[key] });

/** alt attribute that follows the active language. */
export const altAttr = (v) => {
  const o = typeof v === 'string' ? { en: v, bn: v } : v;
  return `alt="${esc(o[current])}" data-alt-en="${esc(o.en)}" data-alt-bn="${esc(o.bn)}"`;
};

export function applyLanguage(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
    });
  });
  root.querySelectorAll('[data-alt-en]').forEach((el) => { el.alt = el.dataset[current === 'bn' ? 'altBn' : 'altEn']; });
  document.querySelectorAll('[data-lang-opt]').forEach((el) => el.classList.toggle('text-gold', el.dataset.langOpt === current));
}

export function setLang(lang) {
  current = lang === 'bn' ? 'bn' : 'en';
  document.documentElement.lang = current;
  try { localStorage.setItem(STORAGE_KEY, current); } catch { /* storage unavailable */ }
  applyLanguage();
  announce();
  window.ScrollTrigger?.refresh(); // text length changes shift layout
}

/** Call after all sections are rendered. */
export function initLanguage() {
  applyLanguage();
  announce();
  document.querySelectorAll('.lang-toggle').forEach((btn) =>
    btn.addEventListener('click', () => setLang(current === 'en' ? 'bn' : 'en')));
}
