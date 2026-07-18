"use client";

import { useEffect, useState } from "react";
import { getCollectiveLearningSnapshot, type CollectiveLearningSnapshot } from "@/src/lib/supabase/sync";

const categoryLabels: Record<string,string> = {
  reconocimiento:"Reconocimiento", expectativa:"Expectativa", imagen:"Imagen mental", recuerdo:"Recuerdo",
  color:"Color", forma:"Forma", textura:"Textura", temperatura:"Temperatura", movimiento:"Movimiento",
  cuerpo:"Estado corporal", emocion:"Emoción", percepcion:"Percepción definida",
};

export function CollectiveLearningPanel() {
  const [snapshot,setSnapshot] = useState<CollectiveLearningSnapshot|null>(null);
  const [status,setStatus] = useState<"loading"|"ready"|"offline">("loading");

  useEffect(()=>{
    void getCollectiveLearningSnapshot().then(data=>{setSnapshot(data);setStatus(data?"ready":"offline")}).catch(()=>setStatus("offline"));
  },[]);

  if(status==="loading") return <section className="collective-dashboard loading" aria-live="polite">Leyendo el aprendizaje colectivo…</section>;
  if(status==="offline"||!snapshot) return <section className="collective-dashboard offline"><p className="kicker">TODAVÍA DESCONECTADO</p><h2>Por ahora, cada dispositivo aprende por separado.</h2><p>El laboratorio personal sigue funcionando. Cuando se conecte la base colectiva, las personas podrán aportar voluntariamente sin enviar texto libre ni identidad.</p></section>;

  const signalRate=snapshot.signal_positive_rate;
  const controlRate=snapshot.control_positive_rate;
  const lift=signalRate===null||controlRate===null?null:signalRate-controlRate;
  const categories=Object.entries(snapshot.category_counts).toSorted((a,b)=>b[1]-a[1]);

  return <section className="collective-dashboard" aria-live="polite">
    <div className="collective-dashboard-grid">
      <article><span>RESPUESTAS ANÓNIMAS</span><b>{snapshot.response_count}</b><p>Sin nombres, correos, cuentas ni texto libre.</p></article>
      <article><span>RESPUESTA CON SEÑAL</span><b>{signalRate===null?"—":`${Math.round(signalRate*100)}%`}</b><p>{snapshot.signal_count} pruebas con sonido o asociación.</p></article>
      <article><span>RESPUESTA EN CONTROL</span><b>{controlRate===null?"—":`${Math.round(controlRate*100)}%`}</b><p>{snapshot.control_count} pruebas sham o de preparación.</p></article>
      <article><span>DIFERENCIA</span><b>{lift===null?"—":`${lift>=0?"+":""}${Math.round(lift*100)} pts`}</b><p>Una diferencia positiva es una pista, no una conclusión.</p></article>
    </div>
    <div className="collective-lists">
      <article><p className="kicker">QUÉ APARECE MÁS</p><h3>Categorías informadas</h3>{categories.length?<ol>{categories.map(([category,count])=><li key={category}><span>{categoryLabels[category]??category}</span><b>{count}</b></li>)}</ol>:<p>Todavía no hay suficientes respuestas positivas.</p>}</article>
      <article><p className="kicker">SEÑALES PARA REPETIR</p><h3>Regiones prometedoras</h3>{snapshot.promising_genomes.length?<ol>{snapshot.promising_genomes.map(genome=><li key={genome.genome_hash}><span>Señal {genome.genome_hash.toUpperCase()}</span><b>{Math.round(genome.positive_rate*100)}% · n={genome.observations}</b></li>)}</ol>:<p>Ninguna señal se muestra hasta reunir al menos {snapshot.minimum_group_size} observaciones. Eso evita convertir una casualidad en un hallazgo.</p>}</article>
    </div>
    <div className="collective-boundary"><b>UMBRAL no busca un sonido “universal”.</b><p>Busca patrones compartidos y diferencias entre personas. Una señal sólo gana prioridad si se repite, supera a los controles y mantiene baja incertidumbre.</p></div>
  </section>;
}
