# Repositorio de Fricciones — Experiencia Digital

**Politécnico Grancolombiano** · Dirección de Experiencia e Inclusión · Vicerrectoría del Estudiante

App web interactiva que documenta las fricciones identificadas en la experiencia digital de los estudiantes del Poli, como parte del **Sistema Institucional de Gestión de la Experiencia Digital**.

🔗 **Ver en vivo:** *(se agrega el link de GitHub Pages aquí una vez publicado)*

## Qué es esto

Un repositorio vivo de las fricciones encontradas en el diagnóstico institucional, con:
- Filtros por severidad, momento del journey y estado de resolución
- Búsqueda por texto libre
- Tarjetas expandibles con descripción, impacto, fuentes, solución propuesta y propietario
- Estado editable inline (Sin iniciar → En curso → Resuelta)

**Versión actual:** 1.0 · Junio 2026 · 15 fricciones documentadas

**Fuentes del diagnóstico:**
- 7 entrevistas con stakeholders
- 8 encuestas (21.829 respuestas)
- 1.529 reseñas de Google Maps (450 con texto analizadas)

## Estructura del proyecto

```
repositorio-fricciones/
├── index.html       # Estructura de la página
├── css/
│   └── styles.css    # Estilos — tokens del Poli Design System (#003DA5, etc.)
├── js/
│   ├── data.js        # Datos: las fricciones documentadas
│   └── app.js          # Lógica: render, filtros, búsqueda, edición de estado
└── README.md
```

## Cómo agregar una nueva fricción

Edita `js/data.js` y agrega un nuevo objeto al array `frictions`, siguiendo el mismo formato:

```js
{
  id: "F-016",
  nombre: "Nombre corto de la fricción",
  descripcion: "Qué pasa, en detalle.",
  momento: "Inscripción de asignaturas", // debe coincidir con una opción del filtro en index.html
  plataforma: "Smart Campus",
  fuentes: ["Fuente 1", "Fuente 2"],
  severidad: "Alta", // Alta | Media | Baja
  impacto: "Qué le pasa al estudiante por esto.",
  solucion: "Alternativa de solución propuesta.",
  esfuerzo: "Medio", // Alto | Medio | Bajo
  propietario: "Área responsable",
  estado: "Sin iniciar" // Sin iniciar | En curso | Resuelta
}
```

No olvides actualizar los números en las tarjetas de estadísticas (`stat-total`, `stat-alta`, etc.) en `index.html` si cambia el total.

## Roadmap técnico

- [x] v1.0 — Prototipo funcional, datos embebidos en `data.js`, hosteado en GitHub Pages
- [ ] Migrar la fuente de datos a una lista de SharePoint vía Microsoft Graph API (para que otros editen sin tocar código)
- [ ] Migrar a Angular, consistente con el resto del Poli Design System

## Contexto

Este repositorio es uno de los 8 entregables del Sistema Institucional de Gestión de la Experiencia Digital. Más contexto en la página principal del proyecto en SharePoint.

---
*Fabio Nelson Rodríguez Díaz — Especialista en Experiencia Digital*
