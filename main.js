/* Street Sharkz Professional — page behavior.
   No external libraries. The engine is reached only through PortalAPI.call. */

/* The twelve assessment questions live in assessment.html.
   Scoring below matches that instrument: Q1–Q2 unscored, Q3–Q12
   at 0–3 into five pillars, two questions each. */

/* Rank ladder. Keep these points in step with the depth gauge and the
   public ladder on the homepage. */
var RANKS = [
  { name: 'Deckhand', points: 0 },
  { name: 'Rigger', points: 3 },
  { name: 'Lookout', points: 7 },
  { name: 'Bosun', points: 14 },
  { name: 'Navigator', points: 21 },
  { name: 'First Mate', points: 30 },
  { name: 'Captain', points: 45 },
  { name: 'Apex', points: 66 }
];

var PILLARS = ['Hydration', 'Nutrition', 'Fitness', 'Mind', 'Economics'];

var memoryPass = '';
var videoManifest = null;
var screenObserver = null;
var modalOpen = false;
var inviteWaiting = false;
var lastFocus = null;
var rollTimer = 0;
var roomSlot = 0;

function el(tag, className, text) {
  var node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function reduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function emailOk(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function safeMsg(value, fallback) {
  var msg = String(value || fallback || 'The desk could not be reached. Try again shortly.');
  if (/https?:|script\./i.test(msg)) return fallback || 'The desk could not be reached. Try again shortly.';
  return msg;
}

function normalizeHeadline(item, index) {
  var when = item.time || '';
  if (item.when) when = formatWhen(item.when);
  return {
    id: item.id || ('h' + index),
    headline: item.headline || item.title || '',
    source: item.source || 'WIRE',
    time: when,
    url: item.url || item.link || '',
    newest: index === 0 || !!item.newest
  };
}

function watchHref(item) {
  if (!item) return '';
  if (item.href) return item.href;
  if (item.link) return item.link;
  if (item.url && !/\.mp4($|\?)/i.test(item.url)) return item.url;
  if (item.id && /^[\w-]{6,}$/.test(String(item.id))) {
    return 'https://www.youtube.com/watch?v=' + encodeURIComponent(item.id);
  }
  return '';
}

function normalizeNews(item) {
  var local = item.src || ((item.url && /\.mp4($|\?)/i.test(item.url)) ? item.url : '');
  if (item.kind === 'own' || local) {
    return {
      kind: 'own',
      title: item.title || 'Clip',
      source: item.source || 'STREET SHARKZ',
      src: local || item.src || '',
      bug: item.bug || 'BRIDGE — STREET SHARKZ'
    };
  }
  var source = item.source || 'WIRE';
  var href = watchHref(item);
  var vid = '';
  if (item.id && /^[\w-]{6,}$/.test(String(item.id))) vid = String(item.id);
  if (!vid && href) { var vm = href.match(/[?&]v=([\w-]{6,})/); if (vm) vid = vm[1]; }
  return {
    kind: 'news',
    title: item.title || 'Dispatch',
    source: source,
    bug: item.bug || ('GLOBAL INTEL — ' + String(source).toUpperCase()),
    href: href,
    vid: vid,
    thumb: item.thumb && !/^https?:/i.test(item.thumb) ? item.thumb : ''
  };
}

function normalizePost(post) {
  return {
    username: post.username || 'Member',
    text: post.text || post.body || '',
    at: post.at || post.ts || ''
  };
}

function rankByName(name) {
  var found = null;
  RANKS.forEach(function (rank) {
    if (String(name || '').toLowerCase() === rank.name.toLowerCase()) found = rank;
  });
  return found;
}

function savePass(pass) {
  memoryPass = pass || '';
  try {
    if (memoryPass) sessionStorage.setItem('ss.pass', memoryPass);
    else sessionStorage.removeItem('ss.pass');
  } catch (ignore) { /* memory copy remains for this page */ }
}

function readPass() {
  if (memoryPass) return memoryPass;
  try { memoryPass = sessionStorage.getItem('ss.pass') || ''; } catch (ignore) { memoryPass = ''; }
  return memoryPass;
}

function saveProfile(profile) {
  try { sessionStorage.setItem('ss.profile', JSON.stringify(profile)); } catch (ignore) {}
}

function readProfile() {
  try {
    var raw = sessionStorage.getItem('ss.profile');
    return raw ? JSON.parse(raw) : null;
  } catch (ignore) { return null; }
}

function clearSession() {
  memoryPass = '';
  try {
    sessionStorage.removeItem('ss.pass');
    sessionStorage.removeItem('ss.profile');
  } catch (ignore) {}
}

function seatLabel(seat) {
  if (seat == null || seat === '') return '';
  var n = String(seat);
  if (/^\d+$/.test(n) && n.length < 2) n = '0' + n;
  return 'Seat ' + n + ' · one of 100';
}

function formatWhen(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return iso || '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
      timeZoneName: 'short'
    }).format(d);
  } catch (ignore) {
    return d.toUTCString();
  }
}

function loadManifest() {
  if (videoManifest) return Promise.resolve(videoManifest);
  return fetch('assets/video/manifest.json').then(function (res) {
    if (!res.ok) return { present: [] };
    return res.json();
  }).catch(function () {
    return { present: [] };
  }).then(function (data) {
    videoManifest = data && data.present ? data : { present: [] };
    return videoManifest;
  });
}

function fileName(src) {
  var parts = String(src || '').split('/');
  return parts[parts.length - 1];
}

function videoListed(src) {
  if (!videoManifest || !videoManifest.present) return false;
  return videoManifest.present.indexOf(fileName(src)) !== -1;
}

function initNav() {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  function close() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('is-open') && !modalOpen) close();
  });
}

function initTicker() {
  var track = document.getElementById('ticker-track');
  var row = document.getElementById('ticker-row');
  if (!track || !row || reduceMotion()) return;
  var clone = row.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.appendChild(clone);
  track.classList.add('is-on');
}

