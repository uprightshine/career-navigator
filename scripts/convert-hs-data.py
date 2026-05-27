"""
HS본부 개인업무경험데이터 → Career Navigator 25대 표준 직무 지능형 매핑 스크립트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
보안 및 정합성 원칙:
  - 실제 사번은 순차 익명 ID(HS-EMP-XXXX)로 변환됩니다.
  - 성명은 마스킹 처리("김*영")하여 개인정보 노출을 방지합니다.
  - 엑셀의 복잡하고 비표준적인 상세 직무명들을 초기의 정갈하고 완벽한 "25대 표준 직무 체계"로 지능적 분류(Clustering) 매핑합니다.
  - 이를 통해 6,120명의 실제 사원이 초기의 아름다운 25개 성장 경로를 그리며 역동적으로 움직이도록 빌드합니다.
  - 출력 JSON은 .gitignore에 등록되어 git에 포함되지 않습니다.
"""

import sys
# 윈도우 터미널 유니코드(한글/이모지) 출력 에러 방지
sys.stdout.reconfigure(encoding='utf-8')

import openpyxl
import json
import hashlib
import os
import re
from collections import defaultdict

# ─── 경로 설정 ────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
EXCEL_PATH = os.path.join(ROOT_DIR, "HS본부 개인업무경험데이터(~25년도)_v0.1.xlsx")
OUT_EMPLOYEES = os.path.join(ROOT_DIR, "src", "data", "hs-employees.json")
OUT_COMPRESSED_EMPLOYEES = os.path.join(ROOT_DIR, "src", "data", "hs-employees-compressed.json")
OUT_PERSONAS = os.path.join(ROOT_DIR, "src", "data", "hs-personas.json")
OUT_JOBS = os.path.join(ROOT_DIR, "src", "data", "hs-jobs.json")
OUT_MOVEMENTS = os.path.join(ROOT_DIR, "src", "data", "hs-movements.json")

# ─── 사번 익명화 ──────────────────────────────────────────────
_anon_map = {}
_anon_counter = [1]

def anonymize_emp(emp_no: str) -> str:
    if emp_no not in _anon_map:
        _anon_map[emp_no] = f"HS-EMP-{_anon_counter[0]:04d}"
        _anon_counter[0] += 1
    return _anon_map[emp_no]

# ─── 성명 가명화 ──────────────────────────────────────────────
def anonymize_name(name: str, anon_id: str) -> str:
    if not name or name == "None":
        return f"임직원_{anon_id.split('-')[-1]}"
    name = name.strip()
    if len(name) >= 3:
        return name[0] + "*" + name[2:]
    elif len(name) == 2:
        return name[0] + "*"
    return name

# ─── 직급 정규화 ──────────────────────────────────────────────
GRADE_MAP = {
    "연구원": "사원", "사원": "사원",
    "선임연구원": "선임", "선임": "선임",
    "책임연구원": "책임", "책임": "책임",
    "수석연구원": "수석", "수석": "수석",
    "책임기호칭": "책임",
    "#N/A": "선임",
}

def normalize_grade(호칭: str) -> str:
    if not 호칭 or 호칭 == "None":
        return "선임"
    return GRADE_MAP.get(호칭.strip(), "선임")

def career_intent_from_grade(grade: str) -> str:
    if grade == "수석":
        return "leadership"
    elif grade == "책임":
        return "specialist"
    elif grade == "선임":
        return "explorer"
    return "unsure"

