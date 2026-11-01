/* ============================================================
   quiz.js — 自测八题
   ============================================================ */
(function () {
  'use strict';

  var box = document.getElementById('quiz');
  if (!box) return;

  var QUESTIONS = [
    {
      q: '一个模型在训练数据上准确率 99%，换一批从没见过的新数据，准确率只有 62%。最可能的原因是什么？',
      opts: ['欠拟合，模型太简单', '过拟合，模型记住了训练数据里的噪声', '学习率设得太小', '训练数据太少了'],
      a: 1,
      exp: '训练集和测试集的表现差距这么大，是<strong>过拟合</strong>的典型信号。模型把训练数据里的偶然噪声也当成规律记住了，所以一换数据就失灵。请特别注意：<b>「训练集准确率 99%」这句话本身几乎没有信息量</b>，必须看它在没见过的新数据上的表现。'
    },
    {
      q: '「深度学习」和「机器学习」是什么关系？',
      opts: ['这两个词完全可以互换', '深度学习是机器学习的一个子集', '机器学习是深度学习的一个子集', '两者没有关系'],
      a: 1,
      exp: '包含关系是 <span class="mono">AI ⊃ 机器学习 ⊃ 深度学习</span>。所有深度学习都属于机器学习，但决策树、支持向量机、随机森林这些机器学习方法<b>并不</b>属于深度学习。所以「深度学习 vs 机器学习哪个好」是个伪问题。'
    },
    {
      q: '下面哪种学习方式，在训练时<strong>完全不需要</strong>任何人工标注的答案？',
      opts: ['监督学习', '无监督学习', '强化学习', '三种都需要'],
      a: 1,
      exp: '无监督学习只有输入数据、没有标签，它靠数据自身的结构（距离、密度、方差）来分组或压缩，比如 K-means 把用户分成几群。<br><br>强化学习同样没有「标准答案」，但它有环境给的<b>奖励信号</b>——只是这个信号延迟且稀疏，所以严格来说不算「完全没有反馈」。'
    },
    {
      q: '把梯度下降的<strong>学习率</strong>设得过大，最可能发生什么？',
      opts: ['训练变慢，但结果更准', '在谷底两侧来回弹跳，loss 剧烈震荡，甚至发散成 NaN', '模型的参数量会变小', '训练数据会被删掉一部分'],
      a: 1,
      exp: '学习率决定每一步迈多远。步子太大，一步就从谷底跨到对面的坡上，下一步再跨回来——loss 上下震荡；再大一点就会越弹越高，直到数值溢出。<br><br>反过来，学习率太小则几百步还停在半山腰。<b>这是训练里最容易翻车的超参数</b>，实验 06 里把滑块拉到最右就能亲眼看到。'
    },
    {
      q: '你担心模型对某个群体有偏见，于是把「性别」这一列从训练数据里删掉了。偏见就没了吗？',
      opts: ['是的，删掉这一列就公平了', '不一定，邮编、消费习惯、用词习惯都可能成为代理变量', '模型会自动纠正这种偏见', '偏见只存在于图像模型里'],
      a: 1,
      exp: '删掉一列不等于删掉信息。模型会从其他特征里间接还原出被删掉的那一列，这叫<strong>代理变量</strong>（proxy variable）。<br><br>正确做法是：检查训练数据的分布、按群体分别评估指标、对敏感属性加公平性约束。单纯删字段是最常见也最无效的「伪解决方案」。'
    },
    {
      q: '训练过程中由人设定、模型自己不会学出来的量，叫什么？',
      opts: ['参数', '权重', '超参数', '梯度'],
      a: 2,
      exp: '<strong>参数</strong>（权重、偏置）是训练过程优化出来的；<strong>超参数</strong>（学习率、层数、批量大小、正则化强度）是人设定的，模型不会自己调。<br><br>一个实用的分辨方法：训练完被冻结存进文件里的，多半是参数；你在配置文件里手动写死的，多半是超参数。'
    },
    {
      q: '大语言模型为什么会「一本正经地胡说八道」？',
      opts: ['它故意欺骗用户', '它的训练目标是生成最像人话的下一个词，而不是保证事实正确', '它的参数太少', '网络延迟导致输出错乱'],
      a: 1,
      exp: '它的损失函数只衡量一件事：<b>预测的下一个 token 和真实的下一个 token 有多接近</b>。<br><br>所以「流畅」才是它被优化的目标，「真实」不是。当它进入训练数据稀少的领域，它仍然会用最合理的方式把句子接下去——这就是<strong>幻觉</strong>。它不是坏，它是被设计成「无论如何都要接下去说」。'
    },
    {
      q: '强化学习和监督学习最本质的区别是什么？',
      opts: ['强化学习完全不需要数据', '强化学习没有标准答案，只有环境事后给的奖励分数', '强化学习只能用来玩游戏', '强化学习一定比监督学习准确'],
      a: 1,
      exp: '监督学习的每条样本都直接告诉你「正确答案是什么」；强化学习只在你走完一段路之后告诉你「总分多少」，<b>中间哪一步好、哪一步坏，要自己反推</b>。<br><br>这正是实验 05 里 Q 表要从终点一格一格往起点「渗」的原因——奖励是延迟的，价值必须靠时间差往回传播。'
    }
  ];

  var state = [];
  var total = QUESTIONS.length;
  var scoreEl = document.getElementById('quizScore');
  var msgEl = document.getElementById('quizMsg');
  var resetBtn = document.getElementById('quizReset');
  var footSmall = document.querySelector('.score-big small');

  if (footSmall) footSmall.textContent = ' / ' + total;

  function build() {
    box.innerHTML = '';
    state = QUESTIONS.map(function () { return -1; });

    QUESTIONS.forEach(function (item, qi) {
      var q = document.createElement('div');
      q.className = 'q';

      var num = document.createElement('div');
      num.className = 'q-num';
      num.textContent = '第 ' + (qi + 1) + ' / ' + total + ' 题';
      q.appendChild(num);

      var txt = document.createElement('div');
      txt.className = 'q-text';
      txt.innerHTML = item.q;
      q.appendChild(txt);

      var opts = document.createElement('div');
      opts.className = 'opts';

      item.opts.forEach(function (o, oi) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'opt';
        b.innerHTML = '<span class="key">' + 'ABCD'[oi] + '</span><span>' + o + '</span>';
        b.addEventListener('click', function () { pick(qi, oi, q, opts); });
        opts.appendChild(b);
      });

      q.appendChild(opts);

      var ex = document.createElement('div');
      ex.className = 'explain';
      ex.innerHTML = '<b>' + (item.a === state[qi] ? '' : '正确答案是 ' + 'ABCD'[item.a] + '。') + '</b>' + item.exp;
      q.appendChild(ex);

      box.appendChild(q);
    });

    updateScore();
  }

  function pick(qi, oi, qEl, optsEl) {
    if (state[qi] !== -1) return;
    state[qi] = oi;

    var item = QUESTIONS[qi];
    var btns = optsEl.querySelectorAll('.opt');
    btns.forEach(function (b, i) {
      b.disabled = true;
      if (i === item.a) b.classList.add('correct');
      if (i === oi && oi !== item.a) b.classList.add('wrong');
    });

    var ex = qEl.querySelector('.explain');
    ex.innerHTML = (oi === item.a
      ? '<b>答对了。</b>'
      : '<b>正确答案是 ' + 'ABCD'[item.a] + '。</b>') + item.exp;
    ex.classList.add('show');

    updateScore();
  }

  function updateScore() {
    var done = 0, right = 0;
    state.forEach(function (v, i) {
      if (v === -1) return;
      done++;
      if (v === QUESTIONS[i].a) right++;
    });
    scoreEl.textContent = right;

    var msg = '还没有开始答题。';
    if (done === 0) {
      msg = '还没有开始答题。';
    } else if (done < total) {
      msg = '已答 ' + done + ' / ' + total + ' 题，答对 ' + right + ' 题。继续。';
    } else if (right === total) {
      msg = '全对。你已经具备了看穿 AI 营销话术的基本功——至少知道该追问「测试集准确率是多少」。';
    } else if (right >= total - 2) {
      msg = '答对 ' + right + ' / ' + total + '。核心概念已经扎实了，错的那题回去看一眼对应模块即可。';
    } else if (right >= total / 2) {
      msg = '答对 ' + right + ' / ' + total + '。及格线之上。建议重点重读模块 4（过拟合、学习率）和模块 6（置信度与幻觉）。';
    } else {
      msg = '答对 ' + right + ' / ' + total + '。别急，回到模块 2 从「写程序的方向反过来了」开始，那一段是全部内容的地基。';
    }
    msgEl.textContent = msg;
  }

  resetBtn.addEventListener('click', function () {
    build();
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  build();
})();
