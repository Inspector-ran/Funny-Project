(() => {
  'use strict';
  const content = document.getElementById('content');
  const toast = document.getElementById('toast');
  const tabs = [...document.querySelectorAll('.tab-button')];
  const shelfKey = 'xiaoshili.favorites.v1';
  const scheduleKey = 'xiaoshili.schedule.v1';
  const millisecondsPerDay = 86400000;
  const firstDay = '2020-01-01';
  const epoch = dayNumber(firstDay);
  const beijing = new Intl.DateTimeFormat('zh-CN', {timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'});
  const writtenDate = new Intl.DateTimeFormat('zh-CN', {timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'});
  const icon = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16l-6-4-6 4z"/></svg>';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const corpus = new Map((Array.isArray(window.POEMS) ? window.POEMS : []).filter(poem => poem && typeof poem.id === 'string' && poem.title && poem.author && ['唐诗', '宋词'].includes(poem.kind) && Array.isArray(poem.lines) && poem.lines.length).map(poem => [poem.id, poem]));
  const poems = [...corpus.values()];
  let favoriteIds = readFavorites();
  let today = dayInBeijing();
  let schedule = openSchedule(today);
  let archiveDate = today;
  let currentView = 'today';
  let favoriteDetail = null;
  let toastTimer;

  function dayInBeijing() {
    const parts = Object.fromEntries(beijing.formatToParts(new Date()).map(part => [part.type,part.value]));
    return [parts.year, parts.month, parts.day].join('-');
  }
  function dayNumber(date) { return Date.parse(date + 'T00:00:00Z') / millisecondsPerDay; }
  function plusDays(date, amount) { return new Date((dayNumber(date) + amount) * millisecondsPerDay).toISOString().slice(0,10); }
  function openSchedule(date, previous) {
    let saved = previous;
    try { if (!saved) saved = JSON.parse(localStorage.getItem(scheduleKey)); } catch {}
    const next = window.PoetrySchedule?.create(poems, dayNumber(date), saved);
    if (next?.state && date >= firstDay) {
      try { localStorage.setItem(scheduleKey, JSON.stringify(next.state)); } catch {}
    }
    return next;
  }
  function poemFor(date) {
    return corpus.get(schedule?.idFor(dayNumber(date)));
  }
  function scheduleLabel(date) {
    const progress = schedule?.progress(dayNumber(date));
    return progress ? '本轮第 ' + progress.index + ' 首 / 共 ' + progress.total + ' 首' : '原版诗历';
  }
  function dateValid(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= firstDay && date <= today &&
      Number.isFinite(dayNumber(date)) && plusDays(date, 0) === date;
  }
  function formatDate(date) { return writtenDate.format(new Date(dayNumber(date) * millisecondsPerDay)); }
  function readFavorites() {
    try {
      const saved = JSON.parse(localStorage.getItem(shelfKey) || '[]');
      return Array.isArray(saved) ? [...new Set(saved.filter(id => corpus.has(id)))] : [];
    } catch { return []; }
  }
  function message(label) {
    toast.textContent = label;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.textContent = ''; },2200);
  }
  function toggleFavorite(id, clicked) {
    if (!corpus.has(id)) return;
    const existing = favoriteIds.includes(id);
    favoriteIds = existing ? favoriteIds.filter(candidate => candidate !== id) : [id, ...favoriteIds];
    try {
      localStorage.setItem(shelfKey, JSON.stringify(favoriteIds));
      message(existing ? '已取消收藏' : '已收入收藏');
    } catch { message('本机存储不可用，仅在本次打开期间保留'); }
    clicked.setAttribute('aria-pressed', String(!existing));
    clicked.querySelector('span').textContent = existing ? '收藏' : '已收藏';
    clicked.closest('.paper-footer').querySelector('.collection-status').textContent = existing ? '随心收藏' : '已收入收藏';
  }
  function sourceLink(value) {
    if (!value) return '';
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
    } catch { return ''; }
  }
  function poemCard(poem) {
    if (!poem) return '<div class="empty"><strong>这首诗的文本暂不可读</strong><p>试试选择另一日。</p></div>';
    const isFavorite = favoriteIds.includes(poem.id);
    const source = sourceLink(poem.source);
    const long = poem.lines.some(line => [...line].length > 30);
    return '<article class="paper">' +
      '<div class="paper-tools"><span class="kind" data-kind="' + escape(poem.kind) + '">' + escape(poem.kind) + '</span><span>原文</span></div>' +
      '<header class="paper-title"><h2 id="poem-title">' + escape(poem.title) + '</h2><p>' + escape(poem.author) + '</p></header>' +
      '<div class="poem-lines' + (long ? ' is-long' : '') + '" id="poem-lines" lang="zh-CN">' + poem.lines.map(line => '<p>' + escape(line) + '</p>').join('') + '</div>' +
      (poem.note ? '<aside class="reading-note"><h3>读诗一笔</h3><p>' + escape(poem.note) + '</p></aside>' : '') +
      '<footer class="paper-footer"><button class="action" type="button" data-action="favorite" data-id="' + escape(poem.id) + '" aria-pressed="' + isFavorite + '">' + icon + '<span>' + (isFavorite ? '已收藏' : '收藏') + '</span></button>' +
      '<span class="collection-status" hidden>' + (isFavorite ? '已收入收藏' : '随心收藏') + '</span>' +
      (source ? '<a href="' + escape(source) + '">文本来源</a>' : '') + '</footer></article>';
  }
  function landscape() {
    return '<section class="landscape" aria-labelledby="view-title">' +
      '<svg aria-hidden="true" viewBox="0 0 700 175" preserveAspectRatio="xMaxYMid slice"><rect width="700" height="175" fill="#e8e7da"/><circle cx="555" cy="59" r="23" fill="#b7604c" opacity=".82"/><path d="M0 124 101 89l39 8 56-39 73 54 62-25 80-34 39 28 38-13 107 49 58-33 47 26v65H0Z" fill="#ced3c3"/><path d="m0 155 113-31 59 14 61-18 64 14 82-22 46 8 68-21 57 31 75-10 75 18v37H0Z" fill="#bac5b4"/><path d="m0 165 79-15 140 8 67-17 111 14 67-9 78 13 64-14 94 15v15H0Z" fill="#9aab9b"/><path d="M430 153h43m63-17h36m-4 29h47m40-24h24" stroke="#e2e2d3" stroke-width="2" stroke-linecap="round" opacity=".85"/><path d="m622 46 6 3 6-3m-33 10 4 3 5-4" fill="none" stroke="#667669" stroke-width="1.5" stroke-linecap="round"/></svg>' +
      '<div class="landscape-text"><h1 id="view-title">今日一首</h1><p>' + formatDate(today) + '</p></div></section>';
  }
  function heading(title, description) {
    return '<header class="collection-head"><h1 id="view-title">' + title + '</h1><p>' + description + '</p></header>';
  }
  function todayView() {
    return landscape() + poemCard(poemFor(today)) +
      '<div class="today-footer"><span class="round-status">' + scheduleLabel(today) + '</span><button class="action" type="button" data-action="yesterday">补读昨日 <span aria-hidden="true">→</span></button></div>';
  }
  function dateView() {
    const dates = Array.from({length: Math.min(7, dayNumber(today) - epoch + 1)}, (_, days) => plusDays(today, -days));
    return heading('诗历', '按北京时间选一天，补读那天的诗词。') +
      '<div class="date-switch"><label class="date-field" for="archive-date">选择日期<input type="date" id="archive-date" min="' + firstDay +
      '" max="' + today + '" value="' + archiveDate + '"></label>' +
      '<button class="action" type="button" data-action="prev"' + (archiveDate <= firstDay ? ' disabled' : '') + '>前一天</button>' +
      '<button class="action" type="button" data-action="next"' + (archiveDate >= today ? ' disabled' : '') + '>后一天</button></div>' +
      poemCard(poemFor(archiveDate)) + '<p class="round-status archive-round">' + scheduleLabel(archiveDate) + '</p>' +
      '<section class="date-list" aria-labelledby="recent-title"><h2 class="list-heading" id="recent-title">最近七日</h2><ul class="poem-list">' +
      dates.map(date => {
        const poem = poemFor(date);
        return '<li><button type="button" data-action="date" data-date="' + date + '"' + (date === archiveDate ? ' aria-current="date"' : '') + '><span class="list-date">' + date.slice(5).replace('-', '/') + '</span><span><strong>' +
          escape(poem?.title || '文本暂不可读') + '</strong><small>' + escape(poem ? poem.kind + ' · ' + poem.author : '') + '</small></span><span class="list-arrow" aria-hidden="true">›</span></button></li>';
      }).join('') + '</ul></section>';
  }
  function favoritesView() {
    if (favoriteDetail) {
      return heading('收藏', '留住读过的一首。') +
        '<button class="action" type="button" data-action="back-favorites">‹ 返回收藏</button>' +
        poemCard(corpus.get(favoriteDetail));
    }
    return heading('收藏', favoriteIds.length ? favoriteIds.length + ' 首诗词，保存在这部手机上。' : '喜欢的诗词，收在这里慢慢读。') +
      (favoriteIds.length ? '<ul class="poem-list">' + favoriteIds.map(id => {
        const poem = corpus.get(id);
        return '<li><button type="button" data-action="open-favorite" data-id="' + escape(id) + '"><span class="kind" data-kind="' + escape(poem.kind) +
          '">' + escape(poem.kind) + '</span><span><strong>' + escape(poem.title) + '</strong><small>' + escape(poem.author) + '</small></span><span class="list-arrow" aria-hidden="true">›</span></button></li>';
      }).join('') + '</ul>' : '<div class="empty"><strong>收藏夹还是空的</strong><p>读到喜欢的一首，点诗文下方的「收藏」。</p></div>');
  }
  function render() {
    tabs.forEach(tab => {
      if (tab.dataset.view === currentView) tab.setAttribute('aria-current','page');
      else tab.removeAttribute('aria-current');
    });
    if (!schedule || !corpus.size || today < firstDay) {
      const available = schedule && corpus.size;
      content.innerHTML = '<div class="empty"><strong>' + (!available ? '诗库未能打开' : '请核对手机日期') + '</strong><p>' +
        (!available ? '退出应用后重新打开。' : '小诗历支持从 2020 年 1 月 1 日开始的日期。') + '</p></div>';
      return;
    }
    content.innerHTML = currentView === 'today' ? todayView() : currentView === 'history' ? dateView() : favoritesView();
  }
  function showView(view) {
    currentView = view;
    favoriteDetail = null;
    render();
    window.scrollTo(0,0);
  }
  function showDate(date, scroll = false) {
    if (!dateValid(date)) {
      message('请选择不晚于今天的有效日期');
      const input = document.getElementById('archive-date');
      if (input) input.value = archiveDate;
      return;
    }
    archiveDate = date;
    render();
    if (scroll) window.scrollTo(0,0);
  }
  function updateDay() {
    const next = dayInBeijing();
    if (next === today) return;
    const followedToday = archiveDate === today;
    today = next;
    schedule = openSchedule(today, schedule?.state);
    if (followedToday || archiveDate > today) archiveDate = today;
    if (currentView !== 'favorites') render();
  }
  document.querySelector('.nav').addEventListener('click', event => {
    const button = event.target.closest('button[data-view]');
    if (!button || button.dataset.view === currentView) return;
    showView(button.dataset.view);
  });
  content.addEventListener('click', event => {
    const clicked = event.target.closest('button[data-action]');
    if (!clicked) return;
    switch (clicked.dataset.action) {
      case 'favorite': toggleFavorite(clicked.dataset.id, clicked); break;
      case 'yesterday': archiveDate = today > firstDay ? plusDays(today,-1) : today; showView('history'); break;
      case 'prev': showDate(plusDays(archiveDate,-1)); break;
      case 'next': showDate(plusDays(archiveDate,1)); break;
      case 'date': showDate(clicked.dataset.date,true); break;
      case 'open-favorite':
        if (favoriteIds.includes(clicked.dataset.id)) { favoriteDetail = clicked.dataset.id; render(); window.scrollTo(0,0); }
        break;
      case 'back-favorites': showView('favorites'); break;
    }
  });
  content.addEventListener('change', event => {
    if (event.target.id === 'archive-date') showDate(event.target.value);
  });
  window.poetryBack = () => {
    if (favoriteDetail) { showView('favorites'); return true; }
    if (currentView !== 'today') { showView('today'); return true; }
    return false;
  };
  window.addEventListener('poetry-resumed', updateDay);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateDay(); });
  setInterval(() => { if (!document.hidden) updateDay(); }, 30000);
  render();
})();
