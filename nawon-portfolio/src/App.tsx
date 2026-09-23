import { useEffect } from "react";
import { isKo, t } from "./copy";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Hero } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { Projects } from "./components/Projects";
import { Services } from "./components/Services";
import { Story } from "./components/Story";

export default function App() {
  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
    document.title = t.title;
    if (isKo) {
      document.body.style.fontFamily = '"Noto Sans KR", "Kanit", sans-serif';
    }
  }, []);

  return (
    <main className="overflow-x-clip bg-ink text-mist">
      <Hero />
      <Marquee />
      <About />
      <Services />
      <Story />
      <Projects />
      <Contact />
    </main>
  );
}
