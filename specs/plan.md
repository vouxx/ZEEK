# Implementation Plan: ZEEK

## Summary

Next.js App Router 기반 풀스택 앱으로, Gemini REST API에서 뉴스를 수집하고
Neon PostgreSQL에 저장한 뒤 웹 UI와 Resend 이메일로 전달한다.

## Requirements

1. Gemini AI + Google Search로 일일 뉴스 수집 (8개 카테고리, 30~40개)
2. 웹 UI: 아이폰 목업 + 다크모드 + 아카이브
3. 이메일 구독/발송 (평일 자동, 환영 이메일)
4. Vercel Cron 자동화 (생성 KST 00:00, 발송 KST 08:00)

## Critical Files

### Core Logic

- `src/lib/gemini.ts` — Gemini REST API 호출, 뉴스 수집, URL 리졸브, 월간 요약
- `src/lib/digest.ts` — 다이제스트 생성/조회, 이메일 발송, 아카이브 데이터
- `src/lib/constants.ts` — 카테고리 8개 정의
- `src/types/digest.ts` — TypeScript 타입/인터페이스

### API Routes

- `src/app/api/cron/generate/route.ts` — 다이제스트 생성 크론
- `src/app/api/cron/send/route.ts` — 이메일 발송 크론
- `src/app/api/cron/monthly-summary/route.ts` — 월간 요약 수동 생성
- `src/app/api/subscribe/route.ts` — 구독 등록
- `src/app/api/unsubscribe/route.ts` — 구독 해지

### UI Components

- `src/app/layout.tsx` — 아이폰 목업 프레임 + 반응형
- `src/app/template.tsx` — 페이지 전환 애니메이션
- `src/components/DigestList.tsx` — 뉴스 목록 + 카테고리 드롭다운
- `src/components/DigestCard.tsx` — 뉴스 카드
- `src/components/MonthSection.tsx` — 아카이브 월별 섹션
- `src/components/Header.tsx` — 스크롤 감지 헤더
- `src/components/StatusBar.tsx` — 아이폰 상태바
- `src/components/ThemeProvider.tsx` — 다크모드 컨텍스트

### Email

- `src/emails/DigestEmail.tsx` — 다이제스트 이메일 템플릿
- `src/emails/WelcomeEmail.tsx` — 환영 이메일 템플릿

### Database

- `prisma/schema.prisma` — Digest, DigestItem, MonthlySummary, Subscriber

## Architecture

### Data Flow

```text
Gemini API (Google Search)
       ↓
  [뉴스 JSON + groundingMetadata]
       ↓
  gemini.ts: URL 리졸브 (302 follow / !ducky fallback)
       ↓
  digest.ts: DB 저장 (Prisma → Neon PostgreSQL)
       ↓
  ┌─────────┐     ┌────────────┐
  │ Web UI  │     │ Email Send │
  │ (SSR)   │     │ (Resend)   │
  └─────────┘     └────────────┘
```

### Cron Schedule

```text
UTC 15:00 (KST 00:00) ─→ /api/cron/generate
                              ├─ 다이제스트 생성
                              └─ 이번 달 월간 요약 갱신

UTC 23:00 (KST 08:00) ─→ /api/cron/send
                              └─ 평일만 이메일 발송
```

### Domain Model

```text
Digest
├── id (CUID)
├── date (unique)
├── createdAt
└── items[]
    └── DigestItem
        ├── id, digestId (FK)
        ├── category, title, summary
        ├── whyItMatters, sourceUrl
        └── order

MonthlySummary
├── id (CUID)
├── year, month (unique pair)
└── content (AI 요약 텍스트)

Subscriber
├── id (CUID)
├── email (unique), active
├── token (unique, 해지용)
└── createdAt, unsubscribedAt?
```

### URL Resolve Flow

```text
groundingMetadata.groundingChunks[].web.uri
       ↓
  1. google.com/url?q= → query param 파싱
  2. 302 redirect chain (최대 5 hop)
  3. 실패 → DuckDuckGo !ducky fallback
       ↓
  실제 기사 URL
```

## Verification

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Manual Test

1. `npm run dev` → 홈페이지에서 다이제스트 표시 확인
2. `/api/cron/generate` 호출 → DB에 다이제스트 생성 확인
3. `/api/cron/send` 호출 → 이메일 수신 확인
4. `/subscribe` → 구독 후 환영 이메일 수신 확인

## Considerations

### Gemini Free Tier 제약

20 RPD 제한으로 전체 카테고리 1회 통합 호출 필수.
일 2회 (다이제스트 + 월간 요약)로 제한.

### Vercel Hobby 타임아웃

maxDuration 300초 설정. Gemini API 응답이 2분+ 소요 가능.

### SDK 미사용

`@google/genai` SDK가 groundingMetadata를 누락하는 버그 존재.
REST API `fetch()` 직접 호출로 우회.

---

## 구현 계획

> 새로운 기능의 구현 계획은 여기에 추가
