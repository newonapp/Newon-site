/** Ongil detail i18n overlays merged onto EN. */

function pack(hero, why, services, how, expand, close, ui = {}) {
  return { ui, hero, why, services, how, expand, close };
}

const ja = pack(
  {
    kicker: "NEWON ONGIL",
    brandEn: "ONGIL",
    brandKo: "オンギル",
    titleHtml: "歳を重ねる日常にも、<br>あたたかいつながりを。",
    lead: "シニアの日常と必要なケア、家族の安心をつなぐ暮らしのプラットフォーム。",
    visualLine: "自分のペースで続く日常。必要なときに届くケア。",
    ctaMain: "オンギルを見る",
    ctaSub: "事業に関するお問い合わせ",
    status: "現在は事業紹介です。",
  },
  {
    kicker: "Why Ongil",
    title: "暮らしの助けが必要なとき、\nオンギルがともにあります。",
    body: [
      "歳を重ねると、暮らしに必要な情報やサービスが変わることがあります。",
      "健康、移動、食事、日常の暮らし、地域の活動など、必要な助けを別々の場所で探さなければならない不便が生じることがあります。",
      "家族も、どんなサービスが必要なのか、どこで探せばよいのか分かりにくいことがあります。",
      "オンギルは、そうした情報とサービスを一つの暮らしのプラットフォームで、より探しやすくつなげることを目指します。",
    ],
  },
  {
    kicker: "Core Services",
    title: "オンギルがつなぐ日常",
    lead: "暮らしの支援から健康とケア、家族、地域まで。必要なときに必要なサービスを見つけられるよう手伝います。",
    aiNote: "一人ひとりの状況に合う情報をより見つけやすくするため、案内機能を段階的に導入する計画です。",
    items: [
      {
        id: "daily",
        n: "01",
        name: "日常の暮らし支援",
        lead: "食事、移動、家事、暮らしの便利さなど、日常に必要な助けを探し、つなぐ領域です。",
        features: ["食事・暮らしの便利サービスの探索", "移動・外出に関する案内", "家事・日常生活支援の接続", "状況に合わせた暮らしの情報"],
      },
      {
        id: "care",
        n: "02",
        name: "健康とケア",
        lead: "健康に関する情報を確認し、必要なケアサービスを探し、つなぐ領域です。",
        features: ["健康・暮らし管理の情報案内", "ケアサービスの探索", "専門機関・提供者の情報", "状況に合わせたケアの接続"],
        note: "医療相談・診断・治療を直接提供しません。健康情報の案内とケア接続を中心に準備します。",
      },
      {
        id: "family",
        n: "03",
        name: "家族とのつながり",
        lead: "シニアと家族が必要な情報を共有し、コミュニケーションできるよう助ける領域です。",
        features: ["家族の会話", "必要な暮らし情報の共有", "ケアに関する予定と情報", "家族で必要なサービスを探す"],
        note: "ご本人の同意と選択を尊重します。健康・暮らしの情報が家族に自動共有されることはありません。",
      },
      {
        id: "local",
        n: "04",
        name: "地域の暮らし",
        lead: "住まいの地域を中心に、暮らしの情報と活動・サービスを探す領域です。",
        features: ["地域の福祉・暮らしサービス情報", "文化・余暇・趣味の探索", "地域コミュニティとプログラム案内", "近くの生活支援サービスの探索"],
      },
    ],
  },
  {
    kicker: "How it works",
    title: "必要な助けを見つける、\nよりやさしい方法",
    note: "今後の利用の流れの構想です。いま申し込める予約手続きではありません。",
    steps: [
      { n: "01", name: "必要な助けを選ぶ", body: "暮らし、健康とケア、家族、地域の暮らしから、いま必要な領域を選びます。" },
      { n: "02", name: "情報とサービスを探す", body: "選んだ領域と状況に合う情報・サービスを確認します。" },
      { n: "03", name: "内容を確認してつなぐ", body: "提供内容と利用条件を確認し、必要なサービスへつなぐことを目指します。" },
    ],
  },
  {
    kicker: "Business expansion",
    title: "日常から始めて、\nより広いつながりへ。",
    note: "未確定の提携、売上、利用者数、提供地域は表示しません。",
    stages: [
      { n: "01", name: "シニアの暮らし情報とサービスの探索", body: "シニアと家族が必要な暮らし情報とサービスを一つの場所で見つけやすい基盤をつくります。" },
      { n: "02", name: "地域サービスと専門機関の接続を広げる", body: "地域の生活支援、ケア提供者、専門機関とのつながりを段階的に広げる予定です。" },
      { n: "03", name: "家族連携と個別案内の高度化", body: "ご本人の選択と同意を前提に、家族の対話と情報共有を育て、一人ひとりの必要に合う探索体験を高めます。" },
      { n: "04", name: "総合的なシニア暮らしプラットフォームへ", body: "日常、ケア、地域の活動、暮らしのサービスをつなぐ総合プラットフォームへ発展させることを目指します。" },
    ],
  },
  {
    kicker: "ONGIL VISION",
    titleHtml: "より心地よい日常、<br>より確かなつながり。",
    lead: "オンギルは、シニアが自分の日常を主体的に続け、家族が必要なときにともにいられるよう、暮らしとケアのつながりを広げていきます。",
    ctaMain: "事業・協業に関するお問い合わせ",
    ctaSub: "Newonのほかの事業を見る",
  },
  {
    back: "ホームの Ongil 紹介へ",
    planned: "今後の利用の流れ",
    expandNote: "現在の運営状況ではなく、今後の事業拡張計画です。",
    conceptNote: "現在は事業紹介です。予約・決済・登録はまだつながっていません。",
    features: "主な方向",
  }
);

