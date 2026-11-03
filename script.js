(function(){
  "use strict";
  var D = window.SITE_DATA || {halacha:[], shiurim:[], series:[]};
  var S = D.settings || {};
  var $ = function(s, r){ return (r||document).querySelector(s); };
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }
  function norm(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\u0591-\u05c7]/g,"").replace(/[\u2019'`\u00b4"\u05f4\u05f3]/g,"").replace(/\s+/g," ").trim(); }
  function pd(iso){ var p = iso.split("-"); return new Date(Date.UTC(+p[0], +p[1]-1, +p[2])); }
  function fmtDate(iso){ var d = pd(iso); return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()].slice(0,3) + " " + d.getUTCFullYear(); }
  function fmtLong(iso){ var d = pd(iso); return DAYS[d.getUTCDay()] + ", " + d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function monthKey(iso){ var d = pd(iso); return MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function todayIso(){ var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth()+1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function isHe(s){ return /[\u0590-\u05ff]/.test(s); }
  function heAttr(s){ return isHe(s) ? ' lang="he" dir="rtl"' : ''; }

  var ICON = {
    audio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="3" y="14" width="4" height="6" rx="1"/><rect x="17" y="14" width="4" height="6" rx="1"/></svg>',
    doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'
  };

  // ---- topics: plain-English subtitles and colour families ----
  var TOPIC = {
    "Muktza": ["What may and may not be moved on Shabbos", "blue"],
    "Hachana: Preparing on Shabbos": ["Getting ready on Shabbos for after Shabbos", "blue"],
    "V'Daber Davar: Speech on Shabbos": ["Weekday talk and business talk on Shabbos", "blue"],
    "Mekach u'Memkar & Schar Shabbos": ["Buying, selling and being paid for Shabbos work", "blue"],
    "Shtarei Hedyotos: Reading on Shabbos": ["Letters, news and ads on Shabbos", "blue"],
    "Medida: Measuring on Shabbos": ["Weighing and measuring on Shabbos", "blue"],
    "Tzedaka & Ma'aser": ["Charity, priorities and giving a tenth", "orange"],
    "Hafrashas Challah": ["Separating challah when baking at home", "orange"],
    "Yamim Tovim & Seasons": ["The festivals and the Jewish year", "orange"],
    "Chanuka": ["Lighting and the laws of Chanuka", "orange"],
    "Tefilla: Interruptions in Davening": ["When you may pause or respond during prayer", "navy"],
    "Shomea k'Oneh": ["Fulfilling a blessing by listening", "navy"],
    "Brachos on Fragrances": ["Blessings on pleasant smells", "navy"],
    "Ein Ma'avirin al haMitzvos": ["Not passing over a mitzvah", "navy"],
    "Arvus: Kol Yisroel Areivim": ["Responsibility for one another", "navy"],
    "Klalei haMitzvos": ["General principles of the mitzvos", "navy"]
  };
  var FAMILY = [
    {key:"blue", name:"Shabbos", blurb:"Practical questions for the seventh day."},
    {key:"orange", name:"Giving, home & the year", blurb:"Tzedaka, the kitchen and the festivals."},
    {key:"navy", name:"Prayer, blessings & mitzvos", blurb:"How we daven, bless and act."}
  ];

  // ---- languages for the daily halachos (EN / DE / RU); the rest of the site stays English ----
  var LANGS = ["en", "de", "ru"];
  var LANG_NAME = {en:"English", de:"Deutsch", ru:"Русский"};
  var lang = (function(){ try { var v = localStorage.getItem("raaj-lang"); return LANGS.indexOf(v) >= 0 ? v : "en"; } catch(e){ return "en"; } })();
  var SER_I18N = {"Muktza": ["Mukze", "Мукцэ"], "Hachana: Preparing on Shabbos": ["Hachana: Vorbereiten am Schabbos", "Ахана: подготовка в Шаббат"], "V'Daber Davar: Speech on Shabbos": ["WeDaber Dawar: Sprechen am Schabbos", "Ве-дабер давар: речь в Шаббат"], "Mekach u'Memkar & Schar Shabbos": ["Mekach uMemkar & Schar Schabbos", "Меках у-мемкар и схар Шаббат"], "Shtarei Hedyotos: Reading on Shabbos": ["Schtarei Hedjotos: Lesen am Schabbos", "Штарей эдьйотот: чтение в Шаббат"], "Medida: Measuring on Shabbos": ["Medida: Messen am Schabbos", "Мэдида: измерения в Шаббат"], "Tzedaka & Ma'aser": ["Zedaka & Ma'asser", "Цдака и маасер"], "Hafrashas Challah": ["Hafraschas Challa", "Афрашат хала"], "Yamim Tovim & Seasons": ["Jamim Towim & Jahreszeiten", "Йамим товим и времена года"], "Chanuka": ["Chanukka", "Ханука"], "Tefilla: Interruptions in Davening": ["Tefilla: Unterbrechungen beim Gebet", "Тфила: перерывы в молитве"], "Shomea k'Oneh": ["Schomea k'Oneh", "Шомеа ке-оне"], "Brachos on Fragrances": ["Brachos auf Wohlgerüche", "Брахот на благовония"], "Ein Ma'avirin al haMitzvos": ["Ein Ma'avirin al haMizwos", "Эйн маавирин аль а-мицвот"], "Arvus: Kol Yisroel Areivim": ["Arwus: Kol Jisroel Arewim", "Арвут: коль Исраэль арэвим"], "Klalei haMitzvos": ["Klalei haMizwos", "Клалей а-мицвот"]};
  var SUB_I18N = {"Muktza": ["Was am Schabbos bewegt werden darf und was nicht", "Что можно и что нельзя переносить в Шаббат"], "Hachana: Preparing on Shabbos": ["Am Schabbos für die Zeit danach vorbereiten", "Подготовка в Шаббат к тому, что после него"], "V'Daber Davar: Speech on Shabbos": ["Alltags- und Geschäftsgespräche am Schabbos", "Будничные и деловые разговоры в Шаббат"], "Mekach u'Memkar & Schar Shabbos": ["Kaufen, verkaufen und Lohn für Arbeit am Schabbos", "Покупка, продажа и плата за работу в Шаббат"], "Shtarei Hedyotos: Reading on Shabbos": ["Briefe, Nachrichten und Werbung am Schabbos", "Письма, новости и реклама в Шаббат"], "Medida: Measuring on Shabbos": ["Wiegen und Messen am Schabbos", "Взвешивание и измерение в Шаббат"], "Tzedaka & Ma'aser": ["Zedaka, Prioritäten und der Zehnte", "Цдака, приоритеты и десятина"], "Hafrashas Challah": ["Challa absondern beim Backen zu Hause", "Отделение халы при домашней выпечке"], "Yamim Tovim & Seasons": ["Die Feiertage und das jüdische Jahr", "Праздники и еврейский год"], "Chanuka": ["Das Lichterzünden und die Halachos von Chanukka", "Зажигание свечей и законы Хануки"], "Tefilla: Interruptions in Davening": ["Wann man beim Gebet unterbrechen oder antworten darf", "Когда можно прервать молитву или ответить"], "Shomea k'Oneh": ["Eine Bracha durch Zuhören erfüllen", "Исполнение брахи через слушание"], "Brachos on Fragrances": ["Brachos auf angenehme Düfte", "Брахот на приятные запахи"], "Ein Ma'avirin al haMitzvos": ["Eine Mizwa nicht übergehen", "Не проходить мимо мицвы"], "Arvus: Kol Yisroel Areivim": ["Verantwortung füreinander", "Ответственность друг за друга"], "Klalei haMitzvos": ["Allgemeine Grundsätze der Mizwos", "Общие принципы мицвот"]};
  var MONTHS_I18N = {
    de: {nom:["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"], short:["Jan.","Feb.","März","Apr.","Mai","Juni","Juli","Aug.","Sep.","Okt.","Nov.","Dez."], days:["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Schabbos"]},
    ru: {nom:["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"], gen:["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"], short:["янв.","февр.","марта","апр.","мая","июня","июля","авг.","сент.","окт.","нояб.","дек."], days:["воскресенье","понедельник","вторник","среда","четверг","пятница","Шаббат"]}
  };
  var UI = {
    en: {dh:"Daily Halacha", part:"Part {n} of {m}", listen:"Listen", recSoon:"The recording will play here once it is shared for streaming.", noRec:"No recording for this one yet.",
         fallback:"A short recorded shiur from the series \u201c{s}\u201d. A written summary will follow.", sources:"Sources", inSeries:"In this series", parts:"{n} parts", allInSeries:"All {n} in this series",
         prev:"Previous day", next:"Next day", lede:"A short halacha each morning, recorded in Berlin. {n} so far, since {m}.", searchPh:"Search titles, topics, sources", allTopics:"All topics",
         found:"{n} halachos found", found1:"1 halacha found", inArch:"{n} halachos in the archive", rec:"Recording", src1:"1 source", srcN:"{n} sources", more:"Show more ({n} more)",
         note:"Recordings will play here once they are shared for streaming.", none:"Nothing matches that search yet.", translated:"", today:"Today", latest:"Latest", read:"Read & listen",
         play:"Play", pause:"Pause", recLang:"Recording \u00b7 English", noPlay:"Not playing? Open it in Google Drive",
         allHal:"All halachos", browse:"Browse by topic", lang:"Language of the halachos", kicker:"Every morning", archKicker:"Archive"},
    de: {dh:"Tägliche Halacha", part:"Teil {n} von {m}", listen:"Anhören", recSoon:"Die Aufnahme (auf Englisch) kann hier angehört werden, sobald sie zum Streamen freigegeben ist.", noRec:"Für diese Halacha gibt es noch keine Aufnahme.",
         fallback:"Ein kurzer aufgezeichneter Schiur aus der Reihe \u201e{s}\u201c. Eine schriftliche Zusammenfassung folgt.", sources:"Quellen", inSeries:"In dieser Reihe", parts:"{n} Teile", allInSeries:"Alle {n} Teile dieser Reihe",
         prev:"Vorheriger Tag", next:"Nächster Tag", lede:"Jeden Morgen eine kurze Halacha, aufgenommen in Berlin. Bisher {n}, seit {m}.", searchPh:"Titel, Themen, Quellen durchsuchen", allTopics:"Alle Themen",
         found:"{n} Halachos gefunden", found1:"1 Halacha gefunden", inArch:"{n} Halachos im Archiv", rec:"Aufnahme", src1:"1 Quelle", srcN:"{n} Quellen", more:"Mehr anzeigen (noch {n})",
         note:"Die Aufnahmen (auf Englisch) können hier angehört werden, sobald sie freigegeben sind.", none:"Keine Treffer.", translated:"Aus dem Englischen übersetzt.", today:"Heute", latest:"Neueste", read:"Lesen & anhören",
         play:"Abspielen", pause:"Pause", recLang:"Aufnahme \u00b7 auf Englisch", noPlay:"Spielt nicht? In Google Drive öffnen",
         allHal:"Alle Halachos", browse:"Nach Thema", lang:"Sprache der Halachos", kicker:"Jeden Morgen", archKicker:"Archiv"},
    ru: {dh:"Ежедневная галаха", part:"Часть {n} из {m}", listen:"Слушать", recSoon:"Аудиозапись (на английском) появится здесь, когда она будет открыта для прослушивания.", noRec:"Для этой галахи пока нет записи.",
         fallback:"Короткий записанный шиур из серии \u00ab{s}\u00bb. Письменное изложение появится позже.", sources:"Источники", inSeries:"В этой серии", parts:"частей: {n}", allInSeries:"Вся серия ({n})",
         prev:"Предыдущий день", next:"Следующий день", lede:"Каждое утро – короткая галаха, записанная в Берлине. Уже {n}, начиная с {m}.", searchPh:"Поиск по названиям, темам, источникам", allTopics:"Все темы",
         found:"Найдено: {n}", found1:"Найдено: 1", inArch:"В архиве: {n}", rec:"Запись", src1:"1 источник", srcN:"Источников: {n}", more:"Показать ещё ({n})",
         note:"Аудиозаписи (на английском) появятся здесь, когда будут открыты для прослушивания.", none:"Ничего не найдено.", translated:"Перевод с английского.", today:"Сегодня", latest:"Последняя", read:"Читать и слушать",
         play:"Слушать", pause:"Пауза", recLang:"Запись \u00b7 на английском", noPlay:"Не играет? Открыть в Google Drive",
         allHal:"Все галахот", browse:"По темам", lang:"Язык галахот", kicker:"Каждое утро", archKicker:"Архив"}
  };
  function L(k, v){ var t = UI[lang][k]; if (t == null) t = UI.en[k]; if (v) Object.keys(v).forEach(function(x){ t = t.split("{" + x + "}").join(v[x]); }); return t; }
  function tt(e){ return (lang !== "en" && e["title_" + lang]) || e.title; }
  function tsum(e){ return (lang !== "en" && e["summary_" + lang]) || e.summary; }
  function tsrc(e){ var s = lang !== "en" && e["sources_" + lang]; return s && s.length ? s : (e.sources || []); }
  function sname(s){ return (lang !== "en" && SER_I18N[s] && SER_I18N[s][lang === "de" ? 0 : 1]) || s; }
  function hsub(s){ return (lang !== "en" && SUB_I18N[s] && SUB_I18N[s][lang === "de" ? 0 : 1]) || tsub(s); }
  function la(){ return lang === "en" ? "" : ' lang="' + lang + '"'; }
  function dDate(iso){ if (lang === "en") return fmtDate(iso); var d = pd(iso), M = MONTHS_I18N[lang]; return lang === "de" ? d.getUTCDate() + ". " + M.short[d.getUTCMonth()] + " " + d.getUTCFullYear() : d.getUTCDate() + " " + M.short[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function dLong(iso){ if (lang === "en") return fmtLong(iso); var d = pd(iso), M = MONTHS_I18N[lang]; return lang === "de" ? M.days[d.getUTCDay()] + ", " + d.getUTCDate() + ". " + M.nom[d.getUTCMonth()] + " " + d.getUTCFullYear() : M.days[d.getUTCDay()] + ", " + d.getUTCDate() + " " + M.gen[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function dMonth(iso){ if (lang === "en") return monthKey(iso); var d = pd(iso); return MONTHS_I18N[lang].nom[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function dMonthShort(iso){ var d = pd(iso); return lang === "en" ? MONTHS[d.getUTCMonth()].slice(0,3) : MONTHS_I18N[lang].short[d.getUTCMonth()]; }
  function dSince(iso){ if (lang !== "ru") return dMonth(iso); var d = pd(iso); return MONTHS_I18N.ru.gen[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function langSwitch(dark){
    return '<div class="lang-switch' + (dark ? ' on-dark' : '') + '" role="group" aria-label="' + esc(L("lang")) + '">' + LANGS.map(function(l){
      return '<button type="button" data-lang="' + l + '" lang="' + l + '" aria-pressed="' + (l === lang) + '" title="' + LANG_NAME[l] + '">' + l.toUpperCase() + '</button>'; }).join("") + '</div>';
  }
  function setLang(l){
    if (LANGS.indexOf(l) < 0 || l === lang) return;
    lang = l; try { localStorage.setItem("raaj-lang", l); } catch(e){}
    var y = window.scrollY; route(); window.scrollTo(0, y);
  }
  document.addEventListener("click", function(ev){ var b = ev.target.closest && ev.target.closest("[data-lang]"); if (b) { ev.preventDefault(); setLang(b.getAttribute("data-lang")); } });
  function tcol(s){ return (TOPIC[s] && TOPIC[s][1]) || "navy"; }
  function tsub(s){ return (TOPIC[s] && TOPIC[s][0]) || ""; }
  function short(s){ return String(s||"").split(":")[0]; }

  // ---- data prep ----
  var items = D.halacha.slice().sort(function(a,b){ return a.date < b.date ? 1 : a.date > b.date ? -1 : (b.order||0) - (a.order||0); });
  var byId = {};
  items.forEach(function(e, i){ e._i = i; e._id = String(e.id || e.order); byId[e._id] = e; byId["n" + e.order] = e;
    var sr = SER_I18N[e.series] || [], sb = SUB_I18N[e.series] || [];
    e._q = norm([e.title, e.title_de, e.title_ru, e.series, sr[0], sr[1], tsub(e.series), sb[0], sb[1], e.summary, e.summary_de, e.summary_ru, (e.sources||[]).join(" "), (e.sources_de||[]).join(" "), (e.sources_ru||[]).join(" "), e.alt||""].join(" ")); });
  function getItem(id){ return byId[id] || (/^\d+$/.test(id) ? byId["n" + id] : null); }
  var seriesStats = {};
  items.forEach(function(e){ var s = seriesStats[e.series] || (seriesStats[e.series] = {n:0, first:e.date, last:e.date, list:[]}); s.n++; if (e.date < s.first) s.first = e.date; if (e.date > s.last) s.last = e.date; s.list.push(e); });
  Object.keys(seriesStats).forEach(function(k){ seriesStats[k].list.reverse(); }); // oldest first
  var essays = (D.shiurim.filter(function(g){ return g.group === "Articles"; })[0] || {items:[]}).items;
  var listenGroups = D.shiurim.filter(function(g){ return g.group !== "Articles"; });
  var listenCount = listenGroups.reduce(function(n,g){ return n + g.items.length; }, 0);
  var first = items[items.length-1], latest = items[0];

  function tag(s, link){ var c = tcol(s); var inner = esc(short(sname(s))); return link ? '<a class="tag tag-' + c + '" href="#/halacha?topic=' + encodeURIComponent(s) + '">' + inner + '</a>' : '<span class="tag tag-' + c + '">' + inner + '</span>'; }
  function hl(text, terms){
    var out = esc(text);
    terms.forEach(function(t){ if (t.length < 2) return; try { out = out.replace(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + ")","gi"), "<mark>$1</mark>"); } catch(e){} });
    return out;
  }
  function excerpt(s, n){ s = String(s||""); if (s.length <= n) return s; return s.slice(0, s.lastIndexOf(" ", n)) + "\u2026"; }
  function rv(i){ return ' style="--i:' + i + '"'; }

  // ---- views ----
  function cardHalacha(e, i){
    return '<a class="card rv"' + rv(i) + ' href="#/halacha/' + e._id + '">' +
      '<div class="card-top">' + tag(e.series) + (e.aid ? '<span class="rec" title="Recording">' + ICON.audio + '</span>' : '') + '</div>' +
      '<h3' + la() + '>' + esc(tt(e)) + '</h3>' +
      (tsum(e) ? '<p class="card-ex"' + la() + '>' + esc(excerpt(tsum(e), 120)) + '</p>' : '<p class="card-ex muted"' + la() + '>' + esc(hsub(e.series)) + '</p>') +
      '<p class="card-date">' + dDate(e.date) + '</p></a>';
  }
  function essayCard(it, i){
    return '<article class="essay rv"' + rv(i) + '><span class="tag tag-ink">Essay</span><h3' + heAttr(it.title) + '>' + esc(it.title) + '</h3><p>' + esc(it.detail.replace(/^Article\s*·?\s*/, "") || "\u00a0") + '</p></article>';
  }

  function heroTitle(){
    var h = esc(S.hero_headline || "A Perspective from Berlin on Torah Topics and Current Events");
    return h.replace("Torah Topics", "<em>Torah Topics</em>").replace("Current Events", '<em class="alt">Current Events</em>');
  }
  function viewHome(){
    var recent = items.slice(1, 7);
    var famChips = Object.keys(seriesStats).sort(function(a,b){ return seriesStats[b].n - seriesStats[a].n; });
    var isToday = latest.date === todayIso();
    return '' +
    '<section class="hero">' +
      '<div class="wrap hero-inner">' +
        '<div class="hero-art rv"' + rv(0) + ' aria-hidden="true"><div class="glow"></div><img src="img/mark-256.png" width="256" height="256" alt=""></div>' +
        '<div class="hero-text">' +
          '<p class="eyebrow rv"' + rv(1) + '>Raajonoth <span>·</span> Berlin</p>' +
          '<h1 class="hero-title rv"' + rv(2) + '>' + heroTitle() + '</h1>' +
          '<p class="hero-sub rv"' + rv(3) + '>' + esc(S.hero_line || "") + '</p>' +
          '<div class="hero-cta rv"' + rv(4) + '><a class="btn btn-orange" href="#/topics">Explore the topics ' + ICON.arrow + '</a><a class="btn btn-ghost" href="#/about">About</a></div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section wrap" id="writing">' +
      '<div class="sec-head"><div><p class="kicker">Writing</p><h2>Torah &amp; Current Events</h2></div><a class="more-link" href="#/topics">Topics ' + ICON.arrow + '</a></div>' +
      '<p class="sec-lede">' + esc(S.essays_intro || "") + '</p>' +
      '<div class="essay-grid">' + essays.map(essayCard).join("") + '</div>' +
    '</section>' +

    '<section class="section halacha-block" id="daily-halacha" aria-labelledby="dh-title">' +
      '<div class="wrap">' +
        '<div class="dh-head">' +
          '<div><p class="kicker">' + esc(L("kicker")) + '</p><h2 id="dh-title"' + la() + '>' + esc(L("dh")) + '</h2>' +
          '<p class="sec-lede">' + esc(S.halacha_intro || "") + '</p></div>' +
          langSwitch(false) +
        '</div>' +
        '<div class="featured-grid">' +
          '<a class="featured rv"' + rv(1) + ' href="#/halacha/' + latest._id + '">' +
            '<div class="featured-top"><span class="kicker">' + esc(isToday ? L("today") : L("latest")) + ' \u00b7 ' + dDate(latest.date) + '</span>' + tag(latest.series) + '</div>' +
            '<h3' + la() + '>' + esc(tt(latest)) + '</h3>' +
            (tsum(latest) ? '<p' + la() + '>' + esc(excerpt(tsum(latest), 260)) + '</p>' : '') +
            '<span class="read">' + esc(L("read")) + ' ' + ICON.arrow + '</span>' +
          '</a>' +
          '<div class="card-grid">' + recent.map(function(e,i){ return cardHalacha(e, i+2); }).join("") + '</div>' +
        '</div>' +
        '<div class="dh-foot"><p class="dh-browse">' + esc(L("browse")) + '</p>' +
          '<div class="chips">' + famChips.map(function(s){ return '<a class="chip chip-' + tcol(s) + '" href="#/halacha?topic=' + encodeURIComponent(s) + '"' + la() + '>' + esc(short(sname(s))) + '<span>' + seriesStats[s].n + '</span></a>'; }).join("") + '</div>' +
          '<a class="btn btn-dark dh-all" href="#/halacha">' + esc(L("allHal")) + ' (' + items.length + ') ' + ICON.arrow + '</a>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="listen-band">' +
      '<div class="wrap listen-inner">' +
        '<div><p class="kicker kicker-light">Listen</p><h2>Shiurim, talks &amp; source sheets</h2><p>' + listenCount + ' recordings and sheets: the festivals, Shabbos, the Lakewood years and the Rabbinerseminar.</p></div>' +
        '<a class="btn btn-light" href="#/listen">Browse recordings ' + ICON.arrow + '</a>' +
      '</div>' +
    '</section>';
  }

  var arch = {q:"", topic:"", shown:40};
  function viewArchive(params){
    arch.q = params.q || ""; arch.topic = params.topic || ""; arch.shown = 40;
    var opts = '<option value="">' + esc(L("allTopics")) + '</option>' + D.series.map(function(s){ return '<option value="' + esc(s) + '"' + (s === arch.topic ? ' selected' : '') + '>' + esc(sname(s)) + '</option>'; }).join("");
    return '' +
    '<section class="page-head"' + la() + '><div class="wrap">' +
      '<div class="ph-row"><div><p class="kicker">' + esc(L("archKicker")) + '</p><h1>' + esc(L("dh")) + '</h1></div>' + langSwitch(false) + '</div>' +
      '<p class="lede">' + esc(L("lede", {n: items.length, m: dSince(first.date)})) + '</p>' +
    '</div></section>' +
    '<div class="toolbar"' + la() + '><div class="wrap toolbar-inner">' +
      '<label class="search"><span class="sr">' + esc(L("searchPh")) + '</span>' + ICON.search + '<input id="q" type="search" placeholder="' + esc(L("searchPh")) + '" autocomplete="off" value="' + esc(arch.q) + '"></label>' +
      '<label class="select"><span class="sr">' + esc(L("allTopics")) + '</span><select id="topic">' + opts + '</select></label>' +
    '</div></div>' +
    '<section class="wrap archive-wrap"' + la() + '>' +
      '<p id="count" class="count" aria-live="polite"></p><div id="archive"></div>' +
    '</section>';
  }
  function renderArchive(){
    var box = $("#archive"); if (!box) return;
    var q = norm(arch.q); var terms = q ? q.split(" ").filter(Boolean) : [];
    var list = items.filter(function(e){ return (!arch.topic || e.series === arch.topic) && terms.every(function(t){ return e._q.indexOf(t) !== -1; }); });
    $("#count").textContent = (q || arch.topic) ? (list.length === 1 ? L("found1") : L("found", {n: list.length})) : L("inArch", {n: list.length});
    var html = "", last = "";
    list.slice(0, arch.shown).forEach(function(e){
      var mk = dMonth(e.date);
      if (mk !== last) { if (last) html += '</div>'; html += '<h2 class="month">' + mk + '</h2><div class="rows">'; last = mk; }
      var d = pd(e.date), n = (e.sources || []).length, sum = tsum(e);
      html += '<a class="row" href="#/halacha/' + e._id + '"><span class="row-date"><b>' + d.getUTCDate() + '</b>' + dMonthShort(e.date) + '</span>' +
        '<span class="row-main"><span class="row-title">' + hl(tt(e), terms) + '</span>' +
        '<span class="row-meta">' + tag(e.series) + (e.aid ? '<span class="rec-s">' + ICON.audio + esc(L("rec")) + '</span>' : '') + (n ? '<span class="src-s">' + esc(n === 1 ? L("src1") : L("srcN", {n: n})) + '</span>' : '') + '</span>' +
        (sum && terms.length ? '<span class="row-ex">' + hl(excerpt(sum, 160), terms) + '</span>' : '') +
        '</span><span class="row-arrow">' + ICON.arrow + '</span></a>';
    });
    if (last) html += '</div>';
    if (!list.length) html = '<p class="noresult">' + esc(L("none")) + '</p>';
    if (list.length > arch.shown) html += '<button class="btn btn-dark more" id="more" type="button">' + esc(L("more", {n: list.length - arch.shown})) + '</button>';
    box.innerHTML = html;
    var m = $("#more"); if (m) m.addEventListener("click", function(){ arch.shown += 80; renderArchive(); });
  }
  function bindArchive(){
    var qi = $("#q"), ts = $("#topic");
    qi.addEventListener("input", function(){ arch.q = qi.value; arch.shown = 40; renderArchive(); syncHash(); });
    ts.addEventListener("change", function(){ arch.topic = ts.value; arch.shown = 40; renderArchive(); syncHash(); });
    renderArchive();
  }
  var silent = false;
  function syncHash(){
    var p = [];
    if (arch.topic) p.push("topic=" + encodeURIComponent(arch.topic));
    if (arch.q) p.push("q=" + encodeURIComponent(arch.q));
    silent = true; history.replaceState(null, "", "#/halacha" + (p.length ? "?" + p.join("&") : "")); silent = false;
  }

  // ---- audio: Google Drive recordings, played in Drive's own embedded player ----
  // (a plain <audio> pointing at Drive is blocked by Chrome, so the /preview player is used)
  function drivePrev(id){ return "https://drive.google.com/file/d/" + encodeURIComponent(id) + "/preview"; }
  function driveView(id){ return "https://drive.google.com/file/d/" + encodeURIComponent(id) + "/view"; }
  function frame(id, title){ return '<div class="pframe"><iframe src="' + drivePrev(id) + '" title="' + esc(title) + '" loading="lazy" allow="autoplay; encrypted-media" referrerpolicy="no-referrer-when-downgrade"></iframe></div>'; }
  function livePlayer(id, label, sub, big, title){
    return '<div class="player is-live" role="group" aria-label="' + esc(label) + '" data-aid="' + esc(id) + '">' +
      '<div class="ph"><span class="ph-ic">' + ICON.audio + '</span><div class="player-text"><b>' + esc(label) + '</b><span>' + esc(sub) + '</span></div></div>' +
      frame(id, title || label) +
      '<a class="perr" target="_blank" rel="noopener" href="' + driveView(id) + '">' + esc(L("noPlay")) + '</a></div>';
  }
  function trackPlayer(it){
    return '<li class="track is-live" data-aid="' + esc(it.aid) + '"><button class="track-ic is-audio play" type="button" aria-expanded="false" aria-label="' + esc(L("play") + ": " + it.title) + '">' + ICON.play + '</button>' +
      '<span class="track-main"><b' + heAttr(it.title) + '>' + esc(it.title) + '</b><span>' + esc(it.detail) + '</span></span><div class="track-player" hidden></div></li>';
  }
  function stopAudio(){ document.querySelectorAll(".track-player").forEach(function(x){ x.innerHTML = ""; x.hidden = true; }); }
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest(".track.is-live .play"); if (!b) return;
    ev.preventDefault();
    var li = b.closest(".track"), box = li.querySelector(".track-player"), open = box.hidden;
    document.querySelectorAll(".track.is-live").forEach(function(o){ var x = o.querySelector(".track-player"); x.innerHTML = ""; x.hidden = true; o.classList.remove("is-open"); var ob = o.querySelector(".play"); ob.innerHTML = ICON.play; ob.setAttribute("aria-expanded", "false"); });
    if (open) {
      var id = li.getAttribute("data-aid"), t = li.querySelector("b").textContent;
      box.innerHTML = frame(id, t) + '<a class="perr" target="_blank" rel="noopener" href="' + driveView(id) + '">' + esc(L("noPlay")) + '</a>';
      box.hidden = false; li.classList.add("is-open"); b.innerHTML = ICON.pause; b.setAttribute("aria-expanded", "true");
    }
  });

  function viewDetail(id){
    var e = getItem(id);
    if (!e) return '<section class="page-head"><div class="wrap"><h1>Not found</h1><p class="lede">That halacha isn\u2019t here. <a href="#/halacha">Back to the archive</a>.</p></div></section>';
    var st = seriesStats[e.series], idx = st.list.indexOf(e);
    var newer = items[e._i - 1], older = items[e._i + 1];
    var around = st.list.slice(Math.max(0, idx - 3), idx + 4);
    var summary = tsum(e), sources = tsrc(e), translated = lang !== "en" && (e["title_" + lang] || e["summary_" + lang]);
    return '' +
    '<article class="detail"' + la() + '>' +
      '<header class="detail-head"><div class="wrap narrow">' +
        '<div class="detail-bar"><a class="back" href="#/halacha">' + ICON.back + ' ' + esc(L("dh")) + '</a>' + langSwitch(true) + '</div>' +
        '<div class="detail-tags">' + tag(e.series, true) + '<span class="part">' + esc(L("part", {n: idx + 1, m: st.n})) + '</span></div>' +
        '<h1>' + esc(tt(e)) + '</h1>' +
        '<p class="detail-date">' + esc(dLong(e.date)) + '</p>' +
      '</div></header>' +
      '<div class="wrap narrow detail-body">' +
        (e.aid ? livePlayer(e.aid, L("listen"), L("recLang"), true, tt(e)) :
        '<div class="player" role="group" aria-label="' + esc(L("listen")) + '"><button class="play" type="button" disabled aria-label="' + esc(L("listen")) + '">' + ICON.play + '</button><div class="player-text"><b>' + esc(L("listen")) + '</b><span>' + esc(e.audio ? L("recSoon") : L("noRec")) + '</span></div><div class="wave" aria-hidden="true">' + Array(28).join("<i></i>") + '</div></div>') +
        (summary ? '<div class="prose"><p>' + esc(summary) + '</p></div>' : '<div class="prose"><p class="muted">' + esc(hsub(e.series) ? hsub(e.series) + '. ' : '') + esc(L("fallback", {s: sname(e.series)})) + '</p></div>') +
        (sources.length ? '<div class="sources"><h2>' + esc(L("sources")) + '</h2><ul>' + sources.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div>' : '') +
        (translated && L("translated") ? '<p class="tr-note">' + esc(L("translated")) + '</p>' : '') +
        '<div class="series-box"><div class="series-head"><p class="kicker">' + esc(L("inSeries")) + '</p><h2>' + esc(sname(e.series)) + '</h2><p>' + esc(hsub(e.series)) + ' \u00b7 ' + esc(L("parts", {n: st.n})) + '</p></div><ol class="series-list">' +
          around.map(function(x){ var n = st.list.indexOf(x) + 1; return '<li' + (x === e ? ' class="current" aria-current="page"' : '') + '><a href="#/halacha/' + x._id + '"><span class="n">' + n + '</span><span class="t">' + esc(tt(x)) + '</span><span class="d">' + dDate(x.date) + '</span></a></li>'; }).join("") +
        '</ol><a class="more-link" href="#/halacha?topic=' + encodeURIComponent(e.series) + '">' + esc(L("allInSeries", {n: st.n})) + ' ' + ICON.arrow + '</a></div>' +
        '<nav class="pager" aria-label="' + esc(L("prev")) + ' / ' + esc(L("next")) + '">' +
          (older ? '<a class="pg prev" href="#/halacha/' + older._id + '"><span>' + ICON.back + ' ' + esc(L("prev")) + '</span><b>' + esc(tt(older)) + '</b></a>' : '<span></span>') +
          (newer ? '<a class="pg next" href="#/halacha/' + newer._id + '"><span>' + esc(L("next")) + ' ' + ICON.arrow + '</span><b>' + esc(tt(newer)) + '</b></a>' : '<span></span>') +
        '</nav>' +
      '</div>' +
    '</article>';
  }

  function viewTopics(){
    return '' +
    '<section class="page-head"><div class="wrap"><p class="kicker">Explore</p><h1>Topics</h1><p class="lede">Torah topics and current events, and every series of the daily halacha in plain English.</p></div></section>' +
    '<section class="section wrap first">' +
      '<div class="sec-head"><div><p class="kicker">Writing</p><h2>Torah &amp; Current Events</h2></div></div>' +
      '<div class="essay-grid">' + essays.map(essayCard).join("") + '</div>' +
    '</section>' +
    FAMILY.map(function(f){
      var ss = Object.keys(seriesStats).filter(function(s){ return tcol(s) === f.key; }).sort(function(a,b){ return seriesStats[b].n - seriesStats[a].n; });
      return '<section class="section wrap"><div class="sec-head"><div><p class="kicker">Daily Halacha</p><h2>' + esc(f.name) + '</h2></div></div><p class="sec-lede">' + esc(f.blurb) + '</p><div class="topic-grid">' +
        ss.map(function(s, i){ var st = seriesStats[s]; return '<a class="topic topic-' + f.key + ' rv"' + rv(i) + ' href="#/halacha?topic=' + encodeURIComponent(s) + '"><span class="topic-n">' + st.n + '</span><h3>' + esc(s) + '</h3><p>' + esc(tsub(s)) + '</p><span class="topic-d">' + monthKey(st.first).replace(/^(\w{3})\w*/, "$1") + (st.first.slice(0,7) !== st.last.slice(0,7) ? ' \u2013 ' + monthKey(st.last).replace(/^(\w{3})\w*/, "$1") : '') + '</span></a>'; }).join("") +
      '</div></section>';
    }).join("");
  }

  function viewListen(){
    return '' +
    '<section class="page-head page-head-dark"><div class="wrap"><p class="kicker kicker-light">Listen</p><h1>Shiurim &amp; talks</h1><p class="lede">' + listenCount + ' recordings and source sheets, from the festivals and Shabbos to the Lakewood years and the Rabbinerseminar.</p></div></section>' +
    '<section class="wrap listen-page">' +
      listenGroups.map(function(g){
        return '<div class="lgroup"><div class="lgroup-head"><h2>' + esc(g.group) + '</h2>' + (g.note ? '<p>' + esc(g.note) + '</p>' : '') + '</div><ul class="tracks">' +
          g.items.map(function(it){ if (it.aid) return trackPlayer(it); return '<li class="track"><span class="track-ic ' + (it.kind === "audio" ? "is-audio is-off" : "is-doc") + '">' + (it.kind === "audio" ? ICON.audio : ICON.doc) + '</span><span class="track-main"><b' + heAttr(it.title) + '>' + esc(it.title) + '</b><span>' + esc(it.detail) + '</span></span></li>'; }).join("") +
        '</ul></div>';
      }).join("") +
    '</section>';
  }

  function viewAbout(){
    var A = D.about || {};
    return '' +
    '<section class="about">' +
      '<div class="wrap about-inner">' +
        '<div class="about-art" aria-hidden="true"><div class="glow"></div><img src="img/mark-256.png" width="256" height="256" alt=""></div>' +
        '<div class="about-text">' +
          '<p class="kicker kicker-light">About</p>' +
          '<h1>' + esc(A.title || "Raajonoth") + '</h1>' +
          (A.html || "") +
          (A.signature ? '<p class="sig">' + esc(A.signature) + '</p>' : '') +
          '<div class="hero-cta"><a class="btn btn-orange" href="#/topics">Explore the topics ' + ICON.arrow + '</a><a class="btn btn-ghost" href="#/halacha">Daily Halacha</a></div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function viewSearch(params){
    return '' +
    '<section class="page-head"><div class="wrap"><p class="kicker">Search</p><h1>Find a topic</h1>' +
      '<label class="search search-big"><span class="sr">Search everything</span>' + ICON.search + '<input id="gq" type="search" placeholder="Try \u201cmuktza\u201d, \u201cnewspapers\u201d or \u201cPesach\u201d" autocomplete="off" value="' + esc(params.q || "") + '"></label>' +
    '</div></section><section class="wrap archive-wrap"><div id="gres"></div></section>';
  }
  function renderSearch(){
    var qi = $("#gq"); if (!qi) return;
    var q = norm(qi.value), terms = q ? q.split(" ").filter(Boolean) : [];
    var box = $("#gres");
    if (!terms.length) { box.innerHTML = '<p class="count">Popular topics</p><div class="chips">' + Object.keys(seriesStats).sort(function(a,b){ return seriesStats[b].n - seriesStats[a].n; }).slice(0,8).map(function(s){ return '<a class="chip chip-' + tcol(s) + '" href="#/halacha?topic=' + encodeURIComponent(s) + '">' + esc(short(s)) + '<span>' + seriesStats[s].n + '</span></a>'; }).join("") + '</div>'; return; }
    var hal = items.filter(function(e){ return terms.every(function(t){ return e._q.indexOf(t) !== -1; }); });
    var other = [];
    D.shiurim.forEach(function(g){ g.items.forEach(function(it){ var s = norm(it.title + " " + it.detail + " " + g.group); if (terms.every(function(t){ return s.indexOf(t) !== -1; })) other.push({g:g.group, it:it}); }); });
    var html = '<p class="count">' + hal.length + ' halacha' + (hal.length === 1 ? '' : 'os') + ' \u00b7 ' + other.length + ' shiurim &amp; essays</p>';
    if (other.length) html += '<h2 class="month">Shiurim &amp; essays</h2><ul class="tracks">' + other.slice(0, 30).map(function(o){ return '<li class="track"><span class="track-ic ' + (o.it.kind === "audio" ? "is-audio" : "is-doc") + '">' + (o.it.kind === "audio" ? ICON.audio : ICON.doc) + '</span><span class="track-main"><b' + heAttr(o.it.title) + '>' + hl(o.it.title, terms) + '</b><span>' + esc(o.g) + ' \u00b7 ' + esc(o.it.detail) + '</span></span></li>'; }).join("") + '</ul>';
    if (hal.length) html += '<h2 class="month">Daily Halacha</h2><div class="rows">' + hal.slice(0, 60).map(function(e){ var d = pd(e.date); return '<a class="row" href="#/halacha/' + e._id + '"><span class="row-date"><b>' + d.getUTCDate() + '</b>' + MONTHS[d.getUTCMonth()].slice(0,3) + ' ' + String(d.getUTCFullYear()).slice(2) + '</span><span class="row-main"><span class="row-title">' + hl(tt(e), terms) + '</span><span class="row-meta">' + tag(e.series) + '</span></span><span class="row-arrow">' + ICON.arrow + '</span></a>'; }).join("") + '</div>' + (hal.length > 60 ? '<a class="more-link" href="#/halacha?q=' + encodeURIComponent(qi.value) + '">See all ' + hal.length + ' in the archive ' + ICON.arrow + '</a>' : '');
    if (!hal.length && !other.length) html += '<p class="noresult">Nothing matches that search yet.</p>';
    box.innerHTML = html;
  }

  // ---- router ----
  function parse(){
    var h = location.hash || "#/";
    var legacy = {"#halacha":"#/halacha", "#shiurim":"#/listen", "#thoughts":"#/topics"};
    if (legacy[h]) { history.replaceState(null, "", legacy[h]); h = legacy[h]; }
    h = h.replace(/^#\/?/, "");
    var qs = "", i = h.indexOf("?"); if (i >= 0) { qs = h.slice(i+1); h = h.slice(0, i); }
    var params = {}; qs.split("&").forEach(function(kv){ if (!kv) return; var p = kv.split("="); try { params[decodeURIComponent(p[0])] = decodeURIComponent((p[1]||"").replace(/\+/g," ")); } catch(e){} });
    return {parts: h.split("/").filter(Boolean), params: params};
  }
  var TITLES = {latest:"Raajonoth \u00b7 " + (S.hero_headline || "A Perspective from Berlin on Torah Topics and Current Events"), halacha:"Daily Halacha \u00b7 Raajonoth", topics:"Topics \u00b7 Raajonoth", listen:"Listen \u00b7 Raajonoth", about:"About \u00b7 Raajonoth", search:"Search \u00b7 Raajonoth"};
  function route(){
    if (silent) return;
    stopAudio();
    var r = parse(), p = r.parts, main = $("#main"), nav = "latest", title;
    if (!p.length) { main.innerHTML = viewHome(); }
    else if (p[0] === "halacha" && p[1]) { nav = "halacha"; main.innerHTML = viewDetail(p[1]); var e = getItem(p[1]); title = e ? tt(e) + " \u00b7 Raajonoth" : null; }
    else if (p[0] === "halacha") { nav = "halacha"; main.innerHTML = viewArchive(r.params); bindArchive(); }
    else if (p[0] === "topics") { nav = "topics"; main.innerHTML = viewTopics(); }
    else if (p[0] === "listen") { nav = "listen"; main.innerHTML = viewListen(); }
    else if (p[0] === "about") { nav = "about"; main.innerHTML = viewAbout(); }
    else if (p[0] === "search") { nav = "search"; main.innerHTML = viewSearch(r.params); var g = $("#gq"); g.addEventListener("input", renderSearch); renderSearch(); setTimeout(function(){ g.focus(); }, 30); }
    else { main.innerHTML = viewHome(); }
    document.title = title || TITLES[nav];
    document.body.setAttribute("data-view", nav);
    document.querySelectorAll("[data-nav]").forEach(function(a){ if (a.getAttribute("data-nav") === nav) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    closeMenu();
  }
  var mb = $("#menu-btn"), header = $(".site-header");
  function closeMenu(){ header.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); }
  mb.addEventListener("click", function(){ var o = !header.classList.contains("open"); header.classList.toggle("open", o); mb.setAttribute("aria-expanded", String(o)); });
  window.addEventListener("hashchange", function(){ if (silent) return; route(); window.scrollTo(0, 0); });
  window.addEventListener("scroll", function(){ header.classList.toggle("scrolled", window.scrollY > 8); }, {passive:true});
  route();
  $("#yr").textContent = String(new Date().getFullYear());
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); });
  }
})();
