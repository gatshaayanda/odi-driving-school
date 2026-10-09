import type {MetadataRoute} from "next";
const baseUrl=process.env.NEXT_PUBLIC_BASE_URL||"http://localhost:3000";
export default function sitemap():MetadataRoute.Sitemap{return[{url:baseUrl,changeFrequency:"weekly",priority:1},{url:baseUrl+"/book",changeFrequency:"monthly",priority:0.6}]}
