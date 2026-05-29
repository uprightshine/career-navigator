import { useState, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CytoscapeComponent from 'react-cytoscapejs'
import { usePersona } from '../App'
import { JOB_NODES, ORG_LEVEL_MOVEMENTS, toCytoscapeElements, getScenarioRecommendations } from '../data/careerData'
import CareerLadderView from '../components/CareerLadderView'
import LgeSlideRoadmapView from '../components/LgeSlideRoadmapView'

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
  const { persona, selectedScenario, setSelectedScenario, setTargetJobId, dataMode } = usePersona()
  const navigate = useNavigate()
  const [selectedNode, setSelectedNode]         = useState(null)
  const [viewMode, setViewMode]                 = useState('ladder') // 'network' | 'ladder'
  const cyRef = useRef(null)

  const handleSelectTarget = (jobId) => {
    setTargetJobId(jobId)
    navigate('/skill-gap')
  }

  const currentJob = JOB_NODES[persona.currentJobId]
  const currentFamily = currentJob?.family
  const familyTotalCount = useMemo(() => {
    return Object.values(JOB_NODES)
      .filter(j => j.family === currentFamily)
      .reduce((sum, j) => sum + (j.headcount || 0), 0)
  }, [currentFamily])

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
    <div className="graph-page-layout" style={{ gridTemplateColumns: viewMode === 'slide' ? '1fr' : '260px 1fr 300px' }}>
      {/* Top Controls */}
      <div className="graph-controls">
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)' }}>Career Graph</h2>
          <div className="card-subtitle">
            {persona.name} 님의 현재 위치 기준 실시간 인사 이동 패턴 분석
          </div>
        </div>

        {/* 뷰 전환 토글 (사다리 로드맵 vs 네트워크 지도 vs LGE 슬라이드형) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-tertiary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>시각화 뷰 선택</span>
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
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
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
                성장 로드맵 (사다리)
              </button>
              <button
                onClick={() => setViewMode('network')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
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
                이동 네트워크 (지도)
              </button>
              <button
                onClick={() => setViewMode('slide')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: viewMode === 'slide' ? '#000' : 'transparent',
                  color: viewMode === 'slide' ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="9" y1="9" x2="21" y2="9" />
                </svg>
                LGE 슬라이드형 (PPT)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 지능형 통합 뷰 가이드 배너 */}
      <div style={{
        gridColumn: '1 / -1',
        background: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '10px 16px',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backdropFilter: 'blur(8px)',
        marginBottom: '-8px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <span style={{ fontSize: '14px' }}>💡</span>
        <span>
          {viewMode === 'ladder' && (
            <>
              <strong>사다리 로드맵 뷰:</strong> 목표 지점까지의 최적 검증 경로를 세로형 성장 사다리 형태로 입체 분석하여 통계와 연차별 소요 기한을 직관적으로 확인합니다.
            </>
          )}
          {viewMode === 'network' && (
            <>
              <strong>이동 네트워크 지도 뷰:</strong> 소속 직군 선배들의 실제 인사 전보 및 부서 이동 데이터 흐름을 가로형 네트워크 지도 위에 전체적으로 시각화하여 탐색합니다.
            </>
          )}
          {viewMode === 'slide' && (
            <>
              <strong>LGE 슬라이드형 로드맵 뷰:</strong> LGE 핵심인재 육성 장표 형식에 최적화된 양식입니다. 텍스트 박스를 직접 클릭하여 내용을 편집하고, [PDF 다운로드/슬라이드 인쇄] 버튼으로 1페이지 가로형 보고 문서를 완성해 부서장 면담에 바로 활용할 수 있습니다.
            </>
          )}
        </span>
      </div>

      {/* Left Panel: Profile & Legends */}
      {viewMode !== 'slide' && (
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
      )}

      {/* Center: Graph Canvas or Ladder View or LGE Slide View */}
      <div className="graph-canvas" style={{
        background: viewMode === 'slide' ? 'transparent' : viewMode === 'ladder' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)',
        position: 'relative',
        overflow: viewMode === 'network' ? 'hidden' : 'auto',
        padding: viewMode === 'slide' ? '0' : viewMode === 'ladder' ? '20px 16px' : '0',
        border: viewMode === 'slide' ? 'none' : '1px solid var(--border-subtle)',
      }}>
        {viewMode === 'slide' ? (
          <LgeSlideRoadmapView
            persona={persona}
          />
        ) : viewMode === 'ladder' ? (
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
      {viewMode !== 'slide' && (
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
              <h3 className="card-title" style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🧭</span> 3대 성장 시나리오 선택
              </h3>
              <div className="card-subtitle">내 전문성과 성장에 적합한 시나리오 분석</div>
            </div>
            
            {/* 시나리오-뷰 연동 가이드 배너 */}
            <div style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '10.5px',
              color: 'var(--text-secondary)',
              lineHeight: '1.45',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
            }}>
              <span style={{ fontSize: '12px', marginTop: '1px' }}>✨</span>
              <span>시나리오를 선택하시면 좌측 <strong>성장 로드맵 및 네트워크 지도</strong>가 즉시 연동됩니다.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
              {recommendations && (() => {
                const safeMovers = recommendations.safe.similarPeopleCount || 34;
                const safeRatio = ((safeMovers / familyTotalCount) * 100).toFixed(1);
                const isSafeActive = selectedScenario === 'safe';

                const challengeMovers = recommendations.challenge.similarPeopleCount || 47;
                const challengeRatio = ((challengeMovers / familyTotalCount) * 100).toFixed(1);
                const isChallengeActive = selectedScenario === 'challenge';

                const tTarget = recommendations['T자형'] || recommendations.tShape || recommendations.t_shape;
                const tMovers = tTarget ? tTarget.similarPeopleCount : 113;
                const tRatio = ((tMovers / familyTotalCount) * 100).toFixed(1);
                const isTActive = selectedScenario === 't-shape';

                return (
                  <>
                    {/* 직무심화형 */}
                    <div 
                      className="action-card" 
                      onClick={() => { setSelectedScenario('safe'); setSelectedNode(null); }}
                      style={{ 
                        borderLeft: '4px solid var(--scenario-safe)', 
                        padding: '14px', 
                        cursor: 'pointer',
                        background: isSafeActive ? '#ffffff' : 'rgba(0,0,0,0.01)',
                        border: isSafeActive ? '2px solid var(--scenario-safe)' : '1px solid var(--border-subtle)',
                        borderLeftWidth: '4px',
                        borderRadius: '12px',
                        boxShadow: isSafeActive ? '0 6px 15px rgba(5,150,105,0.12)' : 'none',
                        transform: isSafeActive ? 'scale(1.01)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div className="action-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--scenario-safe)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            직무심화형 {isSafeActive && <span style={{ fontSize: '9px', background: 'var(--scenario-safe)', color: '#fff', padding: '1px 5px', borderRadius: '4px', marginLeft: '4px' }}>선택됨</span>}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(0,0,0,0.06)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                              {recommendations.safe.orgLevelLabel || '사업부'}
                            </span>
                            <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 6px' }}>난이도: {recommendations.safe.difficulty}</span>
                          </div>
                        </div>
                        <h4 style={{ fontSize: '12.5px', fontWeight: 'bold', margin: '4px 0', color: 'var(--text-primary)' }}>{recommendations.safe.name}</h4>
                        <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)', margin: '4px 0', lineHeight: '1.45' }}>{recommendations.safe.description}</p>
                        
                        <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                          </svg>
                          경로 선택 사례: <strong>{currentFamily} 직군 {familyTotalCount.toLocaleString()}명 중 {safeMovers}명 ({safeRatio}%)</strong>
                        </div>

                        {/* 선택 시에만 분석 CTA 노출 */}
                        {isSafeActive && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSelectTarget(recommendations.safe.targetId); }}
                            className="btn btn-primary btn-sm"
                            style={{
                              width: '100%',
                              marginTop: '12px',
                              padding: '7px 0',
                              fontSize: '11px',
                              background: 'var(--scenario-safe)',
                              border: 'none',
                              color: '#fff',
                              boxShadow: '0 4px 10px rgba(5,150,105,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>📊</span> 이 경로로 역량 분석하기 →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 조직확장형 */}
                    <div 
                      className="action-card" 
                      onClick={() => { setSelectedScenario('challenge'); setSelectedNode(null); }}
                      style={{ 
                        borderLeft: '4px solid var(--scenario-challenge)', 
                        padding: '14px', 
                        cursor: 'pointer',
                        background: isChallengeActive ? '#ffffff' : 'rgba(0,0,0,0.01)',
                        border: isChallengeActive ? '2px solid var(--scenario-challenge)' : '1px solid var(--border-subtle)',
                        borderLeftWidth: '4px',
                        borderRadius: '12px',
                        boxShadow: isChallengeActive ? '0 6px 15px rgba(79,70,229,0.12)' : 'none',
                        transform: isChallengeActive ? 'scale(1.01)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div className="action-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--scenario-challenge)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                            </svg>
                            조직확장형 {isChallengeActive && <span style={{ fontSize: '9px', background: 'var(--scenario-challenge)', color: '#fff', padding: '1px 5px', borderRadius: '4px', marginLeft: '4px' }}>선택됨</span>}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: 'bold' }}>
                              {JOB_NODES[persona.currentJobId]?.orgLevelLabel || '사업부'} → {recommendations.challenge.orgLevelLabel || '본부'}
                            </span>
                            <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 6px' }}>난이도: {recommendations.challenge.difficulty}</span>
                          </div>
                        </div>
                        <h4 style={{ fontSize: '12.5px', fontWeight: 'bold', margin: '4px 0', color: 'var(--text-primary)' }}>{recommendations.challenge.name}</h4>
                        <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)', margin: '4px 0', lineHeight: '1.45' }}>{recommendations.challenge.description}</p>
                        
                        <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                          </svg>
                          경로 선택 사례: <strong>{currentFamily} 직군 {familyTotalCount.toLocaleString()}명 중 {challengeMovers}명 ({challengeRatio}%)</strong>
                        </div>

                        {/* 선택 시에만 분석 CTA 노출 */}
                        {isChallengeActive && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSelectTarget(recommendations.challenge.targetId); }}
                            className="btn btn-primary btn-sm"
                            style={{
                              width: '100%',
                              marginTop: '12px',
                              padding: '7px 0',
                              fontSize: '11px',
                              background: 'var(--scenario-challenge)',
                              border: 'none',
                              color: '#fff',
                              boxShadow: '0 4px 10px rgba(79,70,229,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>📊</span> 이 경로로 역량 분석하기 →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 복합확장형 */}
                    <div 
                      className="action-card" 
                      onClick={() => { setSelectedScenario('t-shape'); setSelectedNode(null); }}
                      style={{ 
                        borderLeft: '4px solid var(--scenario-t-shape)', 
                        padding: '14px', 
                        cursor: 'pointer',
                        background: isTActive ? '#ffffff' : 'rgba(0,0,0,0.01)',
                        border: isTActive ? '2px solid var(--scenario-t-shape)' : '1px solid var(--border-subtle)',
                        borderLeftWidth: '4px',
                        borderRadius: '12px',
                        boxShadow: isTActive ? '0 6px 15px rgba(139,92,246,0.12)' : 'none',
                        transform: isTActive ? 'scale(1.01)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div className="action-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--scenario-t-shape)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M8 6h8M12 6v12M6 10l6-4 6 4" />
                            </svg>
                            복합확장형 {isTActive && <span style={{ fontSize: '9px', background: 'var(--scenario-t-shape)', color: '#fff', padding: '1px 5px', borderRadius: '4px', marginLeft: '4px' }}>선택됨</span>}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', fontWeight: 'bold' }}>
                              직무+레벨 {tTarget?.orgLevelLabel || '본부'}
                            </span>
                            <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 6px' }}>난이도: {tTarget?.difficulty || '높음'}</span>
                          </div>
                        </div>
                        <h4 style={{ fontSize: '12.5px', fontWeight: 'bold', margin: '4px 0', color: 'var(--text-primary)' }}>{tTarget?.name || '복합 확장'}</h4>
                        <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)', margin: '4px 0', lineHeight: '1.45' }}>{tTarget?.description}</p>
                        
                        <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                          </svg>
                          경로 선택 사례: <strong>{currentFamily} 직군 {familyTotalCount.toLocaleString()}명 중 {tMovers}명 ({tRatio}%)</strong>
                        </div>

                        {/* 선택 시에만 분석 CTA 노출 */}
                        {isTActive && tTarget && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSelectTarget(tTarget.targetId); }}
                            className="btn btn-primary btn-sm"
                            style={{
                              width: '100%',
                              marginTop: '12px',
                              padding: '7px 0',
                              fontSize: '11px',
                              background: 'var(--scenario-t-shape)',
                              border: 'none',
                              color: '#fff',
                              boxShadow: '0 4px 10px rgba(139,92,246,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>📊</span> 이 경로로 역량 분석하기 →
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
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
      )}
    </div>
  )
}
