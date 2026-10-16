import polinaPhoto from "../../imports/polina-photo-large.jpeg"

export function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
      {/* Quiet Manifesto (Calibrated size, no divider line) */}
      <div className="mb-12 max-w-3xl lg:mb-16">
        <p className="font-['Kommuna_Demo'] text-xl font-normal leading-snug text-white sm:text-2xl lg:text-3xl">
          A curated archive celebrating music videos with{" "}
          <span className="text-[#D9E800]">exceptional craft</span>,
          cinematography, and singular directorial vision.
        </p>
      </div>

      {/* 2-Column Editorial Spread */}
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Left: Pure Portrait (No frame, no brackets, no captions) */}
        <div className="lg:col-span-5">
          <img
            src={polinaPhoto}
            alt="Polina Varfolomeeva"
            className="aspect-[3/4] w-full object-cover"
          />
        </div>

        {/* Right: Pure Narrative */}
        <div className="space-y-8 lg:col-span-7">
          <div>
            <h1 className="font-['JetBrains_Mono'] text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
              Polina Varfolomeeva
            </h1>
            <p className="mt-1 font-['JetBrains_Mono'] text-xs uppercase tracking-widest text-[#D9E800]">
              Director & Educator
            </p>
          </div>

          {/* Bio */}
          <p className="text-base leading-relaxed text-white sm:text-lg">
            Film director and educator working at the intersection of visual
            narrative and music. With a decade of directing commercial and music
            video projects, she teaches visual storytelling and directing at leading
            film schools, sharing a passion for innovative cinematography, in-camera
            techniques, and precise visual craft.
          </p>

          {/* Core Quote */}
          <blockquote className="border-l-2 border-[#D9E800] pl-5 font-['Kommuna_Demo'] text-xl leading-normal text-white sm:text-2xl">
            “Music videos are a unique canvas where directors can experiment,
            take risks, and tell stories in ways that cinema often doesn't allow.”
          </blockquote>

          {/* Platform Mission */}
          <p className="text-base leading-relaxed text-white sm:text-lg">
            This platform is an independent visual library for directors,
            cinematographers, and researchers. Every work is selected for conceptual
            daring, technical precision, and cultural impact—showcasing the very
            best of music video direction.
          </p>
        </div>
      </div>
    </div>
  )
}