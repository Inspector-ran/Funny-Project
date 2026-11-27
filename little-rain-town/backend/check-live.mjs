import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const address = 'https://inspector-ran.github.io/Funny-Project/';
const nickname = process.env.TOWN_TEST_RESIDENT;
assert.match(nickname ?? '', /^验收[0-9a-f]{8}$/);

const browser = await chromium.launch({ headless: true });
try {
  const first = await browser.newContext();
  const second = await browser.newContext();
  const owner = await first.newPage();
  const visitor = await second.newPage();
  const create = owner.locator('[data-new]');
  const residentNamed = page => page.locator('.resident-card strong').filter({ hasText: new RegExp(`^${nickname}$`) });
  const ready = page => page.waitForFunction(() =>
    document.querySelector('#shared-status')?.textContent.startsWith('共享小镇') &&
    Boolean(document.querySelector('.resident-card')) &&
    !document.querySelector('[data-new]').disabled, undefined, { timeout: 45_000 });

  await Promise.all([
    owner.goto(address, { waitUntil: 'domcontentloaded' }),
    visitor.goto(address, { waitUntil: 'domcontentloaded' })
  ]);
  await Promise.all([ready(owner), ready(visitor)]);
  assert.equal(await owner.locator('#invite-dialog').count(), 0);
  assert.equal(await residentNamed(visitor).count(), 0);
  await create.click();
  await owner.locator('#resident-name').fill(nickname);
  await owner.locator('#resident-hobby').selectOption('stars');
  await owner.locator('#save-resident').click();
  await owner.waitForFunction(() => document.querySelector('[data-new]').textContent.trim() === '我的小人');
  await residentNamed(visitor).waitFor({ state: 'visible', timeout: 30_000 });

  await owner.reload({ waitUntil: 'domcontentloaded' });
  await ready(owner);
  await create.click();
  assert.equal(await owner.locator('#resident-dialog-title').textContent(), '编辑小人');
  assert.equal(await owner.locator('#resident-name').inputValue(), nickname);
  await owner.locator('#resident-dialog [data-close]').click();

  await residentNamed(visitor).click();
  assert.equal(await visitor.locator('#detail-title').textContent(), nickname);
  assert.equal(await visitor.locator('#detail-actions').getByRole('button', { name: '编辑小人' }).count(), 0);
  console.log('Live site verified in two independent browser contexts.');
} finally {
  await browser.close();
}
