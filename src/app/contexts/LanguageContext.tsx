import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export type Language = "en" | "ru"

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
}

const STORAGE_KEY = "dazed-and-amazed:caption-language"

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLanguage(): Language {
  try {
    const storedLanguage = window.localStorage.getItem(STORAGE_KEY)
    return storedLanguage === "ru" || storedLanguage === "en"
      ? storedLanguage
      : "en"
  } catch {
    return "en"
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // The preference remains available for this session when storage is blocked.
    }
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }

  return context
}
