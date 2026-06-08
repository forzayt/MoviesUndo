import { type Movie, img } from "@/lib/tmdb";
import { Star } from "lucide-react";

export function MovieCard({ movie, index = 0 }: { movie: Movie; index?: number }) {
  const poster = img(movie.poster_path, "w500");
  const year = movie.release_date?.slice(0, 4);

  return (
    <div
      className="group relative w-[180px] sm:w-[200px] shrink-0 cursor-pointer animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary shadow-[var(--shadow-card)] ring-1 ring-border/50 transition-all duration-500 ease-out group-hover:ring-primary/50 group-hover:-translate-y-2 group-hover:shadow-[var(--shadow-gold)]">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
            No poster
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="line-clamp-3 text-xs text-foreground/90 leading-relaxed">
            {movie.overview || "No description available."}
          </p>
        </div>

        {movie.vote_average > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-[11px] font-medium backdrop-blur-md ring-1 ring-border/50">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {movie.vote_average.toFixed(1)}
          </div>
        )}
      </div>

      <div className="mt-3 px-1">
        <h3 className="line-clamp-1 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
          {movie.title}
        </h3>
        {year && <p className="mt-0.5 text-xs text-muted-foreground">{year}</p>}
      </div>
    </div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="w-[180px] sm:w-[200px] shrink-0">
      <div className="aspect-[2/3] rounded-xl skeleton" />
      <div className="mt-3 h-3 w-3/4 rounded skeleton" />
      <div className="mt-2 h-2 w-1/3 rounded skeleton" />
    </div>
  );
}