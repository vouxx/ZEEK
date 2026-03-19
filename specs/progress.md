# Progress Log

> **각 단계를 완료하거나 문제가 발생하면 업데이트하세요.**

## Session 2026-02-21

### Phase 3: Implementation ✅

**작업 내역**:

1. 뉴스 카테고리 4개 → 8개 확장 (cloud-infra, security, mobile, science-tech)
2. 빈 카테고리 필터 버튼 숨김 처리 (DigestList)
3. Spec-driven 워크플로우 세팅

**생성/수정 파일**:

- `src/types/digest.ts` (수정) — Category 타입에 4개 추가
- `src/lib/constants.ts` (수정) — CATEGORIES에 4개 카테고리 정의 추가
- `src/components/DigestList.tsx` (수정) — 데이터 있는 카테고리만 필터 버튼 표시
- `CLAUDE.md` (생성) — 프로젝트 개요 및 워크플로우 규칙
- `specs/` (생성) — spec.md, tasks.md, findings.md, progress.md

---

## Session 2026-02-21 (2)

### Phase 3: Implementation ✅

**작업 내역**:

1. git 저장소 분리 (zei/ → zeek/ 독립 저장소)
2. Vercel 배포 설정 (prisma generate 빌드 수정)
3. 아이폰 목업 UI (상태바, 다이나믹 아일랜드, 사이드 버튼, 홈 인디케이터)
4. 미니멀 디자인 강화 (여백, 타이포그래피, 애니메이션)
5. 반응형: 데스크톱 폰 목업 / 모바일 풀스크린
6. 헤더: 네비 활성 표시, 스크롤 방향 감지 숨김/표시
7. 페이지 전환 fade-in 애니메이션
8. 다크모드 (클래스 기반 토글, 전체 컴포넌트 대응)
9. 구독 전용 페이지 (/subscribe) 분리
10. PWA manifest + 앱 아이콘 (SVG)
11. OG 이미지 동적 생성 + Apple 아이콘
12. 파비콘 커스텀, Next.js 기본 아이콘 제거

**생성/수정 파일**:

- `src/app/layout.tsx` (수정) — 아이폰 목업 프레임 + 반응형
- `src/app/globals.css` (수정) — 애니메이션, 다크모드, 스크롤바 숨김
- `src/app/template.tsx` (수정) — 페이지 전환 애니메이션
- `src/app/subscribe/page.tsx` (생성) — 구독 전용 페이지
- `src/app/manifest.ts` (생성) — PWA manifest
- `src/app/opengraph-image.tsx` (생성) — OG 이미지
- `src/app/apple-icon.tsx` (생성) — Apple 아이콘
- `src/app/icon.svg` (생성) — 파비콘
- `src/components/StatusBar.tsx` (생성) — 아이폰 상태바
- `src/components/HomeIndicator.tsx` (생성) — 홈 인디케이터
- `src/components/ThemeProvider.tsx` (생성) — 다크모드 컨텍스트
- `src/components/Header.tsx` (수정) — 활성 표시, 스크롤 숨김, 다크모드 토글

---

## Session 2026-02-23

### Phase 3: Implementation ✅

**작업 내역**:

1. 크론 스케줄 변경 + 평일 이메일 발송 + Gmail 제한
2. KST 날짜 유틸 (`getTodayKST()`)
3. `@react-email/render` 직접 의존성 + `html: await render(...)` 방식
4. 이메일 발송 전용 API (`/api/cron/send`)
5. grounding redirect URL → 실제 URL 리졸브 + 접근 불가 URL 자동 제외
6. 아이템-chunk 매핑 개선: startIndex 기반 + 텍스트 유사도 fallback
7. 중복 URL 방지 (`usedUrls` Set)

**생성/수정 파일**:

- `vercel.json` (수정) — 크론 스케줄 변경
- `src/lib/digest.ts` (수정) — KST 유틸, 평일 체크, sendTodayDigest, html 렌더링
- `src/lib/gemini.ts` (수정) — 전면 리팩토링 (URL 리졸브, 소스 다양화)
- `src/app/api/cron/send/route.ts` (생성) — 이메일 발송 전용 엔드포인트
- `src/app/api/subscribe/route.ts` (수정) — Gmail 제한 + html 렌더링

---

## Session 2026-02-23 (2)

### Phase 3: Implementation ✅

**작업 내역**:

