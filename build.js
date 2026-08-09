#!/usr/bin/env node
/*
 * build.js — macht aus der dreisprachigen Quelle drei echte Seiten.
 *
 *   src/index.html   (DE + DA + EN in einer Datei, wie bisher gepflegt)
 *        │
 *        ├──►  index.html      Deutsch   https://hvepseeksperterne.eu/
 *        ├──►  da/index.html   Dansk     https://hvepseeksperterne.eu/da/
 *        ├──►  en/index.html   English   https://hvepseeksperterne.eu/en/
 *        └──►  sitemap.xml
 *
 * Warum? Vorher lagen alle drei Sprachen in EINER Seite und wurden per CSS
 * ein- und ausgeblendet. Google sieht aber nur das, was nach dem Rendern
 * sichtbar ist — der Rest gilt als versteckt und zählt kaum. Für dänische
 * Suchanfragen war die Seite damit praktisch unsichtbar. Jetzt hat jede
 * Sprache eine eigene URL mit eigenem Titel, eigener Beschreibung und
 * eigenen Strukturdaten.
 *
 * Bedienung:  node build.js      (kein npm install nötig)
 * Bearbeitet wird ausschließlich src/index.html — die drei Ausgabedateien
 * werden bei jedem Lauf überschrieben.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src', 'index.html');
const SITE = 'https://hvepseeksperterne.eu';
const LANGS = ['de', 'da', 'en'];

/* ------------------------------------------------------------------ *
 * 1. Was pro Sprache in den <head> kommt
 * ------------------------------------------------------------------ */

const META = {
  de: {
    dir: '',
    htmlLang: 'de',
    ogLocale: 'de_DE',
    ogImage: '/images/og-image-de.jpg',
    title: 'Wespennest entfernen in Schleswig-Holstein & Südjütland | Die Wespenexperten',
    desc: 'Wespennest, Hornissennest oder Hummelnest? Wir siedeln um statt zu töten — Festpreis 160 € / 1.250 DKK, Garantie, Familienbetrieb seit 1992. Flensburg, Nordfriesland & Sønderjylland.',
    ogTitle: 'Die Wespenexperten — umsiedeln statt töten',
    ogDesc: 'Wespen, Hornissen und Hummeln in Nordfriesland, Schleswig-Flensburg und Sønderjylland. Festpreis 160 €. Familienbetrieb seit 1992.',
    bizDesc: 'Wespennester, Hornissennester und Hummelnester entfernen und umsiedeln — in Nordfriesland, Schleswig-Flensburg und in Sønderjylland. Festpreis 160 € / 1.250 DKK für ein Standard-Wespennest. Familienbetrieb seit 1992.',
    offerName: 'Wespennest entfernen oder umsiedeln (Standardnest)'
  },
  da: {
    dir: 'da',
    htmlLang: 'da',
    ogLocale: 'da_DK',
    ogImage: '/images/og-image.jpg',
    title: 'Fjernelse af hvepsebo i Sønderjylland — fast pris 1.250 kr. | Hvepseeksperterne',
    desc: 'Hvepsebo, gedehamsebo eller humlebibo? Vi flytter i stedet for at dræbe — fast pris 1.250 kr., garanti, familiefirma siden 1992. Tønder, Aabenraa, Sønderborg og Haderslev.',
    ogTitle: 'Hvepseeksperterne — vi flytter i stedet for at dræbe',
    ogDesc: 'Fjernelse og flytning af hvepsebo, gedehamsebo og humlebibo i hele Sønderjylland. Fast pris 1.250 kr. Familiefirma siden 1992.',
    bizDesc: 'Fjernelse og flytning af hvepsebo, gedehamsebo og humlebibo i hele Sønderjylland — Tønder, Aabenraa, Sønderborg og Haderslev. Fast pris 1.250 kr. for et almindeligt hvepsebo. Familiefirma siden 1992.',
    offerName: 'Fjernelse eller flytning af hvepsebo (almindeligt bo)'
  },
  en: {
    dir: 'en',
    htmlLang: 'en',
    ogLocale: 'en_GB',
    ogImage: '/images/og-image.jpg',
    title: 'Wasp nest removal in Southern Denmark & Schleswig-Holstein | The Wasp Experts',
    desc: 'Wasp, hornet or bumblebee nest? We relocate instead of killing — fixed price €160 / DKK 1,250, guarantee, family business since 1992. Sønderjylland, Flensburg and North Frisia.',
    ogTitle: 'The Wasp Experts — we relocate instead of killing',
    ogDesc: 'Wasp, hornet and bumblebee nests in Sønderjylland, Flensburg and North Frisia. Fixed price €160. Family business since 1992.',
    bizDesc: 'Removal and relocation of wasp, hornet and bumblebee nests in Sønderjylland (Denmark) and northern Schleswig-Holstein (Germany). Fixed price €160 / DKK 1,250 for a standard wasp nest. Family business since 1992.',
    offerName: 'Wasp nest removal or relocation (standard nest)'
  }
};

