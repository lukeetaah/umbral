import Link from "next/link";

const principles = [
  ["01", "Elegís", "Primero decidís si querés escuchar por auriculares o parlantes."],
  ["02", "Escuchás", "Oís sonidos cortos. A veces aparecen junto a un color o una forma."],
  ["03", "Contás", "Después decís si apareció algo en tu mente, o si no apareció nada."],
];

export default function Home() {
  return <main id="contenido">
    <section className="hero shell">
      <div className="eyebrow"><span className="pulse"/> INVESTIGACIÓN ABIERTA · TODO OCURRE EN TU NAVEGADOR</div>
      <h1>Escuchá un sonido.<br/><em>Contanos qué aparece.</em></h1>
      <p className="lede">UMBRAL prueba una idea simple: si repetimos un sonido junto a un color, una forma o una sensación, ¿el sonido puede hacértelo recordar después?</p>
      <div className="actions"><Link className="button primary" href="/demo">Probar el laboratorio local <span>→</span></Link><Link className="button ghost" href="/what-is-umbral">Entender en 15 segundos</Link></div>
      <p className="privacy-note">Sin cuenta. Sin micrófono. Tus datos permanecen en este dispositivo.</p>
      <div className="signal-field" aria-hidden="true"><div className="orb"/><div className="ring r1"/><div className="ring r2"/><div className="ring r3"/><span className="signal-label a">SEÑAL A</span><span className="signal-label b">RESPUESTA ?</span></div>
    </section>
    <section className="shell explainer"><div><p className="kicker">¿QUÉ TENÉS QUE HACER?</p><h2>Escuchar.<br/>Responder.</h2></div><p className="big-copy">Elegís por dónde escuchar, probás un tono y empezás. En cada prueba oís un sonido breve y contás, con tus palabras, si te hizo pensar o sentir algo. También podés responder “nada”. No hay respuestas correctas.</p></section>
    <section className="shell steps">{principles.map(([n,t,d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</section>
    <section className="shell boundary"><p className="kicker">UN LÍMITE IMPORTANTE</p><div><h2>No lee tu cerebro.<br/>No promete curar.</h2><p>No conoce tus ondas cerebrales y no puede afirmar que un sonido produzca un sabor real. Mide respuestas, incertidumbre y controles. Un resultado negativo también es un resultado.</p><Link href="/what-it-does-not-do">Ver todos los límites →</Link></div></section>
    <section className="shell labs-preview"><p className="kicker">CUATRO PREGUNTAS · CUATRO LABORATORIOS</p><div className="lab-grid"><article><b>ATLAS</b><h3>¿Un sonido te hace pensar en algo?</h3><p>Escuchás y contás qué apareció, sin opciones que te sugieran una respuesta.</p></article><article><b>APPRENTICESHIP</b><h3>¿Puede hacerte recordar una imagen?</h3><p>Primero unimos sonido e imagen. Después quitamos la imagen.</p></article><article><b>STATE GATE</b><h3>¿Respondés distinto según cómo llegás?</h3><p>Comparamos momentos tranquilos y momentos con una tarea visual.</p></article><article><b>ANCHOR</b><h3>¿Puede recordar una sensación segura?</h3><p>Trabaja solamente con sensaciones cómodas que vos elegís.</p></article></div></section>
    <section className="shell open-call"><div className="eyebrow">CIENCIA QUE PUEDE DECIR “NO ENCONTRAMOS NADA”</div><h2>La ambición abre la pregunta.<br/>Los controles deciden la respuesta.</h2><div className="actions"><Link className="button primary" href="/paper">Leer el paper vivo</Link><Link className="button ghost" href="/science">Explorar la evidencia</Link></div></section>
  </main>;
}
