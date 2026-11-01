/* ============================================================
   demos.js — 9 个交互实验
   全部算法在浏览器本地真实运行，无网络请求
   ============================================================ */
(function () {
  'use strict';

  var U = window.U;
  if (!U) return;

  function boot(id, init) {
    var el = document.getElementById(id);
    if (!el) return;
    try { init(el); } catch (e) { console.error('[' + id + ']', e); }
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function fmt(v, d) { return (isFinite(v) ? v : 0).toFixed(d); }

  var C = function (n) { return U.css(n); };

  /* ==========================================================
     实验 01 · 三层套娃
     ========================================================== */
  boot('d-nested', function (el) {
    var DATA = {
      ai: {
        title: '人工智能 · 最外层',
        body: '目标：让机器完成通常需要人类智能才能完成的任务。这是一个<strong>愿望</strong>，不是一个技术。' +
          '这个圈里既有 1965 年的逻辑推理程序，也有 1990 年代人工编写几千条规则、专门给银行审批贷款用的「专家系统」。' +
          '它们不用数据学习，全部规则都是人写死的。'
      },
      ml: {
        title: '机器学习 · 中间层',
        body: '方法：不给规则，给数据，让程序自己把规律算出来。核心动作是<strong>优化</strong>——' +
          '定义一个「错得多离谱」的指标，然后不断调整内部参数让这个指标变小。' +
          '2000 年代之后它逐步取代专家系统，因为维护规则的成本永远追不上世界变化的速度。'
      },
      dl: {
        title: '深度学习 · 最内层',
        body: '工具：用很多层神经元堆起来的神经网络。它的爆发点通常被定在 2012 年——' +
          '一个深层网络在 ImageNet 图像识别比赛上把错误率从 26% 直接砍到 16%。' +
          '今天你听说的所有大模型（GPT、Claude、Gemini、文心、通义）都属于这一支。'
      }
    };
    var box = $('#nestInfo', el);
    function show(k) {
      var d = DATA[k];
      box.innerHTML = '<div style="font-size:14px;font-weight:620;margin-bottom:7px;color:var(--fg)">' + d.title + '</div>' +
        '<p style="font-size:13.8px;color:var(--fg-2);margin:0;line-height:1.75">' + d.body + '</p>';
      box.style.borderColor = 'var(--brand)';
    }
    $$('.nest-g', el).forEach(function (g) {
      g.addEventListener('click', function () { show(g.dataset.nest); });
      g.addEventListener('mouseenter', function () { g.style.opacity = '1'; });
      g.addEventListener('mouseleave', function () { g.style.opacity = ''; });
    });
    show('dl');
  });

  /* ==========================================================
     实验 02 · 自己写规则
     ========================================================== */
  boot('d-rules', function (el) {
    var KEYWORDS = ['中奖', '点击', '免费', '限时', '发票', '验证', '您好'];

    var MAILS = [
      { t: '恭喜您中奖！点击领取 iPhone', spam: true },
      { t: '限时免费领取会员，仅剩 3 个名额', spam: true },
      { t: '您好，点击下方链接验证您的账户', spam: true },
      { t: '发票代开，税率优惠', spam: true },
      { t: '您的快递被退回，请点击处理', spam: true },
      { t: '【重要】账户异常，请立即验证身份', spam: true },
      { t: '您好，本周组会改到周四下午三点', spam: false },
      { t: '这周的报告我放在共享盘了，有空看一下', spam: false },
      { t: '周末一起打球？场地已经订好了', spam: false },
      { t: '关于新版本的免费试用额度，我确认一下', spam: false },
      { t: '收到，我明天把发票寄给你', spam: false },
      { t: '会议纪要我整理好了，附件是修订版', spam: false }
    ];

    var chipsBox = $('#ruleChips', el);
    var mailBox = $('#ruleMail', el);
    var metBox = $('#ruleMetrics', el);
    var verdict = $('#ruleVerdict', el);
    var verdictText = $('#ruleVerdictText', el);

    var active = {};
    var prevCorrect = null;

    KEYWORDS.forEach(function (k) {
      var b = document.createElement('button');
      b.className = 'chip';
      b.type = 'button';
      b.dataset.k = k;
      b.textContent = k;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        active[k] = !active[k];
        b.setAttribute('aria-pressed', active[k] ? 'true' : 'false');
        update();
      });
      chipsBox.appendChild(b);
    });

    function hitsOf(text) {
      return KEYWORDS.filter(function (k) { return active[k] && text.indexOf(k) >= 0; });
    }

    function update() {
      var correct = 0, catchSpam = 0, falseAlarm = 0, judgeSpam = 0;
      var totalSpam = MAILS.filter(function (m) { return m.spam; }).length;
      var totalHam = MAILS.length - totalSpam;

      mailBox.innerHTML = '';
      MAILS.forEach(function (m) {
        var hits = hitsOf(m.t);
        var predictSpam = hits.length > 0;
        var ok = predictSpam === m.spam;
        if (ok) correct++;
        if (predictSpam) judgeSpam++;
        if (predictSpam && m.spam) catchSpam++;
        if (predictSpam && !m.spam) falseAlarm++;

        var html = m.t;
        hits.forEach(function (k) {
          // 只高亮第一次出现，避免嵌套替换
          html = html.replace(k, '\u0000' + k + '\u0001');
        });
        html = html.replace(/\u0000/g, '<span class="hit">').replace(/\u0001/g, '</span>');

        var row = document.createElement('div');
        row.className = 'mail' + (hits.length ? ' judged' : '') +
          (hits.length ? (predictSpam ? ' is-spam' : '') : '') +
          (ok ? '' : ' wrong');
        row.innerHTML =
          '<svg class="ico"><use href="#i-mail"/></svg>' +
          '<span class="txt">' + html + '</span>' +
          '<span class="mark">' + (predictSpam ? '判定垃圾' : '放行') + '</span>';
        if (!ok) row.title = m.spam ? '这是一封真垃圾邮件，被漏掉了' : '这是正常邮件，被误伤了';
        mailBox.appendChild(row);
      });

      var acc = correct / MAILS.length;
      metBox.innerHTML =
        '<div class="metric"><div class="k">准确率</div><div class="v ' +
        (acc >= 0.9 ? 'good' : acc >= 0.7 ? 'warn' : 'bad') + '">' + (acc * 100).toFixed(1) + '%</div></div>' +
        '<div class="metric"><div class="k">抓到的垃圾</div><div class="v">' + catchSpam + ' / ' + totalSpam + '</div></div>' +
        '<div class="metric"><div class="k">误伤正常</div><div class="v ' + (falseAlarm > 0 ? 'bad' : '') + '">' + falseAlarm + ' / ' + totalHam + '</div></div>' +
        '<div class="metric"><div class="k">规则条数</div><div class="v">' + KEYWORDS.filter(function (k) { return active[k]; }).length + '</div></div>';

      // 反馈
      var nActive = KEYWORDS.filter(function (k) { return active[k]; }).length;
      if (prevCorrect !== null && correct < prevCorrect && nActive > 1) {
        verdict.style.display = '';
        verdictText.innerHTML = '<b>注意：这条规则让结果变差了。</b>它误伤的正常邮件比抓到的垃圾邮件还多——' +
          '在现实里，误判一封老板的邮件，代价远高于漏掉一封广告。';
      } else if (acc >= 0.9 && correct < MAILS.length) {
        verdict.style.display = '';
        verdictText.innerHTML = '<b>你摸到天花板了：' + (acc * 100).toFixed(1) + '%。</b>' +
          '剩下的那封，靠再加关键词是抓不到的——要么词本身也会出现在正常邮件里，要么它干脆没有明显特征。' +
          '而真实世界里，垃圾邮件有几十万种写法。<b>这就是规则法的死路：维护成本无限增长，上限却很低。</b>';
      } else if (nActive === KEYWORDS.length) {
        verdict.style.display = '';
        verdictText.innerHTML = '<b>全选了，准确率反而掉下来了。</b>因为每个关键词在正常邮件里也会出现。' +
          '规则之间开始互相打架——这正是现实中规则系统越来越难维护的原因。';
      } else {
        verdict.style.display = 'none';
      }
      prevCorrect = correct;
    }
    update();
  });

  /* ==========================================================
     实验 03 · 画分界线（逻辑回归）
     ========================================================== */
  boot('d-boundary', function (el) {
    var canvas = $('#c-boundary', el);
    var angleEl = $('#bdAngle', el), offsetEl = $('#bdOffset', el);
    var angleOut = $('#bdAngleOut', el), offsetOut = $('#bdOffsetOut', el);
    var accEl = $('#bdAcc', el), tpEl = $('#bdTp', el), tnEl = $('#bdTn', el), stateEl = $('#bdState', el);
    var trainBtn = $('#bdTrain', el), resetBtn = $('#bdReset', el);

    var pts = [], timer = null, training = false;

    function gauss() {
      var u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function genData() {
      pts = [];
      var dirA = (Math.random() * 0.9 - 0.45); // 真实分界的角度扰动
      var nx = Math.cos(dirA), ny = Math.sin(dirA);
      var guard = 0;
      while (pts.length < 64 && guard++ < 4000) {
        var x = Math.random() * 1.76 - 0.88;
        var y = Math.random() * 1.76 - 0.88;
        var s = x * nx + y * ny - 0.05;
        if (Math.abs(s) < 0.08) continue;
        var label = s > 0 ? 1 : -1;
        // 加一点离群噪声，让"完美分界"不存在
        if (Math.random() < 0.06) label = -label;
        pts.push({ x: x + gauss() * 0.03, y: y + gauss() * 0.03, y0: label });
      }
      pts.forEach(function (p) { p.label = p.y0; });
    }

    function weights() {
      var th = (+angleEl.value) * Math.PI / 180;
      var d = (+offsetEl.value) / 70 * 0.92;
      return { w1: Math.cos(th), w2: Math.sin(th), b: -d };
    }

    function evalAcc(w1, w2, b) {
      var ok = 0, a1 = 0, a2 = 0;
      pts.forEach(function (p) {
        var pred = (p.x * w1 + p.y * w2 + b) > 0 ? 1 : -1;
        if (pred === p.label) { ok++; if (p.label === 1) a1++; else a2++; }
      });
      return { acc: ok / pts.length, a1: a1, a2: a2 };
    }

    function draw() {
      var r = U.fit(canvas), ctx = r.ctx, w = r.w, h = r.h;
      var s = Math.min(w, h) * 0.86 / 2;
      var cx = w / 2, cy = h / 2;
      var W1 = weights();
      var st = evalAcc(W1.w1, W1.w2, W1.b);

      ctx.clearRect(0, 0, w, h);

      // 网格
      ctx.strokeStyle = U.alpha(C('--line'), 0.5);
      ctx.lineWidth = 1;
      for (var i = -2; i <= 2; i++) {
        var gx = cx + i * s / 2, gy = cy + i * s / 2;
        ctx.beginPath(); ctx.moveTo(gx, cy - s); ctx.lineTo(gx, cy + s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - s, gy); ctx.lineTo(cx + s, gy); ctx.stroke();
      }

      // 分界线
      var th = Math.atan2(W1.w2, W1.w1);
      var d = -W1.b;
      var px = Math.cos(th) * d * s, py = Math.sin(th) * d * s;
      var dx = -Math.sin(th), dy = Math.cos(th);
      var L = s * 1.8;
      ctx.strokeStyle = C('--fg');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + px - dx * L, cy + py - dy * L);
      ctx.lineTo(cx + px + dx * L, cy + py + dy * L);
      ctx.stroke();

      // 点
      var cA = C('--brand'), cB = C('--amber'), cErr = C('--danger');
      pts.forEach(function (p) {
        var X = cx + p.x * s, Y = cy - p.y * s;
        var pred = (p.x * W1.w1 + p.y * W1.w2 + W1.b) > 0 ? 1 : -1;
        var wrong = pred !== p.label;
        ctx.beginPath();
        ctx.arc(X, Y, wrong ? 5.6 : 4.2, 0, Math.PI * 2);
        ctx.fillStyle = U.alpha(p.label === 1 ? cA : cB, wrong ? 0.35 : 0.95);
        ctx.fill();
        if (wrong) {
          ctx.strokeStyle = cErr; ctx.lineWidth = 2.2; ctx.stroke();
        }
      });

      // 角标（准确率已在下方指标卡显示，这里只标分错的点）
      ctx.font = '600 11px ui-monospace, monospace';
      ctx.fillStyle = U.alpha(C('--danger'), 0.9);
      ctx.textAlign = 'left';
      var nWrong = 0;
      pts.forEach(function (p) {
        var pred = (p.x * W1.w1 + p.y * W1.w2 + W1.b) > 0 ? 1 : -1;
        if (pred !== p.label) nWrong++;
      });
      if (nWrong > 0) ctx.fillText('红圈 = 分错了（' + nWrong + ' 个）', 12, 20);

      accEl.textContent = (st.acc * 100).toFixed(1) + '%';
      accEl.className = 'v ' + (st.acc > 0.93 ? 'good' : st.acc > 0.8 ? 'warn' : 'bad');
      tpEl.textContent = st.a1 + ' / ' + pts.filter(function (p) { return p.label === 1; }).length;
      tnEl.textContent = st.a2 + ' / ' + pts.filter(function (p) { return p.label === -1; }).length;
      return st;
    }

    function syncLabel() {
      angleOut.textContent = angleEl.value + '°';
      offsetOut.textContent = fmt((+offsetEl.value) / 70 * 0.92, 2);
    }

    function train() {
      if (training) return;
      training = true;
      trainBtn.disabled = true;
      stateEl.textContent = '训练中';
      stateEl.className = 'v warn';

      var w1 = Math.cos((+angleEl.value) * Math.PI / 180);
      var w2 = Math.sin((+angleEl.value) * Math.PI / 180);
      var b = -((+offsetEl.value) / 70 * 0.92);
      var lr = 0.9, n = 0, total = 260;

      clearInterval(timer);
      timer = setInterval(function () {
        for (var k = 0; k < 4; k++) {
          var g1 = 0, g2 = 0, gb = 0;
          pts.forEach(function (p) {
            var z = p.x * w1 + p.y * w2 + b;
            var pr = 1 / (1 + Math.exp(-z));
            var e = pr - (p.label === 1 ? 1 : 0);
            g1 += e * p.x; g2 += e * p.y; gb += e;
          });
          var m = pts.length;
          w1 -= lr * g1 / m; w2 -= lr * g2 / m; b -= lr * gb / m;
        }
        n += 4;

        // 把参数写回滑块
        var norm = Math.hypot(w1, w2) || 1;
        var u1 = w1 / norm, u2 = w2 / norm, ub = b / norm;
        if (u1 < 0) { u1 = -u1; u2 = -u2; ub = -ub; }
        var ang = Math.atan2(u2, u1) * 180 / Math.PI;
        var off = U.clamp(-ub / 0.92 * 70, -70, 70);
        angleEl.value = Math.round(ang);
        offsetEl.value = Math.round(off);
        syncLabel();
        draw();

        if (n >= total) {
          clearInterval(timer);
          training = false;
          trainBtn.disabled = false;
          var st = draw();
          stateEl.textContent = st.acc > 0.93 ? '已收敛' : '收敛但仍有噪声';
          stateEl.className = 'v ' + (st.acc > 0.93 ? 'good' : 'warn');
        }
      }, 55);
    }

    function reset() {
      clearInterval(timer);
      training = false;
      trainBtn.disabled = false;
      genData();
      angleEl.value = 0; offsetEl.value = 0;
      syncLabel();
      stateEl.textContent = '手动';
      stateEl.className = 'v';
      draw();
    }

    angleEl.addEventListener('input', function () { if (!training) { syncLabel(); draw(); } });
    offsetEl.addEventListener('input', function () { if (!training) { syncLabel(); draw(); } });
    trainBtn.addEventListener('click', function () { if (training) return; genDataForTrain(); train(); });
    resetBtn.addEventListener('click', reset);

    function genDataForTrain() { /* 保留当前数据集，训练才有对比意义 */ }

    U.onResize(el, draw);
    document.addEventListener('themechange', draw);
    genData(); syncLabel(); draw();
  });

  /* ==========================================================
     实验 04 · K-means 聚类
     ========================================================== */
  boot('d-kmeans', function (el) {
    var canvas = $('#c-kmeans', el);
    var kEl = $('#kmK', el), kOut = $('#kmKOut', el);
    var iterEl = $('#kmIter', el), inertiaEl = $('#kmInertia', el), stateEl = $('#kmState', el);
    var runBtn = $('#kmRun', el), resetBtn = $('#kmReset', el);

    var COLORS = ['#5c8dff', '#ffb450', '#37e0b0', '#ff7bb0', '#a78bfa'];
    var pts = [], cents = [], assign = [], iter = 0, timer = null;

    function genData() {
      pts = [];
      var centers = [
        { x: 0.24, y: 0.30 }, { x: 0.72, y: 0.34 }, { x: 0.48, y: 0.74 }
      ];
      for (var c = 0; c < 3; c++) {
        for (var i = 0; i < 22; i++) {
          var a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.11;
          pts.push({
            x: U.clamp(centers[c].x + Math.cos(a) * r, 0.04, 0.96),
            y: U.clamp(centers[c].y + Math.sin(a) * r * 1.1, 0.05, 0.95)
          });
        }
      }
      // 少量离群点
      for (var j = 0; j < 4; j++) pts.push({ x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.8 });
    }

    function draw() {
      var r = U.fit(canvas), ctx = r.ctx, w = r.w, h = r.h;
      var pad = 18;
      var W = w - pad * 2, H = h - pad * 2;
      var S = Math.min(W, H);
      var ox = (w - S) / 2, oy = (h - S) / 2;
      ctx.clearRect(0, 0, w, h);

      // 背景框
      ctx.strokeStyle = U.alpha(C('--line'), 0.85);
      ctx.lineWidth = 1;
      ctx.strokeRect(ox, oy, S, S);

      var K = +kEl.value;

      pts.forEach(function (p, i) {
        var a = assign[i];
        var col = a === undefined || a < 0 ? C('--fg-3') : COLORS[a % COLORS.length];
        ctx.beginPath();
        ctx.arc(ox + p.x * S, oy + p.y * S, 4.4, 0, Math.PI * 2);
        ctx.fillStyle = U.alpha(col, a === undefined || a < 0 ? 0.5 : 0.92);
        ctx.fill();
      });

      cents.forEach(function (c, i) {
        if (i >= K) return;
        var X = ox + c.x * S, Y = oy + c.y * S;
        var col = COLORS[i % COLORS.length];
        ctx.beginPath();
        ctx.arc(X, Y, 13, 0, Math.PI * 2);
        ctx.fillStyle = U.alpha(col, 0.16);
        ctx.fill();
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(X - 19, Y); ctx.lineTo(X + 19, Y);
        ctx.moveTo(X, Y - 19); ctx.lineTo(X, Y + 19);
        ctx.strokeStyle = U.alpha(col, 0.55);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    }

    // k-means++ 初始化：让初始质心彼此尽量分散，避免陷进很差的局部最优
    function setCentroidsRandom() {
      var K = +kEl.value;
      cents = [];
      var first = pts[Math.floor(Math.random() * pts.length)];
      cents.push({ x: first.x, y: first.y });

      for (var k = 1; k < K; k++) {
        var d2 = pts.map(function (p) {
          var best = Infinity;
          cents.forEach(function (c) {
            var dx = p.x - c.x, dy = p.y - c.y;
            var d = dx * dx + dy * dy;
            if (d < best) best = d;
          });
          return best;
        });
        var sum = d2.reduce(function (a, b) { return a + b; }, 0);
        var pick = 0;
        if (sum > 0) {
          var r = Math.random() * sum, acc = 0;
          for (var i = 0; i < d2.length; i++) {
            acc += d2[i];
            if (acc >= r) { pick = i; break; }
          }
        }
        cents.push({ x: pts[pick].x, y: pts[pick].y });
      }
    }

    function step() {
      var K = +kEl.value;
      var changed = false;
      pts.forEach(function (p, i) {
        var best = 0, bd = Infinity;
        for (var c = 0; c < K; c++) {
          var dx = p.x - cents[c].x, dy = p.y - cents[c].y;
          var d = dx * dx + dy * dy;
          if (d < bd) { bd = d; best = c; }
        }
        if (assign[i] !== best) { assign[i] = best; changed = true; }
      });

      var shift = 0;
      for (var c = 0; c < K; c++) {
        var sx = 0, sy = 0, n = 0;
        pts.forEach(function (p, i) { if (assign[i] === c) { sx += p.x; sy += p.y; n++; } });
        if (n > 0) {
          var mdx = (sx / n - cents[c].x) * 0.55;
          var mdy = (sy / n - cents[c].y) * 0.55;
          cents[c].x += mdx;
          cents[c].y += mdy;
          shift = Math.max(shift, Math.abs(mdx), Math.abs(mdy));
        }
      }

      var inertia = 0;
      pts.forEach(function (p, i) {
        var c = cents[assign[i]];
        if (c) { var dx = p.x - c.x, dy = p.y - c.y; inertia += dx * dx + dy * dy; }
      });
      iter++;
      iterEl.textContent = iter;
      inertiaEl.textContent = (inertia * 1000).toFixed(0);
      draw();

      // 只有「点不再换组」且「质心基本停止移动」才算收敛
      if ((!changed && shift < 0.004) || iter > 30) {
        clearInterval(timer);
        timer = null;
        stateEl.textContent = '已收敛';
        stateEl.className = 'v good';
        runBtn.disabled = false;
      }
    }

    function run() {
      if (timer) return;
      clearInterval(timer);
      cents = []; assign = []; iter = 0;
      pts.forEach(function (p, i) { assign[i] = -1; });
      setCentroidsRandom();
      stateEl.textContent = '迭代中';
      stateEl.className = 'v warn';
      runBtn.disabled = true;
      iterEl.textContent = '0';
      inertiaEl.textContent = '—';
      draw();
      timer = setInterval(step, 420);
    }

    function reset() {
      clearInterval(timer);
      timer = null;
      genData();
      cents = []; assign = []; iter = 0;
      pts.forEach(function (p, i) { assign[i] = -1; });
      stateEl.textContent = '待开始';
      stateEl.className = 'v';
      iterEl.textContent = '0';
      inertiaEl.textContent = '—';
      runBtn.disabled = false;
      draw();
    }

    kEl.addEventListener('input', function () {
      kOut.textContent = kEl.value;
      reset();
    });
    runBtn.addEventListener('click', run);
    resetBtn.addEventListener('click', reset);
    U.onResize(el, draw);
    document.addEventListener('themechange', draw);

    genData();
    reset();
  });

  /* ==========================================================
     实验 05 · Q-learning 走格子
     ========================================================== */
  boot('d-qlearn', function (el) {
    var canvas = $('#c-qlearn', el);
    var runBtn = $('#qRun', el), pathBtn = $('#qPath', el), resetBtn = $('#qReset', el);
    var epEl = $('#qEp', el), stepsEl = $('#qSteps', el), epsEl = $('#qEps', el);
    var speedEl = $('#qSpeed', el), speedOut = $('#qSpeedOut', el);

    var N = 5;
    var START = { r: 0, c: 0 };
    var GOAL = { r: 4, c: 4 };
    var WALLS = [{ r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 1 }];
    var DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    var Q = [], ep = 0, timer = null, pathAnim = null, pathIdx = 0, showPath = false;

    function isWall(r, c) {
      return WALLS.some(function (w) { return w.r === r && w.c === c; });
    }
    function initQ() {
      Q = [];
      for (var r = 0; r < N; r++) {
        Q.push([]);
        for (var c = 0; c < N; c++) Q[r].push([0, 0, 0, 0]);
      }
      ep = 0;
      showPath = false;
    }

    function move(r, c, a) {
      var nr = r + DIRS[a][0], nc = c + DIRS[a][1];
      if (nr < 0 || nc < 0 || nr >= N || nc >= N || isWall(nr, nc)) return { r: r, c: c, hit: true };
      return { r: nr, c: nc, hit: false };
    }

    function episode(eps) {
      var r = START.r, c = START.c;
      for (var t = 0; t < 50; t++) {
        var a;
        if (Math.random() < eps) a = Math.floor(Math.random() * 4);
        else {
          var best = 0, bv = -Infinity;
          for (var k = 0; k < 4; k++) if (Q[r][c][k] > bv) { bv = Q[r][c][k]; best = k; }
          a = best;
        }
        var ns = move(r, c, a);
        var isGoal = ns.r === GOAL.r && ns.c === GOAL.c;
        var rew = isGoal ? 10 : (ns.hit ? -0.6 : -0.06);
        var maxNext = isGoal ? 0 : Math.max.apply(null, Q[ns.r][ns.c]);
        Q[r][c][a] += 0.28 * (rew + 0.94 * maxNext - Q[r][c][a]);
        if (isGoal) break;
        r = ns.r; c = ns.c;
      }
    }

    function gridGeom(w, h) {
      var pad = 16;
      var cell = Math.min((w - pad * 2) / N, (h - pad * 2) / N);
      return { cell: cell, ox: (w - cell * N) / 2, oy: (h - cell * N) / 2 };
    }

    function bestAction(r, c) {
      var best = 0, bv = -Infinity;
      for (var k = 0; k < 4; k++) if (Q[r][c][k] > bv) { bv = Q[r][c][k]; best = k; }
      return bv > 0.02 ? best : -1;
    }

    function draw() {
      var r0 = U.fit(canvas), ctx = r0.ctx, w = r0.w, h = r0.h;
      var g = gridGeom(w, h), cell = g.cell, ox = g.ox, oy = g.oy;
      ctx.clearRect(0, 0, w, h);

      // 全局价值范围
      var mx = 0;
      for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
        var v = Math.max.apply(null, Q[r][c]);
        if (v > mx) mx = v;
      }

      for (r = 0; r < N; r++) {
        for (c = 0; c < N; c++) {
          var X = ox + c * cell, Y = oy + r * cell;
          var wall = isWall(r, c);
          var goal = (r === GOAL.r && c === GOAL.c);
          var vmax = Math.max.apply(null, Q[r][c]);

          ctx.fillStyle = wall ? U.alpha(C('--fg-3'), 0.16) : U.alpha(C('--surface'), 0.9);
          ctx.fillRect(X + 1, Y + 1, cell - 2, cell - 2);

          if (!wall && !goal && mx > 0.05) {
            var t = U.clamp(vmax / mx, 0, 1);
            if (t > 0.01) {
              ctx.fillStyle = U.alpha(C('--brand'), 0.08 + t * 0.55);
              ctx.fillRect(X + 1, Y + 1, cell - 2, cell - 2);
            }
          }
          if (goal) {
            ctx.fillStyle = U.alpha(C('--brand-2'), 0.3);
            ctx.fillRect(X + 1, Y + 1, cell - 2, cell - 2);
          }

          ctx.strokeStyle = U.alpha(C('--line'), 0.9);
          ctx.lineWidth = 1;
          ctx.strokeRect(X + 0.5, Y + 0.5, cell - 1, cell - 1);

          if (wall) {
            ctx.strokeStyle = U.alpha(C('--fg-3'), 0.5);
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(X + cell * 0.3, Y + cell * 0.3); ctx.lineTo(X + cell * 0.7, Y + cell * 0.7);
            ctx.moveTo(X + cell * 0.7, Y + cell * 0.3); ctx.lineTo(X + cell * 0.3, Y + cell * 0.7);
            ctx.stroke();
            continue;
          }

          // 价值数值
          if (mx > 0.05 && !goal && vmax > 0.02) {
            ctx.font = '500 10px ui-monospace, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255,255,255,.72)';
            ctx.fillText(vmax.toFixed(1), X + cell / 2, Y + cell - 11);
          }

          // 最佳动作箭头
          var ba = bestAction(r, c);
          if (ba >= 0) {
            var cx = X + cell / 2, cy = Y + cell / 2 - 3, len = cell * 0.19;
            var ax = DIRS[ba][1] * len, ay = DIRS[ba][0] * len;
            ctx.strokeStyle = 'rgba(255,255,255,.9)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(cx - ax * 0.7, cy - ay * 0.7);
            ctx.lineTo(cx + ax * 0.7, cy + ay * 0.7);
            ctx.stroke();
            ctx.beginPath();
            var tipx = cx + ax * 0.7, tipy = cy + ay * 0.7;
            ctx.moveTo(tipx, tipy);
            ctx.lineTo(tipx - ax * 0.45 - ay * 0.32, tipy - ay * 0.45 + ax * 0.32);
            ctx.lineTo(tipx - ax * 0.45 + ay * 0.32, tipy - ay * 0.45 - ax * 0.32);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255,255,255,.9)';
            ctx.fill();
          }

          // 起点 / 终点标记
          if (r === START.r && c === START.c) {
            ctx.beginPath(); ctx.arc(X + cell / 2, Y + cell / 2, cell * 0.11, 0, Math.PI * 2);
            ctx.fillStyle = C('--amber'); ctx.fill();
          }
          if (goal) {
            ctx.beginPath();
            var gx = X + cell / 2, gy = Y + cell / 2;
            var rr = cell * 0.2;
            ctx.moveTo(gx, gy - rr);
            ctx.lineTo(gx + rr, gy);
            ctx.lineTo(gx, gy + rr);
            ctx.lineTo(gx - rr, gy);
            ctx.closePath();
            ctx.fillStyle = C('--brand-2'); ctx.fill();
          }
        }
      }

      // 路径动画
      if (showPath) {
        var p = greedyPath();
        ctx.strokeStyle = C('--amber');
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (var i = 0; i <= Math.min(pathIdx, p.length - 1); i++) {
          var X2 = ox + p[i].c * cell + cell / 2;
          var Y2 = oy + p[i].r * cell + cell / 2;
          if (i === 0) ctx.moveTo(X2, Y2); else ctx.lineTo(X2, Y2);
        }
        ctx.stroke();
      }
    }

    function greedyPath() {
      var path = [{ r: START.r, c: START.c }];
      var r = START.r, c = START.c, guard = 0;
      while (!(r === GOAL.r && c === GOAL.c) && guard++ < 25) {
        var a = bestAction(r, c);
        if (a < 0) break;
        var ns = move(r, c, a);
        if (ns.r === r && ns.c === c) break;
        r = ns.r; c = ns.c;
        path.push({ r: r, c: c });
      }
      return path;
    }

    function finishTraining() {
      clearInterval(timer); timer = null;
      runBtn.disabled = false;
      runBtn.textContent = '继续训练';
      pathBtn.disabled = false;
      var p = greedyPath();
      var reached = p.length && p[p.length - 1].r === GOAL.r && p[p.length - 1].c === GOAL.c;
      stepsEl.textContent = reached ? (p.length - 1) + ' 步' : '未到达';
      stepsEl.className = 'v ' + (reached ? 'good' : 'bad');
    }

    function trainFrame() {
      var per = [0, 8, 16, 30][+speedEl.value] || 16;
      for (var i = 0; i < per && ep < 400; i++) {
        episode(Math.max(0.05, 1 - ep / 260));
        ep++;
      }
      epEl.textContent = ep;
      epsEl.textContent = Math.max(0.05, 1 - ep / 260).toFixed(2);
      draw();
      if (ep >= 400) finishTraining();
    }

    runBtn.addEventListener('click', function () {
      if (timer) return;
      if (ep >= 400) { initQ(); }
      runBtn.disabled = true;
      pathBtn.disabled = true;
      showPath = false;
      timer = setInterval(trainFrame, 80);
    });

    pathBtn.addEventListener('click', function () {
      showPath = true;
      pathIdx = 0;
      clearInterval(pathAnim);
      var p = greedyPath();
      pathAnim = setInterval(function () {
        pathIdx++;
        draw();
        if (pathIdx >= p.length - 1) clearInterval(pathAnim);
      }, 180);
    });

    resetBtn.addEventListener('click', function () {
      clearInterval(timer); timer = null;
      clearInterval(pathAnim);
      initQ();
      runBtn.disabled = false;
      runBtn.textContent = '开始训练';
      pathBtn.disabled = true;
      epEl.textContent = '0';
      epsEl.textContent = '1.00';
      stepsEl.textContent = '—';
      stepsEl.className = 'v';
      showPath = false;
      draw();
    });

    speedEl.addEventListener('input', function () {
      speedOut.textContent = ['慢', '中', '快'][+speedEl.value - 1];
    });

    U.onResize(el, draw);
    document.addEventListener('themechange', draw);
    initQ();
    draw();
  });

  /* ==========================================================
     实验 06 · 梯度下降
     ========================================================== */
  boot('d-gd', function (el) {
    var canvas = $('#c-gd', el);
    var lrEl = $('#gdLr', el), lrOut = $('#gdLrOut', el);
    var terrainEl = $('#gdTerrain', el);
    var stepEl = $('#gdStep', el), wEl = $('#gdW', el), lossEl = $('#gdLoss', el), stateEl = $('#gdState', el);
    var runBtn = $('#gdRun', el), resetBtn = $('#gdReset', el);

    var WMIN = -1.2, WMAX = 6.2;
    var w = 0, steps = 0, timer = null, running = false, trail = [], diverged = false;

    function f(x) {
      if (terrainEl.value === 'bowl') return Math.pow(x - 2, 2) + 1;
      return 0.36 * Math.pow(x - 2, 2) + 1.15 * Math.sin(1.9 * x) + 2.3;
    }
    function df(x) {
      if (terrainEl.value === 'bowl') return 2 * (x - 2);
      return 0.72 * (x - 2) + 2.185 * Math.cos(1.9 * x);
    }
    function lr() {
      return Math.pow(10, (+lrEl.value) / 100);
    }

    function draw() {
      var r = U.fit(canvas), ctx = r.ctx, wd = r.w, hh = r.h;
      var padL = 46, padR = 18, padT = 16, padB = 30;
      var iw = wd - padL - padR, ih = hh - padT - padB;

      // 求值域
      var lo = Infinity, hi = -Infinity;
      for (var i = 0; i <= 200; i++) {
        var x = WMIN + (WMAX - WMIN) * i / 200;
        var y = f(x);
        if (y < lo) lo = y;
        if (y > hi) hi = y;
      }
      var yMin = lo - 0.6, yMax = hi + 0.8;

      function X(x) { return padL + (x - WMIN) / (WMAX - WMIN) * iw; }
      function Y(y) { return padT + (1 - (y - yMin) / (yMax - yMin)) * ih; }

      ctx.clearRect(0, 0, wd, hh);

      // 网格
      ctx.strokeStyle = U.alpha(C('--line'), 0.55);
      ctx.lineWidth = 1;
      for (var gx = 0; gx <= 6; gx++) {
        var px = X(gx);
        ctx.beginPath(); ctx.moveTo(px, padT); ctx.lineTo(px, padT + ih); ctx.stroke();
      }
      for (var gy = 0; gy < 6; gy++) {
        var py = padT + ih * gy / 5;
        ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(padL + iw, py); ctx.stroke();
      }

      // 坐标轴标签
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillStyle = C('--fg-3');
      ctx.textAlign = 'center';
      ctx.fillText('参数 w', padL + iw / 2, hh - 8);
      ctx.save();
      ctx.translate(13, padT + ih / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('损失', 0, 0);
      ctx.restore();

      // 损失曲线
      ctx.beginPath();
      for (i = 0; i <= 240; i++) {
        var xx = WMIN + (WMAX - WMIN) * i / 240;
        var yy = f(xx);
        if (i === 0) ctx.moveTo(X(xx), Y(yy)); else ctx.lineTo(X(xx), Y(yy));
      }
      ctx.strokeStyle = C('--brand');
      ctx.lineWidth = 2;
      ctx.stroke();

      // 轨迹
      trail.forEach(function (t, idx) {
        var a = 0.1 + 0.55 * (idx / Math.max(1, trail.length));
        ctx.beginPath();
        ctx.arc(X(t.w), Y(t.l), 2.6, 0, Math.PI * 2);
        ctx.fillStyle = U.alpha(C('--amber'), a);
        ctx.fill();
      });

      // 小球
      var bx = X(U.clamp(w, WMIN, WMAX));
      var by = Y(f(U.clamp(w, WMIN, WMAX)));
      var glow = ctx.createRadialGradient(bx, by, 0, bx, by, 20);
      glow.addColorStop(0, U.alpha(C('--amber'), 0.55));
      glow.addColorStop(1, U.alpha(C('--amber'), 0));
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.fill();

      ctx.beginPath();
      ctx.arc(bx, by, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = diverged ? C('--danger') : C('--amber');
      ctx.fill();
      ctx.strokeStyle = C('--bg-elev');
      ctx.lineWidth = 2;
      ctx.stroke();

      // 切线（梯度方向）
      if (!diverged) {
        var sl = df(w);
        var seg = 0.9;
        ctx.beginPath();
        ctx.moveTo(X(w - seg), Y(f(w) - sl * seg));
        ctx.lineTo(X(w + seg), Y(f(w) + sl * seg));
        ctx.strokeStyle = U.alpha(C('--brand-2'), 0.45);
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 学习率标注
      ctx.textAlign = 'right';
      ctx.font = '600 11px ui-monospace, monospace';
      ctx.fillStyle = C('--fg-2');
      ctx.fillText('lr = ' + lr().toFixed(4), wd - padR, padT + 12);
    }

    function paintStats() {
      stepEl.textContent = steps;
      wEl.textContent = fmt(w, 2);
      lossEl.textContent = diverged ? '发散' : fmt(f(U.clamp(w, WMIN, WMAX)), 3);
      lossEl.className = 'v ' + (diverged ? 'bad' : '');
    }

    function tick() {
      var g = df(w);
      if (steps > 0 && Math.abs(g) < 0.01) {
        stop('已收敛');
        return;
      }
      w = w - lr() * g;
      steps++;
      if (!isFinite(w) || Math.abs(w) > 40) {
        diverged = true;
        stop('发散了');
        return;
      }
      trail.push({ w: w, l: f(w) });
      if (trail.length > 90) trail.shift();
      draw();
      paintStats();
      if (steps >= 220) stop(Math.abs(g) < 0.02 ? '已收敛' : '达到步数上限');
    }

    function stop(msg) {
      clearInterval(timer);
      timer = null;
      running = false;
      runBtn.textContent = '再次运行';
      runBtn.disabled = false;
      stateEl.textContent = msg;
      stateEl.className = 'v ' + (msg === '已收敛' ? 'good' : msg === '发散了' ? 'bad' : 'warn');
      draw();
      paintStats();
    }

    function reset() {
      clearInterval(timer);
      timer = null;
      running = false;
      w = -0.6;
      steps = 0;
      trail = [];
      diverged = false;
      runBtn.textContent = '开始';
      runBtn.disabled = false;
      stateEl.textContent = '就绪';
      stateEl.className = 'v';
      draw();
      paintStats();
    }

    runBtn.addEventListener('click', function () {
      if (running) return;
      if (steps > 0) reset();
      running = true;
      runBtn.disabled = true;
      stateEl.textContent = '下坡中';
      stateEl.className = 'v warn';
      timer = setInterval(tick, 42);
    });
    resetBtn.addEventListener('click', reset);

    lrEl.addEventListener('input', function () {
      lrOut.textContent = lr().toFixed(4);
      if (!running) draw();
    });
    terrainEl.addEventListener('change', reset);

    U.onResize(el, draw);
    document.addEventListener('themechange', draw);

    lrOut.textContent = lr().toFixed(4);
    reset();
  });

  /* ==========================================================
     实验 07 · 过拟合
     ========================================================== */
  boot('d-overfit', function (el) {
    var cMain = $('#c-overfit', el), cErr = $('#c-ofcurve', el);
    var degEl = $('#ofDeg', el), degOut = $('#ofDegOut', el);
    var trainEl = $('#ofTrain', el), testEl = $('#ofTest', el), diagEl = $('#ofDiag', el), noteEl = $('#ofNoteText', el);
    var resampleBtn = $('#ofResample', el);

    var XMIN = -1.5, XMAX = 1.5;
    var truth = function (x) { return 0.82 * Math.sin(2.15 * x) + 0.1 * Math.cos(4.6 * x); };

    var data = [], curveStats = [], bestDeg = 4;

    function genData() {
      data = [];
      var n = 13;
      for (var i = 0; i < n; i++) {
        var x = XMIN + 0.18 + (XMAX - XMIN - 0.36) * i / (n - 1);
        x += (Math.random() - 0.5) * 0.05;
        var y = truth(x) + (Math.random() - 0.5) * 0.34 + (Math.random() - 0.5) * 0.1;
        data.push({ x: x, y: y });
      }
      computeAll();
    }

    // 高斯消元解 Ax=b
    function solve(A, b, n) {
      for (var i = 0; i < n; i++) {
        var p = i;
        for (var k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[p][i])) p = k;
        var tmp = A[i]; A[i] = A[p]; A[p] = tmp;
        var tb = b[i]; b[i] = b[p]; b[p] = tb;
        if (Math.abs(A[i][i]) < 1e-12) A[i][i] = 1e-12;
        for (k = i + 1; k < n; k++) {
          var f = A[k][i] / A[i][i];
          for (var j = i; j < n; j++) A[k][j] -= f * A[i][j];
          b[k] -= f * b[i];
        }
      }
      var x = new Array(n);
      for (i = n - 1; i >= 0; i--) {
        var s = b[i];
        for (j = i + 1; j < n; j++) s -= A[i][j] * x[j];
        x[i] = s / A[i][i];
      }
      return x;
    }

    function fitPoly(deg) {
      var m = deg + 1;
      var A = [], b = [];
      for (var i = 0; i < m; i++) { A.push(new Array(m).fill(0)); b.push(0); }
      data.forEach(function (p) {
        var t = p.x / 1.5;
        var pw = [1];
        for (var k = 1; k < m; k++) pw.push(pw[k - 1] * t);
        for (i = 0; i < m; i++) {
          b[i] += pw[i] * p.y;
          for (var j = 0; j < m; j++) A[i][j] += pw[i] * pw[j];
        }
      });
      var lam = 1e-7;
      for (i = 0; i < m; i++) A[i][i] += lam;
      return solve(A, b, m);
    }

    function evalAt(coef, x) {
      var t = x / 1.5, v = 0, p = 1;
      for (var i = 0; i < coef.length; i++) { v += coef[i] * p; p *= t; }
      return v;
    }

    function mse(coef) {
      var s = 0;
      data.forEach(function (p) { var d = evalAt(coef, p.x) - p.y; s += d * d; });
      return s / data.length;
    }
    function testMse(coef) {
      var s = 0, N = 240;
      for (var i = 0; i < N; i++) {
        var x = XMIN + (XMAX - XMIN) * i / (N - 1);
        var d = evalAt(coef, x) - truth(x);
        s += d * d;
      }
      return s / N;
    }

    function computeAll() {
      curveStats = [];
      bestDeg = 1;
      for (var d = 1; d <= 12; d++) {
        var coef = fitPoly(d);
        var tr = mse(coef), te = testMse(coef);
        curveStats.push({ d: d, train: tr, test: te, coef: coef });
        if (te < curveStats[bestDeg - 1].test) bestDeg = d;
      }
    }

    function drawMain(deg) {
      var r = U.fit(cMain), ctx = r.ctx, w = r.w, h = r.h;
      var padL = 34, padR = 16, padT = 14, padB = 26;
      var iw = w - padL - padR, ih = h - padT - padB;
      var yMin = -1.5, yMax = 1.7;

      function X(x) { return padL + (x - XMIN) / (XMAX - XMIN) * iw; }
      function Y(y) { return padT + (1 - (y - yMin) / (yMax - yMin)) * ih; }

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = U.alpha(C('--line'), 0.5);
      ctx.lineWidth = 1;
      for (var g = -1.5; g <= 1.5; g += 0.5) {
        ctx.beginPath(); ctx.moveTo(X(g), padT); ctx.lineTo(X(g), padT + ih); ctx.stroke();
      }
      for (g = -1; g <= 1.5; g += 0.5) {
        ctx.beginPath(); ctx.moveTo(padL, Y(g)); ctx.lineTo(padL + iw, Y(g)); ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(padL, Y(0)); ctx.lineTo(padL + iw, Y(0));
      ctx.strokeStyle = U.alpha(C('--fg-3'), 0.7);
      ctx.stroke();

      // 真实函数
      ctx.beginPath();
      for (var i = 0; i <= 200; i++) {
        var x = XMIN + (XMAX - XMIN) * i / 200;
        if (i === 0) ctx.moveTo(X(x), Y(truth(x))); else ctx.lineTo(X(x), Y(truth(x)));
      }
      ctx.strokeStyle = U.alpha(C('--fg-3'), 0.85);
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 数据点
      data.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(X(p.x), Y(p.y), 4, 0, Math.PI * 2);
        ctx.fillStyle = C('--amber');
        ctx.fill();
        ctx.strokeStyle = C('--bg-elev');
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // 拟合曲线
      var coef = curveStats[deg - 1].coef;
      ctx.beginPath();
      var first = true;
      for (i = 0; i <= 300; i++) {
        var xx = XMIN + (XMAX - XMIN) * i / 300;
        var yy = evalAt(coef, xx);
        if (!isFinite(yy) || yy > 6 || yy < -6) { first = true; continue; }
        var px = X(xx), py = Y(yy);
        if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = C('--brand');
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // 图例
      ctx.font = '11px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = U.alpha(C('--fg-3'), 1);
      ctx.fillText('虚线 = 真实规律', padL + 4, padT + 13);
      ctx.fillStyle = C('--brand');
      ctx.fillText('实线 = 模型学到的', padL + 4, padT + 28);
    }

    function drawErr(deg) {
      var r = U.fit(cErr), ctx = r.ctx, w = r.w, h = r.h;
      var padL = 40, padR = 14, padT = 28, padB = 24;
      var iw = w - padL - padR, ih = h - padT - padB;
      ctx.clearRect(0, 0, w, h);

      // 对数纵轴
      var vals = [];
      curveStats.forEach(function (s) { vals.push(Math.log10(s.train + 1e-4)); vals.push(Math.log10(s.test + 1e-4)); });
      var lo = Math.min.apply(null, vals) - 0.3, hi = Math.max.apply(null, vals) + 0.3;

      function X(d) { return padL + (d - 1) / 11 * iw; }
      function Y(v) { return padT + (1 - (Math.log10(v + 1e-4) - lo) / (hi - lo)) * ih; }

      ctx.strokeStyle = U.alpha(C('--line'), 0.5);
      ctx.lineWidth = 1;
      for (var d = 1; d <= 12; d += 1) {
        ctx.beginPath(); ctx.moveTo(X(d), padT); ctx.lineTo(X(d), padT + ih); ctx.stroke();
      }

      // 当前阶数高亮
      ctx.fillStyle = U.alpha(C('--brand'), 0.09);
      ctx.fillRect(X(deg) - iw / 22, padT, iw / 11, ih);

      function line(key, color, dash) {
        ctx.beginPath();
        curveStats.forEach(function (s, i) {
          var px = X(s.d), py = Y(s[key]);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        if (dash) ctx.setLineDash(dash);
        ctx.stroke();
        ctx.setLineDash([]);
        curveStats.forEach(function (s) {
          ctx.beginPath();
          ctx.arc(X(s.d), Y(s[key]), 2.6, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });
      }
      line('train', C('--brand'), null);
      line('test', C('--pink'), null);

      // 轴
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillStyle = C('--fg-3');
      ctx.textAlign = 'center';
      for (d = 1; d <= 12; d += 1) {
        if (d % 2 === 1 || d === 12) ctx.fillText(String(d), X(d), h - 7);
      }

      // 最优标记
      ctx.beginPath();
      ctx.moveTo(X(bestDeg), padT);
      ctx.lineTo(X(bestDeg), padT + ih);
      ctx.strokeStyle = U.alpha(C('--brand-2'), 0.8);
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C('--brand-2');
      ctx.font = '600 10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('最优', X(bestDeg), padT - 6);
    }

    function update() {
      var deg = +degEl.value;
      degOut.textContent = deg;
      var s = curveStats[deg - 1];

      drawMain(deg);
      drawErr(deg);

      trainEl.textContent = s.train.toFixed(4);
      testEl.textContent = s.test.toFixed(4);
      trainEl.className = 'v ' + (s.train < 0.02 ? 'good' : '');
      testEl.className = 'v ' + (s.test < 0.05 ? 'good' : s.test < 0.12 ? 'warn' : 'bad');

      var diag, note;
      var minTr = Infinity, minTe = Infinity;
      curveStats.forEach(function (x) {
        if (x.train < minTr) minTr = x.train;
        if (x.test < minTe) minTe = x.test;
      });

      if (s.train > minTr * 3 && s.train > minTe * 1.15) {
        diag = '欠拟合';
        diagEl.className = 'v warn';
        note = '<b>欠拟合：模型太简单，连训练数据都没拟合好。</b>这条曲线被限制得太死，它学不到真实规律，' +
          '就像用一条直线去描述波浪。训练误差和测试误差都很高——这是「能力不足」，不是「记性太好」。';
      } else if (s.test > minTe * 1.8) {
        diag = '过拟合';
        diagEl.className = 'v bad';
        note = '<b>过拟合：模型在追逐噪声，不是在学规律。</b>看主图，曲线开始穿过每一个点、在点之间疯狂扭曲。' +
          '训练误差继续下降（甚至接近 0），但测试误差已经反弹了。换一批数据，这条曲线会变得完全不一样——' +
          '这说明它记住的是这批数据的<em>偶然性</em>，而不是<em>规律</em>。';
      } else {
        diag = '刚刚好';
        diagEl.className = 'v good';
        note = '<b>这才是你要的位置。</b>训练误差不高不低，测试误差处在最小值附近。' +
          '模型抓住了波浪的大趋势，同时对个别噪声点保持宽容。注意：这个位置只能靠<strong>验证数据</strong>找出来，' +
          '光看训练误差永远找不到——因为过拟合的时候，训练误差还在继续下降。';
      }
      diagEl.textContent = diag;
      noteEl.innerHTML = note;
    }

    degEl.addEventListener('input', update);
    resampleBtn.addEventListener('click', function () { genData(); update(); });
    U.onResize(el, update);
    document.addEventListener('themechange', update);

    genData();
    update();
  });

  /* ==========================================================
     实验 08 · 神经元
     ========================================================== */
  boot('d-neuron', function (el) {
    var canvas = $('#c-neuron', el);
    var ids = ['nX1', 'nX2', 'nX3', 'nW1', 'nW2', 'nW3', 'nB'];
    var ins = {}, outs = {};
    ids.forEach(function (id) {
      ins[id] = document.getElementById(id);
      outs[id] = document.getElementById(id + 'Out');
    });
    var actEl = $('#nAct', el);
    var zEl = $('#nZ', el), aEl = $('#nA', el), effEl = $('#nEffect', el);

    function act(z) {
      switch (actEl.value) {
        case 'relu': return Math.max(0, z);
        case 'tanh': return Math.tanh(z);
        case 'linear': return z;
        default: return 1 / (1 + Math.exp(-z));
      }
    }
    var RANGE = { relu: [0, 1], tanh: [-1, 1], linear: [-1.6, 1.6], sigmoid: [0, 1] };

    function vals() {
      return {
        x: [+ins.nX1.value, +ins.nX2.value, +ins.nX3.value],
        w: [+ins.nW1.value, +ins.nW2.value, +ins.nW3.value],
        b: +ins.nB.value
      };
    }

    function draw() {
      var r = U.fit(canvas), ctx = r.ctx, w = r.w, h = r.h;
      var v = vals();
      var z = v.x[0] * v.w[0] + v.x[1] * v.w[1] + v.x[2] * v.w[2] + v.b;
      var a = act(z);
      var netBottom = Math.min(h * 0.56, 172);

      ctx.clearRect(0, 0, w, h);

      var cPos = C('--brand'), cNeg = C('--danger'), cNeu = C('--violet');
      var inX = Math.max(46, w * 0.1);
      var neuX = w * 0.47;
      var outX = w * 0.74;
      var ys = [netBottom * 0.26, netBottom * 0.5, netBottom * 0.74];

      // 连线
      v.x.forEach(function (xv, i) {
        var ww = v.w[i];
        var alpha = 0.18 + Math.min(1, Math.abs(ww) / 2) * 0.72;
        ctx.beginPath();
        ctx.moveTo(inX + 13, ys[i]);
        ctx.bezierCurveTo(inX + 60, ys[i], neuX - 55, netBottom * 0.5, neuX - 26, netBottom * 0.5);
        ctx.strokeStyle = U.alpha(ww >= 0 ? cPos : cNeg, alpha);
        ctx.lineWidth = 0.8 + Math.min(2.6, Math.abs(ww) * 1.3);
        ctx.stroke();
      });

      // 输入节点
      v.x.forEach(function (xv, i) {
        var rad = 9 + xv * 8;
        ctx.beginPath();
        ctx.arc(inX, ys[i], rad, 0, Math.PI * 2);
        ctx.fillStyle = U.alpha(C('--brand-2'), 0.18 + xv * 0.55);
        ctx.fill();
        ctx.strokeStyle = U.alpha(C('--brand-2'), 0.75);
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.font = '600 10px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = C('--fg-2');
        ctx.fillText('x' + (i + 1), inX, ys[i] - rad - 7);
        ctx.fillStyle = C('--fg-3');
        ctx.fillText(xv.toFixed(2), inX, ys[i] + rad + 13);

        // 权重标签（放在连线中段，带底色，避免和 x 标签打架）
        ctx.font = '500 9.5px ui-monospace, monospace';
        var lbl = (v.w[i] >= 0 ? '+' : '') + v.w[i].toFixed(2);
        var lx = (inX + 13 + neuX - 26) / 2;
        var ly = (ys[i] + netBottom * 0.5) / 2 + 3;
        var tw = ctx.measureText(lbl).width;
        ctx.fillStyle = U.alpha(C('--bg-elev'), 0.94);
        ctx.fillRect(lx - tw / 2 - 4, ly - 9, tw + 8, 13);
        ctx.fillStyle = U.alpha(v.w[i] >= 0 ? cPos : cNeg, 0.98);
        ctx.textAlign = 'center';
        ctx.fillText(lbl, lx, ly);
      });

      // 神经元
      var nr = 27;
      var t = U.clamp((a - RANGE[actEl.value][0]) / (RANGE[actEl.value][1] - RANGE[actEl.value][0] || 1), 0, 1);
      var glow = ctx.createRadialGradient(neuX, netBottom * 0.5, 0, neuX, netBottom * 0.5, nr * 2.4);
      glow.addColorStop(0, U.alpha(cNeu, 0.18 + t * 0.4));
      glow.addColorStop(1, U.alpha(cNeu, 0));
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(neuX, netBottom * 0.5, nr * 2.4, 0, Math.PI * 2); ctx.fill();

      ctx.beginPath();
      ctx.arc(neuX, netBottom * 0.5, nr, 0, Math.PI * 2);
      ctx.fillStyle = U.alpha(cNeu, 0.12 + t * 0.42);
      ctx.fill();
      ctx.strokeStyle = U.alpha(cNeu, 0.9);
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '600 12px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = C('--fg');
      ctx.fillText('Σ', neuX, netBottom * 0.5);
      ctx.textBaseline = 'alphabetic';

      // 输出箭头
      ctx.beginPath();
      ctx.moveTo(neuX + nr + 4, netBottom * 0.5);
      ctx.lineTo(outX - 24, netBottom * 0.5);
      ctx.strokeStyle = U.alpha(C('--fg-3'), 0.55);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(outX - 18, netBottom * 0.5);
      ctx.lineTo(outX - 26, netBottom * 0.5 - 4);
      ctx.lineTo(outX - 26, netBottom * 0.5 + 4);
      ctx.closePath();
      ctx.fillStyle = U.alpha(C('--fg-3'), 0.55);
      ctx.fill();

      // 输出值
      ctx.textAlign = 'left';
      ctx.font = '600 20px ui-monospace, monospace';
      ctx.fillStyle = C('--brand-2');
      ctx.fillText('a = ' + a.toFixed(3), outX - 14, netBottom * 0.5 + 7);
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillStyle = C('--fg-3');
      ctx.fillText('激活后', outX - 14, netBottom * 0.5 + 24);

      // 分隔线
      var sepY = netBottom + 14;
      ctx.beginPath();
      ctx.moveTo(16, sepY); ctx.lineTo(w - 16, sepY);
      ctx.strokeStyle = U.alpha(C('--line'), 0.9);
      ctx.lineWidth = 1;
      ctx.stroke();

      /* ---- 下方：激活函数曲线 ---- */
      var px0 = 52, px1 = w - 26;
      var py0 = sepY + 26, py1 = h - 14;
      var zr = 4.2;

      function ZX(zz) { return px0 + (zz + zr) / (2 * zr) * (px1 - px0); }
      var ra = RANGE[actEl.value];
      function AY(aa) {
        var tt = (aa - ra[0]) / (ra[1] - ra[0]);
        return py1 - tt * (py1 - py0);
      }

      // 零轴
      ctx.beginPath();
      ctx.moveTo(px0, AY(0)); ctx.lineTo(px1, AY(0));
      ctx.strokeStyle = U.alpha(C('--fg-3'), 0.35);
      ctx.lineWidth = 1;
      ctx.stroke();

      // 曲线
      ctx.beginPath();
      for (var i = 0; i <= 160; i++) {
        var zz = -zr + (2 * zr) * i / 160;
        var aa = act(zz);
        var px = ZX(zz), py = AY(aa);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = U.alpha(cNeu, 0.85);
      ctx.lineWidth = 1.9;
      ctx.stroke();

      // 当前点
      var czx = ZX(U.clamp(z, -zr, zr));
      var czy = AY(U.clamp(a, ra[0], ra[1]));
      ctx.beginPath();
      ctx.moveTo(czx, py0 - 4); ctx.lineTo(czx, py1);
      ctx.strokeStyle = U.alpha(C('--amber'), 0.5);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(czx, czy, 5, 0, Math.PI * 2);
      ctx.fillStyle = C('--amber');
      ctx.fill();
      ctx.strokeStyle = C('--bg-elev');
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.font = '10px ui-monospace, monospace';
      ctx.fillStyle = C('--fg-2');
      ctx.textAlign = 'right';
      ctx.fillText('z = ' + z.toFixed(2) + ' →', px1, py0 - 8);

      // 指标
      zEl.textContent = z.toFixed(2);
      zEl.className = 'v ' + (z < 0 ? 'warn' : '');
      aEl.textContent = a.toFixed(3);
      var eff = actEl.value === 'linear'
        ? '无弯曲（等于没加）'
        : Math.abs(a) < 0.05 ? '被压到接近 0（未激活）' : '非线性变换';
      effEl.textContent = eff;
    }

    ids.forEach(function (id) {
      ins[id].addEventListener('input', function () {
        outs[id].textContent = id === 'nB' || id[1] === 'W'
          ? (+ins[id].value).toFixed(2)
          : (+ins[id].value).toFixed(2);
        draw();
      });
    });
    actEl.addEventListener('change', draw);
    U.onResize(el, draw);
    document.addEventListener('themechange', draw);
    draw();
  });

  /* ==========================================================
     实验 09 · 置信度与正确率分离
     ========================================================== */
  boot('d-confidence', function (el) {
    var canvas = $('#c-confidence', el);
    var posEl = $('#cfPos', el), posOut = $('#cfPosOut', el);
    var confEl = $('#cfConf', el), accEl = $('#cfAcc', el), verdictEl = $('#cfVerdict', el);

    function conf(x) { return 0.94 - 0.09 * x * x * x; }
    function acc(x) { return 0.94 * Math.exp(-4.2 * x * x) + 0.03; }

    function draw() {
      var r = U.fit(canvas), ctx = r.ctx, w = r.w, h = r.h;
      var padL = 42, padR = 16, padT = 22, padB = 34;
      var iw = w - padL - padR, ih = h - padT - padB;
      var x = (+posEl.value) / 100;

      function X(v) { return padL + v * iw; }
      function Y(v) { return padT + (1 - v) * ih; }

      ctx.clearRect(0, 0, w, h);

      // 三段分区
      var zones = [
        { a: 0, b: 0.32, c: '--brand-2', label: '训练分布内' },
        { a: 0.32, b: 0.6, c: '--amber', label: '边缘' },
        { a: 0.6, b: 1, c: '--danger', label: '分布外' }
      ];
      zones.forEach(function (z) {
        ctx.fillStyle = U.alpha(C(z.c), 0.055);
        ctx.fillRect(X(z.a), padT, X(z.b) - X(z.a), ih);
        ctx.font = '600 10px ui-monospace, monospace';
        ctx.fillStyle = U.alpha(C(z.c), 0.9);
        ctx.textAlign = 'center';
        ctx.fillText(z.label, (X(z.a) + X(z.b)) / 2, padT + 13);
      });

      // 网格
      ctx.strokeStyle = U.alpha(C('--line'), 0.45);
      ctx.lineWidth = 1;
      for (var g = 0; g <= 1.001; g += 0.25) {
        ctx.beginPath(); ctx.moveTo(padL, Y(g)); ctx.lineTo(padL + iw, Y(g)); ctx.stroke();
      }

      // 曲线
      function curve(fn, color) {
        ctx.beginPath();
        for (var i = 0; i <= 160; i++) {
          var v = i / 160;
          var px = X(v), py = Y(fn(v));
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.3;
        ctx.stroke();
      }
      curve(conf, C('--amber'));
      curve(acc, C('--brand-2'));

      // 当前位置
      ctx.beginPath();
      ctx.moveTo(X(x), padT); ctx.lineTo(X(x), padT + ih);
      ctx.strokeStyle = U.alpha(C('--fg'), 0.35);
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      [[conf, '--amber'], [acc, '--brand-2']].forEach(function (p) {
        ctx.beginPath();
        ctx.arc(X(x), Y(p[0](x)), 5.5, 0, Math.PI * 2);
        ctx.fillStyle = C(p[1]);
        ctx.fill();
        ctx.strokeStyle = C('--bg-elev');
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // 轴标签
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillStyle = C('--fg-3');
      ctx.textAlign = 'right';
      for (g = 0; g <= 1.001; g += 0.25) {
        ctx.fillText(Math.round(g * 100) + '%', padL - 8, Y(g) + 3);
      }
      ctx.textAlign = 'center';
      ctx.fillText('输入离训练数据越来越远 →', padL + iw / 2, h - 10);

      // 图例（放左下空白区，避开曲线和分区标签）
      ctx.textAlign = 'left';
      ctx.font = '11px ui-monospace, monospace';
      ctx.fillStyle = C('--amber');
      ctx.fillText('— 模型置信度', padL + 10, padT + ih - 36);
      ctx.fillStyle = C('--brand-2');
      ctx.fillText('— 实际正确率', padL + 10, padT + ih - 20);

      // 指标
      var c = conf(x), a = acc(x);
      confEl.textContent = (c * 100).toFixed(0) + '%';
      accEl.textContent = (a * 100).toFixed(0) + '%';
      accEl.className = 'v ' + (a > 0.8 ? 'good' : a > 0.5 ? 'warn' : 'bad');

      var gap = c - a;
      if (x < 0.32) {
        verdictEl.textContent = '可信';
        verdictEl.className = 'v good';
      } else if (x < 0.6) {
        verdictEl.textContent = '开始失真';
        verdictEl.className = 'v warn';
      } else {
        verdictEl.textContent = '自信地胡说';
        verdictEl.className = 'v bad';
      }

      posOut.textContent = x.toFixed(2);
      return { c: c, a: a, gap: gap };
    }

    posEl.addEventListener('input', draw);
    U.onResize(el, draw);
    document.addEventListener('themechange', draw);
    draw();
  });

})();
