import { CONTACT } from './data.js';
import { t } from './language.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateField(input) {
  const v = input.value.trim();
  let key = '';
  if (input.required && !v) key = 'form.errRequired';
  else if (input.type === 'email' && !EMAIL_RE.test(v)) key = 'form.errEmail';
  else if (input.name === 'message' && v.length < 10) key = 'form.errShort';
  const err = document.getElementById(`${input.id}-err`);
  input.setAttribute('aria-invalid', String(Boolean(key)));
  if (err) { err.textContent = key ? t(key) : ''; err.dataset.key = key; }
  return !key;
}

export function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const fields = [...form.querySelectorAll('input[required], select[required], textarea[required]')];
  const submit = form.querySelector('[type="submit"]');
  const setStatus = (key, tone) => {
    status.textContent = t(key);
    status.dataset.key = key;
    status.className = `max-w-sm text-sm ${tone === 'error' ? 'text-red-700' : 'text-ink'}`;
  };

  fields.forEach((f) => {
    f.addEventListener('blur', () => { if (f.value) validateField(f); });
    f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') validateField(f); });
  });

  // Keep visible messages in the current language
  document.addEventListener('langchange', () => {
    form.querySelectorAll('.field-err').forEach((e) => { if (e.dataset.key) e.textContent = t(e.dataset.key); });
    if (status.dataset.key) status.textContent = t(status.dataset.key);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = fields.map(validateField).every(Boolean);
    if (!ok) {
      setStatus('form.errFix', 'error');
      fields.find((f) => f.getAttribute('aria-invalid') === 'true')?.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    if (data._gotcha) return; // bot

    if (CONTACT.formEndpoint) {
      submit.disabled = true;
      setStatus('form.sending');
      try {
        const res = await fetch(CONTACT.formEndpoint, {
          method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        setStatus('form.ok');
      } catch {
        setStatus('form.fail', 'error');
      } finally {
        submit.disabled = false;
      }
    } else if (CONTACT.email) {
      const body = `${data.message}\n\n— ${data.name} <${data.email}>\nInquiry: ${data.type}`;
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
      setStatus('form.mailto');
    } else {
      // Static site with no form service configured yet — be explicit about it.
      setStatus('form.offline');
    }
  });
}
