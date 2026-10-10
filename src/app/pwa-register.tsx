"use client";

import { useEffect, useRef, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function getBrowserEnvironment() {
  if (typeof window === "undefined") {
    return { standalone: true, android: false, embedded: false, ios: false };
  }
  const ua = navigator.userAgent || "";
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const android = /Android/i.test(ua);
  const ios =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const embedded =
    /WhatsApp|Instagram|FBAN|FBAV|Messenger|Line\/|Twitter|TikTok|Snapchat/i.test(ua) ||
    (android && /; wv\)/i.test(ua));
  return { standalone, android, embedded, ios };
}

export default function PwaRegister() {
  const [offline, setOffline] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [embedded, setEmbedded] = useState(false);
  const [androidEmbedded, setAndroidEmbedded] = useState(false);
  const reload = useRef(false);

  useEffect(() => {
    const env = getBrowserEnvironment();
    setOffline(!navigator.onLine);
    setEmbedded(env.embedded && !env.standalone);
    setAndroidEmbedded(env.embedded && env.android && !env.standalone);

    let registration: ServiceWorkerRegistration | null = null;
    const online = () => {
      setOffline(false);
      setReconnecting(true);
      window.setTimeout(() => setReconnecting(false), 1200);
    };
    const off = () => {
      setOffline(true);
      setReconnecting(false);
    };
    const install = (event: Event) => {
      if (env.embedded || env.standalone) return;
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const inspect = () => {
      if (registration?.waiting && navigator.serviceWorker.controller) {
        setWaiting(registration.waiting);
      }
    };
    const register = async () => {
      if (!("serviceWorker" in navigator)) return;
      try {
        registration = await navigator.serviceWorker.register("/sw.js");
        registration.addEventListener("updatefound", () => {
          registration?.installing?.addEventListener("statechange", inspect);
        });
        await registration.update();
        inspect();
      } catch {
        // The public site remains usable if service-worker registration fails.
      }
    };
    const changed = () => {
      if (reload.current) window.location.reload();
    };

    window.addEventListener("online", online);
    window.addEventListener("offline", off);
    window.addEventListener("beforeinstallprompt", install);
    navigator.serviceWorker?.addEventListener("controllerchange", changed);
    void register();

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", off);
      window.removeEventListener("beforeinstallprompt", install);
      navigator.serviceWorker?.removeEventListener("controllerchange", changed);
    };
  }, []);

  async function installApp() {
    if (!prompt) return;
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } finally {
      setPrompt(null);
    }
  }

  function openInBrowser() {
    const url = new URL(window.location.href);
    if (androidEmbedded) {
      // Launch Chrome with the current Odi URL, including its path and query.
      const path = url.pathname + url.search;
      window.location.href =
        "intent://" +
        url.host +
        path +
        "#Intent;scheme=" +
        url.protocol.replace(":", "") +
        ";package=com.android.chrome;end";
      return;
    }
    // iOS and other embedded browsers generally prohibit forcing an external
    // browser. Keep the destination visible and provide platform-specific steps.
    setEmbedded(false);
    window.setTimeout(() => {
      window.location.href = url.toString();
    }, 0);
  }

  function applyUpdate() {
    if (!waiting) return;
    reload.current = true;
    waiting.postMessage({ type: "SKIP_WAITING" });
    window.setTimeout(() => {
      if (reload.current) window.location.reload();
    }, 1800);
  }

  return (
    <>
      {embedded && (
        <div className="pwaBrowserGate" role="alertdialog" aria-modal="true" aria-labelledby="odi-browser-title" aria-describedby="odi-browser-message">
          <section className="pwaBrowserCard">
            <div className="pwaBrowserIcon" aria-hidden="true">↗</div>
            <p className="pwaBrowserEyebrow">ODI DRIVING SCHOOL · BOTSWANA</p>
            <h2 id="odi-browser-title">Open Odi in your browser</h2>
            <p id="odi-browser-message">
              For the best experience and to add Odi to your home screen, open this page in your phone's normal browser instead of WhatsApp or another app.
            </p>
            {androidEmbedded ? (
              <>
                <button className="pwaBrowserPrimary" type="button" onClick={openInBrowser}>Open in Chrome ↗</button>
                <p className="pwaBrowserHint">Chrome will open this same Odi page. Then use Chrome's menu to install or add it to your home screen.</p>
              </>
            ) : (
              <>
                <div className="pwaBrowserSteps">
                  <strong>How to continue</strong>
                  <p>Open this app's menu (usually <b>⋯</b> or <b>Share</b>) and choose <b>Open in browser</b>, <b>Open in Safari</b>, or <b>Open in Chrome</b>.</p>
                  <p>Once the page opens in your browser, you can continue using Odi normally.</p>
                </div>
                <button className="pwaBrowserPrimary" type="button" onClick={() => setEmbedded(false)}>Continue here for now</button>
              </>
            )}
          </section>
        </div>
      )}

      {offline && <div className="offlineBanner" role="status" aria-live="polite">Offline: previously loaded public Odi pages may remain available.</div>}
      {!offline && reconnecting && <div className="offlineBanner" role="status" aria-live="polite">Connection restored.</div>}
      {!embedded && prompt && <button className="pwaInstall" onClick={() => void installApp()}>Install Odi Driving School ↓</button>}
      {waiting && <div className="pwaUpdate" role="status" aria-live="polite"><div><strong>Odi update ready</strong><span>Refresh to use the latest version.</span></div><button onClick={applyUpdate}>Refresh</button></div>}
    </>
  );
}
