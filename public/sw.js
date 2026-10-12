const VERSION = "odi-shell-v2";
const SHELL_ROUTES = ["/", "/book", "/offline"];
const SHELL_ASSETS = ["/icon.svg", "/icons/odi-192.png", "/icons/odi-512.png", "/odi.jpeg", "/gwest.jpeg"];
const PRIVATE_PREFIXES = ["/api", "/admin", "/account", "/orders", "/learner", "/instructor"];
const PUBLIC_ROUTES = new Set(SHELL_ROUTES);

function isPrivatePath(pathname) {
  return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}
function isPublicShellPath(pathname) {
  return PUBLIC_ROUTES.has(pathname === "/" ? "/" : pathname.replace(/\/$/, ""));
}
async function warmStaticAssets(cache, html) {
  const urls = new Set(SHELL_ASSETS.map((path) => new URL(path, self.location.origin).href));
  const matches = html.match(/(?:\/\/_next\/static\/[^"'\s<>]+|\/\/_next\/image\?[^"'\s<>]+)/g) || [];
  for (const match of matches) {
    try {
      const url = new URL(match.replace(/&amp;/g, "&"), self.location.origin);
      if (url.origin === self.location.origin) urls.add(url.href);
    } catch {}
  }
  await Promise.all([...urls].map(async (url) => {
    try {
      const response = await fetch(new Request(url, { cache: "reload", credentials: "same-origin" }));
      if (response.ok && response.type === "basic") await cache.put(url, response);
    } catch {}
  }));
}
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    for (const path of SHELL_ROUTES) {
      try {
        const response = await fetch(new Request(path, { cache: "reload", credentials: "same-origin" }));
        if (!response.ok || !(response.headers.get("content-type") || "").includes("text/html")) continue;
        await cache.put(path, response.clone());
        await warmStaticAssets(cache, await response.clone().text());
      } catch {}
    }
    // An update waits for the customer to choose Refresh; it never replaces an active session silently.
  })());
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => (key.startsWith("boemo-shell-") || key.startsWith("odi-shell-")) && key !== VERSION).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isPrivatePath(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const canonicalPath = url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");
      try {
        const response = await fetch(request);
        if (response.ok && isPublicShellPath(canonicalPath) && (response.headers.get("content-type") || "").includes("text/html")) {
          await cache.put(canonicalPath, response.clone());
        }
        return response;
      } catch {
        if (isPublicShellPath(canonicalPath)) {
          const cached = await caches.match(canonicalPath);
          if (cached) return cached;
        }
        return (await caches.match("/offline")) || Response.error();
      }
    })());
    return;
  }

  const isNextStatic = url.pathname.startsWith("/_next/static/");
  const isOptimizedImage = url.pathname === "/_next/image";
  const isPublicAsset = /\.(?:css|js|mjs|woff2?|ttf|otf|png|jpe?g|webp|svg|ico|avif)$/i.test(url.pathname);
  if (isNextStatic || isOptimizedImage || isPublicAsset) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok && response.type === "basic") {
          const cache = await caches.open(VERSION);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request)) || Response.error();
      }
    })());
  }
});
