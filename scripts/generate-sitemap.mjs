import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const file = process.env.ENV_FILE ?? ".env.production";
  const path = join(ROOT, file);
  if (!existsSync(path)) return {};

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const at = line.indexOf("=");
        return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
      })
  );
}

const env = { ...loadEnv(), ...process.env };

const BACKEND = (env.EXPO_PUBLIC_BACKEND_URL ?? "").replace(/\/$/, "");
const SITE = (env.EXPO_PUBLIC_FRONTEND_URL ?? "https://redondostats.site").replace(/\/$/, "");
const TOKEN = env.EXPO_PUBLIC_SERVICE_TOKEN ?? "";

if (!BACKEND) {
  console.error("EXPO_PUBLIC_BACKEND_URL não definido");
  process.exit(1);
}

async function get(path) {
  const res = await fetch(`${BACKEND}/api${path}`, {
    headers: {
      "X-Service-Token": TOKEN,
      Origin: SITE,
      Referer: `${SITE}/`,
    },
  });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.json();
}

async function safe(label, path, pick) {
  try {
    const data = await get(path);
    const rows = pick(data) ?? [];
    console.log(`  ${label}: ${rows.length}`);
    return rows;
  } catch (err) {
    console.warn(`  ${label}: falhou (${err.message})`);
    return [];
  }
}

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "hourly" },
  { path: "/games", priority: "0.9", changefreq: "hourly" },
  { path: "/leagues", priority: "0.8", changefreq: "daily" },
  { path: "/teams", priority: "0.8", changefreq: "daily" },
  { path: "/players", priority: "0.8", changefreq: "daily" },
];

const years = () => {
  const current = new Date().getFullYear();
  return JSON.stringify(
    Array.from({ length: current - 2019 }, (_, i) => String(2020 + i))
  );
};

const iso = (timestamp) =>
  timestamp ? new Date(timestamp * 1000).toISOString().slice(0, 10) : undefined;

const escape = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function urlTag({ path, lastmod, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${escape(SITE + path)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

console.log(`Gerando sitemap de ${BACKEND} para ${SITE}`);

const [finished, upcoming, leagues, teams, players] = await Promise.all([
  safe("jogos finalizados", "/games_stats?period=last_15", (d) => d.games),
  safe("próximos jogos", "/games_stats/upcoming", (d) => d.games),
  safe(
    "campeonatos",
    `/leagues_stats?status=finished&years=${encodeURIComponent(years())}`,
    (d) => d.leagues
  ),
  safe("times", "/teams_stats?region_code=all", (d) => d.teams),
  safe("jogadores", "/player_stats?period=12_months&game_count=5", (d) => d.players),
]);

const currentLeagues = await safe(
  "campeonatos atuais",
  `/leagues_stats?status=current&years=${encodeURIComponent(years())}`,
  (d) => d.leagues
);

const urls = [
  ...STATIC_PAGES.map((page) => ({ ...page, lastmod: iso(Date.now() / 1000) })),

  ...[...finished, ...upcoming]
    .filter((g) => g.slug)
    .map((g) => ({
      path: `/game/${g.slug}`,
      lastmod: iso(g.updated_at ?? g.start_timestamp),
      changefreq: "daily",
      priority: "0.7",
    })),

  ...[...leagues, ...currentLeagues]
    .filter((l) => l.slug)
    .map((l) => ({
      path: `/league/${l.slug}`,
      lastmod: iso(l.updated_at ?? l.start_timestamp),
      changefreq: "weekly",
      priority: "0.6",
    })),

  ...teams
    .filter((t) => t.slug)
    .map((t) => ({
      path: `/team/${t.slug}`,
      lastmod: iso(t.updated_at),
      changefreq: "weekly",
      priority: "0.6",
    })),

  ...players
    .filter((p) => p.slug)
    .map((p) => ({
      path: `/player/${p.slug}`,
      lastmod: iso(p.updated_at),
      changefreq: "weekly",
      priority: "0.5",
    })),
];

const unique = [...new Map(urls.map((u) => [u.path, u])).values()];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...unique.map(urlTag),
  "</urlset>",
  "",
].join("\n");

mkdirSync(join(ROOT, "public"), { recursive: true });
writeFileSync(join(ROOT, "public", "sitemap.xml"), xml, "utf8");

console.log(`\npublic/sitemap.xml — ${unique.length} URLs`);
