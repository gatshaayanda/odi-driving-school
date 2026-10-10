# Odi Driving School — Project Contract

## Product identity and operating workflow
Odi Driving School is a mobile-first customer website and planned learner/instructor platform for driving lessons in Gaborone, Botswana. BOEMO was used only as a code foundation; this is a separate Odi product and Firebase project, not a food-ordering application.
Product owner/final reviewer: user. Technical navigator: ChatGPT. GitHub `main` is the source of truth. Workflow: START → INSPECT → BUILD → VERIFY → CHECKPOINT. Unexpected result: STOP → inspect reality → fix only the specific divergence → verify → checkpoint. Inspect the actual repository, branch/status, relevant code, Firebase/security, and deployment before changes. User handles Vercel shipping unless explicitly requested.

## Customer-first priority
The public customer journey takes priority over administration:
DISCOVER → OPEN → UNDERSTAND LESSON OPTIONS → ASK A QUESTION / SEND A BOOKING REQUEST → RECEIVE CLEAR ACKNOWLEDGEMENT → RETURN AND CHECK NEXT STEPS → OPTIONAL INSTALL → REOPEN AND USE.
The website must remain usable without login or installation. Installation enhances return visits; it must never block browsing or enquiries. In WhatsApp/social in-app browsers, provide a clear handoff to the device browser while preserving the current URL where the platform permits. Never claim a browser can be forcibly opened when it cannot. In a normal browser, show a persistent install entry point; invoke the native install prompt only when the browser supplies it, otherwise give platform-specific steps. Never leave an install control that does nothing. Verify first-time and returning use, mobile layout, keyboard/screen-reader basics, loading/error/empty states, offline messaging, confirmation and recovery.
A booking request is not a confirmed appointment. Until persistence and owner review exist, clearly say online booking is not live; do not simulate success.

## Truthfulness and content
Do not invent prices, packages, contact details, availability, qualifications, licences, vehicles, reviews, pass rates or training locations. `public/odi.jpeg` is the approved instructor portrait. `public/gwest.jpeg` is a tree/environment photograph, not evidence of a verified training venue. Use `Africa/Gaborone` for schedules. Keep launch unknowns configurable and label unconfirmed information.

## Planned product and first vertical slice
Public pages: home, services/packages, learning process, about, booking request, contact/WhatsApp, privacy and terms. Learner portal: own bookings, feedback/progress, package credits, payment records and privacy settings. Private instructor workspace: dashboard, calendar, learner CRM, lesson/skill records, packages/credits, auditable payment ledger, follow-ups, reports and settings.
First vertical slice: persist a public booking request → private instructor review → confirm a conflict-free time → learner sees appointment. Then record lessons/skills → learner sees progress/package balance → instructor records auditable payments. Do not claim completion until end-to-end verified.

## Curriculum and operations
Keep curriculum configurable: vehicle familiarisation, starting/stopping, observation, manoeuvres, parking/reversing, road positioning, junctions, hazards, independent driving and test preparation. Skill states: not introduced, introduced, practised, demonstrated with support, demonstrated consistently, needs more practice. Never infer test readiness from a percentage.
Prevent instructor/vehicle overlap even under concurrent confirmation. Rescheduling must not replace a confirmed appointment until accepted. Use transactions for bookings, credits and payment adjustments. Preserve audit history; corrections append adjustments. Payment records are not payment processing.

## Security
No public owner signup or client-side role assignment. Phone number alone is not authentication. Learners read only their own records and cannot write instructor assessments/payments. Public users cannot read private records. Server credentials stay secret. Firestore and Storage default-deny until Odi-specific rules are implemented and tested. Never weaken security or deploy rules to BOEMO/another Firebase project.

## Foundation, configuration and launch unknowns
Next.js App Router, React, TypeScript, Firebase project ID `odi-driving-school`; public Firebase config uses `NEXT_PUBLIC_FIREBASE_*`; service-account credentials are secret. Vercel target URL/domain and live deployment are not verified by a Git push alone. PWA uses `src/app/manifest.ts`, `public/sw.js`, `src/app/pwa-register.tsx`, and `src/app/pwa.css`. PWA installation is optional, never a prerequisite. Offline UI must not imply an unconfirmed request was delivered.
Still confirm public phone/WhatsApp, exact service area, lesson/transmission options, licence classes, prices/packages, booking/cancellation policy, qualifications/permits, vehicles, domain, owner identity and Firebase provisioning. Never invent them.

## Verification requirements
Inspect/run typecheck, lint, production build, public/booking/learner/instructor routes, authorization, concurrent booking conflicts, safe rescheduling, idempotent credits/payments, PWA manifest/icon/install/update/cache/offline recovery, in-app-browser handoff, and inherited-identity scan. Verify pushed SHA and actual CI result. A GitHub push does not prove CI passed, Vercel deployed, or production behaviour was verified.

## Current checkpoint — 2026-10-10
Identity reset and photography are committed on `main`; BOEMO food-ordering flows/assets were removed, Odi branding/configuration was applied, and Firestore/Storage are default-deny pending Odi-specific rules and tests. Public home page exists. `/book` is informational only and does not yet accept or persist booking requests. Learner portal, instructor workflows, booking concurrency, payment/credit ledger and Odi-specific authorization remain unbuilt/unverified.
PWA handoff/install experience is being corrected. Commit `ff5ad7e` added embedded-browser handoff, but its CI run failed lint due to unescaped apostrophes in `src/app/pwa-register.tsx`; typecheck passed and build was skipped. Do not treat that checkpoint as verified. Current task must restore green CI and verify installation UI fallback before declaring complete.
