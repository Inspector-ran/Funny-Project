(() => {
  const element = id => document.getElementById(id);
  const make = (tag, value) => {
    const node = document.createElement(tag);
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const portraits = new Map();
  const positions = new Map();
  const cards = new Map();
  const memoryLabels = { relationship: '共同经历', experience: '经历', impression: '认识' };
  let lastTurn = -1;
  let lastLight;
  let loading = false;
  let online = false;

  function portrait(person, colors) {
    if (!portraits.has(person.id)) portraits.set(person.id, window.TownArt.avatar(person.look, colors));
    return portraits.get(person.id);
  }

  function updateResident(person, town) {
    const url = portrait(person, town.colors);
    if (!positions.has(person.id)) {
      const pin = make('div');
      const img = make('img');
      img.src = url;
      img.alt = '';
      pin.className = 'position';
      pin.append(img, make('strong', person.name));
      element('map-labels').append(pin);
      positions.set(person.id, pin);
    }
    const [x,y] = town.places[person.place].pin;
    const pin = positions.get(person.id);
    const offset = town.residents.every(r => r.place === person.place) ? (person.id === 'ran' ? -24 : 24) : 0;
    pin.style.left = `${(x + offset) / 9}%`;
    pin.style.top = `${y / 5.4}%`;

    if (!cards.has(person.id)) {
      const card = element('resident-card').content.firstElementChild.cloneNode(true);
      card.querySelector('img').src = url;
      card.querySelector('h3').textContent = person.name;
      card.querySelector('.temperament').textContent = person.temperament;
      card.querySelector('.wish').textContent = person.wish;
      element('residents').append(card);
      cards.set(person.id, card);
    }
    const card = cards.get(person.id);
    card.querySelector('.mood').textContent = person.mood;
    card.querySelector('.activity').textContent = `${town.places[person.place].name} · ${person.activity}`;
    card.querySelector('.progress').textContent = `记录了 ${person.progress} 次相关经历`;
    const memories = person.memory.slice(-7).reverse().map(m => {
      const prefix = `第 ${m.day} 天 · ${memoryLabels[m.type]}`;
      return make('li', `${prefix}　${m.type === 'relationship' ? '在这里见过朋友：' : ''}${m.text}`);
    });
    card.querySelector('ul').replaceChildren(...(memories.length ? memories : [make('li','还在认识小镇。')]));
  }

  function paint(town) {
    element('clock').textContent = `第 ${town.day} 天 · ${String(town.hour).padStart(2,'0')}:00`;
    element('mode').textContent = town.hasModel ? '对白会标明生成方式。' : '规则演示 · 当前使用示范对白';
    element('friendship').textContent = town.friendship ? `两位居民的熟悉度 ${town.friendship} / 100` : '两位居民还没见过面';
    const rain = town.day % 3 === 2;
    const light = `${rain}/${town.hour >= 18}`;
    if (lastLight !== light) {
      lastLight = light;
      window.TownArt.paint(document.querySelector('canvas'), rain ? 'rain' : 'fair', town.hour);
    }
    for (const person of town.residents) updateResident(person, town);
    const names = Object.fromEntries(town.residents.map(r => [r.id,r.name]));
    if (!town.events.length) return;
    element('events').replaceChildren(...town.events.map(event => {
      const item = make('li');
      const source = event.source ? ` · ${event.source}` : '';
      item.append(make('small', `第 ${event.day} 天 · ${String(8 + event.turn % 12).padStart(2,'0')}:00${source}`), make('strong', event.title));
      if (event.body) item.append(make('p', event.body));
      for (const line of event.lines ?? []) {
        const copy = make('p', `${names[line.speaker]}：${line.text}`);
        copy.className = 'dialogue';
        item.append(copy);
      }
      return item;
    }));
  }

  async function refresh() {
    if (loading) return;
    loading = true;
    try {
      const response = await fetch('/api/town', { signal: AbortSignal.timeout(6000) });
      if (!response.ok) throw Error('Could not read town.');
      const town = await response.json();
      if (town.turn !== lastTurn) paint(town);
      lastTurn = town.turn;
      if (!online) element('connection').textContent = '居民在自行活动';
      online = true;
    } catch {
      if (online || lastTurn === -1) element('connection').textContent = '正在重连观察室';
      online = false;
    } finally {
      loading = false;
    }
  }
  refresh();
  setInterval(refresh, 2500);
})();
