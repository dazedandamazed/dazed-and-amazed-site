import { Link, Outlet, useLocation } from "react-router"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Logo } from "./Logo"
import { LanguageToggle } from "./LanguageToggle"

interface NavigationItem {
  to: string
  label: string
}

const navigationItems: NavigationItem[] = [
  { to: "/", label: "Browse" },
  { to: "/random", label: "Shuffle" },
  // { to: "/thought", label: "Thoughts" }, // Temporarily hidden until editorial essays are populated
  { to: "/submit", label: "Contribute" },
  { to: "/about", label: "About" },
]

export function Root() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Keep Browse highlighted on home "/" and inside any "/video/:id" overlay
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname.startsWith("/video")
    }
    return location.pathname === path
  }

  // Close mobile menu automatically on page navigation
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky Header: always pinned and preserved on mobile */}
      <header
        className="sticky top-0 z-50 bg-black"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 xl:h-[100px] xl:px-8">
          {/* Logo never disappears */}
          <Link
            to="/"
            className="flex min-w-0 items-center"
            aria-label="Dazed and Amazed home"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Logo />
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            {/* Desktop Navigation */}
            <nav
              className="hidden items-center gap-1 xl:flex"
              aria-label="Primary navigation"
            >
              {navigationItems.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`rounded-md px-3 py-[5px] font-['JetBrains_Mono'] text-[18px] font-extrabold uppercase leading-[18px] tracking-[-0.36px] transition-colors ${
                    isActive(to)
                      ? "bg-[#D9E800] text-black"
                      : "text-white hover:bg-white hover:text-black"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu In-Place Toggle Button */}
            <div className="xl:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex size-9 items-center justify-center rounded-md text-white transition-colors outline-none hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-[#D9E800]"
                aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
              >
                {isMobileMenuOpen ? (
                  <X className="size-5 transition-transform duration-200" />
                ) : (
                  <Menu className="size-5 transition-transform duration-200" />
                )}
              </button>
            </div>

            {/* Language Toggle remains visible and accessible */}
            <LanguageToggle />
          </div>
        </div>

        {/* Bespoke Mobile Navigation Curtain (Starts directly below header) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-x-0 top-20 bottom-0 z-40 overflow-y-auto bg-black/95 px-6 py-8 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 xl:hidden">
            <nav
              className="mx-auto flex max-w-7xl flex-col items-end gap-5 pr-2"
              aria-label="Mobile navigation"
            >
              {navigationItems.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-fit rounded-md px-3 py-[5px] font-['JetBrains_Mono'] text-[18px] font-extrabold uppercase leading-[18px] tracking-[-0.36px] transition-colors ${
                    isActive(to)
                      ? "bg-[#D9E800] text-black"
                      : "text-white hover:bg-white hover:text-black active:bg-[#D9E800] active:text-black"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-4 flex h-[34px] items-center gap-6">
            <a
              href="https://instagram.com/dazed_amazed"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white transition-colors hover:text-[#D9E800]"
              aria-label="Instagram"
            >
              <img src="/assets/instagram.svg" alt="" width="30" height="30" />
            </a>
            <a
              href="https://t.me/dazedandamazed"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white transition-colors hover:text-[#D9E800]"
              aria-label="Telegram"
            >
              <img src="/assets/telegram.svg" alt="" width="30" height="30" />
            </a>
            <a
              href="https://youtube.com/@dazed.and.amazed?si=UdiTpnLe1S9a9diK"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white transition-colors hover:text-[#D9E800]"
              aria-label="YouTube"
            >
              <img src="/assets/youtube.svg" alt="" width="35" height="30" />
            </a>
          </div>
          <p className="text-center text-sm leading-5 text-white">
            A curated collection of music videos with top-tier craft and
            direction.
          </p>
        </div>
      </footer>
    </div>
  )
}