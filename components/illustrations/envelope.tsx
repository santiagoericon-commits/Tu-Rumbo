import { IllustrationFrame, type IllustrationProps } from "./illustration-frame";

type EnvelopeIllustrationProps = IllustrationProps & { motion?: "close" };

// Sobre con la solapa rellena. Con motion="close" la solapa baja una vez al montar (quien lo usa lo
// vuelve a montar con key en cada elección, que es un toque); sin motion, cerrado y quieto. Con
// reduced motion se ve cerrado desde el inicio.
export function EnvelopeIllustration({ className, motion }: EnvelopeIllustrationProps) {
  const flapMotion =
    motion === "close" ? "origin-top [transform-box:fill-box] motion-safe:animate-envelope-close" : undefined;

  return (
    <IllustrationFrame className={className}>
      <rect x="6" y="18" width="36" height="24" rx="3" />
      <path d="M7.5 40.5 19 30.5M40.5 40.5 29 30.5" />
      <path d="M9 18 24 30l15-12Z" className={`fill-sage-soft ${flapMotion ?? ""}`} />
    </IllustrationFrame>
  );
}