function initReveal() {
  var nodes = document.querySelectorAll('.reveal');
  if (!nodes.length) return;
  if (reduceMotion() || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(nodes, function (node) { node.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  Array.prototype.forEach.call(nodes, function (node) { io.observe(node); });
}

function initHero() {
  var canvas = document.querySelector('.hero-canvas');
  if (!canvas || reduceMotion()) return;
  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  var bubbles = [];
  var width = 0;
  var height = 0;
  var running = true;
  var frameId = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeBubble(anywhere) {
    return {
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 8,
      r: Math.random() * 2.1 + 0.4,
      s: Math.random() * 0.28 + 0.08,
      a: Math.random() * 0.22 + 0.05
    };
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);
    var t = Date.now() / 9000;
    var i;
    for (i = 0; i < 4; i += 1) {
      var x = (width * (0.12 + i * 0.22)) + Math.sin(t + i) * 18;
      var grad = ctx.createLinearGradient(x, 0, x + 30, height * 0.72);
      grad.addColorStop(0, 'rgba(232, 200, 90, 0.045)');
      grad.addColorStop(1, 'rgba(232, 200, 90, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 64, 0);
      ctx.lineTo(x + 16, height * 0.72);
      ctx.lineTo(x - 28, height * 0.72);
      ctx.closePath();
      ctx.fill();
    }
    bubbles.forEach(function (bubble) {
      bubble.y -= bubble.s;
      if (bubble.y < -8) {
        bubble.y = height + 8;
        bubble.x = Math.random() * width;
      }
      ctx.beginPath();
      ctx.fillStyle = 'rgba(199, 208, 217, ' + bubble.a + ')';
      ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
      ctx.fill();
    });
    frameId = window.requestAnimationFrame(frame);
  }

  resize();
  for (var n = 0; n < 22; n += 1) bubbles.push(makeBubble(true));
  if ('IntersectionObserver' in window) {
    var watch = new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting && document.visibilityState !== 'hidden';
      if (running) frame();
      else window.cancelAnimationFrame(frameId);
    });
    watch.observe(canvas);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      running = false;
      window.cancelAnimationFrame(frameId);
    }
  });
  window.addEventListener('resize', resize);
  frame();
}

function ensureScreenObserver() {
  if (screenObserver || !('IntersectionObserver' in window) || reduceMotion()) return;
  screenObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var video = entry.target;
      var screen = video.closest('[data-screen]');
      if (!screen || screen.classList.contains('is-fallback')) return;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
        var play = video.play();
        if (play && play.catch) play.catch(function () {});
      } else {
        video.pause();
      }
    });
  }, { threshold: [0, 0.45, 0.75] });
}

function bindScreen(screen) {
  if (!screen || screen.dataset.bound === '1') return;
  screen.dataset.bound = '1';
  var video = screen.querySelector('video');
  if (!video) return;
  var source = video.querySelector('source');
  var src = source ? (source.getAttribute('data-src') || source.getAttribute('src') || '') : '';
  function fallback() {
    screen.classList.add('is-fallback');
    screen.classList.remove('is-playing');
    try { video.pause(); } catch (ignore) {}
  }
  video.addEventListener('playing', function () { screen.classList.add('is-playing'); });
  video.addEventListener('error', fallback);
  if (!videoListed(src)) {
    fallback();
    return;
  }
  if (source && !source.getAttribute('src')) source.src = src;
  ensureScreenObserver();
  if (screenObserver) screenObserver.observe(video);
  if (reduceMotion()) {
    var playBtn = el('button', 'play-btn', 'Play');
    playBtn.type = 'button';
    playBtn.addEventListener('click', function () {
      if (screen.classList.contains('is-fallback')) return;
      if (video.paused) {
        var pending = video.play();
        if (pending && pending.catch) pending.catch(function () {});
        playBtn.textContent = 'Pause';
      } else {
        video.pause();
        playBtn.textContent = 'Play';
      }
    });
    screen.appendChild(playBtn);
  }
}

function initScreens(root) {
  var scope = root || document;
  var screens = scope.querySelectorAll ? scope.querySelectorAll('[data-screen]') : [];
  if (!screens.length) return Promise.resolve();
  return loadManifest().then(function () {
    Array.prototype.forEach.call(screens, bindScreen);
  });
}

function initSound() {
  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('.sound');
    if (!button) return;
    var screen = button.closest('[data-screen]');
    var video = screen && screen.querySelector('video');
    if (!video || screen.classList.contains('is-fallback')) return;
    var turningOn = video.muted;
    Array.prototype.forEach.call(document.querySelectorAll('video'), function (other) {
      other.muted = true;
      var host = other.closest('[data-screen]');
      var otherButton = host && host.querySelector('.sound');
      if (otherButton) {
        otherButton.textContent = 'Sound on';
        otherButton.setAttribute('aria-pressed', 'false');
      }
    });
    if (turningOn) {
      video.muted = false;
      button.textContent = 'Sound off';
      button.setAttribute('aria-pressed', 'true');
      var pending = video.play();
      if (pending && pending.catch) pending.catch(function () {});
    }
  });
}

function setPageInert(on) {
  Array.prototype.forEach.call(document.body.children, function (node) {
    if (node.id === 'modal') return;
    if (on) node.setAttribute('inert', '');
    else node.removeAttribute('inert');
  });
}

