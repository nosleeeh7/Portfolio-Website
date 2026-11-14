/* ==========================================================
   Janos Lei Arana — portfolio
   Theme · nav highlighting · reveal · command palette ·
   typing test · GitHub contributions · copy email
   ========================================================== */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1600);
  }

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const mq = window.matchMedia('(prefers-color-scheme: light)');
  function systemTheme() { return mq.matches ? 'light' : 'dark'; }
  function applyTheme(mode) {
    const effective = mode === 'system' ? systemTheme() : mode;
    root.setAttribute('data-theme', effective);
    try { mode === 'system' ? localStorage.removeItem('theme') : localStorage.setItem('theme', mode); } catch (e) {}
    $$('[data-theme-set]').forEach(b => b.classList.toggle('active', b.dataset.themeSet === mode));
    $('meta[name="theme-color"]').setAttribute('content', effective === 'light' ? '#fafafa' : '#0c0c0f');
  }
  let savedMode = 'system';
  try { savedMode = localStorage.getItem('theme') || 'system'; } catch (e) {}
  applyTheme(savedMode);
  mq.addEventListener('change', () => { if (!localStorage.getItem('theme')) applyTheme('system'); });
  $$('[data-theme-set]').forEach(b => b.addEventListener('click', () => applyTheme(b.dataset.themeSet)));
  $('#topbar-theme')?.addEventListener('click', () => {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ---------- Year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Placeholder links ---------- */
  $$('[data-placeholder]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    toast(`${a.dataset.placeholder} link not set yet`);
  }));

  /* ---------- Copy email ---------- */
  $('#copy-email')?.addEventListener('click', async () => {
    const text = $('#email-text').textContent.trim();
    try { await navigator.clipboard.writeText(text); toast('copied'); }
    catch (e) { toast('copy failed'); }
  });

  /* ---------- Mobile nav ---------- */
  const mobileNav = $('#mobile-nav');
  const menuBtn = $('#topbar-menu');
  function closeMobile() { mobileNav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn?.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $$('a', mobileNav).forEach(a => a.addEventListener('click', closeMobile));

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Active nav highlighting ---------- */
  const navLinks = $$('[data-nav]');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(s => navIO.observe(s));

  /* ---------- Overlay helpers ---------- */
  function openOverlay(el) { el.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeOverlay(el) { el.hidden = true; document.body.style.overflow = ''; }
  $$('.overlay').forEach(ov => ov.addEventListener('click', e => { if (e.target === ov) closeOverlay(ov); }));

  /* ---------- Command palette ---------- */
  const palette = $('#palette');
  const pInput = $('#palette-input');
  const pList = $('#palette-list');
  const commands = [
    ...navLinks.map(a => ({ label: a.textContent.trim(), hint: 'section', run: () => jump(a.getAttribute('href')) })),
    { label: 'Say hello', hint: 'section', run: () => jump('#contact') },
    { label: 'Copy email', hint: 'action', run: () => $('#copy-email').click() },
    { label: 'Open GitHub profile', hint: 'link', run: () => window.open('https://github.com/nosleeeh7', '_blank') },
    { label: 'Typing test', hint: 'fun', run: openTyping },
    { label: 'Theme: dark', hint: 'theme', run: () => applyTheme('dark') },
    { label: 'Theme: light', hint: 'theme', run: () => applyTheme('light') },
    { label: 'Theme: system', hint: 'theme', run: () => applyTheme('system') },
  ];
  let pSel = 0, pFiltered = commands;
  function jump(hash) { const el = $(hash); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function renderPalette() {
    const q = pInput.value.trim().toLowerCase();
    pFiltered = commands.filter(c => c.label.toLowerCase().includes(q));
    pSel = Math.min(pSel, Math.max(0, pFiltered.length - 1));
    pList.innerHTML = pFiltered.length
      ? pFiltered.map((c, i) => `<li class="${i === pSel ? 'sel' : ''}" data-i="${i}"><span>${c.label}</span><span class="hint">${c.hint}</span></li>`).join('')
      : '<li class="empty">nothing matches</li>';
  }
  function openPalette() { pInput.value = ''; pSel = 0; renderPalette(); openOverlay(palette); setTimeout(() => pInput.focus(), 20); }
  function runSel() { const c = pFiltered[pSel]; if (!c) return; closeOverlay(palette); c.run(); }
  pInput.addEventListener('input', () => { pSel = 0; renderPalette(); });
  pInput.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); pSel = (pSel + 1) % pFiltered.length; renderPalette(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); pSel = (pSel - 1 + pFiltered.length) % pFiltered.length; renderPalette(); }
    else if (e.key === 'Enter') { e.preventDefault(); runSel(); }
  });
  pList.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) { pSel = +li.dataset.i; runSel(); } });
  pList.addEventListener('mousemove', e => { const li = e.target.closest('li[data-i]'); if (li && +li.dataset.i !== pSel) { pSel = +li.dataset.i; renderPalette(); } });
  $('#open-palette')?.addEventListener('click', openPalette);
  $('#topbar-palette')?.addEventListener('click', openPalette);

  /* ---------- Typing test ---------- */
  const typing = $('#typing');
  const tText = $('#typing-text');
  const tWpm = $('#t-wpm'), tAcc = $('#t-acc'), tTime = $('#t-time');
  const sentences = [
    'the esp32 wakes up, reads the sensor, pushes to the broker, and goes back to sleep.',
    'offline first means the shop keeps selling even when the signal drops.',
    'a watchdog timer is just a promise you make to reset yourself when things go wrong.',
    'every byte on the wire costs power, so send less and sleep more.',
    'good automation is boring: it runs, it logs, nobody notices.',
    'sync is easy until two devices disagree about what happened first.',
  ];
  let tChars = [], tPos = 0, tStart = 0, tErrors = 0, tTyped = 0, tTimer = null, tDone = false;
  function pick() { return sentences[Math.floor(Math.random() * sentences.length)]; }
  function resetTyping() {
    const s = pick();
    tChars = s.split('');
    tPos = 0; tStart = 0; tErrors = 0; tTyped = 0; tDone = false;
    clearInterval(tTimer);
    tText.classList.remove('done');
    tText.innerHTML = tChars.map((c, i) => `<span class="${i === 0 ? 'cur' : ''}">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    tWpm.textContent = '0'; tAcc.textContent = '100'; tTime.textContent = '0.0';
  }
  function updateStats() {
    const secs = (performance.now() - tStart) / 1000;
    tTime.textContent = secs.toFixed(1);
    const wpm = secs > 0 ? Math.round((tPos / 5) / (secs / 60)) : 0;
    tWpm.textContent = String(wpm);
    tAcc.textContent = tTyped ? String(Math.max(0, Math.round(((tTyped - tErrors) / tTyped) * 100))) : '100';
  }
  function finishTyping() {
    tDone = true; clearInterval(tTimer); updateStats(); tText.classList.add('done');
    toast(`${tWpm.textContent} wpm · ${tAcc.textContent}% accuracy`);
  }
  tText.addEventListener('keydown', e => {
    if (e.key === 'Tab') { e.preventDefault(); resetTyping(); return; }
    if (tDone) return;
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (tPos > 0) {
        const spans = tText.children;
        spans[tPos].classList.remove('cur');
        tPos--;
        spans[tPos].className = 'cur';
      }
      return;
    }
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    if (!tStart) { tStart = performance.now(); tTimer = setInterval(updateStats, 100); }
    const spans = tText.children;
    const ok = e.key === tChars[tPos];
    tTyped++; if (!ok) tErrors++;
    spans[tPos].className = ok ? 'ok' : 'bad';
    tPos++;
    if (tPos >= tChars.length) { finishTyping(); return; }
    spans[tPos].classList.add('cur');
    updateStats();
  });
  function openTyping() { resetTyping(); openOverlay(typing); setTimeout(() => tText.focus(), 20); }
  $('#open-typing')?.addEventListener('click', openTyping);

  /* ---------- Global keys ---------- */
  document.addEventListener('keydown', e => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.hidden ? openPalette() : closeOverlay(palette); }
    else if (mod && e.key.toLowerCase() === 'j') { e.preventDefault(); typing.hidden ? openTyping() : closeOverlay(typing); }
    else if (e.key === 'Escape') { $$('.overlay').forEach(closeOverlay); closeMobile(); }
  });

  /* ---------- GitHub contributions ---------- */
  const USER = 'nosleeeh7';
  const grid = $('#contrib-grid');
  const total = $('#contrib-total');
  function level(count, max) {
    if (!count) return 0;
    const r = count / Math.max(max, 1);
    return r > .75 ? 4 : r > .5 ? 3 : r > .25 ? 2 : 1;
  }
  function renderContrib(days) {
    // days: [{date, count}] oldest → newest, last 365 days; pad to start on Sunday
    const start = new Date(days[0].date + 'T00:00:00');
    const pad = start.getDay();
    const max = Math.max(...days.map(d => d.count));
    let html = '';
    for (let i = 0; i < pad; i++) html += '<i style="visibility:hidden"></i>';
    for (const d of days) {
      html += `<i data-l="${level(d.count, max)}" title="${d.count} on ${d.date}"></i>`;
    }
    grid.innerHTML = html;
    const sum = days.reduce((a, d) => a + d.count, 0);
    total.textContent = `${sum.toLocaleString()} contributions in the last year`;
  }
  function skeleton() {
    let html = '';
    for (let i = 0; i < 371; i++) html += `<i data-l="${Math.random() < .15 ? 1 : 0}"></i>`;
    grid.innerHTML = html;
  }
  skeleton();
  fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`)
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => {
      const days = (data.contributions || []).map(c => ({ date: c.date, count: c.count }));
      if (!days.length) throw new Error('empty');
      renderContrib(days);
    })
    .catch(() => { total.innerHTML = `contributions at <a href="https://github.com/${USER}" target="_blank" rel="noopener">github.com/${USER}</a>`; });
})();
