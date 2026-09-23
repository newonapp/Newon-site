import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { isKo, t } from "../copy";
import { projects, type Project } from "../data";
import { FilmPlate } from "./Film";

function Card({ project, index, total }: { project: Project; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const target = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(scrollYProgress, [0, 1], [1, target]);

  return (
    <div ref={ref} className="h-[85vh]">
      <motion.article
        style={{
          scale: reduce ? 1 : scale,
          top: `calc(5.5rem + ${index * 28}px)`,
        }}
        className="sticky flex max-h-[calc(100svh-7rem)] flex-col overflow-hidden rounded-[40px] border-2 border-mist bg-ink p-4 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4 sm:gap-8">
            <span className="font-black leading-none text-mist" style={{ fontSize: "clamp(2.4rem, 6vw, 88px)" }}>
              {project.number}
            </span>
            <div>
              <p className={`text-xs font-medium text-mist/60 sm:text-sm ${isKo ? "tracking-normal" : "uppercase tracking-[0.22em]"}`}>{project.type}</p>
              <h3 className={`font-medium leading-none ${isKo ? "" : "uppercase"}`} style={{ fontSize: "clamp(1.4rem, 3vw, 2.6rem)" }}>
                {project.name}
              </h3>
            </div>
          </div>
          <a
            href={project.href}
            target="_top"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-mist px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-mist transition-colors duration-200 hover:bg-mist/10 sm:px-8 sm:py-3 sm:text-sm"
          >
            {t.livePage}
          </a>
        </div>
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-mist/80 sm:text-base">{project.summary}</p>
        <p className="mt-1 text-sm font-medium text-mist">{project.role}</p>
        <FilmPlate
          className="mt-5 min-h-[180px] w-full flex-1 rounded-[28px] bg-black sm:rounded-[36px] md:rounded-[48px]"
          src={project.images[0]}
          label={project.slogan.join(" ")}
          slogan={project.slogan}
          lead={project.lead}
        />
      </motion.article>
    </div>
  );
}

export function Projects() {
  return (
    <section
      id="projects"
      className="relative z-10 bg-ink px-4 pb-10 pt-8 sm:px-6 md:px-10 md:pt-12"
    >
      <h2
        className="hero-heading mb-10 text-center font-black uppercase leading-none tracking-tight sm:mb-14"
        style={{ fontSize: "clamp(2.6rem, 10vw, 140px)" }}
      >
        {t.projectsHeading}
      </h2>
      <div className="mx-auto max-w-6xl">
        {projects.map((project, index) => (
          <Card key={project.id} project={project} index={index} total={projects.length} />
        ))}
      </div>
    </section>
  );
}