const urlFor = (lang) => (META[lang].dir ? `${SITE}/${META[lang].dir}/` : `${SITE}/`);

/* Bild-Alternativtexte je Sprache (Schlüssel = Dateiname im src-Attribut) */
const ALT = {
  'images/logo-wespe.png': {
    de: 'Wespen-Symbol der Wespenexperten',
    da: 'Hvepseeksperternes hvepsesymbol',
    en: 'Wasp symbol of The Wasp Experts'
  },
  'images/juergen-skizze.jpg': {
    de: 'Bleistift-Skizze von Jürgen Hanika, Gründer der Wespenexperten',
    da: 'Blyantstegning af Jürgen Hanika, grundlægger af Hvepseeksperterne',
    en: 'Pencil sketch of Jürgen Hanika, founder of The Wasp Experts'
  },
  'images/juergen-foto.jpg': {
    de: 'Porträtfoto von Jürgen Hanika, Gründer der Wespenexperten',
    da: 'Portrætfoto af Jürgen Hanika, grundlægger af Hvepseeksperterne',
    en: 'Portrait photo of Jürgen Hanika, founder of The Wasp Experts'
  },
  'images/wespe.jpg': {
    de: 'Wespe an einem Wespennest',
    da: 'Hveps ved et hvepsebo',
    en: 'Wasp at a wasp nest'
  },
  'images/hornisse.jpg': {
    de: 'Hornisse aus der Nähe — Hornissen stehen unter strengem Schutz',
    da: 'Gedehams tæt på — gedehamse er fredede',
    en: 'Close-up of a hornet — hornets are strictly protected'
  },
  'images/hummel.jpg': {
    de: 'Hummel auf einer Blüte',
    da: 'Humlebi på en blomst',
    en: 'Bumblebee on a flower'
  },
  'images/wespe-1.jpg': {
    de: 'Frühjahr: eine einzelne Wespenkönigin startet das Nest',
    da: 'Forår: en enkelt hvepsedronning starter boet',
    en: 'Spring: a single wasp queen starts the nest'
  },
  'images/wespe-2.jpg': {
    de: 'Wespenkönigin baut die schützende Hülle um das Nest',
    da: 'Hvepsedronningen bygger den beskyttende skal om boet',
    en: 'Wasp queen building the protective shell around the nest'
  },
  'images/wespe-3.jpg': {
    de: 'Wespenkönigin legt die ersten Eier und pflegt die Larven',
    da: 'Hvepsedronningen lægger de første æg og passer larverne',
    en: 'Wasp queen laying the first eggs and tending the larvae'
  },
  'images/wespe-4.jpg': {
    de: 'Kleines Wespennest, bevor die ersten Arbeiterinnen schlüpfen',
    da: 'Lille hvepsebo, før de første arbejdere klækkes',
    en: 'Small wasp nest before the first workers hatch'
  },
  'images/mobilepay-qr-logo.png': {
    de: 'MobilePay QR-Code zum Bezahlen',
    da: 'MobilePay QR-kode til betaling',
    en: 'MobilePay QR code for payment'
  },
  'images/hornissen-poster.jpg': {
    de: 'Standbild aus dem Video: Umsiedlung eines Hornissennests',
    da: 'Still fra videoen: flytning af et gedehamsebo',
    en: 'Still from the video: relocating a hornet nest'
  }
};

/* Texte, die in Attributen stecken (aria-label, placeholder) — die kann
   der data-de/da/en-Mechanismus nicht erreichen, also hier übersetzen. */
