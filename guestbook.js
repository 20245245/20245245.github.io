'use strict';
// 방명록: 별명 + 한 줄 메시지를 서버(/api/guestbook)에 저장하고 목록을 불러온다.
// 저장은 Vercel 서버 함수 → Supabase 로 이뤄지며, 입력은 서버에서도 다시 검증한다.
(function () {
  const section = document.getElementById('guestbook');
  if (!section) return;

  const form = document.getElementById('gb-form');
  const nickInput = document.getElementById('gb-nickname');
  const msgInput = document.getElementById('gb-message');
  const submitBtn = document.getElementById('gb-submit');
  const statusEl = document.getElementById('gb-status');
  const listEl = document.getElementById('gb-list');

  const NICK_MIN = 2, NICK_MAX = 12, MSG_MIN = 1, MSG_MAX = 100;

  // 사용자 입력을 HTML 이 아닌 글자로 안전하게 표시
  const esc = s => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  function setStatus(message, kind) {
    statusEl.textContent = message || '';
    statusEl.dataset.kind = kind || '';
  }

  // 저장 시각을 사람이 읽기 쉬운 상대/절대 표기로
  function formatTime(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function renderList(entries) {
    if (!entries || entries.length === 0) {
      listEl.innerHTML = '<li class="gb-empty">아직 남겨진 글이 없어요. 첫 글을 남겨보세요.</li>';
      return;
    }
    listEl.innerHTML = entries.map(e => `
      <li class="gb-item">
        <div class="gb-item-top">
          <strong>${esc(e.nickname)}</strong>
          <span class="gb-time">${esc(formatTime(e.created_at))}</span>
        </div>
        <p class="gb-message">${esc(e.message)}</p>
      </li>`).join('');
  }

  async function loadEntries() {
    listEl.innerHTML = '<li class="gb-empty">불러오는 중…</li>';
    try {
      const res = await fetch('/api/guestbook', { headers: { 'Accept': 'application/json' } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '목록을 불러오지 못했어요.');
      renderList(data.entries);
    } catch (err) {
      listEl.innerHTML = `<li class="gb-empty">목록을 불러오지 못했어요. ${esc(err.message)}</li>`;
    }
  }

  // 브라우저 1차 검증 (서버에서도 동일하게 재검증한다)
  function validate(nickname, message) {
    if (nickname.length < NICK_MIN || nickname.length > NICK_MAX) {
      return `별명은 ${NICK_MIN}~${NICK_MAX}자로 입력해주세요.`;
    }
    if (message.length < MSG_MIN || message.length > MSG_MAX) {
      return `메시지는 ${MSG_MIN}~${MSG_MAX}자로 입력해주세요.`;
    }
    return null;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nickname = nickInput.value.trim();
    const message = msgInput.value.trim();

    const problem = validate(nickname, message);
    if (problem) {
      setStatus(problem, 'error');
      return;
    }

    submitBtn.disabled = true;
    setStatus('저장 중…', 'pending');

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '저장에 실패했어요.');

      // 서버가 실제로 저장한 결과를 받은 뒤에만 성공 처리
      setStatus('등록되었습니다. 고마워요!', 'success');
      form.reset();
      await loadEntries();
    } catch (err) {
      setStatus(err.message || '저장에 실패했어요. 잠시 후 다시 시도해주세요.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  loadEntries();
})();
