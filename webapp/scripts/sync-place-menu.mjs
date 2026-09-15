/**
 * Sync Naver Place menus + menu-board images into public/place-menu.json.
 *
 * Source: m.place.naver.com/restaurant/{id}/menu (SSR __APOLLO_STATE__)
 * Contains Menu[] (name/price/description/images) and placeDetail.menuImages[].
 *
 * Run: npm run sync:menu
 * Auto-runs before npm run build. Re-run anytime to pick up Naver menu changes.
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/place-menu.json');

const PLACES = [
  { id: 'hadan', placeId: '1059460378', name: '하단본점' },
  { id: 'myeongji', placeId: '2060161064', name: '명지직영점' },
];

const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

/** @param {string} name */
function categorize(name) {
  const n = String(name || '').replace(/\s+/g, '');
  if (/^<분위기>/.test(name) || (/아지트|분위기/.test(n) && !/사시미|짬뽕|한우/.test(n))) {
    return null;
  }
  if (/맥주|생맥주|하이볼|전통주|소주|와인|위스키|사케|청주|문경바람|화요/.test(n)) {
    return '전통주 페어링';
  }
  if (/한우|육회|육사|차돌박이|차돌사시미|타르타르|타다끼|채끝|일품세트|식사세트/.test(n)) {
    return '한우 일품';
  }
  if (/사시미|시미|연어|광어|4시미|도안4|모둠회|숙성회/.test(n)) {
    return '시그니처 사시미';
  }
  if (
    /짬뽕|전골|술찜|나가사키|바지락|감바스|가라아게|볶음|라즈지|김밥|비빔|바게트|명란|멜몽|타코와사비|붕어|도후|숙주|어묵/.test(
      n,
    )
  ) {
    return '국물 & 요리';
  }
  return '국물 & 요리';
}

/** @param {string|number|null|undefined} price */
function formatPrice(price) {
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${n.toLocaleString('ko-KR')}원`;
}

/** @param {string} html */
function parseApollo(html) {
  const marker = 'window.__APOLLO_STATE__ = ';
  const idx = html.indexOf(marker);
  if (idx < 0) throw new Error('__APOLLO_STATE__ not found');
  const start = idx + marker.length;
  let end = html.indexOf(';\n', start);
  if (end < 0) end = html.indexOf(';\r\n', start);
  if (end < 0) end = html.indexOf(';', start);
  const raw = html.slice(start, end).replace(/\\u002F/g, '/');
  return JSON.parse(raw);
}

/** @param {Record<string, unknown>} apollo */
function extractMenus(apollo) {
  /** @type {any[]} */
  const menus = [];
  for (const v of Object.values(apollo)) {
    if (v && typeof v === 'object' && v.__typename === 'Menu') menus.push(v);
  }
  menus.sort((a, b) => (a.index ?? 999) - (b.index ?? 999));
  return menus;
}

/** @param {Record<string, unknown>} apollo */
function extractBoards(apollo) {
  /** @type {string[]} */
  const boards = [];
  const root = apollo.ROOT_QUERY;
  if (!root || typeof root !== 'object') return boards;
  for (const v of Object.values(root)) {
    if (!v || typeof v !== 'object' || !Array.isArray(v.menuImages)) continue;
    for (const mi of v.menuImages) {
      const url = mi?.imageUrl;
      if (typeof url === 'string' && url.startsWith('http')) boards.push(url);
    }
  }
  return [...new Set(boards)];
}

/** @param {{ id: string, placeId: string, name: string }} place */
async function fetchPlace(place) {
  const url = `https://m.place.naver.com/restaurant/${place.placeId}/menu`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'ko-KR,ko;q=0.9',
      Referer: 'https://m.place.naver.com/',
    },
  });
  if (!res.ok) throw new Error(`${place.id} HTTP ${res.status}`);
  const html = await res.text();
  if (html.length < 50_000) throw new Error(`${place.id} HTML too small (${html.length}) — possible block`);
  const apollo = parseApollo(html);
  const rawMenus = extractMenus(apollo);
  const boards = extractBoards(apollo);

  const dishes = [];
  for (const m of rawMenus) {
    const category = categorize(m.name);
    if (!category) continue;
    const priceLabel = formatPrice(m.price);
    if (!priceLabel) continue;
    const images = Array.isArray(m.images) ? m.images.filter((u) => typeof u === 'string') : [];
    dishes.push({
      id: m.id || `${place.placeId}_${m.index}`,
      index: m.index ?? dishes.length,
      name: m.name,
      price: priceLabel,
      priceValue: Number(m.price) || 0,
      desc: (m.description || '').trim() || `${place.name} 네이버 플레이스 메뉴`,
      category,
      recommend: Boolean(m.recommend),
      tags: [
        ...(m.recommend ? ['추천'] : []),
        place.name,
      ],
      image: images[0] || null,
      images,
      placeId: place.placeId,
      placeSlug: place.id,
      menuUrl: `https://pcmap.place.naver.com/restaurant/${place.placeId}/menu/list`,
    });
  }

  return {
    id: place.id,
    placeId: place.placeId,
    name: place.name,
    sourceUrl: url,
    menuListUrl: `https://pcmap.place.naver.com/restaurant/${place.placeId}/menu/list`,
    dishCount: dishes.length,
    boardCount: boards.length,
    dishes,
    menuBoards: boards.map((imageUrl, i) => ({
      id: `${place.id}-board-${i}`,
      imageUrl,
      label: `메뉴판 ${i + 1}`,
      href: `https://pcmap.place.naver.com/restaurant/${place.placeId}/menu/list`,
    })),
  };
}

async function main() {
  /** @type {Record<string, Awaited<ReturnType<typeof fetchPlace>>>} */
  const places = {};
  for (const place of PLACES) {
    console.log(`Fetching ${place.name} (${place.placeId})…`);
    places[place.id] = await fetchPlace(place);
    console.log(
      `  → ${places[place.id].dishCount} dishes, ${places[place.id].boardCount} menu boards`,
    );
    // gentle pause between places
    await new Promise((r) => setTimeout(r, 800));
  }

  const categories = ['전체', '시그니처 사시미', '한우 일품', '국물 & 요리', '전통주 페어링'];
  const payload = {
    syncedAt: new Date().toISOString(),
    source: 'naver-place-apollo-ssr',
    note:
      'Generated by scripts/sync-place-menu.mjs from m.place.naver.com menu SSR. Re-run npm run sync:menu to refresh.',
    categories,
    defaultPlace: 'hadan',
    places,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${OUT}`);

  // sanity: 국물 dishes present
  const soup = places.hadan.dishes.filter((d) => d.category === '국물 & 요리');
  console.log(`Hadan 국물 & 요리: ${soup.length} → ${soup.map((d) => d.name).join(', ')}`);
}

main().catch((err) => {
  console.error(err);
  // Keep CI/GitHub Pages builds green when Naver SSR is briefly unreachable —
  // fall back to the last committed public/place-menu.json.
  if (existsSync(OUT)) {
    console.warn(`sync:menu failed; keeping existing ${OUT}`);
    process.exit(0);
  }
  process.exit(1);
});
