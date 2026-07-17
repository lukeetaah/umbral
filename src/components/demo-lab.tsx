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

const labCopy: Record<LabId, Record<Language, {name:string;question:string;detail:string}>> = {
  atlas:{
    es:{name:"Atlas",question:"¿Qué aparece espontáneamente?",detail:"Sonido–color, sonido–forma, repeticiones ocultas y controles silenciosos."},
    en:{name:"Atlas",question:"What appears spontaneously?",detail:"Sound–color, sound–shape, hidden repetitions, and silent controls."},
  },
  apprenticeship:{
    es:{name:"Apprenticeship",question:"¿Qué queda cuando retiramos una parte?",detail:"Una secuencia fija de aprendizaje, reducción, omisión y transferencia."},
    en:{name:"Apprenticeship",question:"What remains when one part is removed?",detail:"A fixed sequence of learning, fading, omission, and transfer."},
  },
  state:{
    es:{name:"State Gate",question:"¿El estado previo cambia la respuesta?",detail:"Compara preparación, carga visual, silencio y señales de control."},
    en:{name:"State Gate",question:"Does the prior state change the response?",detail:"Compares preparation, visual load, silence, and control signals."},
  },
  anchor:{
    es:{name:"Anchor",question:"¿Una firma puede acompañar un estado seguro?",detail:"Sólo estados seguros elegidos o refugios imaginados. Nunca trauma."},
    en:{name:"Anchor",question:"Can a signature accompany a safe state?",detail:"Only chosen safe states or clearly imagined refuges. Never trauma."},
  },
};

