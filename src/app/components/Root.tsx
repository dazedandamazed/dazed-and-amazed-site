import { Link, Outlet, useLocation } from "react-router"
import { Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Logo } from "./Logo"
import { LanguageToggle } from "./LanguageToggle"
import { Footer } from "./Footer"

interface NavigationItem {
  to: string
  label: string
}

const navigationItems: NavigationItem[] = [
  { to: "/", label: "Browse" },
  { to: "/random", label: "Random" },
  // { to: "/thought", label: "Thoughts" },
  { to: "/submit", label: "Contribute" },
  { to: "/about", label: "About" },
]

export function Root() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mobileMenuTop, setMobileMenuTop] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const isHeaderCollapsed =
    isScrolled ||
    location.pathname.startsWith("/video/") ||
    location.pathname === "/random"

  // Keep Browse highlighted on home "/" and inside any "/video/:id" overlay
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname.startsWith("/video")
    }
    return location.pathname === path
  }

  // Close mobile menu automatically on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    let scrolled = window.scrollY > 40
    setIsScrolled(scrolled)

    const updateScrolledState = () => {
      if (!scrolled && window.scrollY > 40) {
        scrolled = true
        setIsScrolled(true)
      } else if (scrolled && window.scrollY < 8) {
        scrolled = false
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", updateScrolledState, { passive: true })
    return () => window.removeEventListener("scroll", updateScrolledState)
  }, [])

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

  useEffect(() => {
    if (!isMobileMenuOpen || !headerRef.current) return

    const header = headerRef.current
    const updateMenuTop = () => setMobileMenuTop(header.getBoundingClientRect().bottom)
    const resizeObserver = new ResizeObserver(updateMenuTop)

    resizeObserver.observe(header)
    window.addEventListener("resize", updateMenuTop)
    updateMenuTop()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateMenuTop)
    }
  }, [isMobileMenuOpen])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky Header */}
      <header
        id="site-header"
        ref={headerRef}
        className="sticky top-0 z-50 bg-black"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div
          className={`mx-auto grid w-full max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-4 transition-[padding,gap] duration-300 sm:px-8 lg:px-14 2xl:px-20 ${
            isHeaderCollapsed
              ? "py-2 lg:flex lg:items-center lg:justify-between"
              : "gap-y-3 pt-3 pb-3 lg:items-end lg:gap-y-4"
          }`}
        >
          <Link
            to="/"
            className={`col-start-1 row-start-1 flex w-fit items-center ${
              isHeaderCollapsed
                ? "justify-self-start"
                : "justify-self-start lg:col-span-2 lg:row-start-2 lg:mt-3 lg:justify-self-center"
            }`}
            aria-label="Dazed and Amazed home"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Logo
              className={
                isHeaderCollapsed
                  ? "w-[min(calc(100vw_-_200px),_220px)] lg:w-[220px]"
                  : "w-[min(calc(100vw_-_140px),_307px)] lg:w-[min(calc(100vw_-_716px),_540px)]"
              }
            />
          </Link>

          {!isHeaderCollapsed && (
            <p className="col-span-2 row-start-2 min-w-0 font-['JetBrains_Mono'] text-[18px] font-bold uppercase leading-[1.15] tracking-normal text-white lg:col-span-1 lg:col-start-1 lg:row-start-1">
              <span className="block lg:whitespace-nowrap">A curated collection of music videos</span>
              <span className="block lg:whitespace-nowrap">with top-tier craft and direction</span>
            </p>
          )}

          <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-self-end gap-3 lg:col-start-2 lg:row-start-1">
            <nav
              className="hidden items-center gap-1 min-[900px]:flex"
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

            {/* Mobile Menu Button */}
            <div className="min-[900px]:hidden">
              <button
                onClick={() => {
                  if (!isMobileMenuOpen) {
                    setMobileMenuTop(headerRef.current?.getBoundingClientRect().bottom ?? 0)
                  }
                  setIsMobileMenuOpen(!isMobileMenuOpen)
                }}
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

            <LanguageToggle />
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div
            style={{ top: `${mobileMenuTop}px` }}
            className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-black/95 px-6 py-8 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 min-[900px]:hidden"
          >
            <nav
              className="flex w-full flex-col items-end gap-5 pr-2"
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

      {/* Full-width Minimalist Footer */}
      <Footer />
    </div>
  )
}