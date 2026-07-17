import { ImageResponse } from "next/og";
export const size={width:64,height:64};export const contentType="image/png";
export default function Icon(){return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#090c0c",color:"#c7f36a",border:"3px solid #c7f36a",fontSize:38,fontFamily:"monospace",fontWeight:700}}>U</div>,size)}
