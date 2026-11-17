// Mobile menu toggle for M.I.N.E. site
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  function setOpen(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-open', open);
  }
  toggle.addEventListener('click', function () {
    setOpen(!nav.classList.contains('open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      setOpen(false);
    });
  });
  document.addEventListener('click', function (e) {
    if (!nav.classList.contains('open')) return;
    if (nav.contains(e.target) || toggle.contains(e.target)) return;
    setOpen(false);
  });
})();

// Home intro: tap-to-play hymn (loaded only after the first tap)
(function () {
  var btn = document.getElementById('intro-music-btn');
  if (!btn) return;
  var label = btn.querySelector('.intro-music-label');
  var audio = null;
  var loading = false;

  function setPlaying(on) {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('is-playing', on);
    if (label) label.textContent = on ? 'Pause music' : 'Play music';
    btn.setAttribute(
      'aria-label',
      on ? 'Pause music: Onward, Christian Soldiers' : 'Play music: Onward, Christian Soldiers'
    );
  }

  function loadAndPlay() {
    if (loading) return;
    loading = true;
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    var s = document.createElement('script');
    s.src = 'js/hymn-audio.js';
    s.onload = function () {
      var src = window.MINE_HYMN_AUDIO;
      if (!src) {
        loading = false;
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        return;
      }
      audio = new Audio(src);
      audio.id = 'intro-hymn';
      audio.loop = true;
      audio.volume = 0.6;
      audio.setAttribute('hidden', '');
      document.body.appendChild(audio);
      audio.addEventListener('play', function () { setPlaying(true); });
      audio.addEventListener('pause', function () { setPlaying(false); });
      var playPromise = audio.play();
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () { setPlaying(false); });
      }
    };
    s.onerror = function () {
      loading = false;
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      btn.setAttribute('aria-label', 'Music could not be loaded');
    };
    document.head.appendChild(s);
  }

  btn.addEventListener('click', function () {
    if (!audio) {
      loadAndPlay();
      return;
    }
    if (audio.paused) audio.play();
    else audio.pause();
  });
})();

// Prayer request form: opens the visitor's email app with the request filled in
(function () {
  var form = document.getElementById('prayer-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.querySelector('#pr-name').value.trim();
    var req = form.querySelector('#pr-request').value.trim();
    if (!req) { form.querySelector('#pr-request').focus(); return; }
    var body = (name ? 'First name: ' + name + '\r\n\r\n' : '') + 'Please pray for:\r\n' + req + '\r\n';
    window.location.href = 'mailto:contact@minee.us?subject=' + encodeURIComponent('Prayer Request' + (name ? ' from ' + name : '')) +
      '&body=' + encodeURIComponent(body);
  });
})();

// Watch Live: load the YouTube player only when the visitor taps it
(function () {
  var btn = document.getElementById('live-facade');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = btn.getAttribute('data-src');
    f.title = 'M.I.N.E. Live Stream';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.allowFullscreen = true;
    btn.parentNode.replaceChild(f, btn);
    f.focus();
  });
})();


// Gentle scroll-reveal; skipped when the visitor prefers reduced motion
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();
