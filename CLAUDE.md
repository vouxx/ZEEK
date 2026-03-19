# ZEEK - AI/Tech Daily Newsletter

## Project Overview

Gemini AI + Google Search를 활용한 한국어 기술 뉴스 큐레이션 및 이메일 뉴스레터 플랫폼.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (Supabase)
- **AI**: Google Gemini 2.5 Flash
- **Email**: Resend + React Email
- **Deployment**: Vercel (Cron)

## Development Workflow: Spec-Driven + File-Based Planning

### 규칙

1. **Spec First**: 기능 추가/변경 시 반드시 `specs/` 디렉토리에 스펙을 먼저 작성
2. **승인 후 구현**: 스펙을 사용자에게 보여주고 승인받은 후에만 구현 시작
3. **Planning Files**: 5-file pattern으로 진행 추적

### 파일 구조

```
specs/
  README.md            # 프로젝트 개요 (Background, Goal, How it works)
  spec.md              # 요구사항 및 상세 스펙 (What)
  plan.md              # 기술 구현 계획 (How)
  tasks.md             # 작업 계획 및 추적 (Phase 기반)
  findings.md          # 기술적 발견사항 및 결정
  progress.md          # 세션별 작업 내역
```

### 작업 흐름

1. 사용자가 기능 요청
2. `specs/spec.md` 업데이트 (새 기능 스펙 추가)
3. 사용자 승인
4. `specs/plan.md`에 기술 구현 계획 작성
5. `specs/tasks.md`에 작업 항목 분해 (Phase 기반)
6. 구현하면서 `specs/findings.md`, `specs/progress.md` 업데이트
7. 완료 후 `specs/spec.md` 최종 반영

### 스펙 작성 원칙

- **What(무엇을)** 은 `spec.md`에, **How(어떻게)** 는 `plan.md`에
- 도메인 모델, 코드 예시, 기술 구현 세부사항은 spec.md에 넣지 않음 (plan.md, findings.md에서 다룸)
- 사용자 시나리오 + 수용 기준(Given/When/Then) 포함
- 기능 요구사항은 MUST/SHOULD로 구분
- 제약사항과 성공 기준 명시

## Commands

```bash
npm run dev          # 로컬 개발 서버
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
```

## Key Directories

- `src/app/` - Next.js App Router 페이지 및 API 라우트
- `src/components/` - React 컴포넌트
- `src/lib/` - 핵심 비즈니스 로직 (gemini, digest, constants)
- `src/emails/` - React Email 템플릿
- `src/types/` - TypeScript 타입 정의
- `prisma/` - 데이터베이스 스키마 (레거시, 참조용)
- `specs/` - 스펙 및 계획 문서
