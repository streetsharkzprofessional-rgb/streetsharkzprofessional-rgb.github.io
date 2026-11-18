/**
 * Sharked Up OS — Route A client adapter (Fin, 2026-11-18).
 *
 * The static GitHub pages (portal, room, forms) load THIS file and call the
 * portal engine through PortalAPI.call(fnName, ...args) -> Promise<result>.
 * It replaces google.script.run now that Google no longer serves the pages.
 *
 * Transport: JSONP over GET (Apps Script sends no CORS headers). The endpoint
 * address lives ONLY in this file — no page Grok writes ever contains it.
 * Fin sets ENDPOINT once, at wiring time, to the deployed web-app URL.
 *
 * Function names are the engine's real ones (Code.gs):
 *   sendMyCode(email)            -> { ok } | { ok:false, error }
 *   confirmCode(email, code)     -> { ok, pass, url, tier, seat, name, username }
 *   getLeaderboard(pass)         -> { ok, board }
 *   getResources(pass)           -> { ok, resources }
 *   getDrops(pass)               -> { ok, drops, seat }
 *   getBoard(pass)               -> { ok, posts }
 *   postToBoard(pass, text)      -> { ok }
 *   getRoomData(pass)            -> { ok, featured, videos, drops, posts, board, headlines, ... }
 *   submitAssessment(payload)    -> { ok }   (native form pages only)
 */
(function () {
  "use strict";
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbyAiXXXiwR7FU2dlsUi0D_e3-vZJEzvI5rw-MXTEO0ls8LkM_TKJmv_hDoYhywEmtjDRA/exec"; // Route A engine (same portal deployment), wired 2026-11-18.
  var seq = 0;

  function call(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return new Promise(function (resolve, reject) {
      if (!ENDPOINT) { reject(new Error("Portal endpoint not wired yet.")); return; }
      var cbName = "__ssp_cb_" + (++seq) + "_" + Date.now();
      var timer = setTimeout(function () { cleanup(); reject(new Error("The portal took too long to answer. Try again.")); }, 30000);
      function cleanup() {
        clearTimeout(timer);
        try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }
      window[cbName] = function (payload) { cleanup(); resolve(payload); };
      var script = document.createElement("script");
      var url = ENDPOINT + (ENDPOINT.indexOf("?") === -1 ? "?" : "&") +
        "api=1&fn=" + encodeURIComponent(fn) +
        "&args=" + encodeURIComponent(JSON.stringify(args)) +
        "&callback=" + cbName;
      script.src = url;
      script.onerror = function () { cleanup(); reject(new Error("Could not reach the portal. Check your connection and try again.")); };
      document.head.appendChild(script);
    });
  }

  window.PortalAPI = { call: call };
})();
