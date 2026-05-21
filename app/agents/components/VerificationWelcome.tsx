"use client";

type VerificationWelcomeProps = {
  onStart: () => void;
};

export default function VerificationWelcome({ onStart }: VerificationWelcomeProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_30%),_radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.16),_transparent_22%)]" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center opacity-20 blur-sm" />
      <div className="relative space-y-6 text-white">
        <div className="max-w-2xl space-y-4">
          <p className="text-lg font-semibold uppercase tracking-[0.28em] text-violet-300/80">Agent Onboarding</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Hi there 👋</h1>
          <p className="text-xl text-slate-300">Get verified to start listing properties.</p>
          <p className="max-w-xl text-slate-400">This won’t take long.</p>
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-slate-200 shadow-lg">
          <p className="text-lg font-semibold text-white">How it works:</p>
          <ul className="space-y-3 text-sm leading-7 text-slate-300">
            <li>• Fill your details</li>
            <li>• Upload your documents</li>
            <li>• Submit for review</li>
          </ul>
          <p className="text-sm text-slate-400">Our team usually reviews profiles within a few hours.</p>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          Get Verified
        </button>
      </div>
    </section>
  );
}
