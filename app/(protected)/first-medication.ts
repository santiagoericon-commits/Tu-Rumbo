// "Primer medicamento" (docs/marca.md §3). Bandera en MEMORIA DEL MÓDULO del navegador: nada en
// localStorage, sessionStorage, cookies ni URL. El alta la marca al enviar el primero; el
// redirect("/hoy") de la Server Action es una navegación de cliente (la página no se recarga), así que
// el módulo sigue vivo y /hoy la lee. Si la página se recarga, el módulo empieza en false y la tarjeta
// simplemente no aparece: degradación segura. Solo se escribe desde eventos del navegador; en el
// servidor siempre vale false.
let pending = false;

export function markFirstMedication(): void {
  pending = true;
}

export function clearFirstMedication(): void {
  pending = false;
}

export function peekFirstMedication(): boolean {
  return pending;
}
