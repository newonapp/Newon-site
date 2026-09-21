/** First-experience / life-change / three-direction overlays merged onto EN. */

function scope(ui, pillars, first, changes) {
  return { ui, pillars, first, changes };
}

const ja = scope(
  {
    pillarsNote: "この三つは別アプリや別ブランドではなく、一つの Life Stage プラットフォームの中で広げていく事業領域です。",
    firstNote: "次の八つの分野は今後の事業拡張計画です。いま使える機能や申込画面ではありません。",
    changeNote: "人生の変化は今後の拡張計画です。別の実行画面や申込機能ではありません。",
  },
  {
    kicker: "Life Stage scope",
    title: "一つのプラットフォームで、\n三つに広げていきます。",
    lead: "年代別のライフサイクル、人生の初めて、人生の変化を、一つの Life Stage のなかでつなぎます。",
    items: [
      { n: "01", name: "年代別ライフサイクル", lead: "10代から70代まで、各段階に必要な暮らしの情報とサービスをつなぎます。" },
      { n: "02", name: "人生の初めて", lead: "初めての大人、就職、経済活動、投資、自立、結婚、育児など、人生で初めて経験するすべての瞬間を支えます。", planned: true },
      { n: "03", name: "人生の変化", lead: "進学、就職、転職、結婚、出産、育児、引退など、大切な変化と新しい始まりに寄り添います。", planned: true },
    ],
  },
  {
    kicker: "First experiences",
    title: "初めて向き合う瞬間を、\n余さずつなぎます。",
    lead: "誰もが人生で初めて経験する瞬間に必要な情報と暮らしサービスをつなぐ事業です。年代を問わず、初めての経験を支えるプラットフォームへ広げる計画です。",
    items: [
      { n: "01", name: "初めての大人と社会生活", lead: "大人になって初めて向き合う社会生活と経済活動の始まりに寄り添います。", topics: ["初めての大人", "初めての大学", "初めてのアルバイト", "初めての労働契約", "初めての就職", "初めての職場", "初めての給料", "初めての退職・転職"] },
      { n: "02", name: "初めてのお金と金融", lead: "初めて稼ぎ、管理する瞬間から、貯蓄・投資、資産づくりの始まりまでつなぎます。", topics: ["初めての口座", "初めてのデビット", "初めてのクレジットカード", "初めての貯蓄", "初めての積立", "初めての投資", "初めての株式", "初めてのローン", "初めての保険", "初めての税申告"] },
      { n: "03", name: "初めての自立と住まい", lead: "初めて家を探し、自立した暮らしを始める過程に寄り添います。", topics: ["初めての一人暮らし", "初めての自立", "初めての家探し", "初めての月家賃", "初めてのチョンセ", "初めての賃貸契約", "初めての引越し", "初めての自動車", "初めての住宅購入"] },
      { n: "04", name: "初めての恋愛と家族", lead: "新しい関係の始まりから結婚・出産、育児と家族の成長まで寄り添います。", topics: ["初めての恋愛", "初めての同居", "初めての結婚", "初めての新婚の家", "初めての妊娠", "初めての出産", "初めての育児", "初めての子どもの教育", "初めてのペット"] },
      { n: "05", name: "初めての健康と自己管理", lead: "健康な暮らしを始める瞬間から、続く自己管理まで支えます。", topics: ["初めての運動", "初めてのジム", "初めてのランニング", "初めての健康診断", "初めての食事管理", "初めての病院予約", "初めてのカウンセリング"] },
      { n: "06", name: "初めての創業と経済活動", lead: "新しい経済活動と事業を始める瞬間から、成長の過程までつなぎます。", topics: ["初めての副業", "初めてのフリーランス", "初めての創業", "初めての事業者登録", "初めての売上", "初めての税申告", "初めての採用", "初めての事業拡大"] },
      { n: "07", name: "初めての旅と新しい挑戦", lead: "初めての旅から新しい学びと挑戦まで、さまざまな経験の始まりに寄り添います。", topics: ["初めての海外旅行", "初めてのパスポート", "初めての飛行機", "初めての一人旅", "初めての留学", "初めてのワーキングホリデー", "初めての趣味", "初めてのボランティア"] },
      { n: "08", name: "初めての引退と人生の次章", lead: "仕事のあとの新しい暮らしと挑戦を準備し、次の段階をつなぎます。", topics: ["初めての引退", "初めての年金受給", "初めての再就職", "初めての帰農・帰村", "初めてのシニア学習", "初めての親のケア", "初めての老後設計"] },
    ],
  },
  {
    kicker: "Life changes",
    title: "大切な変化のたびに、\n次の暮らしをつなぎます。",
    lead: "人生は一つの段階にとどまりません。新しい始まりと大切な変化のたびに、必要な情報と暮らしサービスをつなぎます。",
    items: ["進学と新しい学び", "就職と転職", "自立と住まいの移動", "結婚と家族構成の変化", "妊娠・出産と育児", "子どもの成長と教育", "健康と生活習慣の変化", "家族のケアと扶養", "引退と新しい社会活動", "新しい地域と生活環境への移動"],
  }
);

