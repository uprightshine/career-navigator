import { useState } from 'react'
import { usePersona } from '../App'
import { MENTORS, EXTERNAL_PROFILES, JOB_NODES } from '../data/careerData'

export default function AdvisorPage() {
  const { persona, currentPersonaId } = usePersona()
  const [activeTab, setActiveTab] = useState('internal') // 'internal' | 'external'
  const [requestedMentorId, setRequestedMentorId] = useState(null)

  // 사용자의 현재 직무 정보 및 직무군(family) 획득
  const userJob = JOB_NODES[persona.currentJobId]
  const userFamily = userJob ? userJob.family : '마케팅'

  // 페르소나 맞춤형 사내 멘토 필터링 (동적 직무군 매핑)
  const filteredMentors = MENTORS.filter(mentor => mentor.family === userFamily)

  const handleRequestMeeting = (mentorId) => {
    setRequestedMentorId(mentorId)
    setTimeout(() => {
      alert('1on1 미팅 신청이 완료되었습니다! 멘토가 수락하면 메일과 캘린더로 연동됩니다.')
      setRequestedMentorId(null)
    }, 500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }} className="animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-xl)' }}>어드바이저 매칭</h2>
        <div className="card-subtitle">내 목표 경로를 이미 성공적으로 통과한 검증된 멘토와의 매칭</div>
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
          외부 시장 벤치마크 ({EXTERNAL_PROFILES.length}명)
        </button>
      </div>

      {/* Internal Mentors Panel */}
      {activeTab === 'internal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredMentors.map(mentor => (
            <div key={mentor.id} className="glass-card glow-cyan animate-fade-in-up" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="persona-avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
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
          {EXTERNAL_PROFILES.map(profile => (
            <div key={profile.id} className="glass-card glow-purple animate-fade-in-up" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', margin: 0 }}>
                    {profile.name}
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--accent-purple)', marginTop: '2px', fontWeight: 'bold' }}>
                    {profile.currentCompany} • {profile.currentRole} ({profile.yearsExperience}년 경력)
                  </div>
                </div>
                
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => alert(`"${profile.name}" 님의 LinkedIn 상세 이력 조회 데모입니다. (실 환경에서는 API를 통해 원본 프로파일 연동)`)}
                >
                  🔗 LinkedIn 프로파일 보기
                </button>
              </div>

              {/* Path sequence */}
              <div style={{ background: 'var(--bg-glass)', padding: '10px 14px', borderRadius: '6px', fontSize: '11px', color: '#f1f5f9', borderLeft: '3px solid var(--accent-purple)', marginBottom: '12px' }}>
                <strong>이동 이력:</strong> {profile.careerSequence.join(' → ')}
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

          {/* Alert / Notice */}
          <div style={{ background: 'rgba(167, 139, 250, 0.05)', border: '1px dashed rgba(167, 139, 250, 0.2)', padding: '16px', borderRadius: 'var(--radius-lg)', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
            * 본 화면에 구현된 외부 프로파일은 LinkedIn 가상 데이터입니다. <br />
            실제 운영 환경에서는 <strong>LinkedIn API, 사내 인재 매칭 엔진</strong>과 연결하여 사외 유사 인재의 성장 경로를 동적으로 수집하고 벤치마킹합니다.
          </div>
        </div>
      )}
    </div>
  )
}
