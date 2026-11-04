import { field, fieldLabel } from "@/components/ui/styles";
import { MAX_SUPPLY_COUNT } from "@/lib/medication-validation";

type SupplyCountFieldProps = {
  hintId: string;
  defaultValue?: number | null;
  autoFocus?: boolean;
};

// Campo opcional "¿Cuántas tomas te quedan?" (P9). Se usa en el alta y en el editor de surtido.
export function SupplyCountField({ hintId, defaultValue = null, autoFocus = false }: SupplyCountFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className={fieldLabel}>
        {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
        ¿Cuántas tomas te quedan? (opcional)
        <input
          className={`${field} tabular-nums`}
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
      </label>
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <p id={hintId} className="text-secondary text-ink-muted">
        Cuenta las tomas, no las cajas. Se calcula con las dosis que marcas como tomadas.
      </p>
    </div>
  );
}
