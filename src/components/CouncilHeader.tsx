import logo from "@/assets/logo_uncanny_council.png";

export function CouncilHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 pt-12 pb-8 pointer-events-none">
      {/* Gradient overlay to fade content behind header */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-transparent" />
      
      <div className="relative text-center flex flex-col items-center gap-4">
        <h1 className="font-display text-2xl tracking-[0.3em] uppercase text-foreground/80">
          Uncanny Council
        </h1>
        <div className="relative w-24 h-24">
          {/* Circular mask to hide the square edges */}
          <div 
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              maskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)'
            }}
          >
            <img 
              src={logo} 
              alt="Uncanny Council logo" 
              className="w-full h-full object-contain mix-blend-lighten scale-125" 
            />
          </div>
        </div>
      </div>
    </header>
  );
}
