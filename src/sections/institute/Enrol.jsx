import { useState } from "react";
import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import Field, { fieldClass } from "../../components/Field";
import { SuccessPanel, ErrorPanel, SubmitButton } from "../../components/FormStatus";
import { submitEnquiry } from "../../lib/submitEnquiry";
import { formEndpoints } from "../../config";
import { company } from "../../data/company";
import { enrol, batches, course } from "../../data/institute";

const EMPTY = { name: "", email: "", phone: "", batch: "", message: "" };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.phone.trim()) {
    errors.phone = "Enter a phone number — we call to confirm seats.";
  } else if (values.phone.trim().replace(/\D/g, "").length < 7) {
    errors.phone = "That number looks too short to dial.";
  }
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "That email address is missing an @ or a domain.";
  }
  return errors;
}

export default function Enrol() {
  return (
    <section id="enrol" className="relative py-24 sm:py-32">
      <div aria-hidden="true" className="gridlines pointer-events-none absolute inset-0" />

      <Container className="relative">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow={enrol.eyebrow} heading={enrol.heading} lead={enrol.lead} />

            <Reveal delay={200}>
              <dl className="mt-12 space-y-6 border-t border-rule pt-8">
                <div>
                  <dt className="eyebrow text-ink-soft">Course</dt>
                  <dd className="mt-2 font-display text-lg font-bold tracking-tight text-ink">
                    {course.title}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-ink-soft">Fee</dt>
                  <dd className="mt-2 font-display text-lg font-bold tracking-tight text-ink">
                    {course.fee}
                  </dd>
                  <dd className="mt-1 text-[0.9375rem] text-ink-soft">{course.instalments}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-ink-soft">Ask first</dt>
                  <dd className="mt-2">
                    <a
                      href={`tel:${company.phone.replace(/\s/g, "")}`}
                      className="font-display text-lg font-bold tracking-tight text-ink underline decoration-signal decoration-2 underline-offset-4 transition-colors hover:text-signal-deep"
                    >
                      {company.phone}
                    </a>
                  </dd>
                  <dd className="mt-1 text-[0.9375rem] text-ink-soft">{company.hours}</dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <EnrolForm />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function EnrolForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [sent, setSent] = useState(false);

  const update = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`field-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setFailure("");
    setBusy(true);
    try {
      await submitEnquiry(
        { ...values, _subject: `Course enrolment — ${course.title}`, sector: "institute" },
        formEndpoints.institute,
      );
      setSent(true);
      setValues(EMPTY);
    } catch (error) {
      setFailure(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-rule bg-white/70 p-7 sm:p-10">
      {sent ? (
        <SuccessPanel
          heading="Seat request received"
          body="We call back within one working day with the start date and what to bring. If you would rather not wait, reach us at"
          onReset={() => setSent(false)}
          resetLabel="Enrol someone else"
        />
      ) : (
        <form noValidate onSubmit={handleSubmit} className="grid gap-5">
          {failure && <ErrorPanel message={failure} />}

          <Field id="name" label="Your name" error={errors.name}>
            <input
              id="field-name"
              type="text"
              value={values.name}
              onChange={update("name")}
              placeholder="Sita Sharma"
              autoComplete="name"
              className={`${fieldClass} ${errors.name ? "border-red-500" : "border-rule"}`}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="phone" label="Phone" error={errors.phone}>
              <input
                id="field-phone"
                type="tel"
                value={values.phone}
                onChange={update("phone")}
                placeholder="98XX-XXXXXX"
                autoComplete="tel"
                className={`${fieldClass} ${errors.phone ? "border-red-500" : "border-rule"}`}
              />
            </Field>

            <Field id="email" label="Email" hint="Optional" error={errors.email}>
              <input
                id="field-email"
                type="email"
                value={values.email}
                onChange={update("email")}
                placeholder="you@email.com"
                autoComplete="email"
                className={`${fieldClass} ${errors.email ? "border-red-500" : "border-rule"}`}
              />
            </Field>
          </div>

          <Field id="batch" label="Which batch suits you?" hint="Optional">
            <select
              id="field-batch"
              value={values.batch}
              onChange={update("batch")}
              className={`${fieldClass} border-rule`}
            >
              <option value="">Not sure yet — advise me</option>
              {batches.map((batch) => (
                <option key={batch.name} value={batch.name}>
                  {batch.name} — {batch.timing}
                </option>
              ))}
            </select>
          </Field>

          <Field id="message" label="Anything we should know?" hint="Optional">
            <textarea
              id="field-message"
              rows={4}
              value={values.message}
              onChange={update("message")}
              placeholder="What you do now, and what you want to do with the course."
              className={`${fieldClass} resize-y border-rule`}
            />
          </Field>

          <SubmitButton busy={busy} busyLabel="Sending…">
            Request a seat
          </SubmitButton>

          <p className="text-[0.8125rem] leading-relaxed text-ink-soft">
            No payment at this stage. We confirm the details by phone first.
          </p>
        </form>
      )}
    </div>
  );
}
