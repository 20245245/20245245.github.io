# 배포 가이드 — Vercel + Supabase (방명록)

이 문서는 **당신이 직접 눌러야 하는 부분**(계정·비밀키)과 그 순서를 정리한 것입니다.
Kiro가 코드는 전부 만들어 두었습니다. 아래 순서대로 따라오시면 됩니다.

> 현재 이 컴퓨터에는 Node.js 가 설치되어 있지 않습니다.
> - Vercel 은 GitHub 연결만으로 서버에서 빌드하므로 **배포 자체는 Node 없이도 됩니다.**
> - 다만 로컬 테스트(`vercel dev`)와 기존 사주 테스트(`node tests/*.cjs`)를 돌리려면 Node 설치가 필요합니다.
> - Node 설치: https://nodejs.org 에서 LTS 버전 설치(macOS용 .pkg) → 터미널 새로 열고 `node -v` 확인.

---

## 1. Supabase 프로젝트 + 테이블 만들기 (당신이 함)

1. https://supabase.com 로그인 → New project 생성.
   - 이름/지역(Northeast Asia - Seoul 권장) 지정, 데이터베이스 비밀번호는 안전하게 보관(대화창에 붙여넣지 않기).
2. 왼쪽 메뉴 **SQL Editor** → New query → 아래 SQL 붙여넣고 Run.

```sql
-- 방명록 테이블 (기존 데이터를 지우지 않는 안전한 생성)
create table if not exists public.guestbook_entries (
  id          bigint generated always as identity primary key,
  nickname    text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- 최신순 조회를 빠르게
create index if not exists guestbook_created_at_idx
  on public.guestbook_entries (created_at desc);

-- RLS 켜기: 브라우저(anon)의 직접 접근을 막는다.
-- 서버 함수는 secret key 를 쓰므로 RLS 를 통과한다.
alter table public.guestbook_entries enable row level security;
-- 정책을 따로 추가하지 않으므로 anon/authenticated 의 직접 접근은 모두 거부된다.
```

3. **Table Editor** 에서 `guestbook_entries` 테이블이 생겼는지 확인.
4. **Project Settings → API** 에서 두 값을 확인(복사는 Vercel 입력할 때):
   - Project URL  → 환경변수 `SUPABASE_URL`
   - secret key (service_role) → 환경변수 `SUPABASE_SECRET_KEY`
   - ⚠️ secret/service_role 키는 브라우저 코드에 절대 넣지 않습니다. Vercel 서버 환경변수에만 넣습니다.

---

## 2. GitHub 에 코드 올리기

로컬에서 커밋·push 는 당신 확인 후 Kiro 가 도와드립니다(또는 직접):

```sh
git add api guestbook.js vercel.json package.json index.html styles.css \
        docs .gitignore .env.example README.md
git commit -m "Add guestbook feature with Vercel functions and Supabase"
git push origin main
```

(.env, node_modules 는 .gitignore 로 제외되어 올라가지 않습니다.)

---

## 3. Vercel 에 연결 + 배포 (당신이 함)

1. https://vercel.com 를 GitHub 계정으로 로그인.
2. **Add New → Project → Import** 에서 `20245245/20245245.github.io` 저장소 선택.
3. 설정값:
   - Framework Preset: **Other** (빌드 없는 정적 사이트)
   - Root Directory: `./` (저장소 루트)
   - Build Command: 비움
   - Output Directory: 비움(루트의 정적 파일 그대로 서빙)
4. **Environment Variables** 에 추가(Production + Preview 둘 다 체크):
   - `SUPABASE_URL` = (1단계의 Project URL)
   - `SUPABASE_SECRET_KEY` = (1단계의 secret key)
5. **Deploy** 클릭.
6. 배포가 끝나면 `https://<프로젝트>.vercel.app` 주소가 나옵니다. 그 주소를 엽니다.

> 환경변수를 배포 후에 바꾸면 **다시 Deploy(Redeploy)** 해야 적용됩니다.

---

## 4. 직접 검사 (8단계 체크리스트)

- 새 Vercel 주소를 열면 홈 하단에 "온결에 남기는, 한 줄의 결" 방명록이 보인다.
- 별명 + 메시지 입력 → "등록되었습니다" → 목록에 최신순으로 뜬다.
- Supabase Table Editor 에서 해당 행이 실제로 쌓였는지 확인.
- 휴대폰/다른 브라우저로 같은 주소를 열면 같은 글이 보인다.
- 새로고침·재배포 후에도 글이 남는다.
- 빈 메시지, 1자 미만/100자 초과는 거절된다.
- `<b>안녕</b>` 입력 → 굵게가 아니라 입력한 문자 그대로 보인다.
- 저장 실패 시 "완료"로 표시되지 않는다.

## 자주 막히는 곳

- **화면은 뜨는데 저장이 안 됨**: Vercel 함수 로그(프로젝트 → Deployments → Functions/Logs)와 환경변수 이름(`SUPABASE_URL`, `SUPABASE_SECRET_KEY`), 적용 범위(Production/Preview)를 확인. 키 값은 로그/오류 보고에 넣지 않는다.
- **500 "데이터베이스 설정이 없습니다"**: 환경변수 미설정 또는 Redeploy 안 함.
- **403/권한 거절**: secret key 가 아니라 anon key 를 넣었는지 확인. 서버에는 secret key 가 필요하다. RLS 전체를 끄는 방식으로 해결하지 않는다.
