# Marca de Rumbo

Capa de marca sobre `docs/diseno.md`. Ese documento dice cómo está construida la interfaz; este dice qué tiene que sentir la persona y cómo se ven las features nuevas. Si chocan, manda `docs/diseno.md` salvo la decisión D4 de abajo, que lo actualiza.

Versión 1 · 4 de noviembre de 2026 · para P9, P10 y el pase P10.5.

## 1. Qué es "premium" en Rumbo

Premium no es más efectos. Es la sensación de que alguien cuidó cada detalle para ti y no te está vendiendo nada.

| Es premium | No es premium |
|---|---|
| Calma, espacio y ritmo idénticos en cada pantalla | Gradientes, brillos, sombras fuertes |
| Una respuesta pequeña y precisa a cada cosa que haces | Confeti, sonidos, vibración, mascotas |
| Ilustraciones propias, con una sola familia de trazo | Ilustraciones de stock o emoji |
| Tipografía cuidada: serif en títulos, números tabulares, buena interlínea | Muchos tamaños y pesos mezclados |
| Una hoja impresa que se ve profesional | Exportar algo que parece captura de pantalla |
| Cero fricción: uno o dos toques | Onboardings largos, pop-ups, permisos al entrar |

**Referencia:** Headspace por la calidez, las ilustraciones propias y el ritmo lento. **No** se toma de Headspace: rachas, contadores de minutos ni metas de uso.

## 2. Personalidad

Rumbo es un **acompañante sereno**. No es coach, no es enfermera, no es amigo efusivo. Habla poco, de "tú", y siempre deja la decisión clínica al equipo médico.

Tres pilares, que vienen de la brújula:
1. **Rumbo:** dirección clara. Cada pantalla tiene una sola tarea.
2. **Resguardo:** lo tuyo es tuyo. Privacidad visible, nada sensible en avisos, URLs ni mensajes.
3. **Ritmo:** constancia sin presión. Un día sin registrar no se castiga ni se nota.

## 3. Reconocimiento sereno (los "little wins" de Rumbo)

### La idea

Cada acción de la persona recibe una respuesta pequeña, inmediata y siempre igual de cálida. **Se reconoce el acto, nunca se mide el desempeño.**

### Por qué así y no con puntos o rachas

- En una revisión de 11 estudios, la gamificación de adherencia usó sobre todo puntos, tablas y niveles. La evidencia es mixta, las muestras son chicas y varios usuarios perdieron el interés (Tran et al., 2022).
- Un tratamiento hormonal dura 5 años o más. Faltar un día va a pasar. Una racha que se rompe convierte ese día en culpa, y la culpa es justo lo que lleva al abandono.
- El progreso que se percibe en el día a día motiva más que las recompensas grandes (Amabile y Kramer, 2011). Eso cabe en Rumbo sin números.

### Las reglas

1. **El acto, no la métrica.** Sin puntos, rachas, porcentajes, niveles, insignias ni comparaciones.
2. **Misma respuesta siempre.** Registrar "Mucho" en síntomas recibe lo mismo que registrar "Nada". Responder distinto sería interpretar.
3. **No hacer algo no quita nada.** Nada se reinicia, se apaga ni desaparece por no registrar.
4. **Solo al tocar.** El reconocimiento se anima únicamente cuando la persona hace la acción. Al recargar, se ve el estado final quieto.
5. **Corto y en silencio.** Micro ≤ 400 ms. Cierre del día ≤ 1.2 s. Sin sonido ni vibración. Nunca bloquea la siguiente acción.
6. **Siempre con `motion-safe`.** Con reduced motion queda el cambio de estado y el texto, sin desplazamiento.
7. **Sin color de estado.** Lo que se anima es la forma (trazo, escala, aguja), no el color.
8. **Sin almacenamiento nuevo.** No se guardan banderas de "ya celebrado" con fechas ni datos de salud.

### Catálogo

| Momento | Disparador | Qué pasa | Copy | Gate |
|---|---|---|---|---|
| Dosis marcada | "Ya la tomé" | El check se dibuja (trazo, 320 ms) y la tarjeta se asienta (`scale` 0.98 → 1) | "Tomada" (ya existe) | 1 |
| Deshacer | "Deshacer" | Mismo movimiento a la inversa, igual de calmo | "Pendiente" | 1 |
| **Día cerrado** | Se marca la última dosis de hoy | La aguja del encabezado de Hoy gira a norte y se asienta; aparece una línea debajo | "Listo por hoy." | 1 |
| Síntomas guardados | Guardar el registro del día | El cuaderno del encabezado "cierra" su página (200 ms) | "Gracias por contarlo. Quedó en tu registro." | 1 |
| Cita pasada | La fecha de la cita ya pasó | La tarjeta queda "Ya fue tu cita" con check suave y un enlace | "¿Quieres anotar algo de lo que te dijeron?" | 1 |
| Apoyo listo | Elegir el tipo de apoyo | El sobre de la tarjeta se cierra y aparece la vista previa | "Tu mensaje está listo. Tú decides si lo envías." | 1 |
| Primer medicamento | Guardar el primero | Entra la tarjeta con la ilustración de camino, una sola vez por acción | "Listo. Aquí verás tus dosis de cada día." | 1 |
| Hitos de uso | Una semana o un mes desde que la persona creó su cuenta | Tarjeta quieta en Hoy, se cierra con "Gracias" | "Hoy hace un mes que usas Rumbo." | 1 |
| Hitos de tratamiento ("un año de tratamiento") | Fecha de inicio del tratamiento | **No se construye para LSH** | | 2 (pedir revisión de psicooncología de Encauza) |

