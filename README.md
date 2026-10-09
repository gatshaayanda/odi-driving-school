# Odi Driving School

Mobile-first public website and planned learner/instructor platform for Odi Driving School, initially serving Gaborone, Botswana.

## Current checkpoint
The initial identity reset from a reusable Next.js/Firebase foundation is in progress. The public landing and booking-information pages use Odi branding and supplied photography. Legacy kitchen ordering/notification workflows are being removed from active routes. Firestore and Storage default-deny until Odi's schema and authorization rules are implemented and reviewed.

The booking, learner progress, instructor workspace, payment ledger and notifications are not yet implemented. This is not a live booking system.

## Stack and local development
Next.js App Router, React, TypeScript, Firebase Web SDK project odi-driving-school, Vercel target (production URL not confirmed).
Run npm ci, copy .env.example to .env.local, then npm run dev.
Checks: npx tsc --noEmit, npm run lint, npm run build.

## Security
Do not deploy Firebase rules until Odi schema/authorization and credentials are verified. Never commit service-account keys.
Photography: /odi.jpeg is the approved portrait; /gwest.jpeg is a tree/environment image, not a verified training venue.

## Next priority
Persist a public booking request, add private instructor review, confirm conflict-safe times, and show appointment status to learners. Then add progress, packages/credits, auditable payments and tested notifications.
