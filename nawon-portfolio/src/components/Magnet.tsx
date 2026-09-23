import { useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

type MagnetProps = {
  children: ReactNode;
  className?: string;
  padding?: number;
  strength?: number;
};

export function Magnet({ children, className, padding = 80, strength = 16 }: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node || reduce || event.pointerType !== "mouse") return;
    const rect = node.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const near =
      Math.abs(dx) < rect.width / 2 + padding && Math.abs(dy) < rect.height / 2 + padding;
    node.style.transition = "transform 0.3s ease-out";
    node.style.transform = near
      ? `translate3d(${dx / strength}px, ${dy / strength}px, 0)`
      : "translate3d(0,0,0)";
  };

  const reset = () => {
    const node = ref.current;
    if (!node) return;
    node.style.transition = "transform 0.6s ease-in-out";
    node.style.transform = "translate3d(0,0,0)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ willChange: "transform" }}
    >
      {children}
    </div>
  );
}
