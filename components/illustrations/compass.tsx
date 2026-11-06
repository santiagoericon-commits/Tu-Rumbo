import { IllustrationFrame, type IllustrationProps } from "./illustration-frame";

// Brújula: aro, cuatro marcas cardinales y la aguja de la marca (mitad norte rellena).
export function CompassIllustration({ className }: IllustrationProps) {
  return (
    <IllustrationFrame className={className}>
      <circle cx="24" cy="24" r="19" />
      <circle cx="24" cy="24" r="15.5" strokeDasharray="0.01 4.06" />
      <path d="M24 5v3M24 40v3M5 24h3M40 24h3" />
      <path d="M24 11.5 28.5 24h-9Z" className="fill-sage-soft" />
      <path d="M19.5 24h9L24 36.5Z" />
    </IllustrationFrame>
  );
}
