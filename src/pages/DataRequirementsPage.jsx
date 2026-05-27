import { useState } from 'react'

export default function DataRequirementsPage() {
  const [activeTab, setActiveTab] = useState('essential') // 'essential' | 'optional' | 'external' | 'quality' | 'privacy'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }} className="animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)' }}>데이터 요구사항 가이드</h2>
        <div className="card-subtitle" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          커리어 내비게이션 실 서비스를 기업 내에 안전하고 성공적으로 구축하기 위한 데이터 연동 스펙
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-3">
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '8px', color: '#000000' }}>
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="9" y1="6" x2="9" y2="6.01" />
            <line x1="15" y1="6" x2="15" y2="6.01" />
            <line x1="9" y1="10" x2="9" y2="10.01" />
            <line x1="15" y1="10" x2="15" y2="10.01" />
            <line x1="9" y1="14" x2="9" y2="14.01" />
            <line x1="15" y1="14" x2="15" y2="14.01" />
            <line x1="9" y1="18" x2="15" y2="18" />
          </svg>
          <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '600' }}>사내 필수 연동 데이터</h4>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000000', marginTop: '6px' }}>6개 데이터 소스</div>
          <span className="badge" style={{ fontSize: '9px', marginTop: '8px', background: '#000000', color: '#ffffff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>최우선 연동</span>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '8px', color: '#000000' }}>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" fill="rgba(0,0,0,0.05)" />
            <line x1="8" y1="11" x2="16" y2="11" />
            <line x1="8" y1="15" x2="16" y2="15" />
          </svg>
          <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '600' }}>사내 선택 연동 데이터</h4>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000000', marginTop: '6px' }}>4개 데이터 소스</div>
          <span className="badge" style={{ fontSize: '9px', marginTop: '8px', background: '#f3f4f6', color: '#374151', padding: '4px 8px', border: '1px solid var(--border-medium)', borderRadius: '4px', fontWeight: '600' }}>고도화 단계</span>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '8px', color: '#000000' }}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
          <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '600' }}>사외 외부 데이터</h4>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000000', marginTop: '6px' }}>3개 데이터 채널</div>
          <span className="badge" style={{ fontSize: '9px', marginTop: '8px', background: '#1f2937', color: '#ffffff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>시장 벤치마크</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-medium)', gap: '4px', overflowX: 'auto', paddingBottom: '1px' }}>
        {[
          { id: 'essential', label: '사내 필수 (6)' },
          { id: 'optional', label: '사내 선택 (4)' },
          { id: 'external', label: '사외 데이터 (3)' },
          { id: 'quality', label: '데이터 품질 요건' },
          { id: 'privacy', label: '개인정보 & AI윤리' }
        ].map(tab => (
          <button
            key={tab.id}
            className="btn btn-sm"
            style={{
              background: activeTab === tab.id ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
              color: activeTab === tab.id ? '#000000' : 'var(--text-secondary)',
              borderColor: 'transparent',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              borderBottom: activeTab === tab.id ? '2px solid #000000' : 'none',
              padding: '12px 18px',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Panel */}
      <div className="glass-card animate-fade-in-up" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-medium)' }}>
        {activeTab === 'essential' && (
          <div>
            <h3 className="card-title" style={{ marginBottom: '16px', fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>사내 필수 연동 데이터 스펙</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px' }}>데이터명</th>
                    <th style={{ padding: '10px' }}>소스 시스템</th>
                    <th style={{ padding: '10px' }}>데이터 포맷 (예시)</th>
                    <th style={{ padding: '10px' }}>주요 활용처</th>
                    <th style={{ padding: '10px' }}>중요도</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: '인사 발령 이력', src: 'SAP HR / Workday', format: '(사번, 이전직무코드, 이후직무코드, 발령일자)', usage: 'Career Graph 노드 간 이동 경로 및 빈도수 도출', priority: '• 필수' },
                    { name: '직무 기술서 (JD)', src: 'HR 직무체계 DB', format: '텍스트 (직무정의, 주요과업, 요구스킬 맵)', usage: '직무별 상세 요건 표출 및 요구스킬 정의', priority: '• 필수' },
                    { name: '역량 평가 결과', src: '인사평가 시스템', format: '(사번, 평가역량코드, 숙련수준 1~5, 평가년도)', usage: '개인 역량 레이더 차트 매핑 및 코호트 비교', priority: '• 필수' },
                    { name: '교육 수강 이력', src: 'LMS (학습관리시스템)', format: '(사번, 수강과정명, 과정유형, 이수여부, 완료일)', usage: '스킬 갭에 따른 맞춤 교육 추천 모듈 연동', priority: '• 필수' },
                    { name: '사내 조직도 데이터', src: 'SAP HR / LDAP', format: '사업부 - 본부 - 실 - 팀 계층 구조 데이터', usage: '사업부 간(Cross-BU) 이동 및 본부 내 이동 구분', priority: '• 필수' },
                    { name: '인력 현황 및 T/O', src: '정원관리 시스템', format: '(직무코드, 현재원수, 공석 개수, 충원계획수)', usage: '직무별 공석 현황 및 인력 수요 지표 표출', priority: '• 필수' }
                  ].map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{row.name}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.src}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#1f2937', fontWeight: '500' }}>{row.format}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.usage}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#000000' }}>{row.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'optional' && (
          <div>
            <h3 className="card-title" style={{ marginBottom: '16px', fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>사내 선택 연동 데이터 스펙 (고도화용)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px' }}>데이터명</th>
                    <th style={{ padding: '10px' }}>소스 시스템</th>
                    <th style={{ padding: '10px' }}>데이터 포맷 (예시)</th>
                    <th style={{ padding: '10px' }}>주요 활용처</th>
                    <th style={{ padding: '10px' }}>중요도</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: '리더십 다면진단', src: '설문 평가 시스템', format: '(사번, 리더십지표점수, 백분위 점수)', usage: '관리자/리더십 트랙 커리어 적합성 스코어 보강', priority: '• 선택' },
                    { name: '동료/다면 정성 평가', src: '인사평가 시스템', format: '비정형 텍스트 (강약점 정성 피드백)', usage: 'LLM 기반 역량 보완 인사이트 키워드 추출', priority: '• 선택' },
                    { name: '자격증 및 학위 보유 현황', src: 'HR 인사기록 카드', format: '(사번, 자격증명, 취득일, 최종학위, 전공)', usage: '개인 프로필 보강 및 외부 벤치마킹 매칭 정교화', priority: '• 선택' },
                    { name: '사내 멘토링 활동 이력', src: '사내 멘토링 매칭 시스템', format: '(사번, 멘토/멘티 여부, 매칭횟수, 평점)', usage: '어드바이저 매칭 시 검증된 멘토 우선 추천', priority: '• 선택' }
                  ].map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{row.name}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.src}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#1f2937', fontWeight: '500' }}>{row.format}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.usage}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#4b5563' }}>{row.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'external' && (
          <div>
            <h3 className="card-title" style={{ marginBottom: '16px', fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>사외 채널 및 외부 데이터 연동</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px' }}>데이터명</th>
                    <th style={{ padding: '10px' }}>연동 채널</th>
                    <th style={{ padding: '10px' }}>데이터 형태</th>
                    <th style={{ padding: '10px' }}>주요 활용처</th>
                    <th style={{ padding: '10px' }}>중요도</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: '글로벌/시장 스킬 트렌드', src: 'LinkedIn API / 잡포털 API', format: '직무별 수요 증감률 및 급상승 기술 태그', usage: '내부 역량 체계의 시장 가치 비교 및 미래 스킬 추천', priority: '• 외부' },
                    { name: '사외 경력 이동 프로파일', src: 'LinkedIn API', format: '익명화된 커리어 이력 시퀀스 및 보유 역량', usage: '사외 어드바이저 프로필 추천 및 벤치마크 맵 구성', priority: '• 외부' },
                    { name: '시장 처우/보상 데이터', src: '보상 컨설팅사 / 잡포털', format: '직무별 연차별 시장 평균 급여 밴드', usage: '특정 커리어 선택 시의 처우 비교 및 외적 동기 부여', priority: '• 외부' }
                  ].map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{row.name}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.src}</td>
                      <td style={{ padding: '12px', color: '#1f2937', fontWeight: '500' }}>{row.format}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.usage}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#6b7280' }}>{row.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'quality' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 className="card-title" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>성공적 구축을 위한 데이터 품질 핵심 요건</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--bg-glass)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '13px', color: '#000000', marginBottom: '8px', fontWeight: 'bold' }}>• 통계적 임계점 (최소 표본수)</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  네트워크 경로를 구성하고 신뢰도 높은 확률을 도출하기 위해서는 직무 노드당 <strong>최소 30명 이상의 이동 표본 데이터</strong>가 누적되어야 합니다. 데이터가 희소한 신생 직무는 시장 데이터(LinkedIn 등)로 보정해야 합니다.
                </p>
              </div>

              <div style={{ background: 'var(--bg-glass)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '13px', color: '#000000', marginBottom: '8px', fontWeight: 'bold' }}>• 표준 직무 분류체계 수립 선행</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  사내의 ad-hoc 부서명이나 호칭이 아닌, <strong>국가직무능력표준(NCS) 또는 글로벌 O*NET 체계</strong>에 매핑할 수 있는 표준 직무 정의(Job Family, Job Node)가 정의되어 있어야 매끄러운 맵을 그릴 수 있습니다.
                </p>
              </div>

              <div style={{ background: 'var(--bg-glass)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '13px', color: '#000000', marginBottom: '8px', fontWeight: 'bold' }}>• 실시간 동기화 주기 설계</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  인사 발령 이력은 <strong>주간/월간 배치</strong>로 자동 동기화되어야 하며, 구성원의 역량 평가는 평가 사이클에 따라 <strong>반기/연간 1회 자동 갱신</strong>되도록 파이프라인을 구축해야 합니다.
                </p>
              </div>

              <div style={{ background: 'var(--bg-glass)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '13px', color: '#000000', marginBottom: '8px', fontWeight: 'bold' }}>• 결측치 보정 알고리즘</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  JD에 요구 역량이 매핑되지 않았거나 개인 평가 데이터가 누락된 경우, 동일 직무 코호트의 평균 점수로 대체하거나 LLM을 이용해 JD 텍스트에서 요구 역량을 자동으로 태깅해내는 결측치 가드레일이 필요합니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 className="card-title" style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)' }}>개인정보 보호 및 AI 윤리 수칙</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              인사 데이터를 직원의 성장 목적으로 사용할 때는 프라이버시 보호와 편향 제거가 극도로 중요합니다. 실제 설계서에 포함되어야 하는 5가지 윤리 기준입니다.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  01. 개인 식별 데이터(PII) 난수화 및 익명 처리
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '22px' }}>
                  사내 식별자(사번, 이름, 주민번호)는 분석 서버 인입 전 무작위 난수(UUID) 처리되어야 합니다. 추천 엔진은 오직 직무 이력과 역량 레벨 텍스트만을 보고 작동해야 하며, 개인 식별이 불가해야 합니다.
                </p>
              </div>

              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  02. 코호트 비교 모듈의 임계값 가드 (k-익명성)
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '22px' }}>
                  '동료 대비 내 역량 위치' 등 비교 그룹 지표를 생성할 때, 해당 비교 카테고리(예: MC사업부 3년차 마케터)의 인원이 <strong>최소 10인 이상</strong>일 때만 표시합니다. 인원이 적을 경우 모그룹(예: 마케터 전체)으로 확장하여 개인 신상 노출을 원천 방지합니다.
                </p>
              </div>

              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  03. 구성원의 정보 주권 보장 (Opt-out 권리)
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '22px' }}>
                  직원들은 언제든지 시스템 내에서 '나의 커리어 추천 서비스 이용 동의'를 철회(Opt-out)할 수 있어야 합니다. 동의 철회 즉시 본인의 프로필 및 활동 로그는 추천 알고리즘 훈련 셋 및 멘토 추천 대상에서 전면 제외됩니다.
                </p>
              </div>

              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  04. 설명 가능한 AI 추천 근거 투명성 (Explainable AI)
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '22px' }}>
                  블랙박스 인공지능 추천이 아닌, '귀하와 같은 직무에서 출발한 선배 00명이 3년 차에 이 직무로 이동한 이력 데이터에 근거한 추천입니다' 혹은 '목표 직무 요건 대비 A스킬 숙련도가 부족하여 발생한 스킬 갭 분석 결과입니다' 등 <strong>의사결정 프로세스의 투명성</strong>을 의무적으로 노출합니다.
                </p>
              </div>

              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  05. 추천 알고리즘의 편향성 지속 정기 감사
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '22px' }}>
                  특정 부서, 성별, 연령대, 출신 학위군에 따라 특정 경로(예: 리더십 트랙) 추천 빈도가 지나치게 쏠리지 않는지 <strong>분기 1회 인력 분포 대비 추천 가중치를 정량 감사(Bias Audit)</strong>하고, 가중치 왜곡 발견 시 알고리즘 하이퍼파라미터를 상시 조정합니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
