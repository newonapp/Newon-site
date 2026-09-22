/** Livon detail i18n overlays merged onto EN. */

function pack(hero, why, journey, platform, how, expand, close, ui = {}) {
  return { ui, hero, why, journey, platform, how, expand, close };
}

function decades(rows) {
  return rows.map((r) => ({
    id: r[0],
    n: r[1],
    age: r[2],
    name: r[3],
    lead: r[4],
    topics: r[5],
  }));
}

const ja = pack(
  {
    kicker: "NEWON Livon",
    brand: "Livon",
    titleHtml: "人生のすべての段階に、<br>必要な次を。",
    lead: "10代から70代まで。人生の変化と新しい始まりに寄り添うライフサイクル・プラットフォーム。",
    ctaMain: "Livonを見る",
    ctaSub: "事業に関するお問い合わせ",
    status: "現在は事業紹介です。",
    pathLabel: "10代から70代まで",
  },
  {
    kicker: "Why Livon",
    title: "人生が変わるたびに、\n必要な情報も変わります。",
    body: [
      "進学や進路を考えるときから、自立と初めての仕事、住まいと家族、仕事のあとの新しい日常まで。",
      "人生の段階が変わると、向き合う選択と必要な情報も変わります。",
      "Livonは、その変化のなかで、今の自分に合う情報とサービスをより見つけやすくすることを目指します。",
    ],
  },
  {
    kicker: "Life Journey",
    title: "10代から70代まで、\n続いていく人生の旅。",
    lead: "段階ごとに変わる問いと選択。Livonは、今の自分に必要な情報とサービスをつなぎます。",
    items: decades([
      ["10", "01", "10代", "可能性を見つける時期", "進路や進学、新しい経験を通して自分の方向を探る時期。", ["進路の探索", "入試・進学", "学びと成長", "資格", "お金の基礎", "趣味・サークル", "自立・社会進出の準備"]],
      ["20", "02", "20代", "自分の人生を始める時期", "自立と初めての仕事、新しい暮らしを始め、自分の基盤をつくる時期。", ["大学", "就職と初めての仕事", "一人暮らし・住まい", "お金と資産", "自己開発", "交際・結婚の準備", "暮らしサービス"]],
      ["30", "03", "30代", "人生の基盤を広げる時期", "仕事と暮らしのバランス、住まい・関係・家族など、さまざまな選択に向き合う時期。", ["キャリア成長", "結婚・新婚", "住まいづくり", "妊娠・出産・育児", "家計", "保険・財務", "家族の暮らし", "健康と暮らし"]],
      ["40", "04", "40代", "人生のバランスをつくる時期", "仕事と家族、個人の目標をともに見つめ、これからの人生を準備する時期。", ["子どもの教育", "キャリア管理・転換", "住まいと資産", "健康診断", "親の扶養", "家族の余暇", "老後の準備"]],
      ["50", "05", "50代", "新しい可能性を準備する時期", "これまでの経験を土台に、これからの暮らしと新しい機会を準備する時期。", ["引退設計", "再就職・第二の仕事", "年金と資産", "健康", "趣味・旅行", "子どもの自立", "親のケア", "新しい学びと活動"]],
      ["60", "06", "60代", "新しい日常を始める時期", "仕事のあとの暮らしを設計し、新しい活動と関係をつくっていく時期。", ["仕事のあとの暮らし", "再就職・社会活動", "健康・運動", "年金・福祉", "旅行・趣味", "地域の集まり", "デジタル生活支援"]],
      ["70", "07", "70代", "自分らしい日常を続ける時期", "自分の暮らし方と関心に合わせて、健康で活き活きした日常を続ける時期。", ["健康と安全", "暮らしの便利", "余暇と社会活動", "家族とのつながり", "住まい支援", "ケア・福祉サービスの接続", "地域の暮らし情報"]],
    ]),
  },
  {
    kicker: "Platform",
    title: "人生の段階に合わせて、\n必要なものをつなぎます。",
    lead: "年代別の暮らし知識を集めたサイトではなく、情報の探索からサービスの接続まで広げていく総合生活プラットフォームです。",
    items: [
      { id: "info", n: "01", name: "ライフステージ別の情報探索", lead: "今の年代と暮らしの状況に合う情報とテーマを探せる体験を目指します。" },
      { id: "guide", n: "02", name: "一人ひとりに合わせた案内", lead: "関心事と暮らしの状況に合う情報をより見つけやすくするため、案内機能を段階的に導入する計画です。", planned: true },
      { id: "services", n: "03", name: "暮らしサービスの接続", lead: "住まい、お金、学び、健康、余暇など、暮らしに関わる外部サービスと情報を探してつなぐ方向へ広げます。", planned: true },
      { id: "experts", n: "04", name: "専門家と地域サービスの探索", lead: "必要なときに関連の専門家と地域のサービスを見つけられる機能を、段階的に広げる計画です。", planned: true },
    ],
  },
  {
    kicker: "How it works",
    title: "今の自分に必要な、\n次の段階を見つけてください。",
    note: "今後の利用の流れの構想です。いま申し込める予約手続きではありません。",
    steps: [
      { n: "01", name: "今の暮らしの段階を選ぶ", body: "自分の年代と、いま関心のある暮らしのテーマを選びます。" },
      { n: "02", name: "必要な情報を探す", body: "選んだ段階と関心に合う情報・関連サービスを確認します。" },
      { n: "03", name: "次の段階へつなぐ", body: "関連サービス、活動、専門家などを探し、次の選択を準備することを目指します。" },
    ],
  },
  {
    kicker: "Business expansion",
    title: "人生のすべての段階へ、\nつながりの範囲を広げていきます。",
    note: "未確定の提携、売上、利用者数、提供地域は表示しません。",
    stages: [
      { n: "01", name: "ライフステージ別の情報基盤", body: "10代から70代まで、各段階に必要な暮らし情報と主なサービスを探せる基盤をつくります。" },
      { n: "02", name: "一人ひとりに合わせた案内の深化", body: "年代だけでなく、関心事と暮らしの状況を反映し、必要な情報をより見つけやすくします。" },
      { n: "03", name: "暮らしサービスと専門家の接続拡大", body: "住まい、お金、学び、健康、余暇などのサービス、専門家、地域サービスとの接続を段階的に広げる予定です。" },
      { n: "04", name: "生涯をつなぐ総合プラットフォームへ", body: "人生の段階が変わっても使い続けられる総合生活プラットフォームへ発展させることを目指します。" },
    ],
  },
  {
    kicker: "Livon VISION",
    titleHtml: "人生が変わっても、<br>つながりは続きます。",
    lead: "Livonは、一人ひとりのペースと選択を尊重し、新しい始まりと変化のたびに必要な情報とサービスをつなぐプラットフォームとして成長していきます。",
    ctaMain: "事業・協業に関するお問い合わせ",
    ctaSub: "Newonのほかの事業を見る",
  },
  {
    back: "ホームの Livon 紹介へ",
    planned: "今後の利用の流れ",
    expandNote: "現在の運営状況ではなく、今後の事業拡張計画です。",
    conceptNote: "現在は事業紹介です。予約・決済・登録はまだつながっていません。",
    plannedFlag: "導入予定",
    journeyNote: "年代別のテーマは一般的な例です。人生のペースと必要な情報は人それぞれ異なります。",
    ongilNote: "ケアや生活支援が必要な場合、今後 Ongil とつなぐ方向を検討します。いまの二つのサービスは連動していません。",
    areasNote: "次の六つの領域は今後の事業拡張計画です。いま提供中の機能のように見せません。",
    relatedNote: "いま他の Newon 事業と技術的に連動したり、データが自動共有されたりはしません。以下は今後の接続の方向です。",
  }
);

