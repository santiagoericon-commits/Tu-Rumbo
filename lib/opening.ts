// Telón de bienvenida, una vez por sesión del navegador. sessionStorage solo guarda esta bandera
// ("1"): nada personal ni de sesión.
export const OPENING_SEEN_KEY = "rumbo_opening_seen";

// Corre en <head> antes de pintar el body: si la sesión ya vio el opening, globals.css oculta el
// telón desde el primer cuadro.
export const openingSeenScript = `try{if(sessionStorage.getItem("${OPENING_SEEN_KEY}")==="1")document.documentElement.dataset.opening="done"}catch(e){}`;
