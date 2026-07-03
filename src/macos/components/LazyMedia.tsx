import { useEffect, useRef, useState } from "react";
import type { ProjectMedia } from "../../data/content";

interface LazyVideoProps {
  src: string;
  poster?: string;
  alt: string;
  className?: string;
}

/**
 * Defers the video download until the element scrolls near the viewport,
 * then plays/pauses with visibility so off-screen demos never burn CPU.
 */
function LazyVideo({ src, poster, alt, className = "" }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setLoaded(true);
          setVisible(true);
        } else {
          setVisible(false);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || !loaded) return;
    if (visible) void node.play().catch(() => {});
    else node.pause();
  }, [visible, loaded]);

  return (
    <video
      ref={ref}
      src={loaded ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={alt}
      className={className}
    />
  );
}

/** Renders a project media item — lazy in both the image and video case. */
export function LazyMedia({ media, className = "" }: { media: ProjectMedia; className?: string }) {
  if (media.type === "video") {
    return <LazyVideo src={media.src} poster={media.poster} alt={media.alt} className={className} />;
  }
  return <img src={media.src} alt={media.alt} loading="lazy" decoding="async" className={className} />;
}
