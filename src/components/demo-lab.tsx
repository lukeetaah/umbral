"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { UmbralAudioEngine } from "@/src/lib/audio/engine";
import { buildProtocol, type LabId, type TrialPlan } from "@/src/lib/protocol-engine";
import { genomeFromSeed, hashGenome } from "@/src/lib/stimulus-genome";
import { clearLocal, exportLocal, saveLocal } from "@/src/lib/local-store";
import { decide } from "@/src/lib/possibility-engine";
import { syncLocalSessions } from "@/src/lib/supabase/sync";

type Stage = "intro" | "calibrate" | "ready" | "run" | "respond" | "result";
type Language = "es" | "en";
type OutputSupport = "checking" | "selectable" | "default-only";

const labCopy: Record<LabId, Record<Language, {name:string;question:string;detail:string}>> = {
  atlas:{
    es:{name:"Atlas",question:"¿Un sonido te hace pensar en algo?",detail:"Escuchás sonidos cortos y contás si apareció un color, una forma, un recuerdo o nada."},
    en:{name:"Atlas",question:"Does a sound make you think of anything?",detail:"You hear short sounds and report whether a color, shape, memory, or nothing appeared."},
  },
  apprenticeship:{
    es:{name:"Apprenticeship",question:"¿Un sonido puede hacerte recordar una imagen?",detail:"Primero ves y escuchás dos cosas juntas. Después quitamos una y preguntamos qué quedó."},
    en:{name:"Apprenticeship",question:"Can a sound bring an image back?",detail:"First you see and hear two things together. Then we remove one and ask what remained."},
  },
  state:{
    es:{name:"State Gate",question:"¿Respondés distinto según cómo llegás?",detail:"Comparamos el mismo sonido en momentos tranquilos y con una tarea visual."},
    en:{name:"State Gate",question:"Do you respond differently depending on your state?",detail:"We compare the same sound in calm moments and while doing a visual task."},
  },
  anchor:{
    es:{name:"Anchor",question:"¿Un sonido puede ayudarte a recordar una sensación segura?",detail:"Elegís una sensación cómoda y probamos si el sonido ayuda a traerla de vuelta. Nunca usamos trauma."},
    en:{name:"Anchor",question:"Can a sound help recall a safe feeling?",detail:"You choose a comfortable feeling and we test whether the sound helps bring it back. We never use trauma."},
  },
};

