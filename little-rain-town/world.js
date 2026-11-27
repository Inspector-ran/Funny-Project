(() => {
  const W = 900;
  const H = 540;
  const outline = '#697650';

  function ellipse(ctx, x, y, rx, ry, color, stroke, width = 2) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke();
    }
  }

  function round(ctx, x, y, w, h, r, color, stroke, width = 2) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = color;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke();
    }
  }

  function polygon(ctx, points, fill, stroke, width = 2) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke();
    }
  }

  function path(ctx, draw, color, width) {
    ctx.beginPath();
    draw(ctx);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  function line(ctx, points, stroke, width = 2) {
    path(ctx, c => points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)), stroke, width);
  }

  function seeded(seed) {
    let number = seed;
    return () => {
      number = (number * 48271) % 2147483647;
      return number / 2147483647;
    };
  }

  function tree(ctx, x, y, s = 1, autumn = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ellipse(ctx, 8, 1, 31, 11, '#64774735');
    round(ctx, -6, -42, 13, 44, 5, '#b69064', '#7d7953');
    line(ctx, [[1, -4], [1, -23], [10, -34]], '#82734f', 1.7);
    const colors = autumn ? ['#e3ab64', '#efbe76', '#f9ce85'] : ['#779c60', '#8bad68', '#a2bd72'];
    ellipse(ctx, 0, -49, 34, 24, colors[0], outline);
    ellipse(ctx, -6, -63, 26, 23, colors[1], outline);
    ellipse(ctx, 15, -57, 22, 22, colors[1], outline);
    ellipse(ctx, -11, -65, 20, 16, colors[2]);
    path(ctx, c => { c.moveTo(-22, -54); c.quadraticCurveTo(-20, -65, -9, -69); }, '#faeeb665', 2);
    ellipse(ctx, 17, -67, 4, 2, '#fff4c755');
    ctx.restore();
  }

  function bush(ctx, x, y, size, petals = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    ellipse(ctx, 3, 3, 25, 7, '#64774730');
    ellipse(ctx, -11, -7, 12, 9, '#779960', outline, 1);
    ellipse(ctx, 11, -7, 12, 9, '#88a763', outline, 1);
    ellipse(ctx, 1, -11, 14, 11, '#91b068', outline, 1);
    if (petals) {
      for (const [a, b] of [[-8, -9], [1, -14], [10, -6]]) ellipse(ctx, a, b, 2.6, 2.3, '#f9d9cf');
    }
    ctx.restore();
  }

  function flower(ctx, x, y, color, size = 1) {
    line(ctx, [[x, y + 3 * size], [x, y - 3 * size]], '#78914c', 1);
    for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) {
      ellipse(ctx, x + dx * size, y + dy * size - size, 1.75 * size, 1.75 * size, color);
    }
    ellipse(ctx, x, y - size, size, size, '#e3ad5c');
  }

  function cottage(ctx, x, y, type) {
    const bakery = type === 'bread';
    const accent = bakery ? '#bf7358' : '#678e89';
    const light = bakery ? '#dd9376' : '#85aaa1';
    ctx.save();
    ctx.translate(x, y);
    ellipse(ctx, 7, 7, 92, 19, '#6a764b43');
    polygon(ctx, [[58,-50],[80,-62],[80,-2],[58,7]], bakery ? '#dec99f' : '#d9caa0', '#8b805b');
    round(ctx, -65, -70, 126, 77, 6, bakery ? '#f9e6bc' : '#f6efd1', '#8b805b');
    for (let ix = -59; ix < 53; ix += 15) line(ctx, [[ix,-53],[ix,-1]], '#ae986329', 1);
    round(ctx, 31, -119, 14, 39, 3, bakery ? '#d69a77' : '#ccac87', '#816f55');
    round(ctx, 28, -120, 20, 6, 2, bakery ? '#eeb092' : '#e7c4a0', '#816f55');
    polygon(ctx, [[-80,-58],[-43,-106],[37,-106],[78,-66],[62,-51]], light, '#7b7056', 2.6);
    polygon(ctx, [[-82,-57],[-45,-101],[37,-101],[70,-55],[63,-51],[-77,-51]], accent, '#7b7056', 2.4);
    for (let iy = -87; iy < -57; iy += 9) {
      const inset = (-57 - iy) * .78;
      line(ctx, [[-77 + inset, iy],[66 - inset, iy]], bakery ? '#9f624968' : '#4d706c76', 1.45);
    }
    line(ctx, [[-72,-61],[-43,-96],[32,-96]], '#ffeed880', 2);
    round(ctx, -21, -79, 41, 24, 8, '#f7e4af', '#8b7752');
    if (bakery) {
      ellipse(ctx, 0, -67, 11, 5, '#c78b4e', '#956238', 1);
      line(ctx, [[-5,-70],[-3,-65]], '#fbe1a8', 1.2);
      line(ctx, [[0,-71],[2,-65]], '#fbe1a8', 1.2);
      line(ctx, [[5,-70],[7,-66]], '#fbe1a8', 1.2);
    } else {
      polygon(ctx, [[-10,-71],[-1,-69],[8,-71],[8,-63],[-1,-61],[-10,-63]], '#87a59e', '#657d67', 1);
      line(ctx, [[-1,-69],[-1,-62]], '#657d67', 1);
    }
    round(ctx, 12, -42, 29, 49, 8, bakery ? '#a17355' : '#73978a', '#877455');
    round(ctx, 18, -37, 17, 21, 6, '#c0d7c2', '#756f56', 1.5);
    line(ctx, [[26,-36],[26,-17]], '#f8f0cb', 1.5);
    ellipse(ctx, 34, -11, 2.6, 2.6, '#f0d18d');
    round(ctx, -50, -41, 46, 30, 4, '#bbd5b9', '#877455');
    line(ctx, [[-28,-40],[-28,-12]], '#f6efca', 2.5);
    line(ctx, [[-49,-25],[-5,-25]], '#f6efca', 2.5);
    round(ctx, -53, -13, 52, 5, 2, '#b08f66', '#897855', 1);
    if (bakery) {
      for (let i = 0; i < 6; i++) round(ctx, -54 + i * 8.8, -45, 9, 9, 2, i % 2 ? '#f4e5bc' : '#d58c6c');
    } else {
      round(ctx, -47, -3, 38, 6, 2, '#ae905f', '#897855', 1);
      for (let i = 0; i < 5; i++) flower(ctx, -43 + i * 7.5, -6, '#e7b6bf', .8);
    }
    round(ctx, 5, 6, 43, 5, 2, '#baa980', '#8d8260', 1.4);
    round(ctx, 1, 11, 51, 5, 2, '#d4c199', '#8d8260', 1.2);
    ctx.restore();
  }

  function fountain(ctx, x, y) {
    ellipse(ctx, x + 5, y + 12, 59, 17, '#7f785442');
    ellipse(ctx, x, y + 8, 53, 23, '#c7b98f', '#8a8662');
    ellipse(ctx, x, y + 2, 52, 22, '#e8dbad', '#8a8662');
    ellipse(ctx, x, y, 43, 15, '#8bbdb2', '#7b9d86', 1.5);
    ellipse(ctx, x, y, 21, 6, '#add1bd');
    round(ctx, x - 5, y - 29, 10, 28, 4, '#eee2bd', '#908564', 1.3);
    ellipse(ctx, x, y - 25, 17, 6, '#dbcfa8', '#908564', 1.6);
    ellipse(ctx, x, y - 27, 13, 3.2, '#a9cdb9');
    for (const sign of [-1, 1]) {
      path(ctx, c => { c.moveTo(x, y - 31); c.quadraticCurveTo(x + sign * 20, y - 52, x + sign * 29, y - 7); }, '#f0f7db', 2);
      ellipse(ctx, x + sign * 30, y - 4, 2, 2, '#f0f7db');
    }
    ellipse(ctx, x, y - 32, 4, 5, '#e7e2b8', '#8e8760', 1);
  }

  function bench(ctx, x, y) {
    ellipse(ctx, x + 2, y + 17, 45, 10, '#6a764b42');
    line(ctx, [[x-26,y+15],[x-26,y-13]], '#7f7555', 4);
    line(ctx, [[x+26,y+15],[x+26,y-13]], '#7f7555', 4);
    round(ctx, x - 33, y - 14, 66, 12, 3, '#b98d63', '#826d50');
    line(ctx, [[x-29,y-8],[x+29,y-8]], '#dfb485', 1.5);
    round(ctx, x - 36, y + 1, 72, 9, 3, '#cf9c6d', '#826d50');
  }

  function map(ctx, weather, hour) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const random = seeded(751);
    const grass = ctx.createLinearGradient(0, 0, W * .3, H);
    grass.addColorStop(0, '#d5de9d');
    grass.addColorStop(.55, '#bed18b');
    grass.addColorStop(1, '#a8c383');
    ctx.fillStyle = grass;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 75; i++) {
      ellipse(ctx, random() * W, random() * H, 10 + random() * 50, 5 + random() * 24, i % 2 ? '#edf0b727' : '#9cbf7528');
    }
    for (let i = 0; i < 650; i++) {
      const x = random() * W;
      const y = random() * H;
      if (i % 7 === 0) flower(ctx, x, y, i % 3 ? '#fff4ca' : '#f2c5bb', .4 + random() * .7);
      else if (i % 3 === 0) line(ctx, [[x-1.5,y-2],[x,y],[x+2,y-3]], '#78975350', 1);
      else ellipse(ctx, x, y, 1 + random() * 2.5, .8, '#f7f0bd55');
    }
    const road = c => {
      c.moveTo(0, 299); c.bezierCurveTo(166, 263, 260, 299, 410, 308);
      c.bezierCurveTo(575, 318, 663, 285, 900, 337);
      c.moveTo(225, 193); c.bezierCurveTo(220, 245, 256, 279, 272, 292);
      c.moveTo(661, 186); c.bezierCurveTo(657, 250, 632, 273, 625, 309);
      c.moveTo(457, 310); c.bezierCurveTo(485, 368, 535, 365, 548, 421);
      c.moveTo(547, 433); c.bezierCurveTo(559, 490, 570, 511, 598, 555);
    };
    path(ctx, road, '#b8b37d', 35);
    path(ctx, road, '#e9d6a1', 30);
    ellipse(ctx, 447, 304, 118, 61, '#b7aa74');
    ellipse(ctx, 447, 302, 114, 57, '#ebd4a0');
    ellipse(ctx, 447, 302, 100, 50, '#eedaab', '#cebc88', 1.5);
    for (let i = 0; i < 29; i++) {
      const angle = i * Math.PI * 2 / 29;
      ellipse(ctx, 447 + Math.cos(angle) * 91, 302 + Math.sin(angle) * 43, 3.4, 1.4, '#c9b887');
    }
    const river = c => {
      c.moveTo(-25, 416);
      c.bezierCurveTo(145, 353, 205, 424, 340, 444);
      c.bezierCurveTo(520, 475, 596, 395, 722, 436);
      c.bezierCurveTo(802, 462, 853, 497, 929, 461);
    };
    path(ctx, river, '#92ad70', 82);
    path(ctx, river, '#d7d3a2', 74);
    path(ctx, river, '#669e9e', 67);
    path(ctx, river, '#8dc4c0', 60);
    path(ctx, river, '#a6d3c6', 47);
    for (let i = 0; i < 43; i++) {
      const t = random();
      const x = t * W;
      const y = (x < 180 ? 397 + 12 * Math.cos(x / 35) : x < 390 ? 395 + (x - 180) * .25 : x < 610 ? 448 - (x - 390) * .1 : x < 750 ? 426 + (x - 610) * .09 : 446 + 29 * Math.sin((x - 750) / 80)) + (random() - .5) * 30;
      path(ctx, c => { c.moveTo(x, y); c.quadraticCurveTo(x + 6, y - 2, x + 13, y); }, '#e2ead181', 1.3);
    }
    ctx.save();
    ctx.translate(548, 431);
    ctx.rotate(-.23);
    round(ctx, -24, -41, 54, 91, 5, '#567a714d');
    round(ctx, -28, -45, 53, 90, 4, '#cba875', '#897554', 2);
    for (let y = -39; y < 43; y += 8) line(ctx, [[-24,y+2],[22,y+2]], '#a7855c', 1.5);
    for (const x of [-25, 23]) {
      line(ctx, [[x,-45],[x,44]], '#8c7250', 4);
      for (const y of [-43,-15,15,43]) round(ctx, x-3, y-4, 6, 8, 1.5, '#dfbd88', '#8c7250', 1.2);
    }
    ctx.restore();
    const trees = [[36,112,1.2],[88,129,1],[142,71,.72],[167,109,1.12],[290,108,.91],[352,105,1.09],[413,128,.91],[483,103,.83],[534,102,1.08],[587,118,.74],[684,94,.83],[740,118,1.08],[801,102,.86],[864,117,1.18],[902,174,1.18],[65,214,.94],[105,233,.7],[782,219,.85],[854,253,1.13],[887,279,.72],[31,359,.88],[83,348,.7],[183,377,.78],[315,376,.73],[652,382,.67],[840,401,.8],[903,416,1.1],[62,527,1.24],[130,504,.83],[210,522,.82],[290,540,1.07],[390,530,.89],[672,532,1.02],[734,535,.85],[805,539,.91],[886,537,.8]];
    trees.forEach(([x,y,s], i) => tree(ctx, x, y, s, i % 7 === 3));
    const bushes = [[119,144],[331,132],[448,148],[580,145],[710,132],[828,139],[140,225],[315,226],[571,220],[731,242],[814,261],[107,340],[208,362],[359,391],[625,380],[760,364],[786,373],[14,455],[170,475],[438,496],[610,493],[702,493]];
    bushes.forEach(([x,y], i) => bush(ctx, x, y, .65 + i % 4 * .1, i % 3 !== 0));
    cottage(ctx, 225, 205, 'bread');
    cottage(ctx, 665, 199, 'books');
    fountain(ctx, 447, 301);
    bench(ctx, 764, 368);
    for (const [x,y] of [[326,163],[342,169],[351,161],[564,167],[579,170],[588,162],[717,367],[793,395],[819,390],[713,504],[750,524]]) {
      flower(ctx,x,y,'#fff4cf',1.4);
    }
    for (const [x,y] of [[127,305],[376,231],[543,237],[831,321],[265,344],[381,372],[634,337]]) {
      line(ctx, [[x,y+10],[x,y-16]], '#8b7955', 3);
      round(ctx, x-4, y-22, 8, 10, 3, '#fae8a8', '#8b7955', 1.4);
    }
    if (weather === 'rain' || hour >= 18 || hour < 7) {
      ctx.fillStyle = weather === 'rain' ? '#50769130' : '#65566e45';
      ctx.fillRect(0, 0, W, H);
    }
    if (weather === 'rain') {
      for (let i = 0; i < 130; i++) {
        const x = random() * W;
        const y = random() * H;
        line(ctx, [[x,y],[x-4,y+10]], '#e7f1e47d', 1);
      }
    }
  }

  function avatar(person, colors) {
    const canvas = document.createElement('canvas');
    canvas.width = 144;
    canvas.height = 144;
    const ctx = canvas.getContext('2d');
    ctx.scale(1.5, 1.5);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const edge = '#584c3e';
    const hair = colors.hairColor[person.hairColor].color;
    const shirt = colors.shirt[person.shirt].color;
    const skin = colors.skin[person.skin].color;
    ellipse(ctx, 49, 89, 28, 5, '#424b2b36');
    if (person.hair === 'long') {
      round(ctx, 21, 19, 56, 58, 18, hair, edge, 2);
    } else if (person.hair === 'buns') {
      ellipse(ctx, 24, 24, 11, 12, hair, edge, 2);
      ellipse(ctx, 72, 24, 11, 12, hair, edge, 2);
    }
    round(ctx, 32, 76, 14, 12, 5, '#7a7568', edge, 1.9);
    round(ctx, 50, 76, 14, 12, 5, '#7a7568', edge, 1.9);
    round(ctx, 27, 65, 11, 15, 5, skin, edge, 1.8);
    round(ctx, 59, 65, 11, 15, 5, skin, edge, 1.8);
    round(ctx, 33, 61, 30, 22, 8, shirt, edge, 2);
    line(ctx, [[36,77],[59,77]], '#fff4da70', 1.6);
    ellipse(ctx, 25, 50, 6.2, 7, skin, edge, 1.9);
    ellipse(ctx, 71, 50, 6.2, 7, skin, edge, 1.9);
    round(ctx, 25, 22, 46, 44, 19, skin, edge, 2);
    ctx.beginPath();
    ctx.moveTo(26, 46);
    ctx.bezierCurveTo(18, 30, 30, 16, 47, 16);
    ctx.bezierCurveTo(67, 15, 78, 29, 70, 45);
    if (person.hair === 'sweep') {
      ctx.quadraticCurveTo(63, 39, 59, 28);
      ctx.quadraticCurveTo(52, 40, 26, 46);
    } else if (person.hair === 'short') {
      ctx.quadraticCurveTo(65, 38, 67, 29);
      ctx.quadraticCurveTo(53, 39, 31, 34);
      ctx.lineTo(26, 46);
    } else {
      ctx.quadraticCurveTo(62, 34, 61, 29);
      ctx.quadraticCurveTo(58, 39, 50, 38);
      ctx.quadraticCurveTo(52, 34, 49, 30);
      ctx.quadraticCurveTo(43, 40, 31, 40);
      ctx.lineTo(26, 46);
    }
    ctx.closePath();
    ctx.fillStyle = hair;
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 2;
    ctx.stroke();
    path(ctx, c => { c.moveTo(33,30); c.quadraticCurveTo(39,23,47,23); }, '#fff8da75', 1.7);
    ellipse(ctx, 39, 49, 2.25, 3.6, '#4f4238');
    ellipse(ctx, 57, 49, 2.25, 3.6, '#4f4238');
    ellipse(ctx, 33.5, 55, 4, 2.1, '#d882736f');
    ellipse(ctx, 62.5, 55, 4, 2.1, '#d882736f');
    path(ctx, c => { c.moveTo(45,55); c.quadraticCurveTo(48,59,51,55); }, edge, 1.4);
    if (person.hair === 'buns' || person.hair === 'long') {
      ellipse(ctx, 63, 36, 2.8, 3, '#ffdc90', '#786549', 1);
    }
    return canvas.toDataURL('image/png');
  }

  window.TownArt = {
    paint(canvas, weather, hour) {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * ratio;
      canvas.height = H * ratio;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      map(ctx, weather, hour);
    },
    avatar
  };
})();
