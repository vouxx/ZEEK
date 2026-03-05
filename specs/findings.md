# Findings & Decisions

> **기술적 발견, 중요한 결정이 있을 때마다 이 파일을 즉시 업데이트하세요.**

## Requirements

- Gemini AI + Google Search로 일일 뉴스 자동 수집 (8개 카테고리, 30~40개)
- 웹 UI + 이메일 뉴스레터 (평일 자동 발송)
- Vercel Cron 기반 자동화

## Research Findings

### Gemini API

- `@google/genai` SDK v1.42.0이 `groundingMetadata`를 파싱하지 않음 → REST API 직접 호출 필수
- REST API에서 `google_search` 도구명 사용 (SDK는 `googleSearch` — 이름 다름 주의)
- Temperature 0.3으로 사실 기반 응답 유도
- Free tier 실제 제한: 5 RPM + **20 RPD** (일일 20회가 실질적 병목)

### URL 리졸브

- `groundingSupports`의 `startIndex` 기반 위치 매핑이 가장 정확
- 텍스트 유사도 fallback은 20% 임계값이 적절
- `google.com/url?q=` 형태는 HTTP 요청 없이 query param 파싱 가능
- google/vertexaisearch 도메인은 302 chain에서 계속 추적해야 함

### Vercel + Neon

- Hobby 플랜 maxDuration 최대 300초
- KST 날짜 계산 시 `getTodayKST()` 유틸 필수 (UTC 서버)
- Prisma 스키마 변경 후 반드시 `prisma generate` 실행 필요

### Resend 이메일

- `react:` 옵션이 `@react-email/render` 해석 실패 → `html: await render(...)` 방식 사용
- 테스트 도메인 `onboarding@resend.dev`는 계정 이메일로만 발송 가능

## Resources

### 문서

- [Gemini REST API](https://ai.google.dev/api/generate-content) (SDK 대신 직접 호출)
- [Resend Docs](https://resend.com/docs)
- [React Email](https://react.email)

### 코드 참조

- Gemini 호출: `src/lib/gemini.ts`
- 다이제스트 생성: `src/lib/digest.ts`
- 카테고리 정의: `src/lib/constants.ts`

### API 엔드포인트

- POST `/api/subscribe` — 구독 등록
- POST `/api/unsubscribe` — 구독 해지
- GET `/api/cron/generate` — 다이제스트 생성
- GET `/api/cron/send` — 이메일 발송
- GET `/api/cron/monthly-summary` — 월간 요약

## Technical Decisions

| Decision | Rationale |
| -------- | --------- |
| Gemini 2.5 Flash | Google Search 내장, 한국어 성능 우수 |
| REST API 직접 호출 (SDK 제거) | `@google/genai` SDK가 groundingMetadata 누락하는 버그 |
| 전체 카테고리 1회 통합 호출 | Gemini free tier 20 RPD 제한 → 8개 개별 호출 불가 |
| Neon PostgreSQL | Serverless, Vercel 호환 |
| `html: await render(...)` | Resend `react:` 옵션이 `@react-email/render` 해석 실패 |
| Gmail 구독 제한 | Resend 테스트 도메인 제약 (커스텀 도메인 등록 시 해제) |
| KST 날짜 유틸 | Vercel UTC 서버에서 KST 날짜 불일치 방지 |
| 월간 요약 upsert | 이번 달은 매일 갱신(force), 지난 달은 1일에 최종 확정 |
| 크론 생성/발송 분리 | 생성 KST 00:00 + 발송 KST 08:00 별도 실행 |
| URL 검증 병렬화 | `Promise.all`로 실행 시간 대폭 단축 |
| maxDuration 300초 | Gemini API 응답 2분+ 소요 가능 |
| DuckDuckGo !ducky fallback | URL 리졸브 실패 시 첫 검색 결과로 자동 리다이렉트 |
| 소스 범위 확장 | X/Twitter + GeekNews → 커뮤니티/소셜 커버리지 확대 |
| 빈 다이제스트 재생성 | 아이템 0개 다이제스트가 "이미 존재"로 스킵되는 문제 방지 |

## Issues Encountered

### 1. `@google/genai` SDK grounding metadata 누락 (2026-02-25)

**문제**:

SDK로 Gemini API 호출 시 `groundingChunks: 0, groundingSupports: 0` — 모든 URL이 fallback 처리

**원인**:

`@google/genai` SDK v1.42.0이 REST API 응답의 `groundingMetadata` 필드를 파싱하지 않음

**해결**:

SDK 제거, `fetch()`로 REST API 직접 호출 (`callGeminiRaw()` 함수)

**결과**:

17/18 실제 기사 URL 확보 (94% 검증률)

### 2. Gemini free tier 20 RPD 초과 (2026-02-25)

**문제**:

8개 카테고리 개별 호출 시 일일 한도 초과

**원인**:

문서상 5 RPM이지만 실제로 20 RPD (일일 20회) 제한 존재

**해결**:

전체 카테고리 1회 통합 호출로 전환 (일 2회: 다이제스트 + 월간 요약)

**결과**:

일일 한도 내 안정 운영

### 3. Vercel 크론 504 타임아웃 (2026-02-25)

**문제**:

48시간 동안 크론 실행 로그 없음

**원인**:

`maxDuration=60`으로는 Gemini API 응답 대기 시간 부족

**해결**:

`maxDuration=300` + 통합 API 호출로 실행 시간 단축

**결과**:

크론 정상 실행

## Learnings

### Gemini grounding은 REST API 직접 호출이 안전 (2026-02-25)

SDK가 아직 불안정하므로, grounding metadata가 필요한 경우 REST API 직접 호출이 유일한 방법.
동일 요청을 `curl`로 테스트하면 정상 반환되는지 먼저 확인할 것.

### Free tier 제한은 문서와 다를 수 있음 (2026-02-25)

Google AI 서비스의 실제 제한은 문서 명세와 다를 수 있음.
항상 실제 사용량을 모니터링하고, 통합 호출로 API 호출 수를 최소화할 것.

---