const copy = {
  es:{
    local:"MODO LOCAL", title:"Laboratorio de sonidos", privacy:"Tus respuestas quedan guardadas solamente en este dispositivo.",
    labQuestion:"QUÉ VAS A PROBAR", consent:"Entiendo que puedo parar cuando quiera y voy a usar un volumen cómodo.", start:"Seguir: probar sonido", safeTitle:"Elegí una sensación segura", safeText:"Elegí algo simple y cómodo. No uses trauma ni recuerdos íntimos.",
    outputStep:"PASO 1", outputTitle:"Elegí dónde querés escuchar", outputText:"Podés usar auriculares, parlantes o la salida predeterminada de tu equipo.", chooseOutput:"Elegir parlante o auriculares", choosingOutput:"Abriendo salidas…", outputDefault:"Tu navegador usará la salida predeterminada del sistema.", outputChecking:"Comprobando si el navegador permite elegir…", outputSelected:"Salida elegida", outputCancelled:"No se cambió la salida. Podés volver a intentarlo o usar la predeterminada.",
    calibration:"PASO 2 · PRUEBA DE AUDIO", calibrationTitle:"Probemos si se escucha", calibrationText:"Dejá el volumen en un nivel cómodo y tocá el botón. Vas a oír un tono corto.", testAudio:"Probar sonido", heard:"Sí, lo escuché", unheard:"No se escucha", troubleshoot:"1. Revisá que la pestaña no esté silenciada. 2. Cambiá la salida arriba o desde tu sistema. 3. Subí apenas el volumen y probá de nuevo.", changeOutput:"Cambiar parlante o auriculares", continue:"Empezar",
    before:"ANTES DE ESCUCHAR", readyTitle:"Contá lo que notes, aunque sea nada", readyText:"Algunas pruebas tienen sonido y otras no. Eso nos permite comparar sin adivinar.", listen:"Iniciar prueba", preparing:"Esperá un momento…", listening:"Escuchando…", stopRespond:"Detener y responder",
    respondFirst:"TU RESPUESTA", happened:"¿Notaste algo?", yes:"Sí, noté algo", no:"No noté nada", kind:"¿Qué fue?", confidence:"¿Qué tan seguro estás?", expectation:"Antes de escuchar, ¿esperabas que apareciera algo?", note:"Podés describirlo, sin incluir datos íntimos", save:"Guardar y continuar",
    resultLabel:"RESULTADO LOCAL", resultTitle:"Una sesión no alcanza para concluir.", resultText:"Completaste una secuencia con controles, omisiones o repeticiones según el laboratorio. UMBRAL guarda las respuestas; no fabrica un puntaje de precisión con una sola sesión. El siguiente paso válido es un retest preregistrado.", export:"Exportar JSON", restart:"Reiniciar laboratorio",
    exportAll:"Exportar todos los datos locales", sync:"Sincronizar copia privada (opcional)", discomfort:"Registrar malestar y detener", erase:"Eliminar completamente y reiniciar", signalError:"No se pudo iniciar el audio.",
  },
  en:{
    local:"LOCAL MODE", title:"Sound laboratory", privacy:"Your answers are stored only on this device.",
    labQuestion:"WHAT YOU WILL TEST", consent:"I understand I can stop at any time and will keep the volume comfortable.", start:"Continue: test sound", safeTitle:"Choose a safe feeling", safeText:"Choose something simple and comfortable. Do not use trauma or intimate memories.",
    outputStep:"STEP 1", outputTitle:"Choose where you want to listen", outputText:"You can use headphones, speakers, or your computer's default output.", chooseOutput:"Choose speaker or headphones", choosingOutput:"Opening outputs…", outputDefault:"Your browser will use the system's default output.", outputChecking:"Checking whether this browser can choose an output…", outputSelected:"Selected output", outputCancelled:"The output was not changed. You can try again or use the default.",
    calibration:"STEP 2 · AUDIO TEST", calibrationTitle:"Let's make sure you can hear it", calibrationText:"Keep the volume comfortable and press the button. You will hear a short tone.", testAudio:"Test sound", heard:"Yes, I heard it", unheard:"I cannot hear it", troubleshoot:"1. Check that the tab is not muted. 2. Change the output above or in your system settings. 3. Raise the volume slightly and try again.", changeOutput:"Change speaker or headphones", continue:"Start",
    before:"BEFORE YOU LISTEN", readyTitle:"Report what you notice, even if it is nothing", readyText:"Some tests have sound and others do not. That lets us compare without guessing.", listen:"Start test", preparing:"Wait a moment…", listening:"Listening…", stopRespond:"Stop and respond",
    respondFirst:"YOUR ANSWER", happened:"Did you notice anything?", yes:"Yes, I noticed something", no:"I noticed nothing", kind:"What was it?", confidence:"How sure are you?", expectation:"Before listening, did you expect anything to appear?", note:"You can describe it without including intimate data", save:"Save and continue",
    resultLabel:"LOCAL RESULT", resultTitle:"One session is not enough to conclude.", resultText:"You completed a sequence with controls, omissions, or repetitions depending on the laboratory. UMBRAL stores responses; it does not invent a precision score from one session. The next valid step is a preregistered retest.", export:"Export JSON", restart:"Restart laboratory",
    exportAll:"Export all local data", sync:"Sync private copy (optional)", discomfort:"Record discomfort and stop", erase:"Erase completely and restart", signalError:"Audio could not be started.",
  },
} as const;

