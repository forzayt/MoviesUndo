import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchCatalog, type CatalogKind } from "@/lib/tmdb";
import { MovieCard, MovieCardSkeleton } from "./MovieCard";

interface Props {
  title: string;
  subtitle?: string;
  catalog: CatalogKind;
  queryKey: string;
}

export function MovieRow({ title, subtitle, catalog, queryKey }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || inView) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        });
      },
      { rootMargin: "300px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView]);

  const { data, isLoading } = useQuery({
    queryKey: ["catalog", queryKey],
    queryFn: () => fetchCatalog(catalog, 1),
    staleTime: 1000 * 60 * 30,
    enabled: inView,
  });

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative group/row min-h-[360px]">
      <div className="mb-5 flex items-end justify-between px-6 sm:px-10">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="hidden sm:flex gap-2 opacity-0 transition-opacity duration-300 group-hover/row:opacity-100">
          <button
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="rounded-full border border-border bg-card/60 p-2 backdrop-blur-md transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="rounded-full border border-border bg-card/60 p-2 backdrop-blur-md transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="scrollbar-hide flex gap-5 overflow-x-auto px-6 sm:px-10 pb-6 scroll-smooth"
      >
        {!inView || isLoading
          ? Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)
          : data?.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
        {inView && !isLoading && (!data || data.length === 0) && (
          <p className="text-sm text-muted-foreground">No releases found.</p>
        )}
      </div>
    </section>
  );
}