const copy = {
  es:{
    local:"MODO LOCAL", title:"Laboratorio perceptual", privacy:"Tus resultados permanecen en este dispositivo y no forman parte de la investigación colectiva.",
    labQuestion:"PREGUNTA DEL LABORATORIO", consent:"Entiendo que esto es investigación exploratoria, puedo detenerme y el volumen debe permanecer cómodo.", start:"Comprobar audio", safeTitle:"Elegí un estado seguro", safeText:"No uses trauma, recuerdos inciertos ni detalles íntimos. Podés elegir una cualidad abstracta.",
    calibration:"COMPROBACIÓN DE AUDIO", calibrationTitle:"Primero, confirmá que escuchás", calibrationText:"Poné el dispositivo por debajo del 60%. La prueba es breve y no cuenta como ensayo. UMBRAL no puede medir el nivel real en tus auriculares.", testAudio:"Probar sonido", heard:"Sí, lo escuché", unheard:"No lo escucho", troubleshoot:"Revisá que la pestaña y el dispositivo no estén silenciados. Subí apenas el volumen y repetí la prueba; no superes un nivel cómodo.", continue:"Ir al primer ensayo",
    before:"CONDICIÓN OCULTA", readyTitle:"Respondé por lo que ocurra, no por lo que esperás", readyText:"Algunos ensayos contienen sonido, otros son controles. La condición no se revela durante la sesión.", listen:"Iniciar ensayo", preparing:"Preparación silenciosa…", listening:"Ensayo en curso…", stopRespond:"Detener y responder",
    respondFirst:"RESPONDÉ ANTES DE VER CATEGORÍAS", happened:"¿Ocurrió algo?", yes:"Sí, algo ocurrió", no:"No noté nada", kind:"¿Qué se parece más?", confidence:"Confianza en tu respuesta", expectation:"Antes del ensayo, ¿cuánto esperabas que ocurriera algo?", note:"Descripción opcional, sin datos íntimos", save:"Guardar y continuar",
    resultLabel:"RESULTADO LOCAL", resultTitle:"Una sesión no alcanza para concluir.", resultText:"Completaste una secuencia con controles, omisiones o repeticiones según el laboratorio. UMBRAL guarda las respuestas; no fabrica un puntaje de precisión con una sola sesión. El siguiente paso válido es un retest preregistrado.", export:"Exportar JSON", restart:"Reiniciar laboratorio",
    exportAll:"Exportar todos los datos locales", sync:"Sincronizar copia privada (opcional)", discomfort:"Registrar malestar y detener", erase:"Eliminar completamente y reiniciar", signalError:"No se pudo iniciar el audio.",
  },
  en:{
    local:"LOCAL MODE", title:"Perceptual laboratory", privacy:"Your results stay on this device and are not part of collective research.",
    labQuestion:"LABORATORY QUESTION", consent:"I understand this is exploratory research, I may stop at any time, and volume must remain comfortable.", start:"Check audio", safeTitle:"Choose a safe state", safeText:"Do not use trauma, uncertain memories, or intimate details. You may choose an abstract quality.",
    calibration:"AUDIO CHECK", calibrationTitle:"First, confirm that you can hear", calibrationText:"Set your device below 60%. This brief check is not a trial. UMBRAL cannot measure the real level at your headphones.", testAudio:"Test sound", heard:"Yes, I heard it", unheard:"I cannot hear it", troubleshoot:"Check that the tab and device are not muted. Raise the volume slightly and test again; never exceed a comfortable level.", continue:"Go to the first trial",
    before:"HIDDEN CONDITION", readyTitle:"Report what happens, not what you expect", readyText:"Some trials contain sound and others are controls. The condition stays hidden during the session.", listen:"Start trial", preparing:"Silent preparation…", listening:"Trial in progress…", stopRespond:"Stop and respond",
    respondFirst:"RESPOND BEFORE SEEING CATEGORIES", happened:"Did anything happen?", yes:"Yes, something happened", no:"I noticed nothing", kind:"What is it most like?", confidence:"Confidence in your response", expectation:"Before the trial, how much did you expect something to happen?", note:"Optional description, without intimate data", save:"Save and continue",
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
  const engine = useRef<UmbralAudioEngine|null>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const runToken = useRef(0);
  const stageRef = useRef<Stage>(stage);
  const protocol = useMemo(() => buildProtocol(41027, 8, lab), [lab]);
  const trial: TrialPlan = protocol[trialIndex] ?? protocol[0];
  const genome = useMemo(() => genomeFromSeed(trial.seed, trial.condition === "sham" || trial.condition === "preparation"), [trial]);
  const calibrationGenome = useMemo(() => ({...genomeFromSeed(8811),carrierHz:440,modHz:0,durationMs:900,gain:0.12,waveform:"sine" as const,beatMode:"none" as const,harmonics:1,pan:0,sham:false}), []);
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
    const stop = () => { stopRun(); if(stageRef.current==="run")setStage("respond"); };
    window.addEventListener("umbral:stop",stop);
    navigator.serviceWorker?.register("/sw.js").catch(() => undefined);
    return () => { window.removeEventListener("umbral:stop",stop); stopRun(); void engine.current?.close(); };
  },[]);
  useEffect(() => { stageRef.current=stage; },[stage]);

  const resetAnswers = () => { setOccurred(null); setCategory("otra"); setConfidence(50); setExpectation(50); setNote(""); };
  const switchLab = (next:LabId) => { stopRun(); setLab(next); setStage("intro"); setTrialIndex(0); setCalibrationPlayed(false); setHeardCalibration(null); resetAnswers(); setMessage(""); };
  const start = () => { setStage("calibrate"); setMessage(""); setCalibrationPlayed(false); setHeardCalibration(null); };
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
        {stage==="intro"&&<div className="stage-card"><p className="kicker">{t.labQuestion}</p><h2>{currentLab.question}</h2><p>{currentLab.detail}</p>{lab==="anchor"&&<div className="safety-box"><b>{t.safeTitle}</b><p>{t.safeText}</p><label>{lang==="es"?"Cualidad":"Quality"}<select value={anchorQuality} onChange={event=>setAnchorQuality(event.target.value)}>{safeQualities.map(option=><option key={option[0]} value={option[0]}>{option[lang==="es"?1:2]}</option>)}</select></label></div>}<label className="consent-check"><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)}/> {t.consent}</label><button className="button primary" disabled={!consent} onClick={start}>{t.start} →</button></div>}
        {stage==="calibrate"&&<div className="stage-card centered"><p className="kicker">{t.calibration}</p><h2>{t.calibrationTitle}</h2><p>{t.calibrationText}</p><div className="stimulus-preview" aria-hidden="true"><span>440 HZ</span><b>0.9 s</b></div><button className="button primary" onClick={testAudio}>{t.testAudio} ▶</button><div className="binary calibration-choice"><button disabled={!calibrationPlayed} className={heardCalibration===true?"chosen":""} onClick={()=>setHeardCalibration(true)}>{t.heard}</button><button disabled={!calibrationPlayed} className={heardCalibration===false?"chosen":""} onClick={()=>setHeardCalibration(false)}>{t.unheard}</button></div>{heardCalibration===false&&<p className="troubleshoot">{t.troubleshoot}</p>}{heardCalibration===true&&<button className="button primary" onClick={()=>setStage("ready")}>{t.continue} →</button>}</div>}
        {stage==="ready"&&<div className="stage-card centered"><p className="kicker">{t.before}</p><h2>{t.readyTitle}</h2><p>{t.readyText}</p><div className="trial-seal" aria-label={lang==="es"?"Condición experimental oculta":"Hidden experimental condition"}>?</div><button className="button primary" onClick={beginTrial}>{t.listen} ▶</button></div>}
        {stage==="run"&&<div className="stage-card centered">{runPhase==="listen"&&trial.target!=="none"&&<div className={trial.target==="shape"?"visual-stimulus shape":trial.target==="state"?"state-stimulus":"visual-stimulus color"} style={{opacity:trial.visualStrength}} aria-label={trial.target==="state"?(safeQualities.find(option=>option[0]===anchorQuality)?.[lang==="es"?1:2]||anchorQuality):(trial.target==="color"?(lang==="es"?"Estímulo de color":"Color stimulus"):(lang==="es"?"Estímulo de forma":"Shape stimulus"))}>{trial.target==="state"&&(safeQualities.find(option=>option[0]===anchorQuality)?.[lang==="es"?1:2]||anchorQuality)}</div>}{trial.load==="moderate"&&runPhase==="listen"&&<div className="load-grid" aria-hidden="true">{Array.from({length:12},(_,index)=><i key={index}/>)}</div>}<p>{runPhase==="prepare"?t.preparing:t.listening}</p><button className="button ghost" onClick={stopAndRespond}>{t.stopRespond}</button></div>}
        {stage==="respond"&&<div className="stage-card"><p className="kicker">{t.respondFirst}</p><h2>{t.happened}</h2><div className="binary"><button className={occurred===true?"chosen":""} aria-pressed={occurred===true} onClick={()=>setOccurred(true)}>{t.yes}</button><button className={occurred===false?"chosen":""} aria-pressed={occurred===false} onClick={()=>setOccurred(false)}>{t.no}</button></div>{occurred!==null&&<div className="response-detail">{occurred&&<label>{t.kind}<select value={category} onChange={event=>setCategory(event.target.value)}>{responseOptions.map(option=><option key={option[0]} value={option[0]}>{option[lang==="es"?1:2]}</option>)}</select></label>}<label>{t.expectation}: {expectation}%<input aria-label={t.expectation} type="range" min="0" max="100" value={expectation} onChange={event=>setExpectation(Number(event.target.value))}/></label><label>{t.confidence}: {confidence}%<input aria-label={t.confidence} type="range" min="0" max="100" value={confidence} onChange={event=>setConfidence(Number(event.target.value))}/></label>{occurred&&<label>{t.note}<textarea maxLength={240} value={note} onChange={event=>setNote(event.target.value)} placeholder={lang==="es"?"Ej.: apareció una forma breve":"Example: a brief shape appeared"}/></label>}</div>}<button className="button primary" disabled={occurred===null} onClick={saveResponse}>{t.save} →</button></div>}
        {stage==="result"&&<div className="stage-card"><p className="kicker">{t.resultLabel} · N={protocol.length}</p><h2>{t.resultTitle}</h2><p>{t.resultText}</p><div className="result-facts"><span>{protocol.length} {lang==="es"?"respuestas guardadas":"responses saved"}</span><span>{protocol.filter(item=>item.condition==="sham").length} {lang==="es"?"controles sham":"sham controls"}</span><span>{lang==="es"?"Inferencia: pendiente de retest":"Inference: pending retest"}</span></div><button className="button primary" onClick={download}>{t.export}</button><button className="button ghost" onClick={()=>{setTrialIndex(0);setStage("intro");setCalibrationPlayed(false);setHeardCalibration(null)}}>{t.restart}</button></div>}
        {message&&<p className="local-message" role="status">{message}</p>}</section>
    </div><div className="data-tools"><button onClick={download}>{t.exportAll}</button><button onClick={sync}>{t.sync}</button><button onClick={reportDiscomfort}>{t.discomfort}</button><button onClick={erase}>{t.erase}</button></div>
  </div>;
}
