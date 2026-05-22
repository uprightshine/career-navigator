/**
 * 400명 Fake 직원 데이터 엑셀 생성 스크립트
 * 실행: node generate_fake_data.mjs
 */
import XLSX from 'xlsx';
import { writeFileSync } from 'fs';

// ───────────── 기초 데이터 풀 ─────────────
const LAST_NAMES = ['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','류','전','홍','고','문','양','배','남','차','방','남궁','제갈'];
const FIRST_NAMES_M = ['민준','서준','도윤','예준','시우','하준','주원','지호','지후','준서','준우','현우','도현','건우','우진','선우','재현','동현','승민','태호','성민','원호','재혁','정환','상호','진우','시현','승준','찬영'];
const FIRST_NAMES_F = ['서연','서윤','지우','서현','하은','민서','지유','하윤','윤서','수아','지은','예진','소연','미래','수정','은별','지혜','민지','수빈','혜원','유진','다은','나윤','채원','지아','세아','가은','하린','보라'];

const GRADES = ['사원','선임','책임','리더'];
const EVAL_GRADES = ['S','A','B','C','D'];
const ORG_LEVELS = ['본사','본부','사업부'];
const CAREER_INTENTS = ['explorer','specialist','leadership','unsure'];
const DEGREES = ['학사','석사','박사'];

// 직무 정보 (ID, 이름, Family)
const JOBS = [
  // HR (7)
  { id:'JOB_HR_RECRUIT', name:'채용', family:'HR' },
  { id:'JOB_HR_HRD', name:'HRD', family:'HR' },
  { id:'JOB_HR_HRBP', name:'HRBP', family:'HR' },
  { id:'JOB_HR_CNB', name:'C&B', family:'HR' },
  { id:'JOB_HR_LABOR', name:'노무관리', family:'HR' },
  { id:'JOB_HR_PLAN', name:'인사기획', family:'HR' },
  { id:'JOB_HR_ANALYTICS', name:'HR Analytics', family:'HR' },
  // 마케팅 (6)
  { id:'JOB_MK_PERF', name:'퍼포먼스마케팅', family:'마케팅' },
  { id:'JOB_MK_BRAND', name:'브랜드마케팅', family:'마케팅' },
  { id:'JOB_MK_CONTENT', name:'콘텐츠마케팅', family:'마케팅' },
  { id:'JOB_MK_CRM', name:'CRM마케팅', family:'마케팅' },
  { id:'JOB_MK_PM', name:'통합마케팅PM', family:'마케팅' },
  { id:'JOB_MK_STRATEGY', name:'마케팅전략', family:'마케팅' },
  // 영업 (6)
  { id:'JOB_SL_NEW', name:'신규영업', family:'영업' },
  { id:'JOB_SL_KAM', name:'KAM(핵심고객관리)', family:'영업' },
  { id:'JOB_SL_PLAN', name:'영업기획', family:'영업' },
  { id:'JOB_SL_CHANNEL', name:'채널영업', family:'영업' },
  { id:'JOB_SL_MGMT', name:'영업관리', family:'영업' },
  { id:'JOB_SL_GLOBAL', name:'해외영업', family:'영업' },
  // R&D (6)
  { id:'JOB_RD_MATERIAL', name:'소재연구', family:'R&D' },
  { id:'JOB_RD_PROCESS', name:'공정개발', family:'R&D' },
  { id:'JOB_RD_MASS', name:'양산기술', family:'R&D' },
  { id:'JOB_RD_QUALITY', name:'품질R&D', family:'R&D' },
  { id:'JOB_RD_PLAN', name:'R&D기획', family:'R&D' },
  { id:'JOB_RD_AISW', name:'AI/SW개발', family:'R&D' },
];

