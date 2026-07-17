import type { Metadata } from "next";
import { DemoLab } from "@/src/components/demo-lab";
export const metadata: Metadata = { title: "Laboratorio local" };
export default function DemoPage() { return <main id="contenido" className="demo-page"><DemoLab/></main>; }
