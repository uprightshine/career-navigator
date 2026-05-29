import { useState, createContext, useContext, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import OnboardingFlow from './components/onboarding/OnboardingFlow'
import { injectHsData } from './data/careerData'

// Statically import pages to allow 100% single HTML file packaging without CORS / filesystem limitations
import Dashboard from './pages/Dashboard'
import CareerGraphPage from './pages/CareerGraphPage'
import SkillGapPage from './pages/SkillGapPage'
import AdvisorPage from './pages/AdvisorPage'
import DataRequirementsPage from './pages/DataRequirementsPage'

// Premium loading spinner fallback for route transitions
function PageLoader() {
  return (
    <div className="premium-spinner-container">
      <div className="premium-spinner">
        <div className="premium-spinner-outer" />
        <div className="premium-spinner-inner" />
        <div className="premium-spinner-core" />
      </div>
      <div className="premium-spinner-text">LOADING CAREER PATHWAY...</div>
    </div>
  )
}

// ─── Contexts ──────────────────────────────────────────────────
const PersonaContext = createContext()

export function usePersona() {
  return useContext(PersonaContext)
}

// 🔒 AI 설정 컨텍스트 (외부 API 차단 토글)
const AiContext = createContext()

export function useAiConfig() {
  return useContext(AiContext)
}

// ─── 기본 데모 페르소나 (실 데이터 없을 때 사용) ──────────────
const DEMO_PERSONAS = {
  'EMP001': {
    id: 'EMP001',
    name: '김선영',
    age: 28,
    joinYear: 2023,
    currentJobId: 'JOB_MKT_PERF',
    currentJobName: '퍼포먼스 마케팅',
    department: '마케팅본부',
    businessUnit: 'MC사업부',
    grade: '선임',
    yearsInRole: 3,
    totalYears: 3,
    evaluationGrade: 'A',
    evaluationHistory: [
      { year: 2024, grade: 'B' },
      { year: 2025, grade: 'A' },
      { year: 2026, grade: 'A' },
    ],
    leadershipPercentile: 65,
    primarySkill: '퍼포먼스 마케팅',
    skills: [
      { skillId: 'SK_MKT_01', name: '퍼포먼스 광고', level: 4 },
      { skillId: 'SK_MKT_02', name: 'GA 분석', level: 3 },
      { skillId: 'SK_MKT_03', name: '콘텐츠 기획', level: 2 },
      { skillId: 'SK_MKT_04', name: 'CRM 마케팅', level: 2 },
      { skillId: 'SK_MKT_05', name: '브랜드 전략', level: 1 },
      { skillId: 'SK_COMMON_01', name: '데이터 분석', level: 3 },
      { skillId: 'SK_COMMON_02', name: '프로젝트 관리', level: 2 },
      { skillId: 'SK_COMMON_03', name: '커뮤니케이션', level: 3 },
    ],
    certifications: ['Google Ads 인증', 'GA4 인증'],
    education: { degree: '학사', major: '경영학', school: '서울대학교' },
    careerIntent: null,
    cohortPercentile: 72,
    movementHistory: [
      { year: 2023, jobId: 'JOB_MKT_PERF', jobName: '퍼포먼스 마케팅' }
    ]
  },
  'EMP002': {
    id: 'EMP002',
    name: '박지훈',
    age: 30,
    joinYear: 2021,
    currentJobId: 'JOB_HR_RECRUIT',
    currentJobName: '채용',
    department: 'HR본부',
    businessUnit: '본사',
    grade: '선임',
    yearsInRole: 5,
    totalYears: 5,
    evaluationGrade: 'A',
    evaluationHistory: [
      { year: 2024, grade: 'A' },
      { year: 2025, grade: 'A' },
      { year: 2026, grade: 'A' },
    ],
    leadershipPercentile: 58,
    primarySkill: '채용',
    skills: [
      { skillId: 'SK_HR_01', name: 'ATS 운영', level: 4 },
      { skillId: 'SK_HR_02', name: '면접 코디네이션', level: 4 },
      { skillId: 'SK_HR_03', name: '채용 브랜딩', level: 3 },
      { skillId: 'SK_HR_04', name: '인력 계획', level: 2 },
      { skillId: 'SK_HR_05', name: 'HR 데이터 분석', level: 2 },
      { skillId: 'SK_COMMON_01', name: '데이터 분석', level: 2 },
      { skillId: 'SK_COMMON_02', name: '프로젝트 관리', level: 3 },
      { skillId: 'SK_COMMON_03', name: '커뮤니케이션', level: 4 },
    ],
    certifications: ['PHR', 'SHRM-CP'],
    education: { degree: '석사', major: '인적자원관리', school: '연세대학교' },
    careerIntent: null,
    cohortPercentile: 65,
    movementHistory: [
      { year: 2021, jobId: 'JOB_HR_RECRUIT', jobName: '채용' }
    ]
  },
  'EMP003': {
    id: 'EMP003',
    name: '윤지현',
    age: 44,
    joinYear: 2008,
    currentJobId: 'JOB_RND_PLAN',
    currentJobName: 'R&D기획',
    department: 'CTO HS선행연구소',
    businessUnit: 'CTO',
    grade: '책임',
    yearsInRole: 6,
    totalYears: 16,
    evaluationGrade: 'S',
    evaluationHistory: [
      { year: 2024, grade: 'S' },
      { year: 2025, grade: 'S' },
      { year: 2026, grade: 'S' },
    ],
    leadershipPercentile: 92,
    primarySkill: 'R&D 전략',
    skills: [
      { skillId: 'SK_RND_05', name: 'R&D 기획', level: 5 },
      { skillId: 'SK_RND_02', name: '공정 개발', level: 4 },
      { skillId: 'SK_RND_01', name: '소재 연구', level: 4 },
      { skillId: 'SK_COMMON_02', name: '프로젝트 관리', level: 5 },
      { skillId: 'SK_COMMON_01', name: '데이터 분석', level: 3 },
      { skillId: 'SK_COMMON_03', name: '커뮤니케이션', level: 5 },
    ],
    certifications: ['기술지도사', 'PMP'],
    education: { degree: '석사', major: '기계공학', school: 'KAIST' },
    careerIntent: 't-shape',
    cohortPercentile: 95,
    movementHistory: [
      { year: 2008, jobId: 'JOB_RND_MASS', jobName: '양산기술' },
      { year: 2014, jobId: 'JOB_RND_PROCESS', jobName: '공정개발' },
      { year: 2020, jobId: 'JOB_RND_PLAN', jobName: 'R&D기획' }
    ]
  }
}

// ─── HS 실 데이터 로드 (단일 HTML 패키징을 위한 정적 로드) ─────
import hsPersonasData from './data/hs-personas.json'
import hsJobsData from './data/hs-jobs.json'
import hsMovementsData from './data/hs-movements.json'

async function loadHsEmployees() {
  return hsPersonasData
}

async function loadHsJobs() {
  return hsJobsData
}

async function loadHsMovements() {
  return hsMovementsData
}

// ─── 보안 배너: 실 데이터 모드 표시 ──────────────────────────
function SecurityBanner({ dataMode, aiEnabled, onToggleAi }) {
  if (dataMode !== 'hs-real') return null
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: aiEnabled ? '#1a1a2e' : '#0a0a0a',
      borderBottom: `2px solid ${aiEnabled ? '#f59e0b' : '#22c55e'}`,
      padding: '6px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: '11px', fontFamily: 'monospace',
      transition: 'border-color 0.3s ease',
    }}>
      <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <strong>HS 실 데이터 모드</strong>
        <span style={{ color: '#6b7280' }}>— 로컬 전용 실행 중 | 네트워크 전송 없음 | 사번 익명화 완료</span>
      </span>
      <button
        onClick={onToggleAi}
        title={aiEnabled ? 'AI API 차단하기' : 'AI API 활성화 (외부 전송 발생)'}
        style={{
          background: aiEnabled ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.1)',
          border: `1px solid ${aiEnabled ? '#f59e0b' : '#22c55e'}`,
          color: aiEnabled ? '#f59e0b' : '#22c55e',
          padding: '3px 10px', borderRadius: '4px', cursor: 'pointer',
          fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', gap: '5px',
        }}
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          {aiEnabled
            ? <path d="M12 3v4M12 17v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4"/>
            : <><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></>
          }
        </svg>
        AI {aiEnabled ? 'ON (외부 API 사용 중)' : 'OFF (차단됨)'}
      </button>
    </div>
  )
}