function buildModal() {
  if (document.getElementById('modal')) return;
  var modal = el('div', 'modal');
  modal.id = 'modal';
  modal.hidden = true;
  var veil = el('button', 'modal-veil');
  veil.type = 'button';
  veil.tabIndex = -1;
  veil.setAttribute('aria-label', 'Dismiss');
  veil.dataset.dismiss = '1';
  var sheet = el('div', 'sheet');
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-labelledby', 'modal-title');
  sheet.tabIndex = -1;
  var crest = document.createElement('img');
  crest.className = 'modal-crest';
  crest.src = 'assets/img/skywalker-family-crest-480.webp';
  crest.width = 480;
  crest.height = 457;
  crest.alt = '';
  var title = el('h2', 'modal-title');
  title.id = 'modal-title';
  var body = el('div', 'modal-body');
  body.id = 'modal-body';
  var actions = el('div', 'modal-actions');
  actions.id = 'modal-actions';
  sheet.appendChild(crest);
  sheet.appendChild(title);
  sheet.appendChild(body);
  sheet.appendChild(actions);
  modal.appendChild(veil);
  modal.appendChild(sheet);
  document.body.appendChild(modal);

  modal.addEventListener('click', function (event) {
    if (event.target.closest('[data-dismiss]')) closeModal();
  });

  document.addEventListener('keydown', function (event) {
    if (!modalOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;
    var focusable = sheet.querySelectorAll('a[href], button:not([disabled]), input, select, textarea');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    var active = document.activeElement;
    if (event.shiftKey && (active === first || active === sheet)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

function openModal(config) {
  if (modalOpen) return false;
  buildModal();
  var modal = document.getElementById('modal');
  var sheet = modal.querySelector('.sheet');
  document.getElementById('modal-title').textContent = config.title;
  var body = document.getElementById('modal-body');
  body.textContent = '';
  (config.paragraphs || []).forEach(function (text) {
    body.appendChild(el('p', null, text));
  });
  var actions = document.getElementById('modal-actions');
  actions.textContent = '';
  (config.actions || []).forEach(function (action) {
    var node;
    if (action.href) {
      node = el('a', 'btn ' + (action.solid ? 'btn-solid' : 'btn-ghost'));
      node.href = action.href;
      node.textContent = action.label;
      if (action.pay) node.setAttribute('data-pay', '');
      if (action.external) {
        node.target = '_blank';
        node.rel = 'noopener noreferrer';
        node.appendChild(el('span', 'sr-only', ' (opens in a new tab)'));
      }
    } else {
      node = el('button', 'btn ' + (action.solid ? 'btn-solid' : 'btn-ghost'), action.label);
      node.type = 'button';
      node.addEventListener('click', function () { closeModal(); });
    }
    actions.appendChild(node);
  });
  lastFocus = document.activeElement;
  modal.hidden = false;
  modalOpen = true;
  document.body.classList.add('has-modal');
  setPageInert(true);
  var primary = actions.querySelector('a, button') || sheet;
  primary.focus();
  return true;
}

function closeModal() {
  var modal = document.getElementById('modal');
  if (!modal || !modalOpen) return;
  modal.hidden = true;
  modalOpen = false;
  document.body.classList.remove('has-modal');
  setPageInert(false);
  if (lastFocus && lastFocus.focus) lastFocus.focus();
  if (inviteWaiting) {
    inviteWaiting = false;
    window.setTimeout(function () { maybeInvite(false); }, 900);
  }
}

var inviteTimer = 0;
var payHold = 0;

function seenInvite() {
  try { return sessionStorage.getItem('ss.invite') === '1'; } catch (ignore) { return false; }
}

function markInvite() {
  try { sessionStorage.setItem('ss.invite', '1'); } catch (ignore) {}
}

function openInvite() {
  if (seenInvite()) return;
  var opened = openModal({
    title: 'Start where every Shark starts — the free Sharked Up Assessment.',
    paragraphs: [
      'A brief profile. Your individual report and market data assets come back free, with a deeper diagnostic of your strongest and weakest pillars.'
    ],
    actions: [
      { href: 'assessment.html', label: 'Take the Free Assessment', solid: true },
      { label: 'Stay Sharked Up' }
    ]
  });
  if (!opened) {
    inviteWaiting = true;
    return;
  }
  markInvite();
}

function maybeInvite(fromExit) {
  if (seenInvite()) return;
  if (Date.now() < payHold) {
    if (!fromExit) {
      window.clearTimeout(inviteTimer);
      inviteTimer = window.setTimeout(function () { maybeInvite(false); }, (payHold - Date.now()) + 250);
    }
    return;
  }
  if (modalOpen || document.visibilityState === 'hidden') {
    inviteWaiting = true;
    return;
  }
  openInvite();
}

function initInvite() {
  document.addEventListener('pointerover', function (event) {
    if (event.target.closest && event.target.closest('[data-pay]')) payHold = Date.now() + 8000;
  }, true);
  document.addEventListener('focusin', function (event) {
    if (event.target.closest && event.target.closest('[data-pay]')) payHold = Date.now() + 8000;
  });
  document.addEventListener('pointerdown', function (event) {
    if (event.target.closest && event.target.closest('[data-pay]')) payHold = Date.now() + 8000;
  }, true);
  inviteTimer = window.setTimeout(function () { maybeInvite(false); }, 30000);
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.documentElement.addEventListener('mouseout', function (event) {
      if (event.clientY > 0) return;
      if (event.relatedTarget || event.toElement) return;
      maybeInvite(true);
    });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && inviteWaiting && !modalOpen) {
      inviteWaiting = false;
      maybeInvite(false);
    }
  });
}

function openFounding() {
  openModal({
    title: 'The Founding Call',
    paragraphs: [
      'One of only 100 seats. A glow-in-the-dark bracelet ships with the seat.',
      'The Back Door is the members\' terminal: the intel wire, the big screen, and the founders\' floor.',
      'Equity is more valuable than gold in the global private market.'
    ],
    actions: [
      {
        href: 'https://buy.stripe.com/5kQfZi94m85L98camI7kc0k',
        label: 'Become a Founding Member — $50',
        solid: true,
        pay: true,
        external: true
      },
      { label: 'Stay Sharked Up' }
    ]
  });
}

function initFounding() {
  document.addEventListener('click', function (event) {
    var trigger = event.target.closest && event.target.closest('[data-founding]');
    if (!trigger) return;
    event.preventDefault();
    openFounding();
  });
}

function safeMsg(value, fallback) {
  var msg = String(value || fallback || 'The desk could not be reached. Try again shortly.');
  if (/https?:|script\./i.test(msg)) return fallback || 'The desk could not be reached. Try again shortly.';
  return msg;
}

function showErrors(box, items) {
  if (!box) return;
  box.hidden = false;
  box.textContent = '';
  box.appendChild(el('p', null, 'A few lines still need an answer.'));
  var list = document.createElement('ul');
  items.forEach(function (item) {
    var li = document.createElement('li');
    var link = el('a', null, item.message);
    link.href = '#' + item.id;
    li.appendChild(link);
    list.appendChild(li);
  });
  box.appendChild(list);
  box.focus();
}

/* Instrument scoring. Q1 and Q2 are qualifiers. Q3–Q12 score 0–3
   into Hydration, Nutrition, Fitness, Mind, Economics — two questions
   each, 0–6 a pillar, 0–30 total. A tie for the low pillar breaks
   toward the wish named in question 2. */
var INSTRUMENT_PILLARS = ['Hydration', 'Nutrition', 'Fitness', 'Mind', 'Economics'];
var PILLAR_OF_Q = [-1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
var INSTRUMENT_REF = [
  'The water plan — free Pup tier of the Peak Performance beta',
  'A nutrition expert',
  'A gym',
  'A meditation instructor',
  'A business consultant — revenue-leak work at Street Sharkz'
];

function initAssessment() {
  var form = document.getElementById('assessment-form');
  var errors = document.getElementById('form-errors');
  var done = document.getElementById('assessment-done');
  if (!form || !done) return;
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var problems = [];
    var answers = [];
    var scores = [0, 0, 0, 0, 0];
    var i;
    for (i = 0; i < 12; i += 1) {
      var chosen = form.querySelector('input[name="q' + i + '"]:checked');
      var field = document.getElementById('field-q' + i);
      if (!chosen) {
        if (field) field.setAttribute('aria-invalid', 'true');
        problems.push({ id: 'field-q' + i, message: 'Question ' + (i + 1) + ' still needs a choice.' });
        answers.push(null);
        continue;
      }
      if (field) field.removeAttribute('aria-invalid');
      var value = parseInt(chosen.value, 10);
      answers.push(value);
      if (PILLAR_OF_Q[i] >= 0) scores[PILLAR_OF_Q[i]] += value;
    }
    var emailInput = document.getElementById('report-email');
    var email = emailInput.value.trim();
    if (!emailOk(email)) {
      emailInput.setAttribute('aria-invalid', 'true');
      problems.push({ id: 'report-email', message: 'Email is required.' });
    } else emailInput.removeAttribute('aria-invalid');
    var delivery = form.querySelector('input[name="delivery"]:checked');
    var phone = document.getElementById('report-phone').value.trim();
    if (delivery && delivery.value !== 'Email' && phone.replace(/\D/g, '').length < 7) {
      document.getElementById('report-phone').setAttribute('aria-invalid', 'true');
      problems.push({ id: 'report-phone', message: 'Add a phone number for a text message.' });
    } else document.getElementById('report-phone').removeAttribute('aria-invalid');
    if (problems.length) {
      showErrors(errors, problems);
      return;
    }
    errors.hidden = true;
    var q2 = answers[1];
    var total = scores.reduce(function (sum, n) { return sum + n; }, 0);
    var low = 0;
    var high = 0;
    scores.forEach(function (v, idx) {
      if (v < scores[low]) low = idx;
      if (v > scores[high]) high = idx;
    });
    var tied = [];
    scores.forEach(function (v, idx) { if (v === scores[low]) tied.push(idx); });
    if (tied.length > 1) {
      var pref = q2 === 0 ? [4] : q2 === 1 ? [0, 1, 2] : q2 === 2 ? [3] : [0, 1, 2, 3, 4];
      for (var k = 0; k < pref.length; k += 1) {
        if (tied.indexOf(pref[k]) >= 0) { low = pref[k]; break; }
      }
    }
    var even = scores[high] === scores[low];
    var band = total <= 10 ? 'Drifting — the leaks are running the boat.'
      : total <= 20 ? 'Holding — patched in places, leaking in others.'
      : 'Sharked Up — now it is about scale.';
    var rows = document.getElementById('map-rows');
    rows.textContent = '';
    scores.forEach(function (v, idx) {
      var row = el('div', 'map-row' + (!even && idx === low ? ' is-low' : ''));
      row.appendChild(el('span', null, INSTRUMENT_PILLARS[idx]));
      row.appendChild(el('strong', null, v + '/6'));
      rows.appendChild(row);
    });
    document.getElementById('map-total').textContent = 'Total ' + total + '/30 — ' + band;
    var diagnostic = document.getElementById('map-diagnostic');
    diagnostic.textContent = '';
    if (even) {
      diagnostic.appendChild(el('p', null, 'Even deck. All five pillars are level at ' + scores[0] + '/6 — no single leak, no single carrier. The diagnostic is the pattern itself: everything moves together, so the first pillar you feed lifts the rest.'));
    } else {
      diagnostic.appendChild(el('p', null, 'Your leak is in ' + INSTRUMENT_PILLARS[low] + '. The other four pillars are holding — this one is costing the rest.'));
      diagnostic.appendChild(el('p', null, 'Your strongest pillar is ' + INSTRUMENT_PILLARS[high] + ' at ' + scores[high] + '/6 — that is the deck the rest of the build stands on.'));
    }
    document.getElementById('map-ref').textContent = INSTRUMENT_REF[low];
    var partner = document.getElementById('map-partner');
    if (low === 1 || low === 2 || low === 3) {
      partner.hidden = false;
      partner.textContent = 'Introductions open with the founding class.';
    } else partner.hidden = true;
    var doorHost = document.getElementById('map-door');
    var offer = document.getElementById('map-offer');
    var door;
    if (low === 4) {
      door = {
        href: 'sharkonomicz.html',
        label: 'Open Sharkonomicz',
        note: 'Economics is the low pillar. Sharkonomicz is the business door.',
        external: false
      };
    } else if (total <= 10) {
      door = {
        href: 'https://buy.stripe.com/00waEYfsK99P70466s7kc0l',
        label: 'Start the beta — $10',
        note: 'The map is light. The $10 beta is the 90-day path.',
        external: true
      };
    } else if (total <= 20) {
      door = {
        href: 'https://buy.stripe.com/4gM14o4O64Tz5W09iE7kc0i',
        label: 'Get the bundle — $30',
        note: 'The book plus the premium beta. Read it, then run it.',
        external: true
      };
    } else {
      door = {
        href: 'https://buy.stripe.com/5kQfZi94m85L98camI7kc0k',
        label: 'Founding seat — $50',
        note: 'One of only 100 seats, with the bracelet and the Back Door.',
        external: true
      };
    }
    if (offer) offer.textContent = door.note;
    if (doorHost) {
      doorHost.textContent = '';
      var link = el('a', 'btn btn-solid', door.label);
      link.href = door.href;
      if (door.external) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('data-pay', '');
        link.appendChild(el('span', 'sr-only', ' (opens in a new tab)'));
      }
      doorHost.appendChild(link);
      var fine = el('p', 'fine');
      var terms = el('a', null, 'Terms and license');
      terms.href = 'terms.html';
      var refunds = el('a', null, 'Refunds');
      refunds.href = 'refund.html';
      fine.appendChild(terms);
      fine.appendChild(document.createTextNode(' · '));
      fine.appendChild(refunds);
      doorHost.appendChild(fine);
    }
    var payload = {
      name: document.getElementById('report-name').value.trim(),
      email: email,
      phone: phone,
      delivery: delivery ? delivery.value : 'Email',
      answers: answers,
      scores: {
        hydration: scores[0],
        nutrition: scores[1],
        fitness: scores[2],
        mind: scores[3],
        economics: scores[4]
      }
    };
    var button = document.getElementById('send-report');
    var confirm = document.getElementById('confirm-line');
    button.disabled = true;
    form.hidden = true;
    done.hidden = false;
    done.focus();
    function finish(result) {
      if (result && result.ok) confirm.textContent = 'Your full report is on its way by the delivery you chose.';
      else confirm.textContent = 'Your map is on this page. Keep it, and start with the path above.';
    }
    if (window.PortalAPI) {
      window.PortalAPI.call('submitAssessment', payload).then(finish).catch(function () { finish(null); });
    } else finish(null);
  });
}

