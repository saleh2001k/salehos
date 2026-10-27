import { useEffect, useState } from "react";
import MacOS from "./macos/MacOS";
import IOS from "./macos/ios/IOS";
import { settingsStore } from "./macos/lib/settings";

settingsStore.init();

export default function OSExperience() {
  const [mobile, setMobile] = useState(
    () => matchMedia("(max-width: 767px)").matches,
  );
  useEffect(() => {
    document.title = "SalehOS — an interactive project by Saleh Al-Mashni";
    // Keep the original project's typography off the résumé's loading path.
    for (const href of [
      "https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap",
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
    ]) {
      if (document.querySelector(`link[href="${href}"]`)) continue;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
    const query = matchMedia("(max-width: 767px)");
    const update = () => setMobile(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return (
    <>
      {mobile ? <IOS /> : <MacOS />}
      <a className="back-to-resume" href="/">
        Back to résumé
      </a>
    </>
  );
}
