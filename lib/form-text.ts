// Texto libre de un textarea. El navegador envía cada salto de línea como \r\n,
// pero maxLength lo cuenta como uno: se normaliza antes de medir en el servidor.
export function normalizeMultiline(value: string): string {
  return value.replace(/\r\n?/g, "\n").trim();
}
