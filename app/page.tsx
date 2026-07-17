import Link from "next/link";

const principles = [
  ["01", "Asociar", "Un sonido procedural aparece junto a una experiencia simple."],
  ["02", "Retirar", "La experiencia se reduce o desaparece, con controles sham."],
  ["03", "Medir", "Registramos qué reaparece, con cuánta confianza y por cuánto tiempo."],
];

export default function Home() {
  return <main id="contenido">
    <section className="hero shell">
      <div className="eyebrow"><span className="pulse"/> INVESTIGACIÓN ABIERTA · TODO OCURRE EN TU NAVEGADOR</div>
      <h1>¿Puede un sonido<br/><em>aprender a significar?</em></h1>
      <p className="lede">UMBRAL investiga si un sonido nuevo puede aprender a funcionar como una llave para una sensación, un estado o un recuerdo.</p>
      <div className="actions"><Link className="button primary" href="/demo">Probar el laboratorio local <span>→</span></Link><Link className="button ghost" href="/what-is-umbral">Entender en 15 segundos</Link></div>
      <p className="privacy-note">Sin cuenta. Sin micrófono. Tus datos permanecen en este dispositivo.</p>
      <div className="signal-field" aria-hidden="true"><div className="orb"/><div className="ring r1"/><div className="ring r2"/><div className="ring r3"/><span className="signal-label a">SEÑAL A</span><span className="signal-label b">RESPUESTA ?</span></div>
    </section>
    <section className="shell explainer"><div><p className="kicker">EL EXPERIMENTO, EN CLARO</p><h2>Combina. Retira.<br/>Comprueba.</h2></div><p className="big-copy">Primero escuchás un sonido mientras observás un color. Después el color desaparece. UMBRAL comprueba si el sonido conserva una relación estable con ese color y si la relación aparece nuevamente otro día.</p></section>
    <section className="shell steps">{principles.map(([n,t,d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</section>
    <section className="shell boundary"><p className="kicker">UN LÍMITE IMPORTANTE</p><div><h2>No lee tu cerebro.<br/>No promete curar.</h2><p>No conoce tus ondas cerebrales y no puede afirmar que un sonido produzca un sabor real. Mide respuestas, incertidumbre y controles. Un resultado negativo también es un resultado.</p><Link href="/what-it-does-not-do">Ver todos los límites →</Link></div></section>
    <section className="shell labs-preview"><p className="kicker">CUATRO PREGUNTAS · CUATRO LABORATORIOS</p><div className="lab-grid"><article><b>ATLAS</b><h3>¿Qué aparece espontáneamente?</h3><p>Busca asociaciones sin revelar primero las categorías.</p></article><article><b>APPRENTICESHIP</b><h3>¿Puede aprenderse?</h3><p>Entrena, retira y transfiere señales.</p></article><article><b>STATE GATE</b><h3>¿Importa el estado previo?</h3><p>Compara preparación, carga y expectativa.</p></article><article><b>ANCHOR</b><h3>¿Puede recuperarse?</h3><p>Trabaja con estados seguros y elegidos.</p></article></div></section>
    <section className="shell open-call"><div className="eyebrow">CIENCIA QUE PUEDE DECIR “NO ENCONTRAMOS NADA”</div><h2>La ambición abre la pregunta.<br/>Los controles deciden la respuesta.</h2><div className="actions"><Link className="button primary" href="/paper">Leer el paper vivo</Link><Link className="button ghost" href="/science">Explorar la evidencia</Link></div></section>
  </main>;
}
