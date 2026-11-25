import { Link } from "react-router"
import { ArrowLeft } from "lucide-react"

export function Terms() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20 text-white">
      <Link
        to="/"
        className="group mb-8 inline-flex items-center space-x-2 text-white transition-colors hover:text-[#D9E800]"
      >
        <ArrowLeft className="size-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
        <span className="font-['JetBrains_Mono'] text-xs font-extrabold uppercase tracking-wider">
          Back to archive
        </span>
      </Link>

      <h1 className="mb-6 font-['JetBrains_Mono'] text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
        Terms & Conditions
      </h1>

      <div className="space-y-6 font-['Helvetica_Neue'] text-base leading-relaxed text-white/80">
        <p>
          This platform is an independent, educational, non-commercial curated archive
          dedicated to the study and appreciation of music video craft, direction,
          and cinematography.
        </p>
        <p>
          All video streams and embedded materials belong to their respective copyright
          holders, record labels, and artists. Embedded playback is powered directly by
          official third-party streaming providers (YouTube and Vimeo).
        </p>
        <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-white/40">
          Last updated: 2026
        </p>
      </div>
    </div>
  )
}