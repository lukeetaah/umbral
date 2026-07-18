"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { UmbralAudioEngine } from "@/src/lib/audio/engine";
import { clearLocal, exportLocal, listLocal, saveLocal } from "@/src/lib/local-store";
import { buildPersonalLearningModel, type PersonalLearningModel } from "@/src/lib/learning-engine";
import { contributeLocalSessions, getCollectiveLearningSnapshot, type CollectiveLearningSnapshot } from "@/src/lib/supabase/sync";
import { genomeFromSeed, hashGenome } from "@/src/lib/stimulus-genome";
import type { LabId } from "@/src/lib/protocol-engine";
import {
  buildOutcome,
  experiencePlans,
  labExperienceCopy,
  localize,
  plannedMinutes,
  resolveStep,
  type ExperienceResponse,
  type ExperienceStep,
  type Language,
} from "@/src/lib/participant-engine";

type Stage = "intro" | "experience" | "reveal" | "result";
type OutputSupport = "checking" | "selectable" | "default-only";

const ui = {
  es:{
    title:"Experiencias perceptuales",privacy:"Tu recorrido aprende en este dispositivo. Nada sale sin que lo elijas.",local:"PRIVADO · LOCAL",choose:"Elegí una experiencia",audioTitle:"Primero: escuchá una diferencia real",audioText:"Este contraste confirma el audio y te muestra cómo funciona UMBRAL: escuchar, elegir y descubrir.",chooseOutput:"Elegir parlante o auriculares",outputDefault:"Se usará la salida predeterminada del sistema.",outputChecking:"Comprobando salidas…",outputSelected:"Salida elegida",test:"Probar audio A/B",testing:"Reproduciendo A/B…",heard:"Se oye claro",unheard:"No se oye",troubleshoot:"Revisá que la pestaña no esté silenciada, elegí otra salida o subí apenas el volumen.",begin:"Entrar a la experiencia",safety:"Volumen cómodo · podés detenerte cuando quieras · no hay respuestas correctas",listen:"Escuchar",replay:"Escuchar otra vez",playing:"Escuchando",chooseAnswer:"Elegí lo primero que apareció",continue:"Seguir",finish:"Ver mi resultado",discovered:"LO QUE ACABA DE PASAR",result:"TU PATRÓN",whatChanged:"QUÉ CAMBIÓ",whyReturn:"POR QUÉ VOLVER",another:"Elegir otra experiencia",repeat:"Repetir otro día",contribute:"Aportar este patrón anónimamente",contributing:"Aportando…",contributed:"Patrón aportado al aprendizaje colectivo.",collectiveUnavailable:"El aprendizaje colectivo todavía no está conectado. El aprendizaje personal sí quedó guardado.",download:"Descargar mis datos",discomfort:"Me incomoda: detener",erase:"Borrar todo y reiniciar",erased:"Datos locales eliminados.",stopped:"Audio detenido. Podés salir o elegir otra experiencia.",error:"No se pudo iniciar el audio.",outputCancelled:"No se cambió la salida.",progress:"recorrido",minutes:"min",returnSmall:"UMBRAL va a volver a probar este patrón en otra sesión, sin eliminar los controles.",safeQuality:"¿Qué cualidad cómoda querés usar?",safeHelp:"Elegí algo cotidiano y seguro; no uses trauma ni un recuerdo íntimo.",english:"EN",
  },
  en:{
    title:"Perceptual experiences",privacy:"Your path learns on this device. Nothing leaves unless you choose it.",local:"PRIVATE · LOCAL",choose:"Choose an experience",audioTitle:"First: hear a real difference",audioText:"This contrast checks audio and shows how UMBRAL works: listen, choose, discover.",chooseOutput:"Choose speaker or headphones",outputDefault:"The system default output will be used.",outputChecking:"Checking outputs…",outputSelected:"Selected output",test:"Test A/B audio",testing:"Playing A/B…",heard:"Sounds clear",unheard:"No sound",troubleshoot:"Check that the tab is not muted, choose another output, or raise the volume slightly.",begin:"Enter the experience",safety:"Comfortable volume · stop whenever you want · no correct answers",listen:"Listen",replay:"Listen again",playing:"Listening",chooseAnswer:"Choose what appeared first",continue:"Continue",finish:"See my result",discovered:"WHAT JUST HAPPENED",result:"YOUR PATTERN",whatChanged:"WHAT CHANGED",whyReturn:"WHY RETURN",another:"Choose another experience",repeat:"Repeat another day",contribute:"Contribute this pattern anonymously",contributing:"Contributing…",contributed:"Pattern contributed to collective learning.",collectiveUnavailable:"Collective learning is not connected yet. Personal learning was saved.",download:"Download my data",discomfort:"Uncomfortable: stop",erase:"Erase everything and restart",erased:"Local data erased.",stopped:"Audio stopped. You can leave or choose another experience.",error:"Audio could not be started.",outputCancelled:"Output was not changed.",progress:"journey",minutes:"min",returnSmall:"UMBRAL will retest this pattern in another session without removing controls.",safeQuality:"Which comfortable quality do you want to use?",safeHelp:"Choose something ordinary and safe; do not use trauma or an intimate memory.",english:"ES",
  },
} as const;

