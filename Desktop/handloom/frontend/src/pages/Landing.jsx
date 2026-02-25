import { Link } from 'react-router-dom';

const METRICS = [
  { label: 'Clusters Connected', value: '48', hint: 'Banaras · Chanderi · Kancheepuram' },
  { label: 'Orders Fulfilled', value: '12.4k', hint: 'Distributed, on-time deliveries' },
  { label: 'Weavers Onboarded', value: '8.1k', hint: 'Verified capacity & skill tags' },
  { label: 'Avg. OTIF', value: '96%', hint: 'Production & QC tracked daily' },
];

const FEATURES = [
  { title: 'Cluster OS', body: 'Single pane for allocation, QC, logistics, and payouts across decentralized weavers.', pill: 'B2B Supply Cloud' },
  { title: 'Capacity Intelligence', body: 'Live loom utilization, skill tags, readiness by region. Allocate with confidence.', pill: 'Smart Allocation' },
  { title: 'Quality + Compliance', body: 'Spec locks, sample approvals, photo checkpoints, and shipment-level QC timelines.', pill: 'QC First' },
  { title: 'Logistics + Visibility', body: 'Distributed production → unified tracking. From yarn procurement to last-mile.', pill: 'Full Traceability' },
];

const STAGES = ['Order Placed', 'Allocated', 'Yarn Procurement', 'Weaving', 'QC', 'Shipped'];

const HOW = [
  { title: 'Scope & Specs', body: 'Lock fabric type, weave, GSM, colors, and region preferences. No ambiguity.' },
  { title: 'Smart Allocation', body: 'Distribute to the right cluster based on skill tags and capacity readiness.' },
  { title: 'QC & Proofing', body: 'Samples, photo checkpoints, and variance alerts before production scales.' },
  { title: 'Ship & Track', body: 'Unified timeline—QC passed → packed → dispatched with live milestones.' },
];

