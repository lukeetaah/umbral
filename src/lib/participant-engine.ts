import type { LabId, TrialCondition } from "@/src/lib/protocol-engine";

export type Language = "es" | "en";
export type Localized = { es: string; en: string };
export type ExperienceChoice = { id: string; label: Localized; value?: number };
export type AudioMoment = { seed: number; durationMs: number; sham?: boolean; label?: Localized };

export type ExperienceStep = {
  id: string;
  chapter: Localized;
  title: Localized;
  instruction: Localized;
  discovery: Localized;
  kind: "contrast" | "map" | "match" | "rate" | "attention" | "breath" | "recall" | "omission";
  audio: AudioMoment[];
  choices: ExperienceChoice[];
  hiddenCondition: TrialCondition;
  cue: "A1" | "A2" | "B1" | "control";
  visual: "split" | "orb" | "glyphs" | "grid" | "breath" | "empty";
  plannedSeconds: number;
  correctChoice?: string;
  adaptive?: "follow-preference" | "reinforce-errors" | "follow-state" | "follow-anchor";
};

export type ExperienceResponse = {
  stepId: string;
  choiceId: string;
  value?: number;
  latencyMs: number;
  hiddenCondition: TrialCondition;
  seed: number;
  correct?: boolean;
};

export type PersonalOutcome = {
  headline: Localized;
  finding: Localized;
  evidence: Localized;
  returnReason: Localized;
  primaryLabel: Localized;
  primaryValue: string;
  secondaryLabel: Localized;
  secondaryValue: string;
  score: number;
};

const choice = (id: string, es: string, en: string, value?: number): ExperienceChoice => ({ id, label:{ es, en }, value });
const chapter = (es: string, en: string): Localized => ({ es, en });

export const labExperienceCopy: Record<LabId, {
  name: string;
  promise: Localized;
  description: Localized;
  duration: Localized;
  accent: string;
}> = {
  atlas:{
    name:"Atlas",
    promise:chapter("Descubrí la forma que tienen los sonidos para vos.","Discover the shape sounds have for you."),
    description:chapter("Vas a comparar, ubicar y reconocer sonidos hasta construir un mapa perceptual propio.","Compare, place, and recognize sounds to build your own perceptual map."),
    duration:chapter("≈ 9 min · mapa personal", "≈ 9 min · personal map"),
    accent:"#c7f36a",
  },
  apprenticeship:{
    name:"Apprenticeship",
    promise:chapter("Aprendé una clave y comprobá si realmente quedó.","Learn a cue and check whether it truly stayed."),
    description:chapter("Una asociación aparece, se entrena, se desvanece y vuelve sin aviso.","An association appears, is trained, fades, and returns unannounced."),
    duration:chapter("≈ 8 min · aprendizaje", "≈ 8 min · learning"),
    accent:"#7be3ca",
  },
  state:{
    name:"State Gate",
    promise:chapter("Escuchá cómo el contexto cambia el mismo sonido.","Hear how context changes the same sound."),
    description:chapter("El sonido se mantiene; tu atención y tu ritmo cambian alrededor.","The sound stays the same while your attention and pace change around it."),
    duration:chapter("≈ 10 min · comparación", "≈ 10 min · comparison"),
    accent:"#f4b86a",
  },
  anchor:{
    name:"Anchor",
    promise:chapter("Construí una señal breve para una sensación segura.","Build a brief cue for a safe feeling."),
    description:chapter("Elegís una cualidad cómoda, la asociás con un sonido y después la reevaluás sin forzar nada.","Choose a comfortable quality, pair it with a sound, then reassess it without forcing anything."),
    duration:chapter("≈ 10 min · señal segura", "≈ 10 min · safe cue"),
    accent:"#c6a7ff",
  },
};

