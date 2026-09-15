/**
 * Sync latest Naver Blog posts (metadata only) into public/blog-posts.json.
 *
 * Source: https://rss.blog.naver.com/snowybod.xml
 * (blog.naver.com/snowybod.xml returns 404 — do not use.)
 *
 * Stores title, link, date, and mirrored thumbnail when present.
 * Does NOT scrape or copy full post bodies.
 *
 * Run: npm run sync:blog
 * Auto-runs before npm run build (with sync:menu).
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '../public');
const OUT = join(PUBLIC, 'blog-posts.json');
const THUMBS_ROOT = join(PUBLIC, 'blog-thumbs');

const BLOG_ID = 'snowybod';
const BLOG_URL = `https://blog.naver.com/${BLOG_ID}`;
const RSS_URL = `https://rss.blog.naver.com/${BLOG_ID}.xml`;
const MAX_POSTS = 6;

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/** @param {string} xml @param {string} tag */
function cdataOrText(xml, tag) {
  const re = new RegExp(
    `<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))\\s*</${tag}>`,
    'i',
  );
  const m = xml.match(re);
  if (!m) return '';
  return String(m[1] ?? m[2] ?? '').trim();
}

/** @param {string} html */
function extractThumb(html) {
  const m = String(html || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1].trim() : null;
}

/** @param {string} link */
function cleanPostLink(link) {
  try {
    const u = new URL(link);
    u.searchParams.delete('fromRss');
    u.searchParams.delete('trackingCode');
    return u.toString();
  } catch {
    return link.split('?')[0];
  }
}

/** @param {string} url */
function guessExt(url) {
  try {
    const path = new URL(url).pathname;
    const ext = extname(path).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') return 'jpg';
    if (ext === '.png' || ext === '.webp' || ext === '.gif') return ext.slice(1);
  } catch {
    /* ignore */
  }
  return 'jpg';
}

/**
 * @param {string} url
 * @param {string} destAbs
 */
async function downloadImage(url, destAbs) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9',
      Referer: BLOG_URL,
    },
  });
  if (!res.ok) throw new Error(`image HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) throw new Error(`image too small (${buf.length}B) for ${url}`);
  mkdirSync(dirname(destAbs), { recursive: true });
  writeFileSync(destAbs, buf);
  return buf.length;
}

/** @param {string} xml */
function parseItems(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const title = cdataOrText(block, 'title');
    const linkRaw = cdataOrText(block, 'link') || cdataOrText(block, 'guid');
    const pubDate = cdataOrText(block, 'pubDate');
    const description = cdataOrText(block, 'description');
    if (!title || !linkRaw) continue;
    items.push({
      title,
      link: cleanPostLink(linkRaw),
      date: pubDate ? new Date(pubDate).toISOString() : null,
      dateDisplay: pubDate
        ? new Date(pubDate).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : '',
      thumbnailSource: extractThumb(description),
    });
  }
  return items;
}

async function main() {
  console.log(`Fetching RSS: ${RSS_URL}`);
  const res = await fetch(RSS_URL, {
    headers: {
      'User-Agent': UA,
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
      'Accept-Language': 'ko-KR,ko;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`RSS HTTP ${res.status}`);
  const xml = await res.text();
  if (!xml.includes('<item>')) throw new Error('RSS has no <item> entries');

  const parsed = parseItems(xml).slice(0, MAX_POSTS);
  if (!parsed.length) throw new Error('No posts parsed from RSS');

  if (existsSync(THUMBS_ROOT)) {
    rmSync(THUMBS_ROOT, { recursive: true, force: true });
  }
  mkdirSync(THUMBS_ROOT, { recursive: true });

  const posts = [];
  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i];
    let thumbnail = null;
    if (p.thumbnailSource) {
      const ext = guessExt(p.thumbnailSource);
      const fileName = `post-${String(i + 1).padStart(2, '0')}.${ext}`;
      const destAbs = join(THUMBS_ROOT, fileName);
      try {
        const bytes = await downloadImage(p.thumbnailSource, destAbs);
        thumbnail = `./blog-thumbs/${fileName}`;
        console.log(`  thumb ${fileName} (${bytes}B)`);
      } catch (err) {
        console.warn(`  thumb skip: ${err.message}`);
      }
    }
    posts.push({
      title: p.title,
      link: p.link,
      date: p.date,
      dateDisplay: p.dateDisplay,
      thumbnail,
    });
  }

  const payload = {
    syncedAt: new Date().toISOString(),
    source: 'naver-blog-rss',
    feed: RSS_URL,
    blogUrl: BLOG_URL,
    note:
      'Generated by scripts/sync-blog.mjs from Naver Blog RSS. Metadata + mirrored thumbs only; no full post body. Re-run npm run sync:blog to refresh.',
    posts,
  };

  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${posts.length} posts → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