function initSeller() {
  return;
}

function renderGauge(host, you) {
  host.textContent = '';
  host.appendChild(el('p', 'gauge-caption', 'Depth gauge'));
  host.appendChild(el('p', 'gauge-end', 'Surface'));
  var list = el('ol', 'gauge-list');
  var index = 0;
  RANKS.forEach(function (rank, i) {
    var item = el('li', 'gauge-stop');
    item.appendChild(el('span', 'gauge-pts', String(rank.points)));
    item.appendChild(el('span', 'gauge-mark'));
    item.appendChild(el('span', 'gauge-rank', rank.name));
    if (you && you.rank === rank.name) {
      item.classList.add('is-you');
      index = i;
    }
    list.appendChild(item);
  });
  var depth = you ? index / (RANKS.length - 1) : 0;
  list.style.setProperty('--depth', String(depth));
  host.appendChild(list);
  host.appendChild(el('p', 'gauge-end gauge-deep', 'Depth · Apex 66'));
}

function renderTable(host, rows, youName) {
  var table = document.createElement('table');
  table.className = 'board';
  var head = document.createElement('thead');
  var hr = document.createElement('tr');
  var live = (rows || []).some(function (row) { return row.careerDays != null || row.streak != null || row.rankName; });
  (live ? ['Member', 'Rank', 'Days', 'Streak'] : ['Member', 'Rank', 'Points']).forEach(function (label) {
    var th = el('th', null, label);
    th.scope = 'col';
    hr.appendChild(th);
  });
  head.appendChild(hr);
  var body = document.createElement('tbody');
  (rows || []).forEach(function (row) {
    var tr = document.createElement('tr');
    if (youName && row.username === youName) tr.className = 'is-you';
    tr.appendChild(el('td', null, row.username || ''));
    tr.appendChild(el('td', null, row.rankName || row.rank || ''));
    if (live) {
      tr.appendChild(el('td', 'pts', row.careerDays == null ? '' : String(row.careerDays)));
      tr.appendChild(el('td', 'pts', row.streak == null ? '' : String(row.streak)));
    } else {
      tr.appendChild(el('td', 'pts', row.points == null ? '' : String(row.points)));
    }
    body.appendChild(tr);
  });
  table.appendChild(head);
  table.appendChild(body);
  host.textContent = '';
  var wrap = el('div', 'table-wrap');
  wrap.appendChild(table);
  host.appendChild(wrap);
}