ja.areas = {
  kicker: "Business areas",
  title: "情報からつながりまで、\n六つの拡張領域。",
  lead: "暮らしの情報からイベント管理、専門家、コマース、コミュニティ、AIまで広げていく方向です。",
  items: [
    { n: "01", name: "暮らし情報とガイド", lead: "ライフステージごとの暮らし情報、主な手続き、制度・支援情報を案内します。", planned: true, topics: ["段階別の暮らし情報", "主な生活手続き", "あわせたガイド", "制度・支援情報"] },
    { n: "02", name: "ライフイベント管理", lead: "進学、就職、引越し、結婚、出産、育児、引退など、主な人生イベントの準備を管理します。", planned: true, topics: ["進学", "就職", "引越し", "結婚", "出産・育児", "引退"] },
    { n: "03", name: "専門家と暮らしサービスの接続", lead: "教育、住まい、財務、家族、健康、暮らしの専門家と関連サービスをつなぎます。", planned: true, topics: ["教育", "住まい", "財務", "家族", "健康", "暮らしサービス"] },
    { n: "04", name: "ライフコマース", lead: "段階に必要な商品とサービスを探し、比べ、購入・予約につなぎます。", planned: true, topics: ["商品探索", "サービス比較", "おすすめ", "購入・予約の接続"] },
    { n: "05", name: "コミュニティ", lead: "近いライフステージや関心を持つ人が経験と地域の集まりを共有できる場です。", planned: true, topics: ["情報共有", "経験の交流", "地域の集まり", "関心コミュニティ"] },
    { n: "06", name: "一人ひとりに合わせたAI", lead: "個人のライフステージと暮らしの状況に合う情報探索、生活計画、サービス案内を助けます。", planned: true, topics: ["状況別の情報探索", "生活計画", "サービス案内"] },
  ],
};

ja.related = {
  kicker: "NEWON",
  title: "Newonのなかで\nLivonが担う場所。",
  lead: "Livonは Newon 六つの事業のうち、ライフサイクル・プラットフォームです。他事業の機能を直接代わりません。",
  items: [
    { n: "01", name: "Newon Consumer", body: "ライフステージごとに必要な暮らしアプリとサービスの接続。", planned: true },
    { n: "02", name: "Newon AI", body: "個人の状況に合う AI ベースの暮らし支援。", planned: true },
    { n: "03", name: "Ongil", body: "シニアの暮らし・ケアサービスと家族の接続。", planned: true },
    { n: "04", name: "Newon Business", body: "専門家、企業、暮らしサービス提供者との事業的な接続。", planned: true },
    { n: "05", name: "Newon Commerce", body: "ライフステージごとの商品と暮らしサービスの探索・購入接続。", planned: true },
  ],
};

const es = pack(
  {
    kicker: "NEWON Livon",
    brand: "Livon",
    titleHtml: "En cada etapa de la vida,<br>lo siguiente que hace falta.",
    lead: "De la adolescencia a los 70. Una plataforma de ciclo de vida para el cambio y los nuevos comienzos.",
    ctaMain: "Conocer Livon",
    ctaSub: "Consulta de negocio",
    status: "Esta página es una introducción al negocio.",
    pathLabel: "De la adolescencia a los 70",
  },
  {
    kicker: "Why Livon",
    title: "Cuando la vida cambia,\ntambién cambia la información que necesitas.",
    body: [
      "Desde la escuela y el camino profesional hasta vivir por cuenta propia, el primer trabajo, el hogar, la familia y un día a día nuevo después del trabajo.",
      "Cada etapa trae otras decisiones y otra información.",
      "Livon busca facilitar encontrar información y servicios que encajen con el momento que vives.",
    ],
  },
  {
    kicker: "Life Journey",
    title: "De la adolescencia a los 70,\nun viaje que sigue.",
    lead: "Las preguntas y las elecciones cambian con cada etapa. Livon conecta lo que encaja con el presente.",
    items: decades([
      ["10", "01", "Adolescencia", "Un tiempo para hallar posibilidad", "Explorar dirección a través del camino, la escuela y la experiencia.", ["Explorar el camino", "Exámenes y estudios", "Aprendizaje y crecimiento", "Cualificaciones", "Bases de dinero", "Aficiones y clubes", "Prepararse para valerse"]],
      ["20", "02", "20 años", "Un tiempo para empezar una vida propia", "Independencia, un primer trabajo y el inicio de un día a día que uno construye.", ["Universidad", "Primer trabajo y vida adulta", "Vivir solo y vivienda", "Dinero y patrimonio", "Desarrollo personal", "Relación y boda", "Servicios de vida"]],
      ["30", "03", "30 años", "Un tiempo para ampliar la base", "Equilibrio entre trabajo y vida, y decisiones sobre hogar, vínculos y familia.", ["Crecimiento profesional", "Matrimonio y recién casados", "Conseguir vivienda", "Embarazo, parto y crianza", "Economía del hogar", "Seguros y finanzas", "Vida familiar", "Salud y vida diaria"]],
      ["40", "04", "40 años", "Un tiempo para el equilibrio", "Trabajo, familia y metas personales, mirando adelante.", ["Educación de los hijos", "Carrera y cambio", "Vivienda y patrimonio", "Chequeo de salud", "Cuidado de los padres", "Ocio familiar", "Preparar la vejez"]],
      ["50", "05", "50 años", "Un tiempo para preparar nueva posibilidad", "Usar lo aprendido para preparar el siguiente capítulo y nuevas oportunidades.", ["Plan de retiro", "Reempleo y segundo oficio", "Pensión y patrimonio", "Salud", "Aficiones y viajes", "Independencia de los hijos", "Cuidado de los padres", "Nuevo aprendizaje y actividad"]],
      ["60", "06", "60 años", "Un tiempo para un día a día nuevo", "Diseñar la vida después del trabajo, y nuevas actividades y relaciones.", ["Vida después del trabajo", "Reempleo y actividad social", "Salud y ejercicio", "Pensión y bienestar", "Viajes y aficiones", "Encuentros locales", "Apoyo digital"]],
      ["70", "07", "70 años", "Un tiempo para seguir a tu manera", "Continuar un día sano y vivo, acorde a cómo quieres vivir.", ["Salud y seguridad", "Conveniencia cotidiana", "Ocio y comunidad", "Vínculo familiar", "Apoyo de vivienda", "Cuidado y bienestar", "Información local"]],
    ]),
  },
  {
    kicker: "Platform",
    title: "Ajustado a la etapa en que estás,\nconectando lo que hace falta.",
    lead: "No es un sitio que solo reúne consejos por edad, sino una plataforma de vida que crece desde hallar información hasta conectar servicios.",
    items: [
      { id: "info", n: "01", name: "Explorar por etapa de vida", lead: "El objetivo es una experiencia para explorar información y temas de vida que encajen con la edad y la situación." },
      { id: "guide", n: "02", name: "Orientación personal", lead: "Planeamos introducir, paso a paso, una orientación más a medida, para que la información que encaja sea más fácil de hallar.", planned: true },
      { id: "services", n: "03", name: "Conexión de servicios de vida", lead: "Ampliaremos hacia explorar y conectar servicios e información externos de vivienda, dinero, aprendizaje, salud y ocio.", planned: true },
      { id: "experts", n: "04", name: "Expertos y servicios locales", lead: "Planeamos ampliar, paso a paso, la posibilidad de hallar expertos y servicios locales cuando se necesiten.", planned: true },
    ],
  },
  {
    kicker: "How it works",
    title: "Encuentra el siguiente paso\nque encaja contigo ahora.",
    note: "Es un recorrido previsto, no un flujo vivo de solicitud y reserva.",
    steps: [
      { n: "01", name: "Elige tu etapa de vida", body: "Elige tu rango de edad y los temas de vida que te importan ahora." },
      { n: "02", name: "Explora lo que necesitas", body: "Revisa información y servicios relacionados que encajen con la etapa y los intereses que elegiste." },
      { n: "03", name: "Conecta el siguiente paso", body: "El objetivo es explorar servicios, actividades y expertos, y preparar la siguiente elección." },
    ],
  },
  {
    kicker: "Business expansion",
    title: "Hacia cada etapa de la vida,\nuna conexión más amplia.",
    note: "No se muestran alianzas, ingresos, usuarios ni zonas de servicio no confirmados.",
    stages: [
      { n: "01", name: "Una plataforma de información por etapa", body: "Construir una base para que, de la adolescencia a los 70, se pueda explorar información y servicios clave de cada etapa." },
      { n: "02", name: "Orientación más personal", body: "Hacer crecer una orientación que refleje intereses y situación de vida, no solo la edad." },
      { n: "03", name: "Más servicios de vida y expertos", body: "Planeamos ampliar conexiones con servicios, expertos y ofertas locales de vivienda, dinero, aprendizaje, salud y ocio." },
      { n: "04", name: "Una plataforma de ciclo de vida completa", body: "El objetivo es una plataforma de vida que se pueda seguir usando cuando cambia la etapa." },
    ],
  },
  {
    kicker: "Livon VISION",
    titleHtml: "Aunque la vida cambie,<br>la conexión sigue.",
    lead: "Livon respeta el ritmo y las elecciones de cada persona, y crece como plataforma que conecta la información y los servicios necesarios en cada comienzo y cada cambio.",
    ctaMain: "Consulta de negocio y colaboración",
    ctaSub: "Ver otros negocios de Newon",
  },
  {
    back: "Volver a Livon en la portada",
    planned: "Recorrido previsto",
    expandNote: "Un plan de expansión futuro, no un estado actual de operación.",
    conceptNote: "Esta página es una introducción al negocio. Reserva, pago y registro aún no están conectados.",
    plannedFlag: "Previsto",
    journeyNote: "Los temas de cada década son ejemplos típicos. El ritmo y las necesidades cambian de persona a persona.",
    ongilNote: "Si hace falta cuidado o apoyo a la vida cotidiana, más adelante podríamos conectar con Ongil. Hoy los dos servicios no están vinculados.",
    areasNote: "Las seis áreas siguientes son un plan de expansión posterior, no productos en operación.",
    relatedNote: "Hoy Livon no está vinculado técnicamente a otros negocios de Newon, y los datos no se comparten de forma automática. Lo que sigue es una dirección futura.",
  }
);

