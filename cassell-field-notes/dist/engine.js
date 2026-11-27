// 游戏规则独立于页面，便于测试或添加剧情。对照 C++ 的 State / applyChoice 阅读。
import { PUMP_MISSION_SCENES, PUMP_MISSION_CHAPTERS, extendedText } from './extended-story.js';
import { SOUTH_SCENES, SOUTH_CHAPTERS, SOUTH_ENDINGS, southEnding } from './south-mission.js';
import { SNOW_SCENES, SNOW_CHAPTERS, SNOW_ENDINGS, snowEnding } from './snow-mission.js';
import { FREE_SCENES, FREE_CHAPTERS, FREE_ENDINGS, freeDayEnding } from './free-day-mission.js';
import { COMPANION_SCENE_NOTES, COMPANION_CHOICES } from './companion-story.js';

function withCompanionChoices(scenes) {
  return Object.fromEntries(Object.entries(scenes).map(([id, scene]) => {
    const choice = COMPANION_CHOICES[id];
    return [id, choice ? {...scene, choices:[...scene.choices,choice]} : scene];
  }));
}

export const defaultMission = 'pump';
export const missions = {
  pump: {
    title: '旧泵站见习', partner: '林舟 · 二年级', startLabel: '登上列车',
    description: '一份低风险见习单，三条通向地下室的路。调查学院里的旧记录，再决定怎样走进泵站。',
    chapters: PUMP_MISSION_CHAPTERS, scenes: PUMP_MISSION_SCENES,
    endings: ['ending_partner','ending_survivor','ending_dragon','ending_white_room','ending_archive','ending_secret','ending_distance','ending_recording'],
    resolveEnding: determinePumpEnding,
  },
  south: {
    title: '南楼熄灯以后', partner: '沈栀', startLabel: '前往南楼',
    description: '南楼交接前的最后一次失物清点。标签上的名字一个个消失，今晚过后，这些东西都会被登记为无主。',
    chapters: SOUTH_CHAPTERS, scenes: withCompanionChoices(SOUTH_SCENES), endings: SOUTH_ENDINGS, resolveEnding: southEnding,
  },
  snow: {
    title: '风雪观测站', partner: '程野', startLabel: '出发上山',
    description: '系统显示两名学生已经返校，山上的观测站却多要了两份早餐。和程野上山，查清他们的去向。',
    chapters: SNOW_CHAPTERS, scenes: withCompanionChoices(SNOW_SCENES), endings: SNOW_ENDINGS, resolveEnding: snowEnding,
  },
  free: {
    title: '自由一日之后', partner: '诺诺、零与两边的联络人', startLabel: '去交接处',
    description: '自由一日散场后，一位值勤生的离场记录和手写回执对不上。向路明非、楚子航和恺撒核对当晚的事，你得决定哪一份记录值得签字。',
    chapters: FREE_CHAPTERS, scenes: withCompanionChoices(FREE_SCENES), endings: FREE_ENDINGS, resolveEnding: freeDayEnding,
  },
};
export const SCENES = Object.assign({}, ...Object.values(missions).map(mission => mission.scenes));
export const endings = Object.values(missions).flatMap(mission => mission.endings);
const noCompletions = new Set();
const sceneMissions = new Map(Object.entries(missions).flatMap(([id, mission]) => Object.keys(mission.scenes).map(scene => [scene,id])));
const legacyChapters = ['arrival','interview','dorm','station','signal','collapse','aftermath'];

export function completedMissions(endingIds) {
  const found = new Set(endingIds);
  return new Set(Object.entries(missions).filter(([,mission]) => mission.endings.some(id => found.has(id))).map(([id])=>id));
}

export function initialState(name, mission = defaultMission) {
  if (!Object.hasOwn(missions,mission)) throw new Error('找不到这项任务');
  return {version:3,mission,name:name.trim() || '新生',scene:missions[mission].chapters[0][0],blood:45,spirit:75,favor:20,turns:0,skipped:0,flags:[],history:[]};
}

export function chapterIndex(scene) {
  const mission = missions[sceneMissions.get(scene)];
  if (!mission) return -1;
  return mission.endings.includes(scene) ? mission.chapters.length : mission.chapters.findIndex(group => group.includes(scene));
}

