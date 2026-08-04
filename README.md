# Observatorio de Experiencia Digital

**Politécnico Grancolombiano** · Dirección de Experiencia e Inclusión · Vicerrectoría del Estudiante

App web interactiva que documenta los insights identificados en la experiencia digital de los estudiantes del Poli, como parte del **Sistema Institucional de Gestión de la Experiencia Digital**.

🔗 **Ver en vivo:** *(se agrega el link de GitHub Pages aquí una vez publicado)*

## Qué es esto

Un repositorio vivo de los insights encontrados en el diagnóstico institucional, con:

- Filtros por tema, punto del journey y estado del insight
- Búsqueda por texto libre
- Tarjetas expandibles con descripción, impacto, fuentes, alternativas de solución, responsable, esfuerzo estimado e índice de prioridad
- Tarjetas de estadísticas que también funcionan como filtros rápidos (esfuerzo alto, fuentes por documentar, prioridad por asignar)

**Versión actual:** 2.0 · Julio 2026 · 24 insights documentados

**Fuentes del diagnóstico:**

Cada insight documenta sus propias fuentes de evidencia (entrevistas con stakeholders, encuestas institucionales, reseñas de Google Maps, analítica, etc.) en el campo `fuentes`. Este campo se está completando de forma progresiva insight por insight — todavía hay varios pendientes de documentar (ver la tarjeta "Fuentes por documentar" en el sitio).

## Estructura del proyecto

```
repositorio-insights/
├── index.html       # Estructura de la página
├── css/
│   └── styles.css    # Estilos — tokens del Poli Design System (#003DA5, etc.)
├── js/
│   ├── data.js        # Datos: los insights documentados
│   └── app.js          # Lógica: render, filtros, búsqueda, estadísticas
└── README.md
```

## Cómo agregar un nuevo insight

Edita `js/data.js` y agrega un nuevo objeto al array `insights`, siguiendo el mismo formato:

```js
{
  id: "INS-025",
  prioridad: "", // Índice de prioridad — déjalo vacío ("") si aún no se ha asignado
  nombre: "Síntesis corta del insight.",
  tipo: "Insight",
  tema: "Nombre del tema al que pertenece el hallazgo",
  momento: "Punto del journey en el que ocurre", // puede incluir una aclaración entre paréntesis, ej: "Transversal (uso de plataformas y servicios digitales)"
  estado: "Confirmado", // estado de validación del insight
  descripcion: "Qué ocurre, en detalle.",
  impacto: "Qué le pasa al estudiante por esto.",
  solucion: "Alternativas de solución propuestas.",
  fuentes: "", // Fuentes de evidencia — déjalo vacío ("") si aún no se ha documentado
  propietario: "Área responsable de la solución",
  esfuerzo: "Medio" // Bajo | Medio | Medio - Alto | Alto | Muy alto
}
```

Notas importantes:

- Las opciones de los filtros **Tema**, **Punto del journey** y **Estado** se generan automáticamente a partir de los valores presentes en `data.js` — no hace falta tocar los `<select>` en `index.html` al agregar un tema o momento nuevo.
- El campo `momento` se agrupa por el texto antes del primer paréntesis para efectos de filtrado (ej. `"Transversal (uso de plataformas...)"` se filtra junto con `"Transversal"`). El texto completo sigue mostrándose en el detalle de la tarjeta.
- El campo `esfuerzo` se agrupa en tres niveles para el filtro rápido "Esfuerzo alto" y para el color del badge: **Alto** (Alto, Muy alto), **Medio** (Medio, Medio - Alto) y **Bajo** (Bajo).
- No olvides actualizar los números iniciales de las tarjetas de estadísticas (`stat-total`, `stat-esfuerzo-alto`, `stat-sin-fuentes`, `stat-sin-prioridad`) en `index.html` si cambia el total — son solo el valor que se ve antes de que cargue `app.js`, que los recalcula automáticamente al abrir la página.

## Roadmap técnico

- [x] v1.0 — Prototipo funcional, datos embebidos en `data.js`, hosteado en GitHub Pages
- [x] v2.0 — Migración del esquema de fricciones a insights (tema, punto del journey, índice de prioridad, fuentes de evidencia)
- [ ] Migrar la fuente de datos a una lista de SharePoint vía Microsoft Graph API (para que otros editen sin tocar código)
- [ ] Migrar a Angular, consistente con el resto del Poli Design System

## Contexto