const ptBr = pack(
  {
    kicker: "NEWON Livon",
    brand: "Livon",
    titleHtml: "Em cada etapa da vida,<br>o próximo que você precisa.",
    lead: "Da adolescência aos 70. Uma plataforma de ciclo de vida para mudança e novos começos.",
    ctaMain: "Conhecer Livon",
    ctaSub: "Consulta de negócio",
    status: "Esta página é uma introdução ao negócio.",
    pathLabel: "Da adolescência aos 70",
  },
  {
    kicker: "Why Livon",
    title: "Quando a vida muda,\na informação de que você precisa também muda.",
    body: [
      "Da escola e do caminho profissional à vida por conta própria, o primeiro emprego, o lar, a família e um cotidiano novo depois do trabalho.",
      "Cada etapa traz outras escolhas e outra informação.",
      "A Livon busca facilitar encontrar informação e serviços que combinem com o momento em que você está.",
    ],
  },
  {
    kicker: "Life Journey",
    title: "Da adolescência aos 70,\numa jornada que segue.",
    lead: "Perguntas e escolhas mudam a cada etapa. A Livon conecta o que combina com o presente.",
    items: decades([
      ["10", "01", "Adolescência", "Um tempo para achar possibilidade", "Explorar direção por caminho, escola e experiência.", ["Explorar o caminho", "Exames e estudos", "Aprendizado e crescimento", "Qualificações", "Bases de dinheiro", "Hobbies e clubes", "Preparar-se para se virar"]],
      ["20", "02", "20 anos", "Um tempo para começar uma vida sua", "Independência, um primeiro emprego e o início de um cotidiano que você constrói.", ["Universidade", "Primeiro trabalho e vida adulta", "Morar sozinho e moradia", "Dinheiro e patrimônio", "Desenvolvimento pessoal", "Relacionamento e casamento", "Serviços de vida"]],
      ["30", "03", "30 anos", "Um tempo para alargar a base", "Equilíbrio entre trabalho e vida, e escolhas de lar, vínculos e família.", ["Crescimento de carreira", "Casamento e recém-casados", "Conseguir moradia", "Gravidez, parto e criação", "Economia da casa", "Seguros e finanças", "Vida em família", "Saúde e cotidiano"]],
      ["40", "04", "40 anos", "Um tempo para o equilíbrio", "Trabalho, família e metas pessoais, olhando adiante.", ["Educação dos filhos", "Carreira e transição", "Moradia e patrimônio", "Check-up de saúde", "Cuidado dos pais", "Lazer em família", "Preparar a aposentadoria"]],
      ["50", "05", "50 anos", "Um tempo para preparar nova possibilidade", "Usar o que se aprendeu para preparar o próximo capítulo e novas chances.", ["Plano de aposentadoria", "Reemprego e segundo ofício", "Pensão e patrimônio", "Saúde", "Hobbies e viagens", "Independência dos filhos", "Cuidado dos pais", "Novo aprendizado e atividade"]],
      ["60", "06", "60 anos", "Um tempo para um cotidiano novo", "Desenhar a vida depois do trabalho, e novas atividades e relações.", ["Vida depois do trabalho", "Reemprego e atividade social", "Saúde e exercício", "Pensão e bem-estar", "Viagens e hobbies", "Encontros locais", "Apoio digital"]],
      ["70", "07", "70 anos", "Um tempo para seguir do seu jeito", "Continuar um dia saudável e vivo, de acordo com como você quer viver.", ["Saúde e segurança", "Conveniência do dia a dia", "Lazer e comunidade", "Vínculo familiar", "Apoio de moradia", "Cuidado e bem-estar", "Informação local"]],
    ]),
  },
  {
    kicker: "Platform",
    title: "Ajustado à etapa em que você está,\nconectando o que faz falta.",
    lead: "Não é um site que só reúne dicas por idade, e sim uma plataforma de vida que cresce de achar informação a conectar serviços.",
    items: [
      { id: "info", n: "01", name: "Explorar por etapa de vida", lead: "O objetivo é uma experiência para explorar informação e temas de vida que combinem com idade e situação." },
      { id: "guide", n: "02", name: "Orientação pessoal", lead: "Planejamos introduzir, passo a passo, uma orientação mais sob medida, para a informação que combina ser mais fácil de achar.", planned: true },
      { id: "services", n: "03", name: "Conexão de serviços de vida", lead: "Vamos ampliar a exploração e conexão de serviços e informação externos de moradia, dinheiro, aprendizado, saúde e lazer.", planned: true },
      { id: "experts", n: "04", name: "Especialistas e serviços locais", lead: "Planejamos ampliar, passo a passo, a possibilidade de achar especialistas e serviços locais quando forem necessários.", planned: true },
    ],
  },
  {
    kicker: "How it works",
    title: "Encontre o próximo passo\nque combina com você agora.",
    note: "Este é um percurso previsto, não um fluxo vivo de pedido e reserva.",
    steps: [
      { n: "01", name: "Escolha sua etapa de vida", body: "Escolha sua faixa etária e os temas de vida que importam agora." },
      { n: "02", name: "Explore o que você precisa", body: "Veja informação e serviços relacionados que combinem com a etapa e os interesses que você escolheu." },
      { n: "03", name: "Conecte o próximo passo", body: "O objetivo é explorar serviços, atividades e especialistas, e preparar a próxima escolha." },
    ],
  },
  {
    kicker: "Business expansion",
    title: "Para cada etapa da vida,\numa conexão mais ampla.",
    note: "Parcerias, receita, usuários e áreas de serviço não confirmados não são exibidos.",
    stages: [
      { n: "01", name: "Uma plataforma de informação por etapa", body: "Construir uma base para que, da adolescência aos 70, se possa explorar informação e serviços-chave de cada etapa." },
      { n: "02", name: "Orientação mais pessoal", body: "Desenvolver uma orientação que reflita interesses e situação de vida, não só a idade." },
      { n: "03", name: "Mais serviços de vida e especialistas", body: "Planejamos ampliar conexões com serviços, especialistas e ofertas locais de moradia, dinheiro, aprendizado, saúde e lazer." },
      { n: "04", name: "Uma plataforma de ciclo de vida completa", body: "O objetivo é uma plataforma de vida que se possa continuar usando quando a etapa muda." },
    ],
  },
  {
    kicker: "Livon VISION",
    titleHtml: "Mesmo quando a vida muda,<br>a conexão continua.",
    lead: "A Livon respeita o ritmo e as escolhas de cada pessoa, e cresce como plataforma que conecta a informação e os serviços necessários em cada começo e cada mudança.",
    ctaMain: "Consulta de negócio e parceria",
    ctaSub: "Ver outros negócios da Newon",
  },
  {
    back: "Voltar à Livon na página inicial",
    planned: "Percurso previsto",
    expandNote: "Um plano de expansão futuro, não o estado atual da operação.",
    conceptNote: "Esta página é uma introdução ao negócio. Reserva, pagamento e cadastro ainda não estão conectados.",
    plannedFlag: "Previsto",
    journeyNote: "Os temas de cada década são exemplos típicos. O ritmo e as necessidades mudam de pessoa para pessoa.",
    ongilNote: "Quando for preciso cuidado ou apoio à vida cotidiana, no futuro podemos conectar com a Ongil. Hoje os dois serviços não estão ligados.",
    areasNote: "As seis áreas abaixo são um plano de expansão posterior, não produtos em operação.",
    relatedNote: "Hoje a Livon não está ligada tecnicamente a outros negócios da Newon, e os dados não são compartilhados automaticamente. O que segue é uma direção futura.",
  }
);