const has = (s, flag) => s.flags.includes(flag);
export function determineEnding(s) {
  return missions[s.mission ?? defaultMission].resolveEnding(s);
}

function determinePumpEnding(s) {
  if (s.spirit <= 20) return 'ending_white_room';
  if (has(s,'used_blood') && s.blood >= 80) return 'ending_dragon';
  if (has(s,'rescued') && has(s,'reported')) {
    if (has(s,'kept_recording') && has(s,'compared_record')) return 'ending_recording';
    return s.favor >= 65 ? 'ending_partner' : 'ending_survivor';
  }
  if (has(s,'sample')) return has(s,'reported') ? 'ending_archive' : 'ending_secret';
  return 'ending_distance';
}
export function lockReason(s, c, completed = noCompletions) {
  if (c.requiredMission && !completed.has(c.requiredMission)) return c.requiredReason || '需要先完成相关任务';
  if (s.spirit < c.requiredSpirit) return `需要精神值至少 ${c.requiredSpirit}`;
  if (c.requiredFlag && !has(s,c.requiredFlag)) {
    const labels = {
      backup: '需要提前报告异常，让支援小队待命',
      read_maintenance: '需要在档案室读过旧值班记录',
      spare_radio: '需要从器材间带出备用通讯器',
      echo_protocol: '需要在医务室学过辨别回声的办法',
    };
    return c.requiredReason || labels[c.requiredFlag] || '需要先取得对应线索';
  }
  if (c.requiredAny?.length && !c.requiredAny.some(flag => has(s,flag))) return c.requiredReason || '需要先取得调查线索';
  return '';
}
export function choose(s, index, completed = noCompletions) {
  const c = Number.isInteger(index) && SCENES[s.scene]?.choices[index];
  if (!c || lockReason(s,c,completed) || SCENES[s.scene].ending) throw new Error('这个选项目前无法选择');
  const next = {...s};
  for (const stat of ['blood','spirit','favor']) next[stat] = Math.max(0,Math.min(100,next[stat]+c[stat]));
  next.flags = [...new Set([...next.flags,...c.flags])];
  next.turns++;
  next.history = [...s.history,{scene:s.scene,choice:c.text,result:c.result}];
  next.scene = c.next === '@ending' ? determineEnding(next) : c.next;
  return next;
}
export function sceneText(s) {
  const text = missionSceneText(s);
  const note = COMPANION_SCENE_NOTES[s.scene];
  return note ? `${text}\n\n${note}` : text;
}