const es = pack(
  {
    kicker: "NEWON ONGIL",
    brandEn: "ONGIL",
    brandKo: "Ongil",
    titleHtml: "También en la vida que envejece,<br>una conexión cálida.",
    lead: "Una plataforma de vida que une el día a día de las personas mayores, el cuidado que necesitan y la tranquilidad de la familia.",
    visualLine: "Una vida que se sigue con autonomía; un cuidado que llega cuando hace falta.",
    ctaMain: "Conocer Ongil",
    ctaSub: "Consulta de negocio",
    status: "Esta página es una introducción al negocio.",
  },
  {
    kicker: "Why Ongil",
    title: "Cuando el día a día necesita una mano,\nOngil está.",
    body: [
      "Con los años, la información y los servicios que hace falta en la vida cotidiana pueden cambiar.",
      "Salud, desplazamiento, comidas, el hogar y actividades locales pueden exigir buscar ayuda en muchos sitios distintos.",
      "A las familias también les cuesta saber qué servicios hacen falta y dónde buscarlos.",
      "Ongil quiere facilitar explorar y conectar esa información y esos servicios en una sola plataforma de vida.",
    ],
  },
  {
    kicker: "Core Services",
    title: "La vida cotidiana que Ongil conecta",
    lead: "Del apoyo diario a la salud y el cuidado, la familia y la comunidad local. Ayudar a encontrar el servicio necesario, cuando se necesita.",
    aiNote: "Planeamos introducir de forma gradual una guía más personalizada, para que la información encaje mejor con cada situación.",
    items: [
      {
        id: "daily",
        n: "01",
        name: "Apoyo a la vida diaria",
        lead: "Explorar y conectar ayuda para comidas, desplazarse, las tareas del hogar y la comodidad cotidiana.",
        features: ["Explorar comidas y servicios de conveniencia", "Orientación para desplazarse y salir", "Conectar apoyo doméstico y cotidiano", "Información de vida según la situación"],
      },
      {
        id: "care",
        n: "02",
        name: "Salud y cuidado",
        lead: "Consultar información de salud y explorar y conectar los servicios de cuidado necesarios.",
        features: ["Información de salud y gestión cotidiana", "Explorar servicios de cuidado", "Datos de organizaciones y proveedores", "Conectar el cuidado que encaja con la situación"],
        note: "Ongil no ofrece consejo médico, diagnóstico ni tratamiento. Preparamos información de salud y conexiones de cuidado.",
      },
      {
        id: "family",
        n: "03",
        name: "Conexión familiar",
        lead: "Ayudar a que las personas mayores y las familias compartan la información que necesitan y se comuniquen.",
        features: ["Conversación familiar", "Compartir información cotidiana necesaria", "Ver fechas y notas de cuidado", "Explorar servicios juntos"],
        note: "Se respeta el consentimiento y la elección de la persona. La información de salud y de vida no se comparte automáticamente con la familia.",
      },
      {
        id: "local",
        n: "04",
        name: "Vida local",
        lead: "Explorar información, actividades y servicios alrededor de donde se vive.",
        features: ["Información local de bienestar y vida", "Cultura, ocio y aficiones", "Comunidad local y programas", "Apoyo cotidiano cercano"],
      },
    ],
  },
  {
    kicker: "How it works",
    title: "Una forma más fácil\nde encontrar la ayuda que hace falta",
    note: "Es un recorrido previsto, no un flujo de reserva en vivo.",
    steps: [
      { n: "01", name: "Elegir la ayuda necesaria", body: "Elegir vida diaria, salud y cuidado, familia o vida local." },
      { n: "02", name: "Explorar información y servicios", body: "Ver información y servicios que encajan con el área elegida y la situación." },
      { n: "03", name: "Revisar y conectar", body: "El objetivo es revisar qué ofrece un servicio y cómo se usa, y conectar con la ayuda necesaria." },
    ],
  },
  {
    kicker: "Business expansion",
    title: "Empezar por la vida cotidiana,\nluego una conexión más amplia.",
    note: "No se muestran socios, ingresos, usuarios ni zonas de servicio no confirmados.",
    stages: [
      { n: "01", name: "Encontrar información y servicios de vida", body: "Construir una base para que las personas mayores y las familias encuentren en un solo lugar la información y los servicios que necesitan." },
      { n: "02", name: "Ampliar servicios locales y enlaces especializados", body: "Planeamos ampliar poco a poco las conexiones con apoyo local, cuidadores y organizaciones especializadas." },
      { n: "03", name: "Vínculos familiares y guía más personal", body: "Con el consentimiento de la persona, desarrollar la conversación familiar y el intercambio de información, y acercar la búsqueda a cada necesidad." },
      { n: "04", name: "Una plataforma integral de vida sénior", body: "El objetivo es crecer hacia una plataforma que una vida diaria, cuidado, actividad local y servicios de vida." },
    ],
  },
  {
    kicker: "ONGIL VISION",
    titleHtml: "Un día más cómodo,<br>una conexión más firme.",
    lead: "Ongil amplía el vínculo entre la vida y el cuidado para que las personas mayores sigan dirigiendo su día, y las familias puedan estar cuando importa.",
    ctaMain: "Consulta de negocio y colaboración",
    ctaSub: "Ver otros negocios de Newon",
  },
  {
    back: "Volver a Ongil en la portada",
    planned: "Recorrido previsto",
    expandNote: "Un plan de expansión futuro, no una operación actual.",
    conceptNote: "Esta página es una introducción al negocio. Reserva, pago y registro aún no están conectados.",
    features: "Dirección",
  }
);