# ─── 초기 기획된 아름다운 25대 표준 직무 정의 ──────────────────
STANDARD_JOBS = {
    # 👥 HR 직무군 (7개)
    'JOB_HR_RECRUIT':   {'name': '채용', 'family': 'HR', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'stable', 'description': '채용 전략 수립, ATS 운영, 면접 프로세스 관리'},
    'JOB_HR_HRD':       {'name': 'HRD', 'family': 'HR', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'growing', 'description': '교육 체계 설계, 리더십 개발, 조직개발 프로그램 운영'},
    'JOB_HR_HRBP':      {'name': 'HRBP', 'family': 'HR', 'level': '책임', 'isHub': True, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'growing', 'description': '사업부 밀착형 HR 파트너로서 인사 전략 수립 및 실행'},
    'JOB_HR_CNB':       {'name': 'C&B', 'family': 'HR', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'stable', 'description': '보상 체계 설계, 복리후생 운영, 시장 보상 벤치마크'},
    'JOB_HR_LABOR':     {'name': '노무관리', 'family': 'HR', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': True, 'growthTrend': 'declining', 'description': '노사관계 관리, 근로기준법 준수, 노동 분쟁 대응'},
    'JOB_HR_PLAN':      {'name': '인사기획', 'family': 'HR', 'level': '책임', 'isHub': False, 'isLeadership': True, 'isDeadEnd': False, 'growthTrend': 'stable', 'description': '중장기 인사 전략 수립, 인력 계획, 제도 기획'},
    'JOB_HR_ANALYTICS': {'name': 'HR Analytics', 'family': 'HR', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'growing', 'description': 'HR 데이터 분석, People Analytics, 의사결정 지원'},

    # 📢 마케팅 직무군 (6개)
    'JOB_MKT_PERF':     {'name': '퍼포먼스 마케팅', 'family': '마케팅', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'growing', 'description': '디지털 광고 캠페인 기획·집행·최적화, ROAS 관리'},
    'JOB_MKT_BRAND':    {'name': '브랜드 마케팅', 'family': '마케팅', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'stable', 'description': '브랜드 전략 수립, 브랜드 캠페인 기획, 브랜드 가치 관리'},
    'JOB_MKT_CONTENT':  {'name': '콘텐츠 마케팅', 'family': '마케팅', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'growing', 'description': '콘텐츠 전략, SNS 운영, 영상/블로그/뉴스레터 기획·제작'},
    'JOB_MKT_CRM':      {'name': 'CRM 마케팅', 'family': '마케팅', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'growing', 'description': '고객 세그먼테이션, 리텐션 캠페인, CRM 시스템 운영'},
    'JOB_MKT_PM':       {'name': '통합 마케팅 PM', 'family': '마케팅', 'level': '책임', 'isHub': True, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'growing', 'description': '전사 마케팅 캠페인 총괄, 채널 통합 전략, 예산 관리'},
    'JOB_MKT_STRATEGY': {'name': '마케팅 전략', 'family': '마케팅', 'level': '책임', 'isHub': False, 'isLeadership': True, 'isDeadEnd': False, 'growthTrend': 'stable', 'description': '시장 분석, 마케팅 전략 수립, CMO 보좌'},

    # 🤝 영업 직무군 (6개)
    'JOB_SALES_NEW':     {'name': '신규영업', 'family': '영업', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'stable', 'description': '신규 고객 발굴, 제안서 작성, 영업 파이프라인 관리'},
    'JOB_SALES_KAM':     {'name': 'KAM', 'family': '영업', 'level': '책임', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'stable', 'description': '핵심 고객 관계 관리, 장기 파트너십 구축, 매출 극대화'},
    'JOB_SALES_PLAN':    {'name': '영업기획', 'family': '영업', 'level': '책임', 'isHub': True, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'growing', 'description': '영업 전략 수립, 실적 분석, 인센티브 설계'},
    'JOB_SALES_CHANNEL': {'name': '채널영업', 'family': '영업', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'stable', 'description': '유통 채널 관리, 파트너사 협업, 채널별 매출 관리'},
    'JOB_SALES_MGMT':    {'name': '영업관리', 'family': '영업', 'level': '책임', 'isHub': False, 'isLeadership': True, 'isDeadEnd': False, 'growthTrend': 'stable', 'description': '영업 조직 관리, CRM 시스템 운영, 매출 예측'},
    'JOB_SALES_OVERSEAS':{'name': '해외영업', 'family': '영업', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'growing', 'description': '해외 시장 개척, 수출 관리, 현지 파트너 관리'},

    # 🔬 R&D 직무군 (6개)
    'JOB_RND_MATERIAL': {'name': '소재연구', 'family': 'R&D', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'stable', 'description': '신소재 탐색, 소재 물성 분석, 시제품 제작'},
    'JOB_RND_PROCESS':  {'name': '공정개발', 'family': 'R&D', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'stable', 'description': '제조 공정 설계, 공정 최적화, 수율 개선'},
    'JOB_RND_MASS':     {'name': '양산기술', 'family': 'R&D', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': True, 'growthTrend': 'declining', 'description': '양산 라인 기술 지원, 생산성 향상, 불량 분석'},
    'JOB_RND_QUALITY':  {'name': '품질R&D', 'family': 'R&D', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'stable', 'description': '품질 표준 수립, 신뢰성 시험, 품질 데이터 분석'},
    'JOB_RND_PLAN':     {'name': 'R&D기획', 'family': 'R&D', 'level': '책임', 'isHub': True, 'isLeadership': True, 'isDeadEnd': False, 'growthTrend': 'growing', 'description': 'R&D 로드맵 수립, 과제 관리, 기술 전략'},
    'JOB_RND_AI':       {'name': 'AI/SW개발', 'family': 'R&D', 'level': '실무자', 'isHub': False, 'isLeadership': False, 'isDeadEnd': False, 'growthTrend': 'growing', 'description': 'AI 모델 개발, SW 설계, MLOps 구축'},
}

# ─── 지능형 25대 표준 직무 매퍼 분류 사전 ──────────────────────
MAPPING_KEYWORDS = {
    # 👥 HR
    'JOB_HR_RECRUIT':   ["채용", "면접", "리크루팅", "소싱", "채용브랜딩", "recru", "recruit"],
    'JOB_HR_HRD':       ["교육", "훈련", "육성", "리더십개발", "lms", "교수설계", "hrd", "l&d"],
    'JOB_HR_HRBP':      ["hrbp", "인사파트너", "조직문화", "조직개발", "od", "피플파트너"],
    'JOB_HR_CNB':       ["보상", "급여", "임금", "평가", "연봉", "복리후생", "c&b", "cnb", "복생"],
    'JOB_HR_LABOR':     ["노무", "노사", "근로기준", "노동조합", "er", "징계", "노사관"],
    'JOB_HR_PLAN':      ["인사기획", "인사제도", "정원관리", "hr기획", "인사운영", "인력계획", "기획", "전략", "경영기획"],
    'JOB_HR_ANALYTICS': ["hr데이터", "피플분석", "people analytics", "인사분석", "analytics", "데이터분석"],

    # 📢 마케팅
    'JOB_MKT_PERF':     ["퍼포먼스", "광고", "roas", "ga", "cpc", "디지털광고", "analytics"],
    'JOB_MKT_BRAND':    ["브랜드", "브랜딩", "brand", "bi", "ci", "브랜드캠페인"],
    'JOB_MKT_CONTENT':  ["콘텐츠", "sns", "유튜브", "카드뉴스", "카피라이트", "영상기획", "content"],
    'JOB_MKT_CRM':      ["crm", "리텐션", "고객여정", "푸시알림", "리타겟", "mail"],
    'JOB_MKT_PM':       ["통합마케팅", "마케팅pm", "캠페인pm", "imc", "pm", "총괄"],
    'JOB_MKT_STRATEGY': ["마케팅전략", "시장분석", "cmo", "경쟁사분석", "전략"],

    # 🤝 영업
    'JOB_SALES_NEW':     ["B2B영업", "신규영업", "개척", "제안서", "수주", "sales", "영업"],
    'JOB_SALES_KAM':     ["kam", "key account", "핵심고객", "vip고객", "어카운트"],
    'JOB_SALES_PLAN':    ["영업기획", "영업전략", "실적분석", "영업지원", "목표관리", "기획"],
    'JOB_SALES_CHANNEL': ["채널영업", "대리점", "파트너영업", "유통영업", "총판"],
    'JOB_SALES_MGMT':    ["영업관리", "매출관리", "수금", "계약관리", "출하"],
    'JOB_SALES_OVERSEAS':["해외영업", "글로벌영업", "무역", "수출", "바이어", "바이어발굴"],

    # 🔬 R&D
    'JOB_RND_MATERIAL': ["소재", "재료", "소자", "반도체소재", "화학소재", "물성", "material"],
    'JOB_RND_PROCESS':  ["공정", "공정설계", "패키징", "반도체공정", "수율", "process"],
    'JOB_RND_MASS':     ["양산", "설비기술", "양산기술", "불량분석", "스마트팩토리", "제조"],
    'JOB_RND_QUALITY':  ["품질R&D", "신뢰성", "품질보증", "qa", "품질관리", "quality"],
    'JOB_RND_PLAN':     ["R&D기획", "연구기획", "R&D전략", "기술전략", "특허", "로드맵"],
    'JOB_RND_AI':       ["AI", "SW", "소프트웨어", "코딩", "알고리즘", "딥러닝", "개발", "embedded", "firmware"],
}

# ─── 4대 대분류 1차 판별기 ────────────────────────────────────
def get_macro_family(jg: str, jf: str, jn: str) -> str:
    jg = str(jg).strip() if jg else ""
    jf = str(jf).strip() if jf else ""
    jn = str(jn).strip() if jn else ""
    
    # HR 대분류군
    if jg in ["HR", "경영기획/관리", "경영전략", "경영지원", "Finance", "업무혁신", "Audit", "홍보/대외협력", "법무", "정보보호", "경영기획/전략", "회계", "기획"]:
        return "HR"
    # 마케팅 대분류군
    if jg in ["Marketing", "마케팅"]:
        return "마케팅"
    # 영업 대분류군
    if jg in ["Sales", "SCM", "구매", "Customer Service", "Contents&Service", "Community", "SCM개선", "Sales 직무그룹"]:
        return "영업"
    # R&D 대분류군
    if jg in ["기구", "SW", "Quality", "냉동/공조", "생산", "회로", "전력변환", "상품기획", "Appliance System Control", 
             "R&D Strategy", "소자/ 재료", "로보틱스", "SoC", "SHEE", "데이터", "클라우드", "Clean Tech", 
             "건강/위생", "인공지능", "진동/소음", "UX", "공정 / 가공", "오디오", "통신/ 미디어 표준", 
             "Project Management", "Bio-IT", "금형", "디자인", "생산시스템", "화질", "LSR", 
             "SW 응용", "기계설계", "전기전자 응용", "재료 응용", "특허", "기술", "R&D"]:
        return "R&D"
        
    combined = (jg + " " + jf + " " + jn).lower()
    if any(k in combined for k in ["인사", "채용", "교육", "훈련", "노사", "노무", "급여", "복리", "복생", "인재", "hr", "talent", "recru", "l&d"]):
        return "HR"
    if any(k in combined for k in ["마케팅", "브랜드", "홍보", "컨텐츠", "spons", "adverti", "market"]):
        return "마케팅"
    if any(k in combined for k in ["영업", "판매", "세일즈", "sales", "딜러", "리테일", "고객", "c/s", "구매", "물류", "scm", "조달"]):
        return "영업"
    return "R&D"

# ─── 지능형 25대 표준 직무 매칭기 (Scoring 기반) ───────────────
def match_standard_job(jg: str, jf: str, jn: str, exp_text: str) -> str:
    jg = str(jg).lower() if jg else ""
    jf = str(jf).lower() if jf else ""
    jn = str(jn).lower() if jn else ""
    exp_text = str(exp_text).lower() if exp_text else ""
    
    combined = jg + " " + jf + " " + jn + " " + exp_text
    
    # 1. 소속 대분류군 1차 고정
    macro_family = get_macro_family(jg, jf, jn)
    
    # 해당 대분류군에 소속된 표준 직무들만 매칭 후보군으로 선택
    candidates = [jid for jid, info in STANDARD_JOBS.items() if info['family'] == macro_family]
    
    best_jid = None
    max_score = -1
    
    for jid in candidates:
        keywords = MAPPING_KEYWORDS.get(jid, [])
        score = 0
        for kw in keywords:
            # 키워드가 텍스트에 포함될 때마다 점수 누적
            if kw.lower() in combined:
                score += 3 if kw.lower() in jn else 1 # 직무명에 직접 포함되면 높은 가중치
        
        if score > max_score:
            max_score = score
            best_jid = jid
            
    # 매치되는 키워드가 전혀 없거나 동점일 경우, 해당 대분류군별 대표 직무로 맵핑(Fallback)
    if best_jid is None or max_score == 0:
        if macro_family == "HR":
            return "JOB_HR_PLAN" # 인사기획 대표
        elif macro_family == "마케팅":
            return "JOB_MKT_PM" # 통합 마케팅 PM 대표
        elif macro_family == "영업":
            return "JOB_SALES_PLAN" # 영업기획 대표
        else:
            return "JOB_RND_AI" # AI/SW개발 대표
            
    return best_jid

# ─── 25대 표준 직무별 리얼 스킬 정의 ──────────────────────────────
JOB_SKILLS_MAP = {
    # 👥 HR
    'JOB_HR_RECRUIT':   [{"skillId": "SK_HR_01", "name": "ATS 운영"}, {"skillId": "SK_HR_02", "name": "면접 코디네이션"}, {"skillId": "SK_HR_03", "name": "채용 브랜딩"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}],
    'JOB_HR_HRD':       [{"skillId": "SK_HR_04", "name": "인력 계획"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}],
    'JOB_HR_HRBP':      [{"skillId": "SK_HR_04", "name": "인력 계획"}, {"skillId": "SK_HR_05", "name": "HR 데이터 분석"}, {"skillId": "SK_HR_06", "name": "조직 진단"}, {"skillId": "SK_HR_07", "name": "성과 관리"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}, {"skillId": "SK_COMMON_06", "name": "전략 수립"}],
    'JOB_HR_CNB':       [{"skillId": "SK_HR_04", "name": "인력 계획"}, {"skillId": "SK_COMMON_01", "name": "데이터 분석"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}],
    'JOB_HR_LABOR':     [{"skillId": "SK_HR_04", "name": "인력 계획"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}],
    'JOB_HR_PLAN':      [{"skillId": "SK_HR_04", "name": "인력 계획"}, {"skillId": "SK_HR_07", "name": "성과 관리"}, {"skillId": "SK_COMMON_06", "name": "전략 수립"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}],
    'JOB_HR_ANALYTICS': [{"skillId": "SK_HR_05", "name": "HR 데이터 분석"}, {"skillId": "SK_COMMON_01", "name": "데이터 분석"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}],

    # 📢 마케팅
    'JOB_MKT_PERF':     [{"skillId": "SK_MKT_01", "name": "퍼포먼스 광고"}, {"skillId": "SK_MKT_02", "name": "GA 분석"}, {"skillId": "SK_COMMON_01", "name": "데이터 분석"}],
    'JOB_MKT_BRAND':    [{"skillId": "SK_MKT_05", "name": "브랜드 전략"}, {"skillId": "SK_MKT_03", "name": "콘텐츠 기획"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}, {"skillId": "SK_COMMON_05", "name": "시장 분석"}],
    'JOB_MKT_CONTENT':  [{"skillId": "SK_MKT_03", "name": "콘텐츠 기획"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}],
    'JOB_MKT_CRM':      [{"skillId": "SK_MKT_04", "name": "CRM 마케팅"}, {"skillId": "SK_COMMON_01", "name": "데이터 분석"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}],
    'JOB_MKT_PM':       [{"skillId": "SK_MKT_01", "name": "퍼포먼스 광고"}, {"skillId": "SK_MKT_05", "name": "브랜드 전략"}, {"skillId": "SK_MKT_03", "name": "콘텐츠 기획"}, {"skillId": "SK_MKT_04", "name": "CRM 마케팅"}, {"skillId": "SK_COMMON_01", "name": "데이터 분석"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}, {"skillId": "SK_COMMON_04", "name": "예산 관리"}],
    'JOB_MKT_STRATEGY': [{"skillId": "SK_MKT_05", "name": "브랜드 전략"}, {"skillId": "SK_COMMON_01", "name": "데이터 분석"}, {"skillId": "SK_COMMON_05", "name": "시장 분석"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}, {"skillId": "SK_COMMON_06", "name": "전략 수립"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}],

    # 🤝 영업
    'JOB_SALES_NEW':     [{"skillId": "SK_SALES_01", "name": "B2B 영업"}, {"skillId": "SK_SALES_05", "name": "제안서 작성"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}],
    'JOB_SALES_KAM':     [{"skillId": "SK_SALES_02", "name": "고객관계관리"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}],
    'JOB_SALES_PLAN':    [{"skillId": "SK_SALES_03", "name": "영업 전략"}, {"skillId": "SK_COMMON_01", "name": "데이터 분석"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}],
    'JOB_SALES_CHANNEL': [{"skillId": "SK_SALES_04", "name": "채널 관리"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}],
    'JOB_SALES_MGMT':    [{"skillId": "SK_SALES_03", "name": "영업 전략"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}],
    'JOB_SALES_OVERSEAS':[{"skillId": "SK_SALES_01", "name": "B2B 영업"}, {"skillId": "SK_COMMON_07", "name": "비즈니스영어"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}],

    # 🔬 R&D
    'JOB_RND_MATERIAL': [{"skillId": "SK_RND_01", "name": "소재 분석"}, {"skillId": "SK_RND_05", "name": "실험설계"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}],
    'JOB_RND_PROCESS':  [{"skillId": "SK_RND_02", "name": "공정 설계"}, {"skillId": "SK_RND_05", "name": "실험설계"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}],
    'JOB_RND_MASS':     [{"skillId": "SK_RND_03", "name": "양산 관리"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}],
    'JOB_RND_QUALITY':  [{"skillId": "SK_RND_04", "name": "품질 관리"}, {"skillId": "SK_RND_06", "name": "통계 분석"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}],
    'JOB_RND_PLAN':     [{"skillId": "SK_RND_07", "name": "R&D 기획력"}, {"skillId": "SK_COMMON_02", "name": "프로젝트 관리"}, {"skillId": "SK_COMMON_03", "name": "커뮤니케이션"}],
    'JOB_RND_AI':       [{"skillId": "SK_RND_08", "name": "AI/ML"}, {"skillId": "SK_RND_09", "name": "SW 개발"}, {"skillId": "SK_COMMON_01", "name": "데이터 분석"}],
}

# ─── 스킬 추출 ──────────────────────────────────────────────
def extract_skills(job_id: str) -> list:
    std_skills = JOB_SKILLS_MAP.get(job_id, [])
    skills = []
    for s in std_skills:
        skills.append({
            "skillId": s["skillId"],
            "name": s["name"],
            "level": 3
        })
    return skills

# ─── 메인 변환 로직 ───────────────────────────────────────────
def convert():
    print("📂 엑셀 파일 읽는 중...")
    wb = openpyxl.load_workbook(EXCEL_PATH, read_only=True, data_only=True)
    ws = wb.worksheets[0]

    headers = None
    emp_records = defaultdict(list)

    total = 0
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            headers = list(row)
            continue
        d = dict(zip(headers, row))
        emp_no = str(d.get("emp_no", "")).strip()
        if not emp_no or emp_no in ("None", ""):
            continue
        emp_records[emp_no].append(d)
        total += 1
        if total % 50000 == 0:
            print(f"  {total:,}행 처리 중...")

    wb.close()
    print(f"✅ 총 {total:,}행, 고유 사번 {len(emp_records)}명 읽기 완료")

    # ─── [1단계] 임직원 가공 및 25대 표준 직무 100% 매핑 ─────────
    employees = []
    job_headcounts = defaultdict(int)
    job_tenures = defaultdict(list)

    for emp_no, records in emp_records.items():
        anon_id = anonymize_emp(emp_no)
        records_sorted = sorted(records, key=lambda r: r.get("YEAR") or 0)
        latest = records_sorted[-1]

        한글명 = anonymize_name(str(latest.get("한글명", "") or ""), anon_id)
        grade = normalize_grade(str(latest.get("호칭", "") or ""))

        dept = str(latest.get("조직", "") or "HS전자")
        if dept in ("None", ""):
            dept = "HS전자"

        org2 = str(latest.get("ORG2(Global)", "") or "")
        biz_unit = org2 if org2 not in ("None", "") else "HS전자"

        jg = str(latest.get("Jobgroup_name", "") or "")
        jf = str(latest.get("Jobfamily_name", "") or "")
        jn = str(latest.get("job_name", "") or "")

        all_work_exp = " ".join([
            str(r.get("Privt_work_experien", "") or "") + " " +
            str(r.get("Integrat_work_experien", "") or "")
            for r in records
        ])

        # 🔒 지능형 25대 표준 직무 매칭기 작동
        job_id = match_standard_job(jg, jf, jn, all_work_exp)
        family_label = STANDARD_JOBS[job_id]["family"]

        # 연도 범위
        all_years = [r.get("YEAR") for r in records if r.get("YEAR")]
        join_year = min(all_years) if all_years else 2016
        current_year = max(all_years) if all_years else 2024
        total_years = max(1, current_year - join_year + 1)
        years_in_role = 1

        # 이동 이력 (25대 표준 직무 기준 지능형 정합)
        year_job = {}
        for r in records_sorted:
            yr = r.get("YEAR")
            rjn = str(r.get("job_name", "") or "")
            rjg = str(r.get("Jobgroup_name", "") or "")
            rjid = match_standard_job(rjg, r.get("Jobfamily_name"), rjn, r.get("Privt_work_experien"))
            
            if yr and rjid:
                year_job[yr] = (rjid, STANDARD_JOBS[rjid]["name"])

        movement_history = []
        prev = None
        for yr in sorted(year_job.keys()):
            jid_yr, jname_yr = year_job[yr]
            if jid_yr != prev:
                movement_history.append({
                    "year": yr,
                    "jobId": jid_yr,
                    "jobName": jname_yr
                })
                prev = jid_yr

        if movement_history:
            years_in_role = current_year - movement_history[-1]["year"] + 1

        skills = extract_skills(job_id)
        if not skills:
            skills = [{
                "skillId": f"SKL_HS_DEFAULT_{family_label}",
                "name": f"{family_label} 핵심역량",
                "level": 3
            }]

        employees.append({
            "id": anon_id,
            "name": 한글명,
            "joinYear": int(join_year),
            "currentJob": job_id,
            "currentJobName": STANDARD_JOBS[job_id]["name"],
            "department": dept,
            "businessUnit": biz_unit,
            "grade": grade,
            "yearsInRole": int(years_in_role),
            "totalYears": int(total_years),
            "evaluationGrade": "A",
            "leadershipPercentile": 50,
            "primarySkill": skills[0]["name"] if skills else jg,
            "skills": skills,
            "certifications": [],
            "education": {"degree": "학사", "major": jg, "school": ""},
            "careerIntent": career_intent_from_grade(grade),
            "cohortPercentile": 50,
            "movementHistory": movement_history,
            "_family": family_label,
            "_jobgroup": jg,
        })
        
        job_headcounts[job_id] += 1
        job_tenures[job_id].append(years_in_role)

    # ─── [2단계] 25대 표준 직무 노드 갱신 및 스킬셋 집계 ─────────
    job_skills_freq = defaultdict(lambda: defaultdict(int))
    skill_info_by_name = {}

    for emp in employees:
        jid = emp["currentJob"]
        for s in emp["skills"]:
            s_name = s["name"]
            job_skills_freq[jid][s_name] += 1
            skill_info_by_name[s_name] = {
                "skillId": s["skillId"],
                "name": s["name"]
            }

    jobs = []
    print("\n⚡ [25대 표준 직무 100% 매핑 결과 및 실 인원 분산 현황]")
    
    for jid, std_node in STANDARD_JOBS.items():
        count = job_headcounts[jid]
        avg_t = round(sum(job_tenures[jid]) / len(job_tenures[jid]), 1) if job_tenures[jid] else 3.5
        
        print(f" • [{std_node['family']}] {std_node['name']}: {count:,}명 전입 (평균 체류: {avg_t}년)")
        
        # 스킬 자동 구성
        freqs = job_skills_freq[jid]
        req_skills = []
        if freqs:
            sorted_skills = sorted(freqs.items(), key=lambda x: x[1], reverse=True)[:4]
            for s_name, _ in sorted_skills:
                info = skill_info_by_name[s_name]
                req_skills.append({
                    "skillId": info["skillId"],
                    "name": info["name"],
                    "minLevel": 3
                })
        
        # 노드 빌드
        jobs.append({
            "id": jid,
            "name": std_node["name"],
            "family": std_node["family"],
            "level": std_node["level"],
            "isHub": std_node["isHub"],
            "isLeadership": std_node["isLeadership"],
            "isDeadEnd": std_node["isDeadEnd"],
            "growthTrend": std_node["growthTrend"],
            "description": std_node["description"],
            "headcount": count,
            "vacancies": 1 if count % 10 == 0 else 0, # 리얼리티 T/O 부여
            "avgTenure": avg_t,
            "requiredSkills": req_skills
        })

    # ─── [3단계] 이동 엣지(movements) 정합 및 25대 직무 간 추출 ─────
    movements_registry = defaultdict(lambda: {
        "from": "",
        "to": "",
        "count": 0,
        "source": "internal",
        "avgYears": 0.0,
        "sameBU": True,
        "years_sum": 0.0
    })

    for emp in employees:
        history = emp["movementHistory"]
        for j in range(len(history) - 1):
            f_job = history[j]["jobId"]
            t_job = history[j+1]["jobId"]
            f_year = history[j]["year"]
            t_year = history[j+1]["year"]
            years = max(1, t_year - f_year)

            if f_job and t_job and f_job != t_job:
                key = (f_job, t_job)
                movements_registry[key]["from"] = f_job
                movements_registry[key]["to"] = t_job
                movements_registry[key]["count"] += 1
                movements_registry[key]["years_sum"] += years
                
                f_family = STANDARD_JOBS[f_job]["family"]
                t_family = STANDARD_JOBS[t_job]["family"]
                movements_registry[key]["sameBU"] = (f_family == t_family)
                movements_registry[key]["source"] = "both" if not movements_registry[key]["sameBU"] else "internal"

    movements = []
    for (fj, tj), val in movements_registry.items():
        val["avgYears"] = round(val["years_sum"] / val["count"], 1)
        del val["years_sum"]
        movements.append(val)

    # ─── 저장 및 압축 진행 ──────────────────────────────────────
    os.makedirs(os.path.dirname(OUT_COMPRESSED_EMPLOYEES), exist_ok=True)

    # 1. 스키마 압축 (Schema Compression) 실행
    compressed_employees = []
    for emp in employees:
        comp_skills = [{"id": s["skillId"], "l": s["level"]} for s in emp["skills"]]
        comp_history = [{"y": h["year"], "j": h["jobId"]} for h in emp["movementHistory"]]
        
        compressed_employees.append({
            "id": emp["id"],
            "n": emp["name"],
            "jy": emp["joinYear"],
            "cj": emp["currentJob"],
            "dept": emp["department"],
            "bu": emp["businessUnit"],
            "g": emp["grade"],
            "yr": emp["yearsInRole"],
            "ty": emp["totalYears"],
            "eg": emp["evaluationGrade"],
            "s": comp_skills,
            "h": comp_history,
            "fam": emp["_family"]
        })

    # 2. 대표 페르소나 추출 (4대 직무 대분류군별 연차별 3명씩, 총 12명 엄선)
    representative_personas = []
    family_groups = defaultdict(list)
    for emp in employees:
        family_groups[emp["_family"]].append(emp)
        
    for fam, members in family_groups.items():
        # 연차 순 정렬
        members_sorted = sorted(members, key=lambda x: x["totalYears"])
        
        juniors = [m for m in members_sorted if m["totalYears"] <= 3]
        mids = [m for m in members_sorted if 4 <= m["totalYears"] <= 8]
        seniors = [m for m in members_sorted if m["totalYears"] >= 9]
        
        if juniors:
            representative_personas.append(juniors[0])
        elif members_sorted:
            representative_personas.append(members_sorted[0])
            
        if mids:
            representative_personas.append(mids[len(mids) // 2])
        elif len(members_sorted) > 1:
            representative_personas.append(members_sorted[len(members_sorted) // 2])
            
        if seniors:
            representative_personas.append(seniors[-1])
        elif len(members_sorted) > 2:
            representative_personas.append(members_sorted[-1])

    # 기존 무압축 거대 임직원 파일 제거
    if os.path.exists(OUT_EMPLOYEES):
        try:
            os.remove(OUT_EMPLOYEES)
        except Exception:
            pass

    # 3. 파일 저장
    with open(OUT_COMPRESSED_EMPLOYEES, "w", encoding="utf-8") as f:
        json.dump(compressed_employees, f, ensure_ascii=False, indent=2)

    with open(OUT_PERSONAS, "w", encoding="utf-8") as f:
        json.dump(representative_personas, f, ensure_ascii=False, indent=2)

    with open(OUT_JOBS, "w", encoding="utf-8") as f:
        json.dump(jobs, f, ensure_ascii=False, indent=2)

    with open(OUT_MOVEMENTS, "w", encoding="utf-8") as f:
        json.dump(movements, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 25대 정갈한 표준 직무 지능형 분류 및 스키마 압축 완료!")
    print(f"   전체 직원 수:      {len(employees)}명 (압축 완료 ➡ {OUT_COMPRESSED_EMPLOYEES})")
    # 윈도우 한글/이모지 터미널 깨짐 방지용 출력 조정
    print(f"   대표 페르소나 수:  {len(representative_personas)}명 (uncompressed ➡ {OUT_PERSONAS})")
    print(f"   표준 직무 노드:    {len(jobs)}개")
    print(f"   정합 이동 엣지:    {len(movements)}개")

if __name__ == "__main__":
    convert()
