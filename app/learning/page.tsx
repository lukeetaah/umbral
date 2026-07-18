import type { Metadata } from "next";
import { CollectiveLearningPanel } from "@/src/components/collective-learning-panel";

export const metadata:Metadata={title:"Qué está aprendiendo"};

export default function LearningPage(){return <main id="contenido" className="content-page shell learning-page"><div className="page-label">INTELIGENCIA ABIERTA</div><h1>Qué está aprendiendo UMBRAL</h1><p className="intro">Cada dispositivo construye un modelo personal. Sólo cuando una persona lo elige, sus respuestas mínimas se suman a este mapa colectivo. Las decisiones siguen siendo visibles y comparables con controles.</p><CollectiveLearningPanel/></main>}
