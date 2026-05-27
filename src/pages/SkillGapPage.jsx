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
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-tertiary)' }}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
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
            목표 직무 설정하러 가기 →
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
        <div style={{ background: '#ffffff', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-md)', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-primary)' }}>{data.name}</div>
          <div style={{ color: 'var(--text-secondary)' }}>현재 수준: L{data.current}</div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>요구 수준: L{data.required}</div>
          {data.gap > 0 ? (
            <div style={{ color: '#000000', fontWeight: 'bold', marginTop: '4px' }}>성장 필요도: L{data.gap}</div>
          ) : (
            <div style={{ color: '#000000', fontWeight: 'bold', marginTop: '4px' }}>요구 충족 완료! ✨</div>
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
        <span className="badge badge-purple" style={{ textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          {selectedScenario === 'safe' ? (
            <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> 안전형</>
          ) : selectedScenario === 'challenge' ? (
            <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> 도전형</>
          ) : (
            <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 3h12M12 3v18"/></svg> T자형</>
          )}
        </span>
      </div>

      {/* Target Path Summary Cards */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-glass)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ flex: 1, minWidth: '200px', padding: '16px', margin: 0, textAlign: 'center', background: 'var(--bg-glass)', border: '1px solid var(--border-medium)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>현재 직무</div>
          <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{currentJob?.name || persona.currentJobName}</h4>
        </div>
        
        <div style={{ fontSize: '24px', color: 'var(--accent-cyan)' }}>→</div>
        
        <div className="glass-card" style={{ flex: 1, minWidth: '200px', padding: '16px', margin: 0, textAlign: 'center', background: 'rgba(0, 0, 0, 0.02)', border: '1.5px solid var(--text-primary)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>목표 직무</div>
          <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{targetJob?.name}</h4>
        </div>
      </div>

      {/* Transition Cost Summary */}
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--text-secondary)' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>예상 준비 기간</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {isSameBU ? '약 2.0년 ~ 2.5년' : '약 3.0년 ~ 3.5년'}
            </div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1.5px solid var(--text-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--text-primary)' }}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>미충족 스킬 갭</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {gapCount}개 역량
            </div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--text-secondary)' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>조직 이동 유형</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {isSameBU ? '동일 본부 내 이동' : '타 본부 간 전보'}
            </div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--text-secondary)' }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>목표 직무 트렌드</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {targetJob?.growthTrend === 'growing' ? '↑ 성장 (인력 수요 증가)' : '→ 안정 (유지)'}
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
              <div className="card-subtitle">내 역량 수준(Jet Black) vs 직무 요구 수준(Silver Gray)</div>
            </div>
          </div>

          <div style={{ width: '100%', height: '320px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={gapData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
              >
                <XAxis type="number" domain={[0, 5]} tickCount={6} stroke="var(--border-medium)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" stroke="var(--border-medium)" tick={{ fill: 'var(--text-primary)', fontSize: 11 }} width={90} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
                
                {/* 현재 보유 수준 */}
                <Bar dataKey="current" fill="#000000" radius={[0, 4, 4, 0]} barSize={12}>
                  {gapData.map((entry, index) => (
                    <Cell key={`cell-curr-${index}`} fill={entry.gap > 0 ? '#1f2937' : '#000000'} />
                  ))}
                </Bar>
                
                {/* 갭 필요 수준 */}
                <Bar dataKey="gap" fill="#e5e7eb" radius={[0, 4, 4, 0]} barSize={12} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '16px', fontSize: 'var(--font-size-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#000000', borderRadius: '2px', display: 'inline-block' }}></span>
              <span>현재 역량 레벨</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#e5e7eb', border: '1px solid var(--border-medium)', borderRadius: '2px', display: 'inline-block' }}></span>
              <span>성장 필요분 (Gap)</span>
            </div>
          </div>
        </div>

        {/* Right Card: Opportunity Tips */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 className="card-title">성장 가이드</h3>
            <div className="card-subtitle">역량 격차 극복을 위한 분석 팁</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
            {gapCount > 0 ? (
              gapData.map(d => {
                if (d.gap <= 0) return null
                return (
                  <div key={d.id} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{d.name}</span>
                      <span className="badge badge-warning" style={{ fontSize: '9px', padding: '1px 6px', background: 'rgba(0,0,0,0.04)', color: 'var(--text-secondary)', border: '1px solid var(--border-medium)' }}>
                        Gap: L{d.gap}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      현재 수준은 <strong>{levelNames[d.current] || '미보유'}</strong> 이며, 직무 수행을 위해서는 <strong>{levelNames[d.required]}</strong> 수준의 숙련도가 요구됩니다.
                    </p>
                  </div>
                )
              })
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-primary)', fontWeight: 'bold', padding: '40px 0', fontSize: 'var(--font-size-sm)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px auto', display: 'block', color: 'var(--text-secondary)' }}><polyline points="20 6 9 17 4 12"/></svg>
                역량 기준 충족 완료 <br />
                목표 직무가 요구하는 핵심 역량을 모두 충분히 충족하고 있습니다. <br />
                인사이동 신청 또는 면접 기회를 선제적으로 확인해 보세요.
              </div>
            )}
          </div>

          <div style={{ background: 'var(--bg-glass)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '10px', color: 'var(--text-secondary)' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              역량 성숙도 레벨 정보
            </strong>
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
              <div key={index} className="action-card" style={{ height: '100%', margin: 0, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch', border: '1px solid var(--border-medium)', background: 'var(--bg-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.05)',
                    color: 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {res.type === '사내교육' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                    ) : res.type === '외부강의' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '8px', padding: '1px 6px', display: 'inline-block' }}>{res.skillName} 연계</span>
                      <span style={{ fontSize: '8px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.05)', padding: '1px 4px', borderRadius: '4px' }}>
                        {res.type}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '13px', margin: 0, fontWeight: 'bold', color: 'var(--text-primary)' }}>{res.title}</h4>
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{res.provider} • {res.duration}</div>
                    {res.description && (
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
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
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px', fontSize: 'var(--font-size-xs)' }}>
            매칭된 스킬 갭이 없거나 즉시 추천할 리소스가 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