const es = scope(
  {
    pillarsNote: "Estas tres no son apps ni marcas aparte. Son áreas de expansión dentro de una sola plataforma Life Stage.",
    firstNote: "Los ocho campos de abajo son un plan de expansión posterior, no un producto en vivo ni un flujo de solicitud.",
    changeNote: "Los cambios de vida son un plan de expansión posterior, no una pantalla de uso ni una función de solicitud.",
  },
  {
    kicker: "Life Stage scope",
    title: "Una plataforma,\ntres direcciones para crecer.",
    lead: "Etapas por edad, primeras experiencias y cambios de vida, conectados dentro de un solo Life Stage.",
    items: [
      { n: "01", name: "Ciclo de vida por edad", lead: "De la adolescencia a los 70, conectamos información y servicios de vida para cada etapa." },
      { n: "02", name: "Primeras experiencias", lead: "Primera adultez, primer empleo, primer dinero, primera inversión, primera independencia, primer matrimonio, primera crianza.", planned: true },
      { n: "03", name: "Cambios de vida", lead: "Estudios, trabajo, cambio de empleo, matrimonio, nacimiento, crianza, retiro: los giros importantes y los nuevos comienzos.", planned: true },
    ],
  },
  {
    kicker: "First experiences",
    title: "Cada primer momento,\nconectado.",
    lead: "Un negocio que conecta la información y los servicios de vida que se necesitan la primera vez. Planeamos ampliarlo como plataforma de primeras veces a cualquier edad.",
    items: [
      { n: "01", name: "Primera adultez y vida laboral", lead: "Acompañamos los primeros pasos de la vida social y económica adulta.", topics: ["Primera adultez", "Primera universidad", "Primer trabajo a tiempo parcial", "Primer contrato laboral", "Primer empleo", "Primer lugar de trabajo", "Primer sueldo", "Primera baja y cambio de empleo"] },
      { n: "02", name: "Primer dinero y finanzas", lead: "Desde ganar y gestionar dinero por primera vez hasta el ahorro, la inversión y el inicio del patrimonio.", topics: ["Primera cuenta", "Primera tarjeta de débito", "Primera tarjeta de crédito", "Primer ahorro", "Primer ahorro programado", "Primera inversión", "Primeras acciones", "Primer préstamo", "Primer seguro", "Primera declaración de impuestos"] },
      { n: "03", name: "Primera independencia y vivienda", lead: "Acompañamos buscar la primera casa y empezar una vida independiente.", topics: ["Primera vida en solitario", "Primera independencia", "Primera búsqueda de casa", "Primer alquiler mensual", "Primer jeonse", "Primer contrato de alquiler", "Primera mudanza", "Primer coche", "Primera compra de vivienda"] },
      { n: "04", name: "Primeras relaciones y familia", lead: "Desde una nueva relación hasta el matrimonio, el nacimiento, la crianza y el crecimiento de la familia.", topics: ["Primera relación", "Primera convivencia", "Primer matrimonio", "Primera casa de recién casados", "Primer embarazo", "Primer nacimiento", "Primera crianza", "Primera educación de los hijos", "Primera mascota"] },
      { n: "05", name: "Primera salud y autocuidado", lead: "Desde empezar una vida más sana hasta mantener el autocuidado.", topics: ["Primer ejercicio", "Primer gimnasio", "Primera carrera", "Primer chequeo", "Primer plan de comidas", "Primera cita médica", "Primera consulta psicológica"] },
      { n: "06", name: "Primer negocio y actividad económica", lead: "Desde empezar una nueva actividad económica o un negocio hasta el camino de crecimiento.", topics: ["Primer trabajo extra", "Primer freelance", "Primera fundación", "Primer registro de empresa", "Primeros ingresos", "Primera declaración de impuestos", "Primera contratación", "Primera expansión"] },
      { n: "07", name: "Primer viaje y nuevos retos", lead: "Desde el primer viaje hasta un nuevo aprendizaje y un nuevo reto.", topics: ["Primer viaje al extranjero", "Primer pasaporte", "Primer vuelo", "Primer viaje en solitario", "Primer estudio en el extranjero", "Primer working holiday", "Primera afición", "Primer voluntariado"] },
      { n: "08", name: "Primer retiro y segundo capítulo", lead: "Ayudamos a preparar una vida nueva después del trabajo y a conectar el siguiente capítulo.", topics: ["Primer retiro", "Primer cobro de pensión", "Primera reincorporación", "Primera mudanza rural", "Primer aprendizaje sénior", "Primer cuidado de padres", "Primer plan de vida posterior"] },
    ],
  },
  {
    kicker: "Life changes",
    title: "En cada giro importante,\nsigue el siguiente capítulo.",
    lead: "La vida no se queda en una sola etapa. En cada comienzo y cambio importante conectamos la información y los servicios de vida que hacen falta.",
    items: ["Estudios y nuevo aprendizaje", "Trabajo y cambio de empleo", "Independencia y mudanza", "Matrimonio y cambio familiar", "Embarazo, nacimiento y crianza", "Crecimiento y educación de los hijos", "Salud y hábitos de vida", "Cuidado y apoyo familiar", "Retiro y nueva vida comunitaria", "Mudanza a un nuevo lugar y entorno"],
  }
);

