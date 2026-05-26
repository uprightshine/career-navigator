import { useState, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CytoscapeComponent from 'react-cytoscapejs'
import { usePersona } from '../App'
import { JOB_NODES, toCytoscapeElements, getScenarioRecommendations } from '../data/careerData'

// Cytoscape 스타일시트 (외부 격리를 통한 메모리/GC 및 렌더링 성능 최적화 - 프리미엄 화이트 테마 맞춤형 색조 적용)
const CYTOSCAPE_STYLESHEET = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'background-color': '#cbd5e1', // Slate-300: Soft gray in light mode
      'color': '#0f172a',            // Slate-900: Deep slate text
      'font-size': '11px',
      'width': 55,
      'height': 55,
      'border-width': 2,
      'border-color': 'rgba(0, 0, 0, 0.06)',
      'text-wrap': 'wrap',
      'text-max-width': '80px',
      'font-family': 'Inter, sans-serif',
      'overlay-opacity': 0,
    }
  },
  {
    selector: 'node[nodeType="current"]',
    style: {
      'background-color': '#0891b2', // Deeper cyan for contrast
      'border-color': '#22d3ee',
      'border-width': 4,
      'width': 70,
      'height': 70,
      'font-size': '12px',
      'font-weight': 'bold',
      'color': '#ffffff'            // High contrast text inside node
    }
  },
  {
    selector: 'node[nodeType="hub"]',
    style: {
      'background-color': '#10b981', // Emerald-500
      'border-color': '#6ee7b7',
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
      'background-color': '#3b82f6', // Blue-500
      'border-color': '#93c5fd',
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
      'background-color': '#ef4444', // Red-500
      'border-color': '#fca5a5',
      'border-width': 2,
      'width': 50,
      'height': 50,
      'font-size': '10px',
      'color': '#ffffff'
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 'data(width)',
      'line-color': 'rgba(15, 23, 42, 0.12)', // Soft dark slate edge line
      'target-arrow-color': 'rgba(15, 23, 42, 0.18)',
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
  const [selectedNode, setSelectedNode] = useState(null)
  const navigate = useNavigate()

  const currentJob = JOB_NODES[persona.currentJobId]

  // 시나리오별 추천
  const recommendations = getScenarioRecommendations(persona.currentJobId)

  // Cytoscape 요소 생성
  const elements = useMemo(() => {
    return toCytoscapeElements(persona.currentJobId, selectedScenario)
  }, [persona.currentJobId, selectedScenario])


  const cyRef = useRef(null)

  // Cytoscape 초기화 콜백
  const handleCyInit = useCallback((cy) => {
    cyRef.current = cy
    cy.on('tap', 'node', (evt) => {
      const node = evt.target
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

  const handleSelectTarget = (jobId) => {
    setTargetJobId(jobId)
    navigate('/skill-gap')
  }

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

        {/* 시나리오 조절 */}
        <div className="scenario-toggle">
          <button 
            className={`scenario-btn ${selectedScenario === 'safe' ? 'active-safe' : ''}`}
            onClick={() => { setSelectedScenario('safe'); setSelectedNode(null); }}
          >
            🛡️ 안전형
          </button>
          <button 
            className={`scenario-btn ${selectedScenario === 'challenge' ? 'active-challenge' : ''}`}
            onClick={() => { setSelectedScenario('challenge'); setSelectedNode(null); }}
          >
            🔥 도전형
          </button>
          <button 
            className={`scenario-btn ${selectedScenario === 't-shape' ? 'active-t-shape' : ''}`}
            onClick={() => { setSelectedScenario('t-shape'); setSelectedNode(null); }}
          >
            🔀 T자형
          </button>
        </div>
      </div>

      {/* Left Panel: Profile & Legends */}
      <div className="graph-left-panel">
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
              <span className="text-secondary">현재 직무:</span>
              <span style={{ fontWeight: '600' }}>{currentJob?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
              <span className="text-secondary">보유 주특기:</span>
              <span style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>{persona.primarySkill}</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="glass-card">
          <h4 className="card-title" style={{ fontSize: 'var(--font-size-sm)', marginBottom: '12px' }}>노드 구분 범례</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#06b6d4', display: 'inline-block' }}></span>
              <span>현재 위치 (내 직무)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }}></span>
              <span>허브 직무 (이동 활발)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block', transform: 'rotate(45deg)' }}></span>
              <span>리더십 트랙 (관리자 육성)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'inline-block' }}></span>
              <span>이동 사례 적음 (고립 영역)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-block' }}></span>
              <span>일반 직무</span>
            </div>
          </div>
        </div>

        {/* Scenario description */}
        <div className="glass-card glow-cyan" style={{ fontSize: 'var(--font-size-xs)' }}>
          <h4 className="card-title" style={{ fontSize: 'var(--font-size-sm)', marginBottom: '8px' }}>
            {selectedScenario === 'safe' ? '🛡️ 안전형 시나리오' : selectedScenario === 'challenge' ? '🔥 도전형 시나리오' : '🔀 T자형 시나리오'}
          </h4>
          <p className="text-secondary" style={{ lineHeight: '1.4' }}>
            {selectedScenario === 'safe' 
              ? '동일 직무군(본부) 내부에서 가장 빈번하고 안전한 이동 패턴을 중심으로 보여줍니다. 리스크를 줄이고 점진적으로 전문성을 쌓기에 적합합니다.'
              : selectedScenario === 'challenge'
              ? '조직 장벽이나 직무군 한계를 뛰어넘어, 사내외 크로스 도메인 이동 사례 및 도전적인 신생 직무 매핑 경로를 포함합니다.'
              : '자신의 딥 스킬(Deep Skill)을 타 직무에 이식하기 쉬운 "허브 직무(Hub Job)"를 경유해, 다재다능한 제너럴리스트 또는 리더십 트랙으로 연결하는 다층 경로입니다.'}
          </p>
        </div>
      </div>

      {/* Center Graph Canvas */}
      <div className="graph-canvas" style={{ background: 'rgba(255, 255, 255, 0.35)', position: 'relative', overflow: 'hidden' }}>
        <CytoscapeComponent
          key={`${persona.currentJobId}-${selectedScenario}`}
          elements={elements}
          stylesheet={CYTOSCAPE_STYLESHEET}
          layout={CYTOSCAPE_LAYOUT}
          style={{ width: '100%', height: '100%' }}
          cy={handleCyInit}
        />
        
        {/* Floating Zoom / Pan Controls (➕, ➖, 🔄) - 프리미엄 아크릴릭 프로스트 플로팅 버튼 */}
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
              fontSize: '13px',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast) ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'scale(1)'; }}
            title="확대"
          >
            ➕
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
              fontSize: '13px',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast) ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'scale(1)'; }}
            title="축소"
          >
            ➖
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
              fontSize: '13px',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast) ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'scale(1)'; }}
            title="화면 맞춤"
          >
            🔄
          </button>
        </div>

        <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(255, 255, 255, 0.75)', padding: '6px 12px', borderRadius: '4px', fontSize: '10px', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', pointerEvents: 'none', boxShadow: 'var(--shadow-sm)', backdropFilter: 'blur(4px)' }}>
          * 노드를 마우스로 드래그하여 배치 조절 가능 / 직무 노드 탭하여 상세 정보 확인
        </div>
      </div>

      {/* Right Panel: Detail or Recommendations */}
      <div className="graph-right-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {selectedNode ? (
          <div className="glass-card glow-cyan" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-cyan">{selectedNode.family} 직무군</span>
                {selectedNode.isHub && <span className="badge badge-safe">🔥 허브</span>}
                {selectedNode.isLeadership && <span className="badge badge-purple">💎 리더십</span>}
                {selectedNode.isDeadEnd && <span className="badge badge-danger">⚠️ 이동사례 협소</span>}
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
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: selectedNode.growthTrend === 'growing' ? '#34d399' : selectedNode.growthTrend === 'stable' ? '#f59e0b' : '#f87171' }}>
                    {selectedNode.growthTrend === 'growing' ? '📈 성장세' : selectedNode.growthTrend === 'stable' ? '➡️ 유지' : '📉 축소세'}
                  </div>
                </div>
              </div>
            </div>

            {selectedNode.id !== persona.currentJobId ? (
              <button 
                className="btn btn-primary" 
                onClick={() => handleSelectTarget(selectedNode.id)}
                style={{ width: '100%' }}
              >
                이 직무를 목표로 설정 🎯
              </button>
            ) : (
              <div style={{ textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--accent-cyan)', fontWeight: 'bold', padding: '10px', background: 'rgba(6,182,212,0.08)', borderRadius: '6px' }}>
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
                  {/* 안전형 */}
                  <div 
                    className="action-card" 
                    onClick={() => { setSelectedScenario('safe'); handleSelectTarget(recommendations.safe.targetId); }}
                    style={{ borderLeft: '3px solid #34d399', padding: '12px' }}
                  >
                    <div className="action-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#34d399' }}>🛡️ 안전형 추천</span>
                        <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 6px' }}>난이도: {recommendations.safe.difficulty}</span>
                      </div>
                      <h4 style={{ fontSize: '12px', margin: '4px 0 2px 0' }}>{recommendations.safe.name}</h4>
                      <p style={{ fontSize: '10px', color: '#94a3b8' }}>{recommendations.safe.description}</p>
                    </div>
                  </div>

                  {/* 도전형 */}
                  <div 
                    className="action-card" 
                    onClick={() => { setSelectedScenario('challenge'); handleSelectTarget(recommendations.challenge.targetId); }}
                    style={{ borderLeft: '3px solid #f59e0b', padding: '12px' }}
                  >
                    <div className="action-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#f59e0b' }}>🔥 도전형 추천</span>
                        <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 6px' }}>난이도: {recommendations.challenge.difficulty}</span>
                      </div>
                      <h4 style={{ fontSize: '12px', margin: '4px 0 2px 0' }}>{recommendations.challenge.name}</h4>
                      <p style={{ fontSize: '10px', color: '#94a3b8' }}>{recommendations.challenge.description}</p>
                    </div>
                  </div>

                  {/* T자형 */}
                  <div 
                    className="action-card" 
                    onClick={() => { setSelectedScenario('t-shape'); handleSelectTarget((recommendations['T자형'] || recommendations.t_shape).targetId); }}
                    style={{ borderLeft: '3px solid #a78bfa', padding: '12px' }}
                  >
                    <div className="action-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#a78bfa' }}>🔀 T자형 추천</span>
                        <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 6px' }}>난이도: {(recommendations['T자형'] || recommendations.t_shape).difficulty}</span>
                      </div>
                      <h4 style={{ fontSize: '12px', margin: '4px 0 2px 0' }}>{(recommendations['T자형'] || recommendations.t_shape).name}</h4>
                      <p style={{ fontSize: '10px', color: '#94a3b8' }}>{(recommendations['T자형'] || recommendations.t_shape).description}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', background: 'var(--bg-glass)', padding: '8px', borderRadius: '4px' }}>
              💡 좌측 네트워크 맵에서 직무 노드를 직접 탭하여 정보를 볼 수도 있습니다.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
