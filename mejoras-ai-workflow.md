# AI helper · Revisión del workflow

Revisión de producto de las pantallas del AI helper (Plan with AI, Weekly summary, Distraction patterns, Habit suggestions, Ask your data) y de cómo se conectan con el resto de la app.

**Principio que guía todo:** cada pantalla de AI *lee* una herramienta, *propone* un paso y *devuelve* al usuario a esa herramienta para actuar. La AI no es un destino aparte con sus propios datos ni sus propios editores.

Prioridad: **P1** (próximo ciclo) · **P2** (si hay espacio) · **P3** (explorar).

---

## 1. Diagnóstico (antes de los cambios)

| Problema | Dónde | Impacto |
|---|---|---|
| La AI solo se alcanzaba desde el menú, y en `index2` estaba oculta | NavBar | El usuario tiene que saber que existe. No aparece en el momento en que sirve |
| **Datos distintos para lo mismo**: Plan with AI tenía 3 tareas propias, distintas a las de Home | `plan-with-a-i` vs `home` | Rompe la confianza: "¿de dónde sacó estas tareas?" |
| **Botones muertos**: "Start a 5-min timer", "Pick another", "Open my distractors list", chips de Weekly summary | varias | Callejones sin salida |
| **Dos editores de metas**: Habit suggestions tenía su propio formulario min/ok/ideal, además del "Change targets" del tracker | `habit-suggestions` vs `minimal-tracker` | Dos reglas para lo mismo. El de AI no respetaba "desde hoy" ni el separador de la hoja |
| **Tercer lugar para registrar días**: Habit suggestions mostraba 7 barras `HabitRow` que parecían editables pero no hacían nada | `habit-suggestions` | Además repetía lo que ya decían la InsightCard y los 2 StatTiles |
| **Breakdown repetido**: el desglose de "Do laundry" aparecía en el chat y, a la vez, ya estaba en la lista antes de pedirlo | `plan-with-a-i` | Ruido y respuesta "adivinada" |
| **Dos grupos de prompt chips** en Ask your data ("Try asking" + chips bajo el chat) | `ask-your-data` | Dos lugares para la misma acción |
| "Compare with last week" duplicaba el chip de rango "Last week" | `weekly-summary` | Dos controles para el mismo resultado |
| Preguntas en Ask your data que ya responde otra pantalla ("When do I get distracted most?", "How many wishes did I check on time?") | `ask-your-data` | El chat compite con las pantallas dedicadas |

---

## 2. Cambios ya aplicados en el preview

| # | Cambio | Archivo |
|---|---|---|
| 2.1 | El menú AI helper se ve también en el flujo de `index2`. Nueva etapa **4 · AI helper** con el *desde* / *hacia* de cada pantalla | `flow.js`, `index2.html` |
| 2.2 | **Puntos de entrada contextuales** (con sparkle, que según el brand book marca lo que es AI): Home → *Where do I start?* (Plan) · Distractors → *When do they show up?* (Patterns) · My week → *Weekly summary* · Tracker con hoja terminada → *Review targets first* (Habit suggestions) | `home`, `distractors`, `week`, `minimal-tracker` |
| 2.3 | Plan with AI usa las tareas pendientes de Home, con el aviso "From your list on Home" y el link *Edit the list on Home*. El breakdown aparece en la lista solo después de pedirlo. *Start a 5-min timer* (no hay timer en la app) pasa a ser *I'll do it now*, y *Pick another* ahora funciona | `plan-with-a-i` |
| 2.4 | Weekly summary: se quitó "Compare with last week". Los chips abren Ask your data con la pregunta ya enviada (`?q=`). Fila *Go deeper* → My week, Distraction patterns, Catch a wish | `weekly-summary` |
| 2.5 | Distraction patterns: *Open my distractors list* funciona. Elegir la estrategia "Catch a wish" ofrece *Open Catch a wish* | `distraction-patterns` |
| 2.6 | Habit suggestions: se quitaron las 7 barras y el editor propio. *Adjust targets* abre el editor del tracker (`minimal-tracker.html?habit=…&edit=targets`). Se agregó *See the Meditate sheet* | `habit-suggestions`, `minimal-tracker` |
| 2.7 | Ask your data: se quitó la tarjeta "Try asking" y quedan 3 chips bajo el chat (regla del brand book). Acepta `?q=`. Las preguntas que ya responde otra pantalla devuelven una respuesta corta más un link a esa pantalla | `ask-your-data` |

---

## 3. Propuestas implementadas (fase 2)

Las propuestas de la revisión anterior ya están en el preview. El flujo se recorrió en Edge con un script, sin errores de JS.

### 3.1 Estructura del helper

