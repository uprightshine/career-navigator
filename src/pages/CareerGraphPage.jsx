import { useState, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CytoscapeComponent from 'react-cytoscapejs'
import { usePersona } from '../App'
import { JOB_NODES, ORG_LEVEL_MOVEMENTS, toCytoscapeElements, getScenarioRecommendations } from '../data/careerData'
import CareerLadderView from '../components/CareerLadderView'

// Cytoscape 스타일시트 (외부 격리를 통한 메모리/GC 및 렌더링 성능 최적화 - 프리미엄 블랙 & 화이트 모노크롬 테마 맞춤형 색조 적용)
const CYTOSCAPE_STYLESHEET = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'background-color': '#e5e7eb', // Silver Gray for normal nodes
      'color': '#000000',            // Pure black text
      'font-size': '11px',
      'width': 55,
      'height': 55,
      'border-width': 2,
      'border-color': 'rgba(0, 0, 0, 0.08)',
      'text-wrap': 'wrap',
      'text-max-width': '80px',
      'font-family': 'Inter, sans-serif',
      'overlay-opacity': 0,
    }
  },
  {
    selector: 'node[nodeType="current"]',
    style: {
      'background-color': '#000000', // Jet Black for current position
      'border-color': '#000000',
      'border-width': 4,
      'width': 70,
      'height': 70,
      'font-size': '12px',
      'font-weight': 'bold',
      'color': '#ffffff'            // High contrast white text
    }
  },
  {
    selector: 'node[nodeType="hub"]',
    style: {
      'background-color': '#1f2937', // Charcoal Gray for Hub node
      'border-color': '#374151',
      'border-width': 3,
      'width': 65,
      'height': 65,
      'font-size': '11px',
      'font-weight': 'bold',
      'color': '#ffffff'
    }
  },
  {
    selector: 'node[nodeType="leadership"]',
    style: {
      'background-color': '#4b5563', // Medium slate gray for Leadership diamond node
      'border-color': '#6b7280',
      'border-width': 3,
      'shape': 'diamond',
      'width': 65,
      'height': 65,
      'font-size': '11px',
      'font-weight': 'bold',
      'color': '#ffffff'
    }
  },
  {
    selector: 'node[nodeType="deadend"]',
    style: {
      'background-color': '#9ca3af', // Cool silver gray for deadend nodes
      'border-color': '#cbd5e1',
      'border-width': 2,
      'width': 50,
      'height': 50,
      'font-size': '10px',
      'color': '#000000'
    }
  },
  {
    selector: ':parent',
    style: {
      'background-opacity': 0.04,
      'background-color': '#000000',
      'border-width': 1.5,
      'border-color': 'rgba(0, 0, 0, 0.12)',
      'border-style': 'dashed',
      'label': 'data(label)',
      'text-valign': 'top',
      'text-halign': 'center',
      'font-size': '12px',
      'font-weight': 'bold',
      'color': '#1f2937',
      'padding': '18px',
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 'data(width)',
      'line-color': 'rgba(0, 0, 0, 0.15)', // Premium charcoal edge lines
      'target-arrow-color': 'rgba(0, 0, 0, 0.22)',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'arrow-scale': 0.8,
      'overlay-opacity': 0,
    }
  }
]

// Cytoscape cose 레이아웃 설정 (외부 격리를 통한 메모리/GC 및 렌더링 성능 최적화)
const CYTOSCAPE_LAYOUT = {
  name: 'cose',
  animate: true,
  animationDuration: 400,
  nodeRepulsion: 6500,
  idealEdgeLength: 100,
  nodeOverlap: 20,
  refresh: 20,
  fit: true,
  padding: 30,
}

