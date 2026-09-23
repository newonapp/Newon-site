import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, type CSSProperties } from "react";

function Char({
  char,
  progress,
  start,
  end,
}: {
  char: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  if (char === " ") return <span> </span>;
  return (
    <span className="relative inline-block">
      <span className="invisible">{char}</span>
      <motion.span className="absolute left-0 top-0" style={{ opacity }}>
        {char}
      </motion.span>
    </span>
  );
}

export function AnimatedText({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });
  const chars = text.split("");
  const words = text.split(" ");
  let cursor = 0;

  return (
    <p ref={ref} className={className} style={style}>
      {reduce
        ? text
        : words.map((word, wordIndex) => {
            const start = cursor;
            cursor += word.length + 1;
            return (
              <span key={wordIndex}>
                <span className="whitespace-nowrap">
                  {word.split("").map((char, charIndex) => {
                    const index = start + charIndex;
                    return (
                      <Char
                        key={index}
                        char={char}
                        progress={scrollYProgress}
                        start={index / chars.length}
                        end={(index + 1) / chars.length}
                      />
                    );
                  })}
                </span>
                {wordIndex < words.length - 1 ? " " : null}
              </span>
            );
          })}
    </p>
  );
}
