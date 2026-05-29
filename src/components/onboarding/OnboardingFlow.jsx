import { useState, useMemo, useEffect } from 'react'
import { JOB_NODES, JOB_REQUIRED_SKILLS } from '../../data/careerData'

// 🔒 실 데이터의 상세 패밀리 명칭을 온보딩용 4대 대분류 직무군으로 정규화 매핑하는 헬퍼 함수
const getNormalizedJobFamily = (family) => {
  if (!family) return '기타'
  const f = family.trim()

  // 🔒 실 데이터의 이미 정규화된 4대 직무군(R&D, 영업, 마케팅, HR) 그대로 1:1 반환
  if (['R&D', '영업', '마케팅', 'HR'].includes(f)) return f

  // 마케팅 대분류 (데모 모드 호환)
  if (['마케팅', 'Marketing', 'MKTG'].includes(f) || f.includes('마케팅')) return '마케팅'

  // 영업 대분류
  if (['영업', 'Sales', '구매', 'SCM', 'PURCH', 'SALES', 'SCM개선'].includes(f) || f.includes('영업') || f.includes('구매') || f.includes('SCM')) return '영업'

  // HR 대분류
  if (['HR', '기획', '사업기획', '경영기획/전략', '재무/회계', '회계', 'R&D 전략기획', 'R&D Strategy', 'MGMT', 'FINANCE', 'PLAN', 'BIZ_PLAN', 'RND_PLAN', 'Finance', 'Finance 직무그룹'].includes(f) || f.includes('기획') || f.includes('회계') || f.includes('인사') || f.includes('Finance') || f.includes('통상')) return 'HR'

  // R&D 대분류
  if (['R&D', 'SW/AI', '기구/설계', '열/유체', '전장/제어', '신재생에너지', '품질', '기술', 'SW', '기구', '열', 'Quality', 'MECH', 'THERMAL', 'ELEC', 'RENEW', 'TECH', '기타', 'ETC', '전력변환', '회로', '생산', '냉동/공조', '상품기획', '업무혁신', 'Project Management'].includes(f) || f.includes('설계') || f.includes('품질') || f.includes('기술') || f.includes('개발') || f.includes('연구') || f.includes('공정') || f.includes('생산') || f.includes('변환') || f.includes('회로') || f.includes('기구')) return 'R&D'

  return 'R&D' // 기본 fallback
}

const CAREER_SCENARIOS = [
  { id: 'safe', icon: '◇', title: '안전형 성장', desc: '동일 직무군(본부) 내의 안정적이고 검증된 이동 경로 선호' },
  { id: 't-shape', icon: '◈', title: 'T자형 성장', desc: '허브 직무를 경유하여 스페셜티와 다층 역량을 균형 있게 확장' },
  { id: 'challenge', icon: '▲', title: '도전형 성장', desc: '이종 직무군 간 전보 및 AI/SW개발 등 융합 시나리오 선호' },
]