const ATTR_I18N = [
  ['Die Wespenexperten – Hvepseeksperterne – Startseite', {
    da: 'Hvepseeksperterne – Die Wespenexperten – forside',
    en: 'The Wasp Experts – Die Wespenexperten – home'
  }],
  ['Menü', { da: 'Menu', en: 'Menu' }],
  ['Rechtliche Informationen', { da: 'Juridiske oplysninger', en: 'Legal information' }],
  ['WhatsApp Deutschland', { da: 'WhatsApp Tyskland', en: 'WhatsApp Germany' }],
  ['SMS Danmark', { da: 'SMS Danmark', en: 'SMS Denmark' }],
  ['z. B. Wespennest unter dem Dachüberstand, ca. 5 m Höhe / fx hvepserede under tagudhænget, ca. 5 m / e.g. wasp nest under the roof eaves, approx. 5 m', {
    de: 'z. B. Wespennest unter dem Dachüberstand, ca. 5 m Höhe',
    da: 'f.eks. hvepsebo under tagudhænget, ca. 5 m oppe',
    en: 'e.g. wasp nest under the roof eaves, approx. 5 m up'
  }]
];

/* Sprach-Hinweisleiste: steht bewusst in der jeweils ANDEREN Sprache */
const HINT = {
  de: { text: 'Diese Seite gibt es auch auf Deutsch.', cta: 'Zur deutschen Seite' },
  da: { text: 'Denne side findes også på dansk.', cta: 'Skift til dansk' },
  en: { text: 'This page is also available in English.', cta: 'Switch to English' }
};
const HINT_CLOSE = { de: 'Hinweis schließen', da: 'Luk', en: 'Dismiss' };

/* ------------------------------------------------------------------ *
 * 2. Werkzeug: eine Sprache behalten, die anderen beiden entfernen
 * ------------------------------------------------------------------ */

/** Findet das schließende Tag zu einem geöffneten (zählt Verschachtelung mit). */
function findMatchingEnd(html, name, from) {
  const re = new RegExp('<(/?)' + name + '\\b', 'gi');
  re.lastIndex = from;
  let depth = 1;
  let m;
  while ((m = re.exec(html)) !== null) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) {
      const gt = html.indexOf('>', m.index);
      if (gt === -1) break;
      return gt + 1;
    }
  }
  throw new Error(`Kein schließendes </${name}> gefunden (ab Zeichen ${from}).`);
}

/**
 * Entfernt alle Elemente mit data-<andere Sprache> komplett und streicht
 * bei der gewünschten Sprache nur das Markierungs-Attribut weg.
 */
function keepLanguage(html, keep) {
  const tagRe = /<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  const langAttrRe = /(?:^|\s)data-(de|da|en)(?=[\s>=]|$)/;
  let out = '';
  let pos = 0;
  let m;

  while ((m = tagRe.exec(html)) !== null) {
    const full = m[0];
    const name = m[1];
    const found = langAttrRe.exec(m[2]);
    if (!found) continue;

    out += html.slice(pos, m.index);

    if (found[1] === keep) {
      out += full.replace(/\s+data-(de|da|en)(?=[\s>]|$)/, '');
      pos = m.index + full.length;
    } else {
      const end = findMatchingEnd(html, name, m.index + full.length);
      pos = end;
      tagRe.lastIndex = end;
    }
  }
  out += html.slice(pos);

  // Zeilen, auf denen nach dem Entfernen nur noch Leerzeichen stehen, weg
  return out.replace(/^[ \t]+\r?\n/gm, '');
}

/** Relative Pfade auf absolute umstellen — /da/ und /en/ liegen tiefer. */
function absolutiseAssets(html) {
  return html.replace(/(src|href|poster)="(images|videos)\//g, '$1="/$2/');
}

/** Alt-Texte in die Sprache der Seite bringen. */
function localiseAlts(html, lang) {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const src = /src="([^"]+)"/.exec(tag);
    if (!src) return tag;
    const key = src[1].replace(/^\//, '');
    const alt = ALT[key] && ALT[key][lang];
    if (!alt) return tag;
    return tag.replace(/alt="[^"]*"/, `alt="${escapeAttr(alt)}"`);
  });
}

const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Attribut-Texte (aria-label, placeholder) in die Seitensprache bringen. */
function localiseAttrs(html, lang) {
  for (const [source, translations] of ATTR_I18N) {
    const target = translations[lang];
    if (!target) continue;
    html = html.split(`"${source}"`).join(`"${escapeAttr(target)}"`);
  }
  return html;
}

