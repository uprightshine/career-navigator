import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePersona } from '../App'
import { JOB_NODES, JOB_REQUIRED_SKILLS, LEARNING_RESOURCES, getScenarioRecommendations } from '../data/careerData'
import rawTrainings from '../data/trainings.json'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'

export default function SkillGapPage() {
  const { persona, targetJobId, selectedScenario } = usePersona()
  const navigate = useNavigate()

  // 목표 직무 미설정 시 고급스럽고 화사한 Empty State 렌더링 (경로 안내 UX 고도화)
  if (!targetJobId) {
    return (
      <div className="premium-spinner-container" style={{ minHeight: 'calc(100vh - var(--header-height) - 100px)' }}>
        <div className="glass-card glow-cyan animate-fade-in-up" style={{ 
          maxWidth: '540px', 
          padding: '40px', 
          textAlign: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px' }}>
            목표 직무가 설정되지 않았습니다
          </h2>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '28px' }}>
            나에게 딱 맞는 스킬 갭(Skill Gap) 분석과 솔루션을 진단받으려면, 먼저 <strong>Career Graph</strong>에서 진로 경로를 탐색하고 원하는 목표 직무를 탭하여 목표로 설정해주세요!
          </p>
          <button
            onClick={() => navigate('/graph')}
            style={{
              padding: '12px 24px',
              fontSize: '13px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)',
              color: '#ffffff',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-glow-cyan)',
              border: 'none',
              transition: 'all var(--transition-fast) ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(8, 145, 178, 0.35)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow-cyan)'; }}
          >
            목표 직무 설정하러 가기 ➡️
          </button>
        </div>
      </div>
    )
  }

  // 기본 타겟 설정 (선택된 타겟이 없으면 T자형 추천 직무를 디폴트로 사용)
  const defaultTargetId = useMemo(() => {
    const recs = getScenarioRecommendations(persona.currentJobId)
    return recs ? (recs['T자형'] || recs.t_shape || recs.challenge || recs.safe).targetId : 'JOB_MKT_PM'
  }, [persona.currentJobId])

  const activeTargetId = targetJobId || defaultTargetId
  const targetJob = JOB_NODES[activeTargetId]
  const currentJob = JOB_NODES[persona.currentJobId]

  // 요구 스킬 목록 획득
  const targetSkills = useMemo(() => {
    return JOB_REQUIRED_SKILLS[activeTargetId] || []
  }, [activeTargetId])

  // 스킬 갭 데이터 연산
  const gapData = useMemo(() => {
    return targetSkills.map(reqSkill => {
      const mySkill = persona.skills.find(s => s.skillId === reqSkill.skillId)
      const currentLevel = mySkill ? mySkill.level : 0
      const gap = Math.max(0, reqSkill.minLevel - currentLevel)
      return {
        id: reqSkill.skillId,
        name: reqSkill.name,
        current: currentLevel,
        required: reqSkill.minLevel,
        gap: gap
      }
    })
  }, [targetSkills, persona.skills])

  // 총 갭 개수
  const gapCount = useMemo(() => {
    return gapData.filter(d => d.gap > 0).length
  }, [gapData])

  // 부서 이동 여부 체크
  const isSameBU = currentJob && targetJob ? currentJob.family === targetJob.family : true

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div style={{ background: 'rgba(10, 14, 26, 0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#fff' }}>{data.name}</div>
          <div style={{ color: '#22d3ee' }}>현재 수준: L{data.current}</div>
          <div style={{ color: '#a78bfa' }}>요구 수준: L{data.required}</div>
          {data.gap > 0 ? (
            <div style={{ color: '#f59e0b', fontWeight: 'bold', marginTop: '4px' }}>성장 필요도: L{data.gap}</div>
          ) : (
            <div style={{ color: '#34d399', fontWeight: 'bold', marginTop: '4px' }}>요구 충족 완료!</div>
          )}
        </div>
      )
    }
    return null
  }

  // 레벨 명칭 매핑
  const levelNames = {
    1: '인지 (L1)',
    2: '적용 (L2)',
    3: '자립 (L3)',
    4: '전문 (L4)',
    5: '혁신 (L5)'
  }

  // SK_ 스킬 코드와 trainings.json의 SKL_ 스킬 코드 매핑
  const SKILL_MAP = useMemo(() => ({
    // HR
    'SK_HR_01': 'SKL_HR_002', // ATS 운영
    'SK_HR_02': 'SKL_HR_003', // 면접 코디네이션 -> 면접설계
    'SK_HR_03': 'SKL_HR_004', // 채용 브랜딩
    'SK_HR_04': 'SKL_HR_008', // 인력 계획 -> 인사전략
    'SK_HR_05': 'SKL_HR_013', // HR 데이터 분석 -> 피플애널리틱스
    'SK_HR_06': 'SKL_HR_007', // 조직 진단
    'SK_HR_07': 'SKL_HR_008', // 성과 관리 -> 인사전략

    // Marketing
    'SK_MKT_01': 'SKL_MK_001', // 퍼포먼스 광고
    'SK_MKT_02': 'SKL_MK_002', // GA 분석
    'SK_MKT_03': 'SKL_MK_004', // 콘텐츠 기획
    'SK_MKT_04': 'SKL_MK_005', // CRM 마케팅
    'SK_MKT_05': 'SKL_MK_003', // 브랜드 전략

    // Sales
    'SK_SALES_01': 'SKL_SL_001', // B2B 영업
    'SK_SALES_02': 'SKL_SL_002', // 고객관계관리
    'SK_SALES_03': 'SKL_SL_003', // 영업 전략
    'SK_SALES_04': 'SKL_SL_004', // 채널 관리
    'SK_SALES_05': 'SKL_SL_005', // 제안서 작성

    // R&D
    'SK_RND_01': 'SKL_RD_001', // 소재 분석
    'SK_RND_02': 'SKL_RD_002', // 공정 설계
    'SK_RND_03': 'SKL_RD_003', // 양산 관리
    'SK_RND_04': 'SKL_RD_004', // 품질 관리
    'SK_RND_05': 'SKL_RD_005', // 실험설계
    'SK_RND_06': 'SKL_RD_006', // 통계 분석
    'SK_RND_07': 'SKL_RD_007', // R&D 기획력
    'SK_RND_08': 'SKL_RD_008', // AI/ML
    'SK_RND_09': 'SKL_RD_009', // SW 개발
    'SK_RND_10': 'SKL_RD_010', // 특허 전략

    // Common
    'SK_COMMON_01': 'SKL_CF_002', // 데이터 분석
    'SK_COMMON_02': 'SKL_CF_001', // 프로젝트 관리
    'SK_COMMON_03': 'SKL_CF_003', // 커뮤니케이션
    'SK_COMMON_04': 'SKL_CF_002', // 예산 관리
    'SK_COMMON_05': 'SKL_MK_010', // 시장 분석 -> 시장조사
    'SK_COMMON_06': 'SKL_HR_008', // 전략 수립
    'SK_COMMON_07': 'SKL_CF_006', // 비즈니스영어
  }), [])

  // 추천 리소스 수집 (trainings.json 데이터와 careerData.js 폴백 데이터를 결합)
  const recommendedResources = useMemo(() => {
    const list = []
    gapData.forEach(d => {
      if (d.gap > 0) {
        // 1. trainings.json 데이터에서 연동되는 교육 매핑 검색
        const mappedSklId = SKILL_MAP[d.id]
        if (mappedSklId) {
          const matchedTrainings = rawTrainings.filter(trn => 
            trn.targetSkills && trn.targetSkills.includes(mappedSklId)
          )
          if (matchedTrainings.length > 0) {
            matchedTrainings.forEach(res => {
              list.push({
                title: res.title,
                type: res.type,
                duration: res.duration,
                provider: res.provider,
                description: res.description,
                url: res.url,
                skillName: d.name,
                gapSize: d.gap
              })
            })
          }
        }
        
        // 2. careerData.js의 하드코딩된 폴백 리소스 매핑 (중복 제거)
        if (LEARNING_RESOURCES[d.id]) {
          LEARNING_RESOURCES[d.id].forEach(res => {
            if (!list.some(item => item.title === res.title)) {
              list.push({
                ...res,
                skillName: d.name,
                gapSize: d.gap,
                description: res.description || `${d.name} 역량 강화를 위한 맞춤 과정입니다.`
              })
            }
          })
        }
      }
    })
    return list
  }, [gapData, SKILL_MAP])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }} className="animate-fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)' }}>Skill Gap 분석 & 학습 플래너</h2>
          <div className="card-subtitle">목표 직무와 현재 보유 역량 간 차이 진단 및 성장을 위한 학습 계획</div>
        </div>
        <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>
          시나리오: {selectedScenario === 'safe' ? '🛡️ 안전형' : selectedScenario === 'challenge' ? '🔥 도전형' : '🔀 T자형'}
        </span>
      </div>

      {/* Target Path Summary Cards */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-glass)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ flex: 1, minWidth: '200px', padding: '16px', margin: 0, textAlign: 'center', background: 'rgba(6, 182, 212, 0.05)' }}>
          <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>현재 직무</div>
          <h4 style={{ fontSize: '14px', color: '#f1f5f9' }}>{currentJob?.name || persona.currentJobName}</h4>
        </div>
        
        <div style={{ fontSize: '24px', color: 'var(--accent-cyan)' }}>→</div>
        
        <div className="glass-card glow-cyan" style={{ flex: 1, minWidth: '200px', padding: '16px', margin: 0, textAlign: 'center', background: 'rgba(167, 139, 250, 0.05)' }}>
          <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>목표 직무</div>
          <h4 style={{ fontSize: '14px', color: '#22d3ee' }}>{targetJob?.name}</h4>
        </div>
      </div>

      {/* Transition Cost Summary */}
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '24px' }}>⏱️</div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>예상 준비 기간</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {isSameBU ? '약 2.0년 ~ 2.5년' : '약 3.0년 ~ 3.5년'}
            </div>
          </div>
        </div>
        <div className="glass-card glow-cyan" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '24px' }}>📊</div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>미충족 스킬 갭</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
              {gapCount}개 역량
            </div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '24px' }}>🏢</div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>조직 이동 유형</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {isSameBU ? '동일 본부 내 이동' : '타 본부 간 전보'}
            </div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '24px' }}>📈</div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>목표 직무 트렌드</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: targetJob?.growthTrend === 'growing' ? '#34d399' : '#f59e0b' }}>
              {targetJob?.growthTrend === 'growing' ? '📈 성장 (인력 수요 증가)' : '➡️ 안정 (유지)'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Skill Gap Analysis & Opportunities */}
      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 0.8fr', '@media (max-width: 1024px)': { gridTemplateColumns: '1fr' } }}>
        {/* Left Card: Chart */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">역량 갭 상세 비교</h3>
              <div className="card-subtitle">내 역량 수준(Cyan) vs 직무 요구 수준(Purple)</div>
            </div>
          </div>

          <div style={{ width: '100%', height: '320px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={gapData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
              >
                <XAxis type="number" domain={[0, 5]} tickCount={6} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fill: '#f1f5f9', fontSize: 11 }} width={90} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }} />
                
                {/* 현재 보유 수준 */}
                <Bar dataKey="current" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={12}>
                  {gapData.map((entry, index) => (
                    <Cell key={`cell-curr-${index}`} fill={entry.gap > 0 ? '#0891b2' : '#06b6d4'} />
                  ))}
                </Bar>
                
                {/* 갭 필요 수준 */}
                <Bar dataKey="gap" fill="rgba(245, 158, 11, 0.5)" radius={[0, 4, 4, 0]} barSize={12} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '16px', fontSize: 'var(--font-size-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#06b6d4', borderRadius: '2px', display: 'inline-block' }}></span>
              <span>현재 역량 레벨</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: 'rgba(245, 158, 11, 0.6)', borderRadius: '2px', display: 'inline-block' }}></span>
              <span>성장 필요분 (Gap)</span>
            </div>
          </div>
        </div>

        {/* Right Card: Opportunity Tips */}
        <div className="glass-card glow-purple" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 className="card-title">성장 가이드</h3>
            <div className="card-subtitle">역량 격차 극복을 위한 분석 팁</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
            {gapCount > 0 ? (
              gapData.map(d => {
                if (d.gap <= 0) return null
                return (
                  <div key={d.id} style={{ background: 'var(--bg-glass)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f59e0b' }}>{d.name}</span>
                      <span className="badge badge-warning" style={{ fontSize: '9px', padding: '1px 6px', background: 'rgba(245,158,11,0.1)' }}>
                        Gap: L{d.gap}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                      현재 수준은 <strong>{levelNames[d.current] || '미보유'}</strong> 이며, 직무 수행을 위해서는 <strong>{levelNames[d.required]}</strong> 수준의 숙련도가 요구됩니다.
                    </p>
                  </div>
                )
              })
            ) : (
              <div style={{ textAlign: 'center', color: '#34d399', padding: '40px 0', fontSize: 'var(--font-size-sm)' }}>
                🎉 축하합니다! <br />
                목표 직무가 요구하는 핵심 역량을 모두 충분히 충족하고 있습니다. <br />
                인사이동 신청 또는 면접 기회를 선제적으로 확인해 보세요.
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(167, 139, 250, 0.05)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(167, 139, 250, 0.1)', fontSize: '10px', color: '#a78bfa' }}>
            <strong>💡 역량 성숙도 레벨 정보:</strong> <br />
            L1 (인지) → L2 (적용 - 실무 투입) → L3 (자립 - 독립 수행) → L4 (전문 - 타인 가이드) → L5 (혁신 - 신제도 설계)
          </div>
        </div>
      </div>

      {/* Recommended Learning Resources */}
      <div className="glass-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">추천 성장 솔루션</h3>
            <div className="card-subtitle">부족한 {gapCount}개 역량 강화를 위해 매칭된 맞춤형 교육 및 도서</div>
          </div>
        </div>

        {recommendedResources.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
            {recommendedResources.map((res, index) => (
              <div key={index} className="action-card" style={{ height: '100%', margin: 0, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ 
                    fontSize: '18px', 
                    padding: '8px', 
                    borderRadius: '8px',
                    background: res.type === '사내교육' ? 'rgba(6, 182, 212, 0.1)' : res.type === '외부강의' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                    color: res.type === '사내교육' ? 'var(--accent-cyan)' : res.type === '외부강의' ? 'var(--accent-purple)' : 'var(--status-warning)'
                  }}>
                    {res.type === '사내교육' ? '🏢' : res.type === '외부강의' ? '🎓' : '📚'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '8px', padding: '1px 6px', display: 'inline-block' }}>{res.skillName} 연계</span>
                      <span style={{ fontSize: '8px', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '1px 4px', borderRadius: '4px' }}>
                        {res.type}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '13px', margin: 0, fontWeight: 'bold', color: '#f1f5f9' }}>{res.title}</h4>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{res.provider} • {res.duration}</div>
                    {res.description && (
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', lineHeight: '1.4' }}>
                        {res.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <button 
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', padding: '6px', fontSize: '10px', marginTop: '8px' }}
                  onClick={() => {
                    if (res.type === '사내교육' || res.type === '프로젝트경험') {
                      alert(`🏢 [사내 학습 포털 연동 데모]\n\n과정명: ${res.title}\n제공처: ${res.provider}\n\nLG인화원 학습관리시스템(LMS)과 정상 연동되어 수강 신청이 완료되었습니다. 승인 절차 후 e-mail로 수강 안내서가 발송됩니다.`);
                    } else if (res.type === '도서') {
                      alert(`📖 [사내 도서 신청 완료]\n\n도서명: ${res.title}\n제공처: ${res.provider}\n\n도서 구입 신청이 성공적으로 접수되었습니다. 담당 부서에서 배송해 드립니다.`);
                    } else {
                      // 외부 강의
                      if (res.url) {
                        const win = window.open(res.url, '_blank');
                        if (win) win.focus();
                        else alert(`🎓 [외부 교육 이동]\n\n${res.title} 과정 페이지로 이동합니다:\n${res.url}`);
                      } else {
                        alert(`🎓 [외부 교육 신청 완료]\n\n과정명: ${res.title}\n\n외부 교육 위탁 신청이 접수되었습니다.`);
                      }
                    }
                  }}
                >
                  {res.type === '외부강의' ? '강의 상세 보기 ↗' : res.type === '도서' ? '도서 신청하기' : '과정 신청하기'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '30px', fontSize: 'var(--font-size-xs)' }}>
            매칭된 스킬 갭이 없거나 즉시 추천할 리소스가 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
