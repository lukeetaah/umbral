"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const path = usePathname();
  return <header className="site-header"><Link className="brand" href="/" aria-label="UMBRAL, inicio"><span>U</span> UMBRAL</Link><nav aria-label="Navegación principal"><Link href="/demo" className={path === "/demo" ? "active" : ""}>Laboratorios</Link><Link href="/science">Evidencia</Link><Link href="/paper">Paper</Link><Link href="/how-it-works">Cómo funciona</Link></nav><div className="header-meta"><Link href={path==="/"?"/en":"/"}>{path==="/en"?"ES":"EN"}</Link><span className="status-dot"/> LOCAL</div></header>;
}