function selectTab(tabs, panels, tab) {
  Array.prototype.forEach.call(tabs, function (item) {
    var selected = item === tab;
    item.setAttribute('aria-selected', selected ? 'true' : 'false');
    item.tabIndex = selected ? 0 : -1;
  });
  Array.prototype.forEach.call(panels, function (panel) {
    panel.hidden = panel.id !== tab.getAttribute('aria-controls');
  });
}

function initPortal() {
  var gate = document.getElementById('gate');
  var home = document.getElementById('member-home');
  var status = document.getElementById('gate-status');
  var emailInput = document.getElementById('gate-email');
  var codeInput = document.getElementById('gate-code');
  var codeStep = document.getElementById('code-step');
  var sendButton = document.getElementById('send-code');
  var confirmButton = document.getElementById('confirm-code');
  if (!gate || !home) return;

  function say(text) { if (status) status.textContent = text || ''; }

  function showHome(profile) {
    gate.hidden = true;
    home.hidden = false;
    var name = document.getElementById('desk-name');
    var meta = document.getElementById('desk-meta');
    if (name) name.textContent = profile && profile.name ? profile.name : 'Member';
    var bits = [];
    if (profile && profile.username) bits.push(profile.username);
    if (profile && profile.tier) bits.push(profile.tier);
    var seat = profile ? seatLabel(profile.seat) : '';
    if (seat) bits.push(seat);
    if (meta) meta.textContent = bits.join(' · ');
    renderAppPanel([]);
    loadDesk(readPass(), profile);
  }

  function renderAppPanel(dropItems) {
    var app = document.getElementById('panel-app');
    if (!app) return;
    app.textContent = '';
    app.appendChild(el('h2', null, 'My App'));
    app.appendChild(el('p', 'lede-left', 'The practice lives on this desk: five pillars, ninety days, and the rank ladder. Hydration, Fitness, Nutrition, Mind, Economics.'));
    var list = el('ol', 'quiet-list');
    PILLARS.forEach(function (pillar, i) {
      var item = el('li');
      item.appendChild(el('span', 'idx', '0' + (i + 1)));
      item.appendChild(document.createTextNode(' ' + pillar));
      list.appendChild(item);
    });
    app.appendChild(list);
    app.appendChild(el('p', null, 'Ninety days. One path.'));
    (dropItems || []).forEach(function (item) {
      var card = el('article', 'drop');
      card.appendChild(el('p', 'kind', item.when || [item.category, item.date].filter(Boolean).join(' · ') || 'Release'));
      card.appendChild(el('h3', null, item.title || 'Release'));
      var note = item.note || item.body;
      if (note) card.appendChild(el('p', null, note));
      app.appendChild(card);
    });
  }

  function loadDesk(pass, profile) {
    if (!window.PortalAPI || !pass) return;
    Promise.all([
      window.PortalAPI.call('getResources', pass),
      window.PortalAPI.call('getDrops', pass),
      window.PortalAPI.call('getLeaderboard', pass)
    ]).then(function (results) {
      var resources = results[0] || {};
      var drops = results[1] || {};
      var board = results[2] || {};
      var resourceItems = resources.resources || resources.items || [];
      var dropItems = drops.drops || drops.items || [];
      var rows = board.board || board.rows || [];
      var you = null;
      rows.forEach(function (row) {
        if (profile && row.username && row.username === profile.username) {
          var named = rankByName(row.rankName || row.rank);
          you = { username: row.username, rank: named ? named.name : (row.rankName || row.rank || '') };
        }
      });
      renderAppPanel(dropItems);
      var learn = document.getElementById('panel-learn');
      if (learn) {
        learn.textContent = '';
        learn.appendChild(el('h2', null, 'Learn'));
        resourceItems.forEach(function (item) {
          var card = el('article', 'resource');
          card.appendChild(el('p', 'kind', item.kind || item.type || 'Note'));
          card.appendChild(el('h3', null, item.title || 'Note'));
          if (item.note) card.appendChild(el('p', null, item.note));
          learn.appendChild(card);
        });
      }
      var ladder = document.getElementById('panel-ladder');
      if (ladder) {
        ladder.textContent = '';
        ladder.appendChild(el('h2', null, 'Leaderboard'));
        var gauge = el('div', 'gauge');
        renderGauge(gauge, you || board.you || null);
        ladder.appendChild(gauge);
        var tableHost = el('div');
        renderTable(tableHost, rows, profile && profile.username);
        ladder.appendChild(tableHost);
      }
    }).catch(function (err) {
      say(safeMsg(err && err.message, 'The desk is quiet. Sign in again in a moment.'));
    });
  }

  var existing = readPass();
  var profile = readProfile();
  if (existing && profile) showHome(profile);

  function sendCode() {
    if (!window.PortalAPI) { say('The desk is not connected yet.'); return; }
    var email = emailInput.value.trim();
    if (!emailOk(email)) {
      emailInput.setAttribute('aria-invalid', 'true');
      say('Enter a real email so the code has somewhere to go.');
      emailInput.focus();
      return;
    }
    emailInput.removeAttribute('aria-invalid');
    sendButton.disabled = true;
    say('Sending.');
    window.PortalAPI.call('sendMyCode', email).then(function (result) {
      sendButton.disabled = false;
        if (!result || !result.ok) {
        say(safeMsg(result && result.error, 'The code did not send.'));
        return;
      }
      codeStep.hidden = false;
      say('Check your inbox for a 6-digit code.');
      codeInput.focus();
    }).catch(function () {
      sendButton.disabled = false;
      say('The code did not send.');
    });
  }

  function confirmCode() {
    if (!window.PortalAPI) { say('The desk is not connected yet.'); return; }
    var email = emailInput.value.trim();
    var code = codeInput.value.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(code)) {
      codeInput.setAttribute('aria-invalid', 'true');
      say('That code needs six digits.');
      codeInput.focus();
      return;
    }
    codeInput.removeAttribute('aria-invalid');
    confirmButton.disabled = true;
    say('Checking the code.');
    window.PortalAPI.call('confirmCode', email, code).then(function (result) {
      confirmButton.disabled = false;
      if (!result || !result.ok || !result.pass) {
        say((result && result.error) || 'That code was not accepted.');
        return;
      }
      /* The engine may return a url. Do not write it into the page, a link, or the address bar. */
      var nextProfile = {
        name: result.name || 'Member',
        username: result.username || '',
        tier: result.tier || 'Member',
        seat: result.seat == null ? null : result.seat
      };
      savePass(result.pass);
      saveProfile(nextProfile);
      say('');
      showHome(nextProfile);
    }).catch(function () {
      confirmButton.disabled = false;
      say('That code was not accepted.');
    });
  }

  if (sendButton) sendButton.addEventListener('click', sendCode);
  if (confirmButton) confirmButton.addEventListener('click', confirmCode);
  if (emailInput) {
    emailInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') { event.preventDefault(); sendCode(); }
    });
  }
  if (codeInput) {
    codeInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') { event.preventDefault(); confirmCode(); }
    });
  }

  var tabList = document.querySelector('.tabs');
  if (tabList) {
    var tabs = tabList.querySelectorAll('[role="tab"]');
    var panels = home.querySelectorAll('[role="tabpanel"]');
    Array.prototype.forEach.call(tabs, function (tab, index) {
      tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
      tab.addEventListener('click', function () { selectTab(tabs, panels, tab); });
      tab.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        var next = event.key === 'ArrowRight' ? index + 1 : index - 1;
        if (next < 0) next = tabs.length - 1;
        if (next >= tabs.length) next = 0;
        tabs[next].focus();
        selectTab(tabs, panels, tabs[next]);
      });
    });
  }

  var out = document.getElementById('sign-out');
  if (out) {
    out.addEventListener('click', function () {
      clearSession();
      home.hidden = true;
      gate.hidden = false;
      codeStep.hidden = true;
      if (codeInput) codeInput.value = '';
      say('');
      emailInput.focus();
    });
  }
}

