# UMBRAL: An Open, Zero-Cost Platform for Adaptive Auditory-Perceptual Learning Experiments

**Authors:** Lucas (founder and director), Samuel (local possibility engine), open contributors  
**Status:** living open protocol; not peer reviewed  
**Version:** 0.1-alpha  
**Date:** 2026-07-17

> Este documento es un protocolo y paper vivo de investigación abierta. No fue revisado por pares y no demuestra que UMBRAL produzca sabores, recuerdos o tratamientos.

## Abstract

UMBRAL is a browser-based, zero-cost platform for testing whether reproducible procedural auditory signals can acquire stable relationships with perceptual, emotional, bodily, or autobiographical targets. It uses sham, omission, transfer, fading, delayed retest, and expectation measures. The central hypothesis is explicitly falsifiable.

## Explicación simple

Emparejamos un sonido nuevo con una experiencia simple. Retiramos una parte y medimos qué, si algo, reaparece. Los controles separan aprendizaje de expectativa, familiaridad, orden y azar.

## Antecedentes y problema

La evidencia disponible sustenta componentes individuales del proyecto, como las asociaciones sonido-sabor, la modificación multisensorial del sabor, la evocación autobiográfica por música, el condicionamiento salival y la representación de gustos imaginados. No demuestra todavía que una firma auditiva pueda generar por sí sola un sabor completo o una experiencia autobiográfica específica.

## Hipótesis y mecanismos posibles

- H1: una señal aprendida producirá una respuesta preespecificada mayor que sham.
- H2: parte de la respuesta sobrevivirá al fading y al retest diferido.
- H3: una segunda señal podrá adquirir una relación mediante la primera.
- Alternativas: demanda, correspondencia espontánea, familiaridad, regresión a la media, azar y sesgo de recuerdo.

## Arquitectura experimental y métodos

Los estímulos se generan localmente desde semillas y genomas versionados. Atlas explora asociaciones; Apprenticeship prueba adquisición y retirada; State Gate manipula preparación; Anchor trabaja sólo con estados seguros elegidos. El audio nunca se almacena si puede reconstruirse.

## Controles y variables

Sham, orden aleatorio, repetición oculta, omisión, no apareamiento, expectativa contradictoria y retest. Variables: respuesta espontánea, similitud, diferencia frente a control, reproducibilidad, confianza, expectativa, intensidad, latencia, habituación y efectos adversos.

## Análisis

Comparaciones preespecificadas contra sham, intervalos bootstrap, curvas individuales y modelos interpretables. Sin imputación primaria de faltantes. Todo análisis exploratorio se etiqueta.

## Seguridad, ética y privacidad

Ganancia conservadora, Stop global, rampas anti-click, consentimiento revocable y separación de consentimientos. Sin trauma, ultrasonido, flashes, subliminales, micrófono, cámara ni engaño sobre el propósito general.

## Limitaciones y criterios de refutación

El navegador no calibra dB SPL reales ni mide actividad neural. La hipótesis se considera no apoyada si el efecto contra sham es trivial, no replica, desaparece al controlar expectativa o se explica por una correspondencia espontánea más simple. UMBRAL debe poder concluir “no encontramos nada”.

## Trabajos relacionados y referencias

Ver `references.bib` y `evidence-matrix.csv`. Cada fuente fue clasificada por lo que sostiene y por lo que no sostiene.

## Próximos experimentos

1. Sonido–color preregistrado con retest a siete días.
2. Fading paramétrico.
3. Transferencia A2→A1.
4. State Gate factorial.
5. Anchor seguro centrado en estabilidad.
