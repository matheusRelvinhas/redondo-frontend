const RATING_API_MAX = 10;
export const RATING_MAX = 5;

export const toRating = (apiRating: number) => (apiRating * RATING_MAX) / RATING_API_MAX;

const RATING_GREEN = 3.5;
const RATING_FLOOR = 1.5;

export function ratingColor(rating: number, dark: boolean) {
  const t = Math.max(0, Math.min(1, (rating - RATING_FLOOR) / (RATING_GREEN - RATING_FLOOR)));
  const hue = Math.round(t * 120);
  return `hsl(${hue}, ${dark ? 70 : 65}%, ${dark ? 58 : 42}%)`;
}

export const ratingPercent = (rating: number) => Math.min(100, (rating / RATING_MAX) * 100);
