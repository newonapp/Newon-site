/* Shared, source-verified opportunities. Adapters populate this registry; no demo listings. */
(function () {
  var records = [];
  var schema = ['id','type','title','category','description','organizer','targetAge','targetGrade','region','location','startDate','endDate','applicationStart','applicationEnd','price','status','online','source','sourceUrl','lastVerifiedAt'];
  function safeUrl(value) { try { return new URL(value).protocol === 'https:'; } catch (_) { return false; } }
  function validDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value; }
  function verified(x) { return x && /^[a-zA-Z0-9_-]+$/.test(x.id) && x.title && x.source && safeUrl(x.sourceUrl) && validDate(x.lastVerifiedAt) && Array.isArray(x.targetAge) && x.targetAge.length === 2 && x.targetAge.every(Number.isFinite); }
  function query(filters) {
    var f = filters || {};
    return records.filter(function (x) {
      if (!verified(x) || x.targetAge[0] > 19 || x.targetAge[1] < 10) return false;
      if (f.type && x.type !== f.type) return false;
      if (f.query && ![x.title,x.description,x.organizer].join(' ').toLowerCase().includes(f.query.toLowerCase())) return false;
      for (var key of ['category','programType','region','district','participation','audience','status','facility','overnight']) {
        if (f[key] && f[key] !== '전체' && x[key] !== f[key]) return false;
      }
      var mode = typeof x.online === 'boolean' ? (x.online ? '온라인' : '오프라인') : x.mode;
      if (f.mode && f.mode !== '전체' && mode !== f.mode) return false;
      if (f.age && !(Number(f.age) >= x.targetAge[0] && Number(f.age) <= x.targetAge[1])) return false;
      if (f.grade && f.grade !== '전체' && !(x.targetGrade || []).includes(f.grade)) return false;
      if (f.cost === '무료' && x.price !== 0 || f.cost === '유료' && !(x.price > 0)) return false;
      if (f.date && !(validDate(x.startDate) && x.startDate <= f.date && (x.endDate || x.startDate) >= f.date)) return false;
      if (f.deadline && !(validDate(x.applicationEnd) && x.applicationEnd <= f.deadline)) return false;
      if (f.hours && !(Number.isFinite(x.hours) && x.hours <= Number(f.hours))) return false;
      return true;
    });
  }
  window.LivonOpportunities = {schema:schema, query:query, safeUrl:safeUrl, validDate:validDate,
    replace:function (rows) { records = Array.from(new Map(rows.filter(verified).map(function(x){return [x.id,JSON.parse(JSON.stringify(x))];})).values()); },
    get:function(id){ return query({}).find(function(x){return x.id===id;}); }};
})();
