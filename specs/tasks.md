# Tasks: ZEEK

## Goal

AI 기반 한국어 데일리 기술 뉴스레터 플랫폼 운영 및 개선

## Current Phase

✅ 초기 구축 완료 — 운영 중

## Phases

### Phase 1: Requirements & Discovery ✅

- [x] 요구사항 정의
- [x] 기존 코드 분석
- [x] 스펙 문서 작성 (spec.md)

### Phase 2: Planning & Structure ✅

- [x] 구현 계획 작성 (plan.md)
- [x] 프로젝트 구조 설계 (Next.js App Router)
- [x] DB 스키마 설계 (Prisma)

### Phase 3: Implementation ✅

- [x] Next.js 프로젝트 초기 세팅
- [x] Prisma + Neon DB 연동
- [x] Gemini AI 뉴스 수집 로직 구현
- [x] 웹 UI (홈, 아카이브, 구독 해지)
- [x] React Email 이메일 템플릿
- [x] Resend 이메일 발송
- [x] Vercel Cron 자동 생성
- [x] 카테고리 확장 (4개 → 8개)
- [x] 아이폰 목업 UI (상태바, 사이드 버튼, 홈 인디케이터)
- [x] 미니멀 디자인 강화 (여백, 타이포그래피, 애니메이션)
- [x] 반응형: 데스크톱 폰 목업 / 모바일 풀스크린
- [x] 헤더 네비 활성 표시 + 스크롤 숨김/표시
- [x] 페이지 전환 애니메이션 (template.tsx)
- [x] 다크모드 (클래스 기반 토글)
- [x] 구독 전용 페이지 (/subscribe)
- [x] PWA manifest + 앱 아이콘
- [x] OG 이미지 동적 생성 + Apple 아이콘
- [x] 파비콘 커스텀 (SVG)
- [x] 환영 이메일 (구독 즉시 발송)
- [x] 인트로 타이핑 애니메이션 (PhoneFrame 내)
- [x] 아카이브 월별 그룹핑 + 요약 통계
- [x] 월별 AI 요약 (Gemini, 매일 갱신, DB 캐싱)
- [x] 크론 분리: 생성 (KST 00:00) + 발송 (KST 08:00)
- [x] Hobby 플랜 타임아웃 대응: maxDuration 300초
- [x] 카테고리 필터: pill 버튼 → 커스텀 드롭다운
- [x] SDK → REST API 직접 호출 (grounding metadata 버그 우회)
- [x] URL 리졸브 강화 + DuckDuckGo !ducky fallback
- [x] 소스 범위 확장 (X/Twitter, GeekNews)

### Phase 4: Testing ✅

- [x] 프로덕션 빌드 확인
- [x] Vercel 배포 (Prisma generate 빌드 수정)
- [x] 크론 실행 확인 (다이제스트 생성 + 이메일 발송)
- [x] URL 검증 성공률 94% 달성

## Backlog

> 새 기능 요청 시 여기에 추가, 스펙 작성 후 Phase로 승격

## Notes

- 진행할 때마다 Phase 상태를 업데이트하세요: ⏸️ 대기 → 🔄 진행 중 → ✅ 완료
- 결정 사항은 findings.md의 Technical Decisions에 기록하세요.
- 오류는 findings.md의 Issues Encountered에 기록하세요.
