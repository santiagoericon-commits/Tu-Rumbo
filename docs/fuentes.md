# Fuentes

Registro de las fuentes que respaldan copy o decisiones con contenido de salud (regla de CLAUDE.md: copy que afirme un hecho de salud necesita fuente verificable aquí; si no, lenguaje neutro). Cada entrada dice qué respalda, qué no, y cómo se verificó.

## Escala de "¿Qué tanto te molestaron los síntomas hoy?" (P6, 30 sept 2026)

**Dónde se usa:** `app/(protected)/sintomas/level-labels.ts` (opciones de `/sintomas` y chip del historial).

**Palabras de Rumbo:** 1 Nada · 2 Un poco · 3 Algo · 4 Bastante · 5 Mucho, siempre con "n de 5".

**En qué se basa:**
- Formato verbal de interferencia del PRO-CTCAE del National Cancer Institute (EE. UU.): cinco opciones ordenadas, *Not at all, A little bit, Somewhat, Quite a bit, Very much*. Instrumento y traducciones: https://healthcaredelivery.cancer.gov/pro-ctcae/
  - Verificación: la redacción en inglés viene de la research del pase visual. El 30 sept 2026 la página del NCI no mostró las opciones exactas por WebFetch; conviene confirmarlas en el "Form Builder" del sitio.
- Validación lingüística de la versión en español con pacientes con cáncer: Arnold B, Mitchell SA, Lent L, et al. *Linguistic validation of the Spanish version of the National Cancer Institute's Patient-Reported Outcomes version of the Common Terminology Criteria for Adverse Events (PRO-CTCAE).* Support Care Cancer. 2016 Jul. PMID 26838022. DOI 10.1007/s00520-015-3062-5.
  - Verificación: título, autores, revista y DOI confirmados con la API de PubMed (esummary) el 30 sept 2026.

**Nota honesta:**
- Las palabras de Rumbo **adaptan** el formato; **no son los ítems oficiales** de PRO-CTCAE ni su traducción validada al español. Rumbo no usa PRO-CTCAE como instrumento ni pregunta por síntomas específicos; solo toma la idea de una escala verbal de cinco pasos.
- Rumbo registra el valor tal cual: no calcula umbrales, promedios ni tendencias, y no interpreta el número.
- La evidencia a favor de escalas con caras (y en contra) viene sobre todo de estudios de **dolor**; no se trasladó aquí. Rumbo no usa caras, emoji ni colores por valor.
- Cambio de significado del 1: hasta P5 la escala decía "1 = poco, 5 = mucho"; desde P6 el 1 es "Nada". Solo hay datos ficticios de demo. Antes de usuarios reales, revisión profesional de las cinco palabras (marcadas `[PENDIENTE REVISIÓN PROFESIONAL]`).

## Principios de diseño (docs/diseno.md)

Fuentes de la research del pase visual (council de diseño en salud, UX con adultos mayores, enfermería oncológica, WCAG 2.2, ingeniería móvil). Se listan como referencias de diseño, no como afirmaciones de salud mostradas al usuario:

- Revisión sistemática de guías de diseño de apps de salud para adultos mayores. JMIR mHealth and uHealth, 2023.
- Revisión de 132 artículos sobre diseño de apps para personas mayores. PubMed 40804492.
- Grupos focales con sobrevivientes de cáncer sobre apps de seguimiento. JMIR mHealth and uHealth, 2017.
- Necesidades de pacientes oncológicos en apps de salud. JMIR Cancer, 2023.
- WCAG 2.2: 1.4.3 (contraste de texto), 1.4.4 (cambio de tamaño del texto), 1.4.11 (contraste de elementos no textuales), 2.4.11 (foco no oculto). https://www.w3.org/TR/WCAG22/
- Material 3, Navigation bar. https://m3.material.io/components/navigation-bar
- Apple Human Interface Guidelines, Tab bars. https://developer.apple.com/design/human-interface-guidelines/tab-bars

Pendiente: las referencias JMIR y PubMed 40804492 vienen de la research y no se verificaron una por una en esta sesión.
