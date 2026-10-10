import Link from "next/link";
import BookingForm from "./booking-form";

export const metadata = {
  title: "Lesson enquiries",
  description: "Tell Odi Driving School what you need from driving lessons in Gaborone.",
};

export default function BookingPage() {
  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link className="brand" href="/" aria-label="Odi Driving School home">
          <span className="brand-mark">O</span>
          <span className="brand-copy"><strong>ODI</strong><small>DRIVING SCHOOL</small></span>
        </Link>
        <Link href="/" className="text-link">Back to home ↗</Link>
      </header>
      <section className="booking-card">
        <p className="eyebrow">LESSON ENQUIRIES · GABORONE</p>
        <h1>Your next step<br/><em>starts with a conversation.</em></h1>
        <p className="booking-lead">Tell us where you are in your learning and what you would like help with. You can enquire without creating an account or installing the website.</p>
        <div className="status-note">
          <strong>What happens next?</strong>
          <p>Your enquiry is saved for review. Odi will need to discuss lesson options and availability with you before any appointment is agreed. Sending this form does not book or confirm a lesson.</p>
        </div>
        <BookingForm />
      </section>
      <footer className="booking-footer">
        <span>Odi Driving School · Gaborone, Botswana</span>
        <Link href="/">Return to the home page</Link>
      </footer>
    </main>
  );
}
