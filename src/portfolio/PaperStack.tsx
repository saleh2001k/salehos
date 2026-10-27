import { motion, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { Layers3, ShoppingBag } from "lucide-react";

/**
 * Three sheets — the interface, the native layer, the system. They fan out as
 * the hero scrolls away, or on demand with the button.
 */
export default function PaperStack({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();
  const [spread, setSpread] = useState(false);
  const manual = useSpring(0, { stiffness: 170, damping: 23 });
  useEffect(() => manual.set(spread ? 1 : 0), [spread, manual]);
  // Whichever is further along wins: the scroll or the button.
  const s = useTransform([manual, progress], ([m, p]: number[]) => (reduced ? m : Math.max(m, Math.min(1, p * 1.8))));

  const sysRotate = useTransform(s, [0, 1], [10, 19]);
  const sysX = useTransform(s, [0, 1], [26, 78]);
  const sysY = useTransform(s, [0, 1], [12, 30]);
  const natRotate = useTransform(s, [0, 1], [-9, -17]);
  const natX = useTransform(s, [0, 1], [-20, -68]);
  const natY = useTransform(s, [0, 1], [0, -16]);
  const uiRotate = useTransform(s, [0, 1], [2, -3]);
  const uiY = useTransform(s, [0, 1], [0, -46]);

  return (
    <div className="paper-scene">
      <div className="paper-composition">
        <motion.div className="work-paper systems-paper" style={{ rotate: sysRotate, x: sysX, y: sysY }}>
          <span className="paper-tab">The system</span>
          <div className="paper-diagram" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <small>
            One product.
            <br />
            Shared foundations.
          </small>
        </motion.div>
        <motion.div className="work-paper native-paper" style={{ rotate: natRotate, x: natX, y: natY }}>
          <span className="paper-tab">The native layer</span>
          <div className="native-marks">
            <span>Swift</span>
            <span>Kotlin</span>
          </div>
          <code>
            touch → motion
            <br />
            gesture → response
          </code>
          <span className="paper-foot">Made for the platform.</span>
        </motion.div>
        <motion.div className="work-paper interface-paper" style={{ rotate: uiRotate, y: uiY }}>
          <div className="mini-shop-heading">
            <span>aleena</span>
            <ShoppingBag size={15} />
          </div>
          <div className="mini-shop-image">
            <img
              src="/projects/aleena/atelier.jpg"
              alt="Aleena fashion collection imagery"
              width="656"
              height="1600"
              fetchPriority="high"
              decoding="async"
            />
            <span>
              Every detail.
              <br />
              Considered.
            </span>
          </div>
          <div className="mini-shop-footer">The interface you feel.</div>
        </motion.div>
      </div>
      <button type="button" className="unfold-button" onClick={() => setSpread(!spread)} aria-pressed={spread}>
        <Layers3 size={14} />
        {spread ? "Stack the layers" : "See the layers underneath"}
      </button>
    </div>
  );
}
