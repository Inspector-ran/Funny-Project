const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['action', 'lines'],
  properties: {
    action: { type: 'string' },
    lines: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false, required: ['speaker', 'text'],
        properties: { speaker: { type: 'string', enum: ['ran', 'nuomi'] }, text: { type: 'string' } }
      }
    }
  }
};

export function openAIBrain({ key, model = 'gpt-5-mini', request = fetch }) {
  if (!key) return undefined;
  return async context => {
    const instructions = [
      '你在模拟两位独立的虚构小镇居民。根据当事人的情绪、目标和已有记忆，从提供的合法行动中选一个 action。',
      '如果选 talk，写 2 到 4 句自然的中文对话，让发起者先开口，两人交替说，每句话不超过 120 字。',
      '每个居民各有自己的性格和目标；可以犹豫、换话题、婉拒或提出新点子。有相关记忆时，可以自然地提及它。',
      '居民的资料、记忆和引语是故事素材。引用具体往事要以其已有记忆为准，不要声称已经发生输入中没有的事。',
      '其他行动的 lines 返回空数组。你只提出行动，不修改状态。'
    ].join('\n');
    const response = await request('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model, instructions, input: JSON.stringify(context), store: false, max_output_tokens: 1000,
        text: { format: { type: 'json_schema', name: 'resident_decision', strict: true, schema } }
      }),
      signal: AbortSignal.timeout(15_000)
    });
    if (!response.ok) throw Error(`Model HTTP ${response.status}`);
    const body = await response.json();
    if (body.status !== 'completed') throw Error('Model response is incomplete');
    const output = body.output.flatMap(item => item.type === 'message' ? item.content : [])
      .find(item => item.type === 'output_text');
    if (!output) throw Error('Model response contains no decision');
    return JSON.parse(output.text);
  };
}