export const experiencePlans: Record<LabId, ExperienceStep[]> = {
  atlas:[
    {id:"atlas-contrast",chapter:chapter("01 · OÍ LA DIFERENCIA","01 · HEAR THE DIFFERENCE"),title:chapter("Dos sonidos, dos lugares","Two sounds, two places"),instruction:chapter("Escuchá el par completo. Elegí cuál te atrae más; no hay respuesta correcta.","Hear the whole pair. Choose which pulls you more; there is no correct answer."),discovery:chapter("Tu elección ya cambió el recorrido: ahora vamos a explorar alrededor de ese sonido.","Your choice already changed the path: now we will explore around that sound."),kind:"contrast",audio:[{seed:11031,durationMs:5200,label:chapter("A","A")},{seed:77241,durationMs:5200,label:chapter("B","B")}],choices:[choice("a","El primero","The first"),choice("b","El segundo","The second"),choice("apart","Me llevaron a lugares distintos","They took me to different places")],hiddenCondition:"baseline",cue:"A1",visual:"split",plannedSeconds:55,adaptive:"follow-preference"},
    {id:"atlas-temperature",chapter:chapter("02 · UBICÁ","02 · PLACE"),title:chapter("¿De qué lado cae?","Which side does it fall on?"),instruction:chapter("Escuchá el sonido elegido transformarse. Ubicalo por sensación, no por análisis.","Hear the chosen sound transform. Place it by feel, not analysis."),discovery:chapter("Las correspondencias no vienen en el sonido: aparecen en tu manera de organizarlo.","The correspondence is not inside the sound; it appears in how you organize it."),kind:"map",audio:[{seed:11032,durationMs:6500}],choices:[choice("warm","Más cálido","Warmer"),choice("cool","Más frío","Cooler"),choice("neutral","En el medio","In between")],hiddenCondition:"paired",cue:"A1",visual:"orb",plannedSeconds:65,adaptive:"follow-preference"},
    {id:"atlas-shape",chapter:chapter("03 · DALE FORMA","03 · GIVE IT SHAPE"),title:chapter("Ahora, sin palabras","Now, without words"),instruction:chapter("El mismo territorio, otro contraste. Elegí la forma que aparece primero.","The same territory, another contrast. Choose the shape that appears first."),discovery:chapter("Tu mapa empieza a tener dos coordenadas: temperatura y forma.","Your map now has two coordinates: temperature and shape."),kind:"map",audio:[{seed:11033,durationMs:6500}],choices:[choice("round","Redondo","Round"),choice("sharp","Angular","Angular"),choice("moving","En movimiento","Moving")],hiddenCondition:"paired",cue:"A1",visual:"glyphs",plannedSeconds:65,adaptive:"follow-preference"},
    {id:"atlas-control",chapter:chapter("04 · CAMBIO DE ESCALA","04 · CHANGE SCALE"),title:chapter("¿Cuánto necesitás oír?","How much do you need to hear?"),instruction:chapter("Escuchá una versión mínima. Decí si todavía pertenece al mismo lugar.","Hear a minimal version. Say whether it still belongs to the same place."),discovery:chapter("UMBRAL encontró el borde de tu categoría y ajustó la siguiente comparación.","UMBRAL found the edge of your category and adjusted the next comparison."),kind:"recall",audio:[{seed:11031,durationMs:4200}],choices:[choice("same","Es del mismo lugar","Same place"),choice("different","Es otro lugar","Different place"),choice("unsure","No estoy seguro","Not sure")],hiddenCondition:"repetition",cue:"A1",visual:"orb",plannedSeconds:60,adaptive:"follow-preference"},
    {id:"atlas-omission",chapter:chapter("05 · EL BORDE","05 · THE EDGE"),title:chapter("Escuchá también lo que falta","Listen to what is missing, too"),instruction:chapter("El fragmento puede sentirse completo o cortado. Elegí lo primero que notes.","The fragment may feel complete or cut off. Choose what you notice first."),discovery:chapter("Una ausencia también puede formar parte de un patrón perceptual.","An absence can also become part of a perceptual pattern."),kind:"omission",audio:[{seed:11031,durationMs:3600},{seed:99117,durationMs:2800,sham:true}],choices:[choice("missing","Sentí que faltó algo","Something felt missing"),choice("complete","Se sintió completo","It felt complete"),choice("none","No apareció nada claro","Nothing clear appeared")],hiddenCondition:"omission",cue:"A1",visual:"empty",plannedSeconds:65},
    {id:"atlas-return",chapter:chapter("06 · SIN AVISO","06 · UNANNOUNCED"),title:chapter("¿Este sonido ya estuvo acá?","Has this sound been here before?"),instruction:chapter("No busques recordar: escuchá y respondé rápido.","Do not try to remember; listen and answer quickly."),discovery:chapter("La prueba final no mide memoria perfecta: comprueba si tu mapa dejó una huella reconocible.","The final test is not perfect memory; it checks whether your map left a recognizable trace."),kind:"recall",audio:[{seed:11031,durationMs:5600}],choices:[choice("known","Sí, volvió","Yes, it returned"),choice("new","No, es nuevo","No, it is new"),choice("familiar","No sé, pero resulta familiar","Not sure, but familiar")],hiddenCondition:"repetition",cue:"A1",visual:"orb",plannedSeconds:70,correctChoice:"known",adaptive:"follow-preference"},
  ],
  apprenticeship:[
    {id:"app-pair",chapter:chapter("01 · CONOCÉ LA CLAVE","01 · MEET THE CUE"),title:chapter("Este sonido pertenece a esta figura","This sound belongs to this figure"),instruction:chapter("Mirá y escuchá. No memorices a la fuerza: dejá que ocurran juntos.","Look and listen. Do not force memorization; let them happen together."),discovery:chapter("La asociación ya tuvo su primera exposición. Ahora va a volverse activa.","The association had its first exposure. Now it becomes active."),kind:"match",audio:[{seed:33031,durationMs:6500}],choices:[choice("ready","Lo capté","Got it")],hiddenCondition:"paired",cue:"A1",visual:"glyphs",plannedSeconds:55,correctChoice:"ready"},
    {id:"app-contrast",chapter:chapter("02 · DISTINGUÍ","02 · DISTINGUISH"),title:chapter("Encontrá la clave","Find the cue"),instruction:chapter("Vas a oír dos sonidos. Elegí cuál pertenecía a la figura.","You will hear two sounds. Choose which belonged to the figure."),discovery:chapter("Tu respuesta regula cuánto apoyo visual tendrá el próximo entrenamiento.","Your answer controls how much visual support the next training gets."),kind:"contrast",audio:[{seed:33031,durationMs:4800,label:chapter("A","A")},{seed:88019,durationMs:4800,label:chapter("B","B")}],choices:[choice("a","A","A"),choice("b","B","B")],hiddenCondition:"repetition",cue:"A1",visual:"split",plannedSeconds:65,correctChoice:"a",adaptive:"reinforce-errors"},
    {id:"app-fade",chapter:chapter("03 · MENOS AYUDA","03 · LESS HELP"),title:chapter("La figura empieza a irse","The figure begins to fade"),instruction:chapter("Escuchá con una pista visual más débil y elegí la figura asociada.","Listen with a weaker visual cue and choose the associated figure."),discovery:chapter("Aprender no es repetir sin fin: es sostener la relación cuando desaparece la ayuda.","Learning is not endless repetition; it is holding the relation as support disappears."),kind:"match",audio:[{seed:33031,durationMs:6200}],choices:[choice("diamond","Rombo luminoso","Bright diamond"),choice("circle","Círculo hueco","Hollow circle"),choice("waves","Tres ondas","Three waves")],hiddenCondition:"paired",cue:"A1",visual:"glyphs",plannedSeconds:70,correctChoice:"diamond",adaptive:"reinforce-errors"},
    {id:"app-transfer",chapter:chapter("04 · CAMBIA LA VOZ","04 · CHANGE THE VOICE"),title:chapter("¿La clave sobrevive al cambio?","Does the cue survive change?"),instruction:chapter("El timbre cambió, pero una parte de la estructura sigue igual.","The timbre changed, but part of the structure remains."),discovery:chapter("Reconocer una regla en una voz nueva es transferencia, no simple repetición.","Recognizing a rule in a new voice is transfer, not mere repetition."),kind:"match",audio:[{seed:33032,durationMs:6500}],choices:[choice("diamond","Sigue siendo el rombo","Still the diamond"),choice("other","Ahora es otra figura","Now another figure"),choice("unsure","No estoy seguro","Not sure")],hiddenCondition:"transfer",cue:"B1",visual:"glyphs",plannedSeconds:70,correctChoice:"diamond"},
    {id:"app-gap",chapter:chapter("05 · SIN LA RESPUESTA","05 · WITHOUT THE ANSWER"),title:chapter("Completalo por dentro","Complete it internally"),instruction:chapter("La secuencia se interrumpe. Elegí si tu mente anticipó la figura.","The sequence is interrupted. Choose whether your mind anticipated the figure."),discovery:chapter("La expectativa aprendida puede aparecer incluso cuando falta la señal esperada.","A learned expectation can appear even when the expected signal is missing."),kind:"omission",audio:[{seed:33031,durationMs:3600},{seed:44014,durationMs:3200,sham:true}],choices:[choice("appeared","La figura apareció igual","The figure appeared anyway"),choice("no","No apareció","It did not appear"),choice("late","Apareció después","It appeared later")],hiddenCondition:"omission",cue:"A1",visual:"empty",plannedSeconds:65},
    {id:"app-surprise",chapter:chapter("06 · PRUEBA SIN PISTAS","06 · TEST WITHOUT CLUES"),title:chapter("Una sola escucha","One listen"),instruction:chapter("Sin figura, sin corrección inmediata. Elegí la asociación que quedó.","No figure, no immediate correction. Choose the association that remained."),discovery:chapter("La prueba final separa familiaridad de aprendizaje comprobable.","The final test separates familiarity from demonstrable learning."),kind:"recall",audio:[{seed:33031,durationMs:6200}],choices:[choice("diamond","Rombo luminoso","Bright diamond"),choice("circle","Círculo hueco","Hollow circle"),choice("waves","Tres ondas","Three waves")],hiddenCondition:"repetition",cue:"A1",visual:"empty",plannedSeconds:75,correctChoice:"diamond"},
  ],
  state:[
    {id:"state-baseline",chapter:chapter("01 · LÍNEA DE BASE","01 · BASELINE"),title:chapter("Escuchalo sin hacer nada más","Hear it with nothing else to do"),instruction:chapter("Dejá que termine y marcá hacia dónde te movió.","Let it finish and mark where it moved you."),discovery:chapter("Este es tu punto de comparación, no un diagnóstico.","This is your comparison point, not a diagnosis."),kind:"rate",audio:[{seed:55191,durationMs:7200}],choices:[choice("1","Más calma","Calmer",1),choice("3","Casi igual","Almost the same",3),choice("5","Más activa","More activated",5)],hiddenCondition:"baseline",cue:"A1",visual:"orb",plannedSeconds:60},
    {id:"state-settle",chapter:chapter("02 · BAJÁ EL RITMO","02 · SLOW DOWN"),title:chapter("Tres respiraciones cómodas","Three comfortable breaths"),instruction:chapter("SeguÍ el círculo sin respirar profundo ni forzar el ritmo.","Follow the circle without deep breathing or forcing the pace."),discovery:chapter("El contexto ya cambió antes de repetir el sonido.","The context changed before the sound repeated."),kind:"breath",audio:[{seed:55192,durationMs:8000}],choices:[choice("done","Listo","Done")],hiddenCondition:"preparation",cue:"control",visual:"breath",plannedSeconds:75},
    {id:"state-calm",chapter:chapter("03 · MISMO SONIDO","03 · SAME SOUND"),title:chapter("Ahora desde otro ritmo","Now from another pace"),instruction:chapter("Es exactamente la misma firma sonora de la línea de base.","It is exactly the same sound signature as the baseline."),discovery:chapter("La señal fue constante; cualquier diferencia pertenece a la interacción con el momento.","The signal stayed constant; any difference belongs to its interaction with the moment."),kind:"rate",audio:[{seed:55191,durationMs:7200}],choices:[choice("1","Más calma","Calmer",1),choice("3","Casi igual","Almost the same",3),choice("5","Más activa","More activated",5)],hiddenCondition:"repetition",cue:"A1",visual:"orb",plannedSeconds:65,adaptive:"follow-state"},
    {id:"state-load",chapter:chapter("04 · ATENCIÓN OCUPADA","04 · BUSY ATTENTION"),title:chapter("Seguí los puntos verdes","Track the green dots"),instruction:chapter("Durante el sonido, contá cuántas veces cambia la esquina iluminada.","During the sound, count how often the lit corner changes."),discovery:chapter("La carga visual compite por atención sin cambiar el sonido.","Visual load competes for attention without changing the sound."),kind:"attention",audio:[{seed:55191,durationMs:8000}],choices:[choice("3","3 cambios","3 changes"),choice("4","4 cambios","4 changes"),choice("5","5 cambios","5 changes")],hiddenCondition:"paired",cue:"A1",visual:"grid",plannedSeconds:90,correctChoice:"4"},
    {id:"state-loaded",chapter:chapter("05 · RESPUESTA BAJO CARGA","05 · RESPONSE UNDER LOAD"),title:chapter("¿Cómo llegó esta vez?","How did it land this time?"),instruction:chapter("No evalúes tu desempeño. Marcá sólo el efecto del mismo sonido.","Do not evaluate performance. Mark only the effect of the same sound."),discovery:chapter("UMBRAL ya puede comparar calma, repetición y atención ocupada dentro de una misma sesión.","UMBRAL can now compare calm, repetition, and busy attention within one session."),kind:"rate",audio:[{seed:55191,durationMs:7200}],choices:[choice("1","Más calma","Calmer",1),choice("3","Casi igual","Almost the same",3),choice("5","Más activa","More activated",5)],hiddenCondition:"repetition",cue:"A1",visual:"grid",plannedSeconds:65,adaptive:"follow-state"},
    {id:"state-surprise",chapter:chapter("06 · VUELTA AL CENTRO","06 · BACK TO CENTER"),title:chapter("Una última vez, sin tarea","One last time, no task"),instruction:chapter("Escuchá sin intentar repetir ninguna respuesta anterior.","Listen without trying to repeat any earlier answer."),discovery:chapter("La última escucha comprueba si el cambio era momentáneo o persistió al retirar el contexto.","The last listen checks whether the change was momentary or persisted after context was removed."),kind:"rate",audio:[{seed:55191,durationMs:7200}],choices:[choice("1","Más calma","Calmer",1),choice("3","Casi igual","Almost the same",3),choice("5","Más activa","More activated",5)],hiddenCondition:"repetition",cue:"A1",visual:"orb",plannedSeconds:75},
  ],
  anchor:[
    {id:"anchor-baseline",chapter:chapter("01 · PUNTO DE PARTIDA","01 · STARTING POINT"),title:chapter("Traé una sensación apenas cómoda","Bring up a mildly comfortable feeling"),instruction:chapter("No busques intensidad. Marcá cuánto está disponible ahora.","Do not seek intensity. Mark how available it feels now."),discovery:chapter("La línea de base evita confundir deseo con cambio.","The baseline keeps desire from being mistaken for change."),kind:"rate",audio:[{seed:70001,durationMs:3000,sham:true}],choices:[choice("1","Apenas","Barely",1),choice("3","Algo","Somewhat",3),choice("5","Clara","Clear",5)],hiddenCondition:"baseline",cue:"control",visual:"breath",plannedSeconds:65},
    {id:"anchor-pair",chapter:chapter("02 · CONSTRUÍ LA SEÑAL","02 · BUILD THE CUE"),title:chapter("Respiración cómoda + firma sonora","Comfortable breath + sound signature"),instruction:chapter("Seguí cuatro ciclos. Si algo incomoda, detené el audio: no hay premio por aguantar.","Follow four cycles. If anything feels uncomfortable, stop: there is no reward for enduring it."),discovery:chapter("La señal quedó asociada varias veces a un estado elegido y seguro.","The cue was paired several times with a chosen safe state."),kind:"breath",audio:[{seed:74021,durationMs:8000},{seed:74021,durationMs:8000},{seed:74021,durationMs:8000}],choices:[choice("ready","Continuar","Continue")],hiddenCondition:"paired",cue:"A1",visual:"breath",plannedSeconds:110,adaptive:"follow-anchor"},
    {id:"anchor-fade",chapter:chapter("03 · RETIRÁ LA AYUDA","03 · REMOVE SUPPORT"),title:chapter("Ahora el sonido guía menos","Now the sound guides less"),instruction:chapter("La imagen se desvanece. Observá si la cualidad sigue disponible.","The image fades. Notice whether the quality remains available."),discovery:chapter("Una señal útil necesita sobrevivir cuando retiramos parte del apoyo.","A useful cue needs to survive as part of the support is removed."),kind:"breath",audio:[{seed:74021,durationMs:7200},{seed:74021,durationMs:5200}],choices:[choice("yes","Siguió presente","It stayed present"),choice("less","Se debilitó","It weakened"),choice("no","No apareció","It did not appear")],hiddenCondition:"paired",cue:"A1",visual:"breath",plannedSeconds:85},
    {id:"anchor-break",chapter:chapter("04 · INTERRUPCIÓN","04 · INTERRUPTION"),title:chapter("Cambiamos de señal","We change the cue"),instruction:chapter("Escuchá un sonido neutral y dejá ir la asociación anterior.","Hear a neutral sound and let the previous association go."),discovery:chapter("La interrupción reduce el efecto de simple continuidad.","The interruption reduces the effect of simple continuity."),kind:"contrast",audio:[{seed:90217,durationMs:6500}],choices:[choice("done","Listo","Done")],hiddenCondition:"sham",cue:"control",visual:"split",plannedSeconds:60},
    {id:"anchor-surprise",chapter:chapter("05 · SÓLO LA FIRMA","05 · CUE ONLY"),title:chapter("Sin respiración guiada ni imagen","No guided breath or image"),instruction:chapter("Escuchá una vez y marcá cuánto volvió la cualidad elegida.","Listen once and mark how much the chosen quality returned."),discovery:chapter("Esta es la prueba importante: la señal sola, después de una interrupción.","This is the important test: the cue alone, after an interruption."),kind:"rate",audio:[{seed:74021,durationMs:7200}],choices:[choice("1","Apenas","Barely",1),choice("3","Algo","Somewhat",3),choice("5","Clara","Clear",5)],hiddenCondition:"omission",cue:"A1",visual:"empty",plannedSeconds:75,adaptive:"follow-anchor"},
    {id:"anchor-control",chapter:chapter("06 · CONTROL DE SEGURIDAD","06 · SAFETY CHECK"),title:chapter("¿Cómo estás ahora?","How are you now?"),instruction:chapter("No evalúes si “funcionó”. Elegí la opción honesta.","Do not judge whether it 'worked.' Choose the honest option."),discovery:chapter("La seguridad tiene prioridad sobre cualquier efecto. Esta respuesta también adapta futuras sesiones.","Safety takes priority over any effect. This answer also adapts future sessions."),kind:"rate",audio:[{seed:74022,durationMs:4200}],choices:[choice("comfortable","Cómodo/a","Comfortable"),choice("neutral","Neutral","Neutral"),choice("stop","Prefiero parar acá","I prefer to stop here")],hiddenCondition:"sham",cue:"control",visual:"orb",plannedSeconds:70},
  ],
};