const fr = pack(
  {
    kicker: "NEWON Livon",
    brand: "Livon",
    titleHtml: "À chaque étape de la vie,<br>la suite dont vous avez besoin.",
    lead: "De l’adolescence à 70 ans. Une plateforme de cycle de vie pour le changement et les nouveaux départs.",
    ctaMain: "Découvrir Livon",
    ctaSub: "Demande professionnelle",
    status: "Cette page est une présentation de l’activité.",
    pathLabel: "De l’adolescence à 70 ans",
  },
  {
    kicker: "Why Livon",
    title: "Quand la vie change,\nl’information dont vous avez besoin change aussi.",
    body: [
      "De l’école et du parcours au premier logement, au premier emploi, au foyer, à la famille, et à un quotidien nouveau après le travail.",
      "Chaque étape apporte d’autres choix, et d’autres informations.",
      "Livon vise à rendre plus facile de trouver les informations et services qui correspondent au moment où vous êtes.",
    ],
  },
  {
    kicker: "Life Journey",
    title: "De l’adolescence à 70 ans,\nun voyage qui continue.",
    lead: "Les questions et les choix changent à chaque étape. Livon relie ce qui correspond au présent.",
    items: decades([
      ["10", "01", "Adolescence", "Un temps pour trouver des possibles", "Explorer une direction par le parcours, l’école et l’expérience.", ["Explorer le parcours", "Examens et études", "Apprendre et grandir", "Qualifications", "Bases d’argent", "Loisirs et clubs", "Se préparer à se débrouiller"]],
      ["20", "02", "20 ans", "Un temps pour commencer une vie à soi", "Indépendance, premier emploi, et le début d’un quotidien que l’on construit.", ["Université", "Premier travail et vie adulte", "Vivre seul et logement", "Argent et patrimoine", "Développement personnel", "Relation et mariage", "Services de vie"]],
      ["30", "03", "30 ans", "Un temps pour élargir la base", "Équilibre travail-vie, et choix autour du foyer, des liens et de la famille.", ["Croissance de carrière", "Mariage et jeunes mariés", "Trouver un logement", "Grossesse, naissance et parentalité", "Budget du foyer", "Assurance et finances", "Vie de famille", "Santé et quotidien"]],
      ["40", "04", "40 ans", "Un temps pour l’équilibre", "Travail, famille et buts personnels, en regardant plus loin.", ["Éducation des enfants", "Carrière et transition", "Logement et patrimoine", "Bilan de santé", "Soutien des parents", "Loisirs en famille", "Préparer la retraite"]],
      ["50", "05", "50 ans", "Un temps pour préparer de nouveaux possibles", "S’appuyer sur l’expérience pour préparer le chapitre suivant et de nouvelles chances.", ["Plan de retraite", "Réemploi et second métier", "Pension et patrimoine", "Santé", "Loisirs et voyages", "Indépendance des enfants", "Soutien des parents", "Nouvel apprentissage et activité"]],
      ["60", "06", "60 ans", "Un temps pour un quotidien nouveau", "Concevoir la vie après le travail, et de nouvelles activités et relations.", ["Vie après le travail", "Réemploi et activité sociale", "Santé et sport", "Pension et aides", "Voyages et loisirs", "Rencontres locales", "Aide numérique"]],
      ["70", "07", "70 ans", "Un temps pour continuer à sa façon", "Poursuivre une journée saine et vivante, selon la manière dont on veut vivre.", ["Santé et sécurité", "Confort du quotidien", "Loisirs et communauté", "Lien familial", "Soutien au logement", "Soins et aides", "Infos locales"]],
    ]),
  },
  {
    kicker: "Platform",
    title: "À l’étape où vous êtes,\nrelier ce qu’il faut.",
    lead: "Ce n’est pas un site qui ne fait que rassembler des conseils par âge, mais une plateforme de vie qui grandit, de la recherche d’information à la connexion de services.",
    items: [
      { id: "info", n: "01", name: "Explorer par étape de vie", lead: "L’objectif est une expérience pour explorer informations et thèmes de vie adaptés à l’âge et à la situation." },
      { id: "guide", n: "02", name: "Orientation personnelle", lead: "Nous prévoyons d’introduire progressivement une orientation plus adaptée, pour que l’information qui convient soit plus facile à trouver.", planned: true },
      { id: "services", n: "03", name: "Connexion de services de vie", lead: "Nous élargirons vers l’exploration et la connexion de services et d’informations externes : logement, argent, apprentissage, santé, loisirs.", planned: true },
      { id: "experts", n: "04", name: "Experts et services locaux", lead: "Nous prévoyons d’élargir progressivement la possibilité de trouver experts et services locaux quand c’est nécessaire.", planned: true },
    ],
  },
  {
    kicker: "How it works",
    title: "Trouvez la prochaine étape\nqui vous correspond maintenant.",
    note: "Il s’agit d’un parcours prévu, pas d’un flux de demande et de réservation déjà en ligne.",
    steps: [
      { n: "01", name: "Choisir votre étape de vie", body: "Choisissez votre tranche d’âge et les thèmes de vie qui vous concernent maintenant." },
      { n: "02", name: "Explorer ce dont vous avez besoin", body: "Consultez informations et services liés qui correspondent à l’étape et aux intérêts choisis." },
      { n: "03", name: "Relier la suite", body: "L’objectif est d’explorer services, activités et experts, et de préparer le choix suivant." },
    ],
  },
  {
    kicker: "Business expansion",
    title: "Vers chaque étape de la vie,\nune connexion plus large.",
    note: "Partenariats, chiffre d’affaires, utilisateurs et zones de service non confirmés ne sont pas affichés.",
    stages: [
      { n: "01", name: "Une plateforme d’information par étape", body: "Construire une base pour que, de l’adolescence à 70 ans, on puisse explorer informations et services clés de chaque étape." },
      { n: "02", name: "Une orientation plus personnelle", body: "Développer une orientation qui reflète intérêts et situation de vie, pas seulement l’âge." },
      { n: "03", name: "Plus de services de vie et d’experts", body: "Nous prévoyons d’élargir les liens avec services, experts et offres locales : logement, argent, apprentissage, santé, loisirs." },
      { n: "04", name: "Une plateforme de cycle de vie complète", body: "L’objectif est une plateforme de vie que l’on peut continuer d’utiliser quand l’étape change." },
    ],
  },
  {
    kicker: "Livon VISION",
    titleHtml: "Même si la vie change,<br>la connexion continue.",
    lead: "Livon respecte le rythme et les choix de chacun, et grandit comme une plateforme qui relie les informations et services nécessaires à chaque nouveau départ et chaque changement.",
    ctaMain: "Demande professionnelle et partenariat",
    ctaSub: "Voir les autres activités de Newon",
  },
  {
    back: "Retour à Livon sur l’accueil",
    planned: "Parcours prévu",
    expandNote: "Un plan d’expansion futur, pas l’état actuel de l’exploitation.",
    conceptNote: "Cette page est une présentation de l’activité. Réservation, paiement et inscription ne sont pas encore connectés.",
    plannedFlag: "Prévu",
    journeyNote: "Les thèmes de chaque décennie sont des exemples typiques. Le rythme et les besoins varient d’une personne à l’autre.",
    ongilNote: "Si des soins ou un soutien à la vie quotidienne sont nécessaires, nous pourrons plus tard relier Ongil. Les deux services ne sont pas liés aujourd’hui.",
    areasNote: "Les six domaines ci-dessous sont un plan d’expansion ultérieur, pas des produits en service.",
    relatedNote: "Aujourd’hui, Livon n’est pas lié techniquement aux autres activités Newon, et les données ne sont pas partagées automatiquement. Ce qui suit est une direction future.",
  }
);

