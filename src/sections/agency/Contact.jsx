import { useState } from "react";
import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import Field, { fieldClass } from "../../components/Field";
import { SuccessPanel, ErrorPanel, SubmitButton } from "../../components/FormStatus";
import { submitAgencyEnquiry } from "../../lib/submitEnquiry";
import { trackEvent } from "../../lib/track";
import { useAgency, useCompany } from "../../content/useContent";

const EMPTY = { name: "", email: "", phone: "", service: "", message: "" };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) {
    errors.email = "Enter an email so we can reply.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "That email address is missing an @ or a domain.";
  }
  if (values.phone.trim() && values.phone.trim().replace(/\D/g, "").length < 7) {
    errors.phone = "That number looks too short to dial.";
  }
  if (values.message.trim().length < 10) {
    errors.message = "A sentence or two about your business is enough.";
  }
  return errors;
}

export default function Contact() {
  const { contact } = useAgency();
  const company = useCompany();

  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div aria-hidden="true" className="gridlines pointer-events-none absolute inset-0" />

      <Container className="relative">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow={contact.eyebrow} heading={contact.heading} lead={contact.lead} />

            <Reveal delay={200}>
              <dl className="mt-12 space-y-6 border-t border-rule pt-8">
                <div>
                  <dt className="eyebrow text-ink-soft">Email</dt>
                  <dd className="mt-2">
                    <a
                      href={`mailto:${company.email}`}
                      className="font-display text-lg font-bold tracking-tight text-ink underline decoration-signal decoration-2 underline-offset-4 transition-colors hover:text-signal-deep"
                    >
                      {company.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-ink-soft">Phone</dt>
                  <dd className="mt-2">
                    <a
                      href={`tel:${company.phone.replace(/\s/g, "")}`}
                      onClick={() => trackEvent("phone_click", { where: "contact" })}
                      className="font-display text-lg font-bold tracking-tight text-ink transition-colors hover:text-signal-deep"
                    >
                      {company.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-ink-soft">Office</dt>
                  <dd className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">
                    {company.address}
                    <br />
                    {company.hours}
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <EnquiryForm />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function EnquiryForm() {
  const { services } = useAgency();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);

  const update = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));

    // Worth knowing how many visitors start the form and do not finish it.
    if (!touched) {
      setTouched(true);
      trackEvent("form_start", { form: "enquiry" });
    }
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
      await submitAgencyEnquiry(values);
      trackEvent("form_submit", { form: "enquiry", service: values.service || "unsure" });
      setSent(true);
      setValues(EMPTY);
      setTouched(false);
    } catch (error) {
      // The server validates the same rules again. If it disagrees with the
      // browser, its messages win and are shown per field.
      if (error.fields) {
        setErrors(error.fields);
        document.getElementById(`field-${Object.keys(error.fields)[0]}`)?.focus();
      }
      setFailure(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-rule bg-white/70 p-7 sm:p-10">
      {sent ? (
        <SuccessPanel
          heading="Enquiry received"
          body="We reply within one working day. If it is urgent, email us directly at"
          onReset={() => setSent(false)}
          resetLabel="Send another enquiry"
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
            <Field id="email" label="Email" error={errors.email}>
              <input
                id="field-email"
                type="email"
                value={values.email}
                onChange={update("email")}
                placeholder="you@business.com"
                autoComplete="email"
                className={`${fieldClass} ${errors.email ? "border-red-500" : "border-rule"}`}
              />
            </Field>

            <Field id="phone" label="Phone" hint="Optional" error={errors.phone}>
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
          </div>

          <Field id="service" label="What do you need help with?" hint="Optional">
            <select
              id="field-service"
              value={values.service}
              onChange={update("service")}
              className={`${fieldClass} border-rule`}
            >
              <option value="">Not sure yet — advise me</option>
              {services.items.map((service) => (
                <option key={service.name} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </Field>

          <Field id="message" label="About your business" error={errors.message}>
            <textarea
              id="field-message"
              rows={5}
              value={values.message}
              onChange={update("message")}
              placeholder="What you sell, who buys it, and what you have tried so far."
              className={`${fieldClass} resize-y ${errors.message ? "border-red-500" : "border-rule"}`}
            />
          </Field>

          <SubmitButton busy={busy}>Send enquiry</SubmitButton>
        </form>
      )}
    </div>
  );
}
