# ZEEK - AI/Tech Daily Newsletter

## Background

매일 쏟아지는 기술 뉴스를 일일이 찾아보기 어렵다.
개발자에게 필요한 핵심 뉴스만 자동으로 큐레이션해주는 서비스가 필요하다.

## Goal

Google Gemini AI가 매일 주요 기술 뉴스를 수집/요약하고,
웹과 이메일로 전달하는 한국어 데일리 뉴스레터 서비스.

## How it works

### 뉴스 수집 (매일 KST 00:00)

- Gemini AI + Google Search로 지난 24시간 뉴스 자동 수집
- 8개 카테고리, 30~40개 아이템
- grounding metadata로 실제 기사 URL 확보

### 웹 열람

- 오늘의 뉴스 홈페이지 표시 (아이폰 목업 UI)
- 카테고리 필터, 다크모드, 아카이브

### 이메일 발송 (평일 KST 08:00)

- 활성 구독자에게 다이제스트 이메일 자동 발송
- 구독/해지 관리

## Related Documents

- [spec.md](spec.md): 요구사항 및 상세 스펙
- [plan.md](plan.md): 기술 구현 계획
- [tasks.md](tasks.md): 작업 계획 및 추적
- [findings.md](findings.md): 기술적 발견사항 및 결정
- [progress.md](progress.md): 세션별 작업 내역
