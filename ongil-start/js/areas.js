/*
 * ONGIL information architecture — the single description of every area.
 *
 * Used by: navigation labels (checked against index.html by tests), view shells (views.js),
 * document titles, and the "areas" search provider.
 *
 * modules[].available is true only for what really works. Home's modules became available with Home V1 (Phase 2A; 오늘 할 일 and
 * 오늘 루틴 joined in Phase 2C) and My Life's with My Life V1 (Phase 2B; 물 joined in Phase 2C); every other area is still a set of slots, rendered as "준비 중", that never pretend to work.
 */
const slot = (id, title, description, available = false) => Object.freeze({ id, title, description, available });
const live = (id, title, description) => slot(id, title, description, true);

export const AREAS = Object.freeze([
  Object.freeze({
    id: 'home',
    kind: 'primary',
    hash: '#ongil-home',
    label: '홈',
    wordmark: 'ONGIL',
    description: '오늘 하루를 한 화면에서 살펴보는 곳입니다.',
    empty: '아직 보여 드릴 오늘의 내용이 없습니다.',
    keywords: ['오늘', '처음', '대시보드'],
    modules: [
      live('greeting', '오늘의 인사', '시간에 맞는 인사와 오늘 날짜를 보여 줍니다.'),
      live('check-in', '오늘의 안부', '오늘 어떤지 스스로 골라 남깁니다.'),
      live('schedule', '오늘 일정', '오늘 일정을 적고 끝낸 일정을 표시합니다.'),
      live('tasks', '오늘 할 일', '오늘까지 할 일을 보고 끝낸 일을 표시합니다.'),
      live('routines', '오늘 루틴', '오늘 요일의 루틴을 보고 한 루틴을 표시합니다.'),
      live('medication', '복약', '약 이름과 시간을 적어 두고 먹은 약을 표시합니다.'),
      live('life-check', '오늘의 생활', '식사, 물, 걷기·운동을 가볍게 표시합니다.'),
      live('family-update', '가족', '가족 연결 상태를 봅니다.'),
      live('today', '오늘 뭐 하지?', '즐길거리 종류를 골라 살펴봅니다.'),
      live('nearby', '내 주변', '사는 지역의 평생학습 강좌를 찾아봅니다.'),
      live('quick-actions', '빠른 실행', '일정, 할 일, 약을 바로 추가하고 자주 가는 화면을 엽니다.'),
    ],
  }),
  Object.freeze({
    id: 'life',
    kind: 'primary',
    hash: '#life',
    label: '내 생활',
    wordmark: 'MY LIFE',
    description: '일정, 할 일, 생활 습관을 스스로 적고 살펴보는 곳입니다.',
    empty: '아직 적어 둔 일정이나 기록이 없습니다.',
    keywords: ['생활', '기록'],
    modules: [
      live('calendar', '캘린더', '약속과 일정을 날짜별로 봅니다.'),
      live('tasks', '할 일', '해야 할 일을 적고 끝낸 일을 표시합니다.'),
      live('routine', '루틴', '요일마다 반복하는 일을 정해 두고 표시합니다.'),
      live('meals', '식사', '아침, 점심, 저녁 식사를 적어 둡니다.'),
      live('water', '물', '마신 물을 잔 수로 적어 둡니다.'),
      live('exercise', '운동', '걷기와 운동을 적어 둡니다.'),
      live('sleep', '수면', '잠든 시간과 일어난 시간을 적어 둡니다.'),
      live('expenses', '생활비', '쓴 돈을 간단히 적어 둡니다.'),
      live('journal', '기록', '하루를 글로 남깁니다.'),
      live('checkin', '안부와 몸 상태', '기분, 몸 상태, 에너지, 통증을 스스로 골라 둡니다.'),
      live('symptoms', '증상', '느낀 증상을 날짜별로 적어 둡니다.'),
      live('medication', '복약', '약과 먹는 요일을 적고 먹은 날을 표시합니다.'),
      live('health-notes', '건강 메모', '병원에 다녀온 일 같은 메모를 남깁니다.'),
      live('measures', '건강 수치', '체중, 혈압, 혈당, 맥박을 직접 적어 둡니다.'),
    ],
  }),
  Object.freeze({
    id: 'health',
    kind: 'primary',
    hash: '#health',
    label: '건강·안부',
    wordmark: 'HEALTH',
    description: '안부와 건강 기록을 스스로 적고 정리하는 곳입니다.',
    notice:
      'ONGIL은 의료 진단이나 치료 판단을 대신하지 않습니다. 위급한 상황을 알아차리거나 대신 신고하지도 않습니다. 위급할 때는 119에 직접 전화해 주세요.',
    /* Phase 3: the records themselves live in 내 생활 › 건강 (one date bar with 생활); this area points there */
    empty: '이 화면에 따로 저장된 기록은 없습니다. 건강 기록은 ‘내 생활 › 건강’에서 적고 날짜별로 다시 볼 수 있어요.',
    link: Object.freeze({ href: '#life/checkin', label: '내 생활 › 건강 열기' }),
    keywords: ['건강', '안부', '병원', '약'],
    modules: [
      live('check-in', '안부와 몸 상태', '기분, 몸 상태, 에너지를 스스로 골라 둡니다.'),
      live('life-check', '생활 체크', '식사, 물, 운동, 수면을 표시합니다.'),
      slot('help', '도움 요청', '도움이 필요할 때 알릴 사람을 정해 둡니다.'),
      slot('contacts', '긴급 연락망', '급할 때 연락할 번호를 적어 둡니다.'),
      live('medication', '복약', '약 이름, 먹을 시간과 요일을 직접 적고 먹은 날을 표시합니다.'),
      live('hospital', '병원 일정', '진료 날짜와 병원을 적어 둡니다. 내 생활 캘린더와 같은 일정입니다.'),
      live('checkup', '건강검진', '검진 날짜, 기관, 준비 메모를 적어 둡니다. 결과는 판단하지 않습니다.'),
      live('records', '증상·건강 메모', '느낀 증상과 메모를 날짜별로 남깁니다.'),
      live('measures', '건강 수치', '체중, 혈압, 혈당, 맥박을 직접 적어 둡니다. 높고 낮음은 판단하지 않습니다.'),
    ],
  }),
  Object.freeze({
    id: 'family',
    kind: 'primary',
    hash: '#family',
    label: '가족',
    wordmark: 'FAMILY',
    description: '내가 고른 것만 가족과 나누는 곳입니다.',
    notice:
      '가족 연결은 아직 할 수 없습니다. 건강 기록과 개인 일정은 자동으로 공개하지 않으며, 나눌 항목은 본인이 하나씩 직접 고르도록 만들 예정입니다.',
    empty: '연결된 가족이 없습니다.',
    keywords: ['가족', '공유'],
    modules: [
      slot('connect', '가족 연결', '초대하고 서로 확인한 뒤에 연결합니다.'),
      live('sharing', '내가 공유할 내용', '가족이 연결되면 무엇을 얼마나 보여 줄지 항목별로 미리 정합니다.'),
      slot('schedule', '일정 나누기', '고른 일정만 가족과 함께 봅니다.'),
      slot('messages', '소식과 사진', '가족과 소식과 사진을 주고받습니다.'),
      live('requests', '도움 요청', '가족에게 부탁하고 싶은 일을 적어 둡니다. 아직 보내지는 않습니다.'),
    ],
  }),
  Object.freeze({
    id: 'care',
    kind: 'primary',
    hash: '#care',
    label: '돌봄·서비스',
    wordmark: 'CARE',
    description: '일상에 필요한 돌봄과 생활 서비스 정보를 찾아보는 곳입니다.',
    notice: '신청, 예약, 결제 기능은 없습니다. 돌봄 서비스와 복지 혜택 정보는 아직 연결되지 않았습니다.',
    empty: '아직 살펴볼 서비스 정보가 없습니다.',
    keywords: ['돌봄', '서비스', '복지', '요양'],
    modules: [
      slot('care', '돌봄', '돌봄 서비스 정보를 봅니다.'),
      slot('visit', '방문요양', '방문요양 정보를 봅니다.'),
      slot('hospital-escort', '병원 동행', '병원 동행 서비스 정보를 봅니다.'),
      slot('mobility', '이동', '이동을 돕는 서비스 정보를 봅니다.'),
      slot('meals', '식사', '식사 지원 정보를 봅니다.'),
      slot('housekeeping', '청소·세탁', '집안일을 돕는 서비스 정보를 봅니다.'),
      slot('shopping', '장보기', '장보기를 돕는 서비스 정보를 봅니다.'),
      slot('housing', '주거', '집 수리와 주거 지원 정보를 봅니다.'),
      slot('digital', '디지털 도움', '스마트폰과 인터넷 사용을 돕는 정보를 봅니다.'),
      slot('welfare', '복지', '받을 수 있는 복지 제도를 봅니다.'),
      live('nearby', '가까운 기관 찾기', '복지관, 행정복지센터, 보건소 같은 곳을 지역별로 찾습니다. 자료가 연결된 경우에만 결과가 나옵니다.'),
    ],
  }),
  Object.freeze({
    id: 'enjoy',
    kind: 'primary',
    hash: '#enjoy',
    label: '즐길거리',
    wordmark: 'ENJOY',
    description: '취미, 배움, 운동, 나들이처럼 즐겁게 해 볼 일을 찾아보는 곳입니다.',
    empty: '아직 살펴볼 프로그램이나 장소가 없습니다.',
    notice: '즐길거리의 강좌와 장소는 공공기관과 지도 서비스가 공개한 정보입니다. ONGIL이 운영하지 않으며, 신청·예약·결제 기능은 없습니다.',
    keywords: ['배움', '여가', '취미', '여행'],
    modules: [
      live('hobby', '취미', '새로 해 볼 취미 강좌를 찾아봅니다.'),
      live('learning', '배움', '평생학습 강좌와 도서관을 찾아봅니다.'),
      live('exercise', '운동', '운동 강좌와 레포츠 장소, 수영장, 체육관을 찾아봅니다.'),
      live('culture', '문화', '문화시설, 박물관, 미술관, 공연장을 찾아봅니다.'),
      live('outing', '나들이', '관광지와 공원을 찾아봅니다.'),
      live('travel', '여행', '관광지 정보를 찾아봅니다. 예약은 하지 않습니다.'),
      live('programs', '지역 프로그램', '지역에서 열리는 평생학습 강좌를 찾아봅니다.'),
      slot('groups', '모임', '관심사가 같은 모임을 봅니다.'),
    ],
  }),
  Object.freeze({
    id: 'community',
    kind: 'primary',
    hash: '#community',
    label: '커뮤니티',
    wordmark: 'COMMUNITY',
    description: '경험과 관심사를 이웃과 나누는 곳입니다.',
    notice: '쓴 글과 모임 초안은 이 기기에만 저장되고 다른 사람에게 보이지 않습니다. 다른 사람의 글, 댓글, 공감, 신고는 아직 없습니다.',
    empty: '아직 올라온 글이 없습니다.',
    keywords: ['이웃', '모임', '글'],
    modules: [
      slot('feed', '이야기', '이웃이 쓴 글을 읽습니다.'),
      slot('neighborhood', '내 동네', '우리 동네 이야기를 봅니다.'),
      live('groups', '모임 준비', '모임 초안과 일정 초안을 만들어 둡니다. 아직 공개하거나 가입할 수 없습니다.'),
      live('mine', '내가 쓴 글', '내가 쓴 글을 쓰고 고치고 저장합니다. 이 기기에만 저장됩니다.'),
    ],
  }),
  Object.freeze({
    id: 'store',
    kind: 'primary',
    hash: '#store',
    label: '스토어',
    wordmark: 'STORE',
    description: '일상에 필요한 물건을 한곳에서 살펴보는 곳입니다.',
    notice: '결제, 주문, 배송 기능은 없습니다. 아직 연결된 상품 정보가 없어 상품은 보이지 않습니다.',
    empty: '아직 연결된 상품이 없습니다.',
    keywords: ['상품', '물건', '쇼핑'],
    modules: [
      /* Phase 7: ids and titles are the Store's category slugs and labels (store-contracts.js; a test keeps them in step).
         The screen and its categories work, but no product source is connected, so each still says 준비 중. */
      slot('safety', '생활·안전', '집 안에서 안전하게 지내는 데 쓰는 물건.'),
      slot('health-living', '건강 생활', '건강한 생활 습관을 돕는 일상 용품. 의약품은 다루지 않습니다.'),
      slot('kitchen', '식사·주방', '식사 준비와 식사에 쓰는 물건.'),
      slot('bath-home', '욕실·주거', '욕실과 집 안에서 쓰는 물건.'),
      slot('mobility', '이동', '걷고 이동할 때 쓰는 물건.'),
      slot('exercise', '운동', '가볍게 몸을 움직일 때 쓰는 물건.'),
      slot('hobby', '취미', '취미 생활에 쓰는 물건.'),
      slot('digital', '디지털', '스마트폰·태블릿과 함께 쓰는 물건.'),
      slot('smart-device', '스마트기기', '집에서 쓰는 스마트기기.'),
      slot('gift', '선물', '가족에게 선물하기 좋은 물건.'),
    ],
  }),
  Object.freeze({
    id: 'saved',
    kind: 'global',
    hash: '#saved',
    label: '저장',
    wordmark: 'SAVED',
    description: '저장해 둔 것을 한곳에서 다시 봅니다.',
    keywords: ['보관', '찜'],
    modules: [],
  }),
  Object.freeze({
    id: 'account',
    kind: 'global',
    hash: '#account',
    label: '내 정보',
    wordmark: 'MY',
    description: '내 정보와 보기 설정, 알림 설정을 바꿉니다.',
    keywords: ['설정', '프로필', '마이', '글자 크기', '알림 설정'],
    modules: [],
  }),
]);

export const PRIMARY_AREAS = Object.freeze(AREAS.filter((a) => a.kind === 'primary'));
export const GLOBAL_AREAS = Object.freeze(AREAS.filter((a) => a.kind === 'global'));

/* Global entries. The assistant is reserved: it has no UI in Phase 1 and is not rendered while enabled is false. */
export const GLOBAL_ENTRIES = Object.freeze([
  Object.freeze({ id: 'search', label: '통합검색', kind: 'overlay', enabled: true }),
  Object.freeze({ id: 'notifications', label: '알림', kind: 'overlay', enabled: true }),
  Object.freeze({ id: 'saved', label: '저장', kind: 'view', enabled: true }),
  Object.freeze({ id: 'account', label: '내 정보', kind: 'view', enabled: true }),
  /* Phase 10: ONGIL 도우미 — a header panel (assistant-view.js). No language model is connected. */
  Object.freeze({ id: 'assistant', label: 'ONGIL 도우미', kind: 'overlay', enabled: true }),
]);

export function areaById(id) {
  return AREAS.find((a) => a.id === id) || null;
}
