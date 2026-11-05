"use client";

import { useEffect, useRef, type RefObject } from "react";

// Cuando un editor dentro de la tarjeta pasa de abierto a cerrado, regresa el foco a su botón.
// Corre después del commit en que el botón ya está montado (un requestAnimationFrame podía llegar
// antes, si el cierre quedaba en la transición de la Server Action). Solo si el foco quedó en el body
// (estaba dentro del editor, que se desmontó); si la persona lo movió a otra parte, no se lo quita.
export function useReturnFocus(open: boolean, target: RefObject<HTMLElement | null>) {
  const wasOpen = useRef(open);

  useEffect(() => {
    if (wasOpen.current && !open) {
      const active = document.activeElement;
      if (active === null || active === document.body) target.current?.focus();
    }
    wasOpen.current = open;
  }, [open, target]);
}
