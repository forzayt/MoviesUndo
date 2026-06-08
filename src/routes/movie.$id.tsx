import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Calendar, Star, ExternalLink, Play, Ticket, Tv, Globe } from "lucide-react";
import { Header } from "@/components/Header";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import { fetchMovieDetails, getReleaseInfo, img, type Provider } from "@/lib/tmdb";

export const Route = createFileRoute("/movie/$id")({
  component: MovieDetailsPage,
});

function MovieDetailsPage() {
  const { id } = useParams({ from: "/movie/$id" });
  const { data, isLoading, error } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => fetchMovieDetails(id),
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) return <DetailsSkeleton />;
  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 px-6 sm:px-10">
          <p className="text-muted-foreground">Couldn't load this movie.</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Back home</Link>
        </div>
      </div>
    );
  }

  const backdrop = img(data.backdrop_path, "original");
  const poster = img(data.poster_path, "w500");
  const release = getReleaseInfo(data, "IN");
  const providers = data["watch/providers"]?.results?.["IN"] || data["watch/providers"]?.results?.["US"];
  const director = data.credits?.crew.find((c) => c.job === "Director");
  const trailer =
    data.videos?.results.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    data.videos?.results.find((v) => v.site === "YouTube");
  const year = data.release_date?.slice(0, 4);
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : null;
  const imdbId = data.external_ids?.imdb_id || data.imdb_id;

  const bmsQuery = encodeURIComponent(data.title);
  const watchLinks = buildWatchLinks({
    title: data.title,
    providers,
    tmdbWatchLink: data["watch/providers"]?.results?.["IN"]?.link,
    hasTheatrical: release.hasTheatrical,
    hasDigital: release.hasDigital || !!(providers?.flatrate?.length || providers?.rent?.length),
    imdbId,
    homepage: data.homepage,
    bmsQuery,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Backdrop */}
      <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        {backdrop && (
          <img src={backdrop} alt="" className="h-full w-full object-cover scale-105 animate-fade-up" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      <div className="relative -mt-72 px-6 sm:px-10 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
          {/* Poster */}
          <div className="animate-fade-up">
            {poster ? (
              <img
                src={poster}
                alt={data.title}
                className="w-full max-w-[280px] rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-border/50"
              />
            ) : (
              <div className="aspect-[2/3] w-full max-w-[280px] rounded-2xl bg-secondary" />
            )}
          </div>

          {/* Info */}
          <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            {data.tagline && (
              <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-3">{data.tagline}</p>
            )}
            <h1 className="font-display text-5xl sm:text-6xl text-foreground leading-[1.05]">
              {data.title}
            </h1>
            {data.original_title !== data.title && (
              <p className="mt-2 text-sm text-muted-foreground italic">{data.original_title}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {year && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {year}
                </span>
              )}
              {runtime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {runtime}
                </span>
              )}
              {data.vote_average > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  {data.vote_average.toFixed(1)} / 10
                </span>
              )}
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">
                {data.status}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {data.genres.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-foreground/80"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <p className="mt-7 max-w-2xl text-base leading-relaxed text-foreground/90">
              {data.overview || "No synopsis available."}
            </p>

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
                >
                  <Play className="h-4 w-4 fill-current" /> Watch Trailer
                </a>
              )}
              {watchLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:bg-card hover:border-primary/60"
                >
                  {link.icon}
                  {link.label}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Where to watch (providers) */}
        {providers && (providers.flatrate || providers.rent || providers.buy) && (
          <section className="mt-20 max-w-4xl">
            <h2 className="font-display text-3xl mb-6">Where to watch</h2>
            <div className="space-y-5">
              <ProviderList label="Stream" items={providers.flatrate} />
              <ProviderList label="Rent" items={providers.rent} />
              <ProviderList label="Buy" items={providers.buy} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Availability shown for India · provided by JustWatch via TMDB
            </p>
          </section>
        )}

        {!providers?.flatrate?.length && release.hasTheatrical && (
          <section className="mt-20 max-w-2xl rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-primary" />
              <h3 className="font-display text-2xl">In theatres now</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Not yet on a streaming platform — catch it on the big screen.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`https://in.bookmyshow.com/explore/movies-${bmsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:scale-105 transition-transform"
              >
                Book on BookMyShow <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={`https://paytm.com/movies/search?q=${bmsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm hover:border-primary/60 transition-colors"
              >
                Paytm Movies <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </section>
        )}

        {/* Cast */}
        {data.credits?.cast && data.credits.cast.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-3xl mb-6">Cast</h2>
            <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4">
              {data.credits.cast.slice(0, 15).map((c) => (
                <div key={c.id} className="w-[120px] shrink-0 text-center">
                  <div className="aspect-square overflow-hidden rounded-full bg-secondary ring-1 ring-border/50">
                    {c.profile_path ? (
                      <img src={img(c.profile_path, "w300") || ""} alt={c.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-full w-full bg-secondary" />
                    )}
                  </div>
                  <p className="mt-2 text-xs font-medium line-clamp-1">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Details meta grid */}
        <section className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl border-t border-border pt-10">
          {director && <Meta label="Director" value={director.name} />}
          <Meta label="Release Date" value={data.release_date || "—"} />
          <Meta label="Status" value={data.status} />
          <Meta label="Language" value="Malayalam" />
          {data.production_companies?.[0] && (
            <Meta label="Studio" value={data.production_companies.map((p) => p.name).join(", ")} />
          )}
        </section>

        {/* Similar */}
        {data.similar?.results && data.similar.results.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-3xl mb-6 px-1">More like this</h2>
            <div className="scrollbar-hide flex gap-5 overflow-x-auto pb-6">
              {data.similar.results.slice(0, 12).map((m, i) => (
                <MovieCard key={m.id} movie={m} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm text-foreground">{value}</p>
    </div>
  );
}

function ProviderList({ label, items }: { label: string; items?: Provider[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">{label}</p>
      <div className="flex flex-wrap gap-3">
        {items.map((p) => (
          <div
            key={p.provider_id}
            title={p.provider_name}
            className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-sm"
          >
            {p.logo_path && (
              <img src={img(p.logo_path, "w300") || ""} alt={p.provider_name} className="h-7 w-7 rounded-md object-cover" />
            )}
            <span className="text-foreground/90">{p.provider_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildWatchLinks(opts: {
  title: string;
  providers?: { flatrate?: Provider[]; rent?: Provider[]; buy?: Provider[]; link?: string };
  tmdbWatchLink?: string;
  hasTheatrical: boolean;
  hasDigital: boolean;
  imdbId?: string;
  homepage?: string;
  bmsQuery: string;
}) {
  const links: { label: string; href: string; icon: React.ReactNode }[] = [];

  if (opts.tmdbWatchLink) {
    links.push({ label: "All Streaming Options", href: opts.tmdbWatchLink, icon: <Tv className="h-4 w-4" /> });
  }

  if (opts.hasTheatrical) {
    links.push({
      label: "Book Tickets",
      href: `https://in.bookmyshow.com/explore/movies-${opts.bmsQuery}`,
      icon: <Ticket className="h-4 w-4" />,
    });
  }

  if (opts.imdbId) {
    links.push({
      label: "IMDb",
      href: `https://www.imdb.com/title/${opts.imdbId}`,
      icon: <Star className="h-4 w-4" />,
    });
  }

  if (opts.homepage) {
    links.push({ label: "Official Site", href: opts.homepage, icon: <Globe className="h-4 w-4" /> });
  }

  return links;
}

function DetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[70vh] min-h-[500px] skeleton" />
      <div className="relative -mt-72 px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
          <div className="aspect-[2/3] max-w-[280px] rounded-2xl skeleton" />
          <div className="space-y-4 pt-6">
            <div className="h-12 w-2/3 rounded skeleton" />
            <div className="h-4 w-1/2 rounded skeleton" />
            <div className="h-24 w-full max-w-2xl rounded skeleton" />
            <div className="flex gap-4 pt-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}