"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { UmbralAudioEngine } from "@/src/lib/audio/engine";
import { buildProtocol, type LabId, type TrialPlan } from "@/src/lib/protocol-engine";
import { genomeFromSeed, hashGenome } from "@/src/lib/stimulus-genome";
import { clearLocal, exportLocal, listLocal, saveLocal } from "@/src/lib/local-store";
import { decide } from "@/src/lib/possibility-engine";
import { buildPersonalLearningModel, explainPersonalLearning, observationsFromPersonalModel, type PersonalLearningModel } from "@/src/lib/learning-engine";
import { contributeLocalSessions, getCollectiveLearningSnapshot, type CollectiveLearningSnapshot } from "@/src/lib/supabase/sync";

type Stage = "intro" | "ready" | "run" | "respond" | "result";
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
    labQuestion:"QUÉ VAS A PROBAR", consent:"Puedo parar cuando quiera y voy a usar un volumen cómodo.", start:"Empezar sesión", safeTitle:"Elegí una sensación segura", safeText:"Elegí algo simple y cómodo. No uses trauma ni recuerdos íntimos.",
    outputStep:"PREPARACIÓN · TODO EN ESTA PANTALLA", outputTitle:"Dejemos el audio listo", outputText:"Elegí la salida si querés y probá un tono. Después empezás sin más vueltas.", chooseOutput:"Elegir parlante o auriculares", choosingOutput:"Abriendo salidas…", outputDefault:"Se usará la salida predeterminada del sistema.", outputChecking:"Comprobando las salidas…", outputSelected:"Salida elegida", outputCancelled:"No se cambió la salida. Podés volver a intentarlo o usar la predeterminada.",
    calibrationTitle:"¿Se escucha?", calibrationText:"El tono dura un segundo y no cuenta como prueba.", testAudio:"Probar tono", heard:"Sí, se escucha", unheard:"No se escucha", troubleshoot:"Revisá que la pestaña no esté silenciada, cambiá la salida o subí apenas el volumen.",
    quickSession:"Rápida · 4 pruebas · 2 minutos", fullSession:"Completa · 8 pruebas · 4 minutos", sessionLengthTitle:"Elegí cuánto querés hacer", before:"ANTES DEL SONIDO", readyTitle:"Cuando quieras, escuchá", readyNext:"Siguiente sonido", readyText:"Dura menos de dos segundos. Después respondés con un toque.", listen:"Escuchar", preparing:"Un momento…", listening:"Escuchando…", stopRespond:"Responder ahora",
    respondFirst:"RESPUESTA RÁPIDA", happened:"¿Apareció algo?", yes:"Sí", no:"No", kind:"¿Qué fue?", confidence:"¿Qué tan seguro estás?", expectation:"Antes de escuchar, ¿esperás que aparezca algo?", low:"Poco", medium:"Tal vez", high:"Mucho", note:"Si querés, describilo en una frase", save:"Guardar y seguir",
    resultLabel:"APRENDIZAJE PERSONAL", resultTitle:"UMBRAL ajustó tu próxima sesión.", resultText:"Compara tus respuestas a sonidos reales con los controles. No adivina lo que sentís ni fuerza un resultado.", export:"Descargar mis datos (JSON)", restart:"Hacer otra sesión",
    learnedFrom:"RESPUESTAS USADAS", signalRate:"CON SEÑAL", controlRate:"EN CONTROLES", topCategory:"APARECIÓ MÁS", noCategory:"Todavía sin patrón", collectiveTitle:"Ayudá a que UMBRAL aprenda de muchas personas", collectiveText:"Si elegís aportar, se envían respuestas, categorías y parámetros del sonido. No se envían tu texto libre, correo, cuenta ni un identificador de sesión.", collectiveConsent:"Quiero aportar estas respuestas de forma anónima al aprendizaje colectivo.", contribute:"Aportar anónimamente", contributing:"Aportando…", collectiveUnavailable:"El aprendizaje colectivo todavía no está conectado. Tu modelo personal sí se actualizó.", collectiveCount:"respuestas anónimas en el modelo colectivo",
    exportAll:"Descargar todos mis datos (JSON)", discomfort:"Registrar malestar y detener", erase:"Eliminar completamente y reiniciar", signalError:"No se pudo iniciar el audio.",
  },
  en:{
    local:"LOCAL MODE", title:"Sound laboratory", privacy:"Your answers are stored only on this device.",
    labQuestion:"WHAT YOU WILL TEST", consent:"I can stop at any time and will keep the volume comfortable.", start:"Start session", safeTitle:"Choose a safe feeling", safeText:"Choose something simple and comfortable. Do not use trauma or intimate memories.",
    outputStep:"SETUP · EVERYTHING ON THIS SCREEN", outputTitle:"Let's get the audio ready", outputText:"Choose an output if you want and test one tone. Then you can begin.", chooseOutput:"Choose speaker or headphones", choosingOutput:"Opening outputs…", outputDefault:"The system's default output will be used.", outputChecking:"Checking audio outputs…", outputSelected:"Selected output", outputCancelled:"The output was not changed. You can try again or use the default.",
    calibrationTitle:"Can you hear it?", calibrationText:"The tone lasts one second and is not part of the test.", testAudio:"Test tone", heard:"Yes, I hear it", unheard:"I cannot hear it", troubleshoot:"Check that the tab is not muted, change the output, or raise the volume slightly.",
    quickSession:"Quick · 4 tests · 2 minutes", fullSession:"Complete · 8 tests · 4 minutes", sessionLengthTitle:"Choose how much to do", before:"BEFORE THE SOUND", readyTitle:"Listen when you are ready", readyNext:"Next sound", readyText:"It lasts less than two seconds. Then you answer with one tap.", listen:"Listen", preparing:"One moment…", listening:"Listening…", stopRespond:"Answer now",
    respondFirst:"QUICK ANSWER", happened:"Did anything appear?", yes:"Yes", no:"No", kind:"What was it?", confidence:"How sure are you?", expectation:"Before listening, do you expect anything to appear?", low:"Low", medium:"Maybe", high:"High", note:"If you want, describe it in one sentence", save:"Save and continue",
    resultLabel:"PERSONAL LEARNING", resultTitle:"UMBRAL adjusted your next session.", resultText:"It compares your answers to real sounds with the controls. It does not guess what you felt or force a result.", export:"Download my data (JSON)", restart:"Run another session",
    learnedFrom:"ANSWERS USED", signalRate:"WITH SIGNAL", controlRate:"IN CONTROLS", topCategory:"MOST COMMON", noCategory:"No pattern yet", collectiveTitle:"Help UMBRAL learn from many people", collectiveText:"If you contribute, UMBRAL sends answers, categories, and sound parameters. It does not send your free text, email, account, or a session identifier.", collectiveConsent:"I want to contribute these answers anonymously to collective learning.", contribute:"Contribute anonymously", contributing:"Contributing…", collectiveUnavailable:"Collective learning is not connected yet. Your personal model was still updated.", collectiveCount:"anonymous answers in the collective model",
    exportAll:"Download all my data (JSON)", discomfort:"Record discomfort and stop", erase:"Erase completely and restart", signalError:"Audio could not be started.",
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
  const [confidence,setConfidence] = useState(60);
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
  const [sessionLength,setSessionLength] = useState<4|8>(4);
  const [protocolSeed,setProtocolSeed] = useState(41027);
  const [sessionPreferredSeeds,setSessionPreferredSeeds] = useState<number[]>([]);
  const [personalModel,setPersonalModel] = useState<PersonalLearningModel>(()=>buildPersonalLearningModel([]));
  const [researchConsent,setResearchConsent] = useState(false);
  const [contributionBusy,setContributionBusy] = useState(false);
  const [collectiveAvailable,setCollectiveAvailable] = useState<boolean|null>(null);
  const [collectiveSnapshot,setCollectiveSnapshot] = useState<CollectiveLearningSnapshot|null>(null);
  const engine = useRef<UmbralAudioEngine|null>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const runToken = useRef(0);
  const stageRef = useRef<Stage>(stage);
  const protocol = useMemo(() => buildProtocol(protocolSeed, sessionLength, lab, sessionPreferredSeeds), [lab,protocolSeed,sessionLength,sessionPreferredSeeds]);
  const trial: TrialPlan = protocol[trialIndex] ?? protocol[0];
  const genome = useMemo(() => genomeFromSeed(trial.seed, trial.condition === "sham" || trial.condition === "preparation"), [trial]);
  const calibrationGenome = useMemo(() => ({...genomeFromSeed(8811),carrierHz:440,modHz:0,durationMs:1000,gain:0.16,waveform:"sine" as const,beatMode:"none" as const,harmonics:1,pan:0,sham:false}), []);
  const t = copy[lang];
  const currentLab = labCopy[lab][lang];
  const topCategoryLabel = personalModel.topCategory ? responseOptions.find(option=>option[0]===personalModel.topCategory)?.[lang==="es"?1:2] : null;
  const nextPreferredSeeds = Array.from(new Set([...personalModel.promisingSeeds.map(item=>item.seed),...(collectiveSnapshot?.promising_genomes.map(item=>item.seed)??[])])).slice(0,2);

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
    void listLocal().then(records => {
      const model = buildPersonalLearningModel(records);
      setPersonalModel(model);
      setProtocolSeed(model.nextProtocolSeed);
      if(model.promisingSeeds.length) setSessionPreferredSeeds(model.promisingSeeds.map(item=>item.seed).slice(0,2));
    }).catch(() => undefined);
    void getCollectiveLearningSnapshot().then(snapshot => {
      setCollectiveSnapshot(snapshot);
      setCollectiveAvailable(snapshot !== null);
      if(snapshot?.promising_genomes.length) setSessionPreferredSeeds(current=>current.length?current:snapshot.promising_genomes.map(item=>item.seed).slice(0,2));
    }).catch(() => setCollectiveAvailable(false));
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

  const resetAnswers = () => { setOccurred(null); setCategory("otra"); setConfidence(60); setExpectation(50); setNote(""); };
  const switchLab = (next:LabId) => { stopRun(); setLab(next); setStage("intro"); setTrialIndex(0); setProtocolSeed(personalModel.nextProtocolSeed); setSessionPreferredSeeds(nextPreferredSeeds); resetAnswers(); setMessage(""); };
  const start = () => { setStage("ready"); setMessage(""); };
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
    const payload = { lab, trial, genomeHash: hashGenome(genome), occurred, category: occurred ? category : "none", confidence, expectation, note: note.trim() || undefined, anchorQuality: lab === "anchor" ? anchorQuality : undefined, language:lang, decision: decide(trial.condition === "sham" ? "skeptic" : "cartographer", trial.seed, observationsFromPersonalModel(personalModel)) };
    await saveLocal({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), kind:"session", payload });
    const records = await listLocal();
    const nextModel = buildPersonalLearningModel(records);
    await saveLocal({ id:"personal-model-v1", createdAt:new Date().toISOString(), kind:"model", payload:{...nextModel} });
    setPersonalModel(nextModel);
    if (trialIndex < protocol.length - 1) { setTrialIndex(value => value + 1); setStage("ready"); resetAnswers(); }
    else setStage("result");
  };
  const download = async () => { const blob = new Blob([await exportLocal()],{type:"application/json"}); const url=URL.createObjectURL(blob); const anchor=document.createElement("a"); anchor.href=url;anchor.download="umbral-local-export.json";anchor.click();URL.revokeObjectURL(url);setMessage(lang==="es"?"Exportación creada en este dispositivo.":"Export created on this device."); };
  const erase = async () => { stopRun(); await clearLocal(); const emptyModel=buildPersonalLearningModel([]); setPersonalModel(emptyModel); setProtocolSeed(emptyModel.nextProtocolSeed); setTrialIndex(0); setStage("intro"); setCalibrationPlayed(false); setHeardCalibration(null); setMessage(lang==="es"?"Datos locales eliminados.":"Local data erased."); };
  const reportDiscomfort = async () => { stopRun(); await saveLocal({id:crypto.randomUUID(),createdAt:new Date().toISOString(),kind:"adverse-event",payload:{lab,trialIndex,engineVersion:genome.version}}); setStage("intro"); setMessage(lang==="es"?"Malestar registrado sólo en este dispositivo. La sesión se detuvo; buscá atención profesional si el síntoma persiste.":"Discomfort was recorded only on this device. The session stopped; seek professional care if symptoms persist."); };
  const contribute = async () => {
    if (!researchConsent) return;
    setContributionBusy(true);
    setMessage("");
    try {
      const count = await contributeLocalSessions();
      await saveLocal({id:crypto.randomUUID(),createdAt:new Date().toISOString(),kind:"consent",payload:{scope:"anonymous-collective-learning",granted:true,freeTextIncluded:false,accountIdIncluded:false}});
      const snapshot = await getCollectiveLearningSnapshot();
      setCollectiveSnapshot(snapshot);
      setCollectiveAvailable(snapshot !== null);
      setResearchConsent(false);
      setMessage(lang==="es"?(count?`${count} respuestas anónimas se sumaron al aprendizaje colectivo.`:"Estas respuestas ya habían sido aportadas. No se duplicaron."):(count?`${count} anonymous answers were added to collective learning.`:"These answers had already been contributed and were not duplicated."));
    } catch(error) {
      setMessage(error instanceof Error?error.message:(lang==="es"?"No se pudo aportar en este momento.":"Contribution is unavailable right now."));
    } finally {
      setContributionBusy(false);
    }
  };

  return <div className="demo-shell" lang={lang}>
    <header className="demo-top"><div><span className="local-badge">● {t.local}</span><h1>{t.title}</h1><p>{t.privacy}</p></div><button className="lang-button" onClick={() => setLang(lang === "es" ? "en" : "es")}>{lang === "es" ? "EN" : "ES"}</button></header>
    <div className="demo-layout"><aside className="lab-nav" aria-label={lang==="es"?"Laboratorios":"Laboratories"}>{(Object.keys(labCopy) as LabId[]).map((id,index)=><button key={id} className={lab===id?"selected":""} aria-pressed={lab===id} onClick={()=>switchLab(id)}><span>0{index+1}</span><b>{labCopy[id][lang].name}</b><small>{labCopy[id][lang].question}</small></button>)}</aside>
      <section className="lab-stage" aria-live="polite"><div className="trial-meta"><span>{currentLab.name.toUpperCase()}</span>{stage!=="intro"&&<span>{lang==="es"?"PRUEBA":"TEST"} {trialIndex+1}/{protocol.length}</span>}</div>{stage!=="intro"&&stage!=="result"&&<div className="trial-progress" aria-hidden="true"><i style={{width:`${((trialIndex+(stage==="respond"?1:0))/protocol.length)*100}%`}}/></div>}
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
          <div className="inline-audio-check">
            <div><b>{t.calibrationTitle}</b><p>{t.calibrationText}</p></div>
            <button className="button primary" onClick={testAudio}>{t.testAudio} ▶</button>
            <div className="compact-binary"><button disabled={!calibrationPlayed} className={heardCalibration===true?"chosen":""} onClick={()=>setHeardCalibration(true)}>{t.heard}</button><button disabled={!calibrationPlayed} className={heardCalibration===false?"chosen":""} onClick={()=>setHeardCalibration(false)}>{t.unheard}</button></div>
          </div>
          {heardCalibration===false&&<p className="troubleshoot">{t.troubleshoot}</p>}
          <div className="lab-summary"><p className="kicker">{t.labQuestion}</p><h3>{currentLab.question}</h3><p>{currentLab.detail}</p></div>
          <div className="session-length"><b>{t.sessionLengthTitle}</b><div role="group" aria-label={t.sessionLengthTitle}><button className={sessionLength===4?"chosen":""} aria-pressed={sessionLength===4} onClick={()=>setSessionLength(4)}>{t.quickSession}</button><button className={sessionLength===8?"chosen":""} aria-pressed={sessionLength===8} onClick={()=>setSessionLength(8)}>{t.fullSession}</button></div></div>
          {lab==="anchor"&&<div className="safety-box"><b>{t.safeTitle}</b><p>{t.safeText}</p><label>{lang==="es"?"Cualidad":"Quality"}<select value={anchorQuality} onChange={event=>setAnchorQuality(event.target.value)}>{safeQualities.map(option=><option key={option[0]} value={option[0]}>{option[lang==="es"?1:2]}</option>)}</select></label></div>}
          <label className="consent-check"><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)}/> {t.consent}</label>
          <button className="button primary" disabled={!consent||heardCalibration!==true} onClick={start}>{t.start} →</button>
        </div>}
        {stage==="ready"&&<div className="stage-card centered compact-stage"><p className="kicker">{t.before}</p><h2>{trialIndex===0?t.readyTitle:t.readyNext}</h2><p>{t.readyText}</p><fieldset className="quick-question"><legend>{t.expectation}</legend><div className="quick-scale"><button className={expectation===10?"chosen":""} onClick={()=>setExpectation(10)}>{t.low}</button><button className={expectation===50?"chosen":""} onClick={()=>setExpectation(50)}>{t.medium}</button><button className={expectation===90?"chosen":""} onClick={()=>setExpectation(90)}>{t.high}</button></div></fieldset><button className="button primary listen-button" onClick={beginTrial}>{t.listen} ▶</button></div>}
        {stage==="run"&&<div className="stage-card centered">{runPhase==="listen"&&trial.target!=="none"&&<div className={trial.target==="shape"?"visual-stimulus shape":trial.target==="state"?"state-stimulus":"visual-stimulus color"} style={{opacity:trial.visualStrength}} aria-label={trial.target==="state"?(safeQualities.find(option=>option[0]===anchorQuality)?.[lang==="es"?1:2]||anchorQuality):(trial.target==="color"?(lang==="es"?"Estímulo de color":"Color stimulus"):(lang==="es"?"Estímulo de forma":"Shape stimulus"))}>{trial.target==="state"&&(safeQualities.find(option=>option[0]===anchorQuality)?.[lang==="es"?1:2]||anchorQuality)}</div>}{trial.load==="moderate"&&runPhase==="listen"&&<div className="load-grid" aria-hidden="true">{Array.from({length:12},(_,index)=><i key={index}/>)}</div>}<p>{runPhase==="prepare"?t.preparing:t.listening}</p><button className="button ghost" onClick={stopAndRespond}>{t.stopRespond}</button></div>}
        {stage==="respond"&&<div className="stage-card compact-stage"><p className="kicker">{t.respondFirst}</p><h2>{t.happened}</h2><div className="binary big-answer"><button className={occurred===true?"chosen":""} aria-pressed={occurred===true} onClick={()=>setOccurred(true)}>{t.yes}</button><button className={occurred===false?"chosen":""} aria-pressed={occurred===false} onClick={()=>setOccurred(false)}>{t.no}</button></div>{occurred!==null&&<div className="response-detail">{occurred&&<label>{t.kind}<select value={category} onChange={event=>setCategory(event.target.value)}>{responseOptions.map(option=><option key={option[0]} value={option[0]}>{option[lang==="es"?1:2]}</option>)}</select></label>}<fieldset className="quick-question"><legend>{t.confidence}</legend><div className="quick-scale"><button className={confidence===25?"chosen":""} onClick={()=>setConfidence(25)}>{t.low}</button><button className={confidence===60?"chosen":""} onClick={()=>setConfidence(60)}>{t.medium}</button><button className={confidence===90?"chosen":""} onClick={()=>setConfidence(90)}>{t.high}</button></div></fieldset>{occurred&&<label>{t.note}<textarea maxLength={160} value={note} onChange={event=>setNote(event.target.value)} placeholder={lang==="es"?"Ej.: una forma redonda":"Example: a round shape"}/></label>}</div>}<button className="button primary" disabled={occurred===null} onClick={saveResponse}>{t.save} →</button></div>}
        {stage==="result"&&<div className="stage-card learning-result"><p className="kicker">{t.resultLabel}</p><h2>{t.resultTitle}</h2><p>{t.resultText}</p>
          <div className="learning-explanation"><b>{explainPersonalLearning(personalModel,lang)}</b><small>{lang==="es"?"La próxima sesión usa este resultado para repetir lo prometedor o explorar otra región. Siempre conserva controles.":"The next session uses this result to retest what looks promising or explore another region. It always keeps controls."}</small></div>
          <div className="learning-metrics">
            <div><span>{t.learnedFrom}</span><b>{personalModel.responseCount}</b></div>
            <div><span>{t.signalRate}</span><b>{personalModel.signalPositiveRate===null?"—":`${Math.round(personalModel.signalPositiveRate*100)}%`}</b></div>
            <div><span>{t.controlRate}</span><b>{personalModel.controlPositiveRate===null?"—":`${Math.round(personalModel.controlPositiveRate*100)}%`}</b></div>
            <div><span>{t.topCategory}</span><b>{topCategoryLabel||t.noCategory}</b></div>
          </div>
          <section className="collective-card" aria-labelledby="collective-title"><p className="kicker">APRENDIZAJE COLECTIVO</p><h3 id="collective-title">{t.collectiveTitle}</h3><p>{t.collectiveText}</p>
            {collectiveAvailable===true&&<p className="collective-count"><b>{collectiveSnapshot?.response_count??0}</b> {t.collectiveCount}</p>}
            {collectiveAvailable===false&&<p className="collective-unavailable">{t.collectiveUnavailable}</p>}
            <label className="consent-check"><input type="checkbox" checked={researchConsent} onChange={event=>setResearchConsent(event.target.checked)}/> {t.collectiveConsent}</label>
            <button className="button primary" disabled={!researchConsent||contributionBusy||collectiveAvailable!==true} onClick={contribute}>{contributionBusy?t.contributing:t.contribute}</button>
          </section>
          <div className="result-actions"><button className="button ghost" onClick={download}>{t.export}</button><button className="button ghost" onClick={()=>{setProtocolSeed(personalModel.nextProtocolSeed);setSessionPreferredSeeds(nextPreferredSeeds);setTrialIndex(0);setStage("intro")}}>{t.restart}</button></div>
        </div>}
        {message&&<p className="local-message" role="status">{message}</p>}</section>
    </div><div className="data-tools"><button onClick={download}>{t.exportAll}</button><button onClick={reportDiscomfort}>{t.discomfort}</button><button onClick={erase}>{t.erase}</button></div>
  </div>;
}
