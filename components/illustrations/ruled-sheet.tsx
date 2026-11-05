import { IllustrationFrame, type IllustrationProps } from "./illustration-frame";

// Hoja con renglones y la esquina doblada (el único relleno).
export function RuledSheetIllustration({ className }: IllustrationProps) {
  return (
    <IllustrationFrame className={className}>
      <path d="M14 5h15l8 8v27a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" />
      <path d="M29 5v6a2 2 0 0 0 2 2h6Z" className="fill-sage-soft" />
      <path d="M16 19h16M16 25h16M16 31h16M16 37h9" />
    </IllustrationFrame>
  );
}
