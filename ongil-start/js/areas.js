/*
 * ONGIL information architecture — the single description of every area.
 *
 * Used by: navigation labels (checked against index.html by tests), view shells (views.js),
 * document titles, and the "areas" search provider.
 *
 * modules[].available is true only for what really works. Home's nine modules became available with Home V1
 * (Phase 2A); every other area is still a set of slots, rendered as "준비 중", that never pretend to work.
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
      live('medication', '복약', '약 이름과 시간을 적어 두고 먹은 약을 표시합니다.'),
      live('life-check', '오늘의 생활', '식사, 물, 걷기·운동을 가볍게 표시합니다.'),
      live('family-update', '가족', '가족 연결 상태를 봅니다.'),
      live('today', '오늘 뭐 하지?', '즐길거리 종류를 골라 살펴봅니다.'),
      live('nearby', '내 주변', '사는 지역의 평생학습 강좌를 찾아봅니다.'),
      live('quick-actions', '빠른 실행', '일정과 약을 바로 추가하고 자주 가는 화면을 엽니다.'),
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
      slot('calendar', '캘린더', '약속과 일정을 날짜별로 봅니다.'),
      slot('tasks', '할 일', '해야 할 일을 적고 끝낸 일을 표시합니다.'),
      slot('routine', '루틴', '매일 반복하는 일을 정해 둡니다.'),
      slot('meals', '식사', '식사를 간단히 적어 둡니다.'),
      slot('exercise', '운동', '걷기와 운동을 적어 둡니다.'),
      slot('sleep', '수면', '잠든 시간과 일어난 시간을 적어 둡니다.'),
      slot('expenses', '생활비', '쓴 돈을 간단히 적어 둡니다.'),
      slot('journal', '기록', '하루를 글로 남깁니다.'),
    ],
  }),
  Object.freeze({
    id: 'health',
    kind: 'primary',
    hash: '#health',
    label: '건강·안부',
    wordmark: 'HEALTH',
    description: '안부와 건강 일정을 스스로 적고 정리하는 곳입니다.',
    notice:
      'ONGIL은 의료 진단이나 치료 판단을 대신하지 않습니다. 위급한 상황을 알아차리거나 대신 신고하지도 않습니다. 위급할 때는 119에 직접 전화해 주세요.',
    empty: '아직 적어 둔 안부나 건강 일정이 없습니다.',
    keywords: ['건강', '안부', '병원', '약'],
    modules: [
      slot('check-in', '안부 체크', '오늘 잘 지내는지 스스로 표시합니다.'),
      slot('life-check', '생활 체크', '식사, 운동, 수면을 표시합니다.'),
      slot('help', '도움 요청', '도움이 필요할 때 알릴 사람을 정해 둡니다.'),
      slot('contacts', '긴급 연락망', '급할 때 연락할 번호를 적어 둡니다.'),
      slot('medication', '복약', '약 이름과 먹을 시간을 직접 적어 둡니다.'),
      slot('hospital', '병원', '진료 예약 날짜를 적어 둡니다.'),
      slot('checkup', '검진', '건강검진 일정을 적어 둡니다.'),
      slot('records', '건강 기록', '직접 잰 수치와 메모를 남깁니다.'),
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
      slot('sharing', '공유 범위', '무엇을 누구와 나눌지 항목별로 정합니다.'),
      slot('schedule', '일정 나누기', '고른 일정만 가족과 함께 봅니다.'),
      slot('messages', '소식과 사진', '가족과 소식과 사진을 주고받습니다.'),
      slot('requests', '부탁하기', '가족에게 도움을 부탁합니다.'),
    ],
  }),
  Object.freeze({
    id: 'care',
    kind: 'primary',
    hash: '#care',
    label: '돌봄·서비스',
    wordmark: 'CARE',
    description: '일상에 필요한 돌봄과 생활 서비스 정보를 찾아보는 곳입니다.',
    notice: '신청, 예약, 결제 기능은 없습니다. 살펴볼 수 있는 서비스 정보도 아직 준비되지 않았습니다.',
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
      slot('nearby', '주변 기관', '가까운 복지관과 기관을 봅니다.'),
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
    keywords: ['배움', '여가', '취미', '여행'],
    modules: [
      slot('hobby', '취미', '새로 해 볼 취미를 찾아봅니다.'),
      slot('learning', '배움', '강좌와 교육 프로그램을 봅니다.'),
      slot('exercise', '운동', '함께 할 수 있는 운동을 봅니다.'),
      slot('culture', '문화', '공연과 전시를 봅니다.'),
      slot('outing', '나들이', '가까운 나들이 장소를 봅니다.'),
      slot('travel', '여행', '여행지를 봅니다.'),
      slot('programs', '프로그램', '지역에서 열리는 프로그램을 봅니다.'),
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
    notice: '글쓰기와 댓글은 아직 할 수 없습니다.',
    empty: '아직 올라온 글이 없습니다.',
    keywords: ['이웃', '모임', '글'],
    modules: [
      slot('feed', '이야기', '이웃이 쓴 글을 읽습니다.'),
      slot('neighborhood', '내 동네', '우리 동네 이야기를 봅니다.'),
      slot('groups', '모임', '모임을 찾고 함께합니다.'),
      slot('mine', '내가 쓴 글', '내가 쓴 글과 댓글을 봅니다.'),
    ],
  }),
  Object.freeze({
    id: 'store',
    kind: 'primary',
    hash: '#store',
    label: '스토어',
    wordmark: 'STORE',
    description: '생활에 도움이 되는 물건을 살펴보는 곳입니다.',
    notice: '결제, 주문, 배송 기능은 없습니다. 소개할 상품 정보도 아직 준비되지 않았습니다.',
    empty: '아직 소개할 상품이 없습니다.',
    keywords: ['상품', '물건', '쇼핑'],
    modules: [
      slot('safety', '안전·생활', '집 안에서 안전하게 지내는 데 쓰는 물건.'),
      slot('health-living', '건강생활', '건강한 생활을 돕는 물건.'),
      slot('kitchen', '식사·주방', '식사와 주방에서 쓰는 물건.'),
      slot('bath-home', '욕실·주거', '욕실과 집 안에서 쓰는 물건.'),
      slot('walking', '이동·보행', '걷고 이동할 때 쓰는 물건.'),
      slot('exercise', '운동', '운동할 때 쓰는 물건.'),
      slot('hobby', '취미', '취미 생활에 쓰는 물건.'),
      slot('digital', '디지털', '스마트폰과 함께 쓰는 물건.'),
      slot('smart-device', '스마트기기', '집에서 쓰는 스마트기기.'),
      slot('gift', '부모님 선물', '부모님께 드리기 좋은 물건.'),
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
  Object.freeze({ id: 'assistant', label: 'ONGIL AI', kind: 'overlay', enabled: false }),
]);

export function areaById(id) {
  return AREAS.find((a) => a.id === id) || null;
}
