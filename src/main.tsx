import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import "./index.css";
import Portfolio from "./portfolio/Portfolio";

const OSExperience = lazy(() => import("./OSExperience"));
const isOS = /^\/os\/?$/.test(window.location.pathname);
document.documentElement.dataset.experience = isOS ? "os" : "resume";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      {isOS ? (
        <Suspense
          fallback={
            <div className="os-loading">
              Opening SalehOS… <a href="/">Back to résumé</a>
            </div>
          }
        >
          <OSExperience />
        </Suspense>
      ) : (
        <Portfolio />
      )}
    </MotionConfig>
  </StrictMode>,
);

if (import.meta.hot) {
  import.meta.hot.dispose(() => root.unmount());
}
