import { actions, paths, places, profiles } from './town-data.mjs';

const residentIds = Object.keys(profiles);
const stepsPerDay = 12;
const edge = value => Math.max(0, Math.min(100, value));
export const dayAt = turn => Math.floor(turn / stepsPerDay) + 1;
const others = id => residentIds.find(other => other !== id);

export function newTown() {
  return {
    revision: 0, turn: 0, lastModelAt: 0, friendship: 0, events: [],
    residents: {
      ran: { place: 'library', energy: 79, company: 25, memory: [], lastChat: -9, progress: 0, activity: '走进图书屋' },
      nuomi: { place: 'garden', energy: 69, company: 31, memory: [], lastChat: -9, progress: 0, activity: '在温室门口张望' }
    }
  };
}

function mood(person) {
  if (person.energy < 32) return '有些累';
  if (person.company < 25) return '想找人说说话';
  if (person.company >= 68) return '很开心';
  return '心情平稳';
}

function memory(state, person, type, text, importance, about = null) {
  person.memory.push({ day: dayAt(state.turn), turn: state.turn, type, text, importance, about });
  if (person.memory.length > 72) {
    const weakest = person.memory.reduce((index, item, i, items) =>
      item.importance < items[index].importance ? i : index, 0);
    person.memory.splice(weakest, 1);
  }
}

function recall(state, person, other) {
  return [...person.memory]
    .sort((a, b) => (b.importance * 4 + Number(b.about === other) * 6 - (state.turn - b.turn) / 10) -
      (a.importance * 4 + Number(a.about === other) * 6 - (state.turn - a.turn) / 10))
    .slice(0, 5).map(({ day, type, text }) => ({ day, type, text }));
}

function distance(from, until) {
  const queue = [[from, 0]];
  const visited = new Set([from]);
  for (const [position, count] of queue) {
    if (position === until) return count;
    for (const next of paths[position]) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([next, count + 1]);
      }
    }
  }
  return Infinity;
}

function candidates(state, id) {
  const self = state.residents[id];
  const other = state.residents[others(id)];
  const home = id === 'ran' ? ['chart', 'read'] : ['flowers', 'bake'];
  const hobby = home[(self.progress + dayAt(state.turn) - 1) % home.length];
  const wantsCompany = self.company <= 55 && state.turn - self.lastChat > 3;
  const target = wantsCompany && self.energy >= 34 ? 'square' : actions[hobby].place;
  const choices = paths[self.place].map(place => ({
    key: `move:${place}`, label: `去${places[place].name}`,
    score: 25 + (distance(self.place, target) - distance(place, target)) * 15
  }));
  choices.push({ key: 'rest', label: '坐一会儿', score: self.energy < 32 ? 95 : 14 });
  if (actions[hobby].place === self.place && self.energy >= 24) {
    choices.push({ key: hobby, label: actions[hobby].label, score: 52 });
  }
  if (wantsCompany && target === self.place) {
    choices.push({ key: 'wait', label: '在广场等路过的朋友', score: 54 });
  }
  if (self.place === other.place && self.energy >= 25 && other.energy >= 25 &&
      state.turn - Math.max(self.lastChat, other.lastChat) > 3) {
    choices.push({ key: 'talk', label: `和${profiles[others(id)].name}打招呼`, score: wantsCompany ? 91 : 57 });
  }
  return choices.sort((a, b) => b.score - a.score);
}

function perspectives(state) {
  return Object.fromEntries(residentIds.map(id => {
    const p = state.residents[id];
    const { look, ...profile } = profiles[id];
    return [id, { ...profile, place: places[p.place].name, mood: mood(p), energy: p.energy,
      goalProgress: p.progress, memories: recall(state, p, others(id)) }];
  }));
}

function addEvent(state, type, residents, title, body, extra = {}) {
  state.events.unshift({ turn: state.turn, day: dayAt(state.turn), type, residents, title, body, ...extra });
  state.events.length = Math.min(42, state.events.length);
}

function scriptedDialogue(state, id) {
  const other = others(id);
  const shared = state.residents[id].memory.findLast(m => m.type === 'relationship' && m.about === other);
  if (shared) {
    return [
      { speaker: id, text: `还记得第 ${shared.day} 天在${shared.text}碰面吗？今天要不要换个地方散散步？` },
      { speaker: other, text: '记得呀。等手边的事忙完，我想沿着河再走一段。' }
    ];
  }
  const bySpeaker = {
    ran: '你知道河对面那架望远镜能看到什么吗？',
    nuomi: '我刚才一直在想着温室里的花。你最近在忙什么呀？'
  };
  const replies = {
    ran: '我在试着画一张星星地图。下次可以带给你看看。',
    nuomi: '我们可以先沿河找一个看得清楚的位置。走之前我想装两块饼干。'
  };
  return [{ speaker: id, text: bySpeaker[id] }, { speaker: other, text: replies[other] }];
}

