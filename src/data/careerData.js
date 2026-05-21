// ============================================================
// Career Graph 데이터 — 직무 네트워크 (Fake Data)
// ============================================================

// 직무 노드 정의
export const JOB_NODES = {
  // HR 직무군
  JOB_HR_RECRUIT: { id: 'JOB_HR_RECRUIT', name: '채용', family: 'HR', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 35, vacancies: 1, avgTenure: 3.2, growthTrend: 'stable', description: '채용 전략 수립, ATS 운영, 면접 프로세스 관리' },
  JOB_HR_HRD: { id: 'JOB_HR_HRD', name: 'HRD', family: 'HR', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 25, vacancies: 2, avgTenure: 2.8, growthTrend: 'growing', description: '교육 체계 설계, 리더십 개발, 조직개발 프로그램 운영' },
  JOB_HR_HRBP: { id: 'JOB_HR_HRBP', name: 'HRBP', family: 'HR', level: '책임', isHub: true, isLeadership: false, isDeadEnd: false, headcount: 40, vacancies: 3, avgTenure: 3.5, growthTrend: 'growing', description: '사업부 밀착형 HR 파트너로서 인사 전략 수립 및 실행' },
  JOB_HR_CNB: { id: 'JOB_HR_CNB', name: 'C&B', family: 'HR', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 20, vacancies: 0, avgTenure: 4.1, growthTrend: 'stable', description: '보상 체계 설계, 복리후생 운영, 시장 보상 벤치마크' },
  JOB_HR_LABOR: { id: 'JOB_HR_LABOR', name: '노무관리', family: 'HR', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: true, headcount: 15, vacancies: 0, avgTenure: 5.2, growthTrend: 'declining', description: '노사관계 관리, 근로기준법 준수, 노동 분쟁 대응' },
  JOB_HR_PLAN: { id: 'JOB_HR_PLAN', name: '인사기획', family: 'HR', level: '책임', isHub: false, isLeadership: true, isDeadEnd: false, headcount: 15, vacancies: 1, avgTenure: 3.0, growthTrend: 'stable', description: '중장기 인사 전략 수립, 인력 계획, 제도 기획' },
  JOB_HR_ANALYTICS: { id: 'JOB_HR_ANALYTICS', name: 'HR Analytics', family: 'HR', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 10, vacancies: 2, avgTenure: 2.5, growthTrend: 'growing', description: 'HR 데이터 분석, People Analytics, 의사결정 지원' },

  // 마케팅 직무군
  JOB_MKT_PERF: { id: 'JOB_MKT_PERF', name: '퍼포먼스 마케팅', family: '마케팅', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 45, vacancies: 3, avgTenure: 2.8, growthTrend: 'growing', description: '디지털 광고 캠페인 기획·집행·최적화, ROAS 관리' },
  JOB_MKT_BRAND: { id: 'JOB_MKT_BRAND', name: '브랜드 마케팅', family: '마케팅', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 30, vacancies: 1, avgTenure: 3.5, growthTrend: 'stable', description: '브랜드 전략 수립, 브랜드 캠페인 기획, 브랜드 가치 관리' },
  JOB_MKT_CONTENT: { id: 'JOB_MKT_CONTENT', name: '콘텐츠 마케팅', family: '마케팅', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 25, vacancies: 2, avgTenure: 2.5, growthTrend: 'growing', description: '콘텐츠 전략, SNS 운영, 영상/블로그/뉴스레터 기획·제작' },
  JOB_MKT_CRM: { id: 'JOB_MKT_CRM', name: 'CRM 마케팅', family: '마케팅', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 20, vacancies: 1, avgTenure: 3.0, growthTrend: 'growing', description: '고객 세그먼테이션, 리텐션 캠페인, CRM 시스템 운영' },
  JOB_MKT_PM: { id: 'JOB_MKT_PM', name: '통합 마케팅 PM', family: '마케팅', level: '책임', isHub: true, isLeadership: false, isDeadEnd: false, headcount: 15, vacancies: 1, avgTenure: 3.2, growthTrend: 'growing', description: '전사 마케팅 캠페인 총괄, 채널 통합 전략, 예산 관리' },
  JOB_MKT_STRATEGY: { id: 'JOB_MKT_STRATEGY', name: '마케팅 전략', family: '마케팅', level: '책임', isHub: false, isLeadership: true, isDeadEnd: false, headcount: 10, vacancies: 0, avgTenure: 3.8, growthTrend: 'stable', description: '시장 분석, 마케팅 전략 수립, CMO 보좌' },

  // 영업 직무군
  JOB_SALES_NEW: { id: 'JOB_SALES_NEW', name: '신규영업', family: '영업', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 50, vacancies: 5, avgTenure: 2.5, growthTrend: 'stable', description: '신규 고객 발굴, 제안서 작성, 영업 파이프라인 관리' },
  JOB_SALES_KAM: { id: 'JOB_SALES_KAM', name: 'KAM', family: '영업', level: '책임', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 25, vacancies: 2, avgTenure: 3.8, growthTrend: 'stable', description: '핵심 고객 관계 관리, 장기 파트너십 구축, 매출 극대화' },
  JOB_SALES_PLAN: { id: 'JOB_SALES_PLAN', name: '영업기획', family: '영업', level: '책임', isHub: true, isLeadership: false, isDeadEnd: false, headcount: 20, vacancies: 1, avgTenure: 3.0, growthTrend: 'growing', description: '영업 전략 수립, 실적 분석, 인센티브 설계' },
  JOB_SALES_CHANNEL: { id: 'JOB_SALES_CHANNEL', name: '채널영업', family: '영업', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 30, vacancies: 2, avgTenure: 3.2, growthTrend: 'stable', description: '유통 채널 관리, 파트너사 협업, 채널별 매출 관리' },
  JOB_SALES_MGMT: { id: 'JOB_SALES_MGMT', name: '영업관리', family: '영업', level: '책임', isHub: false, isLeadership: true, isDeadEnd: false, headcount: 15, vacancies: 0, avgTenure: 4.0, growthTrend: 'stable', description: '영업 조직 관리, CRM 시스템 운영, 매출 예측' },
  JOB_SALES_OVERSEAS: { id: 'JOB_SALES_OVERSEAS', name: '해외영업', family: '영업', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 20, vacancies: 3, avgTenure: 3.5, growthTrend: 'growing', description: '해외 시장 개척, 수출 관리, 현지 파트너 관리' },

  // R&D 직무군
  JOB_RND_MATERIAL: { id: 'JOB_RND_MATERIAL', name: '소재연구', family: 'R&D', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 40, vacancies: 2, avgTenure: 4.0, growthTrend: 'stable', description: '신소재 탐색, 소재 물성 분석, 시제품 제작' },
  JOB_RND_PROCESS: { id: 'JOB_RND_PROCESS', name: '공정개발', family: 'R&D', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 35, vacancies: 2, avgTenure: 3.5, growthTrend: 'stable', description: '제조 공정 설계, 공정 최적화, 수율 개선' },
  JOB_RND_MASS: { id: 'JOB_RND_MASS', name: '양산기술', family: 'R&D', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: true, headcount: 30, vacancies: 1, avgTenure: 5.0, growthTrend: 'declining', description: '양산 라인 기술 지원, 생산성 향상, 불량 분석' },
  JOB_RND_QUALITY: { id: 'JOB_RND_QUALITY', name: '품질R&D', family: 'R&D', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 25, vacancies: 1, avgTenure: 3.8, growthTrend: 'stable', description: '품질 표준 수립, 신뢰성 시험, 품질 데이터 분석' },
  JOB_RND_PLAN: { id: 'JOB_RND_PLAN', name: 'R&D기획', family: 'R&D', level: '책임', isHub: true, isLeadership: true, isDeadEnd: false, headcount: 15, vacancies: 1, avgTenure: 3.0, growthTrend: 'growing', description: 'R&D 로드맵 수립, 과제 관리, 기술 전략' },
  JOB_RND_AI: { id: 'JOB_RND_AI', name: 'AI/SW개발', family: 'R&D', level: '실무자', isHub: false, isLeadership: false, isDeadEnd: false, headcount: 20, vacancies: 5, avgTenure: 2.0, growthTrend: 'growing', description: 'AI 모델 개발, SW 설계, MLOps 구축' },
}

