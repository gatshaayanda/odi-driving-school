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
  const [iosDevice, setIosDevice] = useState(false);
  const [androidDevice, setAndroidDevice] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [installHelpOpen, setInstallHelpOpen] = useState(false);
  const reload = useRef(false);

  useEffect(() => {
    const env = getBrowserEnvironment();
    setOffline(!navigator.onLine);
    setEmbedded(env.embedded && !env.standalone);
    setAndroidEmbedded(env.embedded && env.android && !env.standalone);
    setIosDevice(env.ios);
    setAndroidDevice(env.android);
    setStandalone(env.standalone);

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
    if (!prompt) {
      setInstallHelpOpen(true);
      return;
    }
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } finally {
      setPrompt(null);
      setInstallHelpOpen(false);
    }
  }

  function openInBrowser() {
    const url = new URL(window.location.href);
    if (!androidEmbedded) return;
    const path = url.pathname + url.search + url.hash;
    window.location.href =
      "intent://" +
      url.host +
      path +
      "#Intent;scheme=" +
      url.protocol.replace(":", "") +
      ";package=com.android.chrome;end";
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
        <div className="pwaBrowserGate" role="dialog" aria-modal="true" aria-labelledby="odi-browser-title" aria-describedby="odi-browser-message">
          <section className="pwaBrowserCard">
            <div className="pwaBrowserIcon" aria-hidden="true">↗</div>
            <p className="pwaBrowserEyebrow">ODI DRIVING SCHOOL · BOTSWANA</p>
            <h2 id="odi-browser-title">Open Odi in your browser</h2>
            <p id="odi-browser-message">
              You can browse Odi on this page, but your phone&apos;s normal browser offers the best route to adding it to your home screen.
            </p>
            {androidEmbedded ? (
              <>
                <button className="pwaBrowserPrimary" type="button" onClick={openInBrowser}>Open this page in Chrome ↗</button>
                <p className="pwaBrowserHint">This opens the same Odi page in Chrome when your phone allows it. Then tap “Add Odi to Home Screen” on the page.</p>
                <button className="pwaBrowserSecondary" type="button" onClick={() => setEmbedded(false)}>Keep browsing here</button>
                <button className="pwaBrowserSecondary" type="button" onClick={() => { setEmbedded(false); setInstallHelpOpen(true); }}>Show install options</button>
              </>
            ) : (
              <>
                <div className="pwaBrowserSteps">
                  <strong>Open in your normal browser</strong>
                  <p>Use this app&apos;s menu (usually ⋯ or Share) and choose <b>Open in browser</b>, <b>Open in Safari</b>, or <b>Open in Chrome</b>.</p>
                </div>
                <button className="pwaBrowserPrimary" type="button" onClick={() => setEmbedded(false)}>Continue to Odi</button>
                <button className="pwaBrowserSecondary" type="button" onClick={() => { setEmbedded(false); setInstallHelpOpen(true); }}>Show install options</button>
              </>
            )}
          </section>
        </div>
      )}

      {offline && <div className="offlineBanner" role="status" aria-live="polite">Offline: previously loaded public Odi pages may remain available.</div>}
      {!offline && reconnecting && <div className="offlineBanner" role="status" aria-live="polite">Connection restored.</div>}

      {!standalone && (
        <button className="pwaInstall" type="button" onClick={() => void installApp()}>
          {prompt ? "Install Odi Driving School ↓" : "Add Odi to Home Screen ↓"}
        </button>
      )}

      {installHelpOpen && (
        <div className="pwaBrowserGate pwaInstallHelpGate" role="dialog" aria-modal="true" aria-labelledby="odi-install-title" aria-describedby="odi-install-message">
          <section className="pwaBrowserCard">
            <button className="pwaClose" type="button" onClick={() => setInstallHelpOpen(false)} aria-label="Close install instructions">×</button>
            <div className="pwaBrowserIcon" aria-hidden="true">⌂</div>
            <p className="pwaBrowserEyebrow">YOUR SHORTCUT TO ODI</p>
            <h2 id="odi-install-title">{prompt ? "Install Odi" : "Add Odi to your home screen"}</h2>
            <p id="odi-install-message">
              {prompt
                ? "Your browser supports installation. Tap below to open its install confirmation."
                : "Your browser has not offered a one-tap install prompt, so use its built-in menu. Odi's website remains available even if you choose not to install it."}
            </p>
            {prompt ? (
              <button className="pwaBrowserPrimary" type="button" onClick={() => void installApp()}>Install Odi Driving School</button>
            ) : iosDevice ? (
              <div className="pwaBrowserSteps">
                <strong>On iPhone or iPad</strong>
                <p>Open this page in Safari, tap <b>Share</b>, then choose <b>Add to Home Screen</b>.</p>
              </div>
            ) : androidDevice ? (
              <div className="pwaBrowserSteps">
                <strong>On Android</strong>
                <p>In Chrome, tap the <b>⋮</b> menu and choose <b>Install app</b> or <b>Add to Home screen</b>. The exact wording depends on your Chrome version.</p>
              </div>
            ) : (
              <div className="pwaBrowserSteps">
                <strong>On a computer</strong>
                <p>In Chrome or Edge, open the browser menu and look for <b>Install Odi Driving School</b> or <b>Install page as app</b>.</p>
              </div>
            )}
            <button className="pwaBrowserSecondary" type="button" onClick={() => setInstallHelpOpen(false)}>Continue using the website</button>
          </section>
        </div>
      )}

      {waiting && <div className="pwaUpdate" role="status" aria-live="polite"><div><strong>Odi update ready</strong><span>Refresh to use the latest version.</span></div><button onClick={applyUpdate}>Refresh</button></div>}
    </>
  );
}
