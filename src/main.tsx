import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MacOS from "./macos/MacOS.tsx";
import IOS from "./macos/ios/IOS.tsx";
import { settingsStore } from "./macos/lib/settings.ts";

// Apply persisted appearance/font before first paint.
settingsStore.init();

const MOBILE_QUERY = "(max-width: 767px)";

/** Small screens get the iOS experience, larger ones the macOS desktop. */
function Root() {
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const onChange = (event: MediaQueryListEvent) => setMobile(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return mobile ? <IOS /> : <MacOS />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
