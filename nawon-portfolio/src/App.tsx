import { useEffect } from "react";
import { isKo, t } from "./copy";
import { platforms } from "./data";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Hero } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { Projects } from "./components/Projects";
import { Services } from "./components/Services";
import { Rows, Statement, Stats, Steps, Story, StoryHeading } from "./components/Story";

/**
 * NEWON Portfolio — 01 Hero · 02 Overview · 03 Six core platforms · 04 Products ·
 * 05 Product development · 06 Highlights · 07 Milestones · 08 Capabilities · 09 Explore.
 * Every section reuses the existing section components; only copy, item counts and order change.
 */
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
      {/* 01 · HERO (unchanged) + statement */}
      <Hero />
      <Marquee />
      <About />

      {/* 02 · PORTFOLIO OVERVIEW */}
      <Services id="overview" heading={t.overviewHeading} title={t.overviewTitle} lead={t.overviewLead} items={t.overview} />

      {/* 03 · SIX CORE PLATFORMS */}
      <Story id="platforms">
        <StoryHeading first>{t.platformsHeading}</StoryHeading>
        <Statement title={t.platformsTitle} body={t.platformsLead} />
      </Story>
      <Projects id="platform-cards" items={platforms} />

      {/* 04 · OUR PRODUCTS · 05 · PRODUCT DEVELOPMENT */}
      <Story id="projects">
        <StoryHeading first>{t.productsHeading}</StoryHeading>
        <Statement title={t.productsTitle} body={t.productsLead} />
        <Rows items={t.products} />

        <StoryHeading>{t.processHeading}</StoryHeading>
        <Statement title={t.processTitle} body={t.processLead} />
        <Steps items={t.process} />
        <Statement title={t.workflowTitle} body={t.workflowBody} />
      </Story>

      {/* 06 · PRODUCT HIGHLIGHTS */}
      <Services id="highlights" heading={t.highlightsHeading} title={t.highlightsTitle} lead={t.highlightsLead} items={t.highlights} />

      {/* 07 · PROGRESS & MILESTONES · 08 · TECHNOLOGY & CAPABILITIES */}
      <Story id="milestones">
        <StoryHeading first>{t.milestonesHeading}</StoryHeading>
        <Statement title={t.milestonesTitle} body={t.milestonesLead} />
        <Stats items={t.stats} />
        <Rows items={t.milestones} />

        <StoryHeading>{t.capabilitiesHeading}</StoryHeading>
        <Statement title={t.capabilitiesTitle} body={t.capabilitiesLead} />
        <Rows items={t.capabilities} />
      </Story>

      {/* 09 · EXPLORE NEWON */}
      <Contact />
    </main>
  );
}
