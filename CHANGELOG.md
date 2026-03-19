# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://github.com/vouxx/ZEEK/compare/v1.0.0...v1.1.0) (2026-03-19)


### 기능 추가

* 링크 검증 강화 + 소스 다양화 (커뮤니티/블로그) ([4f3438b](https://github.com/vouxx/ZEEK/commit/4f3438b4153105a63b8defa94583016031faf98f))
* 아카이브 월별 그룹핑 + AI 월간 요약 ([9c1ee7d](https://github.com/vouxx/ZEEK/commit/9c1ee7d244cf4c995c401fbb3bcf50daaa4d60bd))
* 크론 분리 (생성 00시/발송 08시) + 병렬 처리 + 카테고리 드롭다운 ([e9b9af2](https://github.com/vouxx/ZEEK/commit/e9b9af2434de620d2755b454eee04d000a7e8af2))
* 평일 9시 자동 발송 + Gmail 구독 제한 ([eab329f](https://github.com/vouxx/ZEEK/commit/eab329ff14712f0d43d5bba0773afff403a3a070))


### 버그 수정

* 8개 개별 호출 → 1회 통합 호출로 Gemini 20 RPD 제한 해결 ([010a22e](https://github.com/vouxx/ZEEK/commit/010a22e0dbbf42788276eb5d7bf63901493eec4c))
* 순차 처리 + 4개마다 60초 대기로 Gemini 5 RPM 확실히 준수 ([46717d4](https://github.com/vouxx/ZEEK/commit/46717d459cc8623c472e454669cd30d7fb72cd54))
* 카테고리간 15초 딜레이로 Gemini rate limit 준수 ([fcf3928](https://github.com/vouxx/ZEEK/commit/fcf392814a67d0d36620a040294ad89d0bfe1076))
* 크론 자동 갱신 전면 수정 — 실제 기사 URL 확보 ([2ced3ca](https://github.com/vouxx/ZEEK/commit/2ced3ca7950d3609aac555dcbc963aea4bcf7209))
* 크론 타임아웃 해결 — maxDuration 300s + URL 검증/카테고리 병렬화 ([9cecadc](https://github.com/vouxx/ZEEK/commit/9cecadc023684aa8cc026aec86e5c6f4647cf880))
* 푸터 카피라이트 ZEEK → zei 변경 ([363b4d6](https://github.com/vouxx/ZEEK/commit/363b4d698258e153d6579b03959242f4df46a5bd))
* Gemini 5 RPM 제한 대응 — 배치 4개씩 + 429 리트라이 ([7295c39](https://github.com/vouxx/ZEEK/commit/7295c39f88131e7cf7fd2934a8f43a7b2d9df735))
* Gemini fetch 타임아웃 240초로 증가 ([89a7333](https://github.com/vouxx/ZEEK/commit/89a73336ef6e2dc733f681c81085dbad421164a0))
* SDK 대신 Gemini REST API 직접 호출 — grounding metadata 확보 ([153f569](https://github.com/vouxx/ZEEK/commit/153f5697b881041911dc2f758b914aace36938d5))
* URL 검증 실패 시 Google 검색 fallback + 빈 다이제스트 재생성 ([d0b4b58](https://github.com/vouxx/ZEEK/commit/d0b4b58258d52920bc56131ed722a00b222ba4f9))
* URL 리졸브를 302 Location 추출 방식으로 변경 — 실제 기사 URL 확보 ([25d505b](https://github.com/vouxx/ZEEK/commit/25d505be2be19734f25c2ffd89be3a054f98d911))
* URL resolve 강화 + DuckDuckGo fallback + 소스 확장 ([f3c704b](https://github.com/vouxx/ZEEK/commit/f3c704b3a178d6a8a8b9c4cc66e727e586108938))


### 리팩토링

* Neon + Prisma → Supabase 마이그레이션 ([05884d4](https://github.com/vouxx/ZEEK/commit/05884d45a4b33286f631a79649a5f5b3df308648))

## 1.0.0 (2026-02-21)


### 버그 수정

* 빌드 전 Prisma 클라이언트 생성 추가 ([08ec82f](https://github.com/vouxx/ZEEK/commit/08ec82fb91aae8222c4edf371cd4e9f1ebceaf10))
* 인트로 애니메이션 세션당 1회만 표시 ([6657bc3](https://github.com/vouxx/ZEEK/commit/6657bc3a5f108254327610efa3e8fa8d528e9702))


### 기능 추가

* 구독 시 환영 이메일 즉시 발송 ([5cd34c1](https://github.com/vouxx/ZEEK/commit/5cd34c180f5351d8216a7786a84cd47bff6e46b7))
* 아이폰 목업 UI + 미니멀 디자인 전면 리디자인 ([487031c](https://github.com/vouxx/ZEEK/commit/487031c8e0dd43672e11a199ab1e95111dbe840e))
* 아이폰 프레임 내 인트로 타이핑 애니메이션 ([c2a8088](https://github.com/vouxx/ZEEK/commit/c2a80888b87eb840f716b364cb7247cbe3d5dbc2))
* JEEK → ZEEK 리브랜딩 + standard-version 버전 관리 도입 ([717fce8](https://github.com/vouxx/ZEEK/commit/717fce8b515545e27e2b11df7af0682a56c9a3f6))
