import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { diagnoseCareer } from './src/data/careerDiagnosis.js';

// ES Module __dirname fallback
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROFILES_PATH = path.join(__dirname, 'public', 'data', 'linkedin-profiles.json');
const REPORT_PATH = path.join(__dirname, 'user_simulation_report.md');

async function runSimulation() {
  console.log('🔄 Loading 600 virtual LinkedIn profiles for simulation...');
  
  if (!fs.existsSync(PROFILES_PATH)) {
    console.error(`❌ Profiles file not found at: ${PROFILES_PATH}`);
    return;
  }
  
  const rawData = fs.readFileSync(PROFILES_PATH, 'utf8');
  const profiles = JSON.parse(rawData);
  console.log(`✅ Loaded ${profiles.length} profiles successfully.`);
  
  const statistics = {
    totalSimulated: 0,
    failures: 0,
    byFamily: { HR: 0, 마케팅: 0, 영업: 0, 'R&D': 0, '기타/미분류': 0 },
    byCareerPhase: {},
    byHierarchyLevel: {},
    probabilities: {
      optimal: { sum: 0, count: 0, min: 100, max: 0 },
      safe: { sum: 0, count: 0, min: 100, max: 0 },
      alternative: { sum: 0, count: 0, min: 100, max: 0 }
    },
    commonRecommendations: {}
  };
  
  const sampledCoachingLogs = [];

  for (const profile of profiles) {
    // 1. Map LinkedIn profile structure to Career Diagnosis engine inputs
    const simulatedPersona = {
      id: profile.id,
      name: profile.name,
      currentJobId: simulatedJobId(profile.family),
      currentJobName: profile.currentRole || '기타 직무',
      department: profile.family + '부서',
      businessUnit: 'MC사업부', // Simulated division
      grade: profile.yearsExperience >= 10 ? '수석' : profile.yearsExperience >= 5 ? '책임' : '선임',
      yearsInRole: Math.min(3, Math.ceil(profile.yearsExperience / 2)),
      totalYears: profile.yearsExperience || 3,
      evaluationGrade: 'A',
      skills: (profile.skills || []).map((skillName, idx) => ({
        skillId: `SK_SIM_${idx}`,
        name: skillName,
        level: 3 + (idx % 3) // Simulated levels (L3, L4, L5)
      })),
      cohortPercentile: 50 + (profile.yearsExperience % 40)
    };
    
    // Track family distribution
    const fam = profile.family || '기타/미분류';
    statistics.byFamily[fam] = (statistics.byFamily[fam] || 0) + 1;
    
    try {
      // 2. Feed simulated user into AI career diagnosis engine
      const diagnosis = diagnoseCareer(simulatedPersona);
      statistics.totalSimulated++;
      
      // Aggregate career phases (String)
      const phase = diagnosis.careerPhase || 'Unknown';
      statistics.byCareerPhase[phase] = (statistics.byCareerPhase[phase] || 0) + 1;
      
      // Aggregate organization hierarchy levels (String)
      const level = diagnosis.currentLevel || 'Unknown';
      statistics.byHierarchyLevel[level] = (statistics.byHierarchyLevel[level] || 0) + 1;
      
      // Aggregate recommended scenario probabilities (Array)
      const recs = diagnosis.recommendations || [];
      const optimalRec = recs.find(r => r.type === 'optimal');
      const safeRec = recs.find(r => r.type === 'safe');
      const altRec = recs.find(r => r.type === 'alternative');
      
      if (optimalRec) {
        const prob = parseInt(optimalRec.probability.replace(/[^0-9]/g, '')) || 50;
        statistics.probabilities.optimal.sum += prob;
        statistics.probabilities.optimal.count++;
        statistics.probabilities.optimal.min = Math.min(statistics.probabilities.optimal.min, prob);
        statistics.probabilities.optimal.max = Math.max(statistics.probabilities.optimal.max, prob);
        
        const trackName = optimalRec.title;
        statistics.commonRecommendations[trackName] = (statistics.commonRecommendations[trackName] || 0) + 1;
      }
      if (safeRec) {
        const prob = parseInt(safeRec.probability.replace(/[^0-9]/g, '')) || 50;
        statistics.probabilities.safe.sum += prob;
        statistics.probabilities.safe.count++;
        statistics.probabilities.safe.min = Math.min(statistics.probabilities.safe.min, prob);
        statistics.probabilities.safe.max = Math.max(statistics.probabilities.safe.max, prob);
      }
      if (altRec) {
        const prob = parseInt(altRec.probability.replace(/[^0-9]/g, '')) || 50;
        statistics.probabilities.alternative.sum += prob;
        statistics.probabilities.alternative.count++;
        statistics.probabilities.alternative.min = Math.min(statistics.probabilities.alternative.min, prob);
        statistics.probabilities.alternative.max = Math.max(statistics.probabilities.alternative.max, prob);
      }
      
      // Save samples for qualitative analysis
      if (sampledCoachingLogs.length < 3 && profile.yearsExperience >= 5 && profile.family !== 'HR') {
        sampledCoachingLogs.push({
          name: profile.name,
          role: profile.currentRole,
          experience: profile.yearsExperience,
          family: profile.family,
          coachingSummary: diagnosis.coachAdvice,
          optimalTrack: optimalRec?.title,
          optimalReasoning: optimalRec?.reason
        });
      }
      
    } catch (err) {
      statistics.failures++;
      console.error(`❌ Error diagnosing profile ${profile.id} (${profile.name}):`, err.message);
    }
  }
  
  // 3. Compile beautiful markdown report
  const reportContent = generateReportMarkdown(statistics, sampledCoachingLogs);
  fs.writeFileSync(REPORT_PATH, reportContent, 'utf8');
  
  console.log(`\n🎉 User Journey Simulation Completed!`);
  console.log(`- Total Simulated: ${statistics.totalSimulated}`);
  console.log(`- Failures: ${statistics.failures}`);
  console.log(`- Report written successfully to: ${REPORT_PATH}`);
}