/** HTML-Fragment zu reinem Text (für die Strukturdaten). */
function toText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ------------------------------------------------------------------ *
 * 3. Kopfdaten, Strukturdaten, Hinweisleiste
 * ------------------------------------------------------------------ */

function headBlock(lang) {
  const m = META[lang];
  const alternates = LANGS
    .map((l) => `<link rel="alternate" hreflang="${META[l].htmlLang}" href="${urlFor(l)}">`)
    .join('\n');

  return `<title>${m.title}</title>
<meta name="description" content="${escapeAttr(m.desc)}">
<meta name="author" content="Jürgen Hanika">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="theme-color" content="#F0C808">
<link rel="canonical" href="${urlFor(lang)}">

${alternates}
<link rel="alternate" hreflang="x-default" href="${SITE}/">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Die Wespenexperten · Hvepseeksperterne">
<meta property="og:title" content="${escapeAttr(m.ogTitle)}">
<meta property="og:description" content="${escapeAttr(m.ogDesc)}">
<meta property="og:url" content="${urlFor(lang)}">
<meta property="og:image" content="${SITE}${m.ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${m.ogLocale}">
${LANGS.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${META[l].ogLocale}">`).join('\n')}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(m.ogTitle)}">
<meta name="twitter:description" content="${escapeAttr(m.ogDesc)}">
<meta name="twitter:image" content="${SITE}${m.ogImage}">`;
}

function hintBlock(lang) {
  const rows = LANGS.filter((l) => l !== lang)
    .map((l) => {
      const href = META[l].dir ? `/${META[l].dir}/` : '/';
      return `    <span data-hint="${l}" hidden lang="${META[l].htmlLang}">${HINT[l].text} <a href="${href}" hreflang="${META[l].htmlLang}">${HINT[l].cta} →</a></span>`;
    })
    .join('\n');

  return `<div class="lang-hint" id="lang-hint">
${rows}
    <button type="button" class="lang-hint-close" aria-label="${escapeAttr(HINT_CLOSE[lang])}">✕</button>
