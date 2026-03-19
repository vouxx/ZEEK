# ZEEK - Project Specification

## Overview

ZEEK은 AI 기반 데일리 기술 뉴스 큐레이션 서비스다.
Google Gemini AI가 매일 주요 기술 뉴스를 수집/요약하고, 웹과 이메일로 전달한다.

<!-- 도메인 모델, 코드 예시, 기술적 구현 세부사항은 이 문서에 포함하지 않습니다.
     이러한 내용은 plan.md와 findings.md에서 다룹니다. -->

---

## User Scenarios

### US-1: 최신 뉴스 확인

**Given** 사용자가 홈페이지에 접속하면
**When** 오늘의 다이제스트가 존재할 때
**Then** 카테고리별로 그룹된 뉴스 목록이 표시된다

### US-2: 카테고리 필터링

**Given** 다이제스트가 표시된 상태에서
**When** 사용자가 카테고리 드롭다운에서 카테고리를 선택하면
**Then** 해당 카테고리의 뉴스만 필터링되어 표시된다
**And** 기본값은 "전체 카테고리" (모든 뉴스 표시)
**And** 데이터가 있는 카테고리만 드롭다운 옵션으로 표시된다

### US-3: 이메일 구독

**Given** 사용자가 이메일을 입력하고 구독 버튼을 클릭하면
**When** 유효한 이메일일 때
**Then** 구독자로 등록되고 매일 다이제스트 이메일을 수신한다

### US-4: 구독 해지

**Given** 구독자가 이메일의 구독 해지 링크를 클릭하면
**When** 유효한 토큰일 때
**Then** 구독이 비활성화되고 확인 메시지가 표시된다

### US-5: 아카이브 열람

**Given** 사용자가 아카이브 페이지에 접속하면
**When** 과거 다이제스트가 존재할 때
**Then** 월별로 그룹된 다이제스트 목록이 표시된다
**And** 각 월 헤더에 다이제스트 수, 총 아이템 수, 주요 카테고리가 표시된다
**And** 가장 최근 월은 펼쳐진 상태로 표시되고, 이전 월은 접힌 상태로 표시된다
**And** 각 날짜를 클릭해 해당 다이제스트를 열람할 수 있다

### US-7: About 페이지

**Given** 사용자가 About 페이지(/about)에 접속하면
**When** 페이지가 로드되면
**Then** ZEEK 서비스 소개, 작동 방식, 기술 스택, 카테고리 목록이 표시된다
**And** 헤더 네비게이션에서 About 링크가 활성 상태로 표시된다

### US-6: 일일 자동 생성 + 발송

**Given** 매일 UTC 15:00 (KST 00:00)에 생성 크론이 실행되면
**When** 오늘(KST) 다이제스트가 아직 없을 때
**Then** Gemini API 1회 호출로 모든 카테고리의 뉴스를 수집하여 DB에 저장한다
**And** 빈 다이제스트(아이템 0개)가 있으면 삭제 후 재생성한다

**Given** 매일 UTC 23:00 (KST 08:00)에 발송 크론이 실행되면
**When** 평일(월~금)이면
**Then** 오늘자 다이제스트를 모든 활성 구독자에게 이메일로 발송한다
**And** 주말이면 이메일 발송을 건너뛴다 (웹사이트에서는 열람 가능)

---

## Functional Requirements

### 뉴스 수집

- **FR-1**: MUST - Gemini AI + Google Search로 지난 24시간 뉴스 및 커뮤니티 화제 글 수집
- **FR-2**: MUST - 1회 API 호출로 전체 카테고리 30~40개 아이템 요청 (카테고리당 3~5개)
- **FR-3**: MUST - 한국어로 작성, 영어/한국어 소스 모두 검색
- **FR-4**: MUST - 각 아이템에 title, summary, whyItMatters, sourceHint 포함
- **FR-5**: MUST - grounding redirect URL → query param 직접 파싱 또는 302 chain follow(최대 5 hop)로 실제 URL 확보, 실패 시 DuckDuckGo !ducky fallback
- **FR-29**: MUST - 소스 범위: 뉴스 매체, 개발자 커뮤니티(HN, GeekNews, Reddit), 소셜(X/Twitter), 블로그, GitHub 등

### 카테고리

- **FR-6**: MUST - 다음 8개 카테고리 지원:

| ID | Label | 범위 |
|----|-------|------|
| `ai-ml` | AI / ML | LLM, 컴퓨터 비전, AI 도구, 연구, 모델 출시 |
| `web-dev` | Web Dev | 프레임워크, 브라우저, JS/TS, CSS, 웹 표준 |
| `cloud-infra` | Cloud / Infra | AWS, GCP, Azure, K8s, Docker, DevOps, CI/CD |
| `security` | Security | 보안 취약점, 데이터 유출, 제로데이, 프라이버시 |
| `mobile` | Mobile | iOS, Android, Flutter, React Native, 앱스토어 |
| `startups` | Startups | 펀딩, 인수합병, 제품 출시, 빅테크 |
| `open-source` | Open Source | 릴리스, 주목 프로젝트, 라이선스 변경 |
| `science-tech` | Science / Tech | 반도체, 양자컴퓨팅, 우주, 바이오테크, 로보틱스 |

### 웹 UI

