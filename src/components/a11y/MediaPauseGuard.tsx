import { useEffect } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";

/**
 * Honours the "pause background media" and "reduce motion" preferences by
 * pausing autoplaying audio/video and stripping the autoplay attribute.
 */
export function MediaPauseGuard() {
  const { prefs, reduceMotion } = useAccessibility();
  const shouldPause = prefs.pauseMedia || reduceMotion;

  useEffect(() => {
    if (!shouldPause) return;
    const apply = () => {
      document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((el) => {
        el.autoplay = false;
        if (prefs.pauseMedia && !el.paused) el.pause();
      });
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [shouldPause, prefs.pauseMedia]);

  return null;
}
