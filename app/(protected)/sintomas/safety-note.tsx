import { Notice } from "@/components/ui/notice";

// Mensaje de seguridad estático e incondicional: nunca depende de lo que se registra.
// Aviso info (sin role, ni plum ni coral).
export function SafetyNote() {
  return (
    <>
      {/* [PENDIENTE REVISIÓN PROFESIONAL] */}
      <Notice kind="info">
        Si algo te preocupa, comunícate con tu equipo médico. En una emergencia, llama al 911.
      </Notice>
    </>
  );
}
