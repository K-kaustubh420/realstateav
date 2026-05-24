"use client";

export default function VerificationPending() {
  return (
    <section className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-slate-950/90 px-8 py-12 shadow-2xl backdrop-blur-xl">
      <div className="space-y-6 text-white">
        <div className="space-y-2">
          <p className="text-base font-semibold uppercase tracking-[0.32em] text-violet-300/80">Verification Status</p>
          <h1 className="text-4xl font-semibold tracking-tight">Verification Review In Progress</h1>
          <p className="max-w-2xl text-slate-400">We’ve received your documents successfully. Our team is currently reviewing your profile. You’ll be notified once verification is complete.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-inner shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pending review</p>
          <button className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-800 px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300 ring-1 ring-white/10 disabled:cursor-not-allowed disabled:opacity-60" disabled>
            Submitted For Review
          </button>
        </div>
      </div>
    </section>
  );
}
