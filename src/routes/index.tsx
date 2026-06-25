import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MovieRow } from "@/components/MovieRow";
import { GENRES } from "@/lib/tmdb";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MoviesUndo — Malayalam Cinema, Curated" },
      {
        name: "description",
        content:
          "Discover the latest Malayalam movies, OTT premieres, and upcoming releases — a beautifully crafted cinema catalog.",
      },
      { property: "og:title", content: "MoviesUndo" },
      { property: "og:description", content: "Malayalam cinema, curated." },
    ],
  }),
  component: Index,
});

function Index() {
  const featuredGenres = ["Drama", "Thriller", "Action", "Comedy", "Romance", "Mystery"];

  return (
    <div id="top" className="min-h-screen bg-background">
      <Header />
      <Hero />

      <main className="space-y-20 pb-32 pt-10">
        <div id="new">
          <MovieRow
            title="New Releases"
            subtitle="The freshest Malayalam films, just out"
            catalog={{ kind: "new" }}
            queryKey="new"
          />
        </div>

        <div id="ott">
          <MovieRow
            title="On OTT"
            subtitle="Streaming now, ready when you are"
            catalog={{ kind: "ott" }}
            queryKey="ott"
          />
        </div>

        <div id="future">
          <MovieRow
            title="Coming Soon"
            subtitle="Mark your calendar — these are next"
            catalog={{ kind: "future" }}
            queryKey="future"
          />
        </div>

        <div id="genres" className="space-y-20 pt-4">
          <div className="px-6 sm:px-10">
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80">By Genre</p>
            <h2 className="font-display text-5xl mt-2">Explore by mood</h2>
          </div>
          {featuredGenres.map((g) => (
            <MovieRow
              key={g}
              title={g}
              catalog={{ kind: "genre", genreId: GENRES[g] }}
              queryKey={`genre-${g}`}
            />
          ))}
        </div>
      </main>

      <footer className="border-t border-border/50 px-6 sm:px-10 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-display text-2xl">
            Movies<span className="text-gradient-gold">Undo</span>
          </p>
          <p className="text-xs text-muted-foreground">Powered by TMDB · Data refreshes daily</p>
        </div>
      </footer>
    </div>
  );
}