**Nota sobre hitos de uso:** se muestran igual a todas, se hayan marcado dosis o no. No dicen cuántas dosis lleva.

### El "hook" con beneficio para la persona

El ciclo clásico de producto (disparador, acción, recompensa, inversión; Eyal, 2014) adaptado para que lo que engancha sea útil y no adictivo:

| Paso | En Rumbo |
|---|---|
| Disparador | La lista de Hoy (y push en v2, sin datos clínicos en el texto) |
| Acción | Un toque: "Ya la tomé" |
| Recompensa | Reconocimiento sereno y cierre del día. Sin azar ni premios variables |
| Inversión | Su registro se convierte en "Para mi cita", que le sirve de verdad en la consulta |

**Frase para el pitch:** "Rumbo no premia, reconoce. Y lo que la paciente registra se convierte en algo que le sirve a ella y a su médico."

### Cómo medirlo en la sesión con Encauza

Después de la tarea de marcar dosis: "Del 1 al 5, ¿qué tan bien te hizo sentir la app al marcar tu dosis?" y "¿Algo te pareció infantil o exagerado?". Anotar citas textuales.

## 4. Decisión D4 (actualiza `docs/diseno.md`)

`docs/diseno.md` dice "Marcar una dosis no anima nada". Desde P10.5 queda así: **marcar una dosis anima la forma del check y el asiento de la tarjeta, según el catálogo de arriba.** Sigue prohibido: confeti, rebote, premios, color por estado, sonido y vibración. Razón: el feedback confirma la acción y da cierre; la regla original buscaba evitar recompensas, y estas reglas lo siguen evitando.

## 5. Patrones para las features nuevas

### Apoyo (P9)
- No es pestaña. Entrada desde un ícono con etiqueta en la barra superior y desde la tarjeta de surtido.
- Identidad: la propia de Rumbo, `surface-muted` con ícono en `accent`. No se agrega color nuevo.
- Opciones en lista vertical, filas de 72 px: círculo con ícono, título `text-name`, una línea `text-secondary`.
- Vista previa del mensaje en una tarjeta tipo "burbuja" (`surface`, borde `line-strong`, `rounded-card`), con el texto en `text-body`.
- Un solo botón primario: "Abrir WhatsApp".

### Surtido (P9)
- Una línea dentro de la tarjeta del medicamento, con ícono de cápsula y texto `text-secondary`: "Te quedan unas 9 tomas · hasta el sáb 15 nov".
- Sin barras de progreso, medidores ni porcentajes.
- A 7 días o menos: la misma línea + enlace neutro a Apoyo. Sin color nuevo, sin ícono de alerta.

### Para mi cita (P10)
- En pantalla: igual que el resto de la app.
- Impreso: blanco y negro, Source Serif 4 en títulos (18 pt) e Inter en cuerpo (11 pt), filetes finos entre secciones, marca pequeña arriba a la izquierda y fecha del periodo a la derecha. Pie: "Registro personal hecho en Rumbo. No es un documento médico."
- Debe verse bien en una hoja carta y como PDF.

## 6. Ilustraciones

Una sola familia: **camino y brújula**.
- Trazo de 1.75 como los íconos (Lucide), puntas redondeadas, `accent` para el trazo y `sage-soft` para un solo relleno plano.
- Sin personas, caras, órganos, listones, cruces médicas ni corazones.
- Juego inicial: brújula (cierre del día), camino con señal (primer medicamento, estados vacíos), sobre (apoyo), hoja con renglones (para mi cita), calendario con hoja (cita pasada).
- SVG en línea como componentes en `components/illustrations/`, con `aria-hidden` y texto al lado.

## 7. Checklist premium (todo PR de UI)

- [ ] Solo tokens de espacio, color, radio y tipografía. Nada fuera de `@theme`.
- [ ] Máximo tres niveles de texto por tarjeta.
- [ ] Números con `tabular-nums` (horas, fechas, cantidades).
- [ ] Estados vacío, carga y error con la ilustración o el esqueleto que les toca.
- [ ] Reconocimiento sereno según el catálogo, con su versión reduced motion.
- [ ] 360 y 390 px, zoom al 200%, `prefers-reduced-motion`, impresión si aplica.
- [ ] Copy contra la tabla de swaps de `CLAUDE.md`, marcado `[PENDIENTE REVISIÓN PROFESIONAL]` si es nivel 1.
- [ ] Nada sensible en `localStorage`, `sessionStorage`, URLs ni textos que salen de la app.

## 8. Fuera de alcance antes del 13 de noviembre

- Modo oscuro completo.
- Hitos de tratamiento (gate nivel 2).
- Sonido, vibración o animaciones largas.
- Nueva paleta, logotipo o tipografía.

## Referencias

- Amabile, T. M., y Kramer, S. J. (2011). *The progress principle: Using small wins to ignite joy, engagement, and creativity at work*. Harvard Business Review Press.
- Eyal, N. (2014). *Hooked: How to build habit-forming products*. Portfolio.
- Saffer, D. (2013). *Microinteractions: Designing with details*. O'Reilly Media.
- Tran, S., Smith, L., El-Den, S., y Carter, S. (2022). The use of gamification and incentives in mobile health apps to improve medication adherence: Scoping review. *JMIR mHealth and uHealth, 10*(2), e30671. https://doi.org/10.2196/30671