function isExternal(url) {
  return /^https?:\/\//i.test(url || '');
}

function pinHeadline(item) {
  var pin = document.getElementById('wire-pin');
  var wire = document.getElementById('wire');
  if (!pin || !wire) return;
  pin.hidden = false;
  pin.textContent = '';
  wire.classList.add('is-pinned');
  pin.appendChild(el('p', 'wire-meta', (item.source || 'DISPATCH') + ' · ' + (item.time || '')));
  pin.appendChild(el('p', 'wire-full', item.headline || ''));
  var row = el('div', 'wire-pin-actions');
  if (item.url) {
    var link = el('a', 'text-link', 'Read the source');
    link.href = item.url;
    if (isExternal(item.url)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.appendChild(el('span', 'sr-only', ' (opens in a new tab)'));
    }
    row.appendChild(link);
  }
  var close = el('button', 'text-link', 'Close dispatch');
  close.type = 'button';
  close.addEventListener('click', function () {
    pin.hidden = true;
    pin.textContent = '';
    wire.classList.remove('is-pinned');
    close.blur();
  });
  row.appendChild(close);
  pin.appendChild(row);
  close.focus();
}

function renderWire(headlines) {
  var track = document.getElementById('wire-track');
  if (!track) return;
  var items = (headlines || []).map(normalizeHeadline);
  track.textContent = '';
  track.classList.remove('is-on');
  function fill(hidden) {
    var row = el('div', 'wire-row');
    if (hidden) row.setAttribute('aria-hidden', 'true');
    items.forEach(function (item, index) {
      var button = el('button', 'wire-item');
      button.type = 'button';
      if (item.newest || index === 0) button.classList.add('is-newest');
      var bar = el('span', 'redact');
      bar.setAttribute('aria-hidden', 'true');
      button.appendChild(bar);
      button.appendChild(el('span', 'wire-text', item.headline || ''));
      button.appendChild(el('span', 'wire-meta', (item.source || '') + ' · ' + (item.time || '')));
      button.addEventListener('click', function () { pinHeadline(item); });
      row.appendChild(button);
    });
    track.appendChild(row);
  }
  fill(false);
  if (!reduceMotion()) {
    fill(true);
    track.classList.add('is-on');
  }
}

