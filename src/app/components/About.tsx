import polinaPhoto from "../../imports/polina-photo-large.jpeg"

export function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <header className="mb-14 grid gap-5 lg:mb-20 lg:grid-cols-12">
        <h1 className="font-['JetBrains_Mono'] text-5xl font-extrabold uppercase leading-none tracking-[-0.04em] sm:text-7xl lg:col-span-7 lg:text-8xl">
          About
        </h1>
        <p className="max-w-md self-end font-['Kommuna_Demo'] text-[32px] leading-[36px] text-[#D9E800] lg:col-span-5">
          A living archive for people who make images move.
        </p>
      </header>

      <section className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <img
            src={polinaPhoto}
            alt="Polina Varfolomeeva"
            className="aspect-[2/3] w-full object-cover"
          />
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <p className="mb-2 text-sm uppercase tracking-wider text-[#D9E800]">
            Curated by
          </p>
          <h2 className="mb-8 font-['JetBrains_Mono'] text-3xl font-extrabold uppercase leading-tight sm:text-4xl">
            Polina Varfolomeeva
          </h2>

          <div className="space-y-6 text-base leading-7 text-white">
            <p>
              Polina Varfolomeeva is a film director and educator dedicated to
              the intersection of visual storytelling and music. With a decade
              of experience in commercial and music video direction, she has
              worked with indie artists and major brands across multiple
              genres. Her social media projects are exploring what music videos
              can achieve as an art form.
            </p>

            <p>
              As an educator, Polina teaches visual narrative and directing at
              leading film schools, sharing her passion for innovative
              cinematography and creative technique. Her work emphasizes the
              importance of craft, collaboration, and a delicate approach to
              the creative process.
            </p>

            <p>
              This platform serves as a curated collection of music videos that
              exemplify top-tier direction, cinematography, and conceptual
              excellence. Each video is selected for its artistic merit,
              technical innovation, and cultural impact—offering inspiration
              for filmmakers, creatives, and music video enthusiasts worldwide.
            </p>
          </div>
        </div>
      </section>

      <blockquote className="my-16 max-w-5xl font-['Kommuna_Demo'] text-[36px] leading-[40px] text-[#D9E800] sm:text-[48px] sm:leading-[52px] lg:my-24">
        “Music videos are a unique canvas where directors can experiment, take
        risks, and tell stories in ways that cinema often doesn't allow. This
        collection celebrates that spirit.”
      </blockquote>

      <section className="grid gap-6 lg:grid-cols-12 lg:gap-12">
        <h2 className="font-['JetBrains_Mono'] text-2xl font-extrabold uppercase leading-7 lg:col-span-4">
          Our mission
        </h2>
        <p className="max-w-3xl text-lg leading-8 text-white lg:col-span-7 lg:col-start-6">
          This site is a resource for creatives seeking inspiration from music
          videos known for exceptional craft and direction. We focus on works
          that demonstrate innovative techniques, compelling visual
          storytelling, and memorable artistic vision. Whether you're a
          filmmaker, cinematographer, or simply a lover of visual art, this
          collection aims to showcase the very best of music video direction.
        </p>
      </section>
    </div>
  )
}
