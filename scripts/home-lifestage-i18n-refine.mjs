/** Localized labels for Livon IA refine. Merged onto enriched EN. */

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
      allStagesSub: "10代から70代",
    },
    hero: {
      lead: "学校と進路、就職と独立、家族と健康、仕事のあとまで。10代から70代まで、Livonは人生の変化の前で必要な情報とサービスを見つけやすくつなぐライフサイクル・プラットフォームをつくっています。",
    },
    core: {
      title: "案内を受け、計画し、実行する。",
      lead: "今後の提供方向です。Life AI相談とLife Planner保存はまだ利用できません。",
    },
    connect: {
      title: "必要な瞬間に、\n人とサービスをつなぎます。",
      expertLead: "今後、関連分野の専門家を探しつなぐ方向です。",
      servicesLead: "今後、暮らしに必要なサービスを探し比べる方向です。",
      communityLead: "経験と情報を共有する場をつくる方向です。",
    },
    sitCats: cats("学びと社会への一歩", "独立と暮らし", "転職とキャリア転換", "家族と次の暮らし", {
      study: "入試 · 進路 · 大人の準備 · アルバイト · 就職",
      life: "独立 · 結婚 · 育児",
      work: "転職 · 再就職 · キャリア転換",
      family: "家族のケア · 仕事のあと",
    }),
    knowGroups: groups("学び・進路", "仕事・経済", "住まい・暮らし", "関係・家族", "次の暮らし"),
    ages: {
      items: ages({
        10: { name: "未来を探る時期", highlights: ["学校生活", "進路・入試", "大人の準備"] },
        20: { name: "新しい始まり", highlights: ["独立", "職場", "お金の基礎"] },
        30: { name: "暮らしの基盤", highlights: ["キャリア", "住まい・お金", "家族の暮らし"] },
        40: { name: "仕事と暮らしのバランス", highlights: ["キャリア転換", "子どもの学び", "家族のケア"] },
        50: { name: "新しい転換", highlights: ["再就職・キャリア転換", "家族のケア", "健康・退職準備"] },
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
      allStagesSub: "De la adolescencia a los 70",
    },
    hero: {
      lead: "Escuela y camino, trabajo e independencia, familia y salud, y la vida después del trabajo. De la adolescencia a los 70, Livon construye una plataforma de ciclo de vida para hallar la información y los servicios que un cambio de vida requiere.",
    },
    core: {
      title: "Orientación, plan y acción.",
      lead: "Una dirección futura. El consejo de Life AI y el guardado de Life Planner aún no están disponibles.",
    },
    connect: {
      title: "Cuando hace falta ayuda,\npersonas y servicios se conectan.",
      expertLead: "Dirección futura: explorar especialistas del ámbito que importa.",
      servicesLead: "Dirección futura: buscar y comparar servicios de vida.",
      communityLead: "Un espacio futuro para compartir experiencia e información.",
    },
    sitCats: cats("Estudio y primer paso", "Independencia y vida", "Reempleo y giro profesional", "Familia y el siguiente capítulo", {
      study: "Admisión · camino · primer trabajo",
      life: "Independencia · matrimonio · primer hijo",
      work: "Cambio de empleo · reempleo · giro profesional",
      family: "Cuidado familiar · etapa posterior",
    }),
    knowGroups: groups("Estudio y camino", "Trabajo y dinero", "Hogar y vida", "Vínculos y familia", "Siguiente etapa"),
    ages: {
      items: ages({
        10: { name: "Un tiempo para explorar el futuro", highlights: ["Vida escolar", "Camino y admisión", "Preparar la adultez"] },
        20: { name: "Un nuevo comienzo", highlights: ["Independencia", "Vida laboral", "Bases de dinero"] },
        30: { name: "La base de la vida", highlights: ["Carrera", "Vivienda y dinero", "Vida familiar"] },
        40: { name: "Equilibrio trabajo-vida", highlights: ["Cambio de carrera", "Educación de los hijos", "Cuidado familiar"] },
        50: { name: "Un nuevo giro", highlights: ["Reempleo y giro", "Cuidado familiar", "Salud y jubilación"] },
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
      allStagesSub: "Da adolescência aos 70",
    },
    hero: {
      lead: "Escola e caminho, trabalho e independência, família e saúde, e a vida depois do trabalho. Da adolescência aos 70, o Livon constrói uma plataforma de ciclo de vida para achar informação e serviços que uma mudança de vida pede.",
    },
    core: {
      title: "Orientação, plano e ação.",
      lead: "Uma direção futura. O conselho do Life AI e o salvamento do Life Planner ainda não estão disponíveis.",
    },
    connect: {
      title: "Quando é preciso ajuda,\npessoas e serviços se conectam.",
      expertLead: "Direção futura: explorar especialistas da área que importa.",
      servicesLead: "Direção futura: encontrar e comparar serviços de vida.",
      communityLead: "Um espaço futuro para compartilhar experiência e informação.",
    },
    sitCats: cats("Estudo e primeiro passo", "Independência e vida", "Reemprego e virada de carreira", "Família e o próximo capítulo", {
      study: "Admissão · caminho · primeiro emprego",
      life: "Independência · casamento · primeiro filho",
      work: "Mudança de emprego · reemprego · virada de carreira",
      family: "Cuidado familiar · próxima etapa",
    }),
    knowGroups: groups("Estudo e caminho", "Trabalho e dinheiro", "Casa e vida", "Vínculos e família", "Próxima etapa"),
    ages: {
      items: ages({
        10: { name: "Um tempo para explorar o futuro", highlights: ["Vida escolar", "Caminho e vestibular", "Preparar a vida adulta"] },
        20: { name: "Um novo começo", highlights: ["Independência", "Vida no trabalho", "Bases de dinheiro"] },
        30: { name: "A base da vida", highlights: ["Carreira", "Moradia e dinheiro", "Vida em família"] },
        40: { name: "Equilíbrio trabalho-vida", highlights: ["Mudança de carreira", "Educação dos filhos", "Cuidado familiar"] },
        50: { name: "Uma nova virada", highlights: ["Reemprego e virada", "Cuidado familiar", "Saúde e aposentadoria"] },
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
      allStagesSub: "De l’adolescence à 70 ans",
    },
    hero: {
      lead: "École et parcours, travail et indépendance, famille et santé, et la vie après le travail. De l’adolescence à 70 ans, Livon construit une plateforme de cycle de vie pour trouver l’information et les services qu’un changement de vie demande.",
    },
    core: {
      title: "S’orienter, planifier, agir.",
      lead: "Une direction future. Le conseil Life AI et l’enregistrement Life Planner ne sont pas encore disponibles.",
    },
    connect: {
      title: "Quand l’aide est nécessaire,\npersonnes et services se relient.",
      expertLead: "Direction future : trouver des spécialistes du domaine utile.",
      servicesLead: "Direction future : trouver et comparer des services de vie.",
      communityLead: "Un lieu futur pour partager expériences et informations.",
    },
    sitCats: cats("Études et premier pas", "Indépendance et vie", "Retour à l’emploi et reconversion", "Famille et chapitre suivant", {
      study: "Admission · parcours · premier emploi",
      life: "Indépendance · mariage · premier enfant",
      work: "Changement d’emploi · retour à l’emploi · reconversion",
      family: "Aide familiale · après le travail",
    }),
    knowGroups: groups("Études et chemin", "Travail et argent", "Logement et vie", "Liens et famille", "Chapitre suivant"),
    ages: {
      items: ages({
        10: { name: "Un temps pour explorer l’avenir", highlights: ["Vie scolaire", "Voie et admissions", "Préparer l’âge adulte"] },
        20: { name: "Un nouveau départ", highlights: ["Indépendance", "Vie au travail", "Bases d’argent"] },
        30: { name: "Les bases de la vie", highlights: ["Carrière", "Logement et argent", "Vie de famille"] },
        40: { name: "Équilibre travail-vie", highlights: ["Changement de carrière", "Éducation des enfants", "Aide familiale"] },
        50: { name: "Un nouveau tournant", highlights: ["Retour à l’emploi", "Aide familiale", "Santé et retraite"] },
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
      allStagesSub: "Vom Jugendalter bis 70",
    },
    hero: {
      lead: "Schule und Weg, Arbeit und Unabhängigkeit, Familie und Gesundheit, und das Leben danach. Vom Jugendalter bis 70 baut Livon eine Lebensphasen-Plattform, die Information und Dienste für Lebenswechsel leichter findbar macht.",
    },
    core: {
      title: "Orientierung, Plan, Umsetzung.",
      lead: "Eine künftige Richtung. Life-AI-Beratung und Life-Planner-Speichern sind noch nicht verfügbar.",
    },
    connect: {
      title: "Wenn Hilfe nötig ist,\nverbinden sich Menschen und Dienste.",
      expertLead: "Künftige Richtung: Fachleute im relevanten Bereich finden.",
      servicesLead: "Künftige Richtung: Lebensdienste finden und vergleichen.",
      communityLead: "Ein künftiger Ort, um Erfahrung und Information zu teilen.",
    },
    sitCats: cats("Lernen und erster Schritt", "Unabhängigkeit und Alltag", "Wiedereinstieg und Karrierewechsel", "Familie und nächstes Kapitel", {
      study: "Aufnahme · Weg · erster Job",
      life: "Auszug · Heirat · erstes Kind",
      work: "Jobwechsel · Wiedereinstieg · Karrierewechsel",
      family: "Familienpflege · danach",
    }),
    knowGroups: groups("Lernen und Weg", "Arbeit und Geld", "Wohnen und Alltag", "Bindungen und Familie", "Nächstes Kapitel"),
    ages: {
      items: ages({
        10: { name: "Eine Zeit, die Zukunft zu erkunden", highlights: ["Schulleben", "Weg und Zulassung", "Vorbereitung aufs Erwachsenwerden"] },
        20: { name: "Ein neuer Start", highlights: ["Unabhängigkeit", "Arbeitsleben", "Geld-Grundlagen"] },
        30: { name: "Das Fundament des Lebens", highlights: ["Karriere", "Wohnen und Geld", "Familienleben"] },
        40: { name: "Balance von Arbeit und Leben", highlights: ["Karrierewechsel", "Bildung der Kinder", "Familienfürsorge"] },
        50: { name: "Eine neue Wende", highlights: ["Wiedereinstieg", "Familienpflege", "Gesundheit und Ruhestand"] },
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
      allStagesSub: "किशोरावस्था से 70 तक",
    },
    hero: {
      lead: "स्कूल और रास्ता, काम और स्वतंत्रता, परिवार और स्वास्थ्य, और काम के बाद का जीवन। किशोरावस्था से 70 तक Livon एक जीवन-चक्र मंच बना रहा है, ताकि जीवन के बदलाव में जरूरी जानकारी और सेवाएँ आसानी से मिल सकें।",
    },
    core: {
      title: "मार्गदर्शन, योजना, फिर करना।",
      lead: "भावी दिशा। Life AI सलाह और Life Planner सहेजना अभी उपलब्ध नहीं हैं।",
    },
    connect: {
      title: "जब मदद चाहिए,\nलोग और सेवाएँ जुड़ते हैं।",
      expertLead: "भावी दिशा: जरूरी क्षेत्र के विशेषज्ञ खोजना।",
      servicesLead: "भावी दिशा: जीवन सेवाएँ खोजना और तुलना करना।",
      communityLead: "अनुभव और जानकारी साझा करने की भावी जगह।",
    },
    sitCats: cats("पढ़ाई और पहली शुरुआत", "स्वतंत्रता और जीवन", "पुनः रोजगार और करियर मोड़", "परिवार और अगला अध्याय", {
      study: "प्रवेश · रास्ता · पहली नौकरी",
      life: "स्वतंत्रता · विवाह · पहला बच्चा",
      work: "नौकरी बदलना · पुनः रोजगार · करियर मोड़",
      family: "परिवार की देखभाल · अगला चरण",
    }),
    knowGroups: groups("पढ़ाई और रास्ता", "काम और धन", "घर और जीवन", "रिश्ते और परिवार", "अगला अध्याय"),
    ages: {
      items: ages({
        10: { name: "भविष्य खोजने का समय", highlights: ["स्कूल जीवन", "रास्ता और प्रवेश", "वयस्क तैयारी"] },
        20: { name: "एक नई शुरुआत", highlights: ["स्वतंत्रता", "कार्य जीवन", "पैसे की बुनियाद"] },
        30: { name: "जीवन की नींव", highlights: ["करियर", "आवास और धन", "पारिवारिक जीवन"] },
        40: { name: "काम और जीवन का संतुलन", highlights: ["करियर बदलाव", "बच्चों की शिक्षा", "परिवार की देखभाल"] },
        50: { name: "एक नया मोड़", highlights: ["पुनः रोजगार", "परिवार की देखभाल", "स्वास्थ्य और सेवानिवृत्ति"] },
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
      allStagesSub: "Remaja hingga 70-an",
    },
    hero: {
      lead: "Sekolah dan jalur, kerja dan kemandirian, keluarga dan kesehatan, dan hidup setelah kerja. Dari remaja hingga 70-an, Livon membangun platform siklus hidup agar informasi dan layanan untuk perubahan hidup lebih mudah ditemukan.",
    },
    core: {
      title: "Panduan, rencana, lalu tindakan.",
      lead: "Arah masa depan. Saran Life AI dan penyimpanan Life Planner belum tersedia.",
    },
    connect: {
      title: "Saat bantuan dibutuhkan,\norang dan layanan terhubung.",
      expertLead: "Arah masa depan: menemukan ahli di bidang yang relevan.",
      servicesLead: "Arah masa depan: mencari dan membandingkan layanan hidup.",
      communityLead: "Tempat masa depan untuk berbagi pengalaman dan informasi.",
    },
    sitCats: cats("Belajar dan langkah awal", "Kemandirian dan hidup", "Bekerja lagi dan perubahan karier", "Keluarga dan bab berikutnya", {
      study: "Masuk · jalur · kerja pertama",
      life: "Mandiri · menikah · anak pertama",
      work: "Pindah kerja · bekerja lagi · perubahan karier",
      family: "Perawatan keluarga · bab berikutnya",
    }),
    knowGroups: groups("Belajar dan jalur", "Kerja dan uang", "Rumah dan hidup", "Ikatan dan keluarga", "Bab berikutnya"),
    ages: {
      items: ages({
        10: { name: "Waktu menjajaki masa depan", highlights: ["Hidup sekolah", "Jalur dan masuk", "Persiapan dewasa"] },
        20: { name: "Awal yang baru", highlights: ["Kemandirian", "Kehidupan kerja", "Dasar uang"] },
        30: { name: "Fondasi hidup", highlights: ["Karier", "Hunian dan uang", "Hidup keluarga"] },
        40: { name: "Keseimbangan kerja-hidup", highlights: ["Pindah karier", "Pendidikan anak", "Perawatan keluarga"] },
        50: { name: "Belokan baru", highlights: ["Bekerja lagi", "Perawatan keluarga", "Kesehatan dan pensiun"] },
        60: { name: "Sehari-hari berikutnya", highlights: ["Belajar seumur hidup", "Komunitas", "Hidup setelah kerja"] },
        70: { name: "Hidup dengan caramu", highlights: ["Hidup digital", "Waktu luang dan ikatan", "Dukungan sehari-hari"] },
      }),
    },
  },
};
