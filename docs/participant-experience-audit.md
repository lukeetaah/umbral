# Auditoría de experiencia del participante — UMBRAL alpha.4

Fecha: 18 de julio de 2026  
Alcance: `/demo`, cuatro laboratorios, sesión rápida y completa.

## Cómo se midió

Se recorrió la versión publicada en Vercel con un navegador nuevo y se contrastó el recorrido con las duraciones programadas en `demo-lab.tsx`, `protocol-engine.ts` y `stimulus-genome.ts`.

- El tono de calibración dura 1,0 s. El cambio de interfaz quedó disponible a los 1,56 s desde el clic.
- Un estímulo normal dura 1,8 s. La pantalla de respuesta apareció a los 2,61 s desde el clic, incluyendo arranque y margen de interfaz.
- La sesión rápida contiene 4 ensayos: sólo 7,2 s de sonido real.
- La sesión completa contiene 8 ensayos: sólo 14,4 s de sonido real.
- Cada ensayo pide una expectativa previa y, después, hasta cuatro datos: sí/no, categoría, confianza y texto libre.

Los tiempos humanos de lectura y respuesta se estimaron con un rango conservador; no se fingió que una automatización representa la velocidad de una persona nueva.

## Distribución del tiempo actual

| Parte | Rápida (4) | Completa (8) | Valor perceptible |
| --- | ---: | ---: | --- |
| Elegir salida, calibrar, consentimiento e instrucciones | 20–40 s | 20–40 s | Necesario, pero sin descubrimiento |
| Expectativas y pantallas “listo” | 16–32 s | 32–64 s | Bajo; anticipa burocracia |
| Sonidos audibles | 7,2 s | 14,4 s | Alto, pero demasiado breve |
| Preparaciones/silencios programados | 0–4,8 s | 0–9,6 s | Incomprensible sin contraste |
| Respuestas y formularios | 32–72 s | 64–144 s | Extrae datos, devuelve poco |
| Resultado | 10–25 s | 10–25 s | Abstracto; no reconstruye lo vivido |
| **Total estimado** | **1:25–2:55** | **2:20–4:55** | **Menos de 10% se siente como experiencia** |

## Qué no aporta valor perceptible

1. **El primer hallazgo llega demasiado tarde.** El primer sonido es aislado; no hay un antes/después ni una diferencia que el oído pueda reconocer en los primeros 40 segundos.
2. **Los cuatro laboratorios son el mismo formulario.** Cambian textos, semillas y controles, pero el participante siempre hace expectativa → escuchar → sí/no → categoría → confianza.
3. **Se pregunta más de lo que se demuestra.** La interfaz solicita hasta cinco decisiones por 1,8 s de sonido.
4. **La adaptación ocurre fuera de escena.** El modelo modifica una futura semilla, pero la sesión actual no muestra una elección que cambie el siguiente estímulo.
5. **Las repeticiones, omisiones y sham son metodológicamente útiles pero narrativamente mudos.** Se registran, aunque no culminan en un descubrimiento comprensible.
6. **El resultado habla del sistema, no de la persona.** “Ajustó tu próxima sesión” no dice qué sonido volvió, qué cambió bajo contexto o qué asociación aprendió.
7. **La duración se elige como cantidad de pruebas.** “4 o 8” alarga el formulario; no agrega entrenamiento, contraste ni sorpresa.

## Decisiones de rediseño

- Una única sesión principal de aproximadamente 9 minutos; la duración crece por capítulos distintos, no por duplicar ensayos.
- La prueba de audio se convierte en un contraste audible A/B y deja el sistema listo en un solo gesto.
- Cada capítulo sigue el bucle **estímulo → elección simple → contraste → descubrimiento → devolución**.
- Atlas construye un mapa; Apprenticeship enseña y examina; State Gate cambia el contexto; Anchor construye, retira y reevalúa una señal segura.
- La respuesta normal es de un toque. El texto libre y la confianza reiterada desaparecen del recorrido principal.
- Los controles, omisiones y repeticiones siguen guardándose con condición, semilla, momento y latencia, pero no se etiquetan durante la experiencia.
- El resultado reconstruye la sorpresa con lenguaje concreto y muestra una visualización propia de cada laboratorio.
- Volver otro día tiene una razón explícita: comprobar si el patrón se mantiene, se fortalece o cambia de estado.

## Criterios verificables de la nueva versión

- Antes de 40 s: audio confirmado y contraste A/B reproducible.
- Una persona puede explicar el objetivo de su laboratorio en una frase sin leer documentación científica.
- Cada laboratorio contiene entrenamiento/exploración, adaptación dentro de la sesión, una prueba no anunciada y una devolución personal.
- Sham, omisión y repetición quedan en los datos exportables sin aparecer como jerga en pantalla.
- El resultado responde tres preguntas: **qué cambió, qué descubrimos y por qué volver**.