const ptBr = scope(
  {
    pillarsNote: "Esses três não são apps ou marcas separadas. São áreas de expansão dentro de uma única plataforma Life Stage.",
    firstNote: "Os oito campos abaixo são um plano de expansão posterior, não um produto ativo nem um fluxo de inscrição.",
    changeNote: "Mudanças de vida são um plano de expansão posterior, não uma tela de uso nem um pedido.",
  },
  {
    kicker: "Life Stage scope",
    title: "Uma plataforma,\ntrês direções para crescer.",
    lead: "Etapas por idade, primeiras experiências e mudanças de vida — ligadas dentro de um só Life Stage.",
    items: [
      { n: "01", name: "Ciclo de vida por idade", lead: "Da adolescência aos 70, ligamos informação e serviços de vida para cada etapa." },
      { n: "02", name: "Primeiras experiências", lead: "Primeira vida adulta, primeiro emprego, primeiro dinheiro, primeiro investimento, primeira independência, primeiro casamento, primeira criação dos filhos.", planned: true },
      { n: "03", name: "Mudanças de vida", lead: "Estudo, trabalho, troca de emprego, casamento, nascimento, criação, aposentadoria — as viradas e os novos começos.", planned: true },
    ],
  },
  {
    kicker: "First experiences",
    title: "Cada primeiro momento,\nconectado.",
    lead: "Um negócio que liga a informação e os serviços de vida necessários na primeira vez. Planejamos ampliar isso como plataforma de primeiras vezes em qualquer idade.",
    items: [
      { n: "01", name: "Primeira vida adulta e trabalho", lead: "Caminhamos com os primeiros passos da vida social e econômica adulta.", topics: ["Primeira vida adulta", "Primeira universidade", "Primeiro trabalho de meio período", "Primeiro contrato de trabalho", "Primeira contratação", "Primeiro local de trabalho", "Primeiro salário", "Primeira saída e troca de emprego"] },
      { n: "02", name: "Primeiro dinheiro e finanças", lead: "De ganhar e gerir dinheiro pela primeira vez até poupança, investimento e o início do patrimônio.", topics: ["Primeira conta", "Primeiro cartão de débito", "Primeiro cartão de crédito", "Primeira poupança", "Primeira poupança programada", "Primeiro investimento", "Primeiras ações", "Primeiro empréstimo", "Primeiro seguro", "Primeira declaração de imposto"] },
      { n: "03", name: "Primeira independência e moradia", lead: "Acompanhamos a busca da primeira casa e o início de uma vida independente.", topics: ["Primeira vida sozinho", "Primeira independência", "Primeira busca de casa", "Primeiro aluguel mensal", "Primeiro jeonse", "Primeiro contrato de locação", "Primeira mudança", "Primeiro carro", "Primeira compra de imóvel"] },
      { n: "04", name: "Primeiros relacionamentos e família", lead: "De um novo relacionamento ao casamento, nascimento, criação e crescimento da família.", topics: ["Primeiro relacionamento", "Primeira convivência", "Primeiro casamento", "Primeira casa de recém-casados", "Primeira gravidez", "Primeiro nascimento", "Primeira criação", "Primeira educação dos filhos", "Primeiro animal de estimação"] },
      { n: "05", name: "Primeira saúde e autocuidado", lead: "Do início de uma vida mais saudável ao autocuidado contínuo.", topics: ["Primeiro exercício", "Primeira academia", "Primeira corrida", "Primeiro check-up", "Primeiro plano alimentar", "Primeira consulta", "Primeiro aconselhamento"] },
      { n: "06", name: "Primeiro negócio e atividade econômica", lead: "Do início de uma nova atividade econômica ou empresa ao caminho de crescimento.", topics: ["Primeiro bico", "Primeiro freelance", "Primeira fundação", "Primeiro registro de empresa", "Primeira receita", "Primeira declaração de imposto", "Primeira contratação", "Primeira expansão"] },
      { n: "07", name: "Primeira viagem e novos desafios", lead: "Da primeira viagem a um novo aprendizado e um novo desafio.", topics: ["Primeira viagem ao exterior", "Primeiro passaporte", "Primeiro voo", "Primeira viagem sozinho", "Primeiro intercâmbio", "Primeiro working holiday", "Primeiro hobby", "Primeiro voluntariado"] },
      { n: "08", name: "Primeira aposentadoria e segundo capítulo", lead: "Ajudamos a preparar uma vida nova depois do trabalho e a ligar o próximo capítulo.", topics: ["Primeira aposentadoria", "Primeiro recebimento de pensão", "Primeiro retorno ao trabalho", "Primeira mudança rural", "Primeiro aprendizado sênior", "Primeiro cuidado dos pais", "Primeiro plano da vida seguinte"] },
    ],
  },
  {
    kicker: "Life changes",
    title: "Em cada virada importante,\no próximo capítulo continua.",
    lead: "A vida não fica em uma só etapa. Em cada começo e mudança importante, ligamos a informação e os serviços de vida necessários.",
    items: ["Estudo e novo aprendizado", "Trabalho e troca de emprego", "Independência e mudança de moradia", "Casamento e mudança familiar", "Gravidez, nascimento e criação", "Crescimento e educação dos filhos", "Saúde e hábitos de vida", "Cuidado e apoio familiar", "Aposentadoria e nova vida comunitária", "Mudança para um novo lugar e ambiente"],
  }
);

