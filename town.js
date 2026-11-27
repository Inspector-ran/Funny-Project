(() => {
  const byId = id => document.getElementById(id);
  const options = {
    temper: {
      warm: '主动热情', quiet: '慢热安静', curious: '好奇爱问', dreamy: '爱发呆'
    },
    hair: { short: '短短的', sweep: '侧分', long: '齐肩发', buns: '双团子', bob: '齐耳波波', curly: '蓬蓬卷', pony: '高马尾', braids: '双麻花' },
    hairColor: {
      brown: { label: '栗棕', color: '#916655' },
      black: { label: '墨黑', color: '#48423f' },
      orange: { label: '蜂蜜橘', color: '#ca8e57' },
      plum: { label: '梅子紫', color: '#816479' },
      pink: { label: '桃子粉', color: '#d7909e' },
      blue: { label: '海盐蓝', color: '#6d9bb5' },
      ash: { label: '雾银灰', color: '#b9b7b3' },
      honey: { label: '杏仁金', color: '#dfbb73' }
    },
    shirt: {
      moss: { label: '苔藓绿', color: '#8ca275', bg: '#e9edde' },
      rose: { label: '莓果粉', color: '#d89389', bg: '#f3e7dd' },
      gold: { label: '蛋黄黄', color: '#e7b66d', bg: '#f5ead3' },
      teal: { label: '雨伞蓝', color: '#7da3a5', bg: '#e1edeb' },
      violet: { label: '丁香紫', color: '#a696c4', bg: '#eee7f1' },
      mint: { label: '薄荷绿', color: '#a4c8ae', bg: '#e6f0e5' },
      navy: { label: '深海蓝', color: '#647d9a', bg: '#e3e9f0' },
      cream: { label: '奶油白', color: '#f2e2b5', bg: '#f1eddb' },
      cherry: { label: '樱桃红', color: '#bf6f74', bg: '#f3e2e3' }
    },
    skin: {
      peach: { label: '蜜桃', color: '#f1caa5' },
      sand: { label: '暖沙', color: '#dbaa81' },
      cocoa: { label: '可可', color: '#ac775c' },
      pearl: { label: '奶油', color: '#f8dac1' },
      biscuit: { label: '烤饼干', color: '#c99066' },
      walnut: { label: '胡桃', color: '#805743' }
    },
    expression: { gentle: '浅浅笑', happy: '笑眯眯', sleepy: '困困脸', surprised: '呆圆眼', cheeky: '得意脸' },
    outfit: { tee: '圆领衫', overalls: '背带裤', raincoat: '雨衣', scarf: '围巾毛衣', sailor: '水手领' },
    accessory: { none: '无', glasses: '圆眼镜', beret: '贝雷帽', ribbon: '大蝴蝶结', flower: '小花发夹', headphones: '耳机', cat: '猫耳帽' },
    hobby: {
      reading: '读书', baking: '做点心', walking: '散步', drawing: '画画', puzzles: '琢磨题目',
      gardening: '种花', letters: '写明信片', camping: '露营', stars: '看星星'
    }
  };
  const places = {
    bakery: { name: '云朵面包房', icon: '☁', pin: [225,231], spots: [[161,266],[294,277],[220,284],[267,216]], note: '刚出炉的面包总会让路过的人慢下来。', activity: '拎着一小袋热面包出门，袋子上印了一朵云。' },
    library: { name: '雨伞图书屋', icon: '▤', pin: [665,225], spots: [[585,258],[736,257],[665,276],[603,213]], note: '窗边有晒得到太阳的位置，书架背后还有一张小桌。', activity: '在一本旧故事书里发现了夹着的银杏叶。' },
    square: { name: '喷泉广场', icon: '✿', pin: [447,347], spots: [[380,312],[511,324],[460,262],[387,365]], note: '树荫在地上慢慢转，路过的人很容易在这里碰见熟面孔。', activity: '绕着喷泉走了一圈，发现水珠里有一道小彩虹。' },
    bench: { name: '河畔长椅', icon: '≈', pin: [764,395], spots: [[685,411],[818,375],[739,354],[816,415]], note: '坐下来能听见河水，也适合找人说两句悄悄话。', activity: '看一片树叶顺着河水漂远，然后在长椅上伸了个懒腰。' },
    garden: { name: '野花温室', icon: '✾', pin: [430,194], spots: [[354,185],[504,190],[475,228],[398,221]], note: '玻璃屋里摆满了花盆，门边放着一把小水壶。', activity: '给一株还没开花的铃兰浇了水，插上一块写着名字的木牌。' },
    post: { name: '猫咪邮局', icon: '✉', pin: [809,202], spots: [[783,172],[865,214],[772,243],[850,248]], note: '邮筒旁有一只黄猫，桌上放着可以带走的明信片。', activity: '给未来的自己寄出一张明信片，邮戳是一个小猫爪。' },
    camp: { name: '萤火露营地', icon: '△', pin: [127,367], spots: [[60,353],[188,345],[87,382],[158,384]], note: '河湾边扎着两顶帐篷，沿着灯串就能找到野餐桌。', activity: '分了一串烤棉花糖，数着帐篷旁一闪一闪的小灯。' },
    deck: { name: '星星观景台', icon: '✦', pin: [344,519], spots: [[268,501],[409,511],[307,488],[379,497]], note: '过桥走到对岸，木台上有一架望远镜和一本星图。', activity: '翻开星图找到了北斗七星，还在旁边画了一枚小小的月亮。' }
  };
  const hobbies = {
    reading: { place: 'library', topic: '最近读到的一页', action: '选了本薄薄的故事书，在窗边慢慢翻。' },
    baking: { place: 'bakery', topic: '如何把奶油夹进面包', action: '尝试把面团捏成小云朵，烤出来却更像一块石头。' },
    walking: { place: 'bench', topic: '哪条小路最适合发呆', action: '沿河走了一段，踩过了三片叶子。' },
    drawing: { place: 'square', topic: '怎样把喷泉画出水声', action: '拿出画本，悄悄画下了路过的小鸟。' },
    puzzles: { place: 'library', topic: '一道可以慢慢想的题', action: '在纸上画了几个小图，突然想到了下一步。' },
    gardening: { place: 'garden', topic: '铃兰什么时候开花', action: '把一排新花盆挪到了有光的窗边。' },
    letters: { place: 'post', topic: '下一张明信片要寄给谁', action: '挑了一张猫爪明信片，写了句「今天也记得散散步」。' },
    camping: { place: 'camp', topic: '野餐要带什么点心', action: '在帐篷边摊开一张格子野餐垫，摆上了小饼干。' },
    stars: { place: 'deck', topic: '北斗七星和小熊座的位置', action: '把望远镜对准河对面的天空，在本子上描了一页星星。' }
  };
  const greetings = {
    warm: '先挥了挥手，主动聊起',
    quiet: '起初只轻轻点头，后来两人慢慢聊到',
    curious: '一开口就问起',
    dreamy: '发了一会儿呆，突然提起'
  };
  const starters = [
    { id: 'nuomi', name: '糯米', temper: 'quiet', hair: 'buns', hairColor: 'orange', shirt: 'rose', skin: 'pearl', hobby: 'baking', phrase: '先吃一小口。', place: 'bakery', mood: '闻到面包香了' },
    { id: 'aqing', name: '阿晴', temper: 'warm', hair: 'sweep', hairColor: 'brown', shirt: 'moss', skin: 'peach', hobby: 'walking', phrase: '走呀，去看看！', place: 'square', mood: '想找人一起玩' },
    { id: 'xiaoli', name: '小栗', temper: 'curious', hair: 'short', hairColor: 'plum', shirt: 'teal', skin: 'sand', hobby: 'reading', phrase: '咦，这是为什么？', place: 'library', mood: '挑到一本好书' }
  ];
  const key = 'little-rain-town-v1';
  const appearanceDefaults = { expression: 'gentle', outfit: 'tee', accessory: 'none' };
  const portraitProperties = ['hair', 'hairColor', 'skin', 'shirt', 'expression', 'outfit', 'accessory'];
  const maxPeople = 16;
  const minuteStep = 20;
  const makeId = () => window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const pairKey = (a, b) => [a.id, b.id].sort().join('|');
  const pick = array => array[Math.floor(Math.random() * array.length)];
  const propLabel = (property, value) => options[property][value].label ?? options[property][value];
  const residentDialog = byId('resident-dialog');
  const detailDialog = byId('detail-dialog');
  const meetDialog = byId('meet-dialog');
  const visitDialog = byId('visit-dialog');
  const residentForm = byId('resident-form');
  const eventList = byId('event-list');
  const bondList = byId('bond-list');
  const markers = byId('map-residents');
  const portraitCache = new Map();
  const shared = window.SharedTown;
  const inviteDialog = byId('invite-dialog');
  let invite = shared?.loadInvite() ?? null;
  let playerId = null;
  let connected = false;
  let refreshing = false;
  let state = shared ? { ...initialState(), people: [], bonds: {}, events: [], revision: -1 } : load();
  let paused = Boolean(state.paused);
  let editingId = null;
  let visitingPlace = null;
  let toastTimer;
  let lastLighting = '';

  function initialState() {
    return {
      version: 1, minutes: 540, turn: 0, paused: false,
      people: starters.map(person => ({ ...appearanceDefaults, ...person })),
      bonds: { [pairKey(starters[0], starters[1])]: 18 },
      events: [
        { time: 540, kind: 'solo', title: '小栗选了一本书', body: '雨伞图书屋的窗边，刚好有一张空椅子。' },
        { time: 530, kind: 'meet', title: '糯米和阿晴打了招呼', body: '两个人顺便分了一块刚烤好的小饼干。' },
        { time: 520, kind: 'arrival', title: '小镇开始营业', body: '喷泉醒了，面包房也亮起了灯。' }
      ]
    };
  }

  function load() {
    try {
      const value = JSON.parse(window.localStorage.getItem(key));
      if (Array.isArray(value?.people)) value.people = value.people.map(person => ({ ...appearanceDefaults, ...person }));
      if (value?.version === 1 && Number.isSafeInteger(value.minutes) && value.minutes >= 0 &&
        Number.isSafeInteger(value.turn) && Array.isArray(value.people) && value.people.length <= maxPeople &&
        value.people.every(person => typeof person.name === 'string' && typeof person.id === 'string' && places[person.place] &&
          Object.keys(options).every(property => Object.hasOwn(options[property], person[property]))) &&
        Array.isArray(value.events) && value.bonds && typeof value.bonds === 'object') {
        return value;
      }
    } catch {
      // Storage may be disabled or an earlier save may be incomplete.
    }
    return initialState();
  }

  function save() {
    const indicator = byId('save-state');
    if (shared) {
      indicator.classList.toggle('unavailable', !connected);
      indicator.lastChild.textContent = connected ? '共享存档' : '同步中';
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
      indicator.classList.remove('unavailable');
      indicator.lastChild.textContent = '自动保存';
    } catch {
      indicator.classList.add('unavailable');
      indicator.lastChild.textContent = '当前无法存档';
    }
  }

  function myResident() {
    return state.people.find(person => person.id === playerId);
  }

  function sharedStatus() {
    if (!shared) return;
    const me = myResident();
    byId('shared-banner').hidden = false;
    byId('shared-status').textContent = !connected
      ? '共享小镇连接中，稍后会自动重试。'
      : me ? `共享小镇 · 你的小人是「${me.name}」`
        : playerId ? '共享小镇 · 可以创建你的小人' : '共享小镇 · 大家会看到同一批居民';
    byId('shared-sign-out').hidden = !playerId;
  }

  function applySnapshot(snapshot) {
    if (!Array.isArray(snapshot?.people) || !Number.isSafeInteger(snapshot.revision)) throw new Error('RAIN_CONNECTION');
    const reconnecting = !connected;
    connected = true;
    if (snapshot.revision > state.revision) {
      snapshot.people = snapshot.people.map(person => ({ ...appearanceDefaults, ...person }));
      const profileTraits = person => [person.id, person.name, person.temper, person.hobby, ...portraitProperties.map(prop => person[prop])];
      const cardsChanged = JSON.stringify(snapshot.people.map(profileTraits)) !== JSON.stringify(state.people.map(profileTraits));
      state = snapshot;
      update(cardsChanged || reconnecting);
    } else if (reconnecting) {
      renderCards();
      save();
    }
    sharedStatus();
  }

  function forgetInvite() {
    invite = null;
    playerId = null;
    shared.storeInvite(null);
    renderCards();
    sharedStatus();
  }

  async function refreshShared() {
    if (refreshing || document.hidden) return;
    refreshing = true;
    try {
      const snapshot = await shared.call(connected ? 'step' : 'read', connected ? { p_code: null, p_manual: false } : {});
      applySnapshot(snapshot);
      if (invite && !playerId) {
        const attempted = invite;
        try {
          const result = await shared.call('sign_in', { p_code: attempted });
          if (invite !== attempted || playerId) return;
          playerId = result.playerId;
          renderCards();
          sharedStatus();
        } catch (error) {
          if (invite === attempted && error.message === 'RAIN_INVITE_INVALID') forgetInvite();
        }
      }
    } catch {
      connected = false;
      renderCards();
      save();
      sharedStatus();
    } finally {
      refreshing = false;
    }
  }

  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function portrait(person) {
    const style = portraitProperties.map(property => person[property]).join('/');
    if (!portraitCache.has(style)) {
      if (portraitCache.size >= 192) portraitCache.delete(portraitCache.keys().next().value);
      portraitCache.set(style, TownArt.avatar(person, options));
    }
    return portraitCache.get(style);
  }

  function headshot(person) {
    const img = el('img');
    img.src = portrait(person);
    img.alt = '';
    return img;
  }

  function clock(minutes, withDay = true) {
    const day = Math.floor(minutes / 1440) + 1;
    const hour = String(Math.floor(minutes / 60) % 24).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    return `${withDay ? `第 ${day} 天 · ` : ''}${hour}:${mins}`;
  }

  function tickClock() {
    state.minutes += minuteStep;
    if (Math.floor(state.minutes / 60) % 24 >= 20) {
      state.minutes = (Math.floor(state.minutes / 1440) + 1) * 1440 + 9 * 60;
    }
    state.turn++;
  }

  function log(kind, title, body) {
    state.events.unshift({ time: state.minutes, kind, title, body });
    state.events = state.events.slice(0, 48);
  }

  function welcomeStatus(score) {
    if (score >= 72) return '好朋友';
    if (score >= 43) return '朋友';
    if (score >= 16) return '熟面孔';
    return '刚认识';
  }

  function meet(a, b, place) {
    a.place = place;
    b.place = place;
    const id = pairKey(a, b);
    const before = state.bonds[id] ?? 0;
    const shared = a.hobby === b.hobby;
    const score = Math.min(100, before + (shared ? 17 : 10) + (a.temper === 'warm' ? 2 : 0));
    state.bonds[id] = score;
    a.mood = '和人聊了一会儿';
    b.mood = '交到了一个熟面孔';
    const phrase = a.phrase && state.turn % 3 === 0 ? `走之前还说了句「${a.phrase}」。` : '';
    const status = welcomeStatus(score);
    const change = before > 0 && status !== welcomeStatus(before) ? `两人成了${status}。` : '';
    const topic = shared ? `两人发现都喜欢${propLabel('hobby', a.hobby)}。` : `${a.name}${greetings[a.temper]}${hobbies[b.hobby].topic}。`;
    log('meet', `${a.name}和${b.name}在${places[place].name}碰面`, topic + phrase + change);
  }

  function solo(person) {
    const hobby = hobbies[person.hobby];
    person.place = hobby.place;
    person.mood = `在${propLabel('hobby', person.hobby)}`;
    const phrase = person.phrase && state.turn % 3 === 1 ? `「${person.phrase}」` : '';
    log('solo', `${person.name}去了${places[hobby.place].name}`, hobby.action + phrase);
  }

  function visit(person, placeId) {
    const place = places[placeId];
    tickClock();
    person.place = placeId;
    person.mood = '在附近逛逛';
    log('solo', `${person.name}去了${place.name}`, place.activity);
    update();
  }

  function advance() {
    tickClock();
    const a = pick(state.people);
    if (a) {
      const others = state.people.filter(person => person !== a);
      if (others.length && state.turn % 3 !== 1) {
        const b = pick(others);
        meet(a, b, pick([a.place, b.place, hobbies[a.hobby].place, 'square']));
      } else {
        solo(a);
      }
    }
    update();
  }

  function renderMap() {
    const day = Math.floor(state.minutes / 1440) + 1;
    const hour = Math.floor(state.minutes / 60) % 24;
    const rain = day % 3 === 2;
    const evening = hour >= 18;
    byId('world-time').textContent = clock(state.minutes);
    byId('world-weather').textContent = rain ? '毛毛雨' : evening ? '傍晚微风' : '晴间多云';
    byId('weather-icon').textContent = rain ? '☂' : evening ? '☾' : '☀';
    const lighting = `${rain}/${evening}`;
    if (lastLighting !== lighting) {
      TownArt.paint(byId('landscape'), rain ? 'rain' : 'fair', hour);
      lastLighting = lighting;
    }
    for (const marker of markers.children) {
      marker.dataset.active = 'false';
    }
    const seen = {};
    state.people.forEach(person => {
      let marker = [...markers.children].find(item => item.dataset.person === person.id);
      if (!marker) {
        marker = el('div', 'map-person');
        marker.dataset.person = person.id;
        const button = el('button', 'sprite');
        button.type = 'button';
        button.append(headshot(person), el('span'));
        button.addEventListener('click', () => showResident(person.id));
        marker.append(button);
        markers.append(marker);
      }
      marker.dataset.active = 'true';
      const button = marker.firstChild;
      button.firstChild.src = portrait(person);
      button.lastChild.textContent = person.name;
      button.setAttribute('aria-label', `查看${person.name}，${places[person.place].name}`);
      const index = seen[person.place] ?? 0;
      seen[person.place] = index + 1;
      const spots = places[person.place].spots;
      const [x, y] = spots[index % spots.length];
      const shift = Math.floor(index / spots.length);
      marker.style.left = `${Math.max(27, Math.min(x + shift * 13, 873)) / 9}%`;
      marker.style.top = `${Math.min(y + shift * 11, 527) / 5.4}%`;
      marker.style.zIndex = String(Math.round(y + shift * 11));
    });
    [...markers.children].filter(marker => marker.dataset.active === 'false').forEach(marker => marker.remove());
  }

  function renderCards() {
    const list = byId('resident-list');
    const focused = list.contains(document.activeElement) ? document.activeElement.dataset.card : undefined;
    const cards = state.people.map(person => {
      const card = el('button', 'resident-card');
      card.type = 'button';
      card.dataset.card = person.id;
      card.style.setProperty('--portrait-bg', options.shirt[person.shirt].bg);
      const text = el('div');
      text.append(el('strong', '', person.name), el('small', '', `${propLabel('temper', person.temper)} · ${propLabel('hobby', person.hobby)}`));
      card.append(headshot(person), text);
      card.addEventListener('click', () => showResident(person.id));
      return card;
    });
    const add = el('button', 'add-card');
    add.type = 'button';
    add.dataset.card = 'new';
    const plus = el('span', '', '＋');
    plus.setAttribute('aria-hidden', 'true');
    const addLabel = shared ? myResident() ? ' 我的小人' : playerId ? ' 捏我的小人' : ' 用邀请码进镇'
      : state.people.length < maxPeople ? ' 捏个小人' : ' 小镇已住满';
    add.append(plus, addLabel);
    add.disabled = shared ? !connected : state.people.length >= maxPeople;
    add.addEventListener('click', startResident);
    list.replaceChildren(...cards, add);
    if (focused) [...list.children].find(card => card.dataset.card === focused)?.focus({ preventScroll: true });
    byId('resident-count').textContent = state.people.length;
    const canMeet = state.people.length >= 2 && (!shared || connected && myResident());
    byId('meet-button').disabled = !canMeet;
    const newButton = document.querySelector('[data-new]');
    newButton.disabled = add.disabled;
    if (shared) {
      newButton.textContent = addLabel.trim();
      byId('step-button').disabled = !canMeet;
    }
  }

  function renderJournal() {
    const symbols = { solo: '♧', meet: '♡', arrival: '✿' };
    const scroll = eventList.scrollTop;
    eventList.replaceChildren(...state.events.map(event => {
      const item = el('li', 'event');
      item.dataset.kind = event.kind;
      const icon = el('span', 'event-glyph', symbols[event.kind] ?? '·');
      icon.setAttribute('aria-hidden', 'true');
      const copy = el('div');
      copy.append(el('time', '', clock(event.time)), el('h3', '', event.title), el('p', '', event.body));
      item.append(icon, copy);
      return item;
    }));
    eventList.scrollTop = scroll;

    const people = new Map(state.people.map(person => [person.id, person]));
    const pairs = Object.entries(state.bonds).sort((a, b) => b[1] - a[1]).flatMap(([id, score]) => {
      const [a, b] = id.split('|').map(key => people.get(key));
      if (!a || !b) return [];
      const item = el('div', 'bond');
      const row = el('div', 'bond-people');
      row.append(headshot(a), headshot(b), el('strong', '', `${a.name}和${b.name}`));
      const meter = el('div', 'bond-bar');
      meter.setAttribute('role', 'meter');
      meter.setAttribute('aria-label', '熟悉度');
      meter.setAttribute('aria-valuemin', '0');
      meter.setAttribute('aria-valuemax', '100');
      meter.setAttribute('aria-valuenow', String(score));
      const fill = el('span');
      fill.style.width = `${score}%`;
      meter.append(fill);
      item.append(row, el('span', 'bond-status', welcomeStatus(score)), meter);
      return [item];
    });
    const bondScroll = bondList.scrollTop;
    bondList.replaceChildren(...(pairs.length ? pairs : [el('p', 'empty', '小人们还不太熟。安排一场见面，或者让时间慢慢走。')]));
    bondList.scrollTop = bondScroll;
  }

  function update(cards = false) {
    renderMap();
    if (cards) renderCards();
    renderJournal();
    save();
  }

  function notify(message) {
    const toast = byId('toast');
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
  }

  function action(text, className, callback) {
    const button = el('button', `button ${className}`, text);
    button.type = 'button';
    button.addEventListener('click', callback);
    return button;
  }

  function closeDetailThen(callback) {
    detailDialog.close();
    callback();
  }

  function showResident(id) {
    const person = state.people.find(item => item.id === id);
    if (!person) return;
    byId('detail-title').textContent = person.name;
    const summary = el('div', 'create-preview');
    const avatar = headshot(person);
    avatar.width = 96;
    avatar.height = 96;
    const description = el('div');
    description.append(
      el('strong', '', `${propLabel('temper', person.temper)} · ${propLabel('hobby', person.hobby)}`),
      el('p', '', `${places[person.place].name} · ${person.mood}`),
      el('p', '', person.phrase ? `「${person.phrase}」` : '还没有口头禅')
    );
    summary.append(avatar, description);
    byId('detail-content').replaceChildren(summary);
    const actions = byId('detail-actions');
    const edit = action('编辑小人', 'soft', () => closeDetailThen(() => showEditor(id)));
    const meeting = action('安排见面', 'primary', () => closeDetailThen(() => showMeeting(person.place, id)));
    meeting.disabled = state.people.length < 2 || Boolean(shared && (!connected || !myResident()));
    actions.replaceChildren(...(!shared || id === playerId ? [edit, meeting] : [meeting]));
    if (!detailDialog.open) detailDialog.showModal();
  }

  function showPlace(id) {
    const place = places[id];
    byId('detail-title').textContent = place.name;
    const here = state.people.filter(person => person.place === id);
    const content = byId('detail-content');
    content.replaceChildren(el('p', 'dialog-note', place.note));
    if (here.length) {
      const row = el('div', 'detail-residents');
      for (const person of here) {
        const button = el('button', 'detail-person', person.name);
        button.type = 'button';
        button.addEventListener('click', () => showResident(person.id));
        row.append(button);
      }
      content.append(row);
    } else {
      content.append(el('p', 'empty', '现在这里很安静。'));
    }
    const canVisit = state.people.length > 0 && (!shared || connected && myResident());
    const go = action('带小人去这里', 'primary', () => closeDetailThen(() => showVisit(id)));
    const meeting = action('约在这里见面', 'soft', () => closeDetailThen(() => showMeeting(id)));
    go.disabled = !canVisit;
    meeting.disabled = !canVisit || state.people.length < 2;
    byId('detail-actions').replaceChildren(meeting, go);
    detailDialog.showModal();
  }

  const defaults = { ...appearanceDefaults, name: '', temper: 'warm', hair: 'short', hairColor: 'brown', shirt: 'moss', skin: 'peach', hobby: 'walking', phrase: '' };

  function formPerson() {
    return Object.fromEntries(new FormData(residentForm));
  }

  function preview() {
    const person = formPerson();
    byId('resident-preview').src = portrait(person);
    byId('preview-name').textContent = person.name.trim() || '新来的小人';
    byId('preview-detail').textContent = `${propLabel('temper', person.temper)} · ${propLabel('hobby', person.hobby)}`;
  }

  function fillEditor(person) {
    for (const field of Object.keys(defaults)) {
      residentForm.elements.namedItem(field).value = person[field];
    }
    byId('resident-name').setCustomValidity('');
    preview();
  }

  function formError(id, message = '') {
    const field = byId(id);
    field.textContent = message;
    field.hidden = !message;
  }

  function startResident() {
    if (shared && !playerId) {
      if (!connected) return;
      byId('invite-form').reset();
      formError('invite-error');
      inviteDialog.showModal();
      return;
    }
    showEditor(myResident()?.id);
  }

  function showEditor(id = null) {
    const person = state.people.find(item => item.id === id);
    if (shared ? !connected || !playerId || (person && person.id !== playerId) : !person && state.people.length >= maxPeople) return;
    editingId = person?.id ?? null;
    byId('resident-dialog-title').textContent = person ? '编辑小人' : '捏个小人';
    byId('create-tools').hidden = Boolean(person);
    byId('remove-resident').hidden = !person || Boolean(shared);
    byId('save-resident').textContent = person ? '保存改动' : '搬进小镇';
    fillEditor(person ?? defaults);
    formError('resident-error');
    residentDialog.showModal();
  }

  function selectOptions(select, entries) {
    select.replaceChildren(...entries.map(([value, name]) => {
      const option = el('option', '', name);
      option.value = value;
      return option;
    }));
  }

  function refreshSecond(preferred) {
    const first = byId('meet-first').value;
    const second = byId('meet-second');
    const others = state.people.filter(person => person.id !== first);
    selectOptions(second, others.map(person => [person.id, person.name]));
    if (others.some(person => person.id === preferred)) second.value = preferred;
  }

  function showMeeting(place = 'square', personId) {
    if (state.people.length < 2 || (shared && (!connected || !myResident()))) return;
    const first = byId('meet-first');
    selectOptions(first, state.people.map(person => [person.id, person.name]));
    if (shared) {
      first.value = playerId;
      first.disabled = true;
      refreshSecond(personId);
    } else {
      if (personId) first.value = personId;
      refreshSecond();
    }
    byId('meet-place').value = place;
    formError('meet-error');
    meetDialog.showModal();
  }

  function showVisit(id) {
    if (shared && !connected) return;
    const visitors = shared ? [myResident()].filter(Boolean) : state.people;
    if (!visitors.length) return;
    visitingPlace = id;
    byId('visit-title').textContent = `去${places[id].name}`;
    byId('visit-note').textContent = places[id].note;
    selectOptions(byId('visit-resident'), visitors.map(person => [person.id, person.name]));
    formError('visit-error');
    visitDialog.showModal();
  }

  function renderPause() {
    const button = byId('play-toggle');
    button.textContent = paused ? '▷ 继续' : 'Ⅱ 暂停';
    button.setAttribute('aria-pressed', String(!paused));
    button.setAttribute('aria-label', paused ? '继续自动推进时间' : '暂停自动推进时间');
  }

  for (const [property, values] of Object.entries(options)) {
    selectOptions(byId(`resident-${property}`), Object.entries(values).map(([value, name]) => [value, name.label ?? name]));
  }
  for (const [id, place] of Object.entries(places)) {
    const marker = el('div', 'place-marker');
    marker.style.left = `${place.pin[0] / 9}%`;
    marker.style.top = `${place.pin[1] / 5.4}%`;
    const button = el('button', 'place-pin');
    button.type = 'button';
    const icon = el('span', 'place-glyph', place.icon);
    icon.setAttribute('aria-hidden', 'true');
    button.setAttribute('aria-label', place.name);
    button.append(icon, el('span', 'place-name', place.name));
    button.addEventListener('click', () => showPlace(id));
    marker.append(button);
    byId('map-places').append(marker);
    const shortcut = el('button', '', place.name);
    shortcut.type = 'button';
    shortcut.addEventListener('click', () => showPlace(id));
    byId('place-directory').append(shortcut);
  }
  selectOptions(byId('meet-place'), Object.entries(places).map(([id, place]) => [id, place.name]));

  document.querySelector('[data-new]').addEventListener('click', startResident);
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  byId('meet-button').addEventListener('click', () => showMeeting());
  byId('meet-first').addEventListener('change', () => refreshSecond(byId('meet-second').value));
  byId('meet-form').addEventListener('submit', async event => {
    event.preventDefault();
    const [a, b] = ['meet-first', 'meet-second'].map(id => state.people.find(person => person.id === byId(id).value));
    const place = byId('meet-place').value;
    if (!a || !b || a === b || !places[place]) return;
    if (shared) {
      const submit = event.submitter ?? event.target.querySelector('[type="submit"]');
      if (!invite || submit.disabled) return;
      formError('meet-error');
      submit.disabled = true;
      try {
        applySnapshot(await shared.call('meet', { p_code: invite, p_other: b.id, p_place: place }));
        meetDialog.close();
        notify(`${a.name}和${b.name}见面了`);
      } catch (error) {
        formError('meet-error', shared.message(error));
      } finally {
        submit.disabled = false;
      }
      return;
    }
    tickClock();
    meet(a, b, place);
    meetDialog.close();
    update();
    notify(`${a.name}和${b.name}见面了`);
  });
  byId('visit-form').addEventListener('submit', async event => {
    event.preventDefault();
    const placeId = visitingPlace;
    const person = state.people.find(resident => resident.id === byId('visit-resident').value);
    const button = event.submitter ?? event.target.querySelector('[type="submit"]');
    if (!person || !places[placeId] || button.disabled) return;
    if (shared) {
      if (!invite || person.id !== playerId) return;
      button.disabled = true;
      formError('visit-error');
      try {
        applySnapshot(await shared.call('visit', { p_code: invite, p_place: placeId }));
      } catch (error) {
        formError('visit-error', shared.message(error));
        return;
      } finally {
        button.disabled = false;
      }
    } else {
      visit(person, placeId);
    }
    visitDialog.close();
    notify(`${person.name}去${places[placeId].name}啦`);
  });
  byId('play-toggle').addEventListener('click', () => {
    if (shared) return;
    paused = !paused;
    state.paused = paused;
    renderPause();
    save();
  });
  byId('step-button').addEventListener('click', async event => {
    if (!shared) {
      advance();
      return;
    }
    const button = event.currentTarget;
    button.disabled = true;
    try {
      applySnapshot(await shared.call('step', { p_code: invite, p_manual: true }));
    } catch (error) {
      notify(shared.message(error));
    } finally {
      button.disabled = !connected || !myResident();
    }
  });
  byId('random-resident').addEventListener('click', () => {
    const traits = Object.fromEntries(Object.entries(options).map(([property, values]) => [property, pick(Object.keys(values))]));
    const names = ['豆沙', '小麦', '团团', '小苔', '阿雾', '柚子', '小纸船'].filter(name => !state.people.some(person => person.name === name));
    fillEditor({ ...defaults, ...traits, name: pick(names) ?? '', phrase: pick(['今天有点好玩。', '待会儿见！', '让我想一想。']) });
  });
  byId('personal-resident').addEventListener('click', () => {
    fillEditor({ ...defaults, name: '我的小人', temper: 'curious', hair: 'buns', shirt: 'teal', accessory: 'flower', hobby: 'puzzles', phrase: '吼吼，要开始学习了喵！' });
  });
  residentForm.addEventListener('input', () => {
    byId('resident-name').setCustomValidity('');
    formError('resident-error');
    preview();
  });
  residentForm.addEventListener('submit', async event => {
    event.preventDefault();
    const draft = formPerson();
    draft.name = draft.name.trim();
    draft.phrase = draft.phrase.trim();
    const current = state.people.find(person => person.id === editingId);
    const nameField = byId('resident-name');
    if (!draft.name || state.people.some(person => person !== current && person.name === draft.name)) {
      nameField.setCustomValidity(draft.name ? '镇上已经有同名的小人了。' : '给小人起个名字吧。');
      nameField.reportValidity();
      return;
    }
    if (shared) {
      const submit = byId('save-resident');
      if (!invite || submit.disabled) return;
      submit.disabled = true;
      try {
        applySnapshot(await shared.call('save', { p_code: invite, p_profile: draft, p_create: !current }));
        residentDialog.close();
        notify(current ? '改动已同步' : `欢迎${draft.name}！`);
      } catch (error) {
        if (error.message === 'RAIN_ALREADY_JOINED') {
          await refreshShared();
          residentDialog.close();
          notify(shared.message(error));
        } else {
          formError('resident-error', shared.message(error));
        }
      } finally {
        submit.disabled = false;
      }
      return;
    }
    if (current) {
      Object.assign(current, draft);
    } else {
      if (state.people.length >= maxPeople) return;
      state.people.push({ ...draft, id: makeId(), place: 'square', mood: '正在认路' });
      log('arrival', `${draft.name}搬来啦`, `喜欢${propLabel('hobby', draft.hobby)}的小人拿着行李到达了喷泉广场。`);
    }
    residentDialog.close();
    update(true);
    notify(current ? '改动已保存' : `欢迎${draft.name}！`);
  });
  byId('remove-resident').addEventListener('click', () => {
    if (shared) return;
    const person = state.people.find(item => item.id === editingId);
    if (!person || !window.confirm(`让${person.name}搬离小镇？这也会清除这个小人的关系记录。`)) return;
    state.people = state.people.filter(item => item.id !== person.id);
    for (const id of Object.keys(state.bonds)) {
      if (id.split('|').includes(person.id)) delete state.bonds[id];
    }
    log('arrival', `${person.name}搬走了`, '挥一挥手，把今天的故事留在了小镇。');
    residentDialog.close();
    update(true);
    notify(`${person.name}离开了小镇`);
  });
  const tabs = [byId('events-tab'), byId('bonds-tab')];
  function selectTab(tab) {
    tabs.forEach(button => {
      const active = button === tab;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      byId(button.getAttribute('aria-controls')).hidden = !active;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = tabs[event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index];
      selectTab(next);
      next.focus();
    });
  });

  update(true);
  if (shared) {
    byId('play-toggle').hidden = true;
    sharedStatus();
    byId('shared-sign-out').addEventListener('click', forgetInvite);
    byId('invite-form').addEventListener('submit', async event => {
      event.preventDefault();
      const submit = event.submitter ?? event.target.querySelector('[type="submit"]');
      if (submit.disabled) return;
      const code = new FormData(event.target).get('code').trim();
      formError('invite-error');
      submit.disabled = true;
      try {
        const result = await shared.call('sign_in', { p_code: code });
        const snapshot = await shared.call('read');
        playerId = result.playerId;
        invite = code;
        shared.storeInvite(code);
        applySnapshot(snapshot);
        renderCards();
        inviteDialog.close();
        startResident();
      } catch (error) {
        formError('invite-error', shared.message(error));
      } finally {
        submit.disabled = false;
      }
    });
    refreshShared();
    window.setInterval(refreshShared, 8000);
    document.addEventListener('visibilitychange', refreshShared);
  } else {
    renderPause();
    window.setInterval(() => {
      if (!paused && !document.hidden && !document.querySelector('dialog[open]') && state.people.length) advance();
    }, 16000);
  }
})();
