(function () {
  'use strict';

  // ---------- Countdown ----------
  const LAUNCH = new Date('2026-10-19T12:00:00-05:00').getTime();
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