| # | Mejora | Estado | Cómo quedó |
|---|---|---|---|
| A1 | Unificar Plan with AI y Ask your data | ✅ | `screens/helper.html` · **Ask the helper**. Un solo chat que planifica (lee tareas y energía) y responde sobre el diario. Cada respuesta trae 2–3 preguntas de seguimiento. Si la respuesta ya está en otra pantalla, enlaza a esa pantalla en vez de copiarla |
| A2 | Menú AI de 5 a menos ítems | ✅ | El menú tiene **2 ítems**: Ask the helper y Weekly summary. Weekly summary tiene tabs: *Overview · Distractions · Habits* (Distractions era Distraction patterns, Habits era Habit suggestions) |
| A3 | Id `habits` duplicado en `NavBar` | ✅ | Cambiado en `design-system/components/src/index.jsx` y `index.d.ts`, y el bundle se regeneró con `npm run build`. Ya no hay ids repetidos. `flow.js` quedó sin parche y conserva los ids viejos (`plan`, `ask`, `patterns`, `ai-habits`) como alias |
| A4 | "What the helper can see" funcional | ✅ | Panel con una casilla por fuente (tareas, hábitos, distractores, wishes). Si una fuente está apagada, el helper dice que no la ve en vez de inventar la respuesta |

### 3.2 Datos y consistencia

| # | Mejora | Estado | Cómo quedó |
|---|---|---|---|
| D1 | Una sola fuente de datos de demo | ✅ | `preview/ai-demo.js` calcula todo desde `modules/habits/sample-data.js`: hábitos por día, semana/mes, "hardest habits", sugerencias por hábito. Home ya no tiene la fecha fija ni el "5 of 7" escrito a mano. Tareas, focus y wishes siguen siendo números de demo |
| D2 | Tareas compartidas Home ↔ helper | ✅ | `SITAI.tasks` (sessionStorage `sit-tasks`). Tachar una tarea o un paso del breakdown en el helper la tacha en Home, y al revés |
| D3 | Aplicar sugerencias con "desde la próxima hoja" | ✅ | El editor de metas del tracker tiene *From today / From the next sheet* y acepta valores sugeridos (`?edit=targets&from=next&min=&ok=&ideal=`). Las metas pendientes se ven como badge con *Undo*, y la próxima hoja empieza con ellas (`sit-next-targets`). Esto también cubre el ítem **1.1 de `mejoras-fase-2.md`** |

### 3.3 Repetidos fuera del AI

| # | Mejora | Estado | Cómo quedó |
|---|---|---|---|
| R1 | "Habit of the week" de solo lectura | ✅ | Barras sin interacción, con los datos reales de Meditate y el botón *Log today*, que abre el tracker. Registrar días pasa en un solo lugar |
| R2 | Tarjetas de Home sin salida | ✅ | *See my wishes* → Catch a wish · *All 8 tips* → Suggestions |
| R3 | Habit suggestions como momento | ✅ | Cuando una hoja termina, la sugerencia aparece en la tarjeta del tracker (*Keep them / Use x · y · z / Adjust*) antes de *Start a new sheet today*. Prueba: `minimal-tracker.html?habit=h-journal`. Esto también cubre el ítem **1.6 de `mejoras-fase-2.md`** |

### 3.4 Docs actualizados

- Design system: `NavBar` actualizado. Las tarjetas de pantallas del design system se eliminaron porque repetían `preview/screens/`, que es la única fuente de la UI.
- Un solo índice: `preview/index.html` (el flujo, antes `index2.html`). Se eliminaron el índice viejo, `preview/components/` (copias de las tarjetas de `design-system/components/`), las 4 redirecciones de pantallas AI viejas y `design-system/_archive/`.
- `modules/habits/README.md`: contrato de `nextTargets` y `PUT /targets` con `"from": "next-sheet"`.
- `mejoras-fase-2.md` (en la carpeta raíz): 1.1 y 1.6 marcados como hechos.
- El usuario de la demo ahora es **Ana** (antes Deco) en el preview, el design system y `frontend/`. Las tareas "Send the report to Ana" y "Reply to Ana" pasaron a **Leo**.

### 3.5 Lo que queda abierto

- **Datos de demo que siguen escritos a mano**: tareas de la semana, sesiones de foco, distractores y wishes. Dependen de que esas herramientas guarden datos.
- **"+ Add a task" en Home** sigue sin acción.

## 4. Métricas para validar

- **% de sesiones de AI que terminan en una acción en la herramienta** (tachar la tarea, guardar las metas, crear un wish). Es la métrica principal del principio *propone → el usuario decide*.
- **Entrada por punto contextual vs. por menú**. Si el menú queda por debajo del 20%, avanzar con A2.
- **Preguntas en Ask your data que terminan en un link a otra pantalla**. Si son muchas, esas pantallas no se encuentran fácil.
- **"Pick another" por sesión** en Plan with AI. Un valor alto indica que la primera sugerencia no respeta la energía declarada.