const DEFAULT_PERSONAS = [
  {
    id: 'EMP001',
    name: '김선영',
    currentJobId: 'JOB_MKT_PERF',
    currentJobName: '퍼포먼스 마케팅',
    department: '마케팅본부',
    grade: '선임',
    yearsInRole: 3,
    totalYears: 3,
    evaluationGrade: 'A',
    leadershipPercentile: 65,
    primarySkill: '퍼포먼스 마케팅',
    skills: [
      { skillId: 'SK_MKT_01', name: '퍼포먼스 광고', level: 4 },
      { skillId: 'SK_MKT_02', name: 'GA 분석', level: 3 },
      { skillId: 'SK_COMMON_01', name: '데이터 분석', level: 3 },
      { skillId: 'SK_COMMON_02', name: '프로젝트 관리', level: 2 },
      { skillId: 'SK_COMMON_03', name: '커뮤니케이션', level: 3 },
    ],
    cohortPercentile: 72,
    movementHistory: [{ year: 2023, jobId: 'JOB_MKT_PERF', jobName: '퍼포먼스 마케팅' }],
    careerIntent: 't-shape',
  },
  {
    id: 'EMP002',
    name: '박지훈',
    currentJobId: 'JOB_HR_RECRUIT',
    currentJobName: '채용',
    department: 'HR본부',
    grade: '선임',
    yearsInRole: 5,
    totalYears: 5,
    evaluationGrade: 'A',
    leadershipPercentile: 58,
    primarySkill: '채용',
    skills: [
      { skillId: 'SK_HR_01', name: 'ATS 운영', level: 4 },
      { skillId: 'SK_HR_02', name: '면접 코디네이션', level: 4 },
      { skillId: 'SK_HR_03', name: '채용 브랜딩', level: 3 },
      { skillId: 'SK_COMMON_02', name: '프로젝트 관리', level: 3 },
      { skillId: 'SK_COMMON_03', name: '커뮤니케이션', level: 4 },
    ],
    cohortPercentile: 65,
    movementHistory: [{ year: 2021, jobId: 'JOB_HR_RECRUIT', jobName: '채용' }],
    careerIntent: 'safe',
  },
  {
    id: 'EMP003',
    name: '윤*현',
    currentJobId: 'JOB_RND_PLAN',
    currentJobName: 'R&D기획',
    department: 'CTO HS선행연구소',
    grade: '책임',
    yearsInRole: 6,
    totalYears: 16,
    evaluationGrade: 'S',
    leadershipPercentile: 92,
    primarySkill: 'R&D 전략',
    skills: [
      { skillId: 'SK_RND_05', name: 'R&D 기획', level: 5 },
      { skillId: 'SK_RND_02', name: '공정 개발', level: 4 },
      { skillId: 'SK_RND_01', name: '소재 연구', level: 4 },
      { skillId: 'SK_COMMON_02', name: '프로젝트 관리', level: 5 },
      { skillId: 'SK_COMMON_03', name: '커뮤니케이션', level: 5 },
    ],
    cohortPercentile: 95,
    movementHistory: [
      { year: 2008, jobId: 'JOB_RND_MASS', jobName: '양산기술' },
      { year: 2014, jobId: 'JOB_RND_PROCESS', jobName: '공정개발' },
      { year: 2020, jobId: 'JOB_RND_PLAN', jobName: 'R&D기획' }
    ],
    careerIntent: 't-shape',
  }
]

