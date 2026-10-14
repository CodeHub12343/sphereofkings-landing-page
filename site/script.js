(function () {
  'use strict';

  // ---------- Countdown ----------
  const LAUNCH = new Date('2026-11-19T12:00:00-05:00').getTime();
  const d = document.getElementById('count-days');
  const h = document.getElementById('count-hours');
  const m = document.getElementById('count-minutes');
  const s = document.getElementById('count-seconds');

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tick() {
    const now = Date.now();
    let delta = Math.max(0, LAUNCH - now);
    const days = Math.floor(delta / 86400000); delta -= days * 86400000;
    const hrs = Math.floor(delta / 3600000);   delta -= hrs * 3600000;
    const mins = Math.floor(delta / 60000);    delta -= mins * 60000;
    const secs = Math.floor(delta / 1000);
    if (d) d.textContent = days;
    if (h) h.textContent = pad(hrs);
    if (m) m.textContent = pad(mins);
    if (s) s.textContent = pad(secs);
  }
  tick();
  setInterval(tick, 1000);

  // ---------- Showcase tabs ----------
  const tabs = document.querySelectorAll('.tab-btn[data-game-index]');
  const panels = document.querySelectorAll('.game-panel[data-panel-index]');
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = btn.getAttribute('data-game-index');
      tabs.forEach((b) => b.setAttribute('aria-selected', b === btn ? 'true' : 'false'));
      panels.forEach((p) => {
        if (p.getAttribute('data-panel-index') === idx) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });
    });
  });

  // ---------- Signup forms (hero + final) ----------
  function wireForm(name) {
    const idle    = document.querySelector(`.form-state[data-form="${name}"][data-state="idle"]`);
    const loading = document.querySelector(`.form-state[data-form="${name}"][data-state="loading"]`);
    const success = document.querySelector(`.form-state[data-form="${name}"][data-state="success"]`);
    const errBox  = document.querySelector(`.form-error[data-form="${name}"]`);
    const submit  = document.querySelector(`button[data-submit="${name}"]`);
    if (!idle || !submit) return;

    const nameInput  = idle.querySelector('input[data-field="name"]');
    const emailInput = idle.querySelector('input[data-field="email"]');

    function show(state) {
      [idle, loading, success].forEach((el) => el && el.setAttribute('hidden', ''));
      if (state === 'idle') idle.removeAttribute('hidden');
      if (state === 'loading') loading.removeAttribute('hidden');
      if (state === 'success') success.removeAttribute('hidden');
    }
    function setError(msg) {
      if (!errBox) return;
      const target = errBox.querySelector('p') || errBox;
      if (msg) {
        target.textContent = msg;
        errBox.removeAttribute('hidden');
        emailInput && emailInput.classList.add('inp-err');
      } else {
        target.textContent = '';
        errBox.setAttribute('hidden', '');
        emailInput && emailInput.classList.remove('inp-err');
      }
    }

    emailInput && emailInput.addEventListener('input', () => setError(''));

    submit.addEventListener('click', async () => {
      const email = (emailInput && emailInput.value || '').trim();
      const first = (nameInput && nameInput.value || '').trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) { setError('Please enter your email.'); return; }
      if (!emailRe.test(email)) { setError('Please enter a valid email address.'); return; }
      setError('');
      show('loading');
      try {
        const res = await fetch('https://formspree.io/f/mjgavdkg', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            name: first,
            source: name,
            _subject: 'Sphere of Kings waitlist signup (' + name + ')'
          })
        });
        if (res.ok) {
          show('success');
        } else {
          let msg = 'Something went wrong. Please try again.';
          try {
            const data = await res.json();
            if (data && Array.isArray(data.errors) && data.errors[0] && data.errors[0].message) {
              msg = data.errors[0].message;
            }
          } catch (_) { /* ignore */ }
          show('idle');
          setError(msg);
        }
      } catch (err) {
        show('idle');
        setError('Network error. Please check your connection and try again.');
      }
    });
  }

  wireForm('hero');
  wireForm('final');

  // ---------- Subscriber counter (live, truthful) ----------
  const COUNTER_NS  = 'sphereofkings';
  const COUNTER_KEY = 'subscribers';
  const counterBoxes = document.querySelectorAll('[data-sub-counter]');
  const counterEls   = document.querySelectorAll('[data-sub-counter] [data-count]');

  function paintCount(n) {
    counterEls.forEach((el) => { el.textContent = n.toLocaleString(); });
    counterBoxes.forEach((b) => b.removeAttribute('hidden'));
  }
  function hideCounter() {
    counterBoxes.forEach((b) => b.setAttribute('hidden', ''));
  }
  async function fetchCount() {
    try {
      const r = await fetch(`https://abacus.jasoncameron.dev/get/${COUNTER_NS}/${COUNTER_KEY}`);
      if (!r.ok) throw new Error('bad');
      const d = await r.json();
      if (typeof d.value === 'number') paintCount(d.value);
      else hideCounter();
    } catch (_) {
      // Don't show a fake number if the counter API is unreachable.
      hideCounter();
    }
  }
  async function bumpCount() {
    try {
      const r = await fetch(`https://abacus.jasoncameron.dev/hit/${COUNTER_NS}/${COUNTER_KEY}`);
      if (!r.ok) return;
      const d = await r.json();
      if (typeof d.value === 'number') paintCount(d.value);
    } catch (_) { /* ignore */ }
  }
  // Hide by default until a real number comes back from the API.
  hideCounter();
  fetchCount();

  // Hook into the hero/final submit buttons: when a submit succeeds, bump the counter.
  // We detect success by observing when the success div for either form becomes visible.
  ['hero', 'final'].forEach((name) => {
    const success = document.querySelector(`.form-state[data-form="${name}"][data-state="success"]`);
    if (!success) return;
    const obs = new MutationObserver(() => {
      if (!success.hasAttribute('hidden')) bumpCount();
    });
    obs.observe(success, { attributes: true, attributeFilter: ['hidden'] });
  });

  // ---------- Contact form ----------
  (function wireContact() {
    const btn = document.querySelector('[data-contact-submit]');
    if (!btn) return;
    const form = document.getElementById('contact-form');
    const errBox = form.querySelector('[data-contact-error]');
    const okBox  = form.querySelector('[data-contact-success]');
    const inputs = {
      name:    form.querySelector('[data-cfield="name"]'),
      email:   form.querySelector('[data-cfield="email"]'),
      subject: form.querySelector('[data-cfield="subject"]'),
      message: form.querySelector('[data-cfield="message"]'),
    };
    function setErr(msg) {
      if (!errBox) return;
      if (msg) { errBox.textContent = msg; errBox.removeAttribute('hidden'); }
      else     { errBox.textContent = '';  errBox.setAttribute('hidden', ''); }
    }
    btn.addEventListener('click', async () => {
      const email   = (inputs.email.value   || '').trim();
      const message = (inputs.message.value || '').trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRe.test(email)) { setErr('Please enter a valid email address.'); return; }
      if (!message) { setErr('Please include a message.'); return; }
      setErr('');
      const prevText = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const res = await fetch('https://formspree.io/f/mjgavdkg', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            name: (inputs.name.value || '').trim(),
            subject: (inputs.subject.value || '').trim(),
            message: message,
            source: 'contact',
            _subject: 'Sphere of Kings — contact message',
          }),
        });
        if (res.ok) {
          okBox && okBox.removeAttribute('hidden');
          Object.values(inputs).forEach((i) => { if (i) i.value = ''; });
          setTimeout(() => okBox && okBox.setAttribute('hidden', ''), 6000);
        } else {
          setErr('Could not send. Please try again or email hello@sphereofkings.com.');
        }
      } catch (_) {
        setErr('Network error. Please try again.');
      } finally {
        btn.disabled = false; btn.textContent = prevText;
      }
    });
  })();

  // ---------- Mobile nav toggle ----------
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const siteNav = document.getElementById('site-nav');
  if (header && toggle && siteNav) {
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    siteNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  // ---------- Smooth-scroll for internal nav ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