function buildOwnScreen(item) {
  var screen = el('div', 'screen screen-wide');
  screen.setAttribute('data-screen', '');
  var still = el('div', 'still');
  var img = document.createElement('img');
  img.src = 'assets/img/ss-hex-logo-480.webp';
  img.alt = '';
  img.width = 480;
  img.height = 480;
  still.appendChild(img);
  still.appendChild(el('p', 'still-kicker', item.source || 'Street Sharkz'));
  still.appendChild(el('p', 'still-title', item.title || 'Clip'));
  var video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.preload = 'none';
  video.poster = 'assets/img/ss-hex-logo-480.webp';
  var source = document.createElement('source');
  source.setAttribute('data-src', item.src || '');
  source.type = 'video/mp4';
  var track = document.createElement('track');
  track.kind = 'captions';
  track.srclang = 'en';
  track.label = 'English';
  track.src = 'assets/video/clip-note.vtt';
  track.default = true;
  video.appendChild(source);
  video.appendChild(track);
  var sound = el('button', 'sound', 'Sound on');
  sound.type = 'button';
  sound.setAttribute('aria-pressed', 'false');
  screen.appendChild(still);
  screen.appendChild(video);
  screen.appendChild(sound);
  return screen;
}

function renderBigScreen(item) {
  var frame = document.getElementById('screen-frame');
  var title = document.getElementById('screen-title');
  if (!frame || !title) return;
  frame.textContent = '';
  title.textContent = item && item.title ? item.title : 'The screen is quiet.';
  if (!item) return;
  if (item.kind === 'own') {
    frame.appendChild(buildOwnScreen(item));
    initScreens(frame);
    return;
  }
  if (item.vid) {
    var embedWrap = el('div', 'broadcast-link screen-embed');
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(item.vid) + '?rel=0&autoplay=1&mute=1';
    iframe.title = item.title || 'Broadcast';
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.loading = 'lazy';
    embedWrap.appendChild(iframe);
    embedWrap.appendChild(el('span', 'bug', item.bug || ('GLOBAL INTEL — ' + (item.source || 'DESK'))));
    frame.appendChild(embedWrap);
    return;
  }
  var link = el('a', 'broadcast-link');
  link.href = item.href || '#';
  if (isExternal(item.href)) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  if (item.thumb) {
    var image = document.createElement('img');
    image.src = item.thumb;
    image.alt = '';
    link.appendChild(image);
  } else {
    var art = el('div', 'broadcast-art source-' + String(item.source || '').toLowerCase());
    link.appendChild(art);
  }
  link.appendChild(el('span', 'bug', item.bug || ('GLOBAL INTEL — ' + (item.source || 'DESK'))));
  link.appendChild(el('span', 'sr-only', (item.title || 'Open the source') + ' (opens in a new tab)'));
  frame.appendChild(link);
}

function mount(id) {
  var section = document.getElementById(id);
  if (!section) return null;
  return section.querySelector('.wrap') || section;
}

function renderFounders(videos) {
  var host = mount('founder-stack');
  if (!host) return;
  host.textContent = '';
  host.appendChild(el('h2', null, 'Founders\' stack'));
  host.appendChild(el('p', 'lede-left', 'Private founder clips sit under the screen and play here.'));
  (videos || []).forEach(function (item) {
    var block = el('article', 'stack-item');
    block.appendChild(el('h3', null, item.title || 'Clip'));
    if (item.note) block.appendChild(el('p', null, item.note));
    var local = item.src || ((item.url && /\.mp4($|\?)/i.test(item.url)) ? item.url : '');
    if (local) {
      block.appendChild(buildOwnScreen({ title: item.title, source: 'STREET SHARKZ', src: local }));
    } else {
      var href = watchHref(item);
      if (href) {
        var link = el('a', 'btn btn-ghost', 'Open the clip');
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.appendChild(el('span', 'sr-only', ' (opens in a new tab)'));
        block.appendChild(link);
      }
    }
    host.appendChild(block);
  });
  initScreens(host);
}

function renderReleases(items) {
  var host = mount('releases');
  if (!host) return;
  host.textContent = '';
  host.appendChild(el('h2', null, 'Releases'));
  if (!items || !items.length) {
    host.appendChild(el('p', null, 'No release on the desk right now.'));
    return;
  }
  items.forEach(function (item) {
    var card = el('article', 'drop');
    card.appendChild(el('p', 'kind', item.when || 'Release'));
    card.appendChild(el('h3', null, item.title || 'Release'));
    if (item.note) card.appendChild(el('p', null, item.note));
    host.appendChild(card);
  });
}