const responseOptions = [
  ["otra","No sé / otra cosa","I do not know / something else"], ["reconocimiento","Reconocimiento","Recognition"],
  ["expectativa","Expectativa","Expectation"], ["imagen","Imagen mental","Mental image"], ["recuerdo","Recuerdo","Memory"],
  ["color","Color","Color"], ["forma","Forma","Shape"], ["textura","Textura","Texture"],
  ["temperatura","Temperatura","Temperature"], ["movimiento","Movimiento","Movement"],
  ["cuerpo","Estado corporal","Body state"], ["emocion","Emoción","Emotion"], ["percepcion","Percepción definida","Defined perception"],
] as const;

const safeQualities = [["seguridad","Seguridad","Safety"],["calidez","Calidez","Warmth"],["pertenencia","Pertenencia","Belonging"],["alivio","Alivio","Relief"],["curiosidad","Curiosidad","Curiosity"],["ternura","Ternura","Tenderness"],["amplitud","Amplitud","Spaciousness"]] as const;

export function DemoLab() {
  const [lab,setLab] = useState<LabId>("atlas");
  const [stage,setStage] = useState<Stage>("intro");
  const [trialIndex,setTrialIndex] = useState(0);
  const [occurred,setOccurred] = useState<boolean|null>(null);
  const [category,setCategory] = useState("otra");
  const [confidence,setConfidence] = useState(50);
  const [expectation,setExpectation] = useState(50);
  const [note,setNote] = useState("");
  const [message,setMessage] = useState("");
  const [consent,setConsent] = useState(false);
  const [calibrationPlayed,setCalibrationPlayed] = useState(false);
  const [heardCalibration,setHeardCalibration] = useState<boolean|null>(null);
  const [runPhase,setRunPhase] = useState<"prepare"|"listen">("listen");
  const [anchorQuality,setAnchorQuality] = useState("seguridad");
  const [lang,setLang] = useState<Language>("es");
  const [outputSupport,setOutputSupport] = useState<OutputSupport>("checking");
  const [outputBusy,setOutputBusy] = useState(false);
  const [outputLabel,setOutputLabel] = useState("");
  const [outputMessage,setOutputMessage] = useState("");
  const engine = useRef<UmbralAudioEngine|null>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const runToken = useRef(0);
  const stageRef = useRef<Stage>(stage);
  const protocol = useMemo(() => buildProtocol(41027, 8, lab), [lab]);
  const trial: TrialPlan = protocol[trialIndex] ?? protocol[0];
  const genome = useMemo(() => genomeFromSeed(trial.seed, trial.condition === "sham" || trial.condition === "preparation"), [trial]);
  const calibrationGenome = useMemo(() => ({...genomeFromSeed(8811),carrierHz:440,modHz:0,durationMs:1000,gain:0.16,waveform:"sine" as const,beatMode:"none" as const,harmonics:1,pan:0,sham:false}), []);
  const t = copy[lang];
  const currentLab = labCopy[lab][lang];

  const schedule = (callback:()=>void, delay:number) => {
    const timer = setTimeout(() => { timers.current.delete(timer); callback(); }, delay);
    timers.current.add(timer);
  };
  const stopRun = () => {
    runToken.current += 1;
    for (const timer of timers.current) clearTimeout(timer);
    timers.current.clear();
    engine.current?.stop();
  };

  useEffect(() => {
    engine.current = new UmbralAudioEngine();
    setOutputSupport(engine.current.canSelectOutput() ? "selectable" : "default-only");
    const stop = () => { stopRun(); if(stageRef.current==="run")setStage("respond"); };
    window.addEventListener("umbral:stop",stop);
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      } else {
        // A development worker can serve HTML from a previous HMR revision and
        // hydrate it with the current bundle. Remove only UMBRAL's own caches.
        void navigator.serviceWorker.getRegistrations()
          .then(registrations => Promise.all(registrations.map(registration => registration.unregister())))
          .catch(() => undefined);
        if ("caches" in window) {
          void caches.keys()
            .then(keys => Promise.all(keys.filter(key => key.startsWith("umbral-shell-")).map(key => caches.delete(key))))
            .catch(() => undefined);
        }
      }
    }
    return () => { window.removeEventListener("umbral:stop",stop); stopRun(); void engine.current?.close(); };
  },[]);
  useEffect(() => { stageRef.current=stage; },[stage]);

  const resetAnswers = () => { setOccurred(null); setCategory("otra"); setConfidence(50); setExpectation(50); setNote(""); };
  const switchLab = (next:LabId) => { stopRun(); setLab(next); setStage("intro"); setTrialIndex(0); setCalibrationPlayed(false); setHeardCalibration(null); resetAnswers(); setMessage(""); };
  const start = () => { setStage("calibrate"); setMessage(""); setCalibrationPlayed(false); setHeardCalibration(null); };
  const chooseOutput = async () => {
    setOutputBusy(true);
    setOutputMessage("");
    try {
      const selected = await engine.current?.selectOutput();
      if (selected) {
        setOutputLabel(selected.label);
        setOutputMessage(`${t.outputSelected}: ${selected.label}`);
      }
    } catch(error) {
      const name = error instanceof DOMException ? error.name : "";
      setOutputMessage(name === "NotAllowedError" || name === "AbortError" ? t.outputCancelled : (error instanceof Error ? error.message : t.outputCancelled));
    } finally {
      setOutputBusy(false);
    }
  };
  const testAudio = async () => { try { setMessage(""); await engine.current?.play(calibrationGenome); setCalibrationPlayed(true); } catch(error) { setCalibrationPlayed(false); setMessage(error instanceof Error ? error.message : t.signalError); } };
  const beginTrial = async () => {
    stopRun();
    resetAnswers();
    setStage("run");
    const token = runToken.current;
    const startAudio = async () => {
      if (token !== runToken.current) return;
      setRunPhase("listen");
      try {
        await engine.current?.play(genome);
        schedule(() => { if (token === runToken.current) setStage("respond"); }, genome.durationMs + 180);
      } catch(error) {
        setMessage(error instanceof Error ? error.message : t.signalError);
        setStage("ready");
      }
    };
    if (trial.preparationMs > 0) { setRunPhase("prepare"); schedule(() => { void startAudio(); }, trial.preparationMs); }
    else { setRunPhase("listen"); await startAudio(); }
  };
  const stopAndRespond = () => { stopRun(); setStage("respond"); };
  const saveResponse = async () => {
    const payload = { lab, trial, genomeHash: hashGenome(genome), occurred, category: occurred ? category : "none", confidence, expectation, note: note.trim() || undefined, anchorQuality: lab === "anchor" ? anchorQuality : undefined, language:lang, decision: decide(trial.condition === "sham" ? "skeptic" : "cartographer", trial.seed) };
    await saveLocal({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), kind:"session", payload });
    if (trialIndex < protocol.length - 1) { setTrialIndex(value => value + 1); setStage("ready"); resetAnswers(); }
    else setStage("result");
  };
  const download = async () => { const blob = new Blob([await exportLocal()],{type:"application/json"}); const url=URL.createObjectURL(blob); const anchor=document.createElement("a"); anchor.href=url;anchor.download="umbral-local-export.json";anchor.click();URL.revokeObjectURL(url);setMessage(lang==="es"?"Exportación creada en este dispositivo.":"Export created on this device."); };
  const erase = async () => { stopRun(); await clearLocal(); setTrialIndex(0); setStage("intro"); setCalibrationPlayed(false); setHeardCalibration(null); setMessage(lang==="es"?"Datos locales eliminados.":"Local data erased."); };
  const reportDiscomfort = async () => { stopRun(); await saveLocal({id:crypto.randomUUID(),createdAt:new Date().toISOString(),kind:"adverse-event",payload:{lab,trialIndex,engineVersion:genome.version}}); setStage("intro"); setMessage(lang==="es"?"Malestar registrado sólo en este dispositivo. La sesión se detuvo; buscá atención profesional si el síntoma persiste.":"Discomfort was recorded only on this device. The session stopped; seek professional care if symptoms persist."); };
  const sync = async () => { try { const count=await syncLocalSessions(); setMessage(lang==="es"?`${count} sesiones copiadas por tu acción. Esto no otorga consentimiento de investigación.`:`${count} sessions copied by your action. This does not grant research consent.`); } catch(error) { setMessage(error instanceof Error?error.message:(lang==="es"?"No se pudo sincronizar.":"Sync failed.")); } };

  return <div className="demo-shell" lang={lang}>
    <header className="demo-top"><div><span className="local-badge">● {t.local}</span><h1>{t.title}</h1><p>{t.privacy}</p></div><button className="lang-button" onClick={() => setLang(lang === "es" ? "en" : "es")}>{lang === "es" ? "EN" : "ES"}</button></header>
    <div className="demo-layout"><aside className="lab-nav" aria-label={lang==="es"?"Laboratorios":"Laboratories"}>{(Object.keys(labCopy) as LabId[]).map((id,index)=><button key={id} className={lab===id?"selected":""} aria-pressed={lab===id} onClick={()=>switchLab(id)}><span>0{index+1}</span><b>{labCopy[id][lang].name}</b><small>{labCopy[id][lang].question}</small></button>)}</aside>
      <section className="lab-stage" aria-live="polite"><div className="trial-meta"><span>{currentLab.name.toUpperCase()}</span>{!(["intro","calibrate"].includes(stage))&&<span>{lang==="es"?"ENSAYO":"TRIAL"} {trialIndex+1}/{protocol.length}</span>}</div>
        {stage==="intro"&&<div className="stage-card">
          <p className="kicker">{t.outputStep}</p>
          <h2>{t.outputTitle}</h2>
          <p>{t.outputText}</p>
          <div className="audio-output-card">
            {outputSupport==="selectable"&&<button className="button output-button" disabled={outputBusy} onClick={chooseOutput}>{outputBusy?t.choosingOutput:t.chooseOutput}</button>}
            <p className={outputLabel?"output-status selected":"output-status"} role="status">
              {outputMessage || (outputSupport==="checking"?t.outputChecking:outputSupport==="default-only"?t.outputDefault:outputLabel?`${t.outputSelected}: ${outputLabel}`:t.outputDefault)}
            </p>
          </div>
          <div className="lab-summary"><p className="kicker">{t.labQuestion}</p><h3>{currentLab.question}</h3><p>{currentLab.detail}</p></div>
          {lab==="anchor"&&<div className="safety-box"><b>{t.safeTitle}</b><p>{t.safeText}</p><label>{lang==="es"?"Cualidad":"Quality"}<select value={anchorQuality} onChange={event=>setAnchorQuality(event.target.value)}>{safeQualities.map(option=><option key={option[0]} value={option[0]}>{option[lang==="es"?1:2]}</option>)}</select></label></div>}
          <label className="consent-check"><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)}/> {t.consent}</label>
          <button className="button primary" disabled={!consent} onClick={start}>{t.start} →</button>
        </div>}
        {stage==="calibrate"&&<div className="stage-card centered">
          <p className="kicker">{t.calibration}</p><h2>{t.calibrationTitle}</h2><p>{t.calibrationText}</p>
          {outputSupport==="selectable"&&<button className="output-link" disabled={outputBusy} onClick={chooseOutput}>{outputBusy?t.choosingOutput:t.changeOutput}</button>}
          {outputLabel&&<p className="output-status selected" role="status">{t.outputSelected}: {outputLabel}</p>}
          <div className="stimulus-preview" aria-hidden="true"><span>440 HZ</span><b>1.0 s</b></div>
          <button className="button primary" onClick={testAudio}>{t.testAudio} ▶</button>
          <div className="binary calibration-choice"><button disabled={!calibrationPlayed} className={heardCalibration===true?"chosen":""} onClick={()=>setHeardCalibration(true)}>{t.heard}</button><button disabled={!calibrationPlayed} className={heardCalibration===false?"chosen":""} onClick={()=>setHeardCalibration(false)}>{t.unheard}</button></div>
          {heardCalibration===false&&<p className="troubleshoot">{t.troubleshoot}</p>}{heardCalibration===true&&<button className="button primary" onClick={()=>setStage("ready")}>{t.continue} →</button>}
        </div>}
        {stage==="ready"&&<div className="stage-card centered"><p className="kicker">{t.before}</p><h2>{t.readyTitle}</h2><p>{t.readyText}</p><div className="trial-seal" aria-label={lang==="es"?"Condición experimental oculta":"Hidden experimental condition"}>?</div><button className="button primary" onClick={beginTrial}>{t.listen} ▶</button></div>}
        {stage==="run"&&<div className="stage-card centered">{runPhase==="listen"&&trial.target!=="none"&&<div className={trial.target==="shape"?"visual-stimulus shape":trial.target==="state"?"state-stimulus":"visual-stimulus color"} style={{opacity:trial.visualStrength}} aria-label={trial.target==="state"?(safeQualities.find(option=>option[0]===anchorQuality)?.[lang==="es"?1:2]||anchorQuality):(trial.target==="color"?(lang==="es"?"Estímulo de color":"Color stimulus"):(lang==="es"?"Estímulo de forma":"Shape stimulus"))}>{trial.target==="state"&&(safeQualities.find(option=>option[0]===anchorQuality)?.[lang==="es"?1:2]||anchorQuality)}</div>}{trial.load==="moderate"&&runPhase==="listen"&&<div className="load-grid" aria-hidden="true">{Array.from({length:12},(_,index)=><i key={index}/>)}</div>}<p>{runPhase==="prepare"?t.preparing:t.listening}</p><button className="button ghost" onClick={stopAndRespond}>{t.stopRespond}</button></div>}
        {stage==="respond"&&<div className="stage-card"><p className="kicker">{t.respondFirst}</p><h2>{t.happened}</h2><div className="binary"><button className={occurred===true?"chosen":""} aria-pressed={occurred===true} onClick={()=>setOccurred(true)}>{t.yes}</button><button className={occurred===false?"chosen":""} aria-pressed={occurred===false} onClick={()=>setOccurred(false)}>{t.no}</button></div>{occurred!==null&&<div className="response-detail">{occurred&&<label>{t.kind}<select value={category} onChange={event=>setCategory(event.target.value)}>{responseOptions.map(option=><option key={option[0]} value={option[0]}>{option[lang==="es"?1:2]}</option>)}</select></label>}<label>{t.expectation}: {expectation}%<input aria-label={t.expectation} type="range" min="0" max="100" value={expectation} onChange={event=>setExpectation(Number(event.target.value))}/></label><label>{t.confidence}: {confidence}%<input aria-label={t.confidence} type="range" min="0" max="100" value={confidence} onChange={event=>setConfidence(Number(event.target.value))}/></label>{occurred&&<label>{t.note}<textarea maxLength={240} value={note} onChange={event=>setNote(event.target.value)} placeholder={lang==="es"?"Ej.: apareció una forma breve":"Example: a brief shape appeared"}/></label>}</div>}<button className="button primary" disabled={occurred===null} onClick={saveResponse}>{t.save} →</button></div>}
        {stage==="result"&&<div className="stage-card"><p className="kicker">{t.resultLabel} · N={protocol.length}</p><h2>{t.resultTitle}</h2><p>{t.resultText}</p><div className="result-facts"><span>{protocol.length} {lang==="es"?"respuestas guardadas":"responses saved"}</span><span>{protocol.filter(item=>item.condition==="sham").length} {lang==="es"?"controles sham":"sham controls"}</span><span>{lang==="es"?"Inferencia: pendiente de retest":"Inference: pending retest"}</span></div><button className="button primary" onClick={download}>{t.export}</button><button className="button ghost" onClick={()=>{setTrialIndex(0);setStage("intro");setCalibrationPlayed(false);setHeardCalibration(null)}}>{t.restart}</button></div>}
        {message&&<p className="local-message" role="status">{message}</p>}</section>
    </div><div className="data-tools"><button onClick={download}>{t.exportAll}</button><button onClick={sync}>{t.sync}</button><button onClick={reportDiscomfort}>{t.discomfort}</button><button onClick={erase}>{t.erase}</button></div>
  </div>;
}