const fr = scope(
  {
    pillarsNote: "Ces trois axes ne sont pas des applications ou des marques séparées. Ce sont des domaines d’expansion d’une seule plateforme Life Stage.",
    firstNote: "Les huit domaines ci-dessous sont un plan d’expansion ultérieur, pas un produit en ligne ni un parcours de demande.",
    changeNote: "Les changements de vie sont un plan d’expansion ultérieur, pas un écran d’usage ni une fonction de demande.",
  },
  {
    kicker: "Life Stage scope",
    title: "Une plateforme,\ntrois directions pour grandir.",
    lead: "Les étapes selon l’âge, les premières fois et les changements de vie — reliés dans un seul Life Stage.",
    items: [
      { n: "01", name: "Cycle de vie selon l’âge", lead: "De l’adolescence à 70 ans, nous relions l’information et les services de vie de chaque étape." },
      { n: "02", name: "Premières expériences", lead: "Première vie adulte, premier emploi, premier argent, premier investissement, première indépendance, premier mariage, première parentalité.", planned: true },
      { n: "03", name: "Changements de vie", lead: "Études, travail, mobilité, mariage, naissance, parentalité, retraite — les tournants et les nouveaux départs.", planned: true },
    ],
  },
  {
    kicker: "First experiences",
    title: "Chaque première fois,\nreliée.",
    lead: "Une activité qui relie l’information et les services de vie nécessaires à la première fois. Nous prévoyons d’élargir cela en plateforme des premières fois, à tout âge.",
    items: [
      { n: "01", name: "Première vie adulte et travail", lead: "Nous accompagnons les premiers pas de la vie sociale et économique adulte.", topics: ["Première vie adulte", "Première université", "Premier petit boulot", "Premier contrat de travail", "Premier emploi", "Premier lieu de travail", "Premier salaire", "Première démission et mobilité"] },
      { n: "02", name: "Premier argent et finance", lead: "Gagner et gérer l’argent pour la première fois, jusqu’à l’épargne, l’investissement et le début d’un patrimoine.", topics: ["Premier compte", "Première carte de débit", "Première carte de crédit", "Première épargne", "Premier plan d’épargne", "Premier investissement", "Premières actions", "Premier prêt", "Première assurance", "Première déclaration fiscale"] },
      { n: "03", name: "Première indépendance et logement", lead: "Nous accompagnons la recherche d’un premier logement et le début d’une vie indépendante.", topics: ["Premier logement seul", "Première indépendance", "Première recherche de logement", "Premier loyer mensuel", "Premier jeonse", "Premier bail", "Premier déménagement", "Première voiture", "Premier achat immobilier"] },
      { n: "04", name: "Premières relations et famille", lead: "D’une nouvelle relation au mariage, à la naissance, à la parentalité et à la croissance de la famille.", topics: ["Première relation", "Première vie à deux", "Premier mariage", "Premier logement de jeunes mariés", "Première grossesse", "Première naissance", "Première parentalité", "Première éducation des enfants", "Premier animal"] },
      { n: "05", name: "Première santé et hygiène de vie", lead: "Du début d’une vie plus saine au suivi de soi dans la durée.", topics: ["Premier sport", "Première salle", "Première course", "Premier bilan de santé", "Premier plan alimentaire", "Premier rendez-vous médical", "Premier accompagnement psychologique"] },
      { n: "06", name: "Première activité économique et création", lead: "Du début d’une activité ou d’une entreprise au chemin de croissance.", topics: ["Premier job d’appoint", "Premier freelance", "Première création", "Premier enregistrement d’entreprise", "Premiers revenus", "Première déclaration fiscale", "Premier recrutement", "Première expansion"] },
      { n: "07", name: "Premier voyage et nouveaux défis", lead: "Du premier voyage à un nouvel apprentissage et un nouveau défi.", topics: ["Premier voyage à l’étranger", "Premier passeport", "Premier vol", "Premier voyage seul", "Premières études à l’étranger", "Premier working holiday", "Premier loisir", "Premier bénévolat"] },
      { n: "08", name: "Première retraite et second chapitre", lead: "Nous aidons à préparer une vie nouvelle après le travail et à relier le chapitre suivant.", topics: ["Première retraite", "Premier versement de pension", "Premier retour à l’emploi", "Premier départ rural", "Premier apprentissage senior", "Premier soutien aux parents", "Premier plan de la suite"] },
    ],
  },
  {
    kicker: "Life changes",
    title: "À chaque tournant important,\nle chapitre suivant continue.",
    lead: "La vie ne reste pas à une seule étape. À chaque nouveau départ et chaque changement important, nous relions l’information et les services de vie nécessaires.",
    items: ["Études et nouvel apprentissage", "Travail et mobilité", "Indépendance et déménagement", "Mariage et changement familial", "Grossesse, naissance et parentalité", "Croissance et éducation des enfants", "Santé et habitudes de vie", "Soutien et aide familiale", "Retraite et nouvelle vie sociale", "Installation dans un nouveau lieu et un nouvel environnement"],
  }
);

