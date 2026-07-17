# UMBRAL: An Open, Zero-Cost Platform for Adaptive Auditory-Perceptual Learning Experiments

**Autores:** Lucas (fundador y director), Samuel (motor algorítmico local) y contribuyentes abiertos

**Estado:** protocolo y paper vivo; no revisado por pares

**Versión:** 0.1-alpha.2

**Fecha:** 2026-07-17
**Licencia del texto:** AGPL-3.0-only junto con el repositorio

> Este documento es un protocolo y paper vivo de investigación abierta. No fue revisado por pares y no demuestra que UMBRAL produzca sabores, recuerdos o tratamientos.

## 1. Resumen

UMBRAL es una plataforma web abierta para estudiar si señales auditivas procedurales nuevas pueden adquirir relaciones reproducibles con respuestas perceptuales, emocionales o corporales. La propuesta no presupone que una señal pueda reconstruir una experiencia. Diseña comparaciones capaces de separar aprendizaje de correspondencias espontáneas, familiaridad, expectativa, demanda experimental y azar. Los estímulos se reconstruyen en el navegador desde semillas y parámetros; no se graba audio ni se usa una API remota para decidir ensayos. El MVP contiene protocolos locales para mapeo, aprendizaje y fading, estado previo y anclaje seguro, con sham, omisión, transferencia, repetición oculta y retest como componentes explícitos. Una sesión individual genera un registro, no una conclusión.

## 2. Explicación en lenguaje simple

Primero se presenta un sonido nuevo junto con algo simple, por ejemplo un color. Después se repite, se reduce o se retira una parte. La persona informa primero si ocurrió algo y sólo entonces clasifica la experiencia. Otros ensayos parecen iguales pero contienen controles. El objetivo es saber si una relación reaparece de manera estable y si supera esos controles, no persuadir a la persona de que debería sentirla.

## 3. Antecedentes

La literatura establece piezas separadas del problema. Existen correspondencias compartidas entre propiedades acústicas y gustos en tareas de emparejamiento [Simner2010; Crisinel2010]. La música puede modificar atributos reportados mientras se prueba chocolate real [Carvalho2017]. Música familiar puede evocar recuerdos autobiográficos [Janata2009]. Señales visuales pueden condicionarse con salivación anticipatoria [Kershaw2018]. La imaginación y la inferencia de gustos pueden compartir información multivariable en corteza gustativa [Avery2023]. La integración de gusto y olor depende de congruencia y experiencia [Small2004]. El aprendizaje perceptual auditivo ocurre, pero su transferencia puede ser específica del material [Loebach2008]. Los sistemas de sustitución sensorial muestran que las personas pueden aprender mapeos estructurados de imagen a sonido [Kucinkas2025].

## 4. Límite de la evidencia

La evidencia disponible sustenta componentes individuales del proyecto, como las asociaciones sonido-sabor, la modificación multisensorial del sabor, la evocación autobiográfica por música, el condicionamiento salival y la representación de gustos imaginados. No demuestra todavía que una firma auditiva pueda generar por sí sola un sabor completo o una experiencia autobiográfica específica.

Las activaciones descriptas en estudios con fMRI, EEG, MEG o electrodos no pueden atribuirse a una sesión de UMBRAL, que no usa instrumental neural. Una respuesta subjetiva es un dato sobre experiencia informada; no identifica una región cerebral.

## 5. Problema

Las demostraciones de correspondencia suelen medir preferencias inmediatas. Las demostraciones multisensoriales suelen mantener presente el alimento u otro estímulo original. Los estudios de memoria suelen usar música ya conocida. Falta una prueba abierta y reproducible que investigue señales nuevas, adquisición, retirada gradual, controles de expectativa y estabilidad entre días en un mismo marco.

## 6. Hipótesis principal

Después de aprendizaje explícitamente consentido, una señal auditiva nueva podría aumentar una respuesta preespecificada respecto de línea de base y sham, conservar parte de esa respuesta cuando se retira el estímulo original y repetirla en otra sesión.

La hipótesis nula admite que toda diferencia sea trivial, inestable o explicable por orden, correspondencia espontánea, familiaridad, instrucciones, demanda, memoria de la respuesta anterior o azar.

