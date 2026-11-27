import {SCENES,missions,defaultMission,chapterIndex,endings,completedMissions,initialState,choose,lockReason,sceneText,pack,unpack} from './engine.js';
import { COMPANION_PAIRS, COMPANION_CODA } from './companion-story.js';
import { CAFETERIA_TITLE, CAFETERIA_OPENING, CAFETERIA_VARIANTS, SOUTH_CAFE_CALLBACK } from './cafeteria-story.js';
import { SCENE_ART_ALT, sceneArtSource } from './scene-art.js';

// 本地存档不上传服务器。UI 只使用 textContent 显示姓名、导入记录等动态文本。
const $ = selector => document.querySelector(selector);
const prefix = 'cassell-rain-v1:';
let state = null;
let recentChanges = '';
let busy = false;
let toastTimer;
let storageOkay = true;
let focusBeforeModal = null;
const modal = $('#modal');
let selectedMission = defaultMission;
const sessionEndings = new Set();
let sessionPumpMemory = null;
let sessionCafeteriaReply = null;
let showIllustrations = true;

function node(tag,className,text) {
  const n=document.createElement(tag);
  if(className) n.className=className;
  if(text!==undefined) n.textContent=text;
  return n;
}
function button(text,handler,className='secondary') {
  const b=node('button',className,text);
  b.type='button'; b.addEventListener('click',handler); return b;
}
function toast(message,error=false) {
  clearTimeout(toastTimer);
  const el=$('#toast'); el.textContent=message; el.classList.toggle('error',error); el.hidden=false;
  toastTimer=setTimeout(()=>el.hidden=true,4500);
}
function read(key) {
  try { return localStorage.getItem(prefix+key); }
  catch { storageOkay=false; return null; }
}
function write(key,value) {
  try { localStorage.setItem(prefix+key,value); storageOkay=true; return true; }
  catch { storageOkay=false; return false; }
}
function saveKey(mission,key) {
  return mission === defaultMission ? key : `${mission}:${key}`;
}
function getSaved(key,mission=selectedMission) {
  const raw=read(saveKey(mission,key));
  if(!raw) return null;
  try {
    const data=JSON.parse(raw), savedState=unpack(data);
    if(savedState.mission!==mission) return {invalid:true};
    const date=new Date(data.savedAt);
    return {state:savedState,date:Number.isNaN(+date)?'时间未知':date.toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})};
  } catch { return {invalid:true}; }
}
function unlocked() {
  try {
    const v=JSON.parse(read('endings')||'[]');
    const saved=Array.isArray(v)?v.filter(id=>endings.includes(id)):[];
    return [...new Set([...saved,...sessionEndings])];
  } catch { return [...sessionEndings]; }
}
function updateCollection() { $('#collection-count').textContent=`${new Set(unlocked()).size} / ${endings.length}`; }
function markEnding() {
  if(SCENES[state.scene].ending) {
    if (state.mission === defaultMission) {
      sessionPumpMemory = pumpMemoryFrom(state);
      write('pump-memory',JSON.stringify(sessionPumpMemory));
    }
    sessionEndings.add(state.scene);
    const found=unlocked();
    if(!write('endings',JSON.stringify(found))) toast('浏览器暂时无法保存结局档案，可导出存档备份。',true);
  }
  updateCollection();
}
function autosave() {
  const okay=write(saveKey(state.mission,'auto'),JSON.stringify(pack(state)));
  $('#save-status').textContent=okay?'当前进度已自动保存':'浏览器无法保存，请及时导出存档';
  $('#save-status').classList.toggle('error',!okay);
  return okay;
}
function updateContinue() {
  const saved=getSaved('auto');
  $('#continue').hidden=!saved||saved.invalid;
  if(saved&&!saved.invalid) $('#continue-info').textContent=`${saved.state.name} · ${SCENES[saved.state.scene].title.split(' · ')[1]}`;
  const mission=missions[selectedMission];
  $('#mission-name').textContent=mission.title;
  $('#mission-description').textContent=mission.description;
  $('#start-mission').textContent=mission.startLabel;
  $('#name-note').textContent=`不必填写真实姓名 · ${mission.chapters.length} 章 · ${mission.endings.length} 个结局`;
  updateCollection();
}
function showHome() {
  $('#landing').hidden=false; $('#game').hidden=true; $('#toolbar').hidden=true;
  updateContinue(); window.scrollTo({top:0,behavior:'instant'});
}
function openModal(title) {
  if(!modal.open) focusBeforeModal=document.activeElement;
  $('#modal-title').textContent=title; $('#modal-body').replaceChildren();
  if(!modal.open) modal.showModal();
  modal.scrollTop=0;
  return $('#modal-body');
}
function closeModal() { modal.close(); }
modal.addEventListener('close',()=>{if(focusBeforeModal?.isConnected&&!focusBeforeModal.closest('[hidden]'))focusBeforeModal.focus({preventScroll:true});});
$('#close-modal').addEventListener('click',closeModal);
modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeModal();}});
function confirmAction(title,text,action,cancelAction=null) {
  const body=openModal(title); body.append(node('p','',text));
  const actions=node('div','modal-actions');
  actions.append(button('取消',()=>{if(cancelAction)cancelAction();else closeModal();}),button('确认',()=>{closeModal();action();},'primary'));
  body.append(actions);
}
function activate(next) {
  state=next; selectedMission=next.mission; recentChanges='';
  write('selected-mission',selectedMission); autosave(); markEnding(); render();
}
function start() {
  const name=$('#player-name').value.trim()||'新生';
  if([...name].length>20||/[\x00-\x1f\x7f]/.test(name)){toast('名字请使用 1～20 个可显示字符。',true);return;}
  const mission=selectedMission;
  const action=()=>activate(initialState(name,mission));
  if(getSaved('auto',mission)) confirmAction('开始新的旅程',`新周目会替换「${missions[mission].title}」的自动续玩进度。手动存档可以留住当前故事。`,action);
  else action();
}
function render(focus=true) {
  $('#landing').hidden=true; $('#game').hidden=false; $('#toolbar').hidden=false;
  const scene=SCENES[state.scene], ending=scene.ending;
  const mission=missions[state.mission];
  $('#active-mission-title').textContent=mission.title;
  $('#partner-label').textContent=`同伴：${mission.partner}`;
  $('#player-label').textContent=state.name;
  for(const stat of ['blood','spirit','favor']){$(`#${stat}-number`).textContent=state[stat];$(`#${stat}-bar`).value=state[stat];}
  const index = chapterIndex(state.scene);
  $('#chapter-position').textContent=ending?'本周目完成':`第 ${index+1} / ${mission.chapters.length} 章`;
  $('#chapter-dots').replaceChildren(...mission.chapters.map((_,i)=>node('span',i<index?'passed':i===index?'active':'')));
  const [chapter,title]=scene.title.split(' · ');
  $('#chapter-label').textContent=ending?'旅程终点 · 结局档案':chapter;
  $('#scene-title').textContent=title||scene.title;
  $('#ending-marker').hidden=!ending;
  renderChapterIllustration();
  $('#story-text').replaceChildren(...sceneText(state).split('\n\n').map(p=>node('p','',p)));
  if (state.scene === 'south_register') {
    const reply = getCafeteriaReply();
    if (reply) $('#story-text').append(node('p','south-cafeteria-callback',SOUTH_CAFE_CALLBACK[reply.answer]));
  }
  const last=state.history?.at(-1);
  $('#last-action').hidden=!last;
  if(last){$('#last-result').textContent=last.result;$('#stat-changes').textContent=recentChanges;$('#stat-changes').hidden=!recentChanges;}
  $('#choices').replaceChildren();
  const completed=completedMissions(unlocked());
  scene.choices.forEach((choice,index)=>{
    const reason=lockReason(state,choice,completed);
    const b=button('',()=>select(index),'choice');
    b.append(node('span','choice-index',String.fromCharCode(65+index)));
    const label=node('span','choice-text',choice.text); if(reason) label.append(node('small','',reason));
    b.append(label); b.disabled=!!reason;
    $('#choices').append(b);
  });
  $('#ending-actions').hidden=!ending;
  $('#ending-cafeteria').hidden=!(ending&&state.mission===defaultMission);
  $('#chapter-bottom').textContent=ending?'结局已记入你的档案。每个选择都有它的分量。':'选择之后，故事会继续。';
  if(!storageOkay) $('#chapter-bottom').textContent='浏览器未能保存进度，请使用“存档 / 读档”中的导出功能。';
  if(focus){window.scrollTo({top:0,behavior:'instant'});$('#scene-title').focus({preventScroll:true});}
}