const de = scope(
  {
    pillarsNote: "Diese drei sind keine getrennten Apps oder Marken. Sie sind Erweiterungsfelder innerhalb einer Life-Stage-Plattform.",
    firstNote: "Die acht Felder unten sind ein späterer Ausbauplan, kein laufendes Produkt und kein Antragsfluss.",
    changeNote: "Lebensveränderungen sind ein späterer Ausbauplan, keine Nutzungsoberfläche und keine Antragsfunktion.",
  },
  {
    kicker: "Life Stage scope",
    title: "Eine Plattform,\ndrei Richtungen zum Wachsen.",
    lead: "Lebensphasen nach Alter, erste Erfahrungen und Lebensveränderungen — verbunden in einem Life Stage.",
    items: [
      { n: "01", name: "Lebensphasen nach Alter", lead: "Von den Teenagerjahren bis zu den 70ern verbinden wir Alltagsinformation und Dienste für jede Phase." },
      { n: "02", name: "Erste Erfahrungen", lead: "Erstes Erwachsensein, erster Job, erstes Geld, erste Anlage, erste Selbstständigkeit, erste Ehe, erste Elternschaft.", planned: true },
      { n: "03", name: "Lebensveränderungen", lead: "Studium, Arbeit, Jobwechsel, Heirat, Geburt, Elternschaft, Ruhestand — die wichtigen Wendungen und neuen Anfänge.", planned: true },
    ],
  },
  {
    kicker: "First experiences",
    title: "Jeder erste Moment,\nverbunden.",
    lead: "Ein Geschäft, das Information und Alltagsdienste verbindet, die man beim ersten Mal braucht. Wir planen, das als Plattform für Erstes in jedem Alter zu erweitern.",
    items: [
      { n: "01", name: "Erstes Erwachsensein und Arbeitsleben", lead: "Wir begleiten die ersten Schritte des erwachsenen sozialen und wirtschaftlichen Lebens.", topics: ["Erstes Erwachsensein", "Erste Universität", "Erster Nebenjob", "Erster Arbeitsvertrag", "Erste Anstellung", "Erster Arbeitsplatz", "Erstes Gehalt", "Erste Kündigung und Jobwechsel"] },
      { n: "02", name: "Erstes Geld und Finanzen", lead: "Vom ersten Verdienen und Verwalten von Geld bis zum Sparen, Anlegen und dem Beginn von Vermögen.", topics: ["Erstes Konto", "Erste Debitkarte", "Erste Kreditkarte", "Erstes Sparen", "Erster Sparplan", "Erste Anlage", "Erste Aktien", "Erster Kredit", "Erste Versicherung", "Erste Steuererklärung"] },
      { n: "03", name: "Erste Selbstständigkeit und Wohnen", lead: "Wir begleiten die Suche nach dem ersten Zuhause und den Start eines unabhängigen Lebens.", topics: ["Erstes Alleinwohnen", "Erste Selbstständigkeit", "Erste Haussuche", "Erste Monatsmiete", "Erstes Jeonse", "Erster Mietvertrag", "Erster Umzug", "Erstes Auto", "Erster Wohnungskauf"] },
      { n: "04", name: "Erste Beziehungen und Familie", lead: "Von einer neuen Beziehung bis zu Heirat, Geburt, Elternschaft und dem Wachsen der Familie.", topics: ["Erste Beziehung", "Erstes Zusammenleben", "Erste Ehe", "Erstes Zuhause als Paar", "Erste Schwangerschaft", "Erste Geburt", "Erste Elternschaft", "Erste Bildung der Kinder", "Erstes Haustier"] },
      { n: "05", name: "Erste Gesundheit und Selbstsorge", lead: "Vom Start eines gesünderen Lebens bis zur fortlaufenden Selbstsorge.", topics: ["Erstes Training", "Erstes Fitnessstudio", "Erster Lauf", "Erste Vorsorge", "Erster Ernährungsplan", "Erste Arztbuchung", "Erste Beratung"] },
      { n: "06", name: "Erste Gründung und wirtschaftliche Tätigkeit", lead: "Vom Start einer neuen wirtschaftlichen Tätigkeit oder eines Unternehmens bis zum Wachstumsweg.", topics: ["Erster Nebenverdienst", "Erste Freelance-Arbeit", "Erste Gründung", "Erste Unternehmensanmeldung", "Erster Umsatz", "Erste Steuererklärung", "Erste Einstellung", "Erste Expansion"] },
      { n: "07", name: "Erste Reise und neue Herausforderungen", lead: "Von der ersten Reise bis zu neuem Lernen und einer neuen Herausforderung.", topics: ["Erste Auslandsreise", "Erster Reisepass", "Erster Flug", "Erste Solo-Reise", "Erstes Auslandsstudium", "Erstes Working Holiday", "Erstes Hobby", "Erstes Ehrenamt"] },
      { n: "08", name: "Erster Ruhestand und zweites Kapitel", lead: "Wir helfen, ein neues Leben nach der Arbeit vorzubereiten und das nächste Kapitel zu verbinden.", topics: ["Erster Ruhestand", "Erste Rentenauszahlung", "Erste Rückkehr in den Beruf", "Erster Umzug aufs Land", "Erstes Lernen im Alter", "Erste Elternpflege", "Erster Plan für später"] },
    ],
  },
  {
    kicker: "Life changes",
    title: "Bei jeder wichtigen Wende\ngeht das nächste Kapitel weiter.",
    lead: "Das Leben bleibt nicht in einer Phase. Bei jedem neuen Anfang und jeder wichtigen Veränderung verbinden wir die nötige Information und die Alltagsdienste.",
    items: ["Studium und neues Lernen", "Arbeit und Jobwechsel", "Selbstständigkeit und Umzug", "Heirat und Familienwechsel", "Schwangerschaft, Geburt und Elternschaft", "Wachsen und Bildung der Kinder", "Gesundheit und Lebensgewohnheiten", "Familienpflege und Unterstützung", "Ruhestand und neues soziales Leben", "Umzug in einen neuen Ort und ein neues Umfeld"],
  }
);

