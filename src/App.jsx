import { useState, createContext, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import CareerGraphPage from './pages/CareerGraphPage'
import SkillGapPage from './pages/SkillGapPage'
import AdvisorPage from './pages/AdvisorPage'
import DataRequirementsPage from './pages/DataRequirementsPage'
import OnboardingFlow from './components/onboarding/OnboardingFlow'

// Persona context
const PersonaContext = createContext()

export function usePersona() {
  return useContext(PersonaContext)
}

const PERSONAS = {
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
  }
}

function App() {
  const [persona, setPersona] = useState(PERSONAS['EMP001'])
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [targetJobId, setTargetJobId] = useState(null)
  const [selectedScenario, setSelectedScenario] = useState('t-shape')

  const resetOnboarding = () => {
    setShowOnboarding(true)
    setTargetJobId(null)
    setSelectedScenario('t-shape')
  }

  const handleOnboardingComplete = (newPersona) => {
    setPersona(newPersona)
    setShowOnboarding(false)
    setTargetJobId(null)
    // 사용자가 온보딩에서 성향을 선택했다면 해당 성향을 기본 시나리오로 세팅
    if (newPersona.careerIntent) {
      setSelectedScenario(newPersona.careerIntent)
    }
  }

  const value = {
    persona,
    resetOnboarding,
    switchPersona: resetOnboarding, // Sidebar 호환성을 위해 유지
    currentPersonaId: persona.id,
    targetJobId,
    setTargetJobId,
    selectedScenario,
    setSelectedScenario,
  }

  return (
    <PersonaContext.Provider value={value}>
      {showOnboarding && (
        <OnboardingFlow
          persona={persona}
          onComplete={handleOnboardingComplete}
          onSkip={() => {
            setPersona(PERSONAS['EMP001'])
            setShowOnboarding(false)
          }}
        />
      )}
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/graph" element={<CareerGraphPage />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/advisor" element={<AdvisorPage />} />
          <Route path="/data-requirements" element={<DataRequirementsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </PersonaContext.Provider>
  )
}

export default App