const de = pack(
  {
    kicker: "NEWON Livon",
    brand: "Livon",
    titleHtml: "In jeder Lebensphase<br>das Nächste, das Sie brauchen.",
    lead: "Vom Jugendalter bis zu den 70ern. Eine Lebensphasen-Plattform für Wandel und neue Anfänge.",
    ctaMain: "Livon entdecken",
    ctaSub: "Geschäftsanfrage",
    status: "Diese Seite ist eine Geschäftsvorstellung.",
    pathLabel: "Vom Jugendalter bis zu den 70ern",
  },
  {
    kicker: "Why Livon",
    title: "Wenn sich das Leben ändert,\nändert sich auch die Information, die Sie brauchen.",
    body: [
      "Von Schule und Weg über das eigene Wohnen, den ersten Job, Zuhause, Familie bis zu einem neuen Alltag nach der Arbeit.",
      "Jede Phase bringt andere Entscheidungen und andere Informationen.",
      "Livon will es leichter machen, Informationen und Dienste zu finden, die zum jetzigen Moment passen.",
    ],
  },
  {
    kicker: "Life Journey",
    title: "Vom Jugendalter bis zu den 70ern,\neine Reise, die weitergeht.",
    lead: "Fragen und Entscheidungen verschieben sich mit jeder Phase. Livon verbindet, was zur Gegenwart passt.",
    items: decades([
      ["10", "01", "Jugend", "Eine Zeit, Möglichkeiten zu finden", "Richtung erkunden durch Weg, Schule und neue Erfahrung.", ["Wege erkunden", "Prüfungen und Schule", "Lernen und Wachstum", "Qualifikationen", "Geld-Grundlagen", "Hobbys und Clubs", "Auf eigenes Stehen vorbereiten"]],
      ["20", "02", "20er", "Eine Zeit, ein eigenes Leben zu beginnen", "Unabhängigkeit, erster Job und der Beginn eines Alltags, den man selbst baut.", ["Universität", "Erste Arbeit und Erwachsenenleben", "Alleinwohnen und Wohnen", "Geld und Vermögen", "Persönliche Entwicklung", "Beziehung und Heirat", "Lebensdienste"]],
      ["30", "03", "30er", "Eine Zeit, die Basis zu erweitern", "Balance von Arbeit und Leben, und Entscheidungen um Wohnen, Beziehungen und Familie.", ["Karrierewachstum", "Heirat und frisch verheiratet", "Wohnung finden", "Schwangerschaft, Geburt, Elternsein", "Haushaltsgeld", "Versicherung und Finanzen", "Familienleben", "Gesundheit und Alltag"]],
      ["40", "04", "40er", "Eine Zeit für Balance", "Arbeit, Familie und eigene Ziele zusammenhalten und vorausblicken.", ["Bildung der Kinder", "Karriere und Wechsel", "Wohnen und Vermögen", "Gesundheitscheck", "Eltern unterstützen", "Familienfreizeit", "Alter vorbereiten"]],
      ["50", "05", "50er", "Eine Zeit, neue Möglichkeiten vorzubereiten", "Erfahrungswissen nutzen, um das nächste Kapitel und neue Chancen vorzubereiten.", ["Ruhestandsplanung", "Wiedereinstieg und zweiter Beruf", "Rente und Vermögen", "Gesundheit", "Hobbys und Reisen", "Selbstständigkeit der Kinder", "Elternpflege", "Neues Lernen und Aktivität"]],
      ["60", "06", "60er", "Eine Zeit für einen neuen Alltag", "Das Leben nach der Arbeit gestalten und neue Aktivitäten und Beziehungen.", ["Leben nach der Arbeit", "Wiedereinstieg und soziales Leben", "Gesundheit und Sport", "Rente und Wohlfahrt", "Reisen und Hobbys", "Lokale Treffen", "Digitale Hilfe"]],
      ["70", "07", "70er", "Eine Zeit, auf eigene Weise weiterzuleben", "Einen gesunden, lebendigen Alltag fortsetzen, der zur gewünschten Lebensweise passt.", ["Gesundheit und Sicherheit", "Alltagskomfort", "Freizeit und Gemeinschaft", "Familienkontakt", "Wohnunterstützung", "Pflege und Wohlfahrt", "Lokale Lebensinfos"]],
    ]),
  },
  {
    kicker: "Platform",
    title: "Passend zur Phase, in der Sie sind,\nwas nötig ist verbinden.",
    lead: "Keine Seite, die nur Tipps nach Alter sammelt, sondern eine Lebensplattform, die vom Finden von Information bis zum Verbinden von Diensten wächst.",
    items: [
      { id: "info", n: "01", name: "Nach Lebensphase stöbern", lead: "Ziel ist eine Erfahrung, Informationen und Lebensthemen zu erkunden, die zu Alter und Situation passen." },
      { id: "guide", n: "02", name: "Persönliche Orientierung", lead: "Wir planen schrittweise eine passendere Orientierung, damit passende Information leichter zu finden ist.", planned: true },
      { id: "services", n: "03", name: "Verbindung von Lebensdiensten", lead: "Wir erweitern Richtung Erkunden und Verbinden externer Dienste und Infos zu Wohnen, Geld, Lernen, Gesundheit und Freizeit.", planned: true },
      { id: "experts", n: "04", name: "Fachleute und lokale Dienste", lead: "Wir planen, schrittweise die Möglichkeit zu erweitern, Fachleute und lokale Dienste zu finden, wenn sie gebraucht werden.", planned: true },
    ],
  },
  {
    kicker: "How it works",
    title: "Finden Sie den nächsten Schritt,\nder jetzt zu Ihnen passt.",
    note: "Ein geplanter Ablauf, kein live Buchungsprozess.",
    steps: [
      { n: "01", name: "Lebensphase wählen", body: "Wählen Sie Ihre Altersgruppe und die Lebensthemen, die Sie jetzt beschäftigen." },
      { n: "02", name: "Benötigtes durchsuchen", body: "Sehen Sie Informationen und verwandte Dienste, die zu Phase und Interessen passen." },
      { n: "03", name: "Den nächsten Schritt verbinden", body: "Ziel ist, Dienste, Aktivitäten und Fachleute zu erkunden und die nächste Wahl vorzubereiten." },
    ],
  },
  {
    kicker: "Business expansion",
    title: "Zu jeder Lebensphase hin\neine weitere Verbindung.",
    note: "Unbestätigte Partnerschaften, Umsatz, Nutzerzahlen und Gebiete werden nicht gezeigt.",
    stages: [
      { n: "01", name: "Informationsplattform nach Lebensphase", body: "Eine Basis aufbauen, damit Menschen vom Jugendalter bis zu den 70ern Infos und zentrale Dienste jeder Phase finden." },
      { n: "02", name: "Persönlichere Orientierung", body: "Eine Orientierung entwickeln, die Interessen und Lebenslage widerspiegelt, nicht nur das Alter." },
      { n: "03", name: "Mehr Lebensdienste und Fachleute", body: "Wir planen, Verbindungen zu Diensten, Fachleuten und lokalen Angeboten in Wohnen, Geld, Lernen, Gesundheit und Freizeit zu erweitern." },
      { n: "04", name: "Eine volle Lebensphasen-Plattform", body: "Ziel ist eine Lebensplattform, die man weiter nutzen kann, wenn sich die Phase ändert." },
    ],
  },
  {
    kicker: "Livon VISION",
    titleHtml: "Auch wenn sich das Leben ändert,<br>bleibt die Verbindung.",
    lead: "Livon achtet Tempo und Wahl jedes Menschen und wächst als Plattform, die bei jedem neuen Anfang und Wandel die nötigen Informationen und Dienste verbindet.",
    ctaMain: "Geschäft- und Partnerschaftsanfrage",
    ctaSub: "Weitere Newon-Geschäfte ansehen",
  },
  {
    back: "Zurück zu Livon auf der Startseite",
    planned: "Geplanter Ablauf",
    expandNote: "Ein künftiger Ausbauplan, kein aktueller Betrieb.",
    conceptNote: "Diese Seite ist eine Geschäftsvorstellung. Buchung, Zahlung und Anmeldung sind noch nicht verbunden.",
    plannedFlag: "Geplant",
    journeyNote: "Die Themen jeder Dekade sind typische Beispiele. Tempo und Bedarf unterscheiden sich von Mensch zu Mensch.",
    ongilNote: "Wenn Betreuung oder Lebenshilfe nötig ist, könnten wir später mit Ongil verbinden. Die beiden Dienste sind heute nicht verknüpft.",
    areasNote: "Die sechs Bereiche unten sind ein späterer Ausbauplan, keine laufenden Produkte.",
    relatedNote: "Livon ist heute nicht technisch mit anderen Newon-Geschäften verknüpft, und Daten werden nicht automatisch geteilt. Das Folgende ist eine spätere Richtung.",
  }
);