const safeQualities = [
  {id:"calma",es:"Calma",en:"Calm"},{id:"calidez",es:"Calidez",en:"Warmth"},{id:"alivio",es:"Alivio",en:"Relief"},{id:"curiosidad",es:"Curiosidad",en:"Curiosity"},{id:"amplitud",es:"Amplitud",en:"Spaciousness"},
];

export function DemoLab() {
  const [lab,setLab] = useState<LabId>("atlas");
  const [lang,setLang] = useState<Language>("es");
  const [stage,setStage] = useState<Stage>("intro");
  const [stepIndex,setStepIndex] = useState(0);
  const [responses,setResponses] = useState<ExperienceResponse[]>([]);
  const [playing,setPlaying] = useState(false);
  const [played,setPlayed] = useState(false);
  const [message,setMessage] = useState("");
  const [calibrationPlayed,setCalibrationPlayed] = useState(false);
  const [audioConfirmed,setAudioConfirmed] = useState(false);
  const [outputSupport,setOutputSupport] = useState<OutputSupport>("checking");
  const [outputBusy,setOutputBusy] = useState(false);
  const [outputLabel,setOutputLabel] = useState("");
  const [anchorQuality,setAnchorQuality] = useState("calma");
  const [personalModel,setPersonalModel] = useState<PersonalLearningModel>(()=>buildPersonalLearningModel([]));
  const [collective,setCollective] = useState<CollectiveLearningSnapshot|null>(null);
  const [contributionBusy,setContributionBusy] = useState(false);
  const [contributed,setContributed] = useState(false);
  const [sessionStartedAt,setSessionStartedAt] = useState(0);
  const [answerStartedAt,setAnswerStartedAt] = useState(0);
  const engine = useRef<UmbralAudioEngine|null>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const runToken = useRef(0);
  const t = ui[lang];
  const plan = experiencePlans[lab];
  const preferredSeeds = useMemo(() => Array.from(new Set([...personalModel.promisingSeeds.map(item=>item.seed),...(collective?.promising_genomes.map(item=>item.seed)??[])])).slice(0,2),[personalModel,collective]);
  const step = useMemo(() => resolveStep(plan[stepIndex]??plan[0],responses,preferredSeeds),[plan,stepIndex,responses,preferredSeeds]);
  const outcome = useMemo(() => buildOutcome(lab,responses,lang),[lab,responses,lang]);
  const progress = stage === "result" ? 100 : Math.round((stepIndex + (stage === "reveal" ? 1 : 0)) / plan.length * 100);

  const stopRun = () => {
    runToken.current += 1;
    for (const timer of timers.current) clearTimeout(timer);
    timers.current.clear();
    engine.current?.stop();
    setPlaying(false);
  };

  const wait = (milliseconds:number) => new Promise<void>(resolve => {
    const timer = setTimeout(() => { timers.current.delete(timer); resolve(); },milliseconds);
    timers.current.add(timer);
  });

  useEffect(() => {
    engine.current = new UmbralAudioEngine();
    setOutputSupport(engine.current.canSelectOutput()?"selectable":"default-only");
    void listLocal().then(records=>setPersonalModel(buildPersonalLearningModel(records))).catch(()=>undefined);
    void getCollectiveLearningSnapshot().then(setCollective).catch(()=>setCollective(null));
    const globalStop = () => { stopRun(); setMessage(t.stopped); };
    window.addEventListener("umbral:stop",globalStop);
    return () => { window.removeEventListener("umbral:stop",globalStop); stopRun(); void engine.current?.close(); };
    // The audio engine and global emergency stop are intentionally created once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const playMoments = async (targetStep:ExperienceStep) => {
    stopRun();
    const token = runToken.current;
    setMessage("");
    setPlaying(true);
    setPlayed(false);
    try {
      for (const moment of targetStep.audio) {
        if (token !== runToken.current) return;
        const genome = {...genomeFromSeed(moment.seed,moment.sham),durationMs:moment.durationMs};
        if (moment.sham) await wait(moment.durationMs);
        else {
          await engine.current?.play(genome);
          await wait(moment.durationMs+650);
        }
        if (token !== runToken.current) return;
      }
      setPlayed(true);
      setAnswerStartedAt(performance.now());
    } catch(error) {
      setMessage(error instanceof Error?error.message:t.error);
    } finally {
      if (token === runToken.current) setPlaying(false);
    }
  };

  const testAudio = async () => {
    stopRun();
    const token = runToken.current;
    setMessage(""); setCalibrationPlayed(false); setPlaying(true);
    try {
      const left={...genomeFromSeed(1901),durationMs:2600,carrierHz:260,pan:-0.38 as number,waveform:"triangle" as const,gain:.13};
      const right={...genomeFromSeed(1902),durationMs:2600,carrierHz:620,pan:.38 as number,waveform:"sine" as const,gain:.13};
      await engine.current?.play(left); await wait(3200);
      if(token!==runToken.current)return;
      await engine.current?.play(right); await wait(3200);
      if(token===runToken.current)setCalibrationPlayed(true);
    } catch(error) { setMessage(error instanceof Error?error.message:t.error); }
    finally { if(token===runToken.current)setPlaying(false); }
  };

  const chooseOutput = async () => {
    setOutputBusy(true); setMessage("");
    try {
      const selected=await engine.current?.selectOutput();
      if(selected)setOutputLabel(selected.label);
    } catch(error) { setMessage(error instanceof Error?error.message:t.outputCancelled); }
    finally { setOutputBusy(false); }
  };

  const switchLab = (next:LabId) => {
    stopRun(); setLab(next); setStage("intro"); setStepIndex(0); setResponses([]); setPlayed(false); setMessage(""); setContributed(false);
  };

  const startJourney = async () => {
    const started=Date.now();
    setSessionStartedAt(started); setResponses([]); setStepIndex(0); setStage("experience"); setPlayed(false); setMessage("");
    await saveLocal({id:crypto.randomUUID(),createdAt:new Date().toISOString(),kind:"consent",payload:{scope:"participant-experience",comfortableVolume:true,canStop:true,lab,language:lang}});
    await playMoments(resolveStep(plan[0],[],preferredSeeds));
  };

  const chooseResponse = async (choiceId:string,eventTime:number) => {
    if(!played||playing)return;
    const selected=step.choices.find(item=>item.id===choiceId);
    const response:ExperienceResponse={stepId:step.id,choiceId,value:selected?.value,latencyMs:Math.max(0,eventTime-answerStartedAt),hiddenCondition:step.hiddenCondition,seed:step.audio[0]?.seed??0,correct:step.correctChoice?choiceId===step.correctChoice:undefined};
    const nextResponses=[...responses,response];
    setResponses(nextResponses); setStage("reveal");
    const genome={...genomeFromSeed(response.seed,step.hiddenCondition==="sham"||step.hiddenCondition==="preparation"),durationMs:step.audio[0]?.durationMs??1800};
    await saveLocal({id:crypto.randomUUID(),createdAt:new Date().toISOString(),kind:"session",payload:{lab,experienceVersion:"1.0",stepId:step.id,trial:{condition:step.hiddenCondition,seed:response.seed,cue:step.cue,phase:step.chapter.es},genomeHash:hashGenome(genome),occurred:choiceId!=="none"&&choiceId!=="no",category:choiceId,confidence:75,expectation:50,latencyMs:response.latencyMs,anchorQuality:lab==="anchor"?anchorQuality:undefined,language:lang,sessionStartedAt}});
    const records=await listLocal();
    const model=buildPersonalLearningModel(records); setPersonalModel(model);
    await saveLocal({id:"personal-model-v1",createdAt:new Date().toISOString(),kind:"model",payload:{...model}});
  };

  const continueJourney = async () => {
    if(stepIndex>=plan.length-1){ setStage("result"); setPlaying(false); return; }
    const nextIndex=stepIndex+1;
    const nextStep=resolveStep(plan[nextIndex],responses,preferredSeeds);
    setStepIndex(nextIndex); setStage("experience"); setPlayed(false);
    await playMoments(nextStep);
  };

  const download = async () => {
    const blob=new Blob([await exportLocal()],{type:"application/json"}); const url=URL.createObjectURL(blob); const anchor=document.createElement("a"); anchor.href=url; anchor.download="umbral-personal.json"; anchor.click(); URL.revokeObjectURL(url);
  };

  const erase = async () => {
    stopRun(); await clearLocal(); setPersonalModel(buildPersonalLearningModel([])); setStage("intro"); setStepIndex(0); setResponses([]); setAudioConfirmed(false); setCalibrationPlayed(false); setMessage(t.erased);
  };

  const reportDiscomfort = async () => {
    stopRun(); await saveLocal({id:crypto.randomUUID(),createdAt:new Date().toISOString(),kind:"adverse-event",payload:{lab,stepId:step.id,sessionStartedAt}}); setMessage(t.stopped); setStage("intro");
  };

  const contribute = async () => {
    setContributionBusy(true); setMessage("");
    try { await contributeLocalSessions(); setContributed(true); setMessage(t.contributed); }
    catch { setMessage(t.collectiveUnavailable); }
    finally { setContributionBusy(false); }
  };

  const currentLab=labExperienceCopy[lab];
  const safeQuality=safeQualities.find(item=>item.id===anchorQuality)?.[lang]??anchorQuality;

  return <div className="demo-shell participant-shell" lang={lang} style={{"--lab-accent":currentLab.accent} as React.CSSProperties}>
    <header className="demo-top participant-top">
      <div><span className="local-badge">● {t.local}</span><h1>{t.title}</h1><p>{t.privacy}</p></div>
      <button className="lang-button" onClick={()=>setLang(value=>value==="es"?"en":"es")}>{t.english}</button>
    </header>

    <section className="experience-picker" aria-label={t.choose}>
      <p className="kicker">{t.choose}</p>
      <div>{(Object.keys(labExperienceCopy) as LabId[]).map((id,index)=>{const item=labExperienceCopy[id];return <button key={id} className={id===lab?"selected":""} onClick={()=>switchLab(id)} aria-pressed={id===lab}><span>0{index+1}</span><b>{item.name}</b><small>{localize(item.promise,lang)}</small></button>})}</div>
    </section>

    <section className="participant-stage" aria-live="polite">
      {stage!=="intro"&&<div className="journey-progress" aria-label={`${progress}% ${t.progress}`}><i style={{width:`${progress}%`}}/><span>{currentLab.name} · {Math.min(stepIndex+1,plan.length)}/{plan.length}</span></div>}

      {stage==="intro"&&<section className="experience-intro">
        <div className="experience-promise"><p className="kicker">{currentLab.name} · {localize(currentLab.duration,lang)}</p><h2>{localize(currentLab.promise,lang)}</h2><p>{localize(currentLab.description,lang)}</p><div className={`lab-signature signature-${lab}`} aria-hidden="true"><i/><i/><i/></div></div>
        <div className="audio-entry">
          <p className="kicker">00 · AUDIO</p><h3>{t.audioTitle}</h3><p>{t.audioText}</p>
          {outputSupport==="selectable"&&<button className="output-choice" disabled={outputBusy} onClick={chooseOutput}>{outputBusy?t.outputChecking:t.chooseOutput}</button>}
          <small className="output-note">{outputLabel?`${t.outputSelected}: ${outputLabel}`:outputSupport==="checking"?t.outputChecking:t.outputDefault}</small>
          <div className={`ab-meter ${playing?"playing":""}`} aria-hidden="true"><span>A</span><i/><i/><i/><i/><span>B</span></div>
          <button className="button primary audio-test" disabled={playing} onClick={testAudio}>{playing?t.testing:`${t.test} ▶`}</button>
          {calibrationPlayed&&<div className="audio-confirm"><button onClick={()=>{setAudioConfirmed(true);setMessage("");}}>{t.heard}</button><button onClick={()=>{setAudioConfirmed(false);setMessage(t.troubleshoot);}}>{t.unheard}</button></div>}
          {audioConfirmed&&<button className="button journey-start" onClick={startJourney}>{t.begin} <span>→</span></button>}
          <p className="safety-line">{t.safety}</p>
        </div>
        {lab==="anchor"&&<fieldset className="quality-picker"><legend>{t.safeQuality}</legend><p>{t.safeHelp}</p><div>{safeQualities.map(item=><button key={item.id} className={anchorQuality===item.id?"chosen":""} onClick={()=>setAnchorQuality(item.id)}>{item[lang]}</button>)}</div></fieldset>}
      </section>}

      {stage==="experience"&&<section className={`experience-step kind-${step.kind}`}>
        <div className="step-copy"><p className="kicker">{localize(step.chapter,lang)}</p><h2>{localize(step.title,lang)}</h2><p>{localize(step.instruction,lang)}</p>{lab==="anchor"&&<small>{safeQuality}</small>}</div>
        <ExperienceVisual step={step} playing={playing} lang={lang}/>
        <div className="step-action">
          {!playing&&!played&&<button className="button primary" onClick={()=>playMoments(step)}>{t.listen} ▶</button>}
          {playing&&<div className="listening-state"><span/><b>{t.playing}…</b><small>{step.audio.length>1?`${step.audio.length} momentos`:""}</small></div>}
          {played&&<><p className="answer-prompt">{t.chooseAnswer}</p><div className={`experience-choices choices-${step.choices.length}`}>{step.choices.map(item=><button key={item.id} onClick={event=>chooseResponse(item.id,event.timeStamp)}>{localize(item.label,lang)}</button>)}</div><button className="replay-link" onClick={()=>playMoments(step)}>↻ {t.replay}</button></>}
        </div>
      </section>}

      {stage==="reveal"&&<section className="discovery-card">
        <div className="discovery-index"><span>{String(stepIndex+1).padStart(2,"0")}</span><i/></div>
        <div><p className="kicker">{t.discovered}</p><h2>{localize(step.discovery,lang)}</h2><p>{responses.at(-1)?.correct===false&&lab==="apprenticeship"?(lang==="es"?"No pasa nada: el próximo bloque mantiene un poco más de ayuda visual.":"That is okay: the next block keeps a little more visual support."):localize(step.title,lang)}</p><button className="button primary" onClick={continueJourney}>{stepIndex===plan.length-1?t.finish:t.continue} →</button></div>
      </section>}

      {stage==="result"&&<section className={`personal-result result-${lab}`}>
        <div className="result-orbit" style={{"--score":`${outcome.score*3.6}deg`} as React.CSSProperties}><div><strong>{outcome.primaryValue}</strong><small>{localize(outcome.primaryLabel,lang)}</small></div></div>
        <div className="result-story"><p className="kicker">{t.result} · {currentLab.name}</p><h2>{localize(outcome.headline,lang)}</h2><p className="result-finding">{localize(outcome.finding,lang)}</p><div className="result-evidence"><span><b>{localize(outcome.secondaryLabel,lang)}</b><strong>{outcome.secondaryValue}</strong></span><p><b>{t.whatChanged}</b>{localize(outcome.evidence,lang)}</p></div><div className="return-card"><b>{t.whyReturn}</b><p>{localize(outcome.returnReason,lang)}</p><small>{t.returnSmall}</small></div><div className="result-actions"><button className="button primary" onClick={()=>switchLab(lab)}>{t.repeat}</button><button className="button" onClick={()=>{stopRun();setStage("intro");setResponses([]);setStepIndex(0);}}>{t.another}</button></div><button className="contribute-link" disabled={contributionBusy||contributed} onClick={contribute}>{contributionBusy?t.contributing:contributed?t.contributed:t.contribute}</button></div>
      </section>}

      {message&&<p className="participant-message" role="status">{message}</p>}
    </section>

    <footer className="participant-tools"><span>{currentLab.name} · ≈ {plannedMinutes(lab)} {t.minutes}</span><div><button onClick={download}>{t.download}</button><button className="danger" onClick={reportDiscomfort}>{t.discomfort}</button><button onClick={erase}>{t.erase}</button></div></footer>
  </div>;
}

function ExperienceVisual({step,playing,lang}:{step:ExperienceStep;playing:boolean;lang:Language}) {
  if(step.visual==="split")return <div className={`experience-visual split-sound ${playing?"active":""}`} aria-label={lang==="es"?"Contraste entre dos sonidos":"Contrast between two sounds"}><div><span>A</span></div><i/><div><span>B</span></div></div>;
  if(step.visual==="glyphs")return <div className={`experience-visual glyph-field ${playing?"active":""}`} aria-label={lang==="es"?"Figuras asociadas":"Associated shapes"}><i className="diamond"/><i className="hollow"/><i className="waves"/></div>;
  if(step.visual==="grid")return <div className={`experience-visual attention-field ${playing?"active":""}`} aria-label={lang==="es"?"Tarea visual de atención":"Visual attention task"}>{Array.from({length:16},(_,index)=><i key={index}/>)}</div>;
  if(step.visual==="breath")return <div className={`experience-visual breath-field ${playing?"active":""}`} aria-label={lang==="es"?"Guía de respiración cómoda":"Comfortable breathing guide"}><i/><span>{lang==="es"?"sin forzar":"no forcing"}</span></div>;
  if(step.visual==="empty")return <div className={`experience-visual absence-field ${playing?"active":""}`} aria-label={lang==="es"?"Espacio de escucha":"Listening space"}><i/><span>…</span></div>;
  return <div className={`experience-visual sound-orb ${playing?"active":""}`} aria-label={lang==="es"?"Sonido en reproducción":"Sound playing"}><i/><i/><i/></div>;
}
