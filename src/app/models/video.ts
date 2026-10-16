export interface VideoLink {
  url: string
  label: string
}

export interface VideoStill {
  src: string
  alt: string
  sourceUrl?: string
}

export interface Video {
  id: string
  title: string
  artist: string
  videoUrl: string
  videoDirectUrl?: string
  thumbnail: string
  techniques: string[]
  creators: {
    director?: string
    productionCompany?: string
    dop?: string
  }
  decade: string
  descriptions?: {
    en: string
    ru: string
  }
  links?: VideoLink[]
  media?: {
    stills?: VideoStill[]
    gifs?: string[]
    bts?: string[]
  }
}
