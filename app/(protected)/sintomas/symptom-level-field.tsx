import { CircleCheckIcon, CircleIcon } from "@/components/icons";
import { SYMPTOM_LEVELS } from "@/lib/symptom-validation";
import { LEVEL_LABELS, levelAccessibleName } from "./level-labels";

// Cinco opciones idénticas en color (plum). La elegida se distingue por fondo, borde, peso del
// texto e ícono; nunca por un color que cambie con el valor. Toda la fila es tocable y las flechas
// del teclado recorren la escala (radios nativos).
export function SymptomLevelField({ defaultLevel }: { defaultLevel: number | null }) {
  return (
    // min-w-0: un fieldset trae min-width: min-content y desborda con zoom alto.
    <fieldset className="min-w-0">
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <legend className="text-name text-ink">¿Qué tanto te molestaron los síntomas hoy?</legend>
      <div className="mt-4 flex flex-col gap-2">
        {SYMPTOM_LEVELS.map((level) => (
          <label
            key={level}
            className="relative flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 rounded-control border-2 border-line-strong bg-surface px-4 py-2 text-plum-ink transition-[background-color,border-color] duration-150 has-checked:border-plum-ink has-checked:bg-plum-tint"
          >
            <input
              type="radio"
              name="level"
              value={level}
              required
              defaultChecked={level === defaultLevel}
              aria-label={levelAccessibleName(level)}
              className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-control"
            />
            <CircleIcon className="size-6 peer-checked:hidden" />
            <CircleCheckIcon className="hidden size-6 peer-checked:block" active />
            <span className="text-name font-normal peer-checked:font-semibold">{LEVEL_LABELS[level]}</span>
            <span className="ml-auto whitespace-nowrap text-secondary tabular-nums">{level} de 5</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
