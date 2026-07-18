"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const path = usePathname();
  return <header className="site-header"><Link className="brand" href="/" aria-label="UMBRAL, inicio"><span>U</span> UMBRAL</Link><nav aria-label="Navegación principal"><Link href="/demo" className={path === "/demo" ? "active" : ""}>Laboratorios</Link><Link href="/learning" className={path === "/learning" ? "active" : ""}>Aprendizaje</Link><Link href="/science" className={path === "/science" ? "active" : ""}>Evidencia</Link><Link href="/paper" className={path === "/paper" ? "active" : ""}>Paper</Link><Link href="/how-it-works" className={path === "/how-it-works" ? "active" : ""}>Cómo funciona</Link></nav><div className="header-meta">{path!=="/demo"&&<Link href={path==="/en"?"/":"/en"} aria-label={path==="/en"?"Ir al inicio en español":"Go to the English home"}>{path==="/en"?"ES":"EN"}</Link>}<span className="status-dot"/> LOCAL</div></header>;
}