// Family별 부서명
const DEPARTMENTS = {
  'HR': ['인재확보팀','조직개발팀','보상기획팀','노사협력팀','인사기획팀','HR디지털혁신팀','글로벌인사팀','HS HR팀','VS HR팀','사업부 HRBP팀'],
  '마케팅': ['디지털마케팅팀','브랜드전략팀','콘텐츠마케팅팀','CRM팀','통합마케팅팀','마케팅전략팀','퍼포먼스마케팅팀','글로벌마케팅팀'],
  '영업': ['신사업영업팀','전략영업팀','채널관리팀','글로벌영업팀','영업전략실','영업관리팀','해외사업팀','B2B영업팀'],
  'R&D': ['소재연구팀','공정기술팀','양산기술팀','품질기술팀','R&D전략실','AI기술팀','SW개발팀','연구기획팀'],
};

const BU_LIST = ['MC사업본부','H&A사업본부','에너지솔루션','VS사업본부','BS사업본부','CTO부문','피플솔루션','DX본부'];
const UNIVERSITIES = ['서울대학교','연세대학교','고려대학교','KAIST','포항공과대학교','성균관대학교','한양대학교','중앙대학교','경희대학교','이화여자대학교','서강대학교','홍익대학교','건국대학교','부산대학교','인하대학교','한국외국어대학교','단국대학교','숭실대학교','국민대학교','동국대학교'];
const MAJORS = {
  'HR': ['경영학','인적자원관리','조직심리학','법학','산업공학','교육공학','행정학'],
  '마케팅': ['경영학','시각디자인','미디어커뮤니케이션','통계학','MBA','광고홍보학','심리학'],
  '영업': ['경영학','무역학','국제통상','MBA','경제학','산업공학'],
  'R&D': ['화학공학','재료공학','전자공학','컴퓨터공학','기계공학','물리학','화학','AI/빅데이터'],
};

// 스킬 데이터 (family별)
const SKILLS = {
  'HR': [
    {id:'SKL_HR_001',name:'채용전략'},{id:'SKL_HR_002',name:'ATS운영'},{id:'SKL_HR_003',name:'면접설계'},
    {id:'SKL_HR_004',name:'채용브랜딩'},{id:'SKL_HR_005',name:'교육체계설계'},{id:'SKL_HR_006',name:'리더십개발'},
    {id:'SKL_HR_007',name:'조직진단'},{id:'SKL_HR_008',name:'인사전략'},{id:'SKL_HR_009',name:'보상설계'},
    {id:'SKL_HR_010',name:'급여관리'},{id:'SKL_HR_011',name:'노동법'},{id:'SKL_HR_012',name:'노사관계'},
    {id:'SKL_HR_013',name:'피플애널리틱스'},{id:'SKL_HR_014',name:'HRIS관리'},
  ],
  '마케팅': [
    {id:'SKL_MK_001',name:'퍼포먼스광고'},{id:'SKL_MK_002',name:'GA/데이터분석'},{id:'SKL_MK_003',name:'브랜드전략'},
    {id:'SKL_MK_004',name:'콘텐츠기획'},{id:'SKL_MK_005',name:'CRM운영'},{id:'SKL_MK_006',name:'마케팅자동화'},
    {id:'SKL_MK_007',name:'미디어플래닝'},{id:'SKL_MK_008',name:'소셜미디어관리'},{id:'SKL_MK_009',name:'마케팅전략'},
    {id:'SKL_MK_010',name:'시장조사'},
  ],
  '영업': [
    {id:'SKL_SL_001',name:'B2B영업'},{id:'SKL_SL_002',name:'고객관계관리'},{id:'SKL_SL_003',name:'영업전략'},
    {id:'SKL_SL_004',name:'채널관리'},{id:'SKL_SL_005',name:'제안서작성'},{id:'SKL_SL_006',name:'협상스킬'},
    {id:'SKL_SL_007',name:'해외시장개척'},{id:'SKL_SL_008',name:'매출관리'},{id:'SKL_SL_009',name:'파이프라인관리'},
    {id:'SKL_SL_010',name:'영업분석'},
  ],
  'R&D': [
    {id:'SKL_RD_001',name:'소재분석'},{id:'SKL_RD_002',name:'공정설계'},{id:'SKL_RD_003',name:'양산관리'},
    {id:'SKL_RD_004',name:'품질관리'},{id:'SKL_RD_005',name:'실험설계(DOE)'},{id:'SKL_RD_006',name:'통계분석'},
    {id:'SKL_RD_007',name:'R&D기획력'},{id:'SKL_RD_008',name:'AI/ML'},{id:'SKL_RD_009',name:'SW개발'},
    {id:'SKL_RD_010',name:'특허관리'},
  ],
};
const COMMON_SKILLS = [
  {id:'SKL_CF_001',name:'프로젝트관리'},{id:'SKL_CF_002',name:'데이터분석'},{id:'SKL_CF_003',name:'프레젠테이션'},
  {id:'SKL_CF_004',name:'리더십'},{id:'SKL_CF_005',name:'커뮤니케이션'},{id:'SKL_CF_006',name:'비즈니스영어'},
  {id:'SKL_CF_007',name:'디자인씽킹'},{id:'SKL_CF_008',name:'애자일방법론'},
];