function illustrationFor(scene, onError) {
  const img = document.createElement('img');
  img.alt = SCENE_ART_ALT[scene];
  img.width = 720;
  img.height = 405;
  img.decoding = 'async';
  img.fetchPriority = 'low';
  img.addEventListener('error',onError,{once:true});
  img.src = sceneArtSource(scene);
  return img;
}

function renderChapterIllustration() {
  const art = $('#chapter-illustration');
  const toggle = $('#toggle-art');
  const scene = state?.scene;
  const hasArt = Object.hasOwn(SCENE_ART_ALT,scene);
  toggle.hidden = !hasArt;
  toggle.setAttribute('aria-pressed',String(showIllustrations));
  toggle.lastElementChild.textContent = showIllustrations ? '开' : '关';
  toggle.title = showIllustrations ? '隐藏章节插图' : '显示章节插图';
  if (!hasArt || !showIllustrations) {
    art.replaceChildren();
    art.hidden = true;
    return;
  }
  if (art.firstElementChild?.dataset.scene === scene) return;
  const img = illustrationFor(scene,()=>{
    if (art.firstElementChild === img) art.hidden = true;
  });
  img.dataset.scene = scene;
  art.replaceChildren(img);
  art.hidden = false;
}
function select(index) {
  if(busy)return; busy=true;
  try {
    const before=state;
    state=choose(state,index,completedMissions(unlocked()));
    recentChanges=[['blood','血统'],['spirit','精神'],['favor','好感']].map(([key,label])=>{
      const d=state[key]-before[key];return d?`${label} ${d>0?'+':''}${d}`:'';
    }).filter(Boolean).join('  ·  ');
    autosave();markEnding();render();
  } catch(error){toast(error.message,true);}
  // 避免快速双击误选下一场景中的相同位置。
  setTimeout(()=>busy=false,350);
}
function loadSaved(key,mission) {
  const saved=getSaved(key,mission);
  if(!saved||saved.invalid){toast('这个存档无法读取，当前进度未改变。',true);return;}
  const action=()=>{activate(saved.state);toast('已回到保存的那一刻。');};
  if(getSaved('auto',mission)) confirmAction('读取这份存档？',`「${missions[mission].title}」的自动续玩进度将回到这一刻。`,action,showSaves);
  else {closeModal();action();}
}
function showSaves() {
  const mission=selectedMission;
  const body=openModal('留住这一刻');
  const currentState=state?.mission===mission?state:null;
  body.append(node('p','',`「${missions[mission].title}」的存档。每项任务各有自己的自动续玩和三个手动存档位，换设备前可以导出 JSON 备份。`));
  for(const [key,label] of [['auto','自动续玩'],['slot1','手动存档一'],['slot2','手动存档二'],['slot3','手动存档三']]) {
    const saved=getSaved(key,mission), row=node('div','slot'), info=node('div','slot-info');
    info.append(node('h3','',label));
    info.append(node('p',!saved?'slot-empty':'',!saved?'尚未保存':saved.invalid?'存档损坏，可用当前进度覆盖':`${saved.state.name} · ${SCENES[saved.state.scene].title}\n${saved.date}`));
    const actions=node('div','slot-buttons');
    if(key!=='auto'){
      const save=button('保存',()=>{
        const commit=()=>{if(write(saveKey(mission,key),JSON.stringify(pack(currentState))))toast('这一刻已保存。');else toast('保存失败，请导出 JSON 备份。',true);showSaves();};
        if(saved)confirmAction('覆盖这份手动存档？','这个位置原有的进度会被当前进度替换。',commit,showSaves);else commit();
      });
      save.disabled=!currentState;actions.append(save);
    }
    const load=button('读取',()=>loadSaved(key,mission));load.disabled=!saved||saved.invalid;actions.append(load);
    row.append(info,actions);body.append(row);
  }
  const actions=node('div','modal-actions');
  const exp=button('导出当前进度',exportSave);exp.disabled=!currentState;
  actions.append(exp,button('导入 JSON 存档',()=>$('#import-file').click()));body.append(actions);
  body.append(node('p','micro','支持本网页版及同一故事的 C++ 版存档。导入前会检查内容。'));
  if(!storageOkay)body.append(node('p','','当前浏览器不允许保存数据；仍可继续游戏，并使用导出功能保留进度。'));
}
function exportSave() {
  if(!state)return;
  try {
    const url=URL.createObjectURL(new Blob([JSON.stringify(pack(state),null,2)],{type:'application/json;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download=`卡塞尔见习录_${missions[state.mission].title}_存档.json`;document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
    toast('已发起导出；若没有下载提示，请在系统浏览器中重试。');
  } catch {toast('无法导出，请在系统浏览器中重试。',true);}
}
$('#import-file').addEventListener('change',async event=>{
  const file=event.target.files[0];event.target.value='';if(!file)return;
  try{
    if(file.size>65536)throw new Error('存档文件过大');
    const loaded=unpack(await file.text());
    confirmAction('导入这段旅程？',`${loaded.name} · ${SCENES[loaded.scene].title}。导入将恢复「${missions[loaded.mission].title}」的自动续玩进度。`,()=>{activate(loaded);toast('存档已导入。');},showSaves);
  }catch(error){toast(`导入失败：${error.message}。当前进度未改变。`,true);}
});
function showCollection() {
  const found=new Set(unlocked());const body=openModal(`结局档案 · ${found.size} / ${endings.length}`);
  body.append(node('p','','有些故事属于你，有些还在下一场雨里。未到达的结局不会提前揭晓。'));
  for(const mission of Object.values(missions)) {
    const count=mission.endings.filter(id=>found.has(id)).length;
    body.append(node('h3','archive-group-title',`${mission.title} · ${count} / ${mission.endings.length}`));
    for(const id of mission.endings) {
      const known=found.has(id),row=node('div',`archive-item${known?'':' locked'}`),info=node('div');
      row.append(node('span','archive-symbol',known?'✦':'?'));
      info.append(node('h3','',known?SCENES[id].title.split(' · ')[1]:'尚未抵达'));
      row.append(info);body.append(row);
    }
  }
}

function showMissions() {
  const body=openModal('选择任务');
  body.append(node('p','','四项任务都可以直接开始，各自保存进度。部分选择会回应你在另一项任务里遇见的人。'));
  for (const [id,mission] of Object.entries(missions)) {
    const saved=getSaved('auto',id);
    const row=node('section','mission-row');
    row.dataset.mission=id;
    const top=node('div','mission-row-top');
    const pick=button(id===selectedMission?'查看任务':'选择任务',()=>{
      selectedMission=id;
      write('selected-mission',id);
      closeModal();
      showHome();
      $('#missions-home').focus({preventScroll:true});
    },'secondary mission-pick');
    pick.setAttribute('aria-label',`选择${mission.title}`);
    top.append(node('h3','',mission.title),pick);
    const progress=saved&&!saved.invalid
      ? (SCENES[saved.state.scene].ending?'已有通关存档':`可续玩 · 第 ${chapterIndex(saved.state.scene)+1} 章`)
      : '尚未开始';
    row.append(top,node('p','',mission.description),node('p','mission-status',`${mission.chapters.length} 章 · ${mission.endings.length} 个结局 · ${progress}`));
    body.append(row);
  }
}

function pumpMemoryFrom(pumpState) {
  const flags = pumpState.flags;
  let route = 'unknown';
  if (flags.includes('used_blood')) route = 'blood';
  else if (flags.includes('team_rescue')) route = 'team';
  else if (flags.includes('rescued')) route = 'tools';
  else if (flags.includes('took_core')) route = 'core';
  else if (flags.includes('retreated')) route = 'retreat';
  return { ending:pumpState.scene, route, name:pumpState.name };
}

function getPumpMemory() {
  if (sessionPumpMemory) return sessionPumpMemory;
  try {
    const memory = JSON.parse(read('pump-memory'));
    if (memory && missions.pump.endings.includes(memory.ending) && Object.hasOwn(CAFETERIA_VARIANTS,memory.route)) return memory;
  } catch { /* An unreadable record does not block recovery from an existing save. */ }
  for (const key of ['auto','slot1','slot2','slot3']) {
    const saved = getSaved(key,defaultMission);
    if (saved?.state && SCENES[saved.state.scene].ending) return pumpMemoryFrom(saved.state);
  }
  const ending = unlocked().find(id=>missions.pump.endings.includes(id));
  return ending ? { ending, route:'unknown', name:'' } : null;
}

function getCafeteriaReply() {
  if (sessionCafeteriaReply) return sessionCafeteriaReply;
  try {
    const record = JSON.parse(read('cafeteria-reply'));
    if (record && missions.pump.endings.includes(record.ending) && Object.hasOwn(CAFETERIA_VARIANTS,record.route) && Object.hasOwn(SOUTH_CAFE_CALLBACK,record.answer)) return record;
  } catch { /* No readable reply. */ }
  return null;
}

function showCafeteria(rechoose=false) {
  const body = openModal(CAFETERIA_TITLE);
  const memory = getPumpMemory();
  if (!memory) {
    body.append(node('p','cafeteria-locked','等旧泵站见习告一段落，林舟会在食堂等你。任意一个结局都能开启这段对话。'));
    return;
  }
  const reading = node('div','reading-sheet cafeteria-reading');
  if (showIllustrations && Object.hasOwn(SCENE_ART_ALT,'cafeteria')) {
    const art = node('figure','chapter-illustration');
    art.setAttribute('aria-hidden','true');
    art.append(illustrationFor('cafeteria',()=>{art.hidden=true;}));
    reading.append(art);
  }
  const scene = CAFETERIA_VARIANTS[memory.route];
  reading.append(...CAFETERIA_OPENING.map(text=>node('p','',text)),node('p','cafeteria-prompt',scene.prompt));
  body.append(reading);
  const record = getCafeteriaReply();
  if (!rechoose && record?.route === memory.route && record.ending === memory.ending && record.name === memory.name) {
    const response = scene.replies[record.answer];
    const result = node('div','cafeteria-result');
    result.append(node('p','cafeteria-said',response.label),...response.paragraphs.map(text=>node('p','',text)));
    body.append(result);
    const actions = node('div','modal-actions');
    actions.append(button('换一种回答',()=>showCafeteria(true)),button('去南楼',()=>{
      if (typeof memory.name === 'string' && memory.name) $('#player-name').value=memory.name;
      selectedMission='south';
      write('selected-mission',selectedMission);
      closeModal();
      showHome();
      $('#start-mission').focus({preventScroll:true});
    },'primary'));
    body.append(actions);
    return;
  }
  const choices = node('div','coda-options');
  for (const [id,response] of Object.entries(scene.replies)) {
    const choice = button(response.label,()=>{
      sessionCafeteriaReply = {...memory,answer:id};
      const saved = write('cafeteria-reply',JSON.stringify(sessionCafeteriaReply));
      if (state?.scene === 'south_register' && !$('#game').hidden) render(false);
      showCafeteria();
      if (!saved) $('#modal-body').append(node('p','cafeteria-locked','浏览器未能保存这段对话，本次打开期间仍会记得你的回答。'));
    },'secondary coda-choice cafeteria-reply');
    choice.dataset.reply=id;
    choices.append(choice);
  }
  body.append(choices);
}

function showCompanions() {
  const completed=completedMissions(unlocked());
  const body=openModal('同伴通讯');
  body.append(node('p','','林舟、沈栀和程野曾在北门一起值班。走完相关的两项任务，就能听到他们各自记得的版本。'));
  for (const pair of COMPANION_PAIRS) {
    const row=node('section','companion-row');
    if (pair.missions.every(id=>completed.has(id))) {
      const details=node('details');
      details.append(node('summary','',pair.title),...pair.paragraphs.map(text=>node('p','',text)));
      row.append(details);
    } else {
      row.append(node('h3','',pair.title),node('p','',pair.hint));
    }
    body.append(row);
  }
  const coda=node('div','companion-coda');
  const open=button('阅读番外 · 北门还有灯',()=>showCompanionCoda(),'primary');
  open.id='companion-coda';
  open.disabled=!['pump','south','snow'].every(id=>completed.has(id));
  coda.append(open);
  if (open.disabled) coda.append(node('p','micro','旧泵站、南楼和风雪观测站各抵达一个结局后可读。'));
  body.append(coda);
}

function showCompanionCoda(chosen=null) {
  const completed=completedMissions(unlocked());
  if (!['pump','south','snow'].every(id=>completed.has(id))) return;
  const body=openModal(chosen?'番外 · 下次值班':COMPANION_CODA.title);
  const paragraphs=chosen?chosen.result:COMPANION_CODA.paragraphs;
  body.append(...paragraphs.map(text=>node('p','',text)));
  if (chosen) {
    body.append(button('重读番外',()=>showCompanionCoda()));
  } else {
    const choices=node('div','coda-options');
    choices.append(...COMPANION_CODA.choices.map(choice=>button(choice.text,()=>showCompanionCoda(choice),'secondary coda-choice')));
    body.append(choices);
  }
  const actions=node('div','modal-actions');
  actions.append(button('返回同伴通讯',showCompanions));
  body.append(actions);
}
function showJournal() {
  const body=openModal('一路走来');
  if(!state?.history?.length){body.append(node('p','','还没有行动记录。从 C++ 版导入的存档会从导入后的选择开始记录。'));return;}
  state.history.forEach(h=>{const entry=node('div','journal-item');entry.append(node('h3','',SCENES[h.scene].title),node('p','',h.choice),node('p','',h.result));body.append(entry);});
}
function showRules() {
  const body=openModal('入学须知');
  for(const [title,text] of [['血统值','与龙类力量的共鸣程度。它能帮你做到一些事，过高也可能带来失控。'],['精神值','保持清醒、抵抗侵蚀的能力。某些行动需要足够的精神值。'],['好感度','当前任务的同伴对你的信任。你做过什么，和你们之间的关系一样重要。']]){
    const p=node('p','help-stat');p.append(node('strong','',title),document.createElement('br'),document.createTextNode(text));body.append(p);
  }
  body.append(node('p','','属性范围为 0～100。点击选项推动剧情；每次选择后自动保存，也可以在“存档 / 读档”中手动保存、回到之前的章节。'));
  body.append(node('p','','这是《龙族》世界观下的非官方同人文字游戏。「切换任务」可以挑任意一项。每项任务从初始属性开始，完成任务后有些跨任务选项和同伴往事会开放。'));
  body.append(node('p','','姓名、进度和结局收集只存放在当前浏览器。清理数据或更换浏览器后不会自动同步，请用 JSON 导出、导入迁移进度。'));
}
async function share() {
  const address=new URL(location.protocol==='file:'?'https://cassell-rain-night.deed.page/':location.origin+location.pathname);
  if(selectedMission!==defaultMission)address.searchParams.set('mission',selectedMission);
  const url=address.href;
  const playing=!$('#game').hidden;
  const text=playing&&state&&SCENES[state.scene].ending?`我在《卡塞尔见习录》的「${missions[state.mission].title}」完成了一次任务。换你来，你会怎么选？`:`来玩《卡塞尔见习录》的「${missions[selectedMission].title}」。${missions[selectedMission].description}`;
  if(navigator.share){try{await navigator.share({title:'卡塞尔见习录 · 文字冒险',text,url});return;}catch(error){if(error.name==='AbortError')return;}}
  const body=openModal('把雨夜分享给朋友');body.append(node('p','',text),node('p','','复制下面的网址发给朋友。在微信中，也可以使用右上角菜单分享；具体显示方式以微信为准。'));
  const link=node('input','share-url');link.value=url;link.readOnly=true;link.setAttribute('aria-label','游戏分享链接');link.addEventListener('click',()=>link.select());body.append(link);
  const actions=node('div','modal-actions');actions.append(button('复制链接',async()=>{
    try{await navigator.clipboard.writeText(url);toast('链接已复制。');}catch{link.focus();link.select();toast('请长按或使用 Ctrl+C 复制选中的链接。');}
  },'primary'));body.append(actions);
}
$('#start-form').addEventListener('submit',event=>{event.preventDefault();start();});
$('#continue').addEventListener('click',()=>{const saved=getSaved('auto');if(saved&&!saved.invalid)activate(saved.state);else toast('没有可继续的存档。',true);});
$('#home').addEventListener('click',showHome);
$('#restart').addEventListener('click',()=>{showHome();$('#player-name').value=state.name;$('#player-name').focus();});
for(const id of ['landing-saves','save-menu'])$('#'+id).addEventListener('click',showSaves);
$('#rules').addEventListener('click',showRules);
for(const id of ['missions-home','missions-game','ending-missions'])$('#'+id).addEventListener('click',showMissions);
for(const id of ['companions','ending-companions'])$('#'+id).addEventListener('click',showCompanions);
for(const id of ['cafeteria-home','ending-cafeteria'])$('#'+id).addEventListener('click',()=>showCafeteria());
$('#toggle-art').addEventListener('click',()=>{
  showIllustrations = !showIllustrations;
  write('chapter-illustrations',showIllustrations?'show':'hide');
  renderChapterIllustration();
});
for(const id of ['share-home','share-ending','share-game'])$('#'+id).addEventListener('click',share);
$('#collection').addEventListener('click',showCollection);
$('#journal').addEventListener('click',showJournal);
const requestedMission=new URLSearchParams(location.search).get('mission');
const lastMission=read('selected-mission');
showIllustrations=read('chapter-illustrations')!=='hide';
selectedMission=[requestedMission,lastMission].find(id=>id&&Object.hasOwn(missions,id))||defaultMission;
updateContinue();
