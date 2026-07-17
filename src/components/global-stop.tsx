"use client";
export function GlobalStop() {
  return <button className="global-stop" type="button" onClick={() => window.dispatchEvent(new Event("umbral:stop"))} aria-label="Detener todo el audio"><span>■</span> Detener audio</button>;
}
