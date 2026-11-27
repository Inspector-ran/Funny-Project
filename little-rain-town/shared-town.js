(() => {
  const config = window.RainTownConfig;
  if (!config) return;
  const projectUrl = config.projectUrl?.replace(/\/+$/, '');
  const apiKey = config.publishableKey;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(projectUrl) || !apiKey?.startsWith('sb_publishable_')) return;
  const storageKey = `little-rain-town-invite:${projectUrl}`;
  const errors = {
    RAIN_INVITE_INVALID: '邀请码无效，请检查后再试。',
    RAIN_PROFILE_INVALID: '请检查小人的名字和外观选项。',
    RAIN_NAME_TAKEN: '镇上已经有这个名字了，换一个试试。',
    RAIN_RESIDENT_MISSING: '先捏好自己的小人，再使用这个功能。',
    RAIN_MEETING_INVALID: '请重新选择见面对象和地点。',
    RAIN_ACTION_LIMIT: '刚安排过一场见面，请稍后再试。',
    RAIN_ALREADY_JOINED: '这个邀请码已经认领了一个小人。'
  };

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
    loadInvite() {
      try { return localStorage.getItem(storageKey); }
      catch { return null; }
    },
    storeInvite(invite) {
      try {
        if (invite) localStorage.setItem(storageKey, invite);
        else localStorage.removeItem(storageKey);
      } catch {
        // The current browser tab can still use the code.
      }
    }
  };
})();
