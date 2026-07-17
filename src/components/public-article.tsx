"use client";
import { useState } from "react";
import type { PublicPage } from "@/src/content/public-pages";

const headings:Record<string,string>={"En un minuto":"In one minute","Por qué importa":"Why it matters","Una secuencia, no una frecuencia mágica":"A sequence, not a magic frequency","Controles":"Controls","Asociar no es percibir":"Association is not perception","Sin técnicas ocultas":"No hidden techniques","Descubrimientos establecidos":"Established findings","Evidencia mixta":"Mixed evidence","No demostrado":"Not demonstrated","Sham":"Sham","Integración multisensorial":"Multisensory integration","Condicionamiento de segundo orden":"Second-order conditioning","Fenomenología":"Phenomenology","Escucha segura":"Safe listening","Cuándo detenerse":"When to stop","Lo que no pedimos":"What we do not request","Tus controles":"Your controls","Qué aceptás":"What you agree to","Qué no aceptás":"What you do not agree to","No uso clínico":"No clinical use","Licencia":"License"};

export function PublicArticle({page}:{page:PublicPage}) {
  const [lang,setLang]=useState<"es"|"en">("es");
  const heading=(value:string)=>lang==="es"?value:(headings[value]||value);
  return <main id="contenido" className="content-page shell" lang={lang}>
    <div className="page-label">{page.label}</div>
    <button className="lang-button page-lang" onClick={()=>setLang(lang==="es"?"en":"es")}>{lang==="es"?"Read in English":"Leer en español"}</button>
    <h1>{lang==="es"?page.title:page.english.title}</h1>
    <p className="intro">{lang==="es"?page.intro:page.english.intro}</p>
    <div className="content-grid"><aside>{page.sections.map((section,index)=><div key={section.title}>0{index+1} — {heading(section.title)}</div>)}</aside><article className="prose">{page.sections.map(section=><section key={section.title}><h2>{heading(section.title)}</h2><p>{lang==="es"?section.body:section.english}</p></section>)}</article></div>
  </main>;
}
