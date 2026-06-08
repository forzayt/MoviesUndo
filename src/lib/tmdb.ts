const TMDB_KEY = "b8e31efed6de570178942a39601e84b0";
const BASE = "https://api.themoviedb.org/3";

export const GENRES: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Science Fiction": 878,
  Thriller: 53,
};

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
}

export const img = (path: string | null, size: "w300" | "w500" | "w780" | "original" = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export type CatalogKind =
  | { kind: "new" }
  | { kind: "ott" }
  | { kind: "future" }
  | { kind: "genre"; genreId: number };

export async function fetchCatalog(cat: CatalogKind, page = 1): Promise<Movie[]> {
  const today = new Date().toISOString().split("T")[0];
  const params = new URLSearchParams({
    api_key: TMDB_KEY,
    with_original_language: "ml",
    page: String(page),
  });

  if (cat.kind === "ott") {
    params.set("release_date.lte", today);
    params.set("with_release_type", "4|5");
    params.set("region", "IN");
    params.set("sort_by", "release_date.desc");
  } else if (cat.kind === "future") {
    params.set("primary_release_date.gte", today);
    params.set("sort_by", "primary_release_date.asc");
  } else if (cat.kind === "genre") {
    params.set("primary_release_date.lte", today);
    params.set("with_genres", String(cat.genreId));
    params.set("sort_by", "primary_release_date.desc");
  } else {
    params.set("primary_release_date.lte", today);
    params.set("sort_by", "primary_release_date.desc");
  }

  const res = await fetch(`${BASE}/discover/movie?${params.toString()}`);
  if (!res.ok) throw new Error("TMDB request failed");
  const data = await res.json();
  return (data.results || []) as Movie[];
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const params = new URLSearchParams({
    api_key: TMDB_KEY,
    query,
    with_original_language: "ml",
  });
  const res = await fetch(`${BASE}/search/movie?${params.toString()}`);
  if (!res.ok) return [];
  const data = await res.json();
  return ((data.results || []) as Movie[]).filter((m) => (m as any).original_language === "ml");
}

export interface MovieDetails extends Movie {
  tagline: string;
  runtime: number;
  status: string;
  genres: { id: number; name: string }[];
  imdb_id?: string;
  original_title: string;
  homepage?: string;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
  videos?: { results: { key: string; site: string; type: string; name: string }[] };
  "watch/providers"?: {
    results: Record<
      string,
      {
        link?: string;
        flatrate?: Provider[];
        rent?: Provider[];
        buy?: Provider[];
      }
    >;
  };
  release_dates?: {
    results: {
      iso_3166_1: string;
      release_dates: { type: number; release_date: string; note?: string }[];
    }[];
  };
  external_ids?: { imdb_id?: string; wikidata_id?: string };
  similar?: { results: Movie[] };
}

export interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

export async function fetchMovieDetails(id: string | number): Promise<MovieDetails> {
  const params = new URLSearchParams({
    api_key: TMDB_KEY,
    append_to_response: "credits,videos,watch/providers,release_dates,external_ids,similar",
  });
  const res = await fetch(`${BASE}/movie/${id}?${params.toString()}`);
  if (!res.ok) throw new Error("Movie not found");
  return res.json();
}

/** Release types per TMDB: 1=Premiere, 2=Theatrical(limited), 3=Theatrical, 4=Digital, 5=Physical, 6=TV */
export function getReleaseInfo(details: MovieDetails, region = "IN") {
  const r =
    details.release_dates?.results.find((x) => x.iso_3166_1 === region) ||
    details.release_dates?.results.find((x) => x.iso_3166_1 === "US");
  if (!r) return { hasTheatrical: false, hasDigital: false };
  const types = new Set(r.release_dates.map((x) => x.type));
  return {
    hasTheatrical: types.has(2) || types.has(3),
    hasDigital: types.has(4),
    region: r.iso_3166_1,
  };
}