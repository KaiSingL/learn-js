import { useEffect, useState } from "react";
import Cheatsheet from "./components/Cheatsheet.jsx";
import Footer from "./components/Footer.jsx";
import Lab from "./components/Lab.jsx";
import Lessons from "./components/Lessons.jsx";
import MobileNav from "./components/MobileNav.jsx";
import Overview from "./components/Overview.jsx";
import Playground from "./components/Playground.jsx";
import Project from "./components/Project.jsx";
import Rules from "./components/Rules.jsx";
import SearchPalette from "./components/SearchPalette.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { getLesson } from "./data/lessons.js";
import { navigate, routeKey, useRoute } from "./lib/router.js";
import { useProgress } from "./lib/useProgress.js";

const TITLES = {
  "/": "Learn JS — JavaScript Without the Magic",
  "/rules": "Rules · Learn JS",
  "/lessons": "Lessons · Learn JS",
  "/cheatsheet": "Cheatsheet · Learn JS",
  "/project": "Final project · Learn JS",
  "/lab": "De-sugar Lab · Learn JS",
  "/playground": "Playground · Learn JS",
};

function isTyping(target) {
  if (!target) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable === true
  );
}

export default function App() {
  const route = useRoute();
  const progress = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [request, setRequest] = useState(null);

  const key = routeKey(route);

  useEffect(
    function () {
      setMenuOpen(false);
    },
    [route.path, route.param]
  );

  useEffect(
    function () {
      window.scrollTo({ top: 0, behavior: "auto" });
      if (route.path === "/lesson" && route.param) {
        const lesson = getLesson(route.param);
        document.title = lesson ? lesson.title + " · Learn JS" : "Lesson · Learn JS";
      } else {
        document.title = TITLES[route.path] || TITLES["/"];
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  useEffect(function () {
    function onKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && (event.key === "k" || event.key === "K")) {
        event.preventDefault();
        setPaletteOpen(function (value) {
          return !value;
        });
        return;
      }
      if (event.key === "/" && !isTyping(event.target)) {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return function () {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function openInPlayground(code, label) {
    setRequest({ code, label, at: Date.now() });
    navigate("/playground");
  }

  function focusMain() {
    const main = document.getElementById("main");
    if (main) main.focus();
  }

  function page() {
    if (route.path === "/rules") {
      return <Rules onPlayground={openInPlayground} />;
    }
    if (route.path === "/lessons" || route.path === "/lesson") {
      return (
        <Lessons
          route={route}
          progress={progress}
          onPlayground={openInPlayground}
          onNavigate={navigate}
        />
      );
    }
    if (route.path === "/cheatsheet") {
      return <Cheatsheet onPlayground={openInPlayground} />;
    }
    if (route.path === "/lab") {
      return <Lab onPlayground={openInPlayground} />;
    }
    if (route.path === "/project") {
      return <Project progress={progress} onPlayground={openInPlayground} />;
    }
    if (route.path === "/playground") {
      return <Playground route={route} request={request} />;
    }
    return <Overview progress={progress} />;
  }

  return (
    <div className="min-h-dvh bg-ink text-paper antialiased">
      <button
        type="button"
        onClick={focusMain}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-[12px] focus:font-semibold focus:text-black"
      >
        Skip to content
      </button>

      <Sidebar
        route={route}
        progress={progress}
        onOpenPalette={function () {
          setPaletteOpen(true);
        }}
      />

      <MobileNav
        open={menuOpen}
        onOpen={function () {
          setMenuOpen(true);
        }}
        onClose={function () {
          setMenuOpen(false);
        }}
        route={route}
        progress={progress}
        onOpenPalette={function () {
          setPaletteOpen(true);
        }}
      />

      <div className="lg:ml-[280px]">
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto max-w-[980px] px-4 py-6 focus:outline-none lg:px-10 lg:py-12"
        >
          {page()}
          <Footer />
        </main>
      </div>

      <SearchPalette
        open={paletteOpen}
        onClose={function () {
          setPaletteOpen(false);
        }}
        onNavigate={navigate}
      />
    </div>
  );
}