const TESTIMONIALS = [
  {
    quote: 'We cut lead time by 22% after moving multi-cluster orders into one timeline.',
    name: 'Ananya Sharma',
    role: 'Sourcing Lead, Global Apparel Brand',
  },
  {
    quote: 'Allocations match skill + capacity. QC holds improved without slowing shipments.',
    name: 'Rahul Menon',
    role: 'Ops Head, Export House',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-heritage-beige">
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(122,30,30,0.12), transparent 25%), radial-gradient(circle at 80% 10%, rgba(31,58,95,0.12), transparent 25%), radial-gradient(circle at 30% 70%, rgba(200,155,60,0.10), transparent 25%), repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 2px, transparent 2px, transparent 10px)',
          }}
        />

        <header className="relative max-w-6xl mx-auto px-4 pt-10 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-heritage-maroon text-heritage-beige flex items-center justify-center font-heading text-lg">H</div>
            <div>
              <p className="text-sm font-semibold text-heritage-maroon tracking-wide">HANDLOOM NETWORK</p>
              <p className="text-xs text-heritage-charcoal/70">Distributed Production · Unified Control</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link to="/login" className="text-heritage-charcoal hover:text-heritage-maroon">Login</Link>
            <Link to="/register" className="px-4 py-2 rounded-full bg-heritage-maroon text-heritage-beige shadow-md hover:shadow-lg transition">Register</Link>
          </div>
        </header>

        <main className="relative max-w-6xl mx-auto px-4 pb-16">
          {/* Hero */}
          <section className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center px-3 py-1 rounded-full bg-heritage-maroon/10 text-heritage-maroon text-xs font-semibold">Weaving technology into tradition</p>
              <h1 className="mt-4 text-4xl md:text-5xl font-heading text-heritage-charcoal leading-tight">
                Powering distributed handloom production with SaaS-grade control
              </h1>
              <p className="mt-4 text-lg text-heritage-charcoal/80 max-w-2xl">
                Connect artisans, clusters, and global buyers through one platform. Allocate orders, track capacity, enforce QC, and ship with confidence.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/register" className="px-5 py-3 rounded-xl bg-heritage-maroon text-heritage-beige font-semibold shadow-lg shadow-heritage-maroon/20 hover:translate-y-[-1px] transition">Explore Platform</Link>
                <Link to="/login" className="px-5 py-3 rounded-xl border border-heritage-maroon/30 text-heritage-charcoal font-semibold bg-heritage-beige hover:bg-white transition">View Live Dashboard</Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-heritage-charcoal/80">
                <span className="inline-flex items-center gap-2">✓ Cluster OS</span>
                <span className="inline-flex items-center gap-2">✓ Capacity intelligence</span>
                <span className="inline-flex items-center gap-2">✓ QC + Logistics</span>
                <span className="inline-flex items-center gap-2">✓ Region-aware allocation</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-white/70 blur-3xl" />
              <div className="relative rounded-3xl border border-heritage-maroon/10 bg-white/85 backdrop-blur shadow-2xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-heritage-maroon to-heritage-indigo text-heritage-beige">
                  <p className="text-xs uppercase tracking-[0.2em]">Live Production Timeline</p>
                  <p className="text-lg font-semibold mt-1">Order #FALCON-2048</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-heritage-charcoal/70 mb-4">
                    <span>Banaras · Kancheepuram · Chanderi</span>
                    <span className="font-semibold text-heritage-maroon">96% OTIF</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {STAGES.map((stage, idx) => (
                      <div key={stage} className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-4 h-4 rounded-full ${idx <= 3 ? 'bg-heritage-maroon' : 'bg-heritage-maroon/25'} animate-[pulse_2s_ease-in-out_infinite]`} />
                          {idx < STAGES.length - 1 && (
                            <div className="absolute left-1/2 top-4 w-px h-8 bg-heritage-maroon/20" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-heritage-charcoal">{stage}</p>
                          <p className="text-xs text-heritage-charcoal/70">Cluster synced · QC checkpoint</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-heritage-maroon/10 text-heritage-maroon">On track</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust strip */}
          <section className="mt-10 flex flex-wrap items-center gap-6 text-xs uppercase tracking-[0.2em] text-heritage-charcoal/60">
            <span className="px-3 py-1 rounded-full bg-white border border-heritage-maroon/10">Built for B2B</span>
            <span className="px-3 py-1 rounded-full bg-white border border-heritage-maroon/10">Cluster-first</span>
            <span className="px-3 py-1 rounded-full bg-white border border-heritage-maroon/10">QC & Compliance</span>
            <span className="px-3 py-1 rounded-full bg-white border border-heritage-maroon/10">Logistics-ready</span>
          </section>

          {/* Metrics */}
          <section className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {METRICS.map((m) => (
              <div key={m.label} className="rounded-2xl border border-heritage-maroon/10 bg-white shadow-sm p-4">
                <p className="text-2xl font-heading text-heritage-maroon">{m.value}</p>
                <p className="text-sm font-semibold text-heritage-charcoal mt-1">{m.label}</p>
                <p className="text-xs text-heritage-charcoal/70 mt-1">{m.hint}</p>
              </div>
            ))}
          </section>

          {/* Platform pillars */}
          <section className="mt-12">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="text-xs font-semibold text-heritage-maroon uppercase tracking-[0.2em]">Platform</p>
                <h2 className="text-3xl font-heading text-heritage-charcoal">Built for distributed production</h2>
              </div>
              <Link to="/register" className="text-sm font-semibold text-heritage-maroon hover:underline">Book a demo →</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-2xl border border-heritage-maroon/10 bg-white p-5 shadow-sm hover:shadow-md transition">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-heritage-maroon/10 text-heritage-maroon">{f.pill}</span>
                  <h3 className="mt-3 text-xl font-heading text-heritage-charcoal">{f.title}</h3>
                  <p className="mt-2 text-sm text-heritage-charcoal/80">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="mt-14 rounded-3xl border border-heritage-maroon/10 bg-white/80 backdrop-blur shadow-sm p-6">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="text-xs font-semibold text-heritage-maroon uppercase tracking-[0.2em]">How it works</p>
                <h2 className="text-2xl font-heading text-heritage-charcoal">From spec to shipment</h2>
              </div>
              <span className="text-xs text-heritage-charcoal/70">End-to-end visibility</span>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {HOW.map((step, idx) => (
                <div key={step.title} className="rounded-2xl border border-heritage-maroon/10 bg-heritage-beige p-4 shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-heritage-maroon text-heritage-beige flex items-center justify-center text-sm font-semibold mb-2">{idx + 1}</div>
                  <h4 className="text-base font-heading text-heritage-charcoal">{step.title}</h4>
                  <p className="mt-2 text-sm text-heritage-charcoal/75">{step.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Capacity visualization */}
          <section className="mt-14 grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-semibold text-heritage-maroon uppercase tracking-[0.2em]">Capacity Intelligence</p>
              <h2 className="mt-2 text-3xl font-heading text-heritage-charcoal">Distribute orders across clusters with clarity</h2>
              <p className="mt-3 text-sm text-heritage-charcoal/80 max-w-xl">Stacked capacity bars show real-time allocation. Skill tags and region filters ensure the right weave type goes to the right artisan.</p>
              <ul className="mt-4 space-y-2 text-sm text-heritage-charcoal/80">
                <li>• Live loom utilization and readiness</li>
                <li>• Skill tags: Ikat, Jacquard, Dobby, Banarasi brocade</li>
                <li>• Risk alerts: delays, QC flags, yarn shortages</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-heritage-maroon/10 bg-white shadow-lg p-6">
              <p className="text-sm font-semibold text-heritage-charcoal mb-4">Order #AURORA-118 · Capacity Split</p>
              <div className="space-y-3">
                {[{ name: 'Weaver A · Chanderi', value: 40, color: 'bg-heritage-maroon' }, { name: 'Weaver B · Banaras', value: 35, color: 'bg-heritage-mustard' }, { name: 'Weaver C · Kancheepuram', value: 25, color: 'bg-heritage-indigo' }].map((w) => (
                  <div key={w.name}>
                    <div className="flex justify-between text-xs text-heritage-charcoal/70 mb-1">
                      <span>{w.name}</span>
                      <span className="font-semibold text-heritage-charcoal">{w.value}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-heritage-maroon/10 overflow-hidden">
                      <div className={`h-full ${w.color}`} style={{ width: `${w.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-heritage-charcoal/70">Stacked capacity shows distributed production on a single order.</div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="mt-14 grid md:grid-cols-2 gap-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-3xl border border-heritage-maroon/10 bg-white p-6 shadow-sm">
                <p className="text-lg text-heritage-charcoal/90 leading-relaxed">“{t.quote}”</p>
                <p className="mt-3 text-sm font-semibold text-heritage-charcoal">{t.name}</p>
                <p className="text-xs text-heritage-charcoal/70">{t.role}</p>
              </div>
            ))}
          </section>

          {/* CTA */}
          <section className="mt-16 mb-12 rounded-3xl border border-heritage-maroon/15 bg-gradient-to-r from-heritage-beige to-heritage-maroon/10 p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-heritage-maroon uppercase tracking-[0.2em]">Ready to onboard?</p>
                <h3 className="text-2xl font-heading text-heritage-charcoal">Distributed production. Unified experience.</h3>
                <p className="text-sm text-heritage-charcoal/80">See a live order, QC timeline, and capacity split in action.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/register" className="px-5 py-3 rounded-xl bg-heritage-maroon text-heritage-beige font-semibold shadow-md">Get Started</Link>
                <Link to="/login" className="px-5 py-3 rounded-xl border border-heritage-maroon/30 text-heritage-charcoal font-semibold bg-white">View Dashboard</Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
