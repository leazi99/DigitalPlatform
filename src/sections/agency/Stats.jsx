import Container from "../../components/Container";
import Counter from "../../components/Counter";
import Reveal from "../../components/Reveal";
import { useAgency } from "../../content/useContent";

export default function Stats() {
  const { stats } = useAgency();

  return (
    <section className="bg-ink py-16 text-white sm:py-20">
      <Container>
        <dl className="grid gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal as="div" key={stat.label} delay={i * 90} className="border-l border-white/15 pl-6">
              <dd className="font-display text-5xl font-black tracking-tight text-signal">
                <Counter value={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
              </dd>
              <dt className="mt-3 font-mono text-[0.6875rem] uppercase leading-relaxed tracking-[0.16em] text-white/60">
                {stat.label}
              </dt>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  );
}
