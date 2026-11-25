import { Link } from "react-router"

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/20 pt-12 pb-16">
      <div className="mx-auto flex flex-col items-center gap-8 px-4 text-center">
        {/* Row 1: Social Icons — strictly aligned by height, perfectly balanced */}
        <div className="flex items-center justify-center gap-8 sm:gap-10">
          {/* Instagram */}
          <a
            href="https://instagram.com/dazed_amazed"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[42px] items-center justify-center transition-opacity hover:opacity-75"
            aria-label="Instagram"
          >
            <img
              src="/assets/instagram.svg"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = "/assets/instagram.png"
              }}
              alt="Instagram"
              className="h-[32px] w-auto object-contain"
            />
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/dazedandamazed"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[32px] items-center justify-center transition-opacity hover:opacity-75"
            aria-label="Telegram"
          >
            <img
              src="/assets/telegram.svg"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = "/assets/telegram.png"
              }}
              alt="Telegram"
              className="h-[32px] w-auto object-contain"
            />
          </a>

          {/* YouTube */}
          <a
            href="https://youtube.com/@dazed.and.amazed?si=UdiTpnLe1S9a9diK"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[32px] items-center justify-center transition-opacity hover:opacity-75"
            aria-label="YouTube"
          >
            <img
              src="/assets/youtube.svg"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = "/assets/youtube.png"
              }}
              alt="YouTube"
              className="h-[32px] w-auto object-contain"
            />
          </a>
        </div>

        {/* Row 2: Bold white footer details */}
        <div className="flex flex-col items-center justify-center gap-2 text-center font-['JetBrains_Mono'] text-[16px] font-bold uppercase leading-[14px] tracking-[-0.36px] text-white sm:flex-row sm:gap-4 sm:text-[14px]">
          <span>Curated by Polina Varfolomeeva</span>
          <span className="hidden sm:inline text-white">  </span>
          <span>2026</span>
          <span className="hidden sm:inline text-white">  </span>
          <Link
            to="/terms"
            className="text-white transition-colors hover:text-[#D9E800]"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  )
}