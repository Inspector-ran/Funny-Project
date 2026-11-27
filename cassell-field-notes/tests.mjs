import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BASE_SCENES } from './dist/story.js';
import { SCENES, missions, chapterIndex, initialState, choose, lockReason, sceneText, pack, unpack, validateState, endings, determineEnding, completedMissions } from './dist/engine.js';
import { COMPANION_CHOICES, COMPANION_PAIRS, COMPANION_CODA, COMPANION_SCENE_NOTES } from './dist/companion-story.js';
const {chapters, endings:pumpEndings} = missions.pump;

// All links are checked, including links on choices that require clues.
assert.equal(chapters.length, 15);
const chapterIds = chapters.flat();
assert.equal(new Set(chapterIds).size, chapterIds.length);
assert.deepEqual(Object.keys(missions.pump.scenes).sort(), [...chapterIds, ...pumpEndings].sort());
const flags = new Set(Object.values(SCENES).flatMap(scene => scene.choices.flatMap(choice => choice.flags)));
for (const sceneId of chapterIds) {
  const scene = SCENES[sceneId];
  assert.ok(sceneText({...initialState('测试新生'), scene: sceneId}).length);
  assert.ok(scene.choices.filter(c => !c.requiredSpirit && !c.requiredFlag && !c.requiredAny?.length).length >= 2, sceneId);
  for (const c of scene.choices) {
    if (c.next === '@ending') assert.equal(chapterIndex(sceneId), chapters.length - 1);
    else assert.equal(chapterIndex(c.next), chapterIndex(sceneId) + 1, sceneId);
    for (const flag of [c.requiredFlag, ...(c.requiredAny ?? [])].filter(Boolean)) assert.ok(flags.has(flag), flag);
  }
}

// Deterministic walk across different stats and decision combinations.
let random = 57;
const reached = new Map();
const visited = new Set();
const seenCampusAndPump = new Set();
for (let run = 0; run < 16000; run++) {
  let s = initialState('测试新生');
  for (let step = 0; step < chapters.length; step++) {
    visited.add(s.scene);
    assert.equal(chapterIndex(s.scene), step);
    const available = SCENES[s.scene].choices.flatMap((c, i) => lockReason(s, c) ? [] : [i]);
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
    if (run < 100 && available.length < SCENES[s.scene].choices.length) {
      const locked = SCENES[s.scene].choices.findIndex(c => lockReason(s, c));
      assert.throws(() => choose(s, locked));
    }
    s = choose(s, available[Math.floor((random / 2 ** 32) * available.length)]);
    if (run < 100) assert.deepEqual(unpack(JSON.stringify(pack(s))), s);
  }
  assert.equal(s.history.length, 15);
  assert.ok(SCENES[s.scene].ending);
  reached.set(s.scene, s);
  seenCampusAndPump.add(`${s.history[4].scene}/${s.history[7].scene}`);
}
assert.deepEqual([...visited].sort(), chapterIds.sort());
assert.deepEqual([...reached.keys()].sort(), [...pumpEndings].sort());
assert.equal(seenCampusAndPump.size, 9);
const hidden = reached.get('ending_recording');
for (const flag of ['rescued', 'reported', 'kept_recording', 'compared_record']) assert.ok(hidden.flags.includes(flag));

// Feed the new engine actual previous story actions using the original v1 scene graph.
for (const legacyChoices of [[0,1,1,2,1,2,2], [1,0,0,1,0,1,1], [2,2,2,0,2,4,0]]) {
  const old = {version:1,name:'旧档同学',scene:'arrival',blood:45,spirit:75,favor:20,turns:0,flags:[],history:[]};
  for (const index of [...legacyChoices, -1]) {
    const restored = unpack({format:'cassell-web',version:1,savedAt:'2026-11-25T12:00:00Z',state:old});
    assert.equal(restored.scene, old.scene);
    assert.deepEqual(restored.history, old.history);
    assert.equal(restored.turns + restored.skipped, chapterIndex(old.scene));
    assert.deepEqual(unpack(JSON.stringify(pack(restored))), restored);
    const {history, ...cppSave} = old;
    assert.deepEqual(unpack(cppSave), {...restored, history:[]});
    if (SCENES[restored.scene].ending) break;
    const nextOption = SCENES[restored.scene].choices.findIndex(c => !lockReason(restored, c));
    assert.doesNotThrow(() => pack(choose(restored, nextOption)));
    const c = BASE_SCENES[old.scene].choices[index];
    old.history.push({scene:old.scene,choice:c.text,result:c.result});
    for (const key of ['blood', 'spirit', 'favor']) old[key] = Math.max(0, Math.min(100, old[key] + c[key]));
    old.flags = [...new Set([...old.flags, ...c.flags])];
    old.turns++;
    old.scene = c.next === '@ending' ? determineEnding(old) : c.next;
  }
}

