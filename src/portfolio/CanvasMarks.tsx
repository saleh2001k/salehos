import { lazy, Suspense, useState } from "react";
import { useTheme } from "./theme";

const AsciiObject = lazy(() => import("../components/canvasui/AsciiObject"));
const DitheredObject = lazy(() => import("../components/canvasui/DitheredObject"));

const quiet = {
  orbit: false,
  zoom: false,
  autoRotate: false,
  floatIntensity: 0.55,
  rotationIntensity: 0.22,
  floatSpeed: 0.85,
  highlight: "#f4f4f2",
} as const;

export function SalehOsAscii() {
  const [failed, setFailed] = useState(false);
  if (failed) return <img src="/projects/salehos.jpg" alt="" />;
  return (
    <Suspense fallback={<img src="/projects/salehos.jpg" alt="" />}>
      <AsciiObject
        {...quiet}
        className="ascii-stage"
        src="/projects/salehos.jpg"
        cellSize={6}
        colored
        background="#121212"
        contrast={1.35}
        edgeContrast={2.4}
        exposure={1.15}
        environmentIntensity={0.7}
        scale={4.15}
        fov={26}
        cameraDistance={4.05}
        floatIntensity={0.28}
        rotationIntensity={0.1}
        onError={() => setFailed(true)}
      />
    </Suspense>
  );
}

/** Monochrome “sa.” stamp. Light theme inverts it so it reads on the dark contact band. */
export function FooterMark() {
  const theme = useTheme();
  return (
    <Suspense fallback={null}>
      <DitheredObject
        {...quiet}
        className="footer-mark"
        src="/marks/sa.svg"
        method="bayer"
        grayscale
        invert={theme === "light"}
        background=""
        gridSize={2}
        environmentIntensity={0.55}
        scale={2.85}
        fov={26}
        cameraDistance={4.6}
        floatIntensity={0.4}
        rotationIntensity={0.16}
      />
    </Suspense>
  );
}
