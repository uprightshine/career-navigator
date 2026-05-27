import { useState, useEffect } from 'react'
import { usePersona } from '../App'
import { MENTORS, JOB_NODES } from '../data/careerData'
import hsEmployeesCompressed from '../data/hs-employees-compressed.json'
import linkedinProfiles from '../../public/data/linkedin-profiles.json'

export default function AdvisorPage() {
  const { persona, dataMode } = usePersona()
  const [activeTab, setActiveTab] = useState('internal') // 'internal' | 'external'
  // 1on1 및 커피챗 요청 상태의 localStorage 기반 영속적 보존 탑재
  const [requestedMentorIds, setRequestedMentorIds] = useState(() => {
    const saved = localStorage.getItem('requestedMentorIds')
    return saved ? JSON.parse(saved) : []
  })
  const [requestedCoffeeChatIds, setRequestedCoffeeChatIds] = useState(() => {
    const saved = localStorage.getItem('requestedCoffeeChatIds')
    return saved ? JSON.parse(saved) : []
  })
  const [isRequestingId, setIsRequestingId] = useState(null) // 1on1 요청 처리 중인 임시 스피너 상태
  
  // 외부 벤치마크 페이지네이션 및 모달 상태
  const [visibleExternalCount, setVisibleExternalCount] = useState(6)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('details') // 'details' | 'coffeechat'
  const [coffeeMessage, setCoffeeMessage] = useState('')
  const [coffeeTemplate, setCoffeeTemplate] = useState('mentorship')
  const [isSendingCoffee, setIsSendingCoffee] = useState(false)
  const [coffeeSuccess, setCoffeeSuccess] = useState(false)

  // 사용자의 현재 직무 정보 및 직무군(family) 획득
  const userJob = JOB_NODES[persona.currentJobId]
  const userFamily = userJob ? userJob.family : 'HR'

  const [internalMentors, setInternalMentors] = useState([])
  const [isLoadingMentors, setIsLoadingMentors] = useState(false)

  // 🔒 실제 사원 데이터 기반 동적 멘토 매칭 알고리즘
  useEffect(() => {
    if (dataMode === 'hs-real') {
      setIsLoadingMentors(true)
      try {
        const compressedData = hsEmployeesCompressed || []
        
        // 런타임 역동적 복원(Decompression) 및 룩업(Lookup) 수행
        const allEmployees = compressedData.map(emp => {
          // 스킬 룩업 복원
          const decompressedSkills = emp.s.map(s => {
            const skillCatalog = {
              'SK_HR_01': 'ATS 운영',
              'SK_HR_02': '면접 코디네이션',
              'SK_HR_03': '채용 브랜딩',
              'SK_HR_04': '인력 계획',
              'SK_HR_05': 'HR 데이터 분석',
              'SK_HR_06': '조직 진단',
              'SK_HR_07': '성과 관리',
              'SK_HR_08': '노사관계 관리',
              
              'SK_MKT_01': '퍼포먼스 광고',
              'SK_MKT_02': 'GA 분석',
              'SK_MKT_03': '콘텐츠 기획',
              'SK_MKT_04': 'CRM 마케팅',
              'SK_MKT_05': '브랜드 전략',

              'SK_SALES_01': 'B2B 영업',
              'SK_SALES_02': '고객관계관리',
              'SK_SALES_03': '영업 전략',
              'SK_SALES_04': '채널 관리',
              'SK_SALES_05': '제안서 작성',

              'SK_RND_01': '소재 분석',
              'SK_RND_02': '공정 설계',
              'SK_RND_03': '양산 관리',
              'SK_RND_04': '품질 관리',
              'SK_RND_05': '실험설계',
              'SK_RND_06': '통계 분석',
              'SK_RND_07': 'R&D 기획력',
              'SK_RND_08': 'AI/ML',
              'SK_RND_09': 'SW 개발',
              'SK_RND_10': '특허 전략',

              'SK_COMMON_01': '데이터 분석',
              'SK_COMMON_02': '프로젝트 관리',
              'SK_COMMON_03': '커뮤니케이션',
              'SK_COMMON_04': '예산 관리',
              'SK_COMMON_05': '시장 분석',
              'SK_COMMON_06': '전략 수립',
              'SK_COMMON_07': '비즈니스영어',
            }
            const sName = skillCatalog[s.id] || s.id.split('_').pop()
            return {
              skillId: s.id,
              name: sName,
              level: s.l
            }
          })

          // 이동 히스토리 직무명 복원
          const decompressedHistory = emp.h.map(h => {
            const targetJobNode = JOB_NODES[h.j]
            const jName = targetJobNode ? targetJobNode.name : h.j
            return {
              year: h.y,
              jobId: h.j,
              jobName: jName
            }
          })

          const jobNode = JOB_NODES[emp.cj]
          const jobName = jobNode ? jobNode.name : emp.cj

          return {
            id: emp.id,
            name: emp.n,
            joinYear: emp.jy,
            currentJob: emp.cj,
            currentJobName: jobName,
            department: emp.dept,
            businessUnit: emp.bu,
            grade: emp.g,
            yearsInRole: emp.yr,
            totalYears: emp.ty,
            evaluationGrade: emp.eg,
            skills: decompressedSkills,
            movementHistory: decompressedHistory,
            _family: emp.fam
          }
        })
        
        // 1. 나와 동일 직무군 소속이면서,
        // 2. 나보다 총 경력이 길고(선배 사원),
        // 3. 이동 이력(movementHistory)이 최소 1회 이상 있는 임직원 필터링
        const candidates = allEmployees.filter(emp => 
          emp._family === userFamily &&
          emp.id !== persona.id &&
          emp.totalYears > (persona.totalYears || 0) &&
          emp.movementHistory && emp.movementHistory.length >= 1
        )

        // 4. 선배 멘토 프로필 매핑 (상위 8명 매칭)
        const mapped = candidates.slice(0, 8).map((emp, idx) => {
          const matchScore = 96 - (idx * 2) // 적합도 결정론적 스코어
          let matchBasis = `동일한 ${userFamily} 부서 소속이며, 사내에서 ${emp.currentJobName} 실무 지식과 다년간의 경력을 겸비한 선배`
          
          if (emp.movementHistory && emp.movementHistory.length >= 2) {
            const pathStr = emp.movementHistory.map(h => h.jobName).join(' ➡ ')
            matchBasis = `동일 부서 소속으로서 [${pathStr}] 전보 경로를 성공적으로 경험한 최적 매칭 선배`
          }

          return {
            id: emp.id,
            name: emp.name, // masked (임직원_XXXX)
            family: emp._family,
            currentJob: emp.currentJobName,
            department: emp.department || `${userFamily}부서`,
            yearsExperience: emp.totalYears,
            movementHistory: emp.movementHistory.map(h => ({
              year: h.year,
              jobName: h.jobName
            })),
            skills: emp.skills.map(s => s.name),
            bio: `${emp.department || userFamily + '부서'}에서 ${emp.currentJobName} 실무를 리드하고 있습니다. ${emp.totalYears}년의 직무 경력과 전보 노하우를 바탕으로 커피챗을 통해 현업 인사이트를 전해 드리겠습니다.`,
            matchScore,
            matchBasis
          }
        })

        setInternalMentors(mapped)
        setIsLoadingMentors(false)
      } catch (err) {
        console.error('HS 실 멘토 데이터 로딩 실패:', err)
        setIsLoadingMentors(false)
        // Fallback to static MENTORS
        setInternalMentors(MENTORS.filter(m => m.family === userFamily))
      }
    } else {
      // 데모 모드
      setInternalMentors(MENTORS.filter(m => m.family === userFamily))
    }
  }, [persona.currentJobId, userFamily, dataMode, persona.totalYears])

  const [externalProfiles, setExternalProfiles] = useState([])
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true)

  // 외부 600명 LinkedIn 프로파일 비동기 로딩 (단일 파일 빌드를 위한 정적 연동)
  useEffect(() => {
    setExternalProfiles(linkedinProfiles || [])
    setIsLoadingProfiles(false)
  }, [])

  // 페르소나 맞춤형 외부 LinkedIn 프로파일 필터링 및 매칭 점수순 정렬
  const filteredExternalProfiles = externalProfiles
    .filter(profile => profile.family === userFamily)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))

  const displayedExternalProfiles = filteredExternalProfiles.slice(0, visibleExternalCount)



  const handleRequestMeeting = (mentorId) => {
    setIsRequestingId(mentorId)
    setTimeout(() => {
      const updated = [...requestedMentorIds, mentorId]
      setRequestedMentorIds(updated)
      localStorage.setItem('requestedMentorIds', JSON.stringify(updated))
      alert('1on1 미팅 신청이 완료되었습니다! 멘토가 수락하면 메일과 캘린더로 연동됩니다.')
      setIsRequestingId(null)
    }, 600)
  }

  // 커피챗 템플릿 변경
  const handleTemplateChange = (type, name) => {
    setCoffeeTemplate(type)
    if (type === 'mentorship') {
      setCoffeeMessage(`안녕하세요 ${name} 님! 대기업 Career Navigator를 통해 커리어 경로를 벤치마킹하게 되었습니다. 거쳐오신 성장 경로가 저의 목표와 일치하여 조언을 구하고자 실례를 무릅쓰고 커피챗을 요청드립니다.`)
    } else if (type === 'skill') {
      setCoffeeMessage(`안녕하세요 ${name} 님! 프로필에 등록된 전문 역량들을 인상 깊게 보았습니다. 특히 스킬을 연마하기 위해 어떤 실무 프로젝트나 외부 학습을 집중하셨는지 꼭 묻고 싶습니다.`)
    } else {
      setCoffeeMessage(`안녕하세요 ${name} 님! 현직 회사와 직무에서의 도전 경험에 대해 듣고 싶습니다. 짧게 온라인 티타임(15분)이 가능하시다면 대단히 감사하겠습니다.`)
    }
  }

  // 커피챗 요청 전송
  const handleSendCoffeeRequest = () => {
    setIsSendingCoffee(true)
    setTimeout(() => {
      setIsSendingCoffee(false)
      setCoffeeSuccess(true)
      
      // 커피챗 완료 상태 저장
      if (selectedProfile) {
        const updated = [...requestedCoffeeChatIds, selectedProfile.id]
        setRequestedCoffeeChatIds(updated)
        localStorage.setItem('requestedCoffeeChatIds', JSON.stringify(updated))
      }
      
      setTimeout(() => {
        setIsModalOpen(false)
        setCoffeeSuccess(false)
        setSelectedProfile(null)
      }, 2000)
    }, 1200)
  }

  // 모달 열기
  const openModal = (profile, type) => {
    setSelectedProfile(profile)
    setModalType(type)
    setIsModalOpen(true)
    if (type === 'coffeechat') {
      handleTemplateChange('mentorship', profile.name.split(' ')[0])
    }
  }

  // 성함 글자로 HSL 색상 결정하여 이쁜 원형 아바타 생성
  const getAvatarStyle = (name) => {
    const charCode = name.charCodeAt(0)
    const hue = (charCode * 7) % 360
    return {
      background: `hsl(${hue}, 70%, 45%)`,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      borderRadius: '50%'
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }} className="animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-xl)' }}>어드바이저 매칭</h2>
        <div className="card-subtitle">내 목표 경로를 이미 성공적으로 통과한 사내외 멘토와의 개인화 벤치마킹 매칭</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '8px' }}>
        <button
          className="btn"
          style={{
            background: activeTab === 'internal' ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
            color: activeTab === 'internal' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            borderColor: activeTab === 'internal' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            borderBottom: activeTab === 'internal' ? '2px solid var(--accent-cyan)' : 'none',
            padding: '12px 24px',
            fontWeight: '600'
          }}
          onClick={() => setActiveTab('internal')}
        >
          사내 선배 멘토 ({internalMentors.length}명)
        </button>
        <button
          className="btn"
          style={{
            background: activeTab === 'external' ? 'rgba(167, 139, 250, 0.08)' : 'transparent',
            color: activeTab === 'external' ? 'var(--accent-purple)' : 'var(--text-secondary)',
            borderColor: activeTab === 'external' ? 'rgba(167, 139, 250, 0.2)' : 'transparent',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            borderBottom: activeTab === 'external' ? '2px solid var(--accent-purple)' : 'none',
            padding: '12px 24px',
            fontWeight: '600'
          }}
          onClick={() => setActiveTab('external')}
        >
          외부 시장 벤치마크 ({filteredExternalProfiles.length}명)
        </button>
      </div>

      {/* Internal Mentors Panel */}
      {activeTab === 'internal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isLoadingMentors ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="chat-loading-dots" style={{ margin: '0 auto 15px auto', display: 'inline-flex', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '10px' }}>사내 6,120명 임직원 빅데이터 매칭 중...</div>
            </div>
          ) : internalMentors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-glass)', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>매칭되는 사내 선배가 존재하지 않습니다. 다른 상세 직무를 선택해주세요.</div>
            </div>
          ) : (
            internalMentors.map(mentor => (
            <div key={mentor.id} className="glass-card glow-cyan animate-fade-in-up" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="persona-avatar" style={{ width: '48px', height: '48px', fontSize: '18px', ...getAvatarStyle(mentor.name) }}>
                    {mentor.name[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {mentor.name}
                      <span className="badge badge-cyan" style={{ fontSize: '10px' }}>적합도 {mentor.matchScore}%</span>
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {mentor.department} • {mentor.currentJob} • {mentor.yearsExperience}년 경력
                    </div>
                  </div>
                </div>
                
                {requestedMentorIds.includes(mentor.id) ? (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ background: 'var(--scenario-safe-bg)', color: 'var(--scenario-safe)', border: '1px solid var(--scenario-safe)', cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    disabled={true}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    요청 완료 (대기 중)
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleRequestMeeting(mentor.id)}
                    disabled={isRequestingId === mentor.id}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    {isRequestingId === mentor.id ? '신청 중...' : (
                      <>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        1on1 티타임 요청
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Match Basis */}
              <div style={{ background: 'rgba(0, 0, 0, 0.02)', border: '1px solid var(--border-medium)', padding: '10px 14px', borderRadius: '6px', fontSize: '11px', color: 'var(--text-primary)', marginBottom: '16px' }}>
                <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  매칭 이유:
                </strong> {mentor.matchBasis}
              </div>

              {/* Bio */}
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', background: 'var(--bg-glass)', padding: '12px', borderRadius: '6px', borderLeft: '3px solid var(--accent-cyan-light)', marginBottom: '16px' }}>
                "{mentor.bio}"
              </p>

              {/* Career Path Timeline */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>선배가 거쳐온 커리어 경로</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {mentor.movementHistory.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        background: idx === mentor.movementHistory.length - 1 ? 'rgba(0, 0, 0, 0.04)' : 'var(--bg-glass)',
                        border: idx === mentor.movementHistory.length - 1 ? '1.5px solid #000000' : '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: idx === mentor.movementHistory.length - 1 ? 'bold' : 'normal',
                        color: idx === mentor.movementHistory.length - 1 ? '#000000' : 'var(--text-secondary)'
                      }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)', display: 'block' }}>{step.year}</span>
                        {step.jobName}
                      </div>
                      {idx < mentor.movementHistory.length - 1 && (
                        <span style={{ color: '#475569', fontSize: '14px' }}>→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialty Skills */}
              <div>
                <h4 style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>주요 역량 키워드</h4>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {mentor.skills.map((skill, index) => (
                    <span key={index} className="badge badge-purple" style={{ fontSize: '9px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )))}
        </div>
      )}

      {/* External Market Benchmarks Panel */}
      {activeTab === 'external' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isLoadingProfiles ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="chat-loading-dots" style={{ margin: '0 auto 15px auto', display: 'inline-flex', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '10px' }}>가상 LinkedIn 시장 데이터 600명 로드 중...</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-glass)', padding: '12px 18px', borderRadius: '8px', borderLeft: '3px solid var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginTop: '2px', flexShrink: 0 }}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                <span><strong>{userFamily}</strong> 직무군의 가상 LinkedIn 시장 데이터 총 <strong>{filteredExternalProfiles.length}개</strong>를 로드했습니다. 회원님의 자가진단 프로필과 커리어 유사도가 높은 순서로 정렬되었습니다.</span>
              </div>

              {displayedExternalProfiles.map(profile => (
                <div key={profile.id} className="glass-card animate-fade-in-up" style={{ padding: '24px', border: '1px solid var(--border-medium)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {/* LinkedIn 스타일 멋진 이니셜 아바타 */}
                      <div style={{ width: '48px', height: '48px', fontSize: '16px', ...getAvatarStyle(profile.name) }}>
                        {profile.name[0]}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                          {profile.name}
                          <span className="badge badge-purple" style={{ fontSize: '10px' }}>매칭률 {profile.matchScore}%</span>
                        </h3>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 'bold' }}>
                          {profile.currentCompany} • {profile.currentRole} ({profile.yearsExperience}년 경력)
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openModal(profile, 'details')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        상세 이력
                      </button>
                      {requestedCoffeeChatIds.includes(profile.id) ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ background: 'var(--scenario-t-shape-bg)', color: 'var(--scenario-t-shape)', border: '1px solid var(--scenario-t-shape)', cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          disabled={true}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          제안 완료
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ background: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)', borderColor: '#000000', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          onClick={() => openModal(profile, 'coffeechat')}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                          커피챗 제안
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Headline */}
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '16px', background: 'var(--bg-glass)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid var(--text-primary)' }}>
                    "{profile.headline}"
                  </div>

                  {/* Path sequence */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>LinkedIn 커리어 패스 경로</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {profile.careerSequence.map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            background: idx === profile.careerSequence.length - 1 ? 'rgba(0, 0, 0, 0.04)' : 'var(--bg-glass)',
                            border: idx === profile.careerSequence.length - 1 ? '1.5px solid #000000' : '1px solid var(--border-subtle)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: idx === profile.careerSequence.length - 1 ? 'bold' : 'normal',
                            color: idx === profile.careerSequence.length - 1 ? '#000000' : 'var(--text-secondary)'
                          }}>
                            {step}
                          </div>
                          {idx < profile.careerSequence.length - 1 && (
                            <span style={{ color: '#475569', fontSize: '14px' }}>→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginRight: '4px' }}>보유 역량:</span>
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="badge badge-cyan" style={{ fontSize: '9px', background: 'var(--bg-glass)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {/* 더 보기 버튼 */}
              {visibleExternalCount < filteredExternalProfiles.length && (
                <button 
                  className="btn btn-secondary" 
                  style={{ alignSelf: 'center', margin: '10px 0', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  onClick={() => setVisibleExternalCount(prev => prev + 6)}
                >
                  전체 {filteredExternalProfiles.length}명 중 남은 {filteredExternalProfiles.length - visibleExternalCount}명 더 보기
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              )}

              {/* Alert / Notice */}
              <div style={{ background: 'var(--bg-glass)', border: '1px dashed var(--border-medium)', padding: '16px', borderRadius: 'var(--radius-lg)', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                * 본 화면에 연동된 {filteredExternalProfiles.length}명의 외부 프로필은 LinkedIn API 데이터 시뮬레이션입니다. <br />
                실제 운영 환경에서는 <strong>LinkedIn Talent API 및 사외 매칭 엔진</strong>과 통신하여, 로그인한 구성원의 직무 도메인에 부합하는 사외 우수 인재들의 이동 궤적을 실시간 수집 및 벤치마킹합니다.
              </div>
            </>
          )}
        </div>
      )}

      {/* ─────────────────── 모달 레이어 ─────────────────── */}
      {isModalOpen && selectedProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card animate-fade-in-up" style={{
            width: '90%',
            maxWidth: '600px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '30px',
            position: 'relative',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-card)'
          }}>
            <button 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '20px', cursor: 'pointer' }}
              onClick={() => { setIsModalOpen(false); setSelectedProfile(null); }}
            >
              ✕
            </button>

            {/* A. 상세 정보 보기 모달 */}
            {modalType === 'details' && (
              <div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ width: '60px', height: '60px', fontSize: '20px', ...getAvatarStyle(selectedProfile.name) }}>
                    {selectedProfile.name[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)' }}>{selectedProfile.name}</h3>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                      {selectedProfile.currentCompany} • {selectedProfile.currentRole}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      총 {selectedProfile.yearsExperience}년차 경력 • {selectedProfile.family} 직무군 벤치마크
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* 헤드라인 */}
                  <div>
                    <h4 style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>프로필 헤드라인</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', background: 'var(--bg-glass)', padding: '12px', borderRadius: '6px' }}>
                      "{selectedProfile.headline}"
                    </p>
                  </div>

                  {/* 상세 타임라인 */}
                  <div>
                    <h4 style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>상세 경력 타임라인</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '15px', borderLeft: '2px solid var(--border-medium)' }}>
                      {selectedProfile.careerSequence.map((step, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <span style={{
                            position: 'absolute',
                            left: '-21px',
                            top: '4px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: idx === selectedProfile.careerSequence.length - 1 ? '#000000' : 'var(--text-tertiary)',
                            boxShadow: idx === selectedProfile.careerSequence.length - 1 ? '0 0 8px rgba(0, 0, 0, 0.25)' : 'none'
                          }} />
                          <div style={{ fontSize: '13px', color: idx === selectedProfile.careerSequence.length - 1 ? '#000000' : 'var(--text-secondary)', fontWeight: idx === selectedProfile.careerSequence.length - 1 ? 'bold' : 'normal' }}>
                            {step}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 매칭 근거 및 추천 사유 */}
                  <div>
                    <h4 style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      인공지능 매칭 통계
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-primary)', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-medium)', padding: '12px', borderRadius: '6px', lineHeight: '1.5' }}>
                      {selectedProfile.matchBasis}
                    </p>
                  </div>

                  {/* 커리어 성장 꿀팁 */}
                  <div>
                    <h4 style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      사외 선배가 전하는 성장 조언
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-glass)', borderLeft: '3px solid var(--accent-cyan)', padding: '12px', borderRadius: '6px', lineHeight: '1.6' }}>
                      "{selectedProfile.keyInsight}"
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => { setIsModalOpen(false); setSelectedProfile(null); }}>
                    닫기
                  </button>
                  <button 
                    className="btn btn-primary"
                    style={{ background: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)', borderColor: '#000000', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    onClick={() => setModalType('coffeechat')}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                    이 선배에게 커피챗 제안
                  </button>
                </div>
              </div>
            )}

            {/* B. 커피챗 신청 모달 */}
            {modalType === 'coffeechat' && (
              <div>
                <h3 style={{ fontSize: '18px', margin: '0 0 10px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                  1:1 온라인 커피챗 제안
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
                  <strong>{selectedProfile.name}</strong> 님에게 네트워킹 및 멘토링 요청 메시지를 전송합니다. 상대방 수락 시 연동된 개인 이메일로 알림이 발송됩니다.
                </p>

                {coffeeSuccess ? (
                  <div style={{ textAlign: 'center', padding: '30px 0' }} className="animate-fade-in-up">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 15px auto', display: 'block', color: 'var(--text-secondary)' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    <h4 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 8px 0', fontWeight: 'bold' }}>커피챗 제안서 전송 완료!</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                      상대방 수락 시 사내 메일 및 알림 창으로 즉시 연동됩니다.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* 메시지 템플릿 선택 */}
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>템플릿 선택</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-xs"
                          style={{
                            background: coffeeTemplate === 'mentorship' ? 'rgba(0,0,0,0.04)' : 'transparent',
                            borderColor: coffeeTemplate === 'mentorship' ? '#000000' : 'var(--border-subtle)',
                            color: coffeeTemplate === 'mentorship' ? '#000000' : 'var(--text-secondary)',
                            fontSize: '11px', padding: '6px 12px'
                          }}
                          onClick={() => handleTemplateChange('mentorship', selectedProfile.name.split(' ')[0])}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 3h6l2 9H4l-1-9z"/><path d="M14 3h6l1 9h-5l-2-9z"/><circle cx="7" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>
                          커리어 경로 문의
                        </button>
                        <button 
                          className="btn btn-xs"
                          style={{
                            background: coffeeTemplate === 'skill' ? 'rgba(0,0,0,0.04)' : 'transparent',
                            borderColor: coffeeTemplate === 'skill' ? '#000000' : 'var(--border-subtle)',
                            color: coffeeTemplate === 'skill' ? '#000000' : 'var(--text-secondary)',
                            fontSize: '11px', padding: '6px 12px'
                          }}
                          onClick={() => handleTemplateChange('skill', selectedProfile.name.split(' ')[0])}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                          스킬 갭 보완 팁
                        </button>
                        <button 
                          className="btn btn-xs"
                          style={{
                            background: coffeeTemplate === 'challenge' ? 'rgba(0,0,0,0.04)' : 'transparent',
                            borderColor: coffeeTemplate === 'challenge' ? '#000000' : 'var(--border-subtle)',
                            color: coffeeTemplate === 'challenge' ? '#000000' : 'var(--text-secondary)',
                            fontSize: '11px', padding: '6px 12px'
                          }}
                          onClick={() => handleTemplateChange('challenge', selectedProfile.name.split(' ')[0])}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                          도전 직무 조언
                        </button>
                      </div>
                    </div>

                    {/* 메시지 작성 */}
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>제안 메시지</span>
                      <textarea
                        style={{
                          width: '100%',
                          height: '140px',
                          background: '#ffffff',
                          border: '1px solid var(--border-medium)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          padding: '12px',
                          fontSize: '12px',
                          fontFamily: 'inherit',
                          lineHeight: '1.6',
                          resize: 'none'
                        }}
                        value={coffeeMessage}
                        onChange={(e) => setCoffeeMessage(e.target.value)}
                        placeholder="이 선배에게 보낼 네트워킹 메시지를 적어주세요..."
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => setModalType('details')}
                        disabled={isSendingCoffee}
                      >
                        이전
                      </button>
                      <button 
                        className="btn btn-primary"
                        style={{ background: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)', borderColor: '#000000', color: '#ffffff' }}
                        onClick={handleSendCoffeeRequest}
                        disabled={isSendingCoffee || !coffeeMessage.trim()}
                      >
                        {isSendingCoffee ? '제안서 발송 중...' : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                            커피챗 제안서 전송
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
