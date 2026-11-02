// Vercel Serverless Function: 방명록 조회(GET) / 저장(POST)
// 데이터는 Supabase 테이블 guestbook_entries 에 저장한다.
// 브라우저는 이 함수를 통해서만 테이블에 접근한다 (secret key 서버 전용).

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

// 검증 규칙 (feature-plan.md 와 일치, 브라우저와 서버 양쪽 적용)
const NICK_MIN = 2;
const NICK_MAX = 12;
const MSG_MIN = 1;
const MSG_MAX = 100;
const LIST_LIMIT = 50;

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false },
  });
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // 조회가 오래된 결과를 캐시하지 않도록 함
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

// 요청 본문을 JSON 으로 읽는다 (Vercel 이 파싱해주지 않는 경우 대비)
async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string' && req.body.length > 0) {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      return null;
    }
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// 입력 검증. 통과하면 정리된 값을, 실패하면 사유를 돌려준다.
function validateEntry(input) {
  if (!input || typeof input !== 'object') {
    return { error: '요청 형식이 올바르지 않습니다.' };
  }
  const nicknameRaw = typeof input.nickname === 'string' ? input.nickname.trim() : '';
  const messageRaw = typeof input.message === 'string' ? input.message.trim() : '';

  if (nicknameRaw.length < NICK_MIN || nicknameRaw.length > NICK_MAX) {
    return { error: `별명은 ${NICK_MIN}~${NICK_MAX}자로 입력해주세요.` };
  }
  if (messageRaw.length < MSG_MIN || messageRaw.length > MSG_MAX) {
    return { error: `메시지는 ${MSG_MIN}~${MSG_MAX}자로 입력해주세요.` };
  }
  return { value: { nickname: nicknameRaw, message: messageRaw } };
}

module.exports = async function handler(req, res) {
  const supabase = getClient();
  if (!supabase) {
    return sendJson(res, 500, {
      error: '서버에 데이터베이스 설정이 없습니다. 환경 변수(SUPABASE_URL, SUPABASE_SECRET_KEY)를 확인해주세요.',
    });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('guestbook_entries')
      .select('id, nickname, message, created_at')
      .order('created_at', { ascending: false })
      .limit(LIST_LIMIT);

    if (error) {
      return sendJson(res, 500, { error: '글을 불러오지 못했습니다.' });
    }
    return sendJson(res, 200, { entries: data || [] });
  }

  if (req.method === 'POST') {
    const body = await readJsonBody(req);
    const checked = validateEntry(body);
    if (checked.error) {
      return sendJson(res, 400, { error: checked.error });
    }

    const { data, error } = await supabase
      .from('guestbook_entries')
      .insert({ nickname: checked.value.nickname, message: checked.value.message })
      .select('id, nickname, message, created_at')
      .single();

    if (error) {
      return sendJson(res, 500, { error: '저장에 실패했습니다. 잠시 후 다시 시도해주세요.' });
    }
    return sendJson(res, 201, { entry: data });
  }

  res.setHeader('Allow', 'GET, POST');
  return sendJson(res, 405, { error: '허용되지 않은 요청입니다.' });
};