const hi = scope(
  {
    pillarsNote: "ये तीन अलग ऐप या ब्रांड नहीं हैं। ये एक ही Life Stage प्लेटफ़ॉर्म के अंदर विस्तार के क्षेत्र हैं।",
    firstNote: "नीचे के आठ क्षेत्र बाद की विस्तार योजना हैं, अभी चल रहा उत्पाद या आवेदन प्रवाह नहीं।",
    changeNote: "जीवन के बदलाव बाद की विस्तार योजना हैं, अलग उपयोग स्क्रीन या आवेदन सुविधा नहीं।",
  },
  {
    kicker: "Life Stage scope",
    title: "एक प्लेटफ़ॉर्म,\nतीन दिशाएँ आगे बढ़ने की।",
    lead: "आयु के अनुसार जीवन चरण, पहली बार के अनुभव, और जीवन के बदलाव — एक Life Stage के अंदर जुड़े।",
    items: [
      { n: "01", name: "आयु के अनुसार जीवन चक्र", lead: "किशोरावस्था से 70 तक, हर चरण के लिए जीवन की जानकारी और सेवाएँ जोड़ते हैं।" },
      { n: "02", name: "पहली बार के अनुभव", lead: "पहली वयस्कता, पहली नौकरी, पहला पैसा, पहला निवेश, पहली स्वतंत्रता, पहली शादी, पहली परवरिश।", planned: true },
      { n: "03", name: "जीवन के बदलाव", lead: "पढ़ाई, काम, नौकरी बदलना, शादी, जन्म, परवरिश, सेवानिवृत्ति — महत्वपूर्ण मोड़ और नई शुरुआत।", planned: true },
    ],
  },
  {
    kicker: "First experiences",
    title: "हर पहली बार,\nजुड़ी रहे।",
    lead: "पहली बार ज़रूरी जानकारी और जीवन सेवाओं को जोड़ने वाला व्यवसाय। हम इसे किसी भी उम्र में पहली बार के लिए प्लेटफ़ॉर्म के रूप में बढ़ाने की योजना रखते हैं।",
    items: [
      { n: "01", name: "पहली वयस्कता और कामकाजी जीवन", lead: "वयस्क सामाजिक और आर्थिक जीवन के पहले कदमों के साथ चलते हैं।", topics: ["पहली वयस्कता", "पहला विश्वविद्यालय", "पहली अंशकालिक नौकरी", "पहला कार्य अनुबंध", "पहली भर्ती", "पहली कार्यस्थल", "पहली तनख्वाह", "पहली छुट्टी और नौकरी बदलना"] },
      { n: "02", name: "पहला पैसा और वित्त", lead: "पहली बार कमाने और संभालने से लेकर बचत, निवेश और संपत्ति की शुरुआत तक।", topics: ["पहला खाता", "पहला डेबिट कार्ड", "पहला क्रेडिट कार्ड", "पहली बचत", "पहली किस्त बचत", "पहला निवेश", "पहला शेयर", "पहला ऋण", "पहला बीमा", "पहली कर घोषणा"] },
      { n: "03", name: "पहली स्वतंत्रता और आवास", lead: "पहला घर खोजने और स्वतंत्र जीवन शुरू करने की प्रक्रिया के साथ।", topics: ["पहली अकेली रहने की ज़िंदगी", "पहली स्वतंत्रता", "पहली घर की खोज", "पहला मासिक किराया", "पहला जोंसे", "पहला पट्टा", "पहला स्थानांतरण", "पहली कार", "पहली घर खरीद"] },
      { n: "04", name: "पहला रिश्ता और परिवार", lead: "नए रिश्ते से शादी, जन्म, परवरिश और परिवार के बढ़ने तक।", topics: ["पहला रिश्ता", "पहला साथ रहना", "पहली शादी", "पहला नवविवाहित घर", "पहली गर्भावस्था", "पहला जन्म", "पहली परवरिश", "पहली बच्चों की शिक्षा", "पहला पालतू"] },
      { n: "05", name: "पहला स्वास्थ्य और आत्मरक्षा", lead: "स्वस्थ जीवन शुरू करने से लगातार आत्मरक्षा तक।", topics: ["पहला व्यायाम", "पहला जिम", "पहली दौड़", "पहली स्वास्थ्य जाँच", "पहला आहार योजना", "पहली क्लिनिक बुकिंग", "पहली परामर्श"] },
      { n: "06", name: "पहला व्यवसाय और आर्थिक गतिविधि", lead: "नई आर्थिक गतिविधि या व्यवसाय शुरू करने से विकास के रास्ते तक।", topics: ["पहला साइड काम", "पहला फ्रीलांस", "पहली स्थापना", "पहला व्यवसाय पंजीकरण", "पहली आय", "पहली कर घोषणा", "पहली भर्ती", "पहला विस्तार"] },
      { n: "07", name: "पहली यात्रा और नई चुनौतियाँ", lead: "पहली यात्रा से नई सीख और चुनौती तक।", topics: ["पहली विदेश यात्रा", "पहला पासपोर्ट", "पहली उड़ान", "पहली अकेली यात्रा", "पहली विदेश पढ़ाई", "पहला वर्किंग हॉलिडे", "पहला शौक", "पहला स्वयंसेवा"] },
      { n: "08", name: "पहली सेवानिवृत्ति और दूसरा अध्याय", lead: "काम के बाद नया जीवन तैयार करने और अगला अध्याय जोड़ने में मदद।", topics: ["पहली सेवानिवृत्ति", "पहला पेंशन भुगतान", "पहली फिर से नौकरी", "पहला ग्रामीण स्थानांतरण", "पहली वरिष्ठ शिक्षा", "पहली माता-पिता की देखभाल", "पहली बाद की जीवन योजना"] },
    ],
  },
  {
    kicker: "Life changes",
    title: "हर महत्वपूर्ण मोड़ पर,\nअगला अध्याय जारी रहता है।",
    lead: "जीवन एक चरण में नहीं रुकता। हर नई शुरुआत और महत्वपूर्ण बदलाव पर ज़रूरी जानकारी और जीवन सेवाएँ जोड़ते हैं।",
    items: ["पढ़ाई और नई सीख", "काम और नौकरी बदलना", "स्वतंत्रता और घर बदलना", "शादी और परिवार का बदलाव", "गर्भावस्था, जन्म और परवरिश", "बच्चों का बढ़ना और शिक्षा", "स्वास्थ्य और जीवन की आदतें", "परिवार की देखभाल और सहारा", "सेवानिवृत्ति और नया सामाजिक जीवन", "नए स्थान और जीवन वातावरण में जाना"],
  }
);

