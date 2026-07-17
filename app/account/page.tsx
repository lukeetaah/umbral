import type { Metadata } from "next";
import { AccountPanel } from "@/src/components/account-panel";
export const metadata:Metadata={title:"Cuenta opcional"};
export default function AccountPage(){return <main id="contenido" className="content-page shell"><div className="page-label">CUENTA OPCIONAL</div><h1>Guardá sólo lo que elijas</h1><p className="intro">El laboratorio funciona sin cuenta. Iniciar sesión habilita sincronización explícita con un proyecto Supabase Free configurado por el fundador.</p><AccountPanel/></main>}
