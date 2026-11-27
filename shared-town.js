(() => {
  const config = window.RainTownConfig;
  if (!config) return;
  const projectUrl = config.projectUrl?.replace(/\/+$/, '');
  const apiKey = config.publishableKey;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(projectUrl) || !apiKey?.startsWith('sb_publishable_')) return;
  const storageKey = `little-rain-town-browser:${projectUrl}`;
  const errors = {
    RAIN_BROWSER_INVALID: '这个浏览器的识别信息有问题，请刷新网页后再试。',
    RAIN_PROFILE_INVALID: '请检查小人的名字和外观选项。',
    RAIN_NAME_TAKEN: '镇上已经有这个名字了，换一个试试。',
    RAIN_RESIDENT_MISSING: '先捏好自己的小人，再使用这个功能。',
    RAIN_MEETING_INVALID: '请重新选择见面对象和地点。',
    RAIN_PLACE_INVALID: '这个地点暂时去不了，请重新选择。',
    RAIN_ACTION_LIMIT: '刚安排过一次活动，请稍后再试。',
    RAIN_ALREADY_JOINED: '这个浏览器已经有一个小人了，可以继续编辑它。'
  };

  function readOrCreateToken() {
    const saved = window.localStorage.getItem(storageKey);
    if (/^[0-9a-f]{64}$/.test(saved ?? '')) return saved;
    const bytes = window.crypto.getRandomValues(new Uint8Array(32));
    const token = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    window.localStorage.setItem(storageKey, token);
    return window.localStorage.getItem(storageKey) === token ? token : null;
  }

  async function call(method, args = {}) {
    const response = await fetch(`${projectUrl}/rest/v1/rpc/rain_town_${method}`, {
      method: 'POST',
      headers: { apikey: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(10000)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.message ?? 'RAIN_CONNECTION');
    return result;
  }

  window.SharedTown = {
    call,
    message(error) {
      return errors[error.message] ?? '暂时连不上共享小镇，请稍后再试。';
    },
    async loadBrowserToken() {
      try {
        return navigator.locks
          ? await navigator.locks.request(storageKey, readOrCreateToken)
          : readOrCreateToken();
      } catch {
        return null;
      }
    }
  };
})();
