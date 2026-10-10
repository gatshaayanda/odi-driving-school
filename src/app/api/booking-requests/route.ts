import { NextResponse } from "next/server";
import { getOdiFirestore } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const goals = new Set(["beginner", "confidence", "test-preparation", "not-sure"]);
const experienceOptions = new Set(["new-learner", "some-practice", "returning-learner"]);
const transmissionOptions = new Set(["manual", "automatic", "not-sure"]);

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return jsonError("This request could not be verified. Please refresh the page and try again.", 403);
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonError("Please submit the enquiry form using this page.", 415);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 10_000) {
    return jsonError("Your message is too long. Please shorten it and try again.", 413);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("We couldn't read that submission. Please check the form and try again.", 400);
  }

  // Quietly discard likely bot submissions; never tell the bot which check failed.
  if (text(body.website, 200)) {
    return NextResponse.json({ ok: true, reference: "received" });
  }

  const name = text(body.name, 100);
  const phone = text(body.phone, 40);
  const email = text(body.email, 160);
  const goal = text(body.goal, 40);
  const experience = text(body.experience, 40);
  const transmission = text(body.transmission, 40);
  const preferredTimes = text(body.preferredTimes, 240);
  const message = text(body.message, 800);

  if (name.length < 2) return jsonError("Please enter your name.", 400);
  if (!/^[+()0-9\s.-]{7,40}$/.test(phone)) {
    return jsonError("Please enter a valid phone number, including your country code if needed.", 400);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("Please check the email address or leave it blank.", 400);
  }
  if (!goals.has(goal)) return jsonError("Please choose what you would like help with.", 400);
  if (!experienceOptions.has(experience)) return jsonError("Please choose your current experience level.", 400);
  if (!transmissionOptions.has(transmission)) return jsonError("Please choose a transmission preference.", 400);

  try {
    const db = getOdiFirestore();
    const doc = await db.collection("bookingRequests").add({
      name,
      phone,
      email: email || null,
      goal,
      experience,
      transmission,
      preferredTimes: preferredTimes || null,
      message: message || null,
      status: "new",
      createdAt: new Date(),
      source: "public-website",
    });

    return NextResponse.json({ ok: true, reference: doc.id }, { status: 201 });
  } catch (error) {
    // Keep credentials and database details out of the public response.
    console.error("Odi booking request could not be saved.", error instanceof Error ? error.message : "Unknown error");
    return jsonError(
      "We couldn't save your enquiry just now. Nothing has been confirmed or sent. Please try again in a moment.",
      503,
    );
  }
}
