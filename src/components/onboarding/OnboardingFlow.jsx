import { useState, useMemo } from 'react'
import { JOB_NODES, JOB_REQUIRED_SKILLS } from '../../data/careerData'

const CAREER_SCENARIOS = [
  { id: 'safe', icon: '🛡️', title: '안전형 성장', desc: '동일 직무군(본부) 내의 안정적이고 검증된 이동 경로 선호' },
  { id: 't-shape', icon: '🔀', title: 'T자형 성장', desc: '허브 직무를 경유하여 스페셜티와 다층 역량을 균형 있게 확장' },
  { id: 'challenge', icon: '🔥', title: '도전형 성장', desc: '이종 직무군 간 전보 및 AI/SW개발 등 융합 시나리오 선호' },
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
  }
]

export default function OnboardingFlow({ onComplete, onSkip }) {
  // Step 0: 모드 선택 (custom: 맞춤 프로필, preset: 기존 페르소나)
  const [mode, setMode] = useState(null) 
  const [step, setStep] = useState(0)

  // Step 1: 기본 정보 입력
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [grade, setGrade] = useState('선임')
  const [yearsInRole, setYearsInRole] = useState(3)
  const [evaluationGrade, setEvaluationGrade] = useState('A')

  // Step 2: 직무 & 역량 자가진단
  const [jobFamily, setJobFamily] = useState('마케팅') // HR, 마케팅, 영업, R&D
  const [selectedJobId, setSelectedJobId] = useState('JOB_MKT_PERF')
  const [skillLevels, setSkillLevels] = useState({})

  // Step 3: 커리어 성장 시나리오 지향성
  const [selectedScenario, setSelectedScenario] = useState('t-shape')

  // 직무군(family)별 상세 직무 목록 필터링
  const filteredJobs = useMemo(() => {
    return Object.values(JOB_NODES).filter(job => job.family === jobFamily)
  }, [jobFamily])

  // 상세 직무 변경 시 디폴트 직무 설정 및 스킬 레벨 초기화
  const handleJobFamilyChange = (family) => {
    setJobFamily(family)
    const firstJob = Object.values(JOB_NODES).find(job => job.family === family)
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
    initializeSkillLevels(selectedJobId)
  }, [])

  const handleSkillLevelChange = (skillId, val) => {
    setSkillLevels(prev => ({
      ...prev,
      [skillId]: Number(val)
    }))
  }

  // 레벨 설명 매핑
  const levelDescriptions = {
    1: '인지 (L1) — 기본 개념과 용어를 알고 이해하는 단계',
    2: '적용 (L2) — 가이드라인에 따라 실무 작업을 수행하는 단계',
    3: '자립 (L3) — 도움 없이 스스로 책임지고 업무를 완수하는 단계',
    4: '전문 (L4) — 심화된 해결책 제시 및 타인을 멘토링하는 단계',
    5: '혁신 (L5) — 새로운 방법론 설계 및 전사 표준을 제시하는 단계'
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

    return {
      id: 'EMP_CUSTOM_' + Math.floor(Math.random() * 1000),
      name: name.trim() || '사용자',
      age: 28 + Number(yearsInRole), // 현실적인 유추 나이
      joinYear: new Date().getFullYear() - Number(yearsInRole),
      currentJobId: selectedJobId,
      currentJobName: JOB_NODES[selectedJobId]?.name || '선택 직무',
      department: department.trim() || jobFamily + '팀',
      businessUnit: '본사',
      grade,
      yearsInRole: Number(yearsInRole),
      totalYears: Number(yearsInRole),
      evaluationGrade,
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
                  backgroundColor: i === step ? 'var(--accent-cyan)' : i < step ? '#34d399' : 'rgba(255,255,255,0.1)',
                  boxShadow: i === step ? '0 0 8px var(--accent-cyan)' : 'none',
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
              <span>🔮</span> 개인 맞춤형 커리어 내비게이션
            </h2>
            <p className="onboarding-subtitle" style={{ textAlign: 'center', marginBottom: '32px', color: '#94a3b8' }}>
              사내 인사 정보와 시장 분석 기반의 AX 커리어 설계 시스템입니다.<br/>
              어떤 모드로 데모를 시작해 보시겠어요?
            </p>

            <div className="onboarding-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
              <div
                className="onboarding-option glow-cyan"
                style={{
                  cursor: 'pointer',
                  padding: '24px',
                  border: '2px solid rgba(6, 182, 212, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(6, 182, 212, 0.03)',
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
              >
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎛️</div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>내 맞춤 프로필 진단</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
                  이름, 소속, 직무, 3대 핵심 역량을 직접 자가진단하여 동적 페르소나를 완벽히 연동 설계합니다.
                </p>
              </div>

              <div
                className="onboarding-option glow-purple"
                style={{
                  cursor: 'pointer',
                  padding: '24px',
                  border: '2px solid rgba(167, 139, 250, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(167, 139, 250, 0.03)',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
                onClick={() => setMode('preset')}
              >
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>👥</div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>가상 시나리오로 시작</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
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
              👤 가상 인물 선택
            </h2>
            <p className="onboarding-subtitle" style={{ textAlign: 'center', marginBottom: '24px', color: '#94a3b8' }}>
              데모 시연용으로 준비된 2개의 표준 페르소나 중 한 명을 골라 보세요.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {DEFAULT_PERSONAS.map(p => (
                <div
                  key={p.id}
                  className="glass-card glow-cyan"
                  style={{
                    cursor: 'pointer',
                    padding: '20px',
                    margin: 0,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => onComplete(p)}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="persona-avatar" style={{ width: '44px', height: '44px', fontSize: '16px' }}>
                      {p.name[0]}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>
                        {p.name} ({p.grade} • {p.yearsInRole}년차)
                      </h4>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                        {p.department} • {p.currentJobName}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                    {p.id === 'EMP001' ? '📢 마케팅 실무자' : '👥 채용 담당자'}
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
              <span>📝</span> 기본 정보 작성
            </h2>
            <p className="onboarding-subtitle" style={{ color: '#94a3b8', marginBottom: '24px' }}>
              본인의 실무 프로필 정보를 사실적으로 채워주세요.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>이름</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 홍길동"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div style={{ flex: 1.5 }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>소속 부서</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="예: 품질개발실, 인사혁신팀"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>현재 직급</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {['실무자', '선임', '책임', '수석', '리더'].map(g => (
                    <button
                      key={g}
                      type="button"
                      className={`btn ${grade === g ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        padding: '10px 0',
                        fontSize: '12px',
                        background: grade === g ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.02)',
                        border: grade === g ? 'none' : '1px solid rgba(255,255,255,0.05)',
                        color: grade === g ? '#0a0e1a' : '#f1f5f9'
                      }}
                      onClick={() => setGrade(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#64748b' }}>현 직무 년차</label>
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
                    background: 'rgba(255,255,255,0.1)',
                    height: '6px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                  <span>1년</span>
                  <span>5년</span>
                  <span>10년</span>
                  <span>15년 이상</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>최근 평가 등급</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {['S', 'A', 'B', 'C'].map(eg => (
                    <button
                      key={eg}
                      type="button"
                      className={`btn ${evaluationGrade === eg ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        padding: '10px 0',
                        fontSize: '12px',
                        background: evaluationGrade === eg ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.02)',
                        border: eg === evaluationGrade ? 'none' : '1px solid rgba(255,255,255,0.05)',
                        color: eg === evaluationGrade ? '#0a0e1a' : '#f1f5f9'
                      }}
                      onClick={() => setEvaluationGrade(eg)}
                    >
                      {eg} 등급
                    </button>
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
              <span>💪</span> 직무 & 역량 자가진단
            </h2>
            <p className="onboarding-subtitle" style={{ color: '#94a3b8', marginBottom: '24px' }}>
              현업 직무군과 상세 직무를 선택한 뒤, 필수 역량 숙련도를 직접 진단해 보세요.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              {/* 직무군 선택 */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>1차: 대분류 직무군</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { id: '마케팅', icon: '📢' },
                    { id: 'HR', icon: '👥' },
                    { id: '영업', icon: '🤝' },
                    { id: 'R&D', icon: '🔬' }
                  ].map(fam => (
                    <button
                      key={fam.id}
                      type="button"
                      className={`btn ${jobFamily === fam.id ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        padding: '10px 0',
                        fontSize: '12px',
                        background: jobFamily === fam.id ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.02)',
                        border: jobFamily === fam.id ? 'none' : '1px solid rgba(255,255,255,0.05)',
                        color: jobFamily === fam.id ? '#0a0e1a' : '#f1f5f9'
                      }}
                      onClick={() => handleJobFamilyChange(fam.id)}
                    >
                      {fam.icon} {fam.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* 상세 직무 선택 */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>2차: 상세 직무</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => handleJobChange(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0d1527',
                    border: '1px solid rgba(255,255,255,0.1)',
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
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>
                  ℹ️ {JOB_NODES[selectedJobId]?.description}
                </p>
              </div>

              {/* 역량 진단 슬라이더 그룹 */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
                  3차: 핵심 요구 역량 자가진단 (L1 ~ L5)
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {currentRequiredSkills.map(skill => (
                    <div key={skill.skillId} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '14px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f1f5f9' }}>{skill.name}</span>
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
                          background: 'rgba(255,255,255,0.1)',
                          height: '5px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          marginBottom: '8px'
                        }}
                      />

                      <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.4', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '4px' }}>
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
              <span>🧭</span> 커리어 성장 성향 선택
            </h2>
            <p className="onboarding-subtitle" style={{ color: '#94a3b8', marginBottom: '24px' }}>
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
                    border: selectedScenario === sc.id ? '2px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 'var(--radius-lg)',
                    background: selectedScenario === sc.id ? 'rgba(6, 182, 212, 0.04)' : 'rgba(255,255,255,0.01)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    boxShadow: selectedScenario === sc.id ? '0 0 15px rgba(6, 182, 212, 0.15)' : 'none'
                  }}
                  onClick={() => setSelectedScenario(sc.id)}
                >
                  <div style={{ fontSize: '28px' }}>{sc.icon}</div>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                      {sc.title}
                    </h4>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
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
              🚀 맞춤 커리어 프로필이 조립되었습니다!
            </h2>
            <p className="onboarding-subtitle" style={{ textAlign: 'center', marginBottom: '24px', color: '#94a3b8' }}>
              자가진단 결과와 성향을 조합해 설계한 커리어 리포트 요약입니다.
            </p>

            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(167, 139, 250, 0.05) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: '460px',
              margin: '0 auto 32px auto',
              textAlign: 'left',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{name || '사용자'} 님</span>
                <span className="badge badge-purple" style={{ fontSize: '10px' }}>{grade} • {yearsInRole}년차</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: '#cbd5e1' }}>
                <div>
                  🏢 소속: <strong style={{ color: '#fff' }}>{department || '소속 부서'}</strong>
                </div>
                <div>
                  💼 현 직무: <strong style={{ color: '#fff' }}>{JOB_NODES[selectedJobId]?.name || '상세 직무'}</strong> ({jobFamily} 직무군)
                </div>
                <div>
                  🏆 최근 평가: <strong style={{ color: '#fff' }}>{evaluationGrade} 등급</strong>
                </div>
                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-cyan)', marginBottom: '8px' }}>📊 입력한 핵심 역량 수준:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {currentRequiredSkills.map(s => (
                      <div key={s.skillId} style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                        <span>• {s.name}</span>
                        <span style={{ fontWeight: 'bold', color: '#22d3ee' }}>L{skillLevels[s.skillId] || 3}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: '4px' }}>
                  🧭 커리어 지향 성향: <strong style={{ color: '#a78bfa' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
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
                  color: '#0a0e1a', 
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)'
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
