import logo from "@/assets/logo_uncanny_council.png";

export function CouncilHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 pt-12 pb-8 pointer-events-none relative backdrop-blur-md bg-background/85">
      {/* Solid backdrop (no fade) so messages remain readable when scrolled under the header */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-border/50" />
      <div className="relative text-center flex flex-col items-center gap-4">
        <h1 className="font-display text-2xl tracking-[0.3em] uppercase text-foreground/80">
          Uncanny Council
        </h1>

        {/*
          Ensure the logo stays visible even if the PNG is dark/transparent by placing it
          on a softly lit surface with subtle border and shadow.
        */}
        <div className="rounded-full bg-card/40 border border-border/40 backdrop-blur-md shadow-lg p-3">
          <img
            src={logo}
            alt="Uncanny Council logo"
            className="w-14 h-14 object-contain"
            loading="eager"
          />
        </div>
      </div>
    </header>
  );
}
