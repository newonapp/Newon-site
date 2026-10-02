(function () {
  var D = window.LivonServiceDetailsData;
  var all = (window.LivonLifeData.stages || []).flatMap(function (stage) { return stage.services; });
  var current = null, host = null, plan = null;
  function esc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var UD = function () { return window.LivonUserData; };   /* localStorage goes through the user-data repository; sessionStorage stays direct */
  function read(key, fallback, storage) { if (!storage && UD()) { var v = UD().read(key, null); return v || fallback; } try { return JSON.parse((storage || localStorage).getItem(key)) || fallback; } catch (_) { return fallback; } }
  function write(key, value, storage) { if (!storage && UD()) { if (UD().write(key, value)) return true; notice('저장 공간을 확인해 주세요. 저장하지 못했습니다.'); return false; } try { (storage || localStorage).setItem(key, JSON.stringify(value)); return true; } catch (_) { notice('저장 공간을 확인해 주세요. 저장하지 못했습니다.'); return false; } }
  function find(id) { return all.find(function (s) { return s.id === id; }); }
  function href(s) { return '#life-service-' + s.id; }
  function button(text, attrs, primary) { return '<button type="button" class="lv-life-btn lv-life-btn--' + (primary ? 'dark' : 'outline') + ' lv-life-btn--sm" ' + attrs + '>' + esc(text) + '</button>'; }
  function link(text, url, primary) { return '<a class="lv-life-btn lv-life-btn--' + (primary ? 'dark' : 'outline') + ' lv-life-btn--sm" href="' + esc(url) + '">' + esc(text) + '</a>'; }
  function list(items) { return '<ul>' + items.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>'; }
  function section(title, body) { return '<section class="lv-ls-block"><h3 class="lv-life-title lv-life-title--md">' + esc(title) + '</h3>' + body + '</section>'; }
  function options(values) { return values.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + '</option>'; }).join(''); }
  function select(name, title, values) { return '<label>' + esc(title) + '<select name="' + name + '">' + options(values) + '</select></label>'; }
  function input(name, title, type, extra) { return '<label>' + esc(title) + '<input name="' + name + '" type="' + (type || 'text') + '" ' + (extra || '') + ' /></label>'; }
  function saved(id) { var P = window.LivonPlatform; if (P && P.hasSave) return P.hasSave(id); return !!P && P.listSaves('all').some(function (s) { return s.id === id; }); }
  function notice(text) { var n = document.getElementById('life-service-status'); if (n) n.textContent = text; }
  function saveItem(id, title, type, url, stage) {
    if (!window.LivonPlatform) return notice('저장 기능을 불러오지 못했습니다. 새로고침해 주세요.');
    window.LivonPlatform.saveItem({ id: id, title: title, label: title, type: type, href: url, source: '라이프 스테이지', lifeStage: stage });
    notice('내 생활 → 저장함에 저장했습니다. 이 브라우저에서 확인할 수 있습니다.');
  }
  function saveService(s) {
    if (s === current && s.detail.indexOf('family-') === 0 && window.LivonFamily && location.hash.indexOf(href(s)) === 0) return window.LivonFamily.save();
    var id = 'life-service:' + s.id;
    if (saved(id)) window.LivonPlatform.removeSave(id);
    else saveItem(id, s.name, s.type, href(s), s.lifeStage);
    document.querySelectorAll('[data-ls-save="' + s.id + '"]').forEach(function (b) { b.textContent = saved(id) ? '저장됨' : '저장하기'; b.setAttribute('aria-pressed', String(saved(id))); });
  }
  function reason(s) {
    var stage = read('livon.lifeStage', '');
    if (stage && String(stage) !== String(s.lifeStage)) return s.lifeStage + '대 생활을 위한 안내예요. 선택한 연령대와 관계없이 자유롭게 살펴볼 수 있습니다.';
    var situations = read('livon.lifeSituations', []);
    var interests = read('livon.lifeInterests', []);
    var bits = [stage ? stage + '대' : '', situations.slice(0, 2).join(' · '), interests.slice(0, 2).join(' · ')].filter(Boolean);
    return bits.length ? bits.join(' · ') + ' 선택을 바탕으로 살펴볼 수 있는 서비스예요.' : s.lifeStage + '대의 ' + s.audience + '에게 도움이 되는 서비스예요. 원하는 조건으로 자유롭게 살펴보세요.';
  }
  function cardMark(type) {
    var paths = {Tool:'<rect x="5" y="4" width="14" height="16" rx="1"/><path d="M9 9h6M9 13h6M9 17h3"/>',Guide:'<path d="M12 6v15M12 6C9 4 5 4 3 5v14c3-1 6 0 9 2 3-2 6-3 9-2V5c-2-1-6-1-9 1Z"/>',Expert:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/>',Discovery:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',AI:'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z"/>'};
    return '<span class="lv-ls-card-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">'+(paths[type]||paths.Guide)+'</svg></span>';
  }
  function card(s, stage, opts) {
    var id = s.id, url = href(s), on = saved('life-service:' + id);
    return '<article class="lv-life-svc" data-ls-card="' + id + '"><p class="lv-life-svc__n">' + esc(D.types[s.type]) + ' · ' + esc(s.audience) + cardMark(s.type) + '</p>' +
      '<h4><a href="' + url + '">' + esc(s.name) + '</a></h4><p>' + esc(s.desc) + '</p>' + list((s.feats || []).slice(0, 3)) +
      ((opts || {}).why ? '<p class="lv-life-svc__why">' + esc(reason(s)) + '</p>' : '') +
      '<div class="lv-life-svc__acts lv-ls-primary">' + link(s.cta, url, true).replace('</a>', '<span aria-hidden="true">→</span></a>') + '</div><div class="lv-life-svc__acts lv-ls-secondary" role="group" aria-label="' + esc(s.name) + '">' +
      button(on ? '저장됨' : '저장하기', 'data-ls-save="' + id + '" aria-pressed="' + on + '"') + button('공유', 'data-ls-share="' + id + '"') + button('AI에 묻기', 'data-ls-ai="' + id + '"') + '</div></article>';
  }
  function ask(s, extra) {
    var q = s.name + '에 대해 도와줘.\n생활 단계: ' + s.lifeStage + '대\n' + (extra || s.desc);
    if (!write('livon.aiPrompt', { q: q.slice(0, 3900), draftOnly: true }, sessionStorage)) return;
    location.hash = 'ai-chat';
  }
  function planner() {
    plan = read('livon.studyPlanDraft', null, sessionStorage);
    if (plan) {
      var stored = read('livon.mlStore.v1', {}).checklists || [];
      var match = stored.find(function (x) { return x.id === plan.id; });
      if (match) plan.items = match.items;
    }
    var days = ['일', '월', '화', '수', '목', '금', '토'];
    var html = '<p>입력한 시간과 요일을 나누어 만드는 기본 계획입니다. AI 생성이나 성적 예측이 아닙니다.</p><form data-ls-planner class="lv-ls-form">' +
      input('grade', '현재 학년', 'text', 'required maxlength="40"') + select('purpose', '공부 목적', ['내신', '수능', '자격증', '기타']) +
      input('subjects', '과목 (쉼표로 구분, 최대 8개)', 'text', 'required maxlength="160"') + input('goal', '목표', 'text', 'required maxlength="300"') +
      input('due', '목표 날짜', 'date', 'required min="' + date(new Date()) + '"') + input('minutes', '하루 공부 가능 시간 (분)', 'number', 'required min="15" max="720" step="5" value="60"') +
      '<fieldset><legend>공부 가능한 요일</legend><div class="lv-ls-days">' + days.map(function (d, i) { return '<label><input type="checkbox" name="days" value="' + i + '"' + (i > 0 && i < 6 ? ' checked' : '') + ' />' + d + '</label>'; }).join('') + '</div></fieldset>' +
      '<button class="lv-life-btn lv-life-btn--dark" type="submit">계획 만들기</button></form><div data-ls-plan></div>';
    return section('학습 플래너', html);
  }
  function date(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function makePlan(form) {
    var f = new FormData(form), days = f.getAll('days').map(Number), subjects = String(f.get('subjects')).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var due = String(f.get('due')), minutes = Number(f.get('minutes'));
    if (!days.length || !subjects.length || subjects.length > 8 || due < date(new Date()) || minutes < 15 || minutes > 720) return notice('요일과 과목, 오늘 이후의 목표 날짜, 공부 시간을 확인해 주세요.');
    var items = [], now = new Date(); now.setHours(12, 0, 0, 0);
    for (var i = 0; i < 7; i++) {
      var d = new Date(now); d.setDate(d.getDate() + i);
      if (date(d) > due || days.indexOf(d.getDay()) < 0) continue;
      subjects.forEach(function (subject, j) {
        var m = Math.floor(minutes / subjects.length) + (j < minutes % subjects.length ? 1 : 0);
        items.push({ id: 'task-' + i + '-' + j, text: date(d) + ' · ' + subject + ' ' + m + '분 — 학습 범위 정하기, 연습하고 복습하기', date: date(d), done: false });
      });
    }
    if (!items.length) return notice('목표 날짜까지 선택한 공부 요일이 없습니다. 날짜 또는 요일을 조정해 주세요.');
    plan = { id: 'study-' + Date.now(), title: String(f.get('goal')).trim(), grade: String(f.get('grade')), purpose: String(f.get('purpose')), subjects: subjects, due: due, minutes: minutes, days: days, items: items, createdAt: Date.now() };
    write('livon.studyPlanDraft', plan, sessionStorage); renderPlan(); notice('기본 학습 계획을 만들었습니다. 확인 후 내 생활에 저장해 주세요.');
  }
  function renderPlan() {
    var area = host && host.querySelector('[data-ls-plan]'); if (!area || !plan) return;
    var today = plan.items.filter(function (x) { return x.date === date(new Date()); });
    var pct = Math.round(100 * plan.items.filter(function (x) { return x.done; }).length / plan.items.length);
    var days = Math.ceil((new Date(plan.due + 'T00:00:00') - new Date(date(new Date()) + 'T00:00:00')) / 86400000);
    area.innerHTML = section('나의 학습 플랜', '<p>' + esc(plan.title) + ' · ' + (days < 0 ? '목표일이 지났습니다' : 'D-' + days) + '</p><p>진행률 ' + pct + '%</p><progress max="100" value="' + pct + '" aria-label="학습 진행률"></progress>' +
      '<h4>오늘 공부할 것</h4>' + (today.length ? list(today.map(function (x) { return x.text; })) : '<p>오늘은 계획된 공부가 없습니다.</p>') +
      '<h4>이번 주 목표</h4><p>오늘부터 7일간, 목표일까지 선택한 요일에 하루 ' + plan.minutes + '분씩 학습합니다.</p><h4>과목별 목표</h4>' + list(plan.subjects.map(function (s) { return s + ': ' + plan.title + '에 필요한 범위 확인 → 연습 → 오답 복습'; })) +
      '<h4>체크리스트</h4><div class="lv-ls-checklist">' + plan.items.map(function (x, i) { return '<label><input type="checkbox" data-ls-check="' + i + '"' + (x.done ? ' checked' : '') + ' />' + esc(x.text) + '</label>'; }).join('') + '</div><div class="lv-life-svc__acts">' + button('내 생활에 저장', 'data-ls-plan-save', true) + button('AI로 계획 만들기', 'data-ls-plan-ai') + link('내 생활 체크리스트', '#ml-todos') + '</div>');
  }
  function savePlan() {
    if (!plan) return;
    var store = read('livon.mlStore.v1', {}); store.checklists = store.checklists || [];
    var item = { id: plan.id, title: '학습 플랜 · ' + plan.title, desc: plan.grade + ' · ' + plan.purpose + ' · 목표일 ' + plan.due, items: plan.items, createdAt: plan.createdAt, updatedAt: Date.now(), source: 'life-stage', studyPlan: plan };
    var index = store.checklists.findIndex(function (x) { return x.id === item.id; });
    if (index < 0) store.checklists.unshift(item); else store.checklists[index] = item;
    if (write('livon.mlStore.v1', store)) saveItem('plan:' + plan.id, item.title, 'Tool', '#ml-todos', current.lifeStage);
  }
  function mentor() {
    return section('어떤 도움이 필요한가요?', '<form data-ls-mentor class="lv-ls-form">' + select('topic', '상담 주제', ['진로 고민', '학과 선택', '입시', '직업 탐색', '취업', '포트폴리오']) + '<button class="lv-life-btn lv-life-btn--dark">멘토·기관 찾기</button></form><p>탐색의 전문가·기관 검색으로 연결합니다. 개인 멘토 명단, 가격, 후기와 예약 가능 시간은 아직 연결되어 있지 않습니다.</p>');
  }
  function hobby() {
    return section('어떤 활동을 찾으세요?', '<form data-ls-hobby class="lv-ls-form">' + select('companion', '누구와?', ['상관없음','혼자','친구','연인','가족']) + select('place', '장소', ['상관없음','실내','야외']) + select('cost', '비용', ['상관없음','무료','유료']) + select('duration', '시간', ['상관없음','1시간 이내','반나절','하루']) + select('interest','관심 분야',['전체','베이킹','도예','드로잉','사진','러닝','클라이밍','댄스','악기','공예','요리','기타']) + '<button class="lv-life-btn lv-life-btn--dark">관련 활동 보기</button></form><div data-ls-hobby-results class="lv-ls-results"></div><p>오늘의 발견에 등록된 안내 콘텐츠만 표시합니다. 업체·일정·가격·후기·예약은 해당 콘텐츠의 공식 출처에서 확인해 주세요. 확인되지 않은 소요시간은 시간 조건 검색에서 제외됩니다.</p>');
  }
  function hobbyResults(form) {
    var f = new FormData(form), interest = f.get('interest');
    var query = { companion: f.get('companion'), place: f.get('place'), cost: f.get('cost'), duration: f.get('duration'), interest: interest };
    write('livon.serviceFilters.' + current.id, query, sessionStorage);
    var matches = ((window.LivonTodayData || {}).contents || []).filter(function (x) {
      var text = [x.title,x.blurb,(x.tags || []).join(' ')].join(' ');
      var term = { '도예':'도자기', '러닝':'달리기' }[interest] || interest;
      if (interest !== '전체' && text.indexOf(term) < 0) return false;
      if (query.companion !== '상관없음' && (x.companion || []).indexOf(query.companion) < 0) return false;
      if (query.place !== '상관없음' && x.indoorOutdoor !== query.place) return false;
      if (query.cost === '무료' && x.budget !== '무료') return false;
      if (query.cost === '유료' && (!x.budget || x.budget === '무료')) return false;
      if (query.duration !== '상관없음') {
        var nums = String(x.duration || '').match(/\d+/g), max = nums ? Math.max.apply(null, nums.map(Number)) : null;
        if (max === null || !/시간|분/.test(x.duration)) return false;
        if (/분/.test(x.duration) && !/시간/.test(x.duration)) max /= 60;
        if (query.duration === '1시간 이내' && max > 1) return false;
        if (query.duration === '반나절' && (max <= 1 || max > 4)) return false;
        if (query.duration === '하루' && max <= 4) return false;
      }
      return true;
    });
    host.querySelector('[data-ls-hobby-results]').innerHTML = matches.length ? '<p>등록된 관련 안내 ' + matches.length + '개</p>' + matches.slice(0,12).map(function (x) { return '<article class="lv-life-svc"><h4>' + esc(x.title) + '</h4><p>' + esc(x.blurb) + '</p>' + link('오늘의 발견에서 자세히', '#td-item-' + x.id, true) + '</article>'; }).join('') : '<p>선택한 조건으로 확인할 수 있는 콘텐츠가 없습니다. 조건을 줄이거나 탐색에서 확인해 주세요.</p>' + link('클래스 탐색', '#ex-categories');
  }
  function subjects() { return section('과목별 학습 정보', '<label>과목<select data-ls-subject>' + options(Object.keys(D.subjects)) + '</select></label><div data-ls-subject-body></div>'); }
  function subjectBody(name) {
    host.querySelector('[data-ls-subject-body]').innerHTML = '<p>일반 학습 가이드입니다. 학교별 교육과정·시험 범위는 학교 안내를 확인하세요.</p>' + section('학습 로드맵 · 추천 학습 순서', list(D.subjects[name])) + section('영역별 공부 방법 · 시험 준비', '<p>작은 범위를 정하고 스스로 설명한 뒤 문제로 확인하세요. 틀린 이유를 기록하고 며칠 뒤 다시 풀어 보세요. 시험 전에는 학교에서 안내한 범위와 유형을 우선 점검하세요.</p>') + section('관련 자료 · 콘텐츠', link('EBS 학습 자료', D.sources.learning) + link('관련 교육 찾기', '#ex-categories')) + '<div class="lv-life-svc__acts">' + link('학습 계획 만들기', '#life-service-study-planner', true) + button('AI에게 물어보기', 'data-ls-subject-ai="' + esc(name) + '"') + '</div>';
  }
  function catalog(kind, selectedId) {
    var rows = D[kind], isMajor = kind === 'majors', selected = rows.find(function (x) { return x.id === selectedId; });
    if (selected) return catalogDetail(kind, selected);
    return section(isMajor ? '관심 있는 학교나 전공을 검색해보세요.' : '무엇부터 알아볼까요?', '<p>일반 탐색 가이드 예시만 검색됩니다. 학교·입시·전체 직업 데이터는 아직 연결되지 않았습니다.</p>' + (!isMajor ? '<div class="lv-life-svc__acts">' + link('관심 분야로 찾기', href(current) + '/fields') + link('직업으로 찾기', href(current) + '/jobs') + link('적성 알아보기 · 커리어넷', D.sources.career) + '</div>' : '') + '<form class="lv-ls-form" data-ls-catalog="' + kind + '">' + input('q', isMajor ? '학교 또는 전공' : '직업 검색', 'search', 'maxlength="100"') + select('field', '관심 분야', ['전체'].concat(D.fields)) + '<button class="lv-life-btn lv-life-btn--dark">검색</button></form><div data-ls-catalog-results class="lv-ls-results"></div>' + link(isMajor ? '공식 입시정보 · 어디가' : '공식 직업정보 · 커리어넷', isMajor ? D.sources.admission : D.sources.career));
  }
  function catalogResults(kind, query, field) {
    var rows = D[kind].filter(function (x) { return (!query || JSON.stringify(x).toLowerCase().includes(query.toLowerCase())) && (!field || field === '전체' || x.fields.includes(field)); });
    host.querySelector('[data-ls-catalog-results]').innerHTML = rows.length ? rows.map(function (x) { return '<article class="lv-life-svc"><p>일반 가이드 예시</p><h4>' + esc(x.title) + '</h4><p>' + esc(x.intro) + '</p>' + link('상세 보기', href(current) + '/' + (current.detail === 'youth-university' ? '1' : kind) + '/' + x.id, true) + '</article>'; }).join('') : '<p>등록된 예시가 없습니다. 공식 정보 사이트에서 학교·전공·직업을 확인해 주세요.</p>';
  }
  function catalogDetail(kind, item) {
    var major = kind === 'majors';
    var body = '<p>일반 가이드 예시 · 특정 학교의 교육과정이나 최신 채용정보가 아닙니다.</p><h3 class="lv-life-title">' + esc(item.title) + '</h3><p>' + esc(item.intro) + '</p>';
    if (major) body += section('무엇을 배우나요? · 주요 과목', list(item.learns)) + section('관심·적성', list(item.interests)) + section('관련 직업 · 진로 방향', list(item.jobs)) + section('비슷한 전공', list(item.related)) + section('운영 학교 · 공식 입시정보', '<p>학교 목록·전형·입시 일정 데이터는 연결되지 않았습니다.</p>' + link('공식 입시정보 확인', D.sources.admission));
    else body += section('필요한 역량 · 기술', list(item.skills.concat(item.tools))) + section('관련 전공', list(item.majors)) + section('진입·커리어 경로', list(item.path)) + section('관련 직무', list(item.related));
    return body + '<div class="lv-life-svc__acts">' + button(major ? '관심 저장' : '관심 직업 저장', 'data-ls-entry-save="' + kind + ':' + item.id + '"', true) + (major ? button('비교하기', 'data-ls-compare="' + item.id + '"') : button('관련 교육 찾기', 'data-ls-education')) + button('관련 상담 찾기', 'data-ls-expert') + button('AI에게 물어보기', 'data-ls-entry-ai="' + esc(item.title) + '"') + '</div><div data-ls-compare-results></div>' + link('목록으로', href(current)) + link('공식 진로정보 확인', D.sources.career);
  }
  function compare(id) {
    var ids = read('livon.majorCompare', [], sessionStorage); if (id && !ids.includes(id)) ids.push(id); if (ids.length > 3) ids.shift();
    write('livon.majorCompare', ids, sessionStorage);
    host.querySelector('[data-ls-compare-results]').innerHTML = section('관심 전공 비교 (최대 3개)', '<p>다른 전공도 상세에서 비교하기를 눌러 추가하세요.</p><div class="lv-ls-grid">' + ids.map(function (id) { var x = D.majors.find(function (r) { return r.id === id; }); return x ? '<article class="lv-life-svc"><h4>' + esc(x.title) + '</h4><p>주요 과목</p>' + list(x.learns) + '<p>관련 직업</p>' + list(x.jobs) + button('비교에서 제외', 'data-ls-uncompare="' + id + '"') + '</article>' : ''; }).join('') + '</div>');
  }
  function standard(s) {
    var text = s.type === 'Expert' ? '실제 전문가·기관 안내는 탐색에서 확인합니다. 상담 가능 시간·가격·후기·예약은 아직 연결되지 않았습니다.' : s.type === 'Tool' ? '내 생활의 기존 도구에서 직접 기록하고 관리할 수 있습니다.' : s.type === 'Discovery' ? '등록된 콘텐츠와 공식 안내를 살펴보세요. 실제 일정과 예약은 공식 출처에서 확인해 주세요.' : '제도·운영 정보는 변경될 수 있습니다. 연결된 안내와 공식 출처를 확인하세요.';
    return section('다음 행동', '<p>' + text + '</p>' + (s.type === 'AI' ? button('AI에게 물어보기', 'data-ls-ai="' + s.id + '"', true) : link(s.cta, s.destination, true)));
  }
  function open(hash) {
    var root = document.getElementById('life');
    if (!hash.startsWith('life-service-')) { root.classList.remove('has-service-detail'); if (host) host.hidden = true; return false; }
    var parts = hash.slice('life-service-'.length).split('/'); current = find(parts[0]);
    if (!host) { host = document.createElement('section'); host.id = 'life-service-detail'; host.className = 'lv-life lv-life-sec'; root.appendChild(host); }
    root.classList.add('has-service-detail'); host.hidden = false;
    if (!current) { host.innerHTML = '<h2>서비스를 찾을 수 없습니다.</h2>' + link('라이프 스테이지로', '#life'); return true; }
    var s = current;
    host.innerHTML = '<nav class="lv-ls-breadcrumb" aria-label="현재 위치">' + link('← 라이프 스테이지', '#stage-' + s.lifeStage) + '<span>' + s.lifeStage + '대 / ' + esc(D.types[s.type]) + '</span></nav><header class="lv-ls-heading"><p class="lv-life-kicker">' + esc(D.types[s.type]) + ' · ' + esc(s.audience) + ' · ' + s.lifeStage + '대</p><h2 class="lv-life-title" tabindex="-1" data-ls-title>' + esc(s.name) + '</h2><p class="lv-life-lead">' + esc(s.desc) + '</p></header><div class="lv-ls-overview">' + section('왜 추천했나요?', '<p>' + esc(reason(s)) + '</p>') + section('주요 기능', list(s.feats || [])) + '</div><div class="lv-ls-workspace" data-service-detail="' + esc(s.detail) + '">' +
      (s.detail.indexOf('family-') === 0 && window.LivonFamily ? window.LivonFamily.render(s, parts) : s.detail.indexOf('teen-') === 0 && window.LivonTeen ? window.LivonTeen.render(s, parts) : s.detail.indexOf('youth-') === 0 && window.LivonYouth ? window.LivonYouth.render(s, parts) : s.detail === 'planner' ? planner() : s.detail === 'mentor' ? mentor() : s.detail === 'hobby' ? hobby() : s.detail === 'subjects' ? subjects() : s.detail === 'majors' || s.detail === 'careers' ? catalog(s.detail, parts[2]) : standard(s)) +
      '</div><footer class="lv-ls-footer"><p>이 서비스를 나의 생활로 이어가세요.</p><div class="lv-life-svc__acts">' + button(saved('life-service:' + s.id) ? '저장됨' : '저장하기', 'data-ls-save="' + s.id + '"') + button('공유', 'data-ls-share="' + s.id + '"') + button('AI에게 물어보기', 'data-ls-ai="' + s.id + '"') + link('내 생활 저장함', '#ml-saved') + '</div></footer><p id="life-service-status" role="status" aria-live="polite"></p>';
    if (s.detail.indexOf('family-') === 0 && window.LivonFamily) window.LivonFamily.mount(s, host, parts);
    if (s.detail.indexOf('teen-') === 0 && window.LivonTeen) window.LivonTeen.mount(s, host, parts);
    if (s.detail.indexOf('youth-') === 0 && window.LivonYouth) window.LivonYouth.mount(s, host, parts);
    if (s.detail === 'planner') {
      if (plan) { var form = host.querySelector('[data-ls-planner]'); ['grade','purpose','goal','due','minutes'].forEach(function (key) { form.elements[key].value = key === 'goal' ? plan.title : plan[key]; }); form.elements.subjects.value = plan.subjects.join(', '); form.querySelectorAll('[name="days"]').forEach(function (n) { n.checked = plan.days.includes(Number(n.value)); }); }
      renderPlan();
    }
    if (s.detail === 'subjects') subjectBody('국어');
    if (s.detail === 'hobby') { var hf = host.querySelector('[data-ls-hobby]'), pref = read('livon.serviceFilters.' + s.id, {}, sessionStorage); Object.keys(pref).forEach(function (k) { if (hf.elements[k]) hf.elements[k].value = pref[k]; }); hobbyResults(hf); }
    if ((s.detail === 'majors' || s.detail === 'careers') && host.querySelector('[data-ls-catalog-results]')) catalogResults(s.detail, '', '전체');
    if (s.detail === 'majors' && parts[2] && read('livon.majorCompare', [], sessionStorage).length) compare('');
    window.scrollTo(0, 0); host.querySelector('[data-ls-title]').focus({ preventScroll: true });
    return true;
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ls-save],[data-ls-share],[data-ls-ai],[data-ls-card],[data-ls-plan-save],[data-ls-plan-ai],[data-ls-entry-save],[data-ls-entry-ai],[data-ls-subject-ai],[data-ls-compare],[data-ls-uncompare],[data-ls-expert],[data-ls-education]');
    if (!b) return;
    if (b.hasAttribute('data-ls-card')) { if (!e.target.closest('a,button,input')) location.hash = href(find(b.dataset.lsCard)); return; }
    if (b.hasAttribute('data-ls-save')) return saveService(find(b.dataset.lsSave));
    if (b.hasAttribute('data-ls-share')) {
      var s = find(b.dataset.lsShare), url = location.origin + location.pathname + (location.hash === href(s) || location.hash.indexOf(href(s) + '/') === 0 ? location.hash : href(s));
      if (navigator.share) navigator.share({ title: s.name, url: url }).catch(function (err) { if (err.name !== 'AbortError') notice('공유하지 못했습니다. 주소창의 링크를 복사해 주세요.'); });
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { b.textContent = '링크 복사됨'; }).catch(function () { notice('주소창의 링크를 복사해 주세요.'); });
      else window.prompt('이 링크를 복사해 주세요.', url);
      return;
    }
    if (b.hasAttribute('data-ls-ai')) { var target = find(b.dataset.lsAi); if (target === current && target.detail.indexOf('family-') === 0 && window.LivonFamily && location.hash.indexOf(href(target)) === 0) return window.LivonFamily.ask(); if (target === current && target.detail.indexOf('teen-') === 0 && window.LivonTeen && location.hash.indexOf(href(target)) === 0) return window.LivonTeen.ask(); if (target === current && target.detail.indexOf('youth-') === 0 && window.LivonYouth && location.hash.indexOf(href(target)) === 0) return window.LivonYouth.ask(); return ask(target); }
    if (b.hasAttribute('data-ls-plan-save')) return savePlan();
    if (b.hasAttribute('data-ls-plan-ai')) return ask(current, '다음 입력으로 학습 계획을 제안해 줘.\n' + JSON.stringify({ grade: plan.grade, goal: plan.title, subjects: plan.subjects, due: plan.due, minutesPerDay: plan.minutes, weekdays: plan.days }));
    if (b.hasAttribute('data-ls-subject-ai')) return ask(current, b.dataset.lsSubjectAi + ' 학습 방법과 계획을 알려줘.');
    if (b.hasAttribute('data-ls-entry-ai')) return ask(current, b.dataset.lsEntryAi + '에 대해 무엇부터 알아보면 좋을까?');
    if (b.hasAttribute('data-ls-entry-save')) { var pair = b.dataset.lsEntrySave.split(':'), row = D[pair[0]].find(function (x) { return x.id === pair[1]; }); saveItem(pair.join(':'), row.title, 'Guide', location.hash, current.lifeStage); b.textContent = '저장됨'; return; }
    if (b.hasAttribute('data-ls-compare')) return compare(b.dataset.lsCompare);
    if (b.hasAttribute('data-ls-uncompare')) { write('livon.majorCompare', read('livon.majorCompare', [], sessionStorage).filter(function (x) { return x !== b.dataset.lsUncompare; }), sessionStorage); return compare(''); }
    if (b.hasAttribute('data-ls-expert')) return window.LivonExplore.openResults('진로', { categoryId: '', type: 'expert', region: '' });
    if (b.hasAttribute('data-ls-education')) return window.LivonExplore.openResults('교육', { categoryId: '', type: 'program', region: '' });
  });
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.matches('[data-ls-planner]')) { e.preventDefault(); makePlan(f); }
    if (f.matches('[data-ls-mentor]')) { e.preventDefault(); var topic = f.elements.topic.value; window.LivonExplore.openResults(['취업','포트폴리오'].includes(topic) ? '취업' : '진로', { categoryId: '', type: 'expert', region: '' }); }
    if (f.matches('[data-ls-hobby]')) { e.preventDefault(); hobbyResults(f); }
    if (f.matches('[data-ls-catalog]')) { e.preventDefault(); catalogResults(f.dataset.lsCatalog, f.elements.q.value.trim(), f.elements.field.value); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-ls-subject]')) subjectBody(e.target.value);
    if (e.target.matches('[data-ls-check]')) { plan.items[Number(e.target.dataset.lsCheck)].done = e.target.checked; write('livon.studyPlanDraft', plan, sessionStorage); if ((read('livon.mlStore.v1', {}).checklists || []).some(function (x) { return x.id === plan.id; })) savePlan(); renderPlan(); }
  });
  window.LivonServices = { card: card, open: open, all: function () { return all.slice(); }, ui: { esc: esc, input: input, select: select, button: button, link: link, list: list, section: section, read: read, write: write, notice: notice, ask: ask, catalog: catalog, catalogResults: catalogResults, compare: compare } };
})();