## 7. Hipótesis secundarias

1. Los mapeos estructurados se aprenderán mejor que los arbitrarios sin estructura.
2. La transferencia a una segunda señal será menor que la adquisición directa.
3. La expectativa explicará parte de las respuestas y debe medirse en cada ensayo.
4. La carga moderada o la ausencia de preparación reducirán algunas respuestas si dependen de atención.
5. Una respuesta que aparece sólo una vez y no supera sham no se considerará evidencia de aprendizaje.

## 8. Mecanismos posibles

UMBRAL considera, sin asumirlos, aprendizaje asociativo, memoria de trabajo, correspondencias crossmodales, predicción temporal, atención, imaginería, reconocimiento consciente y condicionamiento de segundo orden. Las respuestas de omisión registradas con instrumental sostienen que secuencias auditivas pueden generar predicciones neurales [Wacongne2011], pero UMBRAL sólo puede medir conducta y autoinforme. La evidencia humana de condicionamiento de segundo orden sigue siendo escasa y heterogénea [Lee2021].

## 9. Arquitectura experimental

Cada estímulo tiene semilla, versión, portadora, modulación, duración, ganancia, forma de onda, color de ruido, modo de batido, armónicos, filtro, paneo y condición sham. El hash se registra, pero no se muestra durante la sesión para no revelar repeticiones. El motor local construye el mismo estímulo desde los mismos parámetros. La condición queda oculta para la persona durante el ensayo.

## 10. Laboratorio Atlas

Atlas busca asociaciones espontáneas con color, forma, textura, temperatura, movimiento, estado corporal y categorías no previstas. Intercala repeticiones ocultas y sham. La respuesta binaria precede a las categorías para reducir inducción por lista.

## 11. Laboratorio Apprenticeship

Apprenticeship usa la progresión preespecificada A1+C1, repetición, B1→A1+C1, fading, B1→A1, A2→A1 y A2. El MVP representa esta progresión como ocho ensayos con intensidades visuales decrecientes y omisiones. Distingue reconocimiento, expectativa, imagen, recuerdo, emoción, cuerpo y percepción definida.

## 12. Laboratorio State Gate

State Gate compara estímulo solo, preparación sola, preparación más estímulo, preparación más control, baja y moderada carga visual, silencio previo y ausencia de silencio. No usa volumen alto ni instrucciones que prometan un efecto.

## 13. Laboratorio Anchor

Anchor limita el objetivo a cualidades seguras elegidas: seguridad, calidez, pertenencia, alivio, curiosidad, ternura o amplitud. No solicita trauma, diagnósticos ni detalles íntimos. Un refugio imaginado debe permanecer etiquetado como imaginado; la interfaz no pretende fabricar recuerdos.

## 14. Controles

Los controles mínimos son sham, omisión, repetición oculta, orden reproducible, estímulo solo, preparación sola y retest. Protocolos posteriores agregarán señales no apareadas e instrucciones contradictorias aprobadas éticamente. Sham puede ser silencioso; no se informa su identidad durante la sesión, pero el propósito general y la existencia de controles se explican antes del consentimiento.

## 15. Variables

Variables primarias: ocurrencia informada, diferencia frente a sham, reproducibilidad y estabilidad en retest. Variables secundarias: categoría, confianza, expectativa, similitud con objetivo, intensidad, latencia, habituación y abandono. Texto libre es opcional, corto y no debe contener datos íntimos. Dolor, mareo, tinnitus, ansiedad, fatiga u otro malestar se tratan como eventos adversos, no como eficacia.

## 16. Plan de análisis

El análisis primario se define antes de observar resultados colectivos. Reportará proporciones y tamaños de efecto con intervalos bootstrap, curvas individuales y diferencias contra sham. No imputará datos faltantes en el análisis primario ni transformará escalas ordinales en precisión falsa. La expectativa se incluirá como covariable o estrato preespecificado. Los análisis exploratorios se etiquetarán. No se calculará un “porcentaje de precisión” individual a partir de una sola sesión.

## 17. Criterios de calidad