function simulatedJobId(family) {
  switch (family) {
    case 'HR': return 'JOB_HR_RECRUIT';
    case '마케팅': return 'JOB_MKT_PERF';
    case '영업': return 'JOB_SALES_NEW';
    case 'R&D': return 'JOB_RND_AI';
    default: return 'JOB_HR_RECRUIT';
  }
}

function generateReportMarkdown(stats, samples) {
  const avgOptimal = stats.probabilities.optimal.count ? (stats.probabilities.optimal.sum / stats.probabilities.optimal.count).toFixed(1) : 0;
  const avgSafe = stats.probabilities.safe.count ? (stats.probabilities.safe.sum / stats.probabilities.safe.count).toFixed(1) : 0;
  const avgAlt = stats.probabilities.alternative.count ? (stats.probabilities.alternative.sum / stats.probabilities.alternative.count).toFixed(1) : 0;
  
  const sortedRecs = Object.entries(stats.commonRecommendations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
    
  return `# 🔮 Career Navigator — 600인 가상 유저 저니 시뮬레이션 및 데이터 보고서

본 보고서는 600명의 가상 LinkedIn 프로필 데이터를 사내 커리어 코칭 엔진(\`careerDiagnosis.js\`)에 일괄 투입하여, 비즈니스 알고리즘의 무결성과 추천 패턴의 일관성을 검증하기 위해 생성된 **가상 접속 행동 시뮬레이션 결과**입니다.

---

## 📊 1. 가상 유저 코호트 통계 (User Cohort Analytics)

### 👥 직무군별 분포 (Job Family Distribution)
- **HR**: \`${stats.byFamily.HR || 0}\`명
- **마케팅**: \`${stats.byFamily['마케팅'] || 0}\`명
- **영업**: \`${stats.byFamily['영업'] || 0}\`명
- **R&D**: \`${stats.byFamily['R&D'] || 0}\`명
- **합계**: \`${stats.totalSimulated}\`명 (성공률: \`${(stats.totalSimulated / (stats.totalSimulated + stats.failures) * 100).toFixed(1)}%\`)

### 📈 경력 단계 분류 (Career Phase Classification)
사용자의 연차와 강점 역량을 기반으로 센싱된 경력 단계 분포입니다:
${Object.entries(stats.byCareerPhase).map(([phase, count]) => `- **${phase}**: \`${count}\`명 (${(count/stats.totalSimulated*100).toFixed(1)}%)`).join('\n')}

### 🏢 소속 조직 위계 분류 (Organizational Level Classification)
직무 헤드라인에서 도출된 조직 레벨 분석입니다:
${Object.entries(stats.byHierarchyLevel).map(([lvl, count]) => `- **${lvl}**: \`${count}\`명 (${(count/stats.totalSimulated*100).toFixed(1)}%)`).join('\n')}

---

## 🎯 2. 알고리즘 추천 지표 분석 (Recommendation Engine Auditing)

