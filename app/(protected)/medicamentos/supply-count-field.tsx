import { field, fieldHint, optionalTag } from "@/components/ui/styles";
import { MAX_SUPPLY_COUNT } from "@/lib/medication-validation";

type SupplyCountFieldProps = {
  hintId: string;
  defaultValue?: number | null;
  autoFocus?: boolean;
};

// Campo opcional "¿Cuántas tomas te quedan?" (P9). Se usa en el alta y en el editor de surtido.
// La ayuda va entre la etiqueta y el campo para leerse antes de escribir; fuera del <label> para
// que no se sume al nombre accesible (llega por aria-describedby).
export function SupplyCountField({ hintId, defaultValue = null, autoFocus = false }: SupplyCountFieldProps) {
  const inputId = `${hintId}-campo`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-body text-ink">
        {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
        ¿Cuántas tomas te quedan? <span className={optionalTag}>opcional</span>
      </label>
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <p id={hintId} className={`${fieldHint} -mt-1`}>
        Cuenta las tomas, no las cajas. Se calcula con las dosis que marcas como tomadas.
      </p>
      <input
        id={inputId}
        className={field}
        type="number"
        name="supplyCount"
        inputMode="numeric"
        min={0}
        max={MAX_SUPPLY_COUNT}
        step={1}
        defaultValue={defaultValue ?? ""}
        autoFocus={autoFocus}
        aria-describedby={hintId}
      />
    </div>
  );
}