const fr = pack(
  {
    kicker: "NEWON ONGIL",
    brandEn: "ONGIL",
    brandKo: "Ongil",
    titleHtml: "Même dans les années qui passent,<br>une connexion chaleureuse.",
    lead: "Une plateforme de vie qui relie le quotidien des aînés, l’accompagnement dont ils ont besoin et la sérénité des familles.",
    visualLine: "Une vie menée à son rythme — un accompagnement qui rejoint au bon moment.",
    ctaMain: "Découvrir Ongil",
    ctaSub: "Demande professionnelle",
    status: "Cette page est une présentation de l’activité.",
  },
  {
    kicker: "Why Ongil",
    title: "Quand le quotidien a besoin d’un coup de main,\nOngil est là.",
    body: [
      "En avançant en âge, les informations et services utiles au quotidien peuvent changer.",
      "Santé, déplacements, repas, vie à la maison et activités locales peuvent obliger à chercher de l’aide à plusieurs endroits.",
      "Les familles peuvent aussi peiner à savoir quels services sont nécessaires, et où les trouver.",
      "Ongil vise à faciliter l’exploration et la mise en lien de ces informations et services sur une seule plateforme de vie.",
    ],
  },
  {
    kicker: "Core Services",
    title: "Le quotidien qu’Ongil relie",
    lead: "Du soutien au quotidien à la santé et au care, à la famille et à la vie locale. Aider à trouver le service utile, au moment utile.",
    aiNote: "Nous prévoyons d’introduire progressivement un guidage plus personnalisé, pour que l’information corresponde mieux à chaque situation.",
    items: [
      {
        id: "daily",
        n: "01",
        name: "Soutien au quotidien",
        lead: "Explorer et relier l’aide pour les repas, les déplacements, le foyer et les commodités du jour.",
        features: ["Explorer repas et services du quotidien", "Repères pour se déplacer et sortir", "Relier l’aide ménagère et de vie", "Informations de vie selon la situation"],
      },
      {
        id: "care",
        n: "02",
        name: "Santé et accompagnement",
        lead: "Consulter des informations de santé, explorer et relier les services d’accompagnement nécessaires.",
        features: ["Informations santé et gestion du quotidien", "Explorer les services d’accompagnement", "Informations sur organismes et prestataires", "Relier l’accompagnement adapté à la situation"],
        note: "Ongil ne fournit pas de conseil médical, de diagnostic ni de traitement. Nous préparons l’information santé et les mises en lien.",
      },
      {
        id: "family",
        n: "03",
        name: "Lien familial",
        lead: "Aider les aînés et les familles à partager les informations utiles et à rester en contact.",
        features: ["Conversation familiale", "Partage d’informations de vie utiles", "Dates et notes d’accompagnement", "Explorer des services ensemble"],
        note: "Le consentement et le choix de la personne priment. Les informations de santé et de vie ne sont pas partagées automatiquement avec la famille.",
      },
      {
        id: "local",
        n: "04",
        name: "Vie locale",
        lead: "Explorer informations, activités et services autour du lieu de vie.",
        features: ["Informations locales de bien-être et de vie", "Culture, loisirs et hobbies", "Communauté locale et programmes", "Soutien de proximité"],
      },
    ],
  },
  {
    kicker: "How it works",
    title: "Une façon plus simple\nde trouver l’aide nécessaire",
    note: "Il s’agit d’un parcours prévu, pas d’un flux de réservation en ligne.",
    steps: [
      { n: "01", name: "Choisir l’aide nécessaire", body: "Choisir le quotidien, la santé et le care, la famille ou la vie locale." },
      { n: "02", name: "Explorer informations et services", body: "Voir les informations et services qui correspondent au domaine choisi et à la situation." },
      { n: "03", name: "Vérifier et relier", body: "L’objectif est de vérifier l’offre et les conditions, puis de relier vers l’aide utile." },
    ],
  },
  {
    kicker: "Business expansion",
    title: "Commencer par le quotidien,\npuis un lien plus large.",
    note: "Partenaires, revenus, effectifs et zones de service non confirmés ne sont pas affichés.",
    stages: [
      { n: "01", name: "Trouver informations et services de vie", body: "Construire une base pour que aînés et familles trouvent au même endroit les informations et services dont ils ont besoin." },
      { n: "02", name: "Élargir services locaux et liens spécialisés", body: "Nous prévoyons d’élargir progressivement les liens avec le soutien local, les aidants et les organismes spécialisés." },
      { n: "03", name: "Liens familiaux et guidage plus personnel", body: "Avec le consentement de la personne, développer la conversation familiale et le partage d’information, et rapprocher la recherche de chaque besoin." },
      { n: "04", name: "Une plateforme complète de vie des aînés", body: "L’objectif est de grandir vers une plateforme qui relie quotidien, care, activité locale et services de vie." },
    ],
  },
  {
    kicker: "ONGIL VISION",
    titleHtml: "Un quotidien plus serein,<br>un lien plus solide.",
    lead: "Ongil élargit le lien entre la vie et le care pour que les aînés continuent de mener leurs journées, et que les familles soient là quand c’est important.",
    ctaMain: "Demande professionnelle et partenariat",
    ctaSub: "Voir les autres activités Newon",
  },
  {
    back: "Retour à Ongil sur l’accueil",
    planned: "Parcours prévu",
    expandNote: "Un plan d’expansion futur, pas une activité actuelle.",
    conceptNote: "Cette page est une présentation. Réservation, paiement et inscription ne sont pas encore reliés.",
    features: "Direction",
  }
);

