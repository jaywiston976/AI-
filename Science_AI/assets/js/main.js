/* ============================================================
   main.js — 主题 / 导航 / 阅读进度 / Canvas 工具
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- 全局工具 ---------------- */
  var U = {};

  U.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  U.lerp = function (a, b, t) { return a + (b - a) * t; };

  var root = document.documentElement;
  var varCache = {};

  U.css = function (name) {
    if (varCache[name]) return varCache[name];
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    varCache[name] = v;
    return v;
  };
  U.clearVarCache = function () { varCache = {}; };

  U.hexToRgb = function (hex) {
    var h = (hex || '').trim();
    if (h[0] === '#') h = h.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return { r: 124, g: 140, b: 255 };
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };
  U.alpha = function (hex, a) {
    var c = U.hexToRgb(hex);
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  };

  /**
   * 把 canvas 按 CSS 像素尺寸建好（含 DPR 适配），返回 2D 上下文与逻辑宽高
   * height="auto" 时高度跟随宽度（data-ratio 控制比例），用于方形画布
   */
  U.fit = function (canvas) {
    if (!canvas.dataset.h) {
      var rawH = canvas.getAttribute('height');
      var numH = parseInt(rawH, 10);
      canvas.dataset.h = (rawH === 'auto' || !numH) ? 'auto' : String(numH);
    }
    var cssW = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
    var cssH;
    if (canvas.dataset.h === 'auto') {
      var ratio = parseFloat(canvas.dataset.ratio) || 0.72;
      cssH = Math.round(U.clamp(cssW * ratio, 250, 480));
    } else {
      cssH = parseInt(canvas.dataset.h, 10);
    }
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.height = cssH + 'px';
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: cssW, h: cssH };
  };

  /** 观察尺寸变化，触发重绘 */
  U.onResize = function (el, fn) {
    if (!window.ResizeObserver) { window.addEventListener('resize', fn); return; }
    var last = 0;
    var ro = new ResizeObserver(function () {
      var w = el.clientWidth;
      if (Math.abs(w - last) < 2) return;
      last = w;
      fn();
    });
    ro.observe(el);
  };

  /** 简易 DOM 助手 */
  U.$ = function (s, r) { return (r || document).querySelector(s); };
  U.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  window.U = U;

  /* ---------------- 主题 ---------------- */
  var THEME_KEY = 'ai101-theme';

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    var icon = document.getElementById('themeIcon');
    if (icon) icon.firstElementChild.setAttribute('href', t === 'dark' ? '#i-moon' : '#i-sun');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#080b12' : '#f5f8fd');
    U.clearVarCache();
  }

  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
  if (!saved) {
    saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  applyTheme(saved);

  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      document.dispatchEvent(new CustomEvent('themechange'));
    });
  }

  /* ---------------- 移动端抽屉 ---------------- */
  var sidebar = document.getElementById('sidebar');
  var scrim = document.getElementById('scrim');
  var navToggle = document.getElementById('navToggle');

  function closeNav() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    if (scrim) scrim.classList.remove('on');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = sidebar.classList.toggle('open');
      if (scrim) scrim.classList.toggle('on', open);
    });
  }
  if (scrim) scrim.addEventListener('click', closeNav);
  if (sidebar) {
    sidebar.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ---------------- 阅读进度 ---------------- */
  var chapters = U.$$('.chapter');
  var navLinks = {};
  U.$$('#navList a').forEach(function (a) { navLinks[a.dataset.nav] = a; });

  var DONE_KEY = 'ai101-done';
  var done = {};
  try {
    var raw = localStorage.getItem(DONE_KEY);
    if (raw) done = JSON.parse(raw) || {};
  } catch (e) { done = {}; }

  function paintDone() {
    var n = 0, keys = Object.keys(done);
    chapters.forEach(function (ch) {
      var id = ch.id;
      var link = navLinks[id];
      if (!link) return;
      if (done[id]) { link.classList.add('done'); n++; }
      else link.classList.remove('done');
    });
    var pct = chapters.length ? Math.round((n / chapters.length) * 100) : 0;
    var sp = document.getElementById('sidePct');
    var sb = document.getElementById('sideBar');
    if (sp) sp.textContent = pct;
    if (sb) sb.style.width = pct + '%';
  }

  function markDone(id) {
    if (done[id]) return;
    done[id] = 1;
    try { localStorage.setItem(DONE_KEY, JSON.stringify(done)); } catch (e) {}
    paintDone();
  }

  var topBar = document.getElementById('topProgress');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var sy = window.scrollY || document.documentElement.scrollTop;
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var p = docH > 0 ? U.clamp(sy / docH, 0, 1) : 0;
      if (topBar) topBar.style.width = (p * 100).toFixed(2) + '%';

      // 章节完成判定：章节底部滚过视口 55% 处
      var line = sy + window.innerHeight * 0.55;
      var activeId = null;
      chapters.forEach(function (ch) {
        var bottom = ch.offsetTop + ch.offsetHeight;
        if (bottom < line) markDone(ch.id);
        if (ch.offsetTop - 90 <= sy) activeId = ch.id;
      });
      Object.keys(navLinks).forEach(function (k) {
        navLinks[k].classList.toggle('active', k === activeId);
      });
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  paintDone();
  onScroll();

  /* ---------------- 揭示动画 ---------------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    U.$$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    U.$$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }
})();
