/**
 * [CAREER DATA CONTEXT - DO NOT MODIFY]
 * 
 * {
 *   "transition_probabilities": {
 *     "HRBP_stay": 0.47,
 *     "HRBP_to_HRStrategy": 0.60,
 *     "HRBP_to_HRD": 0.52
 *   },
 * 
 *   "role_classifier": {
 *     "HRBP": ["조직문화", "Talent Management", "글로벌인사", "주재원 인사"],
 *     "HRStrategy": ["평가", "조직설계", "조직설계/운영", "인원인건비", "보상", "HRIS"],
 *     "HRD": ["교육", "교육과정개발", "교육체계개발", "인재육성", "코칭"],
 *     "ER": ["노사관계", "노경", "Compliance Risk", "Global노경"]
 *   },
 * 
 *   "hr_hierarchy": {
 *     "levels": {
 *       "HQ": {
 *         "name": "본사 HR (CHO)",
 *         "keywords": ["인사기획", "임원인사", "People Analytics", "전사", "HQ"]
 *       },
 *       "DIVISION": {
 *         "name": "본부 HR",
 *         "keywords": ["HS HR", "VS HR", "ES HR", "본부"]
 *       },
 *       "BUSINESS": {
 *         "name": "사업부 HR",
 *         "keywords": ["R&D HR", "연구소 HR", "사업부", "현업 HR"]
 *       }
 *     }
 *   }
 * }
 */

/**
 * [ADDITIONAL CAREER DIAGNOSIS LAYER - APPEND ONLY]
 * 
 * STEP 1. CURRENT POSITION DIAGNOSIS
 * Identify Track by job_name.
 * 
 * STEP 2. HIERARCHY LEVEL CLASSIFICATION ⭐
 * Determine current organizational level: 본사 HR (CHO), 본부 HR, 사업부 HR.
 * 
 * STEP 3. CAREER PHASE CLASSIFICATION
 * Classify current phase (Early Stage, Growth Stage, Transition Ready, Strategy Phase, Leadership Phase).
 * 
 * STEP 4. TRANSITION PROBABILITY APPLICATION
 * Use as reasoning support reference.
 * 
 * STEP 5. CAREER PATH GENERATION (핵심)
 * Generate 2 directions:
 * ① 조직 확장 경로 (사업부 HR → 본부 HR → 본사 HR)
 * ② 역할 전환 경로 (HRBP → 인사기획 (CHO))
 * 
 * STEP 6. RECOMMENDATION STRUCTURE
 * Include: 현재 위치, 커리어 단계, 추천 시나리오 3개 (최적, 안정, 대안).
 * 
 * STEP 7. ACTION PLAN (ONLY TOP 1)
 * Generate [30일], [90일], [6개월] with structure: 현재 → 목표 → Gap → Action.
 * 
 * STEP 8. OUTPUT FORMAT
 * Structured layout.
 * 
 * STEP 9. TONE
 * Coaching tone, growth-oriented, no criticism, data-based.
 */

