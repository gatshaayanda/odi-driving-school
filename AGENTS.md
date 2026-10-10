# Odi Driving School — Project Contract

## Product identity and operating workflow
Odi Driving School is a mobile-first customer website and planned learner/instructor platform for driving lessons in Gaborone, Botswana. BOEMO was used only as a code foundation; this is a separate Odi product and Firebase project, not a food-ordering application.
Product owner/final reviewer: user. Technical navigator: ChatGPT. GitHub `main` is the source of truth. Workflow: START → INSPECT → BUILD → VERIFY → CHECKPOINT. Unexpected result: STOP → inspect reality → fix only the specific divergence → verify → checkpoint. Inspect the actual repository, branch/status, relevant code, Firebase/security, and deployment before changes. User handles Vercel shipping unless explicitly requested.

## Customer-first priority
The public customer journey takes priority over administration:
DISCOVER → OPEN → UNDERSTAND LESSON OPTIONS → ASK A QUESTION / SEND A BOOKING REQUEST → RECEIVE CLEAR ACKNOWLEDGEMENT → RETURN AND CHECK NEXT STEPS → OPTIONAL INSTALL → REOPEN AND USE.
The website must remain usable without login or installation. Installation enhances return visits; it must never block browsing or enquiries. In WhatsApp/social in-app browsers, provide a clear handoff to the device browser while preserving the current URL where the platform permits. Never claim a browser can be forcibly opened when it cannot. In a normal browser, show a persistent install entry point; invoke the native install prompt only when the browser supplies it, otherwise give platform-specific steps. Never leave an install control that does nothing. Verify first-time and returning use, mobile layout, keyboard/screen-reader basics, loading/error/empty states, offline messaging, confirmation and recovery.
A booking request is not a confirmed appointment. Public submissions must be saved server-side before the UI confirms receipt; failures must be explicit and must never simulate success.

## Truthfulness and content
Do not invent prices, packages, contact details, availability, qualifications, licences, vehicles, reviews, pass rates or training locations. `public/odi.jpeg` is the approved instructor portrait. `public/gwest.jpeg` is a tree/environment photograph, not evidence of a verified training venue. Use `Africa/Gaborone` for schedules. Keep launch unknowns configurable and label unconfirmed information.

## Planned product and first vertical slice
Public pages: home, services/packages, learning process, about, booking request, contact/WhatsApp, privacy and terms. Learner portal: own bookings, feedback/progress, package credits, payment records and privacy settings. Private instructor workspace: dashboard, calendar, learner CRM, lesson/skill records, packages/credits, auditable payment ledger, follow-ups, reports and settings.
First vertical slice: persist a public booking request → private instructor review → confirm a conflict-free time → learner sees appointment. Then record lessons/skills → learner sees progress/package balance → instructor records auditable payments. Do not claim completion until end-to-end verified.

## Curriculum and operations
Keep curriculum configurable: vehicle familiarisation, starting/stopping, observation, manoeuvres, parking/reversing, road positioning, junctions, hazards, independent driving and test preparation. Skill states: not introduced, introduced, practised, demonstrated with support, demonstrated consistently, needs more practice. Never infer test readiness from a percentage.
Prevent instructor/vehicle overlap even under concurrent confirmation. Rescheduling must not replace a confirmed appointment until accepted. Use transactions for bookings, credits and payment adjustments. Preserve audit history; corrections append adjustments. Payment records are not payment processing.

## Security
No public owner signup or client-side role assignment. Phone number alone is not authentication. Learners read only their own records and cannot write instructor assessments/payments. Public users cannot read private records. Server credentials stay secret. Firestore and Storage client rules remain default-deny. Public booking enquiries are written only through the Next.js server using Firebase Admin credentials restricted to project `odi-driving-school`; public clients must never read the `bookingRequests` collection. Do not weaken security or deploy rules to BOEMO/another Firebase project.

## Foundation, configuration and launch unknowns
Next.js App Router, React, TypeScript, Firebase project ID `odi-driving-school`; public Firebase config uses `NEXT_PUBLIC_FIREBASE_*`; service-account credentials are secret. Vercel target URL/domain and live deployment are not verified by a Git push alone. PWA uses `src/app/manifest.ts`, `public/sw.js`, `src/app/pwa-register.tsx`, and `src/app/pwa.css`. PWA installation is optional, never a prerequisite. Offline UI must not imply an unconfirmed request was delivered.
Still confirm public phone/WhatsApp, exact service area, lesson/transmission options, licence classes, prices/packages, booking/cancellation policy, qualifications/permits, vehicles, domain, owner identity and Firebase provisioning. Never invent them.

## Verification requirements
Inspect/run typecheck, lint, production build, public/booking/learner/instructor routes, authorization, concurrent booking conflicts, safe rescheduling, idempotent credits/payments, PWA manifest/icon/install/update/cache/offline recovery, in-app-browser handoff, and inherited-identity scan. Verify pushed SHA and actual CI result. A GitHub push does not prove CI passed, Vercel deployed, or production behaviour was verified.

