(function(){
 var regions=window.LivonTeenData.regions;
 function txt(k,t){return [k,t,'text'];}function sel(k,t,v){return [k,t,v.split('|')];}function num(k,t){return [k,t,'number'];}function date(k,t){return [k,t,'date'];}
 var region=sel('region','희망 지역',regions.join('|'));
 var stages='임신 준비|임신|출산 준비|신생아|영아|유아|어린이';
 window.LivonFamilyData={
  budgetGroups:[['월 가구 수입',['본인 수입','배우자 수입','부수입','기타']],['고정비',['주거비','관리비','통신','보험','교육','보육','자동차','구독','대출','기타']],['생활비',['식비','교통','쇼핑','문화','육아','의료','취미','기타']],['매달 목표 저축',['비상금','주택','출산/육아','교육','자동차','여행','노후','기타']]],
  schemas:{facilities:['id','title','type','address','targetAge','hours','services','contact','sourceUrl','lastVerifiedAt'],education:['id','title','topic','target','organizer','date','place','price','sourceUrl','lastVerifiedAt'],experts:['id','name','field','career','years','topics','method','price','availability','reviews','verified'],products:['id','title','price','size','weight','targetAge','features','installation','portability','care','sourceUrl','lastVerifiedAt']},
  feeds:{childcare:{state:'notConnected',items:[]},health:{state:'notConnected',items:[]},facilities:{state:'notConnected',items:[]},parents:{state:'notConnected',items:[]}},
  sources:{childcare:['아이사랑 공식 정보','https://www.childcare.go.kr/?menuno=1'],health:['국민건강보험 공식 정보','https://www.nhis.or.kr/'],facilities:['어린이집 정보공개포털','https://info.childcare.go.kr/'],parents:['중앙육아종합지원센터','https://central.childcare.go.kr/']},
  fields:{
   housing:[region,txt('workarea','직장 / 주요 생활지역'),num('commute','최대 통근시간 (분)'),sel('subway','지하철 접근성','상관없음|도보 5분|도보 10분|도보 15분'),sel('home','주거 형태','원룸|오피스텔|빌라|아파트|주택|기타'),sel('contract','거래 방식','매매|전세|월세'),num('deposit','최대 매매가 / 보증금 (원)'),num('rent','최대 월세 (원)'),num('maintenance','관리비 상한 (원)'),num('rooms','방 개수'),sel('parking','주차','상관없음|필요|불필요'),sel('elevator','엘리베이터','상관없음|필요'),sel('pets','반려동물','없음|동반'),sel('new','신축 여부','상관없음|신축 선호'),txt('options','필요 옵션'),txt('security','보안 조건'),txt('light','채광 조건'),txt('floor','희망 층수'),sel('family','함께 거주하는 가족','혼자|부부|자녀 있음|부모와 거주')],
   childcare:[sel('stage','아이 단계',stages),sel('category','정보 분야','수면|식사|이유식|발달|놀이|생활|예방접종 정보|어린이집|부모 생활|안전|외출|육아용품')],
   health:[sel('age','연령대','선택 안 함|20대|30대|40대|50대|60대 이상'),sel('sex','성별 · 선택 사항','선택 안 함|여성|남성'),sel('insured','가입 구분 · 선택 사항','선택 안 함|직장가입|지역가입|피부양자|기타'),sel('category','검진 종류','국가건강검진|일반검진|암검진|구강검진|직장검진|기타 공식 검진'),region,sel('institution','기관 유형','전체|병원|의원|검진센터')],
   career:[sel('change','준비하는 변화','같은 직무 이직|다른 직무로 전환|새로운 기술 학습|자격증 준비|경력 개발|아직 고민 중'),txt('job','현재 직무'),num('years','경력 (년)'),txt('target','관심 직무'),txt('industry','희망 산업'),date('due','전환 희망 시기'),sel('education','재교육 분야','직무교육|온라인 강의|자격증|정부지원교육|부트캠프|대학/평생교육')],
   mentor:[sel('topic','필요한 도움','이직|직무 전환|승진|리더십|실무 역량|포트폴리오|면접|연봉/커리어 정보|경력 방향'),sel('field','분야','개발|AI/Data|디자인|기획|마케팅|영업|경영|금융|HR|교육|기타'),region],
   moving:[date('date','이사 예정일'),sel('space','인테리어 공간','거실|침실|주방|욕실|아이방|작업실|전체'),num('budget','인테리어 예산 (원)'),txt('style','관심 스타일'),sel('service','필요 서비스','도배|바닥|조명|가구|수납|리모델링|부분수리')],
   wedding:[date('date','결혼 예정일'),num('guests','예상 하객 수'),num('budget','전체 예산 (원)'),date('start','준비 시작일')],
   facilities:[sel('category','시설 유형','어린이집|유치원|기타 공식 보육시설'),region,num('age','아이 연령'),sel('ownership','운영 유형','전체|국공립|민간|가정|직장|기타'),txt('hours','희망 운영시간'),txt('transport','통학 조건')],
   parents:[sel('stage','아이 단계','임신/출산 준비|신생아|영아|유아|초등|청소년'),sel('category','교육 주제','부모 역할|발달 이해|놀이|식습관|수면|의사소통|훈육|디지털 생활|학교생활|부모 자기관리'),sel('mode','교육 형태','전체|온라인|오프라인|강의|워크숍|프로그램'),region],
   products:[sel('stage','아이 단계','출산 준비|신생아|영아|유아'),sel('category','제품 분류','유모차|카시트|아기침대|수유|이유식|기저귀|목욕|외출|안전|장난감|의류|기타')],
   wellness:[sel('goal','생활 목표','규칙적인 운동|체력 관리|식사 기록|생활 습관|수면/활동 균형|기타'),txt('exercise','운동 종류'),txt('days','운동 요일'),txt('time','운동 시간'),num('count','주간 목표 횟수')],
   home:[sel('category','서비스 유형','일반 청소|입주 청소|정리/수납|세탁|에어컨 청소|가전 설치|가전 수리|수도|전기|도어/잠금|가구 조립|기타 수리'),region,date('date','희망 날짜'),txt('space','공간'),num('budget','예산 (원)'),txt('request','요청사항')],
   experience:[sel('category','활동 종류','전체|당일 나들이|국내여행|해외여행|체험|전시|공연|자연|캠핑|키즈|교육 체험|축제'),sel('family','가족 구성','부부|영아 동반|유아 동반|초등학생 동반|청소년 동반|부모님 동반'),region,date('date','희망 날짜'),num('budget','예산 (원)'),num('travel','최대 이동시간 (분)'),sel('place','장소','전체|실내|야외'),sel('overnight','숙박','전체|숙박|당일')]
  },
  checks:{career:{'로드맵':['현재 역량 정리','필요한 역량 확인','학습 계획 만들기','포트폴리오 준비','채용 탐색','면접 준비']},moving:{'이사':['계약 확인','이사 날짜','이사업체','포장','폐기물','주소 이전','인터넷','전기','수도','가스','청소','가구','가전'],'입주':['입주청소','하자 확인','보안','생활용품','가구 배치','인터넷','관리비 확인'],'인테리어':['공간 실측','예산 범위','견적 비교','계약 범위 확인','마감 점검']},wedding:{'예식':['예식장','날짜','식사','계약'],'촬영/의상':['스튜디오','드레스','메이크업'],'예물/예단':['준비 범위 정하기'],'신혼여행':['여행 준비'],'신혼집':['주거 준비'],'가구·가전':['제품 비교'],'청첩장':['초대 명단'],'혼인 관련 행정':['공식 행정 절차 확인']},childcare:{'확인할 것':['공식 정보에서 선택한 단계 확인','가족과 필요한 도움 정리','전문가에게 확인할 질문 적기']}},
  related:{housing:[6,14,7],childcare:[10,11,12,9],health:[9,13],career:[5],mentor:[4],moving:[1,14,12],finance:[1,8,9],wedding:[7,1,9],calendar:[8,15],facilities:[2,11,9],parents:[2,10],products:[2,7],wellness:[3,9],home:[6,1],experience:[9,7]},
  kinds:['housing','childcare','health','career','mentor','moving','finance','wedding','calendar','facilities','parents','products','wellness','home','experience']
 };
})();
