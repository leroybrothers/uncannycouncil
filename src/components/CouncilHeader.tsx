import logo from "@/assets/logo_uncanny_council.png";

export function CouncilHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 pt-12 pb-8 pointer-events-none">
      <div className="text-center flex flex-col items-center gap-4">
        <h1 className="font-display text-2xl tracking-[0.3em] uppercase text-foreground/80">
          Uncanny Council
        </h1>
        <img src={logo} alt="Uncanny Council logo" className="w-20 h-20 object-contain mix-blend-lighten" />
      </div>
    </header>
  );
}
