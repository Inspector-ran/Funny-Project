import { BASE_SCENES } from './story.js';
import { CAMPUS_SCENES } from './campus-story.js';
import { PUMP_SCENES } from './pump-story.js';

// 同一行的场景是同一章的不同路线。存档用场景 ID，显示用章号。
export const PUMP_MISSION_CHAPTERS = [
  ['arrival'], ['interview'], ['dorm'], ['briefing'], ['archives', 'workshop', 'infirmary'],
  ['letters'], ['station'], ['approach_team', 'approach_alone', 'approach_backup'],
  ['passage_team', 'passage_alone', 'passage_backup'], ['signal'], ['containment'],
  ['collapse'], ['triage'], ['followup'], ['aftermath'],
];

function extendChapter(id, chapter, destinations) {
  const scene = BASE_SCENES[id];
  return {
    ...scene,
    title: `${chapter} · ${scene.title.split(' · ')[1]}`,
    choices: scene.choices.map((option, i) => ({ ...option, next: destinations[i] ?? option.next })),
  };
}

function extendedChoice(text, next, {blood=0, spirit=0, favor=0, flags=[], result='', requiredAny=[], requiredReason=''} = {}) {
  return {text, next, blood, spirit, favor, flags, result, requiredSpirit:0, requiredFlag:'', requiredAny, requiredReason};
}

const triage = {
  title: '第十三章 · 急救车的灯',
  text: '',
  ending: false,
  choices: [
    extendedChoice('和救援员复述撤离路线，把最后见到林舟的位置标出来。', 'followup', {
      spirit: 3, favor: 6, flags: ['marked_rescue'],
      result: '你沿着图纸指了三遍，在控制台旁画了一个圈。救援员把方位重复给你听，直到你点头。',
    }),
    extendedChoice('趁通讯器还有电，导出频道里的原始录音。', 'followup', {
      spirit: -5, flags: ['kept_recording'],
      result: '导出进度停在九十七。你等了几秒，听见旁边有人数呼吸。九十八、九十九，文件终于存下来了。',
    }),
    extendedChoice('让护士检查自己，告诉她你还有一点耳鸣。', 'followup', {
      spirit: 8, flags: ['checked_by_nurse'],
      result: '护士让你先喝两口热水。等你的手不再抖，她才问，你听见的是响声还是人声。',
    }),
  ],
};

const followup = {
  title: '第十四章 · 两份记录',
  text: '',
  ending: false,
  choices: [
    extendedChoice('用调查带回的线索对照泵站记录，把时间差写进附件。', 'aftermath', {
      spirit: -4, flags: ['compared_record'],
      requiredAny: ['read_maintenance', 'spare_radio', 'echo_protocol', 'mapped_passage', 'found_trace', 'dispatch_record'],
      requiredReason: '需要在校园或泵站取得一条能核对的线索',
      result: '两个时间对上以后，有一段声音提前了十一秒。你给那十一秒另起一行，没有替它写解释。',
    }),
    extendedChoice('申请等林舟能说话，让他自己决定哪些事写进报告。', 'aftermath', {
      favor: 8, flags: ['requested_statement'],
      result: '诺玛在表格里留了一栏“待补”。你上次看见这种留白，还是入学登记时紧急联系人的那一格。',
    }),
    extendedChoice('把记不清的地方标成不确定，先去门外坐几分钟。', 'aftermath', {
      spirit: 6, flags: ['marked_uncertain'],
      result: '门外的长椅正对着一扇窗。你看了很久，等到玻璃上映出自己的脸，而不是身后的走廊。',
    }),
  ],
};

const recordingEnding = {
  title: '结局 · 多出来的十一秒',
  text: '一周后，诺玛发来比对结果。附件里那段声音来自十年前的值班录音。说话的人叫陈栩，毕业后一直在沿海工作，去年寄给学院的校友通讯还夹着一张全家福。\n\n'
    + '只有十一秒对不上。档案里的陈栩说“收到”，泵站里的那个人说“回来”。两句话之后，都有一声把杯子搁在桌上的响动。\n\n'
    + '你把结果念给林舟听。他没说这就解释清楚了，只问你，能不能从头再放一遍。\n\n'
    + '第二遍结束时，窗外刚好有学生打着伞走过。林舟把纸杯往桌边挪了挪，把录音里的那十一秒抄进了笔记本。',
  ending: true,
  choices: [],
};

export const PUMP_MISSION_SCENES = {
  ...BASE_SCENES,
  ...CAMPUS_SCENES,
  ...PUMP_SCENES,
  dorm: extendChapter('dorm', '第三章', ['briefing', 'briefing', 'briefing']),
  station: extendChapter('station', '第七章', ['approach_team', 'approach_alone', 'approach_backup']),
  signal: extendChapter('signal', '第十章', ['containment', 'containment', 'containment']),
  collapse: extendChapter('collapse', '第十二章', ['triage', 'triage', 'triage', 'triage', 'triage']),
  triage,
  followup,
  aftermath: extendChapter('aftermath', '第十五章', []),
  ending_recording: recordingEnding,
};

export function extendedText(s) {
  if (s.scene === 'triage') {
    const opening = s.flags.includes('rescued')
      ? '备用楼梯外，林舟抓着你的袖口，直到医护人员来接手。他让你把夹在背包外袋里的学生证取出来。卡角磕掉了一块，照片还在。'
      : '你站在湖堤上，听救援队在频道里核对控制台的位置。红色灯光从车顶扫过湿草，隔一会儿才扫回来。你盯着楼梯口，等有人出来。';
    return opening
      + '\n\n救援车旁支着一张折叠桌。桌上放着示意图、医用胶带和三个被雨打湿的纸杯。有人拿笔问你，水是先从墙里出来，还是先漫过鞋底的。'
      + '\n\n你的通讯器又响了一次。现在没有人在说话，只有开机以来的录音指示灯在闪。'
      + '\n\n护士朝你招手，救援员也在等你开口。你把通讯器攥在手里，才发现手心里全是湖水。';
  }
  if (s.scene === 'followup') {
    const record = s.flags.includes('kept_recording')
      ? '你留下的录音能听见楼梯上的脚步。第三个脚步停了一拍。那之后，你的名字被叫了一次。'
      : '诺玛从机房恢复了半段接收记录。底噪很重，中间有一小截听得出是人声。';
    return '天还没有亮，值班员把应急车的后排让给了你。前排挂着一张超市优惠券，下周二过期。你第一次有余力想到下周。'
      + '\n\n'+record+'\n\n学院的初稿把报警时间写成三点十七。你记得自己在到场前就见过这个时间，出现在故障记录上，精确到分。'
      + '\n\n林舟的状态栏很久没更新。下一个提示响起来时，你摸错了口袋，先掏出来的是那张还没用掉的夜宵券。'
      + '\n\n值班员问，要不要把手头这份材料附在你自己的报告里。';
  }
  return null;
}
