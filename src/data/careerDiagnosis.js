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
 *   }
 * }
 */

/**
 * [ADDITIONAL CAREER DIAGNOSIS LAYER - APPEND ONLY]
 * 
 * STEP 1. CURRENT POSITION DIAGNOSIS
 * Identify current position by job_name and classify Track.
 * 
 * STEP 2. CAREER PHASE CLASSIFICATION
 * Classify current phase (Early Stage, Growth Stage, Transition Ready, Strategy Phase, Leadership Phase).
 * 
 * STEP 3. TRANSITION PROBABILITY APPLICATION
 * Use transition probabilities as reasoning support (Do NOT calculate).
 * 
 * STEP 4. RECOMMENDATION ENHANCEMENT
 * Output MUST include:
 * 1. 현재 위치 (explicit label)
 * 2. 커리어 단계
 * 3. 추천 3가지 (Safe / Growth / Alternative)
 * 4. 각 추천의 성공 확률 범위
 * 5. 왜 이 추천이 현재 상태에 맞는지 설명
 * 
 * STEP 5. ACTION PLAN (ONLY TOP 1)
 * For best option, generate [30일] [90일] [6개월] with structure: 현재 → 목표 → Gap → Action
 * 
 * STEP 6. OUTPUT STYLE
 * Use Korean and structured format.
 * 
 * STEP 7. TONE
 * Coaching tone, no negative judgement, focus on growth, data-based explanation.
 */

