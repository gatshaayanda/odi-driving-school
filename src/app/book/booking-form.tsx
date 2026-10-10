"use client";

import { useState, type FormEvent } from "react";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string }
  | { kind: "success"; reference: string };

export default function BookingForm() {
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "sending") return;

    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setState({ kind: "sending" });

    try {
      const response = await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as { ok?: boolean; reference?: string; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "We couldn't send your enquiry. Please try again.");
      }
      form.reset();
      setState({ kind: "success", reference: result.reference || "received" });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error
          ? error.message
          : "We couldn't send your enquiry. Check your connection and try again.",
      });
    }
  }

  if (state.kind === "success") {
    return (
      <section className="enquiry-success" role="status" aria-live="polite">
        <span className="enquiry-success-mark" aria-hidden="true">✓</span>
        <p className="eyebrow">ENQUIRY RECEIVED</p>
        <h2>Thank you. Your next step starts here.</h2>
        <p>Your lesson enquiry has been saved for Odi Driving School to review. This is not a confirmed appointment; lesson options and a suitable time still need to be agreed directly.</p>
        {state.reference !== "received" && <p className="enquiry-reference">Reference: <strong>{state.reference.slice(0, 8).toUpperCase()}</strong></p>}
        <button className="button button-primary" type="button" onClick={() => setState({ kind: "idle" })}>Send another enquiry</button>
      </section>
    );
  }

  return (
    <form className="enquiry-form" onSubmit={submit} noValidate>
      <div className="enquiry-form-intro">
        <p className="eyebrow">TELL US WHAT YOU NEED</p>
        <h2>Let’s start with your goals.</h2>
        <p>Share a few details. Odi can review your enquiry and discuss the appropriate lesson options and availability with you.</p>
      </div>

      {state.kind === "error" && <p className="enquiry-alert" role="alert">{state.message}</p>}

      <div className="form-grid">
        <label className="form-field">
          <span>Your name <b aria-hidden="true">*</b></span>
          <input name="name" autoComplete="name" minLength={2} maxLength={100} required placeholder="Name you go by" />
        </label>
        <label className="form-field">
          <span>Phone or WhatsApp number <b aria-hidden="true">*</b></span>
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={40} required placeholder="+267 ..." />
        </label>
        <label className="form-field form-field-wide">
          <span>Email address <small>Optional</small></span>
          <input name="email" type="email" autoComplete="email" maxLength={160} placeholder="you@example.com" />
        </label>
        <label className="form-field">
          <span>What would you like help with? <b aria-hidden="true">*</b></span>
          <select name="goal" required defaultValue="">
            <option value="" disabled>Choose an enquiry topic</option>
            <option value="beginner">I’m new to driving</option>
            <option value="confidence">I have some experience and want more practice</option>
            <option value="test-preparation">I’m preparing for a driving test</option>
            <option value="not-sure">I’m not sure where to start</option>
          </select>
        </label>
        <label className="form-field">
          <span>Your experience <b aria-hidden="true">*</b></span>
          <select name="experience" required defaultValue="">
            <option value="" disabled>Choose one</option>
            <option value="new-learner">New learner</option>
            <option value="some-practice">I’ve had some practice</option>
            <option value="returning-learner">Returning to driving after a break</option>
          </select>
        </label>
        <label className="form-field">
          <span>Transmission preference <b aria-hidden="true">*</b></span>
          <select name="transmission" required defaultValue="">
            <option value="" disabled>Choose one</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
            <option value="not-sure">Not sure / would like to discuss</option>
          </select>
          <small>This records your preference only; availability must be confirmed.</small>
        </label>
        <label className="form-field">
          <span>Days or times that suit you <small>Optional</small></span>
          <input name="preferredTimes" maxLength={240} placeholder="e.g. weekday afternoons" />
          <small>This is a preference, not a live availability check.</small>
        </label>
        <label className="form-field form-field-wide">
          <span>Anything else we should know? <small>Optional</small></span>
          <textarea name="message" rows={4} maxLength={800} placeholder="Tell us about your goals or ask a question." />
        </label>
      </div>

      <div className="form-trap" aria-hidden="true">
        <label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <p className="enquiry-privacy">Your details will be used to review and respond to this enquiry. Please do not include passwords, identity numbers, payment details, or other sensitive information.</p>
      <button className="button button-primary enquiry-submit" type="submit" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Sending your enquiry…" : "Send lesson enquiry →"}
      </button>
      <p className="enquiry-disclaimer">Sending this form requests a conversation; it does not reserve a time or confirm a lesson.</p>
    </form>
  );
}
