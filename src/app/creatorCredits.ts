export interface CreditPart {
  name: string
  separatorBefore: string
}

const artistSeparator = /(\s*,\s*|\s+(?:ft|feat(?:uring)?)\.?\s+)/i
const directorSeparator = /(\s*,\s*)/
const tylerCreatorComma = "\uE000"

function splitCredit(credit: string, separator: RegExp): CreditPart[] {
  const tokens = credit.split(separator)
  const parts: CreditPart[] = []
  let separatorBefore = ""

  tokens.forEach((token, index) => {
    if (index % 2 === 1) {
      separatorBefore += token
      return
    }

    const name = token.trim()
    if (!name) return

    parts.push({ name, separatorBefore })
    separatorBefore = ""
  })

  return parts
}

export function splitArtistCredit(credit: string): CreditPart[] {
  const protectedCredit = credit.replace(/Tyler,\s*The Creator/gi, (match) =>
    match.replace(",", tylerCreatorComma),
  )

  return splitCredit(protectedCredit, artistSeparator).map((part) => ({
    ...part,
    name: part.name.replaceAll(tylerCreatorComma, ","),
  }))
}

export function splitDirectorCredit(credit: string): CreditPart[] {
  return splitCredit(credit, directorSeparator)
}
