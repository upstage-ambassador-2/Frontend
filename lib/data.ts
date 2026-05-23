// Mello mock data — ported from upstage/project/mello-data.jsx
// Shape preserved verbatim so a future API can return the same payload.

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

export type ScenarioVersion = {
  label: string;
  sub: string;
  body: string;
  // "<tagColor>:<label>" pairs, e.g. "amber:결론 우선"
  tags: string[];
};

export type Scenario = {
  brief: string;
  subject: string;
  versions: ScenarioVersion[];
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
    subject: "[공유] 결제 모듈 일정 지연 (1일)",
    versions: [
      {
        label: "A",
        sub: "결론 우선",
        body: "결제 모듈 일정이 1일 지연될 예정입니다.\n내일(목) 오후 6시까지 완료 후 결과 공유드리겠습니다.\n\n지연 사유와 후속 조치는 완료 보고 시 함께 정리해 전달드리겠습니다.",
        tags: ["amber:결론 우선", "gray:군더더기 ↓", "green:일정 명시"],
      },
      {
        label: "B",
        sub: "한 줄 보고",
        body: "결제 모듈 일정 1일 지연됩니다. 내일 18시까지 완료 후 보고드리겠습니다.",
        tags: ["amber:최소 길이", "gray:Slack 친화"],
      },
      {
        label: "C",
        sub: "이슈/조치 분리",
        body: "이슈\n  결제 모듈 일정 1일 지연 (테스트 단계 회귀 1건)\n\n조치\n  내일(목) 18:00까지 수정 완료, 19:00 회귀 재검증\n\n공유\n  완료 직후 채널에 결과 첨부",
        tags: ["blue:구조화", "green:일정 명시"],
      },
    ],
  },
  partner: {
    brief: "회의 시간을 바꾸고 싶음. 15일 오후 3시나 16일 오전 10시 가능.",
    subject: "[Mello] 회의 일정 변경 요청드립니다",
    versions: [
      {
        label: "A",
        sub: "정중 · 정식",
        body: "안녕하세요, 박서연 책임님.\nMello 오지송입니다.\n\n사전에 협의해주신 회의 일정 조율 가능 여부를 문의드립니다.\n가능하시다면 아래 두 시간 중 편하신 시간으로 변경 가능하실지 확인 부탁드립니다.\n\n  · 5월 15일(목) 오후 3시\n  · 5월 16일(금) 오전 10시\n\n확인 후 회신 주시면 감사하겠습니다.\n감사합니다.",
        tags: ["violet:정중", "green:옵션 명확", "gray:서명 포함"],
      },
      {
        label: "B",
        sub: "간결한 정중",
        body: "안녕하세요, 박 책임님.\n회의 일정 변경 가능 여부 문의드립니다.\n5월 15일(목) 15:00 또는 16일(금) 10:00 중 가능하신 시간 회신 부탁드립니다.\n감사합니다.",
        tags: ["violet:정중", "amber:간결"],
      },
      {
        label: "C",
        sub: "캘린더 첨부형",
        body: "안녕하세요, 박서연 책임님.\n\n기존 일정 변경 요청드리며, 아래 후보 시간으로 캘린더 초대 발송드렸습니다.\n  · 5/15 (목) 15:00 — 60분\n  · 5/16 (금) 10:00 — 60분\n\n편하신 시간에 수락 부탁드립니다.\n감사합니다.",
        tags: ["violet:정중", "blue:구조화"],
      },
    ],
  },
  friend: {
    brief: "오늘 약속 못 갈 것 같음. 미안하다고 말하고 다음에 보자고 하고 싶음.",
    subject: "",
    versions: [
      {
        label: "A",
        sub: "따뜻 · 표준",
        body: "다은아 오늘 진짜 가고 싶었는데 갑자기 일정이 생겨버렸어 ㅠㅠ\n갑자기 말해서 너무 미안해. 이번 주 안에 시간 맞춰서 꼭 다시 잡자!",
        tags: ["rose:따뜻함", "amber:사과 명확", "green:다음 약속 제안"],
      },
      {
        label: "B",
        sub: "더 가볍게",
        body: "헐 다은아 오늘 못 갈 것 같아 진짜 미안 😭\n다음 주에 내가 살 테니까 다시 잡자!",
        tags: ["rose:따뜻함", "gray:이모지"],
      },
      {
        label: "C",
        sub: "구체적 다음 약속",
        body: "다은아, 오늘 가고 싶었는데 일정이 겹쳐버려서 못 갈 것 같아 ㅠㅠ 정말 미안해.\n토요일 저녁이나 다음 주 수요일 저녁 중에 시간 어때? 내가 메뉴 정해서 예약할게.",
        tags: ["rose:따뜻함", "green:다음 약속 제안"],
      },
    ],
  },
  colleague: {
    brief: "이번 분기 전환율 데이터 좀 공유해줄 수 있을지 부탁",
    subject: "[요청] Q2 퍼널 전환율 데이터",
    versions: [
      {
        label: "A",
        sub: "맥락 → 수치 → 결론",
        body: "민호님, Mello 오지송입니다.\nQ3 OKR 정리 중 퍼널 단계별 전환율을 비교 분석하고 있는데, Q2 데이터가 필요해서 문의드립니다.\n\n필요 항목: 단계별 전환율, 세션 수, 디바이스별 분포\n사용 기간: 4/1 ~ 6/30\n\n원본 시트 링크만 공유해주시면 충분합니다. 감사합니다.",
        tags: ["blue:구조화", "green:범위 명시"],
      },
      {
        label: "B",
        sub: "짧은 요청",
        body: "민호님, Q2(4/1~6/30) 퍼널 전환율 시트 링크 공유 가능하실까요? Q3 분석에 비교용으로 필요해서요. 감사합니다.",
        tags: ["blue:구조화", "amber:간결"],
      },
      {
        label: "C",
        sub: "미팅 제안 포함",
        body: "민호님, Q3 OKR 정리하면서 Q2 퍼널 전환율 데이터를 보고 싶은데, 시트 공유 또는 짧은 미팅(15분) 중 편한 쪽으로 부탁드려도 될까요? 비교 항목은 단계별 전환율 / 디바이스 분포 정도입니다.",
        tags: ["blue:구조화", "gray:옵션 제안"],
      },
    ],
  },
  mentor: {
    brief: "이번 주 1:1 30분만 미루고 싶음. 다음 주로 부탁드린다고.",
    subject: "[부탁] 이번 주 1:1 일정 조정 문의",
    versions: [
      {
        label: "A",
        sub: "정중 · 사과 포함",
        body: "책임님 안녕하세요, 지송입니다.\n늘 좋은 피드백 주셔서 감사드립니다.\n\n이번 주 금요일에 잡혀 있는 1:1을 다음 주로 잠시 미뤄도 괜찮을지 여쭙고 싶어 메시지 드립니다. 외부 사용자 인터뷰 일정이 겹쳐 부득이하게 조정이 필요한 상황입니다.\n다음 주 중 책임님께 가능한 시간 알려주시면 맞춰서 잡겠습니다.\n\n감사합니다.",
        tags: ["violet:정중", "amber:사과 명확", "green:사유 명시"],
      },
      {
        label: "B",
        sub: "간결한 정중",
        body: "책임님, 이번 주 금요일 1:1을 다음 주로 옮길 수 있을까요? 외부 인터뷰 일정이 겹쳤습니다. 책임님 가능한 시간 알려주시면 맞추겠습니다. 감사합니다.",
        tags: ["violet:정중", "amber:간결"],
      },
      {
        label: "C",
        sub: "근황 인사 포함",
        body: "책임님 안녕하세요, 지송입니다.\n요새 OKR 마무리 분주하신데 잘 지내고 계신가요? :)\n\n이번 주 금요일 1:1을 다음 주로 잠깐 미뤄도 괜찮으실지 여쭙습니다. 외부 사용자 인터뷰 일정이 겹쳐서요. 다음 주 중 가능한 시간 알려주시면 바로 맞춰 잡겠습니다.\n\n감사합니다.",
        tags: ["violet:정중", "rose:따뜻함"],
      },
    ],
  },
  mom: {
    brief: "오늘 늦게 들어갈 것 같다고. 저녁은 먹고 들어간다고.",
    subject: "",
    versions: [
      {
        label: "A",
        sub: "안심 우선",
        body: "엄마 나 오늘은 좀 늦을 것 같아. 저녁은 회사 근처에서 먹고 들어갈 테니까 걱정하지 마. 들어가서 연락할게!",
        tags: ["amber:안심 우선", "rose:따뜻함"],
      },
      {
        label: "B",
        sub: "짧게",
        body: "엄마 오늘 늦게 들어가. 저녁은 먹고 가니까 걱정 ㄴ. 도착하면 연락할게.",
        tags: ["amber:안심 우선", "gray:짧음"],
      },
      {
        label: "C",
        sub: "시간 명시",
        body: "엄마 오늘 11시쯤 들어갈 것 같아. 저녁은 회사 근처에서 먹고 가니까 식사 챙기지 마. 들어가서 연락할게!",
        tags: ["amber:안심 우선", "green:시간 명시"],
      },
    ],
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
