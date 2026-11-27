import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import { advance, dayAt, newTown } from './engine.mjs';
import { openAIBrain } from './openai-brain.mjs';
import { createTownServer } from './server.mjs';
import { openTown } from './store.mjs';

test('the two residents pursue individual goals, meet, and use remembered encounters the next day', async () => {
  let state = newTown();
  const history = [];
  for (let count = 0; count < 100; count++) {
    state = await advance(state);
    history.push(state.events[0]);
  }
  for (const id of ['ran', 'nuomi']) {
    const p = state.residents[id];
    assert.ok(p.progress > 0, id + ' pursued their long-term wish');
    assert.ok(p.memory.some(m => m.type === 'relationship'), id + ' remembers their meeting');
    assert.ok(p.memory.some(m => m.type === 'impression'), id + ' formed an impression');
  }
  const conversations = history.filter(event => event.type === 'dialogue');
  assert.ok(conversations.length >= 2);
  assert.ok(conversations.some(event => {
    const match = event.lines[0].text.match(/还记得第 (\d+) 天/);
    return match && Number(match[1]) < event.day;
  }));
  assert.ok(state.friendship > 0);
  assert.ok(dayAt(state.turn) > 1);
});

test('rejects impossible model proposals and accepts checked dialogue linked to past memories', async () => {
  let state = newTown();
  for (let turn = 0; turn < 6; turn++) {
    state = await advance(state, { brain: () => ({ action: 'teleport', lines: [] }), now: 60_000 + turn, modelInterval: 0 });
  }
  assert.ok(['library', 'garden', 'square', 'bakery', 'bench', 'deck'].includes(state.residents.ran.place));
  assert.ok(state.events.every(event => event.source !== '模型生成'));
  let visited = false;
  for (let step = 0; step < 75 && !visited; step++) {
    state = await advance(state, {
      now: 100_000 + step * 60_000,
      brain(context) {
        const action = context.actions.find(option => option.key === 'talk');
        if (!action || !context.people[context.actor].memories.some(m => m.type === 'relationship')) {
          return { action: 'invalid', lines: [] };
        }
        const found = context.people[context.actor].memories.find(m => m.type === 'relationship');
        visited = true;
        return { action: 'talk', lines: [
          { speaker: context.actor, text: `我还记得上次在${found.text}见面。` },
          { speaker: context.other, text: '这次我有件新鲜事想告诉你。' }
        ] };
      }
    });
  }
  assert.ok(visited);
  assert.equal(state.events[0]?.source, '模型生成');
  assert.match(state.events[0].lines[0].text, /我还记得上次/);
});

test('the language adapter uses the server-side key and parses a Responses API result', async () => {
  const expected = { action: 'rest', lines: [] };
  const brain = openAIBrain({ key: 'key-for-test', request: async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    assert.equal(options.headers.Authorization, 'Bearer key-for-test');
    const body = JSON.parse(options.body);
    assert.equal(body.store, false);
    assert.equal(body.text.format.strict, true);
    assert.equal(JSON.parse(body.input).actor, 'ran');
    return { ok: true, json: async () => ({
      status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(expected) }] }]
    }) };
  } });
  assert.deepEqual(await brain({ actor: 'ran' }), expected);
  assert.equal(openAIBrain({ key: '' }), undefined);
});

test('without a client, the scheduler advances and persisted memories survive restart', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'rain-residents-'));
  const filename = join(folder, 'test.sqlite');
  let store = openTown(filename);
  const server = createTownServer({ store, interval: 8 });
  await server.start(0);
  try {
    for (let tries = 0; tries < 100 && store.read().friendship === 0; tries++) await delay(10);
    const world = store.read();
    assert.ok(world.turn > 1);
    assert.ok(world.friendship > 0);
    const dispatch = async url => {
      const result = {};
      await server.handleRequest({ method: 'GET', url }, {
        writeHead(status) { result.status = status; return this; },
        end(body) { result.body = body?.toString(); }
      });
      return result;
    };
    const response = await dispatch('/api/town');
    const publicState = JSON.parse(response.body);
    assert.equal(response.status, 200);
    assert.deepEqual(publicState.residents.map(p => p.name), ['小然', '糯米']);
    const art = await dispatch('/world.js');
    assert.equal(art.status, 200);
    assert.match(art.body, /window\.TownArt/);
  } finally {
    await server.stop();
    store.close();
  }
  try {
    store = openTown(filename);
    assert.ok(store.read().residents.ran.memory.some(m => m.type === 'relationship'));
    const prior = store.read();
    const next = await advance(prior);
    assert.equal(store.save(prior, next), true);
    assert.equal(store.save(prior, next), false);
    store.close();
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