const de = pack(
  {
    kicker: "NEWON ONGIL",
    brandEn: "ONGIL",
    brandKo: "Ongil",
    titleHtml: "Auch im Alltag der Jahre<br>eine warme Verbindung.",
    lead: "Eine Lebensplattform, die den Alltag älterer Menschen, die nötige Betreuung und die Ruhe der Familie verbindet.",
    visualLine: "Ein selbst geführter Alltag — Betreuung, die dazukommt, wenn sie gebraucht wird.",
    ctaMain: "Ongil entdecken",
    ctaSub: "Geschäftsanfrage",
    status: "Diese Seite ist eine Geschäftsvorstellung.",
  },
  {
    kicker: "Why Ongil",
    title: "Wenn der Alltag eine Hand braucht,\nist Ongil da.",
    body: [
      "Mit den Jahren können sich Informationen und Dienste ändern, die der Alltag braucht.",
      "Gesundheit, Wege, Mahlzeiten, das Zuhause und lokale Aktivitäten können bedeuten, Hilfe an vielen getrennten Stellen zu suchen.",
      "Familien fällt es oft schwer zu wissen, welche Dienste nötig sind und wo man sie findet.",
      "Ongil will es leichter machen, diese Informationen und Dienste auf einer Lebensplattform zu finden und zu verbinden.",
    ],
  },
  {
    kicker: "Core Services",
    title: "Der Alltag, den Ongil verbindet",
    lead: "Von Alltagsunterstützung über Gesundheit und Betreuung bis zu Familie und Nachbarschaft. Hilfe finden, wenn sie gebraucht wird.",
    aiNote: "Wir planen schrittweise eine passendere Orientierung, damit Informationen zur jeweiligen Situation leichter zu finden sind.",
    items: [
      {
        id: "daily",
        n: "01",
        name: "Alltagsunterstützung",
        lead: "Hilfe zu Mahlzeiten, Wegen, Haushalt und Alltagskomfort finden und verbinden.",
        features: ["Mahlzeiten und Alltagsdienste finden", "Hinweise zu Wegen und Unternehmungen", "Haushalt und Alltagshilfe verbinden", "Lebensinformationen passend zur Situation"],
      },
      {
        id: "care",
        n: "02",
        name: "Gesundheit und Betreuung",
        lead: "Gesundheitsbezogene Informationen prüfen und benötigte Betreuungsdienste finden und verbinden.",
        features: ["Informationen zu Gesundheit und Alltag", "Betreuungsdienste entdecken", "Angaben zu Einrichtungen und Anbietern", "Betreuung passend zur Situation verbinden"],
        note: "Ongil leistet keine medizinische Beratung, Diagnose oder Behandlung. Wir bereiten Gesundheitsinformationen und Betreuungsverbindungen vor.",
      },
      {
        id: "family",
        n: "03",
        name: "Familienverbindung",
        lead: "Ältere Menschen und Familien dabei unterstützen, nötige Informationen zu teilen und in Kontakt zu bleiben.",
        features: ["Familiengespräch", "Nötige Alltagsinformationen teilen", "Betreuungstermine und Notizen", "Dienste gemeinsam finden"],
        note: "Einwilligung und Wahl der Person stehen vorn. Gesundheits- und Lebensinformationen werden nicht automatisch mit der Familie geteilt.",
      },
      {
        id: "local",
        n: "04",
        name: "Lokales Leben",
        lead: "Informationen, Aktivitäten und Dienste rund um den Wohnort entdecken.",
        features: ["Lokale Wohlfahrt und Lebensdienste", "Kultur, Freizeit und Hobbys", "Lokale Gemeinschaft und Programme", "Nahe Alltagsunterstützung"],
      },
    ],
  },
  {
    kicker: "How it works",
    title: "Ein einfacherer Weg,\ndie nötige Hilfe zu finden",
    note: "Ein geplanter Ablauf, kein live Buchungsprozess.",
    steps: [
      { n: "01", name: "Die nötige Hilfe wählen", body: "Alltag, Gesundheit und Betreuung, Familie oder lokales Leben wählen." },
      { n: "02", name: "Informationen und Dienste ansehen", body: "Informationen und Dienste sehen, die zum gewählten Bereich und zur Situation passen." },
      { n: "03", name: "Prüfen und verbinden", body: "Ziel ist, Angebot und Bedingungen zu prüfen und dann zur nötigen Hilfe zu verbinden." },
    ],
  },
  {
    kicker: "Business expansion",
    title: "Beim Alltag beginnen,\ndann eine weitere Verbindung.",
    note: "Unbestätigte Partner, Umsätze, Nutzerzahlen und Servicegebiete werden nicht gezeigt.",
    stages: [
      { n: "01", name: "Lebensinformationen und Dienste finden", body: "Eine Basis schaffen, damit ältere Menschen und Familien nötige Informationen und Dienste an einem Ort finden." },
      { n: "02", name: "Lokale Dienste und Fachstellen erweitern", body: "Wir planen, Verbindungen zu lokaler Unterstützung, Betreuenden und Fachstellen schrittweise zu erweitern." },
      { n: "03", name: "Familienbezug und persönlichere Orientierung", body: "Mit Einwilligung der Person Familiengespräch und Informationsaustausch entwickeln und die Suche näher an den Bedarf bringen." },
      { n: "04", name: "Eine umfassende Senioren-Lebensplattform", body: "Ziel ist eine Plattform, die Alltag, Betreuung, lokale Aktivität und Lebensdienste verbindet." },
    ],
  },
  {
    kicker: "ONGIL VISION",
    titleHtml: "Ein ruhigerer Alltag,<br>eine festere Verbindung.",
    lead: "Ongil weitet die Verbindung von Leben und Betreuung, damit ältere Menschen ihren Tag selbst führen und Familien da sein können, wenn es zählt.",
    ctaMain: "Geschäft und Partnerschaft",
    ctaSub: "Weitere Newon-Geschäfte",
  },
  {
    back: "Zurück zu Ongil auf der Startseite",
    planned: "Geplanter Ablauf",
    expandNote: "Ein künftiger Ausbauplan, kein aktueller Betrieb.",
    conceptNote: "Diese Seite ist eine Geschäftsvorstellung. Buchung, Zahlung und Anmeldung sind noch nicht verbunden.",
    features: "Richtung",
  }
);

