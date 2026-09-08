import Container from "../../components/Container";
import Reveal from "../../components/Reveal";
import Button from "../../components/Button";
import SectionHeading from "../../components/SectionHeading";
import { batches, batchesSection, course } from "../../data/institute";

const STATUS = {
  open: { label: "Open", className: "bg-signal/12 text-signal-deep" },
  filling: { label: "Filling fast", className: "bg-amber-500/15 text-amber-700" },
  closed: { label: "Closed", className: "bg-ink/8 text-ink-soft" },
};

export default function Batches() {
  return (
    <section id="batches" className="border-y border-rule bg-mist-deep/60 py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow={batchesSection.eyebrow}
          heading={batches.length ? batchesSection.heading : batchesSection.emptyHeading}
          lead={batches.length ? batchesSection.lead : batchesSection.emptyBody}
        />

        {batches.length > 0 ? (
          <ul className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch, i) => {
              const status = STATUS[batch.status] ?? STATUS.open;
              return (
                <Reveal
                  as="li"
                  key={batch.name}
                  delay={(i % 3) * 90}
                  className="flex flex-col bg-mist p-8 transition-colors duration-300 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl font-extrabold tracking-tight text-ink">
                      {batch.name}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <dl className="mt-6 space-y-4 border-t border-rule pt-6">
                    <div>
                      <dt className="eyebrow text-ink-soft">Starts</dt>
                      <dd className="mt-1.5 text-[0.9375rem] text-ink">{batch.starts}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-ink-soft">Timing</dt>
                      <dd className="mt-1.5 text-[0.9375rem] text-ink">{batch.timing}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-ink-soft">Seats</dt>
                      <dd className="mt-1.5 text-[0.9375rem] text-ink">{batch.seats}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto pt-8">
                    <Button href="#enrol" variant="outline" className="w-full">
                      Hold a seat
                    </Button>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        ) : (
          <Reveal delay={120}>
            <div className="mt-14 flex flex-wrap items-center gap-4 rounded-2xl border border-rule bg-mist p-8 sm:p-10">
              <Button href="#enrol">Register your interest</Button>
              <p className="text-[0.9375rem] text-ink-soft">
                Fee for the {course.duration} course: {course.fee}
              </p>
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