## Current checkpoint — 2026-10-10
Identity reset and photography are committed; BOEMO food-ordering flows/assets were removed and Odi branding/configuration applied. Firestore and Storage client rules remain default-deny. The public home page now explains common enquiry goals without promising unconfirmed services, and `/book` contains a validated enquiry form with loading, success and failure states. `POST /api/booking-requests` writes only to the private `bookingRequests` collection through the server-side Firebase Admin SDK, and only when `FIREBASE_ADMIN_KEY` (or `FIREBASE_SERVICE_ACCOUNT_JSON`) contains valid credentials for project `odi-driving-school`. Configure this secret in Vercel before live submissions can succeed; no live Firebase write has yet been verified. Learner portal, instructor review UI, booking confirmation/concurrency, payment/credit ledger and owner notifications remain unbuilt.
PWA handoff/install experience still requires live/device verification. Commit `e792747` escapes apostrophes in the embedded-browser guidance that failed Vercel ESLint (`react/no-unescaped-entities`). Persistent install entry point and platform-specific fallback guidance are implemented in `src/app/pwa-register.tsx`; verify actual installation and the WhatsApp → Chrome → Odi journey on devices before declaring the PWA complete.

Customer enquiry checkpoint (2026-10-10): added service/enquiry topics and the public lesson enquiry flow. Server validates fields and origin, rejects non-JSON/oversized submissions, includes a honeypot, and returns success only after Firestore accepts the write. The server uses `FIREBASE_ADMIN_KEY` or `FIREBASE_SERVICE_ACCOUNT_JSON`, checks `project_id` is exactly `odi-driving-school`, and never exposes private booking requests to the client. Remaining before calling the live flow complete: configure the service-account secret in Vercel, verify Firestore/IAM provisioning, pass lint/type/build checks, confirm the production deployment is READY, and submit a real test enquiry while confirming that only the private server can access it. This public endpoint currently has no distributed rate limiter; do not treat the honeypot as a complete anti-abuse system. Next customer-flow stage is confirmation and return-use (stage 5), not instructor administration.


PWA install visibility correction (2026-10-10): the persistent install entry point must not be suppressed solely because the browser is classified as embedded. The embedded-browser guidance now offers an explicit “Show install options” action that dismisses the gate and opens platform-specific install instructions; Android still retains the direct Chrome handoff. The install entry point is hidden only when the browser reports standalone display mode (already-installed experience). Verify on production in a normal desktop/mobile browser and in WhatsApp/social in-app browsers; repository/CI checks do not substitute for device verification.


## Golden PWA system — WhatsApp → normal browser → install
The required customer journey is WhatsApp/social embedded browser → normal browser → optional PWA installation. The website remains usable without installation; installation must never block an enquiry.

Implementation paths:
- src/app/layout.tsx performs server-side embedded-browser detection using User-Agent and, where supplied, X-Requested-With. A social referrer alone is not evidence of an embedded browser. It passes initial browser state to the root PWA controller.
- src/app/layout.tsx uses a beforeInteractive script to capture beforeinstallprompt before React hydration and stores it on window.__odiInstallPrompt.
- src/app/pwa-register.tsx is the single root controller for browser handoff, native installation, platform fallback, offline status, service-worker registration/update, and installed state. Do not add duplicate PWA controllers or competing overlays.
- src/app/manifest.ts defines Odi identity, root start URL/scope, standalone display and icons. Keep every declared icon path aligned with a real public asset.
- public/sw.js is registered at / with root scope and a versioned Odi cache. Keep API and private learner/instructor routes network-only; never imply cached/offline content proves a request was delivered.
- src/app/pwa.css styles the single handoff gate and the separate fallback panel.

Handoff rules:
- Android embedded browsers use the primary OPEN IN CHROME action and an Android intent URL preserving the current path, query and fragment. The OS may reject the intent; do not claim the external browser can be forced.
- iOS and other embedded hosts do not expose a universal API that websites can use to force Safari/Chrome. OPEN IN BROWSER reveals clear instructions to use the host app's menu. Never use a speculative redirect that can loop back into the gate.
- The handoff gate and install fallback are separate states. While embedded, show only the handoff gate. Never show competing install promotion, dismiss-only gates, JavaScript alerts, or dead buttons.
- The native install action is labelled Install Odi Driving School. When beforeinstallprompt was captured, the click calls its prompt() immediately; do not put an instruction modal or extra navigation between the click and native prompt.
- If beforeinstallprompt is absent, the install action opens a branded, concise platform fallback: iPhone/iPad Safari Share → Add to Home Screen; Android Chrome menu → Install app/Add to Home screen; desktop Chrome/Edge menu → Install app/page as app. Do not pretend the native prompt opened. Browser/OS controls final installability and consent.
- Capture the event early, adopt the saved event after hydration, listen for subsequent events once, clear it after use, and handle appinstalled by hiding installation promotion.
- Hide installation promotion when standalone/already installed and on /learner, /instructor, and /admin routes. Do not auto-open installation UI on page load.
- Do not change cache namespace without a deliberate migration/verification. Inspect the manifest response, icon URLs, HTTPS, service-worker scope/cache strategy, browser eligibility and installability diagnostics when debugging a missing native prompt.

Verification checklist:
1. Inspect the actual branch, source diff, manifest output, icon assets, and service-worker registration/scope.
2. Run TypeScript, lint and production build.
3. Verify exact commit and corresponding Vercel production deployment state.
4. Test direct browser entry and WhatsApp → normal browser separately. Confirm route/query/hash preservation and no handoff loop.
5. Test native prompt capture and direct prompt invocation where supported; test fallback where not supported; confirm standalone/appinstalled and private-route suppression.
6. Physical-device tests are still required for WhatsApp/iOS/Android handoff. Never report device behavior as verified from source checks alone.
