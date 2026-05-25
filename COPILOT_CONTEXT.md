# 🔮 Career Navigator - AI Assistant Context Bridge (VS Code & Copilot 전용)

이 문서는 외부 AI 코딩 어시스턴트(Antigravity)와 사용자 간에 진행된 **모든 히스토리, 맥락, 설계 의도 및 디자인 가이드라인**을 담고 있습니다. 
VS Code에서 **GitHub Copilot Chat**을 사용하실 때, 이 파일을 컨텍스트로 제공하면 Copilot이 이전 대화 내용을 모두 이해한 상태에서 이어서 개발할 수 있습니다.

---

## 💡 VS Code에서 Copilot에게 질문하는 방법 (사용 안내)

VS Code의 Copilot Chat 창(`Ctrl + Alt + I` 또는 우측 사이드 패널)에 아래 예시처럼 이 파일을 언급하며 질문해 보세요.

> **질문 예시 1 (스킬 갭 보완하기):**
> > "우측 패널의 `#COPILOT_CONTEXT.md` 파일을 읽고, 여기에 적힌 옵션 A인 '직무 전환 비용(Transition Cost) 모델링'을 구현해줘. 대시보드와 스킬 갭 화면에 어떻게 UI를 붙여야 하는지 알려주고 코드를 짜줘."
>
> **질문 예시 2 (디자인 스타일 유지하기):**
> > "`#COPILOT_CONTEXT.md`에 나온 글래스모피즘 CSS 스타일을 참고해서, 대시보드의 특정 카드 배경에 보라색 광채 효과를 추가해줘."

---

## 📜 1. 프로젝트 개발 히스토리 요약 (Conversation Timeline)

1. **경량화 및 점진적 정보 공개 (Progressive Disclosure)**
   * 복잡한 HR 대시보드의 피로감을 낮추기 위해, 핵심 정보 위주로 먼저 보여주고 상세 스케일은 클릭 시 팝업/확장하도록 인터페이스 설계.
2. **5단계 동적 온보딩 마법사 (`OnboardingFlow.jsx`) 도입**
   * 고정된 가상 인물 중심의 데모에서 진화하여, 사용자가 직접 이름/부서/연차/평가 등급을 입력하고, **4대 도메인(마케팅/HR/영업/R&D)과 25개 직무** 중 하나를 골라 본인의 3대 스킬 숙련도(L1~L5)를 자가진단하는 동적 페르소나 빌더 완성.
3. **AI 맞춤형 커리어 코칭 리포트 엔진 탑재 (`careerDiagnosis.js`)**
   * 사용자가 자가진단한 직무와 연차, 경력 단계를 크로스 체크하여 **Early Stage / Growth Stage / Transition Ready / Strategy Phase / Leadership Phase**로 정밀 진단.
   * 사내 이동 확률 모델에 기반해 **최적 경로(⭐), 안정 경로, 대안 경로**를 추천하고 180일간의 초밀착 실행 가이드(30일/90일/6개월 - Current ➡ Target ➡ Gap ➡ Action 프레임)를 생성하는 로직 연동.
4. **Gemini 1.5 Flash 실시간 API 통합**
   * `useGemini.js` Custom Hook 및 전역 `GeminiContext.jsx`를 구축하여 무료 API 키를 통한 실시간 대화 지원.
   * 과금 방지를 위한 **세션당 호출 25회 한도 제한** 로직 내장.
   * API 키가 없을 경우 자연스럽게 로컬 가상 시나리오로 폴백하는 **오프라인 시뮬레이션 모드** 탑재.
   * 헤더 상단에 실시간 연동 배지(`AiStatusBadge.jsx`) 및 우측 슬라이드 드로어(`ApiKeyDrawer.jsx`) 추가.
5. **실시간 플로팅 AI 챗봇 (`AiChatBot.jsx`)**
   * 우측 하단에 상시 노출되는 대화형 챗봇 패널 구축. 사용자의 페르소나 컨텍스트를 시스템 프로프에 자동 주입하여 1:1 맞춤 피드백 제공.
6. **Git 안전성 경고 및 환경 빌드 안정화**
   * OneDrive 동기화 폴더 소유권 관련 Git 경고 해결 완료.
   * `npm run build` 결과 100% 에러 없는 깨끗한 빌드 무결성 확보.

---

## 🏗️ 2. 현재 애플리케이션 아키텍처 및 핵심 파일 맵

