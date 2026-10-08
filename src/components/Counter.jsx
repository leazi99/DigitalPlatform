import { useEffect, useRef } from "react";

/**
 * Counts up to `value` once the number scrolls into view.
 *
 * The tween writes to the DOM node directly rather than through state: a
 * ~1.1s count-up at 60fps would otherwise be ~65 React renders per counter,
 * and each one re-renders the band around it for no visual gain.
 */
export default function Counter({ value, suffix = "", decimals = 0, className = "" }) {
  const ref = useRef(null);

  // The figures are admin-editable now, so what arrives here may not be a
  // number. Anything unparseable counts as zero rather than throwing and
  // taking the whole band down with it.
  const target = Number.isFinite(Number(value)) ? Number(value) : 0;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const write = (n) => {
      node.textContent = `${n.toFixed(decimals)}${suffix}`;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      write(target);
      return;
    }

    write(0);
    let frame;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const duration = 1100;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          write(target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, suffix, decimals]);

  // Server/first paint shows the final figure, so the number is never missing
  // if the tween cannot run.
  return (
    <span ref={ref} className={className}>
      {target.toFixed(decimals)}
      {suffix}
    </span>
  );
}