export function localize(value: Localized, language: Language) { return value[language]; }

export function resolveStep(step: ExperienceStep, responses: ExperienceResponse[], preferredSeeds: number[] = []): ExperienceStep {
  if (!step.adaptive) return step;
  const first = responses[0]?.choiceId;
  const learnedSeed = preferredSeeds[0];
  const offset = first === "b" ? 6610 : first === "apart" ? 3310 : 0;
  const errorCount = responses.filter(response => response.correct === false).length;
  const stateValue = responses.toReversed().find(response => typeof response.value === "number")?.value ?? 3;
  const anchorValue = responses.find(response => response.stepId === "anchor-baseline")?.value ?? 3;
  return {
    ...step,
    audio:step.audio.map((moment, index) => ({
      ...moment,
      seed:index === 0 && Number.isInteger(learnedSeed) ? learnedSeed : moment.seed + offset + (step.adaptive === "reinforce-errors" ? errorCount * 17 : 0),
      durationMs:step.adaptive === "follow-state" && stateValue >= 5 ? Math.max(4200,moment.durationMs-900) : step.adaptive === "follow-anchor" && anchorValue <= 1 ? Math.min(8000,moment.durationMs+700) : moment.durationMs,
    })),
  };
}

export function buildOutcome(lab: LabId, responses: ExperienceResponse[], language: Language): PersonalOutcome {
  const get = (id: string) => responses.find(response => response.stepId === id);
  const accuracy = responses.filter(response => response.correct !== undefined);
  const correct = accuracy.filter(response => response.correct).length;
  const percent = accuracy.length ? Math.round(correct / accuracy.length * 100) : 0;

  if (lab === "apprenticeship") {
    const surprise = get("app-surprise")?.correct === true;
    return {headline:chapter(surprise?"La asociación quedó disponible sin pistas.":"La asociación apareció, pero todavía necesita apoyo.",surprise?"The association remained available without cues.":"The association appeared, but still needs support."),finding:chapter(surprise?"Reconociste el rombo luminoso cuando volvió únicamente el sonido.":"El entrenamiento produjo familiaridad, aunque la prueba sin imagen todavía no fue estable.",surprise?"You recognized the bright diamond when only the sound returned.":"Training produced familiarity, though the image-free test was not yet stable."),evidence:chapter(`${correct} de ${accuracy.length} decisiones coincidieron con la clave entrenada.`,`${correct} of ${accuracy.length} choices matched the trained cue.`),returnReason:chapter("Volver otro día permite comprobar si la asociación se consolidó sin seguir entrenándola ahora.","Returning another day checks whether the association consolidated without more training now."),primaryLabel:chapter("RETENCIÓN","RETENTION"),primaryValue:`${percent}%`,secondaryLabel:chapter("PRUEBA FINAL","FINAL TEST"),secondaryValue:surprise?"RECONOCIDA":"INCIERTA",score:percent};
  }
  if (lab === "state") {
    const baseline=get("state-baseline")?.value??3; const calm=get("state-calm")?.value??3; const loaded=get("state-loaded")?.value??3; const final=get("state-surprise")?.value??3;
    const spread=Math.max(baseline,calm,loaded,final)-Math.min(baseline,calm,loaded,final);
    return {headline:chapter(spread>=2?"El mismo sonido cambió con tu contexto.":"Tu respuesta se mantuvo bastante estable.",spread>=2?"The same sound changed with your context.":"Your response stayed fairly stable."),finding:chapter(`En calma marcaste ${calm}/5; con la atención ocupada, ${loaded}/5; al final, ${final}/5.`,`Calm: ${calm}/5; busy attention: ${loaded}/5; final: ${final}/5.`),evidence:chapter(`La señal fue idéntica en las comparaciones. El rango personal fue de ${spread} puntos.`,`The cue was identical across comparisons. Your personal range was ${spread} points.`),returnReason:chapter("Repetir en otro día permite distinguir un patrón de estado de una variación momentánea.","Repeating on another day separates a state pattern from momentary variation."),primaryLabel:chapter("CAMBIO POR CONTEXTO","CONTEXT CHANGE"),primaryValue:`${spread}/4`,secondaryLabel:chapter("VUELTA AL CENTRO","RETURN TO CENTER"),secondaryValue:`${final}/5`,score:Math.min(100,spread*25)};
  }
  if (lab === "anchor") {
    const baseline=get("anchor-baseline")?.value??3; const recall=get("anchor-surprise")?.value??3; const delta=recall-baseline; const safe=get("anchor-control")?.choiceId!=="stop";
    return {headline:chapter(delta>0?"La señal recuperó parte de la cualidad elegida.":"La señal todavía no se separó de tu punto de partida.",delta>0?"The cue recovered part of the chosen quality.":"The cue has not separated from baseline yet."),finding:chapter(`Empezaste en ${baseline}/5 y la firma sola llegó a ${recall}/5 después de retirar la guía.`,`You started at ${baseline}/5 and the cue alone reached ${recall}/5 after guidance was removed.`),evidence:chapter(safe?"Terminaste cómodo/a o neutral. No se registró una señal para forzar ni intensificar.":"Elegiste detenerte; UMBRAL conserva ese límite para no repetir esta ruta.",safe?"You finished comfortable or neutral. No cue was stored to force or intensify anything.":"You chose to stop; UMBRAL keeps that boundary and will not repeat this path."),returnReason:chapter(delta>0?"Otro día podemos comprobar si la señal sigue disponible sin reentrenarla de inmediato.":"Otro día puede explorarse otra firma o confirmar que esta no aporta.",delta>0?"Another day can test whether the cue remains available without immediate retraining.":"Another day can explore a different cue or confirm this one adds nothing."),primaryLabel:chapter("CAMBIO","CHANGE"),primaryValue:`${delta>0?"+":""}${delta}`,secondaryLabel:chapter("SEÑAL SOLA","CUE ALONE"),secondaryValue:`${recall}/5`,score:Math.max(0,Math.min(100,50+delta*25))};
  }
  const returned=get("atlas-return")?.choiceId; const recognized=returned==="known"||returned==="familiar"; const temp=get("atlas-temperature")?.choiceId??"neutral"; const shape=get("atlas-shape")?.choiceId??"moving";
  const tempText:Record<string,Localized>={warm:chapter("cálido","warm"),cool:chapter("frío","cool"),neutral:chapter("intermedio","in-between")};
  const shapeText:Record<string,Localized>={round:chapter("redondo","round"),sharp:chapter("angular","angular"),moving:chapter("en movimiento","moving")};
  return {headline:chapter(recognized?"Tu mapa dejó una huella reconocible.":"Tu mapa apareció, aunque el regreso no fue concluyente.",recognized?"Your map left a recognizable trace.":"Your map appeared, though the return was inconclusive."),finding:chapter(`El territorio elegido fue ${tempText[temp]?.es??"intermedio"} y ${shapeText[shape]?.es??"en movimiento"}.`, `Your chosen territory was ${tempText[temp]?.en??"in-between"} and ${shapeText[shape]?.en??"moving"}.`),evidence:chapter(recognized?"El sonido inicial volvió sin anuncio y te resultó conocido o familiar.":"El sonido inicial volvió sin anuncio y lo marcaste como nuevo.",recognized?"The initial sound returned unannounced and felt known or familiar.":"The initial sound returned unannounced and you marked it as new."),returnReason:chapter("Volver permite comprobar si estas coordenadas se repiten o si tu mapa cambia con el día.","Returning checks whether these coordinates repeat or whether your map changes with the day."),primaryLabel:chapter("RECONOCIMIENTO","RECOGNITION"),primaryValue:recognized?"SÍ":"INCIERTO",secondaryLabel:chapter("COORDENADAS","COORDINATES"),secondaryValue:`${localize(tempText[temp]??tempText.neutral,language)} · ${localize(shapeText[shape]??shapeText.moving,language)}`,score:recognized?82:48};
}

export function plannedMinutes(lab: LabId) {
  const steps = experiencePlans[lab];
  const guidedSeconds = steps.reduce((sum, step) => sum + step.plannedSeconds, 0);
  // Includes a conservative 25 s per chapter for reading, choosing and receiving feedback.
  return Math.round((guidedSeconds + steps.length * 25) / 60);
}