function missionSceneText(s) {
  const expanded = extendedText(s);
  if (expanded !== null) return expanded;
  if (s.scene === 'aftermath') {
    let text = '天快亮了，泵站外的雨终于停了。\n';
    text += has(s,'rescued') ? '林舟躺在救护车里，脸色很差，但还清醒。\n他碰了一下你的袖口，确认你也上了车，才闭上眼睛。' : '救援队在第二次破拆后找到了林舟。他还活着，但一直没有醒。\n担架经过你身边时，他手里仍然攥着通讯器。';
    if (has(s,'sample')) text += '\n隔离袋放在你脚边。';
    if (has(s,'used_blood')) text += '\n车窗映出你的脸，瞳孔里还有金色。';
    return text+'\n\n诺玛发来事故报告表。第一栏写着：请描述异常现象。';
  }
  if (s.scene === 'ending_secret') return '报告被归档，样本却留在你的抽屉最深处。\n'+(has(s,'rescued') ? '林舟打电话来问你恢复得怎么样。你没有告诉他样本的事。\n\n' : '林舟还在医院。你打过几次电话，每次都在接通前挂断。\n\n')+'期中考试前夜，隔离管轻轻碰了一下抽屉内壁。\n你关掉音乐。过了几秒，它又碰了一下。';
  if (s.scene === 'ending_distance') return (has(s,'rescued') ? '你救出了林舟，却没有在报告里交代全部经过。\n' : '救援队带回了林舟。他需要很长时间才能重新出任务。\n')+'你继续上课、交作业，在食堂排队。生活逐渐恢复了原来的形状。\n\n偶尔碰见，你们仍然打招呼，却很少再提那个晚上。\n一次，你端着餐盘走到他桌边，问这里有没有人。\n“没有。”他说，把对面的椅子拉开了一点。';
  return SCENES[s.scene].text;
}
const missionFlags = Object.fromEntries(Object.entries(missions).map(([id,mission]) => [id,new Set(Object.values(mission.scenes).flatMap(scene => scene.choices.flatMap(c => c.flags)))]));
export function validateState(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('存档内容不完整');
  const s = raw;
  const original = s.version === 1;
  if (![1,2,3].includes(s.version)) throw new Error('不支持这个存档版本');
  const missionId = s.version === 3 ? s.mission : defaultMission;
  if (typeof missionId !== 'string' || !Object.hasOwn(missions,missionId)) throw new Error('存档中的任务不存在');
  const mission = missions[missionId];
  if (typeof s.name !== 'string' || !s.name.trim() || [...s.name].length > 60 || /[\x00-\x1f\x7f]/.test(s.name)) throw new Error('存档中的姓名无效');
  if (typeof s.scene !== 'string' || !Object.hasOwn(mission.scenes,s.scene)) throw new Error('存档中的场景不存在或不属于该任务');
  for (const key of ['blood','spirit','favor']) if (!Number.isInteger(s[key]) || s[key] < 0 || s[key] > 100) throw new Error('存档属性应为 0～100 的整数');
  const maxTurns = original ? legacyChapters.length : mission.chapters.length;
  if (!Number.isInteger(s.turns) || s.turns < 0 || s.turns > maxTurns) throw new Error('行动次数无效');
  if (!Array.isArray(s.flags) || s.flags.some(f=>typeof f!=='string'||!missionFlags[missionId].has(f)) || new Set(s.flags).size!==s.flags.length) throw new Error('剧情标记无效');
  const stage = chapterIndex(s.scene);
  let skipped = s.skipped;
  if (original) {
    const legacyStage = SCENES[s.scene].ending && s.scene !== 'ending_recording' ? legacyChapters.length : legacyChapters.indexOf(s.scene);
    if (legacyStage !== s.turns) throw new Error('剧情进度与场景不一致');
    // 旧版已有的场景、数值、选择保留。已经越过的新章节留到下一周目。
    skipped = stage - legacyStage;
  }
  const maxSkipped = missionId === defaultMission ? mission.chapters.length - legacyChapters.length : 0;
  if (!Number.isInteger(skipped) || skipped < 0 || skipped > maxSkipped || stage !== s.turns + skipped) throw new Error('剧情进度与场景不一致');
  if (SCENES[s.scene].ending && mission.resolveEnding(s) !== s.scene) throw new Error('存档结局与选择不一致');
  const history = s.history ?? [];
  if (!Array.isArray(history) || history.length > s.turns || history.some(h=>!h || !Object.hasOwn(mission.scenes,h.scene) || SCENES[h.scene].ending || typeof h.choice!=='string' || typeof h.result!=='string' || h.choice.length>300 || h.result.length>600)) throw new Error('行动记录无效');
  // 只复制允许的字段；导入内容不会直接变为 HTML。
  return {version:3,mission:missionId,name:s.name,scene:s.scene,blood:s.blood,spirit:s.spirit,favor:s.favor,turns:s.turns,skipped,flags:[...s.flags],history:history.map(h=>({scene:h.scene,choice:h.choice,result:h.result}))};
}
export function pack(s) { return {format:'cassell-web',version:3,savedAt:new Date().toISOString(),state:validateState(s)}; }
export function unpack(raw) {
  if (typeof raw === 'string') {
    if (raw.length > 65536) throw new Error('存档文件过大');
    try { raw = JSON.parse(raw.replace(/^\uFEFF/,'')); } catch { throw new Error('这不是有效的 JSON 存档'); }
  }
  if (raw && Object.hasOwn(raw,'state')) {
    if (raw.format !== 'cassell-web' || ![1,2,3].includes(raw.version) || raw.version !== raw.state?.version) throw new Error('不支持这个存档格式');
    return validateState(raw.state);
  }
  return validateState(raw); // 也支持本游戏 C++ 版导出的 JSON。
}
