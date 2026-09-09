/*  ============================================================
    psk-client.js — shared JSONP client for exam.html & scanner.html
    ------------------------------------------------------------
    Where does the backend URL come from? (first match wins)
      1. ?backend=<url>  in the page URL
      2. localStorage 'psk_backend'  (set once, remembered)
      3. the BACKEND_URL constant below
    If none is set, PSK runs in DEMO mode: every call rejects, and
    each page falls back to its built-in demo data so you can open
    the files directly (double-click) and click through everything.

    To go live: paste your Apps Script /exec URL into BACKEND_URL
    below, OR open the page once with ?backend=<your /exec url> and
    it will be remembered in this browser.
    ============================================================ */
(function () {
  var BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzbilP2l7myjO5M8TuKyEwiuRA4oeqNXgYCW5eOYgJj_GlzgNqButOLsKZN4IVKuw5L/exec'; // your Apps Script Web-app /exec URL

  var q = new URLSearchParams(location.search);
  if (q.get('backend')) { BACKEND_URL = q.get('backend'); try { localStorage.setItem('psk_backend', BACKEND_URL); } catch (e) {} }
  if (!BACKEND_URL) { try { BACKEND_URL = localStorage.getItem('psk_backend') || ''; } catch (e) {} }

  // admin write token (config_set). Optional for reads.
  var TOKEN = q.get('token') || (function () { try { return localStorage.getItem('psk_token') || ''; } catch (e) { return ''; } })();

  var counter = 0;
  function PSK(action, params) {
    params = params || {};
    if (!BACKEND_URL) return Promise.reject(new Error('demo'));
    return new Promise(function (resolve, reject) {
      var cb = 'psk_cb_' + (Date.now()) + '_' + (counter++);
      var timer = setTimeout(function () { cleanup(); reject(new Error('timeout')); }, 15000);
      window[cb] = function (data) { clearTimeout(timer); cleanup(); resolve(data); };
      function cleanup() { try { delete window[cb]; } catch (e) { window[cb] = undefined; } if (s && s.parentNode) s.parentNode.removeChild(s); }
      var url = BACKEND_URL + (BACKEND_URL.indexOf('?') < 0 ? '?' : '&') + 'action=' + encodeURIComponent(action) + '&callback=' + cb;
      if (TOKEN) params.token = TOKEN;
      Object.keys(params).forEach(function (k) { url += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); });
      var s = document.createElement('script');
      s.src = url;
      s.onerror = function () { clearTimeout(timer); cleanup(); reject(new Error('network')); };
      document.head.appendChild(s);
    });
  }
  PSK.demo = !BACKEND_URL;
  PSK.backend = BACKEND_URL;
  window.PSK = PSK;
})();
