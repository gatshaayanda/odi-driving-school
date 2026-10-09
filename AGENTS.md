# Odi Driving School — Project Contract

## Product and workflow
Odi Driving School is a mobile-first, installable website and planned learner/instructor platform, initially serving Gaborone, Botswana. Product owner/final reviewer: user. Technical navigator: ChatGPT through repository tools. GitHub is the source of truth; inspect actual code, Git state, Firebase rules, environment and deployment configuration before changes. Workflow: START → INSPECT → BUILD → VERIFY → CHECKPOINT. Unexpected result: STOP → inspect reality → fix only the divergence → verify → checkpoint. User handles Vercel shipping unless explicitly requested.

## Truthfulness and scope
Do not invent prices, packages, contact details, availability, qualifications, licences, vehicles, reviews, success rates or training locations. public/odi.jpeg is the approved instructor portrait. public/gwest.jpeg is a tree/environment photograph, not evidence of a verified training venue. Use Africa/Gaborone for schedules. Public site must work without login or installation. A booking request is not a confirmed appointment.

## Planned journey
Discover → understand services → send booking request → receive request acknowledgement → instructor reviews and confirms a conflict-free time → learner sees appointment → instructor records lesson/skills → learner sees progress and package balance → instructor records auditable payments → tested reminders and return visits.
First vertical slice: persist a public booking request → private instructor review → conflict-safe confirmation → learner-visible appointment. Do not claim completion until verified end to end.

## Capabilities planned
Public pages: home, services/packages, learning process, about, booking request, contact, privacy and terms. Learner portal: own bookings, feedback/progress, package credits, payments and privacy settings. Instructor workspace: private dashboard, calendar, learner CRM, lesson/skill records, packages/credits, payment ledger, follow-ups, reports and settings.
Keep curriculum configurable: vehicle familiarisation, starting/stopping, observation, manoeuvres, parking/reversing, road positioning, junctions, hazards, independent driving and test preparation. Skill states: not introduced, introduced, practised, demonstrated with support, demonstrated consistently, needs more practice. Never infer test readiness from a percentage.
Prevent instructor/vehicle overlap even under concurrent confirmation. Rescheduling must not replace a confirmed appointment until accepted. Use transactions for bookings, credits and payment adjustments. Preserve audit history; corrections append adjustments. Payment records are not payment processing.

## Security
No public owner signup or client-side role assignment. Phone number alone is not authentication. Learners read only their own records and cannot write instructor assessments/payments. Public users cannot read private records. Server credentials stay secret. Firestore and Storage default-deny until Odi-specific rules are implemented and tested. Never weaken security or deploy rules to BOEMO/another Firebase project.

## Foundation and launch unknowns
Next.js App Router, React, TypeScript, Firebase project ID odi-driving-school; Vercel target URL/domain unconfirmed. Public Firebase config uses NEXT_PUBLIC_FIREBASE_*; service-account credentials are secret. PWA is optional enhancement, never a prerequisite. Offline UI must not imply an unconfirmed request was delivered.
Still confirm public phone/WhatsApp, exact service area, lesson/transmission options, licence classes, prices/packages, booking/cancellation policy, qualifications/permits, vehicles, domain, owner identity and Firebase provisioning. Never invent them.

## Verification
Run/inspect typecheck, lint, production build, public/booking/learner/instructor routes, authorization, concurrent booking conflicts, safe rescheduling, idempotent credits/payments, PWA install/update/cache/offline recovery, and inherited-identity scan. Verify pushed SHA. A GitHub push does not prove CI, Vercel deployment or production behaviour.

## Current checkpoint — 2026-10-09
BOEMO was used as a code foundation; Odi has its own repository and main branch. public/odi.jpeg and public/gwest.jpeg are committed. Identity reset removes inherited food ordering/notifications/assets, resets branding/configuration and defaults Firebase data access to deny. Booking persistence, learner/instructor workflows and Odi-specific security rules remain unbuilt and unverified.
