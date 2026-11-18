/* ============================================================
   api.js — STUB
   TODO-FIN: replace this entire file with the live engine client.
   There is no endpoint in this file. PortalAPI.call returns
   realistic mock shapes so the static pages can be previewed.
   Mock mode is reported in the console only.
   Do not put an engine address in any page. Keep it in the
   file that replaces this stub.
   ============================================================ */
(function (global) {
  'use strict';

  var MOCK = true;

  function wait(value, ms) {
    return new Promise(function (resolve) {
      global.setTimeout(function () { resolve(value); }, ms == null ? 280 : ms);
    });
  }

  function deny(message) {
    return wait({ ok: false, error: message || 'The desk could not complete that.' });
  }

  function hasPass(pass) {
    return typeof pass === 'string' && pass.length >= 8;
  }

  function emailOk(email) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  var floor = [
    {
      id: 'p1',
      username: 'keel',
      text: 'Logged the day. The finish is most important.',
      at: '2026-11-18T18:05:00Z'
    }
  ];

  try {
    var saved = global.sessionStorage && global.sessionStorage.getItem('ss.floor');
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed && parsed.length) floor = parsed;
    }
  } catch (ignore) { /* preview floor stays in memory */ }

  function storeFloor() {
    try {
      if (global.sessionStorage) {
        global.sessionStorage.setItem('ss.floor', JSON.stringify(floor));
      }
    } catch (ignore) { /* memory copy still stands */ }
  }

  var handlers = {
    sendMyCode: function (email) {
      if (!emailOk(email)) return deny('Enter a real email so the code has somewhere to go.');
      return wait({ ok: true, sent: true });
    },

    confirmCode: function (email, code) {
      if (!emailOk(email)) return deny('Enter the same email you used for the code.');
      var digits = String(code || '').replace(/\s+/g, '');
      if (!/^\d{6}$/.test(digits)) return deny('That code needs six digits.');
      return wait({
        ok: true,
        pass: 'stub-session-token',
        url: '',
        tier: 'Founding',
        seat: 7,
        name: 'Preview Member',
        username: 'preview'
      });
    },

    getLeaderboard: function (pass) {
      if (!hasPass(pass)) return deny('Sign in required.');
      return wait({
        ok: true,
        you: { username: 'preview', points: 14, rank: 'Bosun' },
        rows: [
          { username: 'preview', points: 14, rank: 'Bosun' },
          { username: 'keel', points: 7, rank: 'Lookout' },
          { username: 'harbor', points: 3, rank: 'Rigger' },
          { username: 'north', points: 0, rank: 'Deckhand' }
        ]
      });
    },

    getResources: function (pass) {
      if (!hasPass(pass)) return deny('Sign in required.');
      return wait({
        ok: true,
        items: [
          { id: 'r1', title: 'The spine', kind: 'Method', note: 'Assess, Plan, Act, Log, Review, Adjust.' },
          { id: 'r2', title: 'Five pillars', kind: 'Practice', note: 'Hydration, Fitness, Nutrition, Mind, Economics.' },
          { id: 'r3', title: 'Ninety days', kind: 'Path', note: 'One shark. One path. Ninety days.' },
          { id: 'r4', title: 'Finesse in practication', kind: 'Standard', note: 'Observe, think, act, log, improve, repeat — finesse in practication.' }
        ]
      });
    },

    getDrops: function (pass) {
      if (!hasPass(pass)) return deny('Sign in required.');
      return wait({
        ok: true,
        items: [
          { id: 'd1', title: 'Founding bracelet', when: 'Ships with the seat', note: 'Glow-in-the-dark. One of only 100.' },
          { id: 'd2', title: 'Individual report', when: 'After the assessment', note: 'Market data assets, and a deeper diagnostic of your strongest and weakest pillars.' }
        ]
      });
    },

    getBoard: function (pass) {
      if (!hasPass(pass)) return deny('Sign in required.');
      return wait({ ok: true, posts: floor.slice() });
    },

    postToBoard: function (pass, text) {
      if (!hasPass(pass)) return deny('Sign in required.');
      var clean = String(text || '').trim();
      if (!clean) return deny('Write something before you post.');
      if (clean.length > 600) return deny('Keep a floor note to 600 characters.');
      var post = {
        id: 'p' + Date.now(),
        username: 'preview',
        text: clean,
        at: new Date().toISOString()
      };
      floor.unshift(post);
      storeFloor();
      return wait({ ok: true, post: post });
    },

    getRoomData: function (pass) {
      if (!hasPass(pass)) return deny('Sign in required.');
      return wait({
        ok: true,
        rotationSlot: 0,
        headlines: [
          {
            id: 'hw-1',
            headline: 'Founding seats stand at one of only 100.',
            source: 'STREET SHARKZ',
            time: '18:10 ET',
            url: 'index.html#founding',
            newest: true
          },
          {
            id: 'hw-2',
            headline: 'Pirate Radio holds the chair Monday, Wednesday, and Friday at 7 PM ET.',
            source: 'PIRATE RADIO',
            time: '07:00 ET',
            url: 'https://www.youtube.com/@StreetSharkz'
          },
          {
            id: 'hw-3',
            headline: 'Sharkonomicz spine holds: Assess, Plan, Act, Log, Review, Adjust.',
            source: 'SHARKONOMICZ',
            time: '12:00 ET',
            url: 'index.html#sharkonomicz'
          },
          {
            id: 'hw-4',
            headline: 'Public markets desk is on the big screen. Tap a dispatch to open its source.',
            source: 'INTEL WIRE',
            time: '16:30 ET',
            url: 'https://www.bloomberg.com/markets'
          },
          {
            id: 'hw-5',
            headline: 'The glow-in-the-dark bracelet ships with a founding seat.',
            source: 'FOUNDING',
            time: '09:40 ET',
            url: 'index.html#founding'
          }
        ],
        newsVideos: [
          {
            id: 'nv-bb',
            kind: 'news',
            title: 'Public markets desk',
            source: 'BLOOMBERG',
            bug: 'GLOBAL INTEL — BLOOMBERG',
            href: 'https://www.bloomberg.com/markets'
          },
          {
            id: 'nv-bridge',
            kind: 'own',
            title: 'Bridge note',
            source: 'STREET SHARKZ',
            bug: 'BRIDGE — STREET SHARKZ',
            src: 'assets/video/bridge-note.mp4'
          },
          {
            id: 'nv-ms',
            kind: 'news',
            title: 'Evening public broadcast',
            source: 'MSNBC',
            bug: 'GLOBAL INTEL — MSNBC',
            href: 'https://www.msnbc.com/'
          }
        ],
        videos: [
          {
            id: 'fv-1',
            title: 'Founders’ table',
            src: 'assets/video/founders-table.mp4'
          },
          {
            id: 'fv-2',
            title: 'Keel and course',
            src: 'assets/video/keel-and-course.mp4'
          }
        ]
      });
    },

    submitAssessment: function (payload) {
      if (!payload || !payload.contact || !emailOk(payload.contact.email)) {
        return deny('An email is required before the report can be sent.');
      }
      if (!payload.answers || !payload.answers.length) {
        return deny('The assessment needs answers before it can be sent.');
      }
      return wait({ ok: true, received: true });
    },

    /* TODO-FIN: confirm this function name with the live engine. */
    submitSellerIntake: function (payload) {
      if (!payload || !emailOk(payload.email)) {
        return deny('An email is required on the intake.');
      }
      return wait({ ok: true, received: true });
    }
  };

  function call(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    var handler = handlers[fn];
    if (!handler) return deny('That call is not on the desk.');
    try {
      return Promise.resolve(handler.apply(null, args));
    } catch (err) {
      return deny('The desk could not complete that.');
    }
  }

  if (MOCK && global.console && global.console.info) {
    global.console.info('[Street Sharkz] api.js stub is in mock mode. No live endpoint is connected.');
  }

  global.PortalAPI = {
    call: call,
    mock: true
  };
})(window);