const base = initialState('张"同学\\');
for (const changes of [{version:4},{mission:'__proto__'},{mission:'south'},{name:''},{scene:'__proto__'},{blood:-1},{spirit:101},{favor:3.4},{turns:1},{skipped:8},{flags:['unknown']},{flags:['backup','backup']},{history:[{scene:'oops'}]}]) assert.throws(() => validateState({...base,...changes}));
for (const text of ['', 'null','{}','[]','{"version":1,}','x'.repeat(65537)]) assert.throws(() => unpack(text));
assert.deepEqual(unpack('\ufeff'+JSON.stringify(base)),base);

const {mission:unneededMission, ...baseWithoutMission} = base;
const v2Save = {...baseWithoutMission, version:2};
assert.deepEqual(unpack(v2Save),base);
assert.deepEqual(unpack({format:'cassell-web',version:2,state:v2Save}),base);

// Branch trees in the shorter missions are small enough to traverse exhaustively.
const totals = {};
assert.equal(endings.length, 17);
assert.equal(new Set(endings).size, 17);
const sceneIds=Object.values(missions).flatMap(m => Object.keys(m.scenes));
assert.equal(sceneIds.length,new Set(sceneIds).size);
for (const id of ['south','snow','free']) {
  const mission = missions[id];
  const reachedScenes = new Set();
  const reachedEndings = new Map();
  assert.equal(mission.chapters.length,8);
  assert.equal(mission.endings.length,3);
  assert.ok(mission.chapters.some(chapter=>chapter.length>=2));
  function walk(s) {
    assert.equal(s.mission,id);
    assert.equal(chapterIndex(s.scene),s.turns);
    assert.ok(Object.hasOwn(mission.scenes,s.scene));
    const scene=mission.scenes[s.scene];
    if (scene.ending) {
      assert.equal(s.turns,8);
      assert.equal(s.history.length,8);
      assert.deepEqual(unpack(JSON.stringify(pack(s))),s);
      reachedEndings.set(s.scene,(reachedEndings.get(s.scene)??0)+1);
      return;
    }
    reachedScenes.add(s.scene);
    assert.ok(scene.text.length>0);
    const legalOptions=scene.choices.flatMap((c,index)=>lockReason(s,c)?[]:[index]);
    assert.ok(legalOptions.length>=2);
    for (const index of legalOptions) walk(choose(s,index));
  }
  walk(initialState('测试新生',id));
  assert.deepEqual([...reachedScenes].sort(),mission.chapters.flat().sort());
  assert.deepEqual([...reachedEndings.keys()].sort(),[...mission.endings].sort());
  assert.throws(()=>validateState({...initialState('测试新生',id),flags:['backup']}));
  totals[id]=[...reachedEndings.values()].reduce((a,b)=>a+b,0);
}

const threeCompletions = completedMissions(['ending_archive','south_ending_hold','snow_ending_shelter','south_ending_hold','incorrect-id']);
assert.deepEqual([...threeCompletions],['pump','south','snow']);
assert.equal(COMPANION_PAIRS.length,3);
assert.equal(COMPANION_CODA.choices.length,2);
for (const [scene,note] of Object.entries(COMPANION_SCENE_NOTES)) {
  assert.ok(sceneText({...initialState('测试生'),scene}).endsWith(note));
}
for (const [scene,option] of Object.entries(COMPANION_CHOICES)) {
  const id = scene.split('_')[0];
  const s = {...initialState('测试生',id),scene,turns:chapterIndex(scene),flags:option.requiredFlag?[option.requiredFlag]:[]};
  const index = SCENES[scene].choices.indexOf(option);
  assert.equal(lockReason(s,option),option.requiredReason);
  assert.throws(()=>choose(s,index));
  assert.equal(lockReason(s,option,threeCompletions),'');
  if (option.requiredFlag) assert.notEqual(lockReason({...s,flags:[]},option,threeCompletions),'');
  const next=choose(s,index,threeCompletions);
  assert.equal(chapterIndex(next.scene),s.turns+1);
  assert.deepEqual(unpack(JSON.stringify(pack(next))),next);
}

const cover = readFileSync(new URL('./dist/share-cover.png', import.meta.url));
assert.equal(cover.readUInt32BE(16), 1200);
assert.equal(cover.readUInt32BE(20), 630);
console.log(`PASS: old mission 16,000 runs; South ${totals.south}, Snow ${totals.snow}, Free Day ${totals.free} complete routes; all ${endings.length} endings; companion choices and v1/v2/v3 saves.`);