Una sesión puede marcarse inválida si el audio no fue confirmado, hubo interrupciones importantes, el protocolo no terminó, la persona reportó malestar o el navegador suspendió el audio. El chequeo audible previo no cuenta como ensayo. Las versiones del motor y protocolo se guardan para reconstrucción.

## 18. Seguridad auditiva

La salida usa ganancia conservadora, limitador, filtros, rampas anti-click y Stop global mediante botón o tecla Escape. El navegador no puede conocer dB SPL en el oído ni exposición acumulada. La persona debe usar un nivel cómodo, comenzar por debajo del 60% del dispositivo y detenerse ante síntomas. La guía se apoya en recomendaciones WHO-ITU, sin presentar el porcentaje del dispositivo como calibración acústica.

Los batidos binaurales y monaurales son tipos de estímulo, no tratamientos. Estudios controlados muestran efectos electrofisiológicos específicos y resultados mixtos; no justifican promesas de humor, cognición o salud [Schwarz2005; Wahbeh2007; Orozco2020; Orozco2023].

## 19. Ética y consentimiento

La participación es reversible. Consentimiento experimental, contribución agregada, texto libre y futuros estudios con alimentos son decisiones separadas. “Oculto” sólo describe la condición puntual o una repetición, nunca el propósito general. No hay subliminales, ultrasonido, condicionamiento fuera de sesión, cámara, micrófono ni engaño clínico.

## 20. Privacidad

El demo usa IndexedDB y funciona sin cuenta. Exportar, borrar y sincronizar requieren acciones explícitas. La cuenta opcional no implica consentimiento de investigación. El MVP no guarda audio, voz, imágenes personales, historia clínica ni ubicación precisa. Cuando Supabase no está disponible o supera una cuota, el modo local sigue siendo el flujo principal.

## 21. Criterios de refutación

La hipótesis central se considerará no apoyada si la diferencia frente a sham es trivial, cambia de signo entre sesiones, desaparece al ajustar por expectativa, no supera un mapeo espontáneo más simple o requiere instrucciones que revelen la respuesta esperada. También se rechazará una generalización si sólo funciona para una señal exacta y no supera un control de transferencia preespecificado.

## 22. Limitaciones

UMBRAL mide autoinforme y conducta, no gusto periférico, actividad neural ni diagnóstico. Los dispositivos tienen respuestas de frecuencia diferentes. El modo local no garantiza una muestra representativa. La autoselección, el idioma, la familiaridad musical y el aprendizaje de la interfaz pueden sesgar. El MVP todavía no constituye un estudio aprobado por un comité de ética ni recluta participantes para investigación colectiva.

## 23. Resultados negativos y anomalías

Los resultados nulos, abandonos y fallas de protocolo se conservan con el mismo estado de versión que los positivos. Una anomalía no se promociona: se repite con una semilla oculta y un control nuevo. El registro canónico está en `research/negative-results.md`.

## 24. Próximos experimentos

1. Sonido–color preregistrado con repetición oculta y retest a siete días.
2. Fading paramétrico con cuatro intensidades y control de expectativa.
3. Transferencia A2→A1 comparada con señal no apareada.
4. State Gate factorial: silencio × carga visual × instrucción neutral.
5. Anchor seguro con estabilidad como resultado primario y malestar como criterio de parada.

## Referencias y trazabilidad

Las referencias completas están en `research/references.bib`; la clasificación, método, población, resultado, limitación y fecha de verificación están en `research/evidence-matrix.csv`. `research/source-verification.md` registra el alcance de búsqueda y las fuentes oficiales de seguridad y costo. No se usaron blogs de bienestar, contenido comercial ni testimonios como evidencia.

## Cómo citar

UMBRAL contributors (2026). *UMBRAL: An Open, Zero-Cost Platform for Adaptive Auditory-Perceptual Learning Experiments*. Version 0.1-alpha.2. Living protocol and software. AGPL-3.0-only.

## Historial

- 0.1-alpha — arquitectura inicial, seis referencias semilla y protocolo local.
- 0.1-alpha.1 — corrección inicial del motor de audio.
- 0.1-alpha.2 — auditoría de capacidades, cuatro protocolos diferenciados, expectativa por ensayo, chequeo audible, audio procedural ampliado y matriz de evidencia verificada.
