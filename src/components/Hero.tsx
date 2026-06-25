import { useQuery } from "@tanstack/react-query";
import { fetchCatalog, img } from "@/lib/tmdb";
import { useEffect, useState } from "react";
import { Play, Info } from "lucide-react";

export function Hero() {
  const { data } = useQuery({
    queryKey: ["catalog", "hero"],
    queryFn: () => fetchCatalog({ kind: "new" }, 1),
    staleTime: 1000 * 60 * 30,
  });

  const featured = (data || []).filter((m) => m.backdrop_path).slice(0, 5);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (featured.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % featured.length), 6000);
    return () => clearInterval(t);
  }, [featured.length]);

  const movie = featured[idx];

  return (
    <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden">
      {featured.map((m, i) => (
        <div
          key={m.id}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: i === idx ? 1 : 0 }}
        >
          <img
            src={img(m.backdrop_path, "original") || ""}
            alt=""
            className="h-full w-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>
      ))}

      <div className="relative z-10 flex h-full flex-col justify-end px-6 sm:px-10 pb-20 max-w-3xl">
        <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-md animate-fade-up">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Now Featured
        </div>

        <h1
          key={movie?.id ?? "ph"}
          className="font-display text-5xl sm:text-7xl leading-[1.05] text-foreground animate-fade-up"
        >
          {movie?.title || "Discover Malayalam Cinema"}
        </h1>

        <p
          key={`o-${movie?.id ?? "ph"}`}
          className="mt-5 max-w-xl text-base text-muted-foreground line-clamp-3 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          {movie?.overview ||
            "A curated catalog of the latest releases, OTT premieres, and upcoming films from God's own country."}
        </p>

        <div className="mt-8 flex gap-3 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <a
            href="#new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
          >
            <Play className="h-4 w-4 fill-current" />
            Explore Now
          </a>
          <a
            href="#genres"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-6 py-3 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:bg-card"
          >
            <Info className="h-4 w-4" />
            Browse Genres
          </a>
        </div>

        {featured.length > 1 && (
          <div className="mt-10 flex gap-2">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === idx ? "w-10 bg-primary" : "w-5 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