export default function OnboardingFlow({ onComplete, onSkip }) {
  // Step 0: 모드 선택 (custom: 맞춤 프로필, preset: 기존 페르소나)
  const [mode, setMode] = useState(null) 
  const [step, setStep] = useState(0)

  // Step 1: 기본 정보 입력
  const [name, setName] = useState('')
  const [orgLevel, setOrgLevel] = useState('본부') // 본사/본부/사업부
  const [department, setDepartment] = useState('')
  const [grade, setGrade] = useState('선임')
  const [yearsInRole, setYearsInRole] = useState(3)
  // 3개년 평가 등급 (N-2년, N-1년, N년)
  const [evalYear1, setEvalYear1] = useState('A') // N-2
  const [evalYear2, setEvalYear2] = useState('A') // N-1
  const [evalYear3, setEvalYear3] = useState('A') // N (최근)

  // Step 2: 직무 & 역량 자가진단
  const [jobFamily, setJobFamily] = useState('R&D') // R&D, 영업, 마케팅, HR 순서
  const [selectedJobId, setSelectedJobId] = useState('JOB_RND_DEFAULT')
  const [skillLevels, setSkillLevels] = useState({})

  // Step 3: 커리어 성장 시나리오 지향성
  const [selectedScenario, setSelectedScenario] = useState('t-shape')

  // 직무군(family)별 상세 직무 목록 필터링
  const filteredJobs = useMemo(() => {
    return Object.values(JOB_NODES).filter(job => {
      const normalized = getNormalizedJobFamily(job.family)
      return normalized === jobFamily
    })
  }, [jobFamily])

  // 🔒 실 데이터 모드 대비 ID 안전 정합 장치
  useEffect(() => {
    if (!JOB_NODES[selectedJobId]) {
      const fallbackJob = Object.values(JOB_NODES).find(job => {
        const normalized = getNormalizedJobFamily(job.family)
        return normalized === jobFamily
      })
      if (fallbackJob) {
        setSelectedJobId(fallbackJob.id)
        initializeSkillLevels(fallbackJob.id)
      }
    }
  }, [jobFamily, selectedJobId])

  // 상세 직무 변경 시 디폴트 직무 설정 및 스킬 레벨 초기화
  const handleJobFamilyChange = (family) => {
    setJobFamily(family)
    const firstJob = Object.values(JOB_NODES).find(job => {
      const normalized = getNormalizedJobFamily(job.family)
      return normalized === family
    })
    if (firstJob) {
      setSelectedJobId(firstJob.id)
      initializeSkillLevels(firstJob.id)
    }
  }

  const handleJobChange = (jobId) => {
    setSelectedJobId(jobId)
    initializeSkillLevels(jobId)
  }

  // 선택한 직무의 요구 역량 획득
  const currentRequiredSkills = useMemo(() => {
    return JOB_REQUIRED_SKILLS[selectedJobId] || []
  }, [selectedJobId])

  // 스킬 레벨 초깃값 설정 (기본적으로 요구 레벨 혹은 중간값 3으로 세팅)
  const initializeSkillLevels = (jobId) => {
    const skills = JOB_REQUIRED_SKILLS[jobId] || []
    const newLevels = {}
    skills.forEach(s => {
      newLevels[s.skillId] = 3 // 디폴트 레벨 3
    })
    setSkillLevels(newLevels)
  }

  // 처음 로드될 때 스킬 레벨 초기화
  useMemo(() => {
    if (JOB_NODES[selectedJobId]) {
      initializeSkillLevels(selectedJobId)
    }
  }, [])

  const handleSkillLevelChange = (skillId, val) => {
    setSkillLevels(prev => ({
      ...prev,
      [skillId]: Number(val)
    }))
  }

  // 레벨 설명 매핑 (HR 학술 체계 및 테크 기업 실무 용어를 기반으로 고품질 리파인)
  const levelDescriptions = {
    1: '인지 (L1) — 기초 지식 보유 (용어 및 대략적인 개념 이해 수준)',
    2: '적용 (L2) — 가이드 기반 적용 (실무 템플릿과 선배의 도움을 받아 실무 수행)',
    3: '자립 (L3) — 단독 실무 수행 (도움 없이 스스로 책임지고 업무를 완결하는 수준)',
    4: '전문 (L4) — 전문 지도 가능 (심화 트러블 슈팅 해결 및 타인의 업무 코칭 주도)',
    5: '혁신 (L5) — 원천 설계 및 혁신 (전사 표준 수립 및 사외 기술/제도 벤치마킹 대상)'
  }

  // 최종 동적 페르소나 객체 조립
  const assembleDynamicPersona = () => {
    const mainSkills = currentRequiredSkills.map(s => ({
      skillId: s.skillId,
      name: s.name,
      level: skillLevels[s.skillId] || 3
    }))

    // 차트 풍성함과 런타임 크래시 방지를 위해 공통 역량 추가 주입
    const commonSkills = [
      { skillId: 'SK_COMMON_01', name: '데이터 분석', level: 3 },
      { skillId: 'SK_COMMON_02', name: '프로젝트 관리', level: 3 },
      { skillId: 'SK_COMMON_03', name: '커뮤니케이션', level: 4 }
    ].filter(cs => !mainSkills.some(ms => ms.skillId === cs.skillId))

    const allSkills = [...mainSkills, ...commonSkills]
    const primarySkillName = mainSkills[0]?.name || '실무 핵심 역량'

    // orgLevel → businessUnit 매핑 (careerDiagnosis.js의 STEP 2 계층 분류와 연동)
    const businessUnitMap = {
      '본사': 'HQ 본사',
      '본부': 'HS HR 본부',
      '사업부': 'R&D HR 사업부'
    }

    // 최근 평가 등급: 가장 최신 연도 기준 (N년)
    const latestEval = evalYear3

    return {
      id: 'EMP_CUSTOM_' + Math.floor(Math.random() * 1000),
      name: name.trim() || '사용자',
      age: 28 + Number(yearsInRole), // 현실적인 유추 나이
      joinYear: new Date().getFullYear() - Number(yearsInRole),
      currentJobId: selectedJobId,
      currentJobName: JOB_NODES[selectedJobId]?.name || '선택 직무',
      department: department.trim() || jobFamily + '팀',
      businessUnit: businessUnitMap[orgLevel] || '본부',
      orgLevel,
      grade,
      yearsInRole: Number(yearsInRole),
      totalYears: Number(yearsInRole),
      evaluationGrade: latestEval,
      evaluationHistory: [
        { year: new Date().getFullYear() - 2, grade: evalYear1 },
        { year: new Date().getFullYear() - 1, grade: evalYear2 },
        { year: new Date().getFullYear(), grade: evalYear3 },
      ],
      leadershipPercentile: 50 + Math.floor(Math.random() * 20),
      primarySkill: primarySkillName,
      skills: allSkills,
      certifications: [],
      education: { degree: '학사', major: '경영학', school: '대학교' },
      careerIntent: selectedScenario,
      cohortPercentile: 60 + Math.floor(Math.random() * 20),
      movementHistory: [
        { 
          year: new Date().getFullYear() - Number(yearsInRole), 
          jobId: selectedJobId, 
          jobName: JOB_NODES[selectedJobId]?.name 
        }
      ]
    }
  }

  const handleNext = () => {
    if (mode === 'preset') {
      // 프리셋 모드는 Step 0에서 바로 페르소나 전달하며 끝남
      return
    }
    
    if (step < 4) {
      setStep(step + 1)
    } else {
      const customPersona = assembleDynamicPersona()
      onComplete(customPersona)
    }
  }

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      setStep(0)
      setMode(null)
    }
  }

  const canProceed = () => {
    if (step === 1) {
      return name.trim().length > 0 && department.trim().length > 0
    }
    return true
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Step dots (Custom wizard mode only) */}
        {mode === 'custom' && (
          <div className="onboarding-step-indicator" style={{ marginBottom: '24px' }}>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: i === step ? 'var(--accent-cyan)' : i < step ? 'var(--accent-cyan-light)' : 'rgba(0, 0, 0, 0.1)',
                  boxShadow: i === step ? '0 0 8px rgba(0, 0, 0, 0.25)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        )}

        {/* ============================================================
            STEP 0: Mode Selection
        ============================================================ */}
        {mode === null && (
          <div className="animate-fade-in-up">
            <h2 className="onboarding-title" style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span>✦</span> 개인 맞춤형 커리어 내비게이션
            </h2>
            <p className="onboarding-subtitle" style={{ textAlign: 'center', marginBottom: '32px', color: 'var(--text-secondary)' }}>
              사내 인사 정보와 시장 분석 기반의 AX 커리어 설계 시스템입니다.<br/>
              어떤 모드로 데모를 시작해 보시겠어요?
            </p>

            <div className="onboarding-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
              <div
                className="onboarding-option"
                style={{
                  cursor: 'pointer',
                  padding: '24px',
                  border: '1.5px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
                onClick={() => {
                  setMode('custom')
                  setStep(1)
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#000000'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ marginBottom: '12px', color: '#000000' }}>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>내 맞춤 프로필 진단</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  이름, 소속, 직무, 3대 핵심 역량을 직접 자가진단하여 동적 페르소나를 완벽히 연동 설계합니다.
                </p>
              </div>

              <div
                className="onboarding-option"
                style={{
                  cursor: 'pointer',
                  padding: '24px',
                  border: '1.5px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
                onClick={() => setMode('preset')}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#000000'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ marginBottom: '12px', color: '#000000' }}>
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>가상 시나리오로 시작</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  실무 마케터(김선영) 또는 채용 담당자(박지훈) 가상 인물 시나리오를 선택하여 빠르게 둘러봅니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preset Selector Panel */}
        {mode === 'preset' && (
          <div className="animate-fade-in-up">
            <h2 className="onboarding-title" style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span>—</span> 가상 인물 선택
            </h2>
            <p className="onboarding-subtitle" style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-secondary)' }}>
              데모 시연용으로 준비된 2개의 표준 페르소나 중 한 명을 골라 보세요.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {DEFAULT_PERSONAS.map(p => (
                <div
                  key={p.id}
                  className="glass-card"
                  style={{
                    cursor: 'pointer',
                    padding: '20px',
                    margin: 0,
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-glass)',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => onComplete(p)}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; e.currentTarget.style.borderColor = '#000000'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="persona-avatar" style={{ width: '44px', height: '44px', fontSize: '16px', background: '#000000', color: '#ffffff' }}>
                      {p.name[0]}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>
                        {p.name} ({p.grade} • {p.yearsInRole}년차)
                      </h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                        {p.department} • {p.currentJobName}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                    {p.id === 'EMP001' ? '마케팅 실무자' : '채용 담당자'}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => { setMode(null); setStep(0); }}>
                ← 이전 모드 선택으로
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            STEP 1: Custom Profile - Basic Info
        ============================================================ */}
        {mode === 'custom' && step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="onboarding-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✦</span> 기본 정보 작성
            </h2>
            <p className="onboarding-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              본인의 실무 프로필 정보를 사실적으로 채워주세요.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              {/* 이름 입력 */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 홍길동"
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* 소속 부서: 본사/본부/사업부 + 부서명 */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>소속 부서</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', flex: '0 0 auto', width: '220px' }}>
                    {['본사', '본부', '사업부'].map(lv => (
                      <button
                        key={lv}
                        type="button"
                        className={`onboarding-btn ${orgLevel === lv ? 'active' : 'inactive'}`}
                        style={{ whiteSpace: 'nowrap' }}
                        onClick={() => setOrgLevel(lv)}
                      >
                        {lv}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="예: 품질개발실, 인사혁신팀"
                    style={{
                      flex: 1,
                      background: '#ffffff',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* 현재 직급: 사원 / 선임 / 책임 / 리더 */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>현재 직급</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {['사원', '선임', '책임', '리더'].map(g => (
                    <button
                      key={g}
                      type="button"
                      className={`onboarding-btn ${grade === g ? 'active' : 'inactive'}`}
                      onClick={() => setGrade(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* 현 직무 년차 슬라이더 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>현 직무 년차</label>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{yearsInRole}년</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={yearsInRole}
                  onChange={(e) => setYearsInRole(e.target.value)}
                  style={{
                    width: '100%',
                    accentColor: 'var(--accent-cyan)',
                    background: 'var(--border-medium)',
                    height: '6px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <span>1년</span>
                  <span>5년</span>
                  <span>10년</span>
                  <span>15년 이상</span>
                </div>
              </div>

              {/* 3개년 평가 등급 (S/A/B/C/D 5등급) */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 'bold' }}>3개년 평가 등급</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: `${new Date().getFullYear() - 2}년 (N-2)`, value: evalYear1, setter: setEvalYear1 },
                    { label: `${new Date().getFullYear() - 1}년 (N-1)`, value: evalYear2, setter: setEvalYear2 },
                    { label: `${new Date().getFullYear()}년 (N, 최근)`, value: evalYear3, setter: setEvalYear3 },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '110px', textAlign: 'right', flexShrink: 0 }}>{row.label}</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', flex: 1 }}>
                        {['S', 'A', 'B', 'C', 'D'].map(eg => (
                          <button
                            key={eg}
                            type="button"
                            className={`onboarding-btn ${row.value === eg ? 'active' : 'inactive'}`}
                            onClick={() => row.setter(eg)}
                          >
                            {eg}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            STEP 2: Custom Profile - Job & Skill Self Diagnosis
        ============================================================ */}
        {mode === 'custom' && step === 2 && (
          <div className="animate-fade-in-up">
            <h2 className="onboarding-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✦</span> 직무 & 역량 자가진단
            </h2>
            <p className="onboarding-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              현업 직무군과 상세 직무를 선택한 뒤, 필수 역량 숙련도를 직접 진단해 보세요.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              {/* 직무군 선택 */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>1차: 대분류 직무군</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'R&D', icon: '' },
                    { id: '영업', icon: '' },
                    { id: '마케팅', icon: '' },
                    { id: 'HR', icon: '' }
                  ].map(fam => (
                    <button
                      key={fam.id}
                      type="button"
                      className={`onboarding-btn ${jobFamily === fam.id ? 'active' : 'inactive'}`}
                      onClick={() => handleJobFamilyChange(fam.id)}
                    >
                      {fam.icon} {fam.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* 상세 직무 선택 */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 'bold' }}>2차: 상세 직무</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => handleJobChange(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {filteredJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.name} ({job.level} 권장)
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                  ℹ️ {JOB_NODES[selectedJobId]?.description}
                </p>
              </div>

              {/* 역량 진단 슬라이더 그룹 */}
              <div style={{ borderTop: '1px solid var(--border-medium)', paddingTop: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
                  3차: 핵심 요구 역량 자가진단 (L1 ~ L5)
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {currentRequiredSkills.map(skill => (
                    <div key={skill.skillId} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{skill.name}</span>
                        <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                          숙련도: {skillLevels[skill.skillId] ? `L${skillLevels[skill.skillId]}` : 'L3'}
                        </span>
                      </div>
                      
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={skillLevels[skill.skillId] || 3}
                        onChange={(e) => handleSkillLevelChange(skill.skillId, e.target.value)}
                        style={{
                          width: '100%',
                          accentColor: 'var(--accent-cyan)',
                          background: 'var(--border-medium)',
                          height: '5px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          marginBottom: '8px'
                        }}
                      />

                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', fontStyle: 'italic', background: 'var(--bg-glass-hover)', padding: '8px 12px', borderRadius: '4px', borderLeft: '3px solid var(--accent-cyan)' }}>
                        {levelDescriptions[skillLevels[skill.skillId] || 3]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            STEP 3: Custom Profile - Career Intent Scenario
        ============================================================ */}
        {mode === 'custom' && step === 3 && (
          <div className="animate-fade-in-up">
            <h2 className="onboarding-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✦</span> 커리어 성장 성향 선택
            </h2>
            <p className="onboarding-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              앞으로 어떤 성향을 지향하며 성장해 나가고 싶으신가요? (Career Intent)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {CAREER_SCENARIOS.map(sc => (
                <div
                  key={sc.id}
                  className={`onboarding-option ${selectedScenario === sc.id ? 'selected' : ''}`}
                  style={{
                    cursor: 'pointer',
                    padding: '20px',
                    border: selectedScenario === sc.id ? '2px solid var(--accent-cyan)' : '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-lg)',
                    background: selectedScenario === sc.id ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.01)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    boxShadow: selectedScenario === sc.id ? 'var(--shadow-glow-cyan)' : 'none'
                  }}
                  onClick={() => setSelectedScenario(sc.id)}
                  onMouseOver={(e) => { if (selectedScenario !== sc.id) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                  onMouseOut={(e) => { if (selectedScenario !== sc.id) e.currentTarget.style.background = 'rgba(0,0,0,0.01)'; }}
                >
                  <div style={{ fontSize: '28px' }}>{sc.icon}</div>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                      {sc.title}
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                      {sc.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            STEP 4: Custom Profile - Summary & Assembly
        ============================================================ */}
        {mode === 'custom' && step === 4 && (
          <div className="animate-fade-in-up">
            <h2 className="onboarding-title" style={{ textAlign: 'center', marginBottom: '8px' }}>
              ✦ 맞춤 커리어 프로필이 조립되었습니다!
            </h2>
            <p className="onboarding-subtitle" style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-secondary)' }}>
              자가진단 결과와 성향을 조합해 설계한 커리어 리포트 요약입니다.
            </p>

            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.01) 0%, rgba(0, 0, 0, 0.04) 100%)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: '460px',
              margin: '0 auto 32px auto',
              textAlign: 'left',
              boxShadow: 'var(--shadow-md)',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-medium)', paddingBottom: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{name || '사용자'} 님</span>
                <span className="badge badge-purple" style={{ fontSize: '10px' }}>{grade} • {yearsInRole}년차</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div>
                  소속: <strong style={{ color: 'var(--text-primary)' }}>{orgLevel}</strong> — {department || '소속 부서'}
                </div>
                <div>
                  현 직무: <strong style={{ color: 'var(--text-primary)' }}>{JOB_NODES[selectedJobId]?.name || '상세 직무'}</strong> ({jobFamily} 직무군)
                </div>
                <div>
                  3개년 평가: <strong style={{ color: 'var(--text-primary)' }}>
                    {new Date().getFullYear() - 2}년 {evalYear1} → {new Date().getFullYear() - 1}년 {evalYear2} → {new Date().getFullYear()}년 {evalYear3}
                  </strong>
                </div>
                <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-cyan)', marginBottom: '8px' }}>입력한 핵심 역량 수준:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {currentRequiredSkills.map(s => (
                      <div key={s.skillId} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>• {s.name}</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>L{skillLevels[s.skillId] || 3}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '12px', marginTop: '4px' }}>
                  🧭 커리어 지향 성향: <strong style={{ color: 'var(--text-primary)' }}>
                    {CAREER_SCENARIOS.find(s => s.id === selectedScenario)?.title}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            WIZARD CONTROLS (Footer)
        ============================================================ */}
        {mode === 'custom' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-medium)', paddingTop: '20px' }}>
            <button className="btn btn-ghost" onClick={handlePrev} style={{ fontSize: '13px' }}>
              ← 이전
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => {
                  // Skip 시 기본 템플릿(김선영)을 부드럽게 세팅
                  onSkip()
                }}
                style={{ fontSize: '12px', color: '#64748b' }}
              >
                자가진단 건너뛰기
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!canProceed()}
                style={{ 
                  opacity: canProceed() ? 1 : 0.5, 
                  background: 'var(--accent-cyan)', 
                  color: '#ffffff', 
                  fontWeight: 'bold',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {step < 4 ? '다음 →' : '자가진단 완료 🚀'}
              </button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