export default function CareerGraphPage() {
  const { persona, selectedScenario, setSelectedScenario, setTargetJobId } = usePersona()
  const navigate = useNavigate()
  const [selectedNode, setSelectedNode]         = useState(null)
  const [viewMode, setViewMode]                 = useState('ladder') // 'network' | 'ladder'
  const cyRef = useRef(null)

  const handleSelectTarget = (jobId) => {
    setTargetJobId(jobId)
    navigate('/skill-gap')
  }

  const currentJob = JOB_NODES[persona.currentJobId]

  // 시나리오별 추천
  const recommendations = getScenarioRecommendations(persona.currentJobId)

  // Cytoscape 요소 생성
  const elements = useMemo(() => {
    return toCytoscapeElements(persona.currentJobId, selectedScenario)
  }, [persona.currentJobId, selectedScenario])

  // Cytoscape 초기화 콜백
  const handleCyInit = useCallback((cy) => {
    cyRef.current = cy
    cy.on('tap', 'node', (evt) => {
      const node = evt.target
      if (node.isParent()) {
        setSelectedNode(null)
        return
      }
      setSelectedNode(evt.target.data())
    })
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null)
      }
    })
  }, [])

  // 물리 조작 버튼용 Zoom/Pan API 핸들러
  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2)
    }
  }

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8)
    }
  }

  const handleFitView = () => {
    if (cyRef.current) {
      cyRef.current.fit()
      cyRef.current.center()
    }
  }

  const scenarioLabel = selectedScenario === 'safe' 
    ? '직무심화형' 
    : selectedScenario === 'challenge' 
    ? '조직확장형' 
    : '복합확장형'

  const targetForScenario = recommendations
    ? selectedScenario === 'safe'
      ? recommendations.safe
      : selectedScenario === 'challenge'
      ? recommendations.challenge
      : (recommendations['T자형'] || recommendations.t_shape)
    : null;
  const targetJobName = targetForScenario ? targetForScenario.name : '다음 단계 직무';

  return (
    <div className="graph-page-layout">
      {/* Top Controls */}
      <div className="graph-controls">
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)' }}>Career Graph</h2>
          <div className="card-subtitle">
            {persona.name} 님의 현재 위치 기준 실시간 인사 이동 패턴 분석
          </div>
        </div>

        {/* 2축 커리어 맵 시나리오 조절 + 뷰 전환 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="scenario-toggle">
            <button 
              className={`scenario-btn ${selectedScenario === 'safe' ? 'active-safe' : ''}`}
              onClick={() => { setSelectedScenario('safe'); setSelectedNode(null); }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '6px' }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              직무심화
            </button>
            <button 
              className={`scenario-btn ${selectedScenario === 'challenge' ? 'active-challenge' : ''}`}
              onClick={() => { setSelectedScenario('challenge'); setSelectedNode(null); }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '6px' }}>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
              조직확장
            </button>
            <button 
              className={`scenario-btn ${selectedScenario === 't-shape' ? 'active-t-shape' : ''}`}
              onClick={() => { setSelectedScenario('t-shape'); setSelectedNode(null); }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '6px' }}>
                <path d="M8 6h8M12 6v12M6 10l6-4 6 4" />
              </svg>
              복합확장
            </button>
          </div>

          {/* 뷰 전환 토글 */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.05)',
            borderRadius: '8px',
            padding: '3px',
            gap: '2px',
          }}>
            <button
              onClick={() => setViewMode('ladder')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: viewMode === 'ladder' ? '#000' : 'transparent',
                color: viewMode === 'ladder' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              사다리 뷰
            </button>
            <button
              onClick={() => setViewMode('network')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: viewMode === 'network' ? '#000' : 'transparent',
                color: viewMode === 'network' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              네트워크 뷰
            </button>
          </div>
        </div>
      </div>

      {/* Left Panel: Profile & Legends */}
      <div className="graph-left-panel">
        {/* Chronological Career Timeline Card */}
        <div className="glass-card">
          <div className="persona-info" style={{ marginBottom: '16px' }}>
            <div className="persona-avatar">
              {persona.name[0]}
            </div>
            <div className="persona-details">
              <div className="persona-name">{persona.name}</div>
              <div className="persona-role">{persona.department} • {persona.grade}</div>
            </div>
          </div>
          
          <h4 className="card-title" style={{ fontSize: 'var(--font-size-xs)', marginBottom: '12px', color: 'var(--text-secondary)' }}>나의 커리어 히스토리 & 미래 궤적</h4>
          
          <div className="career-timeline" style={{ paddingLeft: '8px', borderLeft: '1.5px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {/* Step 1: 입사 */}
            <div className="timeline-item" style={{ position: 'relative', paddingLeft: '16px' }}>
              <div className="timeline-dot" style={{
                position: 'absolute',
                left: '-21px',
                top: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--text-tertiary)',
                border: '2px solid #ffffff'
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{persona.joinYear}년 입사</span>
                <span className="badge" style={{ fontSize: '8px', padding: '1px 5px', background: 'rgba(0,0,0,0.04)', color: 'var(--text-secondary)' }}>기초 빌드업</span>
              </div>
              <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45', wordBreak: 'keep-all' }}>
                <strong>{persona.currentJobName}</strong> 사원으로 {persona.department}에 첫발을 내디디며 실무 기초 및 프로세스를 튼튼히 학습하였습니다.
              </p>
            </div>

            {/* Step 2: 승진 및 기여 */}
            <div className="timeline-item" style={{ position: 'relative', paddingLeft: '16px' }}>
              <div className="timeline-dot" style={{
                position: 'absolute',
                left: '-21px',
                top: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--text-secondary)',
                border: '2px solid #ffffff'
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {persona.joinYear + Math.max(1, Math.floor(persona.totalYears / 2))}년 승진
                </span>
                <span className="badge" style={{ fontSize: '8px', padding: '1px 5px', background: 'rgba(0,0,0,0.04)', color: 'var(--text-secondary)' }}>역량 입증</span>
              </div>
              <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45', wordBreak: 'keep-all' }}>
                뛰어난 성과로 <strong>{persona.grade}</strong> 승진을 달성하였고, 3개년 연속 우수 평가인 <strong>{persona.evaluationGrade}등급</strong>을 기록하며 {persona.primarySkill} 핵심 기여자로 자리 잡았습니다.
              </p>
            </div>

            {/* Step 3: 현재 & 미래 도약 */}
            <div className="timeline-item" style={{ position: 'relative', paddingLeft: '16px' }}>
              <div className="timeline-dot" style={{
                position: 'absolute',
                left: '-22px',
                top: '3px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#000000',
                border: '2px solid #ffffff',
                boxShadow: '0 0 6px rgba(0, 0, 0, 0.2)'
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#000000' }}>현재 (경력 {persona.totalYears}년차)</span>
                <span className="badge badge-cyan" style={{ fontSize: '8px', padding: '1.5px 5.5px', background: '#000000', color: '#ffffff', fontWeight: 'bold' }}>다음 칸 도약</span>
              </div>
              <p style={{ fontSize: '10.5px', color: 'var(--text-primary)', margin: 0, lineHeight: '1.45', fontWeight: '500', wordBreak: 'keep-all' }}>
                그간 쌓아온 전문성(<strong>주특기: {persona.primarySkill}</strong>)을 무기 삼아, <strong>{scenarioLabel} 시나리오</strong>의 목표인 <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px', fontWeight: 'bold' }}>{targetJobName}</span> 직무로의 전환을 바로 목전에 두고 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 노드 구분 범례: 오직 복잡한 '네트워크 뷰'에서 노드 색상 해석이 필요할 때만 노출되도록 지능형 조건부 렌더링 적용 (사다리 뷰 진입 시 자동 격리되어 공간 극대화) */}
        {viewMode === 'network' && (
          <div className="glass-card">
            <h4 className="card-title" style={{ fontSize: 'var(--font-size-sm)', marginBottom: '12px' }}>노드 구분 범례</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#000000', display: 'inline-block' }}></span>
                <span>현재 위치 (내 직무)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1f2937', display: 'inline-block' }}></span>
                <span>허브 직무 (이동 활발)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#4b5563', display: 'inline-block', transform: 'rotate(45deg)' }}></span>
                <span>리더십 트랙 (관리자 육성)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#9ca3af', display: 'inline-block' }}></span>
                <span>이동 사례 적음 (고립 영역)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e5e7eb', border: '1px solid rgba(0,0,0,0.05)', display: 'inline-block' }}></span>
                <span>일반 직무</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center: Graph Canvas or Ladder View */}
      <div className="graph-canvas" style={{
        background: viewMode === 'ladder' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)',
        position: 'relative',
        overflow: viewMode === 'ladder' ? 'auto' : 'hidden',
        padding: viewMode === 'ladder' ? '20px 16px' : '0',
      }}>
        {viewMode === 'ladder' ? (
          <CareerLadderView
            persona={persona}
            recommendations={recommendations}
            selectedScenario={selectedScenario}
          />
        ) : (
          <>
            <CytoscapeComponent
              key={`${persona.currentJobId}-${selectedScenario}`}
              elements={elements}
              stylesheet={CYTOSCAPE_STYLESHEET}
              layout={CYTOSCAPE_LAYOUT}
              style={{ width: '100%', height: '100%' }}
              cy={handleCyInit}
            />
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 10
        }}>
          <button
            onClick={handleZoomIn}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast) ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'scale(1)'; }}
            title="확대"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast) ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'scale(1)'; }}
            title="축소"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            onClick={handleFitView}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast) ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'scale(1)'; }}
            title="화면 맞춤"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
        </div>

        <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(255, 255, 255, 0.75)', padding: '6px 12px', borderRadius: '4px', fontSize: '10px', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', pointerEvents: 'none', boxShadow: 'var(--shadow-sm)', backdropFilter: 'blur(4px)' }}>
          * 노드를 마우스로 드래그하여 배치 조절 가능 / 직무 노드 탭하여 상세 정보 확인
        </div>
          </>
        )}
      </div>

      {/* Right Panel: Detail or Recommendations */}
      <div className="graph-right-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {selectedNode ? (
          <div className="glass-card glow-cyan" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-cyan">{selectedNode.family} 직무군</span>
                {selectedNode.isHub && <span className="badge badge-safe" style={{ display: 'inline-flex', alignItems: 'center' }}>허브</span>}
                {selectedNode.isLeadership && <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center' }}>리더십</span>}
                {selectedNode.isDeadEnd && (
                  <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '3px' }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    이동협소
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '8px' }}>{selectedNode.label}</h3>
              <p className="text-secondary" style={{ fontSize: 'var(--font-size-xs)', marginBottom: '20px', lineHeight: '1.4' }}>
                {selectedNode.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-glass)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>사내 인원</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedNode.headcount}명</div>
                </div>
                <div style={{ background: 'var(--bg-glass)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>평균 재임</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedNode.avgTenure}년</div>
                </div>
                <div style={{ background: 'var(--bg-glass)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>현재 공석</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{selectedNode.vacancies}개</div>
                </div>
                <div style={{ background: 'var(--bg-glass)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>시장 트렌드</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', color: selectedNode.growthTrend === 'growing' ? '#10b981' : selectedNode.growthTrend === 'stable' ? '#f59e0b' : '#ef4444' }}>
                    {selectedNode.growthTrend === 'growing' ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '4px' }}>
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                        </svg>
                        성장세
                      </>
                    ) : selectedNode.growthTrend === 'stable' ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '4px' }}>
                          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                        유지
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '4px' }}>
                          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
                        </svg>
                        축소세
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {selectedNode.id !== persona.currentJobId ? (
              <button 
                className="btn btn-primary" 
                onClick={() => handleSelectTarget(selectedNode.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '6px' }}>
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                </svg>
                이 직무를 목표로 설정
              </button>
            ) : (
              <div style={{ textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--accent-cyan)', fontWeight: 'bold', padding: '10px', background: 'rgba(0,0,0,0.04)', borderRadius: '6px' }}>
                현재 나의 직무입니다
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 className="card-title" style={{ fontSize: 'var(--font-size-sm)' }}>추천 커리어 시나리오</h3>
              <div className="card-subtitle">선택한 시나리오에 따른 맞춤 캡</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
              {recommendations && (
                <>
                  {/* 직무심화형 */}
                  <div 
                    className="action-card" 
                    onClick={() => { setSelectedScenario('safe'); handleSelectTarget(recommendations.safe.targetId); }}
                    style={{ borderLeft: '3px solid var(--scenario-safe)', padding: '12px', cursor: 'pointer' }}
                  >
                    <div className="action-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--scenario-safe)', display: 'flex', alignItems: 'center' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '4px' }}>
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          직무심화형
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(0,0,0,0.06)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                            {recommendations.safe.orgLevelLabel || '사업부'}
                          </span>
                          <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 6px' }}>난이도: {recommendations.safe.difficulty}</span>
                        </div>
                      </div>
                      <h4 style={{ fontSize: '12px', margin: '2px 0' }}>{recommendations.safe.name}</h4>
                      <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '2px 0' }}>{recommendations.safe.description}</p>
                      {recommendations.safe.similarPeopleCount > 0 && (
                        <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'flex', alignItems: 'center' }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '3px' }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          동일 경로 선택 실제 {recommendations.safe.similarPeopleCount}명
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 조직확장형 */}
                  <div 
                    className="action-card" 
                    onClick={() => { setSelectedScenario('challenge'); handleSelectTarget(recommendations.challenge.targetId); }}
                    style={{ borderLeft: '3px solid var(--scenario-challenge)', padding: '12px', cursor: 'pointer' }}
                  >
                    <div className="action-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--scenario-challenge)', display: 'flex', alignItems: 'center' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '4px' }}>
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                          </svg>
                          조직확장형
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: 'bold' }}>
                            {JOB_NODES[persona.currentJobId]?.orgLevelLabel || '사업부'} → {recommendations.challenge.orgLevelLabel || '본부'}
                          </span>
                          <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 6px' }}>난이도: {recommendations.challenge.difficulty}</span>
                        </div>
                      </div>
                      <h4 style={{ fontSize: '12px', margin: '2px 0' }}>{recommendations.challenge.name}</h4>
                      <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '2px 0' }}>{recommendations.challenge.description}</p>
                      {recommendations.challenge.similarPeopleCount > 0 && (
                        <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'flex', alignItems: 'center' }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '3px' }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          동일 레벨 이동 실제 {recommendations.challenge.similarPeopleCount}명
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 복합확장형 */}
                  <div 
                    className="action-card" 
                    onClick={() => { setSelectedScenario('t-shape'); handleSelectTarget((recommendations['T자형'] || recommendations.tShape || recommendations.t_shape).targetId); }}
                    style={{ borderLeft: '3px solid var(--scenario-t-shape)', padding: '12px', cursor: 'pointer' }}
                  >
                    <div className="action-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--scenario-t-shape)', display: 'flex', alignItems: 'center' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '4px' }}>
                            <path d="M8 6h8M12 6v12M6 10l6-4 6 4" />
                          </svg>
                          복합확장형
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', fontWeight: 'bold' }}>
                            직무+레벨 {(recommendations['T자형'] || recommendations.tShape)?.orgLevelLabel || '본부'}
                          </span>
                          <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 6px' }}>난이도: {(recommendations['T자형'] || recommendations.tShape)?.difficulty}</span>
                        </div>
                      </div>
                      <h4 style={{ fontSize: '12px', margin: '2px 0' }}>{(recommendations['T자형'] || recommendations.tShape)?.name}</h4>
                      <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '2px 0' }}>{(recommendations['T자형'] || recommendations.tShape)?.description}</p>
                      {((recommendations['T자형'] || recommendations.tShape)?.similarPeopleCount > 0) && (
                        <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'flex', alignItems: 'center' }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '3px' }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          복합 확장 실제 {(recommendations['T자형'] || recommendations.tShape)?.similarPeopleCount}명
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', background: 'var(--bg-glass)', padding: '8px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: '6px' }}>
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                <line x1="9" y1="18" x2="15" y2="18" />
                <line x1="10" y1="22" x2="14" y2="22" />
              </svg>
              좌측 네트워크 맵에서 직무 노드를 직접 탭하여 정보를 볼 수도 있습니다.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