export function diagnoseCareer(persona) {
  const jobName = persona.currentJobName || "";
  const totalYears = persona.totalYears || persona.yearsInRole || 1;
  const movementHistory = persona.movementHistory || [];
  const grade = persona.grade || "실무자";
  const deptName = persona.department || "";
  const bizUnit = persona.businessUnit || "";

  // 직무군(Family) 판단
  let family = persona.jobFamily || "";
  if (!family) {
    const jobId = persona.currentJobId || "";
    if (jobId.startsWith("JOB_HR") || jobId.startsWith("JOB_HR_")) {
      family = "HR";
    } else if (jobId.startsWith("JOB_MKT") || jobId.startsWith("JOB_MK") || jobId.startsWith("JOB_MK_") || jobId.startsWith("JOB_MKT_")) {
      family = "마케팅";
    } else if (jobId.startsWith("JOB_SL") || jobId.startsWith("JOB_SL_")) {
      family = "영업";
    } else if (jobId.startsWith("JOB_RD") || jobId.startsWith("JOB_RD_")) {
      family = "R&D";
    } else {
      const lowerJobName = jobName.toLowerCase();
      const lowerDept = deptName.toLowerCase();
      if (["마케팅", "mkt", "marketing", "광고", "브랜드", "퍼포먼스", "홍보"].some(kw => lowerJobName.includes(kw) || lowerDept.includes(kw))) {
        family = "마케팅";
      } else if (["영업", "sales", "b2b", "해외영업", "kam", "영업기획"].some(kw => lowerJobName.includes(kw) || lowerDept.includes(kw))) {
        family = "영업";
      } else if (["연구", "개발", "r&d", "sw", "ai", "품질", "공정", "소재"].some(kw => lowerJobName.includes(kw) || lowerDept.includes(kw))) {
        family = "R&D";
      } else {
        family = "HR"; // 기본값
      }
    }
  }

  // STEP 1. CURRENT POSITION DIAGNOSIS (Track classification)
  let currentTrack = `기타 ${family}`;
  if (family === "HR") {
    const isHRBP = ["조직문화", "Talent Management", "글로벌인사", "주재원 인사", "HRBP"].some(kw => jobName.includes(kw));
    const isHRStrategy = ["평가", "조직설계", "조직설계/운영", "인원인건비", "보상", "HRIS", "Strategy", "기획", "인사기획"].some(kw => jobName.includes(kw));
    const isHRD = ["교육", "교육과정개발", "교육체계개발", "인재육성", "코칭", "HRD"].some(kw => jobName.includes(kw));
    const isER = ["노사관계", "노경", "Compliance Risk", "Global노경", "노사", "Compliance", "ER"].some(kw => jobName.includes(kw));

    if (isHRBP) {
      currentTrack = "HRBP";
    } else if (isHRStrategy) {
      currentTrack = "HR Strategy";
    } else if (isHRD) {
      currentTrack = "HRD";
    } else if (isER) {
      currentTrack = "ER";
    } else {
      if (persona.currentJobId === 'JOB_HR_RECRUIT') {
        currentTrack = "HRBP";
      } else if (persona.currentJobId === 'JOB_HR_PLAN') {
        currentTrack = "HR Strategy";
      } else if (persona.currentJobId === 'JOB_HR_HRD') {
        currentTrack = "HRD";
      } else if (persona.currentJobId === 'JOB_HR_LABOR') {
        currentTrack = "ER";
      }
    }
  } else if (family === "마케팅") {
    const isMktStrategy = ["기획", "전략", "브랜드", "PM"].some(kw => jobName.includes(kw));
    const isMktPerf = ["퍼포먼스", "GA", "데이터", "광고"].some(kw => jobName.includes(kw));
    const isMktContent = ["콘텐츠", "CRM", "소셜", "미디어", "고객"].some(kw => jobName.includes(kw));

    if (isMktStrategy) {
      currentTrack = "마케팅 전략";
    } else if (isMktPerf) {
      currentTrack = "퍼포먼스 마케팅";
    } else if (isMktContent) {
      currentTrack = "콘텐츠 마케팅";
    } else {
      currentTrack = "마케팅 일반";
    }
  } else if (family === "영업") {
    const isSalesPlan = ["기획", "전략", "관리", "지원"].some(kw => jobName.includes(kw));
    const isSalesFront = ["신규", "KAM", "채널", "B2B", "해외", "영업"].some(kw => jobName.includes(kw));

    if (isSalesPlan) {
      currentTrack = "영업 기획";
    } else if (isSalesFront) {
      currentTrack = "현업 영업";
    } else {
      currentTrack = "영업 일반";
    }
  } else if (family === "R&D") {
    const isRDPlan = ["기획", "전략", "특허", "관리"].some(kw => jobName.includes(kw));
    const isRDDev = ["공정", "양산", "소재", "품질", "개발", "AI", "SW", "연구"].some(kw => jobName.includes(kw));

    if (isRDPlan) {
      currentTrack = "R&D 기획";
    } else if (isRDDev) {
      currentTrack = "R&D 기술/개발";
    } else {
      currentTrack = "R&D 일반";
    }
  }

  // STEP 2. HIERARCHY LEVEL CLASSIFICATION ⭐
  const familySuffix = family === 'HR' ? ' HR' : ` ${family}`;
  let currentLevel = family === 'HR' ? '사업부 HR' : `사업부 ${family}`;

  const orgLevel = persona.orgLevel || "";
  const orgLevelMap = {
    '본사': family === 'HR' ? '본사 HR (CHO)' : `본사 ${family}`,
    '본부': `본부${familySuffix}`,
    '사업부': `사업부${familySuffix}`
  };

  if (orgLevel && orgLevelMap[orgLevel]) {
    currentLevel = orgLevelMap[orgLevel];
  } else {
    // Fallback: 부서명/비즈니스유닛/직무명 키워드 기반 추론
    const isHQ = ["전사", "HQ", "임원인사", "인사기획", "CHO", "본사"].some(kw => 
      deptName.includes(kw) || bizUnit.includes(kw) || jobName.includes(kw)
    );
    const isDivision = ["본부", "HS", "VS", "ES"].some(kw => 
      deptName.includes(kw) || bizUnit.includes(kw)
    );
    const isBusiness = ["R&D HR", "연구소", "사업부", "현업 HR", "현업"].some(kw => 
      deptName.includes(kw) || bizUnit.includes(kw) || jobName.includes(kw)
    );

    if (isHQ) {
      currentLevel = family === 'HR' ? '본사 HR (CHO)' : `본사 ${family}`;
    } else if (isDivision) {
      currentLevel = family === 'HR' ? '본부 HR' : `본부 ${family}`;
    } else if (isBusiness) {
      currentLevel = family === 'HR' ? '사업부 HR' : `사업부 ${family}`;
    }
  }

  // STEP 3. CAREER PHASE CLASSIFICATION
  let careerPhase = "Early Stage";
  let phaseDescription = "";

  const hasStrategyExperience = movementHistory.some(h => 
    ["평가", "조직설계", "조직설계/운영", "인원인건비", "보상", "HRIS", "Strategy", "기획", "인사기획", "마케팅전략", "영업기획", "R&D기획"].some(kw => h.jobName?.includes(kw))
  ) || ["HR Strategy", "마케팅 전략", "영업 기획", "R&D 기획"].includes(currentTrack);

  const isLongTermHR = totalYears >= 7 || ["리더"].includes(grade);

  if (family === "HR" && currentTrack === "HRBP" && totalYears <= 2) {
    careerPhase = "Early Stage";
    phaseDescription = "HRBP 트랙 진입 후 현장 비즈니스 조율과 현업 관계 구축을 탄탄히 다지는 적응 및 시작 단계입니다.";
  } else if (family === "HR" && currentTrack === "HRBP" && totalYears >= 3 && totalYears <= 5) {
    careerPhase = "Growth Stage";
    phaseDescription = "현장 밀착형 인사 파트너로서 성과를 리딩하고 조직 역량 강화를 전담하는 역량 만개 단계입니다.";
  } else if (family === "HR" && currentTrack === "HRBP" && totalYears >= 3 && !hasStrategyExperience) {
    careerPhase = "Transition Ready";
    phaseDescription = "현장 파트너로서의 경험이 무르익어 비즈니스 기획 및 인사 기획(Strategy)으로의 확장을 모색하기에 가장 완벽한 시기입니다.";
  } else if (family === "마케팅" && currentTrack === "퍼포먼스 마케팅" && totalYears >= 3 && totalYears <= 5) {
    careerPhase = "Growth Stage";
    phaseDescription = "담당 분야의 완결적 수행력을 갖추고 핵심 성과를 적극적으로 창출하는 성장 시기입니다.";
  } else if (hasStrategyExperience) {
    careerPhase = "Strategy Phase";
    phaseDescription = `전사적 차원의 ${family} 전략과 방향성을 주도하고 프레임워크를 수립하는 핵심 전략가 단계입니다.`;
  } else if (isLongTermHR) {
    careerPhase = "Leadership Phase";
    phaseDescription = `해당 직무군 전반의 통섭적 경험을 갖춘 리더로서, 전사의 핵심 전략 및 미래 로드맵을 리드하는 중추 단계입니다.`;
  } else {
    if (totalYears <= 2) {
      careerPhase = "Early Stage";
      phaseDescription = "실무 기초와 사내 프로세스를 체득하고 기본 역량을 탄탄하게 연마하는 시기입니다.";
    } else if (totalYears <= 5) {
      careerPhase = "Growth Stage";
      phaseDescription = "담당 분야의 완결적 수행력을 갖추고 핵심 성과를 적극적으로 창출하는 성장 시기입니다.";
    } else {
      careerPhase = "Leadership Phase";
      phaseDescription = "전사적 영향력을 지니고 후배 육성과 전사 직무 기획을 주도하는 리더십 시기입니다.";
    }
  }

  // STEP 4. TRANSITION PROBABILITY APPLICATION & STEP 5. CAREER PATH GENERATION
  let recommendations = [];
  let actionPlan = null;
  let similarPathRate = "약 60%";

  if (family === "HR" && currentTrack === "HRBP") {
    similarPathRate = "약 60% (현장 파트너에서 전사 기획직무로의 전환 비율)";
    recommendations = [
      {
        type: "optimal",
        title: "인사기획 (CHO 라인) 역할 전환 및 본사 HR 확장 ⭐",
        probability: "약 60%",
        successRate: "60%",
        reason: "현장에서 다진 비즈니스 조율 능력과 인원 수급 안목을 인사기획제도 설계에 접목하는 [역할 전환 경로(HRBP ➡️ 인사기획)] 및 [조직 확장 경로(사업부/본부 HR ➡️ 본사 HR)]의 유기적 결합입니다. 전사 임금 시뮬레이션 및 제도 수립 시 현장 수용성을 극대화할 수 있어 CHO 라인 내에서 최고 수준의 성공률(60%)로 매칭됩니다.",
        description: "전사 조직 설계, 임금 및 보상제도 개편, 중장기 인력/인건비 계획을 수립하는 전사 CHO 인사기획실의 핵심 파트너로 성장하는 시나리오입니다."
      },
      {
        type: "safe",
        title: "본부 HRBP 고도화 및 조직문화 파트너십 수성 (안정 경로)",
        probability: "약 47%",
        successRate: "47%",
        reason: "[조직 확장 경로(사업부 HR ➡️ 본부 HR)]를 충실히 밟아나가는 안정적인 리더십 경로입니다. 급격한 직무 전환 스트레스 없이 기존의 소통력과 조직 진단 역량을 본부 단위의 대규모 조직 설계 및 Talent Management로 확장하여 심리적 안정감이 크며 약 47%의 높은 동일 영역 안착률을 보입니다.",
        description: "본부 단위 총괄 HRBP로 승격하여, 담당 사업본부의 R&R 조율, 조직 활성화 및 핵심 인재 리텐션 체계를 리딩하는 경로입니다."
      },
      {
        type: "alternative",
        title: "HRD (인재육성 및 사내 코칭) 전문가 피벗 (대안 경로)",
        probability: "약 52%",
        successRate: "52%",
        reason: "현업 부서 소통 중 포착된 직원들의 핵심 스킬 갭과 리더십 부재 문제를 '사내 전문 교육 체계 수립' 및 '리더십 파이프라인 개발'로 직접 해결해내는 훌륭한 인접 직무 피벗입니다. 구성원의 정서적 성장을 돕는 강점을 극대화할 수 있으며 성공 매칭률은 약 52%입니다.",
        description: "전사 차세대 리더 육성 로드맵 수립, 핵심 직무 교육과정 설계 및 사내 코칭 체계를 기획·총괄하는 직무 전환 시나리오입니다."
      }
    ];

    actionPlan = {
      optimalTitle: "인사기획 (CHO) 역할 전환 및 본사 HR 확장 경로",
      "30day": {
        current: "사업부 현장 밀착형 HRBP 및 조직문화 운영 중",
        target: "인사 기획적 데이터 감각 및 전사 지표 센싱 마인드셋 탑재",
        gap: "현업 중심 사고에서 탈피한 '전사 예산/인건비 지표 분석' 경험 부족",
        action: "담당 사업본부의 최근 3개년 퇴직율 통계 및 핵심 부서 인력 유출 추이를 엑셀로 분석하고, 정량화된 '사업부 인적 리스크 분석 및 인원 최적화 제안서'를 작성해 보십시오. 기획의 언어인 '숫자'로 말하는 훈련을 시작합니다."
      },
      "90day": {
        current: "정량 데이터 기반 기획력 기초 장착",
        target: "본사 HR R&R 규칙 및 임금 시뮬레이션 방법론 체득",
        gap: "본부/본사 단위 전사 조직 설계 프레임 및 평가보상 거버넌스 지식 부족",
        action: "인사기획실 선배 멘토(예: 김태영 책임)와 사내 매칭을 완료하고, 커피챗을 통해 전사 인건비 계획 템플릿과 임금 협상 시나리오를 학습하십시오. 가상의 '신설 사업본부 인력/예산 설계 기획서'를 작성하여 피드백을 받습니다."
      },
      "6month": {
        current: "가상 조직 기획서 및 데이터 분석 포트폴리오 완비",
        target: "본사 CHO 인사기획실 전보 임용 및 성공적 연착륙",
        gap: "공식적인 전보 기회 획득 및 본사 임원진 전략 인터뷰 합격",
        action: "하반기 사내 잡마켓 공모제에 인사기획 직무로 공식 지원하십시오. 인터뷰 현장에 그간 준비한 '현장 중심 인력 지표 분석 보고서'와 '가상 신설본부 인건비 시뮬레이션 포트폴리오'를 지참하여 전사 전략가로서의 준비된 역량을 입증하십시오."
      }
    };
  } else if (family === "HR") {
    similarPathRate = "약 55%";
    recommendations = [
      {
        type: "optimal",
        title: "본사 HR 전략 기획 및 조직 확장 시나리오 ⭐",
        probability: "약 60%",
        successRate: "60%",
        reason: "[조직 확장 경로(사업부 HR ➡️ 본부 HR ➡️ 본사 HR)]를 관철하여 전사 전략의 사령탑인 본사 CHO 라인으로 확장하는 경로입니다. 기존 실무 강점을 전사 거버넌스 수립에 결합하여 최고의 직무 완성도를 획득합니다.",
        description: "전사 인사 정책 방향 수립, 인사 고도화 프로젝트 리딩 및 글로벌 조직 관리 거버넌스를 설계하는 경로입니다."
      },
      {
        type: "safe",
        title: "현업 본부 HR 스페셜리스트 성장 (안정 경로)",
        probability: "약 55%",
        successRate: "55%",
        reason: "현재 본부 또는 사업부 HR 영역 안에서 전문성을 극대화하여 대체 불가능한 시니어 핵심 실무원으로 성장하는 매우 안정적인 안착 경로입니다.",
        description: "현재 부서 내 핵심 실무 제도를 운영 및 유지관리하고, 부서 내 리스크 관리를 전담하는 핵심 스페셜리스트 성장 경로입니다."
      },
      {
        type: "alternative",
        title: "타 HR 트랙 전환 및 People Analytics 스페셜리스트 (대안 경로)",
        probability: "약 48%",
        successRate: "48%",
        reason: "기존 강점에 통계 분석 및 데이터 분석 능력을 접목하여, HR Tech 및 People Analytics와 같은 희소성 높은 새로운 인접 전문 분야로 피벗하는 강력한 대안 시나리오입니다.",
        description: "임직원 활동 분석, 이탈 예측 모델링 및 조직 네트워킹 분석(ONA) 체계를 전문적으로 빌드하는 시나리오입니다."
      }
    ];

    actionPlan = {
      optimalTitle: "본사 HR 전략 기획 경로",
      "30day": {
        current: "사업부/본부 HR 스펙트럼 실무 전념 중",
        target: "전사 전략적 인사 프레임 및 거버넌스 구조 이해",
        gap: "본사 차원의 글로벌 거버넌스 및 대외 인사 트렌드 지식 부족",
        action: "전사 CHO 연간 목표 보고서 및 외부 최신 HR 트렌드 리포트를 3편 이상 정독하고, 현재 속한 본부의 제도와 전사 거버넌스 사이의 '규정 불일치 진단 리포트'를 작성해 보십시오."
      },
      "90day": {
        current: "거버넌스 갭 데이터 확보 상태",
        target: "본사 차원의 인사 개편 프로젝트 가상 제안서 완성",
        gap: "전사 단위 인사 기획서 설계 경험 및 임원진 대상 설득 로직 부족",
        action: "본사 HR 멘토와의 주기적 면담을 연결하고, '전사 세대 맞춤형 보상 체계 개편' 또는 '글로벌 HRIS 표준화' 가상 기획안을 작성하여 피드백을 받으십시오."
      },
      "6month": {
        current: "전략 기획안 및 거버넌스 포트폴리오 완비",
        target: "본사 HR (CHO 라인) 공식 전보 발령 및 안착",
        gap: "공식 사내 공모 기회 포착 및 전략 실무 면접 통과",
        action: "차기 사내 잡마켓 또는 정기 전보 시 본사 HR기획 부서를 1지망으로 신청하고, 가상 기획 포트폴리오를 제시하며 '전사적 시야를 지닌 준비된 본사 HR 인재'임을 어필해 합격을 확정 지으십시오."
      }
    };
  } else if (family === "마케팅") {
    similarPathRate = "약 62% (실무 마케터에서 마케팅 전략/PM으로의 성장 비율)";
    recommendations = [
      {
        type: "optimal",
        title: "전사 마케팅 전략 기획 및 브랜드 PM 확장 ⭐",
        probability: "약 62%",
        successRate: "62%",
        reason: "현업 퍼포먼스 마케팅에서 다진 데이터 분석 및 광고 효율 최적화 감각을 브랜드 전략에 접목하는 [역할 전환 경로] 및 [조직 확장 경로(사업부/본부 마케팅 ➡️ 본사 마케팅)]의 유기적 결합입니다. 전사 브랜드 인지도를 고려한 마케팅 믹스 설계 시 최적의 성공률을 보입니다.",
        description: "전사 마케팅 전략 수립, 대규모 브랜드 캠페인 기획, 글로벌 마케팅 믹스(4P) 조율을 담당하는 전사 마케팅전략실의 핵심 브랜드 매니저(PM)로 성장하는 시나리오입니다."
      },
      {
        type: "safe",
        title: "본부 디지털 마케팅 스페셜리스트 및 퍼포먼스 리딩 (안정 경로)",
        probability: "약 55%",
        successRate: "55%",
        reason: "[조직 확장 경로]를 충실히 밟아나가는 안정적인 스페셜리스트 경로입니다. 급격한 직무 전환 없이 기존 퍼포먼스 광고와 고객 데이터 분석 역량을 기반으로 마케팅 본부 단위의 대규모 디지털 캠페인을 리딩하며 안정적인 성장을 도모합니다.",
        description: "본부 단위 퍼포먼스 마케팅 파트장 또는 수석 스페셜리스트로 성장하여, 매체 믹스 최적화 및 ROAS 극대화를 진두지휘하는 경로입니다."
      },
      {
        type: "alternative",
        title: "CRM 및 그로스 해킹(Growth Hacking) 데이터 전문가 피벗 (대안 경로)",
        probability: "약 48%",
        successRate: "48%",
        reason: "광고 집행 경험을 바탕으로 획득한 고객 여정 데이터를 심층 분석하여, 구매 전환율 개선과 고객 생애 가치(LTV) 극대화를 위한 'CRM 마케팅' 및 '그로스 해킹' 전문가로의 피벗입니다. IT/플랫폼 중심의 강점을 극대화할 수 있습니다.",
        description: "고객 데이터 플랫폼(CDP)을 활용하여 개인화 마케팅 시나리오를 설계하고, 코호트 분석 및 퍼널 최적화를 통해 비즈니스 성장을 직접 견인하는 그로스 챔피언 경로입니다."
      }
    ];

    actionPlan = {
      optimalTitle: "전사 마케팅 전략 기획 및 브랜드 PM 확장 경로",
      "30day": {
        current: "사업부 퍼포먼스 마케터로서 매체 광고 효율 운영 중",
        target: "전사적 브랜드 지표 및 통합 마케팅 믹스(IMC) 마인드셋 탑재",
        gap: "단기 매체 광고 효율(ROAS) 중심 사고에서 탈피한 '중장기 브랜드 가치 지표 분석' 경험 부족",
        action: "담당 제품의 최근 3개년 브랜드 인지도 조사 데이터와 경쟁사 마케팅 활동 추이를 엑셀로 분석하고, 정량화된 '브랜드 경쟁력 분석 및 통합 마케팅 제안서'를 작성해 보십시오. 장기적 관점의 기획 훈련을 시작합니다."
      },
      "90day": {
        current: "브랜드 데이터 기반 분석력 기초 장착",
        target: "전사 브랜드 거버넌스 및 대형 대행사 협업 프로세스 체득",
        gap: "본부/본사 단위 글로벌 브랜드 캠페인 기획 및 IMC 전략 설계 지식 부족",
        action: "마케팅전략실 선배 멘토와 사내 네트워킹을 완료하고, 커피챗을 통해 전사 통합 마케팅 템플릿과 캠페인 운영 시나리오를 학습하십시오. 가상의 '신제품 런칭 IMC 캠페인 기획안'을 작성하여 피드백을 받습니다."
      },
      "6month": {
        current: "가상 IMC 기획서 및 브랜드 분석 포트폴리오 완비",
        target: "본사 마케팅전략실 전보 임용 및 성공적 연착륙",
        gap: "공식적인 전보 기회 획득 및 본사 마케팅 리더 대상 전략 인터뷰 합격",
        action: "하반기 사내 잡마켓 공모제에 마케팅 전략 직무로 공식 지원하십시오. 인터뷰에 그간 준비한 '브랜드 인지도 분석 보고서'와 '신제품 IMC 캠페인 포트폴리오'를 지참하여 준비된 마케팅 전략가로서의 역량을 입증하십시오."
      }
    };
  } else if (family === "영업") {
    similarPathRate = "약 58%";
    recommendations = [
      {
        type: "optimal",
        title: "본사 해외영업 및 글로벌 마켓 확장 전략가 ⭐",
        probability: "약 58%",
        successRate: "58%",
        reason: "국내 영업 현장에서 다진 고객 협상력과 유통망 관리 노하우를 글로벌 시장에 접목하여 전사 매출 볼륨을 견인하는 [글로벌 조직 확장 경로]입니다. 대규모 딜 소싱 능력이 탁월한 인재 매칭률을 보입니다.",
        description: "해외 권역별 시장 분석, 현지 딜러망 개척 및 대형 글로벌 B2B 파트너십을 체결하고 신규 해외 시장 개척 전략을 총괄 수립하는 리더 경로입니다."
      },
      {
        type: "safe",
        title: "본부 KAM(핵심고객관리) 스페셜리스트 성장 (안정 경로)",
        probability: "약 55%",
        successRate: "55%",
        reason: "현장 밀착 영업 경험을 고도화하여 대형 유통 및 핵심 엔터프라이즈 계정을 책임지는 안정적인 직무 유지 경로입니다. 검증된 영업 파이프라인 관리 능력을 전담 확장합니다.",
        description: "주요 핵심 VIP 고객사 계정을 전담 관리하며 추가 매출(Upsell/Cross-sell)을 유도하고, 장기 계약 연장 및 전략적 제휴를 공고히 하는 스페셜리스트입니다."
      },
      {
        type: "alternative",
        title: "영업 기획 및 데이터 기반 매출 전략가 피벗 (대안 경로)",
        probability: "약 48%",
        successRate: "48%",
        reason: "영업 현장 데이터를 깊이 분석하여, 영업 사원들의 성과 평가 체계를 고안하거나 권역별 매출 목표를 할당하고 프로모션 전략을 수립하는 강력한 기획 피벗입니다.",
        description: "전사 매출 예측 시뮬레이션, 영업 자동화(CRM) 도구 도입 및 프로모션 예산 집행 계획을 기획·운영하는 본부 매출 전략 사령관 경로입니다."
      }
    ];

    actionPlan = {
      optimalTitle: "본사 해외영업 및 글로벌 마켓 확장 전략 경로",
      "30day": {
        current: "국내 사업부 현업 영업 관리 및 고객사 대응 중",
        target: "글로벌 시장 진출 전략 및 권역별 시장 분석법 탑재",
        gap: "글로벌 거시 경제 지표 및 해외 권역별 수입 규제 지식 부족",
        action: "타깃 해외 권역(예: 북미/유럽)의 업계 마켓 리서치 보고서를 3편 이상 분석하고, 정량화된 '글로벌 경쟁사 진입 시나리오 분석서'를 작성해 보십시오."
      },
      "90day": {
        current: "글로벌 시장 리스크 데이터 확보 상태",
        target: "해외 바이어 협상 및 글로벌 물류/수급 시나리오 설계",
        gap: "실제 해외 딜러 계약서 작성 및 통상 프로세스 경험 부족",
        action: "해외영업실 멘토와 사내 네트워킹을 완료하고, 글로벌 계약 프로세스 및 물류 가이드라인을 전수받으십시오. 가상의 '해외 바이어 대상 제품 제안 및 수출 견적 시뮬레이션'을 수행합니다."
      },
      "6month": {
        current: "수출 제안서 및 해외 마케팅 믹스 포트폴리오 완비",
        target: "본사 해외영업실 공식 전보 및 글로벌 프로젝트 수임",
        gap: "글로벌 사내 공모 기회 획득 및 임원진 대상 다국어 면접 합격",
        action: "글로벌 잡마켓 공모에 지원하고, 기획한 '북미 시장 수출 제안서'와 '딜러망 개척 전략서'를 제시하여 해외 시장을 선점할 수 있는 글로벌 영업 전략가로서의 준비를 증명하십시오."
      }
    };
  } else if (family === "R&D") {
    similarPathRate = "약 65%";
    recommendations = [
      {
        type: "optimal",
        title: "본사 R&D 전략 기획 및 신기술 로드맵 설계가 ⭐",
        probability: "약 65%",
        successRate: "65%",
        reason: "연구 현장에서 다진 기술적 깊이와 특허 분석력을 바탕으로, 전사 신성장 동력 발굴을 위한 중장기 기술 로드맵을 설계하는 [본사 조직 확장 및 기획 전환 경로]입니다. 미래 기술 트렌드 센싱 역량의 융합입니다.",
        description: "전사 중장기 기술 투자 로드맵 수립, 오픈 이노베이션(산학 협력/M&A) 전략 수립 및 전사 R&D 포트폴리오 평가를 총괄 리드하는 R&D 기획 리더 경로입니다."
      },
      {
        type: "safe",
        title: "본부 공정/양산 핵심 기술 스페셜리스트 (안정 경로)",
        probability: "약 60%",
        successRate: "60%",
        reason: "연구 성과를 생산 현장에 이관하고 수율을 최적화하는 스페셜리스트 경로로, 직무 급변에 따른 스트레스 없이 공정 엔지니어로서의 장기적 전문성을 공고히 구축하는 약 60%의 높은 전문 수성 경로입니다.",
        description: "핵심 공정 설계 표준 수립, 양산 라인 수율 극대화 및 라인 트러블슈팅을 완결적으로 리드하는 공정 기술 명장 경로입니다."
      },
      {
        type: "alternative",
        title: "AI/SW 융합 연구원 및 디지털 트랜스포메이션 피벗 (대안 경로)",
        probability: "약 50%",
        successRate: "50%",
        reason: "하드웨어 또는 전통 공정 연구에서 획득한 데이터를 바탕으로 AI/ML 분석론을 융합하여, 스마트 팩토리 설계 또는 데이터 기반 신소재 탐색 연구로 피벗하는 강력한 디지털 전환 시나리오입니다.",
        description: "공정 센서 데이터 예측 분석 모델링 개발, 신소재 특성 가상 시뮬레이션(In Silico) 인프라 구축 등 R&D 내 디지털 전환을 주도하는 융합형 연구원 경로입니다."
      }
    ];

    actionPlan = {
      optimalTitle: "본사 R&D 전략 기획 및 신기술 로드맵 설계 경로",
      "30day": {
        current: "사업부 연구실 내 단위 소재/공정 실험 및 분석 진행 중",
        target: "글로벌 특허 지향적 사고 및 전사 특허 포트폴리오 분석력 탑재",
        gap: "자체 실험실 범위를 뛰어넘은 '대외 신기술 동향 및 경쟁 특허 맵핑' 분석 기획력 부족",
        action: "핵심 연구 과제 관련 글로벌 상위 3개사의 3개년 특허 등록 현황 and 핵심 청구항을 분석하고, 가상의 '특허 장벽 우회 및 신규 기술 확보 전략안'을 작성해 보십시오."
      },
      "90day": {
        current: "글로벌 경쟁사 특허 분석 데이터 확보 상태",
        target: "차세대 전사 기술 포트폴리오 및 R&D 예산 할당 구조 이해",
        gap: "전사 과제 기획 프레임 및 기술 경제성 평가(Economic Evaluation) 기법 지식 부족",
        action: "R&D기획실 선배 멘토와 사내 연결을 마친 뒤 커피챗을 진행하여, 전사 기술 과제 심사 지표를 벤치마킹하십시오. 가상의 '차세대 신기술 도입 타당성 검토 기획서'를 작성해 봅니다."
      },
      "6month": {
        current: "기술 경제성 검토안 및 미래 신기술 제안서 포트폴리오 완비",
        target: "본사 R&D기획실 공식 전보 및 전사 과제 기획 위임",
        gap: "정기 전보 공모 기회 포착 및 R&D 임원 대상 기술 기획 면접 합격",
        action: "R&D 전략 기획 부서 사내 공모에 지원하고, 기획한 '미래 5대 신기술 투자 로드맵 제안서'와 '타당성 분석 포트폴리오'를 지참하여 면접관들에게 연구 실무력을 바탕으로 한 거시적 R&D 전략가로서의 준비를 증명해 합격을 달성하십시오."
      }
    };
  }
  // STEP 6. POSITION DIAGNOSIS & AI COACH ADVICE GENERATION
  let positionDiagnosis = "";
  let coachAdvice = "";

  if (family === "HR") {
    positionDiagnosis = `사용자님의 현재 직무명은 "${jobName}" 이며, 인사 분류 체계에 따라 [${currentTrack}] 트랙에 속합니다. 부서 및 비즈니스 유닛 분석에 따른 조직 내 위계 레벨은 ${currentLevel}로 판별되었습니다. 현 위치에서의 단단한 경험과 R&R 조율 능력은 다음 레벨로 확장하기 위한 훌륭한 레버리지입니다.`;
    
    coachAdvice = `"조직의 거버넌스를 설계하고 현업의 애로사항을 조율하는 HR 전문가로서, ${persona.name} 님이 닦아오신 ${persona.primarySkill || jobName} 전문성은 매우 소중한 자산입니다. \n\n현재 사용자님은 ${careerPhase === 'Transition Ready' ? '현장 파트너로서 쌓아온 탄탄한 문제해결 노하우를 바탕으로, 본사/본부 차원의 조직 거버넌스 확장이나 전사 인사기획으로의 피벗을 시도하기에 인생에서 가장 황홀한 전환 기로에 서 계십니다.' : '보유하신 핵심 역량을 정량화하고 가치화하여 본사/본부 HR로의 계층 확장과 인사 전략 기획가로서의 역할 전환을 동시에 꾀할 수 있는 최적의 성장 궤도에 진입하셨습니다.'}\n\n데이터 기반의 이동 경로가 제안하는 시나리오를 나침반 삼아, 더 큰 성장을 향해 두려움 없이 나아가십시오. AI 코칭 리포트가 그 여정을 온전히 응원하겠습니다."`;
  } else if (family === "마케팅") {
    positionDiagnosis = `사용자님의 현재 직무명은 "${jobName}" 이며, 마케팅 분류 체계에 따라 [${currentTrack}] 트랙에 속합니다. 부서 및 비즈니스 유닛 분석에 따른 조직 내 위계 레벨은 ${currentLevel}로 판별되었습니다. 현 위치에서의 데이터 효율 분석 및 정밀 매체 집행 역량은 전사 브랜드 리더로 확장하기 위한 훌륭한 레버리지입니다.`;
    
    coachAdvice = `"트렌드를 선도하고 정량적 성과를 데이터로 입증하는 마케팅 전문가로서, ${persona.name} 님이 닦아오신 ${persona.primarySkill || jobName} 전문성은 매우 소중한 자산입니다. \n\n현재 사용자님은 ${careerPhase === 'Transition Ready' ? '퍼포먼스 마케팅을 통해 구축한 완결적인 고객 분석 노하우를 기반으로, 전사 브랜드 마케팅 전략 수립 및 제품 총괄 PM(브랜드 매니저)으로의 확장을 꾀하기에 가장 탁월한 성장의 기로에 서 계십니다.' : '보유하신 데이터 센싱 역량을 정량화하여 글로벌 브랜드 캠페인 기획 및 통합 마케팅(IMC) 전략가로서의 역할 확장을 꾀할 수 있는 최적의 성장 궤도에 진입하셨습니다.'}\n\n데이터 기반의 이동 경로가 제안하는 마케팅 시나리오를 나침반 삼아, 더 큰 성장을 향해 두려움 없이 나아가십시오. AI 코칭 리포트가 그 여정을 온전히 응원하겠습니다."`;
  } else if (family === "영업") {
    positionDiagnosis = `사용자님의 현재 직무명은 "${jobName}" 이며, 영업 분류 체계에 따라 [${currentTrack}] 트랙에 속합니다. 부서 및 비즈니스 유닛 분석에 따른 조직 내 위계 레벨은 ${currentLevel}로 판별되었습니다. 현장에서 축적한 고객 네트워크와 신규 채널 개척 성과는 글로벌 매출 전략가로 성장하기 위한 훌륭한 레버리지입니다.`;
    
    coachAdvice = `"고객의 페인포인트를 해결하고 비즈니스 딜을 성사시키는 전략 영업가로서, ${persona.name} 님이 닦아오신 ${persona.primarySkill || jobName} 전문성은 매우 소중한 자산입니다. \n\n현재 사용자님은 ${careerPhase === 'Transition Ready' ? '현장 밀착형 영업을 통해 다진 탄탄한 고객 신뢰를 바탕으로, 글로벌 권역의 해외 영업 확장 및 전사 매출 포트폴리오를 총괄 수립하는 영업 기획으로의 도약을 시도하기에 가장 완벽한 전환 기로에 서 계십니다.' : '보유하신 고객 협상력과 파이프라인 관리 능력을 바탕으로, 본사 해외영업실 또는 전략적 KAM(핵심고객관리) 스페셜리스트로서의 역할 확장을 동시에 도모할 수 있는 최적의 성장 궤도에 진입하셨습니다.'}\n\n데이터 기반의 이동 경로가 제안하는 비즈니스 시나리오를 나침반 삼아, 더 큰 성장을 향해 두려움 없이 나아가십시오. AI 코칭 리포트가 그 여정을 온전히 응원하겠습니다."`;
  } else if (family === "R&D") {
    positionDiagnosis = `사용자님의 현재 직무명은 "${jobName}" 이며, R&D 분류 체계에 따라 [${currentTrack}] 트랙에 속합니다. 부서 및 비즈니스 유닛 분석에 따른 조직 내 위계 레벨은 ${currentLevel}로 판별되었습니다. 원천 실험 설계 및 공정 시뮬레이션 지식은 미래 신기술 로드맵을 설계하는 핵심 전략가로 도약하기 위한 훌륭한 레버리지입니다.`;
    
    coachAdvice = `"기술적 문제해결력과 원천 기술 개발을 통해 미래 성장 동력을 확보하는 R&D 전문가로서, ${persona.name} 님이 닦아오신 ${persona.primarySkill || jobName} 전문성은 매우 소중한 자산입니다. \n\n현재 사용자님은 ${careerPhase === 'Transition Ready' ? '연구실 실무를 통해 축적한 탁월한 도메인 분석력을 바탕으로, 중장기 기술 로드맵을 기획하는 R&D 전략가로 도약하거나 AI/SW 융합 기반 스마트 팩토리 연구원으로 피벗을 도모하기에 가장 귀중한 기로에 서 계십니다.' : '보유하신 실험 설계 및 데이터 분석 능력을 정량화하고 고도화하여, 본사 R&D기획팀으로의 계층 확장 및 공정/양산 수율 최적화 스페셜리스트로서의 성장을 동시에 꾀할 수 있는 최적의 궤도에 진입하셨습니다.'}\n\n데이터 기반의 이동 경로가 제안하는 기술 시나리오를 나침반 삼아, 더 큰 성장을 향해 두려움 없이 나아가십시오. AI 코칭 리포트가 그 여정을 온전히 응원하겠습니다."`;
  }

  return {
    jobName,
    totalYears,
    grade,
    currentTrack,
    currentLevel,
    careerPhase,
    phaseDescription,
    similarPathRate,
    recommendations,
    actionPlan,
    positionDiagnosis,
    coachAdvice
  };
}