const hi = pack(
  {
    kicker: "NEWON Livon",
    brand: "Livon",
    titleHtml: "जीवन के हर चरण में,<br>वह अगला जो चाहिए.",
    lead: "किशोरावस्था से 70 तक. बदलाव और नई शुरुआत के लिए एक जीवन-चक्र मंच.",
    ctaMain: "Livon देखें",
    ctaSub: "व्यवसाय पूछताछ",
    status: "यह पृष्ठ व्यवसाय परिचय है.",
    pathLabel: "किशोरावस्था से 70 तक",
  },
  {
    kicker: "Why Livon",
    title: "जब जीवन बदलता है,\nजरूरी जानकारी भी बदलती है.",
    body: [
      "स्कूल और रास्ते से लेकर अपने घर, पहली नौकरी, परिवार और काम के बाद के नए दिन तक.",
      "हर चरण में चुनाव और जानकारी अलग होती है.",
      "Livon का लक्ष्य है कि आप जहाँ हैं, उसके अनुकूल जानकारी और सेवाएँ ढूँढना आसान हो.",
    ],
  },
  {
    kicker: "Life Journey",
    title: "किशोरावस्था से 70 तक,<br>चलता सफर.",
    lead: "हर चरण के साथ सवाल और चुनाव बदलते हैं. Livon वर्तमान से जुड़ी जानकारी और सेवाएँ जोड़ता है.",
    items: decades([
      ["10", "01", "किशोर", "संभावना खोजने का समय", "रास्ता, स्कूल और अनुभव से अपनी दिशा तलाशना.", ["रास्ता खोजना", "परीक्षा और पढ़ाई", "सीखना और बढ़ना", "योग्यता", "पैसे की बुनियाद", "शौक और क्लब", "खुद खड़े होने की तैयारी"]],
      ["20", "02", "20 की उम्र", "अपनी ज़िंदगी शुरू करने का समय", "स्वतंत्रता, पहली नौकरी, और एक दिन जो आप खुद बनाते हैं.", ["विश्वविद्यालय", "पहला काम और वयस्क जीवन", "अकेले रहना और आवास", "पैसा और संपत्ति", "आत्मविकास", "रिश्ता और शादी", "जीवन सेवाएँ"]],
      ["30", "03", "30 की उम्र", "आधार बढ़ाने का समय", "काम और जीवन का संतुलन, घर, रिश्ते और परिवार के चुनाव.", ["करियर विकास", "शादी और नवविवाहित जीवन", "घर पाना", "गर्भावस्था, जन्म, पालन", "घरेलू बजट", "बीमा और वित्त", "पारिवारिक जीवन", "स्वास्थ्य और दिनचर्या"]],
      ["40", "04", "40 की उम्र", "संतुलन बनाने का समय", "काम, परिवार और निजी लक्ष्य साथ रखकर आगे देखना.", ["बच्चों की शिक्षा", "करियर और बदलाव", "आवास और संपत्ति", "स्वास्थ्य जाँच", "माता-पिता की देखभाल", "पारिवारिक अवकाश", "बुढ़ापे की तैयारी"]],
      ["50", "05", "50 की उम्र", "नई संभावना तैयार करने का समय", "सीखी बातों से अगला अध्याय और नए अवसर तैयार करना.", ["सेवानिवृत्ति योजना", "पुनर्नियुक्ति और दूसरा काम", "पेंशन और संपत्ति", "स्वास्थ्य", "शौक और यात्रा", "बच्चों की स्वतंत्रता", "माता-पिता की देखभाल", "नई सीख और गतिविधि"]],
      ["60", "06", "60 की उम्र", "नया रोज़मर्रा शुरू करने का समय", "काम के बाद का जीवन गढ़ना, नई गतिविधियाँ और रिश्ते.", ["काम के बाद का जीवन", "पुनर्नियुक्ति और सामाजिक गतिविधि", "स्वास्थ्य और व्यायाम", "पेंशन और कल्याण", "यात्रा और शौक", "स्थानीय बैठकें", "डिजिटल सहायता"]],
      ["70", "07", "70 की उम्र", "अपने ढंग से दिन जारी रखने का समय", "जिस तरह जीना चाहते हैं, उस हिसाब से स्वस्थ, जीवंत दिन.", ["स्वास्थ्य और सुरक्षा", "रोज़मर्रा की सुविधा", "अवकाश और समुदाय", "पारिवारिक जुड़ाव", "आवास सहायता", "देखभाल और कल्याण", "स्थानीय जानकारी"]],
    ]),
  },
  {
    kicker: "Platform",
    title: "जिस चरण में आप हैं,<br>जरूरी चीज़ जोड़ना.",
    lead: "केवल उम्र के हिसाब से सुझाव जमा करने वाली साइट नहीं, बल्कि जानकारी से सेवा जोड़ने तक बढ़ने वाला जीवन मंच.",
    items: [
      { id: "info", n: "01", name: "जीवन-चरण से जानकारी देखना", lead: "उम्र और स्थिति के अनुकूल विषय और जानकारी देखने का अनुभव हमारा लक्ष्य है." },
      { id: "guide", n: "02", name: "व्यक्तिगत मार्गदर्शन", lead: "रुचि और जीवन-स्थिति के अनुकूल जानकारी आसान बनाने के लिए चरणबद्ध मार्गदर्शन लाने की योजना है.", planned: true },
      { id: "services", n: "03", name: "जीवन सेवाओं का जुड़ाव", lead: "आवास, पैसा, शिक्षा, स्वास्थ्य और अवकाश की बाहरी सेवाएँ और जानकारी जोड़ने की दिशा में विस्तार.", planned: true },
      { id: "experts", n: "04", name: "विशेषज्ञ और स्थानीय सेवाएँ", lead: "जरूरत पड़ने पर विशेषज्ञ और स्थानीय सेवाएँ खोजने की सुविधा चरणबद्ध बढ़ाने की योजना है.", planned: true },
    ],
  },
  {
    kicker: "How it works",
    title: "अभी के आप के लिए\nअगला कदम खोजें.",
    note: "यह नियोजित उपयोग प्रवाह है, लाइव आवेदन-आरक्षण नहीं.",
    steps: [
      { n: "01", name: "अपना जीवन-चरण चुनें", body: "अपनी आयु सीमा और अभी की रुचि के विषय चुनें." },
      { n: "02", name: "जरूरी जानकारी देखें", body: "चुने चरण और रुचि के अनुकूल जानकारी और संबंधित सेवाएँ देखें." },
      { n: "03", name: "अगले कदम से जुड़ें", body: "संबंधित सेवाएँ, गतिविधियाँ और विशेषज्ञ देखकर अगली पसंद तैयार करना लक्ष्य है." },
    ],
  },
  {
    kicker: "Business expansion",
    title: "जीवन के हर चरण तक\nजुड़ाव का दायरा बढ़ाना.",
    note: "अनिश्चित साझेदारी, राजस्व, उपयोगकर्ता संख्या या सेवा क्षेत्र नहीं दिखाए गए.",
    stages: [
      { n: "01", name: "चरणवार जानकारी मंच", body: "किशोरावस्था से 70 तक हर चरण की जानकारी और मुख्य सेवाएँ देखने का आधार बनाना." },
      { n: "02", name: "अधिक व्यक्तिगत मार्गदर्शन", body: "केवल उम्र नहीं, रुचि और जीवन-स्थिति के अनुसार मार्गदर्शन विकसित करना." },
      { n: "03", name: "जीवन सेवाएँ और विशेषज्ञ बढ़ाना", body: "आवास, पैसा, शिक्षा, स्वास्थ्य, अवकाश की सेवाएँ, विशेषज्ञ और स्थानीय ऑफ़र चरणबद्ध बढ़ाने की योजना." },
      { n: "04", name: "पूरा जीवन-चक्र मंच", body: "चरण बदलने पर भी इस्तेमाल जारी रह सके, ऐसा जीवन मंच बनाना लक्ष्य है." },
    ],
  },
  {
    kicker: "Livon VISION",
    titleHtml: "जीवन बदले तो भी,<br>जुड़ाव बना रहता है.",
    lead: "Livon हर व्यक्ति की गति और पसंद का सम्मान करता है, और हर नई शुरुआत व बदलाव पर जरूरी जानकारी और सेवाएँ जोड़ने वाले मंच के रूप में बढ़ता है.",
    ctaMain: "व्यवसाय और साझेदारी पूछताछ",
    ctaSub: "Newon के अन्य व्यवसाय देखें",
  },
  {
    back: "होम पर Livon परिचय पर वापस",
    planned: "नियोजित उपयोग प्रवाह",
    expandNote: "भविष्य की विस्तार योजना, वर्तमान संचालन नहीं.",
    conceptNote: "यह पृष्ठ व्यवसाय परिचय है. बुकिंग, भुगतान और साइन-अप अभी जुड़े नहीं हैं.",
    plannedFlag: "योजना",
    journeyNote: "हर दशक के विषय सामान्य उदाहरण हैं. गति और जरूरतें व्यक्ति के अनुसार अलग होती हैं.",
    ongilNote: "देखभाल या जीवन-सहायता चाहिए तो आगे Ongil से जोड़ने पर विचार हो सकता है. आज दोनों सेवाएँ जुड़ी नहीं हैं.",
    areasNote: "नीचे छह क्षेत्र बाद की विस्तार योजना हैं, चल रहे उत्पाद नहीं.",
    relatedNote: "आज Livon तकनीकी रूप से अन्य Newon व्यवसायों से जुड़ा नहीं है, और डेटा अपने आप साझा नहीं होता. नीचे आगे की दिशा है.",
  }
);