const pt = pack(
  {
    kicker: "NEWON ONGIL",
    brandEn: "ONGIL",
    brandKo: "Ongil",
    titleHtml: "Também no cotidiano que envelhece,<br>uma conexão afetuosa.",
    lead: "Uma plataforma de vida que une o dia a dia de pessoas mais velhas, o cuidado de que precisam e a tranquilidade da família.",
    visualLine: "Uma vida conduzida por conta própria — cuidado que chega quando é preciso.",
    ctaMain: "Conhecer a Ongil",
    ctaSub: "Contato comercial",
    status: "Esta página é uma apresentação do negócio.",
  },
  {
    kicker: "Why Ongil",
    title: "Quando o cotidiano precisa de uma mão,\na Ongil está.",
    body: [
      "Com os anos, as informações e os serviços de que a vida precisa podem mudar.",
      "Saúde, deslocamento, refeições, a casa e atividades locais podem exigir buscar ajuda em muitos lugares separados.",
      "As famílias também podem ter dificuldade de saber quais serviços são necessários e onde procurá-los.",
      "A Ongil quer facilitar explorar e conectar essas informações e serviços em uma só plataforma de vida.",
    ],
  },
  {
    kicker: "Core Services",
    title: "O cotidiano que a Ongil conecta",
    lead: "Do apoio diário à saúde e ao cuidado, à família e à comunidade local. Ajudar a encontrar o serviço necessário, na hora necessária.",
    aiNote: "Planejamos introduzir aos poucos uma orientação mais personalizada, para que a informação combine melhor com cada situação.",
    items: [
      {
        id: "daily",
        n: "01",
        name: "Apoio à vida diária",
        lead: "Explorar e conectar ajuda para refeições, deslocamento, tarefas de casa e conveniência do dia.",
        features: ["Explorar refeições e serviços do cotidiano", "Orientação para se deslocar e sair", "Conectar apoio doméstico e diário", "Informação de vida conforme a situação"],
      },
      {
        id: "care",
        n: "02",
        name: "Saúde e cuidado",
        lead: "Ver informações de saúde e explorar e conectar os serviços de cuidado necessários.",
        features: ["Informação de saúde e gestão do dia", "Explorar serviços de cuidado", "Dados de organizações e prestadores", "Conectar o cuidado que combina com a situação"],
        note: "A Ongil não oferece aconselhamento médico, diagnóstico nem tratamento. Preparamos informação de saúde e conexões de cuidado.",
      },
      {
        id: "family",
        n: "03",
        name: "Conexão familiar",
        lead: "Ajudar pessoas mais velhas e famílias a compartilhar a informação necessária e a se comunicar.",
        features: ["Conversa familiar", "Compartilhar informação cotidiana necessária", "Ver datas e notas de cuidado", "Explorar serviços juntos"],
        note: "O consentimento e a escolha da pessoa vêm primeiro. Informação de saúde e de vida não é compartilhada automaticamente com a família.",
      },
      {
        id: "local",
        n: "04",
        name: "Vida local",
        lead: "Explorar informação, atividades e serviços em torno de onde se vive.",
        features: ["Informação local de bem-estar e vida", "Cultura, lazer e hobbies", "Comunidade local e programas", "Apoio cotidiano próximo"],
      },
    ],
  },
  {
    kicker: "How it works",
    title: "Um jeito mais fácil\nde encontrar a ajuda necessária",
    note: "É um percurso previsto, não um fluxo de reserva ao vivo.",
    steps: [
      { n: "01", name: "Escolher a ajuda necessária", body: "Escolher vida diária, saúde e cuidado, família ou vida local." },
      { n: "02", name: "Explorar informação e serviços", body: "Ver informação e serviços que combinam com a área escolhida e a situação." },
      { n: "03", name: "Revisar e conectar", body: "O objetivo é revisar o que o serviço oferece e como funciona, e então conectar à ajuda necessária." },
    ],
  },
  {
    kicker: "Business expansion",
    title: "Começar pelo cotidiano,\ndepois uma conexão mais ampla.",
    note: "Parceiros, receita, usuários e áreas de serviço não confirmados não são mostrados.",
    stages: [
      { n: "01", name: "Encontrar informação e serviços de vida", body: "Construir uma base para que pessoas mais velhas e famílias encontrem num só lugar a informação e os serviços de que precisam." },
      { n: "02", name: "Ampliar serviços locais e vínculos especializados", body: "Planejamos ampliar aos poucos as conexões com apoio local, cuidadores e organizações especializadas." },
      { n: "03", name: "Vínculos familiares e orientação mais pessoal", body: "Com o consentimento da pessoa, desenvolver a conversa familiar e o compartilhamento de informação, e aproximar a busca de cada necessidade." },
      { n: "04", name: "Uma plataforma completa de vida sênior", body: "O objetivo é crescer para uma plataforma que una cotidiano, cuidado, atividade local e serviços de vida." },
    ],
  },
  {
    kicker: "ONGIL VISION",
    titleHtml: "Um dia mais confortável,<br>uma conexão mais firme.",
    lead: "A Ongil amplia o vínculo entre viver e cuidar para que pessoas mais velhas sigam conduzindo o próprio dia, e as famílias possam estar quando importa.",
    ctaMain: "Contato comercial e parceria",
    ctaSub: "Ver outros negócios da Newon",
  },
  {
    back: "Voltar à Ongil na página inicial",
    planned: "Percurso previsto",
    expandNote: "Um plano de expansão futuro, não uma operação atual.",
    conceptNote: "Esta página é uma apresentação. Reserva, pagamento e cadastro ainda não estão conectados.",
    features: "Direção",
  }
);