export function diagnoseCareer(persona) {
  const jobName = persona.currentJobName || "";
  const totalYears = persona.totalYears || persona.yearsInRole || 1;
  const movementHistory = persona.movementHistory || [];
  const grade = persona.grade || "실무자";

  // STEP 1. CURRENT POSITION DIAGNOSIS
  let currentTrack = "기타 HR";
  
  // Classify Track using explicit rules
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
    // If not matching explicitly, try to infer from typical mapping or fallback
    if (persona.currentJobId === 'JOB_HR_RECRUIT') {
      currentTrack = "HRBP"; // Recruit connects closely with Talent Acquisition (HRBP)
    } else if (persona.currentJobId === 'JOB_HR_PLAN') {
      currentTrack = "HR Strategy";
    } else if (persona.currentJobId === 'JOB_HR_HRD') {
      currentTrack = "HRD";
    } else if (persona.currentJobId === 'JOB_HR_CNB') {
      currentTrack = "HR Strategy";
    } else if (persona.currentJobId === 'JOB_HR_LABOR') {
      currentTrack = "ER";
    }
  }

  // STEP 2. CAREER PHASE CLASSIFICATION
  let careerPhase = "Early Stage";
  let phaseDescription = "";

  // Check if Strategy experience is included in history or current role
  const hasStrategyExperience = movementHistory.some(h => 
    ["평가", "조직설계", "조직설계/운영", "인원인건비", "보상", "HRIS", "Strategy", "기획", "인사기획"].some(kw => h.jobName?.includes(kw))
  ) || currentTrack === "HR Strategy";

  // Check if long HR experience + expanded roles
  const isLongTermHR = totalYears >= 7 || ["수석", "리더"].includes(grade);

  if (currentTrack === "HRBP" && totalYears <= 2) {
    careerPhase = "Early Stage";
    phaseDescription = "HRBP 트랙 진입 후 현장 비즈니스 조율과 현업 관계 구축을 탄탄히 다지는 적응 및 시작 단계입니다.";
  } else if (currentTrack === "HRBP" && totalYears >= 3 && totalYears <= 5) {
    careerPhase = "Growth Stage";
    phaseDescription = "현장 밀착형 인사 파트너로서 성과를 리딩하고 조직 역량 강화를 전담하는 역량 만개 단계입니다.";
  } else if (currentTrack === "HRBP" && totalYears >= 3 && !hasStrategyExperience) {
    careerPhase = "Transition Ready";
    phaseDescription = "현장 파트너로서의 경험이 무르익어 비즈니스 기획 및 인사 기획(Strategy)으로의 확장을 모색하기에 가장 완벽한 시기입니다.";
  } else if (hasStrategyExperience) {
    careerPhase = "Strategy Phase";
    phaseDescription = "전사적 차원의 인사제도 설계, 평가보상 체계 구축 등 굵직한 HR 전략과 방향성을 주도하는 전략가 단계입니다.";
  } else if (isLongTermHR) {
    careerPhase = "Leadership Phase";
    phaseDescription = "인적 자본 전반의 통섭적 경험을 갖춘 리더로서, 전사의 핵심 인재 전략 및 미래 조직 로드맵을 리드하는 중추 단계입니다.";
  } else {
    // Fallback based on years
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

  // STEP 3 & 4. RECOMMENDATION ENHANCEMENT (Safe / Growth / Alternative)
  // Transition Probability Data serves as reasoning support:
  // HRBP 유지 (Stay): ~47%
  // HRBP -> HR Strategy: ~60% (Highest)
  // HRBP -> HRD: ~52%

  let recommendations = [];
  let actionPlan = null;

  if (currentTrack === "HRBP") {
    recommendations = [
      {
        type: "optimal",
        title: "HR Strategy (인사기획 / CHO 라인) 전환 ⭐",
        probability: "약 60%",
        successRate: "60%",
        reason: "현장 밀착형으로 다져진 현업 부서 비즈니스 맥락과 인력 공백 구조를 꿰뚫는 눈이 제도 설계에 반영될 때 폭발적 시너지가 나기 때문입니다. CHO 라인 내에서도 기획력과 현장 감각을 모두 갖춘 실무자를 가장 우대하며, 사내 통계적으로도 60%에 달하는 최고 수준의 매칭율을 보장합니다.",
        description: "전사 조직 설계, 핵심 평가제도 개편 및 인원/인건비 예산 기획을 주도하는 인사기획실의 핵심 스태프로 전환하는 시나리오입니다."
      },
      {
        type: "safe",
        title: "HRBP 전문성 고도화 및 파트너십 수성 (안정 경로)",
        probability: "약 47%",
        probabilityText: "약 47% (동일 영역 안착 확률)",
        successRate: "47%",
        reason: "기존의 탄탄한 현업 네트워크와 조직 문화 케어 역량을 그대로 누적시킬 수 있습니다. 급격한 직무 전환 스트레스 없이 핵심 사업부 시니어 HRBP 또는 본부 총괄 HRBP로의 안정 성장이 가능하여 심리적 안정감이 큽니다.",
        description: "현재 부서 내에서 조직문화 체계 정교화 및 핵심 인재 Talent Management 체계를 지속적으로 강화하는 경로입니다."
      },
      {
        type: "alternative",
        title: "HRD (인재육성 및 리더십 코칭) 스페셜리스트 전환 (대안 경로)",
        probability: "약 52%",
        successRate: "52%",
        reason: "HRBP 면담 과정에서 파악된 개별 구성원들의 성장 결핍과 리더십 갭을 '사내 교육 시스템 설계' 및 '리더십 파이프라인 정착'으로 직접 풀어내는 훌륭한 인접 직무 연계입니다. 사람의 성장을 직접 조력하며 소통하는 강점을 그대로 살릴 수 있습니다.",
        description: "인재 양성, 핵심 교육과정 설계, 사내 코칭 및 리더십 육성 프로그램을 전문적으로 기획하는 직무 전환 시나리오입니다."
      }
    ];

    // STEP 5. ACTION PLAN (ONLY TOP 1)
    actionPlan = {
      optimalTitle: "HR Strategy (인사기획) 전환 경로",
      "30day": {
        current: "현업 밀착형 HRBP 수행 (소통, 갈등 관리, 수시 채용 등)",
        target: "인사 기획적 데이터 감각 및 전사 마인드셋 탑재",
        gap: "HR 지표(퇴직 동향, 인건비 시뮬레이션, 생산성)의 수치화 및 리포팅 경험 부족",
        action: "담당 사업부의 3개년 퇴직율 분포 및 핵심 인재 유출 추이를 엑셀과 BI 도구로 분석하여, 정량적인 '사업부 맞춤형 인력 체질 개선 제안서'의 1차 초안을 도출해 보십시오. 숫자로 설득하는 전략 기획의 기초 체력을 다집니다."
      },
      "90day": {
        current: "정량 분석 기초 체력 장착 상태",
        target: "전사 조직 설계 및 평가/보상 제도 시뮬레이션 경험 탑재",
        gap: "전사 조직 설계(R&R) 룰 및 직급/보상 설계 방법론 지식 부족",
        action: "인사기획실 멘토(예: 김태영 책임)와 공식 매칭을 신청하고, 주 1회 커피챗 세션을 통해 전사 임금 인상 시뮬레이션 방식과 조직 설계 템플릿을 학습하세요. 가상의 '신설 사업부 인력/인건비 3개년 계획서'를 작성해 피드백을 받습니다."
      },
      "6month": {
        current: "가상 제도 설계 기획서 및 데이터 준비 완료",
        target: "인사기획(HR Strategy) 부서 전보 및 성공적 연착륙",
        gap: "공식적인 전보 기회 포착 및 전략 포트폴리오 면접 통과",
        action: "하반기 사내 잡마켓 공모 시 인사기획 또는 조직 설계 직무에 공식 전보 신청을 접수하세요. 면접장에서 그동안 손수 기획한 '사업부 인사 지표 분석서' 및 '신설 부서 인건비 시뮬레이션 포트폴리오'를 함께 제시하여 준비된 인재임을 강력히 입증하십시오."
      }
    };
  } else if (currentTrack === "HR Strategy") {
    recommendations = [
      {
        type: "optimal",
        title: "HRBP (비즈니스 파트너) 리더십 전보 ⭐",
        probability: "약 60%",
        successRate: "60%",
        reason: "기획실에서 종이와 엑셀 위에서 기획한 평가, 보상, 조직 제도가 실제 영업/마케팅/연구소 현장에서 작동하며 발생하는 갈등을 직접 해결하는 '인사 리드 전문가'로 도약하기 위해서입니다. 기획 논리를 꿰찬 HRBP는 사업부 본부장들이 가장 소유하고 싶어 하는 파트너가 됩니다.",
        description: "핵심 사업본부의 밀착형 HRBP로 전보하여 전사 인사 제도의 현장 실행 임팩트를 끝까지 총괄 리드합니다."
      },
      {
        type: "safe",
        title: "인사기획 최고 스페셜리스트 성장 (안정 경로)",
        probability: "약 55%",
        successRate: "55%",
        reason: "CHO 직속 라인의 핵심으로서 기존에 다져온 평가, 보상, 조직 제도 설계의 전문성을 극한으로 고도화합니다. 전사 중장기 예산 수립 및 임금 협상 시뮬레이션의 대체 불가한 핵심 요원으로 성장하는 강력한 인사 커리어입니다.",
        description: "전사 보상 거버넌스 수립, M&A 대응 조직 통합(PMI) 전략 설계 및 인사기획 파트너 리더십 경로를 구축합니다."
      },
      {
        type: "alternative",
        title: "HR Analytics 및 People Science 전문가 (대안 경로)",
        probability: "약 48%",
        successRate: "48%",
        reason: "인사기획실의 뼈대 위에 정교한 데이터 사이언스를 결합하는 것입니다. 정성적 제도 설계를 벗어나 퇴직률 예측 AI 알고리즘 구축, 협업 네트워크 분석(ONA) 등 정밀 People Analytics 분야로 피벗하여 최고의 희소 전문성을 확보합니다.",
        description: "Python, SQL 및 통계 분석 도구를 활용하여 전사 인적 자원 예측 모델 및 조직 건강 지표를 실시간 계량화하여 경영진을 지원하는 전문가가 됩니다."
      }
    ];

    actionPlan = {
      optimalTitle: "HRBP 리더십 전보 경로",
      "30day": {
        current: "전사 평가/보상 제도 설계 및 인건비 관리",
        target: "현장 사업 본부의 비즈니스 맥락과 인적 애로사항 체감 및 정성 진단",
        gap: "현업 부서의 복잡한 R&R 충돌 및 실무원들의 정성적 감정 갭을 센싱하는 정성적 면담 감각 부족",
        action: "본사와 멀리 떨어진 제조/영업 지점의 현장 실무자 및 팀 리더들을 만나 현 인사 제도의 구체적인 부작용과 건의사항을 직접 청취하는 '현장 소통 FGI'를 2회 이상 실시해보세요. 활자 너머의 생생한 현장 목소리를 수집합니다."
      },
      "90day": {
        current: "현장 문제점 정성 데이터 장착 상태",
        target: "현업 사업부 맞춤형 조직 활성화 및 리더십 코칭 패키지 수립",
        gap: "조직 갈등 중재 기법, 면담 스킬 및 정서적 설득 대화법 숙련도 미흡",
        action: "HRBP 멘토(예: 김태영 책임)와 주간 미팅을 진행해 '실제 부서 내 R&R 갈등 중재법'과 '조직 진단 피드백 워크숍 설계'를 매치 학습하세요. 사내 코칭 및 임원 대화법 교육을 이수하여 개인 설득 역량을 보강합니다."
      },
      "6month": {
        current: "현장 코칭 기법 및 사업부 커스터마이징 전략 완비",
        target: "핵심 사업본부 HRBP 부서 전보 및 현장 안착",
        gap: "공식 전보 발령 및 사업부 본부장과의 비즈니스 얼라인",
        action: "정기 부서 전보 매칭 신청서에 1지망으로 핵심 사업본부 HRBP를 제출하세요. 인터뷰 시 '인사기획 전문가로서 전사 평가제도의 본질을 살리면서, 귀 부서의 R&R 조정을 통해 협업 임팩트를 20% 끌어올리겠다'는 사업지향적 100일 로드맵을 제시하십시오."
      }
    };
  } else if (currentTrack === "HRD") {
    recommendations = [
      {
        type: "optimal",
        title: "HRBP (육성/조직개발형 비즈니스 파트너) ⭐",
        probability: "약 52%",
        successRate: "52%",
        reason: "개인 차원의 단순 육성에 머무르던 HRD의 시야를, 실제 비즈니스 본부의 성과 갭을 메우는 '종합 인적자본 파트너십(HRBP)'으로 웅장하게 확장할 수 있기 때문입니다. 소통력이 뛰어나고 성장을 돕는 HRD 출신의 HRBP는 현업 리더들의 만족도가 전 트랙 중 가장 우수합니다.",
        description: "특정 본부의 전담 HRBP로 전보하여, 현업 조직 역량 진단을 토대로 맞춤형 인재 육성과 조직문화 활성화를 올인원으로 전담 리드합니다."
      },
      {
        type: "safe",
        title: "전사 리더십 파이프라인 및 글로벌 육성 마스터 (안정 경로)",
        probability: "약 50%",
        successRate: "50%",
        reason: "기존의 단발성 교육과정 설계에서 탈피하여 전사의 핵심인재(Hipo) 선발 및 육성 체계, 그리고 글로벌 법인 주재원 육성 체계를 기획하는 최고 수준의 HRD 스페셜리스트의 커리어를 공고화합니다.",
        description: "전사 차세대 최고경영자(CEO) 육성 로드맵 설계, 핵심 인재 액션 러닝 및 전사 리더십 코칭 체계를 기획·총괄합니다."
      },
      {
        type: "alternative",
        title: "조직문화(Culture) 및 사내 커뮤니케이션 리더 (대안 경로)",
        probability: "약 48%",
        successRate: "48%",
        reason: "개인 학습(HRD)의 관점을 확장해 거대한 조직의 활력과 문화를 바꾸는 것입니다. 전사 핵심 가치 전파, ESG 다양성/포용성 프로그램 설계 및 타운홀 미팅 혁신 등을 통해 회사의 일하는 방식을 선도하는 문화 리더로 발돋움합니다.",
        description: "사내 양방향 소통 채널 구축, 긍정 조직 문화 프로그램 및 전사 행복 지수 분석을 총괄 리드하는 리더로 전향합니다."
      }
    ];

    actionPlan = {
      optimalTitle: "육성/조직개발형 HRBP 전환 경로",
      "30day": {
        current: "사내 교육과정 기획 및 교수 설계 운영",
        target: "목표 사업 본부의 비즈니스 현황 및 부서별 역량 갭의 정량적 탐색",
        gap: "교육 너머의 비즈니스 성과 지표(KPI) 구조 이해 및 조직 문제의 종합적 분석 능력 부족",
        action: "전보 대상인 사업본부의 최근 사업 실적 자료 및 경쟁사 동향 보고서를 철저히 분석하고, 본부 내 핵심 직무 5개의 '실제 직무 역량 프로파일'을 설계하여 부서원들의 실질적 역량 결핍 맵을 직접 구성해보세요."
      },
      "90day": {
        current: "조직 역량 갭 데이터 분석 완료 상태",
        target: "사업 본부 맞춤형 조직 개발(OD) 컨설팅 솔루션 설계",
        gap: "조직 진단 서베이 도구 활용법 및 리더십 피드백 피어 세션 운영 노하우 미숙",
        action: "사내 조직개발(OD) 전문가 및 선배 HRBP 팀장과 멘토링을 연계하고, '부서 단위 조직 건강 진단 및 맞춤 활성화 솔루션'의 시뮬레이션 제안서를 빌드해보십시오. 실제 가상 피드백 워크숍 시나리오를 구성합니다."
      },
      "6month": {
        current: "조직 컨설팅 솔루션 및 피드백 워크숍 기획서 완비",
        target: "원하는 본부의 전담 HRBP로 전보 발령 및 조직 변화 견인",
        gap: "공공연한 전직 기회 선점 및 실전 현업 리더십 설득 단계 진입",
        action: "차기 사내 잡마켓 및 공모 매칭 시 타겟 본부의 HRBP를 지원하세요. 인터뷰 시 'HRD 분석 데이터에 기초하여 현업 주니어의 온보딩 갭을 해결하고 조직 몰입도를 15% 이상 개선하겠다'는 육성형 비즈니스 제안서로 합격을 확정 지으십시오."
      }
    };
  } else {
    // ER & Other HR Tracks
    recommendations = [
      {
        type: "optimal",
        title: "HRBP (노무 리스크 선제 관리형 현업 파트너) ⭐",
        probability: "약 48%",
        successRate: "48%",
        reason: "컴플라이언스와 노동법 지식, 그리고 현장의 첨예한 갈등 조율 경험이 종합 인사 관리(HRBP) 영역에 결합할 때 최고의 안정감을 가져다주기 때문입니다. 제조 현장이나 대규모 영업 조직 등 노무 이슈가 빈번한 부서의 리더들은 노무 전문성을 겸비한 HRBP를 최고로 대접합니다.",
        description: "실제 부서 내 주 52시간 관리, 직장 내 괴롭힘 예방 및 세대 갈등 조율을 안전하게 방어하며 조직의 비즈니스 집중도를 견인하는 파트너가 됩니다."
      },
      {
        type: "safe",
        title: "전사 노경 상생 및 Labor Relations 최고 전문가 (안정 경로)",
        probability: "약 60%",
        successRate: "60%",
        reason: "노무관리 전문성을 한층 공고히 다져 단체교섭, 노사협의회 전략 설계 및 국내외 노동 법규 리스크 모니터링 체계를 총괄 관리하는 사내 최고 노동 전문가로 자리매김하는 굵직한 커리어입니다.",
        description: "전사 상생협력 노사 전략 수립, 노사 교섭 기획 및 전사 노경 리스크 실시간 진단을 총괄 리드합니다."
      },
      {
        type: "alternative",
        title: "인사기획실(HR Strategy) 내 노경-보상 연계 전문가 (대안 경로)",
        probability: "약 45%",
        successRate: "45%",
        reason: "현장 노경에 편중되었던 시각을 전사 제도로 넓혀, 임금 인상 시뮬레이션 및 복리후생 제도 개편 시 노무 이슈를 완벽하게 선제 조율하는 하이브리드 인사기획 전문가로 변신하는 커리어입니다.",
        description: "임금협상 재무 시뮬레이션 전략 수립, 단체협약 기반 복지제도 기획 및 전사 제도 개편 시 노무 법률 컴플라이언스 검토를 총괄 리드합니다."
      }
    ];

    actionPlan = {
      optimalTitle: "노무형 HRBP 전환 경로",
      "30day": {
        current: "현장 노경 이슈 해결 및 사내 규정 컴플라이언스 모니터링",
        target: "인사기획 및 평가/보상 전반의 기초 프레임과 현업 비즈니스 맥락 센싱",
        gap: "종합 인사제도(평가, 보상, 채용)의 유기적 흐름 파악 및 HR 정량 분석 경험 부족",
        action: "사내 채용 프로세스 및 평가 규정집을 정밀 분석하고, 부서의 인력 구성 특징을 분석하기 위해 '본부별 인력 분포 데이터'를 가져와 연령별/연차별 특징을 통계적으로 요약·정리해보세요."
      },
      "90day": {
        current: "종합 인사제도 파악 및 정량화 훈련 상태",
        target: "현장 소통 코칭 및 갈등 선제 차단 템플릿 완성",
        gap: "조직개발 코칭 면담 스킬 및 소통 전문가로서의 설득 노하우 부족",
        action: "HRBP 선배와의 멘토링을 통해 '부서 내 잠재적 인사 리스크 선제 센싱 및 조율 템플릿'의 가상 안을 수립해 보십시오. 사내교육 과정에서 '면담 심리학 및 감정 조율' 교안을 학습해 역량을 충전합니다."
      },
      "6month": {
        current: "조율 템플릿 및 종합 HR 갭 분석 지식 완비",
        target: "현장 전담 HRBP 임용 및 조직 갈등 해소 임팩트 실현",
        gap: "공식 전보 임명 및 사업부 본부장/리더들과의 화학적 파트너십 구축",
        action: "사내 공모제를 통해 HRBP 직무에 도전하십시오. 면접 현장에서 '노무 관리 전문가로서 부서 내 노무 컴플라이언스를 제로 리스크로 완벽 통제하고, 리더들이 성과 창출에만 몰두할 수 있는 최고의 안전 지대를 구축하겠다'는 포부를 당당하게 제시하세요."
      }
    };
  }

  return {
    jobName,
    totalYears,
    grade,
    currentTrack,
    careerPhase,
    phaseDescription,
    recommendations,
    actionPlan
  };
}