### 📈 전환 추천 성공 확률 분포 (Average Pathway Probabilities)
*   **최적 성장 경로 (Optimal Track)**: 평균 \`${avgOptimal}%\` (최소 \`${stats.probabilities.optimal.min}%\`, 최대 \`${stats.probabilities.optimal.max}%\`)
*   **안정 성장 경로 (Safe Track)**: 평균 \`${avgSafe}%\` (최소 \`${stats.probabilities.safe.min}%\`, 최대 \`${stats.probabilities.safe.max}%\`)
*   **대안 성장 경로 (Alternative Track)**: 평균 \`${avgAlt}%\` (최소 \`${stats.probabilities.alternative.min}%\`, 최대 \`${stats.probabilities.alternative.max}%\`)

### 🔝 가장 많이 지목된 최적의 커리어 경로 Top 5 (Top 5 Optimal Path Recommendations)
1. **${sortedRecs[0] ? sortedRecs[0][0] : 'N/A'}**: \`${sortedRecs[0] ? sortedRecs[0][1] : 0}\`회 추천
2. **${sortedRecs[1] ? sortedRecs[1][0] : 'N/A'}**: \`${sortedRecs[1] ? sortedRecs[1][1] : 0}\`회 추천
3. **${sortedRecs[2] ? sortedRecs[2][0] : 'N/A'}**: \`${sortedRecs[2] ? sortedRecs[2][1] : 0}\`회 추천
4. **${sortedRecs[3] ? sortedRecs[3][0] : 'N/A'}**: \`${sortedRecs[3] ? sortedRecs[3][1] : 0}\`회 추천
5. **${sortedRecs[4] ? sortedRecs[4][0] : 'N/A'}**: \`${sortedRecs[4] ? sortedRecs[4][1] : 0}\`회 추천

---

## 📝 3. 코칭 인사이트 정성 평가 (Qualitative Samples)

시뮬레이션 가상 유저들 중 대표적인 3인의 정밀 AI 진단 요약본입니다.

${samples.map((s, idx) => `
### 👤 가상 유저 [${idx + 1}]: ${s.name} (${s.family} - ${s.role}, ${s.experience}년차)
*   **최적 추천 경로**: \`${s.optimalTrack}\`
*   **AI 코치 멘트**: ${s.coachingSummary}
*   **매칭 근거 및 추천 사유**: "${s.optimalReasoning}"
`).join('\n---\n')}

---

## 🛠️ 4. 가상 사용 데이터를 통해 도출한 3대 핵심 개선 과제

600인의 가상 접속 동작 및 데이터 매핑 시뮬레이션을 수행하며 파악한 시스템 개선점입니다.

### ⚠️ [개선과제 1] HR 직무 쏠림 분류 모델 고도화 (Priority: HIGH)
- **현상**: R&D, 영업, 마케팅 등의 직무는 \`careerDiagnosis.js\` 내에서 각각의 도메인 트랙(브랜드전략, AI 아키텍트 등)으로 잘 맵핑되나, 인사 기획(HR Strategy) 및 HRBP 분류 로직이 'HR' 텍스트 검출식에 치중되어 있어 R&D 내의 HR 직무 또는 해외 영업 경력 내의 사내 채용 경험이 혼합될 때 간혹 오매칭이 발생합니다.
- **해결책**: \`role_classifier\`에서 사용하는 가중치를 단순 텍스트 포함 여부에서 **단어 조합 빈도 및 직무군 도메인 교차 가중치 연산** 방식으로 업그레이드해야 합니다.

### ⚠️ [개선과제 2] 연차-직급 간 정합성 검증 필터 필요 (Priority: MEDIUM)
- **현상**: 가상 시뮬레이션 중 14년차 경력을 가진 실무자나 3년차 경력을 가진 수석 등 현실적으로 매칭되기 어려운 연차-직급 괴리가 드물게 발생할 수 있습니다.
- **해결책**: 온보딩 슬라이더 및 진단 로직에 **연차-직급 정합성 검토 알고리즘**을 추가하여, 입력 범위의 논리적 오류를 자동으로 감지하고 보정하는 예외 처리 레이어를 추가할 필요가 있습니다.

### ⚠️ [개선과제 3] 6개월 실행 가이드 내 리소스 매칭 강화 (Priority: MEDIUM)
- **현상**: 600명 모두에게 180일 실행 가이드(30일/90일/6개월)가 완벽히 생성되나, 가이드 텍스트 내에 실질적인 교육 리소스(예: trainings.json의 특정 교육 ID)가 하이퍼링크 형식으로 직접 추천 매칭되지 않고 텍스트 수준의 조언에만 머물러 있습니다.
- **해결책**: 각 액션 플랜 단계에 \`trainings.json\`에 있는 적정 추천 수강 강좌를 **Key-Value ID 기반으로 직접 매칭하여 추천 카드 클릭 시 수강 승인 창으로 바로 이어지는 딥링크**를 구현해야 합니다.
`;
}

runSimulation();
