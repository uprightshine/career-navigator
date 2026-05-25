/**
 * 600명 LinkedIn 가상 프로필 데이터 생성 스크립트
 * 실행: node generate_linkedin_profiles.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import XLSX from 'xlsx';

// ───────────── 기초 데이터 풀 ─────────────
const LAST_NAMES = ['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','류','전','홍','고','문','양','배','남','차','방'];
const FIRST_NAMES_M = ['민준','서준','도윤','예준','시우','하준','주원','지호','지후','준서','준우','현우','도현','건우','우진','선우','재현','동현','승민','태호','성민','원호','재혁','정환'];
const FIRST_NAMES_F = ['서연','서윤','지우','서현','하은','민서','지유','하윤','윤서','수아','지은','예진','소연','미래','수정','은별','지혜','민지','수빈','혜원','유진','다은','나윤','채원'];

const ENGLISH_FIRST_NAMES_M = ['Alex', 'David', 'Daniel', 'Michael', 'Luke', 'Chris', 'James', 'Jason', 'Justin', 'Brian', 'Andrew', 'Eric', 'Kevin', 'Ryan', 'Sean', 'Leo'];
const ENGLISH_FIRST_NAMES_F = ['Sarah', 'Jenny', 'Chloe', 'Emily', 'Rachel', 'Jessica', 'Grace', 'Anna', 'Hannah', 'Sophia', 'Olivia', 'Elena', 'Lauren', 'Joy', 'Amy'];

const COMPANIES = [
  'Google Korea', 'Meta Korea', 'Netflix Korea', 'ASML Korea', 'Nike Korea',
  'Toss (토스)', 'Coupang (쿠팡)', 'Woowahan Brothers (배달의민족)', 'Karrot (당근)', 'Kakao (카카오)', 'Naver (네이버)', 'Line Plus (라인)',
  'Samsung Electronics', 'SK Hynix', 'Hyundai Motor', 'LG Electronics', 'Amorepacific', 'CJ ENM'
];

const FAMILIES = ['HR', '마케팅', '영업', 'R&D'];

const ROLES_BY_FAMILY = {
  'HR': [
    { title: 'Senior HRBP', skills: ['HRBP', '조직 진단', '성과 관리', '피플 애널리틱스', '변화 관리'] },
    { title: 'Talent Acquisition Lead', skills: ['채용 브랜딩', 'ATS 운영', '면접 설계', '인재 발굴', '헤드헌팅'] },
    { title: 'Compensation & Benefits Specialist', skills: ['보상 설계', '급여 기획', '직무 평가', '시장 벤치마킹', '엑셀 마스터'] },
    { title: 'L&D / HRD Manager', skills: ['교육 체계 설계', '리더십 개발', '사내 교육 기획', '경력 경로 설계', '워크숍 진행'] },
    { title: 'People Analytics Specialist', skills: ['피플 애널리틱스', '데이터 분석', '통계학', 'SQL/Python', '대시보드 설계'] },
    { title: 'ER / Labor Relations Manager', skills: ['노동법', '노사 관계', '근로 감독 대응', '인사 감사', '갈등 중재'] }
  ],
  '마케팅': [
    { title: 'Growth Marketer', skills: ['퍼포먼스 마케팅', 'GA4 데이터 분석', '그로스 해킹', 'A/B 테스트', '마케팅 자동화'] },
    { title: 'Brand Manager', skills: ['브랜드 전략', 'IMC 캠페인', '소비자 조사', '신제품 런칭', '브랜드 가치 제고'] },
    { title: 'Contents Marketing Specialist', skills: ['콘텐츠 기획', 'SNS 운영', '스토리텔링', '카피라이팅', '숏폼 영상 기획'] },
    { title: 'CRM Marketer', skills: ['CRM 운영', '리텐션 캠페인', '고객 세그먼테이션', '푸시/알림톡 최적화', 'CDP 연동'] },
    { title: 'Integrated Marketing (IMC) Lead', skills: ['통합 마케팅 PM', '캠페인 기획', '미디어 플래닝', '예산 포트폴리오', 'ROI 최적화'] },
    { title: 'Marketing Strategist', skills: ['시장 조사', '마케팅 전략 수립', '경쟁 분석', 'Go-To-Market 전략', '정량 지표 설계'] }
  ],
  '영업': [
    { title: 'B2B Enterprise AE', skills: ['B2B 영업', '제안서 작성', '협상 스킬', '대형 고객 관리', '영업 파이프라인'] },
    { title: 'Key Account Manager (KAM)', skills: ['KAM', '고객 관계 관리', '장기 파트너십', '업셀링', '전략적 어카운트 플래닝'] },
    { title: 'Sales Operations Manager', skills: ['영업 기획', '실적 분석', '인센티브 구조 설계', 'Salesforce 운영', '매출 예측'] },
    { title: 'Global Business Development Manager', skills: ['해외 시장 개척', '크로스보더 영업', '수출 관리', '외국어 협상', '현지 파트너십'] },
    { title: 'Channel Sales Specialist', skills: ['채널 영업', '유통 파트너 관리', '대리점 관리', '공동 마케팅', '채널 정산'] }
  ],
  'R&D': [
    { title: 'AI Research Scientist', skills: ['AI/ML', 'LLM 파인튜닝', '딥러닝 모델링', 'PyTorch', '논문 작성'] },
    { title: 'Senior Software Engineer (Backend)', skills: ['SW 개발', '시스템 아키텍처', 'MSA 구축', '데이터베이스 설계', 'AWS 클라우드'] },
    { title: 'Materials R&D Researcher', skills: ['소재 연구', '물성 분석', '시제품 설계', '분석 장비 운영', '실험 설계(DOE)'] },
    { title: 'Process Development Engineer', skills: ['공정 개발', '수율 최적화', '디지털 트윈', '스마트 팩토리 설계', '공정 모사'] },
    { title: 'Quality R&D Engineer', skills: ['품질 관리', '신뢰성 시험', '불량 원인 분석', '품질 표준 수립', 'IATF16949'] },
    { title: 'R&D Project Manager', skills: ['R&D 기획', '정부 과제 관리', '기술 로드맵 수립', '특허 분석', '오픈 이노베이션'] }
  ]
};

const HEADLINE_TEMPLATES_BY_FAMILY = {
  'HR': [
    '{company}에서 {role}로 근무하며 구성원의 성장을 돕는 HR 전문 파트너',
    '데이터 기반의 피플 애널리틱스와 조직 활성화를 주도하는 {role} | Ex-{pastCompany}',
    '인재 수집부터 브랜딩까지, 스타트업과 대기업을 넘나드는 {role}의 전문가',
    '{company} {role} | 사람과 비즈니스를 연결하는 전략적 HR 파트너'
  ],
  '마케팅': [
    '{company}에서 {role}로 ROAS {percent}% 성장을 일군 마케팅 에반젤리스트',
    '콘텐츠에서 데이터 분석까지, 매출을 견인하는 풀스택 {role} | Ex-{pastCompany}',
    '소비자 맥락을 짚는 캠페인을 설계하는 {company} {role} | 브랜딩 전문가',
    '그로스 해킹과 마케팅 자동화로 DAU 10배 성장을 경험한 {role}'
  ],
  '영업': [
    '전략적 파트너십과 가치 기반 세일즈로 연간 매출 목표 {percent}% 초과 달성한 {role}',
    '전통 대기업 B2B부터 글로벌 IT 기업까지 섭렵한 {company} {role}',
    '해외 시장 개척과 강력한 파이프라인 관리로 연 {revenue}억 추가 매출을 이끈 {role}',
    '고객 만족과 지속 가능한 파트너 관계를 최우선으로 생각하는 {role} | Ex-{pastCompany}'
  ],
  'R&D': [
    '{company}에서 {role}로 차세대 핵심 기술 특허와 {tech} 모델 설계를 주도하는 엔지니어',
    '글로벌 제조 도메인에서 수율 {percent}% 개선을 성공시킨 실전형 R&D {role}',
    '기술과 비즈니스의 교차로에서 혁신을 만드는 {company} {role} | Ex-{pastCompany}',
    '연구실 논문에서 양산 제품 상용화까지 전 과정을 리드한 {role}'
  ]
};

const INSIGHTS_BY_FAMILY = {
  'HR': [
    "초기 커리어 단계에서는 채용 실무나 급여 운영 같은 '확실한 기초 오퍼레이션'을 다지는 것이 좋습니다. 이후 비즈니스 파트너(HRBP)로 나아갈 때 강력한 뼈대가 됩니다.",
    "인사 기획이나 제도 수립 단계로 올라가기 위해서는 단순 감에 의존하는 것이 아니라 사내 인사 데이터를 정량화하여 설득하는 '피플 애널리틱스' 역량을 꼭 채워 넣으세요.",
    "회사의 비즈니스 모델을 모르면 HR은 단순 지원 부서에 그칩니다. 사업 부서 리더들과 적극적으로 커피챗을 나누고 비즈니스 도메인 지식을 확장하는 것이 HRBP의 핵심입니다."
  ],
  '마케팅': [
    "퍼포먼스 마케팅에만 매몰되면 미디어 믹스 셔플러가 될 위험이 있습니다. 결국 '브랜드 가치'와 '콘텐츠 메시지'의 본질이 무엇인지 철저히 탐구해 T자형 마케터로 나아가야 합니다.",
    "숫자 뒤에 숨은 소비자 심리를 포착하는 것이 진정한 데이터 분석입니다. GA 대시보드 뷰어에 머무르지 말고, 타겟 고객군 FGI나 정성적 피드백을 수집하는 연습을 병행하세요.",
    "스타트업의 빠른 속도와 대기업의 체계적 브랜딩 구조를 둘 다 경험해 보는 것은 CMO 포지션으로 도약할 수 있는 가장 훌륭한 치트키 커리어 경로입니다."
  ],
  '영업': [
    "단순 가격 네고로 파는 영업은 롱런하기 어렵습니다. 고객사 비즈니스의 치명적인 Pain Point를 함께 고민하고 기술/가치 제안을 제시할 수 있는 솔루션 파트너가 되어야 합니다.",
    "B2B 대형 영업(KAM)으로 도약하려면 영업 파이프라인을 수학적으로 관리하는 시스템적 사고(RevOps)가 중요합니다. 실적 분석 대시보드를 직접 설계해 보세요.",
    "해외 영업은 언어 장벽을 넘어 '현지 문화와 파트너 비즈니스 관행'에 대한 깊은 공감이 필수적입니다. 본사 채널 관리 경험이 해외 바이어 설득에 엄청난 밑바탕이 됩니다."
  ],
  'R&D': [
    "연구실 수준의 고도화된 스킬도 훌륭하지만, 결국 '공정과 양산(현장)'의 요구 조건과 정합되지 않으면 무용지물입니다. 공정 엔지니어들과의 긴밀한 교류로 실 상용화 허들을 먼저 이해하세요.",
    "AI/SW 엔지니어로 롱런하려면 단순 코더를 넘어 비즈니스 가치를 설계하는 '아키텍트'로 진화해야 합니다. 대형 프로젝트 기획 단계에 적극적으로 옵저버로 참여해 보세요.",
    "소재 분석 분야에서 한 우물만 파는 것도 훌륭하나, 신소재 연구에 머무르지 않고 'R&D 기획 및 기술 경영' 과목이나 특허 포트폴리오 설계를 겸험하면 임원 승진에 매우 유리합니다."
  ]
};

const MATCH_BASIS_TEMPLATES = [
  "김선영 님의 퍼포먼스 광고 및 데이터 분석 스킬과 {matchPercent}% 호환되는 완벽한 성장 모델입니다.",
  "박지훈 님의 채용 실무 연차에 딱 맞는 다음 경력 단계(HRBP 전환)의 정석적인 이정표입니다.",
  "보유하신 3대 강점 스킬의 레벨 업 및 목표 직무로의 연착륙을 돕는 추천 벤치마크 대상입니다.",
  "전통 대기업에서 테크 스타트업으로 이직에 성공하며 평균 체류 기간을 극대화한 모범 사례입니다."
];

// ───────────── 헬퍼 함수 ─────────────
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

// ───────────── 데이터 생성 로직 ─────────────
const profiles = [];

for (let i = 1; i <= 600; i++) {
  // 4개 직무군 순환 배정 (각 50명 균등)
  const family = FAMILIES[(i - 1) % 4];
  
  const isFemale = Math.random() < 0.5;
  const lastName = pick(LAST_NAMES);
  const firstName = pick(isFemale ? FIRST_NAMES_F : FIRST_NAMES_M);
  const engFirstName = pick(isFemale ? ENGLISH_FIRST_NAMES_F : ENGLISH_FIRST_NAMES_M);
  const name = `${lastName}${firstName} (${engFirstName} ${lastName})`;

  // 직무 역할 및 스킬 선택
  const roles = ROLES_BY_FAMILY[family];
  const roleObj = pick(roles);
  const currentRole = roleObj.title;
  
  // 회사 선택 (현 직장 및 이전 직장 2~3개)
  const myCompanies = pickN(COMPANIES, 4);
  const currentCompany = myCompanies[0];
  const pastCompanies = myCompanies.slice(1);

  // 연차 설정 (3년 ~ 15년)
  const yearsExperience = rand(3, 15);
  
  // 이력 타임라인 (careerSequence) 구성
  const careerSequence = [];
  let remainingYears = yearsExperience;
  
  // 1단계: 신입/사원 시절
  const entryYears = Math.min(rand(2, 3), remainingYears);
  remainingYears -= entryYears;
  const entryRole = family === 'R&D' ? 'Junior Research Engineer' : family === '영업' ? 'B2B Sales Associate' : 'Associate';
  careerSequence.push({
    title: `${entryRole} (${entryYears}년)`,
    company: pastCompanies[1] || '중소기업'
  });

  // 2단계: 선임/대리/과장 시절 (연차가 충분히 쌓인 경우)
  if (remainingYears > 0) {
    const midYears = Math.min(rand(3, 5), remainingYears);
    remainingYears -= midYears;
    const midRole = family === 'R&D' ? 'R&D Researcher' : family === '마케팅' ? 'Digital Marketing Specialist' : 'Account Manager';
    careerSequence.push({
      title: `${midRole} (${midYears}년)`,
      company: pastCompanies[0] || '중견기업'
    });
  }

  // 3단계: 현재 직책
  const currentYears = Math.max(1, remainingYears);
  careerSequence.push({
    title: `${currentRole} (${currentYears}년)`,
    company: currentCompany
  });

  // 단순 텍스트로 보일 수 있도록 체인 스트링도 병행 정의
  const chainString = careerSequence.map(seq => `${seq.company} ${seq.title}`).join(' → ');

  // 전문 역량 설정
  const familySkills = roleObj.skills;
  const skills = pickN(familySkills, rand(3, 4));
  skills.push(pick(['Project Management', 'Data Analytics', 'Communication', 'Agile'])); // 공통 역량 1개 추가

  // 헤드라인 템플릿 적용
  const templates = HEADLINE_TEMPLATES_BY_FAMILY[family];
  let headline = pick(templates)
    .replace('{company}', currentCompany)
    .replace('{role}', currentRole)
    .replace('{pastCompany}', pastCompanies[0] || '스타트업')
    .replace('{percent}', String(rand(120, 320)))
    .replace('{revenue}', String(rand(5, 50)))
    .replace('{tech}', pick(['LLM', 'AI Agent', 'Materials Engineering', 'Digital Twin']))
    .replace('{percent}', String(rand(8, 25)));

  // 매칭 정보 채우기
  const matchScore = rand(76, 98);
  const matchBasis = pick(MATCH_BASIS_TEMPLATES).replace('{matchPercent}', String(matchScore));
  const bio = pick(INSIGHTS_BY_FAMILY[family]);

  profiles.push({
    id: `LNK_${String(i).padStart(3, '0')}`,
    name,
    gender: isFemale ? 'F' : 'M',
    family,
    currentCompany,
    currentRole,
    yearsExperience,
    headline,
    careerSequence: careerSequence.map(seq => `${seq.company} ${seq.title}`), // 가독성 높은 배열
    skills,
    keyInsight: bio,
    matchScore,
    matchBasis
  });
}

// ───────────── 파일 쓰기 ─────────────
const DATA_DIR = './src/data';
const FILE_PATH = join(DATA_DIR, 'linkedin-profiles.json');

try {
  // src/data 폴더가 없으면 생성
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE_PATH, JSON.stringify(profiles, null, 2), 'utf-8');
  console.log(`✅ 600명 LinkedIn 가상 프로필 생성 완료: ${FILE_PATH}`);
} catch (error) {
  console.error(`❌ 파일 쓰기 에러 발생: ${error.message}`);
}

// ───────────── 엑셀 파일 쓰기 (사용자가 PC에서 바로 열 수 있는 대형 600명 Excel 구축) ─────────────
try {
  const excelData = profiles.map(profile => ({
    '아이디': profile.id,
    '이름': profile.name,
    '직무군': profile.family,
    '현 회사': profile.currentCompany,
    '현 직무': profile.currentRole,
    '총 경력(년)': profile.yearsExperience,
    '프로필 헤드라인': profile.headline,
    '이전 경력 경로': profile.careerSequence.join(' → '),
    '보유 전문 스킬': profile.skills.join(', '),
    'AI 매칭 적합도(%)': profile.matchScore,
    'AI 추천 사유': profile.matchBasis,
    '사외 선배 조언(Insight)': profile.keyInsight
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'LinkedIn 시장 벤치마크 (600명)');

  // 열 넓이 자동 조정
  const colWidths = [
    { wch: 10 }, // 아이디
    { wch: 22 }, // 이름
    { wch: 10 }, // 직무군
    { wch: 25 }, // 현 회사
    { wch: 25 }, // 현 직무
    { wch: 12 }, // 총 경력
    { wch: 55 }, // 헤드라인
    { wch: 60 }, // 이전 경력
    { wch: 45 }, // 보유 스킬
    { wch: 18 }, // 매칭 적합도
    { wch: 60 }, // 매칭 사유
    { wch: 80 }  // 선배 조언
  ];
  worksheet['!cols'] = colWidths;

  const EXCEL_PATH = './LinkedIn_Profiles_600.xlsx';
  XLSX.writeFile(workbook, EXCEL_PATH);
  console.log(`✅ 600명 LinkedIn 엑셀 파일 로컬 생성 완료: ${EXCEL_PATH}`);
} catch (err) {
  console.error(`❌ 엑셀 파일 쓰기 에러 발생: ${err.message}`);
}
