// ============================================================
// Career Graph 데이터 — 직무 네트워크 (Fake Data)
// ============================================================

// 직무 노드 정의
// 조직 레벨 상수
export const ORG_LEVELS = {
  DIVISION: 'division',   // 사업부 (가장 하위 실행 단위)
  BU: 'bu',              // 본부 (Business Unit)
  HQ: 'hq'              // 본사 (Corporate Headquarters)
}

export const ORG_LEVEL_LABELS = {
  division: '사업부',
  bu: '본부',
  hq: '본사'
}

export let JOB_NODES = {
  // ============================================================
  // HR 직무군 — 사업부 레벨 (CHO 라인)
  // ============================================================
  JOB_HR_RECRUIT: { id: 'JOB_HR_RECRUIT', name: '채용', family: 'HR', cLine: 'CHO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 35, vacancies: 1, avgTenure: 3.2, growthTrend: 'stable', description: '채용 전략 수립, ATS 운영, 면접 프로세스 관리', upperLevelJobId: 'JOB_HR_RECRUIT_BU' },
  JOB_HR_HRD: { id: 'JOB_HR_HRD', name: 'HRD', family: 'HR', cLine: 'CHO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 25, vacancies: 2, avgTenure: 2.8, growthTrend: 'growing', description: '교육 체계 설계, 리더십 개발, 조직개발 프로그램 운영', upperLevelJobId: 'JOB_HR_HRD_BU' },
  JOB_HR_HRBP: { id: 'JOB_HR_HRBP', name: 'HRBP', family: 'HR', cLine: 'CHO', orgLevel: 'division', orgLevelLabel: '사업부', level: '책임', isHub: true, isLeadership: false, isDeadEnd: false, headcount: 40, vacancies: 3, avgTenure: 3.5, growthTrend: 'growing', description: '사업부 밀착형 HR 파트너로서 인사 전략 수립 및 실행', upperLevelJobId: 'JOB_HR_HRBP_BU' },
  JOB_HR_CNB: { id: 'JOB_HR_CNB', name: 'C&B', family: 'HR', cLine: 'CHO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 20, vacancies: 0, avgTenure: 4.1, growthTrend: 'stable', description: '보상 체계 설계, 복리후생 운영, 시장 보상 벤치마크', upperLevelJobId: 'JOB_HR_CNB_BU' },
  JOB_HR_LABOR: { id: 'JOB_HR_LABOR', name: '노무관리', family: 'HR', cLine: 'CHO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: true, headcount: 15, vacancies: 0, avgTenure: 5.2, growthTrend: 'declining', description: '노사관계 관리, 근로기준법 준수, 노동 분쟁 대응', upperLevelJobId: null },
  JOB_HR_PLAN: { id: 'JOB_HR_PLAN', name: '인사기획', family: 'HR', cLine: 'CHO', orgLevel: 'division', orgLevelLabel: '사업부', level: '책임', isHub: false, isLeadership: true, isDeadEnd: false, headcount: 15, vacancies: 1, avgTenure: 3.0, growthTrend: 'stable', description: '중장기 인사 전략 수립, 인력 계획, 제도 기획', upperLevelJobId: 'JOB_HR_PLAN_BU' },
  JOB_HR_ANALYTICS: { id: 'JOB_HR_ANALYTICS', name: 'HR Analytics', family: 'HR', cLine: 'CHO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 10, vacancies: 2, avgTenure: 2.5, growthTrend: 'growing', description: 'HR 데이터 분석, People Analytics, 의사결정 지원', upperLevelJobId: 'JOB_HR_ANALYTICS_BU' },

  // HR 직무군 — 본부 레벨 (CHO 라인)
  JOB_HR_HRBP_BU: { id: 'JOB_HR_HRBP_BU', name: 'HRBP 총괄', family: 'HR', cLine: 'CHO', orgLevel: 'bu', orgLevelLabel: '본부', level: '수석', isHub: true, isLeadership: true, isDeadEnd: false, headcount: 12, vacancies: 1, avgTenure: 4.0, growthTrend: 'growing', description: '본부 단위 HR 파트너 총괄, 사업본부 HR 전략 수립 및 실행', upperLevelJobId: 'JOB_HR_HRBP_HQ' },
  JOB_HR_HRD_BU: { id: 'JOB_HR_HRD_BU', name: 'HRD 기획', family: 'HR', cLine: 'CHO', orgLevel: 'bu', orgLevelLabel: '본부', level: '수석', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 8, vacancies: 1, avgTenure: 3.8, growthTrend: 'growing', description: '본부 인재 육성 체계 설계, 기술직군 HRD 프로그램 총괄', upperLevelJobId: null },
  JOB_HR_PLAN_BU: { id: 'JOB_HR_PLAN_BU', name: '인사기획 팀장', family: 'HR', cLine: 'CHO', orgLevel: 'bu', orgLevelLabel: '본부', level: '수석', isHub: false, isLeadership: true, isDeadEnd: false, headcount: 6, vacancies: 0, avgTenure: 4.5, growthTrend: 'stable', description: '사업본부 전체 인사 전략 총괄, 중장기 인력 계획, CHO 보좌', upperLevelJobId: 'JOB_HR_PLAN_HQ' },
  JOB_HR_RECRUIT_BU: { id: 'JOB_HR_RECRUIT_BU', name: '채용 기획', family: 'HR', cLine: 'CHO', orgLevel: 'bu', orgLevelLabel: '본부', level: '수석', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 7, vacancies: 0, avgTenure: 3.5, growthTrend: 'stable', description: '본부 채용 전략 수립, 기술직군 인재 파이프라인 구축', upperLevelJobId: null },
  JOB_HR_CNB_BU: { id: 'JOB_HR_CNB_BU', name: 'C&B 기획', family: 'HR', cLine: 'CHO', orgLevel: 'bu', orgLevelLabel: '본부', level: '수석', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 5, vacancies: 0, avgTenure: 4.0, growthTrend: 'stable', description: '본부 보상 체계 설계, 기술직군 보상 벤치마크', upperLevelJobId: null },
  JOB_HR_ANALYTICS_BU: { id: 'JOB_HR_ANALYTICS_BU', name: 'HR Analytics 리더', family: 'HR', cLine: 'CHO', orgLevel: 'bu', orgLevelLabel: '본부', level: '수석', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 4, vacancies: 1, avgTenure: 3.0, growthTrend: 'growing', description: '본부 People Analytics 총괄, HR 데이터 전략 수립', upperLevelJobId: null },

  // HR 직무군 — 본사 레벨 (CHO 라인)
  JOB_HR_PLAN_HQ: { id: 'JOB_HR_PLAN_HQ', name: '전사 인사기획', family: 'HR', cLine: 'CHO', orgLevel: 'hq', orgLevelLabel: '본사', level: '임원', isHub: false, isLeadership: true, isDeadEnd: false, headcount: 3, vacancies: 0, avgTenure: 5.0, growthTrend: 'stable', description: '전사 HR 정책·제도 수립, 임원 인사, 그룹 차원 인사 전략', upperLevelJobId: null },
  JOB_HR_HRBP_HQ: { id: 'JOB_HR_HRBP_HQ', name: '전사 HRBP 총괄', family: 'HR', cLine: 'CHO', orgLevel: 'hq', orgLevelLabel: '본사', level: '임원', isHub: true, isLeadership: true, isDeadEnd: false, headcount: 2, vacancies: 0, avgTenure: 5.5, growthTrend: 'growing', description: '전사 HR 파트너 체계 총괄, 사업부별 HR 전략 조율, CHO 직속', upperLevelJobId: null },

  // ============================================================
  // 마케팅 직무군 — 사업부 레벨
  // ============================================================
  JOB_MKT_PERF: { id: 'JOB_MKT_PERF', name: '퍼포먼스 마케팅', family: '마케팅', cLine: 'CMO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 45, vacancies: 3, avgTenure: 2.8, growthTrend: 'growing', description: '디지털 광고 캠페인 기획·집행·최적화, ROAS 관리', upperLevelJobId: 'JOB_MKT_PM_BU' },
  JOB_MKT_BRAND: { id: 'JOB_MKT_BRAND', name: '브랜드 마케팅', family: '마케팅', cLine: 'CMO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 30, vacancies: 1, avgTenure: 3.5, growthTrend: 'stable', description: '브랜드 전략 수립, 브랜드 캠페인 기획, 브랜드 가치 관리', upperLevelJobId: 'JOB_MKT_PM_BU' },
  JOB_MKT_CONTENT: { id: 'JOB_MKT_CONTENT', name: '콘텐츠 마케팅', family: '마케팅', cLine: 'CMO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 25, vacancies: 2, avgTenure: 2.5, growthTrend: 'growing', description: '콘텐츠 전략, SNS 운영, 영상/블로그/뉴스레터 기획·제작', upperLevelJobId: 'JOB_MKT_PM_BU' },
  JOB_MKT_CRM: { id: 'JOB_MKT_CRM', name: 'CRM 마케팅', family: '마케팅', cLine: 'CMO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 20, vacancies: 1, avgTenure: 3.0, growthTrend: 'growing', description: '고객 세그먼테이션, 리텐션 캠페인, CRM 시스템 운영', upperLevelJobId: 'JOB_MKT_PM_BU' },
  JOB_MKT_PM: { id: 'JOB_MKT_PM', name: '통합 마케팅 PM', family: '마케팅', cLine: 'CMO', orgLevel: 'division', orgLevelLabel: '사업부', level: '책임', isHub: true, isLeadership: false, isDeadEnd: false, headcount: 15, vacancies: 1, avgTenure: 3.2, growthTrend: 'growing', description: '전사 마케팅 캠페인 총괄, 채널 통합 전략, 예산 관리', upperLevelJobId: 'JOB_MKT_PM_BU' },
  JOB_MKT_STRATEGY: { id: 'JOB_MKT_STRATEGY', name: '마케팅 전략', family: '마케팅', cLine: 'CMO', orgLevel: 'division', orgLevelLabel: '사업부', level: '책임', isHub: false, isLeadership: true, isDeadEnd: false, headcount: 10, vacancies: 0, avgTenure: 3.8, growthTrend: 'stable', description: '시장 분석, 마케팅 전략 수립, CMO 보좌', upperLevelJobId: 'JOB_MKT_STRATEGY_BU' },

  // 마케팅 직무군 — 본부/본사 레벨
  JOB_MKT_PM_BU: { id: 'JOB_MKT_PM_BU', name: '마케팅 PM 총괄', family: '마케팅', cLine: 'CMO', orgLevel: 'bu', orgLevelLabel: '본부', level: '수석', isHub: true, isLeadership: true, isDeadEnd: false, headcount: 8, vacancies: 1, avgTenure: 4.0, growthTrend: 'growing', description: '사업본부 마케팅 캠페인 총괄, 전채널 통합 전략, CMO 보좌', upperLevelJobId: null },
  JOB_MKT_STRATEGY_BU: { id: 'JOB_MKT_STRATEGY_BU', name: '마케팅 전략 팀장', family: '마케팅', cLine: 'CMO', orgLevel: 'bu', orgLevelLabel: '본부', level: '수석', isHub: false, isLeadership: true, isDeadEnd: false, headcount: 5, vacancies: 0, avgTenure: 4.5, growthTrend: 'stable', description: '본부 마케팅 전략 총괄, 시장·경쟁사 분석, 사업부 마케팅 조율', upperLevelJobId: null },

  // ============================================================
  // 영업 직무군 — 사업부 레벨
  // ============================================================
  JOB_SALES_NEW: { id: 'JOB_SALES_NEW', name: '신규영업', family: '영업', cLine: 'CCO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 50, vacancies: 5, avgTenure: 2.5, growthTrend: 'stable', description: '신규 고객 발굴, 제안서 작성, 영업 파이프라인 관리', upperLevelJobId: 'JOB_SALES_PLAN_BU' },
  JOB_SALES_KAM: { id: 'JOB_SALES_KAM', name: 'KAM', family: '영업', cLine: 'CCO', orgLevel: 'division', orgLevelLabel: '사업부', level: '책임', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 25, vacancies: 2, avgTenure: 3.8, growthTrend: 'stable', description: '핵심 고객 관계 관리, 장기 파트너십 구축, 매출 극대화', upperLevelJobId: 'JOB_SALES_MGMT_BU' },
  JOB_SALES_PLAN: { id: 'JOB_SALES_PLAN', name: '영업기획', family: '영업', cLine: 'CCO', orgLevel: 'division', orgLevelLabel: '사업부', level: '책임', isHub: true, isLeadership: false, isDeadEnd: false, headcount: 20, vacancies: 1, avgTenure: 3.0, growthTrend: 'growing', description: '영업 전략 수립, 실적 분석, 인센티브 설계', upperLevelJobId: 'JOB_SALES_PLAN_BU' },
  JOB_SALES_CHANNEL: { id: 'JOB_SALES_CHANNEL', name: '채널영업', family: '영업', cLine: 'CCO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 30, vacancies: 2, avgTenure: 3.2, growthTrend: 'stable', description: '유통 채널 관리, 파트너사 협업, 채널별 매출 관리', upperLevelJobId: 'JOB_SALES_PLAN_BU' },
  JOB_SALES_MGMT: { id: 'JOB_SALES_MGMT', name: '영업관리', family: '영업', cLine: 'CCO', orgLevel: 'division', orgLevelLabel: '사업부', level: '책임', isHub: false, isLeadership: true, isDeadEnd: false, headcount: 15, vacancies: 0, avgTenure: 4.0, growthTrend: 'stable', description: '영업 조직 관리, CRM 시스템 운영, 매출 예측', upperLevelJobId: 'JOB_SALES_MGMT_BU' },
  JOB_SALES_OVERSEAS: { id: 'JOB_SALES_OVERSEAS', name: '해외영업', family: '영업', cLine: 'CCO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 20, vacancies: 3, avgTenure: 3.5, growthTrend: 'growing', description: '해외 시장 개척, 수출 관리, 현지 파트너 관리', upperLevelJobId: 'JOB_SALES_PLAN_BU' },

  // 영업 직무군 — 본부/본사 레벨
  JOB_SALES_PLAN_BU: { id: 'JOB_SALES_PLAN_BU', name: '영업기획 팀장', family: '영업', cLine: 'CCO', orgLevel: 'bu', orgLevelLabel: '본부', level: '수석', isHub: true, isLeadership: true, isDeadEnd: false, headcount: 7, vacancies: 1, avgTenure: 4.0, growthTrend: 'growing', description: '본부 영업 전략 총괄, 전채널 실적 분석, CCO 보좌', upperLevelJobId: null },
  JOB_SALES_MGMT_BU: { id: 'JOB_SALES_MGMT_BU', name: '영업관리 팀장', family: '영업', cLine: 'CCO', orgLevel: 'bu', orgLevelLabel: '본부', level: '수석', isHub: false, isLeadership: true, isDeadEnd: false, headcount: 5, vacancies: 0, avgTenure: 4.5, growthTrend: 'stable', description: '본부 영업 조직 관리, CRM 전략 총괄, 매출 예측 모델', upperLevelJobId: null },

  // ============================================================
  // R&D 직무군 — 사업부 레벨
  // ============================================================
  JOB_RND_MATERIAL: { id: 'JOB_RND_MATERIAL', name: '소재연구', family: 'R&D', cLine: 'CTO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 40, vacancies: 2, avgTenure: 4.0, growthTrend: 'stable', description: '신소재 탐색, 소재 물성 분석, 시제품 제작', upperLevelJobId: 'JOB_RND_PLAN_BU' },
  JOB_RND_PROCESS: { id: 'JOB_RND_PROCESS', name: '공정개발', family: 'R&D', cLine: 'CTO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 35, vacancies: 2, avgTenure: 3.5, growthTrend: 'stable', description: '제조 공정 설계, 공정 최적화, 수율 개선', upperLevelJobId: 'JOB_RND_PLAN_BU' },
  JOB_RND_MASS: { id: 'JOB_RND_MASS', name: '양산기술', family: 'R&D', cLine: 'CTO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: true, headcount: 30, vacancies: 1, avgTenure: 5.0, growthTrend: 'declining', description: '양산 라인 기술 지원, 생산성 향상, 불량 분석', upperLevelJobId: null },
  JOB_RND_QUALITY: { id: 'JOB_RND_QUALITY', name: '품질R&D', family: 'R&D', cLine: 'CTO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 25, vacancies: 1, avgTenure: 3.8, growthTrend: 'stable', description: '품질 표준 수립, 신뢰성 시험, 품질 데이터 분석', upperLevelJobId: 'JOB_RND_PLAN_BU' },
  JOB_RND_PLAN: { id: 'JOB_RND_PLAN', name: 'R&D기획', family: 'R&D', cLine: 'CTO', orgLevel: 'division', orgLevelLabel: '사업부', level: '책임', isHub: true, isLeadership: true, isDeadEnd: false, headcount: 15, vacancies: 1, avgTenure: 3.0, growthTrend: 'growing', description: 'R&D 로드맵 수립, 과제 관리, 기술 전략', upperLevelJobId: 'JOB_RND_PLAN_BU' },
  JOB_RND_AI: { id: 'JOB_RND_AI', name: 'AI/SW개발', family: 'R&D', cLine: 'CTO', orgLevel: 'division', orgLevelLabel: '사업부', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 20, vacancies: 5, avgTenure: 2.0, growthTrend: 'growing', description: 'AI 모델 개발, SW 설계, MLOps 구축', upperLevelJobId: 'JOB_RND_PLAN_BU' },

  // R&D 직무군 — 본부/본사 레벨
  JOB_RND_PLAN_BU: { id: 'JOB_RND_PLAN_BU', name: 'R&D기획 팀장', family: 'R&D', cLine: 'CTO', orgLevel: 'bu', orgLevelLabel: '본부', level: '수석', isHub: true, isLeadership: true, isDeadEnd: false, headcount: 6, vacancies: 1, avgTenure: 4.5, growthTrend: 'growing', description: '본부 R&D 전략 총괄, 중장기 기술 로드맵, CTO 보좌', upperLevelJobId: 'JOB_RND_PLAN_HQ' },
  JOB_RND_PLAN_HQ: { id: 'JOB_RND_PLAN_HQ', name: '전사 기술전략', family: 'R&D', cLine: 'CTO', orgLevel: 'hq', orgLevelLabel: '본사', level: '임원', isHub: false, isLeadership: true, isDeadEnd: false, headcount: 3, vacancies: 0, avgTenure: 5.5, growthTrend: 'growing', description: '전사 R&D 전략 수립, 미래 기술 투자 방향, CTO 직속', upperLevelJobId: null },
}

// 직무 이동 엣지 (from -> to, count, source)
export let JOB_MOVEMENTS = [
  // HR 내부 이동
  { from: 'JOB_HR_RECRUIT', to: 'JOB_HR_HRBP', count: 18, source: 'both', avgYears: 3.5, sameBU: false },
  { from: 'JOB_HR_RECRUIT', to: 'JOB_HR_HRD', count: 8, source: 'internal', avgYears: 3.0, sameBU: true },
  { from: 'JOB_HR_RECRUIT', to: 'JOB_HR_ANALYTICS', count: 5, source: 'both', avgYears: 4.0, sameBU: true },
  { from: 'JOB_HR_HRD', to: 'JOB_HR_HRBP', count: 15, source: 'both', avgYears: 3.0, sameBU: false },
  { from: 'JOB_HR_HRD', to: 'JOB_HR_PLAN', count: 7, source: 'internal', avgYears: 4.0, sameBU: true },
  { from: 'JOB_HR_HRBP', to: 'JOB_HR_PLAN', count: 20, source: 'both', avgYears: 3.5, sameBU: false },
  { from: 'JOB_HR_HRBP', to: 'JOB_HR_HRD', count: 10, source: 'internal', avgYears: 2.5, sameBU: true },
  { from: 'JOB_HR_HRBP', to: 'JOB_HR_CNB', count: 6, source: 'internal', avgYears: 3.0, sameBU: true },
  { from: 'JOB_HR_HRBP', to: 'JOB_HR_RECRUIT', count: 4, source: 'internal', avgYears: 2.0, sameBU: true },
  { from: 'JOB_HR_CNB', to: 'JOB_HR_HRBP', count: 8, source: 'both', avgYears: 3.5, sameBU: false },
  { from: 'JOB_HR_CNB', to: 'JOB_HR_PLAN', count: 5, source: 'internal', avgYears: 4.5, sameBU: true },
  { from: 'JOB_HR_LABOR', to: 'JOB_HR_HRBP', count: 3, source: 'internal', avgYears: 5.0, sameBU: false },
  { from: 'JOB_HR_ANALYTICS', to: 'JOB_HR_HRBP', count: 6, source: 'both', avgYears: 3.0, sameBU: false },
  { from: 'JOB_HR_ANALYTICS', to: 'JOB_HR_PLAN', count: 4, source: 'internal', avgYears: 3.5, sameBU: true },
  { from: 'JOB_HR_PLAN', to: 'JOB_HR_HRBP', count: 5, source: 'internal', avgYears: 2.0, sameBU: false },

  // 마케팅 내부 이동
  { from: 'JOB_MKT_PERF', to: 'JOB_MKT_PM', count: 14, source: 'both', avgYears: 3.0, sameBU: true },
  { from: 'JOB_MKT_PERF', to: 'JOB_MKT_CRM', count: 10, source: 'internal', avgYears: 2.5, sameBU: true },
  { from: 'JOB_MKT_PERF', to: 'JOB_MKT_BRAND', count: 7, source: 'both', avgYears: 3.5, sameBU: true },
  { from: 'JOB_MKT_PERF', to: 'JOB_MKT_CONTENT', count: 6, source: 'internal', avgYears: 2.0, sameBU: true },
  { from: 'JOB_MKT_BRAND', to: 'JOB_MKT_PM', count: 16, source: 'both', avgYears: 3.0, sameBU: true },
  { from: 'JOB_MKT_BRAND', to: 'JOB_MKT_STRATEGY', count: 10, source: 'both', avgYears: 4.0, sameBU: true },
  { from: 'JOB_MKT_CONTENT', to: 'JOB_MKT_BRAND', count: 8, source: 'internal', avgYears: 2.5, sameBU: true },
  { from: 'JOB_MKT_CONTENT', to: 'JOB_MKT_PM', count: 6, source: 'internal', avgYears: 3.0, sameBU: true },
  { from: 'JOB_MKT_CRM', to: 'JOB_MKT_PM', count: 9, source: 'both', avgYears: 2.5, sameBU: true },
  { from: 'JOB_MKT_CRM', to: 'JOB_MKT_PERF', count: 4, source: 'internal', avgYears: 2.0, sameBU: true },
  { from: 'JOB_MKT_PM', to: 'JOB_MKT_STRATEGY', count: 15, source: 'both', avgYears: 3.5, sameBU: true },
  { from: 'JOB_MKT_PM', to: 'JOB_MKT_BRAND', count: 5, source: 'internal', avgYears: 2.0, sameBU: true },

  // 영업 내부 이동
  { from: 'JOB_SALES_NEW', to: 'JOB_SALES_KAM', count: 20, source: 'both', avgYears: 3.0, sameBU: true },
  { from: 'JOB_SALES_NEW', to: 'JOB_SALES_PLAN', count: 8, source: 'internal', avgYears: 3.5, sameBU: true },
  { from: 'JOB_SALES_NEW', to: 'JOB_SALES_CHANNEL', count: 12, source: 'internal', avgYears: 2.5, sameBU: true },
  { from: 'JOB_SALES_NEW', to: 'JOB_SALES_OVERSEAS', count: 7, source: 'internal', avgYears: 3.0, sameBU: false },
  { from: 'JOB_SALES_KAM', to: 'JOB_SALES_PLAN', count: 12, source: 'both', avgYears: 3.0, sameBU: true },
  { from: 'JOB_SALES_KAM', to: 'JOB_SALES_MGMT', count: 10, source: 'both', avgYears: 4.0, sameBU: true },
  { from: 'JOB_SALES_CHANNEL', to: 'JOB_SALES_PLAN', count: 9, source: 'internal', avgYears: 3.0, sameBU: true },
  { from: 'JOB_SALES_CHANNEL', to: 'JOB_SALES_KAM', count: 6, source: 'internal', avgYears: 3.5, sameBU: true },
  { from: 'JOB_SALES_PLAN', to: 'JOB_SALES_MGMT', count: 15, source: 'both', avgYears: 3.5, sameBU: true },
  { from: 'JOB_SALES_OVERSEAS', to: 'JOB_SALES_PLAN', count: 5, source: 'internal', avgYears: 4.0, sameBU: false },
  { from: 'JOB_SALES_OVERSEAS', to: 'JOB_SALES_KAM', count: 4, source: 'internal', avgYears: 3.0, sameBU: false },

  // R&D 내부 이동
  { from: 'JOB_RND_MATERIAL', to: 'JOB_RND_PROCESS', count: 14, source: 'both', avgYears: 3.5, sameBU: true },
  { from: 'JOB_RND_MATERIAL', to: 'JOB_RND_PLAN', count: 6, source: 'internal', avgYears: 5.0, sameBU: true },
  { from: 'JOB_RND_PROCESS', to: 'JOB_RND_MASS', count: 10, source: 'internal', avgYears: 3.0, sameBU: true },
  { from: 'JOB_RND_PROCESS', to: 'JOB_RND_PLAN', count: 8, source: 'both', avgYears: 4.5, sameBU: true },
  { from: 'JOB_RND_PROCESS', to: 'JOB_RND_QUALITY', count: 7, source: 'internal', avgYears: 3.0, sameBU: true },
  { from: 'JOB_RND_QUALITY', to: 'JOB_RND_PLAN', count: 5, source: 'internal', avgYears: 4.0, sameBU: true },
  { from: 'JOB_RND_QUALITY', to: 'JOB_RND_PROCESS', count: 4, source: 'internal', avgYears: 3.0, sameBU: true },
  { from: 'JOB_RND_MASS', to: 'JOB_RND_PROCESS', count: 3, source: 'internal', avgYears: 4.0, sameBU: true },
  { from: 'JOB_RND_AI', to: 'JOB_RND_PLAN', count: 4, source: 'both', avgYears: 4.0, sameBU: true },
  { from: 'JOB_RND_AI', to: 'JOB_RND_PROCESS', count: 3, source: 'internal', avgYears: 3.0, sameBU: true },
  { from: 'JOB_RND_PLAN', to: 'JOB_RND_MATERIAL', count: 3, source: 'internal', avgYears: 2.0, sameBU: true },

  // 크로스 직무군 이동 (도전형)
  { from: 'JOB_HR_ANALYTICS', to: 'JOB_RND_AI', count: 3, source: 'external', avgYears: 4.0, sameBU: false },
  { from: 'JOB_MKT_CRM', to: 'JOB_SALES_PLAN', count: 4, source: 'both', avgYears: 3.5, sameBU: false },
  { from: 'JOB_MKT_PERF', to: 'JOB_SALES_NEW', count: 3, source: 'external', avgYears: 3.0, sameBU: false },
  { from: 'JOB_SALES_PLAN', to: 'JOB_MKT_STRATEGY', count: 3, source: 'external', avgYears: 4.5, sameBU: false },
  { from: 'JOB_HR_HRD', to: 'JOB_MKT_CONTENT', count: 2, source: 'external', avgYears: 4.0, sameBU: false },
  { from: 'JOB_RND_AI', to: 'JOB_HR_ANALYTICS', count: 2, source: 'external', avgYears: 3.5, sameBU: false },
]

// 시나리오별 필터링 로직
export function filterByScenario(currentJobId, scenario) {
  const currentJob = JOB_NODES[currentJobId]
  if (!currentJob) return { nodes: [], edges: [] }

  const currentFamily = currentJob.family
  let relevantEdges = []
  let relevantNodeIds = new Set([currentJobId])

  // 1. 대용량 실 데이터셋인지 판단 (동적인 데이터 Pruning 장치 작동)
  const isLargeDataset = JOB_MOVEMENTS.length > 200

  // 🔒 사용자 최신 피드백 전격 반영: 너무 많은 교차 직무 옵션과 소음을 차단하기 위해,
  // 오직 내가 선택한 직무군(currentFamily) 내부의 상세 직무 간 이동 경로로만 전체 그래프를 100% 엄격하게 한정합니다.
  const connectedMovements = JOB_MOVEMENTS.filter(e => {
    const fromJob = JOB_NODES[e.from]
    const toJob = JOB_NODES[e.to]
    return fromJob?.family === currentFamily && toJob?.family === currentFamily
  })

  if (scenario === 'safe') {
    // 안전형: 동일 직무군 내 핵심 직접 이동
    const familyEdges = connectedMovements.filter(e => {
      return e.from === currentJobId || e.to === currentJobId
    })
    relevantEdges = familyEdges
  } else if (scenario === 'challenge') {
    // 도전형: 동일 직무군 내의 모든 간접 경로 및 순환 경로 포함
    if (isLargeDataset) {
      const direct = connectedMovements.filter(e => e.from === currentJobId || e.to === currentJobId)
      const directIds = new Set(direct.flatMap(e => [e.from, e.to]))
      const indirect = connectedMovements
        .filter(e => e.from !== currentJobId && e.to !== currentJobId && (directIds.has(e.from) || directIds.has(e.to)))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15)
      relevantEdges = [...direct, ...indirect]
    } else {
      relevantEdges = connectedMovements
    }
  } else {
    // T자형: 동일 직무군 내에서 허브 직무(예: HRBP, 통합마케팅PM, 영업기획, R&D기획)를 거치는 최적 경로 리딩
    const hubIds = Object.values(JOB_NODES)
      .filter(j => j.isHub && j.family === currentFamily)
      .map(j => j.id)
    
    const hubEdges = connectedMovements.filter(e => {
      return hubIds.includes(e.from) || hubIds.includes(e.to)
    })

    const direct = connectedMovements.filter(e => e.from === currentJobId || e.to === currentJobId)
    let candidateEdges = [...direct, ...hubEdges]
    
    // 중복 제거
    const seen = new Set()
    candidateEdges = candidateEdges.filter(e => {
      const key = `${e.from}-${e.to}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    relevantEdges = candidateEdges
  }

  // 최종 안전장치: 전체 엣지 수가 30개를 넘지 않도록 최종 pruning (이동 횟수 기준)해 복잡도를 차단
  if (relevantEdges.length > 30) {
    const direct = relevantEdges.filter(e => e.from === currentJobId || e.to === currentJobId)
    const indirect = relevantEdges
      .filter(e => e.from !== currentJobId && e.to !== currentJobId)
      .sort((a, b) => b.count - a.count)
    relevantEdges = [...direct, ...indirect].slice(0, 30)
  }

  relevantEdges.forEach(e => {
    relevantNodeIds.add(e.from)
    relevantNodeIds.add(e.to)
  })

  const nodes = Array.from(relevantNodeIds).map(id => JOB_NODES[id]).filter(Boolean)
  return { nodes, edges: relevantEdges }
}

// Cytoscape 포맷 변환 (부모 컨테이너를 가진 2층 Compound Node 토폴로지 자동 빌드)
export function toCytoscapeElements(currentJobId, scenario) {
  const { nodes, edges } = filterByScenario(currentJobId, scenario)
  const maxCount = Math.max(...edges.map(e => e.count), 1)

  const elements = []

  // 1. 활성화된 직무군(family)별로 부모 Compound Node를 선행 생성하여 삽입
  const activeFamilies = new Set(nodes.map(n => n.family))
  activeFamilies.forEach(family => {
    elements.push({
      data: {
        id: `parent_${family}`,
        label: family
      }
    })
  })

  // 2. 상세 직무 노드 주입 (부모 컨테이너 지정)
  nodes.forEach(node => {
    let nodeType = 'normal'
    if (node.id === currentJobId) nodeType = 'current'
    else if (node.isHub) nodeType = 'hub'
    else if (node.isLeadership) nodeType = 'leadership'
    else if (node.isDeadEnd) nodeType = 'deadend'

    elements.push({
      data: {
        id: node.id,
        label: node.name,
        nodeType,
        parent: `parent_${node.family}`, // 🔒 부모 compound node 매핑
        family: node.family,
        headcount: node.headcount,
        avgTenure: node.avgTenure,
        vacancies: node.vacancies,
        growthTrend: node.growthTrend,
        isHub: node.isHub,
        isLeadership: node.isLeadership,
        isDeadEnd: node.isDeadEnd,
        description: node.description,
        level: node.level,
      }
    })
  })

  // 3. 이동 경로(엣지) 주입
  edges.forEach(edge => {
    const width = 1 + (edge.count / maxCount) * 6

    elements.push({
      data: {
        id: `${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        count: edge.count,
        avgYears: edge.avgYears,
        width,
        source_type: edge.source,
      }
    })
  })

  return elements
}

// 스킬 갭 계산 (현재 직무 → 목표 직무)
export let JOB_REQUIRED_SKILLS = {
  // HR 직무군
  JOB_HR_RECRUIT: [
    { skillId: 'SK_HR_01', name: 'ATS 운영', minLevel: 3 },
    { skillId: 'SK_HR_02', name: '면접 코디네이션', minLevel: 3 },
    { skillId: 'SK_HR_03', name: '채용 브랜딩', minLevel: 3 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 3 }
  ],
  JOB_HR_HRD: [
    { skillId: 'SK_HR_04', name: '인력 계획', minLevel: 3 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 4 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 }
  ],
  JOB_HR_HRBP: [
    { skillId: 'SK_HR_04', name: '인력 계획', minLevel: 3 },
    { skillId: 'SK_HR_05', name: 'HR 데이터 분석', minLevel: 3 },
    { skillId: 'SK_HR_06', name: '조직 진단', minLevel: 3 },
    { skillId: 'SK_HR_07', name: '성과 관리', minLevel: 4 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 5 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 },
    { skillId: 'SK_COMMON_06', name: '전략 수립', minLevel: 3 },
  ],
  JOB_HR_CNB: [
    { skillId: 'SK_HR_04', name: '인력 계획', minLevel: 3 },
    { skillId: 'SK_COMMON_01', name: '데이터 분석', minLevel: 4 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 }
  ],
  JOB_HR_LABOR: [
    { skillId: 'SK_HR_04', name: '인력 계획', minLevel: 2 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 4 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 }
  ],
  JOB_HR_PLAN: [
    { skillId: 'SK_HR_04', name: '인력 계획', minLevel: 4 },
    { skillId: 'SK_HR_07', name: '성과 관리', minLevel: 4 },
    { skillId: 'SK_COMMON_06', name: '전략 수립', minLevel: 4 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 4 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 5 },
  ],
  JOB_HR_ANALYTICS: [
    { skillId: 'SK_HR_05', name: 'HR 데이터 분석', minLevel: 4 },
    { skillId: 'SK_COMMON_01', name: '데이터 분석', minLevel: 4 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 }
  ],

  // 마케팅 직무군
  JOB_MKT_PERF: [
    { skillId: 'SK_MKT_01', name: '퍼포먼스 광고', minLevel: 3 },
    { skillId: 'SK_MKT_02', name: 'GA 분석', minLevel: 3 },
    { skillId: 'SK_COMMON_01', name: '데이터 분석', minLevel: 3 }
  ],
  JOB_MKT_BRAND: [
    { skillId: 'SK_MKT_05', name: '브랜드 전략', minLevel: 4 },
    { skillId: 'SK_MKT_03', name: '콘텐츠 기획', minLevel: 3 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 4 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 },
    { skillId: 'SK_COMMON_05', name: '시장 분석', minLevel: 3 },
  ],
  JOB_MKT_CONTENT: [
    { skillId: 'SK_MKT_03', name: '콘텐츠 기획', minLevel: 4 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 3 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 }
  ],
  JOB_MKT_CRM: [
    { skillId: 'SK_MKT_04', name: 'CRM 마케팅', minLevel: 3 },
    { skillId: 'SK_COMMON_01', name: '데이터 분석', minLevel: 3 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 }
  ],
  JOB_MKT_PM: [
    { skillId: 'SK_MKT_01', name: '퍼포먼스 광고', minLevel: 3 },
    { skillId: 'SK_MKT_05', name: '브랜드 전략', minLevel: 3 },
    { skillId: 'SK_MKT_03', name: '콘텐츠 기획', minLevel: 3 },
    { skillId: 'SK_MKT_04', name: 'CRM 마케팅', minLevel: 3 },
    { skillId: 'SK_COMMON_01', name: '데이터 분석', minLevel: 4 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 4 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 4 },
    { skillId: 'SK_COMMON_04', name: '예산 관리', minLevel: 3 },
  ],
  JOB_MKT_STRATEGY: [
    { skillId: 'SK_MKT_05', name: '브랜드 전략', minLevel: 4 },
    { skillId: 'SK_COMMON_01', name: '데이터 분석', minLevel: 4 },
    { skillId: 'SK_COMMON_05', name: '시장 분석', minLevel: 4 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 4 },
    { skillId: 'SK_COMMON_06', name: '전략 수립', minLevel: 4 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 5 },
  ],

  // 영업 직무군
  JOB_SALES_NEW: [
    { skillId: 'SK_SALES_01', name: 'B2B 영업', minLevel: 3 },
    { skillId: 'SK_SALES_05', name: '제안서 작성', minLevel: 3 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 3 }
  ],
  JOB_SALES_KAM: [
    { skillId: 'SK_SALES_02', name: '고객관계관리', minLevel: 4 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 4 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 }
  ],
  JOB_SALES_PLAN: [
    { skillId: 'SK_SALES_03', name: '영업 전략', minLevel: 4 },
    { skillId: 'SK_COMMON_01', name: '데이터 분석', minLevel: 4 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 }
  ],
  JOB_SALES_CHANNEL: [
    { skillId: 'SK_SALES_04', name: '채널 관리', minLevel: 3 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 3 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 }
  ],
  JOB_SALES_MGMT: [
    { skillId: 'SK_SALES_03', name: '영업 전략', minLevel: 4 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 4 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 }
  ],
  JOB_SALES_OVERSEAS: [
    { skillId: 'SK_SALES_01', name: 'B2B 영업', minLevel: 3 },
    { skillId: 'SK_COMMON_07', name: '비즈니스영어', minLevel: 4 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 3 }
  ],

  // R&D 직무군
  JOB_RND_MATERIAL: [
    { skillId: 'SK_RND_01', name: '소재 분석', minLevel: 4 },
    { skillId: 'SK_RND_05', name: '실험설계', minLevel: 3 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 }
  ],
  JOB_RND_PROCESS: [
    { skillId: 'SK_RND_02', name: '공정 설계', minLevel: 4 },
    { skillId: 'SK_RND_05', name: '실험설계', minLevel: 3 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 }
  ],
  JOB_RND_MASS: [
    { skillId: 'SK_RND_03', name: '양산 관리', minLevel: 4 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 3 }
  ],
  JOB_RND_QUALITY: [
    { skillId: 'SK_RND_04', name: '품질 관리', minLevel: 4 },
    { skillId: 'SK_RND_06', name: '통계 분석', minLevel: 3 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 3 }
  ],
  JOB_RND_PLAN: [
    { skillId: 'SK_RND_07', name: 'R&D 기획력', minLevel: 4 },
    { skillId: 'SK_COMMON_02', name: '프로젝트 관리', minLevel: 4 },
    { skillId: 'SK_COMMON_03', name: '커뮤니케이션', minLevel: 4 }
  ],
  JOB_RND_AI: [
    { skillId: 'SK_RND_08', name: 'AI/ML', minLevel: 4 },
    { skillId: 'SK_RND_09', name: 'SW 개발', minLevel: 4 },
    { skillId: 'SK_COMMON_01', name: '데이터 분석', minLevel: 3 }
  ]
}

// ============================================================
// 조직 레벨 이동 엣지 (사업부 → 본부 → 본사)
// ============================================================
export const ORG_LEVEL_MOVEMENTS = [
  // HR — 사업부 → 본부
  { from: 'JOB_HR_HRBP',      to: 'JOB_HR_HRBP_BU',     count: 14, avgYears: 4.0, type: 'org_expand' },
  { from: 'JOB_HR_HRD',       to: 'JOB_HR_HRD_BU',      count: 8,  avgYears: 4.5, type: 'org_expand' },
  { from: 'JOB_HR_PLAN',      to: 'JOB_HR_PLAN_BU',     count: 12, avgYears: 3.5, type: 'org_expand' },
  { from: 'JOB_HR_RECRUIT',   to: 'JOB_HR_RECRUIT_BU',  count: 6,  avgYears: 4.0, type: 'org_expand' },
  { from: 'JOB_HR_CNB',       to: 'JOB_HR_CNB_BU',      count: 5,  avgYears: 5.0, type: 'org_expand' },
  { from: 'JOB_HR_ANALYTICS', to: 'JOB_HR_ANALYTICS_BU',count: 4,  avgYears: 3.5, type: 'org_expand' },
  // HR — 본부 → 본사
  { from: 'JOB_HR_PLAN_BU',   to: 'JOB_HR_PLAN_HQ',     count: 5,  avgYears: 5.0, type: 'org_expand' },
  { from: 'JOB_HR_HRBP_BU',   to: 'JOB_HR_HRBP_HQ',    count: 4,  avgYears: 5.5, type: 'org_expand' },
  // 마케팅 — 사업부 → 본부
  { from: 'JOB_MKT_PM',       to: 'JOB_MKT_PM_BU',      count: 11, avgYears: 4.0, type: 'org_expand' },
  { from: 'JOB_MKT_STRATEGY', to: 'JOB_MKT_STRATEGY_BU',count: 7,  avgYears: 4.5, type: 'org_expand' },
  // 영업 — 사업부 → 본부
  { from: 'JOB_SALES_PLAN',   to: 'JOB_SALES_PLAN_BU',  count: 13, avgYears: 4.0, type: 'org_expand' },
  { from: 'JOB_SALES_MGMT',   to: 'JOB_SALES_MGMT_BU',  count: 9,  avgYears: 4.5, type: 'org_expand' },
  // R&D — 사업부 → 본부 → 본사
  { from: 'JOB_RND_PLAN',     to: 'JOB_RND_PLAN_BU',    count: 10, avgYears: 4.5, type: 'org_expand' },
  { from: 'JOB_RND_PLAN_BU',  to: 'JOB_RND_PLAN_HQ',   count: 4,  avgYears: 5.0, type: 'org_expand' },
]

// 직무별 시나리오 경로 추천
// - 경로 A: 직무심화형 (같은 사업부 레벨, 동일 C-Suite 라인 내 인접 직무로 수평 이동)
// - 경로 B: 조직확장형 (동일 직무, 사업부 → 본부 → 본사로 스케일 업)
// - 경로 C: 복합확장형 (직무 전환 + 조직 레벨 상승 동시)
export function getScenarioRecommendations(currentJobId) {
  // 1. 현재 직무 정보 조회
  let currentJob = JOB_NODES[currentJobId];
  
  // 2. 만약 currentJob이 없다면 family가 같은 첫 번째 직무를 기반으로 탐색 시도
  if (!currentJob) {
    const allJobs = Object.values(JOB_NODES);
    if (allJobs.length > 0) {
      currentJob = allJobs[0];
      currentJobId = currentJob.id;
    } else {
      // 극단적인 예외: 직무가 아예 없음
      return {
        safe: { targetId: currentJobId, name: '현재 직무 유지', description: '현재 직무에서 전문성을 유지합니다.', avgYears: 3.0, difficulty: '낮음' },
        challenge: { targetId: currentJobId, name: '현재 직무 유지', description: '현재 직무에서 기량을 닦습니다.', avgYears: 3.5, difficulty: '높음' },
        'T자형': { targetId: currentJobId, name: '현재 직무 유지', description: '현재 직무에 전념합니다.', avgYears: 3.0, difficulty: '중간' }
      };
    }
  }

  const currentFamily = currentJob.family;
  const currentOrgLevel = currentJob.orgLevel || 'division';
  const currentCLine = currentJob.cLine;

  // 3. 동일 직무군 + 동일 C-Suite 라인 + 사업부 레벨 직무들만
  const divisionFamilyJobs = Object.values(JOB_NODES).filter(
    j => j.family === currentFamily && j.orgLevel === 'division'
  );
  const divisionFamilyJobIds = new Set(divisionFamilyJobs.map(j => j.id));

  // ============================================================
  // A. 직무심화형 (Safe) — 같은 사업부 레벨, 인접 직무로 수평 이동
  // ============================================================
  // 동일 직무군 + 사업부 레벨 내에서 출발지가 currentJobId인 최빈도 이동
  const safeEdges = JOB_MOVEMENTS.filter(
    e => e.from === currentJobId && e.to !== currentJobId && divisionFamilyJobIds.has(e.to)
  );
  safeEdges.sort((a, b) => b.count - a.count);

  let safeTarget = null;
  let safeEdge = null;
  if (safeEdges.length > 0) {
    safeEdge = safeEdges[0];
    safeTarget = JOB_NODES[safeEdge.to];
  } else {
    const fallbacks = divisionFamilyJobs
      .filter(j => j.id !== currentJobId)
      .sort((a, b) => (b.headcount || 0) - (a.headcount || 0));
    if (fallbacks.length > 0) safeTarget = fallbacks[0];
  }

  // ============================================================
  // B. 조직확장형 (Challenge) — 동일·유사 직무를 본부/본사 레벨에서
  // ============================================================
  // 1순위: 현재 직무의 upperLevelJobId로 직접 이동
  let challengeTarget = null;
  let challengeEdge = null;

  if (currentJob.upperLevelJobId && JOB_NODES[currentJob.upperLevelJobId]) {
    challengeTarget = JOB_NODES[currentJob.upperLevelJobId];
    const orgEdge = ORG_LEVEL_MOVEMENTS.find(e => e.from === currentJobId && e.to === currentJob.upperLevelJobId);
    challengeEdge = orgEdge || null;
  } else {
    // 2순위: 동일 직무군 내 본부 레벨 직무 중 최다 이동 대상
    const buTargets = ORG_LEVEL_MOVEMENTS.filter(
      e => e.from === currentJobId && JOB_NODES[e.to]?.orgLevel === 'bu'
    ).sort((a, b) => b.count - a.count);
    if (buTargets.length > 0) {
      challengeEdge = buTargets[0];
      challengeTarget = JOB_NODES[buTargets[0].to];
    } else {
      // 3순위: 동일 family의 본부 레벨 직무 중 최다 이동
      const familyBuMoves = ORG_LEVEL_MOVEMENTS.filter(
        e => JOB_NODES[e.from]?.family === currentFamily && JOB_NODES[e.to]?.orgLevel === 'bu'
      ).sort((a, b) => b.count - a.count);
      if (familyBuMoves.length > 0) {
        challengeEdge = familyBuMoves[0];
        challengeTarget = JOB_NODES[familyBuMoves[0].to];
      }
    }
  }

  // ============================================================
  // C. 복합확장형 (T-shape) — 직무 전환 + 조직 레벨 상승 동시
  // ============================================================
  // 동일 직무군 내 허브 직무(isHub)이면서 본부 레벨이거나,
  // 사업부 레벨의 허브 직무로 이동 후 본부로 확장하는 2단계 경로
  let combinedTarget = null;
  let combinedEdge = null;

  // 우선 동일 family의 BU레벨 허브 직무 탐색
  const buHubJobs = Object.values(JOB_NODES).filter(
    j => j.family === currentFamily && j.orgLevel === 'bu' && j.isHub && j.id !== currentJobId
  );
  if (buHubJobs.length > 0) {
    // BU 허브 중 ORG_LEVEL_MOVEMENTS에서 가장 많이 이동된 것
    const bestBuHub = buHubJobs.sort((a, b) => {
      const aCount = ORG_LEVEL_MOVEMENTS.filter(e => e.to === a.id).reduce((s, e) => s + e.count, 0);
      const bCount = ORG_LEVEL_MOVEMENTS.filter(e => e.to === b.id).reduce((s, e) => s + e.count, 0);
      return bCount - aCount;
    })[0];
    combinedTarget = bestBuHub;
    combinedEdge = ORG_LEVEL_MOVEMENTS.find(e => e.to === bestBuHub.id) || null;
  } else {
    // BU 허브가 없으면 사업부 레벨 허브 → 본부 레벨 경로
    const divHubs = divisionFamilyJobs.filter(j => j.isHub && j.id !== currentJobId && j.upperLevelJobId);
    if (divHubs.length > 0) {
      const hubWithUpper = divHubs[0];
      combinedTarget = JOB_NODES[hubWithUpper.upperLevelJobId] || hubWithUpper;
      combinedEdge = ORG_LEVEL_MOVEMENTS.find(e => e.from === hubWithUpper.id && e.to === hubWithUpper.upperLevelJobId) || null;
    } else {
      // 최후: 동일 family BU 레벨 직무 중 headcount 최대
      const buFallbacks = Object.values(JOB_NODES).filter(
        j => j.family === currentFamily && j.orgLevel === 'bu'
      ).sort((a, b) => (b.headcount || 0) - (a.headcount || 0));
      if (buFallbacks.length > 0) combinedTarget = buFallbacks[0];
    }
  }

  // ============================================================
  // D. 최종 결과 조립
  // ============================================================
  const recommendations = {};

  // 직무심화형
  if (safeTarget) {
    recommendations.safe = {
      targetId: safeTarget.id,
      name: `${safeTarget.name} 전문화`,
      scenarioType: 'job_deepen',
      scenarioTypeLabel: '직무심화형',
      orgLevelLabel: safeTarget.orgLevelLabel || '사업부',
      cLine: safeTarget.cLine || currentCLine,
      description: `동일 ${safeTarget.orgLevelLabel || '사업부'} 내 실제 이동 데이터 기반 경로. ${safeTarget.name}으로의 수평 이동으로 전문성을 확장하는 가장 현실적인 시나리오입니다.`,
      avgYears: safeEdge ? Number(safeEdge.avgYears.toFixed(1)) : 3.0,
      difficulty: '낮음',
      similarPeopleCount: safeEdge ? safeEdge.count : 0
    };
  } else {
    recommendations.safe = {
      targetId: currentJobId,
      name: '현재 직무 전문화',
      scenarioType: 'job_deepen',
      scenarioTypeLabel: '직무심화형',
      orgLevelLabel: currentJob.orgLevelLabel || '사업부',
      cLine: currentCLine,
      description: '현 직무 내에서의 전문성 심화가 권장되는 경로입니다.',
      avgYears: 3.0,
      difficulty: '낮음',
      similarPeopleCount: 0
    };
  }

  // 조직확장형
  if (challengeTarget) {
    recommendations.challenge = {
      targetId: challengeTarget.id,
      name: challengeTarget.name,
      scenarioType: 'org_expand',
      scenarioTypeLabel: '조직확장형',
      orgLevelLabel: challengeTarget.orgLevelLabel || '본부',
      cLine: challengeTarget.cLine || currentCLine,
      description: `${currentJob.orgLevelLabel || '사업부'} → ${challengeTarget.orgLevelLabel || '본부'} 레벨 이동. 동일한 ${currentFamily} 전문성을 더 큰 스케일(본부/본사)에서 발휘하는 성장 경로입니다.`,
      avgYears: challengeEdge ? Number(challengeEdge.avgYears.toFixed(1)) : 4.0,
      difficulty: '중간',
      similarPeopleCount: challengeEdge ? challengeEdge.count : 0
    };
  } else {
    recommendations.challenge = {
      targetId: currentJobId,
      name: '본부 레벨 이동 준비',
      scenarioType: 'org_expand',
      scenarioTypeLabel: '조직확장형',
      orgLevelLabel: '본부',
      cLine: currentCLine,
      description: '현 직무에서 성과를 쌓으며 본부 레벨 이동을 준비하는 단계입니다.',
      avgYears: 4.0,
      difficulty: '중간',
      similarPeopleCount: 0
    };
  }

  // 복합확장형
  if (combinedTarget) {
    recommendations.tShape = {
      targetId: combinedTarget.id,
      name: combinedTarget.name,
      scenarioType: 'combined',
      scenarioTypeLabel: '복합확장형',
      orgLevelLabel: combinedTarget.orgLevelLabel || '본부',
      cLine: combinedTarget.cLine || currentCLine,
      description: `직무 전환 + 조직 레벨 확장을 동시에 달성하는 도전적 경로. ${currentFamily} 허브 직무를 경유해 ${combinedTarget.orgLevelLabel || '본부'} 스케일의 전략적 역할로 도약합니다.`,
      avgYears: combinedEdge ? Number(combinedEdge.avgYears.toFixed(1)) : 4.5,
      difficulty: '높음',
      similarPeopleCount: combinedEdge ? combinedEdge.count : 0
    };
  } else {
    recommendations.tShape = {
      targetId: currentJobId,
      name: '복합 확장 준비',
      scenarioType: 'combined',
      scenarioTypeLabel: '복합확장형',
      orgLevelLabel: '본부',
      cLine: currentCLine,
      description: '허브 직무 경유를 통한 조직 레벨 확장을 준비하는 단계입니다.',
      avgYears: 4.5,
      difficulty: '높음',
      similarPeopleCount: 0
    };
  }

  // 하위 호환성
  recommendations['T자형'] = recommendations.tShape;

  return recommendations;
}

// 멘토 데이터
export const MENTORS = [
  {
    id: 'MENTOR_01',
    name: '이수진',
    family: '마케팅',
    currentJob: '통합 마케팅 PM',
    department: '마케팅본부',
    yearsExperience: 8,
    movementHistory: [
      { year: 2018, jobName: '콘텐츠 마케팅' },
      { year: 2020, jobName: '퍼포먼스 마케팅' },
      { year: 2022, jobName: '브랜드 마케팅' },
      { year: 2024, jobName: '통합 마케팅 PM' },
    ],
    skills: ['통합 캠페인', '브랜드 전략', '퍼포먼스 광고', '팀 리딩'],
    bio: '콘텐츠에서 시작해 퍼포먼스, 브랜드를 거쳐 통합 마케팅 PM까지. 다양한 채널 경험이 PM 역할에서 큰 자산이 됩니다.',
    matchScore: 95,
    matchBasis: '같은 직무(퍼포먼스 마케팅)에서 출발해 통합 마케팅 PM 경로를 거친 선배',
  },
  {
    id: 'MENTOR_02',
    name: '정민호',
    family: '마케팅',
    currentJob: '마케팅 전략',
    department: '마케팅본부',
    yearsExperience: 10,
    movementHistory: [
      { year: 2016, jobName: '퍼포먼스 마케팅' },
      { year: 2019, jobName: 'CRM 마케팅' },
      { year: 2021, jobName: '통합 마케팅 PM' },
      { year: 2024, jobName: '마케팅 전략' },
    ],
    skills: ['마케팅 전략', '데이터 분석', 'CRM', '예산 관리'],
    bio: '퍼포먼스 데이터 분석 역량이 CRM과 전략 영역에서도 핵심 경쟁력이 됩니다. 숫자를 아는 마케터의 강점을 믿으세요.',
    matchScore: 88,
    matchBasis: '퍼포먼스 마케팅 → CRM → 통합 PM → 전략까지의 전체 경로를 거친 선배',
  },
  {
    id: 'MENTOR_03',
    name: '김태영',
    family: 'HR',
    currentJob: 'HRBP',
    department: 'HR본부',
    yearsExperience: 9,
    movementHistory: [
      { year: 2017, jobName: '채용' },
      { year: 2020, jobName: 'HRD' },
      { year: 2023, jobName: 'HRBP' },
    ],
    skills: ['조직 진단', '인재 개발', '채용 전략', '사업부 소통'],
    bio: '채용에서 시작해 HRD를 거쳐 HRBP가 되었습니다. 사람을 보는 눈이 모든 HR 직무의 기본입니다.',
    matchScore: 92,
    matchBasis: '같은 직무(채용)에서 출발해 HRBP 경로를 거친 선배',
  },
  {
    id: 'MENTOR_04',
    name: '박서연',
    family: 'HR',
    currentJob: 'HR Analytics',
    department: 'HR본부',
    yearsExperience: 7,
    movementHistory: [
      { year: 2019, jobName: '채용' },
      { year: 2022, jobName: 'C&B' },
      { year: 2024, jobName: 'HR Analytics' },
    ],
    skills: ['People Analytics', 'Python', '보상 분석', '대시보드 설계'],
    bio: '채용 데이터 분석에서 시작된 관심이 C&B 보상 분석을 거쳐 HR Analytics 전문가로 이어졌습니다.',
    matchScore: 85,
    matchBasis: '채용에서 출발해 데이터 분석 역량을 키워 HR Analytics로 전환한 사례',
  },
  {
    id: 'MENTOR_05',
    name: '최재형',
    family: '영업',
    currentJob: '영업기획',
    department: '국내영업본부',
    yearsExperience: 8,
    movementHistory: [
      { year: 2018, jobName: '신규영업' },
      { year: 2021, jobName: '채널영업' },
      { year: 2024, jobName: '영업기획' }
    ],
    skills: ['영업 실적 분석', '인센티브 설계', 'B2B 협상력', '채널 파트너십'],
    bio: '현장 신규영업 개척 경험을 바탕으로 실현 가능한 영업 전략과 인센티브를 설계하는 법을 안내합니다.',
    matchScore: 94,
    matchBasis: '영업 현장 실무(신규영업)에서 출발해 영업기획 핵심 허브로 성장한 선배',
  },
  {
    id: 'MENTOR_06',
    name: '한소희',
    family: '영업',
    currentJob: 'KAM',
    department: '글로벌사업본부',
    yearsExperience: 10,
    movementHistory: [
      { year: 2016, jobName: '신규영업' },
      { year: 2019, jobName: '해외영업' },
      { year: 2022, jobName: 'KAM' }
    ],
    skills: ['핵심 고객 관리', '글로벌 세일즈', '다년도 계약 체결', '영어 커뮤니케이션'],
    bio: '단순 판매를 넘어 고객사와 윈-윈(Win-Win)할 수 있는 장기 파트너십과 글로벌 영업 돌파구를 가이드합니다.',
    matchScore: 90,
    matchBasis: 'B2B 신규영업 개척에서 시작해 전략적 핵심 파트너(KAM)로 전환에 성공한 선배',
  },
  {
    id: 'MENTOR_07',
    name: '백경원',
    family: 'R&D',
    currentJob: 'R&D기획',
    department: '기술전략연구소',
    yearsExperience: 9,
    movementHistory: [
      { year: 2017, jobName: '소재연구' },
      { year: 2020, jobName: '공정개발' },
      { year: 2023, jobName: 'R&D기획' }
    ],
    skills: ['R&D 로드맵 수립', '소재 특성 분석', '공정 최적화', '특허 전략'],
    bio: '소재 연구원과 공정 엔지니어의 경력을 모두 결합해 전사 미래 기술 로드맵을 수립하는 전략 리딩 노하우를 공유합니다.',
    matchScore: 93,
    matchBasis: '소재연구원 ➡ 공정 엔지니어 경로를 융합해 R&D 기획 허브로 도약한 선배',
  },
  {
    id: 'MENTOR_08',
    name: '유하민',
    family: 'R&D',
    currentJob: 'AI/SW개발',
    department: 'AI융합연구실',
    yearsExperience: 7,
    movementHistory: [
      { year: 2019, jobName: '품질R&D' },
      { year: 2021, jobName: '공정개발' },
      { year: 2024, jobName: 'AI/SW개발' }
    ],
    skills: ['AI/ML 모델링', '제조 품질 분석', '공정 데이터 마이닝', 'Python SW개발'],
    bio: '기존의 품질 R&D 데이터에 매력을 느껴 머신러닝을 학습하였고, 공정 지능화 엔지니어로 피벗에 성공했습니다.',
    matchScore: 89,
    matchBasis: '제조 데이터(품질R&D) 이해를 바탕으로 스마트 팩토리 AI 엔지니어로 피벗한 선배',
  }
]



// 학습 리소스 추천
export let LEARNING_RESOURCES = {
  'SK_MKT_05': [
    { title: '브랜드 전략 마스터 과정', type: '사내교육', duration: '8주', provider: '사내 마케팅 아카데미' },
    { title: 'Brand Management (Coursera)', type: '외부강의', duration: '6주', provider: 'London Business School' },
    { title: '브랜드의 브랜드', type: '도서', duration: '-', provider: '저자: 홍성태' },
  ],
  'SK_COMMON_02': [
    { title: '프로젝트 관리 실무', type: '사내교육', duration: '4주', provider: '사내 리더십센터' },
    { title: 'PMP 자격 준비반', type: '외부강의', duration: '12주', provider: 'PMI Korea' },
  ],
  'SK_COMMON_04': [
    { title: '마케팅 예산 관리 워크숍', type: '사내교육', duration: '2일', provider: '재무팀 합동 교육' },
    { title: '재무제표 분석 기초', type: '외부강의', duration: '4주', provider: '패스트캠퍼스' },
  ],
  'SK_COMMON_01': [
    { title: '데이터 분석 부트캠프', type: '사내교육', duration: '6주', provider: '사내 DT 아카데미' },
    { title: 'Google Analytics 고급 과정', type: '외부강의', duration: '4주', provider: 'Google' },
  ],
  'SK_HR_05': [
    { title: 'People Analytics 입문', type: '사내교육', duration: '4주', provider: 'HR 아카데미' },
    { title: 'HR Analytics with Python', type: '외부강의', duration: '8주', provider: 'Coursera' },
  ],
  'SK_HR_06': [
    { title: '조직 진단 방법론', type: '사내교육', duration: '3일', provider: '사내 OD팀' },
    { title: '조직개발의 이론과 실제', type: '도서', duration: '-', provider: '저자: 이관응' },
  ],
  'SK_HR_07': [
    { title: '성과 관리 체계 설계', type: '사내교육', duration: '2주', provider: 'HR 아카데미' },
    { title: 'OKR 실전 가이드', type: '도서', duration: '-', provider: '저자: 존 도어' },
  ],
  'SK_COMMON_06': [
    { title: '전략적 사고 워크숍', type: '사내교육', duration: '3일', provider: '리더십센터' },
    { title: 'Business Strategy (HBX)', type: '외부강의', duration: '8주', provider: 'Harvard Business School' },
  ],
}

// 🔒 HS 실 데이터 런타임 주입 함수
export function injectHsData(hsJobs, hsMovements) {
  if (!hsJobs || !hsMovements) return

  // 1. JOB_NODES 재구성
  const newJobNodes = {}
  hsJobs.forEach(job => {
    newJobNodes[job.id] = {
      id: job.id,
      name: job.name,
      family: job.family,
      cLine: job.cLine || 'CHO',
      orgLevel: job.orgLevel || 'division',
      orgLevelLabel: job.orgLevelLabel || '사업부',
      upperLevelJobId: job.upperLevelJobId || null,
      level: job.level || '선임',
      isHub: job.isHub || false,
      isLeadership: job.isLeadership || false,
      isDeadEnd: job.isDeadEnd || false,
      headcount: job.headcount || 0,
      vacancies: job.vacancies || 0,
      avgTenure: job.avgTenure || 3.5,
      growthTrend: job.growthTrend || 'stable',
      description: job.description || `${job.name} 직무`,
      requiredSkills: job.requiredSkills || []
    }
  })
  JOB_NODES = newJobNodes

  // 2. JOB_MOVEMENTS 재구성
  JOB_MOVEMENTS = hsMovements.map(m => ({
    from: m.from,
    to: m.to,
    count: m.count,
    source: m.source || 'internal',
    avgYears: m.avgYears || 3.0,
    sameBU: m.sameBU !== undefined ? m.sameBU : true
  }))

  // 3. JOB_REQUIRED_SKILLS 재구성
  const newRequiredSkills = {}
  hsJobs.forEach(job => {
    newRequiredSkills[job.id] = job.requiredSkills || []
  })
  JOB_REQUIRED_SKILLS = newRequiredSkills

  console.log(`[보안/데이터] careerData에 HS 실 데이터 주입 완료: 직무 ${hsJobs.length}개, 이동 ${hsMovements.length}개`)
}
