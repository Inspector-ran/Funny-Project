import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { advance, townView } from './engine.mjs';
import { openTown } from './store.mjs';
import { openAIBrain } from './openai-brain.mjs';
import { colors, places } from './town-data.mjs';

const publicFiles = {
  '/': [new URL('./public/index.html', import.meta.url), 'text/html'],
  '/prototype.css': [new URL('./public/prototype.css', import.meta.url), 'text/css'],
  '/view.js': [new URL('./public/view.js', import.meta.url), 'text/javascript'],
  '/world.js': [new URL('../world.js', import.meta.url), 'text/javascript']
};

export function createTownServer({ store, brain, interval = 12_000 }) {
  let timer;
  let task;
  async function handleRequest(request, response) {
    if (request.method !== 'GET') {
      response.writeHead(405, { Allow: 'GET' }).end();
      return;
    }
    const path = request.url.split('?')[0];
    try {
      if (path === '/api/town') {
        const snapshot = townView(store.read(), Boolean(brain));
        response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
          .end(JSON.stringify({ ...snapshot, places, colors }));
      } else if (Object.hasOwn(publicFiles, path)) {
        const [url, type] = publicFiles[path];
        const body = await readFile(url);
        response.writeHead(200, { 'Content-Type': `${type}; charset=utf-8`, 'X-Content-Type-Options': 'nosniff' }).end(body);
      } else {
        response.writeHead(404).end();
      }
    } catch {
      response.writeHead(500).end('小镇暂时打不开，请刷新重试。');
    }
  }
  const server = createServer(handleRequest);

  function start(port = 4178, host = '127.0.0.1') {
    return new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, host, () => {
        server.removeListener('error', reject);
        timer = setInterval(() => {
          if (task) return;
          task = (async () => {
            const prior = store.read();
            store.save(prior, await advance(prior, { brain }));
          })().catch(error => {
            console.error('小镇推进失败', error.message);
          }).finally(() => { task = undefined; });
        }, interval);
        resolve(server.address());
      });
    });
  }

  async function stop() {
    clearInterval(timer);
    await task;
    await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
  return { start, stop, handleRequest };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const database = openTown(process.env.RAIN_TOWN_DATABASE ?? fileURLToPath(new URL('./resident-town.sqlite', import.meta.url)));
  const brain = openAIBrain({ key: process.env.OPENAI_API_KEY, model: process.env.RAIN_TOWN_MODEL });
  const app = createTownServer({ store: database, brain });
  const endpoint = await app.start();
  console.log(`毛毛雨小镇居民观察室 http://${endpoint.address}:${endpoint.port}/`);
  console.log(brain ? '模型已配置，生成成功的对白会单独标记。' : '当前使用规则演示。');
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      await app.stop();
      database.close();
      process.exitCode = 0;
    });
  }
}
