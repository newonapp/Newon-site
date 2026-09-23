import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ElementType } from "react";

type FadeInProps = HTMLMotionProps<"div"> & {
  as?: ElementType;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
};

export function FadeIn({
  as = "div",
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  children,
  ...rest
}: FadeInProps) {
  const reduce = useReducedMotion();
  const Component = motion.create(as);

  return (
    <Component
      initial={reduce ? false : { opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ duration: reduce ? 0 : duration, delay: reduce ? 0 : delay, ease: [0.25, 0.1, 0.25, 1] }}
      {...rest}
    >
      {children}
    </Component>
  );
}
