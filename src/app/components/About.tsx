import polinaPhoto from "../../imports/polina-photo-large.jpeg"

export function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      {/* Editorial Lead / Manifesto */}
      <header className="mb-16 border-b border-white/10 pb-12 lg:mb-20 lg:pb-16">
        <p className="font-['Kommuna_Demo'] text-3xl font-normal leading-[1.15] tracking-tight text-white sm:text-5xl lg:max-w-5xl lg:text-6xl">
          A living archive of music videos defined by{" "}
          <span className="text-[#D9E800]">exceptional craft</span>,
          cinematography, and singular directorial vision.
        </p>
      </header>

      {/* Main Editorial Grid */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Column: Framed Portrait */}
        <div className="lg:col-span-5">
          <div className="group relative overflow-hidden bg-zinc-950">
            <img
              src={polinaPhoto}
              alt="Polina Varfolomeeva"
              className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          </div>
          <p className="mt-3 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-zinc-500">
            [ Curator — Polina Varfolomeeva ]
          </p>
        </div>

        {/* Right Column: Bio, Pull-Quote, Mission */}
        <div className="space-y-12 lg:col-span-7 lg:pl-4">
          {/* Section 01: Curator */}
          <div>
            <span className="font-['JetBrains_Mono'] text-xs font-semibold uppercase tracking-widest text-[#D9E800]">
              01 / The Curator
            </span>
            <h2 className="mt-2 mb-6 font-['JetBrains_Mono'] text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
              Polina Varfolomeeva
            </h2>

            <div className="space-y-4 text-base leading-relaxed text-zinc-300">
              <p>
                Polina Varfolomeeva is a film director and educator dedicated to
                the intersection of visual storytelling and music. With a decade
                of experience in commercial and music video direction, she has
                worked with indie artists and major brands across multiple
                genres.
              </p>
              <p>
                As an educator, Polina teaches visual narrative and directing at
                leading film schools, sharing her passion for innovative
                cinematography, precise in-camera effects, and a delicate approach to
                the creative process.
              </p>
            </div>
          </div>

          {/* Pull-Quote */}
          <blockquote className="border-l-2 border-[#D9E800] pl-6 font-['Kommuna_Demo'] text-2xl leading-snug text-white sm:text-3xl">
            “Music videos are a unique canvas where directors can experiment,
            take risks, and tell stories in ways that cinema often doesn't allow.
            This collection celebrates that spirit.”
          </blockquote>

          {/* Section 02: Platform & Mission */}
          <div>
            <span className="font-['JetBrains_Mono'] text-xs font-semibold uppercase tracking-widest text-[#D9E800]">
              02 / The Mission
            </span>
            <h2 className="mt-2 mb-6 font-['JetBrains_Mono'] text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
              The Platform
            </h2>

            <div className="space-y-4 text-base leading-relaxed text-zinc-300">
              <p>
                This site is a resource for directors, cinematographers, and
                visual artists seeking inspiration from works known for
                top-tier execution. We focus on pieces that demonstrate
                inventive techniques, compelling narratives, and memorable
                artistic vision.
              </p>
              <p>
                Each work is curated for its cultural resonance, technical merit,
                and directorial voice—serving as an educational and creative
                wellspring for filmmakers worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}