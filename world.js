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

  function greenhouse(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    const frame = '#667f68';
    ellipse(ctx, 9, 5, 76, 15, '#67784743');
    polygon(ctx, [[48,-50],[65,-60],[65,4],[48,12]], '#a8c8a6', frame);
    round(ctx, -55, -49, 105, 59, 3, '#c8e0c1', frame);
    polygon(ctx, [[-61,-48],[-27,-81],[23,-81],[63,-51],[49,-45]], '#bbd8ba', frame);
    polygon(ctx, [[-61,-48],[-28,-77],[25,-77],[56,-48]], '#dcebc8', frame);
    line(ctx, [[-27,-78],[-42,-48],[-42,8]], frame, 1.8);
    line(ctx, [[20,-77],[35,-49],[35,7]], frame, 1.8);
    line(ctx, [[-9,-76],[-9,-48]], '#fcf7d2', 2);
    line(ctx, [[-53,-28],[49,-28]], '#8dad8c', 2);
    for (const [i, px] of [-47,-30,-13,34,46].entries()) {
      flower(ctx, px, -11, ['#f3c6bd','#f9e08f','#eea5ae'][i % 3], 1.5);
      round(ctx, px-4, -8, 8, 9, 2, '#bb8267', '#ad775a', 1);
    }
    round(ctx, 0, -34, 22, 44, 3, '#9ac0a5', frame);
    round(ctx, 5, -30, 12, 21, 2, '#d7e8c3', '#86a88b', 1.5);
    ellipse(ctx, 17, -2, 2, 2, '#f4d494');
    round(ctx, -4, 8, 30, 6, 2, '#d6c99c', '#8e8965', 1);
    round(ctx, -72, 1, 12, 9, 4, '#80a9ad', '#678789', 1.3);
    line(ctx, [[-61,4],[-56,1],[-54,2]], '#678789', 1.6);
    ctx.restore();
  }

  function postOffice(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    const edge = '#896b54';
    ellipse(ctx, 5, 7, 62, 15, '#67784745');
    round(ctx, -48, -49, 95, 57, 6, '#f8dfb3', edge);
    polygon(ctx, [[-53,-47],[-37,-73],[32,-73],[55,-47]], '#cb8276', edge, 2.4);
    line(ctx, [[-41,-59],[46,-59]], '#a96a64', 1.8);
    line(ctx, [[-34,-68],[30,-68]], '#f7c0a6', 1.8);
    round(ctx, -59, -50, 117, 9, 4, '#d78d7d', edge);
    round(ctx, -39, -35, 34, 24, 3, '#b3cbb3', edge);
    line(ctx, [[-22,-34],[-22,-12]], '#f3e3bd', 1.8);
    ellipse(ctx, -22, -48, 15, 11, '#f6d996', edge, 1.4);
    polygon(ctx, [[-31,-46],[-32,-53],[-26,-50]], '#cb9461', edge, 1.1);
    polygon(ctx, [[-18,-50],[-13,-53],[-14,-46]], '#cb9461', edge, 1.1);
    ellipse(ctx, -22, -47, 8, 6, '#d9a16b', edge, 1.1);
    ellipse(ctx, -25, -47, 1, 1.3, edge);
    ellipse(ctx, -19, -47, 1, 1.3, edge);
    round(ctx, 10, -36, 27, 44, 6, '#9d7e67', edge);
    round(ctx, 14, -31, 19, 18, 3, '#cfdbc0', edge, 1.4);
    line(ctx, [[-62,10],[-62,-17]], '#7b8060', 4);
    round(ctx, -73, -24, 23, 16, 5, '#75a0a0', '#5f8484');
    line(ctx, [[-68,-18],[-56,-18]], '#e0f0d5', 1.8);
    ctx.restore();
  }

  function campsite(ctx, x, y, glowing) {
    ctx.save();
    ctx.translate(x, y);
    ellipse(ctx, 0, 4, 75, 31, '#d4cc93', '#9cac71', 1.7);
    polygon(ctx, [[-61,-1],[-41,-36],[-12,-38],[7,-5],[-26,9]], '#dfaf74', '#957951');
    polygon(ctx, [[-61,-1],[-41,-36],[-26,9]], '#efc987', '#957951');
    polygon(ctx, [[-53,0],[-42,-22],[-34,5]], '#a47e59', '#957951', 1.2);
    polygon(ctx, [[3,-7],[22,-35],[48,-31],[63,2],[32,8]], '#88a995', '#747f5d');
    polygon(ctx, [[3,-7],[22,-35],[32,8]], '#a9bfa4', '#747f5d');
    polygon(ctx, [[13,-4],[21,-20],[25,4]], '#709480', '#747f5d', 1.2);
    round(ctx, 24, 11, 32, 13, 3, '#cf887b', '#9a7561', 1.2);
    line(ctx, [[27,15],[53,15]], '#f8d5a8', 1.5);
    for (const px of [32,39,46]) line(ctx, [[px,12],[px,22]], '#f8d5a8', 1.2);
    for (const [px,py] of [[-17,19],[-8,23],[3,19],[4,12],[-13,12]]) ellipse(ctx, px, py, 5, 3.3, '#9d9070');
    line(ctx, [[-13,18],[1,16]], '#785d46', 4);
    polygon(ctx, [[-9,19],[-14,13],[-10,4],[-7,12],[-3,7],[2,16],[-1,19]], '#eb9d5d', '#a47347', 1.2);
    line(ctx, [[-72,10],[-72,-42]], '#907b57', 2);
    line(ctx, [[67,12],[67,-38]], '#907b57', 2);
    path(ctx, c => { c.moveTo(-72,-42); c.quadraticCurveTo(-4,-16,67,-38); }, '#937d55', 1.4);
    for (const [px,py] of [[-53,-35],[-33,-30],[-12,-28],[10,-27],[33,-30],[54,-34]]) {
      if (glowing) ellipse(ctx, px, py+3, 7, 7, '#efd07245');
      ellipse(ctx, px, py+3, 2.6, 3.9, '#f9dc8c', '#a88c55', 1);
    }
    ctx.restore();
  }

  function starDeck(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ellipse(ctx, 3, 12, 63, 13, '#55684640');
    round(ctx, -57, -20, 112, 32, 10, '#a28c6b', '#7c7656');
    round(ctx, -57, -23, 112, 27, 9, '#c1a27d', '#89775a');
    for (let px = -45; px < 54; px += 12) line(ctx, [[px,-21],[px,2]], '#a88966', 1.3);
    line(ctx, [[-48,-20],[-48,-37],[48,-37],[48,-16]], '#8c8368', 3);
    for (const px of [-35,-14,14,34]) line(ctx, [[px,-36],[px,-24]], '#8c8368', 2.1);
    line(ctx, [[-22,-16],[-5,-39],[12,-16]], '#6b7159', 3.2);
    line(ctx, [[-5,-39],[-4,-19]], '#7d7e65', 2.3);
    ctx.save();
    ctx.translate(-4, -40);
    ctx.rotate(-.42);
    round(ctx, -17, -6, 32, 11, 3, '#7796a8', '#617386', 1.7);
    round(ctx, 9, -9, 9, 16, 3, '#9bbac3', '#617386', 1.7);
    round(ctx, -21, -4, 6, 8, 2, '#817e76', '#68685a', 1.2);
    ctx.restore();
    polygon(ctx, [[22,-14],[30,-16],[36,-13],[44,-14],[46,-4],[36,-2],[30,-5],[23,-4]], '#ece3b8', '#988760', 1.2);
    line(ctx, [[35,-12],[36,-4]], '#b5a77f', 1.2);
    ellipse(ctx, 29, -9, 1, 1, '#818ca3');
    ellipse(ctx, 40, -8, 1, 1, '#818ca3');
    ctx.restore();
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
      c.moveTo(430, 169); c.bezierCurveTo(431, 231, 466, 232, 447, 285);
      c.moveTo(804, 171); c.bezierCurveTo(811, 234, 769, 270, 786, 318);
      c.moveTo(129, 336); c.quadraticCurveTo(120, 302, 146, 285);
      c.moveTo(457, 310); c.bezierCurveTo(485, 368, 535, 365, 548, 421);
      c.moveTo(547, 433); c.bezierCurveTo(559, 490, 570, 511, 598, 555);
      c.moveTo(548, 490); c.bezierCurveTo(505, 497, 460, 522, 347, 500);
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
    greenhouse(ctx, 430, 167);
    postOffice(ctx, 809, 178);
    campsite(ctx, 127, 338, hour >= 18 || weather === 'rain');
    starDeck(ctx, 344, 497);
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

  function outfitDetails(ctx, style, tone, edge) {
    if (style === 'overalls') {
      round(ctx, 36, 69, 24, 13, 4, tone, edge, 1.4);
      for (const x of [38,54]) {
        round(ctx, x, 61, 4, 10, 1.5, tone, edge, 1.2);
        ellipse(ctx, x+2, 70, 1.4, 1.4, '#f7d188');
      }
      path(ctx, c => { c.moveTo(44,74); c.quadraticCurveTo(48,79,52,74); }, '#fff4d7a0', 1.4);
    } else if (style === 'raincoat') {
      line(ctx, [[48,64],[48,82]], '#624f3c', 1.4);
      line(ctx, [[36,67],[42,69],[48,65],[54,69],[60,67]], '#fff2c0', 1.4);
      for (const y of [71,76,80]) ellipse(ctx, 51.5, y, 1, 1, '#fff2c0');
    } else if (style === 'scarf') {
      round(ctx, 34, 63, 30, 7, 3, '#f6c19e', edge, 1.3);
      round(ctx, 53, 66, 7, 13, 2, '#f6c19e', edge, 1.3);
      line(ctx, [[55,76],[58,76]], '#bc795e', 1);
    } else if (style === 'sailor') {
      polygon(ctx, [[36,63],[60,63],[56,70],[48,69],[41,70]], '#fff0c9', edge, 1.4);
      polygon(ctx, [[48,69],[52,76],[45,76]], '#c77d72', edge, 1.2);
    }
  }

  function face(ctx, expression, edge) {
    for (const x of [39,57]) {
      if (expression === 'happy') {
        path(ctx, c => { c.moveTo(x-3,50); c.quadraticCurveTo(x,44.5,x+3,50); }, edge, 1.7);
      } else if (expression === 'sleepy' || (expression === 'cheeky' && x === 57)) {
        path(ctx, c => { c.moveTo(x-3,48); c.quadraticCurveTo(x,51,x+3,48); }, edge, 1.7);
      } else if (expression === 'surprised') {
        ellipse(ctx, x, 48.5, 3, 3.4, edge);
        ellipse(ctx, x-0.8, 47.6, .7, .7, '#ffffe5');
      } else {
        ellipse(ctx, x, 49, 2.25, 3.6, '#4f4238');
      }
    }
    ellipse(ctx, 33.5, 55, 4, 2.1, '#d882736f');
    ellipse(ctx, 62.5, 55, 4, 2.1, '#d882736f');
    if (expression === 'surprised' || expression === 'sleepy') {
      ellipse(ctx, 48, 56, expression === 'surprised' ? 2.7 : 1.8, 2.2, '#8b5648', edge, 1.1);
    } else {
      path(ctx, c => { c.moveTo(44.5,55); c.quadraticCurveTo(48,expression === 'happy' ? 61 : 59,51.5,55); }, edge, 1.4);
    }
  }

  function accessory(ctx, style, edge) {
    if (style === 'glasses') {
      ellipse(ctx, 38.5, 49.5, 7, 6.5, '#fffbe821', '#5e6565', 1.55);
      ellipse(ctx, 57.5, 49.5, 7, 6.5, '#fffbe821', '#5e6565', 1.55);
      path(ctx, c => { c.moveTo(45.6,49); c.quadraticCurveTo(48,46,50.4,49); }, '#5e6565', 1.4);
    } else if (style === 'beret') {
      ellipse(ctx, 46, 18, 24, 9.5, '#a77586', edge, 1.8);
      path(ctx, c => { c.moveTo(25,20); c.quadraticCurveTo(43,24,65,19); }, '#e7adba', 1.6);
      line(ctx, [[47,9],[51,7]], '#7d5869', 2);
    } else if (style === 'ribbon') {
      polygon(ctx, [[59,21],[49,12],[46,24],[59,24],[70,28],[72,15]], '#dd9298', edge, 1.5);
      round(ctx, 56, 19, 8, 7, 2, '#efb6ad', edge, 1.3);
    } else if (style === 'flower') {
      for (const [x,y] of [[59,31],[66,31],[62.5,27.5],[62.5,34.5]]) ellipse(ctx, x, y, 3, 3, '#f8e4b4', '#a87b63', .8);
      ellipse(ctx, 62.5,31, 2.1, 2.1, '#d99e60');
    } else if (style === 'headphones') {
      path(ctx, c => { c.moveTo(23,44); c.bezierCurveTo(19,4,77,4,73,44); }, '#5b6475', 4);
      round(ctx, 18, 42, 10, 16, 4, '#93aecd', '#525d6b', 1.6);
      round(ctx, 69, 42, 10, 16, 4, '#93aecd', '#525d6b', 1.6);
    } else if (style === 'cat') {
      polygon(ctx, [[23,25],[23,7],[38,16],[56,16],[72,8],[72,27]], '#b288ad', edge, 1.8);
      polygon(ctx, [[26,18],[26,11],[34,17]], '#ecc2c8');
      polygon(ctx, [[63,17],[70,11],[70,20]], '#ecc2c8');
      round(ctx, 21, 19, 54, 13, 5, '#bd95b4', edge, 1.8);
      ellipse(ctx, 45, 25, 1.3, 1.3, edge);
      ellipse(ctx, 52, 25, 1.3, 1.3, edge);
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
    } else if (person.hair === 'bob') {
      round(ctx, 20, 19, 57, 40, 13, hair, edge, 2);
    } else if (person.hair === 'pony') {
      ellipse(ctx, 71, 28, 10, 11, '#e8af8f', edge, 1.6);
      ctx.save();
      ctx.translate(77, 43);
      ctx.rotate(-.27);
      ellipse(ctx, 0, 0, 9.5, 22, hair, edge, 2);
      ctx.restore();
    } else if (person.hair === 'braids') {
      for (const side of [-1, 1]) {
        for (let i = 0; i < 4; i++) ellipse(ctx, 48 + side * (24 + i * 1.4), 46+i*7, 6-i*.6, 6.6, hair, edge, 1.6);
        round(ctx, 48 + side * 28 - 4, 65, 8, 4, 1.5, '#db9e8c', edge, 1.1);
      }
    }
    round(ctx, 32, 76, 14, 12, 5, '#7a7568', edge, 1.9);
    round(ctx, 50, 76, 14, 12, 5, '#7a7568', edge, 1.9);
    round(ctx, 27, 65, 11, 15, 5, skin, edge, 1.8);
    round(ctx, 59, 65, 11, 15, 5, skin, edge, 1.8);
    round(ctx, 33, 61, 30, 22, 8, person.outfit === 'overalls' ? '#f1e0bc' : shirt, edge, 2);
    line(ctx, [[36,77],[59,77]], '#fff4da70', 1.6);
    outfitDetails(ctx, person.outfit, shirt, edge);
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
    } else if (person.hair === 'short' || person.hair === 'pony') {
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
    if (person.hair === 'curly') {
      for (const [x,y,r] of [[26,33,6],[32,25,7],[43,20,8],[55,20,8],[65,26,7],[70,33,6]]) {
        ellipse(ctx, x, y, r, r, hair, edge, 1.3);
      }
    }
    path(ctx, c => { c.moveTo(33,30); c.quadraticCurveTo(39,23,47,23); }, '#fff8da75', 1.7);
    face(ctx, person.expression, edge);
    if ((!person.accessory || person.accessory === 'none') && (person.hair === 'buns' || person.hair === 'long')) {
      ellipse(ctx, 63, 36, 2.8, 3, '#ffdc90', '#786549', 1);
    }
    accessory(ctx, person.accessory, edge);
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