const id = pack(
  {
    kicker: "NEWON Livon",
    brand: "Livon",
    titleHtml: "Di setiap tahap kehidupan,<br>hal berikutnya yang Anda butuhkan.",
    lead: "Dari remaja hingga 70-an. Platform siklus hidup untuk perubahan dan awal yang baru.",
    ctaMain: "Jelajahi Livon",
    ctaSub: "Pertanyaan bisnis",
    status: "Halaman ini adalah pengenalan bisnis.",
    pathLabel: "Dari remaja hingga 70-an",
  },
  {
    kicker: "Why Livon",
    title: "Saat hidup berubah,\ninformasi yang Anda butuhkan juga berubah.",
    body: [
      "Dari sekolah dan jalur, hidup mandiri, pekerjaan pertama, rumah, keluarga, hingga hari-hari baru setelah bekerja.",
      "Setiap tahap membawa pilihan berbeda, dan informasi berbeda.",
      "Livon bertujuan memudahkan menemukan informasi dan layanan yang sesuai dengan posisi Anda sekarang.",
    ],
  },
  {
    kicker: "Life Journey",
    title: "Dari remaja hingga 70-an,\nperjalanan yang terus berlanjut.",
    lead: "Pertanyaan dan pilihan bergeser di setiap tahap. Livon menghubungkan apa yang sesuai dengan masa kini.",
    items: decades([
      ["10", "01", "Remaja", "Waktu menemukan kemungkinan", "Menjelajahi arah lewat jalur, sekolah, dan pengalaman baru.", ["Menjelajahi jalur", "Ujian dan sekolah", "Belajar dan tumbuh", "Kualifikasi", "Dasar keuangan", "Hobi dan klub", "Bersiap mandiri"]],
      ["20", "02", "20-an", "Waktu memulai hidup sendiri", "Kemandirian, pekerjaan pertama, dan awal hari-hari yang Anda bangun sendiri.", ["Universitas", "Pekerjaan pertama dan hidup dewasa", "Tinggal sendiri dan hunian", "Uang dan aset", "Pengembangan diri", "Hubungan dan persiapan menikah", "Layanan hidup"]],
      ["30", "03", "30-an", "Waktu memperluas dasar hidup", "Keseimbangan kerja dan hidup, serta pilihan rumah, relasi, dan keluarga.", ["Pertumbuhan karier", "Pernikahan dan pengantin baru", "Mencari hunian", "Kehamilan, kelahiran, pengasuhan", "Keuangan rumah", "Asuransi dan keuangan", "Kehidupan keluarga", "Kesehatan dan hari-hari"]],
      ["40", "04", "40-an", "Waktu merancang keseimbangan", "Kerja, keluarga, dan tujuan pribadi dipegang bersama sambil menatap ke depan.", ["Pendidikan anak", "Karier dan transisi", "Hunian dan aset", "Pemeriksaan kesehatan", "Mendukung orang tua", "Waktu luang keluarga", "Menyiapkan masa tua"]],
      ["50", "05", "50-an", "Waktu menyiapkan kemungkinan baru", "Memakai pengalaman untuk menyiapkan bab berikutnya dan peluang baru.", ["Rencana pensiun", "Kerja ulang dan pekerjaan kedua", "Pensiun dan aset", "Kesehatan", "Hobi dan perjalanan", "Kemandirian anak", "Perawatan orang tua", "Belajar dan kegiatan baru"]],
      ["60", "06", "60-an", "Waktu memulai hari-hari baru", "Merancang hidup setelah kerja, serta kegiatan dan relasi baru.", ["Hidup setelah kerja", "Kerja ulang dan kegiatan sosial", "Kesehatan dan olahraga", "Pensiun dan kesejahteraan", "Perjalanan dan hobi", "Pertemuan lokal", "Bantuan digital"]],
      ["70", "07", "70-an", "Waktu terus hidup dengan cara Anda", "Melanjutkan hari yang sehat dan hidup, sesuai cara Anda ingin tinggal.", ["Kesehatan dan keamanan", "Kenyamanan sehari-hari", "Waktu luang dan komunitas", "Hubungan keluarga", "Dukungan hunian", "Perawatan dan kesejahteraan", "Informasi hidup setempat"]],
    ]),
  },
  {
    kicker: "Platform",
    title: "Sesuai tahap Anda sekarang,\nmenghubungkan yang dibutuhkan.",
    lead: "Bukan situs yang hanya mengumpulkan tips menurut usia, melainkan platform kehidupan yang tumbuh dari mencari informasi hingga menghubungkan layanan.",
    items: [
      { id: "info", n: "01", name: "Jelajah menurut tahap hidup", lead: "Tujuannya adalah pengalaman menelusuri informasi dan topik hidup yang sesuai usia dan situasi." },
      { id: "guide", n: "02", name: "Panduan personal", lead: "Kami merencanakan memperkenalkan panduan yang lebih sesuai, selangkah demi selangkah, agar informasi yang pas lebih mudah ditemukan.", planned: true },
      { id: "services", n: "03", name: "Koneksi layanan hidup", lead: "Kami akan memperluas penelusuran dan koneksi layanan serta informasi eksternal: hunian, uang, belajar, kesehatan, dan waktu luang.", planned: true },
      { id: "experts", n: "04", name: "Ahli dan layanan setempat", lead: "Kami merencanakan memperluas, selangkah demi selangkah, kemampuan menemukan ahli dan layanan setempat saat dibutuhkan.", planned: true },
    ],
  },
  {
    kicker: "How it works",
    title: "Temukan langkah berikutnya\nyang sesuai dengan Anda sekarang.",
    note: "Ini alur penggunaan yang direncanakan, bukan alur daftar-dan-pesan yang sudah hidup.",
    steps: [
      { n: "01", name: "Pilih tahap hidup Anda", body: "Pilih rentang usia dan topik hidup yang Anda pedulikan sekarang." },
      { n: "02", name: "Jelajahi yang Anda butuhkan", body: "Lihat informasi dan layanan terkait yang sesuai tahap dan minat yang Anda pilih." },
      { n: "03", name: "Hubungkan langkah berikutnya", body: "Tujuannya adalah menelusuri layanan, kegiatan, dan ahli, lalu menyiapkan pilihan berikutnya." },
    ],
  },
  {
    kicker: "Business expansion",
    title: "Ke setiap tahap kehidupan,\nkoneksi yang lebih luas.",
    note: "Kemitraan, pendapatan, jumlah pengguna, dan wilayah layanan yang belum dikonfirmasi tidak ditampilkan.",
    stages: [
      { n: "01", name: "Platform informasi tahap hidup", body: "Membangun dasar agar dari remaja hingga 70-an orang dapat menelusuri informasi dan layanan utama tiap tahap." },
      { n: "02", name: "Panduan yang lebih personal", body: "Mengembangkan panduan yang mencerminkan minat dan situasi hidup, bukan hanya usia." },
      { n: "03", name: "Lebih banyak layanan hidup dan ahli", body: "Kami merencanakan memperluas koneksi dengan layanan, ahli, dan tawaran setempat di hunian, uang, belajar, kesehatan, dan waktu luang." },
      { n: "04", name: "Platform siklus hidup yang utuh", body: "Tujuannya adalah platform kehidupan yang tetap bisa dipakai saat tahap hidup berubah." },
    ],
  },
  {
    kicker: "Livon VISION",
    titleHtml: "Meski hidup berubah,<br>koneksi tetap berlanjut.",
    lead: "Livon menghormati tempo dan pilihan setiap orang, dan tumbuh sebagai platform yang menghubungkan informasi dan layanan yang dibutuhkan di setiap awal baru dan setiap perubahan.",
    ctaMain: "Pertanyaan bisnis dan kemitraan",
    ctaSub: "Lihat bisnis Newon lainnya",
  },
  {
    back: "Kembali ke pengenalan Livon di beranda",
    planned: "Alur penggunaan yang direncanakan",
    expandNote: "Rencana ekspansi masa depan, bukan klaim operasi saat ini.",
    conceptNote: "Halaman ini adalah pengenalan bisnis. Pemesanan, pembayaran, dan pendaftaran belum terhubung.",
    plannedFlag: "Direncanakan",
    journeyNote: "Tema tiap dekade adalah contoh umum. Tempo dan kebutuhan berbeda untuk setiap orang.",
    ongilNote: "Jika perawatan atau dukungan hidup diperlukan, ke depan kami dapat menghubungkan dengan Ongil. Kedua layanan belum terhubung hari ini.",
    areasNote: "Enam area di bawah adalah rencana ekspansi belakangan, bukan produk yang sudah beroperasi.",
    relatedNote: "Hari ini Livon tidak terhubung secara teknis dengan bisnis Newon lain, dan data tidak dibagikan otomatis. Berikut adalah arah ke depan.",
  }
);

export const LIFE_STAGE_I18N = { ja, es, "pt-br": ptBr, fr, de, hi, id };
