#!/usr/bin/env node
/** Apply hand-maintained home + footer copy for all non-English locales. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = path.join(ROOT, "locales");

const PATCHES = {
  ja: {
    home: {
      heroEyebrow: "アプリスタジオ · ライフプラットフォーム",
      heroTitleLine1: "アイデアをオンに、",
      heroTitleAccent: "変化を始めます",
      heroLead: "思考が現実につながるまで。シンプルで長く使える体験を設計します。",
      meaningLabel: "アイデンティティ",
      meaningTitle: "名前の意味",
      meaningP1Html:
        "新しい<span class=\"co-on\">(New)</span> アイデアを<span class=\"co-on\">オン(On)</span>にし、思考と現実をつなぐ瞬間を意味します。",
      meaningP2: "小さなアイデアが実行される瞬間、Newonは始まります。",
      meaningP3: "私たちは単なるアプリではなく、日常の中で長く使われる体験をつくります。",
      aboutLabel: "会社",
      aboutTitle: "会社紹介",
      aboutLead:
        "Newonは、目標・習慣・健康・金融・家族の記録など、日常のさまざまな領域をより簡単にスマートに管理できるアプリをつくるチームです。",
      aboutP2:
        "複雑さを減らし、誰でも使いやすいサービスで、アイデアが実際の変化につながるようにします。",
      aboutP3Html:
        "現在、Newonは<br /><br />• 10本のアプリをリリース<br />• 177か国でサービス<br />• 13言語をサポート<br /><br />し、世界中のユーザーがより良い日常を体験できるよう支援しています。",
      workLabel: "私たちの仕事",
      workTitle: "私たちがしていること",
      workP1: "Newonは一つのサービスにとどまらず、さまざまなアイデアから新しいアプリを生み続けます。",
      workP2: "各サービスは日常に自然に溶け込み、小さくてもはっきりした変化を生み出します。",
      workP3Html:
        "私たちがつくるのは単なる機能ではなく<br /><br />記録し、<br />管理し、<br />成長する体験です。",
      productsLabel: "プロダクト",
      productsTitle: "私たちがつくるもの",
      productLi0: "習慣と記録を助けるアプリ",
      productLi1: "目標と成長を助けるアプリ",
      productLi2: "健康的な日常のためのアプリ",
      productLi3: "金融と支出を管理するアプリ",
      productLi4: "家族とペットのためのアプリ",
      productLi5: "生活をより便利にするサービス",
      visionLabel: "ビジョン",
      visionTitle: "私たちの目標",
      visionP1Html: "機能が多いアプリではなく、<strong>長く使われるアプリ</strong>をつくること。",
      visionP2: "ユーザーの日常に自然に溶け込み、続く変化を生むことが目標です。",
      visionP3:
        "10本のアプリから始め、より多くの人生をつなぐグローバルなライフプラットフォームへ成長していきます。",
      statsLabel: "統計",
      statsTitle: "数字で見る Newon",
      statCard0Html:
        "<span class=\"co-stats-card__value\">10+</span><span class=\"co-stats-card__label\">アプリ公開</span>",
      statCard1Html:
        "<span class=\"co-stats-card__value\">177</span><span class=\"co-stats-card__label\">サービス国</span>",
      statCard2Html:
        "<span class=\"co-stats-card__value\">13</span><span class=\"co-stats-card__label\">対応言語</span>",
      statCard3Html:
        "<span class=\"co-stats-card__value\">100+</span><span class=\"co-stats-card__label\">累計インストール</span>",
      statNewonPlusHtml: "<strong>Newon+</strong>ひとつのサブスク<br />すべての Newon アプリ",
    },
    footer: {
      tagline: "アイデアを現実につなぐアプリスタジオ",
      statLine1: "177か国でサービス",
      statLine2: "13言語対応",
      statLine3: "10本のアプリ",
    },
  },
  es: {
    home: {
      heroEyebrow: "Estudio de apps · Plataforma de vida",
      heroTitleLine1: "Enciende ideas,",
      heroTitleAccent: "y empieza el cambio",
      heroLead: "Hasta que el pensamiento se vuelve realidad: diseñamos experiencias simples y duraderas.",
      meaningLabel: "Identidad",
      meaningTitle: "Qué significa el nombre",
      meaningP1Html:
        "Encendemos ideas <span class=\"co-on\">nuevas (New)</span> <span class=\"co-on\">on (On)</span>: el momento en que el pensamiento se conecta con la realidad.",
      meaningP2: "Cuando una pequeña idea pasa a la acción, Newon comienza.",
      meaningP3: "No solo creamos apps: creamos experiencias que la gente usa en su día a día durante mucho tiempo.",
      aboutLabel: "Empresa",
      aboutTitle: "Sobre nosotros",
      aboutLead:
        "Newon es un equipo que crea apps para ayudarte a gestionar metas, hábitos, salud, finanzas, registros familiares y más, haciendo la vida cotidiana más fácil e inteligente.",
      aboutP2: "Reducimos la complejidad y creamos servicios que cualquiera puede usar, para que las ideas se conviertan en cambio real.",
      aboutP3Html:
        "Hoy, Newon ayuda a personas de todo el mundo a vivir mejor cada día gracias a:<br /><br />• 10 apps publicadas<br />• Servicio en 177 países<br />• Soporte en 13 idiomas",
      workLabel: "Qué hacemos",
      workTitle: "Qué hacemos",
      workP1: "Newon no se queda en un solo producto: seguimos lanzando nuevas apps a partir de muchas ideas.",
      workP2: "Cada servicio encaja de forma natural en la vida diaria y crea cambios pequeños pero claros.",
      workP3Html:
        "Lo que creamos no son solo funciones, sino una experiencia de<br /><br />registrar,<br />gestionar<br />y crecer.",
      productsLabel: "Productos",
      productsTitle: "Lo que creamos",
      productLi0: "Apps para hábitos y registros",
      productLi1: "Apps para metas y crecimiento",
      productLi2: "Apps para una vida saludable",
      productLi3: "Apps para finanzas y gastos",
      productLi4: "Apps para familia y mascotas",
      productLi5: "Servicios que hacen la vida más cómoda",
      visionLabel: "Visión",
      visionTitle: "Nuestro objetivo",
      visionP1Html: "No apps con infinitas funciones, sino <strong>apps que se usan mucho tiempo</strong>.",
      visionP2: "Nuestro objetivo es integrarnos en la vida diaria y ayudar a que el cambio perdure.",
      visionP3: "Partiendo de 10 apps, queremos crecer como plataforma de vida global que conecte más vidas.",
      statsLabel: "Estadísticas",
      statsTitle: "Newon en cifras",
      statCard0Html:
        "<span class=\"co-stats-card__value\">10+</span><span class=\"co-stats-card__label\">Apps publicadas</span>",
      statCard1Html:
        "<span class=\"co-stats-card__value\">177</span><span class=\"co-stats-card__label\">Países</span>",
      statCard2Html:
        "<span class=\"co-stats-card__value\">13</span><span class=\"co-stats-card__label\">Idiomas</span>",
      statCard3Html:
        "<span class=\"co-stats-card__value\">100+</span><span class=\"co-stats-card__label\">Instalaciones</span>",
      statNewonPlusHtml: "<strong>Newon+</strong>Una suscripción<br />Para todas las apps",
    },
    footer: {
      tagline: "Un estudio de apps que conecta ideas con la realidad",
      statLine1: "Servicio en 177 países",
      statLine2: "13 idiomas",
      statLine3: "10 apps publicadas",
    },
  },
  "pt-br": {
    home: {
      heroEyebrow: "Estúdio de apps · Plataforma de vida",
      heroTitleLine1: "Acenda ideias,",
      heroTitleAccent: "e comece a mudança",
      heroLead: "Até o pensamento virar realidade — criamos experiências simples e duradouras.",
      meaningLabel: "Identidade",
      meaningTitle: "O significado do nome",
      meaningP1Html:
        "Acendemos ideias <span class=\"co-on\">novas (New)</span> <span class=\"co-on\">on (On)</span> — o momento em que o pensamento se conecta à realidade.",
      meaningP2: "No instante em que uma pequena ideia vira ação, a Newon começa.",
      meaningP3: "Não criamos apenas apps — criamos experiências que as pessoas usam no dia a dia por muito tempo.",
      aboutLabel: "Empresa",
      aboutTitle: "Sobre nós",
      aboutLead:
        "A Newon é uma equipe que cria apps para ajudar você a gerenciar metas, hábitos, saúde, finanças, registros familiares e muito mais — tornando o dia a dia mais fácil e inteligente.",
      aboutP2: "Reduzimos a complexidade e criamos serviços que qualquer pessoa pode usar, para que ideias virem mudança real.",
      aboutP3Html:
        "Hoje, a Newon ajuda pessoas no mundo todo a viver melhor todos os dias com:<br /><br />• 10 apps lançados<br />• Serviço em 177 países<br />• Suporte a 13 idiomas",
      workLabel: "O que fazemos",
      workTitle: "O que fazemos",
      workP1: "A Newon não fica em um único produto — continuamos lançando novos apps a partir de muitas ideias.",
      workP2: "Cada serviço se encaixa naturalmente na rotina e cria mudanças pequenas, porém claras.",
      workP3Html:
        "O que criamos não são só recursos — é uma experiência de<br /><br />registrar,<br />gerenciar<br />e crescer.",
      productsLabel: "Produtos",
      productsTitle: "O que criamos",
      productLi0: "Apps para hábitos e registros",
      productLi1: "Apps para metas e crescimento",
      productLi2: "Apps para uma vida saudável",
      productLi3: "Apps para finanças e gastos",
      productLi4: "Apps para família e pets",
      productLi5: "Serviços que tornam a vida mais prática",
      visionLabel: "Visão",
      visionTitle: "Nosso objetivo",
      visionP1Html: "Não apps com infinitos recursos — <strong>apps que você usa por muito tempo</strong>.",
      visionP2: "Queremos fazer parte da rotina e ajudar a mudança a permanecer.",
      visionP3: "Começando com 10 apps, queremos crescer como plataforma de vida global que conecta mais vidas.",
      statsLabel: "Estatísticas",
      statsTitle: "Newon em números",
      statCard0Html:
        "<span class=\"co-stats-card__value\">10+</span><span class=\"co-stats-card__label\">Apps lançados</span>",
      statCard1Html:
        "<span class=\"co-stats-card__value\">177</span><span class=\"co-stats-card__label\">Países</span>",
      statCard2Html:
        "<span class=\"co-stats-card__value\">13</span><span class=\"co-stats-card__label\">Idiomas</span>",
      statCard3Html:
        "<span class=\"co-stats-card__value\">100+</span><span class=\"co-stats-card__label\">Instalações</span>",
      statNewonPlusHtml: "<strong>Newon+</strong>Uma assinatura<br />Para todos os apps",
    },
    footer: {
      tagline: "Um estúdio de apps que conecta ideias à realidade",
      statLine1: "Serviço em 177 países",
      statLine2: "13 idiomas",
      statLine3: "10 apps lançados",
    },
  },
  fr: {
    home: {
      heroEyebrow: "Studio d’apps · Plateforme de vie",
      heroTitleLine1: "Allumez les idées,",
      heroTitleAccent: "et lancez le changement",
      heroLead: "Jusqu’à ce que la pensée devienne réalité — nous concevons des expériences simples et durables.",
      meaningLabel: "Identité",
      meaningTitle: "Sens du nom",
      meaningP1Html:
        "Nous allumons des idées <span class=\"co-on\">nouvelles (New)</span> <span class=\"co-on\">on (On)</span> — le moment où la pensée rejoint la réalité.",
      meaningP2: "Au moment où une petite idée passe à l’action, Newon commence.",
      meaningP3: "Nous ne faisons pas que des apps — nous créons des expériences que l’on garde dans la vie quotidienne.",
      aboutLabel: "Entreprise",
      aboutTitle: "À propos",
      aboutLead:
        "Newon est une équipe qui crée des apps pour gérer objectifs, habitudes, santé, finances, souvenirs familiaux et plus — pour un quotidien plus simple et plus intelligent.",
      aboutP2: "Nous réduisons la complexité et rendons nos services accessibles à tous, pour que les idées deviennent un vrai changement.",
      aboutP3Html:
        "Aujourd’hui, Newon aide des utilisateurs du monde entier grâce à :<br /><br />• 10 apps publiées<br />• Service dans 177 pays<br />• 13 langues prises en charge",
      workLabel: "Ce que nous faisons",
      workTitle: "Ce que nous faisons",
      workP1: "Newon ne reste pas sur un seul produit — nous lançons continuellement de nouvelles apps à partir de nombreuses idées.",
      workP2: "Chaque service s’intègre naturellement au quotidien et crée de petits changements visibles.",
      workP3Html:
        "Ce que nous créons, ce n’est pas seulement des fonctions — c’est une expérience de<br /><br />noter,<br />gérer<br />et grandir.",
      productsLabel: "Produits",
      productsTitle: "Ce que nous créons",
      productLi0: "Apps pour habitudes et journaux",
      productLi1: "Apps pour objectifs et progression",
      productLi2: "Apps pour un quotidien sain",
      productLi3: "Apps pour finances et dépenses",
      productLi4: "Apps pour la famille et les animaux",
      productLi5: "Services qui facilitent la vie",
      visionLabel: "Vision",
      visionTitle: "Notre objectif",
      visionP1Html: "Pas des apps surchargées — des <strong>apps que l’on garde longtemps</strong>.",
      visionP2: "Notre objectif est de s’intégrer au quotidien et d’aider le changement à durer.",
      visionP3: "À partir de 10 apps, nous voulons devenir une plateforme de vie globale qui connecte plus de vies.",
      statsLabel: "Statistiques",
      statsTitle: "Newon en chiffres",
      statCard0Html:
        "<span class=\"co-stats-card__value\">10+</span><span class=\"co-stats-card__label\">Apps publiées</span>",
      statCard1Html:
        "<span class=\"co-stats-card__value\">177</span><span class=\"co-stats-card__label\">Pays</span>",
      statCard2Html:
        "<span class=\"co-stats-card__value\">13</span><span class=\"co-stats-card__label\">Langues</span>",
      statCard3Html:
        "<span class=\"co-stats-card__value\">100+</span><span class=\"co-stats-card__label\">Installations</span>",
      statNewonPlusHtml: "<strong>Newon+</strong>Un abonnement<br />Pour toutes les apps",
    },
    footer: {
      tagline: "Un studio d’apps qui relie les idées à la réalité",
      statLine1: "Service dans 177 pays",
      statLine2: "13 langues",
      statLine3: "10 apps publiées",
    },
  },
  de: {
    home: {
      heroEyebrow: "App-Studio · Life-Plattform",
      heroTitleLine1: "Ideen einschalten,",
      heroTitleAccent: "Wandel beginnen",
      heroLead: "Bis Gedanken Realität werden — wir gestalten einfache, langlebige Erlebnisse.",
      meaningLabel: "Identität",
      meaningTitle: "Bedeutung des Namens",
      meaningP1Html:
        "Wir schalten <span class=\"co-on\">neue (New)</span> Ideen <span class=\"co-on\">on (On)</span> — den Moment, in dem Gedanken Realität werden.",
      meaningP2: "In dem Moment, in dem eine kleine Idee Wirklichkeit wird, beginnt Newon.",
      meaningP3: "Wir bauen nicht nur Apps — wir schaffen Erlebnisse, die im Alltag lange genutzt werden.",
      aboutLabel: "Unternehmen",
      aboutTitle: "Über uns",
      aboutLead:
        "Newon ist ein Team, das Apps entwickelt, mit denen du Ziele, Gewohnheiten, Gesundheit, Finanzen, Familienaufzeichnungen und mehr leichter und smarter verwalten kannst.",
      aboutP2: "Wir reduzieren Komplexität und machen unsere Services für alle nutzbar — damit Ideen zu echtem Wandel werden.",
      aboutP3Html:
        "Heute unterstützt Newon Menschen weltweit mit:<br /><br />• 10 veröffentlichten Apps<br />• Service in 177 Ländern<br />• 13 unterstützten Sprachen",
      workLabel: "Was wir tun",
      workTitle: "Was wir tun",
      workP1: "Newon bleibt nicht bei einem Produkt — wir entwickeln kontinuierlich neue Apps aus vielen Ideen.",
      workP2: "Jeder Service fügt sich natürlich in den Alltag ein und schafft kleine, klare Veränderungen.",
      workP3Html:
        "Was wir bauen, sind nicht nur Funktionen — sondern ein Erlebnis des<br /><br />Festhaltens,<br />Verwalten<br />und Wachsens.",
      productsLabel: "Produkte",
      productsTitle: "Was wir entwickeln",
      productLi0: "Apps für Gewohnheiten und Tagebuch",
      productLi1: "Apps für Ziele und Wachstum",
      productLi2: "Apps für einen gesunden Alltag",
      productLi3: "Apps für Finanzen und Ausgaben",
      productLi4: "Apps für Familie und Haustiere",
      productLi5: "Services, die das Leben erleichtern",
      visionLabel: "Vision",
      visionTitle: "Unser Ziel",
      visionP1Html: "Nicht Apps mit endlosen Funktionen — <strong>Apps, die man lange nutzt</strong>.",
      visionP2: "Unser Ziel ist es, im Alltag aufzugehen und dauerhaften Wandel zu ermöglichen.",
      visionP3: "Mit 10 Apps als Start wollen wir zu einer globalen Life-Plattform wachsen, die mehr Leben verbindet.",
      statsLabel: "Statistiken",
      statsTitle: "Newon in Zahlen",
      statCard0Html:
        "<span class=\"co-stats-card__value\">10+</span><span class=\"co-stats-card__label\">Apps veröffentlicht</span>",
      statCard1Html:
        "<span class=\"co-stats-card__value\">177</span><span class=\"co-stats-card__label\">Länder</span>",
      statCard2Html:
        "<span class=\"co-stats-card__value\">13</span><span class=\"co-stats-card__label\">Sprachen</span>",
      statCard3Html:
        "<span class=\"co-stats-card__value\">100+</span><span class=\"co-stats-card__label\">Installationen</span>",
      statNewonPlusHtml: "<strong>Newon+</strong>Ein Abo<br />Für alle Apps",
    },
    footer: {
      tagline: "Ein App-Studio, das Ideen mit der Realität verbindet",
      statLine1: "Service in 177 Ländern",
      statLine2: "13 Sprachen",
      statLine3: "10 veröffentlichte Apps",
    },
  },
  hi: {
    home: {
      heroEyebrow: "ऐप स्टूडियो · लाइफ प्लेटफ़ॉर्म",
      heroTitleLine1: "विचारों को चालू करें,",
      heroTitleAccent: "बदलाव शुरू करें",
      heroLead: "जब तक विचार हकीकत न बन जाए — हम सरल, लंबे समय तक चलने वाले अनुभव बनाते हैं।",
      meaningLabel: "पहचान",
      meaningTitle: "नाम का अर्थ",
      meaningP1Html:
        "हम <span class=\"co-on\">नए (New)</span> विचारों को <span class=\"co-on\">on (On)</span> करते हैं — वह क्षण जब विचार हकीकत से जुड़ता है।",
      meaningP2: "जब एक छोटा विचार कार्य में बदलता है, Newon शुरू होता है।",
      meaningP3: "हम सिर्फ ऐप नहीं बनाते — हम ऐसे अनुभव बनाते हैं जिन्हें लोग रोज़मर्रा में लंबे समय तक उपयोग करते हैं।",
      aboutLabel: "कंपनी",
      aboutTitle: "हमारे बारे में",
      aboutLead:
        "Newon एक टीम है जो लक्ष्य, आदत, स्वास्थ्य, वित्त, परिवारिक रिकॉर्ड आदि को आसान और स्मार्ट तरीके से प्रबंधित करने वाले ऐप बनाती है।",
      aboutP2: "हम जटिलता घटाते हैं और ऐसी सेवाएँ बनाते हैं जिन्हें कोई भी उपयोग कर सके, ताकि विचार वास्तविक बदलाव बनें।",
      aboutP3Html:
        "आज Newon दुनिया भर के उपयोगकर्ताओं की मदद करता है:<br /><br />• 10 ऐप जारी<br />• 177 देशों में सेवा<br />• 13 भाषाओं का समर्थन",
      workLabel: "हम क्या करते हैं",
      workTitle: "हम क्या करते हैं",
      workP1: "Newon एक ही उत्पाद पर नहीं रुकता — हम कई विचारों से नए ऐप लगातार बनाते रहते हैं।",
      workP2: "हर सेवा दैनिक जीवन में स्वाभाविक रूप से फिट होती है और छोटा, स्पष्ट बदलाव लाती है।",
      workP3Html:
        "हम जो बनाते हैं वह सिर्फ सुविधाएँ नहीं —<br /><br />रिकॉर्ड करने,<br />प्रबंधित करने<br />और बढ़ने का अनुभव है।",
      productsLabel: "उत्पाद",
      productsTitle: "हम क्या बनाते हैं",
      productLi0: "आदत और रिकॉर्डिंग के ऐप",
      productLi1: "लक्ष्य और विकास के ऐप",
      productLi2: "स्वस्थ दैनिक जीवन के ऐप",
      productLi3: "वित्त और खर्च प्रबंधन के ऐप",
      productLi4: "परिवार और पालतू जानवरों के ऐप",
      productLi5: "जीवन को आसान बनाने वाली सेवाएँ",
      visionLabel: "दृष्टि",
      visionTitle: "हमारा लक्ष्य",
      visionP1Html: "अनंत सुविधाओं वाले ऐप नहीं — <strong>ऐप जिन्हें लंबे समय तक उपयोग किया जाए</strong>।",
      visionP2: "हमारा लक्ष्य दैनिक जीवन में स्वाभाविक रूप से घुलना-मिलना और स्थायी बदलाव बनाना है।",
      visionP3: "10 ऐप से शुरू कर, हम एक वैश्विक लाइफ प्लेटफ़ॉर्म बनना चाहते हैं जो और अधिक जीवन जोड़े।",
      statsLabel: "आँकड़े",
      statsTitle: "Newon संख्याओं में",
      statCard0Html:
        "<span class=\"co-stats-card__value\">10+</span><span class=\"co-stats-card__label\">ऐप जारी</span>",
      statCard1Html:
        "<span class=\"co-stats-card__value\">177</span><span class=\"co-stats-card__label\">देश</span>",
      statCard2Html:
        "<span class=\"co-stats-card__value\">13</span><span class=\"co-stats-card__label\">भाषाएँ</span>",
      statCard3Html:
        "<span class=\"co-stats-card__value\">100+</span><span class=\"co-stats-card__label\">कुल इंस्टॉल</span>",
      statNewonPlusHtml: "<strong>Newon+</strong>एक सदस्यता<br />हर Newon ऐप के लिए",
    },
    footer: {
      tagline: "विचारों को हकीकत से जोड़ने वाला ऐप स्टूडियो",
      statLine1: "177 देशों में सेवा",
      statLine2: "13 भाषाएँ",
      statLine3: "10 ऐप जारी",
    },
  },
  id: {
    home: {
      heroEyebrow: "Studio aplikasi · Platform kehidupan",
      heroTitleLine1: "Nyalakan ide,",
      heroTitleAccent: "mulai perubahan",
      heroLead: "Hingga pikiran menjadi nyata — kami merancang pengalaman sederhana yang tahan lama.",
      meaningLabel: "Identitas",
      meaningTitle: "Arti nama",
      meaningP1Html:
        "Kami menyalakan ide <span class=\"co-on\">baru (New)</span> <span class=\"co-on\">on (On)</span> — momen ketika pikiran terhubung ke realitas.",
      meaningP2: "Saat ide kecil mulai diwujudkan, Newon dimulai.",
      meaningP3: "Kami tidak hanya membuat aplikasi — kami menciptakan pengalaman yang dipakai lama dalam kehidupan sehari-hari.",
      aboutLabel: "Perusahaan",
      aboutTitle: "Tentang kami",
      aboutLead:
        "Newon adalah tim yang membuat aplikasi untuk membantu mengelola target, kebiasaan, kesehatan, keuangan, catatan keluarga, dan lainnya — membuat kehidupan sehari-hari lebih mudah dan cerdas.",
      aboutP2: "Kami mengurangi kompleksitas dan membuat layanan yang mudah dipakai siapa saja, agar ide menjadi perubahan nyata.",
      aboutP3Html:
        "Saat ini, Newon membantu pengguna di seluruh dunia dengan:<br /><br />• 10 aplikasi dirilis<br />• Layanan di 177 negara<br />• Dukungan 13 bahasa",
      workLabel: "Apa yang kami lakukan",
      workTitle: "Apa yang kami lakukan",
      workP1: "Newon tidak berhenti pada satu produk — kami terus meluncurkan aplikasi baru dari banyak ide.",
      workP2: "Setiap layanan masuk natural ke kehidupan sehari-hari dan menciptakan perubahan kecil yang jelas.",
      workP3Html:
        "Yang kami buat bukan sekadar fitur — melainkan pengalaman<br /><br />mencatat,<br />mengelola,<br />dan berkembang.",
      productsLabel: "Produk",
      productsTitle: "Yang kami buat",
      productLi0: "Aplikasi kebiasaan dan pencatatan",
      productLi1: "Aplikasi target dan pertumbuhan",
      productLi2: "Aplikasi untuk hidup sehat",
      productLi3: "Aplikasi keuangan dan pengeluaran",
      productLi4: "Aplikasi keluarga dan hewan peliharaan",
      productLi5: "Layanan yang membuat hidup lebih praktis",
      visionLabel: "Visi",
      visionTitle: "Tujuan kami",
      visionP1Html: "Bukan aplikasi dengan fitur tak terbatas — <strong>aplikasi yang dipakai lama</strong>.",
      visionP2: "Tujuan kami menyatu dengan kehidupan sehari-hari dan membantu perubahan yang berkelanjutan.",
      visionP3: "Dari 10 aplikasi, kami ingin tumbuh menjadi platform kehidupan global yang menghubungkan lebih banyak kehidupan.",
      statsLabel: "Statistik",
      statsTitle: "Newon dalam angka",
      statCard0Html:
        "<span class=\"co-stats-card__value\">10+</span><span class=\"co-stats-card__label\">Aplikasi dirilis</span>",
      statCard1Html:
        "<span class=\"co-stats-card__value\">177</span><span class=\"co-stats-card__label\">Negara</span>",
      statCard2Html:
        "<span class=\"co-stats-card__value\">13</span><span class=\"co-stats-card__label\">Bahasa</span>",
      statCard3Html:
        "<span class=\"co-stats-card__value\">100+</span><span class=\"co-stats-card__label\">Instalasi</span>",
      statNewonPlusHtml: "<strong>Newon+</strong>Satu langganan<br />Untuk semua aplikasi",
    },
    footer: {
      tagline: "Studio aplikasi yang menghubungkan ide ke realitas",
      statLine1: "Layanan di 177 negara",
      statLine2: "13 bahasa",
      statLine3: "10 aplikasi dirilis",
    },
  },
};

function deepAssign(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      target[k] = target[k] && typeof target[k] === "object" ? target[k] : {};
      deepAssign(target[k], v);
    } else {
      target[k] = v;
    }
  }
}

for (const [lang, patch] of Object.entries(PATCHES)) {
  const file = path.join(LOCALES, `${lang}.json`);
  const loc = JSON.parse(fs.readFileSync(file, "utf8"));
  deepAssign(loc, patch);
  fs.writeFileSync(file, JSON.stringify(loc, null, 2) + "\n", "utf8");
  console.log(`apply-home-locale-translations: ${lang} OK`);
}

console.log("apply-home-locale-translations: OK");
