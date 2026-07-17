"use client";
import { useEffect, useState } from "react";
export function GlobalStop() {
  const [stopped,setStopped] = useState(false);
  const stop = () => { window.dispatchEvent(new Event("umbral:stop")); setStopped(true); window.setTimeout(()=>setStopped(false),1200); };
  useEffect(() => { const onKeyDown=(event:KeyboardEvent)=>{if(event.key==="Escape"){window.dispatchEvent(new Event("umbral:stop"));setStopped(true);window.setTimeout(()=>setStopped(false),1200);}}; window.addEventListener("keydown",onKeyDown); return()=>window.removeEventListener("keydown",onKeyDown); },[]);
  return <><button className="global-stop" type="button" onClick={stop} aria-label="Detener todo el audio"><span>■</span> Detener audio <small>Esc</small></button><span className="sr-only" role="status">{stopped?"Audio detenido":""}</span></>;
}
