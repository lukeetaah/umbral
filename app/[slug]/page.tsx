import { notFound } from "next/navigation";
import { PublicArticle } from "@/src/components/public-article";
import { publicPages } from "@/src/content/public-pages";
export function generateStaticParams(){return Object.keys(publicPages).map(slug=>({slug}));}
export default async function PublicPageRoute({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const page=publicPages[slug];if(!page)notFound();return <PublicArticle page={page}/>;}