// ─── HS 직원 데이터를 앱 포맷으로 정규화 ──────────────────────
function normalizeHsEmployee(emp) {
  return {
    id: emp.id,
    name: emp.name,
    age: emp.joinYear ? (2025 - emp.joinYear + 25) : 35,
    joinYear: emp.joinYear || 2016,
    currentJobId: emp.currentJob || 'JOB_UNKNOWN',
    currentJobName: emp.currentJobName || emp._jobgroup || '직무 미분류',
    department: emp.department || 'HS전자',
    businessUnit: emp.businessUnit || 'HS전자',
    grade: emp.grade || '선임',
    yearsInRole: emp.yearsInRole || 1,
    totalYears: emp.totalYears || 1,
    evaluationGrade: emp.evaluationGrade || 'A',
    evaluationHistory: [],
    leadershipPercentile: emp.leadershipPercentile || 50,
    primarySkill: emp.primarySkill || emp._family || '전문기술',
    skills: emp.skills || [],
    certifications: emp.certifications || [],
    education: emp.education || { degree: '학사', major: '', school: '' },
    careerIntent: emp.careerIntent || 'explorer',
    cohortPercentile: emp.cohortPercentile || 50,
    movementHistory: emp.movementHistory || [],
    _family: emp._family,
    _jobgroup: emp._jobgroup,
  }
}