</div>`;
}

/** FAQ-Strukturdaten direkt aus dem fertigen Seitentext bauen. */
function faqFromHtml(html) {
  const items = [];
  const itemRe = /<details class="faq-item">([\s\S]*?)<\/details>/g;
  let m;
  while ((m = itemRe.exec(html)) !== null) {
    const block = m[1];
    const q = /<summary>([\s\S]*?)<\/summary>/.exec(block);
    const a = /<div class="answer">([\s\S]*?)<\/div>/.exec(block);
    if (!q || !a) continue;
    const question = toText(q[1]);
    const answer = toText(a[1]);
    if (question && answer) {
      items.push({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer }
      });
    }
  }
  return items;
}

function structuredData(lang, pageHtml) {
  const m = META[lang];

  const business = {
    '@context': 'https://schema.org',
    '@type': 'PestControl',
    '@id': `${SITE}/#business`,
    name: 'Die Wespenexperten – Hvepseeksperterne',
    alternateName: ['Hvepseeksperterne', 'Die Wespenexperten'],
    url: urlFor(lang),
    image: `${SITE}${m.ogImage}`,
    logo: `${SITE}/images/logo-wespe.png`,
    description: m.bizDesc,
    telephone: '+4560463053',
    email: 'juergenhanika@hvepseeksperterne.eu',
    foundingDate: '1992',
    priceRange: '€€',
    currenciesAccepted: 'DKK, EUR',
    paymentAccepted: 'Cash, MobilePay',
    knowsLanguage: ['da', 'de', 'en'],
    founder: { '@type': 'Person', name: 'Jürgen Hanika' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Skolegade 27',
      postalCode: '6240',
      addressLocality: 'Øster Højst',
      addressRegion: 'Syddanmark',
      addressCountry: 'DK'
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Sønderjylland' },
      { '@type': 'AdministrativeArea', name: 'Tønder Kommune' },
      { '@type': 'AdministrativeArea', name: 'Aabenraa Kommune' },
      { '@type': 'AdministrativeArea', name: 'Sønderborg Kommune' },
      { '@type': 'AdministrativeArea', name: 'Haderslev Kommune' },
      { '@type': 'AdministrativeArea', name: 'Nordfriesland' },
      { '@type': 'AdministrativeArea', name: 'Schleswig-Flensburg' },
      { '@type': 'City', name: 'Flensburg' }
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+4560463053',
        contactType: 'customer service',
        areaServed: 'DK',
        availableLanguage: ['da', 'de', 'en']
      },
      {
        '@type': 'ContactPoint',
        telephone: '+491739316539',
        contactType: 'customer service',
        areaServed: 'DE',
        availableLanguage: ['de', 'en']
      }
    ],
    identifier: { '@type': 'PropertyValue', propertyID: 'CVR', value: '45785386' },
    makesOffer: [
      {
        '@type': 'Offer',
        name: m.offerName,
        priceCurrency: 'DKK',
        price: '1250',
        eligibleRegion: { '@type': 'Country', name: 'DK' },
        availability: 'https://schema.org/InStock'
      },
      {
        '@type': 'Offer',
        name: m.offerName,
        priceCurrency: 'EUR',
        price: '160',
        eligibleRegion: { '@type': 'Country', name: 'DE' },
        availability: 'https://schema.org/InStock'
      }
    ],
    sameAs: [
      'https://www.facebook.com/profile.php?id=61590814462472',
      'https://www.wespenexperte.de',
      'https://die-schaedlingsexperten.de'
    ]
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${urlFor(lang)}#faq`,
    inLanguage: m.htmlLang,
    isPartOf: { '@id': `${SITE}/#business` },
    mainEntity: faqFromHtml(pageHtml)
  };

  return [business, faq]
    .map((o) => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`)
    .join('\n');
}

/* ------------------------------------------------------------------ *
 * 4. Bauen
 * ------------------------------------------------------------------ */

function buildLang(source, lang) {
  let html = keepLanguage(source, lang);
  html = absolutiseAssets(html);
  html = localiseAlts(html, lang);
  html = localiseAttrs(html, lang);

  html = html.replace(/<html lang="[^"]*">/, `<html lang="${META[lang].htmlLang}">`);
  html = html.replace('<!--BUILD:SEO-->', headBlock(lang));
  html = html.replace('<!--BUILD:LANGHINT-->', hintBlock(lang));

  // aktive Sprache im Umschalter markieren
  html = html.replace(
    new RegExp(`(<a href="[^"]*" hreflang="[^"]*" data-set="${lang}")>`),
    '$1 aria-current="true">'
  );

  // Strukturdaten zuletzt — sie lesen den fertigen FAQ-Text der Seite
  html = html.replace('<!--BUILD:JSONLD-->', structuredData(lang, html));

  return html;
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const alt = LANGS.map(
    (l) => `      <xhtml:link rel="alternate" hreflang="${META[l].htmlLang}" href="${urlFor(l)}"/>`
  ).join('\n');

  const urls = LANGS.map(
    (l) => `  <url>
    <loc>${urlFor(l)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${l === 'de' ? '1.0' : '0.9'}</priority>
${alt}
      <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>
  </url>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

function main() {
  const source = fs.readFileSync(SRC, 'utf8');

  for (const marker of ['<!--BUILD:SEO-->', '<!--BUILD:JSONLD-->', '<!--BUILD:LANGHINT-->']) {
    if (!source.includes(marker)) {
      throw new Error(`Platzhalter ${marker} fehlt in src/index.html`);
    }
  }

  for (const lang of LANGS) {
    const html = buildLang(source, lang);

    // Sicherheitsnetz: es darf keine Fremdsprache übrig bleiben
    const leftover = /data-(de|da|en)(?=[\s>=])/.exec(html);
    if (leftover) throw new Error(`${lang}: Sprachmarkierung ${leftover[0]} nicht entfernt`);
    if (html.includes('<!--BUILD:')) throw new Error(`${lang}: Platzhalter nicht ersetzt`);

    const outDir = META[lang].dir ? path.join(ROOT, META[lang].dir) : ROOT;
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, 'index.html');
    fs.writeFileSync(outFile, html, 'utf8');
    console.log(
      `${path.relative(ROOT, outFile).padEnd(16)} ${String(html.length).padStart(7)} Zeichen  ` +
        `${faqFromHtml(html).length} FAQ-Einträge`
    );
  }

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap(), 'utf8');
  console.log('sitemap.xml      erzeugt');
}

main();
