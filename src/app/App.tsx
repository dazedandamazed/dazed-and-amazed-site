import { RouterProvider } from "react-router"
import { router } from "./routes"
import { LanguageProvider } from "./contexts/LanguageContext"
import { VideoArchiveProvider } from "./hooks/useVideoArchive"

export default function App() {
  return (
    <LanguageProvider>
      <VideoArchiveProvider>
        <RouterProvider router={router} />
      </VideoArchiveProvider>
    </LanguageProvider>
  )
}
