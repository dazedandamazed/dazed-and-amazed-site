import { Link, Outlet, useLocation } from "react-router"
import { Menu } from "lucide-react"
import { Logo } from "./Logo"
import { LanguageToggle } from "./LanguageToggle"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"

interface NavigationItem {
  to: string
  label: string
}

const navigationItems: NavigationItem[] = [
  { to: "/", label: "Browse" },
  { to: "/random", label: "Shuffle" },
  // { to: "/thought", label: "Thoughts" },
  { to: "/submit", label: "Contribute" },
  { to: "/about", label: "About" },
]

export function Root() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-black text-white">
      <header
        className="sticky top-0 z-50 bg-black"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 xl:h-[100px] xl:px-8">
          <Link to="/" className="flex min-w-0 items-center" aria-label="Dazed and Amazed home">
            <Logo />
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <nav
              className="hidden items-center xl:flex"
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

            <div className="xl:hidden">
              <Sheet>
                <SheetTrigger
                  className="inline-flex size-9 items-center justify-center rounded-md text-white transition-colors outline-none hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-[#D9E800]"
                  aria-label="Open navigation"
                >
                  <Menu className="size-5" />
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="border-white bg-black pt-14 text-white"
                >
                  <SheetHeader>
                    <SheetTitle className="font-['JetBrains_Mono'] text-[18px] font-extrabold uppercase leading-[18px] tracking-[-0.36px] text-white">
                      Menu
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                      Choose a page to visit
                    </SheetDescription>
                  </SheetHeader>
                  <nav
                    className="flex flex-col items-stretch gap-2 px-4"
                    aria-label="Mobile navigation"
                  >
                    {navigationItems.map(({ to, label }) => (
                      <SheetClose key={to} asChild>
                        <Link
                          to={to}
                          className={`rounded-md px-4 py-3 font-['JetBrains_Mono'] text-[18px] font-extrabold uppercase leading-[18px] tracking-[-0.36px] transition-colors ${
                            isActive(to)
                              ? "bg-[#D9E800] text-black"
                              : "text-white hover:bg-white hover:text-black"
                          }`}
                        >
                          {label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            <LanguageToggle />
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-4 flex h-[34px] items-center gap-6">
            <a
              href="https://instagram.com/varpholomeeva"
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
