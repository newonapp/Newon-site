(function () {
  var U=window.LivonServices.ui, D=window.LivonTeenData, O=window.LivonOpportunities;
  var e=U.esc, section=U.section, link=U.link, current, host, kind, filters={}, selected=null;
  var STORE='livon.mlStore.v1', PREFIX='teen-allowance-', GOAL=PREFIX+'goal';
  function dateText(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function store() { var s=U.read(STORE,{});s.transactions=s.transactions||[];s.events=s.events||[];s.goals=s.goals||[];s.teenAllowance=s.teenAllowance||{months:{}};return s; }
  function upsert(rows,item) {var i=rows.findIndex(function(x){return x.id===item.id;});if(i<0)rows.unshift(item);else rows[i]=Object.assign({},rows[i],item);}
  function amount(v) {var n=Number(v||0);if(!Number.isSafeInteger(n)||n<0||n>100000000)throw Error('금액은 0~100,000,000원 사이의 정수로 입력해 주세요.');return n;}
  function summary(s,month,today) {
    var tx=(s.transactions||[]).filter(function(x){return x.id.indexOf(PREFIX)===0;});
    var rows=tx.filter(function(x){return String(x.date).slice(0,7)===month;}),income=0,spent=0,byCat={},week=0;
    var now=new Date(today+'T12:00:00'),monday=new Date(now);monday.setDate(now.getDate()-(now.getDay()+6)%7);
    rows.forEach(function(x){if(x.kind==='income')income+=Number(x.amount)||0;else {spent+=Number(x.amount)||0;byCat[x.category]=(byCat[x.category]||0)+(Number(x.amount)||0);}});
    tx.forEach(function(x){if(x.kind==='expense'&&x.date>=dateText(monday)&&x.date<=today)week+=Number(x.amount)||0;});
    var saving=Number((((s.teenAllowance||{}).months||{})[month]||{}).saving)||0;
    return {income:income,spent:spent,saving:saving,remaining:income-spent-saving,week:week,top:Object.keys(byCat).sort(function(a,b){return byCat[b]-byCat[a];})[0]||'기록 없음',rows:rows};
  }
  function applyMoney(s,form,v,now) {
    var stamp=now.getTime(),month=v.month||dateText(now).slice(0,7);
    if(form==='income') {
      if(!/^\d{4}-\d{2}$/.test(month)||!O.validDate(month+'-01'))throw Error('기록할 월을 확인해 주세요.');
      var values=['regular','extra','other'].map(function(k){return amount(v[k]);}),saving=amount(v.saving);
      ['정기 용돈','추가 용돈','기타 수입'].forEach(function(label,i){upsert(s.transactions,{id:PREFIX+month+'-income-'+i,kind:'income',amount:values[i],date:month+'-01',category:label,note:'월별 용돈 합계',updatedAt:stamp,createdAt:stamp});});
      s.teenAllowance.months[month]={saving:saving};
    } else if(form==='expense') {
      var value=amount(v.amount);if(!value||!O.validDate(v.date)||v.date>dateText(now))throw Error('지출 금액과 날짜를 확인해 주세요. 미래 지출은 기록할 수 없습니다.');
      if(!D.expenses.includes(v.category))throw Error('지출 분류를 선택해 주세요.');
      upsert(s.transactions,{id:PREFIX+'expense-'+stamp+'-'+Math.random().toString(36).slice(2,8),kind:'expense',amount:value,date:v.date,category:v.category,note:String(v.memo||'').slice(0,300),updatedAt:stamp,createdAt:stamp});
    } else if(form==='goal') {
      var target=amount(v.target),saved=amount(v.saved);if(!target||!v.title.trim()||!O.validDate(v.due))throw Error('목표 이름·금액·날짜를 확인해 주세요.');
      var progress=Math.min(100,Math.round(saved/target*100));
      upsert(s.goals,{id:GOAL,title:v.title.trim().slice(0,100),target:target,current:saved,due:v.due,start:dateText(now),progress:progress,status:progress>=100?'완료':'진행 중',category:'저축',note:'용돈 관리에서 입력한 저축 목표',next:'저축 기록 업데이트',updatedAt:stamp,createdAt:stamp});
    }
    return s;
  }
  function action(text,name,primary) {return U.button(text,'data-teen-action="'+name+'"',primary);}
  function field(name,title,type,extra) {return U.input(name,title,type||'text',extra||'maxlength="150"');}
  function money(name,title,value) {return field(name,title+' (원)','number','min="0" max="100000000" step="1" required value="'+amount(value)+'"');}
  function select(name,title,values) {return U.select(name,title,['전체'].concat(values));}
  function form(name,body,submit) {return '<form class="lv-ls-form" data-teen-form="'+name+'">'+body+'<button type="submit" class="lv-life-btn lv-life-btn--dark">'+e(submit)+'</button></form>';}
  function values(formNode) {var v={};new FormData(formNode).forEach(function(x,k){v[k]=String(x).slice(0,500);});return v;}
  function route(item) {return '#life-service-'+current.id+(kind==='camp'||kind==='volunteer'?'/'+kind:'')+(item?'/item/'+item.id:'');}
  function save(id,title,url,data) {window.LivonPlatform.saveItem({id:id,title:title,label:title,type:current.type,source:'라이프 스테이지',lifeStage:'10',href:url,data:data||null});U.notice('내 생활 → 저장함에 저장했습니다. 이 브라우저에서 다시 확인할 수 있습니다.');}
  function allowance() {
    var s=store(),month=filters.month||dateText(new Date()).slice(0,7),b=summary(s,month,dateText(new Date())),g=s.goals.find(function(x){return x.id===GOAL;})||{},monthly=s.teenAllowance.months[month]||{};
    function inc(i){var t=s.transactions.find(function(x){return x.id===PREFIX+month+'-income-'+i;});return t?t.amount:0;}
    return '<div class="lv-teen-intro"><span class="lv-life-kicker">MY ALLOWANCE</span><p>작은 기록이 만드는 나의 저축 습관</p><span>이 브라우저에 저장됩니다. 월별 합계와 목표를 직접 수정할 수 있어요.</span></div>'+section('01 / 이번 달 용돈',form('income',field('month','기록할 월','month','required value="'+e(month)+'"')+money('regular','정기 용돈',inc(0))+money('extra','추가 용돈',inc(1))+money('other','기타 수입',inc(2))+money('saving','이번 달 따로 저축한 돈',monthly.saving),'월별 기록 저장'))+
      section('02 / 한눈에 보는 기록','<p>'+e(month)+' · 용돈 관리에서 기록한 금액만 집계합니다.</p><dl class="lv-youth-summary">'+[['받은 돈',b.income],['쓴 돈',b.spent],['따로 저축한 돈',b.saving],['남은 예산',b.remaining]].map(function(x){return '<div><dt>'+x[0]+'</dt><dd>'+x[1].toLocaleString('ko-KR')+'<small>원</small></dd></div>';}).join('')+'</dl><p>남은 예산 = 받은 돈 − 지출 − 이번 달 저축. 저축 목표의 누적 금액은 다시 차감하지 않습니다.</p><div class="lv-teen-facts"><p>가장 많이 쓴 곳<strong>'+e(b.top)+'</strong></p><p>이번 주 지출 · 월요일부터 오늘<strong>'+b.week.toLocaleString('ko-KR')+'원</strong></p></div>'+(b.remaining<0?'<p role="status">지출과 저축 기록이 받은 돈보다 많아요. 이번 달 기록을 확인해 보세요.</p>':''))+
      section('03 / 쓴 돈 기록하기',form('expense',money('amount','지출 금액',0)+U.select('category','카테고리',D.expenses)+field('date','지출 날짜','date','required max="'+dateText(new Date())+'" value="'+dateText(new Date())+'"')+field('memo','메모 · 선택','text','maxlength="300"'),'지출 기록 저장')+'<ul class="lv-teen-ledger">'+b.rows.filter(function(x){return x.kind==='expense';}).slice(0,20).map(function(x){return '<li><div><strong>'+e(x.category)+'</strong><span>'+e(x.date)+' · '+e(x.note)+'</span></div><strong>'+Number(x.amount).toLocaleString('ko-KR')+'원</strong></li>';}).join('')+'</ul><p>기록 수정·삭제는 '+link('내 생활 생활비','#ml-money')+'에서 할 수 있어요.</p>')+
      section('04 / 나의 저축 목표',form('goal',field('title','목표 이름','text','required maxlength="100" value="'+e(g.title||'')+'"')+money('target','목표 금액',g.target||0)+money('saved','현재 모은 금액',g.current||0)+field('due','목표 날짜','date','required value="'+e(g.due||'')+'"'),g.id?'저축 목표 수정':'저축 목표 만들기')+(g.id?'<div class="lv-teen-progress"><p>'+e(g.title)+' <strong>'+g.progress+'%</strong></p><progress max="100" value="'+g.progress+'" aria-label="저축 목표 진행률"></progress><p>'+Number(g.current||0).toLocaleString('ko-KR')+' / '+Number(g.target||0).toLocaleString('ko-KR')+'원</p></div>':'')+'<p>목표는 내 생활의 목표와 연결됩니다. 금융상품 추천 없이 기록과 생활 습관을 돕습니다.</p>')+
      '<div class="lv-life-svc__acts">'+action('내 생활에 저장','save',true)+action('AI에게 용돈 계획 물어보기','ai')+link('내 생활 목표','#ml-goals')+'</div>';
  }
  function searchView() {
    var tabs=(kind==='camp'||kind==='volunteer')?'<nav class="lv-youth-tabs" aria-label="활동 종류">'+['camp','volunteer'].map(function(k){return '<a href="#life-service-'+current.id+'/'+k+'" class="lv-life-btn lv-life-btn--'+(kind===k?'dark':'outline')+'"'+(kind===k?' aria-current="page"':'')+'>'+(k==='camp'?'캠프':'봉사활동')+'</a>';}).join('')+'</nav>':'';
    var body=field('query','검색어','search')+select('category','관심 분야',D.categories[kind])+U.select('region','시·도',D.regions);
    if(kind==='local')body+=field('district','시·군·구 · 시·도 선택 후 입력')+select('facility','시설 유형',['청소년수련관','청소년문화의집','도서관','문화센터','체육시설','진로체험센터','상담센터','기타']);
    if(kind==='experience')body+=select('programType','프로그램 유형',['현장 직업체험','진로체험','기업 체험','대학 체험','직업인 강연','온라인 체험','진로 캠프'])+select('grade','학년',['초등학생','중학생','고등학생','학교 밖 청소년']);
    if(kind==='competition')body+=select('participation','참가 형태',['개인','팀','개인/팀 모두'])+select('audience','참가 대상',['중학생','고등학생','청소년 전체','대학생 포함','제한 없음'])+field('deadline','접수 마감일 · 이 날짜까지','date','');
    else body+=field('date','참여 희망 날짜','date','')+field('age','연령','number','min="10" max="19" step="1"');
    if(kind==='camp'||kind==='volunteer')body+=field('hours','활동시간 · 최대 시간','number','min="0.5" max="720" step="0.5"')+select('overnight','숙박 여부',['숙박','비숙박']);
    body+=select('cost','비용',['무료','유료'])+select('mode','진행 방식',['온라인','오프라인'])+select('status','모집 상태',['접수 중','접수 예정','마감 임박','종료']);
    return tabs+section('01 / 나에게 맞는 조건','<p>청소년 대상 프로그램을 찾습니다. 지역은 직접 선택하며 현재 위치를 추정하지 않습니다.</p>'+form('search',body,'조건으로 찾기'))+section('02 / 참여 기회','<div data-teen-results aria-live="polite"></div>');
  }
  function results() {
    var n=host.querySelector('[data-teen-results]');if(!n)return;
    var rows=O.query(Object.assign({},filters,{type:kind}));
    n.innerHTML='<p class="lv-life-kicker">확인된 정보 '+rows.length+'개</p>'+(rows.length?'<div class="lv-ls-results">'+rows.map(function(x){return '<article class="lv-life-svc"><p>'+e(x.category)+' · '+e(x.region)+'</p><h4>'+e(x.title)+'</h4><p>'+e(x.organizer)+'</p><p>'+e(x.startDate||'일정 미확인')+' · '+e(x.status||'모집 상태 미확인')+'</p>'+link('상세 보기',route(x),true)+'</article>';}).join('')+'</div>':'<div class="lv-youth-empty"><svg class="lv-teen-empty-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><circle cx="21" cy="21" r="12"/><path d="m30 30 10 10M16 21h10M21 16v10"/></svg><span class="lv-life-kicker">공식 데이터 연결 예정</span><h4>지금 표시할 수 있는 프로그램이 없어요.</h4><p>실시간 모집 정보를 아직 연결하지 않았거나 조건에 맞는 확인된 항목이 없습니다. 신청기간·비용·봉사시간은 공식 정보가 확인될 때 표시합니다.</p></div>')+'<div class="lv-life-svc__acts">'+action('검색 조건 저장','save')+action('AI로 준비 방향 정리','ai')+'</div>';
  }
  function details(x) {
    var labels={description:'소개',category:'분야',organizer:'운영기관',targetAge:'대상 연령',targetGrade:'대상 학년',region:'지역',location:'장소',startDate:'시작일',endDate:'종료일',applicationStart:'신청 시작',applicationEnd:'신청 마감',price:'비용 (원)',status:'모집 상태',programType:'프로그램 유형',activities:'활동 내용',preparation:'준비물',applicationMethod:'신청 방법',theme:'주제',participation:'참가 방식',deliverables:'제출물',awards:'시상 내용',notes:'유의사항',hours:'활동시간',volunteerCredit:'봉사시간 인정',facility:'시설',source:'공식 출처',lastVerifiedAt:'정보 확인일'};
    return section(x.title,link('← 검색 결과',route())+'<dl class="lv-teen-detail">'+Object.keys(labels).map(function(k){return '<div><dt>'+labels[k]+'</dt><dd>'+e(x[k]===undefined||x[k]===null||x[k]===''?'공식 정보 확인 필요':Array.isArray(x[k])?x[k].join(' ~ '):x[k])+'</dd></div>';}).join('')+'</dl><div class="lv-life-svc__acts">'+action('관심 저장','save',true)+((O.validDate(x.type==='competition'?x.applicationEnd:x.startDate))?action(x.type==='competition'?'마감일 일정에 추가':'일정에 추가','calendar'):'')+link('공식 신청 정보 확인',x.sourceUrl)+U.button('공유','data-ls-share="'+current.id+'"')+action('AI에게 물어보기','ai')+(O.safeUrl(x.directionsUrl)?link('길찾기',x.directionsUrl):'')+'</div>');
  }
  function counsel() {
    var c=D.counseling;
    return section('01 / 필요한 도움 찾기',form('counsel',U.select('topic','어떤 도움이 필요한가요?',D.topics)+select('method','상담 방식',['전화','채팅','온라인','방문','기타 공식 상담 방식'])+U.select('region','지역',D.regions),'공식 도움 경로 확인'))+'<div data-teen-help aria-live="polite"></div>'+section('02 / 공식 상담 창구','<article class="lv-teen-counsel"><p class="lv-life-kicker">공식 기관 · 전국</p><h4>'+c.title+'</h4><p>'+e(c.description)+'</p><dl class="lv-teen-detail"><div><dt>운영기관</dt><dd>'+e(c.organizer)+'</dd></div><div><dt>이용 안내</dt><dd>청소년 및 상담·복지 지원이 필요한 경우 공식 페이지에서 대상과 방법을 확인해 주세요.</dd></div><div><dt>상담 방법</dt><dd>전화 · 온라인 채팅 · 게시판 / 방문 상담은 지역 기관에 확인</dd></div><div><dt>운영 안내</dt><dd>'+e(c.hours)+'</dd></div><div><dt>공식 연락처</dt><dd>'+c.contact+'</dd></div></dl><div class="lv-life-svc__acts">'+link('전화·상담 방법 확인',c.sourceUrl,true)+link('지역 상담기관 찾기',c.directoryUrl)+action('공식 기관 저장','save')+'</div><p class="lv-teen-caption">출처: 청소년1388 · 확인일 '+c.lastVerifiedAt+'. 지역별 연락처·운영시간은 공식 안내에서 확인합니다.</p></article>');
  }
  function help() {var n=host.querySelector('[data-teen-help]');if(n)n.innerHTML=section(D.safety.priorityTopics.includes(filters.topic)?'공식 도움을 먼저 연결하세요.':'선택한 조건으로 다음 단계', '<p>'+e([filters.topic,filters.method,filters.region].filter(Boolean).join(' · '))+'</p><p>이 선택은 진단이 아닙니다. 지역별 상담 가능 시간은 아직 조회할 수 없습니다. 공식 창구에서 이용 방법과 지역 기관을 확인해 주세요.</p>'+link('청소년1388 공식 도움 받기',D.safety.helpUrl,true));}
  function collect() {var f=host&&host.querySelector('[data-teen-form="search"], [data-teen-form="counsel"]');if(f){filters=values(f);U.write('livon.teenFilters.'+current.id+'.'+kind,filters,sessionStorage);}return filters;}
  function ask() {
    collect();if(kind==='counsel'&&D.safety.priorityTopics.includes(filters.topic)){help();host.querySelector('[data-teen-help]').scrollIntoView({block:'center'});return;}
    var context=selected?'공식 출처에서 확인된 항목: '+JSON.stringify(selected):kind==='allowance'?'사용자가 기록한 용돈 집계: '+JSON.stringify((function(){var b=summary(store(),filters.month||dateText(new Date()).slice(0,7),dateText(new Date()));delete b.rows;return b;})()):'사용자가 선택한 검색 조건: '+JSON.stringify(filters)+'\n실제 프로그램 데이터는 연결되지 않았습니다. 존재하는 프로그램으로 가정하지 마세요.';
    if(kind==='allowance')context+='\n청소년에게 투자·금융상품을 추천하지 말고 지출 습관과 저축 계획을 도와주세요.';
    return U.ask(current,context);
  }
  function addCalendar(x) {
    var date=x.type==='competition'?x.applicationEnd:x.startDate;if(!O.validDate(date))return false;
    var s=store(),id='opportunity:'+x.id+(x.type==='competition'?':deadline':':start');
    if(!s.events.some(function(v){return v.id===id;}))s.events.push({id:id,title:x.title+(x.type==='competition'?' · 접수 마감':''),date:date,start:'',end:'',allDay:true,place:x.location||'',category:'개인',note:x.sourceUrl,done:false,updatedAt:Date.now(),createdAt:Date.now()});
    return U.write(STORE,s);
  }
  function render(s,parts) {
    current=s;kind=s.detail.replace('teen-','');if(kind==='camp'&&parts[1]==='volunteer')kind='volunteer';
    var saved=window.LivonPlatform.listSaves('all').find(function(x){return x.id==='teen-search:'+s.id+'.'+kind;});
    filters=U.read('livon.teenFilters.'+s.id+'.'+kind,null,sessionStorage)||(saved&&saved.data&&saved.data.filters)||{};selected=null;
    var itemIndex=parts.indexOf('item');if(itemIndex>=0){selected=O.get(parts[itemIndex+1]);if(!selected||selected.type!==kind){selected=null;return section('항목을 찾을 수 없습니다.',link('검색으로 돌아가기',route()));}return details(selected);}
    return kind==='allowance'?allowance():kind==='counsel'?counsel():searchView();
  }
  function mount(s,node) {host=node;var f=host.querySelector('[data-teen-form="search"], [data-teen-form="counsel"]');if(f){Object.keys(filters).forEach(function(k){if(f.elements.namedItem(k))f.elements.namedItem(k).value=filters[k];});var district=f.elements.namedItem('district');if(district)district.disabled=!f.elements.region.value||f.elements.region.value==='전체';}results();if(kind==='counsel'&&filters.topic)help();}
  function active() {return current&&location.hash.indexOf('#life-service-'+current.id)===0;}
  function refresh() {window.LivonServices.open(location.hash.slice(1));}
  document.addEventListener('submit',function(ev){if(!ev.target.matches('[data-teen-form]')||!active())return;ev.preventDefault();var f=ev.target,name=f.dataset.teenForm,v=values(f);
    if(name==='search'||name==='counsel'){collect();if(name==='search')results();else help();return;}
    try {var s=applyMoney(store(),name,v,new Date());if(U.write(STORE,s)){if(name==='income'){filters.month=v.month;U.write('livon.teenFilters.'+current.id+'.'+kind,filters,sessionStorage);}refresh();U.notice('기록을 저장했습니다. 내 생활에서도 확인할 수 있습니다.');}}catch(err){U.notice(err.message);}
  });
  document.addEventListener('change',function(ev){if(!active()||!host.contains(ev.target))return;var f=ev.target.closest('[data-teen-form]');if(!f)return;if(f.dataset.teenForm==='search'||f.dataset.teenForm==='counsel'){if(ev.target.name==='region'&&f.elements.namedItem('district')){f.elements.district.value='';f.elements.district.disabled=ev.target.value==='전체';}collect();}else if(f.dataset.teenForm==='income'&&ev.target.name==='month'){filters.month=ev.target.value;U.write('livon.teenFilters.'+current.id+'.'+kind,filters,sessionStorage);refresh();}});
  document.addEventListener('click',function(ev){var b=ev.target.closest('[data-teen-action]');if(!b||!active())return;var a=b.dataset.teenAction;collect();if(a==='ai')return ask();if(a==='calendar'&&selected){if(addCalendar(selected))U.notice('내 일정에 추가했습니다. 같은 항목은 중복 추가되지 않습니다.');return;}if(a==='save'){if(selected)save('opportunity:'+selected.id,selected.title,route(selected));else if(kind==='counsel')save(D.counseling.id,D.counseling.title,route());else if(kind==='allowance')save('life-service:'+current.id,current.name,route());else save('teen-search:'+current.id+'.'+kind,current.name+' · 검색 조건',route(),{kind:kind,filters:filters});}});
  window.LivonTeen={render:render,mount:mount,ask:ask,summary:summary,applyMoney:applyMoney,addCalendar:addCalendar};
})();
