import { useEffect, useState } from "react";
import { Film } from "lucide-react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 sm:px-10 py-4">
        <a href="#top" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 transition-transform group-hover:scale-110">
            <Film className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl text-foreground">
            Movies<span className="text-gradient-gold">Undo</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#new" className="transition-colors hover:text-foreground">New</a>
          <a href="#ott" className="transition-colors hover:text-foreground">OTT</a>
          <a href="#future" className="transition-colors hover:text-foreground">Upcoming</a>
          <a href="#genres" className="transition-colors hover:text-foreground">Genres</a>
        </nav>
      </div>
    </header>
  );
}