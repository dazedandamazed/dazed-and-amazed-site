import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { useLanguage, type Language } from "../contexts/LanguageContext"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const handleValueChange = (value: string) => {
    if (value === "en" || value === "ru") {
      setLanguage(value as Language)
    }
  }

  return (
    <ToggleGroup
      type="single"
      value={language}
      onValueChange={handleValueChange}
      aria-label="Caption language"
      className="h-9 gap-0 font-['Kommuna_Demo'] text-xl leading-none"
    >
      <ToggleGroupItem
        value="en"
        aria-label="Show English captions"
        className="h-9 min-w-0 bg-black px-1 text-xl font-normal text-white hover:bg-black hover:text-[#D9E800] data-[state=on]:bg-black data-[state=on]:text-[#D9E800]"
      >
        En
      </ToggleGroupItem>
      <ToggleGroupItem
        value="ru"
        aria-label="Show Russian captions"
        className="h-9 min-w-0 bg-black px-1 text-xl font-normal text-white hover:bg-black hover:text-[#D9E800] data-[state=on]:bg-black data-[state=on]:text-[#D9E800]"
      >
        Ru
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