// ─── 메인 App ─────────────────────────────────────────────────
function App() {
  const [persona, setPersona] = useState(DEMO_PERSONAS['EMP001'])
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [targetJobId, setTargetJobId] = useState(null)
  const [selectedScenario, setSelectedScenario] = useState('t-shape')

  // 🔒 실 데이터 모드 상태
  const [dataMode, setDataMode] = useState('demo')   // 'demo' | 'hs-real'
  const [hsPersonas, setHsPersonas] = useState(null) // HS 직원 목록
  const [aiEnabled, setAiEnabled] = useState(true)   // 초기값: AI 활성 (demo 모드)

  // HS 실 데이터 로드 시도 (앱 초기화 시 1회)
  useEffect(() => {
    Promise.all([loadHsEmployees(), loadHsJobs(), loadHsMovements()]).then(([empData, jobData, moveData]) => {
      if (empData && empData.length > 0 && jobData && moveData) {
        // careerData.js에 실 데이터 노드/엣지/스킬 갭 요건 런타임 주입
        injectHsData(jobData, moveData)

        setHsPersonas(empData)
        setDataMode('hs-real')
        setAiEnabled(false) // 🔒 실 데이터 모드: AI 기본 차단
        setPersona(normalizeHsEmployee(empData[0]))
        console.log(`[보안] HS 실 데이터 로드 완료: 직원 ${empData.length}명, 직무 ${jobData.length}개, 이동 ${moveData.length}개 — AI API 차단 모드`)
      } else {
        setDataMode('demo')
        setAiEnabled(true) // 데모 모드: AI 활성
      }
    })
  }, [])

  const resetOnboarding = () => {
    setShowOnboarding(true)
    setTargetJobId(null)
    setSelectedScenario('t-shape')
  }

  const handleOnboardingComplete = (newPersona) => {
    setPersona(newPersona)
    setShowOnboarding(false)
    setTargetJobId(null)
    if (newPersona.careerIntent) {
      setSelectedScenario(newPersona.careerIntent)
    }
  }

  // 페르소나 컨텍스트
  const personaValue = {
    persona,
    resetOnboarding,
    switchPersona: resetOnboarding,
    currentPersonaId: persona.id,
    targetJobId,
    setTargetJobId,
    selectedScenario,
    setSelectedScenario,
    dataMode,
    hsPersonas,
    setPersonaById: (id) => {
      if (dataMode === 'hs-real' && hsPersonas) {
        const emp = hsPersonas.find(e => e.id === id)
        if (emp) setPersona(normalizeHsEmployee(emp))
      } else {
        const demo = DEMO_PERSONAS[id]
        if (demo) setPersona(demo)
      }
    },
  }

  // 🔒 AI 컨텍스트 — 실 데이터 모드에서 외부 호출 차단
  const aiValue = {
    aiEnabled,
    dataMode,
    callAi: async (fn) => {
      if (!aiEnabled) {
        console.warn('[보안] AI API 호출 차단됨. 상단 배너에서 AI ON으로 전환하세요.')
        return null
      }
      return fn()
    },
  }

  const bannerHeight = dataMode === 'hs-real' ? 32 : 0

  return (
    <AiContext.Provider value={aiValue}>
      <PersonaContext.Provider value={personaValue}>
        <SecurityBanner
          dataMode={dataMode}
          aiEnabled={aiEnabled}
          onToggleAi={() => setAiEnabled(prev => !prev)}
        />
        <div style={{ paddingTop: bannerHeight }}>
          {showOnboarding && (
            <OnboardingFlow
              persona={persona}
              onComplete={handleOnboardingComplete}
              onSkip={() => {
                setPersona(dataMode === 'hs-real' && hsPersonas
                  ? normalizeHsEmployee(hsPersonas[0])
                  : DEMO_PERSONAS['EMP001'])
                setShowOnboarding(false)
              }}
            />
          )}
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/graph" element={<CareerGraphPage />} />
                <Route path="/skill-gap" element={<SkillGapPage />} />
                <Route path="/advisor" element={<AdvisorPage />} />
                <Route path="/data-requirements" element={<DataRequirementsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </div>
      </PersonaContext.Provider>
    </AiContext.Provider>
  )
}

export default App
