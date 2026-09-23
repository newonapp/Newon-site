import { useEffect, useRef } from "react";

export function Film({ src, label, className }: { src: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.pause();
      return;
    }
    const arm = () => {
      el.muted = true;
      el.defaultMuted = true;
      el.loop = true;
      el.autoplay = true;
      el.playsInline = true;
      el.controls = false;
      void el.play().catch(() => {});
    };
    arm();
    el.addEventListener("pause", arm);
    el.addEventListener("ended", arm);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && (el.paused || el.ended)) arm();
    }, 700);
    return () => {
      el.removeEventListener("pause", arm);
      el.removeEventListener("ended", arm);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={`${className ?? ""} film-video`}
      src={src}
      aria-label={label}
      muted
      loop
      autoPlay
      playsInline
      preload="auto"
      disablePictureInPicture
    />
  );
}

export function FilmPlate({
  src,
  label,
  slogan,
  lead,
  className,
  compact,
  wordmark,
}: {
  src: string;
  label: string;
  slogan: string[];
  lead?: string;
  className?: string;
  compact?: boolean;
  wordmark?: string[];
}) {
  return (
    <div className={`${wordmark ? "film-plate " : ""}relative overflow-hidden ${className ?? ""}`}>
      <Film src={src} label={label} className="absolute inset-0 h-full w-full object-cover" />
      {wordmark ? (
        <div className="film-lockup">
          <div className="film-lockup__veil" aria-hidden="true" />
          <p className="film-lockup__wordmark">
            {wordmark.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          <p className="film-lockup__slogan">
            {slogan.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className={`absolute inset-x-0 bottom-0 text-white ${compact ? "p-3" : "p-4 sm:p-6"}`}>
            <p className={`font-medium leading-snug ${compact ? "text-[13px] sm:text-[15px]" : "text-lg sm:text-2xl md:text-3xl"}`}>
              {slogan.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            {lead && !compact ? (
              <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-white/85 sm:text-base">{lead}</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