```
새 폴더/
├── public/
├── src/
│   ├── components/
│   │   ├── ai/
│   │   │   ├── AiChatBot.jsx      # 우측 하단 플로팅 AI 챗봇 (페르소나 자동 주입)
│   │   │   ├── AiStatusBadge.jsx  # 헤더 상단 API 연동 상태 배지 (Yellow/Green)
│   │   │   └── ApiKeyDrawer.jsx   # 우측 슬라이드형 API 키 설정 (25회 한도 안내)
│   │   ├── layout/
│   │   │   └── Layout.jsx         # 헤더, 사이드바, 플로팅 챗봇을 통합 관리하는 레이아웃
│   │   └── onboarding/
│   │       └── OnboardingFlow.jsx # 5단계 프리미엄 동적 온보딩 위자드 컴포넌트
│   ├── data/
│   │   ├── careerData.js          # Cytoscape 그래프 헬퍼 및 정적 추천 데이터
│   │   ├── careerDiagnosis.js     # AI 맞춤형 커리어 코칭 리포트 로직 및 4대 직무 텍스트 템플릿
│   │   └── *.json                 # 7대 핵심 데이터베이스 (skills, jobs, movements, trainings 등)
│   ├── hooks/
│   │   ├── GeminiContext.jsx      # Gemini API 호출 관리 전역 컨텍스트
│   │   └── useGemini.js           # Gemini API 호출 핵심 Hook (과금 방지 25회 제한)
│   ├── pages/
│   │   ├── Dashboard.jsx          # [화면 1] 메인 대시보드 및 AI 커리어 코칭 리포트 탭 카드
│   │   ├── CareerGraphPage.jsx    # [화면 2] Cytoscape.js 기반 인터랙티브 커리어 네트워크 그래프
│   │   ├── SkillGapPage.jsx       # [화면 3] 목표 직무 대비 역량 격차 분석 & 추천 교육 신청 시뮬레이션
│   │   ├── AdvisorPage.jsx        # [화면 4] 동적 사내 멘토 궤적 분석 & 외부 시장 프로파일 매칭
│   │   └── DataRequirementsPage.jsx # [보너스] 실무 도입 시 필요한 데이터 수집 요건 가이드
│   ├── index.css                  # 프리미엄 다크모드 글래스모피즘 CSS 스타일시트 (3만 9천바이트)
│   └── App.jsx                    # 전체 라우팅 및 Persona 전역 상태 관리
└── career_navigator_improvements.md # 향후 고도화 및 아키텍처 개선 로드맵
```

---

## 🎨 3. UI/UX 디자인 가이드라인 (Copilot 준수 사항)

새로운 스타일이나 컴포넌트를 설계할 때 **기존의 일관된 다크모드 및 프리미엄 스타일**을 해치지 않도록 아래 규칙을 지켜야 합니다.

*   **기본 테마**: 심해 및 우주 테마를 형상화한 다크 블루/그레이 백그라운드 (`#0b0f19` ~ `#111827`)
*   **글래스모피즘 효과**: 
    ```css
    background: rgba(17, 24, 39, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    ```
*   **포인트 컬러**: 
    *   메인/안전: Cyan (`#06b6d4`, `#22d3ee`)
    *   도전/성장: Amber/Orange (`#f59e0b`, `#fbbf24`)
    *   T자형/융합: Purple/Indigo (`#8b5cf6`, `#a78bfa`)
*   **타이포그래피**: Google Fonts `Inter` 및 `Outfit` 기반. 제목은 부드러운 화이트, 본문은 투명도가 들어간 실버 톤 적용.

---

## 🎯 4. 향후 예정된 개선 작업 (Copilot에게 일을 시켜보세요!)

아래 고도화 과제는 **Copilot Chat**과 즉시 함께 논의하여 확장해 나갈 수 있는 훌륭한 주제들입니다.

### 🌟 4.1 직무 전환 비용(Transition Cost) 모델링
*   **스펙**: 단순히 목표를 보여주는 것을 넘어, 사용자가 설정한 목표 직무(`targetJobId`)로 가는 난이도를 시각화합니다.
*   **공식**: `스킬 갭 개수 x 0.5 + 사내 이동 평균 연차 + 타 조직 이동 여부 가산점`을 계산해 전환 난이도(쉬움/보통/어려움)와 예상 기간 배지를 추가합니다.

### 🌟 4.2 조직 수요(Organization Demand) 융합 매칭
*   **스펙**: `jobs.json`에 정의된 `vacancies` (공석 수)와 `growthTrend` (성장세) 데이터를 활용하여, 공석이 풍부한 직무에는 `🟢 즉시 지원 가능` 배지를 달고, 축소 중인 직무에는 `⚠️ 경쟁 치열` 배지를 다는 로직을 구현합니다.

### 🌟 4.3 스킬 ID 체계 표준화 (데이터 리팩토링)
*   **스펙**: `SK_HR_01`과 같이 레거시로 남겨진 임시 매핑 코드(`SKILL_MAP`)를 걷어내고, `trainings.json`과 `skills.json` 간의 스킬 식별 키 코드를 일원화하여 코드를 간결하게 만듭니다.

---
*본 파일은 Antigravity 에이전트가 생성한 컨텍스트 브리지 문서입니다. 언제든 이 파일을 VS Code에서 업데이트하거나 Copilot의 프롬프트로 활용해 주세요.*
