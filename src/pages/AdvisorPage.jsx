import { useState } from 'react'
import { usePersona } from '../App'
import { MENTORS, EXTERNAL_PROFILES, JOB_NODES } from '../data/careerData'

export default function AdvisorPage() {
  const { persona } = usePersona()
  const [activeTab, setActiveTab] = useState('internal') // 'internal' | 'external'
  const [requestedMentorId, setRequestedMentorId] = useState(null)
  
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
  const userFamily = userJob ? userJob.family : '마케팅'

  // 페르소나 맞춤형 사내 멘토 필터링 (동적 직무군 매핑)
  const filteredMentors = MENTORS.filter(mentor => mentor.family === userFamily)

  // 페르소나 맞춤형 외부 LinkedIn 프로파일 필터링 및 매칭 점수순 정렬
  const filteredExternalProfiles = EXTERNAL_PROFILES
    .filter(profile => profile.family === userFamily)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))

  const displayedExternalProfiles = filteredExternalProfiles.slice(0, visibleExternalCount)



  const handleRequestMeeting = (mentorId) => {
    setRequestedMentorId(mentorId)
    setTimeout(() => {
      alert('1on1 미팅 신청이 완료되었습니다! 멘토가 수락하면 메일과 캘린더로 연동됩니다.')
      setRequestedMentorId(null)
    }, 500)
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
          사내 선배 멘토 ({filteredMentors.length}명)
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
          {filteredMentors.map(mentor => (
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
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      {mentor.department} • {mentor.currentJob} • {mentor.yearsExperience}년 경력
                    </div>
                  </div>
                </div>
                
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleRequestMeeting(mentor.id)}
                  disabled={requestedMentorId === mentor.id}
                >
                  {requestedMentorId === mentor.id ? '신청 중...' : '🤝 1on1 티타임 요청'}
                </button>
              </div>

              {/* Match Basis */}
              <div style={{ background: 'rgba(6, 182, 212, 0.04)', border: '1px solid rgba(6, 182, 212, 0.1)', padding: '10px 14px', borderRadius: '6px', fontSize: '11px', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
                <strong>💡 매칭 이유:</strong> {mentor.matchBasis}
              </div>

              {/* Bio */}
              <p style={{ fontSize: '12px', color: '#f1f5f9', lineHeight: '1.5', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #64748b', marginBottom: '16px' }}>
                "{mentor.bio}"
              </p>

              {/* Career Path Timeline */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>선배가 거쳐온 커리어 경로</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {mentor.movementHistory.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        background: idx === mentor.movementHistory.length - 1 ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-glass)',
                        border: idx === mentor.movementHistory.length - 1 ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: idx === mentor.movementHistory.length - 1 ? 'bold' : 'normal',
                        color: idx === mentor.movementHistory.length - 1 ? 'var(--accent-cyan)' : '#f1f5f9'
                      }}>
                        <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>{step.year}</span>
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
          ))}
        </div>
      )}

      {/* External Market Benchmarks Panel */}
      {activeTab === 'external' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', padding: '12px 18px', borderRadius: '8px', borderLeft: '3px solid var(--accent-purple)' }}>
            📊 <strong>{userFamily}</strong> 직무군의 가상 LinkedIn 시장 데이터 총 <strong>{filteredExternalProfiles.length}개</strong>를 로드했습니다. 회원님의 자가진단 프로필과 커리어 유사도가 높은 순서로 정렬되었습니다.
          </div>

          {displayedExternalProfiles.map(profile => (
            <div key={profile.id} className="glass-card glow-purple animate-fade-in-up" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {/* LinkedIn 스타일 멋진 이니셜 아바타 */}
                  <div style={{ width: '48px', height: '48px', fontSize: '16px', ...getAvatarStyle(profile.name) }}>
                    {profile.name[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {profile.name}
                      <span className="badge badge-purple" style={{ fontSize: '10px' }}>매칭률 {profile.matchScore}%</span>
                    </h3>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', fontWeight: 'bold' }}>
                      {profile.currentCompany} • {profile.currentRole} ({profile.yearsExperience}년 경력)
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openModal(profile, 'details')}
                  >
                    🔍 상세 이력
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', borderColor: '#8b5cf6' }}
                    onClick={() => openModal(profile, 'coffeechat')}
                  >
                    ☕ 커피챗 제안
                  </button>
                </div>
              </div>

              {/* Headline */}
              <div style={{ fontSize: '12px', color: '#e2e8f0', fontStyle: 'italic', marginBottom: '16px', background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #7c3aed' }}>
                "{profile.headline}"
              </div>

              {/* Path sequence */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>LinkedIn 커리어 패스 경로</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {profile.careerSequence.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        background: idx === profile.careerSequence.length - 1 ? 'rgba(167, 139, 250, 0.12)' : 'var(--bg-glass)',
                        border: idx === profile.careerSequence.length - 1 ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: idx === profile.careerSequence.length - 1 ? 'bold' : 'normal',
                        color: idx === profile.careerSequence.length - 1 ? 'var(--accent-purple)' : '#f1f5f9'
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
                <span style={{ fontSize: '10px', color: '#64748b', marginRight: '4px' }}>보유 역량:</span>
                {profile.skills.map((skill, index) => (
                  <span key={index} className="badge badge-cyan" style={{ fontSize: '9px', background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
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
              style={{ alignSelf: 'center', margin: '10px 0' }}
              onClick={() => setVisibleExternalCount(prev => prev + 6)}
            >
              전체 {filteredExternalProfiles.length}명 중 남은 {filteredExternalProfiles.length - visibleExternalCount}명 더 보기 🔽
            </button>
          )}

          {/* Alert / Notice */}
          <div style={{ background: 'rgba(167, 139, 250, 0.05)', border: '1px dashed rgba(167, 139, 250, 0.2)', padding: '16px', borderRadius: 'var(--radius-lg)', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
            * 본 화면에 연동된 {filteredExternalProfiles.length}명의 외부 프로필은 LinkedIn API 데이터 시뮬레이션입니다. <br />
            실제 운영 환경에서는 <strong>LinkedIn Talent API 및 사외 매칭 엔진</strong>과 통신하여, 로그인한 구성원의 직무 도메인에 부합하는 사외 우수 인재들의 이동 궤적을 실시간 수집 및 벤치마킹합니다.
          </div>
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
          <div className="glass-card glow-purple animate-fade-in-up" style={{
            width: '90%',
            maxWidth: '600px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '30px',
            position: 'relative'
          }}>
            <button 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
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
                    <h3 style={{ fontSize: '18px', margin: 0, color: '#fff' }}>{selectedProfile.name}</h3>
                    <div style={{ fontSize: '13px', color: 'var(--accent-purple)', fontWeight: 'bold' }}>
                      {selectedProfile.currentCompany} • {selectedProfile.currentRole}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      총 {selectedProfile.yearsExperience}년차 경력 • {selectedProfile.family} 직무군 벤치마크
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* 헤드라인 */}
                  <div>
                    <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>프로필 헤드라인</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                      "{selectedProfile.headline}"
                    </p>
                  </div>

                  {/* 상세 타임라인 */}
                  <div>
                    <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>상세 경력 타임라인</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '15px', borderLeft: '2px solid rgba(167, 139, 250, 0.2)' }}>
                      {selectedProfile.careerSequence.map((step, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <span style={{
                            position: 'absolute',
                            left: '-21px',
                            top: '4px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: idx === selectedProfile.careerSequence.length - 1 ? 'var(--accent-purple)' : '#475569',
                            boxShadow: idx === selectedProfile.careerSequence.length - 1 ? '0 0 8px var(--accent-purple)' : 'none'
                          }} />
                          <div style={{ fontSize: '13px', color: idx === selectedProfile.careerSequence.length - 1 ? 'var(--accent-purple)' : '#f1f5f9', fontWeight: idx === selectedProfile.careerSequence.length - 1 ? 'bold' : 'normal' }}>
                            {step}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 매칭 근거 및 추천 사유 */}
                  <div>
                    <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>💡 인공지능 매칭 통계</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--accent-purple)', background: 'rgba(167, 139, 250, 0.05)', border: '1px solid rgba(167, 139, 250, 0.15)', padding: '12px', borderRadius: '6px', lineHeight: '1.5' }}>
                      {selectedProfile.matchBasis}
                    </p>
                  </div>

                  {/* 커리어 성장 꿀팁 */}
                  <div>
                    <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>💬 사외 선배가 전하는 성장 조언</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', background: 'rgba(255,255,255,0.01)', borderLeft: '3px solid #64748b', padding: '12px', borderRadius: '6px', lineHeight: '1.6' }}>
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
                    style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', borderColor: '#8b5cf6' }}
                    onClick={() => setModalType('coffeechat')}
                  >
                    ☕ 이 선배에게 커피챗 제안
                  </button>
                </div>
              </div>
            )}

            {/* B. 커피챗 신청 모달 */}
            {modalType === 'coffeechat' && (
              <div>
                <h3 style={{ fontSize: '18px', margin: '0 0 10px 0', color: '#fff' }}>☕ 1:1 온라인 커피챗 제안</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 20px 0' }}>
                  <strong>{selectedProfile.name}</strong> 님에게 네트워킹 및 멘토링 요청 메시지를 전송합니다. 상대방 수락 시 연동된 개인 이메일로 알림이 발송됩니다.
                </p>

                {coffeeSuccess ? (
                  <div style={{ textAlign: 'center', padding: '30px 0' }} className="animate-fade-in-up">
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚀</div>
                    <h4 style={{ fontSize: '16px', color: 'var(--accent-purple)', margin: '0 0 8px 0' }}>커피챗 제안서 전송 완료!</h4>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                      상대방 수락 시 사내 메일 및 알림 창으로 즉시 연동됩니다.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* 메시지 템플릿 선택 */}
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '6px' }}>템플릿 선택</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-xs"
                          style={{
                            background: coffeeTemplate === 'mentorship' ? 'rgba(167,139,250,0.1)' : 'transparent',
                            borderColor: coffeeTemplate === 'mentorship' ? 'var(--accent-purple)' : 'var(--border-subtle)',
                            color: coffeeTemplate === 'mentorship' ? 'var(--accent-purple)' : '#94a3b8',
                            fontSize: '11px', padding: '6px 12px'
                          }}
                          onClick={() => handleTemplateChange('mentorship', selectedProfile.name.split(' ')[0])}
                        >
                          🗺️ 커리어 경로 문의
                        </button>
                        <button 
                          className="btn btn-xs"
                          style={{
                            background: coffeeTemplate === 'skill' ? 'rgba(167,139,250,0.1)' : 'transparent',
                            borderColor: coffeeTemplate === 'skill' ? 'var(--accent-purple)' : 'var(--border-subtle)',
                            color: coffeeTemplate === 'skill' ? 'var(--accent-purple)' : '#94a3b8',
                            fontSize: '11px', padding: '6px 12px'
                          }}
                          onClick={() => handleTemplateChange('skill', selectedProfile.name.split(' ')[0])}
                        >
                          📊 스킬 갭 보완 팁
                        </button>
                        <button 
                          className="btn btn-xs"
                          style={{
                            background: coffeeTemplate === 'challenge' ? 'rgba(167,139,250,0.1)' : 'transparent',
                            borderColor: coffeeTemplate === 'challenge' ? 'var(--accent-purple)' : 'var(--border-subtle)',
                            color: coffeeTemplate === 'challenge' ? 'var(--accent-purple)' : '#94a3b8',
                            fontSize: '11px', padding: '6px 12px'
                          }}
                          onClick={() => handleTemplateChange('challenge', selectedProfile.name.split(' ')[0])}
                        >
                          💼 도전 직무 조언
                        </button>
                      </div>
                    </div>

                    {/* 메시지 작성 */}
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '6px' }}>제안 메시지</span>
                      <textarea
                        style={{
                          width: '100%',
                          height: '140px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          color: '#fff',
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
                        style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', borderColor: '#8b5cf6' }}
                        onClick={handleSendCoffeeRequest}
                        disabled={isSendingCoffee || !coffeeMessage.trim()}
                      >
                        {isSendingCoffee ? '제안서 발송 중...' : '🚀 커피챗 제안서 전송'}
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
