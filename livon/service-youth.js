(function () {
  var U = window.LivonServices.ui, D = window.LivonYouthData;
  var current, host, state = {}, kind, route = [];
  var e = U.esc, section = U.section, link = U.link, input = U.input, select = U.select;
  function action(label, name, primary) { return U.button(label, 'data-youth-action="' + name + '"', primary); }
  function form(body, label) { return '<form class="lv-ls-form" data-youth-form data-youth-kind="' + kind + '">' + body + '<button class="lv-life-btn lv-life-btn--dark" type="submit">' + e(label || '조건 확인하기') + '</button></form><div data-youth-result aria-live="polite"></div>'; }
  function field(name, label, type, extra) { return input(name, label, type || 'text', extra || 'maxlength="150"'); }
  function regions() { return select('region', '지역', D.regions); }
  function category() { return select('category', '분야', ['전체'].concat(D.categories[kind] || [])); }
  function money(name, title) { return field(name, title + ' (원)', 'number', 'min="0" max="100000000000" step="1" value="0"'); }
  function result(html) { var n = host.querySelector('[data-youth-result]'); if (n) n.innerHTML = html; }
  function savedData(id) { var row = window.LivonPlatform.listSaves('all').find(function (x) { return x.id === 'youth:' + id; }); return row && row.data; }
  function remember() { state.updatedAt=Date.now(); U.write('livon.youthDraft.' + current.id, state, sessionStorage); }
  function persist(label) {
    window.LivonPlatform.saveItem({id:'youth:' + current.id,title:label || current.name,label:label || current.name,type:current.type,source:'라이프 스테이지',lifeStage:'20',href:'#life-service-' + current.id,data:state});
    U.notice('내 생활 → 저장함에 저장했습니다. 이 기기에서 다시 열어 이어갈 수 있습니다.');
  }
  function collect() {
    var f = host.querySelector('[data-youth-form]');
    if (f) new FormData(f).forEach(function (v,k) { state[k] = String(v).slice(0,1500); });
    remember();
  }
  function search(q, type) { collect(); window.LivonExplore.openResults(q, {type:type || '',categoryId:'',region:state.region === '전국' ? '' : (state.region || '')}); }
  function tabs(names) { return '<nav class="lv-youth-tabs" aria-label="상세 분야">' + names.map(function (name,i) { return '<a class="lv-life-btn lv-life-btn--' + ((route[1] || '0') === String(i) ? 'dark' : 'outline') + '" href="#life-service-' + current.id + '/' + i + '"' + ((route[1] || '0') === String(i) ? ' aria-current="page"' : '') + '>' + e(name) + '</a>'; }).join('') + '</nav>'; }
  function emptyFeed(title, url) {
    return section(title, '<div class="lv-youth-empty"><p class="lv-life-kicker">공식 데이터 연결 예정</p><h4>확인된 정보가 연결되면 여기에 표시됩니다.</h4><p>현재 신청 가능 여부·금액·기간을 조회할 수 없습니다. 입력한 조건을 저장하거나 공식 페이지에서 확인해 주세요.</p>' + link('공식 사이트 확인', url, true) + action('조건 저장','save') + action('AI에게 정리 요청','ai') + '</div>');
  }
  function nextLinks() { return section('관련 LIVON 기능', '<div class="lv-life-svc__acts">' + link('내 생활 저장함','#ml-saved') + link('탐색','#explore') + link('오늘의 발견','#today') + link('커뮤니티','#community') + '</div>'); }
  function budget() {
    var n=0;
    return section('한 달의 생활비를 설계하세요.', '<p>한 달 수입과 지출을 정리하고 나에게 맞는 생활비와 저축 목표를 만들어보세요. 목표별 금액은 누적 목표이며 월 저축액에 중복 합산하지 않습니다.</p>' + form(D.budgetGroups.map(function (g) { return '<fieldset class="lv-youth-budget-group"><legend>' + e(g[0]) + '</legend>' + g[1].map(function (title) { return money('n' + n++,title); }).join('') + '</fieldset>'; }).join(''), '이번 달 계획 계산하기'));
  }
  function calculate(values) {
    var nums = Array.from({length:24},function (_,i) { var x = Number(values['n'+i] || 0); if (!Number.isFinite(x)||x<0||x>1e11) throw new Error('금액은 0 이상의 숫자로 입력해 주세요.'); return x; });
    var sum = function(a,b){return nums.slice(a,b).reduce(function(x,y){return x+y;},0);};
    var income=sum(0,3),fixed=sum(3,10),living=sum(10,17),saving=nums[17],remaining=income-fixed-living-saving;
    return {income:income,fixed:fixed,living:living,saving:saving,remaining:remaining,rate:income ? saving/income*100 : null};
  }
  function budgetResult() {
    var b; try { b=calculate(state); } catch(err) { return U.notice(err.message); }
    state.calculated=true;remember();
    result(section('이번 달 계획', '<dl class="lv-youth-summary">' + [['총수입',b.income],['예상 고정비',b.fixed],['예상 생활비',b.living],['예상 저축액 · 목표',b.saving],['남는 금액',b.remaining]].map(function(x){return '<div><dt>'+x[0]+'</dt><dd>'+x[1].toLocaleString('ko-KR')+'<small>원</small></dd></div>';}).join('') + '<div><dt>저축률 · 목표 기준</dt><dd>'+(b.rate === null ? '계산 불가' : b.rate.toFixed(1)+'%')+'</dd></div></dl><p>'+(b.remaining<0?'수입보다 계획한 지출·저축이 많습니다. 지출 또는 저축 목표를 조정해 주세요.':'입력한 금액을 기준으로 계산한 계획입니다. 실제 거래 내역과는 다릅니다.')+'</p><div class="lv-life-svc__acts">'+action('내 생활에 저장','budget-save',true)+action('다시 계산','calculate')+action('AI로 계획 정리하기','ai')+'</div>'));
  }
  function policies(housing) {
    return section(housing?'주거 지원 조건':'지원제도 검색', form(field('query','제도 검색','search')+category()+regions()+(housing ? field('age','연령','number','min="0" max="120"')+field('income','소득 조건')+select('household','가구 형태',['선택 안 함','1인','부부','가족','기타']) : select('status','상태',['전체','신청 가능','신청 예정','상시','종료'])),'선택 조건 확인')) + emptyFeed('지원제도 안내',housing?'https://www.myhome.go.kr/':'https://www.gov.kr/');
  }
  function discovery(classes) {
    return section(classes?'나에게 맞는 취미 찾기':'여행 · 전시 · 공연', '<p>오늘의 발견에 등록된 안내 콘텐츠를 함께 사용합니다. 실시간 행사 일정·클래스 재고·가격은 연결되지 않았습니다.</p>'+form(category()+select('period',classes?'희망 날짜 조건':'추천 조건',['상관없음','오늘','이번 주','이번 주말','이번 달'])+select('companion','누구와',['상관없음','혼자','연인','친구','가족'])+regions()+(classes?select('cost','가격',['상관없음','무료','유료'])+field('date','희망 날짜','date','')+select('duration','시간',['상관없음','1시간 이내','반나절','하루'])+select('place','실내/야외',['상관없음','실내','야외']):''),'관련 콘텐츠 보기'));
  }
  function discoveryResults() {
    var strictDate = state.date || (state.period && state.period !== '상관없음');
    var rows = ((window.LivonTodayData||{}).contents||[]).filter(function(x){
      var text=[x.title,x.blurb,(x.tags||[]).join(' ')].join(' '), cat=state.category;
      if(kind==='culture' && !/여행|전시|공연|축제|팝업|체험|문화|산책/.test(text))return false;
      if(kind==='classes' && !/취미|클래스|베이킹|공예|사진|운동|요가|도자기|음악|미술|댄스|요리|창작/.test(text))return false;
      if (cat && cat!=='전체' && !(cat==='무료 행사' ? x.budget==='무료' : text.includes(cat))) return false;
      if(state.region && state.region!=='전국' && x.region!==state.region)return false;
      if(state.companion && state.companion!=='상관없음' && !(x.companion||[]).includes(state.companion))return false;
      if(state.place && state.place!=='상관없음' && x.indoorOutdoor!==state.place)return false;
      if(state.cost==='무료' && x.budget!=='무료')return false;
      if(state.cost==='유료' && (!x.budget||x.budget==='무료'))return false;
      if(state.duration && state.duration!=='상관없음') {var ds=String(x.duration||''),ns=ds.match(/\d+/g);if(!ns||!/시간|분/.test(ds))return false;var max=Math.max.apply(null,ns.map(Number));if(/분/.test(ds)&&!/시간/.test(ds))max/=60;if(state.duration==='1시간 이내'&&max>1||state.duration==='반나절'&&(max<=1||max>4)||state.duration==='하루'&&max<=4)return false;}
      return true;
    });
    result((strictDate?'<p>선택한 날짜에 운영하는지 확인할 실시간 데이터가 없습니다. 아래는 날짜 조건을 적용하지 않은 관련 안내입니다.</p>':'')+'<div class="lv-ls-results">'+(rows.length?rows.slice(0,12).map(function(x){return '<article class="lv-life-svc"><img class="lv-youth-image" src="'+e(x.img)+'" alt="'+e(x.alt||'')+'" loading="lazy" /><p>'+e(x.category)+' · '+e(x.region)+'</p><h4>'+e(x.title)+'</h4><p>'+e(x.blurb)+'</p><p>'+e(x.price||'가격은 공식 안내 확인')+'</p><p>일정은 공식 정보 확인</p>'+link('오늘의 발견에서 자세히','#td-item-'+x.id,true)+'</article>';}).join(''):'<p>조건에 맞는 등록 콘텐츠가 없습니다. 조건을 넓혀 보세요.</p>')+'</div><div class="lv-life-svc__acts">'+action('조건 저장','save')+link('내 일정에 추가 · 직접 입력','#ml-calendar')+action('AI에게 일정 짜달라고 하기','ai')+link('탐색에서 찾기','#ex-programs')+'</div>');
  }
  function university() {
    var active=route[1]||'0';
    return tabs(['대학','전공','편입'])+(active==='1' ? U.catalog('majors',route[2]) : active==='2' ? section('편입 준비 가이드', '<p>일반편입·학사편입은 지원 자격과 전형이 다릅니다. 학교·모집연도별 공식 모집요강에서 본인의 자격을 확인하세요.</p>'+U.list(['일반편입: 대학별 지원 자격 및 이수 요건 확인','학사편입: 학위 요건과 모집 여부 확인','관심 대학·전공 목록 정리','공식 모집요강에서 일정·서류·전형 확인','준비 과정과 마감일을 내 생활에 기록'])+link('공식 대학 정보 확인','https://www.adiga.kr/')+action('관련 상담 찾기','mentor')+action('AI에게 물어보기','ai')) : section('대학 검색',form(field('query','대학 검색','search')+regions(),'검색 조건 확인'))+emptyFeed('대학 정보','https://www.adiga.kr/'));
  }
  function education() {return section('자격증 · 직무 교육',form(field('query','배우고 싶은 분야를 검색해보세요.','search')+category()+select('purpose','사용 목적',['취업','이직','자기계발','자격증','실무 역량']),'관련 교육 찾기'))+section('공식 정보에서 확인하세요.', '<p>과정별 기간·교육 방식·가격과 시험 일정은 공식 데이터 연결이 필요합니다.</p>'+link('국가자격 · 큐넷','https://www.q-net.or.kr/')+link('직업훈련 · 고용24','https://www.work24.go.kr/')+link('학습 계획 만들기','#life-service-study-planner')+action('관심 조건 저장','save')+action('AI에게 물어보기','ai'));}
  function jobs() {return section('채용 정보 검색',form(field('query','직무 또는 회사 검색','search')+select('employment','고용 형태',['전체','신입','인턴','경력','계약','아르바이트'])+category()+regions()+select('mode','근무 형태',['전체','출근','재택','혼합'])+field('experience','경력')+field('degree','학력')+field('job','직무'),'검색 조건 확인'))+emptyFeed('채용 공고','https://www.work24.go.kr/')+'<div class="lv-life-svc__acts">'+link('지원 일정 저장 · 직접 입력','#ml-calendar')+link('이력서 준비','#life-service-service-20-08')+action('AI에게 준비 방법 묻기','ai')+'</div>';}
  function expert(counsel) {return section('어떤 도움이 필요한가요?',form(select('topic','상담 주제',counsel?D.counselTopics:D.mentorTopics)+regions(),'전문가·기관 찾기')+'<p>탐색의 기존 기관 안내로 연결합니다. 개인 전문가·상담 일정·가격·후기는 등록·검증 후 제공됩니다.'+(counsel?' 의료적 진단·치료를 대신하지 않습니다.':'')+'</p>');}
  function checklist(moving) {
    var groups=D.checklists[moving?'moving':'resume'],names=Object.keys(groups),title=names[Number(route[1])||0]||names[0];
    return tabs(names)+section(title,form((moving?'':field('job','준비하는 취업 분야'))+'<div class="lv-ls-checklist lv-youth-full">'+groups[title].map(function(text,i){var key=title+'-'+i;return '<label><input type="checkbox" data-youth-check="'+e(key)+'"'+((state.checks||{})[key]?' checked':'')+' />'+e(text)+'</label>';}).join('')+'</div>',moving?'내 생활에 체크리스트 저장':'체크리스트 저장')+'<div class="lv-life-svc__acts">'+action(moving?'서비스 찾기':'관련 멘토 찾기',moving?'cleaning':'mentor')+action(moving?'AI로 이사 계획 만들기':'AI로 준비하기','ai')+'</div>');
  }
  function housing() {return section('내 조건 정리',form(regions()+money('deposit','보증금')+money('rent','월세')+money('fee','관리비')+field('date','입주 예정일','date','')+select('room','주거 유형',['원룸','오피스텔'])+field('size','원하는 크기')+select('parking','주차',['상관없음','필요','불필요'])+select('pets','반려동물',['상관없음','필요'])+select('elevator','엘리베이터',['상관없음','필요'])+select('station','역세권',['상관없음','필요'])+field('options','필요한 옵션'),'조건 정리하기'))+'<p>실제 매물·가격·입주 가능 여부는 연결되어 있지 않습니다.</p><div class="lv-life-svc__acts">'+action('매물/주거 서비스 탐색','housing-search',true)+action('조건 저장','save')+link('이사 체크리스트 만들기','#life-service-service-20-11')+action('AI에게 조건 정리 요청','ai')+'</div>';}
  function products() {
    return section('직접 확인한 제품을 비교하세요.', '<p>제품명과 확인한 정보를 직접 입력하세요. 빈 값은 비교에서 미입력으로 표시하며 실시간 가격을 생성하지 않습니다.</p>'+form(select('category','제품 종류',['침대','책상','의자','소파','수납','식탁','냉장고','세탁기','건조기','TV','청소기','전자레인지','에어컨'])+[0,1,2].map(function(i){return '<fieldset class="lv-youth-budget-group"><legend>제품 '+(i+1)+'</legend>'+field('p'+i+'title','제품명', 'text', 'maxlength="150"'+(i<2?' required':''))+['가격','크기','기능','공간','유지비','배송/설치','사용 목적'].map(function(t,j){return field('p'+i+'v'+j,t);}).join('')+'</fieldset>';}).join(''),'비교하기'));
  }
  function productResult() {
    var rows=[0,1,2].filter(function(i){return (state['p'+i+'title']||'').trim();});
    result(section('비교 결과 · 직접 입력', '<div class="lv-youth-compare">'+rows.map(function(i){return '<article class="lv-life-svc"><h4>'+e(state['p'+i+'title'])+'</h4><dl>'+['가격','크기','기능','공간','유지비','배송/설치','사용 목적'].map(function(t,j){return '<dt>'+t+'</dt><dd>'+e(state['p'+i+'v'+j]||'미입력')+'</dd>';}).join('')+'</dl></article>';}).join('')+'</div><div class="lv-life-svc__acts">'+action('비교 목록 저장','save',true)+link('상품 탐색','#ex-commerce')+action('AI에게 비교 요청','ai')+'</div>'));
  }
  function services() {return section('필요한 도움을 정리하세요.',form(category()+field('query','필요한 서비스')+regions()+field('date','원하는 날짜','date','')+money('budget','예산')+field('request','요청사항','text','maxlength="1500"'),'서비스 찾기')+'<p>탐색에 등록된 서비스 안내로 연결합니다. 원하는 날짜·예산·요청사항은 상담용 메모이며 실제 예약이나 견적 요청으로 전송되지 않습니다.</p>')+action('요청 조건 저장','save')+action('AI에게 정리 요청','ai');}
  function render(s,parts) {
    current=s;kind=s.detail.replace('youth-','');route=parts;state=U.read('livon.youthDraft.'+s.id,null,sessionStorage)||savedData(s.id)||{};
    if(kind==='resume'||kind==='moving'){var existing=(U.read('livon.mlStore.v1',{}).checklists||[]).find(function(x){return x.id==='youth-checklist-'+s.id;});if(existing && (!state.updatedAt || existing.updatedAt > state.updatedAt)){state.checks=state.checks||{};existing.items.forEach(function(x){state.checks[x.id]=x.done;});}}
    var renderers={budget:budget,policies:function(){return policies(false);},housingpolicy:function(){return policies(true);},culture:function(){return discovery(false);},classes:function(){return discovery(true);},university:university,education:education,jobs:jobs,jobmentor:function(){return expert(false);},counsel:function(){return expert(true);},resume:function(){return checklist(false);},moving:function(){return checklist(true);},housing:housing,products:products,services:services};
    return renderers[kind]()+nextLinks();
  }
  function mount(s,node,parts) {
    host=node;
    var f=host.querySelector('[data-youth-form]');if(f)Object.keys(state).forEach(function(k){var control=f.elements.namedItem(k);if(control && typeof state[k]==='string')control.value=state[k];});
    if(kind==='budget'&&state.calculated)budgetResult();
    if(kind==='products'&&state.p0title)productResult();
    if(kind==='culture'||kind==='classes')discoveryResults();
    if(kind==='university'&&parts[1]==='1') {
      // Reuse the existing major catalog, changing only this hub's detail prefix.
      var results=host.querySelector('[data-ls-catalog-results]');if(results)U.catalogResults('majors','','전체');
      if(parts[2] && U.read('livon.majorCompare',[],sessionStorage).length)U.compare('');
    }
  }
  function saveChecklist() {
    var store=U.read('livon.mlStore.v1',{}),groups=D.checklists[kind],id='youth-checklist-'+current.id;
    store.checklists=store.checklists||[];
    var previous=store.checklists.find(function(x){return x.id===id;});
    var item={id:id,title:current.name,desc:state.job||'20대 생활 준비',createdAt:previous?previous.createdAt:Date.now(),updatedAt:Date.now(),items:[]};
    Object.keys(groups).forEach(function(title){groups[title].forEach(function(text,i){var key=title+'-'+i;item.items.push({id:key,text:title+' · '+text,done:!!(state.checks||{})[key]});});});
    var index=store.checklists.findIndex(function(x){return x.id===id;});if(index<0)store.checklists.unshift(item);else store.checklists[index]=item;
    if(U.write('livon.mlStore.v1',store))persist();
  }
  function askCurrent(){collect();var f=host.querySelector('[data-youth-form]'),lines=[];if(f)Array.from(f.elements).forEach(function(c){var label=c.closest('label');if(c.name&&label&&c.value)lines.push(label.childNodes[0].textContent+': '+c.value);});if(state.checks)lines.push('완료 항목: '+Object.keys(state.checks).filter(function(k){return state.checks[k];}).join(', '));return U.ask(current,'사용자가 직접 입력한 조건입니다. 실제 정보로 가정하지 말고 필요한 확인을 도와줘.\n'+lines.join('\n'));}
  document.addEventListener('submit',function(ev){if(!ev.target.matches('[data-youth-form]'))return;ev.preventDefault();collect();
    if(kind==='budget')return budgetResult();
    if(kind==='products')return productResult();
    if(kind==='resume'||kind==='moving')return saveChecklist();
    if(kind==='culture'||kind==='classes')return discoveryResults();
    if(kind==='jobmentor')return search('취업','expert');
    if(kind==='counsel')return search(state.topic==='가족'?'가족 상담':'상담','expert');
    if(kind==='education')return search(state.query|| (state.category==='전체'?'교육':state.category),'program');
    if(kind==='services')return search(state.query||(state.category==='전체'?'':state.category),'service');
    result(section('입력한 조건',U.list(Object.keys(state).filter(function(k){return typeof state[k]==='string'&&state[k];}).map(function(k){var control=ev.target.elements.namedItem(k);return (control&&control.closest('label')?control.closest('label').childNodes[0].textContent:k)+': '+state[k];}))+'<p>조건을 정리했습니다. 실제 결과는 공식 데이터 연결 후 제공됩니다.</p>'));
  });
  document.addEventListener('change',function(ev){if(!host||!host.contains(ev.target)||!current||location.hash.indexOf('#life-service-'+current.id)!==0)return;if(ev.target.hasAttribute('data-youth-check')){state.checks=state.checks||{};state.checks[ev.target.getAttribute('data-youth-check')]=ev.target.checked;}collect();});
  document.addEventListener('click',function(ev){var b=ev.target.closest('[data-youth-action]');if(!b)return;var f=host.querySelector('[data-youth-form]');if(f&&!f.reportValidity())return;collect();var a=b.dataset.youthAction;
    if(a==='save')return persist();
    if(a==='ai')return askCurrent();
    if(a==='calculate')return budgetResult();
    if(a==='budget-save'){var calc=calculate(state),store=U.read('livon.mlStore.v1',{});store.budgets=store.budgets||{};store.budgets.monthly=calc.fixed+calc.living;store.budgets.plan=state;if(U.write('livon.mlStore.v1',store))persist('이번 달 생활비·저축 계획');return;}
    if(a==='mentor')return search('취업','expert');
    if(a==='cleaning')return search('청소','service');
    if(a==='housing-search')return search('주거','');
  });
  window.LivonYouth={render:render,mount:mount,calculate:calculate,ask:askCurrent};
})();
