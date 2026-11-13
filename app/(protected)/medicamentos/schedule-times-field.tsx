"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import { buttonAdd, buttonSecondary, enterFromAbove, field, fieldHint } from "@/components/ui/styles";
import { MAX_TIMES } from "@/lib/medication-validation";

const TIMES_HINT_ID = "horarios-limite";

// Horarios del alta: de 1 a MAX_TIMES filas de hora local. Cada input envía name="times".
export function ScheduleTimesField() {
  // Un horario por entrada; empieza con uno vacío y se agregan hasta MAX_TIMES.
  const [times, setTimes] = useState<string[]>([""]);

  function updateTime(index: number, value: string) {
    setTimes((current) => current.map((time, i) => (i === index ? value : time)));
  }

  // Con keys por índice se desmonta la última fila, así que el input anterior sigue ahí para recibir el foco.
  function removeTime(index: number, fieldset: Element | null) {
    fieldset?.querySelectorAll<HTMLInputElement>('input[name="times"]')[index - 1]?.focus();
    setTimes((current) => current.filter((_, i) => i !== index));
  }

  return (
    <fieldset className="flex min-w-0 flex-col gap-3" aria-describedby={TIMES_HINT_ID}>
      <legend className="float-left w-full text-body text-ink">Horarios</legend>
      <p id={TIMES_HINT_ID} className={`${fieldHint} -mt-2`}>
        Hasta {MAX_TIMES} al día.
      </p>
      {times.map((time, index) => (
        // Las filas nuevas (index > 0) solo se montan al agregar: entran y reciben el foco.
        // Con zoom alto "Quitar" baja debajo del campo en vez de desbordar (flex-wrap + basis-40).
        <div key={index} className={`flex flex-wrap items-end gap-2 ${index > 0 ? enterFromAbove : ""}`}>
          <label className="flex min-w-0 grow basis-40 flex-col gap-1 text-secondary text-ink-muted">
            Horario {index + 1}
            <input
              className={`${field} min-w-0`}
              type="time"
              name="times"
              autoFocus={index > 0}
              required={index === 0}
              value={time}
              onChange={(event) => updateTime(index, event.target.value)}
            />
          </label>
          {index > 0 ? (
            <button
              type="button"
              onClick={(event) => removeTime(index, event.currentTarget.closest("fieldset"))}
              className={`${buttonSecondary} min-h-13`}
            >
              Quitar<span className="sr-only"> horario {index + 1}</span>
            </button>
          ) : null}
        </div>
      ))}
      {times.length < MAX_TIMES ? (
        <button type="button" onClick={() => setTimes((current) => [...current, ""])} className={buttonAdd}>
          <PlusIcon className="size-5" />
          Agregar otro horario
        </button>
      ) : null}
    </fieldset>
  );
}
