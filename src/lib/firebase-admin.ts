import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount() {
  const raw = process.env.FIREBASE_ADMIN_KEY || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Firebase server credentials are not configured.");

  const parsed = JSON.parse(raw) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };

  if (parsed.project_id !== "odi-driving-school") {
    throw new Error("Firebase credentials must belong to the Odi Driving School project.");
  }
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Firebase service account credentials are incomplete.");
  }

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

export function getOdiFirestore() {
  const existing = getApps().find((app) => app.name === "odi-driving-school");
  if (existing) return getFirestore(existing);

  const serviceAccount = getServiceAccount();
  const app = initializeApp(
    {
      credential: cert(serviceAccount),
      projectId: "odi-driving-school",
    },
    "odi-driving-school",
  );
  return getFirestore(app);
}