1. 아카이브 페이지 월별 그룹핑 (플랫 리스트 → 월 단위 접기/펼치기)
2. 월별 요약 통계 (다이제스트 수, 아이템 수, 상위 카테고리)
3. MonthlySummary DB 모델 + Gemini AI 월간 요약
4. Daily cron 연동 (매일 이번 달 갱신, 1일에 지난 달 확정)
5. 월간 요약 수동 트리거 API

**생성/수정 파일**:

- `src/components/MonthSection.tsx` (생성) — 월별 섹션 컴포넌트
- `src/app/api/cron/monthly-summary/route.ts` (생성) — 월간 요약 API
- `prisma/schema.prisma` (수정) — MonthlySummary 모델
- `src/lib/digest.ts` (수정) — getArchiveData 추가
- `src/lib/gemini.ts` (수정) — generateMonthlySummary 추가
- `src/app/archive/page.tsx` (수정) — 월별 그룹 UI

---

## Session 2026-02-24

### Phase 3: Implementation ✅

**작업 내역**:

1. 크론 스케줄 분리: 생성 (KST 00:00) + 발송 (KST 08:00)
2. `generateAndSendDigest` → `generateDigest` 분리
3. Hobby 60초 타임아웃 대응: 4개씩 배치 병렬 + 5초 대기
4. URL 검증 병렬화 (`Promise.all`)
5. 카테고리 필터: pill 버튼 → 커스텀 드롭다운

**생성/수정 파일**:

- `vercel.json` (수정) — 크론 2개 분리
- `src/lib/digest.ts` (수정) — generateDigest 분리, 배치 병렬
- `src/lib/gemini.ts` (수정) — URL 검증 Promise.all
- `src/components/DigestList.tsx` (수정) — 커스텀 드롭다운

---

## Session 2026-02-25

### Phase 3: Implementation ✅

**작업 내역**:

1. `maxDuration` 60 → 300
2. Gemini free tier 20 RPD 발견 → 1회 통합 호출 전환
3. `@google/genai` SDK grounding metadata 누락 발견 → REST API 직접 호출
4. URL 리졸브: 302 Location 헤더 추출
5. 빈 다이제스트 삭제 후 재생성 로직

**결과**: 18개 아이템 중 17개 실제 기사 URL 확보 (94%)

**생성/수정 파일**:

- `src/lib/gemini.ts` (수정) — 전면 재작성: SDK→REST API
- `src/lib/digest.ts` (수정) — fetchAllNews, 빈 다이제스트 재생성
- `src/app/api/cron/generate/route.ts` (수정) — maxDuration 300
- `src/app/api/cron/send/route.ts` (수정) — maxDuration 300

---

## Session 2026-02-26

### Phase 3: Implementation ✅

**작업 내역**:

1. `resolveGroundingUrl()` 강화 (query param 파싱, 5 hop follow)
2. Fallback: Google 검색 → DuckDuckGo !ducky
3. 소스 범위 확장: X/Twitter + GeekNews

**생성/수정 파일**:

- `src/lib/gemini.ts` (수정) — URL 리졸브 강화, fallback 변경
- `src/components/DigestCard.tsx` (수정) — fallback 감지 로직 수정

---

## Session 2026-03-19

### Hydration Mismatch 수정 (vouxx_resume 크로스 레포)

**작업 내역**:

1. `PhoneFrame.tsx` — `showIntro` state 초기화를 `useState(false)` + `useEffect`로 변경
2. 원인: vouxx_resume의 Playwright 테스트에서 iframe으로 로드한 ZEEK 사이트의 React #418 에러 발견

**수정 파일**:

- `src/components/PhoneFrame.tsx` (수정 — showIntro hydration 수정)

---

## Error Log

| Timestamp  | Error | Attempt | Resolution |
| ---------- | ----- | ------- | ---------- |
| 2026-02-25 | SDK grounding metadata 누락 | 1 | REST API 직접 호출로 전환 |
| 2026-02-25 | Gemini 20 RPD 초과 | 1 | 1회 통합 호출로 전환 |
| 2026-02-25 | 크론 504 타임아웃 | 1 | maxDuration 300초 |
| 2026-03-19 | PhoneFrame hydration #418 | 1 | useState(false) + useEffect |

## 5-Question Reboot Check

| Question | Answer |
| -------- | ------ |
| 1. 현재 어느 단계인가? | 초기 구축 완료, 운영 중 (hydration 수정 반영) |
| 2. 다음에 할 일은? | 배포 후 확인, 새 기능 요청 대기 |
| 3. 목표는? | AI 기반 한국어 데일리 기술 뉴스레터 |
| 4. 지금까지 배운 것? | findings.md 참조 |
| 5. 완료한 작업은? | 위 세션 기록 참조 |
