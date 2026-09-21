/** Localized labels for Life Stage IA refine. Merged onto enriched EN. */

function cats(study, life, work, family, blurbs = {}) {
  return [
    { id: "study", title: study, blurb: blurbs.study },
    { id: "life", title: life, blurb: blurbs.life },
    { id: "work", title: work, blurb: blurbs.work },
    { id: "family", title: family, blurb: blurbs.family },
  ];
}

function groups(a, b, c, d, e) {
  return [
    { id: "study", title: a },
    { id: "work", title: b },
    { id: "home", title: c },
    { id: "rel", title: d },
    { id: "later", title: e },
  ];
}

function ages(map) {
  return Object.entries(map).map(([id, v]) => ({ id, name: v.name, highlights: v.highlights }));
}

export const LIFE_STAGE_REFINE = {
  ja: {
    ui: {
      more: "詳しく見る",
      moreServices: "関連サービスを見る",
      moreLearn: "さらに知る",
      moreItems: "項目を見る",
      pickAge: "年代を選ぶと、詳しいテーマを見られます。",
      pickSitCat: "カテゴリーを選ぶと、関連する状況が表示されます。",
      pickSit: "状況を選ぶと、必要な知識と準備項目を見られます。",
      pickKnow: "グループを選んでから、知識分野を選んでください。",
      pickVenture: "事業名を選ぶと、詳しい説明を見られます。",
      allStages: "すべての人生の段階",
      allStagesSub: "10代から70代+",
    },
    hero: {
      lead: "進路と独立、仕事とキャリア、家族とケア、仕事のあとの暮らしまで。Life Stageは、人生のすべての段階で必要な知識と道具、人とサービスをつなぐ総合ライフプラットフォームです。",
    },
    core: {
      title: "案内を受け、計画し、実行する。",
      lead: "Life AIが今の状況を整理し、Life Plannerが準備リストに変えます。",
    },
    connect: {
      title: "必要な瞬間に、\n人とサービスをつなぎます。",
      expertLead: "関連分野の専門家を探し、つなぐサービス",
      servicesLead: "暮らしに必要なサービスを探し、比べるサービス",
      communityLead: "経験と情報を共有する場",
    },
    sitCats: cats("学びと社会への一歩", "独立と暮らし", "仕事と新しい挑戦", "家族と次の暮らし", {
      study: "入試 · 進路 · 大人の準備 · アルバイト · 初めての仕事",
      life: "初めての独立 · 結婚準備 · 初めての育児",
      work: "転職 · 創業の準備",
      family: "家族のケア · 仕事のあと",
    }),
    knowGroups: groups("学び・進路", "仕事・経済", "住まい・暮らし", "関係・家族", "次の暮らし"),
    ages: {
      items: ages({
        10: { name: "未来を探る時期", highlights: ["学校生活", "進路・入試", "大人の準備"] },
        20: { name: "新しい始まり", highlights: ["独立", "初めての仕事", "お金の基礎"] },
        30: { name: "暮らしの基盤", highlights: ["キャリア", "住まい・お金", "家族の暮らし"] },
        40: { name: "仕事と暮らしのバランス", highlights: ["キャリア転換", "子どもの学び", "家族のケア"] },
        50: { name: "新しい転換", highlights: ["再就職・創業", "仕事のあと", "健康・余暇"] },
        60: { name: "次の日常", highlights: ["生涯学習", "地域の活動", "仕事のあとの暮らし"] },
        70: { name: "自分らしい暮らし", highlights: ["デジタル生活", "余暇とつながり", "生活の支援"] },
      }),
    },
  },
  es: {
    ui: {
      more: "Ver detalle",
      moreServices: "Ver servicios relacionados",
      moreLearn: "Saber más",
      moreItems: "Más ítems",
      pickAge: "Elige una etapa para ver sus temas.",
      pickSitCat: "Elige una categoría para ver situaciones.",
      pickSit: "Elige una situación para ver qué aprender y preparar.",
      pickKnow: "Elige un grupo y luego un campo de conocimiento.",
      pickVenture: "Elige un servicio para leer la descripción.",
      allStages: "Todas las etapas de la vida",
      allStagesSub: "De la adolescencia a los 70+",
    },
    hero: {
      lead: "Carrera e independencia, trabajo y familia, cuidados y la vida después del trabajo. Life Stage conecta el conocimiento, las herramientas, las personas y los servicios que cada etapa necesita.",
    },
    core: {
      title: "Orientación, plan y acción.",
      lead: "Life AI ordena el momento. Life Planner lo convierte en una lista.",
    },
    connect: {
      title: "Cuando hace falta ayuda,\npersonas y servicios se conectan.",
      expertLead: "Explorar y conectar con especialistas del ámbito que importa.",
      servicesLead: "Buscar y comparar los servicios de vida que la situación necesita.",
      communityLead: "Un espacio para compartir experiencia e información.",
    },
    sitCats: cats("Estudio y primer paso", "Independencia y vida", "Trabajo y nuevos retos", "Familia y el siguiente capítulo", {
      study: "Admisión · camino · primer trabajo",
      life: "Independencia · matrimonio · primer hijo",
      work: "Cambio de empleo · emprender",
      family: "Cuidado familiar · etapa posterior",
    }),
    knowGroups: groups("Estudio y camino", "Trabajo y dinero", "Hogar y vida", "Vínculos y familia", "Siguiente etapa"),
    ages: {
      items: ages({
        10: { name: "Un tiempo para explorar el futuro", highlights: ["Vida escolar", "Camino y admisión", "Preparar la adultez"] },
        20: { name: "Un nuevo comienzo", highlights: ["Independencia", "Primer empleo", "Bases de dinero"] },
        30: { name: "La base de la vida", highlights: ["Carrera", "Vivienda y dinero", "Vida familiar"] },
        40: { name: "Equilibrio trabajo-vida", highlights: ["Cambio de carrera", "Educación de los hijos", "Cuidado familiar"] },
        50: { name: "Un nuevo giro", highlights: ["Reempleo o emprender", "Preparar la etapa", "Salud y ocio"] },
        60: { name: "El siguiente día a día", highlights: ["Aprendizaje continuo", "Comunidad", "Vida después del trabajo"] },
        70: { name: "Una vida a tu manera", highlights: ["Vida digital", "Ocio y vínculos", "Apoyo cotidiano"] },
      }),
    },
  },
  "pt-br": {
    ui: {
      more: "Ver detalhes",
      moreServices: "Ver serviços relacionados",
      moreLearn: "Saiba mais",
      moreItems: "Mais itens",
      pickAge: "Escolha uma faixa etária para ver os temas.",
      pickSitCat: "Escolha uma categoria para ver situações.",
      pickSit: "Escolha uma situação para ver o que aprender e preparar.",
      pickKnow: "Escolha um grupo e depois um campo de conhecimento.",
      pickVenture: "Escolha um serviço para ler a descrição.",
      allStages: "Todas as etapas da vida",
      allStagesSub: "Da adolescência aos 70+",
    },
    hero: {
      lead: "Carreira e independência, trabalho e família, cuidado e a vida depois do trabalho. Life Stage conecta o conhecimento, as ferramentas, as pessoas e os serviços que cada etapa precisa.",
    },
    core: {
      title: "Orientação, plano e ação.",
      lead: "Life AI organiza o momento. Life Planner transforma isso em uma lista.",
    },
    connect: {
      title: "Quando é preciso ajuda,\npessoas e serviços se conectam.",
      expertLead: "Explorar e conectar especialistas da área que importa.",
      servicesLead: "Encontrar e comparar os serviços de vida que a situação pede.",
      communityLead: "Um espaço para compartilhar experiência e informação.",
    },
    sitCats: cats("Estudo e primeiro passo", "Independência e vida", "Trabalho e novos desafios", "Família e o próximo capítulo", {
      study: "Admissão · caminho · primeiro emprego",
      life: "Independência · casamento · primeiro filho",
      work: "Mudança de emprego · empreender",
      family: "Cuidado familiar · próxima etapa",
    }),
    knowGroups: groups("Estudo e caminho", "Trabalho e dinheiro", "Casa e vida", "Vínculos e família", "Próxima etapa"),
    ages: {
      items: ages({
        10: { name: "Um tempo para explorar o futuro", highlights: ["Vida escolar", "Caminho e vestibular", "Preparar a vida adulta"] },
        20: { name: "Um novo começo", highlights: ["Independência", "Primeiro emprego", "Bases de dinheiro"] },
        30: { name: "A base da vida", highlights: ["Carreira", "Moradia e dinheiro", "Vida em família"] },
        40: { name: "Equilíbrio trabalho-vida", highlights: ["Mudança de carreira", "Educação dos filhos", "Cuidado familiar"] },
        50: { name: "Uma nova virada", highlights: ["Reemprego ou negócio", "Preparar a etapa", "Saúde e lazer"] },
        60: { name: "O próximo cotidiano", highlights: ["Aprendizado contínuo", "Comunidade", "Vida depois do trabalho"] },
        70: { name: "Uma vida do seu jeito", highlights: ["Vida digital", "Lazer e vínculos", "Apoio do dia a dia"] },
      }),
    },
  },
  fr: {
    ui: {
      more: "Voir le détail",
      moreServices: "Voir les services liés",
      moreLearn: "En savoir plus",
      moreItems: "Plus d’éléments",
      pickAge: "Choisissez une tranche d’âge pour voir les thèmes.",
      pickSitCat: "Choisissez une catégorie pour voir les situations.",
      pickSit: "Choisissez une situation pour voir quoi apprendre et préparer.",
      pickKnow: "Choisissez un groupe, puis un domaine de connaissance.",
      pickVenture: "Choisissez un service pour lire la description.",
      allStages: "Toutes les étapes de la vie",
      allStagesSub: "De l’adolescence à 70+",
    },
    hero: {
      lead: "Parcours et indépendance, travail et famille, aide aux proches et la vie après le travail. Life Stage relie les savoirs, outils, personnes et services dont chaque étape a besoin.",
    },
    core: {
      title: "S’orienter, planifier, agir.",
      lead: "Life AI clarifie le moment. Life Planner en fait une liste.",
    },
    connect: {
      title: "Quand l’aide est nécessaire,\npersonnes et services se relient.",
      expertLead: "Trouver et relier des spécialistes du domaine utile.",
      servicesLead: "Trouver et comparer les services de vie dont la situation a besoin.",
      communityLead: "Un lieu pour partager expériences et informations.",
    },
    sitCats: cats("Études et premier pas", "Indépendance et vie", "Travail et nouveaux défis", "Famille et chapitre suivant", {
      study: "Admission · parcours · premier emploi",
      life: "Indépendance · mariage · premier enfant",
      work: "Changement d’emploi · entreprendre",
      family: "Aide familiale · après le travail",
    }),
    knowGroups: groups("Études et chemin", "Travail et argent", "Logement et vie", "Liens et famille", "Chapitre suivant"),
    ages: {
      items: ages({
        10: { name: "Un temps pour explorer l’avenir", highlights: ["Vie scolaire", "Voie et admissions", "Préparer l’âge adulte"] },
        20: { name: "Un nouveau départ", highlights: ["Indépendance", "Premier emploi", "Bases d’argent"] },
        30: { name: "Les bases de la vie", highlights: ["Carrière", "Logement et argent", "Vie de famille"] },
        40: { name: "Équilibre travail-vie", highlights: ["Changement de carrière", "Éducation des enfants", "Aide familiale"] },
        50: { name: "Un nouveau tournant", highlights: ["Reprise ou création", "Préparer la suite", "Santé et loisirs"] },
        60: { name: "Le quotidien suivant", highlights: ["Apprendre encore", "Communauté", "Vie après le travail"] },
        70: { name: "Une vie à sa manière", highlights: ["Vie numérique", "Loisirs et liens", "Soutien du quotidien"] },
      }),
    },
  },
  de: {
    ui: {
      more: "Details ansehen",
      moreServices: "Verwandte Dienste ansehen",
      moreLearn: "Mehr erfahren",
      moreItems: "Weitere Punkte",
      pickAge: "Wählen Sie eine Altersgruppe, um Themen zu sehen.",
      pickSitCat: "Wählen Sie eine Kategorie, um Situationen zu sehen.",
      pickSit: "Wählen Sie eine Situation, um Lernen und Vorbereitung zu sehen.",
      pickKnow: "Wählen Sie eine Gruppe, dann ein Wissensfeld.",
      pickVenture: "Wählen Sie einen Dienst, um die Beschreibung zu lesen.",
      allStages: "Jede Lebensphase",
      allStagesSub: "Von Teenagern bis 70+",
    },
    hero: {
      lead: "Weg und Unabhängigkeit, Arbeit und Familie, Fürsorge und das Leben nach der Arbeit. Life Stage verbindet Wissen, Werkzeuge, Menschen und Dienste, die jede Phase braucht.",
    },
    core: {
      title: "Orientierung, Plan, Umsetzung.",
      lead: "Life AI ordnet den Moment. Life Planner macht daraus eine Liste.",
    },
    connect: {
      title: "Wenn Hilfe nötig ist,\nverbinden sich Menschen und Dienste.",
      expertLead: "Fachleute im relevanten Bereich finden und verbinden.",
      servicesLead: "Lebensdienste finden und vergleichen, die die Situation braucht.",
      communityLead: "Ein Ort, um Erfahrung und Information zu teilen.",
    },
    sitCats: cats("Lernen und erster Schritt", "Unabhängigkeit und Alltag", "Arbeit und neue Wege", "Familie und nächstes Kapitel", {
      study: "Aufnahme · Weg · erster Job",
      life: "Auszug · Heirat · erstes Kind",
      work: "Jobwechsel · Gründen",
      family: "Familienpflege · danach",
    }),
    knowGroups: groups("Lernen und Weg", "Arbeit und Geld", "Wohnen und Alltag", "Bindungen und Familie", "Nächstes Kapitel"),
    ages: {
      items: ages({
        10: { name: "Eine Zeit, die Zukunft zu erkunden", highlights: ["Schulleben", "Weg und Zulassung", "Vorbereitung aufs Erwachsenwerden"] },
        20: { name: "Ein neuer Start", highlights: ["Unabhängigkeit", "Erster Job", "Geld-Grundlagen"] },
        30: { name: "Das Fundament des Lebens", highlights: ["Karriere", "Wohnen und Geld", "Familienleben"] },
        40: { name: "Balance von Arbeit und Leben", highlights: ["Karrierewechsel", "Bildung der Kinder", "Familienfürsorge"] },
        50: { name: "Eine neue Wende", highlights: ["Wiedereinstieg oder Gründung", "Spätere Phase", "Gesundheit und Freizeit"] },
        60: { name: "Der nächste Alltag", highlights: ["Lebenslanges Lernen", "Gemeinschaft", "Leben nach der Arbeit"] },
        70: { name: "Ein Leben auf eigene Weise", highlights: ["Digitales Leben", "Freizeit und Bindungen", "Alltagsunterstützung"] },
      }),
    },
  },
  hi: {
    ui: {
      more: "विवरण देखें",
      moreServices: "संबंधित सेवाएँ देखें",
      moreLearn: "और जानें",
      moreItems: "और आइटम",
      pickAge: "विषय देखने के लिए आयु चरण चुनें।",
      pickSitCat: "स्थितियाँ देखने के लिए श्रेणी चुनें।",
      pickSit: "सीखने और तैयारी के लिए स्थिति चुनें।",
      pickKnow: "पहले समूह चुनें, फिर ज्ञान क्षेत्र।",
      pickVenture: "विवरण पढ़ने के लिए सेवा चुनें।",
      allStages: "जीवन का हर चरण",
      allStagesSub: "किशोरावस्था से 70+",
    },
    hero: {
      lead: "करियर और स्वतंत्रता, काम और परिवार, देखभाल और काम के बाद का जीवन। Life Stage हर चरण के लिए ज्ञान, साधन, लोगों और सेवाओं को जोड़ता है।",
    },
    core: {
      title: "मार्गदर्शन, योजना, फिर करना।",
      lead: "Life AI पल को व्यवस्थित करता है। Life Planner उसे सूची बना देता है।",
    },
    connect: {
      title: "जब मदद चाहिए,\nलोग और सेवाएँ जुड़ते हैं।",
      expertLead: "ज़रूरी क्षेत्र के विशेषज्ञ खोजें और जुड़ें।",
      servicesLead: "स्थिति के हिसाब से जीवन सेवाएँ खोजें और तुलना करें।",
      communityLead: "अनुभव और जानकारी साझा करने की जगह।",
    },
    sitCats: cats("पढ़ाई और पहली शुरुआत", "स्वतंत्रता और जीवन", "काम और नई चुनौतियाँ", "परिवार और अगला अध्याय", {
      study: "प्रवेश · रास्ता · पहली नौकरी",
      life: "स्वतंत्रता · विवाह · पहला बच्चा",
      work: "नौकरी बदलना · व्यवसाय",
      family: "परिवार की देखभाल · अगला चरण",
    }),
    knowGroups: groups("पढ़ाई और रास्ता", "काम और धन", "घर और जीवन", "रिश्ते और परिवार", "अगला अध्याय"),
    ages: {
      items: ages({
        10: { name: "भविष्य खोजने का समय", highlights: ["स्कूल जीवन", "रास्ता और प्रवेश", "वयस्क तैयारी"] },
        20: { name: "एक नई शुरुआत", highlights: ["स्वतंत्रता", "पहली नौकरी", "पैसे की बुनियाद"] },
        30: { name: "जीवन की नींव", highlights: ["करियर", "आवास और धन", "पारिवारिक जीवन"] },
        40: { name: "काम और जीवन का संतुलन", highlights: ["करियर बदलाव", "बच्चों की शिक्षा", "परिवार की देखभाल"] },
        50: { name: "एक नया मोड़", highlights: ["पुनः कार्य या उद्यम", "अगली तैयारी", "स्वास्थ्य और अवकाश"] },
        60: { name: "अगला रोज़मर्रा", highlights: ["जीवनभर सीखना", "समुदाय", "काम के बाद का जीवन"] },
        70: { name: "अपने ढंग का जीवन", highlights: ["डिजिटल जीवन", "अवकाश और रिश्ते", "दैनिक सहयोग"] },
      }),
    },
  },
  id: {
    ui: {
      more: "Lihat detail",
      moreServices: "Lihat layanan terkait",
      moreLearn: "Pelajari lebih lanjut",
      moreItems: "Item lainnya",
      pickAge: "Pilih rentang usia untuk melihat topiknya.",
      pickSitCat: "Pilih kategori untuk melihat situasi.",
      pickSit: "Pilih situasi untuk melihat apa yang perlu dipelajari dan disiapkan.",
      pickKnow: "Pilih kelompok, lalu bidang pengetahuan.",
      pickVenture: "Pilih layanan untuk membaca deskripsi.",
      allStages: "Setiap tahap kehidupan",
      allStagesSub: "Remaja hingga 70+",
    },
    hero: {
      lead: "Karier dan kemandirian, kerja dan keluarga, perawatan, dan kehidupan setelah bekerja. Life Stage menghubungkan pengetahuan, alat, orang, dan layanan yang dibutuhkan setiap tahap.",
    },
    core: {
      title: "Panduan, rencana, lalu tindakan.",
      lead: "Life AI merapikan momen ini. Life Planner mengubahnya menjadi daftar.",
    },
    connect: {
      title: "Saat bantuan dibutuhkan,\norang dan layanan terhubung.",
      expertLead: "Menemukan dan menghubungkan ahli di bidang yang relevan.",
      servicesLead: "Mencari dan membandingkan layanan hidup yang dibutuhkan situasi.",
      communityLead: "Tempat berbagi pengalaman dan informasi.",
    },
    sitCats: cats("Belajar dan langkah awal", "Kemandirian dan hidup", "Kerja dan tantangan baru", "Keluarga dan bab berikutnya", {
      study: "Masuk · jalur · kerja pertama",
      life: "Mandiri · menikah · anak pertama",
      work: "Pindah kerja · usaha",
      family: "Perawatan keluarga · bab berikutnya",
    }),
    knowGroups: groups("Belajar dan jalur", "Kerja dan uang", "Rumah dan hidup", "Ikatan dan keluarga", "Bab berikutnya"),
    ages: {
      items: ages({
        10: { name: "Waktu menjajaki masa depan", highlights: ["Hidup sekolah", "Jalur dan masuk", "Persiapan dewasa"] },
        20: { name: "Awal yang baru", highlights: ["Kemandirian", "Pekerjaan pertama", "Dasar uang"] },
        30: { name: "Fondasi hidup", highlights: ["Karier", "Hunian dan uang", "Hidup keluarga"] },
        40: { name: "Keseimbangan kerja-hidup", highlights: ["Pindah karier", "Pendidikan anak", "Perawatan keluarga"] },
        50: { name: "Belokan baru", highlights: ["Kerja lagi atau usaha", "Persiapan tahap", "Kesehatan dan waktu luang"] },
        60: { name: "Sehari-hari berikutnya", highlights: ["Belajar seumur hidup", "Komunitas", "Hidup setelah kerja"] },
        70: { name: "Hidup dengan caramu", highlights: ["Hidup digital", "Waktu luang dan ikatan", "Dukungan sehari-hari"] },
      }),
    },
  },
};