const hi = pack(
  {
    kicker: "NEWON ONGIL",
    brandEn: "ONGIL",
    brandKo: "Ongil",
    titleHtml: "बढ़ते वर्षों के रोजमर्रा में भी<br>एक गर्म जोड़ाव।",
    lead: "एक जीवन मंच जो वरिष्ठों के दिन, ज़रूरी देखभाल और परिवार की राहत को जोड़ता है।",
    visualLine: "अपनी गति से चलता जीवन — ज़रूरत पड़ने पर जुड़ती देखभाल।",
    ctaMain: "ओंगिल देखें",
    ctaSub: "व्यवसाय पूछताछ",
    status: "यह पृष्ठ व्यवसाय का परिचय है।",
  },
  {
    kicker: "Why Ongil",
    title: "जब रोजमर्रा को हाथ चाहिए,\nओंगिल साथ है।",
    body: [
      "उम्र के साथ, रोज़मर्रा की जानकारी और सेवाएँ बदल सकती हैं।",
      "स्वास्थ्य, आना-जाना, भोजन, घर और स्थानीय गतिविधियाँ कई अलग जगहों पर मदद ढूँढने जैसी लग सकती हैं।",
      "परिवारों को भी यह पता लगाना कठिन हो सकता है कि कौन-सी सेवा चाहिए और कहाँ देखें।",
      "ओंगिल का लक्ष्य है कि यह जानकारी और सेवाएँ एक जीवन मंच पर आसानी से खोजे और जोड़े जा सकें।",
    ],
  },
  {
    kicker: "Core Services",
    title: "ओंगिल जो रोजमर्रा जोड़ता है",
    lead: "रोज़मर्रा की मदद से स्वास्थ्य और देखभाल, परिवार और स्थानीय समुदाय तक। ज़रूरत के समय ज़रूरी सेवा खोजने में मदद।",
    aiNote: "हम चरणबद्ध रूप से ऐसी मार्गदर्शिका लाने की योजना रखते हैं जिससे हर स्थिति के अनुकूल जानकारी आसान हो।",
    items: [
      {
        id: "daily",
        n: "01",
        name: "रोज़मर्रा की मदद",
        lead: "भोजन, आना-जाना, घर के काम और दिन की सुविधा के लिए मदद खोजना और जोड़ना।",
        features: ["भोजन और सुविधा सेवाएँ खोजना", "आना-जाना और बाहर जाने की जानकारी", "घर और रोज़मर्रा की मदद जोड़ना", "स्थिति के अनुसार जीवन जानकारी"],
      },
      {
        id: "care",
        n: "02",
        name: "स्वास्थ्य और देखभाल",
        lead: "स्वास्थ्य संबंधी जानकारी देखना, और ज़रूरी देखभाल सेवाएँ खोजना व जोड़ना।",
        features: ["स्वास्थ्य और दिन-प्रबंधन जानकारी", "देखभाल सेवाएँ खोजना", "संस्थाओं और प्रदाताओं की जानकारी", "स्थिति के अनुकूल देखभाल जोड़ना"],
        note: "ओंगिल चिकित्सा सलाह, निदान या उपचार नहीं देता। हम स्वास्थ्य जानकारी और देखभाल जोड़ने पर तैयारी कर रहे हैं।",
      },
      {
        id: "family",
        n: "03",
        name: "पारिवारिक जुड़ाव",
        lead: "वरिष्ठों और परिवारों को ज़रूरी जानकारी साझा करने और संवाद में मदद।",
        features: ["पारिवारिक बातचीत", "ज़रूरी जीवन जानकारी साझा करना", "देखभाल की तारीखें और नोट्स", "साथ मिलकर सेवाएँ खोजना"],
        note: "व्यक्ति की सहमति और चुनाव पहले हैं। स्वास्थ्य और जीवन जानकारी परिवार के साथ अपने आप साझा नहीं होती।",
      },
      {
        id: "local",
        n: "04",
        name: "स्थानीय जीवन",
        lead: "रहने की जगह के आसपास जानकारी, गतिविधियाँ और सेवाएँ खोजना।",
        features: ["स्थानीय कल्याण और जीवन सेवाएँ", "संस्कृति, अवकाश और शौक", "स्थानीय समुदाय और कार्यक्रम", "पास की रोज़मर्रा मदद"],
      },
    ],
  },
  {
    kicker: "How it works",
    title: "ज़रूरी मदद खोजने का\nएक आसान तरीका",
    note: "यह एक नियोजित यात्रा है, लाइव बुकिंग नहीं।",
    steps: [
      { n: "01", name: "ज़रूरी मदद चुनें", body: "रोज़मर्रा, स्वास्थ्य और देखभाल, परिवार या स्थानीय जीवन चुनें।" },
      { n: "02", name: "जानकारी और सेवाएँ देखें", body: "चुने हुए क्षेत्र और स्थिति के अनुकूल जानकारी व सेवाएँ देखें।" },
      { n: "03", name: "जाँचें और जोड़ें", body: "लक्ष्य है सेवा की बातें और शर्तें देखना, फिर ज़रूरी मदद से जोड़ना।" },
    ],
  },
  {
    kicker: "Business expansion",
    title: "रोज़मर्रा से शुरू करें,\nफिर व्यापक जुड़ाव।",
    note: "अनिश्चित साझेदार, आय, उपयोगकर्ता संख्या और सेवा क्षेत्र नहीं दिखाए जाते।",
    stages: [
      { n: "01", name: "जीवन जानकारी और सेवाएँ खोजना", body: "एक आधार बनाना ताकि वरिष्ठ और परिवार एक जगह ज़रूरी जानकारी व सेवाएँ पा सकें।" },
      { n: "02", name: "स्थानीय सेवाएँ और विशेषज्ञ लिंक बढ़ाना", body: "हम स्थानीय सहायता, देखभाल प्रदाताओं और विशेषज्ञ संस्थाओं से जुड़ाव चरणबद्ध बढ़ाने की योजना रखते हैं।" },
      { n: "03", name: "पारिवारिक लिंक और अधिक व्यक्तिगत मार्गदर्शन", body: "व्यक्ति की सहमति से पारिवारिक बातचीत और जानकारी साझा करना बढ़ाना, और खोज को हर ज़रूरत के करीब लाना।" },
      { n: "04", name: "पूर्ण वरिष्ठ जीवन मंच", body: "लक्ष्य है रोज़मर्रा, देखभाल, स्थानीय गतिविधि और जीवन सेवाओं को जोड़ने वाला मंच बनना।" },
    ],
  },
  {
    kicker: "ONGIL VISION",
    titleHtml: "अधिक सहज दिन,<br>अधिक स्थिर जुड़ाव।",
    lead: "ओंगिल जीवन और देखभाल का संबंध बढ़ाता है ताकि वरिष्ठ अपना दिन स्वयं चला सकें, और परिवार ज़रूरत के समय साथ हो।",
    ctaMain: "व्यवसाय और साझेदारी पूछताछ",
    ctaSub: "Newon के अन्य व्यवसाय देखें",
  },
  {
    back: "होमपेज पर Ongil पर वापस",
    planned: "नियोजित यात्रा",
    expandNote: "भविष्य की विस्तार योजना, वर्तमान संचालन नहीं।",
    conceptNote: "यह पृष्ठ व्यवसाय का परिचय है। बुकिंग, भुगतान और साइन-अप अभी जुड़े नहीं हैं।",
    features: "दिशा",
  }
);

