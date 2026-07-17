import type { Metadata } from "next";
import "./globals.css";
import { GlobalStop } from "@/src/components/global-stop";
import { SiteHeader } from "@/src/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://umbral-open.vercel.app"),
  title: { default: "UMBRAL — Open Perceptual Research", template: "%s · UMBRAL" },
  description: "Una plataforma abierta y gratuita para investigar cómo el sonido adquiere significado perceptual.",
  openGraph: { title: "UMBRAL — Open Perceptual Research", description: "¿Puede un sonido nuevo aprender a funcionar como llave para una sensación, un estado o un recuerdo?", type: "website", locale: "es_AR" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><a className="skip-link" href="#contenido">Saltar al contenido</a><SiteHeader/><GlobalStop/>{children}<footer className="site-footer"><span>UMBRAL v0.1.0-alpha.2 · AGPL-3.0</span><span>USD 0/mes · Sin publicidad · Sin venta de datos</span></footer></body></html>;
}
