export const places = {
  square: { name: '喷泉广场', pin: [447,320], role: '碰面与休息' },
  garden: { name: '野花温室', pin: [430,195], role: '观察植物' },
  bakery: { name: '云朵面包房', pin: [225,240], role: '喝茶与休息' },
  library: { name: '雨伞图书屋', pin: [665,231], role: '查星图与休息' },
  bench: { name: '河畔长椅', pin: [765,393], role: '听水与休息' },
  deck: { name: '星星观景台', pin: [345,514], role: '看星星' }
};

export const paths = {
  square: ['garden', 'bakery', 'library', 'bench'],
  garden: ['square', 'library'],
  bakery: ['square'],
  library: ['garden', 'square', 'bench'],
  bench: ['square', 'library', 'deck'],
  deck: ['bench']
};

export const profiles = {
  ran: {
    name: '小然', temperament: '好奇、慢热', values: ['自由探索', '答应的事要记得'],
    interests: ['星空', '自然'], voice: '喜欢问具体的问题，话短，熟悉之后偶尔开玩笑',
    story: '搬进小镇后，一直想知道河对岸能看到哪些星星。',
    wish: '画一张能带别人一起认星星的地图。',
    look: { hair: 'buns', hairColor: 'blue', skin: 'pearl', shirt: 'teal', expression: 'gentle', outfit: 'sailor', accessory: 'flower' }
  },
  nuomi: {
    name: '糯米', temperament: '亲切、仔细', values: ['照顾朋友', '慢慢熟悉新地方'],
    interests: ['花草', '做点心'], voice: '会主动打招呼，喜欢从手边的小事聊起，语气温和',
    story: '常在温室认花，喜欢把当天看到的东西画在纸袋上。',
    wish: '画完一本小镇野花图鉴。',
    look: { hair: 'bob', hairColor: 'orange', skin: 'peach', shirt: 'rose', expression: 'happy', outfit: 'overalls', accessory: 'glasses' }
  }
};

export const colors = {
  hairColor: { blue: { color: '#6d9bb5' }, orange: { color: '#ca8e57' } },
  shirt: { teal: { color: '#7da3a5' }, rose: { color: '#d89389' } },
  skin: { pearl: { color: '#f8dac1' }, peach: { color: '#f1caa5' } }
};

export const actions = {
  chart: { label: '给星图补上一笔', place: 'deck', memory: '在观景台的星图上画下三颗连成弧线的星。', evidence: '在观景台描过星星' },
  read: { label: '去翻一页星图', place: 'library', memory: '在图书屋找到一张标着河湾方向的星图。', evidence: '在图书屋找到了河湾星图' },
  flowers: { label: '描下一株野花', place: 'garden', memory: '在温室给一株新开的铃兰画了叶子和花瓣。', evidence: '在温室画过铃兰' },
  bake: { label: '试做一份花形饼干', place: 'bakery', memory: '在面包房试着把饼干压成铃兰的形状。', evidence: '在面包房做过铃兰饼干' }
};