const id = pack(
  {
    kicker: "NEWON ONGIL",
    brandEn: "ONGIL",
    brandKo: "Ongil",
    titleHtml: "Juga di hari-hari yang bertambah usia,<br>hubungan yang hangat.",
    lead: "Platform kehidupan yang menghubungkan hari-hari senior, perawatan yang dibutuhkan, dan ketenangan keluarga.",
    visualLine: "Hidup yang dijalani sendiri — perawatan yang bergabung saat dibutuhkan.",
    ctaMain: "Jelajahi Ongil",
    ctaSub: "Pertanyaan bisnis",
    status: "Halaman ini adalah pengantar bisnis.",
  },
  {
    kicker: "Why Ongil",
    title: "Saat hari-hari butuh uluran tangan,\nOngil ada.",
    body: [
      "Seiring usia, informasi dan layanan yang dibutuhkan kehidupan sehari-hari bisa berubah.",
      "Kesehatan, perjalanan, makan, rumah, dan kegiatan lokal bisa berarti mencari bantuan di banyak tempat terpisah.",
      "Keluarga juga bisa sulit mengetahui layanan apa yang dibutuhkan, dan di mana mencarinya.",
      "Ongil bertujuan memudahkan menelusuri dan menghubungkan informasi serta layanan itu dalam satu platform kehidupan.",
    ],
  },
  {
    kicker: "Core Services",
    title: "Hari-hari yang dihubungkan Ongil",
    lead: "Dari dukungan sehari-hari ke kesehatan dan perawatan, keluarga, dan komunitas lokal. Membantu menemukan layanan yang dibutuhkan, saat dibutuhkan.",
    aiNote: "Kami berencana memperkenalkan panduan yang lebih sesuai, tahap demi tahap, agar informasi lebih mudah ditemukan.",
    items: [
      {
        id: "daily",
        n: "01",
        name: "Dukungan hidup sehari-hari",
        lead: "Menelusuri dan menghubungkan bantuan untuk makan, bepergian, rumah tangga, dan kenyamanan hari-hari.",
        features: ["Menemukan layanan makan dan kenyamanan", "Panduan bepergian dan keluar rumah", "Menghubungkan dukungan rumah tangga", "Informasi hidup sesuai situasi"],
      },
      {
        id: "care",
        n: "02",
        name: "Kesehatan dan perawatan",
        lead: "Memeriksa informasi kesehatan, serta menelusuri dan menghubungkan layanan perawatan yang dibutuhkan.",
        features: ["Informasi kesehatan dan pengelolaan hari", "Menelusuri layanan perawatan", "Informasi lembaga dan penyedia", "Menghubungkan perawatan yang sesuai situasi"],
        note: "Ongil tidak memberi nasihat medis, diagnosis, atau pengobatan. Kami menyiapkan informasi kesehatan dan koneksi perawatan.",
      },
      {
        id: "family",
        n: "03",
        name: "Koneksi keluarga",
        lead: "Membantu senior dan keluarga berbagi informasi yang dibutuhkan dan tetap terhubung.",
        features: ["Percakapan keluarga", "Berbagi informasi hidup yang dibutuhkan", "Melihat tanggal dan catatan perawatan", "Menelusuri layanan bersama"],
        note: "Persetujuan dan pilihan orang yang bersangkutan diutamakan. Informasi kesehatan dan hidup tidak dibagikan otomatis kepada keluarga.",
      },
      {
        id: "local",
        n: "04",
        name: "Kehidupan lokal",
        lead: "Menelusuri informasi, kegiatan, dan layanan di sekitar tempat tinggal.",
        features: ["Informasi kesejahteraan dan layanan hidup lokal", "Budaya, rekreasi, dan hobi", "Komunitas lokal dan program", "Dukungan hidup di dekat sini"],
      },
    ],
  },
  {
    kicker: "How it works",
    title: "Cara yang lebih mudah\nmenemukan bantuan yang dibutuhkan",
    note: "Ini alur yang direncanakan, bukan pemesanan langsung.",
    steps: [
      { n: "01", name: "Pilih bantuan yang dibutuhkan", body: "Pilih hidup sehari-hari, kesehatan dan perawatan, keluarga, atau kehidupan lokal." },
      { n: "02", name: "Telusuri informasi dan layanan", body: "Lihat informasi dan layanan yang sesuai area yang dipilih dan situasinya." },
      { n: "03", name: "Tinjau dan hubungkan", body: "Tujuannya meninjau apa yang ditawarkan layanan dan cara kerjanya, lalu menghubungkan ke bantuan yang dibutuhkan." },
    ],
  },
  {
    kicker: "Business expansion",
    title: "Mulai dari hari-hari,\nlalu hubungan yang lebih luas.",
    note: "Mitra, pendapatan, jumlah pengguna, dan wilayah layanan yang belum dikonfirmasi tidak ditampilkan.",
    stages: [
      { n: "01", name: "Menemukan informasi dan layanan hidup", body: "Membangun dasar agar senior dan keluarga dapat menemukan informasi dan layanan yang dibutuhkan di satu tempat." },
      { n: "02", name: "Memperluas layanan lokal dan tautan spesialis", body: "Kami berencana memperluas koneksi dengan dukungan lokal, penyedia perawatan, dan lembaga spesialis secara bertahap." },
      { n: "03", name: "Tautan keluarga dan panduan yang lebih personal", body: "Dengan persetujuan orang yang bersangkutan, mengembangkan percakapan keluarga dan berbagi informasi, serta mendekatkan pencarian pada setiap kebutuhan." },
      { n: "04", name: "Platform kehidupan senior yang utuh", body: "Tujuannya tumbuh menjadi platform yang menghubungkan hidup sehari-hari, perawatan, kegiatan lokal, dan layanan hidup." },
    ],
  },
  {
    kicker: "ONGIL VISION",
    titleHtml: "Hari yang lebih nyaman,<br>hubungan yang lebih kokoh.",
    lead: "Ongil memperluas tautan antara hidup dan perawatan agar senior tetap memimpin harinya sendiri, dan keluarga bisa ada saat itu penting.",
    ctaMain: "Pertanyaan bisnis dan kemitraan",
    ctaSub: "Lihat bisnis Newon lainnya",
  },
  {
    back: "Kembali ke Ongil di beranda",
    planned: "Alur yang direncanakan",
    expandNote: "Rencana ekspansi masa depan, bukan operasi saat ini.",
    conceptNote: "Halaman ini adalah pengantar bisnis. Pemesanan, pembayaran, dan pendaftaran belum terhubung.",
    features: "Arah",
  }
);

export const ONGIL_I18N = {
  ja,
  es,
  "pt-br": pt,
  fr,
  de,
  hi,
  id,
};
