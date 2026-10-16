import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { RandomInspiration } from "./components/RandomInspiration";
import { RandomThought } from "./components/RandomThought";
import { Submit } from "./components/Submit";
import { VideoDetail } from "./components/VideoDetail";
import { About } from "./components/About";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        path: "",
        Component: Home,
        children: [
          // И видео, и случайный клип Shuffle открываются прямо поверх каталога!
          { path: "video/:id", Component: VideoDetail },
          { path: "random", Component: RandomInspiration },
        ],
      },
      { path: "thought", Component: RandomThought },
      { path: "submit", Component: Submit },
      { path: "about", Component: About },
    ],
  },
]);