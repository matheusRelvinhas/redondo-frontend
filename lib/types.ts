/** Espelha os tipos do project-x (app/games/games-page.tsx). */

export type GameScore = {
  game_slug?: string;
  map_name: string;
  order: number;
  rounds_count: number;
  winner_score: number;
  loser_score: number;
  winner_team: string;
};

export interface GameStats {
  id: number;
  slug: string;
  league_name: string | null;
  league_slug: string | null;
  league_img_url?: string | null;
  team1_name: string | null;
  team2_name: string | null;
  team1_slug: string | null;
  team2_slug: string | null;
  team1_score: number | null;
  team2_score: number | null;
  team1_img_url: string | null;
  team2_img_url: string | null;
  stage_round: { stage: string; round: string } | null;
  winner_team_slug: string | null;
  status: string | null;
  parsed_status: string | null;
  bo_type: number | null;
  tier: string | null;
  start_date: string;
  start_timestamp: number;
  games_score: GameScore[] | null;
  ai_predictions: string | null;
}

export type GamePlayerStats = {
  name: string;
  slug: string;
  country_code: string;
  team_name: string;
  team_slug: string;
  kills: number;
  death?: number;
  deaths?: number;
  assists: number;
  adr: number;
  kast: number;
  headshots: number;
  first_kills: number;
  trade_kills: number;
  trade_death: number;
  clutches: number;
  multikills: Record<number, number>;
  player_rating: number;
};

export type GameMapsPlayerStats = {
  map_name: string;
  players_stats: GamePlayerStats[];
};

export interface GameRoundStats {
  end_reason: string;
  round_number: number;
  winner_clan_slug: string;
  winner_clan_side: "CT" | "T";
  winner_clan_score: number;
  loser_clan_slug: string;
  loser_clan_side: "CT" | "T";
  loser_clan_score: number;
}

export interface GameSideStats {
  order: number;
  overtime: boolean;
  winner_clan_slug: string;
  winner_clan_side: "CT" | "T";
  winner_clan_score: number;
  loser_clan_slug: string;
  loser_clan_side: "CT" | "T";
  loser_clan_score: number;
}

export interface GameSideInfo {
  order: number;
  status: string;
  map_name: string;
  rounds_count: number;
  winner_slug: string;
  winner_score: number;
  loser_slug: string;
  loser_score: number;
  game_side: GameSideStats[];
  game_rounds: GameRoundStats[];
}

export interface AiPerformance {
  slug: string;
  ai_predictions: string;
  start_timestamp: number;
  team1_name: string;
  team2_name: string;
  team1_score: number | null;
  team2_score: number | null;
  win_result: boolean;
  exact_result: boolean;
}

export interface League {
  slug: string;
  name: string;
  start_timestamp: number;
}

export interface TournamentTeam {
  slug: string | null;
  name: string | null;
  img_url: string | null;
}

export interface TournamentPrize {
  place: string | null;
  teams: TournamentTeam | null;
}

export interface LeagueStats {
  id: number;
  slug: string;
  name: string;
  img_url: string | null;
  status: string | null;
  prize: number | null;
  start_date: string | null;
  start_timestamp: number;
  tier: string | null;
  teams: TournamentTeam[] | null;
  tournament_prizes: TournamentPrize[] | null;
  created_at: number | null;
  updated_at: number | null;
}

export interface Team {
  slug: string;
  name: string;
}
