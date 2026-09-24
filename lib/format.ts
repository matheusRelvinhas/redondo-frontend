const pad = (n: number) => String(n).padStart(2, "0");

export const formatHour = (timestamp: number) => {
  const d = new Date(timestamp * 1000);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatDate = (timestamp: number) => {
  const d = new Date(timestamp * 1000);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};

export const formatFullDate = (timestamp: number) => {
  const d = new Date(timestamp * 1000);
  const month = d.toLocaleString("pt-BR", { month: "long" });
  return `${d.getDate()} de ${month} de ${d.getFullYear()}`;
};

export const MAP_NAMES: Record<string, string> = {
  de_dust2: "Dust 2",
  de_mirage: "Mirage",
  de_inferno: "Inferno",
  de_nuke: "Nuke",
  de_overpass: "Overpass",
  de_ancient: "Ancient",
  de_anubis: "Anubis",
  de_train: "Train",
  de_vertigo: "Vertigo",
  de_cache: "Cache",
};

export const mapName = (slug: string) => MAP_NAMES[slug] ?? slug;

export const isLiveGame = (game: { status: string | null }) =>
  game.status === "current" || game.status === "live";