const id = scope(
  {
    pillarsNote: "Ketiga hal ini bukan aplikasi atau merek terpisah. Ini area ekspansi di dalam satu platform Life Stage.",
    firstNote: "Delapan bidang di bawah adalah rencana ekspansi kemudian, bukan produk yang sudah berjalan atau alur pendaftaran.",
    changeNote: "Perubahan hidup adalah rencana ekspansi kemudian, bukan layar penggunaan atau fungsi pendaftaran.",
  },
  {
    kicker: "Life Stage scope",
    title: "Satu platform,\ntiga arah untuk tumbuh.",
    lead: "Tahap hidup menurut usia, pengalaman pertama, dan perubahan hidup — terhubung di dalam satu Life Stage.",
    items: [
      { n: "01", name: "Siklus hidup menurut usia", lead: "Dari remaja hingga 70-an, kami menghubungkan informasi dan layanan hidup untuk setiap tahap." },
      { n: "02", name: "Pengalaman pertama", lead: "Dewasa pertama, pekerjaan pertama, uang pertama, investasi pertama, kemandirian pertama, pernikahan pertama, pengasuhan pertama.", planned: true },
      { n: "03", name: "Perubahan hidup", lead: "Sekolah, kerja, pindah kerja, menikah, kelahiran, pengasuhan, pensiun — belokan penting dan awal yang baru.", planned: true },
    ],
  },
  {
    kicker: "First experiences",
    title: "Setiap momen pertama,\nterhubung.",
    lead: "Bisnis yang menghubungkan informasi dan layanan hidup yang dibutuhkan saat pertama kali. Kami merencanakan memperluas ini sebagai platform pengalaman pertama di usia berapa pun.",
    items: [
      { n: "01", name: "Dewasa pertama dan kehidupan kerja", lead: "Kami menemani langkah pertama kehidupan sosial dan ekonomi dewasa.", topics: ["Dewasa pertama", "Universitas pertama", "Kerja paruh waktu pertama", "Kontrak kerja pertama", "Rekrutmen pertama", "Tempat kerja pertama", "Gaji pertama", "Pengunduran dan pindah kerja pertama"] },
      { n: "02", name: "Uang dan keuangan pertama", lead: "Dari pertama kali mencari dan mengelola uang hingga menabung, berinvestasi, dan awal membentuk aset.", topics: ["Rekening pertama", "Kartu debit pertama", "Kartu kredit pertama", "Tabungan pertama", "Tabungan berjangka pertama", "Investasi pertama", "Saham pertama", "Pinjaman pertama", "Asuransi pertama", "Lapor pajak pertama"] },
      { n: "03", name: "Kemandirian dan hunian pertama", lead: "Kami menemani mencari rumah pertama dan memulai hidup mandiri.", topics: ["Tinggal sendiri pertama", "Kemandirian pertama", "Pencarian rumah pertama", "Sewa bulanan pertama", "Jeonse pertama", "Kontrak sewa pertama", "Pindahan pertama", "Mobil pertama", "Pembelian rumah pertama"] },
      { n: "04", name: "Hubungan dan keluarga pertama", lead: "Dari hubungan baru hingga menikah, kelahiran, pengasuhan, dan tumbuhnya keluarga.", topics: ["Hubungan pertama", "Tinggal bersama pertama", "Pernikahan pertama", "Rumah pengantin baru pertama", "Kehamilan pertama", "Kelahiran pertama", "Pengasuhan pertama", "Pendidikan anak pertama", "Hewan peliharaan pertama"] },
      { n: "05", name: "Kesehatan dan perawatan diri pertama", lead: "Dari memulai hidup lebih sehat hingga perawatan diri yang berkelanjutan.", topics: ["Olahraga pertama", "Gym pertama", "Lari pertama", "Pemeriksaan kesehatan pertama", "Rencana makan pertama", "Janji klinik pertama", "Konseling pertama"] },
      { n: "06", name: "Usaha dan aktivitas ekonomi pertama", lead: "Dari memulai aktivitas ekonomi atau usaha baru hingga jalur pertumbuhan.", topics: ["Kerja sampingan pertama", "Freelance pertama", "Pendirian pertama", "Pendaftaran usaha pertama", "Pendapatan pertama", "Lapor pajak pertama", "Perekrutan pertama", "Ekspansi pertama"] },
      { n: "07", name: "Perjalanan dan tantangan baru pertama", lead: "Dari perjalanan pertama hingga belajar baru dan tantangan baru.", topics: ["Perjalanan luar negeri pertama", "Paspor pertama", "Penerbangan pertama", "Perjalanan sendirian pertama", "Studi ke luar negeri pertama", "Working holiday pertama", "Hobi pertama", "Relawan pertama"] },
      { n: "08", name: "Pensiun pertama dan bab kedua", lead: "Kami membantu menyiapkan hidup baru setelah bekerja dan menghubungkan bab berikutnya.", topics: ["Pensiun pertama", "Penerimaan pensiun pertama", "Kembali bekerja pertama", "Pindah ke desa pertama", "Belajar senior pertama", "Perawatan orang tua pertama", "Rencana hidup selanjutnya pertama"] },
    ],
  },
  {
    kicker: "Life changes",
    title: "Di setiap belokan penting,\nbab berikutnya berlanjut.",
    lead: "Hidup tidak tinggal di satu tahap. Di setiap awal baru dan perubahan penting, kami menghubungkan informasi dan layanan hidup yang dibutuhkan.",
    items: ["Sekolah dan belajar baru", "Kerja dan pindah kerja", "Kemandirian dan pindah hunian", "Pernikahan dan perubahan keluarga", "Kehamilan, kelahiran, dan pengasuhan", "Tumbuhnya anak dan pendidikan", "Kesehatan dan kebiasaan hidup", "Perawatan dan dukungan keluarga", "Pensiun dan kehidupan sosial baru", "Pindah ke tempat dan lingkungan hidup baru"],
  }
);

export const LIFE_STAGE_SCOPE_I18N = { ja, es, "pt-br": ptBr, fr, de, hi, id };
