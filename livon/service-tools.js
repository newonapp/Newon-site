/* Shared service tools: the existing bookmark and My Life stores remain authoritative. */
(function(){
 var U=window.LivonServices.ui, KEY='livon.mlStore.v1';
 function read(){var s=U.read(KEY,{});['events','goals','habits','checklists','transactions'].forEach(function(k){s[k]=s[k]||[];});s.budgets=s.budgets||{};s.habitLogs=s.habitLogs||{};return s;}
 function upsert(rows,x){var i=rows.findIndex(function(v){return v.id===x.id;});if(i<0)rows.unshift(x);else rows[i]=Object.assign({},rows[i],x);return x;}
 function amount(x){var n=Number(x||0);if(!Number.isFinite(n)||n<0||n>1e11)throw Error('금액은 0~100,000,000,000원 범위로 입력해 주세요.');return n;}
 function day(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
 function date(x){return /^\d{4}-\d{2}-\d{2}$/.test(x||'')&&!isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;}
 function budget(v,groups){var sums=groups.map(function(g,i){return g[1].reduce(function(sum,_,j){return sum+amount(v['b'+i+'_'+j]);},0);});return {income:sums[0],fixed:sums[1],variable:sums[2],saving:sums[3],balance:sums[0]-sums[1]-sums[2]-sums[3],rate:sums[0]?sums[3]/sums[0]*100:null};}
 function load(s){var saved=window.LivonPlatform.listSaves('all').find(function(x){return x.id==='life-service:'+s.id;});return U.read('livon.serviceDraft.'+s.id,null,sessionStorage)||(saved&&saved.data)||{};}
 function draft(s,v){return U.write('livon.serviceDraft.'+s.id,v,sessionStorage);}
 function save(s,v){window.LivonPlatform.saveItem({id:'life-service:'+s.id,title:s.name,label:s.name,type:s.type,source:'라이프 스테이지',lifeStage:s.lifeStage,href:'#life-service-'+s.id,data:v});draft(s,v);U.notice('내 생활 저장함에 저장했습니다. 이 브라우저에서 다시 열어 수정할 수 있습니다.');}
 function status(state,text){var copy={loading:['정보를 확인하고 있어요.','잠시 기다려 주세요.'],empty:['조건에 맞는 정보가 없어요.','조건을 넓혀 다시 확인해 보세요.'],error:['정보를 불러오지 못했어요.','잠시 후 다시 확인해 주세요.'],notConnected:['공식 데이터를 연결할 준비를 하고 있어요.','실제 목록·가격·예약 가능 여부는 아직 조회할 수 없습니다.'],ready:['확인된 정보','출처와 마지막 확인일을 함께 살펴보세요.']}[state]||['정보 확인',''];return '<div class="lv-youth-empty" role="status" data-source-state="'+U.esc(state)+'"><p class="lv-life-kicker">'+U.esc(text||'공식 정보')+'</p><h4>'+copy[0]+'</h4><p>'+copy[1]+'</p></div>';}
 function calendar(v,id){if(!v.title||!v.title.trim()||!date(v.date))throw Error('일정 제목과 날짜를 입력해 주세요.');var count=Number(v.count||1);if(!Number.isInteger(count)||count<1||count>12)throw Error('반복 횟수는 1~12회입니다.');if(v.repeat==='없음')count=1;var base=new Date(v.date+'T12:00:00'),rows=[];for(var i=0;i<count;i++){var d=new Date(base);if(v.repeat==='매주')d.setDate(d.getDate()+i*7);if(v.repeat==='매월'){var desired=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+i);d.setDate(Math.min(desired,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));}rows.push({id:id+'-'+i,seriesId:id,title:v.title.trim().slice(0,150),date:day(d),start:v.time||'',end:'',allDay:!v.time,place:v.place||'',category:v.category||'가족',note:v.note||'',familyMembers:(v.members||'').split(',').map(function(x){return x.trim();}).filter(Boolean),reminder:v.reminder||'없음',repeat:v.repeat||'없음',done:false,source:'life-stage-30',createdAt:Date.now(),updatedAt:Date.now()});}return rows;}
 function source(feed,filters){
  if(!feed||feed.state!=='ready')return {state:feed?feed.state:'notConnected',items:[]};
  var items=(feed.items||[]).filter(function(x){try{return /^[a-zA-Z0-9_-]+$/.test(x.id)&&x.title&&new URL(x.sourceUrl).protocol==='https:'&&date(x.lastVerifiedAt);}catch(_){return false;}});
  items=items.filter(function(x){return Object.keys(filters||{}).filter(function(k){return !['updatedAt','calculated'].includes(k);}).every(function(k){var v=filters[k];if(!v||v==='전체'||v==='선택 안 함')return true;if(k==='query')return [x.title,x.description].join(' ').includes(v);if(k==='age'&&Array.isArray(x.targetAge))return Number(v)>=x.targetAge[0]&&Number(v)<=x.targetAge[1];return Array.isArray(x[k])?x[k].includes(v):String(x[k]||'')===String(v);});});
  return {state:items.length?'ready':'empty',items:items};
 }
 window.LivonServiceTools={read:read,write:function(s){return U.write(KEY,s);},upsert:upsert,amount:amount,date:date,day:day,budget:budget,load:load,draft:draft,save:save,status:status,calendar:calendar,source:source};
})();