// 직무 이동 엣지 (from -> to, count, source)
export const JOB_MOVEMENTS = [
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

  if (scenario === 'safe') {
    // 안전형: 동일 직무군, 이동 빈도 상위 70%
    const familyEdges = JOB_MOVEMENTS.filter(e => {
      const fromJob = JOB_NODES[e.from]
      const toJob = JOB_NODES[e.to]
      return fromJob?.family === currentFamily && toJob?.family === currentFamily
    })
    const threshold = familyEdges.length > 0 
      ? familyEdges.map(e => e.count).sort((a, b) => b - a)[Math.floor(familyEdges.length * 0.3)] || 0
      : 0
    relevantEdges = familyEdges.filter(e => e.count >= threshold)
  } else if (scenario === 'challenge') {
    // 도전형: 크로스 직무군 포함
    relevantEdges = JOB_MOVEMENTS.filter(e => {
      const fromJob = JOB_NODES[e.from]
      const toJob = JOB_NODES[e.to]
      return (fromJob?.family === currentFamily || toJob?.family === currentFamily)
    })
  } else {
    // T자형: 허브 경유
    const familyEdges = JOB_MOVEMENTS.filter(e => {
      const fromJob = JOB_NODES[e.from]
      const toJob = JOB_NODES[e.to]
      return fromJob?.family === currentFamily && toJob?.family === currentFamily
    })
    // 허브로 가는 엣지 + 허브에서 나가는 엣지 + 일부 크로스
    const hubIds = Object.values(JOB_NODES)
      .filter(j => j.isHub)
      .map(j => j.id)
    
    const crossEdges = JOB_MOVEMENTS.filter(e => {
      return (hubIds.includes(e.from) || hubIds.includes(e.to)) &&
             (JOB_NODES[e.from]?.family === currentFamily || JOB_NODES[e.to]?.family === currentFamily)
    })
    relevantEdges = [...familyEdges, ...crossEdges]
    // deduplicate
    const seen = new Set()
    relevantEdges = relevantEdges.filter(e => {
      const key = `${e.from}-${e.to}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  relevantEdges.forEach(e => {
    relevantNodeIds.add(e.from)
    relevantNodeIds.add(e.to)
  })

  const nodes = Array.from(relevantNodeIds).map(id => JOB_NODES[id]).filter(Boolean)
  return { nodes, edges: relevantEdges }
}

// Cytoscape 포맷 변환
export function toCytoscapeElements(currentJobId, scenario) {
  const { nodes, edges } = filterByScenario(currentJobId, scenario)
  const maxCount = Math.max(...edges.map(e => e.count), 1)

  const elements = []

  // 노드
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

  // 엣지
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
export const JOB_REQUIRED_SKILLS = {
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

// 직무별 시나리오 경로 추천
export function getScenarioRecommendations(currentJobId) {
  const recommendations = {
    // 마케팅
    'JOB_MKT_PERF': {
      safe: { targetId: 'JOB_MKT_CRM', name: 'CRM 마케팅 시니어', description: '퍼포먼스 역량을 기반으로 CRM 영역 강화', avgYears: 2.5, difficulty: '낮음' },
      challenge: { targetId: 'JOB_MKT_BRAND', name: '브랜드 마케팅 전환', description: '디지털에서 브랜드 영역으로 도전적 전환', avgYears: 3.5, difficulty: '높음' },
      'T자형': { targetId: 'JOB_MKT_PM', name: '통합 마케팅 PM', description: '퍼포먼스 전문성 + 통합 시야를 겸비한 허브 직무', avgYears: 3.0, difficulty: '중간' },
    },
    'JOB_MKT_CRM': {
      safe: { targetId: 'JOB_MKT_PERF', name: '퍼포먼스 마케팅 전환', description: '데이터 중심의 광고 퍼포먼스 영역 강화', avgYears: 2.0, difficulty: '낮음' },
      challenge: { targetId: 'JOB_MKT_BRAND', name: '브랜드 마케팅 전환', description: '고객 관계 기반에서 브랜드 가치 구축으로 확장', avgYears: 3.2, difficulty: '높음' },
      'T자형': { targetId: 'JOB_MKT_PM', name: '통합 마케팅 PM', description: 'CRM 분석과 캠페인 리딩 역량을 통합한 허브 직무', avgYears: 3.0, difficulty: '중간' },
    },
    'JOB_MKT_BRAND': {
      safe: { targetId: 'JOB_MKT_CONTENT', name: '콘텐츠 마케팅 협업', description: '브랜드 중심의 크리에이티브 역량 확장', avgYears: 2.0, difficulty: '낮음' },
      challenge: { targetId: 'JOB_MKT_STRATEGY', name: '마케팅 전략 수립', description: '브랜드 리딩 경험을 기반으로 CMO 전략 기획 보좌', avgYears: 3.5, difficulty: '높음' },
      'T자형': { targetId: 'JOB_MKT_PM', name: '통합 마케팅 PM', description: '브랜드 가치와 다채널 기획을 총괄하는 허브 직무', avgYears: 3.0, difficulty: '중간' },
    },
    'JOB_MKT_CONTENT': {
      safe: { targetId: 'JOB_MKT_BRAND', name: '브랜드 마케팅 전환', description: '스토리텔링을 넘어 전사 브랜드 가치 관리', avgYears: 2.5, difficulty: '낮음' },
      challenge: { targetId: 'JOB_MKT_PERF', name: '퍼포먼스 마케팅 확장', description: '크리에이티브 역량에 정량 데이터 분석 융합', avgYears: 3.0, difficulty: '높음' },
      'T자형': { targetId: 'JOB_MKT_PM', name: '통합 마케팅 PM', description: '콘텐츠 제작 역량을 바탕으로 전사 총괄 PM 성장', avgYears: 3.5, difficulty: '중간' },
    },

    // HR
    'JOB_HR_RECRUIT': {
      safe: { targetId: 'JOB_HR_HRD', name: 'HRD 전환', description: '채용 경험을 기반으로 인재 개발 영역 확장', avgYears: 3.0, difficulty: '낮음' },
      challenge: { targetId: 'JOB_HR_ANALYTICS', name: 'HR Analytics 전환', description: '데이터 기반 HR로의 도전적 전환', avgYears: 4.0, difficulty: '높음' },
      'T자형': { targetId: 'JOB_HR_HRBP', name: 'HRBP', description: '채용 전문성 + 비즈니스 파트너 역할 확장', avgYears: 3.5, difficulty: '중간' },
    },
    'JOB_HR_HRD': {
      safe: { targetId: 'JOB_HR_RECRUIT', name: '채용 직무 전환', description: '육성 시각을 채용 소싱 단계로 전진 배치', avgYears: 2.5, difficulty: '낮음' },
      challenge: { targetId: 'JOB_HR_PLAN', name: '인사 기획 부서', description: '인재 개발 전문성을 기반으로 전사 제도 기획 진입', avgYears: 3.8, difficulty: '높음' },
      'T자형': { targetId: 'JOB_HR_HRBP', name: 'HRBP', description: '인재 육성 역량과 리더십 코칭을 결합한 비즈니스 파트너', avgYears: 3.0, difficulty: '중간' },
    },
    'JOB_HR_CNB': {
      safe: { targetId: 'JOB_HR_PLAN', name: '인사 기획 부서', description: '보상 데이터 분석을 기반으로 중장기 인사제도 설계', avgYears: 3.0, difficulty: '낮음' },
      challenge: { targetId: 'JOB_HR_HRD', name: 'HRD 영역 개발', description: '보상에서 인재 개발로 직무의 패러다임 전환', avgYears: 4.0, difficulty: '높음' },
      'T자형': { targetId: 'JOB_HR_HRBP', name: 'HRBP', description: '보상 전문성(C&B)을 무기로 한 강력한 사업부 파트너', avgYears: 3.5, difficulty: '중간' },
    },
    'JOB_HR_ANALYTICS': {
      safe: { targetId: 'JOB_HR_CNB', name: 'C&B 보상 분석', description: '데이터 기반 보상 벤치마크 및 분석 전문가', avgYears: 2.5, difficulty: '낮음' },
      challenge: { targetId: 'JOB_RND_AI', name: 'AI/SW 개발자', description: '피플 데이터를 넘어 엔지니어 트랙으로 도전적 피벗', avgYears: 4.0, difficulty: '높음' },
      'T자형': { targetId: 'JOB_HR_PLAN', name: '인사 기획 부서', description: '정량 데이터 분석을 기반으로 전사 전략을 기획하는 리더', avgYears: 3.0, difficulty: '중간' },
    },

    // 영업
    'JOB_SALES_NEW': {
      safe: { targetId: 'JOB_SALES_CHANNEL', name: '채널 영업 관리', description: '신규 개척 노하우를 채널 파트너에 이식', avgYears: 2.5, difficulty: '낮음' },
      challenge: { targetId: 'JOB_SALES_OVERSEAS', name: '해외 세일즈 개척', description: '글로벌 영토로 세일즈 무대 도전적 확장', avgYears: 3.5, difficulty: '높음' },
      'T자형': { targetId: 'JOB_SALES_PLAN', name: '영업 기획 파트', description: '현장 개척 경험과 전략적 숫자를 결합하는 허브 직무', avgYears: 3.0, difficulty: '중간' },
    },
    'JOB_SALES_KAM': {
      safe: { targetId: 'JOB_SALES_MGMT', name: '영업 관리 조직 리딩', description: '핵심 고객 관리 역량을 기반으로 전체 영업팀 관리', avgYears: 3.0, difficulty: '낮음' },
      challenge: { targetId: 'JOB_MKT_STRATEGY', name: '마케팅 전략 기획', description: 'B2B 최전선 고객 반응 분석을 바탕으로 전사 마케팅 전략 피벗', avgYears: 4.0, difficulty: '높음' },
      'T자형': { targetId: 'JOB_SALES_PLAN', name: '영업 기획 파트', description: '키 어카운트 협상력과 영업 로드맵 설계를 결합하는 허브', avgYears: 3.0, difficulty: '중간' },
    },

    // R&D
    'JOB_RND_MATERIAL': {
      safe: { targetId: 'JOB_RND_PROCESS', name: '공정 개발 엔지니어', description: '소재 분석 지식을 기반으로 공정 최적화 연계', avgYears: 3.0, difficulty: '낮음' },
      challenge: { targetId: 'JOB_RND_AI', name: 'AI/SW 연구원', description: '신소재 설계 단계에 머신러닝/AI 데이터 융합 시도', avgYears: 4.0, difficulty: '높음' },
      'T자형': { targetId: 'JOB_RND_PLAN', name: 'R&D 전략 기획', description: '소재 전문 지식을 기초로 차세대 기술 로드맵 기획', avgYears: 3.5, difficulty: '중간' },
    },
    'JOB_RND_PROCESS': {
      safe: { targetId: 'JOB_RND_QUALITY', name: '품질 R&D 분석', description: '공정 조건 설계 노하우를 제품 신뢰성 평가에 반영', avgYears: 2.5, difficulty: '낮음' },
      challenge: { targetId: 'JOB_RND_MASS', name: '양산 기술 엔지니어', description: '실험실에서 생산 공장 최전선 양산 수율 정면 돌파', avgYears: 3.0, difficulty: '높음' },
      'T자형': { targetId: 'JOB_RND_PLAN', name: 'R&D 전략 기획', description: '다양한 공정 통합 지식을 R&D 과제 설계에 이식', avgYears: 3.0, difficulty: '중간' },
    },
    'JOB_RND_AI': {
      safe: { targetId: 'JOB_RND_PLAN', name: 'R&D 기획 파트', description: '기술 인프라 및 AI 전략 로드맵 기획', avgYears: 3.0, difficulty: '낮음' },
      challenge: { targetId: 'JOB_HR_ANALYTICS', name: 'People Analytics', description: '소프트웨어 개발 역량을 사내 인적 데이터 분석에 이식', avgYears: 3.5, difficulty: '높음' },
      'T자형': { targetId: 'JOB_RND_PROCESS', name: '공정 개발 AI 연계', description: '스마트 팩토리 공정 지능화를 리딩하는 융합 허브', avgYears: 3.0, difficulty: '중간' },
    }
  }

  // 만약 맵핑에 매칭되는 키가 없는 직무일 경우, 해당 직무군(family)의 최적 기본값 매핑
  if (recommendations[currentJobId]) {
    return recommendations[currentJobId]
  }

  const job = JOB_NODES[currentJobId]
  if (job) {
    if (job.family === 'HR') return recommendations['JOB_HR_RECRUIT']
    if (job.family === '영업') return recommendations['JOB_SALES_NEW']
    if (job.family === 'R&D') return recommendations['JOB_RND_MATERIAL']
  }
  return recommendations['JOB_MKT_PERF']
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

// 외부 프로파일 (LinkedIn 대체)
export const EXTERNAL_PROFILES = [
  {
    id: 'EXT_01',
    name: 'Sarah Kim',
    currentCompany: 'Google Korea',
    currentRole: 'Marketing Manager',
    careerSequence: ['Performance Marketing → Brand Marketing → Marketing Manager'],
    skills: ['Digital Marketing', 'Brand Strategy', 'Data Analytics', 'Team Leadership'],
    yearsExperience: 7,
  },
  {
    id: 'EXT_02',
    name: 'David Park',
    currentCompany: 'Samsung Electronics',
    currentRole: 'Integrated Marketing Lead',
    careerSequence: ['Digital Marketer → CRM Specialist → Integrated Marketing Lead'],
    skills: ['CRM', 'Campaign Management', 'Budget Planning', 'Cross-functional Leadership'],
    yearsExperience: 9,
  },
  {
    id: 'EXT_03',
    name: 'Jenny Lee',
    currentCompany: 'Kakao',
    currentRole: 'HR Business Partner',
    careerSequence: ['Talent Acquisition → HR Generalist → HRBP'],
    skills: ['Organizational Development', 'Talent Management', 'HR Analytics', 'Change Management'],
    yearsExperience: 8,
  },
]

// 학습 리소스 추천
export const LEARNING_RESOURCES = {
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
