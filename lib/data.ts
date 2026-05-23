// Local fallback data used before the mock or real API response is loaded.

export type TagColor = "amber" | "blue" | "green" | "rose" | "violet" | "gray";

export type Persona = {
  id: string;
  name: string;
  relation: string;
  tone?: string;
  notes?: string;
  email?: string;
  source?: "manual" | "contacts" | string;
  createdAt?: string;
  updatedAt?: string;
  role: string;
  mbti: string;
  avatar: string;
  color: string;
  keywords: string[];
  avoid: string[];
  prefer: string;
  channel: string;
  lastUsed: string;
  tagColor: TagColor;
};

export type Scenario = {
  brief: string;
};

export type MailFormat = {
  signature: string;
  greeting: string;
  closing: string;
  structure: string;
  bulletStyle: string;
  language: string;
};

export type HistoryItem = {
  id: string;
  personaId: string | null;
  replyContextId?: string | null;
  targetName?: string | null;
  targetEmail?: string | null;
  personaName?: string | null;
  personaEmail?: string | null;
  replyFromAddr?: string | null;
  replySubject?: string | null;
  brief?: string;
  subject?: string;
  body?: string;
  status?: "draft" | "sent" | string;
  createdAt?: string;
  sentAt?: string | null;
  subj: string;
  prev: string;
  tone: string;
  toneValue?: number;
  length: string;
  lengthValue?: number;
  when: string;
};

export const MELLO_PERSONAS: Persona[] = [
  {
    id: "lead",
    name: "김지훈 팀장",
    relation: "회사 · 직속 상사",
    role: "백엔드 챕터 리드",
    mbti: "ENTJ",
    avatar: "KJ",
    color: "#e8dfd1",
    keywords: ["결과 중심", "직설적", "결론 먼저", "긴 설명 싫어함"],
    avoid: ["변명조 표현", "“혹시…” 같은 모호한 시작"],
    prefer: "결론 → 일정 → 근거 순서",
    channel: "이메일 · Slack DM",
    lastUsed: "어제",
    tagColor: "amber",
  },
  {
    id: "partner",
    name: "박서연 책임",
    relation: "거래처 · 외부 협력사",
    role: "디자인 에이전시 PM",
    mbti: "ISTJ",
    avatar: "PS",
    color: "#dfe3da",
    keywords: ["공식적", "예의 중시", "명확한 요청 선호"],
    avoid: ["반말체", "이모지"],
    prefer: "정중한 인사 → 요청 → 회신 부탁",
    channel: "이메일",
    lastUsed: "3일 전",
    tagColor: "green",
  },
  {
    id: "friend",
    name: "정다은",
    relation: "친구 · 대학 동기",
    role: "디자이너 / 술친구",
    mbti: "ENFP",
    avatar: "JD",
    color: "#efd9d3",
    keywords: ["감정에 민감", "따뜻한 표현", "이모지 OK"],
    avoid: ["차가운 단문", "“보고”, “전달” 같은 사무적 단어"],
    prefer: "감정 한 줄 → 사정 → 다음 약속",
    channel: "카카오톡",
    lastUsed: "5일 전",
    tagColor: "rose",
  },
  {
    id: "colleague",
    name: "이민호 사원",
    relation: "회사 · 옆 팀",
    role: "데이터 분석가",
    mbti: "INTP",
    avatar: "LM",
    color: "#d8dee5",
    keywords: ["데이터 선호", "논리적", "수치 좋아함"],
    avoid: ["감정적 호소"],
    prefer: "맥락 → 수치 → 결론",
    channel: "Slack",
    lastUsed: "오늘",
    tagColor: "blue",
  },
  {
    id: "mentor",
    name: "최은영 책임",
    relation: "회사 · 멘토",
    role: "프로덕트 디자인 책임",
    mbti: "ISFJ",
    avatar: "CE",
    color: "#e5deef",
    keywords: ["배려", "디테일 중시", "존댓말 안정감"],
    avoid: ["지나치게 짧은 한 줄 답장"],
    prefer: "근황 인사 → 요청 → 감사 인사",
    channel: "이메일",
    lastUsed: "1주 전",
    tagColor: "violet",
  },
  {
    id: "mom",
    name: "엄마",
    relation: "가족",
    role: "",
    mbti: "ESFJ",
    avatar: "M",
    color: "#eddccf",
    keywords: ["걱정 많음", "짧은 메시지", "안심시키기"],
    avoid: ["모호한 표현"],
    prefer: "괜찮다는 한 줄을 먼저",
    channel: "카카오톡",
    lastUsed: "2일 전",
    tagColor: "amber",
  },
];

export const MELLO_SCENARIOS: Record<string, Scenario> = {
  lead: {
    brief: "개발 일정이 하루 정도 늦어질 것 같음. 내일까지 완료 가능.",
  },
  partner: {
    brief: "회의 시간을 바꾸고 싶음. 15일 오후 3시나 16일 오전 10시 가능.",
  },
  friend: {
    brief: "오늘 약속 못 갈 것 같음. 미안하다고 말하고 다음에 보자고 하고 싶음.",
  },
  colleague: {
    brief: "이번 분기 전환율 데이터 좀 공유해줄 수 있을지 부탁",
  },
  mentor: {
    brief: "이번 주 1:1 30분만 미루고 싶음. 다음 주로 부탁드린다고.",
  },
  mom: {
    brief: "오늘 늦게 들어갈 것 같다고. 저녁은 먹고 들어간다고.",
  },
};

export const MELLO_FORMAT: MailFormat = {
  signature: "오지송 · Product Designer\nMello team · jisong.oh@mello.app",
  greeting: "안녕하세요, 오지송입니다.",
  closing: "감사합니다.",
  structure: "인사 → 본문 → 요청 → 마무리",
  bulletStyle: "· (가운뎃점)",
  language: "한국어 · 존댓말 기본",
};

export const MELLO_HISTORY: HistoryItem[] = [
  { id: "h1", personaId: "lead",      subj: "[공유] 결제 모듈 QA 결과",         prev: "회귀 테스트 1건 발견되어 내일 오전까지 수정…",  tone: "직설",    length: "짧음", when: "오늘 14:02" },
  { id: "h2", personaId: "partner",   subj: "[Mello] 디자인 시안 1차 회신",     prev: "안녕하세요, 박 책임님. 시안 잘 받았습니다…",      tone: "정중",    length: "보통", when: "어제 10:18" },
  { id: "h3", personaId: "friend",    subj: "주말 약속 시간 변경",               prev: "다은아 토요일 7시로 바꿀 수 있을까? 형부…",       tone: "따뜻",    length: "짧음", when: "어제 22:41" },
  { id: "h4", personaId: "colleague", subj: "[요청] Q1 리텐션 코호트 데이터",    prev: "민호님, Q3 OKR 정리 중 코호트 비교가 필요…",     tone: "구조화",  length: "보통", when: "3일 전" },
  { id: "h5", personaId: "mentor",    subj: "[감사] 어제 피드백 정리",            prev: "책임님 어제 피드백 너무 감사드렸습니다…",         tone: "정중",    length: "보통", when: "4일 전" },
  { id: "h6", personaId: "lead",      subj: "[보고] 주간 스프린트 요약",          prev: "이번 주 완료: 결제 v2 / 진행: 알림 센터…",        tone: "직설",    length: "보통", when: "5일 전" },
  { id: "h7", personaId: "mom",       subj: "주말 본가 갈게",                     prev: "엄마 토요일 점심쯤 갈 거야. 뭐 사갈까…",          tone: "따뜻",    length: "짧음", when: "6일 전" },
];
