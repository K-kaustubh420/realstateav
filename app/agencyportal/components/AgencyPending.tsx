"use client";

export default function AgencyPending() {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950/85 p-8 shadow-lg backdrop-blur-2xl">
      <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Agency Verification</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">Agency verification in progress</h1>
      <p className="mt-4 text-slate-400">We have received your agency submission and our team is reviewing it. You will be notified when the review is complete.</p>
      <div className="mt-6">
        <button className="rounded-full bg-white/5 px-6 py-2 text-sm font-semibold text-slate-200">Submitted</button>
      </div>
    </section>
  );
}
