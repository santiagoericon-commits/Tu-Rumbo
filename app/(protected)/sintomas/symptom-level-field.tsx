import { SYMPTOM_LEVELS } from "@/lib/symptom-validation";

const SCALE_HINT_ID = "escala-molestia";

// Solo para lectores de pantalla: los extremos de la escala.
const EXTREMES: Partial<Record<number, string>> = { 1: "poco", 5: "mucho" };

function CircleIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={`size-5 shrink-0 ${className}`} fill="none">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={`size-5 shrink-0 ${className}`} fill="none">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10.5l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Cinco opciones idénticas en color. La elegida se distingue por borde, peso del
// texto e ícono; nunca por un color que cambie con el valor.
export function SymptomLevelField({ defaultLevel }: { defaultLevel: number | null }) {
  return (
    <fieldset aria-describedby={SCALE_HINT_ID}>
      <legend className="text-base font-semibold text-ink">¿Qué tanto te molestó hoy?</legend>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {SYMPTOM_LEVELS.map((level) => (
          <label
            key={level}
            className="relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-md border-2 border-line bg-surface text-ink has-checked:border-ink has-checked:font-semibold"
          >
            <input
              type="radio"
              name="level"
              value={level}
              required
              defaultChecked={level === defaultLevel}
              className="peer absolute inset-0 size-full cursor-pointer touch-manipulation appearance-none rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
            <span className="text-xl tabular-nums">
              {level}
              {EXTREMES[level] ? <span className="sr-only">, {EXTREMES[level]}</span> : null}
            </span>
            <CircleIcon className="peer-checked:hidden" />
            <CheckIcon className="hidden peer-checked:block" />
          </label>
        ))}
      </div>
      <p id={SCALE_HINT_ID} className="mt-2 flex justify-between text-base text-ink-muted">
        <span>1 = poco</span>
        <span>5 = mucho</span>
      </p>
    </fieldset>
  );
}
