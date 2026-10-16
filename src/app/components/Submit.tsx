import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

const fieldClassName =
  "w-full rounded-none border-0 border-b border-white bg-black px-0 py-3 text-white placeholder:text-white outline-none transition-colors focus:border-[#D9E800] focus:ring-0"
const labelClassName = "mb-1 block text-sm leading-5 text-white"

export function Submit() {
  const [formData, setFormData] = useState({
    artist: "",
    title: "",
    videoUrl: "",
    director: "",
    productionCompany: "",
    dop: "",
    techniques: "",
    decade: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    console.log("Submitted video:", formData)
    setSubmitted(true)

    setTimeout(() => {
      setFormData({
        artist: "",
        title: "",
        videoUrl: "",
        director: "",
        productionCompany: "",
        dop: "",
        techniques: "",
        decade: "",
      })
      setSubmitted(false)
    }, 3000)
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  if (submitted) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-7xl items-center px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7 lg:col-start-4">
          <CheckCircle2 className="mb-8 size-10 text-[#D9E800]" />
          <p className="mb-3 font-['Kommuna_Demo'] text-[28px] leading-[33px] text-[#D9E800]">
            Thank you
          </p>
          <h1 className="mb-6 font-['JetBrains_Mono'] text-4xl font-extrabold uppercase leading-tight sm:text-5xl">
            Submission received
          </h1>
          <p className="max-w-xl text-lg leading-7 text-white">
            Thank you for contributing to dazed and amazed. We'll review your
            submission soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
        <header className="lg:col-span-4">
          <p className="mb-3 font-['Kommuna_Demo'] text-[28px] leading-[33px] text-[#D9E800]">
            Send us something remarkable
          </p>
          <h1 className="mb-6 font-['JetBrains_Mono'] text-4xl font-extrabold uppercase leading-tight sm:text-5xl">
            Submit a video
          </h1>
          <p className="max-w-sm text-base leading-6 text-white">
            Share a music video with exceptional craft and direction. All
            submissions are reviewed before being added to the collection.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 lg:col-span-7 lg:col-start-6"
        >
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="artist" className={labelClassName}>
                Artist Name <span className="text-[#D9E800]">*</span>
              </label>
              <input
                type="text"
                id="artist"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                required
                className={fieldClassName}
                placeholder="e.g., Björk"
              />
            </div>

            <div>
              <label htmlFor="title" className={labelClassName}>
                Video Title <span className="text-[#D9E800]">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className={fieldClassName}
                placeholder="e.g., All is Full of Love"
              />
            </div>
          </div>

          <div>
            <label htmlFor="videoUrl" className={labelClassName}>
              YouTube or Vimeo URL <span className="text-[#D9E800]">*</span>
            </label>
            <input
              type="url"
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              required
              className={fieldClassName}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="director" className={labelClassName}>
                Director
              </label>
              <input
                type="text"
                id="director"
                name="director"
                value={formData.director}
                onChange={handleChange}
                className={fieldClassName}
                placeholder="e.g., Chris Cunningham"
              />
            </div>

            <div>
              <label htmlFor="productionCompany" className={labelClassName}>
                Production Company
              </label>
              <input
                type="text"
                id="productionCompany"
                name="productionCompany"
                value={formData.productionCompany}
                onChange={handleChange}
                className={fieldClassName}
                placeholder="e.g., Partizan"
              />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="dop" className={labelClassName}>
                Director of Photography (DOP)
              </label>
              <input
                type="text"
                id="dop"
                name="dop"
                value={formData.dop}
                onChange={handleChange}
                className={fieldClassName}
                placeholder="e.g., Adam Barker-Mill"
              />
            </div>

            <div>
              <label htmlFor="techniques" className={labelClassName}>
                Techniques / Concepts
              </label>
              <input
                type="text"
                id="techniques"
                name="techniques"
                value={formData.techniques}
                onChange={handleChange}
                className={fieldClassName}
                placeholder="e.g., CGI, Motion Control, Robotics"
              />
            </div>
          </div>

          <div className="max-w-xs">
            <label htmlFor="decade" className={labelClassName}>
              Decade
            </label>
            <select
              id="decade"
              name="decade"
              value={formData.decade}
              onChange={handleChange}
              className={fieldClassName}
            >
              <option value="">Select decade</option>
              <option value="1970s">1970s</option>
              <option value="1980s">1980s</option>
              <option value="1990s">1990s</option>
              <option value="2000s">2000s</option>
              <option value="2010s">2010s</option>
              <option value="2020s">2020s</option>
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-md bg-[#D9E800] px-4 font-['JetBrains_Mono'] text-[18px] font-extrabold uppercase leading-[18px] tracking-[-0.36px] text-black transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Submit video
          </button>
        </form>
      </div>
    </div>
  )
}
