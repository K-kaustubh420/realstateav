"use client";

type VerificationRejectedProps = {
  verificationIssue: string;
  onResubmit: () => void;
};

export default function VerificationRejected({ verificationIssue, onResubmit }: VerificationRejectedProps) {
  return (
    <section className="mx-auto max-w-4xl rounded-[32px] border border-rose-500/20 bg-slate-950/90 px-8 py-12 shadow-2xl backdrop-blur-xl">
      <div className="space-y-6 text-white">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-rose-300/90">Verification Required</p>
          <h1 className="text-4xl font-semibold tracking-tight">Unfortunately, your verification could not be approved.</h1>
          <p className="max-w-2xl text-slate-400">Some of your details or uploaded documents did not meet our requirements.</p>
        </div>

        <div className="rounded-3xl border border-rose-500/10 bg-rose-500/5 p-6 text-slate-100 shadow-inner shadow-black/20">
          <p className="text-sm uppercase tracking-[0.32em] text-rose-200">Issue</p>
          <p className="mt-3 text-base leading-7 text-rose-100">{verificationIssue}</p>
        </div>

        <button
          type="button"
          onClick={onResubmit}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          Resubmit Verification
        </button>
      </div>
    </section>
  );
}
