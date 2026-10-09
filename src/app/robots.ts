import type {MetadataRoute} from "next";
const baseUrl=process.env.NEXT_PUBLIC_BASE_URL||"http://localhost:3000";
export default function robots():MetadataRoute.Robots{return{rules:{userAgent:"*",allow:"/",disallow:["/admin","/account","/orders","/learner","/instructor"]},sitemap:baseUrl+"/sitemap.xml",host:baseUrl}}