function renderFloor(posts) {
  var list = document.getElementById('floor-list');
  if (!list) return;
  list.textContent = '';
  (posts || []).forEach(function (post) {
    var card = el('article', 'post');
    card.appendChild(el('p', 'kind', (post.username || 'member') + ' · ' + formatWhen(post.at)));
    card.appendChild(el('p', null, post.text || ''));
    list.appendChild(card);
  });
}

function renderRoomLadder(data) {
  var host = mount('room-ladder');
  if (!host) return;
  host.textContent = '';
  host.appendChild(el('h2', null, 'Depth gauge'));
  var gauge = el('div', 'gauge');
  renderGauge(gauge, data.you || null);
  host.appendChild(gauge);
  var tableHost = el('div');
  renderTable(tableHost, data.rows || [], data.you && data.you.username);
  host.appendChild(tableHost);
}

function nextBoundary(now) {
  var current = new Date(now);
  var next = new Date(current.getTime());
  next.setSeconds(0, 0);
  if (current.getMinutes() < 30) next.setMinutes(30);
  else {
    next.setHours(current.getHours() + 1);
    next.setMinutes(0);
  }
  return next;
}

function scheduleRoll(onRoll) {
  var wait = nextBoundary(Date.now()).getTime() - Date.now();
  if (wait < 200) wait += 30 * 60 * 1000;
  var when = new Date(Date.now() + wait);
  var label = document.getElementById('next-roll');
  if (label) {
    label.dateTime = when.toISOString();
    label.textContent = formatWhen(when.toISOString());
  }
  window.clearTimeout(rollTimer);
  rollTimer = window.setTimeout(function () {
    onRoll();
    scheduleRoll(onRoll);
  }, wait);
}

function showRoom(pass, profile) {
  var locked = document.getElementById('room-locked');
  var open = document.getElementById('room-open');
  var who = document.getElementById('room-who');
  function lock() {
    if (locked) locked.hidden = false;
    if (open) open.hidden = true;
  }
  function paint(list) {
    if (!list || !list.length) {
      renderBigScreen(null);
      return;
    }
    var index = ((roomSlot % list.length) + list.length) % list.length;
    renderBigScreen(list[index]);
  }
  var news = [];
  function apply(data) {
    if (!data || !data.ok) { lock(); return; }
    if (locked) locked.hidden = true;
    if (open) open.hidden = false;
    if (who) {
      var bits = [];
      var person = data.name || (profile && profile.name) || data.username || (profile && profile.username) || '';
      if (person) bits.push(person);
      if (data.seat || (profile && profile.seat)) bits.push(seatLabel(data.seat || profile.seat));
      who.textContent = bits.filter(Boolean).join(' · ');
    }
    if (typeof data.rotationSlot === 'number' && isFinite(data.rotationSlot)) roomSlot = data.rotationSlot;
    news = (data.newsVideos || []).map(normalizeNews);
    renderWire(data.headlines || []);
    paint(news);
    renderFounders(data.videos || []);
    renderReleases((data.drops || []).map(function (item) {
      return {
        title: item.title,
        when: item.when || [item.category, item.date].filter(Boolean).join(' · '),
        note: item.note || item.body
      };
    }));
    renderFloor((data.posts || []).map(normalizePost));
    var rows = data.board || [];
    var you = null;
    var name = profile && profile.username;
    rows.forEach(function (row) {
      if (name && row.username === name) {
        var named = rankByName(row.rankName || row.rank);
        you = { username: row.username, rank: named ? named.name : '' };
      }
    });
    renderRoomLadder({ rows: rows, you: you });
  }
  function roll() {
    window.PortalAPI.call('getRoomData', pass).then(function (fresh) {
      if (fresh && fresh.ok) {
        if (typeof fresh.rotationSlot === 'number' && isFinite(fresh.rotationSlot)) roomSlot = fresh.rotationSlot;
        else roomSlot += 1;
        news = (fresh.newsVideos || []).map(normalizeNews);
        renderWire(fresh.headlines || []);
      } else roomSlot += 1;
      paint(news);
    }).catch(function () { roomSlot += 1; paint(news); });
  }
  window.PortalAPI.call('getRoomData', pass).then(function (data) {
    apply(data);
    if (data && data.ok) scheduleRoll(roll);
  }).catch(function () { lock(); });

  var floorForm = document.getElementById('floor-form');
  if (floorForm && !floorForm.dataset.bound) {
    floorForm.dataset.bound = '1';
    floorForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = document.getElementById('floor-text');
      var note = document.getElementById('floor-status');
      var text = input.value.trim();
      if (!text) {
        if (note) note.textContent = 'Write a note before you post.';
        return;
      }
      window.PortalAPI.call('postToBoard', pass, text).then(function (result) {
        if (!result || !result.ok) {
          if (note) note.textContent = (result && result.error) || 'The floor did not take that.';
          return;
        }
        input.value = '';
        if (note) note.textContent = 'Posted.';
        return window.PortalAPI.call('getBoard', pass);
      }).then(function (board) {
        if (board && board.posts) renderFloor(board.posts.map(normalizePost));
      }).catch(function () {
        if (note) note.textContent = 'The floor did not take that.';
      });
    });
  }
}

function initRoom() {
  try {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = params.get('pass');
    if (fromQuery) {
      savePass(fromQuery);
      params.delete('pass');
      var qs = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    }
  } catch (ignore) {}
  var pass = readPass();
  var profile = readProfile();
  var out = document.getElementById('room-out');
  if (out) {
    out.addEventListener('click', function () {
      window.clearTimeout(rollTimer);
      clearSession();
      window.location.href = 'portal.html';
    });
  }
  if (!pass || !window.PortalAPI) return;
  showRoom(pass, profile);
}

function boot() {
  var page = document.body.getAttribute('data-page') || '';
  initNav();
  initReveal();
  initSound();
  initScreens(document);
  initFounding();
  if (page === 'home') {
    initHero();
    initTicker();
    initInvite();
  }
  if (page === 'assessment') initAssessment();
  if (page === 'seller') initSeller();
  if (page === 'portal') initPortal();
  if (page === 'room') initRoom();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