const reasonableText = (value, limit) => typeof value === 'string' && Boolean(value.trim()) && Array.from(value).length <= limit;

function checkedDialogue(lines, id) {
  if (!Array.isArray(lines) || lines.length < 2 || lines.length > 4) return null;
  return lines.every((line, i) => line?.speaker === (i % 2 === 0 ? id : others(id)) &&
    reasonableText(line.text, 120)) ? lines.map(({ speaker, text }) => ({ speaker, text: text.trim() })) : null;
}

function talk(state, id, lines, source) {
  const other = others(id);
  const place = places[state.residents[id].place].name;
  const before = state.friendship;
  state.friendship = Math.min(100, before + (before === 0 ? 8 : 4));
  for (const personId of [id, other]) {
    const self = state.residents[personId];
    const friend = others(personId);
    self.lastChat = state.turn;
    self.company = edge(self.company + 33);
    self.energy = edge(self.energy - 5);
    self.activity = `和${profiles[friend].name}聊天`;
    memory(state, self, 'relationship', place, before === 0 ? 5 : 3, friend);
    const reply = lines.find(line => line.speaker === friend);
    memory(state, self, 'experience', `在${place}，${profiles[friend].name}说过：「${reply.text}」`, before === 0 ? 4 : 2, friend);
    if (before === 0) {
      memory(state, self, 'impression', `我在${place}遇见${profiles[friend].name}，对方愿意停下来说几句。`, 4, friend);
    }
  }
  addEvent(state, 'dialogue', [id, other], `${profiles[id].name}和${profiles[other].name}在${place}聊天`,
    '两位居民自己停下来打了招呼。', { lines, source });
}

function execute(state, id, choice, lines, source) {
  const self = state.residents[id];
  const name = profiles[id].name;
  self.company = edge(self.company - 3);
  if (choice.key === 'talk') {
    talk(state, id, lines, source);
  } else if (choice.key.startsWith('move:')) {
    const place = choice.key.slice(5);
    self.place = place;
    self.energy = edge(self.energy - 8);
    self.activity = choice.label;
    addEvent(state, 'action', [id], name + choice.label, '');
  } else if (choice.key === 'rest' || choice.key === 'wait') {
    self.activity = choice.label;
    self.energy = edge(self.energy + (choice.key === 'rest' ? 36 : 10));
    addEvent(state, 'action', [id], name + choice.label, choice.key === 'wait' ? '想给路过的朋友留一点时间。' : '歇一歇，积攒下次出门的精神。');
  } else {
    const hobby = actions[choice.key];
    self.progress++;
    self.energy = edge(self.energy - 13);
    self.activity = choice.label;
    memory(state, self, 'experience', hobby.memory, self.progress === 1 ? 4 : 2);
    addEvent(state, 'action', [id], name + choice.label, hobby.memory);
  }
}

export async function advance(current, { brain, now = Date.now(), modelInterval = 45_000 } = {}) {
  const state = structuredClone(current);
  state.turn++;
  const id = residentIds[(state.turn - 1) % residentIds.length];
  const legal = candidates(state, id);
  let choice = legal[0];
  let lines = null;
  let source = '规则演示';
  if (brain && now - state.lastModelAt >= modelInterval && (choice.key === 'talk' || state.turn % 5 === 0)) {
    state.lastModelAt = now;
    try {
      const proposal = await brain({ day: dayAt(state.turn), actor: id, other: others(id),
        people: perspectives(state), actions: legal.map(({ key, label }) => ({ key, label })) });
      const suggested = legal.find(option => option.key === proposal?.action);
      const dialogue = suggested?.key === 'talk' ? checkedDialogue(proposal.lines, id) : null;
      if (suggested && (suggested.key !== 'talk' || dialogue)) {
        choice = suggested;
        lines = dialogue;
        source = '模型生成';
      }
    } catch {
      // The scheduled world still advances when the language provider is unavailable.
    }
  }
  execute(state, id, choice, lines ?? (choice.key === 'talk' ? scriptedDialogue(state, id) : null), source);
  state.revision++;
  return state;
}

export function townView(state, hasModel) {
  return {
    day: dayAt(state.turn), turn: state.turn, hour: 8 + state.turn % stepsPerDay, friendship: state.friendship,
    hasModel, events: state.events,
    residents: residentIds.map(id => ({ id, ...profiles[id], ...state.residents[id], mood: mood(state.residents[id]) }))
  };
}