const CERTS = {
  'HR': ['PHR','SHRM-CP','SHRM-SCP','공인노무사','평생교육사 2급','ADSP','경영지도사(인적자원)','HRD전문가'],
  '마케팅': ['Google Ads 인증','GA4 인증','HubSpot Inbound Marketing','Facebook Blueprint','경영지도사(마케팅)','디지털마케팅전문가','GAIQ'],
  '영업': ['CPSP','무역영어1급','국제무역사','경영지도사(영업)','유통관리사','PMP'],
  'R&D': ['기술사','PMP','6시그마 GB','6시그마 BB','6시그마 MBB','품질경영기사','화학분석기사','정보처리기사','AWS ML Specialty'],
};

// ───────────── 유틸리티 ─────────────
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}
function weightedPick(arr, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

// ───────────── 직급별 연차/나이 분포 ─────────────
function getYearsAndAge(grade) {
  let totalYears, yearsInRole, age;
  switch (grade) {
    case '사원':
      totalYears = rand(1, 3);
      yearsInRole = rand(1, totalYears);
      age = rand(24, 29);
      break;
    case '선임':
      totalYears = rand(3, 8);
      yearsInRole = rand(1, Math.min(5, totalYears));
      age = rand(27, 35);
      break;
    case '책임':
      totalYears = rand(7, 15);
      yearsInRole = rand(1, Math.min(6, totalYears));
      age = rand(32, 42);
      break;
    case '리더':
      totalYears = rand(12, 25);
      yearsInRole = rand(1, Math.min(5, totalYears));
      age = rand(38, 52);
      break;
  }
  return { totalYears, yearsInRole, age };
}

// 평가등급 가중치 (S는 희소, D도 희소)
function getEvalGrade() {
  return weightedPick(EVAL_GRADES, [8, 30, 35, 20, 7]);
}

// ───────────── 이동이력 생성 ─────────────
function generateMovementHistory(currentJobId, family, totalYears, joinYear) {
  const familyJobs = JOBS.filter(j => j.family === family);
  const numMoves = totalYears <= 3 ? 0 : totalYears <= 6 ? rand(0, 1) : totalYears <= 10 ? rand(1, 2) : rand(1, 3);
  
  if (numMoves === 0) return [];
  
  const history = [];
  let year = joinYear;
  const otherJobs = familyJobs.filter(j => j.id !== currentJobId);
  const pastJobs = pickN(otherJobs, numMoves);
  
  for (let i = 0; i < pastJobs.length; i++) {
    history.push({ year, jobId: pastJobs[i].id, jobName: pastJobs[i].name });
    year += rand(2, 4);
  }
  // 마지막: 현재 직무
  const currentJobObj = JOBS.find(j => j.id === currentJobId);
  history.push({ year: Math.min(year, 2026), jobId: currentJobId, jobName: currentJobObj?.name || '' });
  
  return history;
}

// ───────────── 메인: 400명 생성 ─────────────
const employees = [];
const usedNames = new Set();

for (let i = 1; i <= 400; i++) {
  // 성별 (50/50)
  const isFemale = Math.random() < 0.45;
  
  // 이름 생성 (중복 방지)
  let fullName;
  do {
    const lastName = pick(LAST_NAMES);
    const firstName = pick(isFemale ? FIRST_NAMES_F : FIRST_NAMES_M);
    fullName = lastName + firstName;
  } while (usedNames.has(fullName));
  usedNames.add(fullName);

  // 직무 배정 (4개 Family 대략 균등, HR 약간 많게)
  const familyWeights = [30, 25, 25, 20]; // HR, 마케팅, 영업, R&D
  const families = ['HR', '마케팅', '영업', 'R&D'];
  const family = weightedPick(families, familyWeights);
  const familyJobs = JOBS.filter(j => j.family === family);
  const job = pick(familyJobs);

  // 직급 (분포: 사원 20%, 선임 35%, 책임 30%, 리더 15%)
  const grade = weightedPick(GRADES, [20, 35, 30, 15]);
  const { totalYears, yearsInRole, age } = getYearsAndAge(grade);
  const joinYear = 2026 - totalYears;

  // 조직 레벨
  const orgLevel = pick(ORG_LEVELS);

  // 부서
  const dept = pick(DEPARTMENTS[family]);
  const bu = pick(BU_LIST);

  // 3개년 평가
  const evalN2 = getEvalGrade();
  const evalN1 = getEvalGrade();
  const evalN0 = getEvalGrade();

  // 스킬 (전공 3~5개 + 공통 1~2개)
  const familySkills = SKILLS[family];
  const numFamilySkills = rand(3, 5);
  const myFamilySkills = pickN(familySkills, numFamilySkills);
  const numCommonSkills = rand(1, 3);
  const myCommonSkills = pickN(COMMON_SKILLS, numCommonSkills);
  
  const allSkills = [
    ...myFamilySkills.map((s, idx) => ({
      skillId: s.id,
      name: s.name,
      level: idx === 0 ? Math.min(5, rand(3, 5)) : rand(1, 4) // 주특기는 높게
    })),
    ...myCommonSkills.map(s => ({
      skillId: s.id,
      name: s.name,
      level: rand(1, 4)
    }))
  ];

  const primarySkill = allSkills[0];

  // 리더십 백분위
  const leadershipPercentile = rand(15, 95);

  // 자격증 (0~2개)
  const numCerts = rand(0, 2);
  const certs = pickN(CERTS[family], numCerts);

  // 학력
  const degree = grade === '리더' ? pick(['석사','박사']) : weightedPick(DEGREES, [50, 40, 10]);
  const major = pick(MAJORS[family]);
  const university = pick(UNIVERSITIES);

  // 커리어 의향
  const careerIntent = pick(CAREER_INTENTS);

  // 이동이력
  const movementHistory = generateMovementHistory(job.id, family, totalYears, joinYear);

  // cohortPercentile
  const cohortPercentile = rand(20, 95);

  employees.push({
    id: `EMP${String(i).padStart(3, '0')}`,
    name: fullName,
    gender: isFemale ? 'F' : 'M',
    age,
    joinYear,
    orgLevel,
    department: dept,
    businessUnit: bu,
    currentJobId: job.id,
    currentJobName: job.name,
    jobFamily: family,
    grade,
    yearsInRole,
    totalYears,
    evalN2Year: 2024,
    evalN2Grade: evalN2,
    evalN1Year: 2025,
    evalN1Grade: evalN1,
    evalN0Year: 2026,
    evalN0Grade: evalN0,
    leadershipPercentile,
    cohortPercentile,
    primarySkillId: primarySkill.skillId,
    primarySkillName: primarySkill.name,
    skill1_id: allSkills[0]?.skillId || '',
    skill1_name: allSkills[0]?.name || '',
    skill1_level: allSkills[0]?.level || '',
    skill2_id: allSkills[1]?.skillId || '',
    skill2_name: allSkills[1]?.name || '',
    skill2_level: allSkills[1]?.level || '',
    skill3_id: allSkills[2]?.skillId || '',
    skill3_name: allSkills[2]?.name || '',
    skill3_level: allSkills[2]?.level || '',
    skill4_id: allSkills[3]?.skillId || '',
    skill4_name: allSkills[3]?.name || '',
    skill4_level: allSkills[3]?.level || '',
    skill5_id: allSkills[4]?.skillId || '',
    skill5_name: allSkills[4]?.name || '',
    skill5_level: allSkills[4]?.level || '',
    certification1: certs[0] || '',
    certification2: certs[1] || '',
    degree,
    major,
    university,
    careerIntent,
    movementCount: movementHistory.length,
    move1_year: movementHistory[0]?.year || '',
    move1_jobId: movementHistory[0]?.jobId || '',
    move1_jobName: movementHistory[0]?.jobName || '',
    move2_year: movementHistory[1]?.year || '',
    move2_jobId: movementHistory[1]?.jobId || '',
    move2_jobName: movementHistory[1]?.jobName || '',
    move3_year: movementHistory[2]?.year || '',
    move3_jobId: movementHistory[2]?.jobId || '',
    move3_jobName: movementHistory[2]?.jobName || '',
    move4_year: movementHistory[3]?.year || '',
    move4_jobId: movementHistory[3]?.jobId || '',
    move4_jobName: movementHistory[3]?.jobName || '',
  });
}

// ───────────── 통계 요약 시트 ─────────────
const familyCounts = {};
const gradeCounts = {};
const orgLevelCounts = {};
employees.forEach(e => {
  familyCounts[e.jobFamily] = (familyCounts[e.jobFamily] || 0) + 1;
  gradeCounts[e.grade] = (gradeCounts[e.grade] || 0) + 1;
  orgLevelCounts[e.orgLevel] = (orgLevelCounts[e.orgLevel] || 0) + 1;
});
const summaryRows = [
  { 구분: '총 인원', 값: employees.length },
  { 구분: '', 값: '' },
  { 구분: '=== 직무군별 분포 ===', 값: '' },
  ...Object.entries(familyCounts).map(([k, v]) => ({ 구분: k, 값: v })),
  { 구분: '', 값: '' },
  { 구분: '=== 직급별 분포 ===', 값: '' },
  ...Object.entries(gradeCounts).map(([k, v]) => ({ 구분: k, 값: v })),
  { 구분: '', 값: '' },
  { 구분: '=== 조직 레벨별 분포 ===', 값: '' },
  ...Object.entries(orgLevelCounts).map(([k, v]) => ({ 구분: k, 값: v })),
];

// ───────────── 컬럼 한국어 헤더 매핑 ─────────────
const HEADER_MAP = {
  id: '사번',
  name: '이름',
  gender: '성별',
  age: '나이',
  joinYear: '입사년도',
  orgLevel: '소속(본사/본부/사업부)',
  department: '부서명',
  businessUnit: '비즈니스유닛',
  currentJobId: '현재직무ID',
  currentJobName: '현재직무명',
  jobFamily: '직무군',
  grade: '직급',
  yearsInRole: '현직무년차',
  totalYears: '총경력년수',
  evalN2Year: '평가N-2년도',
  evalN2Grade: '평가N-2등급',
  evalN1Year: '평가N-1년도',
  evalN1Grade: '평가N-1등급',
  evalN0Year: '평가N년도(최근)',
  evalN0Grade: '평가N등급(최근)',
  leadershipPercentile: '리더십백분위',
  cohortPercentile: '동료대비백분위',
  primarySkillId: '주특기스킬ID',
  primarySkillName: '주특기스킬명',
  skill1_id: '스킬1_ID', skill1_name: '스킬1_명', skill1_level: '스킬1_레벨',
  skill2_id: '스킬2_ID', skill2_name: '스킬2_명', skill2_level: '스킬2_레벨',
  skill3_id: '스킬3_ID', skill3_name: '스킬3_명', skill3_level: '스킬3_레벨',
  skill4_id: '스킬4_ID', skill4_name: '스킬4_명', skill4_level: '스킬4_레벨',
  skill5_id: '스킬5_ID', skill5_name: '스킬5_명', skill5_level: '스킬5_레벨',
  certification1: '자격증1', certification2: '자격증2',
  degree: '학위', major: '전공', university: '대학교',
  careerIntent: '커리어의향',
  movementCount: '이동횟수',
  move1_year: '이동1_년도', move1_jobId: '이동1_직무ID', move1_jobName: '이동1_직무명',
  move2_year: '이동2_년도', move2_jobId: '이동2_직무ID', move2_jobName: '이동2_직무명',
  move3_year: '이동3_년도', move3_jobId: '이동3_직무ID', move3_jobName: '이동3_직무명',
  move4_year: '이동4_년도', move4_jobId: '이동4_직무ID', move4_jobName: '이동4_직무명',
};

// 헤더를 한국어로 변환한 데이터 생성
const renamedEmployees = employees.map(emp => {
  const renamed = {};
  for (const [engKey, value] of Object.entries(emp)) {
    renamed[HEADER_MAP[engKey] || engKey] = value;
  }
  return renamed;
});

// ───────────── 엑셀 생성 ─────────────
const wb = XLSX.utils.book_new();

// Sheet 1: 직원 데이터 (400명)
const ws1 = XLSX.utils.json_to_sheet(renamedEmployees);

// 컬럼 폭 자동조정
const colWidths = Object.values(HEADER_MAP).map(h => ({ wch: Math.max(h.length * 2, 12) }));
ws1['!cols'] = colWidths;

XLSX.utils.book_append_sheet(wb, ws1, '직원데이터(400명)');

// Sheet 2: 통계 요약
const ws2 = XLSX.utils.json_to_sheet(summaryRows);
ws2['!cols'] = [{ wch: 30 }, { wch: 10 }];
XLSX.utils.book_append_sheet(wb, ws2, '통계요약');

// Sheet 3: 직무 마스터
const jobSheet = XLSX.utils.json_to_sheet(JOBS.map(j => ({
  '직무ID': j.id,
  '직무명': j.name,
  '직무군': j.family,
})));
jobSheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 10 }];
XLSX.utils.book_append_sheet(wb, jobSheet, '직무마스터');

