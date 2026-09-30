import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

function app() {
  const handlers = {}, nodes = new Map(), saves = new Map(), shares = [];
  const storage = () => { const data = new Map(); return { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v) }; };
  const root = { classList: { add(){},remove(){} }, appendChild(){} };
  const node = key => { if (!nodes.has(key)) nodes.set(key,{innerHTML:'',textContent:'',focus(){},querySelectorAll(){return [];},elements:new Proxy({}, {get: (o,k) => o[k] ||= {value:''}})}); return nodes.get(key); };
  const host = {innerHTML:'',querySelector: key => key === '[data-ls-catalog-results]' && !host.innerHTML.includes('data-ls-catalog-results') ? null : node(key)};
  const context = {window:{},document:{getElementById:id=>id==='life'?root:node(id),createElement:()=>host,querySelectorAll:()=>[],addEventListener:(k,v)=>handlers[k]=v}, localStorage:storage(),sessionStorage:storage(),location:{origin:'https://example.test',pathname:'/livon/',hash:''},navigator:{share:async item=>shares.push(item)}, Date, FormData: class {constructor(form){this.data=form.data || {companion:'상관없음',place:'상관없음',cost:'상관없음',duration:'상관없음',interest:'전체'};}get(k){return this.data[k];}getAll(k){return this.data[k]||[];}}};
  context.window.scrollTo=()=>{};
  context.window.LivonPlatform={listSaves:()=>[...saves.values()],saveItem:x=>saves.set(x.id,x),removeSave:id=>saves.delete(id)};
  context.window.LivonTodayData={contents:[]};
  vm.createContext(context);
  for(const file of ['life-data.js','service-details-data.js','service-details.js']) vm.runInContext(readFileSync(new URL('../../livon/'+file,import.meta.url),'utf8'),context);
  function click(attr,value='') {const dataset = {[attr.replace('data-','').replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]:value}; const b={dataset,hasAttribute:k=>k===attr,setAttribute(){},textContent:''};handlers.click({target:{closest:()=>b}});}
  function submit(data) {handlers.submit({preventDefault(){},target:{data,matches:s=>s==='[data-ls-planner]'}});}
  return {...context,handlers,host,node,saves,shares,click,submit,services:context.window.LivonServices,loadYouth(){for(const file of ['service-youth-data.js','service-youth.js'])vm.runInContext(readFileSync(new URL('../../livon/'+file,import.meta.url),'utf8'),context);}};
}
test('all 99 services have unique IDs, valid types, action CTAs and routable details',()=>{
 const a=app(),rows=a.services.all(); assert.equal(rows.length,99);assert.equal(new Set(rows.map(x=>x.id)).size,99);
 for(const s of rows){assert.ok(a.window.LivonServiceDetailsData.types[s.type]);assert.ok(s.cta&&!s.cta.includes('관련 서비스 이용하기'));assert.ok(s.destination);assert.equal(a.services.open('life-service-'+s.id),true);assert.ok(a.host.innerHTML.includes(s.name));assert.ok(a.services.card(s).includes('#life-service-'+s.id));}
 assert.equal(a.services.open('life'),false);
});
test('service save toggles in shared store with required metadata',()=>{const a=app();a.click('data-ls-save','study-planner');const x=a.saves.get('life-service:study-planner');for(const key of ['id','type','title','source','lifeStage'])assert.ok(x[key]);a.click('data-ls-save','study-planner');assert.equal(a.saves.size,0);});
test('planner allocates time and preserves existing My Life records on repeated save',()=>{
 const a=app();a.localStorage.setItem('livon.mlStore.v1',JSON.stringify({todos:[{id:'existing'}],checklists:[]}));a.services.open('life-service-study-planner');
 const end=new Date();end.setDate(end.getDate()+14);const due=end.toISOString().slice(0,10);
 a.submit({grade:'고2',purpose:'내신',subjects:'국어, 수학',goal:'복습',due,minutes:'65',days:['0','1','2','3','4','5','6']});
 const plan=JSON.parse(a.sessionStorage.getItem('livon.studyPlanDraft'));assert.equal(plan.items.length,14);assert.match(plan.items[0].text,/33분/);assert.match(plan.items[1].text,/32분/);
 a.click('data-ls-plan-save');a.click('data-ls-plan-save');let store=JSON.parse(a.localStorage.getItem('livon.mlStore.v1'));assert.equal(store.checklists.length,1);assert.equal(store.todos[0].id,'existing');
 a.handlers.change({target:{matches:s=>s==='[data-ls-check]',dataset:{lsCheck:'0'},checked:true}});store=JSON.parse(a.localStorage.getItem('livon.mlStore.v1'));assert.equal(store.checklists[0].items[0].done,true);
});
test('planner rejects missing weekdays and too many subjects without creating a plan',()=>{const a=app();a.services.open('life-service-study-planner');for(const [days,subjects] of [[[],'국어'],[['1'],'a,b,c,d,e,f,g,h,i']])a.submit({grade:'고2',purpose:'내신',subjects,goal:'복습',due:'2099-01-01',minutes:'60',days});assert.equal(a.sessionStorage.getItem('livon.studyPlanDraft'),null);});
test('share keeps the current entry deep link',()=>{const a=app();a.services.open('life-service-major-explorer/majors/software');a.location.hash='#life-service-major-explorer/majors/software';a.click('data-ls-share','major-explorer');assert.equal(a.shares[0].url,'https://example.test/livon/#life-service-major-explorer/majors/software');});
test('AI handoff is an explicit draft with service context',()=>{const a=app();a.click('data-ls-ai','career-explorer');const draft=JSON.parse(a.sessionStorage.getItem('livon.aiPrompt'));assert.equal(draft.draftOnly,true);assert.match(draft.q,/직업·적성 탐색/);assert.equal(a.location.hash,'ai-chat');});
test('comparison retains distinct majors and supports removal',()=>{const a=app();a.services.open('life-service-major-explorer/majors/software');a.click('data-ls-compare','software');a.click('data-ls-compare','software');a.click('data-ls-compare','business');assert.deepEqual(JSON.parse(a.sessionStorage.getItem('livon.majorCompare')),['software','business']);a.click('data-ls-uncompare','software');assert.deepEqual(JSON.parse(a.sessionStorage.getItem('livon.majorCompare')),['business']);});
test('unknown route has a recovery link and user text is escaped',()=>{const a=app();a.services.open('life-service-missing');assert.match(a.host.innerHTML,/서비스를 찾을 수 없습니다/);const s={...a.services.all()[0],name:'<img src=x onerror=alert(1)>'};assert.ok(!a.services.card(s).includes('<img'));});

 test('youth budget correctly handles totals, zero income, deficit and invalid input',()=>{const a=app();a.loadYouth();const calc=a.window.LivonYouth.calculate;const values={n0:'2500000',n3:'600000',n10:'400000',n17:'500000',n18:'10000000'};const b=calc(values);assert.equal(b.income,2500000);assert.equal(b.remaining,1000000);assert.equal(b.rate,20);assert.equal(calc({}).rate,null);assert.equal(calc({n3:'1000'}).remaining,-1000);assert.throws(()=>calc({n0:'-1'}));assert.throws(()=>calc({n0:'not-a-number'}));});
 test('all 15 youth services have dedicated views and corrected action labels',()=>{const a=app();a.loadYouth();const rows=a.services.all().filter(x=>x.lifeStage==='20');assert.equal(rows.length,15);for(const s of rows){assert.match(s.detail,/^youth-/);const html=a.window.LivonYouth.render(s,[s.id]);assert.ok(html.includes('관련 LIVON 기능'));assert.ok(html.includes('data-youth-form'));}assert.equal(rows.find(x=>x.name==='이력서·면접 준비').cta,'취업 준비 시작하기');assert.equal(rows.find(x=>x.name==='이력서·면접 준비').destination,'#ml-todos');assert.equal(rows.find(x=>x.name==='청년 주거 지원').cta,'지원제도 보기');});
 test('unconnected youth feeds contain no fabricated providers or listings',()=>{const a=app();a.loadYouth();for(const rows of Object.values(a.window.LivonYouthData.feeds))assert.equal(rows.length,0);for(const id of ['service-20-02','service-20-06','service-20-10']){const s=a.services.all().find(x=>x.id===id);assert.match(a.window.LivonYouth.render(s,[s.id]),/공식 데이터 연결 예정/);}});