- **FR-7**: MUST - 최신 다이제스트를 홈페이지에 표시
- **FR-8**: MUST - 카테고리별 커스텀 드롭다운 필터 (기본값: 전체, 데이터 있는 카테고리만)
- **FR-9**: MUST - 뉴스 카드에 제목(출처 링크), 요약, whyItMatters 표시
- **FR-10**: MUST - 날짜별 아카이브 페이지
- **FR-30**: MUST - 아카이브 페이지에서 다이제스트를 월별로 그룹 표시
- **FR-31**: MUST - 월별 요약 통계 (다이제스트 수, 총 아이템 수, 카테고리 분포)
- **FR-32**: SHOULD - 월별 섹션 접기/펼치기 (최신 월은 기본 펼침)
- **FR-33**: SHOULD - 월별 AI 요약 (Gemini가 해당 월 뉴스를 3~4문장으로 요약, DB 캐싱)
- **FR-11**: MUST - 이메일 구독 전용 페이지 (/subscribe)
- **FR-18**: MUST - 아이폰 목업 UI (데스크톱), 풀스크린 (모바일)
- **FR-19**: MUST - 다크모드 지원 (토글 전환)
- **FR-20**: MUST - 아이폰 상태바 (시간, 셀룰러, 와이파이, 배터리)
- **FR-21**: MUST - 홈 인디케이터 (비활성 시 페이드아웃)
- **FR-22**: MUST - 스크롤 방향 감지 헤더 (내리면 숨김, 올리면 표시)
- **FR-23**: MUST - 페이지 전환 애니메이션 (fade-in)
- **FR-28**: MUST - 인트로 타이핑 애니메이션 (폰 프레임 내 ZEEK 타이핑 → 페이드아웃, 세션당 1회)
- **FR-34**: MUST - About 페이지 (/about) — 서비스 소개, 작동 방식, 기술 스택, 카테고리 목록 표시
- **FR-35**: MUST - 헤더 네비게이션에 About 링크 추가
- **FR-24**: SHOULD - PWA 지원 (manifest, 앱 아이콘)
- **FR-25**: SHOULD - OG 이미지 동적 생성

### 이메일

- **FR-12**: MUST - React Email 기반 HTML 이메일 템플릿 (`@react-email/render`로 명시적 렌더링)
- **FR-13**: MUST - 카테고리별 그룹된 뉴스 + 원본 링크
- **FR-14**: MUST - 토큰 기반 구독 해지 링크
- **FR-27**: MUST - 환영 이메일 템플릿 (React Email)

### 구독 관리

- **FR-15**: MUST - 이메일 유효성 검증 (Gmail만 허용)
- **FR-16**: MUST - 중복 이메일 시 재활성화
- **FR-17**: MUST - 고유 토큰 기반 구독 해지
- **FR-26**: MUST - 구독 즉시 환영 이메일 발송

---

## Constraints

- **CON-1**: Gemini free tier 제한 (5 RPM, 20 RPD) → 전체 카테고리 1회 통합 호출 (일 2회: 다이제스트 + 월간 요약)
- **CON-2**: 뉴스 수집은 지난 24시간 이내만
- **CON-3**: Vercel Cron 2개: 생성 UTC 15:00 (KST 00:00) + 발송 UTC 23:00 (KST 08:00), 이메일은 평일만
- **CON-4**: Neon serverless PostgreSQL 사용
- **CON-5**: Resend 테스트 도메인(`onboarding@resend.dev`) 사용 → Gmail 구독자만 허용 (커스텀 도메인 등록 시 해제 가능)
- **CON-6**: Vercel Hobby 플랜 함수 타임아웃 → maxDuration 300초 설정 (Gemini API 응답 대기)

---

## Success Criteria

- **SC-1**: 매일 8개 카테고리에서 30~40개 뉴스 아이템 수집
- **SC-2**: 출처 URL 검증 성공률 80% 이상 (DuckDuckGo !ducky fallback 20% 이하)
- **SC-3**: 구독자 이메일 발송 성공률 95% 이상
- **SC-4**: 다이제스트 생성 소요 시간 3분 이내

---

## API Specification

### POST /api/subscribe

구독 등록

- **Request**: `{ email: string }`
- **Response 200**: `{ message: "구독 완료!" }`
- **Response 400**: `{ error: "유효하지 않은 이메일입니다" }`

### POST /api/unsubscribe

구독 해지

- **Request**: `{ token: string }`
- **Response 200**: `{ message: "Unsubscribed successfully" }`
- **Response 404**: `{ error: "Invalid token" }`

### GET /api/cron/generate

다이제스트 콘텐츠 생성 + 이번 달 월간 요약 갱신 (Bearer 인증)

- **Response 200**: `{ ok: true, id: string }`
- **Response 401**: `{ error: "Unauthorized" }`

### GET /api/cron/send

오늘자 다이제스트 이메일 발송 (Bearer 인증, 평일만)

- **Response 200**: `{ ok: true, sent: number, total: number }`
- **Response 401**: `{ error: "Unauthorized" }`

### GET /api/cron/monthly-summary

지난 달 월간 요약 수동 생성 (Bearer 인증)

- **Response 200**: `{ ok: true, year: number, month: number, content: string }`
- **Response 401**: `{ error: "Unauthorized" }`