// Sheet 4: 스킬 마스터
const allSkillsMaster = [
  ...Object.entries(SKILLS).flatMap(([family, skills]) => 
    skills.map(s => ({ '스킬ID': s.id, '스킬명': s.name, '유형': family + ' 전문' }))
  ),
  ...COMMON_SKILLS.map(s => ({ '스킬ID': s.id, '스킬명': s.name, '유형': '공통역량' }))
];
const ws4 = XLSX.utils.json_to_sheet(allSkillsMaster);
ws4['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }];
XLSX.utils.book_append_sheet(wb, ws4, '스킬마스터');

// 파일 저장
const OUTPUT_PATH = 'Career_Navigator_FakeData_400명.xlsx';
XLSX.writeFile(wb, OUTPUT_PATH);
console.log(`✅ 엑셀 파일 생성 완료: ${OUTPUT_PATH}`);
console.log(`   - 시트1: 직원데이터(400명) — ${employees.length}행`);
console.log(`   - 시트2: 통계요약`);
console.log(`   - 시트3: 직무마스터 (${JOBS.length}개)`);
console.log(`   - 시트4: 스킬마스터 (${allSkillsMaster.length}개)`);
console.log(`\n📊 분포:`);
console.log(`   직무군: ${JSON.stringify(familyCounts)}`);
console.log(`   직급: ${JSON.stringify(gradeCounts)}`);
console.log(`   조직레벨: ${JSON.stringify(orgLevelCounts)}`);
