import type {Metadata,Viewport} from "next";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";
import PwaRegister from "@/app/pwa-register";
import "./globals.css";
import "./pwa.css";
const siteUrl=process.env.NEXT_PUBLIC_BASE_URL||"http://localhost:3000";
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:"Odi Driving School",template:"%s | Odi Driving School"},description:"A clearer path to learning to drive. Explore Odi Driving School and enquire about lessons.",applicationName:"Odi Driving School",keywords:["Odi Driving School","driving lessons","Gaborone","Botswana"],alternates:{canonical:"/"},openGraph:{type:"website",url:siteUrl,siteName:"Odi Driving School",title:"Odi Driving School",description:"A clearer path to learning to drive.",images:[{url:"/odi.jpeg",alt:"Odi Driving School instructor"}]},twitter:{card:"summary_large_image",title:"Odi Driving School",description:"A clearer path to learning to drive.",images:["/odi.jpeg"]},icons:{icon:"/icon.svg",apple:"/icon.svg"},manifest:"/manifest.webmanifest",appleWebApp:{capable:true,title:"Odi Driving",statusBarStyle:"default"}};
export const viewport:Viewport={themeColor:"#163C52",colorScheme:"light"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><PwaRegister/>{children}<Analytics/><SpeedInsights/></body></html>}
