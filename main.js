/**
 * Street Sharkz Professional — site behavior (Fin, 2026-11-18).
 * No dependencies. Loaded with defer on every page. Every feature is
 * guarded: a page that lacks an element simply skips that feature.
 *
 *   - Ticker: duplicate the track once for a seamless -50% loop.
 *   - Reveal: IntersectionObserver fades .reveal elements in (.in).
 *   - Videos: play in view, pause out of view.
 *   - Sound toggles: one video unmuted at a time.
 *   - Pop-ups: one calming system — the Assessment Invite (once per
 *     session, 30s or exit intent) and the Founding Call panel. Never
 *     stacked, never both open.
 *   - Footer year auto-fill.
 */
(function () {
  "use strict";

  /* ---------------- ticker: seamless loop ---------------- */
  function initTicker() {
    var tracks = document.querySelectorAll(".ticker .track, .intelwire .track");
    Array.prototype.forEach.call(tracks, function (track) {
      if (track.dataset.duped) return;
      track.innerHTML += track.innerHTML;
      track.dataset.duped = "1";
    });
  }

  /* ---------------- reveal on scroll ---------------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  /* ---------------- videos: play in view, pause out ---------------- */
  function initVideos() {
    var videos = document.querySelectorAll("video");
    if (!videos.length) return;
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.35 });
    Array.prototype.forEach.call(videos, function (v) { io.observe(v); });
  }

  /* ---------------- sound toggles: one voice at a time ---------------- */
  function findVideoFor(toggle) {
    var node = toggle;
    for (var i = 0; i < 5 && node; i++) {
      node = node.parentElement;
      if (!node) break;
      var v = node.querySelector("video");
      if (v) return v;
    }
    return null;
  }

  function syncToggleLabels() {
    Array.prototype.forEach.call(document.querySelectorAll(".sound-toggle"), function (t) {
      var v = findVideoFor(t);
      if (v) t.textContent = v.muted ? "SOUND ON" : "SOUND OFF";
    });
  }

  function initSoundToggles() {
    var toggles = document.querySelectorAll(".sound-toggle");
    if (!toggles.length) return;
    Array.prototype.forEach.call(toggles, function (toggle) {
      toggle.addEventListener("click", function () {
        var video = findVideoFor(toggle);
        if (!video) return;
        if (video.muted) {
          Array.prototype.forEach.call(document.querySelectorAll("video"), function (v) { v.muted = true; });
          video.muted = false;
          var p = video.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          video.muted = true;
        }
        syncToggleLabels();
      });
    });
    syncToggleLabels();
  }

  /* ---------------- pop-ups: one calming system ---------------- */
  var inviteDeferred = false;

  function anyPopupOpen() {
    return !!document.querySelector(".popup-veil.show");
  }

  function openPopup(veil) {
    if (!veil || veil.classList.contains("show")) return true;
    if (anyPopupOpen()) return false;
    veil.classList.add("show");
    return true;
  }

  function closePopup(veil) {
    if (!veil) return;
    veil.classList.remove("show");
    if (inviteDeferred) {
      inviteDeferred = false;
      var invite = document.getElementById("invite-popup");
      if (invite) setTimeout(function () { tryShowInvite(); }, 450);
    }
  }

  function inviteSeen() {
    try { return !!sessionStorage.getItem("ssp_invite_seen"); } catch (e) { return false; }
  }

  function markInviteSeen() {
    try { sessionStorage.setItem("ssp_invite_seen", "1"); } catch (e) {}
  }

  function tryShowInvite() {
    var invite = document.getElementById("invite-popup");
    if (!invite || inviteSeen()) return;
    if (openPopup(invite)) {
      markInviteSeen();
    } else {
      /* Another panel is open — show the invite once it closes, never stacked. */
      inviteDeferred = true;
    }
  }

  function initPopups() {
    var invite = document.getElementById("invite-popup");
    var founding = document.getElementById("founding-popup");
    if (!invite && !founding) return;

    /* Invite: after 30s OR on exit intent, whichever comes first, once per session. */
    if (invite && !inviteSeen()) {
      setTimeout(tryShowInvite, 30000);
      document.addEventListener("mouseout", function (e) {
        if (!e.relatedTarget && e.clientY <= 8) tryShowInvite();
      });
    }

    /* Founding Call: opens only from its own link. */
    var opener = document.getElementById("open-founding");
    if (opener && founding) {
      opener.addEventListener("click", function (e) {
        e.preventDefault();
        openPopup(founding);
      });
    }

    /* Close: [data-close], backdrop click, Escape. */
    Array.prototype.forEach.call(document.querySelectorAll(".popup-veil"), function (veil) {
      veil.addEventListener("click", function (e) {
        if (e.target === veil) closePopup(veil);
      });
      Array.prototype.forEach.call(veil.querySelectorAll("[data-close]"), function (btn) {
        btn.addEventListener("click", function () { closePopup(veil); });
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        Array.prototype.forEach.call(document.querySelectorAll(".popup-veil.show"), function (veil) {
          closePopup(veil);
        });
      }
    });
  }

  /* ---------------- footer year ---------------- */
  function initYear() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function init() {
    initTicker();
    initReveal();
    initVideos();
    initSoundToggles();
    initPopups();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
